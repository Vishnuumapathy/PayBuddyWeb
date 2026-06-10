import { collection, query, where, orderBy, onSnapshot, doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Payment, Sale, Customer, LedgerEntry } from "../models/paybuddy";

/**
 * Records a payment against a sale using a Firestore transaction.
 */
export const recordPayment = async (
  vendorId: string,
  paymentData: {
    saleId: string;
    customerId: string;
    amount: number;
    paymentMode: string;
  }
) => {
  const saleRef = doc(db, 'sales', paymentData.saleId);
  const customerRef = doc(db, 'customers', paymentData.customerId);
  const paymentRef = doc(collection(db, 'payments'));
  const ledgerRef = doc(collection(db, 'ledger'));

  await runTransaction(db, async (transaction) => {
    const saleDoc = await transaction.get(saleRef);
    const customerDoc = await transaction.get(customerRef);

    if (!saleDoc.exists()) throw new Error("Sale not found");
    if (!customerDoc.exists()) throw new Error("Customer not found");

    const sale = saleDoc.data() as Sale;
    const customer = customerDoc.data() as Customer;

    // Vendor ownership check
    if (sale.vendorId !== vendorId || customer.vendorId !== vendorId) {
      throw new Error("Unauthorized access to record payment");
    }

    if (sale.status === 'COMPLETED') {
      throw new Error("Cannot record payment for a completed sale");
    }

    const finalSaleAmount = sale.paymentType === 'Full Payment'
      ? sale.totalAmount
      : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);

    const remainingBalance = finalSaleAmount - (sale.amountPaid || 0);

    if (paymentData.amount <= 0) throw new Error("Payment amount must be greater than zero");
    if (paymentData.amount > remainingBalance) {
      throw new Error(`Payment amount (${paymentData.amount}) exceeds remaining balance (${remainingBalance})`);
    }

    const now = Date.now();
    const newAmountPaid = (sale.amountPaid || 0) + paymentData.amount;
    const newStatus = newAmountPaid >= finalSaleAmount ? 'COMPLETED' : 'PENDING';

    // 1. Create Payment document
    const payment: Payment = {
      paymentId: paymentRef.id,
      saleId: paymentData.saleId,
      customerId: paymentData.customerId,
      vendorId,
      amount: paymentData.amount,
      paymentMode: paymentData.paymentMode,
      createdAt: now,
    };
    transaction.set(paymentRef, payment);

    // 2. Update Sale
    transaction.update(saleRef, {
      amountPaid: newAmountPaid,
      status: newStatus
    });

    // 3. Update Customer
    const newCustomerPaidAmount = (customer.paidAmount || 0) + paymentData.amount;
    transaction.update(customerRef, {
      paidAmount: newCustomerPaidAmount
    });

    // 4. Create Ledger Entry
    const ledgerEntry: LedgerEntry = {
      entryId: ledgerRef.id,
      vendorId,
      customerId: paymentData.customerId,
      customerName: customer.name,
      itemName: sale.itemName,
      saleId: paymentData.saleId,
      type: 'payment',
      amount: paymentData.amount,
      balanceAfter: (customer.totalAmount || 0) - newCustomerPaidAmount,
      createdAt: now,
    };
    transaction.set(ledgerRef, ledgerEntry);
  });
};

/**
 * Subscribes to realtime updates for payments filtered by vendorId.
 * READ-ONLY implementation.
 */
export const subscribeToPayments = (
  vendorId: string,
  onData: (payments: Payment[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const paymentsRef = collection(db, 'payments');
  const q = query(
    paymentsRef,
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const payments = snapshot.docs.map((doc) => ({
        paymentId: doc.id,
        ...doc.data(),
      })) as Payment[];
      onData(payments);
    },
    (error) => {
      console.error('Error subscribing to payments:', error);
      onError(error);
    }
  );
};

/**
 * Subscribes to realtime updates for payments belonging to a specific customer of a vendor.
 *
 * @param vendorId - The Firebase UID of the vendor.
 * @param customerId - The ID of the customer.
 * @param onData - Callback triggered when data changes.
 * @param onError - Callback triggered on error.
 * @returns Unsubscribe function.
 */
export const subscribeToCustomerPayments = (
  vendorId: string,
  customerId: string,
  onData: (payments: Payment[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const paymentsRef = collection(db, 'payments');
  const q = query(
    paymentsRef,
    where('vendorId', '==', vendorId),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const payments = snapshot.docs.map((doc) => ({
        paymentId: doc.id,
        ...doc.data(),
      })) as Payment[];
      onData(payments);
    },
    (error) => {
      console.error('Error subscribing to customer payments:', error);
      onError(error);
    }
  );
};

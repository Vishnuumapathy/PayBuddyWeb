import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

import type {
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

import { db } from '../firebase/firebase';
import type { Sale, Customer, LedgerEntry } from '../models/paybuddy';

/**
 * Subscribes to realtime updates for sales belonging to a specific vendor.
 *
 * Requirements:
 * - collection: sales
 * - filters: where("vendorId", "==", vendorId), where("isArchived", "==", false)
 * - orderBy createdAt descending
 * - use realtime onSnapshot
 * - map document safely
 * - ensure saleId exists from document id
 */
export const subscribeToSales = (
  vendorId: string,
  onData: (sales: Sale[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const salesRef = collection(db, 'sales');

  const q = query(
    salesRef,
    where('vendorId', '==', vendorId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const sales: Sale[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          saleId: doc.id,
        } as Sale;
      });
      onData(sales);
    },
    (error) => {
      console.error('Error fetching sales:', error);
      onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Creates a simple full payment sale using a transaction.
 */
export const createSimpleSale = async (
  vendorId: string,
  saleData: {
    customerId: string;
    customerName: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }
): Promise<void> => {
  const saleRef = doc(collection(db, 'sales'));
  const ledgerRef = doc(collection(db, 'ledger'));
  const customerRef = doc(db, 'customers', saleData.customerId);

  await runTransaction(db, async (transaction) => {
    const customerDoc = await transaction.get(customerRef);
    if (!customerDoc.exists()) {
      throw new Error('Customer does not exist');
    }

    const customer = customerDoc.data() as Customer;
    const now = Date.now();

    // 1. Create Sale Document
    const newSale: Sale = {
      saleId: saleRef.id,
      vendorId,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      itemName: saleData.itemName,
      quantity: saleData.quantity,
      unitPrice: saleData.unitPrice,
      totalAmount: saleData.totalAmount,
      interestRate: 0,
      installmentCount: 0,
      paymentType: 'Full Payment',
      amountPaid: saleData.totalAmount,
      status: 'COMPLETED',
      isArchived: false,
      createdAt: now,
    };
    transaction.set(saleRef, newSale);

    // 2. Create Ledger Entry
    const newLedgerEntry: LedgerEntry = {
      entryId: ledgerRef.id,
      vendorId,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      itemName: saleData.itemName,
      saleId: saleRef.id,
      type: 'sale',
      amount: saleData.totalAmount,
      balanceAfter: (customer.totalAmount || 0) + saleData.totalAmount - ((customer.paidAmount || 0) + saleData.totalAmount), // This simplifies to customer.totalAmount - customer.paidAmount, but we follow logic of adding to both.
      createdAt: now,
    };
    // Re-calculating balanceAfter based on the update logic
    const currentBalance = (customer.totalAmount || 0) - (customer.paidAmount || 0);
    // For a full payment sale:
    // New Total = customer.totalAmount + totalAmount
    // New Paid = customer.paidAmount + totalAmount
    // New Balance = New Total - New Paid = (customer.totalAmount + totalAmount) - (customer.paidAmount + totalAmount) = customer.totalAmount - customer.paidAmount
    newLedgerEntry.balanceAfter = currentBalance;

    transaction.set(ledgerRef, newLedgerEntry);

    // 3. Update Customer
    transaction.update(customerRef, {
      totalAmount: (customer.totalAmount || 0) + saleData.totalAmount,
      paidAmount: (customer.paidAmount || 0) + saleData.totalAmount,
    });
  });
};

/**
 * Subscribes to realtime updates for a specific sale.
 */
export const subscribeToSale = (
  saleId: string,
  onData: (sale: Sale | null) => void,
  onError: (error: Error) => void
): (() => void) => {
  const saleRef = doc(db, 'sales', saleId);

  return onSnapshot(
    saleRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ ...snapshot.data(), saleId: snapshot.id } as Sale);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error('Error fetching sale:', error);
      onError(error);
    }
  );
};

/**
 * Subscribes to realtime updates for sales belonging to a specific customer of a vendor.
 *
 * @param vendorId - The Firebase UID of the vendor.
 * @param customerId - The ID of the customer.
 * @param onData - Callback triggered when data changes.
 * @param onError - Callback triggered on error.
 * @returns Unsubscribe function.
 */
export const subscribeToCustomerSales = (
  vendorId: string,
  customerId: string,
  onData: (sales: Sale[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const salesRef = collection(db, 'sales');

  const q = query(
    salesRef,
    where('vendorId', '==', vendorId),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const sales: Sale[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          saleId: doc.id,
        } as Sale;
      });
      onData(sales);
    },
    (error) => {
      console.error('Error fetching customer sales:', error);
      onError(error);
    }
  );

  return unsubscribe;
};


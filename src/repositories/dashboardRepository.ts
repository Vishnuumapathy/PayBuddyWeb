import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Customer, Sale, Installment, Payment } from '../models/paybuddy';

/**
 * Dashboard Repository
 * Provides realtime listeners for dashboard metrics.
 * STRICTLY READ-ONLY.
 */

export const subscribeToDashboardCustomers = (
  vendorId: string,
  onData: (customers: Customer[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'customers'),
    where('vendorId', '==', vendorId),
    where('isArchived', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map(doc => ({
      ...doc.data(),
      customerId: doc.id
    })) as Customer[];
    onData(customers);
  }, onError);
};

export const subscribeToActiveSales = (
  vendorId: string,
  onData: (sales: Sale[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'sales'),
    where('vendorId', '==', vendorId),
    where('isArchived', '==', false),
    where('status', '==', 'PENDING')
  );

  return onSnapshot(q, (snapshot) => {
    const sales = snapshot.docs.map(doc => ({
      ...doc.data(),
      saleId: doc.id
    })) as Sale[];
    onData(sales);
  }, onError);
};

export const subscribeToPendingInstallments = (
  vendorId: string,
  onData: (installments: Installment[]) => void,
  onError: (error: Error) => void
) => {
  // Use != 'PAID' as per requirement
  const q = query(
    collection(db, 'installments'),
    where('vendorId', '==', vendorId),
    where('status', '!=', 'PAID')
  );

  return onSnapshot(q, (snapshot) => {
    const installments = snapshot.docs.map(doc => ({
      ...doc.data(),
      installmentId: doc.id
    })) as Installment[];
    onData(installments);
  }, onError);
};

export const subscribeToRecentPayments = (
  vendorId: string,
  onData: (payments: Payment[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'payments'),
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'desc'),
    limit(5)
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      ...doc.data(),
      paymentId: doc.id
    })) as Payment[];
    onData(payments);
  }, onError);
};

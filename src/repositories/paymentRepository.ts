import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Payment } from "../models/paybuddy";
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

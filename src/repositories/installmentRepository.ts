import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Installment } from "../models/paybuddy";

/**
 * Subscribes to realtime updates for installments filtered by vendorId.
 * READ-ONLY implementation.
 */
export const subscribeToInstallments = (
  vendorId: string,
  onData: (installments: Installment[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const installmentsRef = collection(db, 'installments');
  const q = query(
    installmentsRef,
    where('vendorId', '==', vendorId),
    orderBy('dueDate', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const installments = snapshot.docs.map((doc) => ({
        installmentId: doc.id,
        ...doc.data(),
      })) as Installment[];
      onData(installments);
    },
    (error) => {
      console.error('Error subscribing to installments:', error);
      onError(error);
    }
  );
};

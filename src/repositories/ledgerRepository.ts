import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { LedgerEntry } from "../models/paybuddy";

/**
 * Subscribes to realtime updates for ledger entries filtered by vendorId.
 * READ-ONLY implementation.
 */
export const subscribeToLedger = (
  vendorId: string,
  onData: (entries: LedgerEntry[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const ledgerRef = collection(db, 'ledger');
  const q = query(
    ledgerRef,
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        entryId: doc.id,
        ...doc.data(),
      })) as LedgerEntry[];
      onData(entries);
    },
    (error) => {
      console.error('Error subscribing to ledger:', error);
      onError(error);
    }
  );
};

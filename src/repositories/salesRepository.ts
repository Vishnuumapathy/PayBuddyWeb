import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

import type {
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

import { db } from '../firebase/firebase';
import type { Sale } from '../models/paybuddy';

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

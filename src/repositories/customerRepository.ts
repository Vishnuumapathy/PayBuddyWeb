import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from 'firebase/firestore';

import type {
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

import { db } from '../firebase/firebase';
import type { Customer } from '../models/paybuddy';
/**
 * Subscribes to realtime updates for customers belonging to a specific vendor.
 *
 * @param vendorId - The Firebase UID of the vendor.
 * @param onData - Callback triggered when data changes.
 * @param onError - Callback triggered on query error.
 * @returns Unsubscribe function.
 */
export const subscribeToCustomers = (
  vendorId: string,
  onData: (customers: Customer[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const customersRef = collection(db, 'customers');

  // Requirement: Filter by vendorId and isArchived == false
  // Requirement: Order by createdAt descending
  const q = query(
    customersRef,
    where('vendorId', '==', vendorId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const customers: Customer[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          customerId: doc.id, // Ensure customerId comes from document id if missing
        } as Customer;
      });
      onData(customers);
    },
    (error) => {
      console.error('Error fetching customers:', error);
      onError(error);
    }
  );

  return unsubscribe;
};

/**
 * Creates a new customer in Firestore.
 *
 * @param vendorId - The Firebase UID of the vendor.
 * @param name - The name of the customer.
 * @param phone - The phone number of the customer.
 * @returns Promise<void>
 */
export const createCustomer = async (
  vendorId: string,
  name: string,
  phone: string
): Promise<void> => {
  if (!vendorId) throw new Error('Vendor ID is required');

  const customersRef = collection(db, 'customers');
  const newCustomerDoc = doc(customersRef);
  const customerId = newCustomerDoc.id;

  const newCustomer: Customer = {
    customerId,
    vendorId,
    name,
    phone,
    totalAmount: 0,
    paidAmount: 0,
    isArchived: false,
    archivedAt: null,
    createdAt: Date.now(),
  } as Customer;

  await setDoc(newCustomerDoc, newCustomer);
};

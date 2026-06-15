import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Vendor } from '../models/paybuddy';

/**
 * Creates or updates a vendor profile in Firestore.
 */
export const saveVendorProfile = async (vendor: Vendor): Promise<void> => {
  const vendorRef = doc(db, 'vendors', vendor.vendorId);
  await setDoc(vendorRef, vendor, { merge: true });
};

/**
 * Fetches a vendor profile by ID.
 */
export const getVendorProfile = async (vendorId: string): Promise<Vendor | null> => {
  const vendorRef = doc(db, 'vendors', vendorId);
  const snapshot = await getDoc(vendorRef);

  if (snapshot.exists()) {
    return snapshot.data() as Vendor;
  }

  return null;
};

/**
 * Updates specific fields of a vendor profile.
 */
export const updateVendorProfile = async (
  vendorId: string,
  updates: Partial<Vendor>
): Promise<void> => {
  const vendorRef = doc(db, 'vendors', vendorId);
  await updateDoc(vendorRef, updates);
};

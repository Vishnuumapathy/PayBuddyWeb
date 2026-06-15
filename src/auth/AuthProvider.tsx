import React, { createContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from '../firebase/firebase';
import type { Vendor } from '../models/paybuddy';
import { getVendorProfile } from '../repositories/vendorRepository';

interface AuthContextType {
  user: User | null;
  vendor: Vendor | null;
  vendorId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshVendor: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendor = async (uid: string) => {
    try {
      const profile = await getVendorProfile(uid);
      setVendor(profile);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchVendor(currentUser.uid);
      } else {
        setVendor(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshVendor = async () => {
    if (user) {
      await fetchVendor(user.uid);
    }
  };

  const value = {
    user,
    vendor,
    vendorId: user ? user.uid : null,
    loading,
    login,
    register,
    logout,
    refreshVendor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

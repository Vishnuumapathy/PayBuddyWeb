import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Customer } from "../models/paybuddy";
import { subscribeToCustomers } from '../repositories/customerRepository';

export const useCustomers = () => {
  const { vendorId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCustomers(
      vendorId,
      (data) => {
        setCustomers(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { customers, loading, error };
};

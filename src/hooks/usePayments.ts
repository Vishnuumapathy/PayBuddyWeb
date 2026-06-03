import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Payment } from "../models/paybuddy";
import { subscribeToPayments } from '../repositories/paymentRepository';

export const usePayments = () => {
  const { vendorId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPayments(
      vendorId,
      (data) => {
        setPayments(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { payments, loading, error };
};

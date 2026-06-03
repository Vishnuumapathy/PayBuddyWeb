import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Installment } from "../models/paybuddy";
import { subscribeToInstallments } from '../repositories/installmentRepository';

export const useInstallments = () => {
  const { vendorId } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToInstallments(
      vendorId,
      (data) => {
        setInstallments(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { installments, loading, error };
};

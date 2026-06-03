import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Sale } from "../models/paybuddy";
import { subscribeToSales } from '../repositories/salesRepository';

/**
 * Hook to subscribe to realtime sales data for the logged-in vendor.
 * Exposes: sales, loading, error
 */
export const useSales = () => {
  const { vendorId } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSales(
      vendorId,
      (data) => {
        setSales(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { sales, loading, error };
};

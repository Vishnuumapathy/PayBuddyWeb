import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { LedgerEntry } from "../models/paybuddy";
import { subscribeToLedger } from '../repositories/ledgerRepository';

export const useLedger = () => {
  const { vendorId } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToLedger(
      vendorId,
      (data) => {
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { entries, loading, error };
};

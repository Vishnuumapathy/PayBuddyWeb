import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeToDashboardCustomers,
  subscribeToActiveSales,
  subscribeToPendingInstallments,
  subscribeToRecentPayments,
} from '../repositories/dashboardRepository';
import type { Customer, Sale, Installment, Payment } from '../models/paybuddy';

export interface DashboardMetrics {
  totalCustomers: number;
  activeSales: number;
  pendingInstallments: number;
  todaysDueCount: number;
  outstandingBalance: number;
  recentPayments: Payment[];
}

export const useDashboard = () => {
  const { vendorId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeSales, setActiveSales] = useState<Sale[]>([]);
  const [pendingInstallments, setPendingInstallments] = useState<Installment[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    setLoading(true);

    const unsubCustomers = subscribeToDashboardCustomers(
      vendorId,
      (data) => {
        setCustomers(data);
        setLoading(false);
      },
      (err) => setError(err)
    );

    const unsubSales = subscribeToActiveSales(
      vendorId,
      (data) => setActiveSales(data),
      (err) => setError(err)
    );

    const unsubInstallments = subscribeToPendingInstallments(
      vendorId,
      (data) => setPendingInstallments(data),
      (err) => setError(err)
    );

    const unsubPayments = subscribeToRecentPayments(
      vendorId,
      (data) => setRecentPayments(data),
      (err) => setError(err)
    );

    return () => {
      unsubCustomers();
      unsubSales();
      unsubInstallments();
      unsubPayments();
    };
  }, [vendorId]);

  const metrics = useMemo((): DashboardMetrics => {
    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysDueCount = pendingInstallments.filter(inst => {
      return inst.dueDate >= startOfDay.getTime() && inst.dueDate <= endOfDay.getTime();
    }).length;

    const outstandingBalance = customers.reduce((acc, curr) => {
      return acc + (curr.totalAmount - curr.paidAmount);
    }, 0);

    return {
      totalCustomers: customers.length,
      activeSales: activeSales.length,
      pendingInstallments: pendingInstallments.length,
      todaysDueCount,
      outstandingBalance,
      recentPayments,
    };
  }, [customers, activeSales, pendingInstallments, recentPayments]);

  return { metrics, loading, error };
};

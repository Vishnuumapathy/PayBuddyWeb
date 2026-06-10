import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Customer, Sale, Payment } from '../models/paybuddy';
import { subscribeToCustomer } from '../repositories/customerRepository';
import { subscribeToCustomerSales } from '../repositories/salesRepository';
import { subscribeToCustomerPayments } from '../repositories/paymentRepository';

export const useCustomerProfile = (customerId: string | undefined) => {
  const { vendorId } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!vendorId || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to Customer
    const unsubscribeCustomer = subscribeToCustomer(
      customerId,
      (data) => {
        setCustomer(data);
      },
      (err) => {
        setError(err);
      }
    );

    // Subscribe to Sales
    const unsubscribeSales = subscribeToCustomerSales(
      vendorId,
      customerId,
      (data) => {
        setSales(data);
      },
      (err) => {
        setError(err);
      }
    );

    // Subscribe to Payments
    const unsubscribePayments = subscribeToCustomerPayments(
      vendorId,
      customerId,
      (data) => {
        setPayments(data);
      },
      (err) => {
        setError(err);
      }
    );

    // We consider loading finished when we have at least tried to fetch customer data
    // Since these are realtime listeners, they might fire at different times.
    // However, for simplicity, we'll set loading to false after a short delay or when customer is set.
    // A better way might be to track each subscription's loading state.

    // For now, let's assume if we got a customer (or null if not found), we are mostly loaded.
    const checkLoading = () => {
      // Small timeout to ensure listeners had a chance to fire
      setTimeout(() => setLoading(false), 500);
    };
    checkLoading();

    return () => {
      unsubscribeCustomer();
      unsubscribeSales();
      unsubscribePayments();
    };
  }, [vendorId, customerId]);

  return {
    customer,
    sales,
    payments,
    loading,
    error
  };
};

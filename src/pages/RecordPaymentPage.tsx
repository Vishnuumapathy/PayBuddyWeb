import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscribeToSale } from '../repositories/salesRepository';
import { recordPayment } from '../repositories/paymentRepository';
import { PageHeader, LoadingState } from '../components';
import { formatCurrency } from '../utils/formatters';
import { PAYMENT_TYPE, SALE_STATUS } from '../models/paybuddy';
import type { Sale } from '../models/paybuddy';

const RecordPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vendorId } = useAuth();
  const saleId = searchParams.get('saleId');

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!saleId) {
      setError('Sale ID is missing');
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToSale(
      saleId,
      (data) => {
        setSale(data);
        setLoading(false);
        if (data && data.status === SALE_STATUS.COMPLETED) {
            setError('This sale is already completed');
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [saleId]);

  const financialDetails = useMemo(() => {
    if (!sale) return null;
    const totalAmount = sale.paymentType === PAYMENT_TYPE.FULL
      ? sale.totalAmount
      : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);

    const remainingBalance = totalAmount - (sale.amountPaid || 0);

    return {
      totalAmount,
      amountPaid: sale.amountPaid || 0,
      remainingBalance
    };
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !sale || !financialDetails) return;

    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (amount > financialDetails.remainingBalance) {
      setError(`Amount cannot exceed remaining balance (${formatCurrency(financialDetails.remainingBalance)})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await recordPayment(vendorId, {
        saleId: sale.saleId,
        customerId: sale.customerId,
        amount,
        paymentMode
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/customers/${sale.customerId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!sale && !loading) {
      return (
          <div className="max-w-3xl mx-auto px-4 py-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Sale not found</h2>
              <button onClick={() => navigate('/sales')} className="mt-4 text-indigo-600">Back to Sales</button>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Record Payment"
        subtitle={`Recording payment for ${sale?.customerName}`}
        showBack
        backPath="/sales"
      />

      {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded text-sm text-green-700">
              Payment recorded successfully! Redirecting...
          </div>
      )}

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg text-sm">
            <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-bold">{sale?.customerName}</p>
            </div>
            <div>
                <p className="text-gray-500">Item</p>
                <p className="font-bold">{sale?.itemName}</p>
            </div>
            <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-bold">{formatCurrency(financialDetails?.totalAmount || 0)}</p>
            </div>
            <div>
                <p className="text-gray-500">Amount Paid</p>
                <p className="font-bold text-green-600">{formatCurrency(financialDetails?.amountPaid || 0)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
                <p className="text-gray-500">Remaining Balance</p>
                <p className="text-xl font-black text-red-600">{formatCurrency(financialDetails?.remainingBalance || 0)}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount *
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode *
            </label>
            <select
              id="paymentMode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success || (sale?.status === SALE_STATUS.COMPLETED)}
              className={`px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isSubmitting || success || sale?.status === SALE_STATUS.COMPLETED) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentPage;

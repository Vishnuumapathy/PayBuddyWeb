import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscribeToSale } from '../repositories/salesRepository';
import { recordPayment } from '../repositories/paymentRepository';
import { PageHeader, LoadingState, Card } from '../components';
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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <PageHeader
        title="Record Payment"
        subtitle={`Recording payment for ${sale?.customerName}`}
        showBack
        backPath="/sales"
      />

      {success && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg text-sm text-emerald-700 font-medium">
              Payment recorded successfully! Redirecting...
          </div>
      )}

      <Card hoverable={false} className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-sm">
            <div>
                <p className="text-gray-500 font-medium mb-1">Customer</p>
                <p className="font-bold text-gray-900 text-base">{sale?.customerName}</p>
            </div>
            <div>
                <p className="text-gray-500 font-medium mb-1">Item</p>
                <p className="font-bold text-gray-900 text-base">{sale?.itemName}</p>
            </div>
            <div>
                <p className="text-gray-500 font-medium mb-1">Total Amount</p>
                <p className="font-bold text-gray-900">{formatCurrency(financialDetails?.totalAmount || 0)}</p>
            </div>
            <div>
                <p className="text-gray-500 font-medium mb-1">Amount Paid</p>
                <p className="font-bold text-emerald-600">{formatCurrency(financialDetails?.amountPaid || 0)}</p>
            </div>
            <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Remaining Balance</p>
                <p className="text-3xl font-black text-rose-600">{formatCurrency(financialDetails?.remainingBalance || 0)}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-bold text-gray-900 mb-2">
              Payment Amount *
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 font-medium sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full pl-8 rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="paymentMode" className="block text-sm font-bold text-gray-900 mb-2">
              Payment Mode *
            </label>
            <select
              id="paymentMode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 transition-colors"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          <div className="pt-6 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success || (sale?.status === SALE_STATUS.COMPLETED)}
              className={`px-8 py-2.5 border border-transparent rounded-lg shadow-lg shadow-indigo-200 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                (isSubmitting || success || sale?.status === SALE_STATUS.COMPLETED) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RecordPaymentPage;

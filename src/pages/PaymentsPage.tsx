import React from 'react';
import { usePayments } from '../hooks/usePayments';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge
} from '../components';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import type { Payment } from '../models/paybuddy';

const PaymentsPage: React.FC = () => {
  const { payments, loading, error } = usePayments();

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Date & Time',
      accessor: (payment: Payment) => formatDateTime(payment.createdAt),
    },
    {
      header: 'Amount',
      accessor: (payment: Payment) => (
        <span className="font-bold text-green-600">
          {formatCurrency(payment.amount)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Mode',
      accessor: (payment: Payment) => (
        <span className="capitalize">{payment.paymentMode}</span>
      ),
    },
    {
      header: 'Customer ID',
      accessor: (payment: Payment) => (
        <span className="font-mono text-xs text-gray-500">
          {payment.customerId}
        </span>
      ),
    },
    {
      header: 'Reference / Type',
      accessor: (payment: Payment) => (
        <div className="flex flex-wrap gap-2">
          {payment.saleId ? (
            <div className="flex items-center gap-1">
              <StatusBadge status="SALE" />
              <span className="text-xs font-mono text-gray-400">{payment.saleId.slice(-6)}</span>
            </div>
          ) : (
            <StatusBadge status="Account Payment" />
          )}
          {payment.installmentId && (
            <StatusBadge status="PAYMENT" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Payment History"
        subtitle="Complete record of all received payments"
        showBack
        backPath="/dashboard"
      />

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading payments: {error.message}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          keyExtractor={(p) => p.paymentId}
          emptyState={
            <EmptyState
              title="No payments found"
              message="When you record payments, they will appear here in chronological order."
            />
          }
        />
      )}
    </div>
  );
};

export default PaymentsPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PAYMENT_TYPE } from '../models/paybuddy';
import type { Sale } from '../models/paybuddy';

const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sales, loading, error } = useSales();

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Customer',
      accessor: (sale: Sale) => (
        <button
          onClick={() => navigate(`/customers/${sale.customerId}`)}
          className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors text-left"
        >
          {sale.customerName}
        </button>
      ),
    },
    {
      header: 'Item',
      accessor: 'itemName' as keyof Sale,
    },
    {
      header: 'Type',
      accessor: (sale: Sale) => (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {sale.paymentType}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (sale: Sale) => {
        const finalAmount = sale.paymentType === PAYMENT_TYPE.FULL
          ? sale.totalAmount
          : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);
        return formatCurrency(finalAmount);
      },
      className: 'text-right',
    },
    {
      header: 'Paid',
      accessor: (sale: Sale) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(sale.amountPaid || 0)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Remaining',
      accessor: (sale: Sale) => {
        const finalAmount = sale.paymentType === PAYMENT_TYPE.FULL
          ? sale.totalAmount
          : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);
        const remainingAmount = finalAmount - (sale.amountPaid || 0);
        return (
          <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(remainingAmount)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      header: 'Status',
      accessor: (sale: Sale) => <StatusBadge status={sale.status} />,
      className: 'text-center',
    },
    {
      header: 'Date',
      accessor: (sale: Sale) => formatDate(sale.createdAt),
      className: 'text-right',
    },
    {
      header: 'Action',
      accessor: (sale: Sale) => (
        sale.status === 'PENDING' ? (
          <button
            onClick={() => navigate(`/payments/record?saleId=${sale.saleId}`)}
            className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
          >
            Pay
          </button>
        ) : null
      ),
      className: 'text-center',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Sales"
        subtitle="Track your inventory sales and payment plans"
        showBack
        backPath="/dashboard"
        actions={
          <button
            onClick={() => navigate('/sales/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Sale
          </button>
        }
      />

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading sales: {error.message}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          keyExtractor={(s) => s.saleId}
          emptyState={
            <EmptyState
              title="No sales recorded"
              message="When you make a sale, it will appear here with its payment progress."
            />
          }
        />
      )}
    </div>
  );
};

export default SalesPage;

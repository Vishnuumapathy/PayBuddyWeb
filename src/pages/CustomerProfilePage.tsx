import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { updateCustomer, archiveCustomer } from '../repositories/customerRepository';
import {
  PageHeader,
  MetricCard,
  DataTable,
  LoadingState,
  EmptyState,
  StatusBadge
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Sale, Payment } from '../models/paybuddy';

const CustomerProfilePage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { customer, sales, payments, loading, error } = useCustomerProfile(customerId);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Archive State
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading customer profile: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    setIsUpdating(true);
    try {
      await updateCustomer(customerId, editName, editPhone);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update customer');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (!customerId) return;
    setIsArchiving(true);
    try {
      await archiveCustomer(customerId);
      setIsArchiveDialogOpen(false);
      navigate('/customers');
    } catch (err) {
      console.error('Archive failed:', err);
      alert('Failed to archive customer');
    } finally {
      setIsArchiving(false);
    }
  };

  const outstandingBalance = (customer.totalAmount || 0) - (customer.paidAmount || 0);
  const firstPendingSale = sales.find(s => s.status === 'PENDING');

  const saleColumns = [
    {
      header: 'Sale ID',
      accessor: (sale: Sale) => <span className="text-xs text-gray-400 font-mono">{sale.saleId.slice(-6).toUpperCase()}</span>,
    },
    {
      header: 'Item',
      accessor: 'itemName' as keyof Sale,
    },
    {
      header: 'Amount',
      accessor: (sale: Sale) => formatCurrency(sale.totalAmount),
      className: 'text-right',
    },
    {
      header: 'Status',
      accessor: (sale: Sale) => <StatusBadge status={sale.status} />,
      className: 'text-center',
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
    {
      header: 'Created Date',
      accessor: (sale: Sale) => formatDate(sale.createdAt),
      className: 'text-right',
    },
  ];

  const paymentColumns = [
    {
      header: 'Payment ID',
      accessor: (payment: Payment) => <span className="text-xs text-gray-400 font-mono">{payment.paymentId.slice(-6).toUpperCase()}</span>,
    },
    {
      header: 'Amount',
      accessor: (payment: Payment) => formatCurrency(payment.amount),
      className: 'text-right',
    },
    {
      header: 'Mode',
      accessor: 'paymentMode' as keyof Payment,
    },
    {
      header: 'Date',
      accessor: (payment: Payment) => formatDate(payment.createdAt),
      className: 'text-right',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            {customer.name}
            {customer.isArchived && <StatusBadge status="ARCHIVED" />}
          </div>
        }
        subtitle={`Customer ID: ${customer.customerId} | Phone: ${customer.phone} | Created: ${formatDate(customer.createdAt)}`}
        showBack
        backPath="/customers"
      />

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Amount"
          value={formatCurrency(customer.totalAmount || 0)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Paid Amount"
          value={formatCurrency(customer.paidAmount || 0)}
          className="text-green-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          className={outstandingBalance > 0 ? 'text-red-600' : 'text-gray-900'}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Sales History */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales History</h2>
        <DataTable
          columns={saleColumns}
          data={sales}
          keyExtractor={(s) => s.saleId}
          emptyState={
            <EmptyState
              title="No sales found"
              message="This customer has no recorded sales."
            />
          }
        />
      </div>

      {/* Payment History */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>
        <DataTable
          columns={paymentColumns}
          data={payments}
          keyExtractor={(p) => p.paymentId}
          emptyState={
            <EmptyState
              title="No payments found"
              message="This customer has no recorded payments."
            />
          }
        />
      </div>

      {/* Actions */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Actions</h3>
            <p className="text-sm text-gray-500">Quick actions for this customer</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/sales/create?customerId=${customer.customerId}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Sale
            </button>
            <button
              onClick={() => {
                if (firstPendingSale) {
                  navigate(`/payments/record?saleId=${firstPendingSale.saleId}`);
                }
              }}
              disabled={!firstPendingSale}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                firstPendingSale
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
            >
              Record Payment
            </button>
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Edit Customer
            </button>
            {!customer.isArchived && (
              <button
                onClick={() => setIsArchiveDialogOpen(true)}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Archive Customer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Customer</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {isArchiveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Archive customer?</h3>
            <p className="text-gray-500 mb-6">
              Financial history, sales, payments and ledger records will remain preserved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsArchiveDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
              >
                {isArchiving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfilePage;

import React, { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useAuth } from '../hooks/useAuth';
import { createCustomer } from '../repositories/customerRepository';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Customer } from '../models/paybuddy';

const CustomersPage: React.FC = () => {
  const { customers, loading, error: fetchError } = useCustomers();
  const { vendorId } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setSubmitError('Name and phone are required');
      return;
    }

    if (!vendorId) {
      setSubmitError('You must be logged in to add a customer');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createCustomer(vendorId, name.trim(), phone.trim());
      setName('');
      setPhone('');
    } catch (err) {
      console.error('Failed to create customer:', err);
      setSubmitError('Failed to create customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Name',
      accessor: (customer: Customer) => (
        <div className="font-medium text-gray-900">{customer.name}</div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof Customer,
    },
    {
      header: 'Total Amount',
      accessor: (customer: Customer) => formatCurrency(customer.totalAmount || 0),
      className: 'text-right',
    },
    {
      header: 'Paid Amount',
      accessor: (customer: Customer) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(customer.paidAmount || 0)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Balance',
      accessor: (customer: Customer) => {
        const balance = (customer.totalAmount || 0) - (customer.paidAmount || 0);
        return (
          <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(balance)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      header: 'Joined',
      accessor: (customer: Customer) => formatDate(customer.createdAt),
      className: 'text-right',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer base and their balances"
        showBack
        backPath="/dashboard"
      />

      {/* Add Customer Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Customer</h2>
        <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-2 rounded-lg font-bold text-white transition-all shadow-sm ${
                isSubmitting
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
        {submitError && (
          <p className="mt-2 text-red-500 text-sm font-medium">{submitError}</p>
        )}
      </div>

      {fetchError ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading customers: {fetchError.message}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(c) => c.customerId}
          emptyState={
            <EmptyState
              title="No customers yet"
              message="Get started by adding your first customer using the form above."
            />
          }
        />
      )}
    </div>
  );
};

export default CustomersPage;

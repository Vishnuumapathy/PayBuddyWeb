import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useAuth } from '../hooks/useAuth';
import { createCustomer, archiveCustomer } from '../repositories/customerRepository';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Customer } from '../models/paybuddy';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, loading, error: fetchError } = useCustomers();
  const { vendorId } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Archive state
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const handleConfirmArchive = async () => {
    if (!customerToArchive) return;
    setIsArchiving(true);
    try {
      await archiveCustomer(customerToArchive.customerId);
      setCustomerToArchive(null);
    } catch (err) {
      console.error('Archive failed:', err);
      alert('Failed to archive customer');
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Name',
      accessor: (customer: Customer) => (
        <button
          onClick={() => navigate(`/customers/${customer.customerId}`)}
          className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors text-left"
        >
          {customer.name}
        </button>
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
    {
      header: 'Actions',
      accessor: (customer: Customer) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/customers/${customer.customerId}`)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="View Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => setCustomerToArchive(customer)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Archive Customer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
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

      {/* Archive Confirmation Dialog */}
      {customerToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Archive {customerToArchive.name}?</h3>
            <p className="text-gray-500 mb-6">
              Financial history, sales, payments and ledger records will remain preserved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCustomerToArchive(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
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

export default CustomersPage;


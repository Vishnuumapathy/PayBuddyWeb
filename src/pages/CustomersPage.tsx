import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useAuth } from '../hooks/useAuth';
import { createCustomer, archiveCustomer } from '../repositories/customerRepository';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  Card
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

  if (loading) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <LoadingState />
    </div>
  );

  const columns = [
    {
      header: 'Name',
      accessor: (customer: Customer) => (
        <button
          onClick={() => navigate(`/customers/${customer.customerId}`)}
          className="font-bold text-brand-primary hover:text-brand-primary/80 transition-colors text-left group flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs text-brand-primary group-hover:bg-brand-primary/20 transition-colors">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          {customer.name}
        </button>
      ),
    },
    {
      header: 'Phone',
      accessor: (customer: Customer) => (
        <span className="font-mono text-app-text-secondary font-medium">{customer.phone}</span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (customer: Customer) => (
        <span className="font-bold text-app-text-primary">{formatCurrency(customer.totalAmount || 0)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Paid Amount',
      accessor: (customer: Customer) => (
        <span className="text-brand-success font-bold">
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
          <span className={`font-black ${balance > 0 ? 'text-brand-error' : 'text-brand-success'}`}>
            {formatCurrency(balance)}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      header: 'Joined',
      accessor: (customer: Customer) => (
        <span className="text-app-text-secondary font-medium">{formatDate(customer.createdAt)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Actions',
      accessor: (customer: Customer) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/customers/${customer.customerId}`)}
            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all active:scale-95 hover:scale-110"
            title="View Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => setCustomerToArchive(customer)}
            className="p-2 text-brand-error hover:bg-brand-error/10 rounded-xl transition-all active:scale-95 hover:scale-110"
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
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Customers"
          subtitle="Manage your customer base and their balances"
          showBack
          backPath="/dashboard"
        />

        {/* Add Customer Form */}
        <Card className="p-8 bg-app-card border-app-border">
          <h2 className="text-xl font-bold text-app-text-primary mb-6 tracking-tight">Add New Customer</h2>
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-app-text-secondary uppercase tracking-widest ml-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:bg-app-bg focus:border-brand-primary transition-all outline-none font-medium text-app-text-primary placeholder-gray-600"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-app-text-secondary uppercase tracking-widest ml-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-app-bg border border-app-border rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:bg-app-bg focus:border-brand-primary transition-all outline-none font-medium text-app-text-primary placeholder-gray-600"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
                  isSubmitting
                    ? 'bg-brand-primary/50 cursor-not-allowed'
                    : 'bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
          {submitError && (
            <div className="mt-4 p-3 bg-brand-error/10 rounded-xl border border-brand-error/20">
              <p className="text-brand-error text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {submitError}
              </p>
            </div>
          )}
        </Card>

        {fetchError ? (
          <Card className="bg-brand-error/10 border-brand-error/20 p-4">
            <p className="text-sm text-brand-error font-bold">Error loading customers: {fetchError.message}</p>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={customers}
            keyExtractor={(c) => c.customerId}
            emptyState={
              <EmptyState
                title="No customers yet"
                message="Get started by adding your first customer using the form above."
                icon={
                  <svg className="w-10 h-10 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
            }
          />
        )}

        {/* Archive Confirmation Dialog */}
        {customerToArchive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 backdrop-blur-sm p-4 transition-all animate-in fade-in">
            <Card className="max-w-md w-full p-8 text-center animate-in zoom-in duration-200 bg-app-card border-app-border">
              <div className="w-20 h-20 bg-brand-error/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform hover:rotate-6 border border-brand-error/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-app-text-primary mb-3 tracking-tight">Archive {customerToArchive.name}?</h3>
              <p className="text-app-text-secondary mb-8 font-medium leading-relaxed">
                Financial history, sales, payments and ledger records will remain preserved in the archives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setCustomerToArchive(null)}
                  className="flex-1 px-6 py-3 bg-app-bg border border-app-border text-app-text-secondary rounded-2xl hover:bg-app-card font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmArchive}
                  disabled={isArchiving}
                  className="flex-1 px-6 py-3 bg-brand-error text-white rounded-2xl hover:bg-brand-error/90 font-black transition-all shadow-lg shadow-brand-error/20 active:scale-95 disabled:opacity-50"
                >
                  {isArchiving ? 'Archiving...' : 'Archive'}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;

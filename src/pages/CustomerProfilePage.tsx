import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { updateCustomer, archiveCustomer } from '../repositories/customerRepository';
import {
  LoadingState,
  StatusBadge,
  Card
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';


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

  if (loading) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <LoadingState />
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-app-bg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="bg-brand-error/10 border-brand-error/20 p-4">
            <p className="text-sm text-brand-error font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error.message}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-app-card rounded-full flex items-center justify-center mx-auto mb-6 border border-app-border">
          <svg className="w-10 h-10 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-app-text-primary mb-2">Customer not found</h2>
        <p className="text-app-text-secondary mb-8">The customer record you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-95"
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

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* SECTION 1 & 3 — HERO HEADER & QUICK ACTIONS */}
        <div className="bg-app-card rounded-[2.5rem] border border-app-border shadow-xl p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 rounded-3xl bg-brand-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-brand-primary/20 shrink-0 transform -rotate-3">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-black text-app-text-primary tracking-tight">{customer.name}</h1>
                  {customer.isArchived && (
                    <span className="px-3 py-1 bg-app-bg text-app-text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-app-border">
                      Archived
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-5 text-sm font-bold text-app-text-secondary uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0" />
                    </svg>
                    ID: {customer.customerId.slice(-8).toUpperCase()}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Since {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (firstPendingSale) navigate(`/payments/record?saleId=${firstPendingSale.saleId}`);
                }}
                disabled={!firstPendingSale}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-success text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-success/90 transition-all shadow-lg shadow-brand-success/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Record Payment
              </button>
              <button
                onClick={() => navigate(`/sales/create?customerId=${customer.customerId}`)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Sale
              </button>
              <button
                onClick={handleOpenEdit}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-app-bg border border-app-border text-app-text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-app-card hover:text-app-text-primary transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              {!customer.isArchived && (
                <button
                  onClick={() => setIsArchiveDialogOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-error/10 text-brand-error rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-error/20 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2 — FINANCIAL OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: 'Total Amount',
              value: customer.totalAmount || 0,
              color: 'text-brand-primary',
              bg: 'bg-brand-primary/5',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              accent: 'border-brand-primary'
            },
            {
              label: 'Paid Amount',
              value: customer.paidAmount || 0,
              color: 'text-brand-success',
              bg: 'bg-brand-success/5',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              accent: 'border-brand-success'
            },
            {
              label: 'Outstanding Balance',
              value: outstandingBalance,
              color: outstandingBalance > 0 ? 'text-brand-error' : 'text-brand-success',
              bg: outstandingBalance > 0 ? 'bg-brand-error/5' : 'bg-brand-success/5',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              accent: outstandingBalance > 0 ? 'border-brand-error' : 'border-brand-success',
              emphasize: true
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`
                relative overflow-hidden bg-app-card p-8 rounded-[2rem] border border-app-border shadow-sm
                ${item.emphasize ? 'md:scale-105 md:shadow-xl md:z-10 md:border-app-border' : ''}
                transition-all hover:border-brand-primary/30 group
              `}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full ${item.bg} opacity-20 group-hover:scale-150 transition-transform duration-700`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4 border border-white/5`}>
                  {item.icon}
                </div>
                <p className="text-xs font-black text-app-text-secondary uppercase tracking-[0.2em] mb-1">{item.label}</p>
                <p className={`text-4xl font-black ${item.color} tracking-tighter`}>
                  {formatCurrency(item.value)}
                </p>
              </div>
              <div className={`absolute bottom-0 left-8 right-8 h-1 rounded-t-full bg-brand-primary opacity-0 group-hover:opacity-30 transition-opacity`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* SECTION 4 — SALES HISTORY */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h2 className="text-2xl font-black text-app-text-primary tracking-tight">Sales History</h2>
                <p className="text-xs font-bold text-app-text-secondary uppercase tracking-widest mt-1">Timeline of all purchases</p>
              </div>
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-full uppercase tracking-tighter border border-brand-primary/20">
                {sales.length} Items
              </span>
            </div>

            <div className="space-y-4">
              {sales.length > 0 ? (
                sales.map((sale, idx) => (
                  <div key={sale.saleId} className="group relative flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/5
                        ${sale.status === 'COMPLETED' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'}
                        shadow-sm group-hover:scale-110 transition-transform duration-300
                      `}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      {idx !== sales.length - 1 && (
                        <div className="w-0.5 h-full bg-app-border my-1 group-hover:bg-brand-primary/30 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-app-card rounded-3xl p-6 border border-app-border shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">
                              REF: {sale.saleId.slice(-6).toUpperCase()}
                            </p>
                            <h3 className="text-lg font-black text-app-text-primary leading-tight group-hover:text-brand-primary transition-colors">
                              {sale.itemName}
                            </h3>
                          </div>
                          <StatusBadge status={sale.status} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-app-border/30">
                          <div>
                            <p className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1">Total</p>
                            <p className="font-black text-app-text-primary">{formatCurrency(sale.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1">Remaining</p>
                            <p className={`font-black ${sale.status === 'PENDING' ? 'text-brand-error' : 'text-brand-success'}`}>
                              {formatCurrency(sale.totalAmount - (sale.amountPaid || 0))}
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mb-1">Date</p>
                            <p className="font-bold text-app-text-secondary">{formatDate(sale.createdAt)}</p>
                          </div>
                        </div>
                        {sale.status === 'PENDING' && (
                          <button
                            onClick={() => navigate(`/payments/record?saleId=${sale.saleId}`)}
                            className="mt-6 w-full py-3 bg-app-bg text-brand-primary text-xs font-black rounded-xl hover:bg-brand-primary hover:text-white transition-all uppercase tracking-widest border border-brand-primary/20"
                          >
                            Collect Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-app-card rounded-[2.5rem] border border-app-border p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-brand-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/10">
                    <svg className="w-10 h-10 text-brand-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-app-text-primary mb-2 tracking-tight">No Sales Yet</h3>
                  <p className="text-app-text-secondary text-sm font-medium mb-8">This customer hasn't made any purchases yet.</p>
                  <button
                    onClick={() => navigate(`/sales/create?customerId=${customer.customerId}`)}
                    className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
                  >
                    Create First Sale
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5 — PAYMENT HISTORY */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h2 className="text-2xl font-black text-app-text-primary tracking-tight">Payments</h2>
                <p className="text-xs font-bold text-app-text-secondary uppercase tracking-widest mt-1">Recent transactions</p>
              </div>
              <div className="w-10 h-10 bg-brand-success/10 rounded-2xl flex items-center justify-center text-brand-success shadow-sm border border-brand-success/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-app-card rounded-[2.5rem] border border-app-border shadow-sm overflow-hidden">
              {payments.length > 0 ? (
                <div className="divide-y divide-app-border/30">
                  {payments.map((payment) => (
                    <div key={payment.paymentId} className="p-6 hover:bg-app-bg/50 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-success/10 text-brand-success rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-brand-success/20">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-black text-app-text-primary leading-tight">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mt-1">
                              {payment.paymentMode} • {formatDate(payment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-1 bg-brand-success/10 text-brand-success text-[10px] font-black rounded-lg uppercase tracking-widest border border-brand-success/20">
                            Success
                          </span>
                          <p className="text-[10px] font-mono font-bold text-app-text-secondary/30 mt-2">
                            #{payment.paymentId.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-brand-success/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-success/10">
                    <svg className="w-8 h-8 text-brand-success/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-app-text-primary mb-1 tracking-tight">No Transactions</h3>
                  <p className="text-app-text-secondary text-xs font-medium">Payment history will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODALS RENDERED HERE (Edit and Archive remain same logic but styled) */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="max-w-md w-full p-8 animate-in zoom-in duration-200 rounded-[2.5rem] shadow-2xl bg-app-card border-app-border">
              <h3 className="text-2xl font-black text-app-text-primary mb-6 tracking-tight">Edit Profile</h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-app-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:bg-app-bg focus:border-brand-primary transition-all outline-none font-bold text-app-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-app-text-secondary uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:ring-2 focus:ring-brand-primary/50 focus:bg-app-bg focus:border-brand-primary transition-all outline-none font-bold text-app-text-primary"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-app-bg border border-app-border text-app-text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-app-card transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-6 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {isArchiveDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-bg/80 backdrop-blur-sm p-4 animate-in fade-in">
            <Card className="max-w-md w-full p-10 text-center animate-in zoom-in duration-200 rounded-[2.5rem] shadow-2xl bg-app-card border-app-border">
              <div className="w-24 h-24 bg-brand-error/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform hover:rotate-6 transition-transform border border-brand-error/20">
                <svg className="h-12 w-12 text-brand-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-app-text-primary mb-3 tracking-tight">Archive Record?</h3>
              <p className="text-app-text-secondary mb-10 font-medium leading-relaxed">
                All financial data for <span className="text-app-text-primary font-bold">{customer.name}</span> will be moved to archives. You can still access these records later.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="w-full px-6 py-4 bg-brand-error text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-error/90 transition-all shadow-xl shadow-brand-error/20 active:scale-95 disabled:opacity-50"
                >
                  {isArchiving ? 'Archiving...' : 'Yes, Archive Customer'}
                </button>
                <button
                  onClick={() => setIsArchiveDialogOpen(false)}
                  className="w-full px-6 py-4 bg-app-bg border border-app-border text-app-text-secondary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-app-card transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfilePage;

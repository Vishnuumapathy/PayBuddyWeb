import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../hooks/usePayments';
import {
  PageHeader,
  EmptyState,
  LoadingState,
  Card,
  MetricCard
} from '../components';
import { formatCurrency, formatDateTime } from '../utils/formatters';


const PaymentModeBadge: React.FC<{ mode: string }> = ({ mode }) => {
  const normalizedMode = mode.toLowerCase();
  let colors = 'bg-gray-500/10 text-gray-400 border-gray-500/20'; // Other -> Gray

  if (normalizedMode === 'cash') {
    colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (normalizedMode === 'upi') {
    colors = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  } else if (normalizedMode === 'bank transfer' || normalizedMode === 'bank') {
    colors = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${colors}`}>
      {mode}
    </span>
  );
};

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { payments, loading, error } = usePayments();

  // States for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Metrics calculation
  const metrics = useMemo(() => {
    if (!payments.length) return { total: 0, amount: 0, today: 0, avg: 0 };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();

    const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
    const todaysCollections = payments
      .filter(p => p.createdAt >= todayTs)
      .reduce((acc, p) => acc + p.amount, 0);

    return {
      total: payments.length,
      amount: totalAmount,
      today: todaysCollections,
      avg: totalAmount / payments.length
    };
  }, [payments]);

  // Filtering and Sorting logic
  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        const matchesSearch = p.customerId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMode = modeFilter === 'All' || p.paymentMode.toLowerCase() === modeFilter.toLowerCase();
        return matchesSearch && matchesMode;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'amount-high') return b.amount - a.amount;
        if (sortBy === 'amount-low') return a.amount - b.amount;
        return 0;
      });
  }, [payments, searchTerm, modeFilter, sortBy]);

  if (loading) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <LoadingState />
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <PageHeader
          title="Payments History"
          subtitle="Modern transaction management for your collections"
          showBack
          backPath="/dashboard"
        />

        {error ? (
          <Card className="bg-rose-500/10 border-rose-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-rose-400 font-bold">Error loading payments: {error.message}</p>
            </div>
          </Card>
        ) : (
          <>
            {/* SECTION 1 — PAYMENT OVERVIEW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard
                title="Total Payments"
                value={metrics.total}
                icon={
                  <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <MetricCard
                title="Total Collected"
                value={formatCurrency(metrics.amount)}
                className="border-brand-success/20"
                icon={
                  <svg className="w-6 h-6 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <MetricCard
                title="Today's Collections"
                value={formatCurrency(metrics.today)}
                className="border-brand-warning/20"
                icon={
                  <svg className="w-6 h-6 text-brand-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <MetricCard
                title="Average Payment"
                value={formatCurrency(metrics.avg)}
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>

            {/* SECTION 2 — SEARCH + FILTER BAR */}
            <Card className="p-4 sm:p-6 bg-app-card/50 border-app-border shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by customer ID..."
                    className="w-full pl-12 pr-4 py-3 bg-app-bg border border-app-border rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium shadow-sm text-app-text-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    className="px-4 py-3 bg-app-bg border border-app-border rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary outline-none font-bold text-app-text-primary shadow-sm cursor-pointer appearance-none"
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                  >
                    <option value="All">All Modes</option>
                    <option value="Cash">Cash Only</option>
                    <option value="UPI">UPI Only</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                  <select
                    className="px-4 py-3 bg-app-bg border border-app-border rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary outline-none font-bold text-app-text-primary shadow-sm cursor-pointer appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount-high">Highest Amount</option>
                    <option value="amount-low">Lowest Amount</option>
                  </select>
                  <div className="relative group opacity-40">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="text"
                      disabled
                      placeholder="Date Range"
                      className="w-full pl-11 pr-4 py-3 bg-app-bg/50 border border-app-border rounded-2xl text-sm outline-none font-bold text-app-text-secondary cursor-not-allowed"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* SECTION 3 — TRANSACTION FEED */}
            {filteredPayments.length > 0 ? (
              <div className="space-y-4">
                {/* Desktop Transaction Table */}
                <div className="hidden md:block overflow-hidden bg-app-card rounded-3xl border border-app-border shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-app-bg/40 border-b border-app-border">
                        <th className="px-8 py-5 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em]">Transaction Date</th>
                        <th className="px-8 py-5 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em]">Customer Entity</th>
                        <th className="px-8 py-5 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em]">Source / Ref</th>
                        <th className="px-8 py-5 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em]">Payment Mode</th>
                        <th className="px-8 py-5 text-[11px] font-black text-app-text-secondary uppercase tracking-[0.2em] text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/30">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.paymentId} className="hover:bg-app-bg/30 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                              <span className="text-sm font-bold text-app-text-primary">{formatDateTime(payment.createdAt).split(',')[0]}</span>
                              <span className="text-[10px] font-black text-app-text-secondary uppercase tracking-widest mt-0.5">
                                {formatDateTime(payment.createdAt).split(',')[1]}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => navigate(`/customers/${payment.customerId}`)}
                              className="font-mono text-[11px] font-black text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-xl transition-all border border-brand-primary/20"
                            >
                              #{payment.customerId.slice(-8).toUpperCase()}
                            </button>
                          </td>
                          <td className="px-8 py-6">
                            {payment.saleId ? (
                               <div className="flex flex-col gap-1">
                                 <span className="text-[10px] font-black text-app-text-primary uppercase tracking-tighter bg-app-bg px-2 py-0.5 rounded-md w-fit">SALE RECORD</span>
                                 <span className="text-[10px] font-bold text-app-text-secondary">REF: {payment.saleId.slice(-6).toUpperCase()}</span>
                               </div>
                            ) : (
                               <span className="text-[10px] font-bold text-app-text-secondary italic bg-app-bg px-2 py-1 rounded-md">Direct Payment</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                             <PaymentModeBadge mode={payment.paymentMode} />
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="text-base font-black text-brand-success tracking-tight group-hover:scale-105 transition-transform inline-block">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SECTION 5 — MOBILE VIEW (Cards) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredPayments.map((payment) => (
                    <div key={payment.paymentId} className="bg-app-card p-5 rounded-3xl border border-app-border shadow-sm space-y-4 active:scale-[0.98] transition-transform">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-app-text-secondary uppercase tracking-widest">
                            {formatDateTime(payment.createdAt)}
                          </span>
                          <button
                            onClick={() => navigate(`/customers/${payment.customerId}`)}
                            className="mt-2 font-mono text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-xl border border-brand-primary/20 w-fit"
                          >
                            CUST: {payment.customerId.slice(-8).toUpperCase()}
                          </button>
                        </div>
                        <PaymentModeBadge mode={payment.paymentMode} />
                      </div>

                      <div className="flex justify-between items-end border-t border-app-border/30 pt-4">
                        <div>
                          <p className="text-[9px] font-black text-app-text-secondary uppercase tracking-[0.2em] mb-1.5">Related Transaction</p>
                          {payment.saleId ? (
                             <span className="text-[10px] font-bold text-app-text-primary bg-app-bg px-2.5 py-1 rounded-lg">
                               REF: {payment.saleId.slice(-6).toUpperCase()}
                             </span>
                          ) : (
                             <span className="text-[10px] font-bold text-app-text-secondary italic">Direct Deposit</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-app-text-secondary uppercase tracking-[0.2em] mb-1">Amount Paid</p>
                          <span className="text-xl font-black text-brand-success tracking-tighter">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* SECTION 6 — EMPTY STATE */
              <div className="py-12">
                <EmptyState
                  title="No payments recorded yet"
                  message="Payments collected from customers will appear here."
                  icon={
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand-primary blur-2xl opacity-10 rounded-full animate-pulse" />
                      <div className="relative p-6 bg-app-card rounded-3xl border-2 border-dashed border-app-border">
                        <span className="text-5xl" role="img" aria-label="card">💳</span>
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;

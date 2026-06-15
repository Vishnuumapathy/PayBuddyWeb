import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
  PageHeader,
  MetricCard,
  LoadingState,
  DataTable,
  EmptyState,
  Card
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Payment } from '../models/paybuddy';

const DashboardSection: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, action, className = "" }) => (
  <Card className={`p-6 ${className}`}>
    <div className="flex justify-between items-start mb-6">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-app-text-primary leading-tight truncate">{title}</h2>
        <p className="text-xs text-app-text-secondary mt-1 font-medium truncate">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </Card>
);

const DashboardPage: React.FC = () => {
  const { vendor, logout } = useAuth();
  const { metrics, loading, error } = useDashboard();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading && !metrics.totalCustomers) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  const recentPaymentsColumns = [
    {
      header: 'Date',
      accessor: (payment: Payment) => (
        <span className="text-app-text-secondary">{formatDate(payment.createdAt)}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: (payment: Payment) => (
        <span className="font-bold text-brand-success">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (payment: Payment) => (
        <span className="font-mono text-xs text-app-text-secondary font-bold">
          {payment.customerId.slice(-8).toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 sm:space-y-8">
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back, ${vendor?.name || 'Vendor'}!`}
          actions={
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-2.5 sm:px-5 sm:py-2.5 text-sm font-bold rounded-xl text-white bg-brand-error hover:bg-brand-error/90 transition-all shadow-lg shadow-brand-error/20 active:scale-95 border border-white/10"
              title="Logout"
            >
              <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          }
        />

        {error && (
          <Card className="bg-brand-error/10 border-brand-error/20 p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-error/20 rounded-lg">
                <svg className="h-5 w-5 text-brand-error" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-brand-error font-bold">
                {error.message}
              </p>
            </div>
          </Card>
        )}

        {/* 1. Metric Section - 2 Columns on mobile to match the app layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/customers" className="block h-full group">
            <MetricCard
              title="Total Customers"
              value={metrics.totalCustomers}
              icon={
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </Link>
          <Link to="/sales" className="block h-full group">
            <MetricCard
              title="Active Sales"
              value={metrics.activeSales}
              icon={
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          </Link>
          <Link to="/installments" className="block h-full group">
            <MetricCard
              title="Pending Items"
              value={metrics.pendingInstallments}
              className="border-brand-warning/20"
              icon={
                <svg className="w-6 h-6 text-brand-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </Link>
          <Link to="/installments" className="block h-full group">
            <MetricCard
              title="Today's Due"
              value={metrics.todaysDueCount}
              className="border-brand-error/20"
              icon={
                <svg className="w-6 h-6 text-brand-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </Link>
          <Link to="/ledger" className="col-span-2 lg:col-span-4 block group">
            <MetricCard
              title="Outstanding Balance"
              value={formatCurrency(metrics.outstandingBalance)}
              className="border-brand-success/20"
              icon={
                <svg className="w-6 h-6 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <DashboardSection
              title="Recent Payments"
              subtitle="Latest activity"
              action={
                <Link to="/payments" className="text-brand-primary hover:text-brand-primary/80 text-sm font-bold transition-all flex items-center gap-1 group">
                  View All
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              }
            >
              <DataTable
                columns={recentPaymentsColumns}
                data={metrics.recentPayments}
                keyExtractor={(p) => p.paymentId}
                emptyState={
                  <EmptyState
                    title="No recent payments"
                    message="💰 No activity yet."
                    icon={
                      <svg className="w-10 h-10 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                }
              />
            </DashboardSection>

            <DashboardSection
              title="Recent Activity"
              subtitle="Business updates"
            >
              {metrics.recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentPayments.slice(0, 5).map((payment) => (
                    <div key={`activity-${payment.paymentId}`} className="flex items-center gap-4 p-4 rounded-2xl bg-app-bg/50 border border-app-border transition-all hover:bg-app-card hover:shadow-sm group">
                      <div className="p-3 bg-app-card rounded-xl shadow-sm border border-app-border group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-app-text-primary truncate">
                          Payment of <span className="text-brand-success">{formatCurrency(payment.amount)}</span>
                        </p>
                        <p className="text-xs text-app-text-secondary mt-1 font-medium">
                          {formatDate(payment.createdAt)} • ID {payment.customerId.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent activity"
                  message="📈 Activity will appear here."
                />
              )}
            </DashboardSection>
          </div>

          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <DashboardSection
              title="Collection"
              subtitle="Items due"
              action={
                <Link to="/installments" className="text-brand-primary hover:text-brand-primary/80 text-sm font-bold transition-all group">
                  Manage
                </Link>
              }
            >
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-brand-primary/5 border border-brand-primary/10 text-center relative overflow-hidden">
                <span className="text-6xl font-black text-brand-primary tracking-tight mb-2 relative">
                  {metrics.pendingInstallments}
                </span>
                <p className="text-xs font-bold text-brand-primary/80 uppercase tracking-widest relative">
                  Pending
                </p>

                {metrics.todaysDueCount > 0 && (
                  <div className="mt-6 w-full py-3 px-4 bg-app-card rounded-2xl border border-brand-error/20 shadow-sm relative">
                    <p className="text-[11px] font-black text-brand-error flex items-center justify-center gap-2 uppercase">
                      <span className="w-2 h-2 bg-brand-error rounded-full animate-ping"></span>
                      {metrics.todaysDueCount} Due Today
                    </p>
                  </div>
                )}
              </div>
            </DashboardSection>

            <DashboardSection
              title="Quick Access"
              subtitle="Main modules"
            >
              <div className="space-y-3">
                <Link
                  to="/customers"
                  className="flex items-center justify-between p-4 bg-app-bg hover:bg-app-card rounded-2xl transition-all border border-app-border group shadow-sm active:scale-95"
                >
                  <span className="text-sm font-bold text-app-text-primary group-hover:text-brand-primary">Customers</span>
                  <div className="p-1 rounded-lg bg-app-card group-hover:bg-brand-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-app-text-secondary group-hover:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link
                  to="/sales"
                  className="flex items-center justify-between p-4 bg-app-bg hover:bg-app-card rounded-2xl transition-all border border-app-border group shadow-sm active:scale-95"
                >
                  <span className="text-sm font-bold text-app-text-primary group-hover:text-brand-primary">Sales & Orders</span>
                  <div className="p-1 rounded-lg bg-app-card group-hover:bg-brand-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-app-text-secondary group-hover:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </DashboardSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

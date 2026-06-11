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
      <div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </Card>
);

const DashboardPage: React.FC = () => {
  const { vendorId, logout } = useAuth();
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
    return <LoadingState />;
  }

  const recentPaymentsColumns = [
    {
      header: 'Date',
      accessor: (payment: Payment) => formatDate(payment.createdAt),
    },
    {
      header: 'Amount',
      accessor: (payment: Payment) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (payment: Payment) => (
        <span className="font-mono text-xs text-gray-400 font-bold">
          {payment.customerId.slice(-8).toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Vendor ID: ${vendorId?.slice(0, 8)}...`}
        actions={
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-xl text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        }
      />

      {error && (
        <Card className="bg-rose-50 border-rose-100 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <svg className="h-5 w-5 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-rose-700 font-bold">
              {error.message}
            </p>
          </div>
        </Card>
      )}

      {/* 1. Metric Section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/customers" className="block h-full group">
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers}
            className="text-indigo-600"
            icon={
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </Link>
        <Link to="/sales" className="block h-full group">
          <MetricCard
            title="Active Sales"
            value={metrics.activeSales}
            className="text-indigo-600"
            icon={
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
        </Link>
        <Link to="/installments" className="block h-full group">
          <MetricCard
            title="Pending Installments"
            value={metrics.pendingInstallments}
            className="text-amber-600"
            icon={
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </Link>
        <Link to="/installments" className="block h-full group">
          <MetricCard
            title="Today's Due"
            value={metrics.todaysDueCount}
            className="text-rose-600"
            icon={
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </Link>
        <Link to="/ledger" className="sm:col-span-2 lg:col-span-4 block group">
          <MetricCard
            title="Outstanding Balance"
            value={formatCurrency(metrics.outstandingBalance)}
            className="text-emerald-600"
            icon={
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DashboardSection
            title="Recent Payments"
            subtitle="Latest payment activity"
            action={
              <Link to="/payments" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-all flex items-center gap-1 group">
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
                  message="💰 No payment activity yet. Payments will appear here when recorded."
                  icon={
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
              }
            />
          </DashboardSection>

          <DashboardSection
            title="Recent Activity"
            subtitle="Recent actions across your business"
          >
            {metrics.recentPayments.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentPayments.slice(0, 5).map((payment) => (
                  <div key={`activity-${payment.paymentId}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/30 border border-gray-100 transition-all hover:bg-white hover:shadow-sm group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        Received payment of <span className="text-emerald-600">{formatCurrency(payment.amount)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {formatDate(payment.createdAt)} • Customer {payment.customerId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activity"
                message="📈 Your business activity will appear here."
              />
            )}
          </DashboardSection>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <DashboardSection
            title="Collection Status"
            subtitle="Items requiring attention"
            action={
              <Link to="/installments" className="text-indigo-600 hover:text-indigo-700 text-sm font-bold transition-all group">
                Manage
              </Link>
            }
          >
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-indigo-50/30 border border-indigo-100 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-6xl font-black text-indigo-600 tracking-tight mb-2 relative">
                {metrics.pendingInstallments}
              </span>
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest relative">
                Pending Collection
              </p>

              {metrics.todaysDueCount > 0 && (
                <div className="mt-6 w-full py-3 px-4 bg-white rounded-2xl border border-rose-100 shadow-sm relative">
                  <p className="text-[11px] font-black text-rose-600 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                    {metrics.todaysDueCount} DUE TODAY
                  </p>
                </div>
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Quick Stats"
            subtitle="Overview at a glance"
          >
            <div className="space-y-3">
              {[
                { label: 'Total Customers', value: metrics.totalCustomers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Active Sales', value: metrics.activeSales, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Pending Items', value: metrics.pendingInstallments, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Outstanding', value: formatCurrency(metrics.outstandingBalance), color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all group">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <Link
                to="/customers"
                className="flex items-center justify-between p-4 bg-white hover:bg-indigo-50/50 rounded-2xl transition-all border border-gray-100 hover:border-indigo-100 group shadow-sm active:scale-95"
              >
                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">Manage Customers</span>
                <div className="p-1 rounded-lg bg-gray-50 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <Link
                to="/sales"
                className="flex items-center justify-between p-4 bg-white hover:bg-indigo-50/50 rounded-2xl transition-all border border-gray-100 hover:border-indigo-100 group shadow-sm active:scale-95"
              >
                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">Sales & Orders</span>
                <div className="p-1 rounded-lg bg-gray-50 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

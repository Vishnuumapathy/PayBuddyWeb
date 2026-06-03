import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import {
  PageHeader,
  MetricCard,
  LoadingState,
  DataTable,
  EmptyState
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Payment } from '../models/paybuddy';

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
        <span className="font-bold text-green-600">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      header: 'Customer ID',
      accessor: (payment: Payment) => (
        <span className="font-mono text-xs text-gray-500">
          {payment.customerId.slice(-8)}...
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Vendor ID: ${vendorId?.slice(0, 8)}...`}
        actions={
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
          >
            Logout
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading dashboard metrics: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link to="/customers">
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers}
            className="hover:shadow-md transition-shadow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </Link>
        <Link to="/sales">
          <MetricCard
            title="Active Sales"
            value={metrics.activeSales}
            className="hover:shadow-md transition-shadow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
        </Link>
        <Link to="/installments">
          <MetricCard
            title="Pending Installments"
            value={metrics.pendingInstallments}
            className="hover:shadow-md transition-shadow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </Link>
        <Link to="/installments">
          <MetricCard
            title="Today's Due"
            value={metrics.todaysDueCount}
            className="hover:shadow-md transition-shadow border-l-4 border-l-red-500"
            icon={
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </Link>
        <Link to="/ledger" className="sm:col-span-2">
          <MetricCard
            title="Outstanding Balance"
            value={formatCurrency(metrics.outstandingBalance)}
            className="hover:shadow-md transition-shadow bg-indigo-50"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { to: '/customers', label: 'Manage Customers', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { to: '/sales', label: 'Sales & Orders', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
              { to: '/payments', label: 'Payment History', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { to: '/ledger', label: 'Business Ledger', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`block w-full text-center font-semibold py-3 px-4 rounded-lg transition-colors ${action.color}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5 px-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Payments
            </h2>
            <Link to="/payments" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors">
              View All &rarr;
            </Link>
          </div>

          <DataTable
            columns={recentPaymentsColumns}
            data={metrics.recentPayments}
            keyExtractor={(p) => p.paymentId}
            emptyState={
              <EmptyState
                title="No recent payments"
                message="Payments will appear here once you record them."
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

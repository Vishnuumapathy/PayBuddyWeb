import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../hooks/useSales';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge,
  Card,
  MetricCard
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PAYMENT_TYPE } from '../models/paybuddy';
import type { Sale } from '../models/paybuddy';

const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { sales, loading, error } = useSales();

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'amount' | 'customer'>('newest');

  const stats = useMemo(() => {
    const total = sales.length;
    const completed = sales.filter(s => s.status === 'COMPLETED').length;
    const pending = sales.filter(s => s.status === 'PENDING').length;
    const totalValue = sales.reduce((acc, sale) => {
      const finalAmount = sale.paymentType === PAYMENT_TYPE.FULL
        ? sale.totalAmount
        : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);
      return acc + finalAmount;
    }, 0);
    return { total, completed, pending, totalValue };
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const matchesSearch =
          sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
        if (sortBy === 'customer') return a.customerName.localeCompare(b.customerName);
        return 0;
      });
  }, [sales, searchTerm, statusFilter, sortBy]);

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Sale Info',
      accessor: (sale: Sale) => (
        <div className="flex flex-col py-1">
          <span className="font-bold text-gray-900 text-base">{sale.itemName}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customers/${sale.customerId}`);
            }}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 mt-0.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {sale.customerName}
          </button>
        </div>
      ),
    },
    {
      header: 'Payment Plan',
      accessor: (sale: Sale) => (
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest ${sale.paymentType === PAYMENT_TYPE.FULL ? 'text-emerald-600' : 'text-amber-600'}`}>
            {sale.paymentType}
          </span>
          <span className="text-xs text-gray-400 font-bold mt-0.5">
            {sale.installmentCount > 0 ? `${sale.installmentCount} Installments` : 'Single Payment'}
          </span>
        </div>
      ),
    },
    {
      header: 'Financials',
      accessor: (sale: Sale) => {
        const finalAmount = sale.paymentType === PAYMENT_TYPE.FULL
          ? sale.totalAmount
          : sale.totalAmount + (sale.totalAmount * (sale.interestRate || 0) / 100);
        const remaining = finalAmount - (sale.amountPaid || 0);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{formatCurrency(finalAmount)}</span>
            <span className={`text-[10px] font-bold ${remaining > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {remaining > 0 ? `${formatCurrency(remaining)} remaining` : 'Fully Paid'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (sale: Sale) => <StatusBadge status={sale.status} />,
      className: 'text-center',
    },
    {
      header: 'Date',
      accessor: (sale: Sale) => (
        <div className="flex flex-col items-end">
          <span className="text-gray-900 font-bold text-xs">{formatDate(sale.createdAt)}</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
      className: 'text-right',
    },
    {
      header: 'Quick Actions',
      accessor: (sale: Sale) => (
        <div className="flex items-center justify-end gap-2">
          {sale.status === 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/payments/record?saleId=${sale.saleId}`);
              }}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              title="Record Payment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customers/${sale.customerId}`);
            }}
            className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-200 transition-all active:scale-90"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHeader
        title="Sales Management"
        subtitle="Manage and track your inventory sales and installment plans"
        showBack
        backPath="/dashboard"
        actions={
          <button
            onClick={() => navigate('/sales/create')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-black rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Sale
          </button>
        }
      />

      {/* SECTION 1 — SALES OVERVIEW HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value={stats.total}
          icon={<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <MetricCard
          title="Completed"
          value={stats.completed}
          className="text-emerald-600"
          icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          title="Pending"
          value={stats.pending}
          className="text-amber-600"
          icon={<svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          className="text-indigo-600"
          icon={<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* SECTION 2 — ADVANCED SEARCH AREA */}
      <Card className="p-4 bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer or item name..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-gray-600"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="amount">Highest Amount</option>
              <option value="customer">Customer Name</option>
            </select>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="bg-rose-50 border-rose-100 p-4 text-center">
          <p className="text-sm text-rose-700 font-bold">Error loading sales: {error.message}</p>
        </Card>
      ) : (
        <>
          {/* SECTION 3 & 4 — SALES TABLE & MOBILE ROW CARDS */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={filteredSales}
              keyExtractor={(s) => s.saleId}
              emptyState={
                <EmptyState
                  title="No sales yet"
                  message="Create your first sale to begin tracking customer transactions."
                  icon={<span className="text-4xl">📦</span>}
                  action={
                    <button
                      onClick={() => navigate('/sales/create')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100"
                    >
                      Create Your First Sale
                    </button>
                  }
                />
              }
            />
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-4">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <Card key={sale.saleId} className="p-4 space-y-4 border-gray-100 shadow-sm active:scale-[0.98] transition-all" onClick={() => navigate(`/customers/${sale.customerId}`)}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 text-lg">{sale.itemName}</h4>
                      <p className="text-sm text-indigo-600 font-bold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {sale.customerName}
                      </p>
                    </div>
                    <StatusBadge status={sale.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</p>
                      <p className="font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                      <p className="font-bold text-gray-900 text-xs">{formatDate(sale.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${sale.customerId}`);
                      }}
                      className="flex-1 py-2.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-100"
                    >
                      View Details
                    </button>
                    {sale.status === 'PENDING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payments/record?saleId=${sale.saleId}`);
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No sales found"
                message={searchTerm ? "Try adjusting your search or filters." : "Create your first sale to begin tracking customer transactions."}
                icon={<span className="text-4xl">📦</span>}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesPage;

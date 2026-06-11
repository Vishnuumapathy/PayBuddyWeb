import React from 'react';
import { useInstallments } from '../hooks/useInstallments';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge,
  Card
} from '../components';
import { formatCurrency, formatDate } from '../utils/formatters';
import { INSTALLMENT_STATUS } from '../models/paybuddy';
import type { Installment } from '../models/paybuddy';

const InstallmentsPage: React.FC = () => {
  const { installments, loading, error } = useInstallments();

  if (loading) return <LoadingState />;

  const isOverdue = (status: string, dueDate: number) => {
    return status !== INSTALLMENT_STATUS.PAID && dueDate < Date.now();
  };

  const columns = [
    {
      header: 'Due Date',
      accessor: (inst: Installment) => (
        <div className="flex flex-col">
          <span className={`font-bold ${isOverdue(inst.status, inst.dueDate) ? 'text-rose-600' : 'text-gray-900'}`}>
            {formatDate(inst.dueDate)}
          </span>
          {isOverdue(inst.status, inst.dueDate) && (
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">Overdue</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (inst: Installment) => {
        const status = isOverdue(inst.status, inst.dueDate) ? 'OVERDUE' : inst.status;
        return <StatusBadge status={status} />;
      },
      className: 'text-center',
    },
    {
      header: 'Amount',
      accessor: (inst: Installment) => (
        <span className="font-black text-gray-900">{formatCurrency(inst.amount)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Paid',
      accessor: (inst: Installment) => (
        <span className="text-emerald-600 font-bold">{formatCurrency(inst.amountPaid)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Customer',
      accessor: (inst: Installment) => (
        <span className="font-mono text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase">
          {inst.customerId.slice(-8)}
        </span>
      ),
    },
    {
      header: 'Reminders',
      accessor: (inst: Installment) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${inst.reminderStatus === 'SENT' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500">Count: {inst.reminderCount}</span>
            <span className={`text-[10px] uppercase font-black tracking-widest ${inst.reminderStatus === 'SENT' ? 'text-indigo-600' : 'text-gray-300'}`}>
              {inst.reminderStatus}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <PageHeader
        title="Installments"
        subtitle="Manage upcoming and overdue payment installments"
        showBack
        backPath="/dashboard"
      />

      {error ? (
        <Card className="bg-rose-50 border-rose-100 p-4">
          <p className="text-sm text-rose-700 font-bold">Error loading installments: {error.message}</p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={installments}
          keyExtractor={(i) => i.installmentId}
          emptyState={
            <EmptyState
              title="No installments found"
              message="Installments will be created automatically when you record a partial sale."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          }
        />
      )}
    </div>
  );
};

export default InstallmentsPage;

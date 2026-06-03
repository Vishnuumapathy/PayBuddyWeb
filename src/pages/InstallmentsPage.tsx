import React from 'react';
import { useInstallments } from '../hooks/useInstallments';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge
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
        <span className={isOverdue(inst.status, inst.dueDate) ? 'text-red-600 font-bold' : ''}>
          {formatDate(inst.dueDate)}
        </span>
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
        <span className="font-bold text-gray-900">{formatCurrency(inst.amount)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Paid',
      accessor: (inst: Installment) => (
        <span className="text-green-600 font-medium">{formatCurrency(inst.amountPaid)}</span>
      ),
      className: 'text-right',
    },
    {
      header: 'Customer ID',
      accessor: (inst: Installment) => (
        <span className="font-mono text-xs text-gray-400">{inst.customerId.slice(-8)}...</span>
      ),
    },
    {
      header: 'Reminders',
      accessor: (inst: Installment) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500">Sent: {inst.reminderCount}</span>
          <span className={`text-[10px] uppercase font-bold ${inst.reminderStatus === 'SENT' ? 'text-indigo-600' : 'text-gray-300'}`}>
            {inst.reminderStatus}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Installments"
        subtitle="Manage upcoming and overdue payment installments"
        showBack
        backPath="/dashboard"
      />

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading installments: {error.message}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={installments}
          keyExtractor={(i) => i.installmentId}
          emptyState={
            <EmptyState
              title="No installments found"
              message="Installments will be created automatically when you record a partial sale."
            />
          }
        />
      )}
    </div>
  );
};

export default InstallmentsPage;

import React from 'react';
import { useLedger } from '../hooks/useLedger';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge
} from '../components';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import type { LedgerEntry } from '../models/paybuddy';

const LedgerPage: React.FC = () => {
  const { entries, loading, error } = useLedger();

  if (loading) return <LoadingState />;

  const columns = [
    {
      header: 'Date & Time',
      accessor: (entry: LedgerEntry) => formatDateTime(entry.createdAt),
    },
    {
      header: 'Customer',
      accessor: (entry: LedgerEntry) => (
        <div className="font-medium text-gray-900">{entry.customerName}</div>
      ),
    },
    {
      header: 'Item',
      accessor: 'itemName' as keyof LedgerEntry,
    },
    {
      header: 'Type',
      accessor: (entry: LedgerEntry) => <StatusBadge status={entry.type} />,
    },
    {
      header: 'Amount',
      accessor: (entry: LedgerEntry) => (
        <span className={`font-bold ${entry.type === 'sale' ? 'text-red-600' : 'text-green-600'}`}>
          {entry.type === 'sale' ? '-' : '+'}{formatCurrency(entry.amount)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Balance After',
      accessor: (entry: LedgerEntry) => (
        <span className="font-bold text-gray-900">
          {formatCurrency(entry.balanceAfter)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Sale ID',
      accessor: (entry: LedgerEntry) => (
        <span className="font-mono text-xs text-gray-500">
          {entry.saleId || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Business Ledger"
        subtitle="Chronological log of all transactions and balance changes"
        showBack
        backPath="/dashboard"
      />

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
          <p className="text-sm text-red-700">Error loading ledger: {error.message}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={entries}
          keyExtractor={(e) => e.entryId}
          emptyState={
            <EmptyState
              title="Ledger is empty"
              message="No transactions have been recorded yet."
            />
          }
        />
      )}
    </div>
  );
};

export default LedgerPage;

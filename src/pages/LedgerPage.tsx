import React from 'react';
import { useLedger } from '../hooks/useLedger';
import {
  PageHeader,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge,
  Card
} from '../components';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import type { LedgerEntry } from '../models/paybuddy';

const LedgerPage: React.FC = () => {
  const { entries, loading, error } = useLedger();

  if (loading) return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <LoadingState />
    </div>
  );

  const columns = [
    {
      header: 'Date & Time',
      accessor: (entry: LedgerEntry) => (
        <div className="flex flex-col">
          <span className="font-bold text-app-text-primary">{formatDateTime(entry.createdAt).split(',')[0]}</span>
          <span className="text-[10px] font-bold text-app-text-secondary uppercase tracking-widest mt-0.5">
            {formatDateTime(entry.createdAt).split(',')[1]}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: (entry: LedgerEntry) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs text-brand-primary font-bold border border-brand-primary/20">
            {entry.customerName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-app-text-primary">{entry.customerName}</span>
        </div>
      ),
    },
    {
      header: 'Details',
      accessor: (entry: LedgerEntry) => (
        <span className="font-medium text-app-text-secondary">{entry.itemName || 'Account Payment'}</span>
      ),
    },
    {
      header: 'Type',
      accessor: (entry: LedgerEntry) => <StatusBadge status={entry.type} />,
    },
    {
      header: 'Amount',
      accessor: (entry: LedgerEntry) => (
        <span className={`font-black ${entry.type === 'sale' ? 'text-brand-error' : 'text-brand-success'}`}>
          {entry.type === 'sale' ? '-' : '+'}{formatCurrency(entry.amount)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Balance After',
      accessor: (entry: LedgerEntry) => (
        <span className="font-black text-app-text-primary bg-app-card px-3 py-1.5 rounded-xl border border-app-border">
          {formatCurrency(entry.balanceAfter)}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Reference',
      accessor: (entry: LedgerEntry) => (
        <span className="font-mono text-[10px] font-bold text-app-text-secondary uppercase tracking-tighter">
          {entry.saleId ? `SALE: ${entry.saleId.slice(-6)}` : '-'}
        </span>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Business Ledger"
          subtitle="Chronological log of all transactions and balance changes"
          showBack
          backPath="/dashboard"
        />

        {error ? (
          <Card className="bg-brand-error/10 border-brand-error/20 p-4">
            <p className="text-sm text-brand-error font-bold">Error loading ledger: {error.message}</p>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            keyExtractor={(e) => e.entryId}
            emptyState={
              <EmptyState
                title="Ledger is empty"
                message="No transactions have been recorded yet."
                icon={
                  <svg className="w-10 h-10 text-app-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
            }
          />
        )}
      </div>
    </div>
  );
};

export default LedgerPage;

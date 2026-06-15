import React from 'react';

type StatusType = 'PENDING' | 'COMPLETED' | 'PAID' | 'OVERDUE' | 'sale' | 'payment' | 'ARCHIVED';

interface StatusBadgeProps {
  status: StatusType | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      case 'PAID':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'PENDING':
        return 'bg-brand-warning/10 text-brand-warning border-brand-warning/20';
      case 'OVERDUE':
        return 'bg-brand-error/10 text-brand-error border-brand-error/20';
      case 'ARCHIVED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'SALE':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'PAYMENT':
        return 'bg-brand-success/10 text-brand-success border-brand-success/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

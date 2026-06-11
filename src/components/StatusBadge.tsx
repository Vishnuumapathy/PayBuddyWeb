import React from 'react';

type StatusType = 'PENDING' | 'COMPLETED' | 'PAID' | 'OVERDUE' | 'sale' | 'payment' | 'ARCHIVED';

interface StatusBadgeProps {
  status: StatusType | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PAID':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'OVERDUE':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'ARCHIVED':
        return 'bg-gray-50 text-gray-700 border-gray-100';
      case 'SALE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'PAYMENT':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(status)} tracking-wide`}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;

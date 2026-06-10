import React from 'react';

type StatusType = 'PENDING' | 'COMPLETED' | 'PAID' | 'OVERDUE' | 'sale' | 'payment' | 'ARCHIVED';

interface StatusBadgeProps {
  status: StatusType | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OVERDUE':
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SALE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAYMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;

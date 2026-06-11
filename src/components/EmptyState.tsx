import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-gray-200 text-center transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50/5">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-20 animate-pulse" />
        {icon ? (
          <div className="relative text-indigo-500 scale-125">{icon}</div>
        ) : (
          <div className="relative p-5 bg-indigo-50 rounded-2xl text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">{message}</p>
      {action && (
        <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

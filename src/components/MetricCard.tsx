import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-white p-6 rounded-2xl
      border border-gray-100 shadow-sm
      transition-all duration-300
      hover:scale-[1.02] hover:shadow-xl
      group flex flex-col justify-between h-full
      ${className}
    `}>
      {/* Background Gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] transition-colors duration-300 group-hover:text-gray-500">
              {title}
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight transition-transform duration-300 group-hover:translate-x-1">
              {value}
            </h3>
          </div>

          {icon && (
            <div className="
              p-3 rounded-xl
              bg-gray-50/80 backdrop-blur-sm
              group-hover:scale-110 group-hover:shadow-md
              transition-all duration-300
              flex items-center justify-center
            ">
              <div className="transition-transform duration-300 group-hover:rotate-3">
                {icon}
              </div>
            </div>
          )}
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`
              flex items-center px-2 py-0.5 rounded-full text-xs font-bold
              ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
            `}>
              {trend.isPositive ? (
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">vs last period</span>
          </div>
        )}
      </div>

      {/* Subtle bottom highlight that uses the text color (via current) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </div>
  );
};

export default MetricCard;

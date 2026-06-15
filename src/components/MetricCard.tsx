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
      bg-app-card p-6 rounded-2xl
      border border-app-border shadow-sm
      transition-all duration-300
      hover:scale-[1.02] hover:shadow-xl hover:border-brand-primary/30
      group flex flex-col justify-between h-full
      ${className}
    `}>
      {/* Background Gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-app-text-secondary uppercase tracking-[0.15em] transition-colors duration-300 group-hover:text-app-text-primary">
              {title}
            </p>
            <h3 className="text-3xl font-extrabold text-app-text-primary tracking-tight transition-transform duration-300 group-hover:translate-x-1">
              {value}
            </h3>
          </div>

          {icon && (
            <div className="
              p-3 rounded-xl
              bg-app-bg/80 backdrop-blur-sm
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
              ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}
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
            <span className="text-[10px] text-app-text-secondary font-bold uppercase tracking-wider">vs last period</span>
          </div>
        )}
      </div>

      {/* Subtle bottom highlight that uses the text color (via current) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
    </div>
  );
};

export default MetricCard;

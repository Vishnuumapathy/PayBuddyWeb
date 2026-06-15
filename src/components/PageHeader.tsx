import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  backPath?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBack = false,
  backPath = "/dashboard"
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(backPath);
    }
  };

  return (
    <div className="flex items-start justify-between mb-8 gap-4 px-1">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 bg-app-card rounded-xl transition-all duration-200 active:scale-95 border border-app-border shrink-0"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-app-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <h1 className="text-3xl font-extrabold text-app-text-primary tracking-tight truncate">{title}</h1>
        </div>
        {subtitle && <p className="text-app-text-secondary mt-1 text-sm font-medium truncate">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

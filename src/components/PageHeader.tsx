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
    // If browser history length is > 2, it means there's a previous page in our app
    // (length 1 is the initial page, length 2 is the current page)
    // However, window.history.length isn't always reliable for "previous page belongs to app"
    // But for this requirement, we'll use the suggested logic.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(backPath);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;

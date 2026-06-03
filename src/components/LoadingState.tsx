import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-500 font-medium">Loading data...</p>
    </div>
  );
};

export default LoadingState;

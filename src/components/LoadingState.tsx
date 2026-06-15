import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center">
        <div className="text-4xl font-black text-brand-primary tracking-tighter animate-pulse drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          PayBuddy
        </div>
        <div className="mt-4 flex gap-1.5">
          <div className="w-1 h-1 bg-brand-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 bg-brand-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 bg-brand-primary/60 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;

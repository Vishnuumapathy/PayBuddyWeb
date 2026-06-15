import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-app-card
        rounded-2xl
        border border-app-border
        shadow-sm
        transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-brand-primary/30' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

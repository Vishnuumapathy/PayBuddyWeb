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
        bg-white
        rounded-2xl
        border border-gray-100
        shadow-sm
        transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-gray-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

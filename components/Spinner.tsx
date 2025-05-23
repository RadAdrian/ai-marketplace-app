import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-5 w-5 border-b-2 border-t-2',
    large: 'h-8 w-8 border-b-3 border-t-3'
  };
  return (
    <div 
        className={`animate-spin rounded-full border-neutral-100 ${sizeClasses[size]} ${className}`}
    ></div>
  );
};

export default Spinner;
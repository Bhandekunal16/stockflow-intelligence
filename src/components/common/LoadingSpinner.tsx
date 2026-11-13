import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading portfolio data...',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-[var(--text-secondary)] ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-[var(--accent-primary)] mb-2`} aria-hidden="true" />
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
    </div>
  );
};

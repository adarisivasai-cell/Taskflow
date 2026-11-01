import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand-600 dark:text-brand-400`} />
      {label && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;

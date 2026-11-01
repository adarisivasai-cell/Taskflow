import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

const PriorityBadge = ({ priority, size = 'sm' }) => {
  const configs = {
    Urgent: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
      icon: AlertTriangle,
    },
    Critical: {
      bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
      icon: AlertCircle,
    },
    High: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
      icon: ArrowUp,
    },
    Medium: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
      icon: null,
    },
    Low: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      icon: ArrowDown,
    },
  };

  const current = configs[priority] || configs.Medium;
  const Icon = current.icon;
  const sizeClass = size === 'xs' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${current.bg} ${sizeClass}`}
    >
      {Icon && <Icon className="w-3 h-3 stroke-[2.5]" />}
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;

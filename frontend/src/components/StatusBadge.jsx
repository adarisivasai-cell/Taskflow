import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const configs = {
    // Task & Project Common
    Completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    // Project Statuses
    Planning: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
      dot: 'bg-sky-500',
    },
    Active: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      dot: 'bg-indigo-500',
    },
    'On Hold': {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    // Task Statuses
    'To Do': {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    'In Progress': {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      dot: 'bg-blue-500',
    },
    Review: {
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      dot: 'bg-purple-500',
    },
  };

  const style = configs[status] || {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  };

  const sizeClass = size === 'xs' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style.bg} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

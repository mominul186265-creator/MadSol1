import React from 'react';

export const Skeleton: React.FC<{ className?: string; id?: string }> = ({ className = '', id }) => {
  return (
    <div
      id={id}
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-lg ${className}`}
    />
  );
};

export const CardSkeleton: React.FC<{ id?: string }> = ({ id }) => {
  return (
    <div id={id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
};

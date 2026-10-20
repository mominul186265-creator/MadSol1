import React from 'react';
import { Sparkles } from 'lucide-react';
import { IslamicPattern } from './IslamicPattern';

export interface EmptyStateProps {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <IslamicPattern opacity={0.03} />
      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
          {icon || <Sparkles className="w-7 h-7" />}
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
};

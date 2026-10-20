import React from 'react';

export interface BadgeProps {
  id?: string;
  children: React.ReactNode;
  variant?: 'emerald' | 'navy' | 'gold' | 'sky' | 'rose' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  hasDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  children,
  variant = 'emerald',
  size = 'md',
  hasDot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  const variantClasses = {
    emerald:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
    navy:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
    gold:
      'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
    sky:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80',
    rose:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80',
    slate:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    purple:
      'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80',
  };

  const dotColor = {
    emerald: 'bg-emerald-500',
    navy: 'bg-slate-600',
    gold: 'bg-amber-500',
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    purple: 'bg-purple-500',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-full border leading-none tracking-normal select-none ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className}`}
    >
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[variant]}`} />}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};

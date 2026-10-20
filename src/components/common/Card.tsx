import React from 'react';

export interface CardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  accent?: 'none' | 'emerald' | 'gold' | 'navy';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  id,
  children,
  className = '',
  accent = 'none',
  onClick,
}) => {
  const accentClasses = {
    none: '',
    emerald: 'border-t-2 border-t-emerald-600 dark:border-t-emerald-500',
    gold: 'border-t-2 border-t-amber-500 dark:border-t-amber-400',
    navy: 'border-t-2 border-t-slate-800 dark:border-t-slate-600',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition-shadow duration-200 ${
        accentClasses[accent]
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', action }) => {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 ${className}`}>
      <div className="flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <p className={`text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

import React from 'react';

export interface MadSolLogoProps {
  id?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showIcon?: boolean;
  isDark?: boolean;
  className?: string;
  iconClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const MadSolLogo: React.FC<MadSolLogoProps> = ({
  id = 'madsol-logo',
  size = 'md',
  showTagline = true,
  showIcon = true,
  className = '',
  iconClassName = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}
    >
      {/* Modern geometric octagon badge with emerald & gold */}
      {showIcon && (
        <div
          className={`relative ${iconSizes[size]} shrink-0 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-950 flex items-center justify-center shadow-sm border border-emerald-600/30 overflow-hidden ${iconClassName}`}
        >
          {/* Subtle geometric star overlay */}
          <svg
            className="w-full h-full p-1.5 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Islamic inspired architectural arch / book / star geometry */}
            <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M12 7V17" stroke="currentColor" strokeWidth="2" />
            <path d="M7 12H17" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="2.5" fill="#f59e0b" stroke="none" />
          </svg>
        </div>
      )}

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${titleSizes[size]}`}>
            Mad<span className="text-emerald-700 dark:text-emerald-400">Sol</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            SaaS
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            আধুনিক মাদ্রাসার স্মার্ট ব্যবস্থাপনা
          </span>
        )}
      </div>
    </div>
  );
};

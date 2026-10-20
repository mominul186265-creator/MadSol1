import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface ErrorStateProps {
  id?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  id,
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div
      id={id}
      className={`rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 sm:p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title || t.messages.somethingWentWrong}
      </h4>
      {message && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {message}
        </p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button
            id={id ? `${id}-retry-btn` : 'error-retry-btn'}
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            {t.buttons.refresh}
          </Button>
        </div>
      )}
    </div>
  );
};

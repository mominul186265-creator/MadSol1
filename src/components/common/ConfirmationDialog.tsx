import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ConfirmationDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  id,
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
}) => {
  const { t } = useLanguage();

  return (
    <Modal id={id} isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            isDestructive
              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400'
          }`}
        >
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full mt-6">
          <Button
            id={id ? `${id}-cancel-btn` : 'confirm-cancel-btn'}
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            {cancelText || t.buttons.cancel}
          </Button>
          <Button
            id={id ? `${id}-confirm-btn` : 'confirm-action-btn'}
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            fullWidth
          >
            {confirmText || t.buttons.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

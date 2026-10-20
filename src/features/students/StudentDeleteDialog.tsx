import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DbStudent } from '../../types/step2';
import { Button } from '../../components/common/Button';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';

interface StudentDeleteDialogProps {
  isOpen: boolean;
  student: DbStudent | null;
  onClose: () => void;
  onConfirm: (studentId: string) => Promise<void>;
}

export const StudentDeleteDialog: React.FC<StudentDeleteDialogProps> = ({
  isOpen,
  student,
  onClose,
  onConfirm,
}) => {
  const { language } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(student.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি।');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="student-delete-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        id="student-delete-dialog"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                {language === 'bn' ? 'শিক্ষার্থী মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Student Deletion'}
              </h3>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'bn'
                ? 'সতর্কতা: এটি একটি সফট ডিলিট অপারেশন। শিক্ষার্থীর তথ্য আর্কাইভ হবে।'
                : 'Warning: This is a soft delete operation. The student data will be archived.'}
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'শিক্ষার্থীর নাম:' : 'Student Name:'}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {language === 'bn' ? student.full_name_bn : student.full_name_en}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'শিক্ষার্থী আইডি:' : 'Student ID:'}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {student.student_id}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'ক্লাস রোল:' : 'Class Roll:'}
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {student.roll_number}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs font-semibold"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? (language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

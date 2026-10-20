import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DbTeacher, TeacherStatus } from '../../types/step3';
import { useTeachers } from './useTeachers';

interface TeacherStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: DbTeacher;
  onStatusUpdated: (updatedTeacher: DbTeacher) => void;
}

export const TeacherStatusModal: React.FC<TeacherStatusModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onStatusUpdated,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { changeStatus } = useTeachers();

  const [selectedStatus, setSelectedStatus] = useState<TeacherStatus>(teacher.employment_status);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await changeStatus(teacher.id, selectedStatus, reason.trim() || undefined);
      if (updated) {
        showToast(
          language === 'bn'
            ? 'শিক্ষকের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে'
            : 'Teacher status updated successfully',
          'success'
        );
        onStatusUpdated(updated);
        onClose();
      }
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: TeacherStatus; label: string; desc: string; color: string }[] = [
    {
      value: 'active',
      label: t.teachers.status.active,
      desc: 'শিক্ষক ক্লাসে পাঠদান করছেন ও নিয়মিত কর্মরত',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      value: 'pending',
      label: t.teachers.status.pending,
      desc: 'নিবন্ধন সম্পন্ন, নিয়োগপত্র যাচাই বা অনুমোদনের অপেক্ষায়',
      color: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      value: 'on_leave',
      label: t.teachers.status.on_leave,
      desc: 'হজ, অসুস্থতা বা পারিবারিক প্রয়োজনে সাময়িক ছুটিতে',
      color: 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
    },
    {
      value: 'inactive',
      label: t.teachers.status.inactive,
      desc: 'চাকরি সাময়িকভাবে নিষ্ক্রিয় অবস্থায় রয়েছে',
      color: 'text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      value: 'resigned',
      label: t.teachers.status.resigned,
      desc: 'শিক্ষক পদত্যাগ করেছেন এবং অব্যাহতি পেয়েছেন',
      color: 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
    },
    {
      value: 'terminated',
      label: t.teachers.status.terminated,
      desc: 'কর্তৃপক্ষ কর্তৃক চুক্তি বাতিল বা বরখাস্তকৃত',
      color: 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
    },
    {
      value: 'suspended',
      label: t.teachers.status.suspended,
      desc: 'তদন্ত বা শৃঙ্খলামূলক কারণে সাময়িক স্থগিত',
      color: 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
    },
    {
      value: 'retired',
      label: t.teachers.status.retired,
      desc: 'সম্মানিত শিক্ষক স্বাভাবিক অবসর গ্রহণ করেছেন',
      color: 'text-teal-700 bg-teal-50 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.teachers.profile.statusChangeModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {teacher.full_name_bn} ({teacher.teacher_id})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.teachers.profile.newStatusLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedStatus === opt.value
                      ? `${opt.color} ring-2 ring-emerald-500 font-semibold shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{opt.label}</span>
                    {selectedStatus === opt.value && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] opacity-75 mt-0.5 line-clamp-2">{opt.desc}</span>
                  <input
                    type="radio"
                    name="teacherStatus"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={() => setSelectedStatus(opt.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.teachers.profile.reasonLabel}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="স্ট্যাটাস পরিবর্তনের সুনির্দিষ্ট কারণ বা প্রশাসনিক মন্তব্য লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
            />
          </div>

          {selectedStatus === 'terminated' && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                সতর্কতা: শিক্ষককে বরখাস্ত করলে তার সিস্টেম অ্যাকাউন্টের অ্যাক্সেস সাময়িকভাবে বন্ধ হতে পারে।
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'আপডেট হচ্ছে...' : t.teachers.profile.saveStatusBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

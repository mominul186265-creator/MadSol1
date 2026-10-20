import React, { useState } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { ExamType } from '../../types/academic';
import { useExam } from '../../context/ExamContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose }) => {
  const { createExam } = useExam();
  const { language } = useLanguage();
  const { institution } = useAuth();
  const isBn = language === 'bn';

  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [examType, setExamType] = useState<ExamType>('half_yearly');
  const [session, setSession] = useState('২০২৬ (১৪৪৭-১৪৪৮ হি.)');
  const [department, setDepartment] = useState('হিফজুল কুরআন');
  const [className, setClassName] = useState('হিফজ শেষ পর্ব');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-10');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn) return;

    setIsSubmitting(true);
    try {
      await createExam({
        institutionId: institution?.id || 'inst-001',
        nameBn,
        nameEn: nameEn || nameBn,
        examType,
        session,
        department,
        className,
        startDate,
        endDate,
        description,
        status: 'upcoming',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              {isBn ? 'নতুন পরীক্ষা তৈরি ও সময়সূচি নির্ধারণ' : 'Create New Examination'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'পরীক্ষার নাম (বাংলায়)' : 'Exam Name (Bangla)'} *
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: বার্ষিক সামষ্টিক পরীক্ষা ২০২৬"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পরীক্ষার ধরন' : 'Exam Type'}
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="half_yearly">অর্ধবার্ষিক (Half Yearly)</option>
                <option value="annual">বার্ষিক (Annual)</option>
                <option value="monthly">মাসিক টেস্ট (Monthly)</option>
                <option value="weekly">সাপ্তাহিক পরীক্ষা (Weekly)</option>
                <option value="hifz_test">হিফজ দাওর টেস্ট (Hifz Test)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শিক্ষাবর্ষ / সেশন' : 'Academic Session'}
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বিভাগ' : 'Department'}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
                <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা</option>
                <option value="ইবতেদায়ী">ইবতেদায়ী</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শ্রেণী / জামাত' : 'Class / Jamat'}
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শুরুর তারিখ' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'সমাপ্তির তারিখ' : 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'পরীক্ষার বিবরণ ও নির্দেশিকা' : 'Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="শিক্ষার্থীদের জন্য নির্দেশিকা বা বিবরণ..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'তৈরি হচ্ছে...' : 'Creating...') : (isBn ? 'পরীক্ষা তৈরি করুন' : 'Create Exam')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

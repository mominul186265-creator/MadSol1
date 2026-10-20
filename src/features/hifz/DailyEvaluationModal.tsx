import React, { useState } from 'react';
import { X, Award, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { HifzStudent, EvaluationCriterionRating } from '../../types/hifz';
import { useHifz } from '../../context/HifzContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface DailyEvaluationModalProps {
  student: HifzStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DailyEvaluationModal: React.FC<DailyEvaluationModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { recordDailyEvaluation } = useHifz();
  const isBn = language === 'bn';

  const [memorization, setMemorization] = useState<EvaluationCriterionRating>('excellent');
  const [sabak, setSabak] = useState<EvaluationCriterionRating>('excellent');
  const [sabki, setSabki] = useState<EvaluationCriterionRating>('very_good');
  const [manzil, setManzil] = useState<EvaluationCriterionRating>('excellent');
  const [revision, setRevision] = useState<EvaluationCriterionRating>('very_good');
  const [tajweed, setTajweed] = useState<EvaluationCriterionRating>('excellent');
  const [fluency, setFluency] = useState<EvaluationCriterionRating>('excellent');
  const [behavior, setBehavior] = useState<EvaluationCriterionRating>('excellent');
  const [attendance, setAttendance] = useState<'present' | 'absent' | 'leave' | 'late'>('present');
  const [overallStars, setOverallStars] = useState<number>(5);
  const [teacherComment, setTeacherComment] = useState<string>('মাশাআল্লাহ সুন্দর তিলাওয়াত ও নিয়মানুবর্তিতা।');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recordDailyEvaluation({
        institutionId: student.institutionId,
        studentId: student.studentId,
        studentNameBn: student.fullNameBn,
        teacherId: user?.id || student.assignedTeacherId,
        teacherName: user?.fullNameBn || student.assignedTeacherName,
        date: new Date().toISOString().split('T')[0],
        memorization,
        sabak,
        sabki,
        manzil,
        revision,
        tajweed,
        fluency,
        behavior,
        attendance,
        overallStars,
        teacherComment,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                {isBn ? 'দৈনিক পূর্ণাঙ্গ হিফজ মূল্যায়ন' : 'Comprehensive Daily Evaluation'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.fullNameBn} | {student.className} (রোল: {student.rollNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Sabak */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'নতুন সবক' : 'Daily Sabaq'}
              </label>
              <select
                value={sabak}
                onChange={(e) => setSabak(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">মুমতায (অনবদ্য)</option>
                <option value="very_good">জাইয়্যিদ জিদ্দান (উত্তম)</option>
                <option value="good">জাইয়্যিদ (ভালো)</option>
                <option value="needs_improvement">কাঁচা (উন্নতি দরকার)</option>
                <option value="weak">দুর্বল (পুনরায়)</option>
              </select>
            </div>

            {/* Sabki */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'সাত সবকী' : 'Sabki Revision'}
              </label>
              <select
                value={sabki}
                onChange={(e) => setSabki(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">মুমতায (অনবদ্য)</option>
                <option value="very_good">জাইয়্যিদ জিদ্দান (উত্তম)</option>
                <option value="good">জাইয়্যিদ (ভালো)</option>
                <option value="needs_improvement">কাঁচা (উন্নতি দরকার)</option>
                <option value="weak">দুর্বল (পুনরায়)</option>
              </select>
            </div>

            {/* Manzil */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'মনজিল / আমোখতা' : 'Manzil Memorization'}
              </label>
              <select
                value={manzil}
                onChange={(e) => setManzil(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">মুমতায (অনবদ্য)</option>
                <option value="very_good">জাইয়্যিদ জিদ্দান (উত্তম)</option>
                <option value="good">জাইয়্যিদ (ভালো)</option>
                <option value="needs_improvement">কাঁচা (উন্নতি দরকার)</option>
                <option value="weak">দুর্বল (পুনরায়)</option>
              </select>
            </div>

            {/* Tajweed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'তাজবীদ ও মাখরাজ' : 'Tajweed & Makhraj'}
              </label>
              <select
                value={tajweed}
                onChange={(e) => setTajweed(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">মুমতায (শুদ্ধ)</option>
                <option value="very_good">জাইয়্যিদ জিদ্দান</option>
                <option value="good">জাইয়্যিদ</option>
                <option value="needs_improvement">ভুল আছে</option>
                <option value="weak">দুর্বল</option>
              </select>
            </div>

            {/* Fluency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'তিলাওয়াতের সাবলীলতা' : 'Fluency & Flow'}
              </label>
              <select
                value={fluency}
                onChange={(e) => setFluency(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">খুব সাবলীল</option>
                <option value="very_good">সাবলীল</option>
                <option value="good">মোটামুটি</option>
                <option value="needs_improvement">আটকে যায়</option>
                <option value="weak">অতিরিক্ত খটকা</option>
              </select>
            </div>

            {/* Behavior & Attendance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আখলাক ও আচরণ' : 'Discipline & Conduct'}
              </label>
              <select
                value={behavior}
                onChange={(e) => setBehavior(e.target.value as EvaluationCriterionRating)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="excellent">চমৎকার ভদ্র</option>
                <option value="very_good">খুব ভালো</option>
                <option value="good">সন্তোষজনক</option>
                <option value="needs_improvement">মনোযোগ কম</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আজকের উপস্থিতি' : 'Attendance Status'}
              </label>
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="present">উপস্থিত (Present)</option>
                <option value="absent">অনুপস্থিত (Absent)</option>
                <option value="leave">ছুটি (Leave)</option>
                <option value="late">বিলম্বে (Late)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'সার্বিক স্টার রেটিং (১-৫)' : 'Overall Star Rating'}
              </label>
              <div className="flex items-center gap-1.5 pt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setOverallStars(s)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        s <= overallStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {overallStars} / ৫
                </span>
              </div>
            </div>
          </div>

          {overallStars <= 2 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                {isBn
                  ? 'সতর্কতা: ২ বা তার কম স্টার দিলে সিস্টেমে স্বয়ংক্রিয়ভাবে "Low Progress Alert" জারি হবে এবং অভিভাবককে জানানো যাবে।'
                  : 'Rating 2 stars or lower will trigger an automated low progress alert.'}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'উস্তাযের সার্বিক মন্তব্য' : 'Teacher Summary Remarks'}
            </label>
            <textarea
              rows={2}
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'মূল্যায়ন সংরক্ষণ করুন' : 'Save Evaluation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

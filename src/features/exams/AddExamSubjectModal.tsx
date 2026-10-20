import React, { useState } from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';

interface AddExamSubjectModalProps {
  examId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddExamSubjectModal: React.FC<AddExamSubjectModalProps> = ({
  examId,
  isOpen,
  onClose,
}) => {
  const { addSubjectToExam } = useExam();
  const { teachers } = useMadrasaData();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [subjectNameBn, setSubjectNameBn] = useState('');
  const [subjectCode, setSubjectCode] = useState('SUB-');
  const [fullMarks, setFullMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(40);
  const [examDate, setExamDate] = useState('2026-10-02');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [roomNumber, setRoomNumber] = useState('১০১');
  const [invigilatorTeacherName, setInvigilatorTeacherName] = useState('মাওলানা মুহাম্মদ আব্দুল্লাহ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectNameBn) return;

    setIsSubmitting(true);
    try {
      await addSubjectToExam(examId, {
        subjectNameBn,
        subjectNameEn: subjectNameBn,
        subjectCode,
        fullMarks,
        passMarks,
        examDate,
        startTime,
        endTime,
        roomNumber,
        invigilatorTeacherName,
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              {isBn ? 'পরীক্ষার বিষয় ও সময়সূচি যুক্ত করুন' : 'Add Subject & Schedule'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বিষয়ের নাম' : 'Subject Name'} *
              </label>
              <input
                type="text"
                value={subjectNameBn}
                onChange={(e) => setSubjectNameBn(e.target.value)}
                placeholder="যেমন: কুরআনুল কারীম ও তাজবীদ"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বিষয় কোড' : 'Subject Code'}
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পূর্ণ নম্বর' : 'Full Marks'} *
              </label>
              <input
                type="number"
                value={fullMarks}
                onChange={(e) => setFullMarks(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পাস নম্বর' : 'Pass Marks'} *
              </label>
              <input
                type="number"
                value={passMarks}
                onChange={(e) => setPassMarks(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পরীক্ষার তারিখ' : 'Date'}
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শুরু' : 'Start'}
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শেষ' : 'End'}
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'কক্ষ নম্বর' : 'Room'}
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'হল পরিদর্শক' : 'Invigilator'}
              </label>
              <select
                value={invigilatorTeacherName}
                onChange={(e) => setInvigilatorTeacherName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.fullNameBn}>
                    {t.fullNameBn}
                  </option>
                ))}
              </select>
            </div>
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
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'বিষয় যুক্ত করুন' : 'Add Subject')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

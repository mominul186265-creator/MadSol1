import React from 'react';
import { X, Printer, Award, CheckCircle2, XCircle } from 'lucide-react';
import { StudentResult } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_GRADE_SCALES } from '../../data/academicData';

interface DigitalMarksheetModalProps {
  result: StudentResult | null;
  examNameBn: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMarksheetModal: React.FC<DigitalMarksheetModalProps> = ({
  result,
  examNameBn,
  isOpen,
  onClose,
}) => {
  const { institution } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:max-h-none print:shadow-none print:border-none">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 dark:text-white">
              {isBn ? 'ডিজিটাল একাডেমিক মার্কশিট ও ফলাফল পত্র' : 'Academic Marksheet & Transcript'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Printer className="h-4 w-4" />
              <span>{isBn ? 'প্রিন্ট / ডাউনলোড' : 'Print / Download'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MARKSHEET CONTAINER (PRINTABLE AREA) */}
        <div className="p-8 sm:p-10 space-y-6 print:p-6 print:text-black">
          {/* Institution Official Header */}
          <div className="text-center border-b-2 border-emerald-600 pb-5">
            <div className="text-sm font-semibold tracking-widest text-emerald-800 dark:text-emerald-400 mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black">
              {institution?.nameBn || 'দারুল উলুম ইসলামিয়া মাদরাসা'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 print:text-slate-700">
              {institution?.addressBn || 'মিরপুর-১২, ঢাকা-১২১৬'} | ফোন: {institution?.phone || '০১৭xxxxxxxx'}
            </p>
            <div className="mt-3 inline-block rounded-full bg-emerald-50 px-5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 print:bg-slate-100 print:border-slate-300 print:text-black">
              {examNameBn || 'অর্ধবার্ষিক সামষ্টিক মূল্যায়ন পরীক্ষা ২০২৬'} — নম্বরপত্র (Marksheet)
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-slate-500 block">শিক্ষার্থীর নাম:</span>
              <strong className="text-sm text-slate-900 dark:text-white print:text-black">{result.studentNameBn}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">রোল নম্বর:</span>
              <strong className="text-sm text-slate-900 dark:text-white print:text-black">{result.studentRoll}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">শ্রেণী / জামাত:</span>
              <strong className="text-sm text-slate-900 dark:text-white print:text-black">{result.className}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">আইডি নম্বর:</span>
              <strong className="text-sm text-slate-900 dark:text-white print:text-black">{result.studentCode}</strong>
            </div>
          </div>

          {/* Subject-wise Marks Table */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700 print:border-slate-400">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 print:bg-slate-200 print:text-black">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center w-12">ক্র.</th>
                  <th className="py-2.5 px-4 border-r border-slate-300 dark:border-slate-700">বিষয়ের নাম</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center">পূর্ণ নম্বর</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center">পাস নম্বর</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center font-extrabold">প্রাপ্ত নম্বর</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center">লেটার গ্রেড</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-center">জিপিএ (GPA)</th>
                  <th className="py-2.5 px-3 text-center">ফলাফল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                {result.subjectResults.map((s, idx) => (
                  <tr key={s.subjectId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-4 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white print:text-black">
                      {s.subjectNameBn}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center">{s.fullMarks}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center">{s.passMarks}</td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-slate-900 dark:text-white print:text-black">
                      {s.isAbsent ? 'অনুপস্থিত' : s.obtainedMarks}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-bold text-emerald-600">
                      {s.grade}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-semibold">
                      {s.gpa.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        s.isPassed ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {s.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={2} className="py-3 px-4 border-r border-slate-300 text-right">সর্বমোট (Total):</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center">{result.totalFullMarks}</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center">-</td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    {result.totalMarksObtained}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    {result.grade}
                  </td>
                  <td className="py-3 px-3 border-r border-slate-300 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    {result.gpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      result.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {result.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-xs text-slate-500 block">মোট প্রাপ্ত শতকরা</span>
              <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300 print:text-black">
                {result.percentage}%
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">গ্রেড পয়েন্ট (GPA)</span>
              <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300 print:text-black">
                {result.gpa.toFixed(2)} / ৫.০০
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">সর্বোচ্চ লেটার গ্রেড</span>
              <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300 print:text-black">
                {result.grade}
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">মেধা স্থান (Merit Position)</span>
              <strong className="text-lg font-black text-amber-600 print:text-black">
                {result.position === 1 ? '🥇 ১ম স্থান' : result.position === 2 ? '🥈 ২য় স্থান' : result.position === 3 ? '🥉 ৩য় স্থান' : `${result.position}ম স্থান`}
              </strong>
            </div>
          </div>

          {/* Grading Scale Reference */}
          <div className="text-[11px] text-slate-500 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 print:border-slate-300">
            <strong className="text-slate-700 dark:text-slate-300 block mb-1">গ্রেডিং নির্দেশিকা:</strong>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {DEFAULT_GRADE_SCALES.map((scale) => (
                <span key={scale.grade}>
                  {scale.grade} ({scale.minMarks}-{scale.maxMarks}%) = GPA {scale.gpa.toFixed(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Official Signature Lines */}
          <div className="pt-10 grid grid-cols-3 gap-8 text-center text-xs text-slate-600 dark:text-slate-400 print:text-black">
            <div className="border-t border-slate-400 pt-2">
              <strong>প্রস্তুতকারীর স্বাক্ষর</strong>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <strong>পরীক্ষা নিয়ন্ত্রক</strong>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <strong>মুহতামিম / প্রধান শিক্ষক</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

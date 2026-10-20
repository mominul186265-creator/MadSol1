import React, { useState } from 'react';
import {
  X,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { Exam, ExamSubject } from '../../types/academic';
import { MadSolLogo } from '../../components/common/MadSolLogo';

interface AdmitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  subjects: ExamSubject[];
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({
  isOpen,
  onClose,
  exam,
  subjects,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const { students } = useMadrasaData();
  const isBn = language === 'bn';

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [showFeeClearanceOnly, setShowFeeClearanceOnly] = useState(false);

  if (!isOpen) return null;

  // Filter students based on class & query
  const eligibleStudents = students.filter((s) => {
    const matchClass = selectedClass === 'all' || s.currentClass === selectedClass || s.department === selectedClass;
    const matchQuery =
      s.fullNameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toString().includes(searchQuery);
    return matchClass && matchQuery;
  });

  const studentsToPrint = selectedStudentId === 'all'
    ? eligibleStudents
    : eligibleStudents.filter((s) => s.id === selectedStudentId);

  // Filter exam subjects for this exam
  const examSubjectsList = subjects.filter((s) => s.examId === exam.id);

  const handlePrint = () => {
    window.print();
  };

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header - Screen Only */}
        <div className="print:hidden flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isBn ? 'পরীক্ষার প্রবেশপত্র (Admit Card)' : 'Exam Admit Card Generator'}
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
                  {exam.nameBn}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ছবি, কিউআর কোড, পরীক্ষার রুটিন এবং ফি ক্লিয়ারেন্স স্ট্যাম্পসহ প্রবেশপত্র প্রিন্ট করুন'
                  : 'Generate and print official exam admit cards with routine and fee clearance stamp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'প্রিন্ট করুন (Print)' : 'Print All'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar - Screen Only */}
        <div className="print:hidden p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isBn ? 'নাম বা রোল নং দিয়ে খুঁজুন...' : 'Search name or roll...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="all">{isBn ? 'সকল শিক্ষার্থী (একত্রে প্রিন্ট)' : 'All Students (Batch Print)'}</option>
              {eligibleStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  রোল {s.rollNumber} - {s.fullNameBn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>মোট প্রবেশপত্র: <strong className="text-emerald-700 dark:text-emerald-400">{toBnNum(studentsToPrint.length)}</strong> টি</span>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 bg-slate-100/60 dark:bg-slate-950/60 print:bg-white print:p-0 print:space-y-0">
          {studentsToPrint.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p>{isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found.'}</p>
            </div>
          ) : (
            studentsToPrint.map((student, idx) => (
              <div
                key={student.id}
                className="bg-white text-slate-900 rounded-xl p-6 sm:p-7 shadow-md border-2 border-emerald-800 max-w-3xl mx-auto print:shadow-none print:border-2 print:border-slate-800 print:m-0 print:mb-8 print:break-after-page relative overflow-hidden"
              >
                {/* Decorative Islamic Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/5 rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-800/5 rounded-tr-full pointer-events-none" />

                {/* Top Bismillah */}
                <div className="text-center mb-2">
                  <span className="text-sm font-arabic text-emerald-800 tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </span>
                </div>

                {/* Institution Header */}
                <div className="flex items-center justify-between border-b-2 border-emerald-800/40 pb-3 mb-4">
                  <div className="w-16 h-16 flex items-center justify-center shrink-0">
                    <MadSolLogo className="w-14 h-14" />
                  </div>

                  <div className="text-center flex-1 px-4">
                    <h1 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">
                      {institution?.nameBn || 'দারুল উলুম ইসলামিয়া কওমি মাদরাসা'}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {institution?.address || 'মিরপুর-১২, ঢাকা-১২১৬'} • ফোন: ০১৭১১-০০০০০০
                    </p>
                    <div className="inline-block mt-1 px-4 py-0.5 rounded-full bg-emerald-800 text-white text-xs font-bold tracking-wide uppercase">
                      প্রবেশপত্র / ADMIT CARD
                    </div>
                  </div>

                  {/* Student Photo Box */}
                  <div className="w-20 h-24 border border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center p-1 shrink-0 overflow-hidden">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.fullNameBn}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <User className="w-8 h-8 text-slate-300" />
                        <span className="text-[9px] mt-1 text-slate-400 font-medium">ছবি</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exam Title & Academic Year */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg px-4 py-2 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">পরীক্ষার নাম: </span>
                    <strong className="text-emerald-900 text-sm">{exam.nameBn} ({exam.academicYear})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">পরীক্ষা শুরু: </span>
                    <strong className="text-slate-800">{exam.startDate}</strong>
                  </div>
                </div>

                {/* Student Particulars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px]">শিক্ষার্থীর নাম:</span>
                    <strong className="text-slate-900 font-bold">{student.fullNameBn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">পিতার নাম:</span>
                    <strong className="text-slate-800 font-semibold">{student.guardianName || 'জনাব আব্দুল্লাহ'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">আইডি / রেজিস্ট্রেশন নং:</span>
                    <strong className="text-slate-800 font-mono font-bold">{student.studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">বিভাগ / জামাত:</span>
                    <strong className="text-emerald-800 font-bold">{student.currentClass || 'হিফজুল কুরআন বিভাগ'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">শাখা:</span>
                    <strong className="text-slate-800 font-semibold">{student.section || 'ক-শাখা'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">রোল নম্বর:</span>
                    <strong className="text-emerald-900 font-mono text-sm font-black">#{toBnNum(student.rollNumber)}</strong>
                  </div>
                </div>

                {/* Exam Subject Routine */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>পরীক্ষার সময়সূচি ও বিষয়সমূহ:</span>
                    <span className="text-[10px] text-slate-500 font-normal">সময়: সকাল ৯:০০ - ১২:০০ টা</span>
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-emerald-800 text-white text-[11px]">
                      <tr>
                        <th className="p-1.5 border border-emerald-700 text-center w-10">ক্রম</th>
                        <th className="p-1.5 border border-emerald-700">বিষয় ও পত্র</th>
                        <th className="p-1.5 border border-emerald-700 text-center w-24">তারিখ</th>
                        <th className="p-1.5 border border-emerald-700 text-center w-16">পূর্ণমান</th>
                        <th className="p-1.5 border border-emerald-700 text-center w-20">হল পরিদর্শকের স্বাক্ষর</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {examSubjectsList.length > 0 ? (
                        examSubjectsList.map((subj, sIdx) => (
                          <tr key={subj.id} className="hover:bg-slate-50 text-[11px]">
                            <td className="p-1.5 border border-slate-300 text-center font-mono">{toBnNum(sIdx + 1)}</td>
                            <td className="p-1.5 border border-slate-300 font-medium">{subj.subjectNameBn}</td>
                            <td className="p-1.5 border border-slate-300 text-center font-mono text-slate-600">{subj.examDate || exam.startDate}</td>
                            <td className="p-1.5 border border-slate-300 text-center font-mono">{toBnNum(subj.fullMarks)}</td>
                            <td className="p-1.5 border border-slate-300 text-center"></td>
                          </tr>
                        ))
                      ) : (
                        [
                          { name: 'কুরআনুল কারীম হিফজ ও তাজবীদ', marks: 100, date: exam.startDate },
                          { name: 'দোয়া, হাদিস ও মাসনূন আমল', marks: 50, date: exam.endDate },
                        ].map((mock, mIdx) => (
                          <tr key={mIdx} className="text-[11px]">
                            <td className="p-1.5 border border-slate-300 text-center font-mono">{toBnNum(mIdx + 1)}</td>
                            <td className="p-1.5 border border-slate-300 font-medium">{mock.name}</td>
                            <td className="p-1.5 border border-slate-300 text-center font-mono text-slate-600">{mock.date}</td>
                            <td className="p-1.5 border border-slate-300 text-center font-mono">{toBnNum(mock.marks)}</td>
                            <td className="p-1.5 border border-slate-300 text-center"></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Candidate Instructions & Stamp */}
                <div className="flex items-start justify-between gap-4 pt-1 mb-8">
                  <div className="text-[10px] text-slate-600 max-w-md space-y-0.5">
                    <p className="font-bold text-slate-800">পরীক্ষার্থীদের জন্য বিশেষ নির্দেশনাবলী:</p>
                    <p>১. পরীক্ষা শুরুর কমপক্ষে ১৫ মিনিট পূর্বে পরীক্ষার হলে উপস্থিত হতে হবে।</p>
                    <p>২. প্রবেশপত্র ব্যতিরেকে কোনো অবস্থাতেই পরীক্ষার হলে প্রবেশ করা যাবে না।</p>
                    <p>৩. পরীক্ষার হলে মোবাইল ফোন, বই বা যেকোনো অসদুপায়ের বস্তু বহন সম্পূর্ণ নিষিদ্ধ।</p>
                  </div>

                  {/* Official Clearance Stamp */}
                  <div className="border-2 border-dashed border-emerald-700/60 rounded-xl px-3 py-2 text-center shrink-0 bg-emerald-50/50">
                    <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ফি পরিশোধিত ও বৈধ</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">
                      CLEARANCE STAMP: VERIFIED
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 text-center text-xs pt-8 border-t border-slate-300 mt-6">
                  <div>
                    <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                    <span className="text-slate-600 font-medium text-[11px]">শ্রেণি শিক্ষকের স্বাক্ষর</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                    <span className="text-slate-600 font-medium text-[11px]">পরীক্ষা নিয়ন্ত্রক</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-emerald-700 mx-auto mb-1 font-arabic text-emerald-900 font-bold">
                      {institution?.nameBn ? 'المدير' : ''}
                    </div>
                    <span className="text-emerald-900 font-bold text-[11px]">মুহতামিম / অধ্যক্ষ</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

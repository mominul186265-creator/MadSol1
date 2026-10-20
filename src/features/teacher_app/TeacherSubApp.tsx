import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Users,
  Award,
  Bell,
  Phone,
  Send,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  CalendarCheck,
  Check,
  MessageSquare,
  FileText,
  UserCheck,
  BookMarked,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb } from '../../lib/db';

interface TeacherSubAppProps {
  onBackToMain?: () => void;
  isDirectorViewing?: boolean;
}

export const TeacherSubApp: React.FC<TeacherSubAppProps> = ({
  onBackToMain,
  isDirectorViewing = false,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'routine' | 'attendance' | 'sabak' | 'students' | 'marks' | 'leave'>('routine');

  // Attendance state
  const [attendanceClass, setAttendanceClass] = useState('হিফজ ১ম বিভাগ');
  const [studentsAttendance, setStudentsAttendance] = useState([
    { id: 'std-1', roll: '০১', name: 'মুহাম্মদ সাআদ করিম', status: 'present', remarks: '' },
    { id: 'std-2', roll: '০২', name: 'মুহাম্মদ আব্দুল্লাহ বিন ওমর', status: 'present', remarks: '' },
    { id: 'std-3', roll: '০৩', name: 'মুহাম্মদ হামজা হক', status: 'late', remarks: '১৫ মিনিট দেরি' },
    { id: 'std-4', roll: '০৪', name: 'মুহাম্মদ যুবায়ের করিম', status: 'present', remarks: '' },
    { id: 'std-5', roll: '০৫', name: 'মুহাম্মদ হাসান মাহমুদ', status: 'absent', remarks: 'জ্বর' },
    { id: 'std-6', roll: '০৬', name: 'মুহাম্মদ সালমান ফারসি', status: 'present', remarks: '' },
    { id: 'std-7', roll: '০৭', name: 'মুহাম্মদ তামিম আনসারী', status: 'present', remarks: '' },
  ]);
  const [smsGuardianOnAbsent, setSmsGuardianOnAbsent] = useState(true);

  // Sabak entry state
  const [selectedStudentForSabak, setSelectedStudentForSabak] = useState('মুহাম্মদ সাআদ করিম');
  const [sabakPara, setSabakPara] = useState('১৫');
  const [sabakPage, setSabakPage] = useState('২৪');
  const [sabakAyah, setSabakAyah] = useState('১-১৫');
  const [amokhtaPara, setAmokhtaPara] = useState('১২-১৪ পারা');
  const [sabakQuality, setSabakQuality] = useState<'excellent' | 'good' | 'average' | 'needs_practice'>('excellent');
  const [teacherRemark, setTeacherRemark] = useState('মাশাআল্লাহ সুন্দর তিলাওয়াত হয়েছে। মাখরাজ স্পষ্ট।');

  // Leave application state
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState('1');
  const [leaveDate, setLeaveDate] = useState('2026-09-20');

  // Marks state
  const [examName, setExamName] = useState('প্রথম সাময়িক পরীক্ষা ২০২৬');
  const [examSubject, setExamSubject] = useState('হিফজ ও তাজবীদ');
  const [marksData, setMarksData] = useState([
    { id: 'std-1', roll: '০১', name: 'মুহাম্মদ সাআদ করিম', marks: '৯৫', grade: 'A+' },
    { id: 'std-2', roll: '০২', name: 'মুহাম্মদ আব্দুল্লাহ বিন ওমর', marks: '৮৮', grade: 'A+' },
    { id: 'std-3', roll: '০৩', name: 'মুহাম্মদ হামজা হক', marks: '৭৫', grade: 'A' },
    { id: 'std-4', roll: '০৪', name: 'মুহাম্মদ যুবায়ের করিম', marks: '৯২', grade: 'A+' },
    { id: 'std-5', roll: '০৫', name: 'মুহাম্মদ হাসান মাহমুদ', marks: '৮২', grade: 'A' },
  ]);

  const handleMarkAllPresent = () => {
    setStudentsAttendance(prev => prev.map(s => ({ ...s, status: 'present' })));
    showToast('সকল শিক্ষার্থীকে উপস্থিত হিসেবে মার্ক করা হয়েছে', 'success');
  };

  const handleSaveAttendance = () => {
    const absentCount = studentsAttendance.filter(s => s.status === 'absent').length;
    showToast(
      `হাজিরা সফলভাবে সংরক্ষিত হয়েছে! ${absentCount > 0 && smsGuardianOnAbsent ? `(${absentCount} জন অনুপস্থিত অভিভাবককে অটো এসএমএস পাঠানো হয়েছে)` : ''}`,
      'success'
    );
  };

  const handleSaveSabak = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`${selectedStudentForSabak}-এর সবক ডায়েরি সংরক্ষিত হয়েছে ও অভিভাবকের অ্যাপে পৌঁছে গেছে`, 'success');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      showToast('ছুটির কারণ উল্লেখ করুন', 'error');
      return;
    }
    showToast('মোহতামিম সাহেবের বরাবরে ছুটির আবেদন পাঠানো হয়েছে!', 'success');
    setLeaveReason('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* 👑 If Director is previewing the Teacher App */}
      {isDirectorViewing && (
        <div className="p-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <p className="text-xs font-bold leading-tight">
                আপনি মোহতামিম/পরিচালক হিসেবে "সহকারী শিক্ষক অ্যাপ" ব্রাউজ করছেন
              </p>
              <p className="text-[11px] text-emerald-100">
                সহকারী শিক্ষকগণ লগইন করলে সরাসরি এই ডেডিকেটেড ইন্টারফেসটি পাবেন।
              </p>
            </div>
          </div>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="shrink-0 px-3 py-1.5 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মোহতামিম প্যানেলে ফিরুন</span>
            </button>
          )}
        </div>
      )}

      {/* 📱 Teacher App Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-emerald-100 dark:border-emerald-950/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20 shrink-0">
              উ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  📱 সহকারী শিক্ষক অ্যাপ (Teacher Portal)
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  আইডি: TCH-104
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                হাফেজ ক্বারী ওমর ফারুক
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                শাখা: হিফজুল কুরআন বিভাগ • দায়িত্ব: হিফজ ১ম বিভাগ শ্রেণি শিক্ষক
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900 text-right">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">আজকের স্ট্যাটাস</span>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                উপস্থিত (সকাল ৬:৫০)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tabs Menu */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'routine', label: 'রুটিন ও ক্লাস', icon: Clock },
            { id: 'attendance', label: 'হাজিরা খাতা', icon: CalendarCheck },
            { id: 'sabak', label: 'সবক ডায়েরি', icon: BookOpen },
            { id: 'students', label: 'আমার ছাত্র', icon: Users },
            { id: 'marks', label: 'নম্বর এন্ট্রি', icon: Award },
            { id: 'leave', label: 'ছুটি ও নোটিশ', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span className="text-[11px] leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: ROUTINE & CLASSES ================= */}
      {activeTab === 'routine' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  আজকের ক্লাসের সময়সূচী ও রুটিন
                </h2>
                <p className="text-xs text-slate-500">আপনার আজকের দায়িত্বপ্রাপ্ত পিরিয়ড ও ক্লাসসমূহ</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-900">
                মোট ক্লাস: ৪টি
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  period: '১ম পিরিয়ড',
                  time: 'সকাল ৭:০০ - ৮:৩০',
                  subject: 'হিফজ সবক (নতুন পড়া গ্রহণ)',
                  className: 'হিফজ ১ম বিভাগ • কক্ষ ১০১',
                  students: '২৫ জন',
                  status: 'চলমান',
                  current: true,
                },
                {
                  period: '২য় পিরিয়ড',
                  time: 'সকাল ৯:০০ - ১০:০০',
                  subject: 'মাখরাজ ও সহীহ তাজবীদ প্রশিক্ষণ',
                  className: 'নূরানী ৩য় বর্ষ • কক্ষ ১০৩',
                  students: '৩২ জন',
                  status: 'আসন্ন',
                  current: false,
                },
                {
                  period: '৩য় পিরিয়ড',
                  time: 'সকাল ১০:১৫ - ১১:১৫',
                  subject: 'সবকী ও আমোখতা (পেছনের পড়া রিভিশন)',
                  className: 'হিফজ ১ম বিভাগ • কক্ষ ১০১',
                  students: '২৫ জন',
                  status: 'আসন্ন',
                  current: false,
                },
                {
                  period: '৪র্থ পিরিয়ড',
                  time: 'বাদ জোহর ২:০০ - ৩:০০',
                  subject: 'হিফজ শোনানো ও দৈনিক মূল্যায়ন',
                  className: 'হিফজ ১ম বিভাগ • কক্ষ ১০১',
                  students: '২৫ জন',
                  status: 'আসন্ন',
                  current: false,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.current
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.current ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.period.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.subject}</span>
                        {item.current && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-md font-bold animate-pulse">
                            বর্তমান ক্লাস
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.className} • ছাত্র: {item.students}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time}
                    </span>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                    >
                      হাজিরা নিন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE MARKING ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  দৈনিক ক্লাসের দ্রুত হাজিরা গ্রহণ
                </h2>
                <p className="text-xs text-slate-500">তারিখ: ১৮ সেপ্টেম্বর ২০২৬ • শ্রেণি: {attendanceClass}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  সবাই উপস্থিত
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  হাজিরা সংরক্ষণ করুন
                </button>
              </div>
            </div>

            {/* Notification toggle */}
            <div className="mt-3 p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-amber-900 dark:text-amber-300 font-medium">
                অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের মোবাইলে তাৎক্ষণিক এসএমএস পাঠাবে
              </span>
              <input
                type="checkbox"
                checked={smsGuardianOnAbsent}
                onChange={(e) => setSmsGuardianOnAbsent(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Students list for attendance */}
            <div className="mt-4 space-y-2">
              {studentsAttendance.map((std) => (
                <div
                  key={std.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {std.roll}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{std.name}</h4>
                      {std.remarks && <p className="text-[11px] text-amber-600 dark:text-amber-400">{std.remarks}</p>}
                    </div>
                  </div>

                  {/* Present / Absent / Late radio tabs */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() =>
                        setStudentsAttendance(prev =>
                          prev.map(s => (s.id === std.id ? { ...s, status: 'present' } : s))
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        std.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      উপস্থিত
                    </button>

                    <button
                      onClick={() =>
                        setStudentsAttendance(prev =>
                          prev.map(s => (s.id === std.id ? { ...s, status: 'late' } : s))
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        std.status === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      দেরি
                    </button>

                    <button
                      onClick={() =>
                        setStudentsAttendance(prev =>
                          prev.map(s => (s.id === std.id ? { ...s, status: 'absent' } : s))
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        std.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      অনুপস্থিত
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SABAK DIARY ================= */}
      {activeTab === 'sabak' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              হিফজ ও ক্লাসের দৈনিক সবক মূল্যায়ন ডায়েরি
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              ছাত্রের আজকের নতুন সবক, সবকী ও আমোখতার মান লিপিবদ্ধ করুন (অভিভাবক সরাসরি দেখতে পাবেন)
            </p>

            <form onSubmit={handleSaveSabak} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শিক্ষার্থী নির্বাচন করুন
                  </label>
                  <select
                    value={selectedStudentForSabak}
                    onChange={(e) => setSelectedStudentForSabak(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  >
                    <option value="মুহাম্মদ সাআদ করিম">মুহাম্মদ সাআদ করিম (রোল: ০১)</option>
                    <option value="মুহাম্মদ আব্দুল্লাহ বিন ওমর">মুহাম্মদ আব্দুল্লাহ বিন ওমর (রোল: ০২)</option>
                    <option value="মুহাম্মদ হামজা হক">মুহাম্মদ হামজা হক (রোল: ০৩)</option>
                    <option value="মুহাম্মদ যুবায়ের করিম">মুহাম্মদ যুবায়ের করিম (রোল: ০৪)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    সবকের মান / তিলাওয়াত কোয়ালিটি
                  </label>
                  <select
                    value={sabakQuality}
                    onChange={(e) => setSabakQuality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  >
                    <option value="excellent">চমৎকার (Excellent - কোনো ভুল নেই)</option>
                    <option value="good">ভালো (Good - সামান্য আটকিয়েছে)</option>
                    <option value="average">মোটামুটি (Average)</option>
                    <option value="needs_practice">পুনরাবৃত্তি প্রয়োজন (Needs Practice)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    নতুন সবক পারা
                  </label>
                  <input
                    type="text"
                    value={sabakPara}
                    onChange={(e) => setSabakPara(e.target.value)}
                    placeholder="পারা ১৫"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পৃষ্ঠা নম্বর
                  </label>
                  <input
                    type="text"
                    value={sabakPage}
                    onChange={(e) => setSabakPage(e.target.value)}
                    placeholder="পৃষ্ঠা ২৪"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    সবকী / আমোখতা
                  </label>
                  <input
                    type="text"
                    value={amokhtaPara}
                    onChange={(e) => setAmokhtaPara(e.target.value)}
                    placeholder="১২-১৪ পারা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  উস্তাযের মন্তব্য ও নসিহত (অভিভাবক সরাসরি পড়বে)
                </label>
                <textarea
                  rows={2}
                  value={teacherRemark}
                  onChange={(e) => setTeacherRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-emerald-500"
                  placeholder="ছাত্রের পড়ালেখা সম্পর্কে উৎসাহমূলক মন্তব্য লিখুন..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  সবক ডায়েরি সংরক্ষণ ও অভিভাবককে প্রেরণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MY STUDENTS ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-emerald-600" />
              আমার ক্লাসের শিক্ষার্থী ও অভিভাবক তালিকা
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              হিফজ ১ম বিভাগ • জরুরি প্রয়োজনে অভিভাবককে সরাসরি কল বা মেসেজ করুন
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { roll: '০১', name: 'মুহাম্মদ সাআদ করিম', guardian: 'আলহাজ্ব মোঃ জাহিদুল করিম', phone: '01766666666', hifz: '১৪ পারা সম্পন্ন', attendance: '৯৬%' },
                { roll: '০২', name: 'মুহাম্মদ আব্দুল্লাহ বিন ওমর', guardian: 'মাওলানা ওমর ফারুক', phone: '01712345678', hifz: '১২ পারা সম্পন্ন', attendance: '৯৮%' },
                { roll: '০৩', name: 'মুহাম্মদ হামজা হক', guardian: 'ড. এনামুল হক', phone: '01919876543', hifz: '৮ পারা সম্পন্ন', attendance: '৯১%' },
                { roll: '০৪', name: 'মুহাম্মদ যুবায়ের করিম', guardian: 'আলহাজ্ব মোঃ জাহিদুল করিম', phone: '01766666666', hifz: '১০ পারা সম্পন্ন', attendance: '৯৪%' },
              ].map((std) => (
                <div key={std.roll} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {std.roll}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{std.name}</h4>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{std.hifz} • হাজিরা {std.attendance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">অভিভাবক:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{std.guardian}</span>
                    </div>
                    <a
                      href={`tel:${std.phone}`}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {std.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: MARKS ENTRY ================= */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  পরীক্ষার নম্বর এন্ট্রি
                </h2>
                <p className="text-xs text-slate-500">পরীক্ষা ও বিষয়ের প্রাপ্ত নম্বর ইনপুট করুন</p>
              </div>

              <button
                onClick={() => showToast('সকল শিক্ষার্থীর নম্বর সফলভাবে সংরক্ষিত ও মোহতামিম কর্তৃক অনুমোদনের জন্য জমা দেওয়া হয়েছে!', 'success')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                নম্বর সংরক্ষণ করুন
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">পরীক্ষা</label>
                <select
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <option>প্রথম সাময়িক পরীক্ষা ২০২৬</option>
                  <option>অর্ধবার্ষিক পরীক্ষা ২০২৬</option>
                  <option>বার্ষিক পরীক্ষা ২০২৬</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">বিষয়</label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <option>হিফজ ও তাজবীদ</option>
                  <option>হিফজুল কুরআন (শোনানো)</option>
                  <option>নাজেরা ও আকাইদ</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">রোল</th>
                    <th className="p-2.5">ছাত্রের নাম</th>
                    <th className="p-2.5">পূর্ণমান</th>
                    <th className="p-2.5">প্রাপ্ত নম্বর</th>
                    <th className="p-2.5 rounded-r-xl">গ্রেড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {marksData.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-bold">{m.roll}</td>
                      <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{m.name}</td>
                      <td className="p-2.5 text-slate-400">১০০</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={m.marks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarksData(prev => prev.map((item, i) => i === idx ? { ...item, marks: val } : item));
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                        />
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          {m.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: LEAVE & NOTICES ================= */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Leave Application */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-emerald-600" />
              মোহতামিম সাহেবের নিকট ছুটির আবেদন
            </h2>
            <p className="text-xs text-slate-500 mb-4">অনুমোদিত হলে নোটিফিকেশন পাবেন</p>

            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ছুটির তারিখ</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">কতদিন ছুটি প্রয়োজন</label>
                <select
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <option value="1">১ দিন</option>
                  <option value="2">২ দিন</option>
                  <option value="3">৩ দিন</option>
                  <option value="5">৫ দিন</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ছুটির কারণ</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="যেমন: পারিবারিক জরুরি কাজ বা অসুস্থতা..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                ছুটির আবেদন পাঠান
              </button>
            </form>
          </div>

          {/* Madrasa Notices */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-amber-500" />
              মাদরাসা নোটিশ ও মোহতামিম সাহেবের বার্তা
            </h2>
            <p className="text-xs text-slate-500 mb-4">সকল শিক্ষক ও কর্মচারীদের জন্য আনুষ্ঠানিক ঘোষণা</p>

            <div className="space-y-3">
              {[
                { title: 'আগামী সোমবার শিক্ষক পরামর্শ সভা', date: '১৭ সেপ্টেম্বর ২০২৬', sender: 'মাওলানা আবুল কাশেম (মোহতামিম)', desc: 'বাদ আসর সকল আসাতেজায়ে কেরামের উপস্থিতিতে জরুরি শিক্ষাবৈঠক অনুষ্ঠিত হবে।' },
                { title: 'সাময়িক পরীক্ষার খাতা মূল্যায়ন ও নম্বর জমাদান', date: '১৫ সেপ্টেম্বর ২০২৬', sender: 'শিক্ষা বিভাগ', desc: 'আগামী ২৫ সেপ্টেম্বরের মধ্যে সকল বিষয়ের নম্বর এন্ট্রি সম্পন্ন করার নির্দেশ দেওয়া হলো।' },
              ].map((n, i) => (
                <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{n.date} • {n.sender}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  User,
  Heart,
  CalendarCheck,
  Award,
  CreditCard,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Send,
  FileCheck,
  Download,
  Share2,
  DollarSign,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface GuardianSubAppProps {
  onBackToMain?: () => void;
  isDirectorViewing?: boolean;
}

export const GuardianSubApp: React.FC<GuardianSubAppProps> = ({
  onBackToMain,
  isDirectorViewing = false,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  // Child selection
  const [selectedChild, setSelectedChild] = useState('std-101');
  const [activeTab, setActiveTab] = useState<'today' | 'attendance' | 'hifz_results' | 'fees' | 'contact'>('today');

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [contactMsg, setContactMsg] = useState('');

  const childrenData = [
    {
      id: 'std-101',
      name: 'মুহাম্মদ সাআদ করিম',
      roll: '০১',
      dept: 'হিফজুল কুরআন বিভাগ',
      class: 'হিফজ ১ম বিভাগ',
      section: 'আলিফ',
      teacher: 'হাফেজ ক্বারী ওমর ফারুক',
      teacherPhone: '01744444444',
      todayAttendance: 'উপস্থিত (সকাল ৭:৪৫)',
      attendanceRate: '৯৬%',
      hifzFinishedPara: 14,
      totalPara: 30,
      todaySabak: 'পারা ১৫ • পৃষ্ঠা ২৪ • আয়াত ১-১৫',
      todayAmokhta: '১২-১৪ পারা',
      sabakRating: 'চমৎকার (Excellent)',
      teacherNote: 'মাশাআল্লাহ আজ খুব চমৎকারভাবে সবক শুনিয়েছে। তাজবীদের মাখরাজ নির্ভুল ছিল।',
      monthlyFee: '৪,০০০',
      feeStatus: 'পরিশোধিত (Paid)',
      lastReceipt: 'REC-9021',
    },
    {
      id: 'std-104',
      name: 'মুহাম্মদ যুবায়ের করিম',
      roll: '০৪',
      dept: 'নূরানী বিভাগ',
      class: 'নূরানী ৩য় বর্ষ',
      section: 'বা',
      teacher: 'মাওলানা শফিকুর রহমান',
      teacherPhone: '01812345678',
      todayAttendance: 'উপস্থিত (সকাল ৭:৫৫)',
      attendanceRate: '৯৪%',
      hifzFinishedPara: 5,
      totalPara: 30,
      todaySabak: 'পারা ৬ • পৃষ্ঠা ৮ • আয়াত ১-১০',
      todayAmokhta: '১-৫ পারা',
      sabakRating: 'ভালো (Good)',
      teacherNote: 'লেখাপড়ায় আগ্রহ ভালো। বানান অনুশীলনে আরও একটু নজর দিতে হবে।',
      monthlyFee: '৩,৫০০',
      feeStatus: 'বকেয়া আছে (Due)',
      lastReceipt: 'REC-8842',
    },
  ];

  const currentChild = childrenData.find(c => c.id === selectedChild) || childrenData[0];

  const handleSendTeacherMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    showToast(`উস্তায ${currentChild.teacher}-এর কাছে বার্তা সফলভাবে পাঠানো হয়েছে!`, 'success');
    setContactMsg('');
  };

  const handlePayFee = () => {
    showToast(`ধন্যবাদ! ${payMethod.toUpperCase()}-এর মাধ্যমে ৪,০০০ ৳ সফলভাবে পরিশোধিত হয়েছে। রসিদ সংরক্ষিত হলো।`, 'success');
    setShowPayModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* 👑 If Director is previewing the Guardian App */}
      {isDirectorViewing && (
        <div className="p-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <p className="text-xs font-bold leading-tight">
                আপনি মোহতামিম/পরিচালক হিসেবে "অভিভাবক অ্যাপ" ব্রাউজ করছেন
              </p>
              <p className="text-[11px] text-blue-100">
                অভিভাবকগণ লগইন করলে সরাসরি এই ডেডিকেটেড ইন্টারফেসটি পাবেন।
              </p>
            </div>
          </div>
          {onBackToMain && (
            <button
              onClick={onBackToMain}
              className="shrink-0 px-3 py-1.5 bg-white text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মোহতামিম প্যানেলে ফিরুন</span>
            </button>
          )}
        </div>
      )}

      {/* 👨‍👩‍👧 Guardian App Top Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-blue-100 dark:border-blue-950/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-600/20 shrink-0">
              অ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  👨‍👩‍👧 অভিভাবক অ্যাপ (Guardian Portal)
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  অভিভাবক আইডি: GRD-001
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                আলহাজ্ব মোঃ জাহিদুল করিম
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মোবাইল: 01766666666 • মোট সন্তান নিবন্ধিত: ২ জন
              </p>
            </div>
          </div>

          {/* Child Selector Dropdown */}
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 p-1.5 rounded-2xl border border-blue-200 dark:border-blue-900">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 pl-2">
              সন্তান:
            </span>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border-none shadow-xs cursor-pointer focus:ring-0"
            >
              {childrenData.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (রোল: {c.roll})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Child Mini Bar */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{currentChild.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{currentChild.class}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">রোল: {currentChild.roll}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              শ্রেণি উস্তায: <strong className="text-slate-800 dark:text-slate-200">{currentChild.teacher}</strong>
            </span>
            <a
              href={`tel:${currentChild.teacherPhone}`}
              className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-200"
            >
              <Phone className="w-3 h-3" />
              কল করুন
            </a>
          </div>
        </div>

        {/* Quick Tabs Menu */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'today', label: 'আজকের আপডেট', icon: Clock },
            { id: 'attendance', label: 'মাসিক হাজিরা', icon: CalendarCheck },
            { id: 'hifz_results', label: 'পড়া ও রেজাল্ট', icon: BookOpen },
            { id: 'fees', label: 'ফি ও বেতন', icon: CreditCard },
            { id: 'contact', label: 'উস্তাযের সাথে কথা', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="text-[11px] leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: TODAY'S UPDATE ================= */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Today's Attendance Badge */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                আজকের উপস্থিতি স্ট্যাটাস
              </span>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  উপস্থিত
                </h3>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                {currentChild.todayAttendance}
              </p>
            </div>

            {/* Attendance % */}
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-3xl border border-blue-200 dark:border-blue-900/60">
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider block">
                চলতি মাসের গড় উপস্থিতি
              </span>
              <div className="flex items-center gap-2 mt-1">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
                  {currentChild.attendanceRate}
                </h3>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                ২৩ দিন উপস্থিত • কোনো অনুপস্থিতি নেই
              </p>
            </div>

            {/* Fee Status */}
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 rounded-3xl border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider block">
                মাসিক বেতন ও ফি
              </span>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                  {currentChild.feeStatus}
                </h3>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {currentChild.monthlyFee} ৳ • রসিদ: {currentChild.lastReceipt}
              </p>
            </div>
          </div>

          {/* Today's Sabak Diary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  আজকের হিফজ ও পড়ালেখা ডায়েরি
                </h3>
                <p className="text-xs text-slate-500">তারিখ: ১৮ সেপ্টেম্বর ২০২৬ • শ্রেণি উস্তাযের মূল্যায়ন</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold">
                মান: {currentChild.sabakRating}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold block">নতুন সবক (New Lesson):</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {currentChild.todaySabak}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold block">সবকী ও আমোখতা (Revision):</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {currentChild.todayAmokhta}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                উস্তাযের আজকের মন্তব্য ও নসিহত:
              </span>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                "{currentChild.teacherNote}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE HISTORY ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              মাসিক উপস্থিতি ও হাজিরা রিপোর্ট
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              চলতি মাস সেপ্টেম্বর ২০২৬ • উপস্থিতি হার: {currentChild.attendanceRate}
            </p>

            <div className="space-y-2">
              {[
                { date: '১৮ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৭:৪৫', status: 'present', label: 'উপস্থিত', note: 'সময়মতো প্রবেশ' },
                { date: '১৭ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৭:৪০', status: 'present', label: 'উপস্থিত', note: 'সময়মতো প্রবেশ' },
                { date: '১৬ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৭:৫০', status: 'present', label: 'উপস্থিত', note: 'সময়মতো প্রবেশ' },
                { date: '১৫ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৮:১৫', status: 'late', label: '১৫ মি. দেরি', note: 'যানজট' },
                { date: '১৪ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৭:৪৫', status: 'present', label: 'উপস্থিত', note: 'সময়মতো প্রবেশ' },
                { date: '১৩ সেপ্টেম্বর ২০২৬', inTime: 'সকাল ৭:৪২', status: 'present', label: 'উপস্থিত', note: 'সময়মতো প্রবেশ' },
              ].map((rec, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{rec.date}</h4>
                      <p className="text-[11px] text-slate-400">প্রবেশ: {rec.inTime} • {rec.note}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl font-bold text-xs ${
                    rec.status === 'present'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {rec.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: HIFZ & EXAM RESULTS ================= */}
      {activeTab === 'hifz_results' && (
        <div className="space-y-4">
          {/* Hifz Progress Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-500" />
              হিফজুল কুরআন হিফজ সমাপ্তির অগ্রগতি
            </h3>
            <p className="text-xs text-slate-500 mb-4">মোট ৩০ পারার মধ্যে মুখস্থ সমাপ্তির হার</p>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span>সমাপ্ত পারা: {currentChild.hifzFinishedPara} পারা</span>
                <span className="text-amber-700 dark:text-amber-400">
                  {Math.round((currentChild.hifzFinishedPara / currentChild.totalPara) * 100)}% সম্পন্ন
                </span>
              </div>
              <div className="w-full h-3 bg-amber-200 dark:bg-amber-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${(currentChild.hifzFinishedPara / currentChild.totalPara) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                মাশাআল্লাহ, {currentChild.name} নিয়মিত পড়া শুনিয়ে এই পর্যন্ত মোট {currentChild.hifzFinishedPara} পারা হিফজ সম্পন্ন করেছে।
              </p>
            </div>
          </div>

          {/* Exam Marksheet */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  প্রথম সাময়িক পরীক্ষা ২০২৬ এর ফলাফল
                </h3>
                <p className="text-xs text-slate-500">গ্রেড: A+ • মেধা স্থান: ১ম (First in Class)</p>
              </div>
              <button
                onClick={() => showToast('রেজাল্ট কার্ড ডাউনলোড সম্পন্ন হয়েছে!', 'success')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                মার্কশিট ডাউনলোড
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">বিষয়</th>
                    <th className="p-2.5">পূর্ণমান</th>
                    <th className="p-2.5">প্রাপ্ত নম্বর</th>
                    <th className="p-2.5 rounded-r-xl">গ্রেড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold">হিফজুল কুরআন (শোনানো)</td>
                    <td className="p-2.5 text-slate-400">১০০</td>
                    <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">৯৫</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">A+</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">সহীহ তাজবীদ ও মাখরাজ</td>
                    <td className="p-2.5 text-slate-400">১০০</td>
                    <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">৯২</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">A+</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">মাসনূন দোয়া ও দ্বীনিয়াত</td>
                    <td className="p-2.5 text-slate-400">১০০</td>
                    <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-400">৮৮</td>
                    <td className="p-2.5"><span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">A+</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FEES & PAYMENTS ================= */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  মাদরাসা ফি ও বেতন বিবরণ
                </h3>
                <p className="text-xs text-slate-500">অনলাইনে ফি প্রদান ও ডিজিটাল রসিদ ডাউনলোড</p>
              </div>

              <button
                onClick={() => setShowPayModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                বিকাশ/নগদে ফি পরিশোধ করুন
              </button>
            </div>

            <div className="space-y-3">
              {[
                { month: 'সেপ্টেম্বর ২০২৬', amount: '৪,০০০', status: 'paid', date: '০৫ সেপ্টেম্বর', receipt: 'REC-9021' },
                { month: 'আগস্ট ২০২৬', amount: '৪,০০০', status: 'paid', date: '০৪ আগস্ট', receipt: 'REC-8540' },
                { month: 'জুলাই ২০২৬', amount: '৪,০০০', status: 'paid', date: '০৭ জুলাই', receipt: 'REC-8112' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.month}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">পরিশোধ তারিখ: {item.date} • রসিদ #{item.receipt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.amount} ৳</span>
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold">
                      পরিশোধিত
                    </span>
                    <button
                      onClick={() => showToast(`রসিদ #${item.receipt} ডাউনলোড সম্পন্ন হয়েছে!`, 'success')}
                      className="p-1 text-slate-400 hover:text-blue-600"
                      title="রসিদ ডাউনলোড"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CONTACT TEACHER & PRINCIPAL ================= */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              শ্রেণি উস্তাযকে সরাসরি বার্তা পাঠান
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              উস্তায: {currentChild.teacher} (হিফজুল কুরআন বিভাগ)
            </p>

            <form onSubmit={handleSendTeacherMessage} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">আপনার বার্তা বা পরামর্শ</label>
                <textarea
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="যেমন: আসসালামু আলাইকুম হুজুর, সাআদের আগামীকালের ছুটির বিষয়ে বা সবক সংক্রান্ত বার্তা..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                উস্তাযের কাছে বার্তা পাঠান
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-emerald-600" />
              মাদরাসা জরুরি যোগাযোগ কেন্দ্র
            </h3>
            <p className="text-xs text-slate-500 mb-4">যেকোনো প্রশাসনিক বা জরুরি প্রয়োজনে</p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">মাওলানা আবুল কাশেম</span>
                  <span className="text-[11px] text-slate-400">মোহতামিম / পরিচালক</span>
                </div>
                <a
                  href="tel:01722222222"
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-1 hover:bg-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  01722222222
                </a>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">মাদরাসা অফিস ও হেল্পডেস্ক</span>
                  <span className="text-[11px] text-slate-400">সকাল ৮:০০ - বিকাল ৫:০০</span>
                </div>
                <a
                  href="tel:01711111111"
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-xl font-bold flex items-center gap-1 hover:bg-blue-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  01711111111
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAYMENT MODAL ================= */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              অনলাইন ফি পরিশোধ (ডিজিটাল পেমেন্ট)
            </h3>
            <p className="text-xs text-slate-500">
              শিক্ষার্থী: {currentChild.name} • প্রদেয় ফি: ৪,০০০ ৳
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bkash', label: 'বিকাশ (bKash)', color: 'bg-pink-50 border-pink-300 text-pink-700' },
                { id: 'nagad', label: 'নগদ (Nagad)', color: 'bg-orange-50 border-orange-300 text-orange-700' },
                { id: 'rocket', label: 'রকেট (Rocket)', color: 'bg-purple-50 border-purple-300 text-purple-700' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    payMethod === m.id ? 'ring-2 ring-emerald-500 ' + m.color : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>নিরাপদ এনক্রিপ্টেড পেমেন্ট গেটওয়ে। পরিশোধের সাথে সাথে ডিজিটাল রসিদ পাবেন।</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handlePayFee}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                ৪,০০০ ৳ পরিশোধ নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

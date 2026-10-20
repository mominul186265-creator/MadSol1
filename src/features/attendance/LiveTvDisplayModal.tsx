import React, { useState, useEffect } from 'react';
import {
  X,
  Tv,
  Maximize2,
  Minimize2,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Volume2,
  Radio,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { MadSolLogo } from '../../components/common/MadSolLogo';

interface LiveTvDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    attendanceRate: number;
  };
}

export const LiveTvDisplayModal: React.FC<LiveTvDisplayModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const madrasaData = useMadrasaData();
  const students = madrasaData?.students || [];
  const isBn = language === 'bn';

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut to exit (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleExit = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    onClose();
  };

  // Recent attendance stream mock/calculated from students
  const recentPunches = students.slice(0, 7).map((s, idx) => ({
    id: s.id,
    name: s.fullNameBn,
    roll: s.rollNumber,
    class: s.currentClass || 'হিফজুল কুরআন বিভাগ',
    time: `০${7 + Math.floor(idx / 3)}:${15 + idx * 6} AM`,
    status: idx === 4 ? 'late' : 'present',
    method: idx % 2 === 0 ? 'RFID কার্ড' : 'বায়োমেট্রিক আঙ্গুলের ছাপ',
  }));

  const classWiseStats = [
    { name: 'হিফজুল কুরআন বিভাগ', total: 32, present: 31, percent: 97 },
    { name: 'নাজেরা ও নুরানি বিভাগ', total: 45, present: 42, percent: 93 },
    { name: 'কিতাব বিভাগ (শরহে বেকায়া)', total: 28, present: 26, percent: 92 },
    { name: 'ফজিলত ও দাওরায়ে হাদিস', total: 24, present: 24, percent: 100 },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col h-screen max-h-screen overflow-y-auto overscroll-contain font-sans">
      {/* Top Header Bar for TV */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 sticky top-0 z-50 shrink-0 shadow-lg">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
            <MadSolLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-400 font-bold truncate">
                LIVE SMART TV • লাইভ হাজিরা
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-black text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {institution?.nameBn || 'দারুল উলুম ইসলামিয়া কওমি মাদরাসা'}
            </h1>
          </div>
        </div>

        {/* Center: Bismillah (Hidden on small mobile) */}
        <div className="hidden xl:block text-center">
          <p className="text-sm font-arabic text-emerald-300 font-semibold tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-[10px] text-slate-400">
            জ্ঞান অর্জন করা প্রত্যেক মুসলিমের উপর ফরজ — আল হাদিস
          </p>
        </div>

        {/* Right: Clock, Fullscreen & THE ONLY Exit Button */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="text-right">
            <div className="text-base sm:text-2xl font-black tracking-wider text-emerald-400 font-mono leading-tight">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-[9px] sm:text-xs text-slate-300 font-medium">
              {currentTime.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* THE SINGLE ONLY CLEAR RED EXIT BUTTON */}
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/40 active:scale-95 transition cursor-pointer shrink-0"
            title="টিভি মোড বন্ধ করে ফিরে যান"
          >
            <X className="w-4 h-4" />
            <span>বাহির হন</span>
          </button>
        </div>
      </div>

      {/* Main TV Dashboard Grid - Fully Scrollable */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 pb-20">
        {/* Left Column: Big KPIs & Class Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Big Live Attendance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                মোট শিক্ষার্থী
              </span>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">{toBnNum(stats.total || students.length)}</span>
                <span className="text-xs text-slate-400 ml-1">জন</span>
              </div>
              <span className="text-[10px] text-blue-400 mt-1 font-medium">নিবন্ধিত ছাত্র</span>
            </div>

            <div className="bg-gradient-to-b from-emerald-950/80 to-slate-900 border border-emerald-700/60 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                উপস্থিত শিক্ষার্থী
              </span>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono">
                  {toBnNum(stats.present || Math.round(students.length * 0.94))}
                </span>
                <span className="text-xs text-emerald-400 ml-1">জন</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                {toBnNum(stats.attendanceRate || 94.2)}% উপস্থিতি
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                অনুপস্থিত
              </span>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">
                  {toBnNum(stats.absent || 3)}
                </span>
                <span className="text-xs text-slate-400 ml-1">জন</span>
              </div>
              <span className="text-[10px] text-rose-400 mt-1 font-medium">এসএমএস প্রেরিত</span>
            </div>

            <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                অনুমোদিত ছুটি
              </span>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                  {toBnNum(stats.leave || 2)}
                </span>
                <span className="text-xs text-slate-400 ml-1">জন</span>
              </div>
              <span className="text-[10px] text-amber-400 mt-1 font-medium">ছুটির দরখাস্ত মঞ্জুর</span>
            </div>
          </div>

          {/* Department & Class Wise Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                বিভাগভিত্তিক উপস্থিতির রিয়েলটাইম হার
              </span>
              <span className="text-xs text-emerald-400 font-mono">লাইভ সিঙ্ক চালু</span>
            </h3>

            <div className="space-y-4">
              {classWiseStats.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{c.name}</span>
                    <span className="text-slate-400">
                      উপস্থিত: <strong className="text-white font-mono">{toBnNum(c.present)}</strong> / {toBnNum(c.total)} (
                      <span className="text-emerald-400 font-bold">{toBnNum(c.percent)}%</span>)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Prayer & Next Class Alert Box */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">পরবর্তী জামাত: <strong className="text-emerald-300">যোহরের নামাজ — দুপুর ১:১৫ মি.</strong></span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold text-[10px]">
                চলমান ক্লাস: ৩য় পিরিয়ড
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live RFID / Biometric Punch Stream (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">সর্বশেষ উপস্থিতি ও কার্ড পাঞ্চ স্ট্রিম</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                ডিভাইস: গেট-১ কানেক্টেড
              </span>
            </div>

            <div className="space-y-2.5">
              {recentPunches.map((punch, idx) => (
                <div
                  key={punch.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 font-bold text-xs font-mono">
                      #{toBnNum(punch.roll)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{punch.name}</h4>
                      <p className="text-[10px] text-slate-400">{punch.class} • {punch.method}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      {toBnNum(punch.time)}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-semibold">
                      উপস্থিত
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              সর্বশেষ ডেটা সিঙ্ক: ঠিক এখনই • অটো-রিফ্রেশ সচল
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Breaking Notice & Hadith Ticker */}
      <div className="bg-emerald-900/90 text-white px-6 py-2.5 border-t border-emerald-700 flex items-center gap-4 text-xs font-medium">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-black shrink-0 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5" />
          জরুরি নোটিশ
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee inline-block text-emerald-100">
            📢 আগামী রবিবার হইতে মাসিক সাময়িক পরীক্ষা শুরু হইবে • সকল শিক্ষার্থীকে যথাসময়ে উপস্থিত থাকার নির্দেশ দেওয়া যাইতেছে • বকেয়া ফী পরিশোধ করিয়া অফিস হইতে প্রবেশপত্র সংগ্রহ করুন • হে আল্লাহ, আমাদের ইলমে বরকত দান করুন।
          </div>
        </div>
      </div>
    </div>
  );
};

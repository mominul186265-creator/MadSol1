import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  PhoneCall,
  MessageSquare,
  MessageCircle,
  Plus,
  BookOpen,
  BookMarked,
  Sparkles,
  Award,
  Layers,
  Calendar,
  Eye,
  Edit3,
  Star,
  Download,
  Printer,
  ChevronRight,
  X,
} from 'lucide-react';
import { HifzStudent } from '../../types/hifz';
import { useHifz } from '../../context/HifzContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HifzStudentProfileModal } from './HifzStudentProfileModal';
import { SabakEntryModal } from './SabakEntryModal';
import { AddHifzStudentModal } from './AddHifzStudentModal';

interface HifzStageDetailViewProps {
  stage: 'qaida' | 'ampara' | 'nazra' | 'hifz' | 'revision';
  selectedBranch: 'boys' | 'mohila';
  onBack: () => void;
}

export const HifzStageDetailView: React.FC<HifzStageDetailViewProps> = ({
  stage,
  selectedBranch,
  onBack,
}) => {
  const { scopedHifzStudents, sabakEntries, loadDemoData } = useHifz();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { institution } = useAuth();
  const { showToast } = useToast();

  const canManageHifz =
    user?.role === 'super_admin' ||
    user?.role === 'madrasa_admin' ||
    user?.role === 'principal' ||
    user?.role === 'teacher';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatFilter, setActiveStatFilter] = useState<'all' | 'completed_today' | 'pending_today' | 'alert'>('all');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<HifzStudent | null>(null);
  const [selectedStudentForRecord, setSelectedStudentForRecord] = useState<HifzStudent | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleQuickSabakEntry = () => {
    if (stageStudents.length === 0) {
      showToast('এই স্তরে কোনো শিক্ষার্থী নেই। অনুগ্রহ করে প্রথমে শিক্ষার্থী ভর্তি করুন।', 'error');
      return;
    }
    setSelectedStudentForRecord(stageStudents[0]);
  };

  // Stage meta configuration
  const stageConfig = {
    qaida: {
      id: 'qaida',
      number: '১',
      title: 'নূরানী কায়দা বিভাগ',
      shortTitle: '১. কায়দা',
      subtitle: 'নূরানী স্তর — হরফ শনাক্তকরণ, মাখরাজ ও তাজবীদের প্রাথমিক পাঠ',
      icon: BookOpen,
      gradient: 'from-blue-600 to-blue-800',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
      themeColor: 'blue',
      syllabus: 'নূরানী কায়দার ১ম থেকে ২৭টি তখতি, হরকতের নিয়ম, তানভীন ও জজম অনুশীলন।',
    },
    ampara: {
      id: 'ampara',
      number: '২',
      title: 'আমপারা বিভাগ (৩০তম পারা)',
      shortTitle: '২. আমপারা',
      subtitle: '৩০তম পারা স্তর — সূরা আন-নাবা থেকে সূরা আন-নাস পর্যন্ত তিলাওয়াত ও মুখস্থ',
      icon: BookMarked,
      gradient: 'from-indigo-600 to-indigo-800',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
      themeColor: 'indigo',
      syllabus: 'সূরা আন-নাস থেকে শুরু করে উল্টো ক্রমে সূরা আন-নাবা পর্যন্ত ধারাবাহিক মুখস্থ ও তাজবীদ।',
    },
    nazra: {
      id: 'nazra',
      number: '৩',
      title: 'নাজেরা কুরআন বিভাগ',
      shortTitle: '৩. নাজরা',
      subtitle: 'কুরআন রিডিং স্তর — বিশুদ্ধ মাখরাজ ও তারতীল সহকারে নাজেরা তিলাওয়াত',
      icon: Sparkles,
      gradient: 'from-teal-600 to-teal-800',
      badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200',
      themeColor: 'teal',
      syllabus: 'পূর্ণ ৩০ পারা কুরআন মাজিদ নির্ভুল মাখরাজ ও তাজবীদের সাথে দেখে দেখে দ্রুত ও বিশুদ্ধ পড়া।',
    },
    hifz: {
      id: 'hifz',
      number: '৪',
      title: 'হিফজুল কুরআন বিভাগ',
      shortTitle: '৪. হিফজ',
      subtitle: 'হিফজ স্তর — ১ থেকে ৩০ পারা পর্যন্ত ধারাবাহিক মুখস্থ, সাত ছবকী ও আমুক্তা দাওর',
      icon: Award,
      gradient: 'from-emerald-600 to-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
      themeColor: 'emerald',
      syllabus: 'দৈনিক নতুন ছবক (Sabaq), সাত ছবকী (Recent Revision) এবং আমুক্তা মনজিল (Full Revision)।',
    },
    revision: {
      id: 'revision',
      number: '৫',
      title: 'হিফজ রিভিশন ও দাওর বিভাগ',
      shortTitle: '৫. রিভিশন',
      subtitle: 'দাওরুল কুরআন স্তর — পূর্ণ কুরআন খতম দাওর, নিয়মিত রিভিশন ও ইয়াদ মজবুতকরণ',
      icon: CheckCircle2,
      gradient: 'from-purple-600 to-indigo-800',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
      themeColor: 'purple',
      syllabus: 'দৈনিক নির্দিষ্ট পারা (১-৩ পারা) খতম দাওর, তাজবীদ পর্যালোচনা ও ইয়াদ পরিপক্বকরণ।',
    },
  }[stage];

  // Filter students by branch and stage
  const stageStudents = scopedHifzStudents.filter((s) => {
    const matchesBranch = selectedBranch === 'mohila'
      ? s.branch === 'mohila' || s.gender === 'female'
      : s.branch === 'boys' || s.gender === 'male' || !s.branch;

    const matchesStage = stage === 'hifz'
      ? s.stage === 'hifz' || (!s.stage && s.stage !== 'revision')
      : s.stage === stage;

    return matchesBranch && matchesStage;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedStudentIds = new Set(
    sabakEntries
      .filter((r) => r.date === todayStr)
      .map((r) => r.studentId)
  );

  const completedTodayCount = stageStudents.filter(
    (s) => todayCompletedStudentIds.has(s.id) || todayCompletedStudentIds.has(s.studentId)
  ).length;

  const pendingTodayCount = Math.max(0, stageStudents.length - completedTodayCount);
  const stageAlertCount = stageStudents.filter((s) => s.lowProgressAlert).length;

  const filteredStudents = stageStudents.filter((student) => {
    // 1. Stat Filter
    if (activeStatFilter === 'completed_today') {
      const isCompleted = todayCompletedStudentIds.has(student.id) || todayCompletedStudentIds.has(student.studentId);
      if (!isCompleted) return false;
    } else if (activeStatFilter === 'pending_today') {
      const isCompleted = todayCompletedStudentIds.has(student.id) || todayCompletedStudentIds.has(student.studentId);
      if (isCompleted) return false;
    } else if (activeStatFilter === 'alert') {
      if (!student.lowProgressAlert) return false;
    }

    // 2. Search Query
    const q = searchQuery.toLowerCase();
    return (
      student.fullNameBn.toLowerCase().includes(q) ||
      student.fullNameEn.toLowerCase().includes(q) ||
      student.rollNumber.toLowerCase().includes(q) ||
      student.studentCode.toLowerCase().includes(q) ||
      student.guardianName.toLowerCase().includes(q) ||
      (student.guardianMobile && student.guardianMobile.includes(q))
    );
  });

  const StageIcon = stageConfig.icon;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Breadcrumb and Back Button Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>মূল ড্যাশবোর্ডে ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>হিফজ বিভাগ</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{stageConfig.title}</span>
        </div>
      </div>

      {/* Hero Header Banner - Slim, Clean and Functional */}
      <div className={`py-3.5 px-4 sm:py-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r ${stageConfig.gradient} text-white shadow-md relative overflow-hidden`}>
        {/* Background decorative watermark */}
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
          <StageIcon className="w-36 h-36 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Icon & Stage Name & Branch */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white shadow-inner shrink-0">
              <StageIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">{stageConfig.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
                  {selectedBranch === 'mohila' ? 'মহিলা শাখা' : 'ছাত্র শাখা'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Button (ছবক এন্ট্রি) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleQuickSabakEntry}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition cursor-pointer border border-emerald-400/40"
            >
              <BookOpen className="w-4 h-4" />
              <span>+ ছবক এন্ট্রি</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stage KPI Cards - Interactive Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* 1. Total Students Box */}
        <button
          type="button"
          onClick={() => setActiveStatFilter('all')}
          className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeStatFilter === 'all'
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-500 shadow-md ring-2 ring-slate-400/50'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 font-black text-xs shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
            {stageStudents.length}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              এই স্তরে মোট শিক্ষার্থী
            </span>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              {stageStudents.length} <span className="text-[10px] font-normal text-slate-400">জন</span>
            </div>
          </div>
        </button>

        {/* 2. Today's Sabaq Providers Box */}
        <button
          type="button"
          onClick={() => setActiveStatFilter(activeStatFilter === 'completed_today' ? 'all' : 'completed_today')}
          className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeStatFilter === 'completed_today'
              ? 'bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/50'
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 shadow-xs'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs shrink-0 ring-2 ring-emerald-200 dark:ring-emerald-800">
            {completedTodayCount}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block truncate">
              আজকের ছবক প্রদানকারী
            </span>
            <div className="text-xs font-black text-emerald-950 dark:text-emerald-100 leading-tight">
              {completedTodayCount} <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-300">জন ({stageStudents.length > 0 ? Math.round((completedTodayCount / stageStudents.length) * 100) : 0}%)</span>
            </div>
          </div>
        </button>

        {/* 3. Today's Pending Sabaq Box (Replaced Average Progress) */}
        <button
          type="button"
          onClick={() => setActiveStatFilter(activeStatFilter === 'pending_today' ? 'all' : 'pending_today')}
          className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeStatFilter === 'pending_today'
              ? 'bg-amber-100/80 dark:bg-amber-950/60 border-amber-500 dark:border-amber-500 shadow-md ring-2 ring-amber-500/50'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400 shadow-xs'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white font-black text-xs shrink-0 ring-2 ring-amber-200 dark:ring-amber-800">
            {pendingTodayCount}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block truncate">
              আজকের ছবক বাকি
            </span>
            <div className="text-xs font-black text-amber-950 dark:text-amber-100 leading-tight">
              {pendingTodayCount} <span className="text-[10px] font-normal text-amber-700 dark:text-amber-300">জন (পেন্ডিং)</span>
            </div>
          </div>
        </button>

        {/* 4. Special Attention / Needs Revision (Weak Students) Box */}
        <button
          type="button"
          onClick={() => setActiveStatFilter(activeStatFilter === 'alert' ? 'all' : 'alert')}
          className={`py-2.5 px-3 sm:py-3 sm:px-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            activeStatFilter === 'alert'
              ? 'bg-rose-100/80 dark:bg-rose-950/60 border-rose-500 dark:border-rose-500 shadow-md ring-2 ring-rose-500/50'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 shadow-xs'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white font-black text-xs shrink-0 ring-2 ring-rose-200 dark:ring-rose-800">
            {stageAlertCount}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block truncate">
              বিশেষ মনোযোগ / নজর
            </span>
            <div className="text-xs font-black text-rose-950 dark:text-rose-100 leading-tight">
              {stageAlertCount} <span className="text-[10px] font-normal text-rose-700 dark:text-rose-300">জন (দুর্বল শিক্ষার্থী)</span>
            </div>
          </div>
        </button>
      </div>

      {/* Active Filter Notification Bar */}
      {activeStatFilter !== 'all' && (
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <span>ফিল্টার সক্রিয়:</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[11px]">
              {activeStatFilter === 'completed_today' && 'আজকের ছবক প্রদানকারী শিক্ষার্থী'}
              {activeStatFilter === 'pending_today' && 'আজকের বাকি / পেন্ডিং শিক্ষার্থী'}
              {activeStatFilter === 'alert' && 'বিশেষ মনোযোগের দুর্বল শিক্ষার্থী'}
            </span>
            <span className="text-blue-700 dark:text-blue-300 font-semibold">({filteredStudents.length} জন পাওয়া গেছে)</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveStatFilter('all')}
            className="flex items-center gap-1 text-[11px] font-black text-blue-700 hover:text-blue-900 dark:text-blue-300 underline cursor-pointer"
          >
            ✕ ফিল্টার মুছুন (সব শিক্ষার্থী দেখুন)
          </button>
        </div>
      )}

      {/* Student List Section */}
      <div className="space-y-4">
        {/* Search & Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="শিক্ষার্থী বা অভিভাবক খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              মোট শিক্ষার্থী: <strong className="text-slate-900 dark:text-white">{filteredStudents.length} জন</strong>
            </span>
          </div>
        </div>

        {/* Student Cards Grid - Slim Blue Themed Model */}
        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">এই স্তরে এখনও কোনো শিক্ষার্থী যুক্ত নেই</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              নতুন শিক্ষার্থী ভর্তি করুন অথবা ডেমো দেখার জন্য ডেমো ডাটা লোড করতে পারেন।
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {canManageHifz && (
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-md"
                >
                  + নতুন শিক্ষার্থী ভর্তি করুন
                </button>
              )}
              <button
                onClick={loadDemoData}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                ডেমো ডাটা লোড করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredStudents.map((student) => {
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentForProfile(student)}
                  className="group rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-blue-50/80 p-3 sm:py-3 sm:px-3.5 shadow-xs transition-all hover:border-blue-500 hover:bg-blue-100/90 hover:shadow-md dark:border-blue-900/60 dark:bg-slate-900 dark:hover:bg-blue-950/50 dark:hover:border-blue-500 cursor-pointer flex items-center justify-between gap-3"
                >
                  {/* Left: Roll & Student Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {student.rollNumber}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition truncate">
                        {student.fullNameBn}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                        {student.fullNameEn} • রোল: {student.rollNumber}
                      </span>
                    </div>
                  </div>

                  {/* Right: Stage badge & Click Arrow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${stageConfig.badgeBg}`}>
                      {stageConfig.shortTitle}
                    </span>
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStudentForProfile && (
        <HifzStudentProfileModal
          student={selectedStudentForProfile}
          isOpen={!!selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onEditRecord={(student) => {
            setSelectedStudentForProfile(null);
            setSelectedStudentForRecord(student);
          }}
        />
      )}

      {selectedStudentForRecord && (
        <SabakEntryModal
          student={selectedStudentForRecord}
          isOpen={!!selectedStudentForRecord}
          onClose={() => setSelectedStudentForRecord(null)}
          initialTab="sabak"
        />
      )}

      {isAddStudentOpen && (
        <AddHifzStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          defaultBranch={selectedBranch}
          defaultStage={stage}
        />
      )}
    </div>
  );
};

export default HifzStageDetailView;


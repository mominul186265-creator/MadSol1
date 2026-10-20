import React from 'react';
import {
  Calendar,
  Building2,
  BookOpen,
  Layers,
  GraduationCap,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Settings,
  UserCheck,
} from 'lucide-react';
import { AcademicStats } from '../../types/step5';

interface AcademicDashboardOverviewProps {
  stats: AcademicStats;
  onTabChange: (tab: string) => void;
  onOpenNewSessionModal: () => void;
  onOpenNewDeptModal: () => void;
  onOpenNewClassModal: () => void;
  onOpenNewSectionModal: () => void;
  onOpenAssignModal: () => void;
  onOpenNewSubjectModal?: () => void;
  onOpenNewTeacherAssignModal?: () => void;
}

export const AcademicDashboardOverview: React.FC<AcademicDashboardOverviewProps> = ({
  stats,
  onTabChange,
  onOpenNewSessionModal,
  onOpenNewDeptModal,
  onOpenNewClassModal,
  onOpenNewSectionModal,
  onOpenAssignModal,
  onOpenNewSubjectModal,
  onOpenNewTeacherAssignModal,
}) => {
  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Banner with Active Session Focus */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 p-4 sm:p-8 text-white shadow-lg border border-emerald-700/50 w-full min-w-0">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 min-w-0">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>বর্তমান সক্রিয় শিক্ষাবর্ষ</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 break-words">
              {stats.activeSessionName}
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              মাদরাসার সকল শিক্ষা কার্যক্রম, বিভাগ, জামাত, শাখা ও শিক্ষার্থী রোল এই সেশনের ডাটাবেসের সাথে সংযুক্ত রয়েছে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => onTabChange('sessions')}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-xs shadow-xs"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>সেশন পরিবর্তন ও তালিকা</span>
            </button>
            <button
              onClick={onOpenNewSessionModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>নতুন শিক্ষাবর্ষ যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full min-w-0">
        {/* Departments */}
        <div
          onClick={() => onTabChange('departments')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalDepartments}
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              মোট সক্রিয় বিভাগ
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
            <span>হিফজ, কিতাব, নূরানী</span>
            <span className="opacity-70 group-hover:opacity-100">পরিচালনা →</span>
          </div>
        </div>

        {/* Classes */}
        <div
          onClick={() => onTabChange('classes')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalClasses}
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              মোট জামাত / শ্রেণি
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>ক্রম অনুসারে সাজানো</span>
            <span className="opacity-70 group-hover:opacity-100">তালিকা →</span>
          </div>
        </div>

        {/* Sections */}
        <div
          onClick={() => onTabChange('sections')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalSections}
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              মোট সক্রিয় শাখা (Section)
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            <span>আসন ধারণক্ষমতাসহ</span>
            <span className="opacity-70 group-hover:opacity-100">শাখা দেখুন →</span>
          </div>
        </div>

        {/* Enrolled / Assigned Students */}
        <div
          onClick={() => onTabChange('assignments')}
          className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalAssignedStudents}
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              সেশনভুক্ত শিক্ষার্থী
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            <span>রোল ও শ্রেণি বরাদ্দ</span>
            <span className="opacity-70 group-hover:opacity-100">বরাদ্দ করুন →</span>
          </div>
        </div>
      </div>

      {/* Quick Operations Matrix */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              একাডেমিক দ্রুত অ্যাকশন ও কনফিগারেশন
            </h3>
            <p className="text-xs text-slate-500">
              এক ক্লিকে নতুন বিভাগ, জামাত, শাখা তৈরি এবং শিক্ষার্থী শিক্ষাবর্ষ নির্ধারণ করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full min-w-0">
          <button
            onClick={onOpenNewDeptModal}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ নতুন বিভাগ</span>
          </button>

          <button
            onClick={onOpenNewClassModal}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ নতুন জামাত</span>
          </button>

          <button
            onClick={onOpenNewSectionModal}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ নতুন শাখা</span>
          </button>

          <button
            onClick={onOpenAssignModal}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">শিক্ষার্থী বরাদ্দ</span>
          </button>

          <button
            onClick={() => {
              if (onOpenNewSubjectModal) onOpenNewSubjectModal();
              else onTabChange('subjects');
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ পাঠ্য বিষয়</span>
          </button>

          <button
            onClick={() => {
              if (onOpenNewTeacherAssignModal) onOpenNewTeacherAssignModal();
              else onTabChange('teacher_assignments');
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ শিক্ষক নিয়োগ</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all text-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:rotate-45 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">রোল ও পলিসি</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  BookOpen,
  Layers,
} from 'lucide-react';
import { useHifz } from '../../context/HifzContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { HifzBranch } from '../../types/hifz';
import { AddHifzStudentModal } from './AddHifzStudentModal';
import { HifzStageDetailView } from './HifzStageDetailView';

interface HifzDashboardViewProps {
  initialBranch?: HifzBranch;
}

export const HifzDashboardView: React.FC<HifzDashboardViewProps> = ({
  initialBranch = 'boys',
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    scopedHifzStudents,
    sabakEntries,
    sabkiEntries,
    manzilEntries,
    alertEvents,
  } = useHifz();

  // Branch Selection: 'boys' (ছাত্র হিফজ) vs 'mohila' (মহিলা হিফজ)
  const [selectedBranch, setSelectedBranch] = useState<HifzBranch>(initialBranch);

  // Dedicated Stage Page View: 'qaida' | 'ampara' | 'nazra' | 'hifz' | 'revision' | null
  const [activeStagePage, setActiveStagePage] = useState<'qaida' | 'ampara' | 'nazra' | 'hifz' | 'revision' | null>(null);

  useEffect(() => {
    if (initialBranch) {
      setSelectedBranch(initialBranch);
    }
  }, [initialBranch]);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Role permissions
  const canManageHifz = user?.role === 'super_admin' || user?.role === 'madrasa_admin' || user?.role === 'principal' || user?.role === 'teacher';

  // Filter students for current Branch (boys or mohila)
  const branchStudents = scopedHifzStudents.filter((s) => {
    if (selectedBranch === 'mohila') {
      return s.branch === 'mohila' || s.gender === 'female';
    }
    return s.branch === 'boys' || s.gender === 'male' || !s.branch;
  });

  // Stage counts for badges
  const qaidaCount = branchStudents.filter((s) => s.stage === 'qaida').length;
  const amparaCount = branchStudents.filter((s) => s.stage === 'ampara').length;
  const nazraCount = branchStudents.filter((s) => s.stage === 'nazra').length;
  const hifzCount = branchStudents.filter((s) => s.stage === 'hifz' || (!s.stage && s.stage !== 'revision')).length;
  const revisionCount = branchStudents.filter((s) => s.stage === 'revision').length;

  // Statistics Calculations
  const totalBranchStudents = branchStudents.length;
  const avgProgress =
    totalBranchStudents > 0
      ? Number(
          (
            branchStudents.reduce((acc, s) => acc + s.progressPercentage, 0) /
            totalBranchStudents
          ).toFixed(1)
        )
      : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySabakCount = sabakEntries.filter((s) => s.date === todayStr).length;
  const pendingAlerts = alertEvents.filter((a) => a.status === 'pending');

  // If a specific stage page is selected, render the dedicated separate stage view
  if (activeStagePage) {
    return (
      <div className="w-full max-w-full min-w-0">
        <HifzStageDetailView
          stage={activeStagePage}
          selectedBranch={selectedBranch}
          onBack={() => setActiveStagePage(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      
      {/* Top Header & Branch Switcher Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shrink-0 ${
              selectedBranch === 'mohila'
                ? 'bg-gradient-to-br from-teal-600 to-teal-800 shadow-teal-600/20'
                : 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-600/20'
            }`}>
              {selectedBranch === 'mohila' ? <BookOpen className="h-6 w-6" /> : <BookMarked className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedBranch === 'mohila' ? 'মহিলা হিফজ বিভাগ (ছাত্রী শাখা)' : 'হিফজুল কুরআন বিভাগ (ছাত্র শাখা)'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedBranch === 'mohila'
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {selectedBranch === 'mohila' ? 'মহিলা শাখা' : 'ছাত্র শাখা'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                কায়দা, আমপারা, নাজেরা ও পূর্ণাঙ্গ হিফজুল কুরআন — ছবক, সাত ছবক (ছবকী) ও আমুক্তা (মনজিল) ট্র্যাকার
              </p>
            </div>
          </div>

          {/* Branch Switcher Pill & Enroll Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Switcher Toggle */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedBranch('boys')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBranch === 'boys'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>হিফজ (ছাত্র)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBranch('mohila')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBranch === 'mohila'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>মহিলা হিফজ (ছাত্রী)</span>
              </button>
            </div>

            {canManageHifz && (
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন শিক্ষার্থী ভর্তি</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Stage (মারহালা / স্তর) Compact Blue Selection Cards */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              মারহালা / স্তর নির্বাচন (আলাদা পেজে প্রবেশ করতে ক্লিক করুন):
            </span>
          </div>

          {/* 5 Distinct 100% Solid Deep Color Stage Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* 1. কায়দা - Solid Blue */}
            <div
              onClick={() => setActiveStagePage('qaida')}
              className="py-3 px-3.5 rounded-2xl border border-blue-400/40 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black tracking-wide text-white">
                  ১. কায়দা
                </h4>
                <span className="text-[11px] font-medium block text-blue-100">
                  নূরানী স্তর
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black shrink-0 bg-white/25 text-white backdrop-blur-sm border border-white/20">
                {qaidaCount} জন
              </span>
            </div>

            {/* 2. আমপারা - Solid Indigo */}
            <div
              onClick={() => setActiveStagePage('ampara')}
              className="py-3 px-3.5 rounded-2xl border border-indigo-400/40 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black tracking-wide text-white">
                  ২. আমপারা
                </h4>
                <span className="text-[11px] font-medium block text-indigo-100">
                  ৩০তম পারা
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black shrink-0 bg-white/25 text-white backdrop-blur-sm border border-white/20">
                {amparaCount} জন
              </span>
            </div>

            {/* 3. নাজরা - Solid Teal */}
            <div
              onClick={() => setActiveStagePage('nazra')}
              className="py-3 px-3.5 rounded-2xl border border-teal-400/40 bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black tracking-wide text-white">
                  ৩. নাজরা
                </h4>
                <span className="text-[11px] font-medium block text-teal-100">
                  কুরআন রিডিং
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black shrink-0 bg-white/25 text-white backdrop-blur-sm border border-white/20">
                {nazraCount} জন
              </span>
            </div>

            {/* 4. হিফজ - Solid Emerald Green */}
            <div
              onClick={() => setActiveStagePage('hifz')}
              className="py-3 px-3.5 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black tracking-wide text-white">
                  ৪. হিফজ
                </h4>
                <span className="text-[11px] font-medium block text-emerald-100">
                  হিফজুল কুরআন
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black shrink-0 bg-white/25 text-white backdrop-blur-sm border border-white/20">
                {hifzCount} জন
              </span>
            </div>

            {/* 5. রিভিশন - Solid Royal Purple (Full width span on 2-col mobile) */}
            <div
              onClick={() => setActiveStagePage('revision')}
              className="col-span-2 sm:col-span-1 lg:col-span-1 py-3 px-3.5 rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-black tracking-wide text-white">
                  ৫. রিভিশন
                </h4>
                <span className="text-[11px] font-medium block text-purple-100">
                  দাওর শাখা
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black shrink-0 bg-white/25 text-white backdrop-blur-sm border border-white/20">
                {revisionCount} জন
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {selectedBranch === 'mohila' ? 'মোট মহিলা শিক্ষার্থী' : 'মোট হিফজ শিক্ষার্থী'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalBranchStudents} <span className="text-xs font-semibold text-slate-400">জন</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>সক্রিয় খতিয়ান</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              গড় হিফজ অগ্রগতি
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-600 dark:text-teal-400">
            {avgProgress}%
          </div>
          <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${Math.min(avgProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              আজকের ছবকা প্রদান
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {todaySabakCount} <span className="text-xs font-semibold text-slate-400">টি</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            দৈনিক ছবকা এন্ট্রি চলমান
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              সাত ছবক ও আমুক্তা
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {sabkiEntries.length + manzilEntries.length} <span className="text-xs font-semibold text-slate-400">টি</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
            রিভিশন ও মনজিল সম্পন্ন
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              অগ্রগতি অ্যালার্ট
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              pendingAlerts.length > 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {pendingAlerts.length}
          </div>
          <div className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">
            {pendingAlerts.length > 0 ? 'বিশেষ রিভিশন প্রয়োজন' : 'সব স্বাভাবিক'}
          </div>
        </div>
      </div>

      <AddHifzStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        defaultBranch={selectedBranch}
        defaultStage="hifz"
      />
    </div>
  );
};

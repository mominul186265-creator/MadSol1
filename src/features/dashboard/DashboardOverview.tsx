import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { ROLES_DATA, INITIAL_NOTIFICATIONS } from '../../data/initialData';
import { AddStudentModal } from '../students/AddStudentModal';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  Building2,
  Shield,
  Activity,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  Wallet,
  Plus,
  FileText,
  Printer,
  Bell,
  Home,
  AlertCircle,
  PieChart,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface DashboardOverviewProps {
  onOpenRoleSwitcher: () => void;
  onOpenDbViewer: () => void;
  onNavigate: (path: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenRoleSwitcher,
  onOpenDbViewer,
  onNavigate,
}) => {
  const { user, institution } = useAuth();
  const { language, t } = useLanguage();
  const {
    scopedStudents,
    scopedGuardians,
    scopedAdmissions,
    activityLogs,
  } = useMadrasaData();

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const roleMeta = user ? ROLES_DATA[user.role] : null;

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return language === 'bn' ? 'শুভ সকাল' : 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return language === 'bn' ? 'শুভ দুপুর' : 'Good Afternoon';
    } else if (hour >= 17 && hour < 20) {
      return language === 'bn' ? 'শুভ সন্ধ্যা' : 'Good Evening';
    } else {
      return language === 'bn' ? 'শুভ রাত্রি' : 'Good Night';
    }
  };

  // Student metrics
  const totalStudents = scopedStudents.length;
  const activeStudents = scopedStudents.filter((s) => s.status === 'active').length;
  const boardingStudents = scopedStudents.filter((s) => s.isBoarding).length;
  const dayScholarStudents = totalStudents - boardingStudents;
  const pendingAdmissions = scopedAdmissions.filter((a) => a.status === 'pending');

  // Department distribution
  const deptCounts: Record<string, number> = {};
  scopedStudents.forEach((s) => {
    deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Personalized Welcome Header & Institution Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-950 p-6 sm:p-8 text-white shadow-lg border border-emerald-700/50">
        <IslamicPattern opacity={0.07} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {getGreeting()}, {language === 'bn' ? user?.fullNameBn : user?.fullNameEn}
              </span>
              <span className="text-emerald-400/80">•</span>
              <span className="text-xs text-emerald-200">
                {language === 'bn' ? '২৫ সফর ১৪৪৭ হিজরি' : '25 Safar 1448 AH'}
              </span>
              <span className="text-emerald-400/80">•</span>
              <span className="text-xs text-emerald-300/80 font-mono">
                {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'bn' ? institution?.nameBn : institution?.nameEn}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Badge variant="gold" size="sm" hasDot>
                {roleMeta ? (language === 'bn' ? roleMeta.nameBn : roleMeta.nameEn) : user?.role}
              </Badge>

              <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {language === 'bn' ? 'মাদ্রাসার প্রশাসনিক প্রধান কেন্দ্র' : 'Main Madrasa Administration'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              id="dashboard-switch-role-btn"
              variant="gold"
              size="sm"
              leftIcon={<Shield className="w-3.5 h-3.5" />}
              onClick={onOpenRoleSwitcher}
            >
              {language === 'bn' ? 'রোল পরিবর্তন (৭টি)' : 'Test 7 Roles'}
            </Button>

            <Button
              id="dashboard-db-inspect-btn"
              variant="outline"
              size="sm"
              leftIcon={<Database className="w-3.5 h-3.5 text-amber-300" />}
              onClick={onOpenDbViewer}
              className="text-white border-white/30 hover:bg-white/10"
            >
              {language === 'bn' ? 'ডাটাবেজ স্কিমা' : 'DB Schema'}
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Admission Smart Summary Alert */}
      {pendingAdmissions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                {language === 'bn'
                  ? `${pendingAdmissions.length}টি নতুন অনলাইন ভর্তি আবেদন অনুমোদনের অপেক্ষায়!`
                  : `${pendingAdmissions.length} pending online admission applications require review!`}
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {language === 'bn'
                  ? 'অভিভাবকগণ অনলাইনে আবেদন সাবমিট করেছেন। যাচাইপূর্বক এক ক্লিকে অনুমোদন বা বাতিল করুন।'
                  : 'Guardians submitted online applications. Verify and enroll with one click.'}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/admissions')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shrink-0"
          >
            <span>{language === 'bn' ? 'আবেদনসমূহ দেখুন' : 'Review Applications'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* KPI Cards (6 Key Metric Indicators) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.dashboard.quickOverview}</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t.dashboard.roleBasedScopeNotice}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Students */}
          <Card accent="emerald" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('/students')}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.dashboard.totalStudents}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
                {totalStudents}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span className="text-emerald-600 font-semibold">{activeStudents} সক্রিয়</span>
                <span>•</span>
                <span>{boardingStudents} আবাসিক</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Guardians */}
          <Card accent="navy" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('/guardians')}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  নিবন্ধিত অভিভাবক
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
                {scopedGuardians.length}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>এসএমএস সংযোগ সক্রিয়</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Today's Attendance */}
          <Card accent="gold">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.dashboard.todayAttendance}
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
                ৯৪.৬%
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>স্বাভাবিক উপস্থিতি</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Monthly Fees Collection */}
          <Card accent="emerald">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.dashboard.monthlyFeesCollection}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono">
                ৳ ৪,৬৫,০০০
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                <span>৭৮% লক্ষ্যমাত্রা আদায়</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Shortcuts (Smart Hub) */}
      <Card>
        <CardHeader action={<Sparkles className="w-4 h-4 text-amber-500" />}>
          <CardTitle>{t.dashboard.quickActions}</CardTitle>
          <CardDescription>
            {language === 'bn'
              ? 'মাদ্রাসার নিয়মিত কাজের দ্রুত শর্টকাট'
              : 'Direct shortcuts to system modules and configurations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Action 1: Add New Student */}
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                নতুন শিক্ষার্থী যোগ
              </p>
              <span className="text-[10px] text-slate-400">৫ ধাপের ভর্তি ফরম</span>
            </button>

            {/* Action 2: Students List */}
            <button
              onClick={() => onNavigate('/students')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                শিক্ষার্থী রেজিস্টার
              </p>
              <span className="text-[10px] text-slate-400">{totalStudents} জন সংরক্ষিত</span>
            </button>

            {/* Action 3: Online Admissions */}
            <button
              onClick={() => onNavigate('/admissions')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                অনলাইন ভর্তি
              </p>
              <span className="text-[10px] text-amber-600 font-bold">
                {pendingAdmissions.length}টি অপেক্ষমাণ
              </span>
            </button>

            {/* Action 4: Guardian Management */}
            <button
              onClick={() => onNavigate('/guardians')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                অভিভাবক ডিরেক্টরি
              </p>
              <span className="text-[10px] text-slate-400">{scopedGuardians.length} জন অভিভাবক</span>
            </button>

            {/* Action 5: Hifz Tracker */}
            <button
              onClick={() => onNavigate('/hifz')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                হিফজ ট্র্যাকার
              </p>
              <span className="text-[10px] text-slate-400">ছবকা ও আমুন্তা</span>
            </button>

            {/* Action 6: ID Card Generator */}
            <button
              onClick={() => onNavigate('/students')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group cursor-pointer hover:shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                আইডি কার্ড প্রিন্ট
              </p>
              <span className="text-[10px] text-slate-400">QR ও বারকোডযুক্ত</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section: Department Distribution & Admission Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                বিভাগভিত্তিক শিক্ষার্থী বণ্টন ও অ্যানালিটিক্স
              </h3>
              <p className="text-xs text-slate-500">
                মোট {totalStudents} জন শিক্ষার্থীর জামাতভিত্তিক অনুপাত
              </p>
            </div>
            <button
              onClick={() => onNavigate('/students')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              বিস্তারিত দেখুন →
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{dept}</span>
                    <span className="text-slate-500 font-mono">
                      {count} জন ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Residential vs Day Scholar Ratio */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60">
              <span className="text-teal-800 dark:text-teal-300 font-semibold block">আবাসিক বোর্ডিং</span>
              <span className="text-lg font-bold font-mono text-teal-900 dark:text-white">
                {boardingStudents} জন
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 block mt-0.5">
                {totalStudents > 0 ? Math.round((boardingStudents / totalStudents) * 100) : 0}% শিক্ষার্থী
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-semibold block">অনাবাসিক (ডে-স্কলার)</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                {dayScholarStudents} জন
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {totalStudents > 0 ? Math.round((dayScholarStudents / totalStudents) * 100) : 0}% শিক্ষার্থী
              </span>
            </div>
          </div>
        </div>

        {/* Admission Applications Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                ভর্তি আবেদন স্ট্যাটাস
              </h3>
              <p className="text-xs text-slate-500">চলতি সেশনের আবেদন প্রবাহ</p>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                <span className="text-amber-900 dark:text-amber-200 font-semibold">অপেক্ষমাণ আবেদন</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {scopedAdmissions.filter((a) => a.status === 'pending').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                <span className="text-emerald-900 dark:text-emerald-200 font-semibold">অনুমোদিত ও ভর্তি সম্পন্ন</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {scopedAdmissions.filter((a) => a.status === 'approved').length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                <span className="text-rose-900 dark:text-rose-200 font-semibold">প্রত্যাখ্যাত / আসন পূর্ণ</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                  {scopedAdmissions.filter((a) => a.status === 'rejected').length}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/admissions')}
            className="w-full text-xs gap-1.5 mt-4"
          >
            <span>অনলাইন আবেদন তালিকা দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity Logs & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Recent Activity Stream */}
        <Card>
          <CardHeader
            action={
              <button
                onClick={onOpenDbViewer}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'ডাটাবেজ লগ' : 'Schema Log'}
              </button>
            }
          >
            <CardTitle>{t.dashboard.recentActivity}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'সিস্টেমের সাম্প্রতিক পরিবর্তন ও লাইভ অ্যাক্টিভিটি'
                : 'Recent system audit logs and student operations'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3.5 sm:p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                    {log.details}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{log.userName}</span>
                    <span>({log.userRole})</span>
                    <span>•</span>
                    <span>{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notices & Bulletins */}
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.upcomingNotices}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'মাদ্রাসার প্রশাসনিক ও অ্যাকাডেমিক ঘোষণা'
                : 'Administrative bulletins & announcements'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {INITIAL_NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className="p-3.5 sm:p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? notif.titleBn : notif.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {language === 'bn' ? notif.messageBn : notif.messageEn}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSuccessViewProfile={() => {
          setIsAddStudentModalOpen(false);
          onNavigate('/students');
        }}
      />
    </div>
  );
};

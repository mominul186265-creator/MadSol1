import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  CheckCheck,
  Calendar,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DbClass, DbDepartment } from '../../types/step2';
import { AttendanceStatus } from '../../types/step4';
import { AttendanceTargetRow } from './useAttendance';
import { madsolDb } from '../../lib/db';

interface AllClassesAttendanceTabProps {
  institutionId: string;
  date: string;
  classes: DbClass[];
  departments: DbDepartment[];
  allRows: AttendanceTargetRow[];
  canRecord: boolean;
  onSelectClass: (classId: string) => void;
  onMarkClassAll: (classId: string, status: AttendanceStatus) => void;
  onMarkAllClassesPresent: () => void;
  onSave: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export const AllClassesAttendanceTab: React.FC<AllClassesAttendanceTabProps> = ({
  institutionId,
  date,
  classes = [],
  departments = [],
  allRows = [],
  canRecord,
  onSelectClass,
  onMarkClassAll,
  onMarkAllClassesPresent,
  onSave,
  hasUnsavedChanges,
  isSaving,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === 'bn';

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Group attendance rows by class
  const classStats = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        present: number;
        absent: number;
        late: number;
        leave: number;
        unmarked: number;
        rows: AttendanceTargetRow[];
      }
    >();

    classes.forEach((c) => {
      map.set(c.id, {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        unmarked: 0,
        rows: [],
      });
    });

    allRows.forEach((r) => {
      const clsId = r.class_id || '';
      const existing = map.get(clsId);
      if (existing) {
        existing.total += 1;
        existing.rows.push(r);
        if (r.status === 'present') existing.present += 1;
        else if (r.status === 'absent') existing.absent += 1;
        else if (r.status === 'late') existing.late += 1;
        else if (r.status === 'leave') existing.leave += 1;
        else existing.unmarked += 1;
      }
    });

    return map;
  }, [classes, allRows]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesDept = selectedDeptId === 'all' || c.department_id === selectedDeptId;
      const matchesSearch =
        !searchQuery.trim() ||
        c.name_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [classes, selectedDeptId, searchQuery]);

  // Overall totals across all classes
  const grandTotal = allRows.length;
  const grandPresent = allRows.filter((r) => r.status === 'present').length;
  const grandAbsent = allRows.filter((r) => r.status === 'absent').length;
  const grandLate = allRows.filter((r) => r.status === 'late').length;
  const grandLeave = allRows.filter((r) => r.status === 'leave').length;

  return (
    <div className="space-y-6">
      {/* Master Action Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>{isBn ? 'সকল শ্রেণির কেন্দ্রীয় উপস্থিতি' : 'All Classes Central Attendance'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isBn ? 'সব শ্রেণির দৈনিক হাজিরা ও দ্রুত নিয়ন্ত্রণ' : 'All Classes Daily Roll Call & Control'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              {isBn
                ? 'নূরানী, হিফজ ও কিতাব/কওমী বিভাগের সকল শ্রেণির ছাত্র-ছাত্রীদের হাজিরা একনজরে পর্যবেক্ষণ করুন এবং এক ক্লিকে হাজিরা নিশ্চিত করুন।'
                : 'Manage attendance for Noorani, Hifz, Kitab, and all classes with one-click bulk controls.'}
            </p>
          </div>

          {/* Master Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!canRecord || allRows.length === 0}
              onClick={() => {
                onMarkAllClassesPresent();
                showToast(
                  isBn
                    ? 'সব শ্রেণির সকল শিক্ষার্থীকে উপস্থিত মার্ক করা হয়েছে।'
                    : 'Marked all students in all classes present.',
                  'success'
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>{isBn ? 'সব শ্রেণিতে সবাইকে উপস্থিত করুন' : 'Mark All Present (All Classes)'}</span>
            </button>

            {hasUnsavedChanges && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onSave}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
              >
                <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : isBn ? '💾 পরিবর্তন সংরক্ষণ করুন' : '💾 Save Changes'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Grand Total Strip */}
        <div className="mt-6 pt-4 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-emerald-950/40 rounded-xl p-2.5">
            <div className="text-[11px] text-emerald-200">{isBn ? 'মোট শিক্ষার্থী' : 'Total Students'}</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">{grandTotal}</div>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2.5">
            <div className="text-[11px] text-emerald-200">{isBn ? 'মোট উপস্থিত' : 'Present'}</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300">{grandPresent}</div>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2.5">
            <div className="text-[11px] text-emerald-200">{isBn ? 'মোট অনুপস্থিত' : 'Absent'}</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-300">{grandAbsent}</div>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2.5">
            <div className="text-[11px] text-emerald-200">{isBn ? 'মোট বিলম্ব' : 'Late'}</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-300">{grandLate}</div>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-emerald-200">{isBn ? 'মোট ছুটি' : 'Leave'}</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-teal-300">{grandLeave}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Department Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {isBn ? 'সকল বিভাগ' : 'All Depts'}
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedDeptId === dept.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {dept.name_bn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'শ্রেণি বা জামাত খুঁজুন...' : 'Search class...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const stats = classStats.get(cls.id) || {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            unmarked: 0,
            rows: [],
          };
          const dept = departments.find((d) => d.id === cls.department_id);
          const attendancePercent =
            stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Top: Class Name, Dept badge, Code */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {dept?.name_bn || 'সাধারণ বিভাগ'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {cls.name_bn}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    {cls.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {cls.description || (isBn ? 'শ্রেণিভিত্তিক দৈনিক হাজিরা' : 'Class daily attendance')}
                </p>
              </div>

              {/* Attendance Mini Progress & Counts */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'উপস্থিতি হার:' : 'Attendance:'}
                  </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {attendancePercent}% ({stats.present}/{stats.total})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                  <div
                    style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                    title={`উপস্থিত: ${stats.present}`}
                  />
                  <div
                    style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }}
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`বিলম্ব: ${stats.late}`}
                  />
                  <div
                    style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
                    className="h-full bg-rose-500 transition-all duration-300"
                    title={`অনুপস্থিত: ${stats.absent}`}
                  />
                </div>

                {/* Status breakdown pills */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-center text-[11px]">
                  <div className="bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg py-1 font-bold">
                    P: {stats.present}
                  </div>
                  <div className="bg-rose-100/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-lg py-1 font-bold">
                    A: {stats.absent}
                  </div>
                  <div className="bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg py-1 font-bold">
                    L: {stats.late}
                  </div>
                  <div className="bg-teal-100/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded-lg py-1 font-bold">
                    Lve: {stats.leave}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!canRecord || stats.total === 0}
                  onClick={() => {
                    onMarkClassAll(cls.id, 'present');
                    showToast(
                      isBn
                        ? `[${cls.name_bn}]-এর সকলকে উপস্থিত মার্ক করা হয়েছে।`
                        : `Marked all students present in ${cls.name_bn}.`,
                      'success'
                    );
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title={isBn ? 'এই শ্রেণির সবাইকে উপস্থিত করুন' : 'Mark all present in this class'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'সবাই উপস্থিত' : 'All Present'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectClass(cls.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title={isBn ? 'হাজিরা শিট খুলুন ও ছাত্রভিত্তিক মার্ক করুন' : 'Open roll-call sheet'}
                >
                  <span>{isBn ? 'হাজিরা নিন' : 'Take Roll'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো শ্রেণি বা জামাত পাওয়া যায়নি' : 'No classes found'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isBn ? 'অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।' : 'Please adjust filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

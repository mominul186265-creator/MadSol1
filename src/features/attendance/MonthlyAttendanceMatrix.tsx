import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { AttendanceStatus, AttendanceTargetType } from '../../types/step4';
import { useLanguage } from '../../context/LanguageContext';

interface MonthlyAttendanceMatrixProps {
  targetType: AttendanceTargetType;
  year: number;
  month: number;
  classId: string;
  classes: Array<{ id: string; name_bn: string }>;
  matrixData: {
    daysInMonth: number;
    targets: Array<{
      id: string;
      nameBn: string;
      nameEn: string;
      code: string;
      dailyStatus: Record<number, AttendanceStatus | null>;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      leaveCount: number;
      percentage: number;
    }>;
  } | null;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onClassChange: (classId: string) => void;
  onExport: () => void;
}

const MONTHS_BN = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MonthlyAttendanceMatrix: React.FC<MonthlyAttendanceMatrixProps> = ({
  targetType,
  year,
  month,
  classId,
  classes,
  matrixData,
  onYearChange,
  onMonthChange,
  onClassChange,
  onExport,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const daysInMonth = matrixData?.daysInMonth || 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Month, Year, Class and Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500"
            >
              {MONTHS_BN.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {isBn ? m : MONTHS_EN[idx]}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500 font-mono"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Target filters & Print/Export */}
        <div className="flex flex-wrap items-center gap-3">
          {targetType === 'student' && (
            <select
              value={classId}
              onChange={(e) => onClassChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{isBn ? 'সকল জামাত / শ্রেণি' : 'All Classes'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_bn}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {isBn ? 'এক্সপোর্ট CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {!matrixData || matrixData.targets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium">{isBn ? 'কোনো ডাটা পাওয়া যায়নি' : 'No matrix data'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-center text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="px-3 py-2.5 text-left font-semibold sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 w-20">
                    {targetType === 'student' ? (isBn ? 'রোল' : 'Roll') : isBn ? 'আইডি' : 'ID'}
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold sticky left-20 bg-slate-50 dark:bg-slate-800 z-10 min-w-[140px]">
                    {isBn ? 'নাম' : 'Name'}
                  </th>

                  {/* Day numbers 1 to 28..31 */}
                  {daysArray.map((day) => (
                    <th key={day} className="px-1.5 py-2 font-mono font-semibold w-7">
                      {day}
                    </th>
                  ))}

                  {/* Summary Columns */}
                  <th className="px-2 py-2 font-semibold bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 w-10">
                    P
                  </th>
                  <th className="px-2 py-2 font-semibold bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 w-10">
                    A
                  </th>
                  <th className="px-2 py-2 font-semibold bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 w-10">
                    L
                  </th>
                  <th className="px-2 py-2 font-semibold bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 w-10">
                    LV
                  </th>
                  <th className="px-2.5 py-2 font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-14">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {matrixData.targets.map((target, idx) => (
                  <tr
                    key={target.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                      {target.code}
                    </td>
                    <td className="px-3 py-2 text-left font-medium text-slate-900 dark:text-slate-100 truncate max-w-[150px] sticky left-20 bg-white dark:bg-slate-900 z-10">
                      {target.nameBn}
                    </td>

                    {/* Day status cells */}
                    {daysArray.map((day) => {
                      const st = target.dailyStatus[day];
                      if (!st) {
                        return (
                          <td key={day} className="px-1 py-1 text-slate-300 dark:text-slate-700">
                            -
                          </td>
                        );
                      }

                      let bg = '';
                      let text = '';
                      let label = '';

                      if (st === 'present') {
                        bg = 'bg-emerald-100 dark:bg-emerald-950/60';
                        text = 'text-emerald-800 dark:text-emerald-300';
                        label = 'P';
                      } else if (st === 'absent') {
                        bg = 'bg-rose-100 dark:bg-rose-950/60';
                        text = 'text-rose-800 dark:text-rose-300';
                        label = 'A';
                      } else if (st === 'late') {
                        bg = 'bg-amber-100 dark:bg-amber-950/60';
                        text = 'text-amber-800 dark:text-amber-300';
                        label = 'L';
                      } else if (st === 'leave') {
                        bg = 'bg-purple-100 dark:bg-purple-950/60';
                        text = 'text-purple-800 dark:text-purple-300';
                        label = 'LV';
                      }

                      return (
                        <td key={day} className="px-0.5 py-1">
                          <span
                            className={`inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold ${bg} ${text}`}
                          >
                            {label}
                          </span>
                        </td>
                      );
                    })}

                    {/* Counts & Percentage */}
                    <td className="px-2 py-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                      {target.presentCount}
                    </td>
                    <td className="px-2 py-1 font-semibold text-rose-700 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/10">
                      {target.absentCount}
                    </td>
                    <td className="px-2 py-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                      {target.lateCount}
                    </td>
                    <td className="px-2 py-1 font-semibold text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10">
                      {target.leaveCount}
                    </td>
                    <td className="px-2.5 py-1 font-bold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40">
                      {target.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend explanation */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isBn ? 'চিহ্ন সংকেত:' : 'Legend:'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center justify-center">
              P
            </span>
            {isBn ? 'উপস্থিত (Present)' : 'Present'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-bold inline-flex items-center justify-center">
              A
            </span>
            {isBn ? 'অনুপস্থিত (Absent)' : 'Absent'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-bold inline-flex items-center justify-center">
              L
            </span>
            {isBn ? 'বিলম্ব (Late)' : 'Late'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 text-[10px] font-bold inline-flex items-center justify-center">
              LV
            </span>
            {isBn ? 'ছুটি (Leave)' : 'Leave'}
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          {isBn
            ? 'হাজিরার হার = (উপস্থিত + বিলম্ব) / মোট কার্যদিবস × ১০০'
            : 'Attendance % = (Present + Late) / Working Days × 100'}
        </span>
      </div>
    </div>
  );
};

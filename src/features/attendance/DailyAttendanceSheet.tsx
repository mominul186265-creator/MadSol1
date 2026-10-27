import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  Save,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { AttendanceStatus, AttendanceTargetType } from '../../types/step4';
import { AttendanceTargetRow } from './useAttendance';
import { useLanguage } from '../../context/LanguageContext';

interface DailyAttendanceSheetProps {
  targetType: AttendanceTargetType;
  rows: AttendanceTargetRow[];
  totalRows: number;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  canRecord: boolean;
  departmentId: string;
  setDepartmentId: (val: string) => void;
  classId: string;
  setClassId: (val: string) => void;
  sectionId: string;
  setSectionId: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  departments: Array<{ id: string; name_bn: string }>;
  classes: Array<{ id: string; name_bn: string; department_id: string }>;
  sections: Array<{ id: string; name_bn: string; class_id: string }>;
  onStatusChange: (targetId: string, status: AttendanceStatus) => void;
  onDetailsChange: (targetId: string, updates: Partial<AttendanceTargetRow>) => void;
  onMarkAllVisible: (status: AttendanceStatus) => void;
  onSave: () => void;
}

export const DailyAttendanceSheet: React.FC<DailyAttendanceSheetProps> = ({
  targetType,
  rows = [],
  totalRows,
  isLoading,
  isSaving,
  hasUnsavedChanges,
  canRecord,
  departmentId,
  setDepartmentId,
  classId,
  setClassId,
  sectionId,
  setSectionId,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  departments = [],
  classes = [],
  sections = [],
  onStatusChange,
  onDetailsChange,
  onMarkAllVisible,
  onSave,
}) => {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

  // Filtered classes based on selected department
  const filteredClasses = classes.filter((c) =>
    departmentId === 'all' ? true : c.department_id === departmentId
  );

  // Filtered sections based on selected class
  const filteredSections = sections.filter((s) =>
    classId === 'all' ? true : s.class_id === classId
  );

  return (
    <div className="space-y-4">
      {/* Quick Actions & Unsaved Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            {isBn ? 'দ্রুত মার্কিং:' : 'Quick Mark:'}
          </span>
          <button
            type="button"
            disabled={!canRecord || rows.length === 0}
            onClick={() => onMarkAllVisible('present')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isBn ? 'সবাইকে উপস্থিত' : 'Mark All Present'}
          </button>
          <button
            type="button"
            disabled={!canRecord || rows.length === 0}
            onClick={() => onMarkAllVisible('absent')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            {isBn ? 'সবাইকে অনুপস্থিত' : 'Mark All Absent'}
          </button>
          <button
            type="button"
            disabled={!canRecord || rows.length === 0}
            onClick={() => onMarkAllVisible('late')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 transition-colors disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'সবাইকে বিলম্ব' : 'Mark All Late'}
          </button>
        </div>

        {/* Save Button & Dirty Indicator */}
        <div className="flex items-center gap-3 justify-end">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              {isBn ? 'অসংরক্ষিত পরিবর্তন আছে' : 'Unsaved changes'}
            </span>
          )}
          <button
            type="button"
            disabled={!canRecord || isSaving || rows.length === 0}
            onClick={onSave}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-emerald-700 hover:bg-emerald-800'
            } disabled:opacity-50`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isBn
              ? 'হাজিরা সংরক্ষণ করুন'
              : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                targetType === 'student'
                  ? isBn
                    ? 'রোল, নাম বা আইডি...'
                    : 'Search roll, name...'
                  : isBn
                  ? 'শিক্ষক আইডি, নাম বা ফোন...'
                  : 'Search teacher ID, name...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Department filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setClassId('all');
                setSectionId('all');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">{isBn ? 'সকল বিভাগ' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_bn}
                </option>
              ))}
            </select>
          </div>

          {/* Class / Jammat filter (Students only) */}
          {targetType === 'student' && (
            <div>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('all');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="all">{isBn ? 'সকল জামাত / শ্রেণি' : 'All Classes'}</option>
                {filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section filter (Students only) */}
          {targetType === 'student' && (
            <div>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_bn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
              <option value="present">{isBn ? 'উপস্থিত' : 'Present'}</option>
              <option value="absent">{isBn ? 'অনুপস্থিত' : 'Absent'}</option>
              <option value="late">{isBn ? 'বিলম্ব' : 'Late'}</option>
              <option value="leave">{isBn ? 'ছুটি' : 'On Leave'}</option>
            </select>
          </div>
        </div>

        {/* Count summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span>
            {isBn ? 'মোট তালিকাভুক্ত:' : 'Total listed:'}{' '}
            <strong className="text-slate-900 dark:text-slate-100">{rows.length}</strong>{' '}
            {targetType === 'student'
              ? isBn
                ? 'জন শিক্ষার্থী'
                : 'students'
              : isBn
              ? 'জন শিক্ষক'
              : 'teachers'}
          </span>
          <span className="text-[11px] text-slate-400">
            {isBn
              ? 'স্ট্যাটাস বাটনে ক্লিক করে তাৎক্ষণিক পরিবর্তন করুন'
              : 'Click status buttons to toggle attendance'}
          </span>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">{isBn ? 'হাজিরা তালিকা লোড হচ্ছে...' : 'Loading attendance...'}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No records found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBn ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Try adjusting the filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                  <th className="px-4 py-3 font-semibold w-24">
                    {targetType === 'student'
                      ? isBn
                        ? 'রোল'
                        : 'Roll'
                      : isBn
                      ? 'শিক্ষক আইডি'
                      : 'Teacher ID'}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {isBn ? 'নাম ও পদবী / জামাত' : 'Name & Department / Class'}
                  </th>
                  <th className="px-4 py-3 font-semibold text-center w-64">
                    {isBn ? 'উপস্থিতি স্ট্যাটাস' : 'Attendance Status'}
                  </th>
                  <th className="px-4 py-3 font-semibold w-28">
                    {isBn ? 'প্রবেশ সময়' : 'Check-In'}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {isBn ? 'মন্তব্য / কারণ' : 'Remarks / Reason'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rows.map((row, index) => {
                  const isPresent = row.status === 'present';
                  const isAbsent = row.status === 'absent';
                  const isLate = row.status === 'late';
                  const isLeave = row.status === 'leave';

                  return (
                    <tr
                      key={row.target_id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors ${
                        row.is_dirty ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {row.target_code}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {/* Student / Target Photo */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            {row.photo ? (
                              <img src={row.photo} alt={row.target_name_bn} className="w-full h-full object-cover" />
                            ) : (
                              row.target_name_bn?.charAt(0) || 'S'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {row.target_name_bn}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <span>{row.department_name_bn}</span>
                              {row.class_name_bn && (
                                <>
                                  <span>•</span>
                                  <span>{row.class_name_bn}</span>
                                </>
                              )}
                              {row.section_name_bn && (
                                <>
                                  <span>•</span>
                                  <span>{row.section_name_bn}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl w-fit mx-auto border border-slate-200 dark:border-slate-700">
                          {/* Present Button */}
                          <button
                            type="button"
                            disabled={!canRecord}
                            onClick={() => onStatusChange(row.target_id, 'present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                            title={isBn ? 'উপস্থিত' : 'Present'}
                          >
                            <Check className="w-3 h-3" />
                            <span>P</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            disabled={!canRecord}
                            onClick={() => onStatusChange(row.target_id, 'absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isAbsent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                            }`}
                            title={isBn ? 'অনুপস্থিত' : 'Absent'}
                          >
                            <X className="w-3 h-3" />
                            <span>A</span>
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            disabled={!canRecord}
                            onClick={() => onStatusChange(row.target_id, 'late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isLate
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                            }`}
                            title={isBn ? 'বিলম্ব' : 'Late'}
                          >
                            <Clock className="w-3 h-3" />
                            <span>L</span>
                          </button>

                          {/* Leave Button */}
                          <button
                            type="button"
                            disabled={!canRecord}
                            onClick={() => onStatusChange(row.target_id, 'leave')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isLeave
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                            }`}
                            title={isBn ? 'ছুটি' : 'On Leave'}
                          >
                            <span>LV</span>
                          </button>
                        </div>
                      </td>

                      {/* Check-in time input */}
                      <td className="px-4 py-3">
                        <input
                          type="time"
                          disabled={!canRecord || isAbsent || isLeave}
                          value={row.check_in_time}
                          onChange={(e) =>
                            onDetailsChange(row.target_id, { check_in_time: e.target.value })
                          }
                          className="w-24 px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono disabled:opacity-40 disabled:bg-slate-100 dark:disabled:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Remarks input */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          disabled={!canRecord}
                          value={row.remarks}
                          onChange={(e) =>
                            onDetailsChange(row.target_id, { remarks: e.target.value })
                          }
                          placeholder={
                            isLate
                              ? isBn
                                ? 'দেরির কারণ...'
                                : 'Reason for late'
                              : isAbsent
                              ? isBn
                                ? 'অনুপস্থিতির কারণ...'
                                : 'Reason for absence'
                              : isLeave
                              ? isBn
                                ? 'ছুটির ধরন/বিবরণ...'
                                : 'Leave details'
                              : isBn
                              ? 'মন্তব্য...'
                              : 'Remarks...'
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

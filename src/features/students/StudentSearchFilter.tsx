import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Filter, RotateCcw, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/common/Button';

export interface StudentFilterState {
  searchQuery: string;
  department: string;
  className: string;
  session: string;
  status: string;
  gender: string;
  isBoarding: string;
  sortBy: 'name' | 'admissionDate' | 'roll' | 'studentId';
  sortOrder: 'asc' | 'desc';
}

interface StudentSearchFilterProps {
  filters: StudentFilterState;
  onFilterChange: (filters: StudentFilterState) => void;
  onReset: () => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  availableDepartments: string[];
  availableClasses: string[];
  availableSessions: string[];
  totalResultsCount: number;
}

export const StudentSearchFilter: React.FC<StudentSearchFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  viewMode,
  onViewModeChange,
  availableDepartments,
  availableClasses,
  availableSessions,
  totalResultsCount,
}) => {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Calculate active filter count
  let activeCount = 0;
  if (filters.department) activeCount++;
  if (filters.className) activeCount++;
  if (filters.session) activeCount++;
  if (filters.status) activeCount++;
  if (filters.gender) activeCount++;
  if (filters.isBoarding) activeCount++;
  if (filters.searchQuery.trim()) activeCount++;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Search Input & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleTextChange}
            placeholder={t.students.searchPlaceholder}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Filter Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isExpanded || activeCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span>ফিল্টার</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </button>

          {/* Reset Filters */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={t.students.resetFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.students.resetFilters}</span>
            </button>
          )}

          {/* View Switcher: Table or Cards */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filters Section */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs animate-in fade-in duration-150">
          {/* Department */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.students.filterDepartment}
            </label>
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">{t.students.allDepartments}</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Class / Jamat */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.students.filterClass}
            </label>
            <select
              value={filters.className}
              onChange={(e) => onFilterChange({ ...filters, className: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">{t.students.allClasses}</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.students.filterSession}
            </label>
            <select
              value={filters.session}
              onChange={(e) => onFilterChange({ ...filters, session: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">{t.students.allSessions}</option>
              {availableSessions.map((ses) => (
                <option key={ses} value={ses}>
                  {ses}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.students.filterStatus}
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">{t.students.allStatuses}</option>
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
              <option value="graduated">ফারিখ (Graduated)</option>
              <option value="archived">আর্কাইভকৃত (Archived)</option>
            </select>
          </div>

          {/* Boarding Status */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t.students.filterBoarding}
            </label>
            <select
              value={filters.isBoarding}
              onChange={(e) => onFilterChange({ ...filters, isBoarding: e.target.value })}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">{t.students.allBoarding}</option>
              <option value="true">{t.students.boardingResidential}</option>
              <option value="false">{t.students.dayScholar}</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              সাজান (Sort By)
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as [any, any];
                onFilterChange({ ...filters, sortBy: by, sortOrder: order });
              }}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="roll-asc">রোল (ছোট থেকে বড়)</option>
              <option value="roll-desc">রোল (বড় থেকে ছোট)</option>
              <option value="name-asc">নাম (A-Z / ক-খ)</option>
              <option value="admissionDate-desc">ভর্তির তারিখ (নতুন আগে)</option>
              <option value="studentId-asc">শিক্ষার্থী আইডি</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

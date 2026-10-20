import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  BookOpen,
  Building2,
  CheckCircle2,
  XCircle,
  Gauge,
} from 'lucide-react';
import { DbSection, DbClass, DbDepartment } from '../../types/step5';

interface SectionsTabProps {
  sections: DbSection[];
  classes: DbClass[];
  departments: DbDepartment[];
  onOpenCreate: () => void;
  onEdit: (sec: DbSection) => void;
  onToggleStatus: (sec: DbSection) => void;
  onDelete: (sec: DbSection) => void;
}

export const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  classes,
  departments,
  onOpenCreate,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = sections.filter((s) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (s.name || s.name_bn || '').toLowerCase().includes(searchLower) ||
      (s.code || '').toLowerCase().includes(searchLower) ||
      (s.class_name_bn || '').toLowerCase().includes(searchLower);
    const matchesClass = classFilter === 'all' || s.class_id === classFilter;
    const matchesDept = deptFilter === 'all' || s.department_id === deptFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesClass && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Filter and Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শাখা খুঁজুন (ক শাখা, SEC-A)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setClassFilter('all');
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
          >
            <option value="all">সকল বিভাগ (All Depts)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_bn}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
          >
            <option value="all">সকল জামাত (All Classes)</option>
            {classes
              .filter((c) => deptFilter === 'all' || c.department_id === deptFilter)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_bn}
                </option>
              ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন শাখা তৈরি</span>
        </button>
      </div>

      {/* Sections Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sec) => {
          const hasDependencies = (sec.total_students || 0) > 0;
          const capacity = sec.capacity || 40;
          const studentsCount = sec.total_students || 0;
          const fillPercentage = Math.min(100, Math.round((studentsCount / capacity) * 100));

          return (
            <div
              key={sec.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60 font-black text-xs">
                      {sec.code || 'SEC'}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {sec.name || sec.name_bn}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{sec.name_en || sec.name}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(sec)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-colors ${
                      sec.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                    title="স্ট্যাটাস পরিবর্তন করুন"
                  >
                    {sec.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>সক্রিয়</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>নিষ্ক্রিয়</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Parent Hierarchy Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                    <BookOpen className="w-3 h-3" />
                    {sec.class_name_bn || 'জামাত'}
                  </span>
                  {sec.department_name_bn && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      <Building2 className="w-3 h-3" />
                      {sec.department_name_bn}
                    </span>
                  )}
                </div>

                {/* Capacity Meter */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      শিক্ষার্থী / ধারণক্ষমতা:
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {studentsCount} / {capacity} জন
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fillPercentage >= 95
                          ? 'bg-rose-500'
                          : fillPercentage >= 75
                          ? 'bg-amber-500'
                          : 'bg-purple-600'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>পূর্ণতা: {fillPercentage}%</span>
                    <span>খালি আসন: {Math.max(0, capacity - studentsCount)} টি</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  কোড: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{sec.code}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(sec)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(sec)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasDependencies
                        ? 'text-slate-300 dark:text-slate-700 hover:text-rose-500 cursor-pointer'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                    title={
                      hasDependencies
                        ? `এই শাখায় ${studentsCount} জন শিক্ষার্থী রয়েছে, সরাসরি মুছে ফেলা যাবে না`
                        : 'শাখা মুছে ফেলুন'
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো শাখা পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন অথবা নতুন শাখা যুক্ত করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

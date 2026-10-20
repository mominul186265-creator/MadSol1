import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Layers,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { DbClass, DbDepartment, DbAcademicSession } from '../../types/step5';

interface ClassesTabProps {
  classes: DbClass[];
  departments: DbDepartment[];
  sessions: DbAcademicSession[];
  onOpenCreate: () => void;
  onEdit: (cls: DbClass) => void;
  onToggleStatus: (cls: DbClass) => void;
  onDelete: (cls: DbClass) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  departments,
  sessions,
  onOpenCreate,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = classes.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.name_bn.toLowerCase().includes(searchLower) ||
      c.name_en.toLowerCase().includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower);
    const matchesDept = deptFilter === 'all' || c.department_id === deptFilter;
    const matchesSession = sessionFilter === 'all' || c.academic_session_id === sessionFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesDept && matchesSession && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="জামাত খুঁজুন (নাম বা কোড)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">সকল বিভাগ (All Depts)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_bn}
              </option>
            ))}
          </select>

          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">সকল সেশন (All Sessions)</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.is_active ? '⭐' : ''}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন জামাত / শ্রেণি তৈরি</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cls) => {
          const hasDependencies = (cls.total_sections || 0) > 0 || (cls.total_students || 0) > 0;

          return (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center border border-indigo-200 dark:border-indigo-800/60 font-black text-xs leading-none">
                      <span>#{cls.class_order || 1}</span>
                      <span className="text-[9px] font-normal opacity-70 mt-0.5">ক্রম</span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {cls.name_bn}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{cls.name_en}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(cls)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-colors ${
                      cls.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                    title="স্ট্যাটাস পরিবর্তন করুন"
                  >
                    {cls.status === 'active' ? (
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

                {/* Department & Session Badge */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                    <Building2 className="w-3 h-3" />
                    {cls.department_name_bn || 'সাধারণ বিভাগ'}
                  </span>
                  {cls.session_name && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {cls.session_name}
                    </span>
                  )}
                </div>

                {cls.description && (
                  <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {cls.description}
                  </p>
                )}

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      মোট শাখা:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {cls.total_sections || 0} টি
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      মোট শিক্ষার্থী:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {cls.total_students || 0} জন
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  কোড: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cls.code}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(cls)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(cls)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasDependencies
                        ? 'text-slate-300 dark:text-slate-700 hover:text-rose-500 cursor-pointer'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                    title={
                      hasDependencies
                        ? `এই জামাতে শাখা (${cls.total_sections}) বা শিক্ষার্থী (${cls.total_students}) যুক্ত থাকায় সরাসরি মুছে ফেলা যাবে না`
                        : 'জামাত মুছে ফেলুন'
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
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো জামাত পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করুন অথবা নতুন জামাত যুক্ত করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

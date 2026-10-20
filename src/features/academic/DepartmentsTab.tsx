import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DbAcademicDepartment } from '../../types/step5';

interface DepartmentsTabProps {
  departments: DbAcademicDepartment[];
  onOpenCreate: () => void;
  onEdit: (department: DbAcademicDepartment) => void;
  onToggleStatus: (department: DbAcademicDepartment) => void;
  onDelete: (department: DbAcademicDepartment) => void;
}

export const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  departments,
  onOpenCreate,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = departments.filter((d) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      d.name_bn.toLowerCase().includes(searchLower) ||
      d.name_en.toLowerCase().includes(searchLower) ||
      d.code.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative min-w-0 w-full sm:w-[240px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="বিভাগ খুঁজুন (নাম বা কোড)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বিভাগ তৈরি করুন</span>
        </button>
      </div>

      {/* Departments Table/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const hasDependencies = (dept.total_classes || 0) > 0 || (dept.total_students || 0) > 0;

          return (
            <div
              key={dept.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60 font-black text-xs">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {dept.name_bn}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{dept.name_en}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(dept)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-colors ${
                      dept.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                    title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                  >
                    {dept.status === 'active' ? (
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

                {dept.description && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {dept.description}
                  </p>
                )}

                {/* Counts */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      মোট জামাত:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {dept.total_classes || 0} টি
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-500" />
                      মোট শিক্ষার্থী:
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                      {dept.total_students || 0} জন
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  কোড: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{dept.code}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(dept)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(dept)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasDependencies
                        ? 'text-slate-300 dark:text-slate-700 hover:text-rose-500 cursor-pointer'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                    title={
                      hasDependencies
                        ? `এই বিভাগে শ্রেণি (${dept.total_classes}) বা শিক্ষার্থী (${dept.total_students}) যুক্ত থাকায় মুছে ফেলা যাবে না`
                        : 'বিভাগ মুছে ফেলুন'
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
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো বিভাগ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন বিভাগ যুক্ত করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

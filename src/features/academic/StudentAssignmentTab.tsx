import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  History,
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  DbStudentAcademicHistory,
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
  AcademicStudentStatus,
} from '../../types/step5';
import { DbStudent } from '../../types/step2';

interface StudentAssignmentTabProps {
  histories: DbStudentAcademicHistory[];
  students: DbStudent[];
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  onOpenAssignModal: () => void;
}

export const StudentAssignmentTab: React.FC<StudentAssignmentTabProps> = ({
  histories,
  students,
  sessions,
  departments,
  classes,
  sections,
  onOpenAssignModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredHistories = histories.filter((h) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (h.student_name_bn || '').toLowerCase().includes(searchLower) ||
      (h.student_name_en || '').toLowerCase().includes(searchLower) ||
      (h.roll_number || '').toLowerCase().includes(searchLower);

    const matchesSession = sessionFilter === 'all' || h.academic_session_id === sessionFilter;
    const matchesDept = deptFilter === 'all' || h.department_id === deptFilter;
    const matchesClass = classFilter === 'all' || h.class_id === classFilter;
    const matchesStatus = statusFilter === 'all' || h.academic_status === statusFilter;

    return matchesSearch && matchesSession && matchesDept && matchesClass && matchesStatus;
  });

  const getStatusBadge = (status: AcademicStudentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            সক্রিয় (Active)
          </span>
        );
      case 'promoted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            উত্তীর্ণ (Promoted)
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            স্থগিত (On Hold)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            সমাপ্ত (Completed)
          </span>
        );
      case 'transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            স্থানান্তরিত (Transferred)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Controls and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-w-0">
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শিক্ষার্থী নাম বা রোল নম্বর..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          >
            <option value="all">সকল শিক্ষাবর্ষ (All Sessions)</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.is_active ? '⭐' : ''}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setClassFilter('all');
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
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
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
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
        </div>

        <button
          onClick={onOpenAssignModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>শিক্ষার্থী সেশন ও শ্রেণি নির্ধারণ</span>
        </button>
      </div>

      {/* History and Active Enrollments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              শিক্ষার্থীদের একাডেমিক ইতিহাস ও শ্রেণি অন্তর্ভুক্তি লগ ({filteredHistories.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            রোল নম্বর, বিভাগ ও জামাত ট্র্যাকিং
          </span>
        </div>

        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                <th className="py-3 px-4">শিক্ষাবর্ষ (Session)</th>
                <th className="py-3 px-4">বিভাগ ও জামাত</th>
                <th className="py-3 px-4">শাখা</th>
                <th className="py-3 px-4">রোল নম্বর</th>
                <th className="py-3 px-4">অবস্থা (Status)</th>
                <th className="py-3 px-4">তারিখ ও মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredHistories.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{record.student_name_bn || 'নাম উল্লেখ নেই'}</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      {record.student_name_en || record.student_id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {record.session_name || 'সেশন নেই'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {record.class_name_bn || 'জামাত'}
                    </div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      {record.department_name_bn || 'বিভাগ'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                      {record.section_name || 'শাখা নেই'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      #{record.roll_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(record.academic_status)}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    <div>{record.start_date || record.created_at.split('T')[0]}</div>
                    {record.remarks && (
                      <div className="text-slate-400 truncate max-w-[150px]" title={record.remarks}>
                        {record.remarks}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredHistories.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    কোনো শিক্ষার্থী একাডেমিক ইতিহাস পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

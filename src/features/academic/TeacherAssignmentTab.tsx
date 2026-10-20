import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Trash2,
  BookOpen,
  Calendar,
  Building2,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  DbTeacherAssignment,
  TeacherAssignmentType,
  TeacherAssignmentStatus,
  DbSubject,
} from '../../types/step6';
import { DbTeacher } from '../../types/step3';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
} from '../../types/step5';

interface TeacherAssignmentTabProps {
  assignments: DbTeacherAssignment[];
  teachers: DbTeacher[];
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  subjects: DbSubject[];
  onOpenAssignModal: () => void;
  onOpenEditModal: (assignment: DbTeacherAssignment) => void;
  onDeleteAssignment: (assignment: DbTeacherAssignment) => void;
}

const TYPE_CONFIG: Record<
  TeacherAssignmentType,
  { labelBn: string; labelEn: string; badgeClass: string; iconClass: string }
> = {
  primary: {
    labelBn: 'প্রধান শিক্ষক',
    labelEn: 'Primary Teacher',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-extrabold',
    iconClass: 'text-emerald-600',
  },
  assistant: {
    labelBn: 'সহকারী শিক্ষক',
    labelEn: 'Assistant Teacher',
    badgeClass:
      'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800 font-bold',
    iconClass: 'text-sky-600',
  },
  subject_teacher: {
    labelBn: 'বিষয় শিক্ষক',
    labelEn: 'Subject Teacher',
    badgeClass:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold',
    iconClass: 'text-indigo-600',
  },
  guest: {
    labelBn: 'অতিথি শিক্ষক',
    labelEn: 'Guest Lecturer',
    badgeClass:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-medium',
    iconClass: 'text-slate-500',
  },
};

export const TeacherAssignmentTab: React.FC<TeacherAssignmentTabProps> = ({
  assignments,
  teachers,
  sessions,
  departments,
  classes,
  sections,
  subjects,
  onOpenAssignModal,
  onOpenEditModal,
  onDeleteAssignment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtered
  const filteredAssignments = useMemo(() => {
    return assignments.filter((ta) => {
      const matchesSearch =
        ta.teacher_name_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.teacher_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.teacher_employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.subject_name_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ta.class_name_bn?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSession = selectedSession === 'all' || ta.academic_session_id === selectedSession;
      const matchesDept = selectedDept === 'all' || ta.department_id === selectedDept;
      const matchesClass = selectedClass === 'all' || ta.class_id === selectedClass;
      const matchesType = selectedType === 'all' || ta.assignment_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || ta.status === selectedStatus;

      return matchesSearch && matchesSession && matchesDept && matchesClass && matchesType && matchesStatus;
    });
  }, [assignments, searchTerm, selectedSession, selectedDept, selectedClass, selectedType, selectedStatus]);

  // KPI calculations
  const totalActiveAssignments = assignments.filter((a) => a.status === 'active').length;
  const primaryTeachersCount = assignments.filter(
    (a) => a.assignment_type === 'primary' && a.status === 'active'
  ).length;
  const assistantCount = assignments.filter(
    (a) => a.assignment_type === 'assistant' && a.status === 'active'
  ).length;
  const subjectTeacherCount = assignments.filter(
    (a) => a.assignment_type === 'subject_teacher' && a.status === 'active'
  ).length;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-amber-500" />
            <span>শিক্ষক বিষয় বণ্টন ও নিয়োগ (Teacher Subject Assignment)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            জামাত ও বিষয়ভিত্তিক শিক্ষক দায়িত্ব বণ্টন এবং প্রধান শিক্ষক নীতিমালা পরিচালনা
          </p>
        </div>

        <button
          id="btn-add-teacher-assignment"
          onClick={onOpenAssignModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-98 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন শিক্ষক দায়িত্ব নিয়োগ</span>
        </button>
      </div>

      {/* ⭐ One Primary Teacher Policy Banner */}
      <div className="p-4 rounded-3xl bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-300 dark:border-amber-800/60 backdrop-blur-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
            ⭐
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              একাডেমিক নিয়মনীতি: প্রধান শিক্ষক ও এক শিক্ষক বণ্টন পদ্ধতি (One Primary Teacher Rule)
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              প্রতিটি শিক্ষাবর্ষে একটি জামাত ও শাখার একই বিষয়ে সর্বাধিক <strong>১ জন প্রধান শিক্ষক (Primary Teacher)</strong> নিয়োগের নিয়ম স্বয়ংক্রিয়ভাবে ডাটাবেস দ্বারা সুরক্ষিত। এক বিষয়ে একই শিক্ষককে দ্বিতীয়বার ডুপ্লিকেট যুক্ত করা প্রতিরোধ করা হয়।
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট সক্রিয় দায়িত্ব</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalActiveAssignments}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
            ক্লাস ও বিষয় বণ্টন তালিকা
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>প্রধান শিক্ষক (Primary)</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {primaryTeachersCount}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            মূল ওস্তাদ দায়িত্বপ্রাপ্ত
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>সহকারী শিক্ষক</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {assistantCount}
          </div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-1 block">
            সহযোগিতামূলক পাঠদান
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বিষয় শিক্ষক</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {subjectTeacherCount}
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            বিষয়ভিত্তিক শিক্ষক
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-teacher-assignments"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="শিক্ষকের নাম, শিক্ষক আইডি বা বিষয় দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Session */}
          <select
            id="filter-ta-session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">সকল সেশন</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            id="filter-ta-dept"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">সকল বিভাগ</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_bn}
              </option>
            ))}
          </select>

          {/* Role / Assignment Type */}
          <select
            id="filter-ta-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">সকল দায়িত্বের ধরন</option>
            <option value="primary">প্রধান শিক্ষক</option>
            <option value="assistant">সহকারী শিক্ষক</option>
            <option value="subject_teacher">বিষয় শিক্ষক</option>
            <option value="guest">অতিথি শিক্ষক</option>
          </select>

          {/* Status */}
          <select
            id="filter-ta-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="inactive">অব্যাহতি / নিষ্ক্রিয়</option>
          </select>
        </div>
      </div>

      {/* Teacher Assignments Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">শিক্ষকের নাম ও আইডি</th>
                <th className="px-6 py-4">শিক্ষাবর্ষ ও বিভাগ</th>
                <th className="px-6 py-4">জামাত ও শাখা</th>
                <th className="px-6 py-4">পাঠ্য বিষয় ও কোড</th>
                <th className="px-6 py-4 text-center">দায়িত্বের ধরন</th>
                <th className="px-6 py-4 text-center">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <span>কোনো শিক্ষক নিয়োগের তথ্য পাওয়া যায়নি</span>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((ta) => {
                  const roleConfig = TYPE_CONFIG[ta.assignment_type] || TYPE_CONFIG.subject_teacher;
                  return (
                    <tr
                      key={ta.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Teacher Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ta.teacher_photo_url ? (
                            <img
                              src={ta.teacher_photo_url}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-200 dark:border-amber-800 shrink-0">
                              {ta.teacher_name_bn?.charAt(0) || 'উ'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {ta.teacher_name_bn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {ta.teacher_employee_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Session & Dept */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {ta.session_name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ta.department_name_bn}
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-teal-700 dark:text-teal-400">
                          {ta.class_name_bn}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ta.section_name}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ta.subject_code}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ta.subject_name_bn}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${roleConfig.badgeClass}`}
                        >
                          {roleConfig.labelBn}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ta.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {ta.status === 'active' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{ta.status === 'active' ? 'সক্রিয়' : 'অব্যাহতি'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-edit-assignment-${ta.id}`}
                            title="দায়িত্ব পরিবর্তন"
                            onClick={() => onOpenEditModal(ta)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-assignment-${ta.id}`}
                            title="অব্যাহতি / মুছে ফেলুন"
                            onClick={() => onDeleteAssignment(ta)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>কোনো শিক্ষক নিয়োগের তথ্য পাওয়া যায়নি</span>
          </div>
        ) : (
          filteredAssignments.map((ta) => {
            const roleConfig = TYPE_CONFIG[ta.assignment_type] || TYPE_CONFIG.subject_teacher;
            return (
              <div
                key={ta.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {ta.teacher_photo_url ? (
                      <img
                        src={ta.teacher_photo_url}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-xs">
                        {ta.teacher_name_bn?.charAt(0) || 'উ'}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {ta.teacher_name_bn}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {ta.teacher_employee_id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${roleConfig.badgeClass}`}
                  >
                    {roleConfig.labelBn}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">
                    {ta.subject_name_bn} ({ta.subject_code})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ta.class_name_bn} • {ta.section_name} ({ta.department_name_bn})
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold ${
                      ta.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {ta.status === 'active' ? 'সক্রিয় দায়িত্ব' : 'অব্যাহতি'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(ta)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAssignment(ta)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

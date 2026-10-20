import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  BookOpen,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  UserPlus,
} from 'lucide-react';
import { DbClassSubject, DbSubject } from '../../types/step6';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
} from '../../types/step5';

interface ClassSubjectsTabProps {
  classSubjects: DbClassSubject[];
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  subjects: DbSubject[];
  onOpenAssignModal: () => void;
  onRemoveClassSubject: (item: DbClassSubject) => void;
  onQuickAssignTeacher?: (classSubject: DbClassSubject) => void;
}

export const ClassSubjectsTab: React.FC<ClassSubjectsTabProps> = ({
  classSubjects,
  sessions,
  departments,
  classes,
  sections,
  subjects,
  onOpenAssignModal,
  onRemoveClassSubject,
  onQuickAssignTeacher,
}) => {
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Class Subjects
  const filteredItems = useMemo(() => {
    return classSubjects.filter((cs) => {
      const matchesSession = selectedSession === 'all' || cs.academic_session_id === selectedSession;
      const matchesDept = selectedDept === 'all' || cs.department_id === selectedDept;
      const matchesClass = selectedClass === 'all' || cs.class_id === selectedClass;
      const matchesSection =
        selectedSection === 'all' || (!cs.section_id && selectedSection === '') || cs.section_id === selectedSection;

      const matchesSearch =
        cs.subject_name_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.subject_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.class_name_bn?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSession && matchesDept && matchesClass && matchesSection && matchesSearch;
    });
  }, [classSubjects, selectedSession, selectedDept, selectedClass, selectedSection, searchTerm]);

  // Classes filtered by selected department
  const availableClasses = classes.filter(
    (c) => selectedDept === 'all' || c.department_id === selectedDept
  );

  // Sections filtered by selected class
  const availableSections = sections.filter(
    (s) => selectedClass === 'all' || s.class_id === selectedClass
  );

  // Quick stats
  const totalAssigned = classSubjects.length;
  const withPrimaryTeacher = classSubjects.filter(
    (cs) => cs.primary_teacher_name && cs.primary_teacher_name !== 'নির্ধারিত নেই'
  ).length;
  const pendingTeacher = totalAssigned - withPrimaryTeacher;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <span>শ্রেণিভিত্তিক বিষয় বণ্টন (Class Curriculum Assignment)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কোন জামাত ও শাখায় কোন কোন বিষয় পাঠদান করা হবে তার তালিকা ও শিক্ষক সমন্বয়
          </p>
        </div>

        <button
          id="btn-assign-class-subject-top"
          onClick={onOpenAssignModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-98 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>শ্রেণিতে বিষয় সংযুক্তি</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট শ্রেণি-বিষয় সংযুক্তি</span>
            <Layers className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalAssigned}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
            সিলেবাসে অন্তর্ভুক্ত পাঠ্যসমূহ
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>প্রধান শিক্ষক নির্ধারিত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {withPrimaryTeacher}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            দায়িত্বপ্রাপ্ত প্রধান ওস্তাদ যুক্ত
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>শিক্ষক নিয়োগ অপেক্ষমাণ</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingTeacher}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
            {pendingTeacher > 0 ? 'প্রধান শিক্ষক নির্ধারণ বাকি' : 'সকল বিষয়ে শিক্ষক নির্ধারিত'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-class-subjects"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="বিষয় বা শ্রেণি খুঁজুন..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all"
            />
          </div>

          {/* Session Filter */}
          <select
            id="filter-cs-session"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
          >
            <option value="all">সকল শিক্ষাবর্ষ</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            id="filter-cs-dept"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedClass('all');
              setSelectedSection('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
          >
            <option value="all">সকল বিভাগ</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_bn}
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            id="filter-cs-class"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('all');
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
          >
            <option value="all">সকল শ্রেণি / জামাত</option>
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_bn}
              </option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            id="filter-cs-section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-hidden"
          >
            <option value="all">সকল শাখা</option>
            {availableSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name_bn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Subjects Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">শিক্ষাবর্ষ ও বিভাগ</th>
                <th className="px-6 py-4">জামাত ও শাখা</th>
                <th className="px-6 py-4">পাঠ্য বিষয় ও কোড</th>
                <th className="px-6 py-4">প্রধান শিক্ষক (Primary Teacher)</th>
                <th className="px-6 py-4 text-center">নিযুক্ত শিক্ষক</th>
                <th className="px-6 py-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <span>কোনো শ্রেণি-বিষয় সংযুক্তি পাওয়া যায়নি</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map((cs) => {
                  const hasPrimary = cs.primary_teacher_name && cs.primary_teacher_name !== 'নির্ধারিত নেই';
                  return (
                    <tr
                      key={cs.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Session & Dept */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {cs.session_name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {cs.department_name_bn}
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-teal-700 dark:text-teal-400">
                          {cs.class_name_bn}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {cs.section_name}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cs.subject_code}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {cs.subject_name_bn}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {cs.subject_name_en}
                        </div>
                      </td>

                      {/* Primary Teacher */}
                      <td className="px-6 py-4">
                        {hasPrimary ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{cs.primary_teacher_name}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-rose-600 dark:text-rose-400 text-xs font-semibold">
                              নির্ধারিত নেই
                            </span>
                            {onQuickAssignTeacher && (
                              <button
                                onClick={() => onQuickAssignTeacher(cs)}
                                className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-200 transition-colors"
                              >
                                শিক্ষক নিয়োগ →
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Total Teachers */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          {cs.assigned_teachers_count || 0} জন
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-remove-class-subject-${cs.id}`}
                          title="শ্রেণি থেকে বিষয় প্রত্যাহার করুন"
                          onClick={() => onRemoveClassSubject(cs)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>কোনো শ্রেণি-বিষয় সংযুক্তি পাওয়া যায়নি</span>
          </div>
        ) : (
          filteredItems.map((cs) => {
            const hasPrimary = cs.primary_teacher_name && cs.primary_teacher_name !== 'নির্ধারিত নেই';
            return (
              <div
                key={cs.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                      {cs.subject_code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cs.subject_name_bn}
                    </h3>
                  </div>
                  <button
                    onClick={() => onRemoveClassSubject(cs)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold">{cs.class_name_bn}</span> • <span>{cs.section_name}</span> ({cs.department_name_bn})
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px]">
                    <span className="text-slate-400">প্রধান শিক্ষক: </span>
                    <span className={hasPrimary ? 'font-bold text-emerald-600' : 'text-rose-500 font-semibold'}>
                      {cs.primary_teacher_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    মোট শিক্ষক: {cs.assigned_teachers_count || 0}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

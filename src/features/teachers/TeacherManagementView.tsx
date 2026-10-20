import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  UserMinus,
  Plus,
  Download,
  Search,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  Eye,
  Edit,
  Printer,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DbTeacher, TeacherStatus, TeacherEmploymentType, TeacherGender } from '../../types/step3';
import { useTeachers } from './useTeachers';
import { TeacherRegistrationModal } from './TeacherRegistrationModal';
import { TeacherProfileModal } from './TeacherProfileModal';
import { TeacherIdCardModal } from './TeacherIdCardModal';
import { TeacherStatusModal } from './TeacherStatusModal';

export const TeacherManagementView: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const {
    teachers,
    totalCount,
    stats,
    designations,
    departments,
    filters,
    setFilters,
    isLoading,
    permissions,
    refresh,
    exportToCsv,
    softDeleteTeacher,
  } = useTeachers();

  // View state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedTeacher, setSelectedTeacher] = useState<DbTeacher | null>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<DbTeacher | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
  const [teacherForIdCard, setTeacherForIdCard] = useState<DbTeacher | null>(null);
  const [teacherForStatusChange, setTeacherForStatusChange] = useState<DbTeacher | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDesignation, setFilterDesignation] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');

  // Filter local dataset
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      // 1. Search Query (BN, EN, ID, Phone, Email, Specialization)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBn = teacher.full_name_bn.toLowerCase().includes(q);
        const matchEn = teacher.full_name_en.toLowerCase().includes(q);
        const matchId = teacher.teacher_id.toLowerCase().includes(q);
        const matchPhone = teacher.primary_mobile.toLowerCase().includes(q);
        const matchEmail = teacher.email?.toLowerCase().includes(q) || false;
        const matchSpec = teacher.specialization?.toLowerCase().includes(q) || false;

        if (!matchBn && !matchEn && !matchId && !matchPhone && !matchEmail && !matchSpec) {
          return false;
        }
      }

      // 2. Designation
      if (filterDesignation !== 'all' && teacher.designation_id !== filterDesignation) {
        return false;
      }

      // 3. Department
      if (filterDepartment !== 'all' && teacher.department_id !== filterDepartment) {
        return false;
      }

      // 4. Status
      if (filterStatus !== 'all' && teacher.employment_status !== filterStatus) {
        return false;
      }

      // 5. Employment Type
      if (filterType !== 'all' && teacher.employment_type !== filterType) {
        return false;
      }

      // 6. Gender
      if (filterGender !== 'all' && teacher.gender !== filterGender) {
        return false;
      }

      return true;
    });
  }, [teachers, searchQuery, filterDesignation, filterDepartment, filterStatus, filterType, filterGender]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDesignation('all');
    setFilterDepartment('all');
    setFilterStatus('all');
    setFilterType('all');
    setFilterGender('all');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'pending':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'on_leave':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'resigned':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'terminated':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {t.teachers.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {stats.total} জন
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.teachers.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportToCsv(filteredTeachers)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {t.teachers.exportCsv}
          </button>

          {permissions.canCreate && (
            <button
              type="button"
              onClick={() => {
                setTeacherToEdit(null);
                setIsRegistrationOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t.teachers.addNewTeacher}
            </button>
          )}
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.total}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
          </div>
        </div>

        {/* Active */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.active}</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.pending}</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.on_leave}</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.on_leave}</p>
          </div>
        </div>

        {/* Inactive */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.inactive}</p>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">{stats.inactive}</p>
          </div>
        </div>

        {/* Resigned / Terminated */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.teachers.stats.resigned}</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats.resigned + stats.terminated}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        {/* Search input + mode toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.teachers.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="টেবিল ভিউ"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="ফিল্টার রিসেট"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          {/* Designation */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.teachers.filterDesignation}
            </label>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.teachers.allDesignations}</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {language === 'bn' ? d.name_bn : d.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.teachers.filterDepartment}
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.teachers.allDepartments}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {language === 'bn' ? dept.name_bn : dept.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.teachers.filterStatus}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.teachers.allStatuses}</option>
              <option value="active">{t.teachers.status.active}</option>
              <option value="pending">{t.teachers.status.pending}</option>
              <option value="on_leave">{t.teachers.status.on_leave}</option>
              <option value="inactive">{t.teachers.status.inactive}</option>
              <option value="resigned">{t.teachers.status.resigned}</option>
              <option value="terminated">{t.teachers.status.terminated}</option>
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.teachers.filterEmploymentType}
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.teachers.allEmploymentTypes}</option>
              <option value="full_time">{t.teachers.employmentType.full_time}</option>
              <option value="part_time">{t.teachers.employmentType.part_time}</option>
              <option value="contract">{t.teachers.employmentType.contract}</option>
              <option value="temporary">{t.teachers.employmentType.temporary}</option>
            </select>
          </div>

          {/* Gender */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t.teachers.filterGender}
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.teachers.allGenders}</option>
              <option value="male">{t.teachers.gender.male}</option>
              <option value="female">{t.teachers.gender.female}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Content View: Table or Cards */}
      {filteredTeachers.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-200/80 dark:border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">{t.teachers.table.teacherId}</th>
                    <th className="py-3 px-4">{t.teachers.table.name}</th>
                    <th className="py-3 px-4">{t.teachers.table.designation}</th>
                    <th className="py-3 px-4">{t.teachers.table.contact}</th>
                    <th className="py-3 px-4">{t.teachers.table.qualification}</th>
                    <th className="py-3 px-4">{t.teachers.table.joiningDate}</th>
                    <th className="py-3 px-4">{t.teachers.table.status}</th>
                    <th className="py-3 px-4 text-right">{t.teachers.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                  {filteredTeachers.map((teacher) => {
                    const desig = designations.find((d) => d.id === teacher.designation_id);
                    const desigName = language === 'bn' ? desig?.name_bn || teacher.designation_id : desig?.name_en || teacher.designation_id;
                    const dept = departments.find((d) => d.id === teacher.department_id);
                    const deptName = language === 'bn' ? dept?.name_bn || teacher.department_id : dept?.name_en || teacher.department_id;

                    return (
                      <tr
                        key={teacher.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        {/* Teacher ID */}
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                          {teacher.teacher_id}
                        </td>

                        {/* Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0 flex items-center justify-center">
                              {teacher.photo ? (
                                <img src={teacher.photo} alt={teacher.full_name_en} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-slate-500 dark:text-slate-400">
                                  {teacher.full_name_bn.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">{teacher.full_name_bn}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{teacher.full_name_en}</p>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Department */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{desigName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{deptName}</p>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4">
                          <p className="font-mono text-slate-800 dark:text-slate-200">{teacher.primary_mobile}</p>
                          {teacher.email && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {teacher.email}
                            </p>
                          )}
                        </td>

                        {/* Qualification */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.highest_qualification}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[140px]">
                            {teacher.specialization}
                          </p>
                        </td>

                        {/* Joining Date */}
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {teacher.joining_date}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              teacher.employment_status
                            )}`}
                          >
                            {(t.teachers.status as any)[teacher.employment_status] || teacher.employment_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedTeacher(teacher)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="প্রোফাইল দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setTeacherForIdCard(teacher)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="আইডি কার্ড"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {permissions.canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTeacherToEdit(teacher);
                                  setIsRegistrationOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                title="তথ্য সম্পাদনা"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {permissions.canChangeStatus && (
                              <button
                                type="button"
                                onClick={() => setTeacherForStatusChange(teacher)}
                                className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                                title="স্ট্যাটাস পরিবর্তন"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
              <span>মোট {filteredTeachers.length} জন শিক্ষকের তথ্য প্রদর্শিত হচ্ছে</span>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => {
              const desig = designations.find((d) => d.id === teacher.designation_id);
              const desigName = language === 'bn' ? desig?.name_bn || teacher.designation_id : desig?.name_en || teacher.designation_id;
              const dept = departments.find((d) => d.id === teacher.department_id);
              const deptName = language === 'bn' ? dept?.name_bn || teacher.department_id : dept?.name_en || teacher.department_id;

              return (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-emerald-500/30 shrink-0 flex items-center justify-center shadow-xs">
                      {teacher.photo ? (
                        <img src={teacher.photo} alt={teacher.full_name_en} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                          {teacher.full_name_bn.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {teacher.teacher_id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            teacher.employment_status
                          )}`}
                        >
                          {(t.teachers.status as any)[teacher.employment_status] || teacher.employment_status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {teacher.full_name_bn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{teacher.full_name_en}</p>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                        {desigName} • {deptName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>মোবাইল:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {teacher.primary_mobile}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>সর্বোচ্চ ডিগ্রি:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {teacher.highest_qualification}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>যোগদান:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{teacher.joining_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setTeacherForIdCard(teacher)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      আইডি কার্ড
                    </button>

                    <div className="flex items-center gap-1">
                      {permissions.canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherToEdit(teacher);
                            setIsRegistrationOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedTeacher(teacher)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        প্রোফাইল
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {searchQuery || filterDesignation !== 'all' || filterDepartment !== 'all'
              ? t.teachers.noSearchResults
              : t.teachers.emptyStateTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
            {t.teachers.emptyStateSubtitle}
          </p>
          {permissions.canCreate && (
            <button
              type="button"
              onClick={() => {
                setTeacherToEdit(null);
                setIsRegistrationOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.teachers.addNewTeacher}
            </button>
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Registration Modal (Add / Edit) */}
      {isRegistrationOpen && (
        <TeacherRegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => {
            setIsRegistrationOpen(false);
            setTeacherToEdit(null);
          }}
          teacherToEdit={teacherToEdit}
          onSaved={() => {
            refresh();
          }}
        />
      )}

      {/* 2. Detailed Profile View Modal */}
      {selectedTeacher && (
        <TeacherProfileModal
          isOpen={!!selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          teacher={selectedTeacher}
          designations={designations}
          departments={departments}
          onEdit={(teach) => {
            setSelectedTeacher(null);
            setTeacherToEdit(teach);
            setIsRegistrationOpen(true);
          }}
          onTeacherUpdated={(updated) => {
            setSelectedTeacher(updated);
            refresh();
          }}
          onTeacherDeleted={() => {
            setSelectedTeacher(null);
            refresh();
          }}
        />
      )}

      {/* 3. Teacher ID Card Modal */}
      {teacherForIdCard && (
        <TeacherIdCardModal
          isOpen={!!teacherForIdCard}
          onClose={() => setTeacherForIdCard(null)}
          teacher={teacherForIdCard}
          designations={designations}
          departments={departments}
        />
      )}

      {/* 4. Quick Status Change Modal */}
      {teacherForStatusChange && (
        <TeacherStatusModal
          isOpen={!!teacherForStatusChange}
          onClose={() => setTeacherForStatusChange(null)}
          teacher={teacherForStatusChange}
          onStatusUpdated={() => {
            refresh();
          }}
        />
      )}
    </div>
  );
};

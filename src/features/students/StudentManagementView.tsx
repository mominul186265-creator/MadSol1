import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStudents } from './useStudents';
import { DbStudent, StudentStatus } from '../../types/step2';
import { Button } from '../../components/common/Button';
import { StudentTable } from './StudentTable';
import { StudentCardGrid } from './StudentCardGrid';
import { AddStudentModal } from './AddStudentModal';
import { StudentProfileView } from './StudentProfileView';
import { StudentIDCardModal } from './StudentIDCardModal';
import { StudentDeleteDialog } from './StudentDeleteDialog';
import {
  GraduationCap,
  Plus,
  Download,
  Search,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  Users,
  CheckCircle2,
  Clock,
  UserX,
  Sparkles,
  AlertCircle,
  Table,
} from 'lucide-react';

export const StudentManagementView: React.FC = () => {
  const { language } = useLanguage();
  const {
    students,
    departments,
    classes,
    sections,
    stats,
    isLoading,
    permissions,
    createStudent,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
    getNextStudentId,
    isStudentIdUnique,
    isRollUnique,
    getStudentDocuments,
    addStudentDocument,
    deleteStudentDocument,
    getStudentActivities,
    exportToCsv,
  } = useStudents();

  // Active view mode: Table or Card Grid
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Currently inspected student in full profile view
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<DbStudent | null>(null);

  // Student being edited or created in Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<DbStudent | null>(null);

  // Student selected for ID card
  const [studentForIdCard, setStudentForIdCard] = useState<DbStudent | null>(null);

  // Student selected for Soft Delete
  const [studentToDelete, setStudentToDelete] = useState<DbStudent | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Available sessions extracted from data
  const availableSessions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.academic_session))).filter(Boolean);
    if (!list.includes('2026')) list.unshift('2026');
    return list;
  }, [students]);

  // Dependent classes for filter
  const filteredClasses = useMemo(() => {
    if (!selectedDepartment) return classes;
    return classes.filter((c) => c.department_id === selectedDepartment);
  }, [classes, selectedDepartment]);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Query (BN name, EN name, Student ID, Roll, Mobile)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBn = s.full_name_bn.toLowerCase().includes(q);
        const matchEn = s.full_name_en.toLowerCase().includes(q);
        const matchId = s.student_id.toLowerCase().includes(q);
        const matchRoll = s.roll_number.toLowerCase().includes(q);
        const matchMobile = s.mobile?.toLowerCase().includes(q) || false;
        const matchEmergency = s.emergency_mobile?.toLowerCase().includes(q) || false;
        const matchGuardian = s.emergency_contact_name.toLowerCase().includes(q);

        if (!matchBn && !matchEn && !matchId && !matchRoll && !matchMobile && !matchEmergency && !matchGuardian) {
          return false;
        }
      }

      // 2. Department
      if (selectedDepartment && s.department_id !== selectedDepartment) {
        return false;
      }

      // 3. Class
      if (selectedClass && s.class_id !== selectedClass) {
        return false;
      }

      // 4. Section
      if (selectedSection && s.section_id !== selectedSection) {
        return false;
      }

      // 5. Session
      if (selectedSession && s.academic_session !== selectedSession) {
        return false;
      }

      // 6. Gender
      if (selectedGender && s.gender !== selectedGender) {
        return false;
      }

      // 7. Status
      if (selectedStatus && s.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    students,
    searchQuery,
    selectedDepartment,
    selectedClass,
    selectedSection,
    selectedSession,
    selectedGender,
    selectedStatus,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedSession('');
    setSelectedGender('');
    setSelectedStatus('');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedDepartment) ||
    Boolean(selectedClass) ||
    Boolean(selectedSection) ||
    Boolean(selectedSession) ||
    Boolean(selectedGender) ||
    Boolean(selectedStatus);

  // Profile View Sub-screen
  if (selectedProfileStudent) {
    const currentLiveStudent =
      students.find((s) => s.id === selectedProfileStudent.id) || selectedProfileStudent;

    return (
      <StudentProfileView
        student={currentLiveStudent}
        departments={departments}
        classes={classes}
        sections={sections}
        onBack={() => setSelectedProfileStudent(null)}
        onEdit={(stu) => {
          setStudentToEdit(stu);
          setIsAddModalOpen(true);
        }}
        onDelete={(stu) => setStudentToDelete(stu)}
        onChangeStatus={changeStudentStatus}
        getDocuments={getStudentDocuments}
        addDocument={addStudentDocument}
        deleteDocument={deleteStudentDocument}
        getActivities={getStudentActivities}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
        canStatus={permissions.canStatus}
        canDocuments={permissions.canDocuments}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {language === 'bn' ? 'শিক্ষার্থী ব্যবস্থাপনা' : 'Student Management'}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {stats.total} {language === 'bn' ? 'জন' : 'Students'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'মাদ্রাসার ভর্তি, প্রোফাইল, নথিপত্র এবং একাডেমিক রেকর্ড পরিচালনা'
                  : 'Manage madrasa enrollments, digital ID cards, and academic archives'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {permissions.canExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv(filteredStudents)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রপ্তানি (CSV)' : 'Export CSV'}</span>
            </Button>
          )}

          {permissions.canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStudentToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="gap-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন শিক্ষার্থী ভর্তি' : 'Add Student'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Real Statistics Cards from Database (Zero Mock Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => setSelectedStatus('')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === ''
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'সর্বমোট শিক্ষার্থী' : 'Total Students'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'জন' : ''}
            </span>
          </div>
        </div>

        {/* Active Students */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'active' ? '' : 'active')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'active'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'নিয়মিত (সক্রিয়)' : 'Active Students'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'জন' : ''}
            </span>
          </div>
        </div>

        {/* Pending Admissions */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'pending' ? '' : 'pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'pending'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'অপেক্ষমান ভর্তি' : 'Pending Admission'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats.pending}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'জন' : ''}
            </span>
          </div>
        </div>

        {/* On Leave / Inactive */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'on_leave' ? '' : 'on_leave')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'on_leave'
              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'ছুটিতে শিক্ষার্থী' : 'On Leave'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">
              {stats.on_leave}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'জন' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'নাম (বাংলা বা ইংরেজি), শিক্ষার্থী আইডি, রোল, অভিভাবকের মোবাইল...'
                  : 'Search by student name, ID, roll, mobile...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'তালিকা ভিউ' : 'Table'}</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'গ্রিড ভিউ' : 'Grid'}</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedClass('');
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল বিভাগ' : 'All Departments'}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {language === 'bn' ? d.name_bn : d.name_en}
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল জামাত / শ্রেণি' : 'All Classes'}</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.name_bn : c.name_en}
              </option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল শাখা' : 'All Sections'}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {language === 'bn' ? s.name_bn : s.name_en}
              </option>
            ))}
          </select>

          {/* Session Filter */}
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল সেশন' : 'All Sessions'}</option>
            {availableSessions.map((sess) => (
              <option key={sess} value={sess}>
                {sess}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল লিঙ্গ' : 'All Genders'}</option>
            <option value="male">{language === 'bn' ? 'ছাত্র' : 'Male'}</option>
            <option value="female">{language === 'bn' ? 'ছাত্রী' : 'Female'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
          >
            <option value="">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="active">{language === 'bn' ? 'নিয়মিত (Active)' : 'Active'}</option>
            <option value="pending">{language === 'bn' ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
            <option value="on_leave">{language === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}</option>
            <option value="inactive">{language === 'bn' ? 'অনিয়মিত (Inactive)' : 'Inactive'}</option>
            <option value="transferred">{language === 'bn' ? 'ছাড়পত্রপ্রাপ্ত (Transferred)' : 'Transferred'}</option>
            <option value="graduated">{language === 'bn' ? 'উত্তীর্ণ (Graduated)' : 'Graduated'}</option>
          </select>
        </div>

        {/* Active Filter Clear Prompt */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-500">
              {language === 'bn'
                ? `ফিল্টার প্রয়োগের পর পাওয়া গেছে: ${filteredStudents.length} জন`
                : `Matched: ${filteredStudents.length} students`}
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <StudentTable
          students={filteredStudents}
          departments={departments}
          classes={classes}
          sections={sections}
          onView={(stu) => setSelectedProfileStudent(stu)}
          onEdit={(stu) => {
            setStudentToEdit(stu);
            setIsAddModalOpen(true);
          }}
          onDelete={(stu) => setStudentToDelete(stu)}
          onPrintId={(stu) => setStudentForIdCard(stu)}
          onChangeStatus={changeStudentStatus}
          canEdit={permissions.canEdit}
          canDelete={permissions.canDelete}
          canStatus={permissions.canStatus}
        />
      ) : (
        <StudentCardGrid
          students={filteredStudents}
          departments={departments}
          classes={classes}
          sections={sections}
          onView={(stu) => setSelectedProfileStudent(stu)}
          onEdit={(stu) => {
            setStudentToEdit(stu);
            setIsAddModalOpen(true);
          }}
          onDelete={(stu) => setStudentToDelete(stu)}
          onPrintId={(stu) => setStudentForIdCard(stu)}
          canEdit={permissions.canEdit}
          canDelete={permissions.canDelete}
        />
      )}

      {/* Add / Edit Student Multi-Step Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setStudentToEdit(null);
        }}
        onSuccess={(saved) => {
          // Open profile of newly added/edited student
          setSelectedProfileStudent(saved);
        }}
        editStudent={studentToEdit}
        departments={departments}
        classes={classes}
        sections={sections}
        getNextId={getNextStudentId}
        checkIdUnique={isStudentIdUnique}
        checkRollUnique={isRollUnique}
        createStudent={createStudent}
        updateStudent={updateStudent}
      />

      {/* ID Card Modal */}
      <StudentIDCardModal
        isOpen={Boolean(studentForIdCard)}
        student={studentForIdCard}
        onClose={() => setStudentForIdCard(null)}
        classNameText={
          classes.find((c) => c.id === studentForIdCard?.class_id)?.name_bn
        }
        departmentNameText={
          departments.find((d) => d.id === studentForIdCard?.department_id)?.name_bn
        }
      />

      {/* Soft Delete Dialog */}
      <StudentDeleteDialog
        isOpen={Boolean(studentToDelete)}
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={async (id) => {
          await deleteStudent(id);
          if (selectedProfileStudent?.id === id) {
            setSelectedProfileStudent(null);
          }
        }}
      />
    </div>
  );
};

/**
 * MadSol Database Engine (Step 1 Core Storage & Relational Models)
 * Provides persistent database operations for:
 * - institutions
 * - users
 * - roles
 * - permissions
 * - role_permissions
 * - user_sessions
 * - activity_logs
 */

import {
  DbInstitution,
  DbUser,
  DbRole,
  DbPermission,
  DbRolePermission,
  DbUserSession,
  DbActivityLog,
  RoleSlug,
  UserStatus,
} from '../types/step1';
import {
  DbStudent,
  DbStudentDocument,
  DbStudentActivity,
  DbDepartment,
  DbClass,
  DbSection,
  StudentStatus,
  StudentGender,
  BloodGroup,
  DocumentCategory,
  StudentFilterOptions,
  StudentStats,
} from '../types/step2';
import {
  DbTeacher,
  DbTeacherQualification,
  DbTeacherDocument,
  DbTeacherActivity,
  DbTeacherDesignation,
  TeacherStatus,
  TeacherFilterOptions,
  TeacherStats,
} from '../types/step3';
import {
  DbAttendanceRecord,
  DbLeaveApplication,
  AttendanceStatus,
  AttendanceTargetType,
  AttendanceStats,
  AttendanceFilterOptions,
  LeaveStatus,
  LeaveType,
} from '../types/step4';
import {
  DbAcademicSession,
  DbAcademicDepartment,
  DbAcademicClass,
  DbAcademicSection,
  DbStudentAcademicHistory,
  DbAcademicActivity,
  DbAcademicSettings,
  AcademicSessionStatus,
  DepartmentStatus,
  ClassStatus,
  SectionStatus,
  AcademicStudentStatus,
  AcademicActivityAction,
  AcademicStats,
} from '../types/step5';
import {
  DbSubject,
  DbSubjectDepartment,
  DbClassSubject,
  DbTeacherAssignment,
  DbSubjectActivity,
  SubjectCategory,
  SubjectStatus,
  ClassSubjectStatus,
  TeacherAssignmentType,
  TeacherAssignmentStatus,
  SubjectStats,
} from '../types/step6';
import {
  DayOfWeek,
  DbTimeSlot,
  DbClassRoom,
  DbClassRoutine,
  RoutineConflict,
  RoutineFilterOptions,
  RoutineStats,
  DAYS_OF_WEEK,
} from '../types/step7';
import { hashPasswordSync } from './crypto';
import { safeStorage } from './safeStorage';

// Storage keys
const STORAGE_KEYS = {
  INSTITUTIONS: 'madsol_db_institutions_v1',
  USERS: 'madsol_db_users_v1',
  ROLES: 'madsol_db_roles_v1',
  PERMISSIONS: 'madsol_db_permissions_v1',
  ROLE_PERMISSIONS: 'madsol_db_role_permissions_v1',
  SESSIONS: 'madsol_db_sessions_v1',
  ACTIVITY_LOGS: 'madsol_db_activity_logs_v1',
  STUDENTS: 'madsol_db_students_v1',
  STUDENT_DOCS: 'madsol_db_student_docs_v1',
  STUDENT_ACTIVITIES: 'madsol_db_student_activities_v1',
  DEPARTMENTS: 'madsol_db_departments_v1',
  CLASSES: 'madsol_db_classes_v1',
  SECTIONS: 'madsol_db_sections_v1',
  TEACHERS: 'madsol_db_teachers_v1',
  TEACHER_QUALIFICATIONS: 'madsol_db_teacher_qualifications_v1',
  TEACHER_DOCS: 'madsol_db_teacher_docs_v1',
  TEACHER_ACTIVITIES: 'madsol_db_teacher_activities_v1',
  TEACHER_DESIGNATIONS: 'madsol_db_teacher_designations_v1',
  ATTENDANCE: 'madsol_db_attendance_v1',
  LEAVE_APPLICATIONS: 'madsol_db_leave_apps_v1',
  ACADEMIC_SESSIONS: 'madsol_db_academic_sessions_v1',
  STUDENT_ACADEMIC_HISTORY: 'madsol_db_student_academic_history_v1',
  ACADEMIC_ACTIVITIES: 'madsol_db_academic_activities_v1',
  ACADEMIC_SETTINGS: 'madsol_db_academic_settings_v1',
  SUBJECTS: 'madsol_db_subjects_v1',
  SUBJECT_DEPARTMENTS: 'madsol_db_subject_departments_v1',
  CLASS_SUBJECTS: 'madsol_db_class_subjects_v1',
  TEACHER_ASSIGNMENTS: 'madsol_db_teacher_assignments_v1',
  SUBJECT_ACTIVITIES: 'madsol_db_subject_activities_v1',
  TIME_SLOTS: 'madsol_db_time_slots_v1',
  CLASS_ROOMS: 'madsol_db_class_rooms_v1',
  ROUTINES: 'madsol_db_routines_v1',
  INITIALIZED: 'madsol_db_initialized_v1',
};

// Seed Roles
const SEED_ROLES: DbRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'পুরো সিস্টেমের পূর্ণ নিয়ন্ত্রণ ও মাল্টি-ইনস্টিটিউশন রুট পারমিশন',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-inst-admin',
    name: 'Institution Admin',
    slug: 'institution_admin',
    description: 'নিজ শিক্ষা প্রতিষ্ঠানের পূর্ণ প্রাতিষ্ঠানিক ও ব্যবহারকারী নিয়ন্ত্রণ',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-principal',
    name: 'Principal / Director',
    slug: 'principal',
    description: 'একাডেমিক কার্যক্রম ও সার্বিক ব্যবস্থাপনা তদারকি',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-teacher',
    name: 'Teacher',
    slug: 'teacher',
    description: 'পাঠদান, ক্লাসরুম এবং নির্ধারিত দায়িত্ব ভিত্তিক অ্যাক্সেস',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-accountant',
    name: 'Accountant',
    slug: 'accountant',
    description: 'আর্থিক হিসাব, ফি এবং আয়-ব্যয় লেনদেন ব্যবস্থাপনা',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-guardian',
    name: 'Guardian',
    slug: 'guardian',
    description: 'অভিভাবক ড্যাশবোর্ড ও ব্যক্তিগত তথ্য অ্যাক্সেস',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'role-student',
    name: 'Student',
    slug: 'student',
    description: 'শিক্ষার্থী ব্যক্তিগত প্রোফাইল ও অগ্রগতি অ্যাক্সেস',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Permissions
const SEED_PERMISSIONS: DbPermission[] = [
  { id: 'perm-1', name: 'View Dashboard', slug: 'dashboard.view', description: 'ড্যাশবোর্ড পর্যবেক্ষণ' },
  { id: 'perm-2', name: 'Manage Institutions', slug: 'institution.manage', description: 'প্রতিষ্ঠান তৈরি ও কনফিগারেশন' },
  { id: 'perm-3', name: 'View Institution', slug: 'institution.view', description: 'প্রতিষ্ঠান বিবরণ দেখা' },
  { id: 'perm-4', name: 'Manage Users', slug: 'users.manage', description: 'ব্যবহারকারী তৈরি, সম্পাদনা, স্থগিত ও রোল পরিবর্তন' },
  { id: 'perm-5', name: 'View Users', slug: 'users.view', description: 'ব্যবহারকারী তালিকা পর্যবেক্ষণ' },
  { id: 'perm-6', name: 'Manage Settings', slug: 'settings.manage', description: 'প্রোফাইল, থিম, ভাষা ও পাসওয়ার্ড পরিবর্তন' },
  { id: 'perm-7', name: 'View Activity Logs', slug: 'activity_logs.view', description: 'সিস্টেম কার্যক্রম অডিট ট্রেইল দেখা' },
  // Step 2: Student Permissions
  { id: 'perm-std-1', name: 'View Students', slug: 'students.view', description: 'শিক্ষার্থী তালিকা ও প্রোফাইল দেখা' },
  { id: 'perm-std-2', name: 'Create Student', slug: 'students.create', description: 'নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন' },
  { id: 'perm-std-3', name: 'Edit Student', slug: 'students.edit', description: 'শিক্ষার্থীর তথ্য সম্পাদনা' },
  { id: 'perm-std-4', name: 'Change Student Status', slug: 'students.status', description: 'শিক্ষার্থীর স্ট্যাটাস পরিবর্তন' },
  { id: 'perm-std-5', name: 'Delete Student', slug: 'students.delete', description: 'শিক্ষার্থী সফট ডিলিট করা' },
  { id: 'perm-std-6', name: 'Export Students', slug: 'students.export', description: 'শিক্ষার্থী তালিকা এক্সপোর্ট করা' },
  { id: 'perm-std-7', name: 'Manage Student Documents', slug: 'students.documents', description: 'শিক্ষার্থীর ডকুমেন্টস আপলোড ও মুছা' },
  // Step 3: Teacher Permissions
  { id: 'perm-tch-1', name: 'View Teachers', slug: 'teachers.view', description: 'শিক্ষক তালিকা ও প্রোফাইল পর্যবেক্ষণ' },
  { id: 'perm-tch-2', name: 'Create Teacher', slug: 'teachers.create', description: 'নতুন শিক্ষক নিবন্ধন ও তথ্য সংরক্ষণ' },
  { id: 'perm-tch-3', name: 'Edit Teacher', slug: 'teachers.edit', description: 'শিক্ষকের তথ্য সম্পাদনা ও আপডেট' },
  { id: 'perm-tch-4', name: 'Change Teacher Status', slug: 'teachers.status', description: 'শিক্ষকের স্ট্যাটাস পরিবর্তন' },
  { id: 'perm-tch-5', name: 'Delete Teacher', slug: 'teachers.delete', description: 'শিক্ষক সফট ডিলিট করা' },
  { id: 'perm-tch-6', name: 'Export Teachers', slug: 'teachers.export', description: 'শিক্ষক তালিকা এক্সপোর্ট করা' },
  { id: 'perm-tch-7', name: 'Manage Teacher Documents', slug: 'teachers.documents', description: 'শিক্ষক ডকুমেন্টস আপলোড ও মুছা' },
  { id: 'perm-tch-8', name: 'Manage Teacher Account', slug: 'teachers.manage_account', description: 'শিক্ষকের লগইন অ্যাকাউন্ট তৈরি ও সংযোগ' },
  // Step 4: Attendance Permissions
  { id: 'perm-att-1', name: 'View Attendance', slug: 'attendance.view', description: 'হাজিরা পর্যবেক্ষণ ও উপস্থিতি রেকর্ড দেখা' },
  { id: 'perm-att-2', name: 'Record Attendance', slug: 'attendance.record', description: 'শিক্ষার্থী ও শিক্ষক দৈনিক ডিজিটাল হাজিরা গ্রহণ' },
  { id: 'perm-att-3', name: 'Edit Attendance', slug: 'attendance.edit', description: 'পূর্ববর্তী হাজিরা সংশোধন ও আপডেট' },
  { id: 'perm-att-4', name: 'Export Attendance', slug: 'attendance.export', description: 'হাজিরা শীট ও রিপোর্ট এক্সপোর্ট করা' },
  { id: 'perm-att-5', name: 'Manage Leaves', slug: 'attendance.leave_manage', description: 'ছুটির আবেদন ও অনুমোদন পরিচালনা' },
  // Step 5: Academic Management Permissions
  { id: 'perm-acd-1', name: 'View Academic', slug: 'academic.view', description: 'একাডেমিক সেশন, বিভাগ, শ্রেণি ও শাখা পর্যবেক্ষণ' },
  { id: 'perm-acd-2', name: 'Manage Academic Sessions', slug: 'academic.session_manage', description: 'একাডেমিক সেশন তৈরি, সম্পাদন ও সক্রিয় নির্ধারণ' },
  { id: 'perm-acd-3', name: 'Manage Departments', slug: 'academic.department_manage', description: 'একাডেমিক বিভাগ তৈরি, সম্পাদন ও ব্যবস্থাপনা' },
  { id: 'perm-acd-4', name: 'Manage Classes', slug: 'academic.class_manage', description: 'জামাত / শ্রেণি তৈরি, সম্পাদন ও ক্রম নির্ধারণ' },
  { id: 'perm-acd-5', name: 'Manage Sections', slug: 'academic.section_manage', description: 'শাখা তৈরি, সম্পাদন ও ধারণক্ষমতা ব্যবস্থাপনা' },
  { id: 'perm-acd-6', name: 'Assign Student Academic', slug: 'academic.student_assign', description: 'শিক্ষার্থীর সেশন, বিভাগ, শ্রেণি, শাখা ও রোল নির্ধারণ' },
  { id: 'perm-acd-7', name: 'Manage Academic Settings', slug: 'academic.settings_manage', description: 'একাডেমিক সাধারণ সেটিংস ও রুলস পরিচালনা' },
  // Step 6: Subject & Teacher Assignment Permissions
  { id: 'perm-sbj-1', name: 'View Subjects', slug: 'subjects.view', description: 'বিষয় তালিকা, বিস্তারিত ও শ্রেণি সংযুক্তি পর্যবেক্ষণ' },
  { id: 'perm-sbj-2', name: 'Manage Subjects', slug: 'subjects.manage', description: 'নতুন বিষয় তৈরি, সম্পাদন, বিভাগ সংযোগ ও ডিলিট' },
  { id: 'perm-sbj-3', name: 'Assign Class Subjects', slug: 'subjects.class_assign', description: 'শ্রেণি ও শাখায় বিষয় নির্ধারণ' },
  { id: 'perm-sbj-4', name: 'View Teacher Assignments', slug: 'teacher_assignments.view', description: 'শিক্ষক বিষয় ও ক্লাস দায়িত্ব পর্যবেক্ষণ' },
  { id: 'perm-sbj-5', name: 'Manage Teacher Assignments', slug: 'teacher_assignments.manage', description: 'শিক্ষকদের বিষয় ও প্রধান শিক্ষক হিসেবে নিয়োগ পরিচালনা' },
  // Step 7: Class Routine Permissions
  { id: 'perm-rtn-1', name: 'View Routine', slug: 'routine.view', description: 'ক্লাস ও শিক্ষক রুটিন পর্যবেক্ষণ' },
  { id: 'perm-rtn-2', name: 'Manage Routine', slug: 'routine.manage', description: 'ক্লাস রুটিন তৈরি, পরিবর্তন ও বাতিল করা' },
  { id: 'perm-rtn-3', name: 'Manage Time Slots', slug: 'routine.slots_manage', description: 'পিরিয়ড ও সময়সূচি টাইম স্লট পরিচালনা' },
  { id: 'perm-rtn-4', name: 'Manage Rooms', slug: 'routine.rooms_manage', description: 'শ্রেণিকক্ষ ও লোকেশন পরিচালনা' },
];

// Seed Role-Permissions Mapping
const SEED_ROLE_PERMISSIONS: DbRolePermission[] = [
  ...SEED_PERMISSIONS.map((p) => ({ role_id: 'role-super-admin', permission_id: p.id })),
  // Institution Admin (Full Student + Teacher + Attendance + Academic + Subject + Routine Management)
  { role_id: 'role-inst-admin', permission_id: 'perm-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-6' },
  { role_id: 'role-inst-admin', permission_id: 'perm-7' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-6' },
  { role_id: 'role-inst-admin', permission_id: 'perm-std-7' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-6' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-7' },
  { role_id: 'role-inst-admin', permission_id: 'perm-tch-8' },
  { role_id: 'role-inst-admin', permission_id: 'perm-att-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-att-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-att-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-att-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-att-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-6' },
  { role_id: 'role-inst-admin', permission_id: 'perm-acd-7' },
  { role_id: 'role-inst-admin', permission_id: 'perm-sbj-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-sbj-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-sbj-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-sbj-4' },
  { role_id: 'role-inst-admin', permission_id: 'perm-sbj-5' },
  { role_id: 'role-inst-admin', permission_id: 'perm-rtn-1' },
  { role_id: 'role-inst-admin', permission_id: 'perm-rtn-2' },
  { role_id: 'role-inst-admin', permission_id: 'perm-rtn-3' },
  { role_id: 'role-inst-admin', permission_id: 'perm-rtn-4' },
  // Principal / Director (Full Academic + Subject Oversight + Routine)
  { role_id: 'role-principal', permission_id: 'perm-1' },
  { role_id: 'role-principal', permission_id: 'perm-3' },
  { role_id: 'role-principal', permission_id: 'perm-5' },
  { role_id: 'role-principal', permission_id: 'perm-6' },
  { role_id: 'role-principal', permission_id: 'perm-std-1' },
  { role_id: 'role-principal', permission_id: 'perm-std-2' },
  { role_id: 'role-principal', permission_id: 'perm-std-3' },
  { role_id: 'role-principal', permission_id: 'perm-std-6' },
  { role_id: 'role-principal', permission_id: 'perm-std-7' },
  { role_id: 'role-principal', permission_id: 'perm-tch-1' },
  { role_id: 'role-principal', permission_id: 'perm-tch-2' },
  { role_id: 'role-principal', permission_id: 'perm-tch-3' },
  { role_id: 'role-principal', permission_id: 'perm-tch-6' },
  { role_id: 'role-principal', permission_id: 'perm-tch-7' },
  { role_id: 'role-principal', permission_id: 'perm-att-1' },
  { role_id: 'role-principal', permission_id: 'perm-att-2' },
  { role_id: 'role-principal', permission_id: 'perm-att-3' },
  { role_id: 'role-principal', permission_id: 'perm-att-4' },
  { role_id: 'role-principal', permission_id: 'perm-att-5' },
  { role_id: 'role-principal', permission_id: 'perm-acd-1' },
  { role_id: 'role-principal', permission_id: 'perm-acd-2' },
  { role_id: 'role-principal', permission_id: 'perm-acd-3' },
  { role_id: 'role-principal', permission_id: 'perm-acd-4' },
  { role_id: 'role-principal', permission_id: 'perm-acd-5' },
  { role_id: 'role-principal', permission_id: 'perm-acd-6' },
  { role_id: 'role-principal', permission_id: 'perm-sbj-1' },
  { role_id: 'role-principal', permission_id: 'perm-sbj-2' },
  { role_id: 'role-principal', permission_id: 'perm-sbj-3' },
  { role_id: 'role-principal', permission_id: 'perm-sbj-4' },
  { role_id: 'role-principal', permission_id: 'perm-sbj-5' },
  { role_id: 'role-principal', permission_id: 'perm-rtn-1' },
  { role_id: 'role-principal', permission_id: 'perm-rtn-2' },
  { role_id: 'role-principal', permission_id: 'perm-rtn-3' },
  { role_id: 'role-principal', permission_id: 'perm-rtn-4' },
  // Teacher (Record attendance + view assigned subjects, classes and routines)
  { role_id: 'role-teacher', permission_id: 'perm-1' },
  { role_id: 'role-teacher', permission_id: 'perm-6' },
  { role_id: 'role-teacher', permission_id: 'perm-std-1' },
  { role_id: 'role-teacher', permission_id: 'perm-tch-1' },
  { role_id: 'role-teacher', permission_id: 'perm-att-1' },
  { role_id: 'role-teacher', permission_id: 'perm-att-2' },
  { role_id: 'role-teacher', permission_id: 'perm-att-4' },
  { role_id: 'role-teacher', permission_id: 'perm-acd-1' },
  { role_id: 'role-teacher', permission_id: 'perm-sbj-1' },
  { role_id: 'role-teacher', permission_id: 'perm-sbj-4' },
  { role_id: 'role-teacher', permission_id: 'perm-rtn-1' },
  // Accountant (Basic View)
  { role_id: 'role-accountant', permission_id: 'perm-1' },
  { role_id: 'role-accountant', permission_id: 'perm-6' },
  { role_id: 'role-accountant', permission_id: 'perm-std-1' },
  { role_id: 'role-accountant', permission_id: 'perm-tch-1' },
  { role_id: 'role-accountant', permission_id: 'perm-att-1' },
  { role_id: 'role-accountant', permission_id: 'perm-acd-1' },
  { role_id: 'role-accountant', permission_id: 'perm-sbj-1' },
  { role_id: 'role-accountant', permission_id: 'perm-rtn-1' },
  // Guardian (View own child attendance & academic)
  { role_id: 'role-guardian', permission_id: 'perm-1' },
  { role_id: 'role-guardian', permission_id: 'perm-6' },
  { role_id: 'role-guardian', permission_id: 'perm-std-1' },
  { role_id: 'role-guardian', permission_id: 'perm-att-1' },
  { role_id: 'role-guardian', permission_id: 'perm-acd-1' },
  { role_id: 'role-guardian', permission_id: 'perm-sbj-1' },
  { role_id: 'role-guardian', permission_id: 'perm-rtn-1' },
  // Student (View own attendance & academic)
  { role_id: 'role-student', permission_id: 'perm-1' },
  { role_id: 'role-student', permission_id: 'perm-6' },
  { role_id: 'role-student', permission_id: 'perm-std-1' },
  { role_id: 'role-student', permission_id: 'perm-att-1' },
  { role_id: 'role-student', permission_id: 'perm-rtn-1' },
  { role_id: 'role-student', permission_id: 'perm-acd-1' },
  { role_id: 'role-student', permission_id: 'perm-sbj-1' },
];

// Seed Academic Sessions (Step 5)
export const SEED_ACADEMIC_SESSIONS: DbAcademicSession[] = [
  {
    id: 'sess-2026-001',
    institution_id: 'inst-001',
    name: '২০২৬ শিক্ষাবর্ষ',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
    is_active: true,
    created_at: '2025-12-15T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sess-2025-001',
    institution_id: 'inst-001',
    name: '২০২৫ শিক্ষাবর্ষ',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'completed',
    is_active: false,
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2025-12-31T23:59:59Z',
  },
  {
    id: 'sess-2027-001',
    institution_id: 'inst-001',
    name: '২০২৭ শিক্ষাবর্ষ',
    start_date: '2027-01-01',
    end_date: '2027-12-31',
    status: 'upcoming',
    is_active: false,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'sess-2026-002',
    institution_id: 'inst-002',
    name: '২০২৬ শিক্ষাবর্ষ',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
    is_active: true,
    created_at: '2025-12-15T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Seed Departments (Database-Driven)
export const SEED_DEPARTMENTS: DbDepartment[] = [
  {
    id: 'dept-001',
    institution_id: 'inst-001',
    name_bn: 'হিফজুল কুরআন বিভাগ',
    name_en: 'Hifzul Quran Department',
    code: 'HIFZ',
    description: 'হিফজুল কুরআন ও তাজবীদ প্রশিক্ষণ বিভাগ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-002',
    institution_id: 'inst-001',
    name_bn: 'কিতাব বিভাগ',
    name_en: 'Kitab Department',
    code: 'KITAB',
    description: 'দাওরায়ে হাদিস ও উচ্চতর কিতাব বিভাগ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-003',
    institution_id: 'inst-001',
    name_bn: 'নূরানী ও নাজেরা বিভাগ',
    name_en: 'Noorani & Nazera Department',
    code: 'NOORANI',
    description: 'প্রাথমিক কুরআন শিক্ষা ও নূরানী প্রশিক্ষণ বিভাগ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dept-004',
    institution_id: 'inst-002',
    name_bn: 'হিফজুল কুরআন বিভাগ',
    name_en: 'Hifz Department',
    code: 'HIFZ',
    description: 'হিফজুল কুরআন বিভাগ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Classes (Database-Driven)
export const SEED_CLASSES: DbClass[] = [
  {
    id: 'cls-001',
    institution_id: 'inst-001',
    department_id: 'dept-001',
    academic_session_id: 'sess-2026-001',
    name_bn: 'হিফজ সমাপ্তি জামাত',
    name_en: 'Hifz Final Class',
    code: 'HFZ-FIN',
    class_order: 1,
    description: 'হিফজ সমাপ্তি ও শোনানো জামাত',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cls-002',
    institution_id: 'inst-001',
    department_id: 'dept-001',
    academic_session_id: 'sess-2026-001',
    name_bn: 'হিফজ ১ম বর্ষ',
    name_en: 'Hifz 1st Year',
    code: 'HFZ-1',
    class_order: 2,
    description: 'হিফজ প্রথম বর্ষ প্রাথমিক প্যারা',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cls-003',
    institution_id: 'inst-001',
    department_id: 'dept-002',
    academic_session_id: 'sess-2026-001',
    name_bn: 'মিশকাত জামাত',
    name_en: 'Mishkat Class',
    code: 'MISHKAT',
    class_order: 3,
    description: 'হাদিস শাস্ত্রের উচ্চতর জামাত',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cls-004',
    institution_id: 'inst-001',
    department_id: 'dept-002',
    academic_session_id: 'sess-2026-001',
    name_bn: 'শরহে বেকায়া জামাত',
    name_en: 'Sharhe Beqaya Class',
    code: 'BEQAYA',
    class_order: 4,
    description: 'ফিকহ শাস্ত্রের ভিত্তি জামাত',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cls-005',
    institution_id: 'inst-001',
    department_id: 'dept-003',
    academic_session_id: 'sess-2026-001',
    name_bn: 'নূরানী ৩য় শ্রেণি',
    name_en: 'Noorani Class 3',
    code: 'NOOR-3',
    class_order: 5,
    description: 'নূরানী সমাপনী শ্রেণি',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cls-006',
    institution_id: 'inst-002',
    department_id: 'dept-004',
    academic_session_id: 'sess-2026-002',
    name_bn: 'হিফজ হিফজ জামাত',
    name_en: 'Hifz Class',
    code: 'HIFZ',
    class_order: 1,
    description: 'হিফজ সাধারণ শ্রেণি',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Sections
export const SEED_SECTIONS: DbSection[] = [
  {
    id: 'sec-001',
    institution_id: 'inst-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    academic_session_id: 'sess-2026-001',
    name_bn: 'ক শাখা',
    name_en: 'Section A',
    name: 'ক শাখা',
    code: 'SEC-A',
    capacity: 35,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sec-002',
    institution_id: 'inst-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    academic_session_id: 'sess-2026-001',
    name_bn: 'খ শাখা',
    name_en: 'Section B',
    name: 'খ শাখা',
    code: 'SEC-B',
    capacity: 35,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sec-003',
    institution_id: 'inst-001',
    department_id: 'dept-001',
    class_id: 'cls-002',
    academic_session_id: 'sess-2026-001',
    name_bn: 'ক শাখা',
    name_en: 'Section A',
    name: 'ক শাখা',
    code: 'SEC-A',
    capacity: 40,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Student Academic History (Step 5)
export const SEED_STUDENT_ACADEMIC_HISTORY: DbStudentAcademicHistory[] = [
  {
    id: 'sah-001',
    institution_id: 'inst-001',
    student_id: 'std-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    roll_number: '101',
    academic_status: 'active',
    start_date: '2026-01-01',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sah-002',
    institution_id: 'inst-001',
    student_id: 'std-002',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    roll_number: '102',
    academic_status: 'active',
    start_date: '2026-01-01',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sah-003',
    institution_id: 'inst-001',
    student_id: 'std-003',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-002',
    roll_number: '103',
    academic_status: 'active',
    start_date: '2026-01-01',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sah-004',
    institution_id: 'inst-001',
    student_id: 'std-004',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    roll_number: '201',
    academic_status: 'active',
    start_date: '2026-01-01',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sah-005',
    institution_id: 'inst-001',
    student_id: 'std-005',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    roll_number: '301',
    academic_status: 'active',
    start_date: '2026-01-01',
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z',
  },
];

// Seed Academic Settings (Step 5)
export const SEED_ACADEMIC_SETTINGS: DbAcademicSettings[] = [
  {
    id: 'set-acd-001',
    institution_id: 'inst-001',
    default_session_id: 'sess-2026-001',
    roll_generation_mode: 'manual',
    allow_duplicate_rolls_across_sections: false,
    auto_session_rollover: false,
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'set-acd-002',
    institution_id: 'inst-002',
    default_session_id: 'sess-2026-002',
    roll_generation_mode: 'manual',
    allow_duplicate_rolls_across_sections: false,
    auto_session_rollover: false,
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Seed Subjects (Step 6)
export const SEED_SUBJECTS: DbSubject[] = [
  {
    id: 'sbj-001',
    institution_id: 'inst-001',
    name_bn: 'পবিত্র কুরআনুল কারীম ও হিফজ',
    name_en: 'Holy Quran & Hifz',
    code: 'QUR-101',
    category: 'quran',
    description: 'নাজেরা, হিফজ ও সহীহ তিলাওয়াত ও তাজবীদ প্রশিক্ষণ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sbj-002',
    institution_id: 'inst-001',
    name_bn: 'বাংলা ভাষা ও সাহিত্য',
    name_en: 'Bangla Language & Literature',
    code: 'BAN-101',
    category: 'language',
    description: 'বাংলা ব্যাকরণ, বানানরীতি, পঠন ও সহজ সাহিত্য অনুশীলন',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sbj-003',
    institution_id: 'inst-001',
    name_bn: 'আরবি ব্যাকরণ (নাহু ও সরফ)',
    name_en: 'Arabic Grammar (Nahw & Sarf)',
    code: 'ARB-101',
    category: 'islamic',
    description: 'মিযানুছ ছরফ, ইলমুন নাহু ও আরবি ভাষার ব্যাকরণ',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sbj-004',
    institution_id: 'inst-001',
    name_bn: 'প্রাথমিক গণিত',
    name_en: 'Elementary Mathematics',
    code: 'MAT-101',
    category: 'mathematics',
    description: 'পাটিগণিত, প্রাথমিক জ্যামিতি ও ব্যবহারিক গণনা',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'sbj-005',
    institution_id: 'inst-001',
    name_bn: 'ইংরেজি ভাষা',
    name_en: 'English Language',
    code: 'ENG-101',
    category: 'language',
    description: 'মৌলিক ইংরেজি কথোপকথন, রিডিং ও রাইটিং দক্ষতা',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Subject Departments (Step 6)
export const SEED_SUBJECT_DEPARTMENTS: DbSubjectDepartment[] = [
  { id: 'sd-001', institution_id: 'inst-001', subject_id: 'sbj-001', department_id: 'dept-001', created_at: '2024-01-01T00:00:00Z' },
  { id: 'sd-002', institution_id: 'inst-001', subject_id: 'sbj-001', department_id: 'dept-003', created_at: '2024-01-01T00:00:00Z' },
  { id: 'sd-003', institution_id: 'inst-001', subject_id: 'sbj-002', department_id: 'dept-003', created_at: '2024-01-01T00:00:00Z' },
  { id: 'sd-004', institution_id: 'inst-001', subject_id: 'sbj-003', department_id: 'dept-002', created_at: '2024-01-01T00:00:00Z' },
  { id: 'sd-005', institution_id: 'inst-001', subject_id: 'sbj-004', department_id: 'dept-003', created_at: '2024-01-01T00:00:00Z' },
  { id: 'sd-006', institution_id: 'inst-001', subject_id: 'sbj-005', department_id: 'dept-003', created_at: '2024-01-01T00:00:00Z' },
];

// Seed Class Subjects (Step 6)
export const SEED_CLASS_SUBJECTS: DbClassSubject[] = [
  {
    id: 'cs-001',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005', // নূরানী ৩য় শ্রেণি
    subject_id: 'sbj-001',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cs-002',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    subject_id: 'sbj-002',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cs-003',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    subject_id: 'sbj-004',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cs-004',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001', // হিফজ সমাপ্তি জামাত
    subject_id: 'sbj-001',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cs-005',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003', // মিশকাত জামাত
    subject_id: 'sbj-003',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Seed Teacher Assignments (Step 6)
export const SEED_TEACHER_ASSIGNMENTS: DbTeacherAssignment[] = [
  {
    id: 'ta-001',
    institution_id: 'inst-001',
    teacher_id: 'tch-001', // হাফেজ ক্বারী ওমর ফারুক
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001', // ক শাখা
    subject_id: 'sbj-001',
    assignment_type: 'primary',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ta-002',
    institution_id: 'inst-001',
    teacher_id: 'tch-002', // মুফতি মাহমুদুল হাসান
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: null,
    subject_id: 'sbj-003',
    assignment_type: 'primary',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ta-003',
    institution_id: 'inst-001',
    teacher_id: 'tch-003', // মাওলানা জুবায়ের আহমেদ
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    section_id: 'sec-004',
    subject_id: 'sbj-002',
    assignment_type: 'primary',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Step 7: Seed Time Slots
export const SEED_TIME_SLOTS: DbTimeSlot[] = [
  {
    id: 'ts-001',
    institution_id: 'inst-001',
    name_bn: '১ম ঘণ্টা / ১ম পিরিয়ড',
    name_en: '1st Period',
    start_time: '08:00',
    end_time: '08:45',
    is_break: false,
    order_index: 1,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-002',
    institution_id: 'inst-001',
    name_bn: '২য় ঘণ্টা / ২য় পিরিয়ড',
    name_en: '2nd Period',
    start_time: '08:45',
    end_time: '09:30',
    is_break: false,
    order_index: 2,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-003',
    institution_id: 'inst-001',
    name_bn: '৩য় ঘণ্টা / ৩য় পিরিয়ড',
    name_en: '3rd Period',
    start_time: '09:30',
    end_time: '10:15',
    is_break: false,
    order_index: 3,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-004',
    institution_id: 'inst-001',
    name_bn: '৪র্থ ঘণ্টা / ৪র্থ পিরিয়ড',
    name_en: '4th Period',
    start_time: '10:15',
    end_time: '11:00',
    is_break: false,
    order_index: 4,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-005',
    institution_id: 'inst-001',
    name_bn: 'নাস্তা ও তিলাওয়াত বিরতি',
    name_en: 'Morning Break & Tiffin',
    start_time: '11:00',
    end_time: '11:20',
    is_break: true,
    order_index: 5,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-006',
    institution_id: 'inst-001',
    name_bn: '৫ম ঘণ্টা / ৫ম পিরিয়ড',
    name_en: '5th Period',
    start_time: '11:20',
    end_time: '12:05',
    is_break: false,
    order_index: 6,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-007',
    institution_id: 'inst-001',
    name_bn: '৬ষ্ঠ ঘণ্টা / ৬ষ্ঠ পিরিয়ড',
    name_en: '6th Period',
    start_time: '12:05',
    end_time: '12:50',
    is_break: false,
    order_index: 7,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-008',
    institution_id: 'inst-001',
    name_bn: 'যোহর নামাজ ও মধ্যাহ্ন বিরতি',
    name_en: 'Zohr Prayer & Lunch Break',
    start_time: '12:50',
    end_time: '14:00',
    is_break: true,
    order_index: 8,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-009',
    institution_id: 'inst-001',
    name_bn: '৭ম ঘণ্টা / ৭ম পিরিয়ড',
    name_en: '7th Period',
    start_time: '14:00',
    end_time: '14:45',
    is_break: false,
    order_index: 9,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ts-010',
    institution_id: 'inst-001',
    name_bn: '৮ম ঘণ্টা / ৮ম পিরিয়ড',
    name_en: '8th Period',
    start_time: '14:45',
    end_time: '15:30',
    is_break: false,
    order_index: 10,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Step 7: Seed Class Rooms
export const SEED_CLASS_ROOMS: DbClassRoom[] = [
  {
    id: 'rm-001',
    institution_id: 'inst-001',
    room_number: '১০১ (হিফজুল কুরআন হল)',
    building: 'মূল ভবন',
    floor: '১ম তলা',
    capacity: 40,
    notes: 'হিফজ সমাপ্তি ও নাজেরা শাখা',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rm-002',
    institution_id: 'inst-001',
    room_number: '১০২ (নূরানী মাকতাব)',
    building: 'মূল ভবন',
    floor: '১ম তলা',
    capacity: 35,
    notes: 'নূরানী ১ম ও ২য় শ্রেণি',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rm-003',
    institution_id: 'inst-001',
    room_number: '২০১ (কিতাব ১ম জামাত - মিজান)',
    building: 'একাডেমিক ভবন',
    floor: '২য় তলা',
    capacity: 45,
    notes: 'মিজান ও নাহবেমীর জামাত',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rm-004',
    institution_id: 'inst-001',
    room_number: '২০২ (মিশকাত ও ফিকহ মিলনায়তন)',
    building: 'একাডেমিক ভবন',
    floor: '২য় তলা',
    capacity: 50,
    notes: 'মিশকাত ও জালালাইন জামাত',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rm-005',
    institution_id: 'inst-001',
    room_number: '৩০১ (দারুল হাদিস কনফারেন্স হল)',
    building: 'একাডেমিক ভবন',
    floor: '৩য় তলা',
    capacity: 75,
    notes: 'দাওরায়ে হাদিস ও সেমিনার',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Step 7: Seed Class Routines
export const SEED_ROUTINES: DbClassRoutine[] = [
  // শনিবার (Saturday) - cls-001 (হিফজ সমাপ্তি জামাত, sec-001 ক শাখা)
  {
    id: 'rtn-001',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    day: 'saturday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-001', // কুরআন মাজিদ হেফজ
    teacher_id: 'tch-002', // হাফেজ ক্বারী ওমর ফারুক
    room_id: 'rm-001',
    room_name: '১০১ (হিফজুল কুরআন হল)',
    notes: 'সবক শুনানী ও নতুন পাঠ',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rtn-002',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    day: 'saturday',
    time_slot_id: 'ts-002',
    start_time: '08:45',
    end_time: '09:30',
    slot_name: '২য় ঘণ্টা / ২য় পিরিয়ড',
    subject_id: 'sbj-001', // কুরআন মাজিদ হেফজ
    teacher_id: 'tch-002', // হাফেজ ক্বারী ওমর ফারুক
    room_id: 'rm-001',
    room_name: '১০১ (হিফজুল কুরআন হল)',
    notes: 'সবকি ও পিছনের পারা শুনানী',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  // শনিবার (Saturday) - cls-003 (মিশকাত জামাত)
  {
    id: 'rtn-003',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: null,
    day: 'saturday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-003', // মেশকাত শরীফ ১ম খণ্ড
    teacher_id: 'tch-001', // মাওলানা আবুল কাশেম
    room_id: 'rm-004',
    room_name: '২০২ (মিশকাত ও ফিকহ মিলনায়তন)',
    notes: 'কিতাবুল ঈমান ও দারস',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rtn-004',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: null,
    day: 'saturday',
    time_slot_id: 'ts-002',
    start_time: '08:45',
    end_time: '09:30',
    slot_name: '২য় ঘণ্টা / ২য় পিরিয়ড',
    subject_id: 'sbj-004', // বাংলা সাহিত্য ও ব্যাকরণ
    teacher_id: 'tch-003', // মাওলানা জুবায়ের আহমেদ
    room_id: 'rm-004',
    room_name: '২০২ (মিশকাত ও ফিকহ মিলনায়তন)',
    notes: 'গদ্য ও রচনা বিশ্লেষণ',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  // শনিবার (Saturday) - cls-005 (নূরানী ১ম শ্রেণি, sec-004 ক শাখা)
  {
    id: 'rtn-005',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    section_id: 'sec-004',
    day: 'saturday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-002', // নূরানী কায়দা ও নাজেরা
    teacher_id: 'tch-003', // মাওলানা জুবায়ের আহমেদ
    room_id: 'rm-002',
    room_name: '১০২ (নূরানী মাকতাব)',
    notes: 'হরফের মাখরাজ ও উচ্চারণ অনুশীলন',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rtn-006',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    section_id: 'sec-004',
    day: 'saturday',
    time_slot_id: 'ts-002',
    start_time: '08:45',
    end_time: '09:30',
    slot_name: '২য় ঘণ্টা / ২য় পিরিয়ড',
    subject_id: 'sbj-005', // গণিত ও জ্যামিতি
    teacher_id: 'tch-004', // মাওলানা মুফতি মাহদী হাসান
    room_id: 'rm-002',
    room_name: '১০২ (নূরানী মাকতাব)',
    notes: 'নামতা ও সংখ্যা গণনা',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  // রবিবার (Sunday)
  {
    id: 'rtn-007',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    day: 'sunday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-001',
    teacher_id: 'tch-002',
    room_id: 'rm-001',
    room_name: '১০১ (হিফজুল কুরআন হল)',
    notes: '',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rtn-008',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: null,
    day: 'sunday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-003',
    teacher_id: 'tch-001',
    room_id: 'rm-004',
    room_name: '২০২ (মিশকাত ও ফিকহ মিলনায়তন)',
    notes: '',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rtn-009',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-003',
    class_id: 'cls-005',
    section_id: 'sec-004',
    day: 'sunday',
    time_slot_id: 'ts-001',
    start_time: '08:00',
    end_time: '08:45',
    slot_name: '১ম ঘণ্টা / ১ম পিরিয়ড',
    subject_id: 'sbj-002',
    teacher_id: 'tch-003',
    room_id: 'rm-002',
    room_name: '১০২ (নূরানী মাকতাব)',
    notes: '',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  // সোমবার (Monday)
  {
    id: 'rtn-010',
    institution_id: 'inst-001',
    academic_session_id: 'sess-2026-001',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: null,
    day: 'monday',
    time_slot_id: 'ts-003',
    start_time: '09:30',
    end_time: '10:15',
    slot_name: '৩য় ঘণ্টা / ৩য় পিরিয়ড',
    subject_id: 'sbj-003',
    teacher_id: 'tch-001',
    room_id: 'rm-004',
    room_name: '২০২ (মিশকাত ও ফিকহ মিলনায়তন)',
    notes: '',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Seed Students
export const SEED_STUDENTS: DbStudent[] = [
  {
    id: 'std-001',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00001',
    full_name_bn: 'মুহাম্মদ আব্দুল্লাহ আল মাহমুদ',
    full_name_en: 'Muhammad Abdullah Al Mahmud',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    date_of_birth: '2010-04-12',
    blood_group: 'A+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    birth_registration_number: '20101234567890123',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    roll_number: '০১',
    academic_session: '2026',
    admission_date: '2026-01-05',
    previous_institution: 'দারুল আরকাম মাদ্রাসা',
    previous_class: 'নাজেরা',
    mobile: '01711223344',
    email: 'abdullah.mahmud@gmail.com',
    present_address: 'বাসা #১২, রোড #০৪, উত্তর বাড্ডা, ঢাকা-১২১২',
    permanent_address: 'গ্রাম: চরসুবুদ্ধি, ডাকঘর: রায়পুরা, নরসিংদী',
    emergency_contact_name: 'মাওলানা মাহমুদুর রহমান',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01711111111',
    emergency_alternative_mobile: '01711000111',
    emergency_address: 'বাসা #১২, রোড #০৪, উত্তর বাড্ডা, ঢাকা',
    status: 'active',
    deleted_at: null,
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-01-05T09:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'std-002',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00002',
    full_name_bn: 'আহমদ জুবায়ের বিন কাশেম',
    full_name_en: 'Ahmad Zubair Bin Kashem',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    date_of_birth: '2008-08-20',
    blood_group: 'B+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    birth_registration_number: '20082345678901234',
    department_id: 'dept-002',
    class_id: 'cls-003',
    roll_number: '০২',
    academic_session: '2026',
    admission_date: '2026-01-06',
    previous_institution: 'মাদিনাতুল উলুম মাদ্রাসা',
    previous_class: 'হেদায়া',
    mobile: '01722334455',
    email: 'zubair.ahmad@gmail.com',
    present_address: 'মাদ্রাসার আবাসিক ছাত্রাবাস, বাড্ডা, ঢাকা',
    permanent_address: 'গ্রাম: ভবানীপুর, ফুলপুর, ময়মনসিংহ',
    emergency_contact_name: 'মাওলানা আবুল কাশেম',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01722222222',
    emergency_address: 'উত্তর বাড্ডা, ঢাকা',
    status: 'active',
    deleted_at: null,
    created_at: '2026-01-06T10:30:00Z',
    updated_at: '2026-01-06T10:30:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'std-003',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00003',
    full_name_bn: 'মুহাম্মদ সাআদ করিম',
    full_name_en: 'Muhammad Saad Karim',
    gender: 'male',
    date_of_birth: '2012-02-15',
    blood_group: 'O+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    department_id: 'dept-001',
    class_id: 'cls-002',
    roll_number: '০৩',
    academic_session: '2026',
    admission_date: '2026-01-08',
    mobile: '01777777777',
    present_address: 'বাড়ি #১৫, লেইন #২, রামপুরা, ঢাকা',
    permanent_address: 'বাড়ি #১৫, লেইন #২, রামপুরা, ঢাকা',
    emergency_contact_name: 'আলহাজ্ব মোঃ জাহিদুল করিম',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01766666666',
    status: 'active',
    deleted_at: null,
    created_at: '2026-01-08T11:00:00Z',
    updated_at: '2026-01-08T11:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'std-004',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00004',
    full_name_bn: 'মারিয়াম বিনতে মুস্তাফিজ',
    full_name_en: 'Mariam Binte Mustafiz',
    gender: 'female',
    date_of_birth: '2014-11-10',
    blood_group: 'AB+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    department_id: 'dept-003',
    class_id: 'cls-005',
    roll_number: '০৪',
    academic_session: '2026',
    admission_date: '2026-01-10',
    mobile: '01833445566',
    present_address: 'দক্ষিণ বাড্ডা, ঢাকা-১২১২',
    permanent_address: 'দক্ষিণ বাড্ডা, ঢাকা-১২১২',
    emergency_contact_name: 'মুস্তাফিজুর রহমান',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01833445566',
    status: 'pending',
    deleted_at: null,
    created_at: '2026-01-10T14:00:00Z',
    updated_at: '2026-01-10T14:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'std-005',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00005',
    full_name_bn: 'হাফেজ হাসান মাহমুদ',
    full_name_en: 'Hafez Hasan Mahmud',
    gender: 'male',
    date_of_birth: '2007-06-18',
    blood_group: 'O+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    department_id: 'dept-002',
    class_id: 'cls-004',
    roll_number: '০৫',
    academic_session: '2026',
    admission_date: '2026-01-11',
    mobile: '01911223344',
    present_address: 'মাদ্রাসা হোস্টেল, বাড্ডা, ঢাকা',
    permanent_address: 'সদরঘাট, বরিশাল',
    emergency_contact_name: 'মাহবুবুল আলম',
    emergency_relationship: 'চাচা (Uncle)',
    emergency_mobile: '01911001122',
    status: 'on_leave',
    deleted_at: null,
    created_at: '2026-01-11T16:00:00Z',
    updated_at: '2026-01-11T16:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'std-006',
    institution_id: 'inst-001',
    student_id: 'MDS-2026-00006',
    full_name_bn: 'মুহাম্মদ তানভীর আহমেদ',
    full_name_en: 'Muhammad Tanvir Ahmed',
    gender: 'male',
    date_of_birth: '2009-09-09',
    blood_group: 'A-',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    department_id: 'dept-001',
    class_id: 'cls-001',
    roll_number: '০৬',
    academic_session: '2026',
    admission_date: '2026-01-12',
    mobile: '01622334455',
    present_address: 'খিলগাঁও, ঢাকা',
    permanent_address: 'কুমিল্লা সদর',
    emergency_contact_name: 'আহমেদ কবির',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01622334455',
    status: 'inactive',
    deleted_at: null,
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-12T10:00:00Z',
    created_by: 'usr-001',
  },
];

// Seed Student Documents
export const SEED_STUDENT_DOCS: DbStudentDocument[] = [
  {
    id: 'sdoc-001',
    institution_id: 'inst-001',
    student_id: 'std-001',
    category: 'birth_certificate',
    file_name: 'birth_certificate_abdullah.pdf',
    file_path: 'https://example.com/docs/birth_certificate_abdullah.pdf',
    file_type: 'application/pdf',
    file_size: 245000,
    uploaded_by: 'usr-001',
    created_at: '2026-01-05T09:15:00Z',
  },
  {
    id: 'sdoc-002',
    institution_id: 'inst-001',
    student_id: 'std-001',
    category: 'admission_paper',
    file_name: 'admission_form_2026.pdf',
    file_path: 'https://example.com/docs/admission_form_2026.pdf',
    file_type: 'application/pdf',
    file_size: 180000,
    uploaded_by: 'usr-001',
    created_at: '2026-01-05T09:20:00Z',
  },
];

// Seed Student Activities
export const SEED_STUDENT_ACTIVITIES: DbStudentActivity[] = [
  {
    id: 'sact-001',
    institution_id: 'inst-001',
    student_id: 'std-001',
    user_id: 'usr-001',
    user_name: 'মাওলানা আবুল কাশেম',
    action: 'STUDENT_CREATED',
    description: 'শিক্ষার্থী মুহাম্মদ আব্দুল্লাহ আল মাহমুদ এর ভর্তি সম্পন্ন হয়েছে (আইডি: MDS-2026-00001)',
    created_at: '2026-01-05T09:00:00Z',
  },
  {
    id: 'sact-002',
    institution_id: 'inst-001',
    student_id: 'std-001',
    user_id: 'usr-001',
    user_name: 'মাওলানা আবুল কাশেম',
    action: 'DOCUMENT_UPLOADED',
    description: 'জন্ম নিবন্ধন সার্টিফিকেট ফাইল আপলোড করা হয়েছে।',
    created_at: '2026-01-05T09:15:00Z',
  },
  {
    id: 'sact-003',
    institution_id: 'inst-001',
    student_id: 'std-005',
    user_id: 'usr-001',
    user_name: 'মাওলানা আবুল কাশেম',
    action: 'STATUS_CHANGED',
    description: 'শিক্ষার্থীর স্ট্যাটাস পরিবর্তন করা হয়েছে: Active -> On Leave (ছুটিতে আছে)',
    created_at: '2026-01-15T14:30:00Z',
  },
];

// Step 3: Seed Teacher Designations (Database-Driven)
export const SEED_TEACHER_DESIGNATIONS: DbTeacherDesignation[] = [
  { id: 'desig-principal', name_bn: 'অধ্যক্ষ / মুহতামিম (Principal)', name_en: 'Principal / Muhtamim', slug: 'principal' },
  { id: 'desig-director', name_bn: 'পরিচালক / মুহতামিম (Director)', name_en: 'Director', slug: 'director' },
  { id: 'desig-vice-principal', name_bn: 'উপাধ্যক্ষ / নায়েবে মুহতামিম (Vice Principal)', name_en: 'Vice Principal', slug: 'vice_principal' },
  { id: 'desig-teacher', name_bn: 'মুদাররিস / সিনিয়র শিক্ষক (Teacher)', name_en: 'Teacher', slug: 'teacher' },
  { id: 'desig-hifz-teacher', name_bn: 'হিফজ শিক্ষক / হাফেজ সাহেব (Hifz Teacher)', name_en: 'Hifz Teacher', slug: 'hifz_teacher' },
  { id: 'desig-noorani-teacher', name_bn: 'নূরানী শিক্ষক (Noorani Teacher)', name_en: 'Noorani Teacher', slug: 'noorani_teacher' },
  { id: 'desig-assistant-teacher', name_bn: 'সহকারী শিক্ষক (Assistant Teacher)', name_en: 'Assistant Teacher', slug: 'assistant_teacher' },
  { id: 'desig-other', name_bn: 'অন্যান্য (Other)', name_en: 'Other', slug: 'other' },
];

// Step 3: Seed Teachers
export const SEED_TEACHERS: DbTeacher[] = [
  {
    id: 'tch-001',
    institution_id: 'inst-001',
    user_id: 'usr-001', // Linked to superadmin@madsol.app
    teacher_id: 'MDS-T-2026-00001',
    full_name_bn: 'মাওলানা আবুল কাশেম',
    full_name_en: 'Maulana Abul Kashem',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    date_of_birth: '1980-05-12',
    blood_group: 'O+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    identification_number: '19802692015000123',
    primary_mobile: '01711111111',
    alternative_mobile: '01822222222',
    email: 'superadmin@madsol.app',
    present_address: 'মাদ্রাসা ক্যাম্পাস, মেইন রোড, উত্তর বাড্ডা, ঢাকা-১২১২',
    permanent_address: 'গ্রাম: মির্জাপুর, ডাকঘর: বাজিতপুর, কিশোরগঞ্জ',
    emergency_contact_name: 'মুহাম্মদ হাফিজুর রহমান',
    emergency_relationship: 'ভাই (Brother)',
    emergency_mobile: '01711223344',
    highest_qualification: 'দাওরায়ে হাদিস ও ইফতা',
    educational_background: 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',
    islamic_qualification: 'Ifta',
    institution_university: 'দারুল উলুম দেওবন্দ / জামিয়া মাদানিয়া',
    passing_year: '2005',
    specialization: 'ফিকহ ও ফতোয়া শাস্ত্র, বুখারী শরীফ',
    experience_years: 19,
    designation_id: 'desig-principal',
    department_id: 'dept-002',
    joining_date: '2015-01-01',
    employment_type: 'full_time',
    employment_status: 'active',
    deleted_at: null,
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2026-09-11T14:20:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'tch-002',
    institution_id: 'inst-001',
    user_id: 'usr-004', // Linked to teacher@darululoom.edu.bd
    teacher_id: 'MDS-T-2026-00002',
    full_name_bn: 'হাফেজ ক্বারী ওমর ফারুক',
    full_name_en: 'Hafez Qari Omar Faruk',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    date_of_birth: '1987-08-15',
    blood_group: 'A+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    identification_number: '19872692015000456',
    primary_mobile: '01744444444',
    alternative_mobile: '01844444444',
    email: 'teacher@darululoom.edu.bd',
    present_address: 'হাউস #২৮, রোড #০৬, বাড্ডা, ঢাকা',
    permanent_address: 'গ্রাম: গোবিন্দপুর, চৌদ্দগ্রাম, কুমিল্লা',
    emergency_contact_name: 'মাওলানা মাহফুজুর রহমান',
    emergency_relationship: 'চাচা (Uncle)',
    emergency_mobile: '01811223344',
    highest_qualification: 'দাওরায়ে হাদিস ও ক্বিরাআত সাবআ',
    educational_background: 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',
    islamic_qualification: 'Qiraat',
    institution_university: 'মারকাযুত তাহফিজ ও জামিয়া রাহমানিয়া',
    passing_year: '2010',
    specialization: 'কুরআনুল কারীম তেলাওয়াত ও নাহু-সরফ',
    experience_years: 14,
    designation_id: 'desig-teacher',
    department_id: 'dept-002',
    joining_date: '2018-03-10',
    employment_type: 'full_time',
    employment_status: 'active',
    deleted_at: null,
    created_at: '2024-04-10T08:00:00Z',
    updated_at: '2026-09-12T07:45:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'tch-003',
    institution_id: 'inst-001',
    user_id: null, // Ready to be linked to a login user
    teacher_id: 'MDS-T-2026-00003',
    full_name_bn: 'হাফেজ মাওলানা তানভীর আহমেদ',
    full_name_en: 'Hafez Mawlana Tanvir Ahmed',
    photo: '',
    gender: 'male',
    date_of_birth: '1993-02-18',
    blood_group: 'B+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    identification_number: '19932692015000789',
    primary_mobile: '01911223388',
    alternative_mobile: '',
    email: 'tanvir.hifz@gmail.com',
    present_address: 'মাদ্রাসার দক্ষিণ ভবন, বাড্ডা, ঢাকা',
    permanent_address: 'গ্রাম: চরফ্যাশন, ভোলা',
    emergency_contact_name: 'মুহাম্মদ ফজলুল হক',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01788990011',
    highest_qualification: 'হিফজুল কুরআন ও কামিল',
    educational_background: 'হুফফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ',
    islamic_qualification: 'Hifz',
    institution_university: 'হুফফাজুল কুরআন বোর্ড, ঢাকা',
    passing_year: '2014',
    specialization: 'হিফজুল কুরআন তাজবীদ সহকারে মুখস্থকরণ',
    experience_years: 9,
    designation_id: 'desig-hifz-teacher',
    department_id: 'dept-001',
    joining_date: '2020-02-01',
    employment_type: 'full_time',
    employment_status: 'active',
    deleted_at: null,
    created_at: '2024-05-01T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'tch-004',
    institution_id: 'inst-001',
    user_id: null,
    teacher_id: 'MDS-T-2026-00004',
    full_name_bn: 'মাওলানা মুফতি মাহদী হাসান',
    full_name_en: 'Mawlana Mufti Mahdi Hasan',
    photo: '',
    gender: 'male',
    date_of_birth: '1996-05-08',
    blood_group: 'AB+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    primary_mobile: '01819998877',
    alternative_mobile: '',
    email: 'mahdi.noorani@gmail.com',
    present_address: 'উত্তর বাড্ডা, ঢাকা',
    permanent_address: 'সরিষাবাড়ী, জামালপুর',
    emergency_contact_name: 'মোশাররফ হোসেন',
    emergency_relationship: 'বড় ভাই (Elder Brother)',
    emergency_mobile: '01722334455',
    highest_qualification: 'নূরানী মুয়াল্লিম প্রশিক্ষণ ও ফাজিল',
    educational_background: 'নূরানী তা’লীমুল কুরআন বোর্ড বাংলাদেশ',
    islamic_qualification: 'Alim',
    institution_university: 'মুয়াল্লিম ট্রেনিং একাডেমি, ঢাকা',
    passing_year: '2018',
    specialization: 'শিশুদের নূরানী কুরআন ও বুনিয়াদি আদব পাঠদান',
    experience_years: 6,
    designation_id: 'desig-noorani-teacher',
    department_id: 'dept-003',
    joining_date: '2022-03-01',
    employment_type: 'full_time',
    employment_status: 'pending',
    deleted_at: null,
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
    created_by: 'usr-001',
  },
  {
    id: 'tch-005',
    institution_id: 'inst-002', // Multi-institution isolation test
    user_id: null,
    teacher_id: 'MDS-T-2026-00001',
    full_name_bn: 'মাওলানা আবু বকর সিদ্দিক',
    full_name_en: 'Mawlana Abu Bakr Siddique',
    photo: '',
    gender: 'male',
    date_of_birth: '1985-04-10',
    blood_group: 'B+',
    nationality: 'বাংলাদেশী',
    religion: 'ইসলাম',
    primary_mobile: '01700112233',
    present_address: 'উত্তরা, ঢাকা',
    permanent_address: 'সিলেট সদর',
    emergency_contact_name: 'আব্দুল করিম',
    emergency_relationship: 'পিতা (Father)',
    emergency_mobile: '01700112244',
    highest_qualification: 'দাওরায়ে হাদিস',
    educational_background: 'বেফাক',
    institution_university: 'জামিয়া কাসেমুল উলুম',
    specialization: 'হিফজ ও তাফসির',
    designation_id: 'desig-teacher',
    department_id: 'dept-004',
    joining_date: '2021-01-01',
    employment_type: 'full_time',
    employment_status: 'active',
    deleted_at: null,
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z',
    created_by: 'usr-001',
  },
];

// Step 3: Seed Teacher Qualifications
export const SEED_TEACHER_QUALIFICATIONS: DbTeacherQualification[] = [
  {
    id: 'tqual-001',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    qualification_type: 'islamic',
    qualification_name: 'দাওরায়ে হাদিস (তাকমিল)',
    institution_name: 'দারুল উলুম দেওবন্দ / জামিয়া মাদানিয়া',
    passing_year: '2005',
    certificate_number: 'BEFAQ-2005-9921',
    notes: 'মুমতাজ (প্রথম বিভাগ স্টার মার্কস)',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'tqual-002',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    qualification_type: 'islamic',
    qualification_name: 'ইফতা ও ফতোয়া গবেষণা ডিপ্লোমা',
    institution_name: 'মারকাযুদ দাওয়াহ আল-ইসলামিয়া ঢাকা',
    passing_year: '2007',
    certificate_number: 'IFTA-2007-042',
    notes: 'ইসলামি আইন ও বিচার বিষয়ক উচ্চতর গবেষণা',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'tqual-003',
    institution_id: 'inst-001',
    teacher_id: 'tch-002',
    qualification_type: 'islamic',
    qualification_name: 'হিফজুল কুরআন ও ক্বিরাআত সাবআ',
    institution_name: 'মারকাযুত তাহফিজ ইন্টারন্যাশনাল',
    passing_year: '2004',
    certificate_number: 'QIR-2004-118',
    notes: 'সানাদ সহ আন্তর্জাতিক ক্বিরাআত সনদপ্রাপ্ত',
    created_at: '2024-04-10T08:00:00Z',
    updated_at: '2024-04-10T08:00:00Z',
  },
];

// Step 3: Seed Teacher Documents
export const SEED_TEACHER_DOCS: DbTeacherDocument[] = [
  {
    id: 'tdoc-001',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    category: 'appointment_letter',
    document_name: 'Principal_Appointment_Letter.pdf',
    file_path: 'https://example.com/docs/Principal_Appointment_Letter.pdf',
    file_type: 'application/pdf',
    file_size: 320000,
    uploaded_by: 'usr-001',
    created_at: '2024-03-01T09:30:00Z',
  },
  {
    id: 'tdoc-002',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    category: 'islamic_certificate',
    document_name: 'Dawrah_Hadith_Sanad.pdf',
    file_path: 'https://example.com/docs/Dawrah_Hadith_Sanad.pdf',
    file_type: 'application/pdf',
    file_size: 450000,
    uploaded_by: 'usr-001',
    created_at: '2024-03-01T09:35:00Z',
  },
  {
    id: 'tdoc-003',
    institution_id: 'inst-001',
    teacher_id: 'tch-002',
    category: 'nid_identification',
    document_name: 'National_ID_Card.jpg',
    file_path: 'https://example.com/docs/National_ID_Card.jpg',
    file_type: 'image/jpeg',
    file_size: 210000,
    uploaded_by: 'usr-001',
    created_at: '2024-04-10T08:30:00Z',
  },
];

// Step 3: Seed Teacher Activities
export const SEED_TEACHER_ACTIVITIES: DbTeacherActivity[] = [
  {
    id: 'tact-001',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    user_id: 'usr-001',
    user_name: 'মাওলানা মাহমুদুর রহমান',
    action: 'TEACHER_CREATED',
    description: 'শিক্ষক মাওলানা আবুল কাশেম (আইডি: MDS-T-2026-00001) সফলভাবে নিবন্ধিত হয়েছেন।',
    created_at: '2024-03-01T09:00:00Z',
  },
  {
    id: 'tact-002',
    institution_id: 'inst-001',
    teacher_id: 'tch-001',
    user_id: 'usr-001',
    user_name: 'মাওলানা মাহমুদুর রহমান',
    action: 'ACCOUNT_CONNECTED',
    description: 'শিক্ষকের প্রোফাইলের সাথে সিস্টেম লগইন একাউন্ট (superadmin@madsol.app) সফলভাবে সংযুক্ত করা হয়েছে।',
    created_at: '2024-03-01T09:10:00Z',
  },
  {
    id: 'tact-003',
    institution_id: 'inst-001',
    teacher_id: 'tch-002',
    user_id: 'usr-001',
    user_name: 'মাওলানা মাহমুদুর রহমান',
    action: 'TEACHER_CREATED',
    description: 'শিক্ষক হাফেজ ক্বারী ওমর ফারুক (আইডি: MDS-T-2026-00002) সফলভাবে নিবন্ধিত হয়েছেন।',
    created_at: '2024-04-10T08:00:00Z',
  },
  {
    id: 'tact-004',
    institution_id: 'inst-001',
    teacher_id: 'tch-002',
    user_id: 'usr-001',
    user_name: 'মাওলানা মাহমুদুর রহমান',
    action: 'DOCUMENT_UPLOADED',
    description: 'ডকুমেন্ট আপলোড করা হয়েছে: National_ID_Card.jpg (nid_identification)',
    created_at: '2024-04-10T08:30:00Z',
  },
];

// Step 4: Seed Attendance Records
export const SEED_ATTENDANCE: DbAttendanceRecord[] = [
  // Today's Student Attendance (2026-09-13)
  {
    id: 'att-s-001',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-001',
    target_name_bn: 'মুহাম্মদ আব্দুল্লাহ আল মাহমুদ',
    target_name_en: 'Muhammad Abdullah Al Mahmud',
    target_code: '101',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:45',
    check_out_time: '13:30',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    session: '2026',
    remarks: 'সময়মত উপস্থিত',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:45:00Z',
    updated_at: '2026-09-13T07:45:00Z',
  },
  {
    id: 'att-s-002',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-002',
    target_name_bn: 'মুহাম্মদ আব্দুর রহমান',
    target_name_en: 'Muhammad Abdur Rahman',
    target_code: '102',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:52',
    department_id: 'dept-002',
    class_id: 'cls-003',
    section_id: 'sec-003',
    session: '2026',
    remarks: '',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:52:00Z',
    updated_at: '2026-09-13T07:52:00Z',
  },
  {
    id: 'att-s-003',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-003',
    target_name_bn: 'মাহমুদ হাসান সাকিব',
    target_name_en: 'Mahmud Hasan Sakib',
    target_code: '103',
    date: '2026-09-13',
    status: 'late',
    check_in_time: '08:20',
    department_id: 'dept-002',
    class_id: 'cls-004',
    section_id: 'sec-004',
    session: '2026',
    remarks: 'যানজটের কারণে বিলম্ব',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T08:20:00Z',
    updated_at: '2026-09-13T08:20:00Z',
  },
  {
    id: 'att-s-004',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-004',
    target_name_bn: 'মোঃ আবু হুরায়রা',
    target_name_en: 'Md. Abu Huraira',
    target_code: '104',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:40',
    department_id: 'dept-003',
    class_id: 'cls-005',
    section_id: 'sec-005',
    session: '2026',
    remarks: '',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:40:00Z',
    updated_at: '2026-09-13T07:40:00Z',
  },
  {
    id: 'att-s-005',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-005',
    target_name_bn: 'মুহাম্মদ জুবায়ের আহমেদ',
    target_name_en: 'Muhammad Zubayer Ahmed',
    target_code: '105',
    date: '2026-09-13',
    status: 'leave',
    department_id: 'dept-001',
    class_id: 'cls-001',
    section_id: 'sec-001',
    session: '2026',
    remarks: 'জ্বরের কারণে ছুটি অনুমোদিত',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T08:00:00Z',
    updated_at: '2026-09-13T08:00:00Z',
  },
  // Today's Teacher Attendance (2026-09-13)
  {
    id: 'att-t-001',
    institution_id: 'inst-001',
    target_type: 'teacher',
    target_id: 'tch-001',
    target_name_bn: 'মাওলানা আবুল কাশেম',
    target_name_en: 'Mawlana Abul Kashem',
    target_code: 'MDS-T-2026-00001',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:35',
    department_id: 'dept-002',
    remarks: '',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:35:00Z',
    updated_at: '2026-09-13T07:35:00Z',
  },
  {
    id: 'att-t-002',
    institution_id: 'inst-001',
    target_type: 'teacher',
    target_id: 'tch-002',
    target_name_bn: 'হাফেজ ক্বারী ওমর ফারুক',
    target_name_en: 'Hafez Qari Omar Faruq',
    target_code: 'MDS-T-2026-00002',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:42',
    department_id: 'dept-001',
    remarks: '',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:42:00Z',
    updated_at: '2026-09-13T07:42:00Z',
  },
  {
    id: 'att-t-003',
    institution_id: 'inst-001',
    target_type: 'teacher',
    target_id: 'tch-003',
    target_name_bn: 'হাফেজ মাওলানা আনাস মাহমুদ',
    target_name_en: 'Hafez Mawlana Anas Mahmud',
    target_code: 'MDS-T-2026-00003',
    date: '2026-09-13',
    status: 'present',
    check_in_time: '07:48',
    department_id: 'dept-001',
    remarks: '',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T07:48:00Z',
    updated_at: '2026-09-13T07:48:00Z',
  },
  {
    id: 'att-t-004',
    institution_id: 'inst-001',
    target_type: 'teacher',
    target_id: 'tch-004',
    target_name_bn: 'মাওলানা মুফতি মাহদী হাসান',
    target_name_en: 'Mawlana Mufti Mahdi Hasan',
    target_code: 'MDS-T-2026-00004',
    date: '2026-09-13',
    status: 'late',
    check_in_time: '08:15',
    department_id: 'dept-003',
    remarks: 'পারিবারিক প্রয়োজন',
    recorded_by: 'usr-001',
    created_at: '2026-09-13T08:15:00Z',
    updated_at: '2026-09-13T08:15:00Z',
  },
];

// Step 4: Seed Leave Applications
export const SEED_LEAVE_APPLICATIONS: DbLeaveApplication[] = [
  {
    id: 'leave-001',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-005',
    target_name_bn: 'মুহাম্মদ জুবায়ের আহমেদ',
    target_name_en: 'Muhammad Zubayer Ahmed',
    target_code: '105',
    leave_type: 'sick',
    start_date: '2026-09-13',
    end_date: '2026-09-14',
    total_days: 2,
    reason: 'তীব্র জ্বর ও মাথাব্যথা থাকার কারণে বিশ্রাম প্রয়োজন। ডাক্তারের পরামর্শপত্র সংযুক্ত করা হয়েছে।',
    status: 'approved',
    applied_at: '2026-09-12T18:00:00Z',
    action_by: 'usr-001',
    action_at: '2026-09-12T19:30:00Z',
    action_remarks: 'আবেদন গৃহীত ও মঞ্জুর করা হলো। আল্লাহ দ্রুত শেফা দান করুন।',
  },
  {
    id: 'leave-002',
    institution_id: 'inst-001',
    target_type: 'teacher',
    target_id: 'tch-003',
    target_name_bn: 'হাফেজ মাওলানা আনাস মাহমুদ',
    target_name_en: 'Hafez Mawlana Anas Mahmud',
    target_code: 'MDS-T-2026-00003',
    leave_type: 'emergency',
    start_date: '2026-09-16',
    end_date: '2026-09-17',
    total_days: 2,
    reason: 'গ্রামের বাড়িতে জরুরি পারিবারিক ও সামাজিক কার্যক্রম সম্পন্ন করার জন্য ২ দিনের নৈমিত্তিক ছুটি প্রয়োজন।',
    status: 'pending',
    applied_at: '2026-09-13T07:30:00Z',
  },
  {
    id: 'leave-003',
    institution_id: 'inst-001',
    target_type: 'student',
    target_id: 'std-003',
    target_name_bn: 'মাহমুদ হাসান সাকিব',
    target_name_en: 'Mahmud Hasan Sakib',
    target_code: '103',
    leave_type: 'family',
    start_date: '2026-09-10',
    end_date: '2026-09-10',
    total_days: 1,
    reason: 'বড় ভাইয়ের শুভ বিবাহের অনুষ্ঠানে অংশগ্রহণের জন্য ১ দিনের ছুটি।',
    status: 'approved',
    applied_at: '2026-09-08T10:00:00Z',
    action_by: 'usr-001',
    action_at: '2026-09-08T12:00:00Z',
    action_remarks: 'অনুমোদিত। ক্লাসের পড়া নিজ দায়িত্বে আদায় করে নিতে হবে।',
  },
];

// Seed Institutions
const SEED_INSTITUTIONS: DbInstitution[] = [
  {
    id: 'inst-001',
    name: 'দারুল উলুম ইসলামিয়া মাদ্রাসা',
    short_name: 'দারুল উলুম',
    institution_type: 'madrasa',
    mobile: '01711000111',
    email: 'info@darululoom.edu.bd',
    address: 'মেইন রোড, উত্তর বাড্ডা, ঢাকা-১২১২',
    logo: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=150&auto=format&fit=crop&q=80',
    language: 'bn',
    status: 'active',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2026-09-12T00:00:00Z',
    nameBn: 'দারুল উলুম ইসলামিয়া মাদ্রাসা',
    nameEn: 'Darul Uloom Islamia Madrasa',
    phone: '01711000111',
    addressBn: 'মেইন রোড, উত্তর বাড্ডা, ঢাকা-১২১২',
    addressEn: 'Main Road, North Badda, Dhaka-1212',
    eiinNumber: '134521',
    teacher_access_pin: '849201',
    guardian_access_pin: '772109',
  },
  {
    id: 'inst-002',
    name: 'আল-জামেয়াতুল আরাবিয়া মডেল মাদ্রাসা',
    short_name: 'আল-জামেয়া',
    institution_type: 'hifz_madrasa',
    mobile: '01811222333',
    email: 'contact@aljamea.edu.bd',
    address: 'সদর রোড, চকবাজার, চট্টগ্রাম',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    language: 'bn',
    status: 'active',
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2026-09-12T00:00:00Z',
    nameBn: 'আল-জামেয়াতুল আরাবিয়া মডেল মাদ্রাসা',
    nameEn: 'Al-Jameatul Arabia Model Madrasa',
    phone: '01811222333',
    addressBn: 'সদর রোড, চকবাজার, চট্টগ্রাম',
    addressEn: 'Sadar Road, Chawkbazar, Chattogram',
    eiinNumber: '134522',
    teacher_access_pin: '614920',
    guardian_access_pin: '503817',
  },
];

// Seed Users with SHA-256 Hashed Passwords
const SEED_USERS: DbUser[] = [
  {
    id: 'usr-001',
    institution_id: 'inst-001',
    name: 'মাওলানা মাহমুদুর রহমান',
    email: 'superadmin@madsol.app',
    mobile: '01711111111',
    password_hash: hashPasswordSync('admin123'),
    role_id: 'super_admin',
    status: 'active',
    last_login: '2026-09-12T08:30:00Z',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2026-09-12T08:30:00Z',
    role: 'super_admin',
    fullNameBn: 'মাওলানা মাহমুদুর রহমান',
    fullNameEn: 'Maulana Mahmudur Rahman',
    phone: '01711111111',
  },
  {
    id: 'usr-004',
    institution_id: 'inst-001',
    name: 'হাফেজ ক্বারী ওমর ফারুক',
    email: 'teacher@darululoom.edu.bd',
    mobile: '01744444444',
    password_hash: hashPasswordSync('teacher123'),
    role_id: 'teacher',
    status: 'active',
    last_login: '2026-09-12T07:45:00Z',
    created_at: '2024-04-10T08:00:00Z',
    updated_at: '2026-09-12T07:45:00Z',
    role: 'teacher',
    fullNameBn: 'হাফেজ ক্বারী ওমর ফারুক',
    fullNameEn: 'Hafez Qari Omar Faruk',
    phone: '01744444444',
    app_access_granted: true,
    approved_by_id: 'usr-001',
    approved_by_name: 'মাওলানা মাহমুদুর রহমান',
    approved_by_role: 'সুপার এডমিন',
    approved_at: '2024-04-10T08:00:00Z',
    can_grant_guardian_access: true,
    access_pin: '849201',
    allowed_modules: ['attendance', 'exams', 'notices', 'guardians', 'messaging'],
  },
  {
    id: 'usr-008',
    institution_id: 'inst-001',
    name: 'মাওলানা মিজানুর রহমান',
    email: 'mizan@darululoom.edu.bd',
    mobile: '01788888888',
    password_hash: hashPasswordSync('mizan123'),
    role_id: 'teacher',
    status: 'pending',
    last_login: undefined,
    created_at: '2026-09-18T10:00:00Z',
    updated_at: '2026-09-18T10:00:00Z',
    role: 'teacher',
    fullNameBn: 'মাওলানা মিজানুর রহমান',
    fullNameEn: 'Maulana Mizanur Rahman',
    phone: '01788888888',
    app_access_granted: false,
    can_grant_guardian_access: true,
    approval_notes: 'নতুন সহকারী শিক্ষক হিসেবে আবেদন করেছেন, মুহতামিম/পরিচালকের অনুমতির অপেক্ষায়।',
    access_pin: '772109',
  },
  {
    id: 'usr-006',
    institution_id: 'inst-001',
    name: 'আলহাজ্ব মোঃ জাহিদুল করিম',
    email: 'guardian@gmail.com',
    mobile: '01766666666',
    password_hash: hashPasswordSync('guardian123'),
    role_id: 'guardian',
    status: 'active',
    last_login: '2026-09-10T18:30:00Z',
    created_at: '2024-05-01T12:00:00Z',
    updated_at: '2026-09-10T18:30:00Z',
    role: 'guardian',
    fullNameBn: 'আলহাজ্ব মোঃ জাহিদুল করিম',
    fullNameEn: 'Alhaj Md Jahidul Karim',
    phone: '01766666666',
    app_access_granted: true,
    approved_by_id: 'usr-004',
    approved_by_name: 'হাফেজ ক্বারী ওমর ফারুক',
    approved_by_role: 'সহকারী শিক্ষক',
    approved_at: '2024-05-01T12:00:00Z',
    access_pin: '593120',
    allowed_modules: ['attendance', 'exams', 'notices', 'fees', 'diary'],
  },
  {
    id: 'usr-009',
    institution_id: 'inst-001',
    name: 'মোঃ শফিকুল ইসলাম',
    email: 'shafiqul.guardian@gmail.com',
    mobile: '01799999999',
    password_hash: hashPasswordSync('guardian123'),
    role_id: 'guardian',
    status: 'pending',
    last_login: undefined,
    created_at: '2026-09-19T14:30:00Z',
    updated_at: '2026-09-19T14:30:00Z',
    role: 'guardian',
    fullNameBn: 'মোঃ শফিকুল ইসলাম',
    fullNameEn: 'Md Shafiqul Islam',
    phone: '01799999999',
    app_access_granted: false,
    approval_notes: 'ছাত্র মুসা করিমের পিতা, সহকারী শিক্ষক বা মুহতামিমের অনুমতির অপেক্ষায়।',
    access_pin: '331890',
  },
];

// Seed Activity Logs
const SEED_ACTIVITY_LOGS: DbActivityLog[] = [
  {
    id: 'act-001',
    user_id: 'usr-001',
    user_name: 'মাওলানা মাহমুদুর রহমান',
    institution_id: 'inst-001',
    action: 'SYSTEM_INITIALIZATION',
    description: 'MadSol Core System v1.0 সফলভাবে ইনিশিয়ালাইজ ও ডাটাবেস প্রস্তুত হয়েছে।',
    timestamp: '2026-09-12T08:00:00Z',
    status: 'success',
  },
  {
    id: 'act-002',
    user_id: 'usr-004',
    user_name: 'হাফেজ ক্বারী ওমর ফারুক',
    institution_id: 'inst-001',
    action: 'USER_LOGIN',
    description: 'সহকারী শিক্ষক সফলভাবে সিস্টেমে লগইন করেছেন।',
    timestamp: '2026-09-12T09:15:00Z',
    status: 'success',
  },
];

function normalizeUser(u: DbUser): DbUser {
  const isGranted = u.app_access_granted !== undefined ? u.app_access_granted : (u.status === 'active');
  return {
    ...u,
    role: u.role || (u.role_id === 'institution_admin' ? 'madrasa_admin' : u.role_id),
    fullNameBn: u.fullNameBn || u.name,
    fullNameEn: u.fullNameEn || u.name,
    phone: u.phone || u.mobile,
    institutionId: u.institution_id,
    app_access_granted: isGranted,
    can_grant_guardian_access: u.can_grant_guardian_access ?? (u.role_id === 'teacher' || u.role_id === 'principal' || u.role_id === 'institution_admin' || u.role_id === 'super_admin'),
  };
}

function normalizeInstitution(inst: DbInstitution): DbInstitution {
  return {
    ...inst,
    nameBn: inst.nameBn || inst.name,
    nameEn: inst.nameEn || inst.name,
    phone: inst.phone || inst.mobile,
    addressBn: inst.addressBn || inst.address,
    addressEn: inst.addressEn || inst.address,
    eiinNumber: inst.eiinNumber || '134521',
    teacher_access_pin: inst.teacher_access_pin || (inst.id === 'inst-001' ? '849201' : '614920'),
    guardian_access_pin: inst.guardian_access_pin || (inst.id === 'inst-001' ? '772109' : '503817'),
  };
}

class MadSolDatabase {
  constructor() {
    this.init();
  }

  private hasKey(key: string): boolean {
    return safeStorage.getItem(key) !== null;
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = safeStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing to ${key}:`, e);
    }
  }

  public init(): void {
    if (typeof window === 'undefined') return;

    try {
      const isInitialized = safeStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInitialized) {
        this.setItem(STORAGE_KEYS.ROLES, SEED_ROLES);
        this.setItem(STORAGE_KEYS.PERMISSIONS, SEED_PERMISSIONS);
        this.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, SEED_ROLE_PERMISSIONS);
        this.setItem(STORAGE_KEYS.INSTITUTIONS, SEED_INSTITUTIONS);
        this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
        this.setItem(STORAGE_KEYS.SESSIONS, []);
        this.setItem(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
        this.setItem(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
        this.setItem(STORAGE_KEYS.CLASSES, SEED_CLASSES);
        this.setItem(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
        this.setItem(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
        this.setItem(STORAGE_KEYS.STUDENT_DOCS, SEED_STUDENT_DOCS);
        this.setItem(STORAGE_KEYS.STUDENT_ACTIVITIES, SEED_STUDENT_ACTIVITIES);
        this.setItem(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
        this.setItem(STORAGE_KEYS.TEACHER_DESIGNATIONS, SEED_TEACHER_DESIGNATIONS);
        this.setItem(STORAGE_KEYS.TEACHER_QUALIFICATIONS, SEED_TEACHER_QUALIFICATIONS);
        this.setItem(STORAGE_KEYS.TEACHER_DOCS, SEED_TEACHER_DOCS);
        this.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, SEED_TEACHER_ACTIVITIES);
        this.setItem(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
        this.setItem(STORAGE_KEYS.LEAVE_APPLICATIONS, SEED_LEAVE_APPLICATIONS);
        this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
        this.setItem(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, SEED_STUDENT_ACADEMIC_HISTORY);
        this.setItem(STORAGE_KEYS.ACADEMIC_ACTIVITIES, []);
        this.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, SEED_ACADEMIC_SETTINGS);
        this.setItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
        this.setItem(STORAGE_KEYS.SUBJECT_DEPARTMENTS, SEED_SUBJECT_DEPARTMENTS);
        this.setItem(STORAGE_KEYS.CLASS_SUBJECTS, SEED_CLASS_SUBJECTS);
        this.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, SEED_TEACHER_ASSIGNMENTS);
        this.setItem(STORAGE_KEYS.SUBJECT_ACTIVITIES, []);
        this.setItem(STORAGE_KEYS.TIME_SLOTS, SEED_TIME_SLOTS);
        this.setItem(STORAGE_KEYS.CLASS_ROOMS, SEED_CLASS_ROOMS);
        this.setItem(STORAGE_KEYS.ROUTINES, SEED_ROUTINES);
        safeStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      } else {
        // Lazy migration for Step 2 if previously initialized in Step 1
        if (!this.hasKey(STORAGE_KEYS.STUDENTS)) {
          this.setItem(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
        }
        if (!this.hasKey(STORAGE_KEYS.DEPARTMENTS)) {
          this.setItem(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
        }
        if (!this.hasKey(STORAGE_KEYS.CLASSES)) {
          this.setItem(STORAGE_KEYS.CLASSES, SEED_CLASSES);
        }
        if (!this.hasKey(STORAGE_KEYS.SECTIONS)) {
          this.setItem(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
        }
        if (!this.hasKey(STORAGE_KEYS.STUDENT_DOCS)) {
          this.setItem(STORAGE_KEYS.STUDENT_DOCS, SEED_STUDENT_DOCS);
        }
        if (!this.hasKey(STORAGE_KEYS.STUDENT_ACTIVITIES)) {
          this.setItem(STORAGE_KEYS.STUDENT_ACTIVITIES, SEED_STUDENT_ACTIVITIES);
        }
        // Lazy migration for Step 3 (Teacher Management)
        if (!this.hasKey(STORAGE_KEYS.TEACHERS)) {
          this.setItem(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
        }
        if (!this.hasKey(STORAGE_KEYS.TEACHER_DESIGNATIONS)) {
          this.setItem(STORAGE_KEYS.TEACHER_DESIGNATIONS, SEED_TEACHER_DESIGNATIONS);
        }
        if (!this.hasKey(STORAGE_KEYS.TEACHER_QUALIFICATIONS)) {
          this.setItem(STORAGE_KEYS.TEACHER_QUALIFICATIONS, SEED_TEACHER_QUALIFICATIONS);
        }
        if (!this.hasKey(STORAGE_KEYS.TEACHER_DOCS)) {
          this.setItem(STORAGE_KEYS.TEACHER_DOCS, SEED_TEACHER_DOCS);
        }
        if (!this.hasKey(STORAGE_KEYS.TEACHER_ACTIVITIES)) {
          this.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, SEED_TEACHER_ACTIVITIES);
        }
        // Lazy migration for Step 4 (Attendance & Leave Management)
        if (!this.hasKey(STORAGE_KEYS.ATTENDANCE)) {
          this.setItem(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
        }
        if (!this.hasKey(STORAGE_KEYS.LEAVE_APPLICATIONS)) {
          this.setItem(STORAGE_KEYS.LEAVE_APPLICATIONS, SEED_LEAVE_APPLICATIONS);
        }
        // Lazy migration for Step 5 (Academic Management)
        if (!this.hasKey(STORAGE_KEYS.ACADEMIC_SESSIONS)) {
          this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
        }
        if (!this.hasKey(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY)) {
          this.setItem(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, SEED_STUDENT_ACADEMIC_HISTORY);
        }
        if (!this.hasKey(STORAGE_KEYS.ACADEMIC_ACTIVITIES)) {
          this.setItem(STORAGE_KEYS.ACADEMIC_ACTIVITIES, []);
        }
        if (!this.hasKey(STORAGE_KEYS.ACADEMIC_SETTINGS)) {
          this.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, SEED_ACADEMIC_SETTINGS);
        }
        // Lazy migration for Step 6 (Subjects & Teacher Assignments)
        if (!this.hasKey(STORAGE_KEYS.SUBJECTS)) {
          this.setItem(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
        }
        if (!this.hasKey(STORAGE_KEYS.SUBJECT_DEPARTMENTS)) {
          this.setItem(STORAGE_KEYS.SUBJECT_DEPARTMENTS, SEED_SUBJECT_DEPARTMENTS);
        }
        if (!this.hasKey(STORAGE_KEYS.CLASS_SUBJECTS)) {
          this.setItem(STORAGE_KEYS.CLASS_SUBJECTS, SEED_CLASS_SUBJECTS);
        }
        if (!this.hasKey(STORAGE_KEYS.TEACHER_ASSIGNMENTS)) {
          this.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, SEED_TEACHER_ASSIGNMENTS);
        }
        if (!this.hasKey(STORAGE_KEYS.SUBJECT_ACTIVITIES)) {
          this.setItem(STORAGE_KEYS.SUBJECT_ACTIVITIES, []);
        }
        // Lazy migration for Step 7 (Class Routine & Timetable)
        if (!this.hasKey(STORAGE_KEYS.TIME_SLOTS)) {
          this.setItem(STORAGE_KEYS.TIME_SLOTS, SEED_TIME_SLOTS);
        }
        if (!this.hasKey(STORAGE_KEYS.CLASS_ROOMS)) {
          this.setItem(STORAGE_KEYS.CLASS_ROOMS, SEED_CLASS_ROOMS);
        }
        if (!this.hasKey(STORAGE_KEYS.ROUTINES)) {
          this.setItem(STORAGE_KEYS.ROUTINES, SEED_ROUTINES);
        }
        // Ensure permissions have routine, subjects, academic, attendance, teachers & students permissions
        const perms = this.getItem<DbPermission[]>(STORAGE_KEYS.PERMISSIONS, []);
        if (
          !perms.some((p) => p.slug === 'routine.view') ||
          !perms.some((p) => p.slug === 'subjects.view') ||
          !perms.some((p) => p.slug === 'academic.view') ||
          !perms.some((p) => p.slug === 'attendance.view') ||
          !perms.some((p) => p.slug === 'teachers.view') ||
          !perms.some((p) => p.slug === 'students.view')
        ) {
          this.setItem(STORAGE_KEYS.PERMISSIONS, SEED_PERMISSIONS);
          this.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, SEED_ROLE_PERMISSIONS);
        }

        // Ensure seed users have valid updated password hashes and purge removed users/roles (usr-002, usr-003, usr-005, usr-007)
        const existingUsers = this.getItem<DbUser[]>(STORAGE_KEYS.USERS, []);
        const purgedUsers = existingUsers.filter(
          (u) =>
            u.id !== 'usr-002' &&
            u.id !== 'usr-003' &&
            u.id !== 'usr-005' &&
            u.id !== 'usr-007' &&
            u.role_id !== 'institution_admin' &&
            u.role_id !== 'accountant' &&
            u.role_id !== 'student' &&
            u.email?.toLowerCase() !== 'director@darululoom.edu.bd' &&
            u.email?.toLowerCase() !== 'principal@darululoom.edu.bd' &&
            u.email?.toLowerCase() !== 'accountant@darululoom.edu.bd' &&
            u.email?.toLowerCase() !== 'student@darululoom.edu.bd'
        );
        let usersNeedSync = purgedUsers.length !== existingUsers.length;
        const syncedUsers = purgedUsers.map((u) => {
          const seed = SEED_USERS.find((su) => su.email.toLowerCase() === u.email.toLowerCase());
          if (seed && u.password_hash !== seed.password_hash) {
            usersNeedSync = true;
            return { ...u, password_hash: seed.password_hash };
          }
          return u;
        });
        if (usersNeedSync) {
          this.setItem(STORAGE_KEYS.USERS, syncedUsers);
        }
      }
    } catch (err) {
      console.warn('MadSolDb initialization fallback executed:', err);
    }
  }

  // --- Institutions ---
  public getInstitutions(): DbInstitution[] {
    const list = this.getItem<DbInstitution[]>(STORAGE_KEYS.INSTITUTIONS, SEED_INSTITUTIONS);
    return list.map(normalizeInstitution);
  }

  public getInstitutionById(id: string): DbInstitution | undefined {
    return this.getInstitutions().find((inst) => inst.id === id);
  }

  public createInstitution(data: Omit<DbInstitution, 'id' | 'created_at' | 'updated_at'>): DbInstitution {
    const institutions = this.getInstitutions();
    const generatedTeacherPin = data.teacher_access_pin || Math.floor(100000 + Math.random() * 900000).toString();
    const generatedGuardianPin = data.guardian_access_pin || Math.floor(100000 + Math.random() * 900000).toString();
    const newInst: DbInstitution = normalizeInstitution({
      ...data,
      teacher_access_pin: generatedTeacherPin,
      guardian_access_pin: generatedGuardianPin,
      id: `inst-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    institutions.push(newInst);
    this.setItem(STORAGE_KEYS.INSTITUTIONS, institutions);
    return newInst;
  }

  public regenerateInstitutionPins(institutionId: string, type: 'teacher' | 'guardian' | 'both'): DbInstitution | null {
    const institutions = this.getInstitutions();
    const index = institutions.findIndex((i) => i.id === institutionId);
    if (index === -1) return null;

    const current = institutions[index];
    const updates: Partial<DbInstitution> = {};
    if (type === 'teacher' || type === 'both') {
      updates.teacher_access_pin = Math.floor(100000 + Math.random() * 900000).toString();
    }
    if (type === 'guardian' || type === 'both') {
      updates.guardian_access_pin = Math.floor(100000 + Math.random() * 900000).toString();
    }

    institutions[index] = normalizeInstitution({
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.INSTITUTIONS, institutions);
    return institutions[index];
  }

  public updateInstitution(id: string, updates: Partial<Omit<DbInstitution, 'id' | 'created_at'>>): DbInstitution | null {
    const institutions = this.getInstitutions();
    const index = institutions.findIndex((i) => i.id === id);
    if (index === -1) return null;

    institutions[index] = normalizeInstitution({
      ...institutions[index],
      ...updates,
      updated_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.INSTITUTIONS, institutions);
    return institutions[index];
  }

  // --- Users ---
  public getUsers(institutionId?: string): DbUser[] {
    const allUsers = this.getItem<DbUser[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const normalized = allUsers
      .filter(
        (u) =>
          u.id !== 'usr-002' &&
          u.id !== 'usr-003' &&
          u.id !== 'usr-005' &&
          u.id !== 'usr-007' &&
          u.role_id !== 'institution_admin' &&
          u.role_id !== 'accountant' &&
          u.role_id !== 'student' &&
          u.email?.toLowerCase() !== 'director@darululoom.edu.bd' &&
          u.email?.toLowerCase() !== 'principal@darululoom.edu.bd' &&
          u.email?.toLowerCase() !== 'accountant@darululoom.edu.bd' &&
          u.email?.toLowerCase() !== 'student@darululoom.edu.bd'
      )
      .map(normalizeUser);
    if (institutionId) {
      return normalized.filter((u) => u.institution_id === institutionId);
    }
    return normalized;
  }

  public getUserById(id: string): DbUser | undefined {
    const user = this.getUsers().find((u) => u.id === id);
    return user ? normalizeUser(user) : undefined;
  }

  public findUserByIdentifier(identifier: string): DbUser | undefined {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPhone = trimmed.replace(/[^0-9]/g, '');
    const users = this.getUsers();

    const matched = users.find((u) => {
      const uEmail = u.email.toLowerCase();
      const uPhone = u.mobile.replace(/[^0-9]/g, '');
      const uRole = u.role_id?.toLowerCase();

      // Exact email
      if (uEmail === trimmed) return true;

      // Phone matching
      if (cleanPhone.length >= 10 && uPhone.includes(cleanPhone)) return true;

      // Username before @ (e.g. "director" matches "director@darululoom.edu.bd")
      if (uEmail.startsWith(`${trimmed}@`)) return true;

      // Role slug alias (e.g. "super_admin", "superadmin", "director", "principal")
      if (trimmed === 'superadmin' && uRole === 'super_admin') return true;
      if (trimmed === uRole) return true;

      return false;
    });

    return matched ? normalizeUser(matched) : undefined;
  }

  public createUser(
    data: {
      institution_id: string;
      name: string;
      email: string;
      mobile: string;
      password_hash: string;
      role_id: RoleSlug;
      status: UserStatus;
    } & Partial<DbUser>
  ): DbUser {
    const users = this.getUsers();

    const exists = users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase() || u.mobile === data.mobile
    );
    if (exists) {
      throw new Error('এই ইমেইল অথবা মোবাইল নম্বর দিয়ে ইতিমধ্যে ব্যবহারকারী নিবন্ধিত আছে।');
    }

    const newUser: DbUser = normalizeUser({
      ...data,
      id: `usr-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Omit<DbUser, 'id' | 'created_at'>>): DbUser | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = normalizeUser({
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  public deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      this.setItem(STORAGE_KEYS.USERS, filtered);
      return true;
    }
    return false;
  }

  // --- Roles & Permissions ---
  public getRoles(): DbRole[] {
    return this.getItem<DbRole[]>(STORAGE_KEYS.ROLES, SEED_ROLES);
  }

  public getRoleBySlug(slug: string): DbRole | undefined {
    return this.getRoles().find((r) => r.slug === slug);
  }

  public getPermissions(): DbPermission[] {
    return this.getItem<DbPermission[]>(STORAGE_KEYS.PERMISSIONS, SEED_PERMISSIONS);
  }

  public getRolePermissions(roleSlug: string): string[] {
    const role = this.getRoleBySlug(roleSlug);
    if (!role) return [];
    if (role.slug === 'super_admin') return ['*'];

    const rolePerms = this.getItem<DbRolePermission[]>(STORAGE_KEYS.ROLE_PERMISSIONS, SEED_ROLE_PERMISSIONS);
    const perms = this.getPermissions();

    const permIds = rolePerms.filter((rp) => rp.role_id === role.id).map((rp) => rp.permission_id);
    return perms.filter((p) => permIds.includes(p.id)).map((p) => p.slug);
  }

  // --- Sessions ---
  public createSession(userId: string, rememberMe: boolean = true): DbUserSession {
    const sessions = this.getItem<DbUserSession[]>(STORAGE_KEYS.SESSIONS, []);
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    const newSession: DbUserSession = {
      id: `sess-${Date.now().toString(36)}`,
      user_id: userId,
      token: `ms_tk_${Math.random().toString(36).substring(2)}_${Date.now()}`,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      ip_address: '127.0.0.1 (Client)',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
    };

    sessions.push(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  public validateSession(token: string): DbUser | null {
    if (!token) return null;
    const sessions = this.getItem<DbUserSession[]>(STORAGE_KEYS.SESSIONS, []);
    const session = sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expires_at) < new Date()) {
      this.deleteSession(token);
      return null;
    }

    const user = this.getUserById(session.user_id);
    if (!user) return null;

    if (user.status === 'suspended' || user.status === 'disabled') {
      return null;
    }

    return normalizeUser(user);
  }

  public deleteSession(token: string): void {
    const sessions = this.getItem<DbUserSession[]>(STORAGE_KEYS.SESSIONS, []);
    const filtered = sessions.filter((s) => s.token !== token);
    this.setItem(STORAGE_KEYS.SESSIONS, filtered);
  }

  public deleteUserSessions(userId: string): void {
    const sessions = this.getItem<DbUserSession[]>(STORAGE_KEYS.SESSIONS, []);
    const filtered = sessions.filter((s) => s.user_id !== userId);
    this.setItem(STORAGE_KEYS.SESSIONS, filtered);
  }

  // --- Activity Logs ---
  public getActivityLogs(institutionId?: string): DbActivityLog[] {
    const logs = this.getItem<DbActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
    if (institutionId) {
      return logs.filter((l) => l.institution_id === institutionId || !l.institution_id);
    }
    return logs;
  }

  public addActivityLog(log: Omit<DbActivityLog, 'id' | 'timestamp'>): DbActivityLog {
    const logs = this.getItem<DbActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
    const newLog: DbActivityLog = {
      ...log,
      id: `act-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 200);
    this.setItem(STORAGE_KEYS.ACTIVITY_LOGS, trimmed);
    return newLog;
  }

  // --- Student Management (Step 2) ---

  public getDepartments(institutionId?: string): DbDepartment[] {
    const list = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const classes = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);

    let filtered = list;
    if (institutionId && institutionId !== 'all') {
      filtered = filtered.filter((d) => d.institution_id === institutionId);
    }

    return filtered.map((d) => {
      const deptClasses = classes.filter((c) => c.institution_id === d.institution_id && c.department_id === d.id);
      const deptStudents = students.filter(
        (s) => s.institution_id === d.institution_id && s.department_id === d.id && !s.deleted_at
      );
      return {
        ...d,
        status: d.status || 'active',
        total_classes: deptClasses.length,
        total_students: deptStudents.length,
      };
    });
  }

  public getClasses(institutionId?: string, departmentId?: string, sessionId?: string): DbClass[] {
    const list = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const departments = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const sessions = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    const sections = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);

    let filtered = list;
    if (institutionId && institutionId !== 'all') {
      filtered = filtered.filter((c) => c.institution_id === institutionId);
    }
    if (departmentId && departmentId !== 'all') {
      filtered = filtered.filter((c) => c.department_id === departmentId);
    }
    if (sessionId && sessionId !== 'all') {
      filtered = filtered.filter((c) => !c.academic_session_id || c.academic_session_id === sessionId);
    }

    const mapped = filtered.map((c) => {
      const dept = departments.find((d) => d.id === c.department_id);
      const sess = sessions.find((s) => s.id === c.academic_session_id);
      const clsSections = sections.filter((sec) => sec.class_id === c.id);
      const clsStudents = students.filter(
        (s) => s.institution_id === c.institution_id && s.class_id === c.id && !s.deleted_at
      );

      return {
        ...c,
        status: c.status || 'active',
        department_name_bn: dept?.name_bn || '',
        department_name_en: dept?.name_en || '',
        session_name: sess?.name || '',
        total_sections: clsSections.length,
        total_students: clsStudents.length,
        class_order: c.class_order ?? 999,
      };
    });

    return mapped.sort((a, b) => (a.class_order ?? 999) - (b.class_order ?? 999));
  }

  public getSections(institutionId?: string, classId?: string, departmentId?: string): DbSection[] {
    const list = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const classes = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const departments = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const sessions = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);

    let filtered = list;
    if (institutionId && institutionId !== 'all') {
      filtered = filtered.filter((s) => s.institution_id === institutionId);
    }
    if (classId && classId !== 'all') {
      filtered = filtered.filter((s) => s.class_id === classId);
    }
    if (departmentId && departmentId !== 'all') {
      filtered = filtered.filter((s) => {
        if (s.department_id) return s.department_id === departmentId;
        const parentClass = classes.find((c) => c.id === s.class_id);
        return parentClass?.department_id === departmentId;
      });
    }

    return filtered.map((s) => {
      const cls = classes.find((c) => c.id === s.class_id);
      const deptId = s.department_id || cls?.department_id;
      const dept = departments.find((d) => d.id === deptId);
      const sess = sessions.find((ses) => ses.id === (s.academic_session_id || cls?.academic_session_id));
      const secStudents = students.filter(
        (st) => st.institution_id === s.institution_id && st.section_id === s.id && !st.deleted_at
      );

      return {
        ...s,
        name: s.name || s.name_bn,
        status: s.status || 'active',
        class_name_bn: cls?.name_bn || '',
        department_name_bn: dept?.name_bn || '',
        session_name: sess?.name || '',
        total_students: secStudents.length,
      };
    });
  }

  public getAllStudentsList(institutionId?: string): DbStudent[] {
    const list = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    if (!institutionId || institutionId === 'all') return list;
    return list.filter((s) => s.institution_id === institutionId);
  }

  public generateNextStudentId(institutionId: string, session: string = '2026'): string {
    const students = this.getAllStudentsList(institutionId);
    const prefix = `MDS-${session}-`;
    let highestNumber = 0;

    for (const student of students) {
      if (student.student_id && student.student_id.startsWith(prefix)) {
        const numPart = student.student_id.substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > highestNumber) {
          highestNumber = parsed;
        }
      }
    }

    const nextNumber = highestNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  public checkStudentIdUnique(studentId: string, excludeId?: string): boolean {
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const trimmed = studentId.trim().toUpperCase();
    return !students.some((s) => s.id !== excludeId && s.student_id.toUpperCase() === trimmed);
  }

  public checkRollUnique(
    institutionId: string,
    classId: string,
    session: string,
    rollNumber: string,
    excludeId?: string
  ): boolean {
    const students = this.getAllStudentsList(institutionId);
    const trimmedRoll = rollNumber.trim();
    return !students.some(
      (s) =>
        s.id !== excludeId &&
        !s.deleted_at &&
        s.class_id === classId &&
        s.academic_session === session &&
        s.roll_number.trim() === trimmedRoll
    );
  }

  public getStudents(
    institutionId: string,
    options?: StudentFilterOptions
  ): { students: DbStudent[]; total: number } {
    let list = this.getAllStudentsList(institutionId);

    // Multi-Institution isolation & soft-delete filter
    list = list.filter((s) => !s.deleted_at);

    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name_bn.toLowerCase().includes(q) ||
          s.full_name_en.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q) ||
          s.roll_number.toLowerCase().includes(q) ||
          (s.mobile && s.mobile.includes(q))
      );
    }

    if (options?.department_id && options.department_id !== 'all') {
      list = list.filter((s) => s.department_id === options.department_id);
    }

    if (options?.class_id && options.class_id !== 'all') {
      list = list.filter((s) => s.class_id === options.class_id);
    }

    if (options?.section_id && options.section_id !== 'all') {
      list = list.filter((s) => s.section_id === options.section_id);
    }

    if (options?.academic_session && options.academic_session !== 'all') {
      list = list.filter((s) => s.academic_session === options.academic_session);
    }

    if (options?.gender && options.gender !== 'all') {
      list = list.filter((s) => s.gender === options.gender);
    }

    if (options?.status && options.status !== 'all') {
      list = list.filter((s) => s.status === options.status);
    }

    // Sorting
    const sortBy = options?.sortBy || 'admission_date';
    const sortOrder = options?.sortOrder || 'desc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.full_name_bn.localeCompare(b.full_name_bn);
      } else if (sortBy === 'student_id') {
        comparison = a.student_id.localeCompare(b.student_id);
      } else if (sortBy === 'roll_number') {
        const rollA = parseInt(a.roll_number, 10) || 0;
        const rollB = parseInt(b.roll_number, 10) || 0;
        comparison = rollA - rollB;
      } else {
        // admission_date or default
        comparison = new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = list.length;

    // Pagination
    if (options?.page && options?.pageSize) {
      const start = (options.page - 1) * options.pageSize;
      list = list.slice(start, start + options.pageSize);
    }

    return { students: list, total };
  }

  public getStudentById(id: string, institutionId?: string): DbStudent | undefined {
    const list = this.getAllStudentsList(institutionId);
    return list.find((s) => s.id === id);
  }

  public getStudentByStudentId(studentId: string, institutionId?: string): DbStudent | undefined {
    const list = this.getAllStudentsList(institutionId);
    return list.find((s) => s.student_id.toUpperCase() === studentId.trim().toUpperCase());
  }

  public createStudent(
    data: Omit<DbStudent, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
    actor: { id: string; name: string }
  ): DbStudent {
    if (!this.checkStudentIdUnique(data.student_id)) {
      throw new Error('এই শিক্ষার্থী আইডি ইতোমধ্যে ব্যবহৃত হয়েছে। (This Student ID is already in use)');
    }

    if (!this.checkRollUnique(data.institution_id, data.class_id, data.academic_session, data.roll_number)) {
      throw new Error('এই ক্লাসে এই রোল নম্বরটি ইতিমধ্যে অন্য শিক্ষার্থীকে দেওয়া হয়েছে। (Duplicate Roll Number in Class)');
    }

    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const newStudent: DbStudent = {
      ...data,
      id: `std-${Date.now().toString(36)}`,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    students.unshift(newStudent);
    this.setItem(STORAGE_KEYS.STUDENTS, students);

    // Create Student Activity Log
    this.addStudentActivity({
      institution_id: data.institution_id,
      student_id: newStudent.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'STUDENT_CREATED',
      description: `শিক্ষার্থী ${newStudent.full_name_bn} (${newStudent.student_id}) এর ভর্তি সফলভাবে সম্পন্ন হয়েছে।`,
    });

    // Create Global Activity Log
    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: data.institution_id,
      action: 'STUDENT_ADMISSION',
      description: `নতুন শিক্ষার্থী ${newStudent.full_name_bn} (আইডি: ${newStudent.student_id}) ভর্তি করা হয়েছে।`,
      status: 'success',
    });

    return newStudent;
  }

  public updateStudent(
    id: string,
    updates: Partial<Omit<DbStudent, 'id' | 'institution_id' | 'created_at'>>,
    actor: { id: string; name: string }
  ): DbStudent | null {
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const current = students[index];

    // Check Student ID uniqueness if changing
    if (updates.student_id && updates.student_id !== current.student_id) {
      if (!this.checkStudentIdUnique(updates.student_id, id)) {
        throw new Error('এই শিক্ষার্থী আইডি ইতোমধ্যে ব্যবহৃত হয়েছে।');
      }
    }

    // Check Roll uniqueness if changing class/roll/session
    const targetClass = updates.class_id || current.class_id;
    const targetSession = updates.academic_session || current.academic_session;
    const targetRoll = updates.roll_number || current.roll_number;

    if (
      (updates.roll_number && updates.roll_number !== current.roll_number) ||
      (updates.class_id && updates.class_id !== current.class_id)
    ) {
      if (!this.checkRollUnique(current.institution_id, targetClass, targetSession, targetRoll, id)) {
        throw new Error('এই ক্লাসে এই রোল নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে।');
      }
    }

    const updated: DbStudent = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    students[index] = updated;
    this.setItem(STORAGE_KEYS.STUDENTS, students);

    // Activity Log
    this.addStudentActivity({
      institution_id: updated.institution_id,
      student_id: updated.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'STUDENT_UPDATED',
      description: `শিক্ষার্থী ${updated.full_name_bn} এর তথ্য আপডেট করা হয়েছে।`,
    });

    return updated;
  }

  public changeStudentStatus(
    id: string,
    newStatus: StudentStatus,
    reason: string | undefined,
    actor: { id: string; name: string }
  ): DbStudent | null {
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const current = students[index];
    const prevStatus = current.status;
    current.status = newStatus;
    current.updated_at = new Date().toISOString();

    students[index] = current;
    this.setItem(STORAGE_KEYS.STUDENTS, students);

    const desc = `স্ট্যাটাস পরিবর্তন: ${prevStatus} -> ${newStatus}${reason ? ` (${reason})` : ''}`;

    this.addStudentActivity({
      institution_id: current.institution_id,
      student_id: current.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'STATUS_CHANGED',
      description: desc,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: current.institution_id,
      action: 'STUDENT_STATUS_CHANGE',
      description: `শিক্ষার্থী ${current.full_name_bn} (${current.student_id}) এর ${desc}`,
      status: 'success',
    });

    return current;
  }

  public softDeleteStudent(id: string, actor: { id: string; name: string }): boolean {
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return false;

    const current = students[index];
    current.deleted_at = new Date().toISOString();
    current.updated_at = new Date().toISOString();

    students[index] = current;
    this.setItem(STORAGE_KEYS.STUDENTS, students);

    this.addStudentActivity({
      institution_id: current.institution_id,
      student_id: current.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'STUDENT_DELETED',
      description: `শিক্ষার্থী ${current.full_name_bn} (${current.student_id}) সফট ডিলিট করা হয়েছে।`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: current.institution_id,
      action: 'STUDENT_DELETED',
      description: `শিক্ষার্থী ${current.full_name_bn} মুছে ফেলা হয়েছে (Soft Deleted)।`,
      status: 'warning',
    });

    return true;
  }

  // --- Student Documents ---
  public getStudentDocuments(studentId: string, institutionId: string): DbStudentDocument[] {
    const list = this.getItem<DbStudentDocument[]>(STORAGE_KEYS.STUDENT_DOCS, SEED_STUDENT_DOCS);
    return list.filter((d) => d.student_id === studentId && d.institution_id === institutionId);
  }

  public addStudentDocument(
    doc: Omit<DbStudentDocument, 'id' | 'created_at'>,
    actor: { id: string; name: string }
  ): DbStudentDocument {
    const list = this.getItem<DbStudentDocument[]>(STORAGE_KEYS.STUDENT_DOCS, SEED_STUDENT_DOCS);
    const newDoc: DbStudentDocument = {
      ...doc,
      id: `sdoc-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    list.unshift(newDoc);
    this.setItem(STORAGE_KEYS.STUDENT_DOCS, list);

    this.addStudentActivity({
      institution_id: doc.institution_id,
      student_id: doc.student_id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'DOCUMENT_UPLOADED',
      description: `ডকুমেন্ট আপলোড করা হয়েছে: ${doc.file_name} (${doc.category})`,
    });

    return newDoc;
  }

  public deleteStudentDocument(
    docId: string,
    studentId: string,
    actor: { id: string; name: string }
  ): boolean {
    const list = this.getItem<DbStudentDocument[]>(STORAGE_KEYS.STUDENT_DOCS, SEED_STUDENT_DOCS);
    const target = list.find((d) => d.id === docId);
    if (!target) return false;

    const filtered = list.filter((d) => d.id !== docId);
    this.setItem(STORAGE_KEYS.STUDENT_DOCS, filtered);

    this.addStudentActivity({
      institution_id: target.institution_id,
      student_id: studentId,
      user_id: actor.id,
      user_name: actor.name,
      action: 'DOCUMENT_DELETED',
      description: `ডকুমেন্ট মুছে ফেলা হয়েছে: ${target.file_name}`,
    });

    return true;
  }

  // --- Student Activities ---
  public getStudentActivities(studentId: string, institutionId: string): DbStudentActivity[] {
    const list = this.getItem<DbStudentActivity[]>(STORAGE_KEYS.STUDENT_ACTIVITIES, SEED_STUDENT_ACTIVITIES);
    return list
      .filter((a) => a.student_id === studentId && (a.institution_id === institutionId || !a.institution_id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addStudentActivity(activity: Omit<DbStudentActivity, 'id' | 'created_at'>): DbStudentActivity {
    const list = this.getItem<DbStudentActivity[]>(STORAGE_KEYS.STUDENT_ACTIVITIES, SEED_STUDENT_ACTIVITIES);
    const newAct: DbStudentActivity = {
      ...activity,
      id: `sact-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    list.unshift(newAct);
    this.setItem(STORAGE_KEYS.STUDENT_ACTIVITIES, list.slice(0, 500));
    return newAct;
  }

  // --- Student Statistics ---
  public getStudentStats(institutionId: string): StudentStats {
    const students = this.getAllStudentsList(institutionId).filter((s) => !s.deleted_at);

    return {
      total: students.length,
      active: students.filter((s) => s.status === 'active').length,
      pending: students.filter((s) => s.status === 'pending').length,
      inactive: students.filter((s) => s.status === 'inactive').length,
      on_leave: students.filter((s) => s.status === 'on_leave').length,
      transferred: students.filter((s) => s.status === 'transferred').length,
      graduated: students.filter((s) => s.status === 'graduated').length,
    };
  }

  // ==========================================
  // --- Step 3: Teacher Management System ---
  // ==========================================

  public getTeacherDesignations(): DbTeacherDesignation[] {
    return this.getItem<DbTeacherDesignation[]>(STORAGE_KEYS.TEACHER_DESIGNATIONS, SEED_TEACHER_DESIGNATIONS);
  }

  public getAllTeachersList(institutionId?: string): DbTeacher[] {
    const list = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    if (!institutionId || institutionId === 'all') return list;
    return list.filter((t) => t.institution_id === institutionId);
  }

  public generateNextTeacherId(institutionId: string, year: string = '2026'): string {
    const teachers = this.getAllTeachersList(institutionId);
    const prefix = `MDS-T-${year}-`;
    let highestNumber = 0;

    for (const teacher of teachers) {
      if (teacher.teacher_id && teacher.teacher_id.startsWith(prefix)) {
        const numPart = teacher.teacher_id.substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > highestNumber) {
          highestNumber = parsed;
        }
      }
    }

    const nextNumber = highestNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  public checkTeacherIdUnique(teacherId: string, excludeId?: string): boolean {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const trimmed = teacherId.trim().toUpperCase();
    return !teachers.some((t) => t.id !== excludeId && t.teacher_id.toUpperCase() === trimmed);
  }

  public getTeachers(
    institutionId: string,
    options?: TeacherFilterOptions
  ): { teachers: DbTeacher[]; total: number } {
    let list = this.getAllTeachersList(institutionId);

    // Filter soft-deleted
    list = list.filter((t) => !t.deleted_at);

    // Search query
    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.full_name_bn.toLowerCase().includes(q) ||
          t.full_name_en.toLowerCase().includes(q) ||
          t.teacher_id.toLowerCase().includes(q) ||
          (t.primary_mobile && t.primary_mobile.includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.specialization && t.specialization.toLowerCase().includes(q))
      );
    }

    // Designation filter
    if (options?.designation_id && options.designation_id !== 'all') {
      list = list.filter((t) => t.designation_id === options.designation_id);
    }

    // Department filter
    if (options?.department_id && options.department_id !== 'all') {
      list = list.filter((t) => t.department_id === options.department_id);
    }

    // Status filter
    if (options?.status && options.status !== 'all') {
      list = list.filter((t) => t.employment_status === options.status);
    }

    // Employment type filter
    if (options?.employment_type && options.employment_type !== 'all') {
      list = list.filter((t) => t.employment_type === options.employment_type);
    }

    // Gender filter
    if (options?.gender && options.gender !== 'all') {
      list = list.filter((t) => t.gender === options.gender);
    }

    // Sorting
    const sortBy = options?.sortBy || 'joining_date';
    const sortOrder = options?.sortOrder || 'desc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.full_name_bn.localeCompare(b.full_name_bn);
      } else if (sortBy === 'teacher_id') {
        comparison = a.teacher_id.localeCompare(b.teacher_id);
      } else if (sortBy === 'experience') {
        comparison = (a.experience_years || 0) - (b.experience_years || 0);
      } else {
        // joining_date or default
        const timeA = new Date(a.joining_date).getTime();
        const timeB = new Date(b.joining_date).getTime();
        comparison = timeB - timeA;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = list.length;

    // Pagination
    if (options?.page && options?.pageSize) {
      const start = (options.page - 1) * options.pageSize;
      list = list.slice(start, start + options.pageSize);
    }

    return { teachers: list, total };
  }

  public getTeacherById(id: string, institutionId?: string): DbTeacher | undefined {
    const list = this.getAllTeachersList(institutionId);
    return list.find((t) => t.id === id);
  }

  public getTeacherByTeacherId(teacherId: string, institutionId?: string): DbTeacher | undefined {
    const list = this.getAllTeachersList(institutionId);
    return list.find((t) => t.teacher_id.toUpperCase() === teacherId.trim().toUpperCase());
  }

  public getTeacherByUserId(userId: string, institutionId?: string): DbTeacher | undefined {
    const list = this.getAllTeachersList(institutionId);
    return list.find((t) => t.user_id === userId && !t.deleted_at);
  }

  public createTeacher(
    data: Omit<DbTeacher, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
    actor: { id: string; name: string }
  ): DbTeacher {
    if (!this.checkTeacherIdUnique(data.teacher_id)) {
      throw new Error('এই শিক্ষক আইডি ইতোমধ্যে ব্যবহৃত হয়েছে। (This Teacher ID is already in use)');
    }

    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const newTeacher: DbTeacher = {
      ...data,
      id: `tch-${Date.now().toString(36)}`,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    teachers.unshift(newTeacher);
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    // Create Teacher Activity Log
    this.addTeacherActivity({
      institution_id: data.institution_id,
      teacher_id: newTeacher.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'TEACHER_CREATED',
      description: `শিক্ষক ${newTeacher.full_name_bn} (${newTeacher.teacher_id}) সফলভাবে নিবন্ধিত হয়েছেন।`,
    });

    // Create Global Activity Log
    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: data.institution_id,
      action: 'TEACHER_REGISTRATION',
      description: `নতুন শিক্ষক ${newTeacher.full_name_bn} (আইডি: ${newTeacher.teacher_id}) সিস্টেমে যোগ করা হয়েছে।`,
      status: 'success',
    });

    return newTeacher;
  }

  public updateTeacher(
    id: string,
    updates: Partial<Omit<DbTeacher, 'id' | 'institution_id' | 'created_at'>>,
    actor: { id: string; name: string }
  ): DbTeacher | null {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = teachers[index];

    // Check Teacher ID uniqueness if changing
    if (updates.teacher_id && updates.teacher_id !== current.teacher_id) {
      if (!this.checkTeacherIdUnique(updates.teacher_id, id)) {
        throw new Error('এই শিক্ষক আইডি ইতোমধ্যে ব্যবহৃত হয়েছে।');
      }
    }

    const updatedTeacher: DbTeacher = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    teachers[index] = updatedTeacher;
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    // Log Activity
    this.addTeacherActivity({
      institution_id: current.institution_id,
      teacher_id: current.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'TEACHER_UPDATED',
      description: `শিক্ষক ${updatedTeacher.full_name_bn} এর তথ্য আপডেট করা হয়েছে।`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: current.institution_id,
      action: 'TEACHER_UPDATE',
      description: `শিক্ষক ${updatedTeacher.full_name_bn} (${updatedTeacher.teacher_id}) এর প্রোফাইল সম্পাদনা করা হয়েছে।`,
      status: 'success',
    });

    return updatedTeacher;
  }

  public changeTeacherStatus(
    id: string,
    newStatus: TeacherStatus,
    reason: string | undefined,
    actor: { id: string; name: string }
  ): DbTeacher | null {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = teachers[index];
    const prevStatus = current.employment_status;
    current.employment_status = newStatus;
    current.updated_at = new Date().toISOString();

    teachers[index] = current;
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    const reasonText = reason ? ` | কারণ: ${reason}` : '';
    this.addTeacherActivity({
      institution_id: current.institution_id,
      teacher_id: current.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'STATUS_CHANGED',
      description: `শিক্ষকের স্ট্যাটাস পরিবর্তন: ${prevStatus} -> ${newStatus}${reasonText}`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: current.institution_id,
      action: 'TEACHER_STATUS_CHANGE',
      description: `শিক্ষক ${current.full_name_bn} এর স্ট্যাটাস '${newStatus}' নির্ধারণ করা হয়েছে।`,
      status: 'success',
    });

    return current;
  }

  public softDeleteTeacher(id: string, actor: { id: string; name: string }): boolean {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) return false;

    const current = teachers[index];
    current.deleted_at = new Date().toISOString();
    current.updated_at = new Date().toISOString();

    teachers[index] = current;
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    this.addTeacherActivity({
      institution_id: current.institution_id,
      teacher_id: current.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'TEACHER_DELETED',
      description: `শিক্ষক প্রোফাইল সফট ডিলিট করা হয়েছে।`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: current.institution_id,
      action: 'TEACHER_DELETE',
      description: `শিক্ষক ${current.full_name_bn} (${current.teacher_id}) মুছে ফেলা হয়েছে (Soft Delete)।`,
      status: 'warning',
    });

    return true;
  }

  // --- Teacher Qualifications ---
  public getTeacherQualifications(teacherId: string, institutionId?: string): DbTeacherQualification[] {
    const list = this.getItem<DbTeacherQualification[]>(
      STORAGE_KEYS.TEACHER_QUALIFICATIONS,
      SEED_TEACHER_QUALIFICATIONS
    );
    return list.filter((q) => {
      const matchTeacher = q.teacher_id === teacherId;
      if (!matchTeacher) return false;
      if (institutionId && institutionId !== 'all') {
        return q.institution_id === institutionId;
      }
      return true;
    });
  }

  public addTeacherQualification(
    data: Omit<DbTeacherQualification, 'id' | 'created_at' | 'updated_at'>,
    actor: { id: string; name: string }
  ): DbTeacherQualification {
    const list = this.getItem<DbTeacherQualification[]>(
      STORAGE_KEYS.TEACHER_QUALIFICATIONS,
      SEED_TEACHER_QUALIFICATIONS
    );
    const newQual: DbTeacherQualification = {
      ...data,
      id: `tqual-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    list.push(newQual);
    this.setItem(STORAGE_KEYS.TEACHER_QUALIFICATIONS, list);

    this.addTeacherActivity({
      institution_id: data.institution_id,
      teacher_id: data.teacher_id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'QUALIFICATION_ADDED',
      description: `শিক্ষাগত যোগ্যতা যোগ করা হয়েছে: ${newQual.qualification_name} (${newQual.institution_name})`,
    });

    return newQual;
  }

  public deleteTeacherQualification(id: string, teacherId: string, actor: { id: string; name: string }): boolean {
    const list = this.getItem<DbTeacherQualification[]>(
      STORAGE_KEYS.TEACHER_QUALIFICATIONS,
      SEED_TEACHER_QUALIFICATIONS
    );
    const item = list.find((q) => q.id === id && q.teacher_id === teacherId);
    if (!item) return false;

    const filtered = list.filter((q) => q.id !== id);
    this.setItem(STORAGE_KEYS.TEACHER_QUALIFICATIONS, filtered);

    this.addTeacherActivity({
      institution_id: item.institution_id,
      teacher_id: item.teacher_id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'QUALIFICATION_REMOVED',
      description: `শিক্ষাগত যোগ্যতা মুছে ফেলা হয়েছে: ${item.qualification_name}`,
    });

    return true;
  }

  // --- Teacher Documents ---
  public getTeacherDocuments(teacherId: string, institutionId?: string): DbTeacherDocument[] {
    const list = this.getItem<DbTeacherDocument[]>(STORAGE_KEYS.TEACHER_DOCS, SEED_TEACHER_DOCS);
    return list.filter((d) => {
      const matchTeacher = d.teacher_id === teacherId;
      if (!matchTeacher) return false;
      if (institutionId && institutionId !== 'all') {
        return d.institution_id === institutionId;
      }
      return true;
    });
  }

  public addTeacherDocument(
    doc: Omit<DbTeacherDocument, 'id' | 'created_at'>,
    actor: { id: string; name: string }
  ): DbTeacherDocument {
    const list = this.getItem<DbTeacherDocument[]>(STORAGE_KEYS.TEACHER_DOCS, SEED_TEACHER_DOCS);
    const newDoc: DbTeacherDocument = {
      ...doc,
      id: `tdoc-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    list.unshift(newDoc);
    this.setItem(STORAGE_KEYS.TEACHER_DOCS, list);

    this.addTeacherActivity({
      institution_id: doc.institution_id,
      teacher_id: doc.teacher_id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'DOCUMENT_UPLOADED',
      description: `ডকুমেন্ট আপলোড করা হয়েছে: ${newDoc.document_name} (${newDoc.category})`,
    });

    return newDoc;
  }

  public deleteTeacherDocument(docId: string, teacherId: string, actor: { id: string; name: string }): boolean {
    const list = this.getItem<DbTeacherDocument[]>(STORAGE_KEYS.TEACHER_DOCS, SEED_TEACHER_DOCS);
    const item = list.find((d) => d.id === docId && d.teacher_id === teacherId);
    if (!item) return false;

    const filtered = list.filter((d) => d.id !== docId);
    this.setItem(STORAGE_KEYS.TEACHER_DOCS, filtered);

    this.addTeacherActivity({
      institution_id: item.institution_id,
      teacher_id: item.teacher_id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'DOCUMENT_DELETED',
      description: `ডকুমেন্ট মুছে ফেলা হয়েছে: ${item.document_name}`,
    });

    return true;
  }

  // --- Teacher Activities ---
  public getTeacherActivities(teacherId: string, institutionId?: string): DbTeacherActivity[] {
    const list = this.getItem<DbTeacherActivity[]>(STORAGE_KEYS.TEACHER_ACTIVITIES, SEED_TEACHER_ACTIVITIES);
    return list.filter((a) => {
      const matchTeacher = a.teacher_id === teacherId;
      if (!matchTeacher) return false;
      if (institutionId && institutionId !== 'all') {
        return a.institution_id === institutionId;
      }
      return true;
    });
  }

  public addTeacherActivity(activity: Omit<DbTeacherActivity, 'id' | 'created_at'>): DbTeacherActivity {
    const list = this.getItem<DbTeacherActivity[]>(STORAGE_KEYS.TEACHER_ACTIVITIES, SEED_TEACHER_ACTIVITIES);
    const newAct: DbTeacherActivity = {
      ...activity,
      id: `tact-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    list.unshift(newAct);
    this.setItem(STORAGE_KEYS.TEACHER_ACTIVITIES, list.slice(0, 500));
    return newAct;
  }

  // --- Teacher Statistics ---
  public getTeacherStats(institutionId: string): TeacherStats {
    const teachers = this.getAllTeachersList(institutionId).filter((t) => !t.deleted_at);

    return {
      total: teachers.length,
      active: teachers.filter((t) => t.employment_status === 'active').length,
      pending: teachers.filter((t) => t.employment_status === 'pending').length,
      inactive: teachers.filter((t) => t.employment_status === 'inactive').length,
      on_leave: teachers.filter((t) => t.employment_status === 'on_leave').length,
      resigned: teachers.filter((t) => t.employment_status === 'resigned').length,
      terminated: teachers.filter((t) => t.employment_status === 'terminated').length,
      suspended: teachers.filter((t) => t.employment_status === 'suspended').length,
      retired: teachers.filter((t) => t.employment_status === 'retired').length,
      left: teachers.filter((t) => t.employment_status === 'left').length,
    };
  }

  // --- Teacher & User Account Linking ---
  public getAvailableUsersForTeacher(institutionId: string, currentTeacherId?: string): DbUser[] {
    const users = this.getItem<DbUser[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const teachers = this.getAllTeachersList(institutionId).filter((t) => !t.deleted_at);

    // Filter to users in this institution
    return users.filter((u) => {
      if (u.institution_id !== institutionId) return false;
      // Is this user linked to another teacher profile?
      const linkedTeacher = teachers.find((t) => t.user_id === u.id);
      if (linkedTeacher && linkedTeacher.id !== currentTeacherId) {
        return false;
      }
      return true;
    });
  }

  public connectTeacherUserAccount(
    teacherId: string,
    userId: string,
    actor: { id: string; name: string }
  ): { success: boolean; message?: string } {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const tIndex = teachers.findIndex((t) => t.id === teacherId);
    if (tIndex === -1) return { success: false, message: 'শিক্ষক প্রোফাইল পাওয়া যায়নি।' };

    const teacher = teachers[tIndex];

    // Check user exists
    const users = this.getItem<DbUser[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const user = users.find((u) => u.id === userId);
    if (!user) return { success: false, message: 'ব্যবহারকারী অ্যাকাউন্ট পাওয়া যায়নি।' };

    if (user.institution_id !== teacher.institution_id) {
      return { success: false, message: 'অ্যাকাউন্টটি এই প্রতিষ্ঠানের নয়।' };
    }

    // Check if user is already linked to another teacher
    const alreadyLinked = teachers.find((t) => t.id !== teacherId && t.user_id === userId && !t.deleted_at);
    if (alreadyLinked) {
      return {
        success: false,
        message: `এই অ্যাকাউন্টটি ইতোমধ্যে শিক্ষক '${alreadyLinked.full_name_bn}' এর প্রোফাইলের সাথে সংযুক্ত আছে।`,
      };
    }

    teacher.user_id = userId;
    teacher.updated_at = new Date().toISOString();
    teachers[tIndex] = teacher;
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    this.addTeacherActivity({
      institution_id: teacher.institution_id,
      teacher_id: teacher.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'ACCOUNT_CONNECTED',
      description: `লগইন অ্যাকাউন্ট (${user.name} - ${user.email}) শিক্ষক প্রোফাইলের সাথে সংযুক্ত করা হয়েছে।`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: teacher.institution_id,
      action: 'TEACHER_ACCOUNT_LINK',
      description: `শিক্ষক ${teacher.full_name_bn} এর সাথে অ্যাকাউন্ট ${user.email} সংযুক্ত করা হয়েছে।`,
      status: 'success',
    });

    return { success: true };
  }

  public disconnectTeacherUserAccount(
    teacherId: string,
    actor: { id: string; name: string }
  ): boolean {
    const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    const tIndex = teachers.findIndex((t) => t.id === teacherId);
    if (tIndex === -1) return false;

    const teacher = teachers[tIndex];
    const oldUserId = teacher.user_id;
    teacher.user_id = null;
    teacher.updated_at = new Date().toISOString();
    teachers[tIndex] = teacher;
    this.setItem(STORAGE_KEYS.TEACHERS, teachers);

    this.addTeacherActivity({
      institution_id: teacher.institution_id,
      teacher_id: teacher.id,
      user_id: actor.id,
      user_name: actor.name,
      action: 'ACCOUNT_DISCONNECTED',
      description: `লগইন অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করা হয়েছে।`,
    });

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: teacher.institution_id,
      action: 'TEACHER_ACCOUNT_UNLINK',
      description: `শিক্ষক ${teacher.full_name_bn} এর অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করা হয়েছে।`,
      status: 'warning',
    });

    return true;
  }

  public createAndConnectTeacherUserAccount(
    teacherId: string,
    params: { name: string; email: string; mobile: string; password: string; role_id: RoleSlug },
    actor: { id: string; name: string }
  ): { success: boolean; user?: DbUser; message?: string } {
    const teacher = this.getTeacherById(teacherId);
    if (!teacher) return { success: false, message: 'শিক্ষক পাওয়া যায়নি।' };

    // Check email uniqueness
    const users = this.getItem<DbUser[]>(STORAGE_KEYS.USERS, SEED_USERS);
    if (users.some((u) => u.email.toLowerCase() === params.email.trim().toLowerCase())) {
      return { success: false, message: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট রয়েছে।' };
    }

    try {
      const newUser = this.createUser({
        institution_id: teacher.institution_id,
        name: params.name,
        email: params.email.trim().toLowerCase(),
        mobile: params.mobile,
        password_hash: hashPasswordSync(params.password),
        role_id: params.role_id,
        status: 'active',
      });

      this.connectTeacherUserAccount(teacherId, newUser.id, actor);
      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, message: err?.message || 'অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি।' };
    }
  }

  // ==========================================
  // STEP 4: ATTENDANCE & LEAVE MANAGEMENT API
  // ==========================================

  public getAttendanceRecords(
    institutionId: string,
    options: AttendanceFilterOptions
  ): { records: DbAttendanceRecord[]; total: number } {
    let list = this.getItem<DbAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
    list = list.filter((r) => r.institution_id === institutionId);

    if (options.target_type) {
      list = list.filter((r) => r.target_type === options.target_type);
    }
    if (options.date) {
      list = list.filter((r) => r.date === options.date);
    }
    if (options.department_id && options.department_id !== 'all') {
      list = list.filter((r) => r.department_id === options.department_id);
    }
    if (options.class_id && options.class_id !== 'all') {
      list = list.filter((r) => r.class_id === options.class_id);
    }
    if (options.section_id && options.section_id !== 'all') {
      list = list.filter((r) => r.section_id === options.section_id);
    }
    if (options.status && options.status !== 'all') {
      list = list.filter((r) => r.status === options.status);
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.target_name_bn.toLowerCase().includes(q) ||
          r.target_name_en.toLowerCase().includes(q) ||
          r.target_code.toLowerCase().includes(q) ||
          (r.remarks && r.remarks.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => a.target_code.localeCompare(b.target_code, undefined, { numeric: true }));

    return { records: list, total: list.length };
  }

  public getAttendanceStats(
    institutionId: string,
    targetType: AttendanceTargetType,
    date: string,
    classId?: string,
    departmentId?: string
  ): AttendanceStats {
    let totalTargets = 0;
    if (targetType === 'student') {
      const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS).filter(
        (s) => s.institution_id === institutionId && !s.deleted_at && s.status !== 'inactive'
      );
      totalTargets = students.filter((s) => {
        if (classId && classId !== 'all' && s.class_id !== classId) return false;
        if (departmentId && departmentId !== 'all' && s.department_id !== departmentId) return false;
        return true;
      }).length;
    } else {
      const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS).filter(
        (t) => t.institution_id === institutionId && !t.deleted_at && t.employment_status === 'active'
      );
      totalTargets = teachers.filter((t) => {
        if (departmentId && departmentId !== 'all' && t.department_id !== departmentId) return false;
        return true;
      }).length;
    }

    const { records } = this.getAttendanceRecords(institutionId, {
      target_type: targetType,
      date,
      class_id: classId,
      department_id: departmentId,
    });

    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const leave = records.filter((r) => r.status === 'leave').length;
    const markedAbsent = records.filter((r) => r.status === 'absent').length;

    // Any target not explicitly marked present/late/leave/absent can be considered unmarked or absent
    const totalRecorded = records.length;
    const unrecorded = Math.max(0, totalTargets - totalRecorded);
    const absent = markedAbsent + unrecorded;

    const baseTotal = totalTargets > 0 ? totalTargets : totalRecorded;
    const attendancePercentage =
      baseTotal > 0 ? Math.round(((present + late) / baseTotal) * 1000) / 10 : 0;

    return {
      total: baseTotal,
      present,
      absent,
      late,
      leave,
      attendance_percentage: attendancePercentage,
    };
  }

  public saveBatchAttendance(
    institutionId: string,
    records: Array<{
      target_type: AttendanceTargetType;
      target_id: string;
      target_name_bn?: string;
      target_name_en?: string;
      target_code?: string;
      date: string;
      status: AttendanceStatus;
      check_in_time?: string;
      check_out_time?: string;
      department_id?: string;
      class_id?: string;
      section_id?: string;
      remarks?: string;
    }>,
    recordedBy: string
  ): { success: boolean; count: number } {
    const list = this.getItem<DbAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
    const nowIso = new Date().toISOString();

    for (const item of records) {
      const idx = list.findIndex(
        (r) =>
          r.institution_id === institutionId &&
          r.target_type === item.target_type &&
          r.target_id === item.target_id &&
          r.date === item.date
      );

      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: item.status,
          check_in_time: item.check_in_time || list[idx].check_in_time,
          check_out_time: item.check_out_time || list[idx].check_out_time,
          remarks: item.remarks !== undefined ? item.remarks : list[idx].remarks,
          updated_at: nowIso,
          recorded_by: recordedBy,
        };
      } else {
        const newRecord: DbAttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          institution_id: institutionId,
          target_type: item.target_type,
          target_id: item.target_id,
          target_name_bn: item.target_name_bn || '',
          target_name_en: item.target_name_en || '',
          target_code: item.target_code || '',
          date: item.date,
          status: item.status,
          check_in_time: item.check_in_time || (item.status === 'present' ? '08:00' : ''),
          check_out_time: item.check_out_time || '',
          department_id: item.department_id,
          class_id: item.class_id,
          section_id: item.section_id,
          session: '2026',
          remarks: item.remarks || '',
          recorded_by: recordedBy,
          created_at: nowIso,
          updated_at: nowIso,
        };
        list.push(newRecord);
      }
    }

    this.setItem(STORAGE_KEYS.ATTENDANCE, list);

    this.addActivityLog({
      user_id: recordedBy,
      user_name: 'হাজিরা নিয়ন্ত্রক',
      institution_id: institutionId,
      action: 'ATTENDANCE_RECORDED',
      description: `${records.length} জন এর হাজিরা সফলভাবে সংরক্ষিত হয়েছে (${records[0]?.date || ''})`,
      status: 'success',
    });

    return { success: true, count: records.length };
  }

  public updateSingleAttendance(
    institutionId: string,
    recordId: string,
    updates: Partial<DbAttendanceRecord>,
    actor: { id: string; name: string }
  ): DbAttendanceRecord {
    const list = this.getItem<DbAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE);
    const idx = list.findIndex((r) => r.id === recordId && r.institution_id === institutionId);
    if (idx === -1) {
      throw new Error('হাজিরা রেকর্ড পাওয়া যায়নি।');
    }

    const updated = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    this.setItem(STORAGE_KEYS.ATTENDANCE, list);

    this.addActivityLog({
      user_id: actor.id,
      user_name: actor.name,
      institution_id: institutionId,
      action: 'ATTENDANCE_UPDATED',
      description: `${updated.target_name_bn} এর হাজিরা স্ট্যাটাস (${updated.status}) আপডেট করা হয়েছে।`,
      status: 'success',
    });

    return updated;
  }

  public recordQrAttendance(
    institutionId: string,
    targetType: AttendanceTargetType,
    targetIdOrCode: string,
    recordedBy: string
  ): { success: boolean; message: string; record?: DbAttendanceRecord; targetName?: string } {
    const trimmed = targetIdOrCode.trim();
    if (!trimmed) {
      return { success: false, message: 'আইডি বা কোড প্রবেশ করান।' };
    }

    let targetId = '';
    let targetNameBn = '';
    let targetNameEn = '';
    let targetCode = '';
    let deptId = '';
    let classId = '';
    let secId = '';

    if (targetType === 'student') {
      const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS).filter(
        (s) => s.institution_id === institutionId && !s.deleted_at
      );
      const student = students.find(
        (s) =>
          s.id === trimmed ||
          s.student_id.toLowerCase() === trimmed.toLowerCase() ||
          s.roll_number.toLowerCase() === trimmed.toLowerCase()
      );
      if (!student) {
        return { success: false, message: 'প্রদত্ত আইডি বা রোলের কোনো শিক্ষার্থী পাওয়া যায়নি।' };
      }
      targetId = student.id;
      targetNameBn = student.full_name_bn;
      targetNameEn = student.full_name_en;
      targetCode = student.roll_number || student.student_id;
      deptId = student.department_id;
      classId = student.class_id;
      secId = student.section_id;
    } else {
      const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS).filter(
        (t) => t.institution_id === institutionId && !t.deleted_at
      );
      const teacher = teachers.find(
        (t) =>
          t.id === trimmed ||
          t.teacher_id.toLowerCase() === trimmed.toLowerCase() ||
          t.primary_mobile === trimmed
      );
      if (!teacher) {
        return { success: false, message: 'প্রদত্ত আইডি বা নম্বরের কোনো শিক্ষক পাওয়া যায়নি।' };
      }
      targetId = teacher.id;
      targetNameBn = teacher.full_name_bn;
      targetNameEn = teacher.full_name_en;
      targetCode = teacher.teacher_id;
      deptId = teacher.department_id;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5); // HH:mm
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
    const status: AttendanceStatus = isLate ? 'late' : 'present';

    const res = this.saveBatchAttendance(
      institutionId,
      [
        {
          target_type: targetType,
          target_id: targetId,
          target_name_bn: targetNameBn,
          target_name_en: targetNameEn,
          target_code: targetCode,
          date: todayDate,
          status,
          check_in_time: timeStr,
          department_id: deptId,
          class_id: classId,
          section_id: secId,
          remarks: isLate ? 'দেরিতে আগমন (QR)' : 'সময়মত আগমন (QR)',
        },
      ],
      recordedBy
    );

    const { records } = this.getAttendanceRecords(institutionId, {
      target_type: targetType,
      date: todayDate,
    });
    const saved = records.find((r) => r.target_id === targetId && r.date === todayDate);

    return {
      success: true,
      message: `${targetNameBn} (${targetCode}) - হাজিরা গৃহীত হয়েছে (${timeStr})`,
      record: saved,
      targetName: targetNameBn,
    };
  }

  // --- Leave Applications ---
  public getLeaveApplications(
    institutionId: string,
    filter?: { status?: LeaveStatus | 'all'; targetType?: AttendanceTargetType }
  ): DbLeaveApplication[] {
    let list = this.getItem<DbLeaveApplication[]>(STORAGE_KEYS.LEAVE_APPLICATIONS, SEED_LEAVE_APPLICATIONS);
    list = list.filter((l) => l.institution_id === institutionId);

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((l) => l.status === filter.status);
    }
    if (filter?.targetType) {
      list = list.filter((l) => l.target_type === filter.targetType);
    }

    list.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
    return list;
  }

  public createLeaveApplication(
    institutionId: string,
    app: Omit<DbLeaveApplication, 'id' | 'institution_id' | 'applied_at' | 'status'>
  ): DbLeaveApplication {
    const list = this.getItem<DbLeaveApplication[]>(STORAGE_KEYS.LEAVE_APPLICATIONS, SEED_LEAVE_APPLICATIONS);
    const newApp: DbLeaveApplication = {
      ...app,
      id: `leave-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institution_id: institutionId,
      status: 'pending',
      applied_at: new Date().toISOString(),
    };

    list.unshift(newApp);
    this.setItem(STORAGE_KEYS.LEAVE_APPLICATIONS, list);

    this.addActivityLog({
      user_id: app.target_id,
      user_name: app.target_name_bn,
      institution_id: institutionId,
      action: 'LEAVE_APPLIED',
      description: `${app.target_name_bn} ${app.total_days} দিনের ছুটির আবেদন জমা দিয়েছেন (${app.start_date} থেকে ${app.end_date})।`,
      status: 'success',
    });

    return newApp;
  }

  public updateLeaveApplicationStatus(
    institutionId: string,
    id: string,
    status: LeaveStatus,
    actionBy: string,
    actionRemarks?: string
  ): DbLeaveApplication {
    const list = this.getItem<DbLeaveApplication[]>(STORAGE_KEYS.LEAVE_APPLICATIONS, SEED_LEAVE_APPLICATIONS);
    const idx = list.findIndex((l) => l.id === id && l.institution_id === institutionId);
    if (idx === -1) {
      throw new Error('ছুটির আবেদন পাওয়া যায়নি।');
    }

    const app = list[idx];
    app.status = status;
    app.action_by = actionBy;
    app.action_at = new Date().toISOString();
    if (actionRemarks) app.action_remarks = actionRemarks;

    list[idx] = app;
    this.setItem(STORAGE_KEYS.LEAVE_APPLICATIONS, list);

    // If approved, automatically update/create attendance records for those dates with status: 'leave'
    if (status === 'approved') {
      const startDate = new Date(app.start_date);
      const endDate = new Date(app.end_date);
      const datesToMark: string[] = [];

      let curr = new Date(startDate);
      while (curr <= endDate) {
        datesToMark.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }

      this.saveBatchAttendance(
        institutionId,
        datesToMark.map((d) => ({
          target_type: app.target_type,
          target_id: app.target_id,
          target_name_bn: app.target_name_bn,
          target_name_en: app.target_name_en,
          target_code: app.target_code,
          date: d,
          status: 'leave',
          remarks: `ছুটি অনুমোদিত (${app.leave_type}): ${app.reason}`,
        })),
        actionBy
      );
    }

    this.addActivityLog({
      user_id: actionBy,
      user_name: 'প্রশাসন',
      institution_id: institutionId,
      action: status === 'approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      description: `${app.target_name_bn} এর ছুটির আবেদন ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} করা হয়েছে।`,
      status: status === 'approved' ? 'success' : 'warning',
    });

    return app;
  }

  public getMonthlyAttendanceMatrix(
    institutionId: string,
    targetType: AttendanceTargetType,
    year: number,
    month: number,
    classId?: string
  ): {
    daysInMonth: number;
    targets: Array<{
      id: string;
      nameBn: string;
      nameEn: string;
      code: string;
      dailyStatus: Record<number, AttendanceStatus | null>;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      leaveCount: number;
      percentage: number;
    }>;
  } {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    let targetItems: Array<{ id: string; nameBn: string; nameEn: string; code: string }> = [];

    if (targetType === 'student') {
      const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS).filter(
        (s) => s.institution_id === institutionId && !s.deleted_at && s.status !== 'inactive'
      );
      const filtered = students.filter((s) => !classId || classId === 'all' || s.class_id === classId);
      targetItems = filtered.map((s) => ({
        id: s.id,
        nameBn: s.full_name_bn,
        nameEn: s.full_name_en,
        code: s.roll_number || s.student_id,
      }));
    } else {
      const teachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, SEED_TEACHERS).filter(
        (t) => t.institution_id === institutionId && !t.deleted_at && t.employment_status === 'active'
      );
      targetItems = teachers.map((t) => ({
        id: t.id,
        nameBn: t.full_name_bn,
        nameEn: t.full_name_en,
        code: t.teacher_id,
      }));
    }

    const allRecords = this.getItem<DbAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, SEED_ATTENDANCE).filter(
      (r) => r.institution_id === institutionId && r.target_type === targetType && r.date.startsWith(monthPrefix)
    );

    const targets = targetItems.map((target) => {
      const targetRecords = allRecords.filter((r) => r.target_id === target.id);
      const dailyStatus: Record<number, AttendanceStatus | null> = {};
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
        const rec = targetRecords.find((r) => r.date === dayStr);
        if (rec) {
          dailyStatus[day] = rec.status;
          if (rec.status === 'present') presentCount++;
          else if (rec.status === 'late') lateCount++;
          else if (rec.status === 'absent') absentCount++;
          else if (rec.status === 'leave') leaveCount++;
        } else {
          dailyStatus[day] = null;
        }
      }

      const activeRecorded = presentCount + lateCount + absentCount + leaveCount;
      const percentage =
        activeRecorded > 0 ? Math.round(((presentCount + lateCount) / activeRecorded) * 1000) / 10 : 0;

      return {
        id: target.id,
        nameBn: target.nameBn,
        nameEn: target.nameEn,
        code: target.code,
        dailyStatus,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        percentage,
      };
    });

    return { daysInMonth, targets };
  }

  // ==========================================
  // --- Step 5: Academic Management System ---
  // ==========================================

  // --- Academic Sessions ---
  public getAcademicSessions(institutionId: string): DbAcademicSession[] {
    const list = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    return list.filter((s) => s.institution_id === institutionId);
  }

  public getActiveAcademicSession(institutionId: string): DbAcademicSession | undefined {
    return this.getAcademicSessions(institutionId).find((s) => s.is_active && s.status === 'active');
  }

  public getAcademicSessionById(institutionId: string, id: string): DbAcademicSession | undefined {
    return this.getAcademicSessions(institutionId).find((s) => s.id === id);
  }

  public createAcademicSession(
    institutionId: string,
    data: {
      name: string;
      start_date: string;
      end_date: string;
      status: AcademicSessionStatus;
      is_active?: boolean;
      created_by?: string;
    },
    userId?: string
  ): DbAcademicSession {
    const list = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    const existing = list.filter((s) => s.institution_id === institutionId);

    // Validate unique name per institution
    if (existing.some((s) => s.name.trim().toLowerCase() === data.name.trim().toLowerCase())) {
      throw new Error(`এই শিক্ষাবর্ষের নাম (${data.name}) ইতোমধ্যে বিদ্যমান রয়েছে।`);
    }

    // Validate dates
    if (new Date(data.start_date) > new Date(data.end_date)) {
      throw new Error('সেশনের শুরুর তারিখ সমাপ্তির তারিখের পূর্বে হতে হবে।');
    }

    const shouldBeActive = data.status === 'active' || !!data.is_active;

    // If making active, deactivate other sessions
    const updatedList = list.map((s) => {
      if (s.institution_id === institutionId && shouldBeActive && s.is_active) {
        return { ...s, is_active: false, status: 'completed' as AcademicSessionStatus, updated_at: new Date().toISOString() };
      }
      return s;
    });

    const newSession: DbAcademicSession = {
      id: `sess-${Date.now().toString(36)}`,
      institution_id: institutionId,
      name: data.name.trim(),
      start_date: data.start_date,
      end_date: data.end_date,
      status: shouldBeActive ? 'active' : data.status,
      is_active: shouldBeActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId || data.created_by,
    };

    updatedList.push(newSession);
    this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, updatedList);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'session',
      entity_id: newSession.id,
      action: 'SESSION_CREATED',
      description: `নতুন শিক্ষাবর্ষ "${newSession.name}" তৈরি করা হয়েছে (${newSession.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'})।`,
    });

    return newSession;
  }

  public updateAcademicSession(
    institutionId: string,
    id: string,
    updates: Partial<DbAcademicSession>,
    userId?: string
  ): DbAcademicSession {
    const list = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    const index = list.findIndex((s) => s.institution_id === institutionId && s.id === id);

    if (index === -1) {
      throw new Error('সেশন পাওয়া যায়নি।');
    }

    const current = list[index];

    // Check name uniqueness if updated
    if (updates.name && updates.name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const duplicate = list.some(
        (s) => s.institution_id === institutionId && s.id !== id && s.name.trim().toLowerCase() === updates.name!.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error(`এই শিক্ষাবর্ষের নাম (${updates.name}) ইতোমধ্যে অন্য একটি সেশনে ব্যবহার হচ্ছে।`);
      }
    }

    const willBeActive = updates.status === 'active' || updates.is_active === true;

    const updatedList = list.map((s) => {
      if (s.institution_id === institutionId && s.id !== id && willBeActive && s.is_active) {
        return { ...s, is_active: false, status: 'completed' as AcademicSessionStatus, updated_at: new Date().toISOString() };
      }
      return s;
    });

    const updatedSession: DbAcademicSession = {
      ...current,
      ...updates,
      is_active: willBeActive ? true : (updates.is_active !== undefined ? updates.is_active : current.is_active),
      status: willBeActive ? 'active' : (updates.status || current.status),
      updated_at: new Date().toISOString(),
    };

    updatedList[index] = updatedSession;
    this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, updatedList);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'session',
      entity_id: id,
      action: 'SESSION_UPDATED',
      description: `শিক্ষাবর্ষ "${updatedSession.name}" তথ্য আপডেট করা হয়েছে।`,
    });

    return updatedSession;
  }

  public setActiveAcademicSession(institutionId: string, id: string, userId?: string): DbAcademicSession {
    const list = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, SEED_ACADEMIC_SESSIONS);
    const target = list.find((s) => s.institution_id === institutionId && s.id === id);

    if (!target) {
      throw new Error('সেশন পাওয়া যায়নি।');
    }

    const updatedList = list.map((s) => {
      if (s.institution_id === institutionId) {
        if (s.id === id) {
          return { ...s, is_active: true, status: 'active' as AcademicSessionStatus, updated_at: new Date().toISOString() };
        } else if (s.is_active) {
          return { ...s, is_active: false, status: 'completed' as AcademicSessionStatus, updated_at: new Date().toISOString() };
        }
      }
      return s;
    });

    this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, updatedList);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'session',
      entity_id: id,
      action: 'ACTIVE_SESSION_CHANGED',
      description: `"${target.name}" শিক্ষাবর্ষকে বর্তমানে সক্রিয় সেশন হিসেবে নির্ধারণ করা হয়েছে।`,
    });

    return updatedList.find((s) => s.id === id)!;
  }

  public archiveAcademicSession(institutionId: string, id: string, userId?: string): DbAcademicSession {
    const session = this.getAcademicSessionById(institutionId, id);
    if (!session) throw new Error('সেশন পাওয়া যায়নি।');

    if (session.is_active) {
      throw new Error('বর্তমানে সক্রিয় সেশন আর্কাইভ করা যাবে না। প্রথমে অন্য কোনো সেশনকে সক্রিয় করুন।');
    }

    return this.updateAcademicSession(institutionId, id, { status: 'archived', is_active: false }, userId);
  }

  // --- Departments (CRUD & Validation) ---
  public getDepartmentById(institutionId: string, id: string): DbAcademicDepartment | undefined {
    return this.getDepartments(institutionId).find((d) => d.id === id);
  }

  public createDepartment(
    institutionId: string,
    data: {
      name_bn: string;
      name_en: string;
      code: string;
      description?: string;
      status?: DepartmentStatus;
      created_by?: string;
    },
    userId?: string
  ): DbAcademicDepartment {
    const list = this.getItem<DbAcademicDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const existing = list.filter((d) => d.institution_id === institutionId);

    const cleanCode = data.code.trim().toUpperCase();
    if (existing.some((d) => d.code.trim().toUpperCase() === cleanCode)) {
      throw new Error(`এই বিভাগ কোড (${cleanCode}) ইতোমধ্যে ব্যবহৃত হচ্ছে। অনুগ্রহ করে ভিন্ন কোড দিন।`);
    }

    const newDept: DbAcademicDepartment = {
      id: `dept-${Date.now().toString(36)}`,
      institution_id: institutionId,
      name_bn: data.name_bn.trim(),
      name_en: data.name_en.trim(),
      code: cleanCode,
      description: data.description?.trim(),
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId || data.created_by,
    };

    list.push(newDept);
    this.setItem(STORAGE_KEYS.DEPARTMENTS, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'department',
      entity_id: newDept.id,
      action: 'DEPARTMENT_CREATED',
      description: `নতুন বিভাগ "${newDept.name_bn}" (${newDept.code}) তৈরি করা হয়েছে।`,
    });

    return newDept;
  }

  public updateDepartment(
    institutionId: string,
    id: string,
    data: Partial<DbAcademicDepartment>,
    userId?: string
  ): DbAcademicDepartment {
    const list = this.getItem<DbAcademicDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const index = list.findIndex((d) => d.institution_id === institutionId && d.id === id);

    if (index === -1) throw new Error('বিভাগ পাওয়া যায়নি।');

    const current = list[index];

    if (data.code && data.code.trim().toUpperCase() !== current.code.toUpperCase()) {
      const cleanCode = data.code.trim().toUpperCase();
      const duplicate = list.some(
        (d) => d.institution_id === institutionId && d.id !== id && d.code.trim().toUpperCase() === cleanCode
      );
      if (duplicate) {
        throw new Error(`এই বিভাগ কোড (${cleanCode}) ইতোমধ্যে অন্য বিভাগে ব্যবহৃত হচ্ছে।`);
      }
    }

    const updated: DbAcademicDepartment = {
      ...current,
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : current.code,
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    this.setItem(STORAGE_KEYS.DEPARTMENTS, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'department',
      entity_id: id,
      action: 'DEPARTMENT_UPDATED',
      description: `বিভাগ "${updated.name_bn}" এর তথ্য আপডেট করা হয়েছে।`,
    });

    return updated;
  }

  public deleteDepartment(institutionId: string, id: string, userId?: string): void {
    const dept = this.getDepartmentById(institutionId, id);
    if (!dept) throw new Error('বিভাগ পাওয়া যায়নি।');

    // Strict Rule: Check if classes exist in this department
    const classes = this.getClasses(institutionId, id);
    if (classes.length > 0) {
      throw new Error(`এই বিভাগে ${classes.length}টি জামাত/শ্রেণি সংযুক্ত রয়েছে। সরাসরি মুছে ফেলা সম্ভব নয়। প্রথমে সংশ্লিষ্ট শ্রেণিগুলো অপসরণ বা পরিবর্তন করুন।`);
    }

    // Strict Rule: Check if students exist in this department
    const students = this.getAllStudentsList(institutionId).filter((s) => s.department_id === id && !s.deleted_at);
    if (students.length > 0) {
      throw new Error(`এই বিভাগে ${students.length} জন শিক্ষার্থী অধ্যয়নরত রয়েছে। সরাসরি মুছে ফেলা সম্ভব নয়।`);
    }

    const list = this.getItem<DbAcademicDepartment[]>(STORAGE_KEYS.DEPARTMENTS, SEED_DEPARTMENTS);
    const filtered = list.filter((d) => !(d.institution_id === institutionId && d.id === id));
    this.setItem(STORAGE_KEYS.DEPARTMENTS, filtered);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'department',
      entity_id: id,
      action: 'DEPARTMENT_DELETED',
      description: `বিভাগ "${dept.name_bn}" (${dept.code}) অপসারণ করা হয়েছে।`,
    });
  }

  // --- Classes (CRUD & Validation) ---
  public getClassById(institutionId: string, id: string): DbClass | undefined {
    return this.getClasses(institutionId).find((c) => c.id === id);
  }

  public createClass(
    institutionId: string,
    data: {
      department_id: string;
      academic_session_id?: string;
      name_bn: string;
      name_en: string;
      code: string;
      class_order?: number;
      description?: string;
      status?: ClassStatus;
      created_by?: string;
    },
    userId?: string
  ): DbClass {
    const list = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const existing = list.filter((c) => c.institution_id === institutionId);

    const cleanCode = data.code.trim().toUpperCase();
    if (existing.some((c) => c.code.trim().toUpperCase() === cleanCode)) {
      throw new Error(`এই জামাত/শ্রেণি কোড (${cleanCode}) ইতোমধ্যে ব্যবহৃত হচ্ছে।`);
    }

    // Determine class order if not provided
    let order = data.class_order;
    if (order === undefined || isNaN(order)) {
      const orders = existing.map((c) => c.class_order || 0);
      order = orders.length > 0 ? Math.max(...orders) + 1 : 1;
    }

    const activeSession = this.getActiveAcademicSession(institutionId);

    const newClass: DbClass = {
      id: `cls-${Date.now().toString(36)}`,
      institution_id: institutionId,
      department_id: data.department_id,
      academic_session_id: data.academic_session_id || activeSession?.id,
      name_bn: data.name_bn.trim(),
      name_en: data.name_en.trim(),
      code: cleanCode,
      class_order: order,
      description: data.description?.trim(),
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId || data.created_by,
    };

    list.push(newClass);
    this.setItem(STORAGE_KEYS.CLASSES, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'class',
      entity_id: newClass.id,
      action: 'CLASS_CREATED',
      description: `নতুন জামাত/শ্রেণি "${newClass.name_bn}" (${newClass.code}) তৈরি করা হয়েছে।`,
    });

    return newClass;
  }

  public updateClass(
    institutionId: string,
    id: string,
    data: Partial<DbClass>,
    userId?: string
  ): DbClass {
    const list = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const index = list.findIndex((c) => c.institution_id === institutionId && c.id === id);

    if (index === -1) throw new Error('জামাত/শ্রেণি পাওয়া যায়নি।');

    const current = list[index];

    if (data.code && data.code.trim().toUpperCase() !== current.code.toUpperCase()) {
      const cleanCode = data.code.trim().toUpperCase();
      const duplicate = list.some(
        (c) => c.institution_id === institutionId && c.id !== id && c.code.trim().toUpperCase() === cleanCode
      );
      if (duplicate) {
        throw new Error(`এই শ্রেণি কোড (${cleanCode}) ইতোমধ্যে ব্যবহৃত হচ্ছে।`);
      }
    }

    const updated: DbClass = {
      ...current,
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : current.code,
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    this.setItem(STORAGE_KEYS.CLASSES, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'class',
      entity_id: id,
      action: 'CLASS_UPDATED',
      description: `জামাত/শ্রেণি "${updated.name_bn}" তথ্য আপডেট করা হয়েছে।`,
    });

    return updated;
  }

  public deleteClass(institutionId: string, id: string, userId?: string): void {
    const cls = this.getClassById(institutionId, id);
    if (!cls) throw new Error('জামাত/শ্রেণি পাওয়া যায়নি।');

    const sections = this.getSections(institutionId, id);
    if (sections.length > 0) {
      throw new Error(`এই জামাত/শ্রেণিতে ${sections.length}টি শাখা সংযুক্ত রয়েছে। সরাসরি মুছে ফেলা যাবে না। প্রথমে শাখাগুলো মুছুন বা পরিবর্তন করুন।`);
    }

    const students = this.getAllStudentsList(institutionId).filter((s) => s.class_id === id && !s.deleted_at);
    if (students.length > 0) {
      throw new Error(`এই জামাতে ${students.length} জন শিক্ষার্থী যুক্ত রয়েছে। সরাসরি মুছে ফেলা যাবে না।`);
    }

    const list = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const filtered = list.filter((c) => !(c.institution_id === institutionId && c.id === id));
    this.setItem(STORAGE_KEYS.CLASSES, filtered);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'class',
      entity_id: id,
      action: 'CLASS_DELETED',
      description: `জামাত/শ্রেণি "${cls.name_bn}" (${cls.code}) অপসারণ করা হয়েছে।`,
    });
  }

  // --- Sections (CRUD & Validation) ---
  public getSectionById(institutionId: string, id: string): DbSection | undefined {
    return this.getSections(institutionId).find((s) => s.id === id);
  }

  public createSection(
    institutionId: string,
    data: {
      class_id: string;
      department_id?: string;
      academic_session_id?: string;
      name: string;
      code: string;
      capacity?: number;
      status?: SectionStatus;
      created_by?: string;
    },
    userId?: string
  ): DbSection {
    const list = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const parentClass = this.getClassById(institutionId, data.class_id);

    if (!parentClass) throw new Error('নির্বাচিত শ্রেণি পাওয়া যায়নি।');

    const cleanCode = data.code.trim().toUpperCase();
    const existingInClass = list.filter((s) => s.institution_id === institutionId && s.class_id === data.class_id);

    if (existingInClass.some((s) => (s.code || '').trim().toUpperCase() === cleanCode)) {
      throw new Error(`এই শ্রেণিতে (${cleanCode}) কোডের শাখা ইতোমধ্যে বিদ্যমান রয়েছে।`);
    }

    const newSection: DbSection = {
      id: `sec-${Date.now().toString(36)}`,
      institution_id: institutionId,
      department_id: data.department_id || parentClass.department_id,
      class_id: data.class_id,
      academic_session_id: data.academic_session_id || parentClass.academic_session_id,
      name_bn: data.name.trim(),
      name_en: data.name.trim(),
      name: data.name.trim(),
      code: cleanCode,
      capacity: data.capacity ? Number(data.capacity) : 40,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId || data.created_by,
    };

    list.push(newSection);
    this.setItem(STORAGE_KEYS.SECTIONS, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'section',
      entity_id: newSection.id,
      action: 'SECTION_CREATED',
      description: `শ্রেণি "${parentClass.name_bn}"-এ নতুন শাখা "${newSection.name}" (${newSection.code}) তৈরি করা হয়েছে।`,
    });

    return newSection;
  }

  public updateSection(
    institutionId: string,
    id: string,
    data: Partial<DbSection>,
    userId?: string
  ): DbSection {
    const list = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const index = list.findIndex((s) => s.institution_id === institutionId && s.id === id);

    if (index === -1) throw new Error('শাখা পাওয়া যায়নি।');

    const current = list[index];

    if (data.code && data.code.trim().toUpperCase() !== (current.code || '').toUpperCase()) {
      const cleanCode = data.code.trim().toUpperCase();
      const targetClassId = data.class_id || current.class_id;
      const duplicate = list.some(
        (s) => s.institution_id === institutionId && s.id !== id && s.class_id === targetClassId && (s.code || '').toUpperCase() === cleanCode
      );
      if (duplicate) {
        throw new Error(`এই শ্রেণিতে (${cleanCode}) কোডের শাখা ইতোমধ্যে বিদ্যমান রয়েছে।`);
      }
    }

    const updated: DbSection = {
      ...current,
      ...data,
      name_bn: data.name || data.name_bn || current.name_bn,
      name_en: data.name || data.name_en || current.name_en,
      name: data.name || current.name || current.name_bn,
      code: data.code ? data.code.trim().toUpperCase() : current.code,
      capacity: data.capacity !== undefined ? Number(data.capacity) : current.capacity,
      updated_at: new Date().toISOString(),
    };

    list[index] = updated;
    this.setItem(STORAGE_KEYS.SECTIONS, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'section',
      entity_id: id,
      action: 'SECTION_UPDATED',
      description: `শাখা "${updated.name}" তথ্য আপডেট করা হয়েছে।`,
    });

    return updated;
  }

  public deleteSection(institutionId: string, id: string, userId?: string): void {
    const section = this.getSectionById(institutionId, id);
    if (!section) throw new Error('শাখা পাওয়া যায়নি।');

    const students = this.getAllStudentsList(institutionId).filter((s) => s.section_id === id && !s.deleted_at);
    if (students.length > 0) {
      throw new Error(`এই শাখায় ${students.length} জন শিক্ষার্থী সংযুক্ত রয়েছে। সরাসরি মুছে ফেলা যাবে না।`);
    }

    const list = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, SEED_SECTIONS);
    const filtered = list.filter((s) => !(s.institution_id === institutionId && s.id === id));
    this.setItem(STORAGE_KEYS.SECTIONS, filtered);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'section',
      entity_id: id,
      action: 'SECTION_DELETED',
      description: `শাখা "${section.name || section.name_bn}" (${section.code || ''}) অপসারণ করা হয়েছে।`,
    });
  }

  // --- Student Academic Assignment & History ---
  public assignStudentAcademic(
    institutionId: string,
    studentId: string,
    assignment: {
      academic_session_id: string;
      department_id: string;
      class_id: string;
      section_id?: string;
      roll_number: string;
      academic_status?: AcademicStudentStatus;
      remarks?: string;
    },
    userId?: string
  ): DbStudentAcademicHistory {
    const students = this.getItem<DbStudent[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    const studentIndex = students.findIndex((s) => s.institution_id === institutionId && s.id === studentId);

    if (studentIndex === -1) throw new Error('শিক্ষার্থী পাওয়া যায়নি।');
    const student = students[studentIndex];

    const session = this.getAcademicSessionById(institutionId, assignment.academic_session_id);
    if (!session) throw new Error('নির্বাচিত শিক্ষাবর্ষ পাওয়া যায়নি।');

    const dept = this.getDepartmentById(institutionId, assignment.department_id);
    if (!dept) throw new Error('নির্বাচিত বিভাগ পাওয়া যায়নি।');

    const cls = this.getClassById(institutionId, assignment.class_id);
    if (!cls) throw new Error('নির্বাচিত জামাত/শ্রেণি পাওয়া যায়নি।');

    if (assignment.section_id) {
      const sec = this.getSectionById(institutionId, assignment.section_id);
      if (!sec) throw new Error('নির্বাচিত শাখা পাওয়া যায়নি।');
    }

    // Roll number uniqueness validation in this class & session
    const cleanRoll = assignment.roll_number.trim();
    if (!cleanRoll) throw new Error('রোল নম্বর প্রদান করা আবশ্যক।');

    const histories = this.getItem<DbStudentAcademicHistory[]>(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, SEED_STUDENT_ACADEMIC_HISTORY);

    const duplicateHistory = histories.find(
      (h) =>
        h.institution_id === institutionId &&
        h.academic_session_id === assignment.academic_session_id &&
        h.class_id === assignment.class_id &&
        h.roll_number.trim().toLowerCase() === cleanRoll.toLowerCase() &&
        h.student_id !== studentId &&
        h.academic_status === 'active'
    );

    if (duplicateHistory) {
      throw new Error(`এই শ্রেণির নির্বাচিত সেশনে রোল ${cleanRoll} ইতোমধ্যে অন্য একজন শিক্ষার্থীর নির্ধারিত রয়েছে।`);
    }

    // Close any previous active history record for this student
    const updatedHistories = histories.map((h) => {
      if (h.institution_id === institutionId && h.student_id === studentId && h.academic_status === 'active') {
        return {
          ...h,
          academic_status: 'promoted' as AcademicStudentStatus,
          end_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        };
      }
      return h;
    });

    const newHistory: DbStudentAcademicHistory = {
      id: `sah-${Date.now().toString(36)}`,
      institution_id: institutionId,
      student_id: studentId,
      academic_session_id: assignment.academic_session_id,
      department_id: assignment.department_id,
      class_id: assignment.class_id,
      section_id: assignment.section_id || undefined,
      roll_number: cleanRoll,
      academic_status: assignment.academic_status || 'active',
      start_date: new Date().toISOString().split('T')[0],
      remarks: assignment.remarks?.trim(),
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    updatedHistories.unshift(newHistory);
    this.setItem(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, updatedHistories);

    // Update the student profile to sync with latest assignment
    students[studentIndex] = {
      ...student,
      department_id: assignment.department_id,
      class_id: assignment.class_id,
      section_id: assignment.section_id || undefined,
      roll_number: cleanRoll,
      academic_session: session.name,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.STUDENTS, students);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'student_assignment',
      entity_id: studentId,
      action: 'STUDENT_ACADEMIC_ASSIGNED',
      description: `শিক্ষার্থী "${student.full_name_bn}" কে ${session.name} সেশনে ${dept.name_bn} > ${cls.name_bn} তে রোল ${cleanRoll} নির্ধারণ করা হয়েছে।`,
    });

    return newHistory;
  }

  public getStudentAcademicHistory(institutionId: string, studentId: string): DbStudentAcademicHistory[] {
    const histories = this.getItem<DbStudentAcademicHistory[]>(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, SEED_STUDENT_ACADEMIC_HISTORY);
    const sessions = this.getAcademicSessions(institutionId);
    const departments = this.getDepartments(institutionId);
    const classes = this.getClasses(institutionId);
    const sections = this.getSections(institutionId);
    const student = this.getStudentById(studentId);

    const filtered = histories.filter((h) => h.institution_id === institutionId && h.student_id === studentId);

    return filtered.map((h) => {
      const sess = sessions.find((s) => s.id === h.academic_session_id);
      const dept = departments.find((d) => d.id === h.department_id);
      const cls = classes.find((c) => c.id === h.class_id);
      const sec = sections.find((s) => s.id === h.section_id);

      return {
        ...h,
        student_name_bn: student?.full_name_bn || '',
        student_name_en: student?.full_name_en || '',
        session_name: sess?.name || '',
        department_name_bn: dept?.name_bn || '',
        class_name_bn: cls?.name_bn || '',
        section_name: sec?.name || sec?.name_bn || '',
      };
    });
  }

  public getAllAcademicHistory(institutionId: string): DbStudentAcademicHistory[] {
    const histories = this.getItem<DbStudentAcademicHistory[]>(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY, SEED_STUDENT_ACADEMIC_HISTORY);
    const sessions = this.getAcademicSessions(institutionId);
    const departments = this.getDepartments(institutionId);
    const classes = this.getClasses(institutionId);
    const sections = this.getSections(institutionId);
    const students = this.getAllStudentsList(institutionId);

    const filtered = histories.filter((h) => h.institution_id === institutionId);

    return filtered.map((h) => {
      const student = students.find((s) => s.id === h.student_id);
      const sess = sessions.find((s) => s.id === h.academic_session_id);
      const dept = departments.find((d) => d.id === h.department_id);
      const cls = classes.find((c) => c.id === h.class_id);
      const sec = sections.find((s) => s.id === h.section_id);

      return {
        ...h,
        student_name_bn: student?.full_name_bn || '',
        student_name_en: student?.full_name_en || '',
        session_name: sess?.name || '',
        department_name_bn: dept?.name_bn || '',
        class_name_bn: cls?.name_bn || '',
        section_name: sec?.name || sec?.name_bn || '',
      };
    });
  }

  // --- Academic Activities ---
  public getAcademicActivities(institutionId: string, limit: number = 50): DbAcademicActivity[] {
    const list = this.getItem<DbAcademicActivity[]>(STORAGE_KEYS.ACADEMIC_ACTIVITIES, []);
    const filtered = list.filter((a) => a.institution_id === institutionId);
    return filtered.slice(0, limit);
  }

  public addAcademicActivity(activity: Omit<DbAcademicActivity, 'id' | 'created_at'>): DbAcademicActivity {
    const list = this.getItem<DbAcademicActivity[]>(STORAGE_KEYS.ACADEMIC_ACTIVITIES, []);
    const newAct: DbAcademicActivity = {
      ...activity,
      id: `act-acd-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };

    list.unshift(newAct);
    const trimmed = list.slice(0, 300);
    this.setItem(STORAGE_KEYS.ACADEMIC_ACTIVITIES, trimmed);
    return newAct;
  }

  // --- Academic Settings ---
  public getAcademicSettings(institutionId: string): DbAcademicSettings {
    const list = this.getItem<DbAcademicSettings[]>(STORAGE_KEYS.ACADEMIC_SETTINGS, SEED_ACADEMIC_SETTINGS);
    const found = list.find((s) => s.institution_id === institutionId);

    if (found) return found;

    const activeSession = this.getActiveAcademicSession(institutionId);
    const defaultSettings: DbAcademicSettings = {
      id: `set-acd-${institutionId}`,
      institution_id: institutionId,
      default_session_id: activeSession?.id,
      roll_generation_mode: 'manual',
      allow_duplicate_rolls_across_sections: false,
      auto_session_rollover: false,
      updated_at: new Date().toISOString(),
    };

    list.push(defaultSettings);
    this.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, list);
    return defaultSettings;
  }

  public updateAcademicSettings(
    institutionId: string,
    data: Partial<DbAcademicSettings>,
    userId?: string
  ): DbAcademicSettings {
    const list = this.getItem<DbAcademicSettings[]>(STORAGE_KEYS.ACADEMIC_SETTINGS, SEED_ACADEMIC_SETTINGS);
    const index = list.findIndex((s) => s.institution_id === institutionId);

    const current = index !== -1 ? list[index] : this.getAcademicSettings(institutionId);
    const updated: DbAcademicSettings = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (index !== -1) {
      list[index] = updated;
    } else {
      list.push(updated);
    }

    this.setItem(STORAGE_KEYS.ACADEMIC_SETTINGS, list);

    this.addAcademicActivity({
      institution_id: institutionId,
      user_id: userId,
      entity_type: 'settings',
      entity_id: updated.id,
      action: 'SETTINGS_UPDATED',
      description: 'একাডেমিক সেটিংস ও নীতিমালা আপডেট করা হয়েছে।',
    });

    return updated;
  }

  // --- Academic Overview Stats ---
  public getAcademicStats(institutionId: string): AcademicStats {
    const activeSession = this.getActiveAcademicSession(institutionId);
    const departments = this.getDepartments(institutionId);
    const classes = this.getClasses(institutionId);
    const sections = this.getSections(institutionId);
    const students = this.getAllStudentsList(institutionId).filter((s) => !s.deleted_at);

    const assignedStudents = students.filter((s) => s.department_id && s.class_id);

    return {
      activeSessionName: activeSession ? activeSession.name : 'কোনো সক্রিয় সেশন নেই',
      activeSessionId: activeSession ? activeSession.id : '',
      totalDepartments: departments.filter((d) => d.status === 'active').length,
      totalClasses: classes.filter((c) => c.status === 'active').length,
      totalSections: sections.filter((s) => s.status === 'active').length,
      totalAssignedStudents: assignedStudents.length,
    };
  }

  // --- Step 6: Professional Subject Management ---

  public getSubjects(institutionId?: string, category?: string, status?: string): DbSubject[] {
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    const allSubjectDepts = this.getItem<DbSubjectDepartment[]>(STORAGE_KEYS.SUBJECT_DEPARTMENTS, []);
    const allDepartments = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, []);
    const allClassSubjects = this.getItem<DbClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, []);
    const allTeacherAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);

    let filtered = allSubjects.filter((s) => !s.deleted_at);
    if (institutionId) {
      filtered = filtered.filter((s) => s.institution_id === institutionId);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((s) => s.category === category);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.status === status);
    }

    return filtered.map((s) => {
      const depts = allSubjectDepts.filter((sd) => sd.subject_id === s.id && (!institutionId || sd.institution_id === institutionId));
      const deptIds = depts.map((d) => d.department_id);
      const deptNames = deptIds.map((id) => allDepartments.find((d) => d.id === id)?.name_bn || id);
      const assignedClasses = allClassSubjects.filter((cs) => cs.subject_id === s.id && cs.status === 'active');
      const assignedTeachers = allTeacherAssignments.filter((ta) => ta.subject_id === s.id && ta.status === 'active' && !ta.deleted_at);

      // unique teacher ids
      const uniqueTeacherIds = new Set(assignedTeachers.map((ta) => ta.teacher_id));

      return {
        ...s,
        department_ids: deptIds,
        department_names: deptNames,
        total_classes: assignedClasses.length,
        total_teachers: uniqueTeacherIds.size,
      };
    });
  }

  public getSubjectById(institutionId: string, id: string): DbSubject | undefined {
    const subjects = this.getSubjects(institutionId);
    return subjects.find((s) => s.id === id);
  }

  public createSubject(
    institutionId: string,
    data: {
      name_bn: string;
      name_en: string;
      code: string;
      category: SubjectCategory;
      description?: string;
      status?: SubjectStatus;
      department_ids?: string[];
    },
    userId?: string
  ): DbSubject {
    if (!data.name_bn?.trim() || !data.code?.trim()) {
      throw new Error('অনুগ্রহ করে বিষয়ের নাম এবং কোড পূরণ করুন। (Please fill in the subject name and code.)');
    }

    const cleanCode = data.code.trim().toUpperCase();
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);

    // Unique Subject Code per Institution
    const codeConflict = allSubjects.find(
      (s) =>
        s.institution_id === institutionId &&
        !s.deleted_at &&
        s.code.trim().toUpperCase() === cleanCode
    );

    if (codeConflict) {
      throw new Error('এই বিষয় কোড ইতোমধ্যে ব্যবহৃত হয়েছে। (This subject code is already in use.)');
    }

    const now = new Date().toISOString();
    const newSubject: DbSubject = {
      id: `sbj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      name_bn: data.name_bn.trim(),
      name_en: data.name_en?.trim() || data.name_bn.trim(),
      code: cleanCode,
      category: data.category || 'general',
      description: data.description?.trim() || '',
      status: data.status || 'active',
      created_at: now,
      updated_at: now,
      created_by: userId,
    };

    allSubjects.push(newSubject);
    this.setItem(STORAGE_KEYS.SUBJECTS, allSubjects);

    // Save departments
    if (data.department_ids && data.department_ids.length > 0) {
      const allSubjectDepts = this.getItem<DbSubjectDepartment[]>(STORAGE_KEYS.SUBJECT_DEPARTMENTS, []);
      data.department_ids.forEach((deptId) => {
        allSubjectDepts.push({
          id: `sd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          institution_id: institutionId,
          subject_id: newSubject.id,
          department_id: deptId,
          created_at: now,
        });
      });
      this.setItem(STORAGE_KEYS.SUBJECT_DEPARTMENTS, allSubjectDepts);
    }

    // Log Activity
    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: newSubject.id,
      action: 'SUBJECT_CREATED',
      description: `নতুন বিষয় "${newSubject.name_bn}" (${newSubject.code}) যোগ করা হয়েছে।`,
    });

    return this.getSubjectById(institutionId, newSubject.id)!;
  }

  public updateSubject(
    institutionId: string,
    id: string,
    data: Partial<DbSubject> & { department_ids?: string[] },
    userId?: string
  ): DbSubject {
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    const index = allSubjects.findIndex((s) => s.id === id && s.institution_id === institutionId);
    if (index === -1) {
      throw new Error('বিষয় খুঁজে পাওয়া যায়নি। (Subject not found.)');
    }

    if (data.code) {
      const cleanCode = data.code.trim().toUpperCase();
      const codeConflict = allSubjects.find(
        (s) =>
          s.id !== id &&
          s.institution_id === institutionId &&
          !s.deleted_at &&
          s.code.trim().toUpperCase() === cleanCode
      );
      if (codeConflict) {
        throw new Error('এই বিষয় কোড ইতোমধ্যে ব্যবহৃত হয়েছে। (This subject code is already in use.)');
      }
      data.code = cleanCode;
    }

    const now = new Date().toISOString();
    const updatedSubject: DbSubject = {
      ...allSubjects[index],
      ...data,
      updated_at: now,
    };

    allSubjects[index] = updatedSubject;
    this.setItem(STORAGE_KEYS.SUBJECTS, allSubjects);

    // Update departments if provided
    if (data.department_ids) {
      let allSubjectDepts = this.getItem<DbSubjectDepartment[]>(STORAGE_KEYS.SUBJECT_DEPARTMENTS, []);
      // remove old ones for this subject
      allSubjectDepts = allSubjectDepts.filter((sd) => sd.subject_id !== id);
      data.department_ids.forEach((deptId) => {
        allSubjectDepts.push({
          id: `sd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          institution_id: institutionId,
          subject_id: id,
          department_id: deptId,
          created_at: now,
        });
      });
      this.setItem(STORAGE_KEYS.SUBJECT_DEPARTMENTS, allSubjectDepts);
    }

    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: id,
      action: 'SUBJECT_UPDATED',
      description: `বিষয় "${updatedSubject.name_bn}" এর তথ্য আপডেট করা হয়েছে।`,
    });

    return this.getSubjectById(institutionId, id)!;
  }

  public deleteSubject(institutionId: string, id: string, userId?: string): void {
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    const subject = allSubjects.find((s) => s.id === id && s.institution_id === institutionId);
    if (!subject) {
      throw new Error('বিষয় খুঁজে পাওয়া যায়নি। (Subject not found.)');
    }

    // Check if class assignment or teacher assignment exists
    const allClassSubjects = this.getItem<DbClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, []);
    const allTeacherAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);

    const hasClassAssignments = allClassSubjects.some(
      (cs) => cs.subject_id === id && cs.institution_id === institutionId && cs.status === 'active'
    );
    const hasTeacherAssignments = allTeacherAssignments.some(
      (ta) => ta.subject_id === id && ta.institution_id === institutionId && !ta.deleted_at && ta.status === 'active'
    );

    const now = new Date().toISOString();

    if (hasClassAssignments || hasTeacherAssignments) {
      // Safe Archive (Soft delete / archive mode)
      subject.status = 'archived';
      subject.deleted_at = now;
      subject.updated_at = now;
      this.setItem(STORAGE_KEYS.SUBJECTS, allSubjects);

      this.addSubjectActivity({
        institution_id: institutionId,
        user_id: userId,
        subject_id: id,
        action: 'SUBJECT_ARCHIVED',
        description: `বিষয়ের সাথে ক্লাস/শিক্ষক যুক্ত থাকায় এটিকে মুছে ফেলার পরিবর্তে নিরাপদে আর্কাইভ (Safe Archive) করা হয়েছে।`,
      });
      return;
    }

    // Soft delete
    subject.deleted_at = now;
    subject.status = 'inactive';
    subject.updated_at = now;
    this.setItem(STORAGE_KEYS.SUBJECTS, allSubjects);

    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: id,
      action: 'SUBJECT_DELETED',
      description: `বিষয় "${subject.name_bn}" সফলভাবে মুছে ফেলা হয়েছে।`,
    });
  }

  // --- Step 6: Class-wise Subject Assignment ---

  public getClassSubjects(
    institutionId?: string,
    filter?: {
      class_id?: string;
      academic_session_id?: string;
      department_id?: string;
      subject_id?: string;
      section_id?: string;
    }
  ): DbClassSubject[] {
    const allClassSubjects = this.getItem<DbClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, []);
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    const allDepartments = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, []);
    const allClasses = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, []);
    const allSections = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, []);
    const allSessions = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, []);
    const allTeacherAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const allTeachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, []);

    let filtered = allClassSubjects;
    if (institutionId) {
      filtered = filtered.filter((cs) => cs.institution_id === institutionId);
    }
    if (filter?.class_id && filter.class_id !== 'all') {
      filtered = filtered.filter((cs) => cs.class_id === filter.class_id);
    }
    if (filter?.academic_session_id && filter.academic_session_id !== 'all') {
      filtered = filtered.filter((cs) => cs.academic_session_id === filter.academic_session_id);
    }
    if (filter?.department_id && filter.department_id !== 'all') {
      filtered = filtered.filter((cs) => cs.department_id === filter.department_id);
    }
    if (filter?.subject_id && filter.subject_id !== 'all') {
      filtered = filtered.filter((cs) => cs.subject_id === filter.subject_id);
    }
    if (filter?.section_id && filter.section_id !== 'all') {
      filtered = filtered.filter((cs) => !cs.section_id || cs.section_id === filter.section_id);
    }

    return filtered.map((cs) => {
      const subject = allSubjects.find((s) => s.id === cs.subject_id);
      const dept = allDepartments.find((d) => d.id === cs.department_id);
      const cls = allClasses.find((c) => c.id === cs.class_id);
      const sec = cs.section_id ? allSections.find((s) => s.id === cs.section_id) : undefined;
      const sess = allSessions.find((s) => s.id === cs.academic_session_id);

      // Find assigned teachers for this class subject
      const assigned = allTeacherAssignments.filter(
        (ta) =>
          ta.academic_session_id === cs.academic_session_id &&
          ta.class_id === cs.class_id &&
          ta.subject_id === cs.subject_id &&
          (!cs.section_id || !ta.section_id || ta.section_id === cs.section_id) &&
          ta.status === 'active' &&
          !ta.deleted_at
      );

      const primaryTeacherAssignment = assigned.find((ta) => ta.assignment_type === 'primary');
      const primaryTeacher = primaryTeacherAssignment
        ? allTeachers.find((t) => t.id === primaryTeacherAssignment.teacher_id)
        : undefined;

      return {
        ...cs,
        subject_name_bn: subject?.name_bn || 'অজানা বিষয়',
        subject_name_en: subject?.name_en || '',
        subject_code: subject?.code || '',
        subject_category: subject?.category || 'general',
        department_name_bn: dept?.name_bn || '',
        class_name_bn: cls?.name_bn || '',
        section_name: sec?.name_bn || 'সকল শাখা (Whole Class)',
        session_name: sess?.name || '',
        assigned_teachers_count: assigned.length,
        primary_teacher_name: primaryTeacher?.full_name_bn || 'নির্ধারিত নেই',
      };
    });
  }

  public assignSubjectToClass(
    institutionId: string,
    data: {
      academic_session_id: string;
      department_id: string;
      class_id: string;
      section_id?: string | null;
      subject_id: string;
      status?: ClassSubjectStatus;
    },
    userId?: string
  ): DbClassSubject {
    if (!data.academic_session_id || !data.department_id || !data.class_id || !data.subject_id) {
      throw new Error('অনুগ্রহ করে সেশন, বিভাগ, শ্রেণি এবং বিষয় নির্বাচন করুন।');
    }

    const allClassSubjects = this.getItem<DbClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, []);

    // Duplicate Check: Same Session + Class + Section + Subject
    const normalizedSection = data.section_id || null;
    const isDuplicate = allClassSubjects.some(
      (cs) =>
        cs.institution_id === institutionId &&
        cs.academic_session_id === data.academic_session_id &&
        cs.class_id === data.class_id &&
        (cs.section_id || null) === normalizedSection &&
        cs.subject_id === data.subject_id &&
        cs.status === 'active'
    );

    if (isDuplicate) {
      throw new Error('এই বিষয়টি ইতোমধ্যে নির্বাচিত শ্রেণি/শাখায় যুক্ত রয়েছে।');
    }

    const now = new Date().toISOString();
    const newClassSubject: DbClassSubject = {
      id: `cs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      academic_session_id: data.academic_session_id,
      department_id: data.department_id,
      class_id: data.class_id,
      section_id: normalizedSection,
      subject_id: data.subject_id,
      status: data.status || 'active',
      created_at: now,
      updated_at: now,
      created_by: userId,
    };

    allClassSubjects.push(newClassSubject);
    this.setItem(STORAGE_KEYS.CLASS_SUBJECTS, allClassSubjects);

    // Activity Log
    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: data.subject_id,
      action: 'CLASS_ASSIGNED',
      description: `বিষয়টি শ্রেণিতে অন্তর্ভুক্ত করা হয়েছে।`,
    });

    return newClassSubject;
  }

  public removeClassSubject(institutionId: string, id: string, userId?: string): void {
    const allClassSubjects = this.getItem<DbClassSubject[]>(STORAGE_KEYS.CLASS_SUBJECTS, []);
    const cs = allClassSubjects.find((item) => item.id === id && item.institution_id === institutionId);
    if (!cs) {
      throw new Error('ক্লাস-বিষয় সংযুক্তি পাওয়া যায়নি।');
    }

    // Check if teachers are currently assigned
    const allTeacherAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const hasTeachers = allTeacherAssignments.some(
      (ta) =>
        ta.academic_session_id === cs.academic_session_id &&
        ta.class_id === cs.class_id &&
        ta.subject_id === cs.subject_id &&
        (!cs.section_id || !ta.section_id || ta.section_id === cs.section_id) &&
        ta.status === 'active' &&
        !ta.deleted_at
    );

    if (hasTeachers) {
      throw new Error('এই বিষয়ের সাথে শিক্ষক নিয়োগ রয়েছে। প্রথমে শিক্ষকের দায়িত্ব পরিবর্তন বা অব্যাহতি দিন।');
    }

    const filtered = allClassSubjects.filter((item) => item.id !== id);
    this.setItem(STORAGE_KEYS.CLASS_SUBJECTS, filtered);

    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: cs.subject_id,
      action: 'CLASS_REMOVED',
      description: `শ্রেণি থেকে বিষয়ের সংযুক্তি প্রত্যাহার করা হয়েছে।`,
    });
  }

  // --- Step 6: Teacher Subject & Class Assignment ---

  public getTeacherAssignments(
    institutionId?: string,
    filter?: {
      teacher_id?: string;
      academic_session_id?: string;
      department_id?: string;
      class_id?: string;
      section_id?: string;
      subject_id?: string;
      assignment_type?: TeacherAssignmentType;
      status?: TeacherAssignmentStatus;
    }
  ): DbTeacherAssignment[] {
    const allTeacherAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const allTeachers = this.getItem<DbTeacher[]>(STORAGE_KEYS.TEACHERS, []);
    const allSubjects = this.getItem<DbSubject[]>(STORAGE_KEYS.SUBJECTS, []);
    const allDepartments = this.getItem<DbDepartment[]>(STORAGE_KEYS.DEPARTMENTS, []);
    const allClasses = this.getItem<DbClass[]>(STORAGE_KEYS.CLASSES, []);
    const allSections = this.getItem<DbSection[]>(STORAGE_KEYS.SECTIONS, []);
    const allSessions = this.getItem<DbAcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, []);

    let filtered = allTeacherAssignments.filter((ta) => !ta.deleted_at);

    if (institutionId) {
      filtered = filtered.filter((ta) => ta.institution_id === institutionId);
    }
    if (filter?.teacher_id && filter.teacher_id !== 'all') {
      filtered = filtered.filter((ta) => ta.teacher_id === filter.teacher_id);
    }
    if (filter?.academic_session_id && filter.academic_session_id !== 'all') {
      filtered = filtered.filter((ta) => ta.academic_session_id === filter.academic_session_id);
    }
    if (filter?.department_id && filter.department_id !== 'all') {
      filtered = filtered.filter((ta) => ta.department_id === filter.department_id);
    }
    if (filter?.class_id && filter.class_id !== 'all') {
      filtered = filtered.filter((ta) => ta.class_id === filter.class_id);
    }
    if (filter?.section_id && filter.section_id !== 'all') {
      filtered = filtered.filter((ta) => !ta.section_id || ta.section_id === filter.section_id);
    }
    if (filter?.subject_id && filter.subject_id !== 'all') {
      filtered = filtered.filter((ta) => ta.subject_id === filter.subject_id);
    }
    if (filter?.assignment_type && (filter.assignment_type as string) !== 'all') {
      filtered = filtered.filter((ta) => ta.assignment_type === filter.assignment_type);
    }
    if (filter?.status && (filter.status as string) !== 'all') {
      filtered = filtered.filter((ta) => ta.status === filter.status);
    }

    return filtered.map((ta) => {
      const teacher = allTeachers.find((t) => t.id === ta.teacher_id);
      const subject = allSubjects.find((s) => s.id === ta.subject_id);
      const dept = allDepartments.find((d) => d.id === ta.department_id);
      const cls = allClasses.find((c) => c.id === ta.class_id);
      const sec = ta.section_id ? allSections.find((s) => s.id === ta.section_id) : undefined;
      const sess = allSessions.find((s) => s.id === ta.academic_session_id);

      return {
        ...ta,
        teacher_name_bn: teacher?.full_name_bn || 'অজানা শিক্ষক',
        teacher_name_en: teacher?.full_name_en || '',
        teacher_employee_id: teacher?.teacher_id || '',
        teacher_photo_url: teacher?.photo || '',
        subject_name_bn: subject?.name_bn || 'অজানা বিষয়',
        subject_name_en: subject?.name_en || '',
        subject_code: subject?.code || '',
        department_name_bn: dept?.name_bn || '',
        class_name_bn: cls?.name_bn || '',
        section_name: sec?.name_bn || 'সকল শাখা (Whole Class)',
        session_name: sess?.name || '',
      };
    });
  }

  public getTeacherAssignmentById(institutionId: string, id: string): DbTeacherAssignment | undefined {
    const list = this.getTeacherAssignments(institutionId);
    return list.find((item) => item.id === id);
  }

  public createTeacherAssignment(
    institutionId: string,
    data: {
      teacher_id: string;
      academic_session_id: string;
      department_id: string;
      class_id: string;
      section_id?: string | null;
      subject_id: string;
      assignment_type: TeacherAssignmentType;
      status?: TeacherAssignmentStatus;
    },
    userId?: string
  ): DbTeacherAssignment {
    if (!data.teacher_id || !data.academic_session_id || !data.class_id || !data.subject_id) {
      throw new Error('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন। (Please fill in the required information.)');
    }

    const allAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const normalizedSection = data.section_id || null;

    // Rule 1: Duplicate Teacher Assignment Block
    // (Same Teacher + Session + Class + Section + Subject cannot be assigned twice)
    const duplicateTeacher = allAssignments.find(
      (ta) =>
        ta.institution_id === institutionId &&
        !ta.deleted_at &&
        ta.status !== 'archived' &&
        ta.teacher_id === data.teacher_id &&
        ta.academic_session_id === data.academic_session_id &&
        ta.class_id === data.class_id &&
        (ta.section_id || null) === normalizedSection &&
        ta.subject_id === data.subject_id
    );

    if (duplicateTeacher) {
      throw new Error('এই শিক্ষক ইতোমধ্যে একই বিষয়ের জন্য নিয়োগপ্রাপ্ত। (This teacher is already assigned to this subject.)');
    }

    // Rule 2: ⭐ One Primary Teacher Rule
    // (A specific Session + Class + Section + Subject can have ONLY ONE Primary Teacher)
    if (data.assignment_type === 'primary') {
      const existingPrimary = allAssignments.find(
        (ta) =>
          ta.institution_id === institutionId &&
          !ta.deleted_at &&
          ta.status === 'active' &&
          ta.assignment_type === 'primary' &&
          ta.academic_session_id === data.academic_session_id &&
          ta.class_id === data.class_id &&
          (ta.section_id || null) === normalizedSection &&
          ta.subject_id === data.subject_id
      );

      if (existingPrimary) {
        throw new Error('এই বিষয়ের জন্য ইতোমধ্যে একজন প্রধান শিক্ষক নির্ধারিত আছে। (A primary teacher is already assigned to this subject.)');
      }
    }

    const now = new Date().toISOString();
    const newAssignment: DbTeacherAssignment = {
      id: `ta-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      teacher_id: data.teacher_id,
      academic_session_id: data.academic_session_id,
      department_id: data.department_id,
      class_id: data.class_id,
      section_id: normalizedSection,
      subject_id: data.subject_id,
      assignment_type: data.assignment_type || 'subject_teacher',
      status: data.status || 'active',
      created_at: now,
      updated_at: now,
      created_by: userId,
    };

    allAssignments.push(newAssignment);
    this.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, allAssignments);

    // Activity Log
    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: data.subject_id,
      action: 'TEACHER_ASSIGNED',
      description: `শিক্ষক সফলভাবে একাডেমিক দায়িত্বে নিয়োগ করা হয়েছে (${data.assignment_type === 'primary' ? 'প্রধান শিক্ষক' : 'বিষয় শিক্ষক'})।`,
    });

    return this.getTeacherAssignmentById(institutionId, newAssignment.id)!;
  }

  public updateTeacherAssignment(
    institutionId: string,
    id: string,
    updates: Partial<DbTeacherAssignment>,
    userId?: string
  ): DbTeacherAssignment {
    const allAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const index = allAssignments.findIndex((ta) => ta.id === id && ta.institution_id === institutionId);
    if (index === -1) {
      throw new Error('শিক্ষক নিয়োগের তথ্য পাওয়া যায়নি।');
    }

    const current = allAssignments[index];
    const newAssignmentType = updates.assignment_type || current.assignment_type;
    const newSession = updates.academic_session_id || current.academic_session_id;
    const newClass = updates.class_id || current.class_id;
    const newSection = updates.section_id !== undefined ? (updates.section_id || null) : (current.section_id || null);
    const newSubject = updates.subject_id || current.subject_id;
    const newTeacher = updates.teacher_id || current.teacher_id;

    // Check duplicate if teacher, class, section, subject or session changed
    if (
      newTeacher !== current.teacher_id ||
      newClass !== current.class_id ||
      newSection !== (current.section_id || null) ||
      newSubject !== current.subject_id ||
      newSession !== current.academic_session_id
    ) {
      const duplicate = allAssignments.find(
        (ta) =>
          ta.id !== id &&
          ta.institution_id === institutionId &&
          !ta.deleted_at &&
          ta.status !== 'archived' &&
          ta.teacher_id === newTeacher &&
          ta.academic_session_id === newSession &&
          ta.class_id === newClass &&
          (ta.section_id || null) === newSection &&
          ta.subject_id === newSubject
      );
      if (duplicate) {
        throw new Error('এই শিক্ষক ইতোমধ্যে একই বিষয়ের জন্য নিয়োগপ্রাপ্ত।');
      }
    }

    // ⭐ Primary teacher check
    if (newAssignmentType === 'primary' && updates.status !== 'inactive' && updates.status !== 'archived') {
      const existingPrimary = allAssignments.find(
        (ta) =>
          ta.id !== id &&
          ta.institution_id === institutionId &&
          !ta.deleted_at &&
          ta.status === 'active' &&
          ta.assignment_type === 'primary' &&
          ta.academic_session_id === newSession &&
          ta.class_id === newClass &&
          (ta.section_id || null) === newSection &&
          ta.subject_id === newSubject
      );

      if (existingPrimary) {
        throw new Error('এই বিষয়ের জন্য ইতোমধ্যে একজন প্রধান শিক্ষক নির্ধারিত আছে।');
      }
    }

    const now = new Date().toISOString();
    const updated: DbTeacherAssignment = {
      ...current,
      ...updates,
      updated_at: now,
    };

    allAssignments[index] = updated;
    this.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, allAssignments);

    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: updated.subject_id,
      action: 'TEACHER_ASSIGNMENT_UPDATED',
      description: `শিক্ষকের বিষয় ও ক্লাস নিয়োগ দায়িত্ব সংশোধন করা হয়েছে।`,
    });

    return this.getTeacherAssignmentById(institutionId, id)!;
  }

  public deleteTeacherAssignment(institutionId: string, id: string, userId?: string): void {
    const allAssignments = this.getItem<DbTeacherAssignment[]>(STORAGE_KEYS.TEACHER_ASSIGNMENTS, []);
    const assignment = allAssignments.find((ta) => ta.id === id && ta.institution_id === institutionId);
    if (!assignment) {
      throw new Error('নিয়োগের তথ্য খুঁজে পাওয়া যায়নি।');
    }

    // Soft delete to preserve academic history
    const now = new Date().toISOString();
    assignment.deleted_at = now;
    assignment.status = 'archived';
    assignment.updated_at = now;

    this.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, allAssignments);

    this.addSubjectActivity({
      institution_id: institutionId,
      user_id: userId,
      subject_id: assignment.subject_id,
      action: 'TEACHER_REMOVED',
      description: `শিক্ষকের একাডেমিক দায়িত্ব সফলভাবে সমাপ্ত বা অব্যাহতি দেওয়া হয়েছে।`,
    });
  }

  // --- Step 6: Subject Activities & Audit ---

  public getSubjectActivities(institutionId: string, subjectId?: string, limit = 50): DbSubjectActivity[] {
    const all = this.getItem<DbSubjectActivity[]>(STORAGE_KEYS.SUBJECT_ACTIVITIES, []);
    let filtered = all.filter((a) => a.institution_id === institutionId);
    if (subjectId && subjectId !== 'all') {
      filtered = filtered.filter((a) => a.subject_id === subjectId);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
  }

  public addSubjectActivity(activity: Omit<DbSubjectActivity, 'id' | 'created_at'>): DbSubjectActivity {
    const all = this.getItem<DbSubjectActivity[]>(STORAGE_KEYS.SUBJECT_ACTIVITIES, []);
    const newActivity: DbSubjectActivity = {
      ...activity,
      id: `sact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };
    all.push(newActivity);
    this.setItem(STORAGE_KEYS.SUBJECT_ACTIVITIES, all);
    return newActivity;
  }

  // --- Step 6: Statistics ---

  public getSubjectStats(institutionId: string): SubjectStats {
    const subjects = this.getSubjects(institutionId);
    const classSubjects = this.getClassSubjects(institutionId);
    const teacherAssignments = this.getTeacherAssignments(institutionId);

    const activeSubjects = subjects.filter((s) => s.status === 'active');
    const primaryTeachers = teacherAssignments.filter((ta) => ta.assignment_type === 'primary' && ta.status === 'active');

    return {
      totalSubjects: subjects.length,
      activeSubjects: activeSubjects.length,
      totalClassSubjects: classSubjects.filter((cs) => cs.status === 'active').length,
      totalTeacherAssignments: teacherAssignments.filter((ta) => ta.status === 'active').length,
      totalPrimaryTeachers: primaryTeachers.length,
    };
  }

  // ==========================================
  // --- STEP 7: CLASS ROUTINE MANAGEMENT ---
  // ==========================================

  // --- Time Slot Management ---

  public getTimeSlots(institutionId: string): DbTimeSlot[] {
    const all = this.getItem<DbTimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, []);
    return all
      .filter((ts) => ts.institution_id === institutionId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  public getTimeSlotById(id: string): DbTimeSlot | null {
    const all = this.getItem<DbTimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, []);
    return all.find((ts) => ts.id === id) || null;
  }

  public createTimeSlot(
    institutionId: string,
    data: Omit<DbTimeSlot, 'id' | 'created_at' | 'institution_id'>
  ): DbTimeSlot {
    const all = this.getItem<DbTimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, []);
    const newSlot: DbTimeSlot = {
      ...data,
      id: `ts-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      created_at: new Date().toISOString(),
    };
    all.push(newSlot);
    this.setItem(STORAGE_KEYS.TIME_SLOTS, all);
    return newSlot;
  }

  public updateTimeSlot(id: string, data: Partial<DbTimeSlot>): DbTimeSlot | null {
    const all = this.getItem<DbTimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, []);
    const idx = all.findIndex((ts) => ts.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.setItem(STORAGE_KEYS.TIME_SLOTS, all);
    return all[idx];
  }

  public deleteTimeSlot(id: string): boolean {
    const all = this.getItem<DbTimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, []);
    const filtered = all.filter((ts) => ts.id !== id);
    if (filtered.length === all.length) return false;
    this.setItem(STORAGE_KEYS.TIME_SLOTS, filtered);
    return true;
  }

  // --- Room / Location Management ---

  public getClassRooms(institutionId: string): DbClassRoom[] {
    const all = this.getItem<DbClassRoom[]>(STORAGE_KEYS.CLASS_ROOMS, []);
    return all.filter((rm) => rm.institution_id === institutionId);
  }

  public getClassRoomById(id: string): DbClassRoom | null {
    const all = this.getItem<DbClassRoom[]>(STORAGE_KEYS.CLASS_ROOMS, []);
    return all.find((rm) => rm.id === id) || null;
  }

  public createClassRoom(
    institutionId: string,
    data: Omit<DbClassRoom, 'id' | 'created_at' | 'institution_id'>
  ): DbClassRoom {
    const all = this.getItem<DbClassRoom[]>(STORAGE_KEYS.CLASS_ROOMS, []);
    const newRoom: DbClassRoom = {
      ...data,
      id: `rm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      created_at: new Date().toISOString(),
    };
    all.push(newRoom);
    this.setItem(STORAGE_KEYS.CLASS_ROOMS, all);
    return newRoom;
  }

  public updateClassRoom(id: string, data: Partial<DbClassRoom>): DbClassRoom | null {
    const all = this.getItem<DbClassRoom[]>(STORAGE_KEYS.CLASS_ROOMS, []);
    const idx = all.findIndex((rm) => rm.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.setItem(STORAGE_KEYS.CLASS_ROOMS, all);
    return all[idx];
  }

  public deleteClassRoom(id: string): boolean {
    const all = this.getItem<DbClassRoom[]>(STORAGE_KEYS.CLASS_ROOMS, []);
    const filtered = all.filter((rm) => rm.id !== id);
    if (filtered.length === all.length) return false;
    this.setItem(STORAGE_KEYS.CLASS_ROOMS, filtered);
    return true;
  }

  // --- Conflict Detection Engine ---

  /**
   * Automatically checks for timetable clashes:
   * 1. Teacher Conflict: Same teacher assigned to two different classes at the same day & time slot.
   * 2. Class/Section Conflict: Same class/section assigned to two different subjects at the same day & time slot.
   * 3. Room Conflict: Same room booked for two different classes at the same day & time slot.
   */
  public checkRoutineConflict(
    institutionId: string,
    data: {
      id?: string;
      academic_session_id: string;
      department_id: string;
      class_id: string;
      section_id?: string | null;
      day: DayOfWeek;
      time_slot_id: string;
      start_time?: string;
      end_time?: string;
      teacher_id: string;
      room_id?: string | null;
    },
    excludeRoutineId?: string
  ): RoutineConflict | null {
    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    const routines = all.filter(
      (r) =>
        r.institution_id === institutionId &&
        r.academic_session_id === data.academic_session_id &&
        r.day === data.day &&
        r.time_slot_id === data.time_slot_id &&
        r.status === 'active' &&
        !r.deleted_at &&
        r.id !== excludeRoutineId
    );

    const slot = this.getTimeSlotById(data.time_slot_id);
    const slotName = slot ? slot.name_bn : `${data.start_time || ''} - ${data.end_time || ''}`;

    // 1. Teacher conflict check
    const teacherClash = routines.find((r) => r.teacher_id === data.teacher_id);
    if (teacherClash) {
      const teacher = this.getTeacherById(data.teacher_id, institutionId);
      const clashClass = this.getClassById(institutionId, teacherClash.class_id);
      const clashSubject = this.getSubjectById(institutionId, teacherClash.subject_id);
      const teacherName = teacher ? teacher.full_name_bn : 'উক্ত শিক্ষক';
      const className = clashClass ? clashClass.name_bn : 'অন্য জামাতে';
      const subjectName = clashSubject ? clashSubject.name_bn : 'ক্লাসে';

      return {
        type: 'teacher_conflict',
        message_bn: `শিক্ষক সংঘাত (Teacher Conflict): ${teacherName} এই সময়ে (${slotName}) ইতিমধ্যে "${className}"-এর "${subjectName}" পাঠদানে নির্ধারিত আছেন!`,
        message_en: `Teacher Conflict: ${teacherName} is already assigned to ${className} during ${slotName}.`,
        conflicting_routine_id: teacherClash.id,
        details: `${className} - ${subjectName}`,
      };
    }

    // 2. Class / Section conflict check
    const classClash = routines.find((r) => {
      if (r.class_id !== data.class_id) return false;
      // If both routines have sections specified, check section equality
      if (r.section_id && data.section_id) {
        return r.section_id === data.section_id;
      }
      // If either routine applies to the entire class (section_id is null/empty), it clashes
      return true;
    });

    if (classClash) {
      const targetClass = this.getClassById(institutionId, data.class_id);
      const clashSubject = this.getSubjectById(institutionId, classClash.subject_id);
      const clashTeacher = this.getTeacherById(classClash.teacher_id, institutionId);
      const className = targetClass ? targetClass.name_bn : 'এই জামাতে';
      const subjectName = clashSubject ? clashSubject.name_bn : 'অন্য বিষয়';
      const teacherName = clashTeacher ? clashTeacher.full_name_bn : 'অন্য শিক্ষক';

      return {
        type: 'class_conflict',
        message_bn: `জামাত সংঘাত (Class Conflict): ${className}-এ এই সময়ে (${slotName}) ইতিমধ্যে "${subjectName}" বিষয় (${teacherName}) নির্ধারিত রয়েছে!`,
        message_en: `Class Conflict: ${className} already has "${subjectName}" scheduled during ${slotName}.`,
        conflicting_routine_id: classClash.id,
        details: `${subjectName} (${teacherName})`,
      };
    }

    // 3. Room conflict check
    if (data.room_id) {
      const roomClash = routines.find((r) => r.room_id === data.room_id);
      if (roomClash) {
        const room = this.getClassRoomById(data.room_id);
        const clashClass = this.getClassById(institutionId, roomClash.class_id);
        const roomName = room ? room.room_number : 'উক্ত কক্ষ';
        const className = clashClass ? clashClass.name_bn : 'অন্য জামাত';

        return {
          type: 'room_conflict',
          message_bn: `কক্ষ সংঘাত (Room Conflict): ${roomName} এই সময়ে (${slotName}) ইতিমধ্যে "${className}" জামাতের জন্য বরাদ্দ রয়েছে!`,
          message_en: `Room Conflict: ${roomName} is already occupied by ${className} during ${slotName}.`,
          conflicting_routine_id: roomClash.id,
          details: `${roomName} occupied by ${className}`,
        };
      }
    }

    return null;
  }

  // --- Routine CRUD & Query Engine ---

  public getRoutines(institutionId: string, filters?: RoutineFilterOptions): DbClassRoutine[] {
    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    let filtered = all.filter((r) => r.institution_id === institutionId && !r.deleted_at);

    if (filters) {
      if (filters.academic_session_id && filters.academic_session_id !== 'all') {
        filtered = filtered.filter((r) => r.academic_session_id === filters.academic_session_id);
      }
      if (filters.department_id && filters.department_id !== 'all') {
        filtered = filtered.filter((r) => r.department_id === filters.department_id);
      }
      if (filters.class_id && filters.class_id !== 'all') {
        filtered = filtered.filter((r) => r.class_id === filters.class_id);
      }
      if (filters.section_id && filters.section_id !== 'all') {
        filtered = filtered.filter((r) => r.section_id === filters.section_id);
      }
      if (filters.day && filters.day !== 'all') {
        filtered = filtered.filter((r) => r.day === filters.day);
      }
      if (filters.teacher_id && filters.teacher_id !== 'all') {
        filtered = filtered.filter((r) => r.teacher_id === filters.teacher_id);
      }
      if (filters.subject_id && filters.subject_id !== 'all') {
        filtered = filtered.filter((r) => r.subject_id === filters.subject_id);
      }
      if (filters.room_id && filters.room_id !== 'all') {
        filtered = filtered.filter((r) => r.room_id === filters.room_id);
      }
      if (filters.time_slot_id && filters.time_slot_id !== 'all') {
        filtered = filtered.filter((r) => r.time_slot_id === filters.time_slot_id);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }
    }

    // Hydrate presentation fields
    const sessions = this.getAcademicSessions(institutionId);
    const departments = this.getDepartments(institutionId);
    const classes = this.getClasses(institutionId);
    const sections = this.getSections(institutionId);
    const subjects = this.getSubjects(institutionId);
    const teachers = this.getAllTeachersList(institutionId);
    const rooms = this.getClassRooms(institutionId);
    const slots = this.getTimeSlots(institutionId);

    return filtered.map((r) => {
      const sess = sessions.find((s) => s.id === r.academic_session_id);
      const dept = departments.find((d) => d.id === r.department_id);
      const cls = classes.find((c) => c.id === r.class_id);
      const sec = sections.find((s) => s.id === r.section_id);
      const sbj = subjects.find((s) => s.id === r.subject_id);
      const tch = teachers.find((t) => t.id === r.teacher_id);
      const rm = rooms.find((m) => m.id === r.room_id);
      const slt = slots.find((s) => s.id === r.time_slot_id);

      return {
        ...r,
        session_name: sess ? sess.name : r.session_name,
        department_name_bn: dept ? dept.name_bn : r.department_name_bn,
        class_name_bn: cls ? cls.name_bn : r.class_name_bn,
        section_name_bn: sec ? sec.name_bn : r.section_name_bn,
        subject_name_bn: sbj ? sbj.name_bn : r.subject_name_bn,
        subject_code: sbj ? sbj.code : r.subject_code,
        teacher_name_bn: tch ? tch.full_name_bn : r.teacher_name_bn,
        teacher_phone: tch ? tch.primary_mobile : r.teacher_phone,
        room_name: rm ? rm.room_number : r.room_name,
        slot_name: slt ? slt.name_bn : r.slot_name,
        start_time: r.start_time || (slt ? slt.start_time : '08:00'),
        end_time: r.end_time || (slt ? slt.end_time : '08:45'),
      };
    });
  }

  public getRoutineById(id: string): DbClassRoutine | null {
    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    const item = all.find((r) => r.id === id && !r.deleted_at);
    if (!item) return null;
    const list = this.getRoutines(item.institution_id);
    return list.find((r) => r.id === id) || item;
  }

  public createRoutine(
    institutionId: string,
    data: Omit<DbClassRoutine, 'id' | 'created_at' | 'institution_id' | 'deleted_at'>,
    userId?: string
  ): { success: boolean; data?: DbClassRoutine; conflict?: RoutineConflict } {
    // 1. Conflict Check
    const conflict = this.checkRoutineConflict(institutionId, data);
    if (conflict) {
      return { success: false, conflict };
    }

    // 2. Fetch related details for denormalization
    const slot = this.getTimeSlotById(data.time_slot_id);
    const cls = this.getClassById(institutionId, data.class_id);
    const sbj = this.getSubjectById(institutionId, data.subject_id);
    const tch = this.getTeacherById(data.teacher_id, institutionId);
    const rm = data.room_id ? this.getClassRoomById(data.room_id) : null;
    const sec = data.section_id ? this.getSectionById(institutionId, data.section_id) : null;

    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    const newRoutine: DbClassRoutine = {
      ...data,
      id: `rtn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution_id: institutionId,
      start_time: data.start_time || (slot ? slot.start_time : '08:00'),
      end_time: data.end_time || (slot ? slot.end_time : '08:45'),
      slot_name: slot ? slot.name_bn : data.slot_name,
      class_name_bn: cls ? cls.name_bn : undefined,
      section_name_bn: sec ? sec.name_bn : undefined,
      subject_name_bn: sbj ? sbj.name_bn : undefined,
      subject_code: sbj ? sbj.code : undefined,
      teacher_name_bn: tch ? tch.full_name_bn : undefined,
      room_name: rm ? rm.room_number : undefined,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    all.push(newRoutine);
    this.setItem(STORAGE_KEYS.ROUTINES, all);

    // Add activity log
    this.addActivityLog({
      user_id: userId || 'system',
      user_name: 'সিস্টেম অ্যাডমিন',
      institution_id: institutionId,
      action: 'ROUTINE_CREATED',
      description: `নতুন ক্লাস রুটিন যুক্ত করা হয়েছে: ${cls?.name_bn || ''} - ${sbj?.name_bn || ''} (${newRoutine.day})`,
      status: 'success',
    });

    return { success: true, data: newRoutine };
  }

  public updateRoutine(
    institutionId: string,
    routineId: string,
    data: Partial<DbClassRoutine>,
    userId?: string
  ): { success: boolean; data?: DbClassRoutine; conflict?: RoutineConflict } {
    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    const existing = all.find((r) => r.id === routineId);
    if (!existing) {
      return {
        success: false,
        conflict: {
          type: 'class_conflict',
          message_bn: 'রুটিন খুঁজে পাওয়া যায়নি!',
          message_en: 'Routine not found.',
          conflicting_routine_id: routineId,
          details: 'Not found',
        },
      };
    }

    const merged = { ...existing, ...data };

    // Check conflict excluding current routine
    const conflict = this.checkRoutineConflict(institutionId, merged, routineId);
    if (conflict) {
      return { success: false, conflict };
    }

    const idx = all.findIndex((r) => r.id === routineId);
    all[idx] = {
      ...merged,
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.ROUTINES, all);

    // Add activity log
    this.addActivityLog({
      user_id: userId || 'system',
      user_name: 'সিস্টেম অ্যাডমিন',
      institution_id: institutionId,
      action: 'ROUTINE_UPDATED',
      description: `ক্লাস রুটিন হালনাগাদ করা হয়েছে: ${merged.class_name_bn || ''} - ${merged.subject_name_bn || ''}`,
      status: 'success',
    });

    return { success: true, data: all[idx] };
  }

  public deleteRoutine(institutionId: string, routineId: string, userId?: string): boolean {
    const all = this.getItem<DbClassRoutine[]>(STORAGE_KEYS.ROUTINES, []);
    const idx = all.findIndex((r) => r.id === routineId);
    if (idx === -1) return false;

    // Soft delete
    all[idx] = {
      ...all[idx],
      deleted_at: new Date().toISOString(),
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.ROUTINES, all);

    this.addActivityLog({
      user_id: userId || 'system',
      user_name: 'সিস্টেম অ্যাডমিন',
      institution_id: institutionId,
      action: 'ROUTINE_DELETED',
      description: `ক্লাস রুটিন বাতিল/মুছে ফেলা হয়েছে (আইডি: ${routineId})`,
      status: 'success',
    });

    return true;
  }

  public getTeacherSchedule(
    institutionId: string,
    teacherId: string,
    sessionId?: string,
    day?: DayOfWeek
  ): DbClassRoutine[] {
    return this.getRoutines(institutionId, {
      teacher_id: teacherId,
      academic_session_id: sessionId,
      day: day || 'all',
      status: 'active',
    });
  }

  public getClassSchedule(
    institutionId: string,
    classId: string,
    sectionId?: string,
    sessionId?: string,
    day?: DayOfWeek
  ): DbClassRoutine[] {
    return this.getRoutines(institutionId, {
      class_id: classId,
      section_id: sectionId,
      academic_session_id: sessionId,
      day: day || 'all',
      status: 'active',
    });
  }

  public getRoutineStats(institutionId: string): RoutineStats {
    const routines = this.getRoutines(institutionId, { status: 'active' });
    const slots = this.getTimeSlots(institutionId);
    const rooms = this.getClassRooms(institutionId);

    const teacherSet = new Set(routines.map((r) => r.teacher_id));
    const classSet = new Set(routines.map((r) => r.class_id));

    return {
      totalRoutines: routines.length,
      totalTimeSlots: slots.length,
      totalRooms: rooms.length,
      activeTeachersInSchedule: teacherSet.size,
      classesWithRoutineCount: classSet.size,
    };
  }

  // --- Reset to Default Seed Data ---
  public resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ROLES);
    localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.ROLE_PERMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_DOCS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.SECTIONS);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_DESIGNATIONS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_QUALIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_DOCS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.LEAVE_APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACADEMIC_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_ACADEMIC_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACADEMIC_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.ACADEMIC_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECT_DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CLASS_SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECT_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.TIME_SLOTS);
    localStorage.removeItem(STORAGE_KEYS.CLASS_ROOMS);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    this.init();
  }
}

export const madsolDb = new MadSolDatabase();

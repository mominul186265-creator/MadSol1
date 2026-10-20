import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Building2,
  BookOpen,
  Layers,
  GraduationCap,
  Settings,
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { madsolDb } from '../../lib/db';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
  DbStudentAcademicHistory,
  DbAcademicActivity,
  DbAcademicSettings,
  AcademicStats,
  AcademicSessionStatus,
  DepartmentStatus,
  ClassStatus,
  SectionStatus,
  AcademicStudentStatus,
} from '../../types/step5';
import { DbStudent } from '../../types/step2';
import { DbTeacher } from '../../types/step3';
import {
  DbSubject,
  DbClassSubject,
  DbTeacherAssignment,
  SubjectCategory,
  SubjectStatus,
  TeacherAssignmentType,
  TeacherAssignmentStatus,
  ClassSubjectStatus,
} from '../../types/step6';
import { AcademicDashboardOverview } from './AcademicDashboardOverview';
import { AcademicSessionsTab } from './AcademicSessionsTab';
import { DepartmentsTab } from './DepartmentsTab';
import { ClassesTab } from './ClassesTab';
import { SectionsTab } from './SectionsTab';
import { StudentAssignmentTab } from './StudentAssignmentTab';
import { AcademicSettingsTab } from './AcademicSettingsTab';
import { AcademicActivitiesTab } from './AcademicActivitiesTab';
import { SubjectManagementTab } from './SubjectManagementTab';
import { ClassSubjectsTab } from './ClassSubjectsTab';
import { TeacherAssignmentTab } from './TeacherAssignmentTab';
import { RoutineManagementView } from './RoutineManagementView';
import {
  SessionModal,
  DepartmentModal,
  ClassModal,
  SectionModal,
  AssignStudentModal,
} from './AcademicModals';
import {
  SubjectModal,
  AssignClassSubjectModal,
  TeacherAssignmentModal,
  SubjectDetailsModal,
} from './SubjectModals';

export const AcademicManagementView: React.FC = () => {
  const { user, institution } = useAuth();
  const instId = institution?.id || 'inst-001';
  const userId = user?.id || 'usr-001';

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Database Data States
  const [sessions, setSessions] = useState<DbAcademicSession[]>([]);
  const [departments, setDepartments] = useState<DbDepartment[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [histories, setHistories] = useState<DbStudentAcademicHistory[]>([]);
  const [activities, setActivities] = useState<DbAcademicActivity[]>([]);
  const [settings, setSettings] = useState<DbAcademicSettings>(() => madsolDb.getAcademicSettings(instId));
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [subjects, setSubjects] = useState<DbSubject[]>([]);
  const [classSubjects, setClassSubjects] = useState<DbClassSubject[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<DbTeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<DbTeacher[]>([]);
  const [routinesCount, setRoutinesCount] = useState<number>(0);
  const [stats, setStats] = useState<AcademicStats>({
    activeSessionName: '২০২৬ শিক্ষাবর্ষ',
    totalSessions: 1,
    totalDepartments: 0,
    totalClasses: 0,
    totalSections: 0,
    totalAssignedStudents: 0,
  });

  // Modals state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<DbAcademicSession | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<DbDepartment | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<DbClass | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<DbSection | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Step 6 Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<DbSubject | null>(null);
  const [isSubjectDetailsModalOpen, setIsSubjectDetailsModalOpen] = useState(false);
  const [subjectForDetails, setSubjectForDetails] = useState<DbSubject | null>(null);

  const [isAssignClassSubjectModalOpen, setIsAssignClassSubjectModalOpen] = useState(false);

  const [isTeacherAssignmentModalOpen, setIsTeacherAssignmentModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<DbTeacherAssignment | null>(null);

  // Alerts / Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reload all data
  const loadData = useCallback(() => {
    const s = madsolDb.getAcademicSessions(instId);
    const d = madsolDb.getDepartments(instId);
    const c = madsolDb.getClasses(instId);
    const sec = madsolDb.getSections(instId);
    const h = madsolDb.getAllAcademicHistory(instId);
    const act = madsolDb.getAcademicActivities(instId);
    const st = madsolDb.getAcademicSettings(instId);
    const std = madsolDb.getAllStudentsList(instId).filter((stu) => !stu.deleted_at);
    const stt = madsolDb.getAcademicStats(instId);
    const subs = madsolDb.getSubjects(instId);
    const cSubs = madsolDb.getClassSubjects(instId);
    const tAssigns = madsolDb.getTeacherAssignments(instId);
    const teachersResult = madsolDb.getTeachers(instId);
    const tList = (teachersResult?.teachers || []).filter((tch) => !tch.deleted_at);
    const routList = madsolDb.getRoutines(instId);

    setSessions(s);
    setDepartments(d);
    setClasses(c);
    setSections(sec);
    setHistories(h);
    setActivities(act);
    setSettings(st);
    setStudents(std);
    setStats(stt);
    setSubjects(subs);
    setClassSubjects(cSubs);
    setTeacherAssignments(tAssigns);
    setTeachers(tList);
    setRoutinesCount(routList.length);
  }, [instId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Session Actions
  const handleSetActiveSession = (id: string) => {
    try {
      const active = madsolDb.setActiveAcademicSession(instId, id, userId);
      loadData();
      showNotification(`"${active.name}" কে সক্রিয় শিক্ষাবর্ষ হিসেবে নির্ধারণ করা হয়েছে।`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleArchiveSession = (id: string) => {
    try {
      madsolDb.archiveAcademicSession(instId, id, userId);
      loadData();
      showNotification('শিক্ষাবর্ষ সফলভাবে আর্কাইভ করা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleSaveSession = (data: {
    name: string;
    start_date: string;
    end_date: string;
    status: AcademicSessionStatus;
    is_active?: boolean;
  }) => {
    try {
      if (sessionToEdit) {
        madsolDb.updateAcademicSession(instId, sessionToEdit.id, data, userId);
        showNotification('শিক্ষাবর্ষ তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        madsolDb.createAcademicSession(instId, data, userId);
        showNotification('নতুন শিক্ষাবর্ষ সফলভাবে যুক্ত হয়েছে।');
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Department Actions
  const handleSaveDepartment = (data: {
    name_bn: string;
    name_en: string;
    code: string;
    description?: string;
    status?: DepartmentStatus;
  }) => {
    try {
      if (deptToEdit) {
        madsolDb.updateDepartment(instId, deptToEdit.id, data, userId);
        showNotification('বিভাগ তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        madsolDb.createDepartment(instId, data, userId);
        showNotification('নতুন বিভাগ সফলভাবে তৈরি হয়েছে।');
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleDeptStatus = (dept: DbDepartment) => {
    try {
      const newStatus = dept.status === 'active' ? 'inactive' : 'active';
      madsolDb.updateDepartment(instId, dept.id, { status: newStatus }, userId);
      loadData();
      showNotification(`বিভাগের স্ট্যাটাস ${newStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteDept = (dept: DbDepartment) => {
    const confirmation = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${dept.name_bn}" বিভাগটি মুছে ফেলতে চান?`
    );
    if (!confirmation) return;

    try {
      madsolDb.deleteDepartment(instId, dept.id, userId);
      loadData();
      showNotification('বিভাগ সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Class Actions
  const handleSaveClass = (data: {
    department_id: string;
    academic_session_id?: string;
    name_bn: string;
    name_en: string;
    code: string;
    class_order?: number;
    description?: string;
    status?: ClassStatus;
  }) => {
    try {
      if (classToEdit) {
        madsolDb.updateClass(instId, classToEdit.id, data, userId);
        showNotification('জামাত / শ্রেণির তথ্য আপডেট হয়েছে।');
      } else {
        madsolDb.createClass(instId, data, userId);
        showNotification('নতুন জামাত / শ্রেণি তৈরি হয়েছে।');
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleClassStatus = (cls: DbClass) => {
    try {
      const newStatus = cls.status === 'active' ? 'inactive' : 'active';
      madsolDb.updateClass(instId, cls.id, { status: newStatus }, userId);
      loadData();
      showNotification(`জামাতের স্ট্যাটাস ${newStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteClass = (cls: DbClass) => {
    const confirmation = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${cls.name_bn}" জামাতটি মুছে ফেলতে চান?`
    );
    if (!confirmation) return;

    try {
      madsolDb.deleteClass(instId, cls.id, userId);
      loadData();
      showNotification('জামাত সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Section Actions
  const handleSaveSection = (data: {
    class_id: string;
    name: string;
    code: string;
    capacity?: number;
    status?: SectionStatus;
  }) => {
    try {
      if (sectionToEdit) {
        madsolDb.updateSection(instId, sectionToEdit.id, data, userId);
        showNotification('শাখার তথ্য আপডেট হয়েছে।');
      } else {
        madsolDb.createSection(instId, data, userId);
        showNotification('নতুন শাখা তৈরি হয়েছে।');
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleSectionStatus = (sec: DbSection) => {
    try {
      const newStatus = sec.status === 'active' ? 'inactive' : 'active';
      madsolDb.updateSection(instId, sec.id, { status: newStatus }, userId);
      loadData();
      showNotification(`শাখার স্ট্যাটাস ${newStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteSection = (sec: DbSection) => {
    const confirmation = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${sec.name || sec.name_bn}" শাখাটি মুছে ফেলতে চান?`
    );
    if (!confirmation) return;

    try {
      madsolDb.deleteSection(instId, sec.id, userId);
      loadData();
      showNotification('শাখা সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Assign Student
  const handleAssignStudent = (data: {
    student_id: string;
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string;
    roll_number: string;
    academic_status?: AcademicStudentStatus;
    remarks?: string;
  }) => {
    try {
      madsolDb.assignStudentAcademic(
        instId,
        data.student_id,
        {
          academic_session_id: data.academic_session_id,
          department_id: data.department_id,
          class_id: data.class_id,
          section_id: data.section_id,
          roll_number: data.roll_number,
          academic_status: data.academic_status,
          remarks: data.remarks,
        },
        userId
      );
      loadData();
      showNotification('শিক্ষার্থীর সেশন, জামাত ও রোল সফলভাবে নির্ধারিত হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = (data: Partial<DbAcademicSettings>) => {
    try {
      madsolDb.updateAcademicSettings(instId, data, userId);
      loadData();
      showNotification('একাডেমিক নীতিমালা ও সেটিংস সংরক্ষিত হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // STEP 6: Subject CRUD Handlers
  const handleSaveSubject = (data: {
    name_bn: string;
    name_en: string;
    code: string;
    category: SubjectCategory;
    description?: string;
    status?: SubjectStatus;
    department_ids?: string[];
  }) => {
    try {
      if (subjectToEdit) {
        madsolDb.updateSubject(instId, subjectToEdit.id, data, userId);
        showNotification(`"${data.name_bn}" বিষয় সফলভাবে আপডেট করা হয়েছে।`);
      } else {
        madsolDb.createSubject(instId, data, userId);
        showNotification(`"${data.name_bn}" বিষয় সফলভাবে যুক্ত করা হয়েছে।`);
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteSubject = (sub: DbSubject) => {
    if (confirm(`আপনি কি "${sub.name_bn}" বিষয় আর্কাইভ করতে চান? এর সাথে যুক্ত শিক্ষাবর্ষের ইতিহাস অক্ষুণ্ণ থাকবে।`)) {
      try {
        madsolDb.deleteSubject(instId, sub.id, userId);
        loadData();
        showNotification(`"${sub.name_bn}" বিষয় সফলভাবে আর্কাইভ করা হয়েছে।`);
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
  };

  // STEP 6: Class Subject Assignment Handlers
  const handleAssignClassSubject = (data: {
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    status?: ClassSubjectStatus;
  }) => {
    try {
      madsolDb.assignSubjectToClass(instId, data, userId);
      loadData();
      showNotification('শ্রেণিতে বিষয় সফলভাবে যুক্ত করা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleRemoveClassSubject = (item: DbClassSubject) => {
    if (
      confirm(
        `আপনি কি "${item.class_name_bn}" জামাত থেকে "${item.subject_name_bn}" বিষয়টি প্রত্যাহার করতে চান?`
      )
    ) {
      try {
        madsolDb.removeClassSubject(instId, item.id, userId);
        loadData();
        showNotification('শ্রেণি থেকে বিষয় প্রত্যাহার করা হয়েছে।');
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
  };

  // STEP 6: Teacher Subject Assignment Handlers (with One Primary Teacher Rule)
  const handleSaveTeacherAssignment = (data: {
    teacher_id: string;
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    assignment_type: TeacherAssignmentType;
    status?: TeacherAssignmentStatus;
  }) => {
    try {
      if (assignmentToEdit) {
        madsolDb.updateTeacherAssignment(instId, assignmentToEdit.id, data, userId);
        showNotification('শিক্ষক বিষয় নিয়োগ ও দায়িত্ব সফলভাবে আপডেট হয়েছে।');
      } else {
        madsolDb.createTeacherAssignment(instId, data, userId);
        showNotification('শিক্ষককে উক্ত বিষয়ে সফলভাবে নিয়োগ প্রদান করা হয়েছে।');
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteTeacherAssignment = (item: DbTeacherAssignment) => {
    if (
      confirm(
        `আপনি কি "${item.teacher_name_bn}"-কে "${item.subject_name_bn}" বিষয়ের দায়িত্ব থেকে অব্যাহতি দিতে চান?`
      )
    ) {
      try {
        madsolDb.deleteTeacherAssignment(instId, item.id, userId);
        loadData();
        showNotification('শিক্ষককে উক্ত বিষয়ের দায়িত্ব থেকে অব্যাহতি দেওয়া হয়েছে।');
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
  };

  const NAV_TABS = [
    { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
    { id: 'sessions', label: 'শিক্ষাবর্ষ', icon: Calendar, count: sessions.length },
    { id: 'departments', label: 'বিভাগ', icon: Building2, count: departments.length },
    { id: 'classes', label: 'জামাত / শ্রেণি', icon: BookOpen, count: classes.length },
    { id: 'sections', label: 'শাখা', icon: Layers, count: sections.length },
    { id: 'subjects', label: 'পাঠ্য বিষয়', icon: BookOpen, count: subjects.length },
    { id: 'class_subjects', label: 'জামাতে বিষয় বণ্টন', icon: Layers, count: classSubjects.length },
    {
      id: 'teacher_assignments',
      label: 'শিক্ষক বিষয় বণ্টন',
      icon: UserCheck,
      count: teacherAssignments.filter((a) => a.status === 'active' && !a.deleted_at).length,
    },
    {
      id: 'routines',
      label: 'ক্লাস ও শিক্ষক রুটিন',
      icon: Calendar,
      count: routinesCount,
    },
    { id: 'assignments', label: 'শিক্ষার্থী রোল ও অন্তর্ভুক্তি', icon: GraduationCap, count: histories.length },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
    { id: 'activities', label: 'অডিট লগ', icon: Activity, count: activities.length },
  ];

  return (
    <div className="space-y-6 pb-12 w-full max-w-full min-w-0">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 text-xs font-bold max-w-[90vw] ${
            notification.type === 'success'
              ? 'bg-emerald-900/90 text-white border-emerald-500'
              : 'bg-rose-900/90 text-white border-rose-500'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span className="truncate">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap min-w-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="break-words">একাডেমিক ব্যবস্থাপনা</span>
              <span className="text-xs sm:text-sm font-normal text-slate-500">(Academic Management)</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 sm:line-clamp-none">
            মাদরাসার শিক্ষাবর্ষ, বিভাগ, জামাত, শাখা এবং শিক্ষার্থীদের সেশনভিত্তিক রোল নম্বর পরিচালনা
          </p>
        </div>

        {/* Global Active Session Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 shrink-0 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">বর্তমান শিক্ষাবর্ষ:</span>
          <span className="font-extrabold">{stats.activeSessionName}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full min-w-0 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <AcademicDashboardOverview
          stats={stats}
          onTabChange={setActiveTab}
          onOpenNewSessionModal={() => {
            setSessionToEdit(null);
            setIsSessionModalOpen(true);
          }}
          onOpenNewDeptModal={() => {
            setDeptToEdit(null);
            setIsDeptModalOpen(true);
          }}
          onOpenNewClassModal={() => {
            setClassToEdit(null);
            setIsClassModalOpen(true);
          }}
          onOpenNewSectionModal={() => {
            setSectionToEdit(null);
            setIsSectionModalOpen(true);
          }}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          onOpenNewSubjectModal={() => {
            setSubjectToEdit(null);
            setIsSubjectModalOpen(true);
          }}
          onOpenNewTeacherAssignModal={() => {
            setAssignmentToEdit(null);
            setIsTeacherAssignmentModalOpen(true);
          }}
        />
      )}

      {activeTab === 'sessions' && (
        <AcademicSessionsTab
          sessions={sessions}
          onSetActive={handleSetActiveSession}
          onArchive={handleArchiveSession}
          onEdit={(s) => {
            setSessionToEdit(s);
            setIsSessionModalOpen(true);
          }}
          onOpenCreate={() => {
            setSessionToEdit(null);
            setIsSessionModalOpen(true);
          }}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab
          departments={departments}
          onOpenCreate={() => {
            setDeptToEdit(null);
            setIsDeptModalOpen(true);
          }}
          onEdit={(d) => {
            setDeptToEdit(d);
            setIsDeptModalOpen(true);
          }}
          onToggleStatus={handleToggleDeptStatus}
          onDelete={handleDeleteDept}
        />
      )}

      {activeTab === 'classes' && (
        <ClassesTab
          classes={classes}
          departments={departments}
          sessions={sessions}
          onOpenCreate={() => {
            setClassToEdit(null);
            setIsClassModalOpen(true);
          }}
          onEdit={(c) => {
            setClassToEdit(c);
            setIsClassModalOpen(true);
          }}
          onToggleStatus={handleToggleClassStatus}
          onDelete={handleDeleteClass}
        />
      )}

      {activeTab === 'sections' && (
        <SectionsTab
          sections={sections}
          classes={classes}
          departments={departments}
          onOpenCreate={() => {
            setSectionToEdit(null);
            setIsSectionModalOpen(true);
          }}
          onEdit={(sec) => {
            setSectionToEdit(sec);
            setIsSectionModalOpen(true);
          }}
          onToggleStatus={handleToggleSectionStatus}
          onDelete={handleDeleteSection}
        />
      )}

      {/* STEP 6: Subjects Management Tab */}
      {activeTab === 'subjects' && (
        <SubjectManagementTab
          subjects={subjects}
          departments={departments}
          onOpenCreateModal={() => {
            setSubjectToEdit(null);
            setIsSubjectModalOpen(true);
          }}
          onOpenEditModal={(sub) => {
            setSubjectToEdit(sub);
            setIsSubjectModalOpen(true);
          }}
          onDeleteSubject={handleDeleteSubject}
          onSelectSubjectDetails={(sub) => {
            setSubjectForDetails(sub);
            setIsSubjectDetailsModalOpen(true);
          }}
        />
      )}

      {/* STEP 6: Class Curriculum & Subject Assignment Tab */}
      {activeTab === 'class_subjects' && (
        <ClassSubjectsTab
          classSubjects={classSubjects}
          sessions={sessions}
          departments={departments}
          classes={classes}
          sections={sections}
          subjects={subjects}
          onOpenAssignModal={() => setIsAssignClassSubjectModalOpen(true)}
          onRemoveClassSubject={handleRemoveClassSubject}
          onQuickAssignTeacher={(cs) => {
            setAssignmentToEdit(null);
            setIsTeacherAssignmentModalOpen(true);
          }}
        />
      )}

      {/* STEP 6: Teacher Subject Assignment Tab */}
      {activeTab === 'teacher_assignments' && (
        <TeacherAssignmentTab
          assignments={teacherAssignments}
          teachers={teachers}
          sessions={sessions}
          departments={departments}
          classes={classes}
          sections={sections}
          subjects={subjects}
          onOpenAssignModal={() => {
            setAssignmentToEdit(null);
            setIsTeacherAssignmentModalOpen(true);
          }}
          onOpenEditModal={(assignment) => {
            setAssignmentToEdit(assignment);
            setIsTeacherAssignmentModalOpen(true);
          }}
          onDeleteAssignment={handleDeleteTeacherAssignment}
        />
      )}

      {/* STEP 7: Class Routine Management Tab */}
      {activeTab === 'routines' && (
        <RoutineManagementView />
      )}

      {activeTab === 'assignments' && (
        <StudentAssignmentTab
          histories={histories}
          students={students}
          sessions={sessions}
          departments={departments}
          classes={classes}
          sections={sections}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
        />
      )}

      {activeTab === 'settings' && (
        <AcademicSettingsTab
          settings={settings}
          sessions={sessions}
          onSave={handleSaveSettings}
        />
      )}

      {activeTab === 'activities' && (
        <AcademicActivitiesTab activities={activities} />
      )}

      {/* Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSessionToEdit(null);
        }}
        sessionToEdit={sessionToEdit}
        onSave={handleSaveSession}
      />

      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => {
          setIsDeptModalOpen(false);
          setDeptToEdit(null);
        }}
        deptToEdit={deptToEdit}
        onSave={handleSaveDepartment}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
        departments={departments}
        sessions={sessions}
        onSave={handleSaveClass}
      />

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        sectionToEdit={sectionToEdit}
        classes={classes}
        onSave={handleSaveSection}
      />

      <AssignStudentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        students={students}
        sessions={sessions}
        departments={departments}
        classes={classes}
        sections={sections}
        onSave={handleAssignStudent}
      />

      {/* STEP 6 Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
        onSave={handleSaveSubject}
        subjectToEdit={subjectToEdit}
        departments={departments}
      />

      <AssignClassSubjectModal
        isOpen={isAssignClassSubjectModalOpen}
        onClose={() => setIsAssignClassSubjectModalOpen(false)}
        onAssign={handleAssignClassSubject}
        sessions={sessions}
        departments={departments}
        classes={classes}
        sections={sections}
        subjects={subjects}
        activeSessionId={sessions.find((s) => s.is_active)?.id}
      />

      <TeacherAssignmentModal
        isOpen={isTeacherAssignmentModalOpen}
        onClose={() => {
          setIsTeacherAssignmentModalOpen(false);
          setAssignmentToEdit(null);
        }}
        onSave={handleSaveTeacherAssignment}
        assignmentToEdit={assignmentToEdit}
        teachers={teachers}
        sessions={sessions}
        departments={departments}
        classes={classes}
        sections={sections}
        subjects={subjects}
        classSubjects={classSubjects}
        activeSessionId={sessions.find((s) => s.is_active)?.id}
        allAssignments={teacherAssignments}
      />

      <SubjectDetailsModal
        isOpen={isSubjectDetailsModalOpen}
        onClose={() => {
          setIsSubjectDetailsModalOpen(false);
          setSubjectForDetails(null);
        }}
        subject={subjectForDetails}
        classSubjects={classSubjects}
        teacherAssignments={teacherAssignments}
        onOpenTeacherAssignModal={() => {
          setAssignmentToEdit(null);
          setIsTeacherAssignmentModalOpen(true);
        }}
      />
    </div>
  );
};

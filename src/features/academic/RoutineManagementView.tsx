import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  BookOpen,
  Printer,
  DoorOpen,
  Layers,
  Search,
  ChevronRight,
  Sparkles,
  Download,
  Info,
  CalendarCheck,
  Building2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { madsolDb } from '../../lib/db';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  DbClassRoutine,
  DbTimeSlot,
  DbClassRoom,
  RoutineConflict,
  RoutineStats,
} from '../../types/step7';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
} from '../../types/step5';
import { DbSubject, DbTeacherAssignment } from '../../types/step6';
import { DbTeacher } from '../../types/step3';
import {
  RoutineFormModal,
  TimeSlotModal,
  ClassRoomModal,
  RoutineDetailsModal,
} from './RoutineModals';

type RoutineViewMode =
  | 'weekly'
  | 'daily'
  | 'teacher'
  | 'class'
  | 'list'
  | 'slots'
  | 'rooms';

export const RoutineManagementView: React.FC = () => {
  const { user, institution, hasPermission } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const instId = institution?.id || 'inst-001';
  const userId = user?.id || 'usr-001';

  const canManage =
    hasPermission('routine.manage') ||
    user?.role_id === 'super_admin' ||
    user?.role_id === 'institution_admin' ||
    user?.role_id === 'principal';

  // --- Active Tab / Mode ---
  const [viewMode, setViewMode] = useState<RoutineViewMode>('weekly');

  // --- Data States ---
  const [sessions, setSessions] = useState<DbAcademicSession[]>([]);
  const [departments, setDepartments] = useState<DbDepartment[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [subjects, setSubjects] = useState<DbSubject[]>([]);
  const [teachers, setTeachers] = useState<DbTeacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<DbTimeSlot[]>([]);
  const [rooms, setRooms] = useState<DbClassRoom[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<DbTeacherAssignment[]>([]);
  const [routines, setRoutines] = useState<DbClassRoutine[]>([]);
  const [stats, setStats] = useState<RoutineStats>({
    totalRoutines: 0,
    totalTimeSlots: 0,
    totalRooms: 0,
    activeTeachersInSchedule: 0,
    classesWithRoutineCount: 0,
  });

  // --- Filters ---
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('saturday');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Modals State ---
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<DbClassRoutine | null>(null);

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<DbTimeSlot | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<DbClassRoom | null>(null);

  const [detailRoutine, setDetailRoutine] = useState<DbClassRoutine | null>(null);

  // Pre-fill target for slot adding
  const [prefillDay, setPrefillDay] = useState<DayOfWeek | undefined>(undefined);
  const [prefillSlotId, setPrefillSlotId] = useState<string | undefined>(undefined);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Load all Data ---
  const loadAllData = useCallback(() => {
    const s = madsolDb.getAcademicSessions(instId);
    const d = madsolDb.getDepartments(instId);
    const c = madsolDb.getClasses(instId);
    const sec = madsolDb.getSections(instId);
    const sb = madsolDb.getSubjects(instId);
    const t = madsolDb.getAllTeachersList(instId);
    const ts = madsolDb.getTimeSlots(instId);
    const rm = madsolDb.getClassRooms(instId);
    const ta = madsolDb.getTeacherAssignments(instId);
    const r = madsolDb.getRoutines(instId);
    const st = madsolDb.getRoutineStats(instId);

    setSessions(s);
    setDepartments(d);
    setClasses(c);
    setSections(sec);
    setSubjects(sb);
    setTeachers(t);
    setTimeSlots(ts);
    setRooms(rm);
    setTeacherAssignments(ta);
    setRoutines(r);
    setStats(st);

    // If default session not set, select active
    if (selectedSessionId === 'all') {
      const active = s.find((item) => item.status === 'active');
      if (active) setSelectedSessionId(active.id);
    }
  }, [instId, selectedSessionId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // If teacher logged in, default teacher filter to their own ID
  useEffect(() => {
    if (user?.role_id === 'teacher') {
      const myTeacher = teachers.find((t) => t.user_id === user.id);
      if (myTeacher) {
        setSelectedTeacherId(myTeacher.id);
      }
    }
  }, [user, teachers]);

  // --- Filtered Routines ---
  const filteredRoutines = useMemo(() => {
    return routines.filter((r) => {
      if (selectedSessionId !== 'all' && r.academic_session_id !== selectedSessionId) return false;
      if (selectedDeptId !== 'all' && r.department_id !== selectedDeptId) return false;
      if (selectedClassId !== 'all' && r.class_id !== selectedClassId) return false;
      if (selectedSectionId !== 'all' && r.section_id !== selectedSectionId) return false;
      if (selectedTeacherId !== 'all' && r.teacher_id !== selectedTeacherId) return false;
      if (selectedRoomId !== 'all' && r.room_id !== selectedRoomId) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSubject = r.subject_name_bn?.toLowerCase().includes(query) || r.subject_code?.toLowerCase().includes(query);
        const matchesTeacher = r.teacher_name_bn?.toLowerCase().includes(query);
        const matchesClass = r.class_name_bn?.toLowerCase().includes(query);
        const matchesRoom = r.room_name?.toLowerCase().includes(query);
        if (!matchesSubject && !matchesTeacher && !matchesClass && !matchesRoom) return false;
      }

      return true;
    });
  }, [
    routines,
    selectedSessionId,
    selectedDeptId,
    selectedClassId,
    selectedSectionId,
    selectedTeacherId,
    selectedRoomId,
    searchQuery,
  ]);

  // --- Save / Create Routine Handler ---
  const handleSaveRoutine = async (data: Omit<DbClassRoutine, 'id' | 'created_at' | 'institution_id' | 'deleted_at'>): Promise<boolean> => {
    try {
      if (routineToEdit) {
        const res = madsolDb.updateRoutine(instId, routineToEdit.id, data, userId);
        if (!res.success && res.conflict) {
          showNotification(res.conflict.message_bn, 'error');
          return false;
        }
        showNotification('ক্লাস রুটিন সফলভাবে আপডেট করা হয়েছে।');
      } else {
        const res = madsolDb.createRoutine(instId, data, userId);
        if (!res.success && res.conflict) {
          showNotification(res.conflict.message_bn, 'error');
          return false;
        }
        showNotification('নতুন পিরিয়ড রুটিনে সফলভাবে অন্তর্ভুক্ত করা হয়েছে।');
      }

      loadAllData();
      return true;
    } catch (err: any) {
      showNotification(err.message || 'ত্রুটি ঘটেছে', 'error');
      return false;
    }
  };

  // --- Delete Routine Handler ---
  const handleDeleteRoutine = (routineId: string) => {
    try {
      madsolDb.deleteRoutine(instId, routineId, userId);
      loadAllData();
      showNotification('ক্লাস পিরিয়ড সফলভাবে বাতিল / মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showNotification(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে', 'error');
    }
  };

  // --- Time Slot Handlers ---
  const handleSaveSlot = (data: Omit<DbTimeSlot, 'id' | 'created_at' | 'institution_id'>) => {
    try {
      if (slotToEdit) {
        madsolDb.updateTimeSlot(slotToEdit.id, data);
        showNotification('সময় স্লট সফলভাবে আপডেট হয়েছে।');
      } else {
        madsolDb.createTimeSlot(instId, data);
        showNotification('নতুন সময় স্লট সফলভাবে যুক্ত হয়েছে।');
      }
      loadAllData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই সময় স্লটটি মুছে ফেলতে চান?')) {
      try {
        madsolDb.deleteTimeSlot(slotId);
        loadAllData();
        showNotification('সময় স্লট মুছে ফেলা হয়েছে।');
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
  };

  // --- Classroom Handlers ---
  const handleSaveRoom = (data: Omit<DbClassRoom, 'id' | 'created_at' | 'institution_id'>) => {
    try {
      if (roomToEdit) {
        madsolDb.updateClassRoom(roomToEdit.id, data);
        showNotification('শ্রেণিকক্ষ তথ্য সফলভাবে আপডেট হয়েছে।');
      } else {
        madsolDb.createClassRoom(instId, data);
        showNotification('নতুন শ্রেণিকক্ষ সফলভাবে যুক্ত হয়েছে।');
      }
      loadAllData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('আপনি কি এই কক্ষটি মুছে ফেলতে চান?')) {
      try {
        madsolDb.deleteClassRoom(roomId);
        loadAllData();
        showNotification('শ্রেণিকক্ষ মুছে ফেলা হয়েছে।');
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
  };

  // Helper for opening add modal with prefilled day/slot
  const handleAddAtCell = (dayKey: DayOfWeek, slotId: string) => {
    setRoutineToEdit(null);
    setPrefillDay(dayKey);
    setPrefillSlotId(slotId);
    setIsRoutineModalOpen(true);
  };

  // --- Print Handler ---
  const handlePrintSchedule = () => {
    window.print();
  };

  // Active time slots sorted by order
  const sortedTimeSlots = useMemo(() => {
    return [...timeSlots].sort((a, b) => a.order_index - b.order_index);
  }, [timeSlots]);

  // Available classes for selected department
  const filteredClassesList = useMemo(() => {
    if (selectedDeptId === 'all') return classes;
    return classes.filter((c) => c.department_id === selectedDeptId);
  }, [classes, selectedDeptId]);

  // Available sections for selected class
  const filteredSectionsList = useMemo(() => {
    if (selectedClassId === 'all') return sections;
    return sections.filter((s) => s.class_id === selectedClassId);
  }, [sections, selectedClassId]);

  return (
    <div className="space-y-6 pb-12 w-full max-w-full min-w-0">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 text-xs font-bold max-w-[90vw] ${
            notification.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-500'
              : 'bg-rose-900/95 text-white border-rose-500'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span className="truncate">{notification.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden w-full min-w-0">
        {/* Subtle Decorative Pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 shadow-inner shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-block">
                {isBn ? 'মডিউল ৭ • রুটিন ব্যবস্থাপনা' : 'STEP 7 • CLASS ROUTINE ENGINE'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1 truncate">
                {isBn ? 'ক্লাস ও শিক্ষক রুটিন ব্যবস্থাপনা' : 'Timetable & Class Routine Management'}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-100/80 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
            {isBn
              ? 'জামাত, শাখা, শিক্ষক ও শ্রেণিকক্ষভিত্তিক পূর্ণাঙ্গ সময়সূচি। স্বয়ংক্রিয় শিক্ষক-ক্লাস-রুম সংঘাত শনাক্তকরণ প্রযুক্তি সমন্বিত।'
              : 'Comprehensive schedule by class, section, teacher and room with real-time collision prevention.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={handlePrintSchedule}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition"
            title="রুটিন প্রিন্ট বা পিডিএফ সেভ করুন"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'মুদ্রণ / প্রিন্ট' : 'Print'}</span>
          </button>

          <button
            type="button"
            onClick={loadAllData}
            className="p-2.5 rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => {
                setRoutineToEdit(null);
                setPrefillDay(undefined);
                setPrefillSlotId(undefined);
                setIsRoutineModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন ক্লাস পিরিয়ড' : 'Add Period Slot'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4 w-full min-w-0">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{isBn ? 'মোট পিরিয়ড' : 'Total Periods'}</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.totalRoutines}</p>
          <span className="text-[10px] text-emerald-600 font-medium">সাপ্তাহিক রুটিন এন্ট্রি</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{isBn ? 'সময় স্লট' : 'Time Slots'}</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.totalTimeSlots}</p>
          <span className="text-[10px] text-sky-600 font-medium">দৈনিক পিরিয়ড ও বিরতি</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{isBn ? 'শ্রেণিকক্ষ' : 'Classrooms'}</span>
            <DoorOpen className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.totalRooms}</p>
          <span className="text-[10px] text-teal-600 font-medium">নির্ধারিত সক্রিয় রুম</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{isBn ? 'শিক্ষক লোড' : 'Active Teachers'}</span>
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.activeTeachersInSchedule}</p>
          <span className="text-[10px] text-amber-600 font-medium">রুটিনভুক্ত উস্তাযগণ</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">{isBn ? 'রুটিন জামাত' : 'Covered Classes'}</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100">{stats.classesWithRoutineCount}</p>
          <span className="text-[10px] text-indigo-600 font-medium">জামাত শিডিউল প্রাপ্ত</span>
        </div>
      </div>

      {/* Navigation Mode Pill Tabs */}
      <div className="w-full min-w-0 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setViewMode('weekly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            viewMode === 'weekly'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isBn ? 'সাপ্তাহিক গ্রিড ভিউ' : 'Weekly Timetable'}</span>
        </button>

        <button
          onClick={() => setViewMode('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            viewMode === 'daily'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isBn ? 'দৈনিক পিরিয়ড ভিউ' : 'Daily Timeline'}</span>
        </button>

        <button
          onClick={() => setViewMode('teacher')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            viewMode === 'teacher'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isBn ? 'শিক্ষকভিত্তিক রুটিন' : 'Teacher Schedule'}</span>
        </button>

        <button
          onClick={() => setViewMode('class')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            viewMode === 'class'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isBn ? 'জামাত ও শাখাভিত্তিক' : 'Class Schedule'}</span>
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            viewMode === 'list'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? 'রুটিন তালিকা ও ফিল্টার' : 'Routine List'}</span>
        </button>

        {canManage && (
          <>
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1 shrink-0" />

            <button
              onClick={() => setViewMode('slots')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                viewMode === 'slots'
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isBn ? 'সময় স্লট কনফিগারেশন' : 'Time Slots'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px]">
                {timeSlots.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('rooms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                viewMode === 'rooms'
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>{isBn ? 'শ্রেণিকক্ষ / রুম' : 'Classrooms'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px]">
                {rooms.length}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Common Filter Bar (For Weekly, Daily, Teacher, Class, and List modes) */}
      {viewMode !== 'slots' && viewMode !== 'rooms' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 w-full min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'রুটিন ফিল্টার ও নির্বাচন' : 'Filter Routine'}</span>
            </div>
            {(selectedDeptId !== 'all' ||
              selectedClassId !== 'all' ||
              selectedSectionId !== 'all' ||
              selectedTeacherId !== 'all' ||
              selectedRoomId !== 'all' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDeptId('all');
                  setSelectedClassId('all');
                  setSelectedSectionId('all');
                  setSelectedTeacherId('all');
                  setSelectedRoomId('all');
                  setSearchQuery('');
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full min-w-0">
            {/* Session Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                শিক্ষাবর্ষ
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">সকল শিক্ষাবর্ষ</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.status === 'active' ? '(সক্রিয়)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                বিভাগ
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedClassId('all');
                  setSelectedSectionId('all');
                }}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">সকল বিভাগ</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                জামাত / শ্রেণি
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSectionId('all');
                }}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">সকল জামাত</option>
                {filteredClassesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                শাখা
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">সকল শাখা</option>
                {filteredSectionsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                শিক্ষক
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">সকল শিক্ষক</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বিষয়, শিক্ষক, কক্ষ বা জামাতের নাম লিখে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. WEEKLY MATRIX VIEW (Timetable Grid)                                     */}
      {/* ========================================================================= */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? 'সাপ্তাহিক রুটিন ম্যাট্রিক্স' : 'Weekly Timetable Matrix'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  শনিবার থেকে বৃহস্পতিবার • সময় স্লট অনুযায়ী বিন্যস্ত
                </p>
              </div>

              {canManage && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  💡 যেকোনো খালি সেলে ক্লিক করে সরাসরি ওই স্লটে পিরিয়ড যুক্ত করতে পারবেন
                </span>
              )}
            </div>

            {/* Timetable Table Grid */}
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 w-28 border-r border-slate-200 dark:border-slate-700">
                      দিন / বার
                    </th>
                    {sortedTimeSlots.map((slot) => (
                      <th
                        key={slot.id}
                        className={`p-2.5 text-center border-r border-slate-200 dark:border-slate-700 ${
                          slot.is_break ? 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200' : ''
                        }`}
                      >
                        <div className="font-bold">{slot.name_bn}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {DAYS_OF_WEEK.map((dayObj) => {
                    const isJumuah = dayObj.key === 'friday';

                    return (
                      <tr
                        key={dayObj.key}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                          isJumuah ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        {/* Day Column */}
                        <td className="p-3 font-bold border-r border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                          <div className="text-slate-900 dark:text-slate-100">{dayObj.bn}</div>
                          <div className="text-[10px] font-normal text-slate-400">{dayObj.en}</div>
                        </td>

                        {/* Slots */}
                        {sortedTimeSlots.map((slot) => {
                          if (slot.is_break) {
                            return (
                              <td
                                key={slot.id}
                                className="p-2 text-center border-r border-slate-200 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-950/10"
                              >
                                <span className="inline-block px-2 py-1 rounded-md text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/30">
                                  {slot.name_bn}
                                </span>
                              </td>
                            );
                          }

                          // Find all matching routines for this day + slot
                          const cellRoutines = filteredRoutines.filter(
                            (r) => r.day === dayObj.key && r.time_slot_id === slot.id
                          );

                          return (
                            <td
                              key={slot.id}
                              className="p-1.5 border-r border-slate-200 dark:border-slate-700 align-top hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                              onClick={() => {
                                if (cellRoutines.length === 0 && canManage) {
                                  handleAddAtCell(dayObj.key, slot.id);
                                }
                              }}
                            >
                              {cellRoutines.length === 0 ? (
                                <div className="h-16 flex items-center justify-center text-slate-300 dark:text-slate-700 text-[10px] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition">
                                  {canManage ? '+ যোগ করুন' : '-'}
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {cellRoutines.map((routine) => (
                                    <div
                                      key={routine.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailRoutine(routine);
                                      }}
                                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition text-left group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] truncate">
                                          {routine.subject_name_bn}
                                        </span>
                                        {canManage && (
                                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setRoutineToEdit(routine);
                                                setIsRoutineModalOpen(true);
                                              }}
                                              className="p-1 text-slate-500 hover:text-emerald-600"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 truncate font-medium">
                                        {routine.teacher_name_bn}
                                      </div>

                                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                                        <span className="truncate">{routine.class_name_bn} {routine.section_name_bn ? `(${routine.section_name_bn})` : ''}</span>
                                        {routine.room_name && (
                                          <span className="px-1 rounded-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                            {routine.room_name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAILY TIMELINE VIEW                                                    */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  selectedDay === d.key
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{d.bn}</span>
                {d.isWeekend && <span className="text-[10px] opacity-75">(জুমুআ)</span>}
              </button>
            ))}
          </div>

          {/* Daily Routine Cards Timeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.bn} এর সময়সূচি
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                মোট {filteredRoutines.filter((r) => r.day === selectedDay).length} টি পাঠদান শিডিউল
              </span>
            </div>

            {sortedTimeSlots.map((slot) => {
              const slotRoutines = filteredRoutines.filter(
                (r) => r.day === selectedDay && r.time_slot_id === slot.id
              );

              if (slot.is_break) {
                return (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-bold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{slot.name_bn}</span>
                    </div>
                    <span className="text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px]">
                        {slot.name_bn}
                      </span>
                      <span className="text-slate-400 font-normal font-mono text-[11px]">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleAddAtCell(selectedDay, slot.id)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        + এই স্লটে যোগ করুন
                      </button>
                    )}
                  </div>

                  {slotRoutines.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 italic text-center">
                      কোনো ক্লাস নির্ধারিত নেই (No classes scheduled for this period)
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slotRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 transition"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {routine.subject_name_bn}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {routine.subject_code}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs">
                            <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{routine.teacher_name_bn}</span>
                            </p>

                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {routine.class_name_bn} {routine.section_name_bn ? `(শাখা: ${routine.section_name_bn})` : ''}
                              </span>
                            </p>

                            {routine.room_name && (
                              <p className="text-teal-700 dark:text-teal-400 flex items-center gap-1.5 text-[11px] font-semibold">
                                <DoorOpen className="w-3.5 h-3.5" />
                                <span>কক্ষ: {routine.room_name}</span>
                              </p>
                            )}
                          </div>

                          {canManage && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2 text-xs">
                              <button
                                onClick={() => {
                                  setRoutineToEdit(routine);
                                  setIsRoutineModalOpen(true);
                                }}
                                className="text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>সম্পাদনা</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('আপনি কি এই রুটিন এন্ট্রি মুছে ফেলতে চান?')) {
                                    handleDeleteRoutine(routine.id);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>মুছুন</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TEACHER SCHEDULE VIEW                                                  */}
      {/* ========================================================================= */}
      {viewMode === 'teacher' && (
        <div className="space-y-4">
          {/* Teacher Selector Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'শিক্ষকভিত্তিক সাপ্তাহিক রুটিন ও ক্লাস লোড' : 'Teacher Timetable & Workload'}
              </h3>
              <p className="text-xs text-slate-500">
                নির্দিষ্ট শিক্ষকের সাপ্তাহিক সময়সূচি ও পিরিয়ড বণ্টন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                শিক্ষক নির্বাচন:
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="all">-- শিক্ষক নির্বাচন করুন --</option>
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.full_name_bn} ({tch.teacher_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTeacherId === 'all' ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
              <User className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">
                অনুগ্রহ করে উপরের ড্রপডাউন থেকে একজন শিক্ষক নির্বাচন করুন
              </p>
            </div>
          ) : (
            (() => {
              const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);
              const teacherRoutines = routines.filter(
                (r) => r.teacher_id === selectedTeacherId && (!selectedSessionId || selectedSessionId === 'all' || r.academic_session_id === selectedSessionId)
              );

              return (
                <div className="space-y-4">
                  {/* Teacher Info Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                        {currentTeacher?.full_name_bn}
                      </h4>
                      <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                        আইডি: {currentTeacher?.teacher_id} • মোবাইল: {currentTeacher?.primary_mobile}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-emerald-200 dark:border-emerald-800 text-center">
                        <span className="text-[10px] text-slate-400 block">সাপ্তাহিক পিরিয়ড</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                          {teacherRoutines.length} টি
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Week Timetable Matrix */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto w-full min-w-0">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b">
                          <th className="p-3 w-28 border-r">বার</th>
                          {sortedTimeSlots.map((slot) => (
                            <th key={slot.id} className="p-2 text-center border-r">
                              <div>{slot.name_bn}</div>
                              <div className="text-[10px] font-normal text-slate-400">{slot.start_time}-{slot.end_time}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        {DAYS_OF_WEEK.map((d) => (
                          <tr key={d.key} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold border-r bg-slate-50/50">
                              {d.bn}
                            </td>
                            {sortedTimeSlots.map((slot) => {
                              if (slot.is_break) {
                                return (
                                  <td key={slot.id} className="p-2 text-center border-r bg-amber-50/20 text-[10px] text-amber-700">
                                    {slot.name_bn}
                                  </td>
                                );
                              }

                              const r = teacherRoutines.find((item) => item.day === d.key && item.time_slot_id === slot.id);

                              return (
                                <td key={slot.id} className="p-2 border-r text-center align-top">
                                  {r ? (
                                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                                      <div className="font-bold text-emerald-900 dark:text-emerald-100">{r.subject_name_bn}</div>
                                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300">{r.class_name_bn}</div>
                                      {r.room_name && <div className="text-[9px] text-slate-500">কক্ষ: {r.room_name}</div>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 text-[10px]">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CLASS SCHEDULE VIEW                                                    */}
      {/* ========================================================================= */}
      {viewMode === 'class' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'জামাত ও শাখাভিত্তিক ক্লাস রুটিন' : 'Class & Section Timetable'}
              </h3>
              <p className="text-xs text-slate-500">
                নির্দিষ্ট জামাতের শিক্ষার্থীদের জন্য পূর্ণাঙ্গ সাপ্তাহিক ক্লাস রুটিন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                জামাত নির্বাচন:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
              >
                <option value="all">-- জামাত / শ্রেণি নির্বাচন করুন --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name_bn} ({cls.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClassId === 'all' ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">
                অনুগ্রহ করে উপরের ড্রপডাউন থেকে একটি জামাত নির্বাচন করুন
              </p>
            </div>
          ) : (
            (() => {
              const currentClass = classes.find((c) => c.id === selectedClassId);
              const classRoutines = routines.filter(
                (r) => r.class_id === selectedClassId && (!selectedSectionId || selectedSectionId === 'all' || r.section_id === selectedSectionId)
              );

              return (
                <div className="space-y-4">
                  {/* Class Header info */}
                  <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-teal-900 dark:text-teal-100">
                        {currentClass?.name_bn} এর রুটিন
                      </h4>
                      <p className="text-teal-700 dark:text-teal-300 text-[11px]">
                        কোড: {currentClass?.code} • শিক্ষাবর্ষ: {sessions.find(s => s.id === currentClass?.academic_session_id)?.name || '২০২৬'}
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-teal-200 dark:border-teal-800 text-center">
                      <span className="text-[10px] text-slate-400 block">সাপ্তাহিক ক্লাস</span>
                      <span className="text-sm font-black text-teal-700 dark:text-teal-300">
                        {classRoutines.length} টি
                      </span>
                    </div>
                  </div>

                  {/* Class Timetable Table */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto w-full min-w-0">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-b">
                          <th className="p-3 w-28 border-r">বার</th>
                          {sortedTimeSlots.map((slot) => (
                            <th key={slot.id} className="p-2 text-center border-r">
                              <div>{slot.name_bn}</div>
                              <div className="text-[10px] font-normal text-slate-400">{slot.start_time}-{slot.end_time}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        {DAYS_OF_WEEK.map((d) => (
                          <tr key={d.key} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold border-r bg-slate-50/50">{d.bn}</td>
                            {sortedTimeSlots.map((slot) => {
                              if (slot.is_break) {
                                return (
                                  <td key={slot.id} className="p-2 text-center border-r bg-amber-50/20 text-[10px] text-amber-700">
                                    {slot.name_bn}
                                  </td>
                                );
                              }

                              const r = classRoutines.find((item) => item.day === d.key && item.time_slot_id === slot.id);

                              return (
                                <td key={slot.id} className="p-2 border-r text-center align-top">
                                  {r ? (
                                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800">
                                      <div className="font-bold text-teal-900 dark:text-teal-100">{r.subject_name_bn}</div>
                                      <div className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">{r.teacher_name_bn}</div>
                                      {r.room_name && <div className="text-[9px] text-slate-500">রুম: {r.room_name}</div>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 text-[10px]">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ROUTINE LIST TABLE VIEW (Search & Quick Action)                         */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {isBn ? 'রুটিন তালিকা ও পরিচালনা' : 'Routine Entries List'}
            </h3>
            <span className="text-xs text-slate-500">
              মোট {filteredRoutines.length} টি রেকর্ড পাওয়া গেছে
            </span>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3">বার ও সময়</th>
                  <th className="py-3 px-3">জামাত ও শাখা</th>
                  <th className="py-3 px-3">বিষয়</th>
                  <th className="py-3 px-3">শিক্ষক</th>
                  <th className="py-3 px-3">শ্রেণিকক্ষ</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRoutines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      কোনো রুটিন এন্ট্রি পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredRoutines.map((r) => {
                    const dayObj = DAYS_OF_WEEK.find((d) => d.key === r.day);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{dayObj?.bn}</div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            {r.start_time} - {r.end_time}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{r.class_name_bn}</div>
                          <div className="text-[10px] text-slate-400">
                            {r.section_name_bn ? `শাখা: ${r.section_name_bn}` : 'সকল শাখা'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-teal-800 dark:text-teal-300">{r.subject_name_bn}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{r.subject_code}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{r.teacher_name_bn}</div>
                          {r.teacher_phone && (
                            <div className="text-[10px] text-slate-400">{r.teacher_phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {r.room_name ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[11px]">
                              {r.room_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">নির্ধারিত নেই</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {r.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailRoutine(r)}
                              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => {
                                    setRoutineToEdit(r);
                                    setIsRoutineModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg"
                                  title="সম্পাদনা"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('আপনি কি নিশ্চিতভাবে এই রুটিন মুছে ফেলতে চান?')) {
                                      handleDeleteRoutine(r.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                                  title="মুছুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
      )}

      {/* ========================================================================= */}
      {/* 6. TIME SLOTS MANAGEMENT TAB                                              */}
      {/* ========================================================================= */}
      {viewMode === 'slots' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'সময় স্লট ও পিরিয়ড কনফিগারেশন' : 'Time Slots & Periods Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                মাদরাসার দৈনিক ঘণ্টার সময় নির্ধারণ, পিরিয়ড ক্রম এবং বিরতি স্লট
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setSlotToEdit(null);
                  setIsSlotModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন স্লট তৈরি</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sortedTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all ${
                  slot.is_break
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    ক্রম: #{slot.order_index}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      slot.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {slot.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {slot.name_bn}
                  </h4>
                  <p className="text-[11px] text-slate-400">{slot.name_en}</p>
                </div>

                <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">সময়সীমা:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {slot.start_time} - {slot.end_time}
                  </span>
                </div>

                {slot.is_break && (
                  <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                    ☕ নামাজ / খাবার / বিরতি পিরিয়ড
                  </div>
                )}

                {canManage && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => {
                        setSlotToEdit(slot);
                        setIsSlotModalOpen(true);
                      }}
                      className="text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>সম্পাদনা</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CLASSROOMS MANAGEMENT TAB                                              */}
      {/* ========================================================================= */}
      {viewMode === 'rooms' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'শ্রেণিকক্ষ ও লোকেশন ফাউন্ডেশন' : 'Classrooms & Location Foundation'}
              </h3>
              <p className="text-xs text-slate-500">
                রুম নম্বর, ভবন, তলা এবং ধারণক্ষমতা অনুযায়ী শ্রেণিকক্ষ তালিকা
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setRoomToEdit(null);
                  setIsRoomModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন শ্রেণিকক্ষ যুক্ত করুন</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const assignedCount = routines.filter((r) => r.room_id === room.id).length;

              return (
                <div
                  key={room.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <DoorOpen className="w-4 h-4 text-teal-600" />
                      <span>{room.room_number}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        room.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {room.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {room.building && (
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>ভবন: {room.building}</span>
                      </p>
                    )}
                    {room.floor && (
                      <p className="text-[11px] text-slate-400">তলা: {room.floor}</p>
                    )}
                    <p className="text-[11px] text-slate-500 font-semibold">
                      ধারণক্ষমতা: {room.capacity || 'N/A'} জন
                    </p>
                  </div>

                  <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">শিডিউলভুক্ত ক্লাস:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {assignedCount} টি পিরিয়ড
                    </span>
                  </div>

                  {room.notes && (
                    <p className="mt-2 text-[10px] text-slate-400 italic truncate">
                      নোট: {room.notes}
                    </p>
                  )}

                  {canManage && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => {
                          setRoomToEdit(room);
                          setIsRoomModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-teal-600 flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>সম্পাদনা</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS INTEGRATION                                                        */}
      {/* ========================================================================= */}

      {/* Routine Add / Edit Modal */}
      {isRoutineModalOpen && (
        <RoutineFormModal
          isOpen={isRoutineModalOpen}
          onClose={() => setIsRoutineModalOpen(false)}
          onSave={handleSaveRoutine}
          routineToEdit={routineToEdit}
          institutionId={instId}
          sessions={sessions}
          departments={departments}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          timeSlots={timeSlots}
          teacherAssignments={teacherAssignments}
          defaultSessionId={selectedSessionId !== 'all' ? selectedSessionId : undefined}
          defaultClassId={selectedClassId !== 'all' ? selectedClassId : undefined}
          defaultSectionId={selectedSectionId !== 'all' ? selectedSectionId : undefined}
          defaultDay={prefillDay}
          defaultSlotId={prefillSlotId}
        />
      )}

      {/* Time Slot Modal */}
      {isSlotModalOpen && (
        <TimeSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          onSave={handleSaveSlot}
          slotToEdit={slotToEdit}
        />
      )}

      {/* Classroom Modal */}
      {isRoomModalOpen && (
        <ClassRoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          onSave={handleSaveRoom}
          roomToEdit={roomToEdit}
        />
      )}

      {/* Routine Details Modal */}
      {detailRoutine && (
        <RoutineDetailsModal
          routine={detailRoutine}
          onClose={() => setDetailRoutine(null)}
          onEdit={(r) => {
            setDetailRoutine(null);
            setRoutineToEdit(r);
            setIsRoutineModalOpen(true);
          }}
          onDelete={(id) => {
            handleDeleteRoutine(id);
            setDetailRoutine(null);
          }}
          canManage={canManage}
        />
      )}
    </div>
  );
};

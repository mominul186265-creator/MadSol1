import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar,
  Building2,
  BookOpen,
  User,
  AlertTriangle,
  CheckCircle2,
  Printer,
  DoorOpen,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  DayOfWeek,
  DAYS_OF_WEEK,
  DbClassRoutine,
  DbTimeSlot,
  DbClassRoom,
  RoutineConflict,
} from '../../types/step7';
import { DbAcademicSession, DbDepartment, DbClass, DbSection } from '../../types/step5';
import { DbSubject, DbTeacherAssignment } from '../../types/step6';
import { DbTeacher } from '../../types/step3';
import { madsolDb } from '../../lib/db';

// ============================================================================
// 1. ROUTINE ENTRY FORM MODAL (Add / Edit)
// ============================================================================
interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DbClassRoutine, 'id' | 'created_at' | 'institution_id' | 'deleted_at'>) => Promise<boolean>;
  routineToEdit?: DbClassRoutine | null;
  institutionId: string;
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  subjects: DbSubject[];
  teachers: DbTeacher[];
  rooms: DbClassRoom[];
  timeSlots: DbTimeSlot[];
  teacherAssignments: DbTeacherAssignment[];
  defaultSessionId?: string;
  defaultClassId?: string;
  defaultSectionId?: string;
  defaultDay?: DayOfWeek;
  defaultSlotId?: string;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  routineToEdit,
  institutionId,
  sessions,
  departments,
  classes,
  sections,
  subjects,
  teachers,
  rooms,
  timeSlots,
  teacherAssignments,
  defaultSessionId,
  defaultClassId,
  defaultSectionId,
  defaultDay,
  defaultSlotId,
}) => {
  const activeSession = sessions.find((s) => s.status === 'active') || sessions[0];

  const [sessionId, setSessionId] = useState<string>(routineToEdit?.academic_session_id || defaultSessionId || activeSession?.id || '');
  const [departmentId, setDepartmentId] = useState<string>(routineToEdit?.department_id || '');
  const [classId, setClassId] = useState<string>(routineToEdit?.class_id || defaultClassId || '');
  const [sectionId, setSectionId] = useState<string>(routineToEdit?.section_id || defaultSectionId || '');
  const [day, setDay] = useState<DayOfWeek>(routineToEdit?.day || defaultDay || 'saturday');
  const [timeSlotId, setTimeSlotId] = useState<string>(routineToEdit?.time_slot_id || defaultSlotId || (timeSlots[0]?.id || ''));
  const [startTime, setStartTime] = useState<string>(routineToEdit?.start_time || '');
  const [endTime, setEndTime] = useState<string>(routineToEdit?.end_time || '');
  const [subjectId, setSubjectId] = useState<string>(routineToEdit?.subject_id || '');
  const [teacherId, setTeacherId] = useState<string>(routineToEdit?.teacher_id || '');
  const [roomId, setRoomId] = useState<string>(routineToEdit?.room_id || '');
  const [notes, setNotes] = useState<string>(routineToEdit?.notes || '');
  const [status, setStatus] = useState<'active' | 'cancelled' | 'inactive'>(routineToEdit?.status || 'active');

  const [conflict, setConflict] = useState<RoutineConflict | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (routineToEdit) {
      setSessionId(routineToEdit.academic_session_id);
      setDepartmentId(routineToEdit.department_id);
      setClassId(routineToEdit.class_id);
      setSectionId(routineToEdit.section_id || '');
      setDay(routineToEdit.day);
      setTimeSlotId(routineToEdit.time_slot_id);
      setStartTime(routineToEdit.start_time);
      setEndTime(routineToEdit.end_time);
      setSubjectId(routineToEdit.subject_id);
      setTeacherId(routineToEdit.teacher_id);
      setRoomId(routineToEdit.room_id || '');
      setNotes(routineToEdit.notes || '');
      setStatus(routineToEdit.status);
    } else {
      setSessionId(defaultSessionId || activeSession?.id || '');
      setClassId(defaultClassId || (classes[0]?.id || ''));
      setSectionId(defaultSectionId || '');
      setDay(defaultDay || 'saturday');
      const firstActiveSlot = defaultSlotId ? timeSlots.find(s => s.id === defaultSlotId) : timeSlots.find(s => !s.is_break);
      if (firstActiveSlot) {
        setTimeSlotId(firstActiveSlot.id);
        setStartTime(firstActiveSlot.start_time);
        setEndTime(firstActiveSlot.end_time);
      }
      setSubjectId('');
      setTeacherId('');
      setRoomId('');
      setNotes('');
      setStatus('active');
    }
    setConflict(null);
    setAutoFilledNotice(null);
  }, [isOpen, routineToEdit, defaultSessionId, defaultClassId, defaultSectionId, defaultDay, defaultSlotId]);

  // Sync department when class changes
  useEffect(() => {
    if (classId) {
      const selectedClass = classes.find((c) => c.id === classId);
      if (selectedClass) {
        setDepartmentId(selectedClass.department_id);
      }
    }
  }, [classId, classes]);

  // Sync times when slot changes
  const handleSlotChange = (slotId: string) => {
    setTimeSlotId(slotId);
    const slot = timeSlots.find((s) => s.id === slotId);
    if (slot) {
      setStartTime(slot.start_time);
      setEndTime(slot.end_time);
    }
  };

  // Filter sections by selected class
  const availableSections = sections.filter((s) => s.class_id === classId && s.status === 'active');

  // Auto-suggest teacher when subject and class are selected
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    if (!newSubjectId || !classId) return;

    // Look for primary teacher assignment from Step 6
    const assignment = teacherAssignments.find(
      (ta) =>
        ta.class_id === classId &&
        ta.subject_id === newSubjectId &&
        (!sectionId || !ta.section_id || ta.section_id === sectionId) &&
        ta.assignment_type === 'primary' &&
        ta.status === 'active' &&
        !ta.deleted_at
    );

    if (assignment) {
      setTeacherId(assignment.teacher_id);
      const tch = teachers.find((t) => t.id === assignment.teacher_id);
      if (tch) {
        setAutoFilledNotice(`দায়িত্বপ্রাপ্ত প্রধান শিক্ষক "${tch.full_name_bn}" স্বয়ংক্রিয়ভাবে নির্বাচিত হয়েছেন।`);
      }
    } else {
      setAutoFilledNotice(null);
    }
  };

  // Real-time conflict validation when key fields change
  useEffect(() => {
    if (!sessionId || !classId || !day || !timeSlotId || !subjectId || !teacherId) {
      setConflict(null);
      return;
    }

    const testData = {
      academic_session_id: sessionId,
      department_id: departmentId,
      class_id: classId,
      section_id: sectionId || undefined,
      day,
      time_slot_id: timeSlotId,
      start_time: startTime,
      end_time: endTime,
      subject_id: subjectId,
      teacher_id: teacherId,
      room_id: roomId || undefined,
      status,
    };

    const detected = madsolDb.checkRoutineConflict(
      institutionId,
      testData,
      routineToEdit?.id
    );

    setConflict(detected);
  }, [
    institutionId,
    sessionId,
    departmentId,
    classId,
    sectionId,
    day,
    timeSlotId,
    startTime,
    endTime,
    subjectId,
    teacherId,
    roomId,
    status,
    routineToEdit?.id,
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !classId || !day || !timeSlotId || !subjectId || !teacherId) {
      alert('দয়া করে সেশন, জামাত, দিন, পিরিয়ড, বিষয় এবং শিক্ষক নির্বাচন করুন।');
      return;
    }

    if (conflict) {
      alert(`রুটিন সংঘাত বিদ্যমান!\n${conflict.message_bn}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave({
        academic_session_id: sessionId,
        department_id: departmentId,
        class_id: classId,
        section_id: sectionId || null,
        day,
        time_slot_id: timeSlotId,
        start_time: startTime,
        end_time: endTime,
        subject_id: subjectId,
        teacher_id: teacherId,
        room_id: roomId || null,
        notes: notes.trim() || undefined,
        status,
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {routineToEdit ? 'ক্লাস রুটিন সম্পাদনা (Edit Routine)' : 'নতুন ক্লাস পিরিয়ড যুক্ত করুন (Add Routine Slot)'}
              </h2>
              <p className="text-[11px] text-emerald-100">
                সেশন, জামাত, শাখা, শিক্ষক ও শ্রেণিকক্ষ সংঘাতহীন শিডিউলিং
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Warning Alert Bar */}
        {conflict && (
          <div className="p-4 mx-6 mt-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 animate-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-900 dark:text-rose-100">
                ⚠️ সংঘাত ধরা পড়েছে! (Schedule Conflict Detected)
              </p>
              <p className="mt-1 leading-relaxed">{conflict.message_bn}</p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                সংঘাত এড়িয়ে সময় স্লট, শিক্ষক অথবা কক্ষ পরিবর্তন করুন।
              </p>
            </div>
          </div>
        )}

        {/* Auto-filled Notification */}
        {autoFilledNotice && !conflict && (
          <div className="p-3 mx-6 mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{autoFilledNotice}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Session & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                শিক্ষাবর্ষ (Academic Session) <span className="text-rose-500">*</span>
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                {sessions.map((sess) => (
                  <option key={sess.id} value={sess.id}>
                    {sess.name} {sess.is_current ? '(বর্তমান)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                বিভাগ (Department) <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- বিভাগ নির্বাচন করুন --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name_bn} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Class & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                জামাত / শ্রেণি (Class) <span className="text-rose-500">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- জামাত / শ্রেণি নির্বাচন করুন --</option>
                {classes
                  .filter((c) => !departmentId || c.department_id === departmentId)
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name_bn} ({cls.code})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                শাখা (Section) <span className="text-slate-400 font-normal">(ঐচ্ছিক - খালি রাখলে পুরো জামাত)</span>
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">সকল শাখা (Whole Class - No specific section)</option>
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    শাখা: {sec.name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Day & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                বার / দিন (Day of Week) <span className="text-rose-500">*</span>
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.bn} {d.isWeekend ? '(সাপ্তাহিক ছুটি/জুমুআ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                সময় স্লট / পিরিয়ড (Time Slot) <span className="text-rose-500">*</span>
              </label>
              <select
                value={timeSlotId}
                onChange={(e) => handleSlotChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- পিরিয়ড নির্বাচন করুন --</option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name_bn} ({slot.start_time} - {slot.end_time}) {slot.is_break ? '[বিরতি]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Exact Start & End Time (Auto filled, customizable) */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                শুরু সময় (Start Time)
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                সমাপ্তি সময় (End Time)
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Subject & Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                পাঠ্য বিষয় (Subject) <span className="text-rose-500">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- বিষয় নির্বাচন করুন --</option>
                {subjects
                  .filter((s) => s.status === 'active' && !s.deleted_at)
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name_bn} ({sub.code})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                শিক্ষক (Teacher) <span className="text-rose-500">*</span>
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- শিক্ষক নির্বাচন করুন --</option>
                {teachers
                  .filter((t) => t.employment_status === 'active' && !t.deleted_at)
                  .map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.full_name_bn} ({tch.teacher_id})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Row 6: Classroom & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                শ্রেণিকক্ষ / রুম (Classroom / Room) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- কোনো নির্দিষ্ট কক্ষ বরাদ্দ নেই --</option>
                {rooms
                  .filter((r) => r.status === 'active')
                  .map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.room_number} {rm.building ? `(${rm.building}, ${rm.floor || ''})` : ''} - ধারণক্ষমতা: {rm.capacity || 'N/A'}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                স্ট্যাটাস (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">সক্রিয় (Active)</option>
                <option value="cancelled">স্থগিত / বাতিল (Cancelled)</option>
                <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              বিশেষ নির্দেশনা / নোট (Notes / Instructions)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="যেমন: দারুল হাদিস হলে অনুষ্ঠিত হবে / প্রজেক্টর প্রয়োজন..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!conflict}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : routineToEdit ? 'রুটিন আপডেট করুন' : 'রুটিন সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 2. TIME SLOT MODAL (Add / Edit)
// ============================================================================
interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DbTimeSlot, 'id' | 'created_at' | 'institution_id'>) => void;
  slotToEdit?: DbTimeSlot | null;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  slotToEdit,
}) => {
  const [nameBn, setNameBn] = useState(slotToEdit?.name_bn || '');
  const [nameEn, setNameEn] = useState(slotToEdit?.name_en || '');
  const [startTime, setStartTime] = useState(slotToEdit?.start_time || '08:00');
  const [endTime, setEndTime] = useState(slotToEdit?.end_time || '08:45');
  const [isBreak, setIsBreak] = useState(slotToEdit?.is_break || false);
  const [orderIndex, setOrderIndex] = useState(slotToEdit?.order_index || 1);
  const [status, setStatus] = useState<'active' | 'inactive'>(slotToEdit?.status || 'active');

  useEffect(() => {
    if (slotToEdit) {
      setNameBn(slotToEdit.name_bn);
      setNameEn(slotToEdit.name_en);
      setStartTime(slotToEdit.start_time);
      setEndTime(slotToEdit.end_time);
      setIsBreak(slotToEdit.is_break);
      setOrderIndex(slotToEdit.order_index);
      setStatus(slotToEdit.status);
    } else {
      setNameBn('');
      setNameEn('');
      setStartTime('08:00');
      setEndTime('08:45');
      setIsBreak(false);
      setOrderIndex(1);
      setStatus('active');
    }
  }, [isOpen, slotToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !startTime || !endTime) {
      alert('স্লটের নাম ও সময় সঠিকভাবে দিন।');
      return;
    }

    onSave({
      name_bn: nameBn.trim(),
      name_en: nameEn.trim() || nameBn.trim(),
      start_time: startTime,
      end_time: endTime,
      is_break: isBreak,
      order_index: Number(orderIndex),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-800 text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold">
              {slotToEdit ? 'সময় স্লট সম্পাদনা' : 'নতুন সময় স্লট / পিরিয়ড যুক্ত করুন'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              পিরিয়ডের নাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: ১ম পিরিয়ড / যোহরের নামাজ ও দুপুরের খাবার"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              পিরিয়ডের নাম (ইংরেজি)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Period 1 / Lunch & Prayer Break"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                শুরু সময় <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                সমাপ্তি সময় <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ক্রম / অর্ডার ইনডেক্স
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                স্ট্যাটাস
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="active">সক্রিয় (Active)</option>
                <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                এটি বিরতি / টিফিন / নামাজ স্লট (Is Break / Prayer Time)
              </span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 3. CLASSROOM / ROOM MODAL (Add / Edit)
// ============================================================================
interface ClassRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DbClassRoom, 'id' | 'created_at' | 'institution_id'>) => void;
  roomToEdit?: DbClassRoom | null;
}

export const ClassRoomModal: React.FC<ClassRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  roomToEdit,
}) => {
  const [roomNumber, setRoomNumber] = useState(roomToEdit?.room_number || '');
  const [building, setBuilding] = useState(roomToEdit?.building || '');
  const [floor, setFloor] = useState(roomToEdit?.floor || '');
  const [capacity, setCapacity] = useState(roomToEdit?.capacity || 40);
  const [notes, setNotes] = useState(roomToEdit?.notes || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(roomToEdit?.status || 'active');

  useEffect(() => {
    if (roomToEdit) {
      setRoomNumber(roomToEdit.room_number);
      setBuilding(roomToEdit.building || '');
      setFloor(roomToEdit.floor || '');
      setCapacity(roomToEdit.capacity || 40);
      setNotes(roomToEdit.notes || '');
      setStatus(roomToEdit.status);
    } else {
      setRoomNumber('');
      setBuilding('');
      setFloor('');
      setCapacity(40);
      setNotes('');
      setStatus('active');
    }
  }, [isOpen, roomToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      alert('কক্ষ নম্বর বা নাম প্রদান করুন।');
      return;
    }

    onSave({
      room_number: roomNumber.trim(),
      building: building.trim() || undefined,
      floor: floor.trim() || undefined,
      capacity: Number(capacity) || undefined,
      notes: notes.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-teal-800 text-white">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold">
              {roomToEdit ? 'শ্রেণিকক্ষ তথ্য সম্পাদনা' : 'নতুন শ্রেণিকক্ষ / রুম যুক্ত করুন'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              কক্ষ নম্বর / নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="যেমন: ১০১ / দারুল হাদিস হল / কিতাবখানা ২"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ভবন / বিল্ডিং
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="যেমন: প্রধান ভবন"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                তলা / ফ্লোর
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="যেমন: ২য় তলা"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                শিক্ষার্থী ধারণক্ষমতা (Capacity)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={5}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                স্ট্যাটাস
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="active">সক্রিয় (Active)</option>
                <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              নোট / বিবরণ
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: সাউন্ড সিস্টেম ও কার্পেটযুক্ত"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-md shadow-teal-700/20"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 4. ROUTINE DETAILS MODAL (Quick View)
// ============================================================================
interface RoutineDetailsModalProps {
  routine: DbClassRoutine | null;
  onClose: () => void;
  onEdit?: (routine: DbClassRoutine) => void;
  onDelete?: (routineId: string) => void;
  canManage?: boolean;
}

export const RoutineDetailsModal: React.FC<RoutineDetailsModalProps> = ({
  routine,
  onClose,
  onEdit,
  onDelete,
  canManage,
}) => {
  if (!routine) return null;

  const dayInfo = DAYS_OF_WEEK.find((d) => d.key === routine.day);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-800 text-white">
          <div>
            <h3 className="text-sm font-bold">{routine.subject_name_bn || 'পিরিয়ড বিবরণ'}</h3>
            <p className="text-[11px] text-emerald-100">
              {routine.class_name_bn} {routine.section_name_bn ? `(শাখা: ${routine.section_name_bn})` : ''} • {dayInfo?.bn}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-slate-400">সময় স্লট</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{routine.slot_name || 'নির্ধারিত নয়'}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{routine.start_time} - {routine.end_time}</p>
            </div>
            <div>
              <p className="text-slate-400">বার / দিন</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{dayInfo?.bn || routine.day}</p>
              <p className="text-[11px] text-slate-500">{routine.session_name}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">শিক্ষক:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {routine.teacher_name_bn || 'নির্ধারিত নেই'}
              </span>
            </div>
            {routine.teacher_phone && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">শিক্ষকের মোবাইল:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {routine.teacher_phone}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">বিষয় কোড:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{routine.subject_code || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">শ্রেণিকক্ষ / রুম:</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{routine.room_name || 'সাধারণ জামাতকক্ষ'}</span>
            </div>
            {routine.notes && (
              <div className="py-2">
                <span className="text-slate-500">বিশেষ নোট:</span>
                <p className="mt-1 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 text-amber-900 dark:text-amber-200 text-[11px]">
                  {routine.notes}
                </p>
              </div>
            )}
          </div>

          {canManage && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (onDelete && confirm('আপনি কি নিশ্চিতভাবে এই ক্লাস রুটিন বাতিল করতে চান?')) {
                    onDelete(routine.id);
                    onClose();
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-semibold text-xs"
              >
                মুছে ফেলুন (Delete)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onEdit) {
                    onEdit(routine);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                সম্পাদনা করুন (Edit)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MadSol Step 7: Professional Class Routine Management System
 * Comprehensive Timetable & Schedule Engine
 *
 * Structure:
 * Academic Session -> Department -> Class -> Section -> Day -> Time Slot -> Subject -> Teacher (Optional Room)
 *
 * Conflict Detection:
 * ❌ Teacher conflict (same teacher at same time)
 * ❌ Class/Section conflict (same class/section at same time)
 * ❌ Room conflict (same room at same time)
 */

export type DayOfWeek =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface DayInfo {
  key: DayOfWeek;
  bn: string;
  en: string;
  shortBn: string;
  shortEn: string;
  isWeekend?: boolean;
}

export const DAYS_OF_WEEK: DayInfo[] = [
  { key: 'saturday', bn: 'শনিবার', en: 'Saturday', shortBn: 'শনি', shortEn: 'Sat' },
  { key: 'sunday', bn: 'রবিবার', en: 'Sunday', shortBn: 'রবি', shortEn: 'Sun' },
  { key: 'monday', bn: 'সোমবার', en: 'Monday', shortBn: 'সোম', shortEn: 'Mon' },
  { key: 'tuesday', bn: 'মঙ্গলবার', en: 'Tuesday', shortBn: 'মঙ্গল', shortEn: 'Tue' },
  { key: 'wednesday', bn: 'বুধবার', en: 'Wednesday', shortBn: 'বুধ', shortEn: 'Wed' },
  { key: 'thursday', bn: 'বৃহস্পতিবার', en: 'Thursday', shortBn: 'বৃহঃ', shortEn: 'Thu' },
  { key: 'friday', bn: 'শুক্রবার (জুমুআ)', en: 'Friday (Jumuah)', shortBn: 'শুক্র', shortEn: 'Fri', isWeekend: true },
];

export interface DbTimeSlot {
  id: string;
  institution_id: string;
  name_bn: string; // e.g. '১ম ঘণ্টা / ১ম পিরিয়ড'
  name_en: string; // e.g. 'Period 1'
  start_time: string; // HH:mm e.g. "08:00"
  end_time: string; // HH:mm e.g. "08:45"
  is_break: boolean;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface DbClassRoom {
  id: string;
  institution_id: string;
  room_number: string; // e.g. '১০১', 'দারুল হাদিস হল'
  building?: string;
  floor?: string;
  capacity?: number;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export type RoutineStatus = 'active' | 'cancelled' | 'inactive';

export interface DbClassRoutine {
  id: string;
  institution_id: string;
  academic_session_id: string;
  department_id: string;
  class_id: string;
  section_id?: string | null;
  day: DayOfWeek;
  time_slot_id: string;
  start_time: string; // e.g. "08:00"
  end_time: string; // e.g. "08:45"
  slot_name?: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string | null;
  room_name?: string | null;
  notes?: string;
  status: RoutineStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;

  // Denormalized presentation metadata
  session_name?: string;
  department_name_bn?: string;
  class_name_bn?: string;
  section_name_bn?: string | null;
  subject_name_bn?: string;
  subject_code?: string;
  teacher_name_bn?: string;
  teacher_phone?: string;
  teacher_designation?: string;
}

export type RoutineConflictType =
  | 'teacher_conflict'
  | 'class_conflict'
  | 'section_conflict'
  | 'room_conflict';

export interface RoutineConflict {
  type: RoutineConflictType;
  message_bn: string;
  message_en: string;
  conflicting_routine_id: string;
  details: string;
}

export interface RoutineFilterOptions {
  academic_session_id?: string;
  department_id?: string;
  class_id?: string;
  section_id?: string;
  day?: DayOfWeek | 'all';
  teacher_id?: string;
  subject_id?: string;
  room_id?: string;
  time_slot_id?: string;
  status?: RoutineStatus | 'all';
}

export interface RoutineStats {
  totalRoutines: number;
  totalTimeSlots: number;
  totalRooms: number;
  activeTeachersInSchedule: number;
  classesWithRoutineCount: number;
}

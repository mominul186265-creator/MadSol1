/**
 * MadSol Step 4: Digital Attendance & Leave Management Types
 * Multi-tenant attendance tracking for Students & Teachers
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'half_day';

export type AttendanceTargetType = 'student' | 'teacher';

export type LeaveType =
  | 'sick'
  | 'casual'
  | 'hajj_umrah'
  | 'emergency'
  | 'academic'
  | 'family'
  | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface DbAttendanceRecord {
  id: string;
  institution_id: string;
  target_type: AttendanceTargetType;
  target_id: string; // References DbStudent.id or DbTeacher.id
  target_name_bn?: string;
  target_name_en?: string;
  target_code?: string; // Roll number or Teacher ID
  date: string; // Format: YYYY-MM-DD
  status: AttendanceStatus;
  check_in_time?: string; // Format: HH:mm (24hr)
  check_out_time?: string; // Format: HH:mm (24hr)
  department_id?: string;
  class_id?: string;
  section_id?: string;
  session?: string;
  remarks?: string;
  recorded_by?: string; // User ID who took attendance
  created_at: string;
  updated_at: string;
}

export interface DbLeaveApplication {
  id: string;
  institution_id: string;
  target_type: AttendanceTargetType;
  target_id: string;
  target_name_bn?: string;
  target_name_en?: string;
  target_code?: string;
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  reason: string;
  status: LeaveStatus;
  applied_at: string;
  action_by?: string;
  action_at?: string;
  action_remarks?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendance_percentage: number;
  total_count?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  leave_count?: number;
}

export interface AttendanceFilterOptions {
  date: string;
  target_type: AttendanceTargetType;
  department_id?: string;
  class_id?: string;
  section_id?: string;
  status?: AttendanceStatus | 'all';
  search?: string;
}

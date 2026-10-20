/**
 * MadSol Step 5: Professional Academic Management System Types
 * Multi-tenant, bilingual (Bangla + English), strict RBAC
 */

export type AcademicSessionStatus = 'active' | 'upcoming' | 'completed' | 'archived';
export type DepartmentStatus = 'active' | 'inactive';
export type ClassStatus = 'active' | 'inactive';
export type SectionStatus = 'active' | 'inactive';
export type AcademicStudentStatus = 'active' | 'promoted' | 'on_hold' | 'completed' | 'transferred';

export interface DbAcademicSession {
  id: string;
  institution_id: string;
  name: string; // e.g. '2026' or '2025-2026'
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: AcademicSessionStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DbAcademicDepartment {
  id: string;
  institution_id: string;
  name_bn: string;
  name_en: string;
  code: string; // Unique per institution, e.g. 'NOORANI', 'HIFZ'
  description?: string;
  status?: DepartmentStatus;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  // Computed helpers
  total_classes?: number;
  total_students?: number;
}

export interface DbAcademicClass {
  id: string;
  institution_id: string;
  department_id: string;
  academic_session_id?: string;
  name_bn: string;
  name_en: string;
  code: string; // Unique per institution, e.g. 'NOR-01'
  class_order?: number; // For academic ordering: 1, 2, 3...
  description?: string;
  status?: ClassStatus;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  // Computed helpers
  department_name_bn?: string;
  department_name_en?: string;
  session_name?: string;
  total_sections?: number;
  total_students?: number;
}

export interface DbAcademicSection {
  id: string;
  institution_id: string;
  department_id?: string;
  class_id: string;
  academic_session_id?: string;
  name?: string; // e.g. 'A', 'B', 'ক শাখা'
  name_bn?: string;
  name_en?: string;
  code?: string; // e.g. 'SEC-A'
  capacity?: number;
  status?: SectionStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  // Computed helpers
  class_name_bn?: string;
  department_name_bn?: string;
  session_name?: string;
  total_students?: number;
}

export type DbDepartment = DbAcademicDepartment;
export type DbClass = DbAcademicClass;
export type DbSection = DbAcademicSection;

export interface DbStudentAcademicHistory {
  id: string;
  institution_id: string;
  student_id: string;
  academic_session_id: string;
  department_id: string;
  class_id: string;
  section_id?: string;
  roll_number: string;
  academic_status: AcademicStudentStatus;
  start_date: string;
  end_date?: string;
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Populated display fields
  student_name_bn?: string;
  student_name_en?: string;
  session_name?: string;
  department_name_bn?: string;
  class_name_bn?: string;
  section_name?: string;
}

export type AcademicActivityAction =
  | 'SESSION_CREATED'
  | 'SESSION_UPDATED'
  | 'ACTIVE_SESSION_CHANGED'
  | 'SESSION_ARCHIVED'
  | 'DEPARTMENT_CREATED'
  | 'DEPARTMENT_UPDATED'
  | 'DEPARTMENT_STATUS_CHANGED'
  | 'DEPARTMENT_DELETED'
  | 'CLASS_CREATED'
  | 'CLASS_UPDATED'
  | 'CLASS_STATUS_CHANGED'
  | 'CLASS_DELETED'
  | 'SECTION_CREATED'
  | 'SECTION_UPDATED'
  | 'SECTION_STATUS_CHANGED'
  | 'SECTION_DELETED'
  | 'STUDENT_ACADEMIC_ASSIGNED'
  | 'STUDENT_PROMOTED_FOUNDATION'
  | 'SETTINGS_UPDATED';

export interface DbAcademicActivity {
  id: string;
  institution_id: string;
  user_id?: string;
  user_name?: string;
  entity_type: 'session' | 'department' | 'class' | 'section' | 'student_assignment' | 'settings';
  entity_id: string;
  action: AcademicActivityAction;
  description: string;
  created_at: string;
}

export interface DbAcademicSettings {
  id: string;
  institution_id: string;
  default_session_id?: string;
  roll_generation_mode: 'manual' | 'auto_sequence';
  allow_duplicate_rolls_across_sections: boolean;
  auto_session_rollover: boolean;
  updated_at: string;
}

export interface AcademicStats {
  activeSessionName: string;
  activeSessionId: string;
  totalDepartments: number;
  totalClasses: number;
  totalSections: number;
  totalAssignedStudents: number;
}

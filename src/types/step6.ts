/**
 * MadSol Step 6: Professional Subject Management & Teacher Assignment System
 * Multi-tenant, bilingual (Bangla + English), strict RBAC & Database constraints
 */

export type SubjectCategory =
  | 'general'
  | 'islamic'
  | 'quran'
  | 'hadith'
  | 'fiqh'
  | 'arabic'
  | 'language'
  | 'mathematics'
  | 'science'
  | 'technical'
  | 'other';

export type SubjectStatus = 'active' | 'inactive' | 'archived';

export type ClassSubjectStatus = 'active' | 'inactive' | 'archived';

export type TeacherAssignmentType = 'primary' | 'subject_teacher' | 'assistant' | 'guest';

export type TeacherAssignmentStatus = 'active' | 'pending' | 'inactive' | 'archived';

export interface DbSubject {
  id: string;
  institution_id: string;
  name_bn: string;
  name_en: string;
  code: string; // Unique per institution e.g. BAN-101, QUR-101
  category: SubjectCategory;
  description?: string;
  status: SubjectStatus;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Computed helpers for UI
  department_ids?: string[];
  department_names?: string[];
  total_classes?: number;
  total_teachers?: number;
}

export interface DbSubjectDepartment {
  id: string;
  institution_id: string;
  subject_id: string;
  department_id: string;
  created_at: string;
}

export interface DbClassSubject {
  id: string;
  institution_id: string;
  academic_session_id: string;
  department_id: string;
  class_id: string;
  section_id?: string | null; // Optional: null means whole class
  subject_id: string;
  status: ClassSubjectStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Computed helpers
  subject_name_bn?: string;
  subject_name_en?: string;
  subject_code?: string;
  subject_category?: SubjectCategory;
  class_name_bn?: string;
  department_name_bn?: string;
  session_name?: string;
  section_name?: string;
  assigned_teachers_count?: number;
  primary_teacher_name?: string;
}

export interface DbTeacherAssignment {
  id: string;
  institution_id: string;
  teacher_id: string;
  academic_session_id: string;
  department_id: string;
  class_id: string;
  section_id?: string | null;
  subject_id: string;
  assignment_type: TeacherAssignmentType;
  status: TeacherAssignmentStatus;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Computed helpers
  teacher_name_bn?: string;
  teacher_name_en?: string;
  teacher_employee_id?: string;
  teacher_photo_url?: string;
  subject_name_bn?: string;
  subject_name_en?: string;
  subject_code?: string;
  class_name_bn?: string;
  department_name_bn?: string;
  section_name?: string;
  session_name?: string;
}

export interface DbSubjectActivity {
  id: string;
  institution_id: string;
  user_id?: string;
  subject_id?: string;
  action: string;
  description: string;
  created_at: string;
}

export interface SubjectStats {
  totalSubjects: number;
  activeSubjects: number;
  totalClassSubjects: number;
  totalTeacherAssignments: number;
  totalPrimaryTeachers: number;
}

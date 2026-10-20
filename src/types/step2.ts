/**
 * MadSol Step 2: Professional Student Management System Types
 */

export type StudentStatus =
  | 'active'
  | 'pending'
  | 'on_leave'
  | 'inactive'
  | 'transferred'
  | 'graduated';

export type StudentGender = 'male' | 'female' | 'other';

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'unknown';

export type DocumentCategory =
  | 'birth_certificate'
  | 'previous_certificate'
  | 'admission_paper'
  | 'photo'
  | 'other';

export interface DbDepartment {
  id: string;
  institution_id: string;
  name_bn: string;
  name_en: string;
  code: string;
  description?: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  total_classes?: number;
  total_students?: number;
}

export interface DbClass {
  id: string;
  institution_id: string;
  department_id: string;
  academic_session_id?: string;
  name_bn: string;
  name_en: string;
  code: string;
  class_order?: number;
  description?: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  department_name_bn?: string;
  department_name_en?: string;
  session_name?: string;
  total_sections?: number;
  total_students?: number;
}

export interface DbSection {
  id: string;
  institution_id: string;
  department_id?: string;
  class_id: string;
  academic_session_id?: string;
  name_bn: string;
  name_en: string;
  name?: string;
  code?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  class_name_bn?: string;
  department_name_bn?: string;
  session_name?: string;
  total_students?: number;
}

export interface DbStudent {
  id: string;
  institution_id: string;
  student_id: string; // e.g., 'MDS-2026-00001'
  full_name_bn: string;
  full_name_en: string;
  photo?: string;
  gender: StudentGender;
  date_of_birth: string; // YYYY-MM-DD
  blood_group?: BloodGroup;
  nationality: string;
  religion?: string;
  birth_registration_number?: string;

  // Academic
  department_id: string;
  class_id: string;
  section_id?: string;
  roll_number: string;
  academic_session: string; // e.g., '2026'
  admission_date: string; // YYYY-MM-DD
  previous_institution?: string;
  previous_class?: string;

  // Contact
  mobile?: string;
  email?: string;
  present_address: string;
  permanent_address: string;

  // Emergency
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_mobile: string;
  emergency_alternative_mobile?: string;
  emergency_address?: string;

  // Status & Meta
  status: StudentStatus;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DbStudentDocument {
  id: string;
  institution_id: string;
  student_id: string;
  category: DocumentCategory;
  file_name: string;
  file_path: string; // Base64 data URL or storage URL
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface DbStudentActivity {
  id: string;
  institution_id: string;
  student_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  description: string;
  created_at: string;
}

export interface StudentFilterOptions {
  search?: string;
  department_id?: string;
  class_id?: string;
  section_id?: string;
  academic_session?: string;
  gender?: StudentGender | 'all';
  status?: StudentStatus | 'all';
  sortBy?: 'name' | 'student_id' | 'admission_date' | 'roll_number';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface StudentStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  on_leave: number;
  transferred: number;
  graduated: number;
}

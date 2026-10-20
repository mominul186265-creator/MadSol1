/**
 * MadSol Step 3: Professional Teacher Management System Types
 */

import { BloodGroup } from './step2';

export type TeacherGender = 'male' | 'female' | 'other';

export type TeacherEmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary';

export type TeacherStatus =
  | 'active'
  | 'pending'
  | 'on_leave'
  | 'inactive'
  | 'resigned'
  | 'terminated'
  | 'suspended'
  | 'retired'
  | 'left';

export type IslamicQualificationType =
  | 'Hifz'
  | 'Alim'
  | 'Dawrah'
  | 'Fazilat'
  | 'Ifta'
  | 'Qiraat'
  | 'Tajweed'
  | 'Other';

export type TeacherDocumentCategory =
  | 'educational_certificate'
  | 'islamic_certificate'
  | 'nid_identification'
  | 'appointment_letter'
  | 'experience_certificate'
  | 'other';

export interface DbTeacherDesignation {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
}

export interface DbTeacher {
  id: string;
  institution_id: string;
  user_id?: string | null; // Connected login user ID
  teacher_id: string; // e.g. 'MDS-T-2026-00001'
  full_name_bn: string;
  full_name_en: string;
  photo?: string;
  gender: TeacherGender;
  date_of_birth: string; // YYYY-MM-DD
  blood_group?: BloodGroup;
  nationality: string;
  religion?: string;
  identification_number?: string; // NID / Passport
  primary_mobile: string;
  alternative_mobile?: string;
  email?: string;
  present_address: string;
  permanent_address: string;

  // Emergency Contact
  emergency_contact_name: string;
  emergency_relationship: string;
  emergency_mobile: string;
  emergency_alternative_mobile?: string;

  // Qualification
  highest_qualification: string;
  educational_background: string;
  islamic_qualification?: string;
  institution_university: string;
  passing_year?: string;
  specialization: string;
  experience_years?: number;

  // Employment
  designation_id: string;
  department_id: string;
  joining_date: string; // YYYY-MM-DD
  employment_type: TeacherEmploymentType;
  employment_status: TeacherStatus;

  // Audit
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DbTeacherQualification {
  id: string;
  institution_id: string;
  teacher_id: string;
  qualification_type: 'general' | 'islamic' | 'other';
  qualification_name: string;
  institution_name: string;
  passing_year?: string;
  certificate_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeacherDocument {
  id: string;
  institution_id: string;
  teacher_id: string;
  category: TeacherDocumentCategory;
  document_name: string;
  file_path: string; // Base64 Data URL or path
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface DbTeacherActivity {
  id: string;
  institution_id: string;
  teacher_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  description: string;
  created_at: string;
}

export interface TeacherFilterOptions {
  search?: string;
  designation_id?: string;
  department_id?: string;
  employment_type?: TeacherEmploymentType | 'all';
  employment_status?: TeacherStatus | 'all';
  status?: TeacherStatus | 'all';
  gender?: TeacherGender | 'all';
  joining_year?: string;
  sortBy?: 'name' | 'teacher_id' | 'joining_date' | 'status' | 'experience';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TeacherStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  on_leave: number;
  resigned?: number;
  terminated?: number;
  suspended?: number;
  retired?: number;
  left?: number;
}

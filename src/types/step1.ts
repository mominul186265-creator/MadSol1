/**
 * MadSol Step 1: Core System + Authentication + User Roles Types
 */

export type InstitutionType =
  | 'madrasa'
  | 'school'
  | 'islamic_school'
  | 'hifz_madrasa'
  | 'other';

export type InstitutionStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export type UserStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export type RoleSlug =
  | 'super_admin'
  | 'institution_admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'guardian'
  | 'student';

export interface DbInstitution {
  id: string;
  name: string;
  short_name: string;
  institution_type: InstitutionType;
  mobile: string;
  email: string;
  address: string;
  logo?: string;
  language: 'bn' | 'en';
  status: InstitutionStatus;
  created_at: string;
  updated_at: string;

  // Compatibility aliases for legacy components
  nameBn?: string;
  nameEn?: string;
  phone?: string;
  addressBn?: string;
  addressEn?: string;
  eiinNumber?: string;

  // Access PINs for teacher and guardian onboarding
  teacher_access_pin?: string;
  guardian_access_pin?: string;
}

export interface DbUser {
  id: string;
  institution_id: string;
  name: string;
  email: string;
  mobile: string;
  password_hash: string;
  role_id: RoleSlug;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at: string;

  // Compatibility aliases for legacy components
  role?: any;
  fullNameBn?: string;
  fullNameEn?: string;
  phone?: string;
  avatarUrl?: string;
  guardianStudentId?: string;
  studentRoll?: string;
  department?: string;
  designationBn?: string;
  designationEn?: string;
  institutionId?: string;

  // App Access & Role Hierarchy Permission Fields
  app_access_granted?: boolean;
  approved_by_id?: string;
  approved_by_name?: string;
  approved_by_role?: string;
  approved_at?: string;
  can_grant_guardian_access?: boolean; // For assistant teachers
  allowed_modules?: string[];          // Allowed app modules
  access_pin?: string;                 // Quick 6-digit access code for guardian/teacher
  approval_notes?: string;             // Notes or instructions from approver
}

export interface DbRole {
  id: string;
  name: string;
  slug: RoleSlug;
  description: string;
  created_at: string;
}

export interface DbPermission {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface DbRolePermission {
  role_id: string;
  permission_id: string;
}

export interface DbUserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  ip_address: string;
  user_agent: string;
}

export interface DbActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  institution_id: string;
  action: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'failed';
}

export type UserRole =
  | 'super_admin'
  | 'madrasa_admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'guardian'
  | 'student';

export interface RoleInfo {
  id: UserRole;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  color: string;
  badgeBg: string;
}

export interface Permission {
  id: string;
  category: 'core' | 'academic' | 'finance' | 'communication' | 'system';
  nameBn: string;
  nameEn: string;
  description: string;
}

export interface Institution {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  eiinNumber?: string;
  establishedYear: number;
  type: 'qawmi' | 'alia' | 'cadet_madrasa' | 'hifz_madrasa';
  addressBn: string;
  addressEn: string;
  phone: string;
  email: string;
  logoUrl?: string;
  subscriptionPlan: 'starter' | 'pro' | 'enterprise';
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
}

export interface UserSettings {
  language: 'bn' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  compactView: boolean;
}

export interface User {
  id: string;
  institutionId: string;
  fullNameBn: string;
  fullNameEn: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  designationBn?: string;
  designationEn?: string;
  studentRoll?: string;
  guardianStudentId?: string;
  permissions: string[];
  settings: UserSettings;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ActivityLog {
  id: string;
  institutionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface HeaderNotificationItem {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  isRead: boolean;
  targetRole?: UserRole[];
}

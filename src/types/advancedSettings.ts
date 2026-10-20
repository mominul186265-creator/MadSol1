export interface InstitutionSettingsData {
  institutionNameBn: string;
  institutionNameEn: string;
  shortNameBn: string;
  shortNameEn: string;
  logoUrl: string;
  addressBn: string;
  addressEn: string;
  mobile: string;
  email: string;
  website: string;
  principalNameBn: string;
  principalNameEn: string;
  establishedYear: string;
  eiinNumber: string;
}

export interface BrandingSettingsData {
  primaryColor: string; // e.g. "#047857"
  secondaryColor: string; // e.g. "#0f766e"
  accentColor: string; // e.g. "#d97706"
  logoUrl: string;
  loginBgUrl: string;
  appNameBn: string;
  appNameEn: string;
  appTaglineBn: string;
  appTaglineEn: string;
}

export interface DateTimeSettingsData {
  timezone: string; // 'Asia/Dhaka'
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  timeFormat: '12h' | '24h';
  weekStartDay: 'saturday' | 'sunday' | 'monday';
  workingDays: ('sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri')[];
}

export interface SystemFormatsSettingsData {
  studentIdPrefix: string; // e.g. "MS-STU-"
  teacherIdPrefix: string; // e.g. "MS-TCH-"
  receiptPrefix: string; // e.g. "REC-"
  certificatePrefix: string; // e.g. "CERT-"
  currencySymbol: string; // '৳'
  currencyCode: string; // 'BDT'
  activeAcademicSession: string; // '2026-2027'
}

export interface NotificationSettingsData {
  enableDefaultPush: boolean;
  enableAutomatedSms: boolean;
  enableAnnouncementAlerts: boolean;
  enableDueReminders: boolean;
  enableEmailDigest: boolean;
  smsGatewayActive: boolean;
  voiceCallsActive: boolean;
}

export interface SecuritySettingsData {
  minPasswordLength: number;
  requireSpecialChar: boolean;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  twoFactorAuthEnabled: boolean;
  allowMultipleDeviceSessions: boolean;
  ipWhitelistEnabled: boolean;
  auditTrailStrict: boolean;
}

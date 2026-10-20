export * from './auth';
export * from './navigation';
export * from './database';
export * from './student';
export * from './finance';
export * from './hifz';
export * from './academic';
export * from './boarding';
export * from './automation';
export * from './ai';
export * from './communication';
export * from './documents';
export * from './idcard';
export * from './certificates';
export * from './qr';
export * from './advancedSettings';
export * from './superAdmin';
export * from './step1';
export * from './step2';
export * from './step3';
export * from './step4';
export * from './step5';
export * from './step6';

// Explicitly re-export to resolve collisions between legacy files and step2/step3/step5
export type { StudentStatus, BloodGroup, DocumentCategory } from './step2';
export type { DbDepartment, DbClass, DbSection } from './step5';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'bn' | 'en';

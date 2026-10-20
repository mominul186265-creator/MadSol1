import { DbTableSchema } from '../types/database';

export const DATABASE_TABLES_SCHEMA: DbTableSchema[] = [
  // CORE TABLES (Currently active in foundation)
  {
    name: 'institutions',
    category: 'core',
    descriptionBn: 'মাদ্রাসা প্রতিষ্ঠানের তথ্য (মাল্টি-ইনস্টিটিউশন সাপোর্ট)',
    descriptionEn: 'Institution records for multi-tenant isolation',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'ইউনিক আইডি', descriptionEn: 'Primary Key' },
      { name: 'code', type: 'VARCHAR(20)', descriptionBn: 'প্রতিষ্ঠানের কোড (যেমন MAD-001)', descriptionEn: 'Unique code' },
      { name: 'name_bn', type: 'VARCHAR(255)', descriptionBn: 'প্রতিষ্ঠানের বাংলা নাম', descriptionEn: 'Name in Bengali' },
      { name: 'name_en', type: 'VARCHAR(255)', descriptionBn: 'প্রতিষ্ঠানের ইংরেজি নাম', descriptionEn: 'Name in English' },
      { name: 'type', type: 'ENUM(qawmi, alia, cadet, hifz)', descriptionBn: 'মাদ্রাসার ধরন', descriptionEn: 'Madrasa type' },
      { name: 'eiin_number', type: 'VARCHAR(50)', isNullable: true, descriptionBn: 'EIIN নম্বর (যদি থাকে)', descriptionEn: 'EIIN number' },
      { name: 'address', type: 'TEXT', descriptionBn: 'ঠিকানা', descriptionEn: 'Full address' },
      { name: 'phone', type: 'VARCHAR(20)', descriptionBn: 'যোগাযোগের মোবাইল', descriptionEn: 'Primary phone' },
      { name: 'email', type: 'VARCHAR(100)', descriptionBn: 'অফিসিয়াল ইমেইল', descriptionEn: 'Official email' },
      { name: 'subscription_plan', type: 'VARCHAR(50)', descriptionBn: 'সাবস্ক্রিপশন প্ল্যান', descriptionEn: 'SaaS plan' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'roles',
    category: 'core',
    descriptionBn: 'ব্যবহারকারীর রোল (Super Admin, Madrasa Admin, Principal, ইত্যাদি)',
    descriptionEn: 'System roles definition with authorization hierarchy',
    status: 'active',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', isPrimary: true, descriptionBn: 'রোল স্লাগ (যেমন super_admin)', descriptionEn: 'Role identifier' },
      { name: 'name_bn', type: 'VARCHAR(100)', descriptionBn: 'রোলের বাংলা নাম', descriptionEn: 'Bangla title' },
      { name: 'name_en', type: 'VARCHAR(100)', descriptionBn: 'রোলের ইংরেজি নাম', descriptionEn: 'English title' },
      { name: 'hierarchy_level', type: 'INT', descriptionBn: 'ক্ষমতার স্তর (১-৭)', descriptionEn: 'Hierarchy priority' },
      { name: 'is_system_default', type: 'BOOLEAN', descriptionBn: 'সিস্টেম ডিফল্ট রোল কিনা', descriptionEn: 'Is predefined' }
    ]
  },
  {
    name: 'permissions',
    category: 'core',
    descriptionBn: 'সিস্টেম অ্যাক্সেস পারমিশন তালিকা (RBAC)',
    descriptionEn: 'Granular permissions for modules and actions',
    status: 'active',
    columns: [
      { name: 'id', type: 'VARCHAR(100)', isPrimary: true, descriptionBn: 'পারমিশন কোড (যেমন student.view)', descriptionEn: 'Permission Key' },
      { name: 'category', type: 'VARCHAR(50)', descriptionBn: 'মডিউল ক্যাটাগরি', descriptionEn: 'Category' },
      { name: 'name_bn', type: 'VARCHAR(150)', descriptionBn: 'পারমিশনের বিবরণ (বাংলা)', descriptionEn: 'Bangla Description' },
      { name: 'name_en', type: 'VARCHAR(150)', descriptionBn: 'পারমিশনের বিবরণ (ইংরেজি)', descriptionEn: 'English Description' }
    ]
  },
  {
    name: 'role_permissions',
    category: 'core',
    descriptionBn: 'রোল এবং পারমিশনের ম্যাপিং টেবিল',
    descriptionEn: 'Pivot table linking roles to specific permissions',
    status: 'active',
    columns: [
      { name: 'role_id', type: 'VARCHAR(50)', isForeign: true, foreignTable: 'roles', descriptionBn: 'রোলের আইডি', descriptionEn: 'Foreign key to roles' },
      { name: 'permission_id', type: 'VARCHAR(100)', isForeign: true, foreignTable: 'permissions', descriptionBn: 'পারমিশন আইডি', descriptionEn: 'Foreign key to permissions' }
    ]
  },
  {
    name: 'users',
    category: 'core',
    descriptionBn: 'সকল ব্যবহারকারীর সুরক্ষিত একাউন্ট ও অথেনটিকেশন',
    descriptionEn: 'User credentials, institution binding, and active role',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'ইউজার আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'প্রতিষ্ঠানের আইডি (মাল্টি-টেন্যান্ট)', descriptionEn: 'Tenant ID' },
      { name: 'role_id', type: 'VARCHAR(50)', isForeign: true, foreignTable: 'roles', descriptionBn: 'ব্যবহারকারীর ভূমিকা/রোল', descriptionEn: 'Role ID' },
      { name: 'full_name_bn', type: 'VARCHAR(150)', descriptionBn: 'পূর্ণ নাম (বাংলা)', descriptionEn: 'Full name in Bengali' },
      { name: 'full_name_en', type: 'VARCHAR(150)', descriptionBn: 'পূর্ণ নাম (ইংরেজি)', descriptionEn: 'Full name in English' },
      { name: 'phone', type: 'VARCHAR(20)', descriptionBn: 'মোবাইল নম্বর (লগইন কি)', descriptionEn: 'Phone number (login)' },
      { name: 'email', type: 'VARCHAR(100)', descriptionBn: 'ইমেইল অ্যাড্রেস (লগইন কি)', descriptionEn: 'Email address (login)' },
      { name: 'password_hash', type: 'VARCHAR(255)', descriptionBn: 'সুরক্ষিত হ্যাশ করা পাসওয়ার্ড', descriptionEn: 'Salted cryptographic hash' },
      { name: 'status', type: 'ENUM(active, inactive, suspended)', descriptionBn: 'একাউন্টের স্ট্যাটাস', descriptionEn: 'Account status' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'একাউন্ট তৈরির সময়', descriptionEn: 'Created timestamp' },
      { name: 'last_login_at', type: 'TIMESTAMP', isNullable: true, descriptionBn: 'সর্বশেষ লগইন সময়', descriptionEn: 'Last sign in' }
    ]
  },
  {
    name: 'user_settings',
    category: 'core',
    descriptionBn: 'ব্যবহারকারীর ভাষা (বাংলা/ইংরেজি), থিম ও নোটিফিকেশন পছন্দ',
    descriptionEn: 'User preferences including language, dark mode, alerts',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'সেটিংস আইডি', descriptionEn: 'Primary Key' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'ইউজার আইডি', descriptionEn: 'Foreign key to users' },
      { name: 'language', type: 'ENUM(bn, en)', descriptionBn: 'নির্বাচিত ভাষা (ডিফল্ট: বাংলা)', descriptionEn: 'Chosen UI language' },
      { name: 'theme', type: 'ENUM(light, dark, system)', descriptionBn: 'থিম মোড (লাইট/ডার্ক)', descriptionEn: 'Interface theme mode' },
      { name: 'notifications_enabled', type: 'BOOLEAN', descriptionBn: 'পুশ নোটিফিকেশন অন/অফ', descriptionEn: 'Notification toggle' },
      { name: 'sms_alerts_enabled', type: 'BOOLEAN', descriptionBn: 'এসএমএস অ্যালার্ট অন/অফ', descriptionEn: 'SMS alerts preference' },
      { name: 'updated_at', type: 'TIMESTAMP', descriptionBn: 'সর্বশেষ পরিবর্তনের সময়', descriptionEn: 'Last modified' }
    ]
  },
  {
    name: 'activity_logs',
    category: 'core',
    descriptionBn: 'সিস্টেমের নিরাপত্তা ও পরিবর্তন অডিট ট্রেইল (Audit Trail)',
    descriptionEn: 'Security audit logs and change tracking',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'লগ আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'প্রতিষ্ঠানের আইডি', descriptionEn: 'Tenant ID' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'কার্য সম্পাদনকারী ইউজার', descriptionEn: 'Actor user ID' },
      { name: 'action', type: 'VARCHAR(100)', descriptionBn: 'অ্যাকশনের নাম (যেমন USER_LOGIN)', descriptionEn: 'Action type' },
      { name: 'details', type: 'TEXT', descriptionBn: 'বিস্তারিত তথ্য', descriptionEn: 'Detailed log message' },
      { name: 'ip_address', type: 'VARCHAR(45)', isNullable: true, descriptionBn: 'আইপি ঠিকানা', descriptionEn: 'Client IP' },
      { name: 'timestamp', type: 'TIMESTAMP', descriptionBn: 'সময়কাল', descriptionEn: 'Event timestamp' }
    ]
  },

  // ACADEMIC MANAGEMENT TABLES (Step 5)
  {
    name: 'academic_sessions',
    category: 'academic',
    descriptionBn: 'শিক্ষা বর্ষ/সেশন (যেমন ২০২৬, ২০২৫-২০২৬) ও সক্রিয় সেশন নির্ধারণ',
    descriptionEn: 'Academic calendar sessions and active session control',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'সেশন আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'name', type: 'VARCHAR(50)', descriptionBn: 'সেশনের নাম (যেমন ২০২৬)', descriptionEn: 'Session name' },
      { name: 'start_date', type: 'DATE', descriptionBn: 'শুরুর তারিখ', descriptionEn: 'Start date' },
      { name: 'end_date', type: 'DATE', descriptionBn: 'সমাপ্তির তারিখ', descriptionEn: 'End date' },
      { name: 'status', type: 'ENUM(active, upcoming, completed, archived)', descriptionBn: 'স্ট্যাটাস', descriptionEn: 'Session status' },
      { name: 'is_active', type: 'BOOLEAN', descriptionBn: 'বর্তমানে সক্রিয় সেশন কিনা', descriptionEn: 'Active flag' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'departments',
    category: 'academic',
    descriptionBn: 'একাডেমিক বিভাগসমূহ (হিফজুল কুরআন, কিতাব, নূরানী, জেনারেল ইত্যাদি)',
    descriptionEn: 'Academic departments registry with unique codes',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'বিভাগ আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'name_bn', type: 'VARCHAR(150)', descriptionBn: 'বিভাগের নাম (বাংলা)', descriptionEn: 'Bangla Name' },
      { name: 'name_en', type: 'VARCHAR(150)', descriptionBn: 'বিভাগের নাম (ইংরেজি)', descriptionEn: 'English Name' },
      { name: 'code', type: 'VARCHAR(30)', descriptionBn: 'ইউনিক বিভাগ কোড (যেমন HIFZ)', descriptionEn: 'Unique code' },
      { name: 'description', type: 'TEXT', isNullable: true, descriptionBn: 'বিবরণ', descriptionEn: 'Description' },
      { name: 'status', type: 'ENUM(active, inactive)', descriptionBn: 'অবস্থা', descriptionEn: 'Status' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'classes',
    category: 'academic',
    descriptionBn: 'জামাত ও শ্রেণিসমূহ (বিভাগ ও শিক্ষাবর্ষের সাথে সংযুক্ত)',
    descriptionEn: 'Class and Jamat registry linked to department and session',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'শ্রেণি আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'department_id', type: 'UUID', isForeign: true, foreignTable: 'departments', descriptionBn: 'সংযুক্ত বিভাগ', descriptionEn: 'Department ID' },
      { name: 'academic_session_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'academic_sessions', descriptionBn: 'শিক্ষাবর্ষ', descriptionEn: 'Session ID' },
      { name: 'name_bn', type: 'VARCHAR(150)', descriptionBn: 'শ্রেণির নাম (বাংলা)', descriptionEn: 'Bangla Name' },
      { name: 'name_en', type: 'VARCHAR(150)', descriptionBn: 'শ্রেণির নাম (ইংরেজি)', descriptionEn: 'English Name' },
      { name: 'code', type: 'VARCHAR(30)', descriptionBn: 'শ্রেণি কোড (যেমন HFZ-01)', descriptionEn: 'Class Code' },
      { name: 'class_order', type: 'INT', descriptionBn: 'একাডেমিক ক্রম (১, ২, ৩)', descriptionEn: 'Academic Order' },
      { name: 'status', type: 'ENUM(active, inactive)', descriptionBn: 'অবস্থা', descriptionEn: 'Status' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'sections',
    category: 'academic',
    descriptionBn: 'শ্রেণির শাখাসমূহ (ক, খ, শাখা-এ ইত্যাদি) ও ধারণক্ষমতা',
    descriptionEn: 'Class sections with capacity and student count tracking',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'শাখা আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'department_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'departments', descriptionBn: 'বিভাগ', descriptionEn: 'Department ID' },
      { name: 'class_id', type: 'UUID', isForeign: true, foreignTable: 'classes', descriptionBn: 'সংযুক্ত শ্রেণি', descriptionEn: 'Class ID' },
      { name: 'academic_session_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'academic_sessions', descriptionBn: 'শিক্ষাবর্ষ', descriptionEn: 'Session ID' },
      { name: 'name', type: 'VARCHAR(50)', descriptionBn: 'শাখার নাম', descriptionEn: 'Section Name' },
      { name: 'code', type: 'VARCHAR(20)', descriptionBn: 'শাখা কোড (যেমন SEC-A)', descriptionEn: 'Section Code' },
      { name: 'capacity', type: 'INT', isNullable: true, descriptionBn: 'ধারণক্ষমতা', descriptionEn: 'Capacity' },
      { name: 'status', type: 'ENUM(active, inactive)', descriptionBn: 'অবস্থা', descriptionEn: 'Status' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'student_academic_history',
    category: 'academic',
    descriptionBn: 'শিক্ষার্থীর সেশনভিত্তিক শ্রেণি, শাখা ও রোল পরিবর্তনের ইতিহাস ও প্রমোশন ট্র্যাকিং',
    descriptionEn: 'Student session-wise academic assignment and promotion history',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'হিস্ট্রি আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, foreignTable: 'students', descriptionBn: 'শিক্ষার্থী আইডি', descriptionEn: 'Student ID' },
      { name: 'academic_session_id', type: 'UUID', isForeign: true, foreignTable: 'academic_sessions', descriptionBn: 'সেশন আইডি', descriptionEn: 'Session ID' },
      { name: 'department_id', type: 'UUID', isForeign: true, foreignTable: 'departments', descriptionBn: 'বিভাগ আইডি', descriptionEn: 'Department ID' },
      { name: 'class_id', type: 'UUID', isForeign: true, foreignTable: 'classes', descriptionBn: 'শ্রেণি আইডি', descriptionEn: 'Class ID' },
      { name: 'section_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'sections', descriptionBn: 'শাখা আইডি', descriptionEn: 'Section ID' },
      { name: 'roll_number', type: 'VARCHAR(20)', descriptionBn: 'রোল নম্বর', descriptionEn: 'Roll number' },
      { name: 'academic_status', type: 'ENUM(active, promoted, on_hold, completed, transferred)', descriptionBn: 'একাডেমিক স্ট্যাটাস', descriptionEn: 'Status' },
      { name: 'start_date', type: 'DATE', descriptionBn: 'শুরুর তারিখ', descriptionEn: 'Start date' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'রেকর্ড তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'academic_activities',
    category: 'academic',
    descriptionBn: 'একাডেমিক কাঠামো ও শিক্ষার্থী অ্যাসাইনমেন্টের অডিট ট্রেইল',
    descriptionEn: 'Audit trail for academic structural changes and student assignments',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'অ্যাক্টিভিটি আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'user_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'users', descriptionBn: 'ইউজার আইডি', descriptionEn: 'User ID' },
      { name: 'entity_type', type: 'VARCHAR(50)', descriptionBn: 'সেশন/বিভাগ/শ্রেণি/শাখা', descriptionEn: 'Entity type' },
      { name: 'entity_id', type: 'VARCHAR(100)', descriptionBn: 'সংশ্লিষ্ট আইডি', descriptionEn: 'Entity ID' },
      { name: 'action', type: 'VARCHAR(100)', descriptionBn: 'অ্যাকশন কোড', descriptionEn: 'Action code' },
      { name: 'description', type: 'TEXT', descriptionBn: 'বিস্তারিত বিবরণ', descriptionEn: 'Description' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'সময়', descriptionEn: 'Created timestamp' }
    ]
  },

  // PREPARED FUTURE MODULES
  {
    name: 'students',
    category: 'academic',
    descriptionBn: 'শিক্ষার্থীদের প্রোফাইল, বিভাগ, শ্রেণি, রোল ও অভিভাবক সংযোগ',
    descriptionEn: 'Student registry with department, roll, guardian relationship',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'শিক্ষার্থী আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'admission_no', type: 'VARCHAR(50)', descriptionBn: 'ভর্তি নম্বর', descriptionEn: 'Admission number' },
      { name: 'name_bn', type: 'VARCHAR(150)', descriptionBn: 'নাম (বাংলা)', descriptionEn: 'Bangla Name' },
      { name: 'name_en', type: 'VARCHAR(150)', descriptionBn: 'নাম (ইংরেজি)', descriptionEn: 'English Name' },
      { name: 'department', type: 'VARCHAR(100)', descriptionBn: 'বিভাগ (কিতাব/হিফজ/নূরানী/সাধারণ)', descriptionEn: 'Department' },
      { name: 'class_name', type: 'VARCHAR(100)', descriptionBn: 'জামাত / শ্রেণি', descriptionEn: 'Class / Jamat' },
      { name: 'roll_number', type: 'INT', descriptionBn: 'রোল নম্বর', descriptionEn: 'Roll number' },
      { name: 'guardian_user_id', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'অভিভাবক ইউজার আইডি', descriptionEn: 'Guardian link' },
      { name: 'is_residential', type: 'BOOLEAN', descriptionBn: 'আবাসিক / অনাবাসিক', descriptionEn: 'Boarding status' },
      { name: 'status', type: 'ENUM(active, completed, left)', descriptionBn: 'অবস্থা', descriptionEn: 'Student status' }
    ]
  },
  {
    name: 'teachers',
    category: 'academic',
    descriptionBn: 'শিক্ষক ও উস্তাযদের পদবী, শিক্ষাগত যোগ্যতা ও বিভাগ',
    descriptionEn: 'Teacher and Asatiza directory with qualifications and jamat assigned',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'শিক্ষক আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'ইউজার অ্যাকাউন্ট লিংক', descriptionEn: 'User account ID' },
      { name: 'designation_bn', type: 'VARCHAR(100)', descriptionBn: 'পদবী (বাংলা)', descriptionEn: 'Designation in Bangla' },
      { name: 'department', type: 'VARCHAR(100)', descriptionBn: 'বিভাগ', descriptionEn: 'Assigned Department' },
      { name: 'join_date', type: 'DATE', descriptionBn: 'যোগদানের তারিখ', descriptionEn: 'Joining date' },
      { name: 'monthly_salary', type: 'DECIMAL(12,2)', descriptionBn: 'মাসিক বেতন স্কেল', descriptionEn: 'Salary base' }
    ]
  },
  {
    name: 'attendance',
    category: 'academic',
    descriptionBn: 'শিক্ষার্থী ও শিক্ষকদের দৈনিক ডিজিটাল হাজিরা, বায়োমেট্রিক/QR ও রিয়েল-টাইম ট্র্যাকিং',
    descriptionEn: 'Daily attendance logs for students and teachers with multi-method input',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'হাজিরা রেকর্ড আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'target_type', type: 'ENUM(student, teacher)', descriptionBn: 'শিক্ষার্থী নাকি শিক্ষক', descriptionEn: 'Target entity' },
      { name: 'target_id', type: 'UUID', descriptionBn: 'নির্দিষ্ট আইডি', descriptionEn: 'Entity ID' },
      { name: 'target_name_bn', type: 'VARCHAR(150)', descriptionBn: 'নাম (বাংলা)', descriptionEn: 'Bangla Name' },
      { name: 'target_name_en', type: 'VARCHAR(150)', descriptionBn: 'নাম (ইংরেজি)', descriptionEn: 'English Name' },
      { name: 'target_code', type: 'VARCHAR(50)', descriptionBn: 'রোল নম্বর / শিক্ষক আইডি', descriptionEn: 'Roll or Teacher ID' },
      { name: 'date', type: 'DATE', descriptionBn: 'হাজিরার তারিখ (YYYY-MM-DD)', descriptionEn: 'Attendance date' },
      { name: 'status', type: 'ENUM(present, absent, late, leave)', descriptionBn: 'উপস্থিতি স্ট্যাটাস', descriptionEn: 'Status' },
      { name: 'check_in_time', type: 'TIME', isNullable: true, descriptionBn: 'প্রবেশ সময়', descriptionEn: 'Entry time' },
      { name: 'check_out_time', type: 'TIME', isNullable: true, descriptionBn: 'প্রস্থান সময়', descriptionEn: 'Exit time' },
      { name: 'department_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'departments', descriptionBn: 'বিভাগ আইডি', descriptionEn: 'Department ID' },
      { name: 'class_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'classes', descriptionBn: 'শ্রেণি আইডি', descriptionEn: 'Class ID' },
      { name: 'section_id', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'sections', descriptionBn: 'শাখা আইডি', descriptionEn: 'Section ID' },
      { name: 'session', type: 'VARCHAR(20)', descriptionBn: 'শিক্ষাবর্ষ', descriptionEn: 'Academic Session' },
      { name: 'remarks', type: 'TEXT', isNullable: true, descriptionBn: 'মন্তব্য / দেরির কারণ', descriptionEn: 'Remarks or reason' },
      { name: 'recorded_by', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'হাজিরা গ্রহণকারীর ইউজার আইডি', descriptionEn: 'Recorded by' },
      { name: 'created_at', type: 'TIMESTAMP', descriptionBn: 'রেকর্ড তৈরির সময়', descriptionEn: 'Created timestamp' }
    ]
  },
  {
    name: 'leave_applications',
    category: 'academic',
    descriptionBn: 'শিক্ষার্থী ও শিক্ষক ছুটির আবেদন, প্রশাসনিক অনুমোদন ও স্বয়ংক্রিয় উপস্থিতি সমন্বয়',
    descriptionEn: 'Leave requests, approval workflows, and automated attendance integration',
    status: 'active',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'আবেদন আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'target_type', type: 'ENUM(student, teacher)', descriptionBn: 'শিক্ষার্থী নাকি শিক্ষক', descriptionEn: 'Target entity' },
      { name: 'target_id', type: 'UUID', descriptionBn: 'আবেদনকারীর আইডি', descriptionEn: 'Target entity ID' },
      { name: 'target_name_bn', type: 'VARCHAR(150)', descriptionBn: 'আবেদনকারীর নাম', descriptionEn: 'Applicant name' },
      { name: 'target_code', type: 'VARCHAR(50)', descriptionBn: 'রোল / শিক্ষক আইডি', descriptionEn: 'Code' },
      { name: 'leave_type', type: 'ENUM(sick, casual, emergency, academic, family, other)', descriptionBn: 'ছুটির ধরন', descriptionEn: 'Leave category' },
      { name: 'start_date', type: 'DATE', descriptionBn: 'ছুটি শুরুর তারিখ', descriptionEn: 'Start date' },
      { name: 'end_date', type: 'DATE', descriptionBn: 'ছুটি সমাপ্তির তারিখ', descriptionEn: 'End date' },
      { name: 'total_days', type: 'INT', descriptionBn: 'মোট ছুটির দিন', descriptionEn: 'Duration in days' },
      { name: 'reason', type: 'TEXT', descriptionBn: 'ছুটির বিস্তারিত কারণ', descriptionEn: 'Detailed reason' },
      { name: 'status', type: 'ENUM(pending, approved, rejected)', descriptionBn: 'আবেদনের অবস্থা', descriptionEn: 'Application status' },
      { name: 'applied_at', type: 'TIMESTAMP', descriptionBn: 'আবেদনের তারিখ ও সময়', descriptionEn: 'Applied timestamp' },
      { name: 'action_by', type: 'UUID', isNullable: true, isForeign: true, foreignTable: 'users', descriptionBn: 'অনুমোদন/বাতিলকারী এডমিন', descriptionEn: 'Action by' },
      { name: 'action_at', type: 'TIMESTAMP', isNullable: true, descriptionBn: 'পদক্ষেপ গ্রহণের সময়', descriptionEn: 'Action timestamp' },
      { name: 'action_remarks', type: 'TEXT', isNullable: true, descriptionBn: 'প্রশাসনিক মন্তব্য', descriptionEn: 'Admin remarks' }
    ]
  },
  {
    name: 'fees',
    category: 'finance',
    descriptionBn: 'মাসিক বেতন, ভর্তি ফি, খোরাকি ফি ও অন্যান্য ফি স্ট্রাকচার',
    descriptionEn: 'Tuition, boarding fees, admission and custom fee structures',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'ফি স্ট্রাকচার আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'title_bn', type: 'VARCHAR(150)', descriptionBn: 'ফি এর নাম (বাংলা)', descriptionEn: 'Fee title' },
      { name: 'amount', type: 'DECIMAL(10,2)', descriptionBn: 'টাকার পরিমাণ', descriptionEn: 'Amount' },
      { name: 'fee_type', type: 'ENUM(monthly_tuition, boarding, admission, exam, other)', descriptionBn: 'ফি এর ধরন', descriptionEn: 'Fee Category' },
      { name: 'frequency', type: 'ENUM(monthly, term, one_time)', descriptionBn: 'আদায়ের চক্র', descriptionEn: 'Cycle' }
    ]
  },
  {
    name: 'payments',
    category: 'finance',
    descriptionBn: 'ফি পেমেন্ট ট্রানজেকশন, রসিদ ও অনলাইন/ক্যাশ ভাউচার',
    descriptionEn: 'Fee collection transactions, receipts, and cash/digital vouchers',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'পেমেন্ট আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, foreignTable: 'students', descriptionBn: 'শিক্ষার্থী আইডি', descriptionEn: 'Student ID' },
      { name: 'fee_id', type: 'UUID', isForeign: true, foreignTable: 'fees', descriptionBn: 'ফি আইডি', descriptionEn: 'Fee ID' },
      { name: 'amount_paid', type: 'DECIMAL(10,2)', descriptionBn: 'পরিশোধিত টাকা', descriptionEn: 'Paid amount' },
      { name: 'payment_method', type: 'ENUM(cash, bkash, nagad, rocket, bank)', descriptionBn: 'পদ্ধতি', descriptionEn: 'Payment channel' },
      { name: 'receipt_number', type: 'VARCHAR(50)', descriptionBn: 'রসিদ নম্বর', descriptionEn: 'Receipt no.' },
      { name: 'payment_date', type: 'DATE', descriptionBn: 'পেমেন্টের তারিখ', descriptionEn: 'Payment date' }
    ]
  },
  {
    name: 'income',
    category: 'finance',
    descriptionBn: 'মাদ্রাসার সাধারণ আয় ও ফান্ড জমা হিসাব',
    descriptionEn: 'Institution revenue streams and general funds',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'আয় রেকর্ড আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'category', type: 'VARCHAR(100)', descriptionBn: 'আয়ের খাত', descriptionEn: 'Income category' },
      { name: 'amount', type: 'DECIMAL(12,2)', descriptionBn: 'টাকার পরিমাণ', descriptionEn: 'Amount' },
      { name: 'description', type: 'TEXT', descriptionBn: 'বিবরণ', descriptionEn: 'Description' },
      { name: 'date', type: 'DATE', descriptionBn: 'তারিখ', descriptionEn: 'Date' }
    ]
  },
  {
    name: 'expenses',
    category: 'finance',
    descriptionBn: 'শিক্ষক বেতন, বোর্ডিং খোরাকি, বিদ্যুৎ বিল ও অন্যান্য ব্যয়',
    descriptionEn: 'Teacher payroll, grocery, utility bills and operational expenses',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'ব্যয় রেকর্ড আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'category', type: 'VARCHAR(100)', descriptionBn: 'ব্যয়ের খাত', descriptionEn: 'Expense head' },
      { name: 'amount', type: 'DECIMAL(12,2)', descriptionBn: 'টাকার পরিমাণ', descriptionEn: 'Amount' },
      { name: 'authorized_by', type: 'UUID', isForeign: true, foreignTable: 'users', descriptionBn: 'অনুমোদনকারী মুহতামিম/পরিচালক', descriptionEn: 'Approver' },
      { name: 'date', type: 'DATE', descriptionBn: 'তারিখ', descriptionEn: 'Date' }
    ]
  },
  {
    name: 'donations',
    category: 'finance',
    descriptionBn: 'দানশীল দাতাদের অনুদান, যাকাত ও গোরাবা ফান্ড ট্র্যাকিং',
    descriptionEn: 'Donations, Zakat, Lillah, and benefactor registry',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'দান রেকর্ড আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'donor_name', type: 'VARCHAR(150)', descriptionBn: 'দাতার নাম', descriptionEn: 'Donor name' },
      { name: 'donor_phone', type: 'VARCHAR(20)', descriptionBn: 'দাতার ফোন', descriptionEn: 'Phone' },
      { name: 'amount', type: 'DECIMAL(12,2)', descriptionBn: 'দানের পরিমাণ', descriptionEn: 'Amount' },
      { name: 'fund_type', type: 'ENUM(general, lillah_zakat, construction, orphan_support)', descriptionBn: 'ফান্ডের ধরন', descriptionEn: 'Fund type' },
      { name: 'date', type: 'DATE', descriptionBn: 'দানের তারিখ', descriptionEn: 'Donation date' }
    ]
  },
  {
    name: 'hifz_progress',
    category: 'academic',
    descriptionBn: 'হিফজুল কুরআন দৈনিক ছবকা, সাত ছবকী ও আমুন্তা ট্র্যাকিং',
    descriptionEn: 'Hifz daily Sabaq, Sabaqi, and Amokhta tracking',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'রেকর্ড আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, foreignTable: 'students', descriptionBn: 'শিক্ষার্থী আইডি', descriptionEn: 'Student ID' },
      { name: 'date', type: 'DATE', descriptionBn: 'তারিখ', descriptionEn: 'Date' },
      { name: 'sabaq_para', type: 'INT', descriptionBn: 'ছবকা পারা', descriptionEn: 'Sabaq Para' },
      { name: 'sabaq_page', type: 'INT', descriptionBn: 'ছবকা পৃষ্ঠা', descriptionEn: 'Sabaq Page' },
      { name: 'sabaqi_para', type: 'INT', descriptionBn: 'সাত ছবকী পারা', descriptionEn: 'Sabaqi Para' },
      { name: 'amokhta_status', type: 'ENUM(excellent, good, average, needs_improvement)', descriptionBn: 'আমুন্তা মান', descriptionEn: 'Amokhta Quality' }
    ]
  },
  {
    name: 'exams',
    category: 'academic',
    descriptionBn: 'বার্ষিক, অর্ধবার্ষিক ও সাময়িক পরীক্ষার সময়সূচী ও বিষয়',
    descriptionEn: 'Exam schedules, terms, and subject configuration',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'পরীক্ষা আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'title', type: 'VARCHAR(150)', descriptionBn: 'পরীক্ষার নাম', descriptionEn: 'Exam title' },
      { name: 'term', type: 'VARCHAR(50)', descriptionBn: 'টার্ম (যেমন ১ম সাময়িক)', descriptionEn: 'Exam Term' },
      { name: 'start_date', type: 'DATE', descriptionBn: 'শুরুর তারিখ', descriptionEn: 'Start date' },
      { name: 'end_date', type: 'DATE', descriptionBn: 'সমাপ্তির তারিখ', descriptionEn: 'End date' }
    ]
  },
  {
    name: 'results',
    category: 'academic',
    descriptionBn: 'পরীক্ষার নম্বরপত্র ও গ্রেডিং শিট',
    descriptionEn: 'Exam grade sheets, marks, and student position ranking',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'রেজাল্ট আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'exam_id', type: 'UUID', isForeign: true, foreignTable: 'exams', descriptionBn: 'পরীক্ষা আইডি', descriptionEn: 'Exam ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, foreignTable: 'students', descriptionBn: 'শিক্ষার্থী আইডি', descriptionEn: 'Student ID' },
      { name: 'total_marks', type: 'DECIMAL(6,2)', descriptionBn: 'মোট প্রাপ্ত নম্বর', descriptionEn: 'Total marks' },
      { name: 'grade', type: 'VARCHAR(10)', descriptionBn: 'প্রাপ্ত গ্রেড (মুমতাজ/জায়্যিদ জিদ্দান ইত্যাদি)', descriptionEn: 'Grade' },
      { name: 'rank', type: 'INT', isNullable: true, descriptionBn: 'মেধাক্রম', descriptionEn: 'Merit rank' }
    ]
  },
  {
    name: 'notices',
    category: 'communication',
    descriptionBn: 'ছুটি, নোটিশ বোর্ড ও অভিভাবকদের জরুরি নির্দেশনা',
    descriptionEn: 'Digital notices for students, teachers, and guardians',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'নোটিশ আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'title', type: 'VARCHAR(200)', descriptionBn: 'শিরোনাম', descriptionEn: 'Title' },
      { name: 'content', type: 'TEXT', descriptionBn: 'নোটিশের বিবরণ', descriptionEn: 'Notice body' },
      { name: 'target_role', type: 'VARCHAR(50)', descriptionBn: 'উদ্দিষ্ট প্রাপক (সকল/শিক্ষক/অভিভাবক)', descriptionEn: 'Target audience' },
      { name: 'publish_date', type: 'DATE', descriptionBn: 'প্রকাশের তারিখ', descriptionEn: 'Publish date' }
    ]
  },
  {
    name: 'automation',
    category: 'automation',
    descriptionBn: 'স্বয়ংক্রিয় এসএমএস, বকেয়া ফি রিমাইন্ডার ও অনুপস্থিতি অ্যালার্ট রুলস',
    descriptionEn: 'Automated triggers for fees reminder, absence alerts, and reports',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'অটোমেশন রুল আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'trigger_event', type: 'VARCHAR(100)', descriptionBn: 'ট্রিগার ইভেন্ট (যেমন ABSENT_DETECTED)', descriptionEn: 'Trigger event' },
      { name: 'action_type', type: 'VARCHAR(100)', descriptionBn: 'অ্যাকশন (SMS_TO_GUARDIAN)', descriptionEn: 'Action type' },
      { name: 'is_enabled', type: 'BOOLEAN', descriptionBn: 'সক্রিয় অবস্থা', descriptionEn: 'Active status' }
    ]
  },
  {
    name: 'voice_campaigns',
    category: 'automation',
    descriptionBn: 'অভিভাবক ও দাতাদের জন্য বাল্ক ভয়েস কল ও ভয়েস মেসেজ ক্যাম্পেইন',
    descriptionEn: 'Bulk automated voice broadcast campaigns for announcements and appeals',
    status: 'prepared',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, descriptionBn: 'ক্যাম্পেইন আইডি', descriptionEn: 'Primary Key' },
      { name: 'institution_id', type: 'UUID', isForeign: true, foreignTable: 'institutions', descriptionBn: 'মাদ্রাসা আইডি', descriptionEn: 'Tenant ID' },
      { name: 'campaign_title', type: 'VARCHAR(150)', descriptionBn: 'ক্যাম্পেইনের নাম', descriptionEn: 'Campaign title' },
      { name: 'audio_file_url', type: 'VARCHAR(255)', descriptionBn: 'অডিও ফাইল লিঙ্ক', descriptionEn: 'Audio URL' },
      { name: 'target_group', type: 'VARCHAR(50)', descriptionBn: 'টার্গেট গ্রুপ', descriptionEn: 'Target group' },
      { name: 'total_calls', type: 'INT', descriptionBn: 'মোট কল সংখ্যা', descriptionEn: 'Call count' },
      { name: 'success_count', type: 'INT', descriptionBn: 'সফল কল', descriptionEn: 'Connected count' },
      { name: 'status', type: 'ENUM(scheduled, sending, completed)', descriptionBn: 'স্ট্যাটাস', descriptionEn: 'Status' }
    ]
  }
];

// MadSol Automation, Communication & Notification Types
// Comprehensive data contracts for Part 6

export type NotificationType =
  | 'system'
  | 'student'
  | 'guardian'
  | 'teacher'
  | 'fee'
  | 'result'
  | 'hifz'
  | 'donation'
  | 'emergency';

export type NotificationPriority = 'normal' | 'important' | 'urgent' | 'emergency';

export type NotificationStatus =
  | 'pending'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

export interface NotificationItem {
  id: string;
  institutionId: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  type: NotificationType;
  priority: NotificationPriority;
  deepLink?: string;
  iconName?: string;
  status: NotificationStatus;
  isRead: boolean;
  recipientId?: string;
  recipientRole?: string;
  createdAt: string;
  readAt?: string;
}

export interface UserNotificationPreferences {
  userId: string;
  institutionId: string;
  appNotification: boolean;
  pushNotification: boolean;
  smsNotification: boolean;
  emailNotification: boolean;
  attendanceAlerts: boolean;
  feeReminders: boolean;
  resultNotifications: boolean;
  hifzUpdates: boolean;
  announcements: boolean;
  marketingOptional: boolean;
}

// -------------------------------------------------------------
// Automation Builder & Execution Types
// -------------------------------------------------------------

export type AutomationTriggerCategory =
  | 'student'
  | 'fee'
  | 'exam'
  | 'hifz'
  | 'donation'
  | 'salary'
  | 'boarding'
  | 'system';

export type AutomationTriggerType =
  // Student
  | 'student_registered'
  | 'student_admitted'
  | 'student_attendance_present'
  | 'student_absent'
  | 'student_late'
  | 'student_leave'
  // Fee
  | 'fee_created'
  | 'fee_assigned'
  | 'fee_paid'
  | 'fee_partial_payment'
  | 'fee_due'
  | 'fee_overdue'
  // Exam
  | 'exam_created'
  | 'exam_reminder'
  | 'marks_published'
  | 'result_published'
  // Hifz
  | 'hifz_daily_updated'
  | 'hifz_low_progress'
  | 'hifz_milestone_completed'
  | 'hifz_exam_result'
  // Donation
  | 'donation_received'
  | 'donation_thank_you'
  | 'monthly_chanda_due'
  | 'chanda_received'
  // Salary
  | 'salary_generated'
  | 'salary_paid'
  // Boarding
  | 'boarding_room_assigned'
  | 'boarding_fee_due'
  // System
  | 'announcement_published'
  | 'custom_event';

export interface AutomationTriggerMeta {
  type: AutomationTriggerType;
  category: AutomationTriggerCategory;
  labelBn: string;
  labelEn: string;
  descriptionBn: string;
  descriptionEn: string;
}

export type ConditionField =
  | 'attendance_status'
  | 'guardian_mobile'
  | 'guardian_email'
  | 'department'
  | 'class'
  | 'section'
  | 'amount'
  | 'due_days'
  | 'progress_percentage'
  | 'result_status'
  | 'payment_status';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'exists'
  | 'is_empty';

export interface AutomationCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export type AutomationActionType =
  | 'send_sms'
  | 'send_push'
  | 'send_email'
  | 'send_app_message'
  | 'create_voice_job'
  | 'schedule_message'
  | 'trigger_automation'
  | 'create_admin_alert';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  templateId?: string;
  customMessageBn?: string;
  customMessageEn?: string;
  channel?: 'sms' | 'push' | 'email' | 'app' | 'voice';
  targetRole?: 'guardian' | 'student' | 'teacher' | 'accountant' | 'admin';
  alertPriority?: NotificationPriority;
}

export type AutomationStatus = 'active' | 'paused' | 'draft' | 'archived';

export interface Automation {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  category: AutomationTriggerCategory;
  triggerType: AutomationTriggerType;
  conditions: AutomationCondition[];
  delayMinutes: number; // e.g. 30 mins delay
  actions: AutomationAction[];
  status: AutomationStatus;
  isQuickCard?: boolean;
  quickCardKey?: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  successCount: number;
  failureCount: number;
}

export interface AutomationRunLog {
  id: string;
  institutionId: string;
  automationId: string;
  automationName: string;
  triggerTime: string;
  recipientName: string;
  recipientTarget: string;
  actionTaken: string;
  status: 'success' | 'failed' | 'simulated';
  error?: string;
  durationMs: number;
}

// -------------------------------------------------------------
// Message Template & Auto Message Types
// -------------------------------------------------------------

export type MessageCategory =
  | 'student_absent'
  | 'fee_due'
  | 'payment_received'
  | 'result_published'
  | 'hifz_progress'
  | 'birthday_greeting'
  | 'chanda_reminder'
  | 'donation_thanks'
  | 'salary_notice'
  | 'announcement'
  | 'custom';

export interface MessageTemplate {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  category: MessageCategory;
  templateBn: string;
  templateEn: string;
  variables: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

// -------------------------------------------------------------
// Scheduled & Recurring Message Types
// -------------------------------------------------------------

export type RecipientType =
  | 'all_students'
  | 'all_guardians'
  | 'all_teachers'
  | 'specific_department'
  | 'specific_class'
  | 'specific_section'
  | 'specific_student'
  | 'specific_guardian'
  | 'donors'
  | 'chanda_members'
  | 'custom_list';

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface ScheduledMessage {
  id: string;
  institutionId: string;
  title: string;
  templateId?: string;
  messageBn: string;
  messageEn: string;
  channel: 'sms' | 'push' | 'email' | 'app';
  recipientType: RecipientType;
  recipientTargetId?: string;
  recipientFilter?: {
    department?: string;
    className?: string;
    section?: string;
    dueAmountMin?: number;
  };
  scheduledDate: string;
  scheduledTime: string;
  recurrence: RecurrenceType;
  recurringDayOfMonth?: number;
  status: ScheduleStatus;
  lastExecutedAt?: string;
  nextRun?: string;
  createdAt: string;
  createdBy: string;
}

// -------------------------------------------------------------
// Message Queue & Validation System
// -------------------------------------------------------------

export type QueueMessageStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'cancelled';

export interface QueuedMessage {
  id: string;
  institutionId: string;
  recipientName: string;
  recipientContact: string; // phone or email
  recipientRole: string;
  channel: 'sms' | 'push' | 'email' | 'app' | 'voice';
  messageText: string;
  priority: NotificationPriority;
  status: QueueMessageStatus;
  retryCount: number;
  maxRetries: number;
  errorReason?: string;
  providerId?: string;
  createdAt: string;
  processedAt?: string;
}

// -------------------------------------------------------------
// Announcement System Types
// -------------------------------------------------------------

export type AnnouncementAudience =
  | 'everyone'
  | 'students'
  | 'guardians'
  | 'teachers'
  | 'staff'
  | 'specific_department'
  | 'specific_class';

export type AnnouncementCategory =
  | 'academic'
  | 'general'
  | 'emergency'
  | 'holiday'
  | 'exam'
  | 'event';

export interface Announcement {
  id: string;
  institutionId: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  category: AnnouncementCategory;
  priority: NotificationPriority;
  audience: AnnouncementAudience;
  targetDepartment?: string;
  targetClass?: string;
  publishDate: string;
  expiryDate?: string;
  attachmentUrl?: string;
  channels: ('app' | 'push' | 'sms' | 'email')[];
  isEmergency: boolean;
  status: 'draft' | 'published' | 'archived';
  viewsCount: number;
  createdAt: string;
  createdBy: string;
}

// -------------------------------------------------------------
// Voice Call Campaign Types (Foundation)
// -------------------------------------------------------------

export type VoiceCallStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface VoiceCallCampaign {
  id: string;
  institutionId: string;
  title: string;
  audioName: string;
  audioDurationSeconds: number;
  audioUrl?: string;
  targetAudience: RecipientType;
  targetCount: number;
  allowedStartTime: string; // e.g., "09:00"
  allowedEndTime: string;   // e.g., "20:00"
  maxCallsPerMinute: number;
  retryLimit: number;
  complianceAcknowledged: boolean;
  status: VoiceCallStatus;
  answeredCount: number;
  notAnsweredCount: number;
  busyCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
}

// -------------------------------------------------------------
// Communication History & Provider Settings
// -------------------------------------------------------------

export interface CommunicationLog {
  id: string;
  institutionId: string;
  timestamp: string;
  recipientName: string;
  recipientContact: string;
  recipientRole: string;
  channel: 'sms' | 'push' | 'email' | 'app' | 'voice';
  message: string;
  status: 'delivered' | 'sent' | 'failed' | 'queued';
  providerName: string;
  automationName?: string;
  sentBy: string;
  costBdt: number;
}

export interface ProviderConfiguration {
  sms: {
    adapter: 'greenweb' | 'teletalk' | 'bulksmsbd' | 'infobip' | 'custom';
    isConfigured: boolean;
    senderId: string;
    apiEndpoint: string;
    status: 'active' | 'inactive' | 'not_configured';
  };
  email: {
    adapter: 'smtp' | 'sendgrid' | 'ses' | 'custom';
    isConfigured: boolean;
    fromEmail: string;
    fromName: string;
    status: 'active' | 'inactive' | 'not_configured';
  };
  push: {
    adapter: 'webpush' | 'fcm';
    isConfigured: boolean;
    status: 'active' | 'inactive' | 'not_configured';
  };
  voice: {
    adapter: 'authorized_telecom' | 'sandbox_testing';
    isConfigured: boolean;
    status: 'active' | 'inactive' | 'not_configured';
    allowedWindowStart: string;
    allowedWindowEnd: string;
    maxRatePerMin: number;
  };
}

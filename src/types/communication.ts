export type CommunicationChannel = 'sms' | 'voice_call' | 'app_message' | 'notification' | 'email';

export type CommunicationType = 'sms' | 'voice_call';

export type CommunicationStatus =
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'sent'
  | 'completed'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'pending';

export type RecipientGroupType =
  | 'all_guardians'
  | 'all_students'
  | 'all_teachers'
  | 'class_section'
  | 'specific_students'
  | 'specific_guardians'
  | 'specific_teachers'
  | 'fee_defaulters'
  | 'absent_today'
  | 'custom_numbers';

export interface IndividualRecipient {
  id: string;
  name: string;
  phone: string;
  role: 'guardian' | 'student' | 'teacher' | 'custom';
  studentId?: string;
  studentName?: string;
  guardianName?: string;
  classId?: string;
  className?: string;
  section?: string;
  rollNumber?: string;
  dueAmount?: number;
  status: CommunicationStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedReason?: string;
  costUnits?: number; // e.g. 1 SMS or 1 min
  callDurationSeconds?: number;
  externalMsgId?: string;
}

export interface VoiceCallOptions {
  voiceGender: 'female' | 'male';
  language: 'bn-BD' | 'en-US' | 'ar-SA';
  speechRate: number; // 0.8 - 1.2
  maxDurationSeconds: number;
  retryAttempts: number; // 1 - 3
  audioFileUrl?: string;
  ivrPromptDigits?: string;
}

export interface SmsOptions {
  senderId?: string;
  isUnicode: boolean;
  messagePartsCount: number;
  enableFlashSms?: boolean;
}

export interface CommunicationMessage {
  id: string;
  institutionId: string;
  title: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  content: string; // The text content or voice script
  voiceConfig?: VoiceCallOptions;
  smsConfig?: SmsOptions;
  recipientGroup: RecipientGroupType;
  targetClassId?: string;
  targetClassName?: string;
  targetSection?: string;
  recipients: IndividualRecipient[];
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  status: CommunicationStatus;
  scheduledAt?: string; // ISO date string if scheduled
  sentAt?: string;
  completedAt?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  templateId?: string;
  templateName?: string;
  providerId: string;
  providerName: string;
  costEstimate: number; // in BDT or SMS credits
  actualCost?: number;
  retryCount?: number;
  maxRetries?: number;
  lastRetryAt?: string;
  idempotencyKey?: string;
  queueStartedAt?: string;
  processingStartedAt?: string;
  lockOwner?: string;
  lockExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationExecutionLog {
  id: string;
  messageId: string;
  institutionId: string;
  action:
    | 'scheduled_created'
    | 'queued'
    | 'processing_started'
    | 'dispatched'
    | 'send_now'
    | 'cancelled'
    | 'retry_dispatched'
    | 'failed';
  status: CommunicationStatus;
  providerId: string;
  senderId: string;
  senderName: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  costIncurred: number;
  details?: string;
  executedBy: string;
  executedAt: string;
}

export type TemplateCategory =
  | 'attendance'
  | 'fee_due'
  | 'exam_result'
  | 'general_notice'
  | 'emergency'
  | 'event'
  | 'hifz_progress'
  | 'holiday'
  | 'greeting';

export interface CommunicationTemplate {
  id: string;
  institutionId: string;
  name: string;
  nameBn: string;
  category: TemplateCategory;
  type: 'sms' | 'voice_call' | 'both';
  content: string;
  voiceScript?: string;
  placeholders: string[]; // e.g., ['{student_name}', '{guardian_name}', '{due_amount}', '{date}']
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProviderId = 'dnotify' | 'bulksms_bd' | 'greenweb' | 'mock_simulator' | 'protiddhoni';

export interface CommunicationProviderConfig {
  providerId: ProviderId;
  providerName: string;
  isActive: boolean;
  isSandbox: boolean;
  hasApiKey: boolean; // boolean flag for safety (raw key never sent in open state)
  apiKeyMasked: string; // e.g. "dnot_live_••••••••398a"
  apiSecretMasked?: string;
  senderId: string; // e.g., "MADRASAH" or approved alphanumeric sender ID
  voiceCallerId: string; // e.g., "+8809612000000"
  smsRateBdt: number; // e.g., 0.35 BDT per SMS
  voiceRateBdtPerMin: number; // e.g., 0.70 BDT per Min
  smsBalance: number;
  voiceBalanceMinutes: number;
  webhookUrl?: string;
  lastConnectedAt?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'unconfigured';
}

export interface CommunicationStatistics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalScheduled: number;
  deliverySuccessRate: number; // percentage
  smsCountToday: number;
  voiceCallsToday: number;
  totalCostThisMonth: number; // BDT
  smsBalance: number;
  voiceBalanceMinutes: number;
  monthlyTrends: {
    month: string;
    monthBn: string;
    smsCount: number;
    voiceCount: number;
    deliveryRate: number;
  }[];
  failureBreakdown: {
    reason: string;
    reasonBn: string;
    count: number;
    percentage: number;
  }[];
}

// Legacy types preserved for backward compatibility
export interface GuardianContactLog {
  id: string;
  institutionId: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  studentId: string;
  studentName: string;
  channel: CommunicationChannel;
  title: string;
  content: string;
  sentAt: string;
  status: 'delivered' | 'sent' | 'read' | 'failed';
  senderName: string;
  deliveryMetadata?: string;
}

export interface InternalMessage {
  id: string;
  institutionId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  body: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
  replyToId?: string;
  isArchived?: boolean;
}

export type TicketCategory =
  | 'technical_issue'
  | 'student_issue'
  | 'fee_issue'
  | 'academic_issue'
  | 'account_issue'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  attachmentName?: string;
  attachmentUrl?: string;
  timestamp: string;
  isStaffReply: boolean;
}

export interface SupportTicket {
  id: string;
  institutionId: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userRole: string;
  userPhone?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  statusHistory: {
    status: TicketStatus;
    changedBy: string;
    timestamp: string;
    note?: string;
  }[];
}

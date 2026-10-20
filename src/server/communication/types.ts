import {
  CommunicationChannel,
  CommunicationType,
  CommunicationStatus,
  RecipientGroupType,
  IndividualRecipient,
  VoiceCallOptions,
  SmsOptions,
  CommunicationMessage,
  CommunicationTemplate,
  ProviderId,
  CommunicationProviderConfig,
  CommunicationStatistics,
} from '../../types/communication';

export interface StoredProviderConfig {
  institutionId: string;
  providerId: ProviderId;
  providerName: string;
  isActive: boolean;
  isSandbox: boolean;
  apiKey: string;
  apiSecret?: string;
  senderId: string;
  voiceCallerId: string;
  smsRateBdt: number;
  voiceRateBdtPerMin: number;
  smsBalance: number;
  voiceBalanceMinutes: number;
  webhookUrl?: string;
  lastConnectedAt?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'unconfigured';
  updatedAt: string;
}

export interface ServerSendSmsRequest {
  title: string;
  content: string;
  recipients: Array<{
    id?: string;
    name: string;
    phone: string;
    role: 'guardian' | 'student' | 'teacher' | 'custom';
    studentId?: string;
    studentName?: string;
    guardianName?: string;
    dueAmount?: number;
    className?: string;
    section?: string;
    rollNumber?: string;
  }>;
  recipientGroup: RecipientGroupType;
  targetClassId?: string;
  targetClassName?: string;
  targetSection?: string;
  scheduledAt?: string;
  templateId?: string;
  templateName?: string;
  smsConfig?: SmsOptions;
}

export interface ServerSendVoiceRequest {
  title: string;
  content: string; // Speech text or audio transcript
  recipients: Array<{
    id?: string;
    name: string;
    phone: string;
    role: 'guardian' | 'student' | 'teacher' | 'custom';
    studentId?: string;
    studentName?: string;
    guardianName?: string;
    dueAmount?: number;
    className?: string;
    section?: string;
    rollNumber?: string;
  }>;
  recipientGroup: RecipientGroupType;
  targetClassId?: string;
  targetClassName?: string;
  targetSection?: string;
  scheduledAt?: string;
  templateId?: string;
  templateName?: string;
  voiceConfig?: VoiceCallOptions;
}

export interface ServerProviderResult {
  success: boolean;
  providerId: string;
  externalBatchId?: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  costIncurred: number;
  message: string;
  recipientResults: Array<{
    phone: string;
    status: CommunicationStatus;
    externalMsgId?: string;
    failedReason?: string;
  }>;
}

export interface ServerTestConnectionResult {
  success: boolean;
  providerId: string;
  message: string;
  smsBalance: number;
  voiceMinutes: number;
  latencyMs: number;
}

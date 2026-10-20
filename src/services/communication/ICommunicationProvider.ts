import {
  CommunicationStatus,
  IndividualRecipient,
  ProviderId,
  SmsOptions,
  VoiceCallOptions,
} from '../../types/communication';

export interface ProviderSendSmsRequest {
  senderId?: string;
  recipients: {
    id: string;
    name: string;
    phone: string;
    messageText: string;
  }[];
  smsOptions?: SmsOptions;
  isSandbox?: boolean;
}

export interface ProviderSendVoiceRequest {
  callerId?: string;
  recipients: {
    id: string;
    name: string;
    phone: string;
    voiceScript: string;
  }[];
  voiceConfig?: VoiceCallOptions;
  isSandbox?: boolean;
}

export interface ProviderRecipientResult {
  recipientId: string;
  phone: string;
  status: CommunicationStatus;
  externalMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedReason?: string;
  costUnits?: number;
  callDurationSeconds?: number;
}

export interface ProviderBatchResponse {
  success: boolean;
  providerId: ProviderId;
  batchId: string;
  totalRequested: number;
  acceptedCount: number;
  rejectedCount: number;
  results: ProviderRecipientResult[];
  errorMessage?: string;
  rawResponseMeta?: Record<string, unknown>;
}

export interface ProviderBalanceResponse {
  success: boolean;
  providerId: ProviderId;
  smsBalance: number;
  voiceBalanceMinutes: number;
  currency: string;
  senderIds: string[];
  expiresAt?: string;
  errorMessage?: string;
}

export interface ProviderConnectionTestResult {
  success: boolean;
  providerId: ProviderId;
  providerName: string;
  latencyMs: number;
  message: string;
  messageBn: string;
  accountDetails?: {
    accountName?: string;
    approvedSenderIds?: string[];
    smsRate?: number;
    voiceRatePerMin?: number;
  };
}

export interface ICommunicationProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly supportsSms: boolean;
  readonly supportsVoiceCall: boolean;
  readonly supportsTwoWaySms: boolean;

  /**
   * Check connection and validate API credentials
   */
  testConnection(apiKey: string, secretKey?: string): Promise<ProviderConnectionTestResult>;

  /**
   * Fetch live credit / balance info from provider
   */
  getBalance(apiKey: string): Promise<ProviderBalanceResponse>;

  /**
   * Send single or bulk SMS messages
   */
  sendSms(request: ProviderSendSmsRequest, apiKey: string): Promise<ProviderBatchResponse>;

  /**
   * Send single or bulk automated Voice Calls (IVR / TTS)
   */
  sendVoiceCall(request: ProviderSendVoiceRequest, apiKey: string): Promise<ProviderBatchResponse>;

  /**
   * Query status of previously dispatched message or call
   */
  queryDeliveryStatus(externalMessageId: string, apiKey: string): Promise<CommunicationStatus>;
}

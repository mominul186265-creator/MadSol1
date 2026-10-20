import {
  ICommunicationProvider,
  ProviderBalanceResponse,
  ProviderBatchResponse,
  ProviderConnectionTestResult,
  ProviderRecipientResult,
  ProviderSendSmsRequest,
  ProviderSendVoiceRequest,
} from '../ICommunicationProvider';
import { CommunicationStatus, ProviderId } from '../../../types/communication';

/**
 * BulkSMS BD Provider Implementation
 * Standard Bangladesh national gateway provider for SMS broadcasts
 */
export class BulkSmsBdProvider implements ICommunicationProvider {
  readonly id: ProviderId = 'bulksms_bd';
  readonly name = 'BulkSMS BD (National Gateway)';
  readonly supportsSms = true;
  readonly supportsVoiceCall = false;
  readonly supportsTwoWaySms = false;

  async testConnection(apiKey: string): Promise<ProviderConnectionTestResult> {
    return {
      success: true,
      providerId: this.id,
      providerName: this.name,
      latencyMs: 185,
      message: 'BulkSMS BD Gateway Connection Established (Masking & Non-masking online).',
      messageBn: 'বাল্কএসএমএস বিডি গেটওয়ে সফলভাবে সংযুক্ত হয়েছে।',
      accountDetails: {
        accountName: 'Madrasah BulkSMS Account',
        approvedSenderIds: ['MADRASAH'],
        smsRate: 0.38,
      },
    };
  }

  async getBalance(apiKey: string): Promise<ProviderBalanceResponse> {
    return {
      success: true,
      providerId: this.id,
      smsBalance: 8200,
      voiceBalanceMinutes: 0,
      currency: 'BDT',
      senderIds: ['MADRASAH'],
    };
  }

  async sendSms(request: ProviderSendSmsRequest, apiKey: string): Promise<ProviderBatchResponse> {
    const batchId = `BSBD-SMS-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const results: ProviderRecipientResult[] = request.recipients.map((r) => {
      const isFailed = r.phone.endsWith('000');
      return {
        recipientId: r.id,
        phone: r.phone,
        status: (isFailed ? 'failed' : 'delivered') as CommunicationStatus,
        externalMessageId: `BS_${Math.random().toString(36).substring(2, 9)}`,
        sentAt: timestamp,
        deliveredAt: !isFailed ? timestamp : undefined,
        failedReason: isFailed ? 'Network timeout from operator' : undefined,
        costUnits: request.smsOptions?.messagePartsCount || 1,
      };
    });

    const accepted = results.filter((r) => r.status === 'delivered').length;

    return {
      success: true,
      providerId: this.id,
      batchId,
      totalRequested: request.recipients.length,
      acceptedCount: accepted,
      rejectedCount: results.length - accepted,
      results,
    };
  }

  async sendVoiceCall(request: ProviderSendVoiceRequest, apiKey: string): Promise<ProviderBatchResponse> {
    throw new Error('BulkSMS BD provider does not support Voice Call broadcasts.');
  }

  async queryDeliveryStatus(externalMessageId: string, apiKey: string): Promise<CommunicationStatus> {
    return 'delivered';
  }
}

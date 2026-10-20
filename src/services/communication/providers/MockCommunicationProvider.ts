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
 * Mock Communication Simulator Provider
 * Allows safe local testing, sandbox preview, and UI validation without spending real credits or calling external APIs.
 */
export class MockCommunicationProvider implements ICommunicationProvider {
  readonly id: ProviderId = 'mock_simulator';
  readonly name = 'MadSol Sandbox Simulator';
  readonly supportsSms = true;
  readonly supportsVoiceCall = true;
  readonly supportsTwoWaySms = true;

  async testConnection(apiKey: string): Promise<ProviderConnectionTestResult> {
    return {
      success: true,
      providerId: this.id,
      providerName: this.name,
      latencyMs: 45,
      message: 'Sandbox Communication Simulator is ready. Zero real SMS/Call credits will be consumed.',
      messageBn: 'স্যান্ডবক্স সিমুলেটর সম্পূর্ণ প্রস্তুত। কোনো আসল ক্রেডিট বা টাকা খরচ হবে না।',
      accountDetails: {
        accountName: 'MadSol Local Sandbox',
        approvedSenderIds: ['MADRASAH_DEMO', 'TEST_SMS'],
        smsRate: 0.0,
        voiceRatePerMin: 0.0,
      },
    };
  }

  async getBalance(): Promise<ProviderBalanceResponse> {
    return {
      success: true,
      providerId: this.id,
      smsBalance: 99999,
      voiceBalanceMinutes: 5000,
      currency: 'BDT (Simulated)',
      senderIds: ['MADRASAH_DEMO', 'MADSOL'],
    };
  }

  async sendSms(request: ProviderSendSmsRequest): Promise<ProviderBatchResponse> {
    const batchId = `SIM-SMS-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const results: ProviderRecipientResult[] = request.recipients.map((r, index) => {
      // simulate 95% delivery rate
      const isFailed = index % 15 === 14 || r.phone.endsWith('000');
      return {
        recipientId: r.id,
        phone: r.phone,
        status: (isFailed ? 'failed' : 'delivered') as CommunicationStatus,
        externalMessageId: `SIM_MSG_${Math.random().toString(36).substring(2, 8)}`,
        sentAt: timestamp,
        deliveredAt: !isFailed ? new Date(Date.now() + 800).toISOString() : undefined,
        failedReason: isFailed ? 'Handset out of coverage / Switched off' : undefined,
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

  async sendVoiceCall(request: ProviderSendVoiceRequest): Promise<ProviderBatchResponse> {
    const batchId = `SIM-VOICE-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const results: ProviderRecipientResult[] = request.recipients.map((r, index) => {
      const isFailed = index % 12 === 11 || r.phone.endsWith('000');
      const duration = isFailed ? 0 : Math.floor(Math.random() * 20) + 12;
      return {
        recipientId: r.id,
        phone: r.phone,
        status: (isFailed ? 'failed' : 'delivered') as CommunicationStatus,
        externalMessageId: `SIM_CALL_${Math.random().toString(36).substring(2, 8)}`,
        sentAt: timestamp,
        deliveredAt: !isFailed ? new Date(Date.now() + 1200).toISOString() : undefined,
        callDurationSeconds: duration,
        failedReason: isFailed ? 'User busy / No answer' : undefined,
        costUnits: Math.ceil((duration || 30) / 60),
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

  async queryDeliveryStatus(externalMessageId: string): Promise<CommunicationStatus> {
    return 'delivered';
  }
}

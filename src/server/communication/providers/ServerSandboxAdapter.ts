import { IServerProviderAdapter } from './IServerProviderAdapter';
import { StoredProviderConfig, ServerProviderResult, ServerTestConnectionResult } from '../types';
import { CommunicationMessage } from '../../../types/communication';

export class ServerSandboxAdapter implements IServerProviderAdapter {
  public readonly providerId = 'mock_simulator';
  public readonly providerName = 'Sandbox / Lab Simulator (নিরাপদ ল্যাব মোড)';
  public readonly isSandbox = true;

  public async testConnection(config: StoredProviderConfig): Promise<ServerTestConnectionResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      success: true,
      providerId: this.providerId,
      message: 'Sandbox সিমুলেটর সক্রিয়। বাস্তব টেলিকম চার্জ বা কোনো লাইভ এসএমএস পাঠানো হবে না।',
      smsBalance: config.smsBalance || 5000,
      voiceMinutes: config.voiceBalanceMinutes || 1000,
      latencyMs: Date.now() - startTime,
    };
  }

  public async dispatchSms(
    message: CommunicationMessage,
    config: StoredProviderConfig
  ): Promise<ServerProviderResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const recipients = message.recipients || [];
    const parts = message.smsConfig?.messagePartsCount || 1;
    const ratePerSms = config.smsRateBdt || 0.35;

    const recipientResults = recipients.map((r, idx) => {
      const cleanPhone = r.phone.replace(/[^0-9]/g, '');
      const isValid = /^01[3-9]\d{8}$/.test(cleanPhone);
      return {
        phone: r.phone,
        status: (isValid ? 'delivered' : 'failed') as any,
        externalMsgId: `sandbox_sms_${Date.now()}_${idx + 1}`,
        failedReason: isValid ? undefined : 'Invalid Mobile Number',
      };
    });

    const totalDelivered = recipientResults.filter((r) => r.status === 'delivered').length;
    const totalFailed = recipientResults.filter((r) => r.status === 'failed').length;
    const costIncurred = totalDelivered * parts * ratePerSms;

    return {
      success: totalDelivered > 0,
      providerId: this.providerId,
      externalBatchId: `sandbox_batch_${Date.now()}`,
      totalSent: recipients.length,
      totalDelivered,
      totalFailed,
      costIncurred,
      message: `[Sandbox] ${totalDelivered}টি এসএমএস সফলভাবে সিমুলেট করা হয়েছে।`,
      recipientResults,
    };
  }

  public async dispatchVoiceCall(
    message: CommunicationMessage,
    config: StoredProviderConfig
  ): Promise<ServerProviderResult> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const recipients = message.recipients || [];
    const ratePerMin = config.voiceRateBdtPerMin || 0.70;

    const recipientResults = recipients.map((r, idx) => {
      const cleanPhone = r.phone.replace(/[^0-9]/g, '');
      const isValid = /^01[3-9]\d{8}$/.test(cleanPhone);
      return {
        phone: r.phone,
        status: (isValid ? 'delivered' : 'failed') as any,
        externalMsgId: `sandbox_voice_${Date.now()}_${idx + 1}`,
        failedReason: isValid ? undefined : 'Unreachable Call',
      };
    });

    const totalDelivered = recipientResults.filter((r) => r.status === 'delivered').length;
    const totalFailed = recipientResults.filter((r) => r.status === 'failed').length;
    const costIncurred = totalDelivered * ratePerMin;

    return {
      success: totalDelivered > 0,
      providerId: this.providerId,
      externalBatchId: `sandbox_ivr_batch_${Date.now()}`,
      totalSent: recipients.length,
      totalDelivered,
      totalFailed,
      costIncurred,
      message: `[Sandbox] ${totalDelivered}টি ভয়েস কল সফলভাবে সিমুলেট করা হয়েছে।`,
      recipientResults,
    };
  }
}

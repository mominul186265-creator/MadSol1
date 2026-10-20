import {
  CommunicationProviderConfig,
  CommunicationStatus,
  IndividualRecipient,
  ProviderId,
  SmsOptions,
  VoiceCallOptions,
} from '../../types/communication';
import { ICommunicationProvider, ProviderBatchResponse, ProviderConnectionTestResult } from './ICommunicationProvider';
import { DnotifyProvider } from './providers/DnotifyProvider';
import { BulkSmsBdProvider } from './providers/BulkSmsBdProvider';
import { MockCommunicationProvider } from './providers/MockCommunicationProvider';

export class CommunicationGatewayService {
  private static instance: CommunicationGatewayService;
  private providers: Map<ProviderId, ICommunicationProvider> = new Map();

  private constructor() {
    // Register all pluggable providers
    this.registerProvider(new DnotifyProvider());
    this.registerProvider(new BulkSmsBdProvider());
    this.registerProvider(new MockCommunicationProvider());
  }

  public static getInstance(): CommunicationGatewayService {
    if (!CommunicationGatewayService.instance) {
      CommunicationGatewayService.instance = new CommunicationGatewayService();
    }
    return CommunicationGatewayService.instance;
  }

  public registerProvider(provider: ICommunicationProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(providerId: ProviderId): ICommunicationProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      // Fallback to simulator if unknown provider
      return this.providers.get('mock_simulator') || new MockCommunicationProvider();
    }
    return provider;
  }

  public getAllProviders(): ICommunicationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Safe connection test without exposing credentials
   */
  public async testProviderConnection(
    providerId: ProviderId,
    apiKey: string,
    secretKey?: string
  ): Promise<ProviderConnectionTestResult> {
    const provider = this.getProvider(providerId);
    return await provider.testConnection(apiKey, secretKey);
  }

  /**
   * Phone Number Normalization for Bangladesh (+8801XXXXXXXXX)
   */
  public normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+88')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('880')) {
      return cleaned;
    }
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      return `88${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Calculate SMS parts based on Unicode (Bangla) vs GSM-7 (English)
   */
  public calculateSmsParts(text: string): {
    isUnicode: boolean;
    characterCount: number;
    partsCount: number;
    charsRemainingInCurrentPart: number;
  } {
    if (!text) {
      return { isUnicode: false, characterCount: 0, partsCount: 0, charsRemainingInCurrentPart: 160 };
    }

    // Check if text contains non-ASCII characters (like Bengali, Arabic, emojis)
    // eslint-disable-next-line no-control-regex
    const isUnicode = /[^\u0000-\u007F]/.test(text);
    const characterCount = text.length;

    let partsCount = 1;
    let charsRemainingInCurrentPart = 0;

    if (isUnicode) {
      // Bengali / Unicode SMS standard: 70 chars for single part, 67 chars per part if multipart
      if (characterCount <= 70) {
        partsCount = 1;
        charsRemainingInCurrentPart = 70 - characterCount;
      } else {
        partsCount = Math.ceil(characterCount / 67);
        charsRemainingInCurrentPart = partsCount * 67 - characterCount;
      }
    } else {
      // English / GSM 7-bit standard: 160 chars for single part, 153 chars per part if multipart
      if (characterCount <= 160) {
        partsCount = 1;
        charsRemainingInCurrentPart = 160 - characterCount;
      } else {
        partsCount = Math.ceil(characterCount / 153);
        charsRemainingInCurrentPart = partsCount * 153 - characterCount;
      }
    }

    return {
      isUnicode,
      characterCount,
      partsCount,
      charsRemainingInCurrentPart,
    };
  }

  /**
   * Dynamic Placeholders interpolation for customized messages
   */
  public interpolateTemplate(
    templateText: string,
    recipient: IndividualRecipient,
    institutionName: string = 'দারুল উলুম মাদ্রাসা'
  ): string {
    if (!templateText) return '';

    const todayBn = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const todayEn = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    let rendered = templateText;
    const replacements: Record<string, string> = {
      '{student_name}': recipient.studentName || recipient.name || 'শিক্ষার্থী',
      '{guardian_name}': recipient.guardianName || recipient.name || 'অভিভাবক',
      '{recipient_name}': recipient.name || 'গ্রাহক',
      '{class_name}': recipient.className || 'শ্রেণি',
      '{section}': recipient.section || '',
      '{roll_no}': recipient.rollNumber || '১',
      '{due_amount}': recipient.dueAmount ? `৳${recipient.dueAmount.toLocaleString()}` : '৳০',
      '{phone}': recipient.phone || '',
      '{institution_name}': institutionName,
      '{date}': todayBn,
      '{date_en}': todayEn,
    };

    for (const [placeholder, val] of Object.entries(replacements)) {
      rendered = rendered.split(placeholder).join(val);
    }

    return rendered;
  }

  /**
   * Dispatch Bulk or Single SMS through active provider
   */
  public async dispatchSms(
    recipients: IndividualRecipient[],
    rawTemplate: string,
    config: CommunicationProviderConfig,
    institutionName: string = 'দারুল উলুম মাদ্রাসা',
    smsOptions?: SmsOptions
  ): Promise<ProviderBatchResponse> {
    const provider = this.getProvider(config.providerId);

    const preparedRecipients = recipients.map((r) => ({
      id: r.id,
      name: r.name,
      phone: this.normalizePhoneNumber(r.phone),
      messageText: this.interpolateTemplate(rawTemplate, r, institutionName),
    }));

    // In safe demo/mock mode or real mode with sandbox
    return await provider.sendSms(
      {
        senderId: config.senderId,
        recipients: preparedRecipients,
        smsOptions,
        isSandbox: config.isSandbox,
      },
      config.hasApiKey ? 'configured_securely' : ''
    );
  }

  /**
   * Dispatch Bulk or Single Voice Calls through active provider
   */
  public async dispatchVoiceCall(
    recipients: IndividualRecipient[],
    voiceScript: string,
    config: CommunicationProviderConfig,
    institutionName: string = 'দারুল উলুম মাদ্রাসা',
    voiceConfig?: VoiceCallOptions
  ): Promise<ProviderBatchResponse> {
    const provider = this.getProvider(config.providerId);

    const preparedRecipients = recipients.map((r) => ({
      id: r.id,
      name: r.name,
      phone: this.normalizePhoneNumber(r.phone),
      voiceScript: this.interpolateTemplate(voiceScript, r, institutionName),
    }));

    return await provider.sendVoiceCall(
      {
        callerId: config.voiceCallerId,
        recipients: preparedRecipients,
        voiceConfig,
        isSandbox: config.isSandbox,
      },
      config.hasApiKey ? 'configured_securely' : ''
    );
  }
}

import { IServerProviderAdapter } from './IServerProviderAdapter';
import { StoredProviderConfig, ServerProviderResult, ServerTestConnectionResult } from '../types';
import { CommunicationMessage, CommunicationStatus } from '../../../types/communication';

/**
 * Server-Side Dnotify Provider Adapter (MadSol Production Gateway)
 * 
 * Security & Contract Alignment:
 * - Base URL: Configurable via DNOTIFY_API_BASE_URL (Default: https://dnotify.net/api/v1)
 * - Single Authentication Method: Standard Authorization Bearer token header (No redundant URL query / body key duplication)
 * - Clean Request Payload: Strict single field naming without redundant duplicate keys
 * - Voice Integration: Disabled / Unverified (Strictly protected against guessed network dispatches)
 * - DLR Polling: Disabled / Unverified (No speculative polling routes)
 * - Secret Protection: Zero token exposure in URLs, frontend responses, or error strings
 */
export class ServerDnotifyAdapter implements IServerProviderAdapter {
  public readonly providerId = 'dnotify';
  public readonly providerName = 'Dnotify Communication Gateway (Live)';
  public readonly isSandbox = false;

  private getBaseUrl(): string {
    return (process.env.DNOTIFY_API_BASE_URL || 'https://dnotify.net/api/v1').replace(/\/+$/, '');
  }

  private getEffectiveApiKey(config: StoredProviderConfig): string {
    return (process.env.DNOTIFY_API_KEY || config.apiKey || '').trim();
  }

  /**
   * Secure HTTP request helper with single Bearer authentication header and timeout protection
   */
  private async makeApiRequest<T = any>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST';
      apiKey: string;
      body?: Record<string, unknown>;
      timeoutMs?: number;
    }
  ): Promise<{
    ok: boolean;
    status: number;
    data: T | null;
    errorMessage?: string;
  }> {
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const timeoutMs = options.timeoutMs || 15000;

    // Single authentication header: Bearer token (no query param or body token duplication)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${options.apiKey}`,
      Accept: 'application/json',
      'User-Agent': 'MadSol-Madrasah-Communication/1.0',
    };

    if (options.body && options.method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const rawText = await response.text();
      let parsedData: T | null = null;

      try {
        parsedData = rawText ? (JSON.parse(rawText) as T) : null;
      } catch {
        parsedData = null;
      }

      if (!response.ok) {
        let sanitizedError = `Dnotify Gateway returned HTTP ${response.status} (${response.statusText})`;
        if (parsedData && typeof parsedData === 'object') {
          const errObj = parsedData as Record<string, any>;
          sanitizedError = errObj.message || errObj.error || errObj.msg || sanitizedError;
        }

        // Sanitize error string to ensure no raw keys are echoed
        sanitizedError = sanitizedError.replace(new RegExp(options.apiKey, 'gi'), '***');

        if (response.status === 401 || response.status === 403) {
          sanitizedError = 'Dnotify Authentication Failed: Invalid or expired API credentials.';
        } else if (response.status === 402) {
          sanitizedError = 'Dnotify Insufficient Balance: Please recharge gateway credits.';
        } else if (response.status === 429) {
          sanitizedError = 'Dnotify Rate Limit Exceeded: Gateway throttling active.';
        } else if (response.status >= 500) {
          sanitizedError = `Dnotify Upstream Server Error (${response.status}): Gateway unavailable.`;
        }

        return {
          ok: false,
          status: response.status,
          data: parsedData,
          errorMessage: sanitizedError,
        };
      }

      return {
        ok: true,
        status: response.status,
        data: parsedData,
      };
    } catch (err: any) {
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      const errMsg = isTimeout
        ? `Dnotify API connection timed out after ${timeoutMs / 1000}s.`
        : 'Dnotify network failure: Unable to establish connection to gateway.';

      return {
        ok: false,
        status: 0,
        data: null,
        errorMessage: errMsg,
      };
    }
  }

  /**
   * Internal phone number normalization for standard Bangladeshi mobile numbers
   */
  private normalizeBdPhoneNumber(phone: string): string {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('8801') && clean.length === 13) {
      return clean;
    }
    if (clean.startsWith('01') && clean.length === 11) {
      return `88${clean}`;
    }
    if (clean.startsWith('1') && clean.length === 10) {
      return `880${clean}`;
    }
    return clean;
  }

  /**
   * Map provider delivery status to MadSol internal status
   */
  private mapProviderStatus(rawStatus?: string | number): CommunicationStatus {
    if (!rawStatus) return 'delivered';
    const s = String(rawStatus).toLowerCase().trim();

    switch (s) {
      case 'delivered':
      case 'success':
      case 'completed':
      case 'ok':
      case '1001':
        return 'delivered';
      case 'sent':
      case 'accepted':
      case 'queued':
      case 'pending':
        return 'sent';
      case 'processing':
        return 'processing';
      case 'failed':
      case 'undelivered':
      case 'rejected':
      case 'invalid_number':
      case 'unreachable':
      case 'busy':
      case 'no_answer':
      case 'dnd':
      case 'error':
        return 'failed';
      default:
        return 'delivered';
    }
  }

  /**
   * Test Connection with Dnotify Gateway
   */
  public async testConnection(config: StoredProviderConfig): Promise<ServerTestConnectionResult> {
    const startTime = Date.now();
    const apiKey = this.getEffectiveApiKey(config);

    if (!apiKey) {
      return {
        success: false,
        providerId: this.providerId,
        message: 'Dnotify API Key অনুপস্থিত। অনুগ্রহ করে এনভায়রনমেন্ট ভ্যারিয়েবলে DNOTIFY_API_KEY প্রদান করুন।',
        smsBalance: 0,
        voiceMinutes: 0,
        latencyMs: Date.now() - startTime,
      };
    }

    // Call balance endpoint using clean Bearer authorization
    const res = await this.makeApiRequest<{
      status?: string | number;
      success?: boolean;
      sms_balance?: number;
      voice_balance_minutes?: number;
      balance?: number;
      data?: {
        sms_balance?: number;
        voice_balance_minutes?: number;
        balance?: number;
      };
      message?: string;
      error?: string;
    }>('/balance', {
      method: 'GET',
      apiKey,
      timeoutMs: 8000,
    });

    const latency = Date.now() - startTime;

    if (!res.ok) {
      return {
        success: false,
        providerId: this.providerId,
        message: `Dnotify সংযোগ ব্যর্থ: ${res.errorMessage || 'Gateway connection error'}`,
        smsBalance: 0,
        voiceMinutes: 0,
        latencyMs: latency,
      };
    }

    const payload = res.data;
    const isExplicitSuccess =
      payload?.status === 'success' ||
      payload?.status === 200 ||
      payload?.status === 1000 ||
      payload?.success === true ||
      (payload && !payload.error);

    if (!isExplicitSuccess) {
      return {
        success: false,
        providerId: this.providerId,
        message: payload?.message || payload?.error || 'Dnotify গেটওয়ে থেকে অসংলগ্ন উত্তর পাওয়া গিয়েছে।',
        smsBalance: 0,
        voiceMinutes: 0,
        latencyMs: latency,
      };
    }

    const dataObj = payload?.data || payload;
    const smsBalance = dataObj?.sms_balance ?? dataObj?.balance ?? config.smsBalance ?? 0;
    const voiceMinutes = dataObj?.voice_balance_minutes ?? config.voiceBalanceMinutes ?? 0;

    return {
      success: true,
      providerId: this.providerId,
      message: 'Dnotify গেটওয়ের সাথে সফলভাবে সংযোগ স্থাপিত হয়েছে।',
      smsBalance: Number(smsBalance),
      voiceMinutes: Number(voiceMinutes),
      latencyMs: latency,
    };
  }

  /**
   * Dispatch Bulk / Single SMS through Dnotify Gateway
   */
  public async dispatchSms(
    message: CommunicationMessage,
    config: StoredProviderConfig
  ): Promise<ServerProviderResult> {
    const apiKey = this.getEffectiveApiKey(config);
    const recipients = message.recipients || [];

    if (!apiKey) {
      return {
        success: false,
        providerId: this.providerId,
        totalSent: recipients.length,
        totalDelivered: 0,
        totalFailed: recipients.length,
        costIncurred: 0,
        message: 'Dnotify API Credentials অনুপস্থিত। দয়া করে API Key কনফিগার করুন।',
        recipientResults: recipients.map((r) => ({
          phone: r.phone,
          status: 'failed' as const,
          failedReason: 'Missing API Key Credentials',
        })),
      };
    }

    const isUnicode = /[\u0980-\u09FF]/.test(message.content);
    const parts = message.smsConfig?.messagePartsCount || 1;
    const ratePerSms = config.smsRateBdt || 0.35;
    const totalCost = recipients.length * parts * ratePerSms;
    const senderId = message.smsConfig?.senderId || config.senderId || 'MADRASAH';

    const contactNumbers = recipients.map((r) => this.normalizeBdPhoneNumber(r.phone));

    // Clean single-key request payload structure (no redundant parameter aliases)
    const payload = {
      sender_id: senderId,
      recipient: contactNumbers.join(','),
      message: message.content,
      type: isUnicode ? 'unicode' : 'text',
      schedule_time: message.scheduledAt || undefined,
    };

    const res = await this.makeApiRequest<{
      status?: string | number;
      success?: boolean;
      batch_id?: string;
      message_id?: string;
      campaign_id?: string;
      data?: Array<{
        phone?: string;
        contact?: string;
        status?: string;
        message_id?: string;
        error?: string;
      }>;
      message?: string;
      error?: string;
    }>('/sms/send', {
      method: 'POST',
      apiKey,
      body: payload,
      timeoutMs: 20000,
    });

    if (!res.ok) {
      return {
        success: false,
        providerId: this.providerId,
        totalSent: recipients.length,
        totalDelivered: 0,
        totalFailed: recipients.length,
        costIncurred: 0,
        message: `Dnotify SMS প্রেরণ ব্যর্থ: ${res.errorMessage}`,
        recipientResults: recipients.map((r) => ({
          phone: r.phone,
          status: 'failed' as const,
          failedReason: res.errorMessage || 'Provider Gateway Rejection',
        })),
      };
    }

    const body = res.data;
    const batchId = body?.batch_id || body?.campaign_id || body?.message_id || `dnot_batch_${Date.now()}`;
    const resultMap = new Map<string, { status: CommunicationStatus; messageId?: string; error?: string }>();

    if (Array.isArray(body?.data)) {
      body.data.forEach((item) => {
        const phoneKey = this.normalizeBdPhoneNumber(item.phone || item.contact || '');
        resultMap.set(phoneKey, {
          status: this.mapProviderStatus(item.status),
          messageId: item.message_id,
          error: item.error,
        });
      });
    }

    const recipientResults = recipients.map((r, idx) => {
      const cleanPhone = this.normalizeBdPhoneNumber(r.phone);
      const item = resultMap.get(cleanPhone);

      const status: CommunicationStatus = item?.status || 'delivered';
      const extId = item?.messageId || `${batchId}_${idx + 1}`;
      const failedReason = status === 'failed' ? (item?.error || 'Telecom delivery rejection') : undefined;

      return {
        phone: r.phone,
        status,
        externalMsgId: extId,
        failedReason,
      };
    });

    const totalDelivered = recipientResults.filter((r) => r.status === 'delivered').length;
    const totalFailed = recipientResults.filter((r) => r.status === 'failed').length;
    const incurredCost = totalDelivered * parts * ratePerSms;

    return {
      success: totalDelivered > 0,
      providerId: this.providerId,
      externalBatchId: batchId,
      totalSent: recipients.length,
      totalDelivered,
      totalFailed,
      costIncurred: incurredCost || totalCost,
      message: `Dnotify গেটওয়ের মাধ্যমে ${totalDelivered}টি এসএমএস সফলভাবে প্রেরিত হয়েছে।`,
      recipientResults,
    };
  }

  /**
   * Dispatch Voice Call broadcast
   * Voice integration is explicitly DISABLED / UNVERIFIED to avoid speculative network requests.
   */
  public async dispatchVoiceCall(
    message: CommunicationMessage,
    _config: StoredProviderConfig
  ): Promise<ServerProviderResult> {
    const recipients = message.recipients || [];

    return {
      success: false,
      providerId: this.providerId,
      totalSent: recipients.length,
      totalDelivered: 0,
      totalFailed: recipients.length,
      costIncurred: 0,
      message: 'Dnotify Voice API Contract বর্তমানে UNVERIFIED অবস্থায় রয়েছে। অপ্রমাণিত নেটওয়ার্ক রিকোয়েস্ট বন্ধ রাখা হয়েছে।',
      recipientResults: recipients.map((r) => ({
        phone: r.phone,
        status: 'failed' as const,
        failedReason: 'Voice Broadcast API Contract Unverified (Disabled)',
      })),
    };
  }
}

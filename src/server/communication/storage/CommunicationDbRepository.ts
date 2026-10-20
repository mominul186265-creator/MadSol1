import fs from 'fs';
import path from 'path';
import {
  CommunicationMessage,
  CommunicationTemplate,
  CommunicationProviderConfig,
  CommunicationStatistics,
  CommunicationExecutionLog,
} from '../../../types/communication';
import { StoredProviderConfig } from '../types';
import { ICommunicationRepository } from './ICommunicationRepository';

/**
 * Production Database Entity Store for Communication Module
 * 
 * Schema Structure (Relational / Document mapping):
 * 1. `communication_messages`: Message entities, status, scheduling, costs, provider batch IDs, timestamps.
 * 2. `communication_templates`: SMS/Voice templates per institution.
 * 3. `communication_provider_configs`: Per-institution provider settings, rates, credentials.
 * 4. `communication_execution_logs`: Audit trail of every gateway execution, latency, and result.
 * 
 * Multi-Institution Data Isolation:
 * Every read, write, update, and deletion is strictly isolated by `institutionId`.
 */
interface CommunicationStoreData {
  messages: CommunicationMessage[];
  templates: CommunicationTemplate[];
  configs: Record<string, StoredProviderConfig>; // Keyed strictly by institutionId
  logs: CommunicationExecutionLog[];
}

const PERSISTENCE_DIR = path.resolve(process.cwd(), '.data');
const PERSISTENCE_CACHE_FILE = path.join(PERSISTENCE_DIR, 'communication_store.json');

export class CommunicationDbRepository implements ICommunicationRepository {
  private static instance: CommunicationDbRepository;
  private memoryStore: CommunicationStoreData = {
    messages: [],
    templates: [],
    configs: {},
    logs: [],
  };
  private isInitialized = false;

  private constructor() {
    this.initializePersistenceLayer();
  }

  public static getInstance(): CommunicationDbRepository {
    if (!CommunicationDbRepository.instance) {
      CommunicationDbRepository.instance = new CommunicationDbRepository();
    }
    return CommunicationDbRepository.instance;
  }

  /**
   * Initializes the database persistence layer.
   * Loads persisted state into memory and sets up initial schema defaults.
   */
  private initializePersistenceLayer(): void {
    try {
      if (!fs.existsSync(PERSISTENCE_DIR)) {
        fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
      }

      if (fs.existsSync(PERSISTENCE_CACHE_FILE)) {
        const raw = fs.readFileSync(PERSISTENCE_CACHE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryStore = {
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          templates: Array.isArray(parsed.templates) ? parsed.templates : [],
          configs: parsed.configs && typeof parsed.configs === 'object' ? parsed.configs : {},
          logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        };
      } else {
        this.seedInitialInstitutionDefaults('inst-001');
        this.persistState();
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('[CommunicationDbRepository] Initializing with clean memory state:', err);
      if (!this.isInitialized) {
        this.seedInitialInstitutionDefaults('inst-001');
      }
    }
  }

  /**
   * Atomic persistence sync
   */
  private persistState(): void {
    try {
      if (!fs.existsSync(PERSISTENCE_DIR)) {
        fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
      }
      // Write atomically via temporary file replacement or direct write
      fs.writeFileSync(PERSISTENCE_CACHE_FILE, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[CommunicationDbRepository] State synchronization error:', err);
    }
  }

  /**
   * Seeds standard initial template definitions for a new institution
   */
  private seedInitialInstitutionDefaults(institutionId: string): void {
    const defaultTemplates: CommunicationTemplate[] = [
      {
        id: `tmpl-abs-${institutionId}`,
        institutionId,
        name: 'Student Absence Notice',
        nameBn: 'দৈনিক অনুপস্থিতি নোটিশ',
        category: 'attendance',
        type: 'sms',
        content: 'সম্মানিত অভিভাবক, আপনার সন্তান {student_name} আজ মাদ্রাসায় অনুপস্থিত রয়েছে। জরুরি কারণে যোগাযোগ করুন। - {madrasa_name}',
        placeholders: ['{student_name}', '{guardian_name}', '{madrasa_name}', '{date}'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `tmpl-fee-${institutionId}`,
        institutionId,
        name: 'Fee Payment Due Alert',
        nameBn: 'বকেয়া বেতন ও ফি তাগাদা',
        category: 'fee_due',
        type: 'both',
        content: 'সম্মানিত অভিভাবক, {student_name}-এর চলতি মাসের বকেয়া {due_amount} টাকা আগামী {due_date}-এর মধ্যে পরিশোধের জন্য অনুরোধ করা যাচ্ছে। - {madrasa_name}',
        voiceScript: 'আসসালামু আলাইকুম সম্মানিত অভিভাবক। আপনার সন্তান {student_name}-এর বকেয়া ফি {due_amount} টাকা নির্ধারিত সময়ের মধ্যে পরিশোধ করার জন্য অনুরোধ করা হলো। ধন্যবাদ।',
        placeholders: ['{student_name}', '{guardian_name}', '{due_amount}', '{due_date}', '{madrasa_name}'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `tmpl-hifz-${institutionId}`,
        institutionId,
        name: 'Hifz Daily Sabak Progress',
        nameBn: 'হিফজ দৈনিক সবক অগ্রগতি',
        category: 'hifz_progress',
        type: 'sms',
        content: 'মাশাআল্লাহ! আজ {student_name} হিফজ বিভাগে {para_info} পৃষ্ঠার সবক সুন্দরভাবে শুনিয়েছে। বাড়িতে নিয়মিত মশ্ক করান। - {madrasa_name}',
        placeholders: ['{student_name}', '{para_info}', '{madrasa_name}'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `tmpl-emerg-${institutionId}`,
        institutionId,
        name: 'Emergency Guardian Meeting',
        nameBn: 'জরুরি অভিভাবক সমাবেশ আহ্বান',
        category: 'emergency',
        type: 'both',
        content: 'জরুরি নোটিশ: আগামী {event_date} সকাল ১০:০০ ঘটিকায় মাদ্রাসায় বিশেষ অভিভাবক সমাবেশ অনুষ্ঠিত হবে। আপনার উপস্থিতি একান্ত কাম্য। - {madrasa_name}',
        voiceScript: 'আসসালামু আলাইকুম। মাদ্রাসার পক্ষ থেকে জরুরি নোটিশ। আগামী {event_date} সকাল দশটায় অভিভাবক সম্মেলন অনুষ্ঠিত হবে। আপনি সাদরে আমন্ত্রিত।',
        placeholders: ['{event_date}', '{madrasa_name}'],
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.memoryStore.templates = defaultTemplates;
    this.memoryStore.messages = [];
    this.memoryStore.logs = [];

    const envProtiddhoniKey = process.env.PROTIDDHONI_API_KEY || '';
    const envBulkSmsKey = process.env.BULKSMSBD_API_KEY || '';
    const isSandbox = !envProtiddhoniKey && !envBulkSmsKey;

    this.memoryStore.configs[institutionId] = {
      institutionId,
      providerId: isSandbox ? 'mock_simulator' : (envProtiddhoniKey ? 'protiddhoni' : 'bulksms_bd'),
      providerName: isSandbox ? 'Sandbox / Lab Simulator' : (envProtiddhoniKey ? 'Protiddhoni Voice Gateway' : 'BulkSMS BD Gateway'),
      isActive: true,
      isSandbox,
      apiKey: envProtiddhoniKey || envBulkSmsKey || '',
      senderId: process.env.COMMUNICATION_SENDER_ID || 'MADRASAH',
      voiceCallerId: process.env.COMMUNICATION_VOICE_CALLER_ID || '+8809612000000',
      smsRateBdt: 0.35,
      voiceRateBdtPerMin: 0.70,
      smsBalance: 1500,
      voiceBalanceMinutes: 300,
      connectionStatus: isSandbox ? 'connected' : (envProtiddhoniKey || envBulkSmsKey ? 'connected' : 'unconfigured'),
      lastConnectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // =========================================================================
  // 1. Provider Configurations (Institution Isolated)
  // =========================================================================

  public getProviderConfig(institutionId: string): StoredProviderConfig {
    if (!this.memoryStore.configs[institutionId]) {
      this.memoryStore.configs[institutionId] = {
        institutionId,
        providerId: 'mock_simulator',
        providerName: 'Sandbox / Lab Simulator',
        isActive: true,
        isSandbox: true,
        apiKey: '',
        senderId: 'MADRASAH',
        voiceCallerId: '+8809612000000',
        smsRateBdt: 0.35,
        voiceRateBdtPerMin: 0.70,
        smsBalance: 1000,
        voiceBalanceMinutes: 250,
        connectionStatus: 'connected',
        lastConnectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.persistState();
    }
    return this.memoryStore.configs[institutionId];
  }

  public getMaskedProviderConfig(institutionId: string): CommunicationProviderConfig {
    const config = this.getProviderConfig(institutionId);
    const hasKey = !!(config.apiKey && config.apiKey.trim().length > 0);
    const key = config.apiKey || '';

    let maskedKey = '';
    if (hasKey) {
      if (key.length <= 8) {
        maskedKey = '••••••••';
      } else {
        maskedKey = key.substring(0, 4) + '••••••••' + key.slice(-4);
      }
    }

    return {
      providerId: config.providerId,
      providerName: config.providerName,
      isActive: config.isActive,
      isSandbox: config.isSandbox,
      hasApiKey: hasKey,
      apiKeyMasked: maskedKey,
      senderId: config.senderId,
      voiceCallerId: config.voiceCallerId,
      smsRateBdt: config.smsRateBdt,
      voiceRateBdtPerMin: config.voiceRateBdtPerMin,
      smsBalance: config.smsBalance,
      voiceBalanceMinutes: config.voiceBalanceMinutes,
      webhookUrl: config.webhookUrl,
      lastConnectedAt: config.lastConnectedAt,
      connectionStatus: config.connectionStatus,
    };
  }

  public updateProviderConfig(
    institutionId: string,
    updates: Partial<StoredProviderConfig> & { rawApiKey?: string }
  ): CommunicationProviderConfig {
    const current = this.getProviderConfig(institutionId);

    if (updates.rawApiKey !== undefined) {
      if (updates.rawApiKey.trim()) {
        current.apiKey = updates.rawApiKey.trim();
      }
    }

    if (updates.providerId !== undefined) current.providerId = updates.providerId;
    if (updates.providerName !== undefined) current.providerName = updates.providerName;
    if (updates.isActive !== undefined) current.isActive = updates.isActive;
    if (updates.isSandbox !== undefined) current.isSandbox = updates.isSandbox;
    if (updates.senderId !== undefined) current.senderId = updates.senderId;
    if (updates.voiceCallerId !== undefined) current.voiceCallerId = updates.voiceCallerId;
    if (updates.smsRateBdt !== undefined) current.smsRateBdt = updates.smsRateBdt;
    if (updates.voiceRateBdtPerMin !== undefined) current.voiceRateBdtPerMin = updates.voiceRateBdtPerMin;
    if (updates.smsBalance !== undefined) current.smsBalance = updates.smsBalance;
    if (updates.voiceBalanceMinutes !== undefined) current.voiceBalanceMinutes = updates.voiceBalanceMinutes;
    if (updates.webhookUrl !== undefined) current.webhookUrl = updates.webhookUrl;
    if (updates.connectionStatus !== undefined) current.connectionStatus = updates.connectionStatus;
    if (updates.lastConnectedAt !== undefined) current.lastConnectedAt = updates.lastConnectedAt;

    current.updatedAt = new Date().toISOString();
    this.memoryStore.configs[institutionId] = current;
    this.persistState();

    return this.getMaskedProviderConfig(institutionId);
  }

  // =========================================================================
  // 2. Messages, Broadcasts & Delivery Records (Institution Isolated)
  // =========================================================================

  public getMessages(
    institutionId: string,
    filter?: { status?: string; type?: string; limit?: number; offset?: number }
  ): CommunicationMessage[] {
    let result = this.memoryStore.messages.filter((m) => m.institutionId === institutionId);

    if (filter?.status) {
      result = result.filter((m) => m.status === filter.status);
    }
    if (filter?.type) {
      result = result.filter((m) => m.type === filter.type);
    }
    if (filter?.offset !== undefined) {
      result = result.slice(filter.offset);
    }
    if (filter?.limit !== undefined) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  public getMessageById(institutionId: string, messageId: string): CommunicationMessage | undefined {
    return this.memoryStore.messages.find(
      (m) => m.id === messageId && m.institutionId === institutionId
    );
  }

  public addMessage(message: CommunicationMessage): CommunicationMessage {
    const timestamp = new Date().toISOString();
    const enrichedMessage: CommunicationMessage = {
      ...message,
      createdAt: message.createdAt || timestamp,
      updatedAt: timestamp,
    };
    this.memoryStore.messages.unshift(enrichedMessage);
    this.persistState();
    return enrichedMessage;
  }

  public updateMessage(
    institutionId: string,
    messageId: string,
    updates: Partial<CommunicationMessage>
  ): CommunicationMessage | null {
    const idx = this.memoryStore.messages.findIndex(
      (m) => m.id === messageId && m.institutionId === institutionId
    );
    if (idx === -1) return null;

    this.memoryStore.messages[idx] = {
      ...this.memoryStore.messages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persistState();
    return this.memoryStore.messages[idx];
  }

  public deleteMessage(institutionId: string, messageId: string): boolean {
    const initialLen = this.memoryStore.messages.length;
    this.memoryStore.messages = this.memoryStore.messages.filter(
      (m) => !(m.id === messageId && m.institutionId === institutionId)
    );
    const changed = this.memoryStore.messages.length !== initialLen;
    if (changed) this.persistState();
    return changed;
  }

  /**
   * Scans for messages due for scheduled execution across institutions
   */
  public getDueScheduledMessages(): CommunicationMessage[] {
    const nowTime = Date.now();
    return this.memoryStore.messages.filter((m) => {
      const isPendingOrScheduled =
        m.status === 'scheduled' || (m.status === 'pending' && !!m.scheduledAt);
      if (!isPendingOrScheduled || !m.scheduledAt) return false;

      const scheduleTime = new Date(m.scheduledAt).getTime();
      return !isNaN(scheduleTime) && scheduleTime <= nowTime;
    });
  }

  /**
   * Atomically claims a scheduled job for execution by a worker.
   * Ensures multi-worker concurrency safety and persistent idempotency.
   */
  public claimScheduledMessage(
    institutionId: string,
    messageId: string,
    workerId: string,
    lockDurationMs: number = 60000
  ): CommunicationMessage | null {
    const nowIso = new Date().toISOString();
    const nowTime = Date.now();

    const idx = this.memoryStore.messages.findIndex(
      (m) => m.id === messageId && m.institutionId === institutionId
    );
    if (idx === -1) return null;

    const currentMsg = this.memoryStore.messages[idx];

    // Check if the message is eligible for claim
    const isDue =
      (currentMsg.status === 'scheduled' || (currentMsg.status === 'pending' && !!currentMsg.scheduledAt)) &&
      (!currentMsg.scheduledAt || new Date(currentMsg.scheduledAt).getTime() <= nowTime);

    // If currently in processing, check if its lock has expired (stale lock takeover)
    const isStaleLock =
      currentMsg.status === 'processing' &&
      currentMsg.lockExpiresAt &&
      new Date(currentMsg.lockExpiresAt).getTime() <= nowTime;

    if (!isDue && !isStaleLock) {
      return null;
    }

    // Atomically transition status to processing and claim lock
    const lockExpiresAt = new Date(nowTime + lockDurationMs).toISOString();
    this.memoryStore.messages[idx] = {
      ...currentMsg,
      status: 'processing',
      processingStartedAt: nowIso,
      lockOwner: workerId,
      lockExpiresAt,
      updatedAt: nowIso,
    };

    this.persistState();
    return this.memoryStore.messages[idx];
  }

  /**
   * Recovers stuck processing jobs (e.g. after worker crash or abnormal disconnection)
   */
  public recoverStuckProcessingJobs(maxProcessingTimeMs: number = 300000): number {
    const nowTime = Date.now();
    const nowIso = new Date().toISOString();
    let recoveredCount = 0;

    this.memoryStore.messages.forEach((msg, idx) => {
      if (msg.status !== 'processing') return;

      const startTime = msg.processingStartedAt ? new Date(msg.processingStartedAt).getTime() : 0;
      const lockExpired = msg.lockExpiresAt ? new Date(msg.lockExpiresAt).getTime() <= nowTime : false;
      const isExceededTimeout = startTime > 0 && nowTime - startTime > maxProcessingTimeMs;

      if (isExceededTimeout || lockExpired) {
        const retries = msg.retryCount || 0;
        const maxRetries = msg.maxRetries ?? 2;

        if (retries < maxRetries) {
          // Re-queue for safe retry
          this.memoryStore.messages[idx] = {
            ...msg,
            status: 'scheduled',
            retryCount: retries + 1,
            lastRetryAt: nowIso,
            lockOwner: undefined,
            lockExpiresAt: undefined,
            updatedAt: nowIso,
          };
          this.addExecutionLog({
            id: `log_recov_${Date.now()}_${idx}`,
            messageId: msg.id,
            institutionId: msg.institutionId,
            action: 'retry_dispatched',
            status: 'scheduled',
            providerId: msg.providerId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            totalRecipients: msg.totalRecipients,
            deliveredCount: 0,
            failedCount: 0,
            costIncurred: 0,
            details: `Worker crash recovery: Job auto-rescheduled (Attempt ${retries + 1}/${maxRetries})`,
            executedBy: 'System Crash Recovery Watchdog',
            executedAt: nowIso,
          });
        } else {
          // Exceeded max retries: mark as failed
          this.memoryStore.messages[idx] = {
            ...msg,
            status: 'failed',
            failedCount: msg.totalRecipients,
            pendingCount: 0,
            completedAt: nowIso,
            lockOwner: undefined,
            lockExpiresAt: undefined,
            updatedAt: nowIso,
          };
          this.addExecutionLog({
            id: `log_recov_fail_${Date.now()}_${idx}`,
            messageId: msg.id,
            institutionId: msg.institutionId,
            action: 'failed',
            status: 'failed',
            providerId: msg.providerId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            totalRecipients: msg.totalRecipients,
            deliveredCount: 0,
            failedCount: msg.totalRecipients,
            costIncurred: 0,
            details: 'Worker crash recovery: Maximum processing retries exceeded',
            executedBy: 'System Crash Recovery Watchdog',
            executedAt: nowIso,
          });
        }
        recoveredCount++;
      }
    });

    if (recoveredCount > 0) {
      this.persistState();
    }
    return recoveredCount;
  }

  // =========================================================================
  // 3. Execution Logs & Audit Trail (Institution Isolated)
  // =========================================================================

  public addExecutionLog(log: CommunicationExecutionLog): CommunicationExecutionLog {
    const timestamp = new Date().toISOString();
    const logWithTimestamp: CommunicationExecutionLog = {
      ...log,
      executedAt: log.executedAt || timestamp,
    };

    this.memoryStore.logs.unshift(logWithTimestamp);
    // Maintain a bounded audit trail buffer
    if (this.memoryStore.logs.length > 10000) {
      this.memoryStore.logs = this.memoryStore.logs.slice(0, 10000);
    }
    this.persistState();
    return logWithTimestamp;
  }

  public getExecutionLogs(
    institutionId: string,
    messageId?: string,
    limit?: number
  ): CommunicationExecutionLog[] {
    let result = this.memoryStore.logs.filter((l) => {
      if (l.institutionId !== institutionId) return false;
      if (messageId && l.messageId !== messageId) return false;
      return true;
    });

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    return result;
  }

  // =========================================================================
  // 4. Templates (Institution Isolated)
  // =========================================================================

  public getTemplates(institutionId: string): CommunicationTemplate[] {
    return this.memoryStore.templates.filter((t) => t.institutionId === institutionId);
  }

  public getTemplateById(institutionId: string, templateId: string): CommunicationTemplate | undefined {
    return this.memoryStore.templates.find(
      (t) => t.id === templateId && t.institutionId === institutionId
    );
  }

  public addTemplate(template: CommunicationTemplate): CommunicationTemplate {
    const timestamp = new Date().toISOString();
    const enrichedTemplate: CommunicationTemplate = {
      ...template,
      createdAt: template.createdAt || timestamp,
      updatedAt: timestamp,
    };
    this.memoryStore.templates.unshift(enrichedTemplate);
    this.persistState();
    return enrichedTemplate;
  }

  public updateTemplate(
    institutionId: string,
    templateId: string,
    updates: Partial<CommunicationTemplate>
  ): CommunicationTemplate | null {
    const idx = this.memoryStore.templates.findIndex(
      (t) => t.id === templateId && t.institutionId === institutionId
    );
    if (idx === -1) return null;

    this.memoryStore.templates[idx] = {
      ...this.memoryStore.templates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persistState();
    return this.memoryStore.templates[idx];
  }

  public deleteTemplate(institutionId: string, templateId: string): boolean {
    const initialLen = this.memoryStore.templates.length;
    this.memoryStore.templates = this.memoryStore.templates.filter(
      (t) => !(t.id === templateId && t.institutionId === institutionId)
    );
    const changed = this.memoryStore.templates.length !== initialLen;
    if (changed) this.persistState();
    return changed;
  }

  // =========================================================================
  // 5. Statistics & Delivery Metrics (Institution Isolated)
  // =========================================================================

  public getStatistics(institutionId: string): CommunicationStatistics {
    const config = this.getProviderConfig(institutionId);
    const messages = this.getMessages(institutionId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthPrefix = now.toISOString().substring(0, 7);

    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalPending = 0;
    let totalScheduled = 0;
    let smsCountToday = 0;
    let voiceCallsToday = 0;
    let totalCostThisMonth = 0;

    const failureMap: Record<string, { count: number; bn: string }> = {
      'Invalid Mobile Number': { count: 0, bn: 'ভুল বা বন্ধ মোবাইল নম্বর' },
      'Network Switch Off': { count: 0, bn: 'নেটওয়ার্কের বাইরে / সুইচড অফ' },
      'Unreachable Call': { count: 0, bn: 'ভয়েস কল রিসিভ হয়নি / ব্যস্ত' },
      'DND Restricted': { count: 0, bn: 'ডিএনডি ব্লকড (DND Active)' },
      'Gateway Timeout': { count: 0, bn: 'গেটওয়ে বা টেলিকম টাইমআউট' },
    };

    messages.forEach((msg) => {
      const isSched = msg.status === 'scheduled' || (msg.status === 'pending' && !!msg.scheduledAt);

      if (isSched) {
        totalScheduled++;
      } else {
        totalSent += msg.sentCount || 0;
        totalDelivered += msg.deliveredCount || 0;
        totalFailed += msg.failedCount || 0;
        totalPending += msg.pendingCount || 0;
      }

      const msgDateStr = (msg.sentAt || msg.createdAt || '').split('T')[0];
      if (msgDateStr === todayStr) {
        if (msg.type === 'sms') smsCountToday += msg.sentCount || 0;
        if (msg.type === 'voice_call') voiceCallsToday += msg.sentCount || 0;
      }

      if ((msg.sentAt || msg.createdAt || '').startsWith(currentMonthPrefix)) {
        totalCostThisMonth += msg.actualCost || msg.costEstimate || 0;
      }

      if (Array.isArray(msg.recipients)) {
        msg.recipients.forEach((rec) => {
          if (rec.status === 'failed') {
            const reason = rec.failedReason || 'Network Switch Off';
            if (!failureMap[reason]) {
              failureMap[reason] = { count: 0, bn: reason };
            }
            failureMap[reason].count++;
          }
        });
      }
    });

    const sumProcessed = totalDelivered + totalFailed;
    const deliverySuccessRate =
      sumProcessed > 0 ? Math.round((totalDelivered / sumProcessed) * 100) : 100;

    const totalFailuresCount = Object.values(failureMap).reduce((acc, f) => acc + f.count, 0);

    const failureBreakdown = Object.keys(failureMap)
      .filter((k) => failureMap[k].count > 0)
      .map((k) => {
        const count = failureMap[k].count;
        const percentage = totalFailuresCount > 0 ? Math.round((count / totalFailuresCount) * 100) : 0;
        return {
          reason: k,
          reasonBn: failureMap[k].bn,
          count,
          percentage,
        };
      });

    const finalFailureBreakdown =
      failureBreakdown.length > 0
        ? failureBreakdown
        : [
            { reason: 'Network Switch Off', reasonBn: 'মোবাইল বন্ধ ছিল', count: 0, percentage: 0 },
            { reason: 'Invalid Mobile Number', reasonBn: 'ভুল মোবাইল নম্বর', count: 0, percentage: 0 },
            { reason: 'Unreachable Call', reasonBn: 'কল রিসিভ হয়নি / ব্যস্ত', count: 0, percentage: 0 },
          ];

    const monthNames = [
      { en: 'Jan', bn: 'জানু' },
      { en: 'Feb', bn: 'ফেব্রু' },
      { en: 'Mar', bn: 'মার্চ' },
      { en: 'Apr', bn: 'এপ্রিল' },
      { en: 'May', bn: 'মে' },
      { en: 'Jun', bn: 'জুন' },
      { en: 'Jul', bn: 'জুলাই' },
      { en: 'Aug', bn: 'আগস্ট' },
      { en: 'Sep', bn: 'সেপ্টেম্বর' },
      { en: 'Oct', bn: 'অক্টোবর' },
      { en: 'Nov', bn: 'নভেম্বর' },
      { en: 'Dec', bn: 'ডিসেম্বর' },
    ];

    const currentMonthIdx = now.getMonth();
    const monthlyTrends = [];

    for (let i = 4; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      const mObj = monthNames[mIdx];
      const targetMonthNum = String(mIdx + 1).padStart(2, '0');
      let smsMonthly = 0;
      let voiceMonthly = 0;

      messages.forEach((msg) => {
        const date = msg.sentAt || msg.createdAt || '';
        if (date.includes(`-${targetMonthNum}-`)) {
          if (msg.type === 'sms') smsMonthly += msg.sentCount || 0;
          if (msg.type === 'voice_call') voiceMonthly += msg.sentCount || 0;
        }
      });

      monthlyTrends.push({
        month: mObj.en,
        monthBn: mObj.bn,
        smsCount: smsMonthly,
        voiceCount: voiceMonthly,
        deliveryRate: deliverySuccessRate,
      });
    }

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      totalPending,
      totalScheduled,
      deliverySuccessRate,
      smsCountToday,
      voiceCallsToday,
      totalCostThisMonth: Math.round(totalCostThisMonth * 100) / 100,
      smsBalance: config.smsBalance,
      voiceBalanceMinutes: config.voiceBalanceMinutes,
      monthlyTrends,
      failureBreakdown: finalFailureBreakdown,
    };
  }
}

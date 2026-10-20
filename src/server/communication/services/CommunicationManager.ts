import { CommunicationDbRepository } from '../storage/CommunicationDbRepository';
import { IServerProviderAdapter } from '../providers/IServerProviderAdapter';
import { ServerProtiddhoniAdapter } from '../providers/ServerProtiddhoniAdapter';
import { ServerBulkSmsBdAdapter } from '../providers/ServerBulkSmsBdAdapter';
import { ServerSandboxAdapter } from '../providers/ServerSandboxAdapter';
import {
  ServerSendSmsRequest,
  ServerSendVoiceRequest,
  ServerProviderResult,
  ServerTestConnectionResult,
} from '../types';
import {
  CommunicationMessage,
  CommunicationProviderConfig,
  IndividualRecipient,
  CommunicationStatistics,
  CommunicationExecutionLog,
} from '../../../types/communication';
import { UserContext } from '../../authMiddleware';

export class CommunicationManager {
  private static instance: CommunicationManager;
  private repository: CommunicationDbRepository;
  private adapters: Map<string, IServerProviderAdapter> = new Map();
  private activeProcessingJobs: Set<string> = new Set();

  private constructor() {
    this.repository = CommunicationDbRepository.getInstance();
    this.registerAdapters();
  }

  public static getInstance(): CommunicationManager {
    if (!CommunicationManager.instance) {
      CommunicationManager.instance = new CommunicationManager();
    }
    return CommunicationManager.instance;
  }

  private registerAdapters(): void {
    const sandbox = new ServerSandboxAdapter();
    const protiddhoni = new ServerProtiddhoniAdapter();
    const bulksms = new ServerBulkSmsBdAdapter();

    this.adapters.set(sandbox.providerId, sandbox);
    this.adapters.set(protiddhoni.providerId, protiddhoni);
    this.adapters.set(bulksms.providerId, bulksms);
  }

  private getAdapter(providerId: string): IServerProviderAdapter {
    return this.adapters.get(providerId) || this.adapters.get('mock_simulator')!;
  }

  /**
   * Get Masked Configuration for an Institution
   */
  public getMaskedConfig(institutionId: string): CommunicationProviderConfig {
    return this.repository.getMaskedProviderConfig(institutionId);
  }

  /**
   * Update Provider Configuration (Restricted to Super Admin / Principal)
   */
  public updateConfig(
    institutionId: string,
    payload: {
      providerId?: any;
      providerName?: string;
      isActive?: boolean;
      isSandbox?: boolean;
      rawApiKey?: string;
      senderId?: string;
      voiceCallerId?: string;
      smsRateBdt?: number;
      voiceRateBdtPerMin?: number;
      smsBalance?: number;
      voiceBalanceMinutes?: number;
      webhookUrl?: string;
    },
    userContext: UserContext
  ): CommunicationProviderConfig {
    const updated = this.repository.updateProviderConfig(institutionId, {
      ...payload,
      rawApiKey: payload.rawApiKey,
    });
    return updated;
  }

  /**
   * Test Connection with Provider
   */
  public async testConnection(institutionId: string): Promise<ServerTestConnectionResult> {
    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);
    const res = await adapter.testConnection(config);

    if (res.success) {
      this.repository.updateProviderConfig(institutionId, {
        connectionStatus: 'connected',
        lastConnectedAt: new Date().toISOString(),
        smsBalance: res.smsBalance,
        voiceBalanceMinutes: res.voiceMinutes,
      });
    } else {
      this.repository.updateProviderConfig(institutionId, {
        connectionStatus: 'error',
      });
    }

    return res;
  }

  /**
   * Send SMS Broadcast (Immediate or Scheduled)
   */
  public async sendSms(
    institutionId: string,
    req: ServerSendSmsRequest,
    userContext: UserContext
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage; error?: string }> {
    // 1. Validation
    if (!req.title?.trim()) {
      return { success: false, message: 'বার্তার শিরোনাম প্রদান করুন।', error: 'TITLE_REQUIRED' };
    }
    if (!req.content?.trim()) {
      return { success: false, message: 'বার্তার বিষয়বস্তু প্রদান করুন।', error: 'CONTENT_REQUIRED' };
    }
    if (!req.recipients || !Array.isArray(req.recipients) || req.recipients.length === 0) {
      return { success: false, message: 'কমপক্ষে একজন প্রাপক নির্বাচন করুন।', error: 'NO_RECIPIENTS' };
    }

    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);

    // Calculate Unicode/parts
    const isUnicode = /[\u0980-\u09FF]/.test(req.content);
    const maxChars = isUnicode ? 70 : 160;
    const partsCount = Math.ceil(req.content.length / maxChars) || 1;
    const costEstimate = req.recipients.length * partsCount * config.smsRateBdt;

    // Check balance if not sandbox
    if (!config.isSandbox && config.smsBalance < req.recipients.length * partsCount) {
      return {
        success: false,
        message: `অপর্যাপ্ত এসএমএস ব্যালেন্স! প্রয়োজন: ${req.recipients.length * partsCount}, বর্তমান ব্যালেন্স: ${config.smsBalance}`,
        error: 'INSUFFICIENT_BALANCE',
      };
    }

    const isScheduled = !!req.scheduledAt && new Date(req.scheduledAt).getTime() > Date.now();
    const nowIso = new Date().toISOString();
    const messageId = `msg_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `idem_${messageId}`;

    const initialRecipients: IndividualRecipient[] = req.recipients.map((r, idx) => ({
      id: r.id || `rec_${Date.now()}_${idx + 1}`,
      name: r.name || 'অজানা',
      phone: r.phone.replace(/[^0-9]/g, ''),
      role: r.role || 'guardian',
      studentId: r.studentId,
      studentName: r.studentName,
      guardianName: r.guardianName,
      className: r.className,
      section: r.section,
      rollNumber: r.rollNumber,
      dueAmount: r.dueAmount,
      status: isScheduled ? 'scheduled' : 'queued',
      costUnits: partsCount,
    }));

    const messageRecord: CommunicationMessage = {
      id: messageId,
      institutionId,
      title: req.title.trim(),
      type: 'sms',
      channel: 'sms',
      content: req.content.trim(),
      recipientGroup: req.recipientGroup || 'custom_numbers',
      targetClassId: req.targetClassId,
      targetClassName: req.targetClassName,
      targetSection: req.targetSection,
      recipients: initialRecipients,
      totalRecipients: initialRecipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      pendingCount: isScheduled ? initialRecipients.length : 0,
      status: isScheduled ? 'scheduled' : 'queued',
      scheduledAt: isScheduled ? req.scheduledAt : undefined,
      senderId: userContext.userId,
      senderName: userContext.userName,
      senderRole: userContext.userRole,
      templateId: req.templateId,
      templateName: req.templateName,
      providerId: config.providerId,
      providerName: config.providerName,
      costEstimate,
      retryCount: 0,
      maxRetries: 3,
      idempotencyKey,
      smsConfig: {
        senderId: config.senderId,
        isUnicode,
        messagePartsCount: partsCount,
        enableFlashSms: req.smsConfig?.enableFlashSms,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Save initial record to persistent store
    this.repository.addMessage(messageRecord);

    // If scheduled, log and return immediately
    if (isScheduled) {
      this.repository.addExecutionLog({
        id: `log_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'scheduled_created',
        status: 'scheduled',
        providerId: config.providerId,
        senderId: userContext.userId,
        senderName: userContext.userName,
        totalRecipients: initialRecipients.length,
        deliveredCount: 0,
        failedCount: 0,
        costIncurred: 0,
        details: `এসএমএস শিডিউল করা হয়েছে। নির্ধারিত সময়: ${new Date(req.scheduledAt!).toLocaleString('bn-BD')}`,
        executedBy: userContext.userName,
        executedAt: nowIso,
      });

      return {
        success: true,
        message: `এসএমএস বার্তাটি সফলভাবে শিডিউল করা হয়েছে (${new Date(req.scheduledAt!).toLocaleString('bn-BD')})।`,
        data: messageRecord,
      };
    }

    // Execute Immediate Dispatch
    return this.executeSmsDispatch(institutionId, messageRecord, config, adapter, userContext.userName);
  }

  /**
   * Internal SMS Dispatch Executor (Used for Immediate Send, Scheduler Tick, and Send Now)
   */
  private async executeSmsDispatch(
    institutionId: string,
    messageRecord: CommunicationMessage,
    config: any,
    adapter: IServerProviderAdapter,
    triggerSource: string
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage; error?: string }> {
    const jobKey = `${institutionId}_${messageRecord.id}`;
    if (this.activeProcessingJobs.has(jobKey)) {
      return { success: false, message: 'বার্তাটি ইতিমধ্যে প্রক্রিয়াকরণ হচ্ছে।', error: 'ALREADY_PROCESSING' };
    }

    this.activeProcessingJobs.add(jobKey);

    const startTime = new Date().toISOString();
    this.repository.updateMessage(institutionId, messageRecord.id, {
      status: 'processing',
      processingStartedAt: startTime,
    });

    this.repository.addExecutionLog({
      id: `log_proc_${Date.now()}`,
      messageId: messageRecord.id,
      institutionId,
      action: 'processing_started',
      status: 'processing',
      providerId: config.providerId,
      senderId: messageRecord.senderId,
      senderName: messageRecord.senderName,
      totalRecipients: messageRecord.totalRecipients,
      deliveredCount: 0,
      failedCount: 0,
      costIncurred: 0,
      details: `টেলিকম গেটওয়েতে প্রেরণের প্রক্রিয়া শুরু হয়েছে (${triggerSource})`,
      executedBy: triggerSource,
      executedAt: startTime,
    });

    try {
      const providerRes = await adapter.dispatchSms(messageRecord, config);

      const resultMap = new Map<string, { status: any; externalMsgId?: string; failedReason?: string }>();
      providerRes.recipientResults.forEach((res) => {
        resultMap.set(res.phone, res);
      });

      const updatedRecipients = messageRecord.recipients.map((rec) => {
        const item = resultMap.get(rec.phone);
        const finalStatus = item ? item.status : 'delivered';
        return {
          ...rec,
          status: finalStatus,
          sentAt: new Date().toISOString(),
          deliveredAt: finalStatus === 'delivered' ? new Date().toISOString() : undefined,
          failedReason: item?.failedReason,
          externalMsgId: item?.externalMsgId,
        };
      });

      const finalStatus = providerRes.totalDelivered > 0 ? 'delivered' : 'failed';
      const finishTime = new Date().toISOString();

      const updatedMsg = this.repository.updateMessage(institutionId, messageRecord.id, {
        recipients: updatedRecipients,
        sentCount: providerRes.totalSent,
        deliveredCount: providerRes.totalDelivered,
        failedCount: providerRes.totalFailed,
        pendingCount: 0,
        status: finalStatus,
        sentAt: startTime,
        completedAt: finishTime,
        actualCost: providerRes.costIncurred,
      });

      // Deduct balance
      const partsCount = messageRecord.smsConfig?.messagePartsCount || 1;
      const newSmsBal = Math.max(0, config.smsBalance - providerRes.totalDelivered * partsCount);
      this.repository.updateProviderConfig(institutionId, { smsBalance: newSmsBal });

      // Add completion log
      this.repository.addExecutionLog({
        id: `log_comp_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'dispatched',
        status: finalStatus,
        providerId: config.providerId,
        senderId: messageRecord.senderId,
        senderName: messageRecord.senderName,
        totalRecipients: messageRecord.totalRecipients,
        deliveredCount: providerRes.totalDelivered,
        failedCount: providerRes.totalFailed,
        costIncurred: providerRes.costIncurred,
        details: providerRes.message,
        executedBy: triggerSource,
        executedAt: finishTime,
      });

      return {
        success: providerRes.success,
        message: providerRes.message,
        data: updatedMsg || messageRecord,
      };
    } catch (err: any) {
      this.repository.updateMessage(institutionId, messageRecord.id, {
        status: 'failed',
        failedCount: messageRecord.totalRecipients,
        pendingCount: 0,
        completedAt: new Date().toISOString(),
      });

      this.repository.addExecutionLog({
        id: `log_err_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'failed',
        status: 'failed',
        providerId: config.providerId,
        senderId: messageRecord.senderId,
        senderName: messageRecord.senderName,
        totalRecipients: messageRecord.totalRecipients,
        deliveredCount: 0,
        failedCount: messageRecord.totalRecipients,
        costIncurred: 0,
        details: `ব্যর্থতার কারণ: ${err?.message || 'Gateway error'}`,
        executedBy: triggerSource,
        executedAt: new Date().toISOString(),
      });

      return {
        success: false,
        message: `এসএমএস প্রেরণ ব্যর্থ: ${err?.message || 'Gateway error'}`,
        error: 'DISPATCH_FAILED',
      };
    } finally {
      this.activeProcessingJobs.delete(jobKey);
    }
  }

  /**
   * Send Voice Call Broadcast (Immediate or Scheduled)
   */
  public async sendVoiceCall(
    institutionId: string,
    req: ServerSendVoiceRequest,
    userContext: UserContext
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage; error?: string }> {
    if (!req.title?.trim()) {
      return { success: false, message: 'ভয়েস বার্তার শিরোনাম প্রদান করুন।', error: 'TITLE_REQUIRED' };
    }
    if (!req.content?.trim()) {
      return { success: false, message: 'ভয়েস স্ক্রিপ্ট বা অডিও বার্তা প্রদান করুন।', error: 'CONTENT_REQUIRED' };
    }
    if (!req.recipients || !Array.isArray(req.recipients) || req.recipients.length === 0) {
      return { success: false, message: 'কমপক্ষে একজন প্রাপক নির্বাচন করুন।', error: 'NO_RECIPIENTS' };
    }

    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);
    const costEstimate = req.recipients.length * config.voiceRateBdtPerMin;

    if (!config.isSandbox && config.voiceBalanceMinutes < req.recipients.length) {
      return {
        success: false,
        message: `অপর্যাপ্ত ভয়েস মিনিট ব্যালেন্স! প্রয়োজন: ${req.recipients.length} মিনিট, বর্তমান ব্যালেন্স: ${config.voiceBalanceMinutes} মিনিট`,
        error: 'INSUFFICIENT_BALANCE',
      };
    }

    const isScheduled = !!req.scheduledAt && new Date(req.scheduledAt).getTime() > Date.now();
    const nowIso = new Date().toISOString();
    const messageId = `msg_voice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `idem_${messageId}`;

    const initialRecipients: IndividualRecipient[] = req.recipients.map((r, idx) => ({
      id: r.id || `rec_voice_${Date.now()}_${idx + 1}`,
      name: r.name || 'অজানা',
      phone: r.phone.replace(/[^0-9]/g, ''),
      role: r.role || 'guardian',
      studentId: r.studentId,
      studentName: r.studentName,
      guardianName: r.guardianName,
      className: r.className,
      section: r.section,
      rollNumber: r.rollNumber,
      dueAmount: r.dueAmount,
      status: isScheduled ? 'scheduled' : 'queued',
      costUnits: 1,
    }));

    const messageRecord: CommunicationMessage = {
      id: messageId,
      institutionId,
      title: req.title.trim(),
      type: 'voice_call',
      channel: 'voice_call',
      content: req.content.trim(),
      recipientGroup: req.recipientGroup || 'custom_numbers',
      targetClassId: req.targetClassId,
      targetClassName: req.targetClassName,
      targetSection: req.targetSection,
      recipients: initialRecipients,
      totalRecipients: initialRecipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      pendingCount: isScheduled ? initialRecipients.length : 0,
      status: isScheduled ? 'scheduled' : 'queued',
      scheduledAt: isScheduled ? req.scheduledAt : undefined,
      senderId: userContext.userId,
      senderName: userContext.userName,
      senderRole: userContext.userRole,
      templateId: req.templateId,
      templateName: req.templateName,
      providerId: config.providerId,
      providerName: config.providerName,
      costEstimate,
      retryCount: 0,
      maxRetries: 3,
      idempotencyKey,
      voiceConfig: {
        voiceGender: req.voiceConfig?.voiceGender || 'female',
        language: req.voiceConfig?.language || 'bn-BD',
        speechRate: req.voiceConfig?.speechRate || 1.0,
        maxDurationSeconds: req.voiceConfig?.maxDurationSeconds || 60,
        retryAttempts: req.voiceConfig?.retryAttempts || 2,
        ivrPromptDigits: req.voiceConfig?.ivrPromptDigits,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.repository.addMessage(messageRecord);

    if (isScheduled) {
      this.repository.addExecutionLog({
        id: `log_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'scheduled_created',
        status: 'scheduled',
        providerId: config.providerId,
        senderId: userContext.userId,
        senderName: userContext.userName,
        totalRecipients: initialRecipients.length,
        deliveredCount: 0,
        failedCount: 0,
        costIncurred: 0,
        details: `ভয়েস কল ব্রডকাস্ট শিডিউল করা হয়েছে (${new Date(req.scheduledAt!).toLocaleString('bn-BD')})`,
        executedBy: userContext.userName,
        executedAt: nowIso,
      });

      return {
        success: true,
        message: `ভয়েস কল ব্রডকাস্ট সফলভাবে শিডিউল করা হয়েছে (${new Date(req.scheduledAt!).toLocaleString('bn-BD')})।`,
        data: messageRecord,
      };
    }

    return this.executeVoiceDispatch(institutionId, messageRecord, config, adapter, userContext.userName);
  }

  /**
   * Internal Voice Dispatch Executor
   */
  private async executeVoiceDispatch(
    institutionId: string,
    messageRecord: CommunicationMessage,
    config: any,
    adapter: IServerProviderAdapter,
    triggerSource: string
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage; error?: string }> {
    const jobKey = `${institutionId}_${messageRecord.id}`;
    if (this.activeProcessingJobs.has(jobKey)) {
      return { success: false, message: 'ভয়েস কল ইতিমধ্যে প্রক্রিয়াকরণ হচ্ছে।', error: 'ALREADY_PROCESSING' };
    }

    this.activeProcessingJobs.add(jobKey);

    const startTime = new Date().toISOString();
    this.repository.updateMessage(institutionId, messageRecord.id, {
      status: 'processing',
      processingStartedAt: startTime,
    });

    this.repository.addExecutionLog({
      id: `log_voice_proc_${Date.now()}`,
      messageId: messageRecord.id,
      institutionId,
      action: 'processing_started',
      status: 'processing',
      providerId: config.providerId,
      senderId: messageRecord.senderId,
      senderName: messageRecord.senderName,
      totalRecipients: messageRecord.totalRecipients,
      deliveredCount: 0,
      failedCount: 0,
      costIncurred: 0,
      details: `ভয়েস কল টেলিকম ট্রাঙ্কে সংযোগ শুরু হয়েছে (${triggerSource})`,
      executedBy: triggerSource,
      executedAt: startTime,
    });

    try {
      const providerRes = await adapter.dispatchVoiceCall(messageRecord, config);

      const resultMap = new Map<string, { status: any; externalMsgId?: string; failedReason?: string }>();
      providerRes.recipientResults.forEach((res) => {
        resultMap.set(res.phone, res);
      });

      const updatedRecipients = messageRecord.recipients.map((rec) => {
        const item = resultMap.get(rec.phone);
        const finalStatus = item ? item.status : 'delivered';
        return {
          ...rec,
          status: finalStatus,
          sentAt: new Date().toISOString(),
          deliveredAt: finalStatus === 'delivered' ? new Date().toISOString() : undefined,
          failedReason: item?.failedReason,
          externalMsgId: item?.externalMsgId,
        };
      });

      const finalStatus = providerRes.totalDelivered > 0 ? 'delivered' : 'failed';
      const finishTime = new Date().toISOString();

      const updatedMsg = this.repository.updateMessage(institutionId, messageRecord.id, {
        recipients: updatedRecipients,
        sentCount: providerRes.totalSent,
        deliveredCount: providerRes.totalDelivered,
        failedCount: providerRes.totalFailed,
        pendingCount: 0,
        status: finalStatus,
        sentAt: startTime,
        completedAt: finishTime,
        actualCost: providerRes.costIncurred,
      });

      const newVoiceBal = Math.max(0, config.voiceBalanceMinutes - providerRes.totalDelivered);
      this.repository.updateProviderConfig(institutionId, { voiceBalanceMinutes: newVoiceBal });

      this.repository.addExecutionLog({
        id: `log_voice_comp_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'dispatched',
        status: finalStatus,
        providerId: config.providerId,
        senderId: messageRecord.senderId,
        senderName: messageRecord.senderName,
        totalRecipients: messageRecord.totalRecipients,
        deliveredCount: providerRes.totalDelivered,
        failedCount: providerRes.totalFailed,
        costIncurred: providerRes.costIncurred,
        details: providerRes.message,
        executedBy: triggerSource,
        executedAt: finishTime,
      });

      return {
        success: providerRes.success,
        message: providerRes.message,
        data: updatedMsg || messageRecord,
      };
    } catch (err: any) {
      this.repository.updateMessage(institutionId, messageRecord.id, {
        status: 'failed',
        failedCount: messageRecord.totalRecipients,
        pendingCount: 0,
        completedAt: new Date().toISOString(),
      });

      this.repository.addExecutionLog({
        id: `log_voice_err_${Date.now()}`,
        messageId: messageRecord.id,
        institutionId,
        action: 'failed',
        status: 'failed',
        providerId: config.providerId,
        senderId: messageRecord.senderId,
        senderName: messageRecord.senderName,
        totalRecipients: messageRecord.totalRecipients,
        deliveredCount: 0,
        failedCount: messageRecord.totalRecipients,
        costIncurred: 0,
        details: `ব্যর্থতার কারণ: ${err?.message || 'Voice dispatch error'}`,
        executedBy: triggerSource,
        executedAt: new Date().toISOString(),
      });

      return {
        success: false,
        message: `ভয়েস কল ব্রডকাস্ট ব্যর্থ: ${err?.message || 'Gateway error'}`,
        error: 'DISPATCH_FAILED',
      };
    } finally {
      this.activeProcessingJobs.delete(jobKey);
    }
  }

  /**
   * Process Scheduled Job from Background Worker
   */
  public async processScheduledJob(institutionId: string, messageId: string): Promise<boolean> {
    const msg = this.repository.getMessageById(institutionId, messageId);
    if (!msg) return false;

    const isExecutable =
      msg.status === 'processing' ||
      msg.status === 'scheduled' ||
      (msg.status === 'pending' && !!msg.scheduledAt);
    if (!isExecutable) return false;

    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);

    if (msg.type === 'sms') {
      const res = await this.executeSmsDispatch(institutionId, msg, config, adapter, 'Server Background Scheduler');
      return res.success;
    } else {
      const res = await this.executeVoiceDispatch(institutionId, msg, config, adapter, 'Server Background Scheduler');
      return res.success;
    }
  }

  /**
   * Send Now: Immediate trigger for a scheduled message
   */
  public async sendNow(
    institutionId: string,
    messageId: string,
    userContext: UserContext
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage }> {
    const msg = this.repository.getMessageById(institutionId, messageId);
    if (!msg) {
      return { success: false, message: 'বার্তাটি খুঁজে পাওয়া যায়নি।' };
    }

    if (msg.status !== 'scheduled' && msg.status !== 'pending') {
      return {
        success: false,
        message: `বার্তাটি ইতিমধ্যে '${msg.status}' অবস্থায় রয়েছে, এখনই পাঠানো সম্ভব নয়।`,
      };
    }

    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);

    this.repository.addExecutionLog({
      id: `log_send_now_${Date.now()}`,
      messageId: msg.id,
      institutionId,
      action: 'send_now',
      status: 'queued',
      providerId: config.providerId,
      senderId: userContext.userId,
      senderName: userContext.userName,
      totalRecipients: msg.totalRecipients,
      deliveredCount: 0,
      failedCount: 0,
      costIncurred: 0,
      details: 'ইউজার কর্তৃক শিডিউল অপেক্ষা ছাড়াই ম্যানুয়ালি এখনই প্রেরণ চালু করা হয়েছে।',
      executedBy: userContext.userName,
      executedAt: new Date().toISOString(),
    });

    if (msg.type === 'sms') {
      return this.executeSmsDispatch(institutionId, msg, config, adapter, `Send Now (${userContext.userName})`);
    } else {
      return this.executeVoiceDispatch(institutionId, msg, config, adapter, `Send Now (${userContext.userName})`);
    }
  }

  /**
   * Cancel Scheduled Message (Guarded by Authorization)
   */
  public cancelScheduledMessage(
    institutionId: string,
    messageId: string,
    userContext: UserContext
  ): boolean {
    const msg = this.repository.getMessageById(institutionId, messageId);
    if (msg && (msg.status === 'scheduled' || msg.status === 'pending')) {
      this.repository.updateMessage(institutionId, messageId, {
        status: 'cancelled',
        pendingCount: 0,
      });

      this.repository.addExecutionLog({
        id: `log_cancel_${Date.now()}`,
        messageId,
        institutionId,
        action: 'cancelled',
        status: 'cancelled',
        providerId: msg.providerId,
        senderId: userContext.userId,
        senderName: userContext.userName,
        totalRecipients: msg.totalRecipients,
        deliveredCount: 0,
        failedCount: 0,
        costIncurred: 0,
        details: 'শিডিউল করা বার্তা বাতিল করা হয়েছে।',
        executedBy: userContext.userName,
        executedAt: new Date().toISOString(),
      });

      return true;
    }
    return false;
  }

  /**
   * Resend to Failed Recipients with Retry Limit & Idempotency / Duplicate-Send Protection
   */
  public async resendFailed(
    institutionId: string,
    messageId: string,
    userContext: UserContext
  ): Promise<{ success: boolean; message: string; data?: CommunicationMessage }> {
    const existing = this.repository.getMessageById(institutionId, messageId);
    if (!existing) {
      return { success: false, message: 'বার্তাটি খুঁজে পাওয়া যায়নি।' };
    }

    const currentRetryCount = existing.retryCount || 0;
    const maxRetries = existing.maxRetries || 3;

    // Retry limit check
    if (currentRetryCount >= maxRetries) {
      return {
        success: false,
        message: `সর্বোচ্চ ${maxRetries} বার পুনঃপ্রেরণের সীমা অতিক্রম করেছে। নতুন কোনো ব্যর্থ প্রাপক নেই।`,
      };
    }

    // Duplicate-Send Protection: Only pick recipients that failed, exclude delivered
    const failedRecipients = (existing.recipients || []).filter((r) => r.status === 'failed');
    if (failedRecipients.length === 0) {
      return { success: false, message: 'এই বার্তায় কোনো ব্যর্থ প্রাপক অবশিষ্ট নেই।' };
    }

    const config = this.repository.getProviderConfig(institutionId);
    const adapter = this.getAdapter(config.providerId);
    const newRetryCount = currentRetryCount + 1;
    const retryIdempotency = `${messageId}_retry_${newRetryCount}`;

    // Create a temporary message copy for dispatching only failed recipients
    const retrySubMessage: CommunicationMessage = {
      ...existing,
      id: `${existing.id}_retry_${newRetryCount}`,
      recipients: failedRecipients.map((r) => ({ ...r, status: 'processing' })),
      totalRecipients: failedRecipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      pendingCount: 0,
      status: 'processing',
    };

    try {
      const providerRes =
        existing.type === 'sms'
          ? await adapter.dispatchSms(retrySubMessage, config)
          : await adapter.dispatchVoiceCall(retrySubMessage, config);

      const resultMap = new Map<string, { status: any; externalMsgId?: string; failedReason?: string }>();
      providerRes.recipientResults.forEach((res) => {
        resultMap.set(res.phone, res);
      });

      // Merge updated results back into the parent message's recipient list
      let newlyDelivered = 0;
      let stillFailed = 0;

      const mergedRecipients = existing.recipients.map((rec) => {
        // If recipient was already delivered in previous runs, leave untouched (Duplicate Protection)
        if (rec.status === 'delivered') {
          return rec;
        }

        const retryResult = resultMap.get(rec.phone);
        if (retryResult) {
          if (retryResult.status === 'delivered') {
            newlyDelivered++;
            return {
              ...rec,
              status: 'delivered' as const,
              deliveredAt: new Date().toISOString(),
              failedReason: undefined,
              externalMsgId: retryResult.externalMsgId,
            };
          } else {
            stillFailed++;
            return {
              ...rec,
              status: 'failed' as const,
              failedReason: retryResult.failedReason || rec.failedReason,
              externalMsgId: retryResult.externalMsgId,
            };
          }
        }
        return rec;
      });

      const totalDelivered = existing.recipients.filter((r) => r.status === 'delivered').length + newlyDelivered;
      const totalFailed = mergedRecipients.filter((r) => r.status === 'failed').length;

      const updatedParent = this.repository.updateMessage(institutionId, messageId, {
        recipients: mergedRecipients,
        deliveredCount: totalDelivered,
        failedCount: totalFailed,
        status: totalFailed === 0 ? 'delivered' : 'failed',
        retryCount: newRetryCount,
        lastRetryAt: new Date().toISOString(),
        actualCost: (existing.actualCost || 0) + providerRes.costIncurred,
      });

      // Deduct balance for newly delivered units
      if (existing.type === 'sms') {
        const partsCount = existing.smsConfig?.messagePartsCount || 1;
        const newBal = Math.max(0, config.smsBalance - newlyDelivered * partsCount);
        this.repository.updateProviderConfig(institutionId, { smsBalance: newBal });
      } else {
        const newBal = Math.max(0, config.voiceBalanceMinutes - newlyDelivered);
        this.repository.updateProviderConfig(institutionId, { voiceBalanceMinutes: newBal });
      }

      this.repository.addExecutionLog({
        id: `log_retry_${Date.now()}`,
        messageId,
        institutionId,
        action: 'retry_dispatched',
        status: totalFailed === 0 ? 'delivered' : 'failed',
        providerId: config.providerId,
        senderId: userContext.userId,
        senderName: userContext.userName,
        totalRecipients: failedRecipients.length,
        deliveredCount: newlyDelivered,
        failedCount: stillFailed,
        costIncurred: providerRes.costIncurred,
        details: `পুনঃপ্রেরণ (${newRetryCount}/${maxRetries}): ${newlyDelivered} সফল, ${stillFailed} ব্যর্থ`,
        executedBy: userContext.userName,
        executedAt: new Date().toISOString(),
      });

      return {
        success: providerRes.success,
        message: `পুনঃপ্রেরণ সম্পন্ন: ${newlyDelivered} জন সফলভাবে পৌঁছেছে, ${stillFailed} জন ব্যর্থ।`,
        data: updatedParent || existing,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `পুনঃপ্রেরণ ব্যর্থ: ${err?.message || 'Gateway error'}`,
      };
    }
  }

  public getMessages(institutionId: string): CommunicationMessage[] {
    return this.repository.getMessages(institutionId);
  }

  public getMessageById(institutionId: string, id: string): CommunicationMessage | undefined {
    return this.repository.getMessageById(institutionId, id);
  }

  public getTemplates(institutionId: string): any[] {
    return this.repository.getTemplates(institutionId);
  }

  public saveTemplate(institutionId: string, tmpl: any): any {
    if (tmpl.id) {
      const updated = this.repository.updateTemplate(institutionId, tmpl.id, tmpl);
      if (updated) return updated;
    }
    const newTmpl = {
      ...tmpl,
      id: `tmpl_${Date.now()}`,
      institutionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.repository.addTemplate(newTmpl);
  }

  public deleteTemplate(institutionId: string, templateId: string): boolean {
    return this.repository.deleteTemplate(institutionId, templateId);
  }

  public getStatistics(institutionId: string): CommunicationStatistics {
    return this.repository.getStatistics(institutionId);
  }

  public getExecutionLogs(institutionId: string, messageId?: string): CommunicationExecutionLog[] {
    return this.repository.getExecutionLogs(institutionId, messageId);
  }
}

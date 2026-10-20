import {
  CommunicationMessage,
  CommunicationTemplate,
  CommunicationProviderConfig,
  CommunicationStatistics,
  CommunicationExecutionLog,
} from '../../../types/communication';
import { StoredProviderConfig } from '../types';

/**
 * Interface defining the persistence repository contract for the Communication Module.
 * Ensures strict multi-institution data isolation, transactional consistency,
 * idempotency, and decoupling of business logic from physical storage layers.
 */
export interface ICommunicationRepository {
  // --- Provider Configurations (Institution Isolated) ---
  getProviderConfig(institutionId: string): Promise<StoredProviderConfig> | StoredProviderConfig;
  getMaskedProviderConfig(institutionId: string): Promise<CommunicationProviderConfig> | CommunicationProviderConfig;
  updateProviderConfig(
    institutionId: string,
    updates: Partial<StoredProviderConfig> & { rawApiKey?: string }
  ): Promise<CommunicationProviderConfig> | CommunicationProviderConfig;

  // --- Messages & Broadcasts (Institution Isolated) ---
  getMessages(
    institutionId: string,
    filter?: { status?: string; type?: string; limit?: number; offset?: number }
  ): Promise<CommunicationMessage[]> | CommunicationMessage[];
  getMessageById(
    institutionId: string,
    messageId: string
  ): Promise<CommunicationMessage | undefined> | CommunicationMessage | undefined;
  addMessage(message: CommunicationMessage): Promise<CommunicationMessage> | CommunicationMessage;
  updateMessage(
    institutionId: string,
    messageId: string,
    updates: Partial<CommunicationMessage>
  ): Promise<CommunicationMessage | null> | CommunicationMessage | null;
  deleteMessage(institutionId: string, messageId: string): Promise<boolean> | boolean;

  // --- Scheduler Worker, Locking & Idempotency ---
  getDueScheduledMessages(): Promise<CommunicationMessage[]> | CommunicationMessage[];
  claimScheduledMessage(
    institutionId: string,
    messageId: string,
    workerId: string,
    lockDurationMs?: number
  ): Promise<CommunicationMessage | null> | (CommunicationMessage | null);
  recoverStuckProcessingJobs(maxProcessingTimeMs?: number): Promise<number> | number;

  // --- Execution & Audit Logs (Institution Isolated) ---
  addExecutionLog(log: CommunicationExecutionLog): Promise<CommunicationExecutionLog> | CommunicationExecutionLog;
  getExecutionLogs(
    institutionId: string,
    messageId?: string,
    limit?: number
  ): Promise<CommunicationExecutionLog[]> | CommunicationExecutionLog[];

  // --- Templates (Institution Isolated) ---
  getTemplates(institutionId: string): Promise<CommunicationTemplate[]> | CommunicationTemplate[];
  getTemplateById(
    institutionId: string,
    templateId: string
  ): Promise<CommunicationTemplate | undefined> | CommunicationTemplate | undefined;
  addTemplate(template: CommunicationTemplate): Promise<CommunicationTemplate> | CommunicationTemplate;
  updateTemplate(
    institutionId: string,
    templateId: string,
    updates: Partial<CommunicationTemplate>
  ): Promise<CommunicationTemplate | null> | CommunicationTemplate | null;
  deleteTemplate(institutionId: string, templateId: string): Promise<boolean> | boolean;

  // --- Statistics & Aggregations (Institution Isolated) ---
  getStatistics(institutionId: string): Promise<CommunicationStatistics> | CommunicationStatistics;
}

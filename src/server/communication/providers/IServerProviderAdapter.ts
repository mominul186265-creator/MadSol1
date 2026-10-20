import { StoredProviderConfig, ServerProviderResult, ServerTestConnectionResult } from '../types';
import { CommunicationMessage } from '../../../types/communication';

export interface IServerProviderAdapter {
  readonly providerId: string;
  readonly providerName: string;
  readonly isSandbox: boolean;

  testConnection(config: StoredProviderConfig): Promise<ServerTestConnectionResult>;

  dispatchSms(
    message: CommunicationMessage,
    config: StoredProviderConfig
  ): Promise<ServerProviderResult>;

  dispatchVoiceCall(
    message: CommunicationMessage,
    config: StoredProviderConfig
  ): Promise<ServerProviderResult>;
}

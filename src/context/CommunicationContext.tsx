import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CommunicationMessage,
  CommunicationProviderConfig,
  CommunicationStatistics,
  CommunicationStatus,
  CommunicationTemplate,
  ProviderId,
  RecipientGroupType,
  SmsOptions,
  VoiceCallOptions,
  IndividualRecipient,
} from '../types/communication';
import {
  INITIAL_COMMUNICATION_TEMPLATES,
  INITIAL_PROVIDER_CONFIG,
  INITIAL_STATISTICS,
} from '../data/communicationData';
import { CommunicationGatewayService } from '../services/communication/CommunicationGatewayService';
import { ProviderConnectionTestResult } from '../services/communication/ICommunicationProvider';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

interface SendSmsParams {
  title: string;
  content: string;
  recipientGroup: RecipientGroupType;
  targetClassId?: string;
  targetClassName?: string;
  targetSection?: string;
  recipients: IndividualRecipient[];
  templateId?: string;
  smsOptions?: SmsOptions;
  scheduledAt?: string;
}

interface SendVoiceCallParams {
  title: string;
  voiceScript: string;
  recipientGroup: RecipientGroupType;
  targetClassId?: string;
  targetClassName?: string;
  targetSection?: string;
  recipients: IndividualRecipient[];
  templateId?: string;
  voiceConfig: VoiceCallOptions;
  scheduledAt?: string;
}

interface CommunicationContextType {
  providerConfig: CommunicationProviderConfig;
  messages: CommunicationMessage[];
  templates: CommunicationTemplate[];
  scheduledMessages: CommunicationMessage[];
  statistics: CommunicationStatistics;
  gateway: CommunicationGatewayService;
  isSending: boolean;
  activeProviderId: ProviderId;

  // Actions
  sendSmsBroadcast: (params: SendSmsParams) => Promise<boolean>;
  sendVoiceBroadcast: (params: SendVoiceCallParams) => Promise<boolean>;
  sendNowScheduledBroadcast: (id: string) => Promise<boolean>;
  cancelScheduledBroadcast: (id: string) => Promise<void>;
  resendFailedRecipients: (messageId: string) => Promise<boolean>;
  createTemplate: (template: Omit<CommunicationTemplate, 'id' | 'institutionId' | 'usageCount' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<CommunicationTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  updateProviderSettings: (config: Partial<CommunicationProviderConfig>, rawApiKey?: string, rawSecretKey?: string) => Promise<ProviderConnectionTestResult>;
  testProviderConnection: (providerId?: ProviderId, apiKey?: string, secretKey?: string) => Promise<ProviderConnectionTestResult>;
  refreshBalances: () => Promise<void>;
  exportDeliveryReportCsv: (filteredMessages?: CommunicationMessage[]) => void;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const gateway = useMemo(() => CommunicationGatewayService.getInstance(), []);

  const [providerConfig, setProviderConfig] = useState<CommunicationProviderConfig>(INITIAL_PROVIDER_CONFIG);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(INITIAL_COMMUNICATION_TEMPLATES);
  const [statistics, setStatistics] = useState<CommunicationStatistics>(INITIAL_STATISTICS);
  const [isSending, setIsSending] = useState(false);

  // Helper to build headers with authentication & institution isolation
  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'x-user-id': user?.id || 'usr-001',
      'x-user-name': encodeURIComponent(user?.name || 'মুহতামিম / প্রধান পরিচালক'),
      'x-user-role': user?.role_id || 'super_admin',
      'x-institution-id': institution?.id || user?.institution_id || 'inst-001',
    };
  }, [user, institution]);

  // Load server-side data for the active institution
  const fetchCommunicationData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();

      // 1. Fetch masked provider status
      const statusRes = await fetch('/api/communication/status', { headers }).catch(() => null);
      if (statusRes && statusRes.ok) {
        const data = await statusRes.json();
        if (data.success && data.data) {
          setProviderConfig(data.data);
        }
      }

      // 2. Fetch institution messages
      const msgRes = await fetch('/api/communication/messages', { headers }).catch(() => null);
      if (msgRes && msgRes.ok) {
        const data = await msgRes.json();
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data);
        }
      }

      // 3. Fetch institution templates
      const tmplRes = await fetch('/api/communication/templates', { headers }).catch(() => null);
      if (tmplRes && tmplRes.ok) {
        const data = await tmplRes.json();
        if (data.success && Array.isArray(data.data)) {
          setTemplates(data.data);
        }
      }

      // 4. Fetch real aggregated statistics
      const statsRes = await fetch('/api/communication/statistics', { headers }).catch(() => null);
      if (statsRes && statsRes.ok) {
        const data = await statsRes.json();
        if (data.success && data.data) {
          setStatistics(data.data);
        }
      }
    } catch (err) {
      console.warn('[CommunicationContext] Server sync error:', err);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchCommunicationData();
    // Auto-refresh periodically to reflect server-side background worker job progress
    const interval = setInterval(() => {
      fetchCommunicationData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchCommunicationData]);

  // Scheduled messages are messages in scheduled status or pending with scheduledAt
  const scheduledMessages = useMemo(() => {
    return messages.filter(
      (m) => m.status === 'scheduled' || (m.status === 'pending' && !!m.scheduledAt)
    );
  }, [messages]);

  /**
   * Refresh Balance from backend
   */
  const refreshBalances = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/communication/test-connection', {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProviderConfig((prev) => ({
            ...prev,
            smsBalance: data.smsBalance,
            voiceBalanceMinutes: data.voiceMinutes,
            lastConnectedAt: new Date().toISOString(),
            connectionStatus: 'connected',
          }));
        }
      }
    } catch {
      // Ignore silent refresh error
    }
  };

  /**
   * Send SMS Broadcast (Delegates to /api/communication/send-sms)
   */
  const sendSmsBroadcast = async (params: SendSmsParams): Promise<boolean> => {
    if (params.recipients.length === 0) {
      showToast(isBn ? 'অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন।' : 'Please select at least one recipient.', 'error');
      return false;
    }

    if (!params.content.trim()) {
      showToast(isBn ? 'এসএমএস বার্তা লিখুন।' : 'Message content cannot be empty.', 'error');
      return false;
    }

    setIsSending(true);

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/communication/send-sms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: params.title,
          content: params.content,
          recipientGroup: params.recipientGroup,
          targetClassId: params.targetClassId,
          targetClassName: params.targetClassName,
          targetSection: params.targetSection,
          recipients: params.recipients,
          templateId: params.templateId,
          smsConfig: params.smsOptions,
          scheduledAt: params.scheduledAt,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        const errorMsg = resData.message || (isBn ? 'এসএমএস পাঠাতে সমস্যা হয়েছে।' : 'Error dispatching SMS broadcast.');
        showToast(errorMsg, 'error');
        return false;
      }

      if (resData.data) {
        setMessages((prev) => [resData.data, ...prev.filter((m) => m.id !== resData.data.id)]);
      }

      // Re-sync live stats
      fetchCommunicationData();

      showToast(
        resData.message || (isBn ? 'এসএমএস সফলভাবে প্রেরিত হয়েছে!' : 'SMS broadcast dispatched successfully!'),
        'success'
      );
      return true;
    } catch (err: any) {
      showToast(isBn ? 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।' : 'Failed to connect to backend server.', 'error');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Send Voice Call Broadcast (Delegates to /api/communication/send-voice)
   */
  const sendVoiceBroadcast = async (params: SendVoiceCallParams): Promise<boolean> => {
    if (params.recipients.length === 0) {
      showToast(isBn ? 'অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন।' : 'Please select at least one recipient.', 'error');
      return false;
    }

    if (!params.voiceScript.trim()) {
      showToast(isBn ? 'ভয়েস কলের স্ক্রিপ্ট বা বার্তা লিখুন।' : 'Voice call script cannot be empty.', 'error');
      return false;
    }

    setIsSending(true);

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/communication/send-voice', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: params.title,
          content: params.voiceScript,
          recipientGroup: params.recipientGroup,
          targetClassId: params.targetClassId,
          targetClassName: params.targetClassName,
          targetSection: params.targetSection,
          recipients: params.recipients,
          templateId: params.templateId,
          voiceConfig: params.voiceConfig,
          scheduledAt: params.scheduledAt,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        const errorMsg = resData.message || (isBn ? 'ভয়েস কল পাঠাতে সমস্যা হয়েছে।' : 'Error dispatching voice call.');
        showToast(errorMsg, 'error');
        return false;
      }

      if (resData.data) {
        setMessages((prev) => [resData.data, ...prev.filter((m) => m.id !== resData.data.id)]);
      }

      fetchCommunicationData();

      showToast(
        resData.message || (isBn ? 'ভয়েস কল সফলভাবে সংযুক্ত হয়েছে!' : 'Voice broadcast processed!'),
        'success'
      );
      return true;
    } catch (err: any) {
      showToast(isBn ? 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।' : 'Failed to connect to backend server.', 'error');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Send Now (Immediate execution of a scheduled broadcast)
   */
  const sendNowScheduledBroadcast = async (id: string): Promise<boolean> => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/communication/send-now/${id}`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) {
          setMessages((prev) => prev.map((m) => (m.id === id ? data.data : m)));
        }
        fetchCommunicationData();
        showToast(
          data.message || (isBn ? 'বার্তাটি তাৎক্ষণিকভাবে প্রেরণ সম্পন্ন হয়েছে!' : 'Broadcast dispatched successfully!'),
          'success'
        );
        return true;
      } else {
        showToast(data.message || (isBn ? 'তাৎক্ষণিক প্রেরণ ব্যর্থ হয়েছে।' : 'Failed to dispatch now.'), 'error');
        return false;
      }
    } catch {
      showToast(isBn ? 'সার্ভার সংযোগ ত্রুটি।' : 'Server connection error.', 'error');
      return false;
    }
  };

  /**
   * Cancel Scheduled Message
   */
  const cancelScheduledBroadcast = async (id: string) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/communication/cancel-scheduled/${id}`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'cancelled', pendingCount: 0 } : m))
        );
        showToast(data.message || (isBn ? 'শিডিউল করা বার্তা বাতিল করা হয়েছে।' : 'Scheduled message cancelled.'), 'info');
      } else {
        showToast(data.message || (isBn ? 'বাতিল করা সম্ভব হয়নি।' : 'Could not cancel.'), 'error');
      }
    } catch {
      showToast(isBn ? 'সার্ভার ত্রুটি।' : 'Server error.', 'error');
    }
  };

  /**
   * Resend to Failed Recipients
   */
  const resendFailedRecipients = async (messageId: string): Promise<boolean> => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/communication/resend-failed/${messageId}`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data) {
          setMessages((prev) => [data.data, ...prev]);
        }
        fetchCommunicationData();
        showToast(data.message || (isBn ? 'ব্যর্থ প্রাপকদের পুনরায় বার্তা পাঠানো হয়েছে।' : 'Resent to failed recipients.'), 'success');
        return true;
      } else {
        showToast(data.message || (isBn ? 'বার্তা পাঠানো সম্ভব হয়নি।' : 'Failed to resend.'), 'error');
        return false;
      }
    } catch {
      showToast(isBn ? 'সার্ভার ত্রুটি।' : 'Server error.', 'error');
      return false;
    }
  };

  /**
   * Template Management
   */
  const createTemplate = async (
    template: Omit<CommunicationTemplate, 'id' | 'institutionId' | 'usageCount' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/communication/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify(template),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates((prev) => [data.data, ...prev]);
        showToast(isBn ? 'নতুন টেমপ্লেট সংরক্ষিত হয়েছে।' : 'New template created successfully.', 'success');
      }
    } catch {
      showToast(isBn ? 'টেমপ্লেট সংরক্ষণে ত্রুটি।' : 'Failed to save template.', 'error');
    }
  };

  const updateTemplate = async (id: string, updated: Partial<CommunicationTemplate>) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/communication/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...updated, id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data.data, updatedAt: new Date().toISOString() } : t))
        );
        showToast(isBn ? 'টেমপ্লেট সফলভাবে আপডেট হয়েছে।' : 'Template updated successfully.', 'success');
      }
    } catch {
      showToast(isBn ? 'টেমপ্লেট আপডেটে ত্রুটি।' : 'Failed to update template.', 'error');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/communication/templates/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast(isBn ? 'টেমপ্লেট মুছে ফেলা হয়েছে।' : 'Template deleted.', 'info');
      }
    } catch {
      showToast(isBn ? 'টেমপ্লেট মুছতে ত্রুটি।' : 'Failed to delete template.', 'error');
    }
  };

  /**
   * Safe Provider Settings Update (Server-Side Storage Only, Zero Plaintext in Frontend)
   */
  const updateProviderSettings = async (
    configUpdates: Partial<CommunicationProviderConfig>,
    rawApiKey?: string,
    rawSecretKey?: string
  ): Promise<ProviderConnectionTestResult> => {
    const role = user?.role_id;
    const allowedRoles = ['super_admin', 'principal', 'institution_admin', 'muhtamim'];
    const targetPid = configUpdates.providerId || providerConfig.providerId;

    if (!role || !allowedRoles.includes(role)) {
      const errMsg = isBn
        ? 'আপনার এই সেটিংস পরিবর্তন করার অনুমতি নেই। শুধুমাত্র মুহতামিম বা প্রিন্সিপাল এটি পরিবর্তন করতে পারেন।'
        : 'Permission Denied: Only Muhtamim or Principal can update provider credentials.';
      showToast(errMsg, 'error');
      return {
        success: false,
        providerId: targetPid,
        providerName: providerConfig.providerName,
        latencyMs: 0,
        message: errMsg,
        messageBn: errMsg,
      };
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/communication/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...configUpdates,
          rawApiKey: rawApiKey?.trim() ? rawApiKey.trim() : undefined,
          rawSecretKey: rawSecretKey?.trim() ? rawSecretKey.trim() : undefined,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        const errTxt = resData.message || (isBn ? 'কনফিগারেশন আপডেট ব্যর্থ হয়েছে।' : 'Failed to update configuration.');
        showToast(errTxt, 'error');
        return {
          success: false,
          providerId: targetPid,
          providerName: providerConfig.providerName,
          latencyMs: 0,
          message: errTxt,
          messageBn: errTxt,
        };
      }

      setProviderConfig(resData.data);

      // Now run connection test on backend
      const testRes = await fetch('/api/communication/test-connection', {
        method: 'POST',
        headers,
      });
      const testData = await testRes.json();

      if (testData.success) {
        showToast(isBn ? 'প্রোভাইডার সংযোগ ও ক্রেডেনশিয়াল সফলভাবে যাচাই হয়েছে।' : 'Provider configuration verified & saved.', 'success');
        return {
          success: true,
          providerId: resData.data.providerId,
          providerName: resData.data.providerName,
          latencyMs: testData.latencyMs || 50,
          message: testData.message,
          messageBn: testData.message,
        };
      } else {
        showToast(testData.message, 'warning');
        return {
          success: false,
          providerId: resData.data.providerId,
          providerName: resData.data.providerName,
          latencyMs: testData.latencyMs || 0,
          message: testData.message,
          messageBn: testData.message,
        };
      }
    } catch (err: any) {
      showToast(isBn ? 'সার্ভার ত্রুটি।' : 'Server communication error.', 'error');
      return {
        success: false,
        providerId: targetPid,
        providerName: providerConfig.providerName,
        latencyMs: 0,
        message: 'Network error',
        messageBn: 'নেটওয়ার্ক সংযোগ ত্রুটি',
      };
    }
  };

  /**
   * Test Connection without persisting
   */
  const testProviderConnection = async (
    providerId?: ProviderId,
    apiKey?: string,
    secretKey?: string
  ): Promise<ProviderConnectionTestResult> => {
    const pid = providerId || providerConfig.providerId;
    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/communication/test-connection', {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      return {
        success: data.success,
        providerId: (data.providerId as ProviderId) || pid,
        providerName: providerConfig.providerName,
        latencyMs: data.latencyMs || 45,
        message: data.message || (data.success ? 'সংযুক্ত' : 'সংযোগ ব্যর্থ'),
        messageBn: data.message || (data.success ? 'সংযুক্ত' : 'সংযোগ ব্যর্থ'),
      };
    } catch {
      return {
        success: false,
        providerId: pid,
        providerName: providerConfig.providerName,
        latencyMs: 0,
        message: 'Failed to connect to backend server',
        messageBn: 'সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি।',
      };
    }
  };

  /**
   * Export Delivery Report to CSV
   */
  const exportDeliveryReportCsv = (filteredList?: CommunicationMessage[]) => {
    const listToExport = filteredList || messages;

    const headers = ['ID', 'Date', 'Type', 'Title', 'Recipient Group', 'Total', 'Delivered', 'Failed', 'Cost (BDT)', 'Status'];
    const rows = listToExport.map((m) => [
      m.id,
      new Date(m.createdAt).toLocaleDateString(),
      m.type.toUpperCase(),
      `"${m.title.replace(/"/g, '""')}"`,
      m.recipientGroup,
      m.totalRecipients,
      m.deliveredCount,
      m.failedCount,
      m.actualCost || m.costEstimate,
      m.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MadSol_Communication_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(isBn ? 'ডেলিভারি রিপোর্ট CSV ফাইলে ডাউনলোড হয়েছে।' : 'Report exported as CSV.', 'success');
  };

  return (
    <CommunicationContext.Provider
      value={{
        providerConfig,
        messages,
        templates,
        scheduledMessages,
        statistics,
        gateway,
        isSending,
        activeProviderId: providerConfig.providerId,
        sendSmsBroadcast,
        sendVoiceBroadcast,
        sendNowScheduledBroadcast,
        cancelScheduledBroadcast,
        resendFailedRecipients,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        updateProviderSettings,
        testProviderConnection,
        refreshBalances,
        exportDeliveryReportCsv,
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

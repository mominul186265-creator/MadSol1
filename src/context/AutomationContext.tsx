import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Automation,
  AutomationTriggerMeta,
  MessageTemplate,
  NotificationItem,
  QueuedMessage,
  Announcement,
  VoiceCallCampaign,
  CommunicationLog,
  ProviderConfiguration,
  UserNotificationPreferences,
  AutomationRunLog,
  ScheduledMessage
} from '../types/automation';
import {
  AUTOMATION_TRIGGERS_LIST,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_AUTOMATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_QUEUED_MESSAGES,
  INITIAL_VOICE_CAMPAIGNS,
  INITIAL_COMMUNICATION_LOGS,
  INITIAL_PROVIDER_SETTINGS,
  INITIAL_AUTOMATION_RUN_LOGS
} from '../data/initialAutomationData';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';

interface AutomationContextType {
  // Automations
  automations: Automation[];
  triggers: AutomationTriggerMeta[];
  toggleAutomationStatus: (id: string) => void;
  createAutomation: (data: Omit<Automation, 'id' | 'institutionId' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failureCount'>) => Automation;
  updateAutomation: (id: string, data: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  testTriggerAutomation: (automationId: string) => void;
  automationLogs: AutomationRunLog[];

  // Message Templates
  templates: MessageTemplate[];
  createTemplate: (data: Omit<MessageTemplate, 'id' | 'institutionId' | 'createdAt'>) => MessageTemplate;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  renderTemplate: (templateText: string, contextValues: Record<string, string>) => string;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  createNotification: (data: Omit<NotificationItem, 'id' | 'institutionId' | 'createdAt' | 'isRead' | 'status'>) => NotificationItem;
  userPreferences: UserNotificationPreferences;
  updateUserPreferences: (prefs: Partial<UserNotificationPreferences>) => void;

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (data: Omit<Announcement, 'id' | 'institutionId' | 'createdAt' | 'viewsCount'>) => Announcement;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  // Queued Messages
  queuedMessages: QueuedMessage[];
  enqueueMessage: (data: {
    recipientName: string;
    recipientContact: string;
    recipientRole: string;
    channel: 'sms' | 'push' | 'email' | 'app' | 'voice';
    messageText: string;
    priority?: 'normal' | 'important' | 'urgent' | 'emergency';
  }) => { success: boolean; message: string; queuedId?: string };
  processQueue: () => void;
  retryQueuedMessage: (id: string) => void;
  clearDeliveredQueue: () => void;

  // Voice Campaigns
  voiceCampaigns: VoiceCallCampaign[];
  createVoiceCampaign: (data: Omit<VoiceCallCampaign, 'id' | 'institutionId' | 'createdAt' | 'answeredCount' | 'notAnsweredCount' | 'busyCount' | 'failedCount' | 'status'>) => VoiceCallCampaign;
  executeVoiceCampaign: (id: string) => { success: boolean; message: string };

  // Scheduled Messages
  scheduledMessages: ScheduledMessage[];
  createScheduledMessage: (data: Omit<ScheduledMessage, 'id' | 'institutionId' | 'createdAt' | 'status'>) => ScheduledMessage;
  toggleScheduledStatus: (id: string) => void;
  deleteScheduledMessage: (id: string) => void;

  // Communication History & Provider
  communicationLogs: CommunicationLog[];
  providerSettings: ProviderConfiguration;
  updateProviderSettings: (data: Partial<ProviderConfiguration>) => void;

  // Analytics
  analytics: {
    totalSentToday: number;
    deliveryRate: number;
    totalSmsCost: number;
    activeAutomationsCount: number;
    pendingQueueCount: number;
    totalNotificationsCount: number;
  };
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const currentInstId = institution?.id || 'inst-001';

  // Persistence keys scoped by institutionId
  const getStorageKey = (key: string) => `madsol_${currentInstId}_${key}`;

  // 1. Automations State
  const [automations, setAutomations] = useState<Automation[]>(() => {
    const saved = localStorage.getItem(getStorageKey('automations'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_AUTOMATIONS.map(a => ({ ...a, institutionId: currentInstId }));
  });

  // 2. Templates State
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem(getStorageKey('templates'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_MESSAGE_TEMPLATES.map(t => ({ ...t, institutionId: currentInstId }));
  });

  // 3. Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(getStorageKey('notifications'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'notif-p6-1',
        institutionId: currentInstId,
        titleBn: 'নতুন স্বয়ংক্রিয় অনুপস্থিতি অ্যালার্ট সক্রিয়',
        titleEn: 'Auto Absent SMS Automation Activated',
        messageBn: 'প্রতিদিন সকাল ১০টায় অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের নিকট এসএমএস প্রেরণের নিয়ম সফলভাবে চালু হয়েছে।',
        messageEn: 'Automatic absent notification rule is now running live for morning assembly.',
        type: 'system',
        priority: 'important',
        status: 'delivered',
        isRead: false,
        createdAt: 'আজ, সকাল ৯:০০'
      },
      {
        id: 'notif-p6-2',
        institutionId: currentInstId,
        titleBn: 'রমাদান ও শবে ক্বদর ছুটির বিশেষ নোটিশ',
        titleEn: 'Ramadan Special Schedule Notice',
        messageBn: '১৫ রমাদান পর্যন্ত বিশেষ হিফজ ও সাধারণ ক্লাস চালু থাকবে। বিজ্ঞপ্তি দেখুন।',
        messageEn: 'Special classes and Taraweeh schedule published on institutional board.',
        type: 'emergency',
        priority: 'urgent',
        status: 'delivered',
        isRead: false,
        createdAt: 'গতকাল, বিকাল ৫:৩০'
      }
    ];
  });

  // 4. Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(getStorageKey('announcements'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_ANNOUNCEMENTS.map(a => ({ ...a, institutionId: currentInstId }));
  });

  // 5. Queued Messages State
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>(() => {
    const saved = localStorage.getItem(getStorageKey('queued_messages'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_QUEUED_MESSAGES.map(q => ({ ...q, institutionId: currentInstId }));
  });

  // 6. Voice Campaigns State
  const [voiceCampaigns, setVoiceCampaigns] = useState<VoiceCallCampaign[]>(() => {
    const saved = localStorage.getItem(getStorageKey('voice_campaigns'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_VOICE_CAMPAIGNS.map(v => ({ ...v, institutionId: currentInstId }));
  });

  // 7. Scheduled Messages State
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(() => {
    const saved = localStorage.getItem(getStorageKey('scheduled_messages'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'sch-001',
        institutionId: currentInstId,
        title: 'প্রতি মাসের ৫ তারিখ বকেয়া ফি স্মরণিকা এসএমএস',
        messageBn: 'আসসালামু আলাইকুম। আপনার সন্তান {{student_name}}-এর চলতি মাসের বকেয়া ফি পরিশোধের বিনীত তাগিদ রইল।',
        messageEn: 'Assalamu Alaikum. Gentle reminder for outstanding monthly fees.',
        channel: 'sms',
        recipientType: 'all_guardians',
        scheduledDate: '2026-03-05',
        scheduledTime: '10:00',
        recurrence: 'monthly',
        recurringDayOfMonth: 5,
        status: 'active',
        nextRun: '৫ মার্চ ২০২৬, সকাল ১০:০০',
        createdAt: '2026-02-28',
        createdBy: 'হিসাব বিভাগ'
      }
    ];
  });

  // 8. Communication Logs State
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => {
    const saved = localStorage.getItem(getStorageKey('comm_logs'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_COMMUNICATION_LOGS.map(c => ({ ...c, institutionId: currentInstId }));
  });

  // 9. Automation Run Logs
  const [automationLogs, setAutomationLogs] = useState<AutomationRunLog[]>(() => {
    const saved = localStorage.getItem(getStorageKey('automation_logs'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_AUTOMATION_RUN_LOGS.map(a => ({ ...a, institutionId: currentInstId }));
  });

  // 10. Provider Configuration
  const [providerSettings, setProviderSettings] = useState<ProviderConfiguration>(() => {
    const saved = localStorage.getItem(getStorageKey('provider_settings'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PROVIDER_SETTINGS;
  });

  // 11. User Preferences
  const [userPreferences, setUserPreferences] = useState<UserNotificationPreferences>(() => {
    const saved = localStorage.getItem(getStorageKey('user_prefs'));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      userId: user?.id || 'usr-default',
      institutionId: currentInstId,
      appNotification: true,
      pushNotification: true,
      smsNotification: true,
      emailNotification: true,
      attendanceAlerts: true,
      feeReminders: true,
      resultNotifications: true,
      hifzUpdates: true,
      announcements: true,
      marketingOptional: false
    };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey('automations'), JSON.stringify(automations));
  }, [automations, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('templates'), JSON.stringify(templates));
  }, [templates, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('notifications'), JSON.stringify(notifications));
  }, [notifications, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('announcements'), JSON.stringify(announcements));
  }, [announcements, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('queued_messages'), JSON.stringify(queuedMessages));
  }, [queuedMessages, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('voice_campaigns'), JSON.stringify(voiceCampaigns));
  }, [voiceCampaigns, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('scheduled_messages'), JSON.stringify(scheduledMessages));
  }, [scheduledMessages, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('comm_logs'), JSON.stringify(communicationLogs));
  }, [communicationLogs, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('automation_logs'), JSON.stringify(automationLogs));
  }, [automationLogs, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('provider_settings'), JSON.stringify(providerSettings));
  }, [providerSettings, currentInstId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('user_prefs'), JSON.stringify(userPreferences));
  }, [userPreferences, currentInstId]);

  // Template variable engine
  const renderTemplate = (templateText: string, contextValues: Record<string, string>): string => {
    let result = templateText;
    const defaultVars: Record<string, string> = {
      institution_name: institution?.nameBn || 'মাদরাসাতুস সুন্নাহ আল-ইসলামিয়া',
      institution_phone: institution?.phone || '০১৭০০০০০০০০',
      date: new Date().toLocaleDateString('bn-BD'),
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      ...contextValues
    };

    Object.keys(defaultVars).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, defaultVars[key]);
    });

    return result;
  };

  // Automations CRUD
  const toggleAutomationStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) => {
        if (auto.id === id) {
          const newStatus = auto.status === 'active' ? 'paused' : 'active';
          showToast(
            language === 'bn'
              ? `অটোমেশন ${newStatus === 'active' ? 'সক্রিয়' : 'বিরতি'} করা হয়েছে`
              : `Automation is now ${newStatus}`,
            'info'
          );
          return { ...auto, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return auto;
      })
    );
  };

  const createAutomation = (
    data: Omit<Automation, 'id' | 'institutionId' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failureCount'>
  ): Automation => {
    const newAuto: Automation = {
      ...data,
      id: `auto-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      runCount: 0,
      successCount: 0,
      failureCount: 0
    };
    setAutomations((prev) => [newAuto, ...prev]);
    showToast(
      language === 'bn' ? 'নতুন অটোমেশন সফলভাবে সংরক্ষিত হয়েছে' : 'Automation successfully created',
      'success'
    );
    return newAuto;
  };

  const updateAutomation = (id: string, data: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((auto) =>
        auto.id === id ? { ...auto, ...data, updatedAt: new Date().toISOString().split('T')[0] } : auto
      )
    );
    showToast(
      language === 'bn' ? 'অটোমেশন আপডেট সম্পন্ন হয়েছে' : 'Automation updated successfully',
      'success'
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((auto) => auto.id !== id));
    showToast(
      language === 'bn' ? 'অটোমেশন মুছে ফেলা হয়েছে' : 'Automation deleted',
      'info'
    );
  };

  // Test trigger execution simulator
  const testTriggerAutomation = (automationId: string) => {
    const target = automations.find((a) => a.id === automationId);
    if (!target) return;

    // Simulate run
    const nowStr = 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const log: AutomationRunLog = {
      id: `arl-${Date.now()}`,
      institutionId: currentInstId,
      automationId: target.id,
      automationName: language === 'bn' ? target.nameBn : target.nameEn,
      triggerTime: nowStr,
      recipientName: 'পরীক্ষামূলক প্রাপক (অভিভাবক)',
      recipientTarget: '01711002244',
      actionTaken: `${target.actions.length} টি অ্যাকশন সফলভাবে সম্পন্ন হয়েছে`,
      status: 'success',
      durationMs: Math.floor(Math.random() * 300) + 150
    };

    setAutomationLogs((prev) => [log, ...prev]);

    // Update automation stats
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === automationId
          ? {
              ...a,
              lastRunAt: nowStr,
              runCount: a.runCount + 1,
              successCount: a.successCount + 1
            }
          : a
      )
    );

    // Queue test message
    enqueueMessage({
      recipientName: 'পরীক্ষামূলক অভিভাবক',
      recipientContact: '01711002244',
      recipientRole: 'অভিভাবক',
      channel: target.actions[0]?.channel === 'push' ? 'push' : 'sms',
      messageText: `[সিমুলেশন] ${language === 'bn' ? target.nameBn : target.nameEn} সফলভাবে ট্রিগার হয়েছে।`,
      priority: 'normal'
    });

    showToast(
      language === 'bn'
        ? `ট্রিগার সিমুলেশন সম্পন্ন: ${target.nameBn}`
        : `Trigger simulation successful: ${target.nameEn}`,
      'success'
    );
  };

  // Message Templates CRUD
  const createTemplate = (
    data: Omit<MessageTemplate, 'id' | 'institutionId' | 'createdAt'>
  ): MessageTemplate => {
    const newTmpl: MessageTemplate = {
      ...data,
      id: `tmpl-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates((prev) => [newTmpl, ...prev]);
    showToast(
      language === 'bn' ? 'বার্তা টেমপ্লেট সফলভাবে যোগ করা হয়েছে' : 'Template created successfully',
      'success'
    );
    return newTmpl;
  };

  const updateTemplate = (id: string, data: Partial<MessageTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    showToast(
      language === 'bn' ? 'টেমপ্লেট আপডেট সম্পন্ন হয়েছে' : 'Template updated',
      'success'
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast(
      language === 'bn' ? 'টেমপ্লেট মুছে ফেলা হয়েছে' : 'Template deleted',
      'info'
    );
  };

  // Notifications CRUD
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    showToast(
      language === 'bn' ? 'সকল বিজ্ঞপ্তি পড়া হয়েছে চিহ্নিত করা হয়েছে' : 'All notifications marked as read',
      'success'
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const createNotification = (
    data: Omit<NotificationItem, 'id' | 'institutionId' | 'createdAt' | 'isRead' | 'status'>
  ): NotificationItem => {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
      institutionId: currentInstId,
      status: 'delivered',
      isRead: false,
      createdAt: 'এখন'
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const updateUserPreferences = (prefs: Partial<UserNotificationPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
    showToast(
      language === 'bn' ? 'বিজ্ঞপ্তি পছন্দসমূহ সংরক্ষিত হয়েছে' : 'Notification preferences updated',
      'success'
    );
  };

  // Announcements CRUD
  const createAnnouncement = (
    data: Omit<Announcement, 'id' | 'institutionId' | 'createdAt' | 'viewsCount'>
  ): Announcement => {
    const newAnc: Announcement = {
      ...data,
      id: `anc-${Date.now()}`,
      institutionId: currentInstId,
      viewsCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAnnouncements((prev) => [newAnc, ...prev]);

    // Also trigger in-app notification for everyone
    createNotification({
      titleBn: newAnc.titleBn,
      titleEn: newAnc.titleEn,
      messageBn: newAnc.messageBn.substring(0, 100) + '...',
      messageEn: newAnc.messageEn.substring(0, 100) + '...',
      type: newAnc.isEmergency ? 'emergency' : 'system',
      priority: newAnc.priority
    });

    showToast(
      language === 'bn' ? 'নতুন নোটিশ ও বিজ্ঞপ্তি প্রকাশ করা হয়েছে' : 'Announcement published successfully',
      'success'
    );
    return newAnc;
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
    showToast(
      language === 'bn' ? 'বিজ্ঞপ্তি আপডেট সম্পন্ন হয়েছে' : 'Announcement updated',
      'success'
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast(
      language === 'bn' ? 'বিজ্ঞপ্তি মুছে ফেলা হয়েছে' : 'Announcement removed',
      'info'
    );
  };

  // Queued Message & Strict Validation Engine
  const enqueueMessage = (data: {
    recipientName: string;
    recipientContact: string;
    recipientRole: string;
    channel: 'sms' | 'push' | 'email' | 'app' | 'voice';
    messageText: string;
    priority?: 'normal' | 'important' | 'urgent' | 'emergency';
  }): { success: boolean; message: string; queuedId?: string } => {
    const contact = data.recipientContact.trim().replace(/[-\s]/g, '');

    // Strict validation
    if (data.channel === 'sms' || data.channel === 'voice') {
      const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
      if (!bdPhoneRegex.test(contact)) {
        const errorMsg = language === 'bn'
          ? 'অবৈধ মোবাইল নম্বর! সঠিক ১১ ডিজিটের বাংলাদেশি নম্বর দিন (যেমন: 017xxxxxxxx)।'
          : 'Invalid mobile number! Must be a valid 11-digit Bangladesh phone number.';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }
    }

    if (data.channel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        const errorMsg = language === 'bn'
          ? 'অবৈধ ইমেইল ঠিকানা!'
          : 'Invalid email address!';
        showToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }
    }

    // Provider check
    if (data.channel === 'sms' && !providerSettings.sms.isConfigured) {
      const errorMsg = language === 'bn'
        ? 'এসএমএস গেটওয়ে কনফিগার করা নেই। অনুগ্রহ করে সেটিংস থেকে প্রদানকারী যুক্ত করুন।'
        : 'SMS Gateway is not configured. Please connect provider first.';
      showToast(errorMsg, 'warning');
      return { success: false, message: errorMsg };
    }

    const newQueued: QueuedMessage = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      institutionId: currentInstId,
      recipientName: data.recipientName,
      recipientContact: contact,
      recipientRole: data.recipientRole,
      channel: data.channel,
      messageText: data.messageText,
      priority: data.priority || 'normal',
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      providerId: data.channel === 'sms' ? providerSettings.sms.adapter : undefined,
      createdAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setQueuedMessages((prev) => [newQueued, ...prev]);

    return {
      success: true,
      message: language === 'bn' ? 'বার্তাটি কিউ-তে যুক্ত হয়েছে' : 'Message queued for dispatch',
      queuedId: newQueued.id
    };
  };

  // Queue background worker simulation
  const processQueue = () => {
    const pendingItems = queuedMessages.filter((m) => m.status === 'pending');
    if (pendingItems.length === 0) {
      showToast(
        language === 'bn' ? 'প্রসেস করার মতো কোনো পেন্ডিং বার্তা নেই' : 'No pending messages in queue',
        'info'
      );
      return;
    }

    const now = 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    setQueuedMessages((prev) =>
      prev.map((m) =>
        m.status === 'pending'
          ? { ...m, status: 'delivered', processedAt: now }
          : m
      )
    );

    // Append to communication logs
    const newLogs: CommunicationLog[] = pendingItems.map((item) => ({
      id: `cl-${Date.now()}-${item.id}`,
      institutionId: currentInstId,
      timestamp: now,
      recipientName: item.recipientName,
      recipientContact: item.recipientContact,
      recipientRole: item.recipientRole,
      channel: item.channel,
      message: item.messageText,
      status: 'delivered',
      providerName:
        item.channel === 'sms'
          ? 'Greenweb SMS Gateway'
          : item.channel === 'push'
          ? 'FCM Push Adapter'
          : 'MadSol Core Mailer',
      sentBy: user ? (language === 'bn' ? user.fullNameBn : user.fullNameEn) : 'System Worker',
      costBdt: item.channel === 'sms' ? 0.35 : 0.0
    }));

    setCommunicationLogs((prev) => [...newLogs, ...prev]);

    showToast(
      language === 'bn'
        ? `${pendingItems.length} টি বার্তা সফলভাবে প্রেরণ ও ডেলিভারি নিশ্চিত হয়েছে`
        : `Successfully processed ${pendingItems.length} messages in queue`,
      'success'
    );
  };

  const retryQueuedMessage = (id: string) => {
    setQueuedMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status: 'pending',
            retryCount: m.retryCount + 1,
            errorReason: undefined
          };
        }
        return m;
      })
    );
    showToast(
      language === 'bn' ? 'বার্তাটি পুনরায় প্রেরণের জন্য কিউ-তে যুক্ত করা হয়েছে' : 'Message re-queued for delivery',
      'info'
    );
  };

  const clearDeliveredQueue = () => {
    setQueuedMessages((prev) => prev.filter((m) => m.status === 'pending' || m.status === 'failed'));
    showToast(
      language === 'bn' ? 'ডেলিভারি সম্পন্ন হওয়া বার্তাসমূহ কিউ থেকে সরানো হয়েছে' : 'Delivered queue cleared',
      'info'
    );
  };

  // Voice Campaigns CRUD & Compliance Execution
  const createVoiceCampaign = (
    data: Omit<VoiceCallCampaign, 'id' | 'institutionId' | 'createdAt' | 'answeredCount' | 'notAnsweredCount' | 'busyCount' | 'failedCount' | 'status'>
  ): VoiceCallCampaign => {
    const newVc: VoiceCallCampaign = {
      ...data,
      id: `vc-${Date.now()}`,
      institutionId: currentInstId,
      status: 'pending',
      answeredCount: 0,
      notAnsweredCount: 0,
      busyCount: 0,
      failedCount: 0,
      createdAt: new Date().toLocaleDateString('bn-BD')
    };

    setVoiceCampaigns((prev) => [newVc, ...prev]);
    showToast(
      language === 'bn' ? 'ভয়েস কল ক্যাম্পেইন খসড়া তৈরি হয়েছে' : 'Voice broadcast campaign drafted',
      'success'
    );
    return newVc;
  };

  const executeVoiceCampaign = (id: string): { success: boolean; message: string } => {
    const campaign = voiceCampaigns.find((v) => v.id === id);
    if (!campaign) return { success: false, message: 'Campaign not found' };

    // Strict Legal Time Window Check: 09:00 AM to 08:00 PM BST
    const nowHour = new Date().getHours();
    const isAllowedTime = nowHour >= 9 && nowHour < 20;

    if (!isAllowedTime) {
      const errMsg = language === 'bn'
        ? 'আইনি নির্দেশিকা লঙ্ঘন! সকাল ৯:০০ থেকে রাত ৮:০০ এর বাইরে বাণিজ্যিক বা স্বয়ংক্রিয় ভয়েস কল নিষিদ্ধ।'
        : 'Regulatory compliance restriction: Voice calls are only legally permissible between 09:00 AM and 08:00 PM.';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }

    if (!campaign.complianceAcknowledged) {
      const errMsg = language === 'bn'
        ? 'অভিভাবকদের অডিও কল কনসেন্ট নীতিতে সম্মতি দেওয়া আবশ্যক।'
        : 'Please acknowledge voice telecommunication compliance terms.';
      showToast(errMsg, 'warning');
      return { success: false, message: errMsg };
    }

    // Simulate completion
    const target = campaign.targetCount || 50;
    const answered = Math.round(target * 0.88);
    const notAnswered = Math.round(target * 0.08);
    const busy = Math.round(target * 0.03);
    const failed = target - (answered + notAnswered + busy);

    setVoiceCampaigns((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'completed',
              answeredCount: answered,
              notAnsweredCount: notAnswered,
              busyCount: busy,
              failedCount: failed
            }
          : v
      )
    );

    // Record in communication log
    setCommunicationLogs((prev) => [
      {
        id: `cl-voice-${Date.now()}`,
        institutionId: currentInstId,
        timestamp: 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        recipientName: `${target} জন অভিভাবক`,
        recipientContact: 'বাল্ক ভয়েস ব্রডকাস্ট',
        recipientRole: 'অভিভাবক',
        channel: 'voice',
        message: `${campaign.title} (${campaign.audioDurationSeconds} সে)`,
        status: 'delivered',
        providerName: 'Telecom Voice Gateway',
        sentBy: user ? (language === 'bn' ? user.fullNameBn : user.fullNameEn) : 'Admin',
        costBdt: Number((target * 0.9).toFixed(2))
      },
      ...prev
    ]);

    showToast(
      language === 'bn'
        ? `ভয়েস কল ক্যাম্পেইন সফলভাবে পরিচালিত হয়েছে (${answered}/${target} সম্পন্ন)`
        : `Voice campaign executed successfully (${answered}/${target} delivered)`,
      'success'
    );

    return { success: true, message: 'Voice broadcast complete' };
  };

  // Scheduled Messages CRUD
  const createScheduledMessage = (
    data: Omit<ScheduledMessage, 'id' | 'institutionId' | 'createdAt' | 'status'>
  ): ScheduledMessage => {
    const newSch: ScheduledMessage = {
      ...data,
      id: `sch-${Date.now()}`,
      institutionId: currentInstId,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setScheduledMessages((prev) => [newSch, ...prev]);
    showToast(
      language === 'bn' ? 'বার্তাটি সফলভাবে শিডিউল করা হয়েছে' : 'Message scheduled successfully',
      'success'
    );
    return newSch;
  };

  const toggleScheduledStatus = (id: string) => {
    setScheduledMessages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s))
    );
  };

  const deleteScheduledMessage = (id: string) => {
    setScheduledMessages((prev) => prev.filter((s) => s.id !== id));
    showToast(
      language === 'bn' ? 'শিডিউল বার্তা মুছে ফেলা হয়েছে' : 'Scheduled item removed',
      'info'
    );
  };

  // Provider Settings
  const updateProviderSettings = (data: Partial<ProviderConfiguration>) => {
    setProviderSettings((prev) => ({ ...prev, ...data }));
    showToast(
      language === 'bn' ? 'প্রদানকারী গেটওয়ে কনফিগারেশন আপডেট হয়েছে' : 'Provider configuration saved',
      'success'
    );
  };

  // Computed Analytics
  const analytics = useMemo(() => {
    const totalSent = communicationLogs.length;
    const deliveredCount = communicationLogs.filter((l) => l.status === 'delivered').length;
    const rate = totalSent > 0 ? Math.round((deliveredCount / totalSent) * 100) : 98;
    const smsCost = communicationLogs.reduce((acc, curr) => acc + (curr.costBdt || 0), 0);
    const activeAuto = automations.filter((a) => a.status === 'active').length;
    const pendingQ = queuedMessages.filter((q) => q.status === 'pending').length;

    return {
      totalSentToday: totalSent,
      deliveryRate: rate,
      totalSmsCost: Number(smsCost.toFixed(2)),
      activeAutomationsCount: activeAuto,
      pendingQueueCount: pendingQ,
      totalNotificationsCount: notifications.length
    };
  }, [communicationLogs, automations, queuedMessages, notifications]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <AutomationContext.Provider
      value={{
        automations,
        triggers: AUTOMATION_TRIGGERS_LIST,
        toggleAutomationStatus,
        createAutomation,
        updateAutomation,
        deleteAutomation,
        testTriggerAutomation,
        automationLogs,
        templates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        renderTemplate,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        createNotification,
        userPreferences,
        updateUserPreferences,
        announcements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        queuedMessages,
        enqueueMessage,
        processQueue,
        retryQueuedMessage,
        clearDeliveredQueue,
        voiceCampaigns,
        createVoiceCampaign,
        executeVoiceCampaign,
        scheduledMessages,
        createScheduledMessage,
        toggleScheduledStatus,
        deleteScheduledMessage,
        communicationLogs,
        providerSettings,
        updateProviderSettings,
        analytics
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (!context) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};

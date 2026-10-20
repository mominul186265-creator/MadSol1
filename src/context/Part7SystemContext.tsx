import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AiConversation,
  AiChatMessage,
  StudentPerformanceInsight,
  PerformanceAlert,
  HifzProgressInsight,
  ClassPerformanceAnalysis,
  TeacherPerformanceInsight,
  GeneratedAiReport,
  GuardianContactLog,
  InternalMessage,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  MadrasaDocument,
  DocumentCategory,
  IdCardTemplate,
  StudentIdCardData,
  TeacherIdCardData,
  CertificateTemplate,
  GeneratedCertificate,
  CertificateType,
  SecureQrToken,
  QrVerificationResult,
  InstitutionSettingsData,
  BrandingSettingsData,
  DateTimeSettingsData,
  SystemFormatsSettingsData,
  NotificationSettingsData,
  SecuritySettingsData,
  SubscriptionPlan,
  InstitutionModuleConfig,
  ManagedInstitutionAccount,
  SystemMonitoringHealth,
  FailedJobLog,
  SecurityAlert,
  AuditLogDetailed,
  StudentPerformanceCategory
} from '../types';
import {
  INITIAL_AI_CONVERSATIONS,
  INITIAL_STUDENT_PERFORMANCE_INSIGHTS,
  INITIAL_PERFORMANCE_ALERTS,
  INITIAL_HIFZ_INSIGHTS,
  INITIAL_CLASS_ANALYSIS,
  INITIAL_TEACHER_INSIGHTS,
  INITIAL_AI_REPORTS,
  INITIAL_GUARDIAN_LOGS,
  INITIAL_INTERNAL_MESSAGES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_DOCUMENTS,
  INITIAL_ID_CARD_TEMPLATES,
  INITIAL_STUDENT_ID_CARDS,
  INITIAL_TEACHER_ID_CARDS,
  INITIAL_CERTIFICATE_TEMPLATES,
  INITIAL_GENERATED_CERTIFICATES,
  INITIAL_QR_TOKENS,
  INITIAL_INSTITUTION_SETTINGS,
  INITIAL_BRANDING_SETTINGS,
  INITIAL_DATETIME_SETTINGS,
  INITIAL_SYSTEM_FORMATS,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_MANAGED_INSTITUTIONS,
  INITIAL_INSTITUTION_MODULES,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_FAILED_JOBS,
  INITIAL_SECURITY_ALERTS,
  INITIAL_AUDIT_LOGS_DETAILED
} from '../data/part7InitialData';
import { useAuth } from './AuthContext';

interface Part7SystemContextType {
  // 1. AI Assistant & Insights
  conversations: AiConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string) => string;
  addChatMessage: (conversationId: string, role: 'user' | 'assistant', content: string, followUps?: string[]) => void;
  clearConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  studentInsights: StudentPerformanceInsight[];
  updateStudentPerformanceCategory: (studentId: string, cat: StudentPerformanceCategory) => void;
  performanceAlerts: PerformanceAlert[];
  resolvePerformanceAlert: (alertId: string) => void;
  hifzInsights: HifzProgressInsight[];
  classAnalysis: ClassPerformanceAnalysis[];
  teacherInsights: TeacherPerformanceInsight[];

  // 2. AI Reports
  aiReports: GeneratedAiReport[];
  generateNewReport: (report: Omit<GeneratedAiReport, 'id' | 'generatedAt'>) => GeneratedAiReport;
  deleteReport: (id: string) => void;

  // 3. Guardian Communication & Internal Messages
  guardianLogs: GuardianContactLog[];
  addGuardianLog: (log: Omit<GuardianContactLog, 'id' | 'sentAt'>) => void;
  internalMessages: InternalMessage[];
  sendInternalMessage: (msg: Omit<InternalMessage, 'id' | 'sentAt' | 'isRead'>) => void;
  markInternalMessageAsRead: (id: string) => void;

  // 4. Support Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    attachmentName?: string;
  }) => SupportTicket;
  replyToSupportTicket: (ticketId: string, message: string, attachmentName?: string) => void;
  updateSupportTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;

  // 5. Document Management
  documents: MadrasaDocument[];
  uploadDocument: (doc: Omit<MadrasaDocument, 'id' | 'uploadDate'>) => void;
  archiveDocument: (id: string) => void;
  deleteDocument: (id: string) => void;

  // 6. ID Cards
  idCardTemplates: IdCardTemplate[];
  studentIdCards: StudentIdCardData[];
  teacherIdCards: TeacherIdCardData[];
  generateStudentIdCard: (data: Omit<StudentIdCardData, 'id' | 'qrToken' | 'issueDate'>) => StudentIdCardData;
  generateTeacherIdCard: (data: Omit<TeacherIdCardData, 'id' | 'qrToken' | 'issueDate'>) => TeacherIdCardData;

  // 7. Certificates & Builder
  certificateTemplates: CertificateTemplate[];
  generatedCertificates: GeneratedCertificate[];
  generateCertificate: (cert: {
    studentId: string;
    studentNameBn: string;
    studentNameEn: string;
    className: string;
    departmentName: string;
    rollNo: string;
    type: CertificateType;
    templateId: string;
    titleBn: string;
    titleEn: string;
    customContentBn?: string;
    customContentEn?: string;
  }) => GeneratedCertificate;
  revokeCertificate: (id: string) => void;

  // 8. QR Verification System
  qrTokens: SecureQrToken[];
  verifyQrToken: (token: string) => QrVerificationResult;

  // 9. Advanced Settings & Branding
  institutionSettings: InstitutionSettingsData;
  updateInstitutionSettings: (settings: Partial<InstitutionSettingsData>) => void;
  brandingSettings: BrandingSettingsData;
  updateBrandingSettings: (settings: Partial<BrandingSettingsData>) => void;
  dateTimeSettings: DateTimeSettingsData;
  updateDateTimeSettings: (settings: Partial<DateTimeSettingsData>) => void;
  systemFormats: SystemFormatsSettingsData;
  updateSystemFormats: (formats: Partial<SystemFormatsSettingsData>) => void;
  notificationSettings: NotificationSettingsData;
  updateNotificationSettings: (settings: Partial<NotificationSettingsData>) => void;
  securitySettings: SecuritySettingsData;
  updateSecuritySettings: (settings: Partial<SecuritySettingsData>) => void;

  // 10. Super Admin Panel & Audit
  subscriptionPlans: SubscriptionPlan[];
  managedInstitutions: ManagedInstitutionAccount[];
  addManagedInstitution: (inst: Omit<ManagedInstitutionAccount, 'id' | 'createdAt' | 'lastActive'>) => void;
  toggleInstitutionStatus: (id: string, status: 'active' | 'suspended' | 'archived') => void;
  institutionModules: Record<string, InstitutionModuleConfig>;
  toggleInstitutionModule: (institutionId: string, moduleKey: keyof InstitutionModuleConfig, enabled: boolean) => void;
  systemHealth: SystemMonitoringHealth;
  failedJobs: FailedJobLog[];
  securityAlerts: SecurityAlert[];
  resolveSecurityAlert: (id: string) => void;
  auditLogsDetailed: AuditLogDetailed[];
  addAuditLogEntry: (log: Omit<AuditLogDetailed, 'id' | 'timestamp'>) => void;
}

const Part7SystemContext = createContext<Part7SystemContextType | undefined>(undefined);

export const Part7SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const instId = institution?.id || 'inst-001';

  // 1. AI Conversations
  const [conversations, setConversations] = useState<AiConversation[]>(() => {
    const saved = localStorage.getItem('madsol_ai_conversations');
    return saved ? JSON.parse(saved) : INITIAL_AI_CONVERSATIONS;
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    INITIAL_AI_CONVERSATIONS[0]?.id || null
  );

  // 2. Student & Hifz Insights
  const [studentInsights, setStudentInsights] = useState<StudentPerformanceInsight[]>(() => {
    const saved = localStorage.getItem('madsol_student_insights');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PERFORMANCE_INSIGHTS;
  });

  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>(() => {
    const saved = localStorage.getItem('madsol_performance_alerts');
    return saved ? JSON.parse(saved) : INITIAL_PERFORMANCE_ALERTS;
  });

  const [hifzInsights] = useState<HifzProgressInsight[]>(INITIAL_HIFZ_INSIGHTS);
  const [classAnalysis] = useState<ClassPerformanceAnalysis[]>(INITIAL_CLASS_ANALYSIS);
  const [teacherInsights] = useState<TeacherPerformanceInsight[]>(INITIAL_TEACHER_INSIGHTS);

  // 3. AI Reports
  const [aiReports, setAiReports] = useState<GeneratedAiReport[]>(() => {
    const saved = localStorage.getItem('madsol_ai_reports');
    return saved ? JSON.parse(saved) : INITIAL_AI_REPORTS;
  });

  // 4. Guardian Logs & Internal Messages
  const [guardianLogs, setGuardianLogs] = useState<GuardianContactLog[]>(() => {
    const saved = localStorage.getItem('madsol_guardian_logs');
    return saved ? JSON.parse(saved) : INITIAL_GUARDIAN_LOGS;
  });

  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>(() => {
    const saved = localStorage.getItem('madsol_internal_messages');
    return saved ? JSON.parse(saved) : INITIAL_INTERNAL_MESSAGES;
  });

  // 5. Support Tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('madsol_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  // 6. Documents
  const [documents, setDocuments] = useState<MadrasaDocument[]>(() => {
    const saved = localStorage.getItem('madsol_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // 7. ID Cards
  const [idCardTemplates] = useState<IdCardTemplate[]>(INITIAL_ID_CARD_TEMPLATES);
  const [studentIdCards, setStudentIdCards] = useState<StudentIdCardData[]>(() => {
    const saved = localStorage.getItem('madsol_student_id_cards');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_ID_CARDS;
  });
  const [teacherIdCards, setTeacherIdCards] = useState<TeacherIdCardData[]>(() => {
    const saved = localStorage.getItem('madsol_teacher_id_cards');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ID_CARDS;
  });

  // 8. Certificates
  const [certificateTemplates] = useState<CertificateTemplate[]>(INITIAL_CERTIFICATE_TEMPLATES);
  const [generatedCertificates, setGeneratedCertificates] = useState<GeneratedCertificate[]>(() => {
    const saved = localStorage.getItem('madsol_certificates');
    return saved ? JSON.parse(saved) : INITIAL_GENERATED_CERTIFICATES;
  });

  // 9. QR Tokens
  const [qrTokens, setQrTokens] = useState<SecureQrToken[]>(() => {
    const saved = localStorage.getItem('madsol_qr_tokens');
    return saved ? JSON.parse(saved) : INITIAL_QR_TOKENS;
  });

  // 10. Advanced Settings
  const [institutionSettings, setInstitutionSettings] = useState<InstitutionSettingsData>(() => {
    const saved = localStorage.getItem('madsol_inst_settings');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTION_SETTINGS;
  });

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettingsData>(() => {
    const saved = localStorage.getItem('madsol_branding_settings');
    return saved ? JSON.parse(saved) : INITIAL_BRANDING_SETTINGS;
  });

  const [dateTimeSettings, setDateTimeSettings] = useState<DateTimeSettingsData>(() => {
    const saved = localStorage.getItem('madsol_datetime_settings');
    return saved ? JSON.parse(saved) : INITIAL_DATETIME_SETTINGS;
  });

  const [systemFormats, setSystemFormats] = useState<SystemFormatsSettingsData>(() => {
    const saved = localStorage.getItem('madsol_sys_formats');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_FORMATS;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData>(() => {
    const saved = localStorage.getItem('madsol_notif_settings');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_SETTINGS;
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsData>(() => {
    const saved = localStorage.getItem('madsol_sec_settings');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_SETTINGS;
  });

  // 11. Super Admin State
  const [subscriptionPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [managedInstitutions, setManagedInstitutions] = useState<ManagedInstitutionAccount[]>(() => {
    const saved = localStorage.getItem('madsol_managed_institutions');
    return saved ? JSON.parse(saved) : INITIAL_MANAGED_INSTITUTIONS;
  });

  const [institutionModules, setInstitutionModules] = useState<Record<string, InstitutionModuleConfig>>(() => {
    const saved = localStorage.getItem('madsol_inst_modules');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTION_MODULES;
  });

  const [systemHealth] = useState<SystemMonitoringHealth>(INITIAL_SYSTEM_HEALTH);
  const [failedJobs] = useState<FailedJobLog[]>(INITIAL_FAILED_JOBS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(() => {
    const saved = localStorage.getItem('madsol_sec_alerts');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_ALERTS;
  });

  const [auditLogsDetailed, setAuditLogsDetailed] = useState<AuditLogDetailed[]>(() => {
    const saved = localStorage.getItem('madsol_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS_DETAILED;
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('madsol_ai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('madsol_student_insights', JSON.stringify(studentInsights));
  }, [studentInsights]);

  useEffect(() => {
    localStorage.setItem('madsol_performance_alerts', JSON.stringify(performanceAlerts));
  }, [performanceAlerts]);

  useEffect(() => {
    localStorage.setItem('madsol_ai_reports', JSON.stringify(aiReports));
  }, [aiReports]);

  useEffect(() => {
    localStorage.setItem('madsol_guardian_logs', JSON.stringify(guardianLogs));
  }, [guardianLogs]);

  useEffect(() => {
    localStorage.setItem('madsol_internal_messages', JSON.stringify(internalMessages));
  }, [internalMessages]);

  useEffect(() => {
    localStorage.setItem('madsol_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('madsol_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('madsol_student_id_cards', JSON.stringify(studentIdCards));
  }, [studentIdCards]);

  useEffect(() => {
    localStorage.setItem('madsol_teacher_id_cards', JSON.stringify(teacherIdCards));
  }, [teacherIdCards]);

  useEffect(() => {
    localStorage.setItem('madsol_certificates', JSON.stringify(generatedCertificates));
  }, [generatedCertificates]);

  useEffect(() => {
    localStorage.setItem('madsol_qr_tokens', JSON.stringify(qrTokens));
  }, [qrTokens]);

  useEffect(() => {
    localStorage.setItem('madsol_inst_settings', JSON.stringify(institutionSettings));
  }, [institutionSettings]);

  useEffect(() => {
    localStorage.setItem('madsol_branding_settings', JSON.stringify(brandingSettings));
  }, [brandingSettings]);

  useEffect(() => {
    localStorage.setItem('madsol_sec_alerts', JSON.stringify(securityAlerts));
  }, [securityAlerts]);

  useEffect(() => {
    localStorage.setItem('madsol_audit_logs', JSON.stringify(auditLogsDetailed));
  }, [auditLogsDetailed]);

  // Actions
  const addAuditLogEntry = (log: Omit<AuditLogDetailed, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogDetailed = {
      ...log,
      id: `adt-${Date.now()}`,
      timestamp: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })
    };
    setAuditLogsDetailed((prev) => [newEntry, ...prev]);
  };

  const createConversation = (title?: string): string => {
    const newId = `conv-${Date.now()}`;
    const newConv: AiConversation = {
      id: newId,
      institutionId: instId,
      userId: user?.id || 'anonymous',
      title: title || 'নতুন এআই আলোচনা',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const addChatMessage = (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    followUps?: string[]
  ) => {
    const newMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: followUps,
      contextScope: {
        institutionId: instId,
        userRole: user?.role || 'guest',
        dataPointsEvaluated: 150
      }
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updatedAt: newMsg.timestamp,
              title: c.messages.length === 0 && role === 'user' ? content.slice(0, 35) + '...' : c.title,
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
  };

  const clearConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [] } : c))
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const updateStudentPerformanceCategory = (studentId: string, cat: StudentPerformanceCategory) => {
    setStudentInsights((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, category: cat, lastUpdated: 'আজকে' } : s))
    );
  };

  const resolvePerformanceAlert = (alertId: string) => {
    setPerformanceAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              isResolved: true,
              resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              resolvedBy: user?.fullNameBn || 'অ্যাডমিন'
            }
          : a
      )
    );
  };

  const generateNewReport = (reportData: Omit<GeneratedAiReport, 'id' | 'generatedAt'>): GeneratedAiReport => {
    const newReport: GeneratedAiReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      generatedAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })
    };
    setAiReports((prev) => [newReport, ...prev]);
    addAuditLogEntry({
      institutionId: instId,
      institutionName: institution?.nameBn,
      userId: user?.id || 'u',
      userName: user?.fullNameBn || 'অ্যাডমিন',
      userRole: user?.role || 'madrasa_admin',
      action: 'AI_REPORT_GENERATED',
      module: 'AI Reports',
      details: `${newReport.titleBn} সফলভাবে তৈরি ও সংরক্ষণ করা হয়েছে।`,
      ipAddress: '127.0.0.1',
      deviceInfo: 'Browser Session',
      status: 'success'
    });
    return newReport;
  };

  const deleteReport = (id: string) => {
    setAiReports((prev) => prev.filter((r) => r.id !== id));
  };

  const addGuardianLog = (log: Omit<GuardianContactLog, 'id' | 'sentAt'>) => {
    const newLog: GuardianContactLog = {
      ...log,
      id: `glog-${Date.now()}`,
      sentAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })
    };
    setGuardianLogs((prev) => [newLog, ...prev]);
  };

  const sendInternalMessage = (msg: Omit<InternalMessage, 'id' | 'sentAt' | 'isRead'>) => {
    const newMsg: InternalMessage = {
      ...msg,
      id: `im-${Date.now()}`,
      sentAt: new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
      isRead: false
    };
    setInternalMessages((prev) => [newMsg, ...prev]);
  };

  const markInternalMessageAsRead = (id: string) => {
    setInternalMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isRead: true, readAt: new Date().toLocaleTimeString() } : m
      )
    );
  };

  const createSupportTicket = (ticket: {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    attachmentName?: string;
  }): SupportTicket => {
    const count = supportTickets.length + 1;
    const ticketNumber = `TKT-2026-${count.toString().padStart(4, '0')}`;
    const nowTime = new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      institutionId: instId,
      ticketNumber,
      userId: user?.id || 'u',
      userName: user?.fullNameBn || 'User',
      userRole: user?.role || 'staff',
      userPhone: user?.phone,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: 'open',
      description: ticket.description,
      attachmentName: ticket.attachmentName,
      createdAt: nowTime,
      updatedAt: nowTime,
      messages: [
        {
          id: `tm-${Date.now()}`,
          ticketId: `tkt-${Date.now()}`,
          senderId: user?.id || 'u',
          senderName: user?.fullNameBn || 'User',
          senderRole: user?.role || 'staff',
          message: ticket.description,
          attachmentName: ticket.attachmentName,
          timestamp: nowTime,
          isStaffReply: false
        }
      ],
      statusHistory: [
        {
          status: 'open',
          changedBy: user?.fullNameBn || 'User',
          timestamp: nowTime,
          note: 'টিকেট দাখিল করা হয়েছে'
        }
      ]
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const replyToSupportTicket = (ticketId: string, message: string, attachmentName?: string) => {
    const nowTime = new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
    const isStaff = user?.role === 'super_admin' || user?.role === 'madrasa_admin';

    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newMsg = {
          id: `tm-${Date.now()}`,
          ticketId,
          senderId: user?.id || 'u',
          senderName: user?.fullNameBn || 'Staff',
          senderRole: user?.role || 'staff',
          message,
          attachmentName,
          timestamp: nowTime,
          isStaffReply: isStaff
        };
        return {
          ...t,
          status: isStaff ? 'in_progress' : t.status,
          updatedAt: nowTime,
          messages: [...t.messages, newMsg]
        };
      })
    );
  };

  const updateSupportTicketStatus = (ticketId: string, status: TicketStatus, note?: string) => {
    const nowTime = new Date().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status,
          updatedAt: nowTime,
          statusHistory: [
            ...t.statusHistory,
            {
              status,
              changedBy: user?.fullNameBn || 'Staff',
              timestamp: nowTime,
              note: note || `স্ট্যাটাস পরিবর্তন: ${status}`
            }
          ]
        };
      })
    );
  };

  const uploadDocument = (doc: Omit<MadrasaDocument, 'id' | 'uploadDate'>) => {
    const newDoc: MadrasaDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLogEntry({
      institutionId: instId,
      institutionName: institution?.nameBn,
      userId: user?.id || 'u',
      userName: user?.fullNameBn || 'অ্যাডমিন',
      userRole: user?.role || 'madrasa_admin',
      action: 'DOCUMENT_UPLOAD',
      module: 'Documents',
      details: `${newDoc.documentName} আপলোড করা হয়েছে।`,
      ipAddress: '127.0.0.1',
      deviceInfo: 'Web Client',
      status: 'success'
    });
  };

  const archiveDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'archived' ? 'active' : 'archived' } : d))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const generateStudentIdCard = (data: Omit<StudentIdCardData, 'id' | 'qrToken' | 'issueDate'>): StudentIdCardData => {
    const token = `MS-QR-STU-${data.rollNo}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newCard: StudentIdCardData = {
      ...data,
      id: `id-stu-${Date.now()}`,
      qrToken: token,
      issueDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // Register token in secure QR registry
    const newQrToken: SecureQrToken = {
      token,
      type: 'student_id',
      institutionId: instId,
      referenceId: data.studentId,
      titleBn: `শিক্ষার্থী পরিচয়পত্র (${data.studentNameBn})`,
      titleEn: `Student ID Card (${data.studentNameEn})`,
      issuedAt: new Date().toISOString().split('T')[0],
      isValid: true,
      scanCount: 0
    };

    setQrTokens((prev) => [newQrToken, ...prev]);
    setStudentIdCards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const generateTeacherIdCard = (data: Omit<TeacherIdCardData, 'id' | 'qrToken' | 'issueDate'>): TeacherIdCardData => {
    const token = `MS-QR-TCH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newCard: TeacherIdCardData = {
      ...data,
      id: `id-tch-${Date.now()}`,
      qrToken: token,
      issueDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const newQrToken: SecureQrToken = {
      token,
      type: 'teacher_id',
      institutionId: instId,
      referenceId: data.teacherId,
      titleBn: `শিক্ষক পরিচয়পত্র (${data.teacherNameBn})`,
      titleEn: `Teacher ID Card (${data.teacherNameEn})`,
      issuedAt: new Date().toISOString().split('T')[0],
      isValid: true,
      scanCount: 0
    };

    setQrTokens((prev) => [newQrToken, ...prev]);
    setTeacherIdCards((prev) => [newCard, ...prev]);
    return newCard;
  };

  const generateCertificate = (certData: {
    studentId: string;
    studentNameBn: string;
    studentNameEn: string;
    className: string;
    departmentName: string;
    rollNo: string;
    type: CertificateType;
    templateId: string;
    titleBn: string;
    titleEn: string;
    customContentBn?: string;
    customContentEn?: string;
  }): GeneratedCertificate => {
    // Generate unique certificate number e.g. CERT-2026-000003
    const nextSeq = (generatedCertificates.length + 1).toString().padStart(6, '0');
    const certificateNumber = `CERT-2026-${nextSeq}`;
    const token = `MS-CERT-2026-${nextSeq}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    const nowIso = new Date().toISOString().split('T')[0];

    // Build dynamic variables replacement
    const template = certificateTemplates.find((t) => t.id === certData.templateId);
    let bodyBn = certData.customContentBn || template?.bodyTemplateBn || '';
    let bodyEn = certData.customContentEn || template?.bodyTemplateEn || '';

    const vars: Record<string, string> = {
      '{{student_name}}': certData.studentNameBn,
      '{{student_id}}': certData.studentId,
      '{{class_name}}': certData.className,
      '{{department_name}}': certData.departmentName,
      '{{institution_name}}': institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
      '{{issue_date}}': nowIso,
      '{{certificate_number}}': certificateNumber,
      '{{roll_no}}': certData.rollNo
    };

    Object.entries(vars).forEach(([k, v]) => {
      bodyBn = bodyBn.split(k).join(v);
    });

    const newCert: GeneratedCertificate = {
      id: `cert-${Date.now()}`,
      institutionId: instId,
      certificateNumber,
      templateId: certData.templateId,
      type: certData.type,
      titleBn: certData.titleBn,
      titleEn: certData.titleEn,
      studentId: certData.studentId,
      studentNameBn: certData.studentNameBn,
      studentNameEn: certData.studentNameEn,
      className: certData.className,
      departmentName: certData.departmentName,
      rollNo: certData.rollNo,
      issueDate: nowIso,
      contentBn: bodyBn,
      contentEn: bodyEn,
      qrToken: token,
      status: 'valid',
      issuedBy: user?.fullNameBn || 'মুহতামিম',
      verificationCount: 0
    };

    const newQrToken: SecureQrToken = {
      token,
      type: 'certificate',
      institutionId: instId,
      referenceId: certificateNumber,
      titleBn: `${certData.titleBn} (${certData.studentNameBn})`,
      titleEn: `${certData.titleEn} (${certData.studentNameEn})`,
      issuedAt: nowIso,
      isValid: true,
      scanCount: 0
    };

    setQrTokens((prev) => [newQrToken, ...prev]);
    setGeneratedCertificates((prev) => [newCert, ...prev]);

    addAuditLogEntry({
      institutionId: instId,
      institutionName: institution?.nameBn,
      userId: user?.id || 'u',
      userName: user?.fullNameBn || 'অ্যাডমিন',
      userRole: user?.role || 'madrasa_admin',
      action: 'GENERATE_CERTIFICATE',
      module: 'Certificates',
      details: `${certificateNumber} (${certData.studentNameBn}) সনদ সফলভাবে তৈরি হয়েছে।`,
      ipAddress: '127.0.0.1',
      deviceInfo: 'App Admin Client',
      status: 'success'
    });

    return newCert;
  };

  const revokeCertificate = (id: string) => {
    setGeneratedCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'revoked' } : c))
    );
  };

  const verifyQrToken = (token: string): QrVerificationResult => {
    const trimmed = token.trim();
    const foundToken = qrTokens.find((t) => t.token === trimmed);

    if (!foundToken) {
      return {
        found: false,
        isValid: false,
        verifiedAt: new Date().toLocaleTimeString(),
        scanCount: 0,
        messageBn: 'কিউআর টোকেনটি ডাটাবেসে পাওয়া যায়নি অথবা এটি অবৈধ।',
        messageEn: 'QR token not found in the verified registry or has expired.'
      };
    }

    // Increment scan count
    setQrTokens((prev) =>
      prev.map((t) => (t.token === trimmed ? { ...t, scanCount: t.scanCount + 1 } : t))
    );

    if (foundToken.type === 'certificate') {
      const cert = generatedCertificates.find((c) => c.certificateNumber === foundToken.referenceId);
      return {
        found: true,
        isValid: foundToken.isValid && cert?.status === 'valid',
        type: foundToken.type,
        institutionNameBn: institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
        institutionNameEn: institution?.nameEn || 'Jamia Islamia Madinatul Uloom',
        subjectNameBn: cert?.studentNameBn,
        subjectNameEn: cert?.studentNameEn,
        identifier: cert?.certificateNumber,
        className: cert?.className,
        statusLabelBn: cert?.status === 'valid' ? 'বৈধ ও সত্যায়িত' : 'বাতিলকৃত / স্থগিত',
        statusLabelEn: cert?.status === 'valid' ? 'Valid & Verified' : 'Revoked / Suspended',
        issuedDate: cert?.issueDate,
        verifiedAt: new Date().toLocaleTimeString(),
        scanCount: foundToken.scanCount + 1
      };
    }

    if (foundToken.type === 'student_id') {
      const stu = studentIdCards.find((s) => s.studentId === foundToken.referenceId);
      return {
        found: true,
        isValid: foundToken.isValid,
        type: foundToken.type,
        institutionNameBn: institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
        institutionNameEn: institution?.nameEn || 'Jamia Islamia Madinatul Uloom',
        subjectNameBn: stu?.studentNameBn,
        subjectNameEn: stu?.studentNameEn,
        identifier: `রোল: ${stu?.rollNo || '১০১'} (আইডি: ${stu?.studentId})`,
        className: stu?.className,
        statusLabelBn: 'সক্রিয় শিক্ষার্থী পরিচয়পত্র',
        statusLabelEn: 'Active Student Identity',
        issuedDate: stu?.issueDate,
        verifiedAt: new Date().toLocaleTimeString(),
        scanCount: foundToken.scanCount + 1
      };
    }

    if (foundToken.type === 'teacher_id') {
      const tch = teacherIdCards.find((t) => t.teacherId === foundToken.referenceId);
      return {
        found: true,
        isValid: foundToken.isValid,
        type: foundToken.type,
        institutionNameBn: institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
        institutionNameEn: institution?.nameEn || 'Jamia Islamia Madinatul Uloom',
        subjectNameBn: tch?.teacherNameBn,
        subjectNameEn: tch?.teacherNameEn,
        identifier: tch?.designationBn,
        className: tch?.department,
        statusLabelBn: 'অনুমোদিত শিক্ষক পরিচয়পত্র',
        statusLabelEn: 'Verified Faculty Identity',
        issuedDate: tch?.issueDate,
        verifiedAt: new Date().toLocaleTimeString(),
        scanCount: foundToken.scanCount + 1
      };
    }

    return {
      found: true,
      isValid: foundToken.isValid,
      type: foundToken.type,
      subjectNameBn: foundToken.titleBn,
      subjectNameEn: foundToken.titleEn,
      verifiedAt: new Date().toLocaleTimeString(),
      scanCount: foundToken.scanCount + 1
    };
  };

  const updateInstitutionSettings = (settings: Partial<InstitutionSettingsData>) => {
    setInstitutionSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateBrandingSettings = (settings: Partial<BrandingSettingsData>) => {
    setBrandingSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateDateTimeSettings = (settings: Partial<DateTimeSettingsData>) => {
    setDateTimeSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateSystemFormats = (formats: Partial<SystemFormatsSettingsData>) => {
    setSystemFormats((prev) => ({ ...prev, ...formats }));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettingsData>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateSecuritySettings = (settings: Partial<SecuritySettingsData>) => {
    setSecuritySettings((prev) => ({ ...prev, ...settings }));
  };

  const addManagedInstitution = (instData: Omit<ManagedInstitutionAccount, 'id' | 'createdAt' | 'lastActive'>) => {
    const newInst: ManagedInstitutionAccount = {
      ...instData,
      id: `inst-${(managedInstitutions.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'এইমাত্র'
    };
    setManagedInstitutions((prev) => [...prev, newInst]);
  };

  const toggleInstitutionStatus = (id: string, status: 'active' | 'suspended' | 'archived') => {
    setManagedInstitutions((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status } : inst))
    );
  };

  const toggleInstitutionModule = (
    targetInstId: string,
    moduleKey: keyof InstitutionModuleConfig,
    enabled: boolean
  ) => {
    setInstitutionModules((prev) => {
      const current = prev[targetInstId] || {
        institutionId: targetInstId,
        hifzEnabled: true,
        boardingEnabled: true,
        foodEnabled: true,
        accountsEnabled: true,
        donationEnabled: true,
        automationEnabled: true,
        aiAssistantEnabled: true,
        smsGatewayEnabled: true,
        voiceCallEnabled: true,
        certificateEnabled: true,
        documentsEnabled: true
      };
      return {
        ...prev,
        [targetInstId]: {
          ...current,
          [moduleKey]: enabled
        }
      };
    });
  };

  const resolveSecurityAlert = (id: string) => {
    setSecurityAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a))
    );
  };

  return (
    <Part7SystemContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        createConversation,
        addChatMessage,
        clearConversation,
        deleteConversation,
        studentInsights,
        updateStudentPerformanceCategory,
        performanceAlerts,
        resolvePerformanceAlert,
        hifzInsights,
        classAnalysis,
        teacherInsights,
        aiReports,
        generateNewReport,
        deleteReport,
        guardianLogs,
        addGuardianLog,
        internalMessages,
        sendInternalMessage,
        markInternalMessageAsRead,
        supportTickets,
        createSupportTicket,
        replyToSupportTicket,
        updateSupportTicketStatus,
        documents,
        uploadDocument,
        archiveDocument,
        deleteDocument,
        idCardTemplates,
        studentIdCards,
        teacherIdCards,
        generateStudentIdCard,
        generateTeacherIdCard,
        certificateTemplates,
        generatedCertificates,
        generateCertificate,
        revokeCertificate,
        qrTokens,
        verifyQrToken,
        institutionSettings,
        updateInstitutionSettings,
        brandingSettings,
        updateBrandingSettings,
        dateTimeSettings,
        updateDateTimeSettings,
        systemFormats,
        updateSystemFormats,
        notificationSettings,
        updateNotificationSettings,
        securitySettings,
        updateSecuritySettings,
        subscriptionPlans,
        managedInstitutions,
        addManagedInstitution,
        toggleInstitutionStatus,
        institutionModules,
        toggleInstitutionModule,
        systemHealth,
        failedJobs,
        securityAlerts,
        resolveSecurityAlert,
        auditLogsDetailed,
        addAuditLogEntry
      }}
    >
      {children}
    </Part7SystemContext.Provider>
  );
};

export const usePart7System = (): Part7SystemContextType => {
  const context = useContext(Part7SystemContext);
  if (!context) {
    throw new Error('usePart7System must be used within a Part7SystemProvider');
  }
  return context;
};

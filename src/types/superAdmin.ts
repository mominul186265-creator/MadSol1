export type SubscriptionPlanTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  nameBn: string;
  nameEn: string;
  tier: SubscriptionPlanTier;
  pricePerMonth: number;
  maxStudents: number;
  maxTeachers: number;
  storageLimitGb: number;
  features: string[];
  isPopular?: boolean;
}

export interface InstitutionModuleConfig {
  institutionId: string;
  hifzEnabled: boolean;
  boardingEnabled: boolean;
  foodEnabled: boolean;
  accountsEnabled: boolean;
  donationEnabled: boolean;
  automationEnabled: boolean;
  aiAssistantEnabled: boolean;
  smsGatewayEnabled: boolean;
  voiceCallEnabled: boolean;
  certificateEnabled: boolean;
  documentsEnabled: boolean;
}

export interface ManagedInstitutionAccount {
  id: string;
  eiin: string;
  nameBn: string;
  nameEn: string;
  principalName: string;
  phone: string;
  email: string;
  address: string;
  planTier: SubscriptionPlanTier;
  status: 'active' | 'suspended' | 'archived';
  studentsCount: number;
  teachersCount: number;
  adminEmail: string;
  createdAt: string;
  lastActive: string;
}

export interface SystemMonitoringHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  uptimePercentage: number;
  apiLatencyMs: number;
  databaseStatus: 'connected' | 'reconnecting' | 'error';
  queueActiveJobs: number;
  queueFailedJobs: number;
  memoryUsageMb: number;
  cpuLoadPercentage: number;
  storageUsedGb: number;
  storageTotalGb: number;
  lastChecked: string;
}

export interface FailedJobLog {
  id: string;
  queueName: string;
  jobType: string;
  payloadSummary: string;
  errorMessage: string;
  attempts: number;
  failedAt: string;
}

export interface SecurityAlert {
  id: string;
  institutionId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'repeated_failed_login' | 'suspicious_ip' | 'permission_violation' | 'unusual_system_error';
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  affectedUser?: string;
  ipAddress?: string;
  timestamp: string;
  isResolved: boolean;
}

export interface AuditLogDetailed {
  id: string;
  institutionId: string;
  institutionName?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'success' | 'warning' | 'failed';
  timestamp: string;
}

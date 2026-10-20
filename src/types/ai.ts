export type StudentPerformanceCategory =
  | 'excellent'
  | 'good'
  | 'average'
  | 'needs_attention'
  | 'critical_attention';

export interface StudentPerformanceInsight {
  studentId: string;
  studentNameBn: string;
  studentNameEn: string;
  rollNo: string;
  className: string;
  institutionId: string;
  category: StudentPerformanceCategory;
  score: number; // 0 - 100
  attendanceRate: number; // percentage
  examAverage: number; // percentage
  hifzProgressRate?: number; // percentage
  feeDueAmount: number;
  behaviorScore: number; // 1 - 10
  trend: 'up' | 'down' | 'stable';
  insightBn: string;
  insightEn: string;
  issuesBn: string[];
  issuesEn: string[];
  recommendedActionsBn: string[];
  recommendedActionsEn: string[];
  dataSourceSummary: string;
  lastUpdated: string;
}

export interface PerformanceAlert {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  className: string;
  type: 'low_attendance' | 'low_marks' | 'hifz_drop' | 'repeated_absence' | 'high_fee_due';
  severity: 'warning' | 'critical' | 'info';
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  metricValue: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface HifzProgressInsight {
  studentId: string;
  studentName: string;
  para: number;
  surah: string;
  institutionId: string;
  sabakScore: number;
  sabkiScore: number;
  manzilScore: number;
  revisionRegularity: number; // percentage
  monthlyProgressTrend: 'accelerating' | 'consistent' | 'slowing' | 'stagnant';
  aiInsightBn: string;
  aiInsightEn: string;
  teacherActionAdvisedBn: string;
  teacherActionAdvisedEn: string;
  dataSource: string;
}

export interface ClassPerformanceAnalysis {
  className: string;
  institutionId: string;
  totalStudents: number;
  attendanceTrend: number; // percentage
  examAverage: number;
  passPercentage: number;
  weakSubjectsBn: string[];
  weakSubjectsEn: string[];
  strongSubjectsBn: string[];
  strongSubjectsEn: string[];
  aiOverviewBn: string;
  aiOverviewEn: string;
}

export interface TeacherPerformanceInsight {
  teacherId: string;
  teacherName: string;
  institutionId: string;
  attendanceRate: number;
  assignedClasses: string[];
  assignedStudentsCount: number;
  classAverageMarks: number;
  hifzProgressRate?: number;
  activityRating: 'exceptional' | 'solid' | 'satisfactory' | 'needs_support';
  summaryBn: string;
  summaryEn: string;
  dataPointsCount: number;
}

export type AiReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'academic'
  | 'attendance'
  | 'financial'
  | 'hifz'
  | 'performance'
  | 'donation'
  | 'chanda';

export interface GeneratedAiReport {
  id: string;
  institutionId: string;
  type: AiReportType;
  titleBn: string;
  titleEn: string;
  dateRange: {
    start: string;
    end: string;
  };
  departmentOrClass?: string;
  generatedAt: string;
  generatedBy: string;
  summaryBn: string;
  summaryEn: string;
  keyStatistics: {
    labelBn: string;
    labelEn: string;
    value: string;
    change?: string;
    isPositive?: boolean;
  }[];
  importantTrendsBn: string[];
  importantTrendsEn: string[];
  issuesIdentifiedBn: string[];
  issuesIdentifiedEn: string[];
  recommendedActionsBn: string[];
  recommendedActionsEn: string[];
  dataSourceSummaryBn: string;
  dataSourceSummaryEn: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextScope?: {
    institutionId: string;
    userRole: string;
    dataPointsEvaluated: number;
  };
  suggestedFollowUps?: string[];
}

export interface AiConversation {
  id: string;
  institutionId: string;
  userId: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
}

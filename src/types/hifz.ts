export type PerformanceRatingLevel = 'excellent' | 'very_good' | 'good' | 'needs_improvement' | 'weak';
export type EvaluationCriterionRating = PerformanceRatingLevel;

export type HifzStatus = 'active' | 'graduated' | 'paused' | 'transferred';

export type HifzStage = 'qaida' | 'ampara' | 'nazra' | 'hifz' | 'revision';
export type HifzBranch = 'boys' | 'mohila';

export type RevisionType = 'daily' | 'weekly' | 'monthly' | 'special';

export interface HifzStudent {
  id: string;
  institutionId: string;
  studentId: string; // e.g. std-101
  studentCode: string; // e.g. MDS-2026-0001
  fullNameBn: string;
  fullNameEn: string;
  photoUrl?: string;
  gender: 'male' | 'female';
  branch: HifzBranch; // 'boys' (ছাত্র হিফজ) or 'mohila' (মহিলা হিফজ)
  stage: HifzStage; // 'qaida' | 'ampara' | 'nazra' | 'hifz'
  department: string;
  className: string;
  section: string;
  rollNumber: string;
  currentPara: number; // 1 to 30
  currentSurah: string;
  currentAyah?: number | string;
  currentLessonDescription?: string; // e.g. 'পৃষ্ঠা ১২ - তাশদীদ ও গুন্নাহ' or 'পারা ১৯ - রুকু ৩'
  currentSaatSabak?: string; // সাত ছবক: 'সূরা আল-ফুরকান ১-২০'
  currentAmukhta?: string; // আমুক্তা ছবক: '৫ম পারা সম্পূর্ণ'
  totalCompletedParas: number; // e.g. 18
  completedParas: number[]; // array of completed paras [1, 2, ..., 18]
  progressPercentage: number; // (completed / 30) * 100 or stage progress
  assignedTeacherId: string;
  assignedTeacherName: string;
  status: HifzStatus;
  startedDate: string;
  targetCompletionDate?: string;
  notes?: string;
  guardianMobile?: string;
  guardianName?: string;
  lastEvaluatedAt?: string;
  averageRating?: number; // 1-5 scale
  lowProgressAlert?: boolean;
}

export interface SabakEntry {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  stage?: HifzStage;
  paraNumber: number;
  surahName: string;
  pageNumber?: number | string;
  fromAyah: number | string;
  toAyah: number | string;
  lessonDescription: string;
  rating: PerformanceRatingLevel;
  stars: number; // 1 to 5
  teacherComment: string;
  createdAt: string;
}

export interface SabkiEntry {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  stage?: HifzStage;
  previousLesson: string;
  revisionPortion: string; // সাত ছবক অংশ
  performance: PerformanceRatingLevel;
  stars: number;
  mistakeLevel: 'none' | 'few' | 'moderate' | 'high';
  teacherComment: string;
  createdAt: string;
}

export interface ManzilEntry {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  stage?: HifzStage;
  paraNumber: number;
  surahName: string;
  revisionPortion: string; // আমুক্তা ছবক অংশ
  performance: PerformanceRatingLevel;
  stars: number;
  teacherComment: string;
  createdAt: string;
}

export interface RevisionEntry {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  revisionType: RevisionType;
  portion: string;
  performance: PerformanceRatingLevel;
  stars: number;
  teacherComment: string;
  createdAt: string;
}

export interface DailyHifzEvaluation {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  memorization: PerformanceRatingLevel;
  sabak: PerformanceRatingLevel;
  sabki: PerformanceRatingLevel;
  manzil: PerformanceRatingLevel;
  revision: PerformanceRatingLevel;
  tajweed: PerformanceRatingLevel;
  fluency: PerformanceRatingLevel;
  behavior: PerformanceRatingLevel;
  attendance: 'present' | 'absent' | 'leave' | 'late';
  overallStars: number;
  teacherComment: string;
  createdAt: string;
}

export interface HifzTeacherAssignment {
  id: string;
  institutionId: string;
  teacherId: string;
  teacherNameBn: string;
  teacherNameEn: string;
  studentIds: string[];
  maxCapacity?: number;
  notes?: string;
}

export interface HifzAlertEvent {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  alertType: 'low_progress' | 'consecutive_weak_sabak' | 'attendance_drop';
  thresholdValue: number;
  actualValue: number;
  descriptionBn: string;
  descriptionEn: string;
  triggeredAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

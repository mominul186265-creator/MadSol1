export type ExamType =
  | 'monthly'
  | 'weekly'
  | 'half_yearly'
  | 'annual'
  | 'hifz_test'
  | 'special'
  | 'other';

export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'published';

export interface Exam {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  examType: ExamType;
  session: string;
  department: string;
  className: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectNameBn: string;
  subjectNameEn: string;
  subjectCode: string;
  fullMarks: number;
  passMarks: number;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  invigilatorName: string;
}

export interface StudentMark {
  id: string;
  institutionId: string;
  examId: string;
  subjectId: string;
  studentId: string;
  studentRoll: string;
  studentNameBn: string;
  marksObtained: number;
  isAbsent: boolean;
  remarks?: string;
  updatedAt: string;
}

export interface GradeScale {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gpa: number;
  remarksBn: string;
  remarksEn: string;
}

export interface SubjectResultDetail {
  subjectId: string;
  subjectNameBn: string;
  subjectNameEn: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number;
  grade: string;
  gpa: number;
  isPassed: boolean;
  isAbsent?: boolean;
}

export interface StudentResult {
  id: string;
  institutionId: string;
  examId: string;
  studentId: string;
  studentCode: string;
  studentNameBn: string;
  studentNameEn: string;
  studentRoll: string;
  className: string;
  department: string;
  totalMarksObtained: number;
  totalFullMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  position: number;
  isPassed: boolean;
  subjectResults: SubjectResultDetail[];
  publishedAt?: string;
}

export type RoutineDay =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface ClassRoutineEntry {
  id: string;
  institutionId: string;
  day: RoutineDay;
  department: string;
  className: string;
  section: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:45"
  room: string;
  note?: string;
}

export interface RoutineConflict {
  type: 'teacher' | 'room';
  entryA: ClassRoutineEntry;
  entryB: ClassRoutineEntry;
  messageBn: string;
  messageEn: string;
}

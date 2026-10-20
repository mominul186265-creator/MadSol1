export type QrTokenType =
  | 'student_id'
  | 'teacher_id'
  | 'certificate'
  | 'attendance_checkin'
  | 'student_profile';

export interface SecureQrToken {
  token: string; // Cryptographically random opaque identifier e.g. "MQ-98f24a-71b"
  type: QrTokenType;
  institutionId: string;
  referenceId: string; // studentId, teacherId, certificateNumber
  titleBn: string;
  titleEn: string;
  issuedAt: string;
  expiresAt?: string;
  isValid: boolean;
  scanCount: number;
}

export interface QrVerificationResult {
  found: boolean;
  isValid: boolean;
  type?: QrTokenType;
  institutionNameBn?: string;
  institutionNameEn?: string;
  subjectNameBn?: string;
  subjectNameEn?: string;
  identifier?: string;
  className?: string;
  statusLabelBn?: string;
  statusLabelEn?: string;
  issuedDate?: string;
  verifiedAt: string;
  scanCount: number;
  messageBn?: string;
  messageEn?: string;
}

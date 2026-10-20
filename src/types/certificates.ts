export type CertificateType =
  | 'admission'
  | 'study'
  | 'transfer'
  | 'character'
  | 'hifz_completion'
  | 'achievement'
  | 'custom';

export interface CertificateTemplate {
  id: string;
  institutionId: string;
  type: CertificateType;
  titleBn: string;
  titleEn: string;
  bodyTemplateBn: string;
  bodyTemplateEn: string;
  signatory1TitleBn: string;
  signatory1TitleEn: string;
  signatory2TitleBn: string;
  signatory2TitleEn: string;
  hasSeal: boolean;
  hasBorder: boolean;
  borderStyle: 'ornate' | 'modern' | 'islamic';
  primaryColor: string;
}

export interface GeneratedCertificate {
  id: string;
  institutionId: string;
  certificateNumber: string; // e.g. CERT-2026-000001
  templateId: string;
  type: CertificateType;
  titleBn: string;
  titleEn: string;
  studentId: string;
  studentNameBn: string;
  studentNameEn: string;
  className: string;
  departmentName: string;
  rollNo: string;
  issueDate: string;
  contentBn: string;
  contentEn: string;
  qrToken: string;
  status: 'valid' | 'revoked' | 'archived';
  issuedBy: string;
  verificationCount: number;
}

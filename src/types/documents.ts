export type DocumentCategory =
  | 'student_document'
  | 'teacher_document'
  | 'institution_document'
  | 'certificate'
  | 'admission_document'
  | 'financial_document'
  | 'other';

export interface DocumentPermissionRule {
  allowedRoles: string[];
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface MadrasaDocument {
  id: string;
  institutionId: string;
  documentName: string;
  category: DocumentCategory;
  ownerName: string;
  ownerType: 'student' | 'teacher' | 'institution' | 'donor';
  ownerId?: string;
  fileSize: string; // e.g. "1.4 MB"
  fileType: string; // 'pdf' | 'jpg' | 'png' | 'docx'
  fileUrl: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'active' | 'archived' | 'expired';
  notes?: string;
  isSensitive: boolean;
  permissions: DocumentPermissionRule;
  uploadedBy: string;
}

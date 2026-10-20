export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred' | 'archived';

export type Gender = 'male' | 'female';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export interface AddressInfo {
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  division: string;
  country: string;
  fullAddress: string;
}

export interface Student {
  id: string;
  institutionId: string;
  studentId: string; // e.g., 'MDS-2026-0001'
  admissionId: string; // e.g., 'ADM-2026-001'
  fullNameBn: string;
  fullNameEn: string;
  photoUrl?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  bloodGroup: BloodGroup;
  nationality: string;
  religion: string;
  nidOrBirthCertificate?: string;

  // Academic Info
  department: string; // e.g., 'হিফজুল কুরআন', 'কিতাব বিভাগ', 'নূরানী'
  className: string; // e.g., 'হিফজ শেষ পর্ব', 'মিশকাত', 'শরহে জামি'
  section: string; // e.g., 'ক', 'খ', 'A', 'B'
  session: string; // e.g., '২০২৬ (১৪৪৭-১৪৪৮ হি.)'
  rollNumber: string; // e.g., '১২'
  admissionDate: string; // YYYY-MM-DD
  previousInstitution?: string;

  // Guardian Info
  guardianId: string;
  guardianRelationship: 'father' | 'mother' | 'uncle' | 'brother' | 'other';
  fatherName: string;
  fatherMobile: string;
  motherName: string;
  motherMobile?: string;
  guardianName: string;
  guardianMobile: string;
  guardianEmail?: string;

  // Address
  presentAddress: AddressInfo;
  permanentAddress: AddressInfo;
  isSameAddress: boolean;

  // Additional Info
  isBoarding: boolean; // আবাসিক / অনাবাসিক
  isOrphan: boolean; // এতিম শিক্ষার্থী
  specialNotes?: string;
  medicalNotes?: string;
  status: StudentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface Guardian {
  id: string;
  institutionId: string;
  fullNameBn: string;
  fullNameEn: string;
  mobile: string;
  email?: string;
  nid?: string;
  occupation?: string;
  photoUrl?: string;
  address: string;
  relationship: string;
  linkedStudentIds: string[]; // List of Student IDs linked to this guardian
  createdAt: string;
  updatedAt: string;
}

export type AdmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AdmissionRequest {
  id: string;
  institutionId: string;
  applicationNumber: string; // e.g. 'APP-2026-001'
  applicantNameBn: string;
  applicantNameEn: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  department: string;
  desiredClass: string;
  session: string;
  previousInstitution?: string;

  // Guardian details
  guardianName: string;
  guardianRelationship: string;
  guardianMobile: string;
  guardianEmail?: string;
  presentAddress: string;
  isBoarding: boolean;

  status: AdmissionStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  generatedStudentId?: string;

  // Compatibility aliases
  appliedDepartment?: string;
  appliedClass?: string;
  appliedDate?: string;
  address?: string;
  enrolledStudentId?: string;
}

export type AdmissionApplication = AdmissionRequest;

export type StudentProfileTab =
  | 'overview'
  | 'academic'
  | 'guardian'
  | 'attendance'
  | 'fees'
  | 'hifz'
  | 'exam'
  | 'examResult'
  | 'documents'
  | 'activity';

export interface StudentDocument {
  id: string;
  studentId: string;
  title: string;
  type: 'birth_certificate' | 'previous_certificate' | 'transfer_certificate' | 'nid_guardian' | 'medical' | 'other';
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
}

export interface StudentStatusHistory {
  id: string;
  studentId: string;
  fromStatus: StudentStatus;
  toStatus: StudentStatus;
  reason: string;
  changedBy: string;
  timestamp: string;
}

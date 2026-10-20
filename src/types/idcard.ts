export type IdCardTheme = 'emerald_classic' | 'navy_modern' | 'islamic_gold' | 'minimalist';

export interface IdCardTemplate {
  id: string;
  nameBn: string;
  nameEn: string;
  theme: IdCardTheme;
  logoPosition: 'top_center' | 'top_left';
  primaryColor: string;
  secondaryColor: string;
  hasBarcode: boolean;
  hasQrCode: boolean;
  customBackTextBn: string;
  customBackTextEn: string;
  signatoryTitleBn: string;
  signatoryTitleEn: string;
  validityYear: string;
}

export interface StudentIdCardData {
  id: string;
  institutionId: string;
  studentId: string;
  studentNameBn: string;
  studentNameEn: string;
  rollNo: string;
  className: string;
  department: string;
  guardianMobile: string;
  bloodGroup?: string;
  photoUrl?: string;
  validityDate: string;
  qrToken: string;
  issueDate: string;
}

export interface TeacherIdCardData {
  id: string;
  institutionId: string;
  teacherId: string;
  teacherNameBn: string;
  teacherNameEn: string;
  designationBn: string;
  designationEn: string;
  department: string;
  mobile: string;
  email?: string;
  bloodGroup?: string;
  photoUrl?: string;
  qrToken: string;
  issueDate: string;
}

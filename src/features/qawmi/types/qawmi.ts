export type QawmiBranch = 'boys' | 'mohila';

export interface KitabDetail {
  nameBn: string;
  nameAr: string;
  subject: string;
  authorBn: string;
  examMarks: number;
  passMarks: number;
  weeklyPeriods?: number;
  syllabusScopeBn: string;
  firstTermSyllabusBn?: string;
  secondTermSyllabusBn?: string;
  finalTermSyllabusBn?: string;
}

export interface QawmiClassItem {
  id: string;
  order: number;
  levelBn: string;
  nameBn: string;
  nameAr: string;
  marhalaBn: string;
  govEquivalentBn: string;
  studentCount: number;
  totalKitabs: number;
  headTeacherBn: string;
  kitabs: KitabDetail[];
  descriptionBn: string;
  durationMonths: number;
  dailyPeriods: number;
  gradientTheme: {
    cardBg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accentText: string;
    glow: string;
    iconBg: string;
    stripColor: string;
  };
  tag: 'ibtidaiya' | 'mutawassita' | 'sanabia' | 'fazilat' | 'dawra' | 'takhassus';
}

export interface QawmiStudentItem {
  id: string;
  roll: number;
  nameBn: string;
  fatherNameBn: string;
  regId: string;
  mobile: string;
  districtBn: string;
  isResidential: boolean;
  isHafez: boolean;
  attendancePct: number;
  status: 'active' | 'leave';
}

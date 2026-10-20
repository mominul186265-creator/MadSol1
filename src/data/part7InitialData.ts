import {
  StudentPerformanceInsight,
  PerformanceAlert,
  HifzProgressInsight,
  ClassPerformanceAnalysis,
  TeacherPerformanceInsight,
  GeneratedAiReport,
  AiConversation,
  GuardianContactLog,
  InternalMessage,
  SupportTicket,
  MadrasaDocument,
  IdCardTemplate,
  StudentIdCardData,
  TeacherIdCardData,
  CertificateTemplate,
  GeneratedCertificate,
  SecureQrToken,
  InstitutionSettingsData,
  BrandingSettingsData,
  DateTimeSettingsData,
  SystemFormatsSettingsData,
  NotificationSettingsData,
  SecuritySettingsData,
  SubscriptionPlan,
  InstitutionModuleConfig,
  ManagedInstitutionAccount,
  SystemMonitoringHealth,
  FailedJobLog,
  SecurityAlert,
  AuditLogDetailed
} from '../types';

// ==========================================
// 1. AI ASSISTANT & ANALYTICS INITIAL DATA
// ==========================================

export const INITIAL_AI_CONVERSATIONS: AiConversation[] = [
  {
    id: 'conv-01',
    institutionId: 'inst-001',
    userId: 'user-002',
    title: 'আজকের সামগ্রিক উপস্থিতি ও বকেয়া পর্যালোচনা',
    createdAt: '2026-09-11 10:30 AM',
    updatedAt: '2026-09-11 10:35 AM',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'আজ কতজন শিক্ষার্থী অনুপস্থিত এবং কোন ক্লাসে উপস্থিতি সবচেয়ে কম?',
        timestamp: '10:30 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `**আজকের উপস্থিতি বিশ্লেষণ রিপোর্ট (জামেয়া ইসলামিয়া মদিনাতুল উলুম):**
- মোট শিক্ষার্থী: **৩১০ জন**
- আজকের উপস্থিতি: **২৯২ জন** (৯৪.২%)
- আজকের মোট অনুপস্থিত: **১৮ জন** (৫.৮%)

📉 **সবচেয়ে কম উপস্থিতির জামাত:**
- **হিফজুল কুরআন বিভাগ (গ্রুপ-খ)**: উপস্থিতি ৮৮.৫% (৪ জন ছুটি ব্যতীত অনুপস্থিত)।
- এর পরেই **মিযান জামাত**: উপস্থিতি ৯০.২% (৩ জন অসুস্থতার দরখাস্তসহ অনুপস্থিত)।

💡 **স্বয়ংক্রিয় পরামর্শ:** অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের কাছে স্বয়ংক্রিয় এসএমএস অ্যালার্ট কিউতে পাঠানো হয়েছে। আপনি চাইলে "অভিভাবক যোগাযোগ" থেকে সরাসরি কল বা মেসেজ পাঠাতে পারেন।`,
        timestamp: '10:31 AM',
        contextScope: {
          institutionId: 'inst-001',
          userRole: 'madrasa_admin',
          dataPointsEvaluated: 310
        },
        suggestedFollowUps: [
          'হিফজ বিভাগের অনুপস্থিত ৪ জনের নাম তালিকা দিন',
          'এই মাসে মোট বকেয়া ফি কত?',
          'আজকের অনুপস্থিতির এসএমএস স্ট্যাটাস কী?'
        ]
      }
    ]
  }
];

export const INITIAL_STUDENT_PERFORMANCE_INSIGHTS: StudentPerformanceInsight[] = [
  {
    studentId: 'stu-001',
    studentNameBn: 'মুহাম্মদ আব্দুল্লাহ',
    studentNameEn: 'Muhammad Abdullah',
    rollNo: '১০১',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    institutionId: 'inst-001',
    category: 'excellent',
    score: 95,
    attendanceRate: 98,
    examAverage: 96,
    hifzProgressRate: 94,
    feeDueAmount: 0,
    behaviorScore: 10,
    trend: 'up',
    insightBn: 'প্রতিদিন গড়ে ১.৫ পৃষ্ঠা নতুন সবক সফলভাবে মুখস্থ করছেন। উপস্থিতি প্রায় শতভাগ এবং সবকিতে কোনো ত্রুটি নেই।',
    insightEn: 'Memorizing 1.5 pages of Sabaq daily. Consistent near-100% attendance and flawless Sabqi revision.',
    issuesBn: ['কোনো গুরুতর সমস্যা নেই'],
    issuesEn: ['No major issues observed'],
    recommendedActionsBn: ['আগামী জাতীয় হিফজুল কুরআন প্রতিযোগিতায় অংশগ্রহণের জন্য মনোনীত করা যেতে পারে।'],
    recommendedActionsEn: ['Consider nominating for upcoming National Quran Memorization Competition.'],
    dataSourceSummary: 'হিফজ লগ, পরীক্ষার ফলাফল ও দৈনিক উপস্থিতি সমন্বিত ডাটাবেস।',
    lastUpdated: '2026-09-11'
  },
  {
    studentId: 'stu-002',
    studentNameBn: 'আহমাদ সালমান',
    studentNameEn: 'Ahmad Salman',
    rollNo: '১০২',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    institutionId: 'inst-001',
    category: 'needs_attention',
    score: 64,
    attendanceRate: 78,
    examAverage: 62,
    hifzProgressRate: 58,
    feeDueAmount: 3500,
    behaviorScore: 7,
    trend: 'down',
    insightBn: 'গত ৩ সপ্তাহে উপস্থিতির হার ১৫% কমেছে। আমুন্তা (পেছনের রিভিশন) রিটেনশনে ঘাটতি দেখা যাচ্ছে এবং বকেয়া ফি ৩,৫০০৳ বাকি রয়েছে।',
    insightEn: 'Attendance dropped 15% in past 3 weeks. Amokhta revision retention needs improvement; overdue fee ৳3,500.',
    issuesBn: ['অনুপস্থিতির হার বেশি', 'সবকিতে দুর্বলতা', '২ মাসের ফি বকেয়া'],
    issuesEn: ['High absence rate', 'Struggling in Sabqi revision', '2 months overdue fees'],
    recommendedActionsBn: [
      'অভিভাবকের সাথে জরুরি মতবিনিময় সভা আয়োজন করুন।',
      'উস্তাযের সাথে প্রতিদিন অতিরিক্ত ৩০ মিনিট আমুন্তা রিভিশন সেশন বরাদ্দ করুন।'
    ],
    recommendedActionsEn: [
      'Schedule an urgent consultation meeting with the guardian.',
      'Assign an extra 30-minute daily Amokhta revision session with teacher.'
    ],
    dataSourceSummary: 'গত ৩০ দিনের উপস্থিতি রেজিস্টার, হিফজ সাবক লগ এবং ফি খতিয়ান।',
    lastUpdated: '2026-09-11'
  },
  {
    studentId: 'stu-003',
    studentNameBn: 'মাহমুদুল হাসান',
    studentNameEn: 'Mahmudul Hasan',
    rollNo: '২০১',
    className: 'মিযান জামাত',
    institutionId: 'inst-001',
    category: 'good',
    score: 84,
    attendanceRate: 92,
    examAverage: 86,
    feeDueAmount: 500,
    behaviorScore: 9,
    trend: 'stable',
    insightBn: 'আরবি ব্যাকরণ ও সরফে চমৎকার মেধার পরিচয় দিয়েছেন। তবে ফারসি কিতাবে সামান্য দুর্বলতা রয়েছে।',
    insightEn: 'Demonstrates solid grasp of Arabic Sarf & Nahw. Minor assistance needed in Persian texts.',
    issuesBn: ['সামান্য বকেয়া ফি'],
    issuesEn: ['Nominal outstanding fee balance'],
    recommendedActionsBn: ['ফারসি ক্লাসের হোমওয়ার্ক নিয়মিত তদারকি করা।'],
    recommendedActionsEn: ['Regularly monitor Persian class assignments.'],
    dataSourceSummary: 'সাময়িক পরীক্ষার রেজাল্ট শিট ও ক্লাস পারফরম্যান্স খাতা।',
    lastUpdated: '2026-09-10'
  },
  {
    studentId: 'stu-004',
    studentNameBn: 'জুবায়ের বিন খালিদ',
    studentNameEn: 'Zubair Bin Khalid',
    rollNo: '১০৫',
    className: 'নূরানী ৩য় শ্রেণি',
    institutionId: 'inst-001',
    category: 'critical_attention',
    score: 48,
    attendanceRate: 65,
    examAverage: 51,
    feeDueAmount: 4800,
    behaviorScore: 6,
    trend: 'down',
    insightBn: 'টানা ৪ দিন বিনা অনুমতিতে অনুপস্থিত। মাখরাজ ও তাজবিদ অনুশীলনে পিছিয়ে পড়ছে। অভিভাবকের ফোন একাধিকবার বন্ধ পাওয়া গেছে।',
    insightEn: 'Absent for 4 consecutive days without notice. Falling behind in Tajweed; guardian phone unreachable.',
    issuesBn: ['টানা ৪ দিন অনুপস্থিত', 'অভিভাবক যোগাযোগহীন', '৩ মাসের ফি বকেয়া'],
    issuesEn: ['Consecutive 4 days absent', 'Guardian unreachable', '3 months fee overdue'],
    recommendedActionsBn: [
      'হোম ভিজিট বা স্থানীয় পরিচিত মারফত অভিভাবককে নোটিশ প্রদান।',
      'প্রিন্সিপাল বরাবর স্পেশাল অ্যাকশন রিপোর্ট সাবমিট।'
    ],
    recommendedActionsEn: [
      'Issue physical notice or arrange home visit.',
      'Submit special action report to Principal.'
    ],
    dataSourceSummary: 'দৈনিক হাজিরা তালিকা, অভিভাবক যোগাযোগ লগ ও বকেয়া হিসাব।',
    lastUpdated: '2026-09-12'
  }
];

export const INITIAL_PERFORMANCE_ALERTS: PerformanceAlert[] = [
  {
    id: 'alt-01',
    institutionId: 'inst-001',
    studentId: 'stu-004',
    studentName: 'জুবায়ের বিন খালিদ',
    className: 'নূরানী ৩য় শ্রেণি',
    type: 'repeated_absence',
    severity: 'critical',
    titleBn: 'টানা অনুপস্থিতি ও যোগাযোগহীন অভিভাবক',
    titleEn: 'Repeated Absence & Unreachable Guardian',
    descriptionBn: 'শিক্ষার্থী টানা ৪ দিন ক্লাসে অনুপস্থিত রয়েছে এবং অভিভাবকের মোবাইল ফোনে সংযোগ পাওয়া যাচ্ছে না।',
    descriptionEn: 'Student absent for 4 consecutive days and guardian phone is currently unreachable.',
    metricValue: '৪ দিন অনুপস্থিত (৬৫% উপস্থিতি)',
    createdAt: '2026-09-12 09:00 AM',
    isResolved: false
  },
  {
    id: 'alt-02',
    institutionId: 'inst-001',
    studentId: 'stu-002',
    studentName: 'আহমাদ সালমান',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    type: 'hifz_drop',
    severity: 'warning',
    titleBn: 'হিফজ সবকি ও আমুন্তায় অবনতি',
    titleEn: 'Drop in Hifz Sabqi & Amokhta Retention',
    descriptionBn: 'গত ২ সপ্তাহে রিভিশন সবকিতে বারবার ভুল হচ্ছে। নির্ধারিত ৩ পারা পেছনের মুখস্থ কাঙ্ক্ষিত মানের নিচে।',
    descriptionEn: 'Recurrent errors in revision lessons over past 2 weeks. Past 3 Paras retention below benchmark.',
    metricValue: '৫৮% রিভিশন স্কোর',
    createdAt: '2026-09-11 04:30 PM',
    isResolved: false
  },
  {
    id: 'alt-03',
    institutionId: 'inst-001',
    studentId: 'stu-002',
    studentName: 'আহমাদ সালমান',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    type: 'high_fee_due',
    severity: 'warning',
    titleBn: '২ মাসের অধিক ফি বকেয়া',
    titleEn: 'Over 2 Months Outstanding Fee Due',
    descriptionBn: 'শিক্ষার্থীর হোস্টেল ও মেস ফি বাবদ মোট ৩,৫০০৳ বাকি রয়েছে। স্বয়ংক্রিয় তাগাদা পাঠানো প্রয়োজন।',
    descriptionEn: 'Overdue hostel and dining fees amounting to ৳3,500 require reminder notification.',
    metricValue: '৳৩,৫০০ বকেয়া',
    createdAt: '2026-09-10 11:15 AM',
    isResolved: true,
    resolvedAt: '2026-09-11 02:00 PM',
    resolvedBy: 'হিসাবরক্ষক মাওলানা তারিক'
  }
];

export const INITIAL_HIFZ_INSIGHTS: HifzProgressInsight[] = [
  {
    studentId: 'stu-001',
    studentName: 'মুহাম্মদ আব্দুল্লাহ',
    para: 18,
    surah: 'সূরা আল-কাহাফ',
    institutionId: 'inst-001',
    sabakScore: 96,
    sabkiScore: 94,
    manzilScore: 92,
    revisionRegularity: 98,
    monthlyProgressTrend: 'accelerating',
    aiInsightBn: 'মাশাআল্লাহ! নতুন সবক অর্জনের গতি অত্যন্ত সন্তোষজনক। তবে ১৮তম পারার জটিল আয়াতের ওয়াকফ ও তাজবিদের গুন্নায় সামান্য অতিরিক্ত মনোযোগ উপকারী হবে।',
    aiInsightEn: 'MashaAllah! New Sabaq acquisition speed is remarkable. Slightly more focus on Waqf & Ghunna in Para 18 advised.',
    teacherActionAdvisedBn: 'সাপ্তাহিক একবার সম্পূর্ণ ১৮তম পারা একটানা শোনার পরামর্শ দেওয়া হলো।',
    teacherActionAdvisedEn: 'Recommend listening to the entire 18th Para in one continuous sitting once weekly.',
    dataSource: 'দৈনিক হিফজ রেজিস্টার ও বিগত ৩ সপ্তাহের সাপ্তাহিক পরীক্ষা।'
  },
  {
    studentId: 'stu-002',
    studentName: 'আহমাদ সালমান',
    para: 12,
    surah: 'সূরা ইউসুফ',
    institutionId: 'inst-001',
    sabakScore: 78,
    sabkiScore: 58,
    manzilScore: 60,
    revisionRegularity: 62,
    monthlyProgressTrend: 'slowing',
    aiInsightBn: 'এই শিক্ষার্থীর নতুন সবক মোটামুটি ভালো হলেও নিয়মিত Revision (আমুন্তা) দুর্বল। পেছনের ১০ম ও ১১শ পারার ইয়াদ কাঁচা হয়ে যাচ্ছে।',
    aiInsightEn: 'While new Sabaq is acceptable, regular revision (Amokhta) is lagging. Retention in Paras 10 and 11 is weakening.',
    teacherActionAdvisedBn: 'নতুন সবক অর্ধ-পৃষ্ঠায় নামিয়ে দিয়ে প্রতিদিন পেছনের ১ পারা বাধ্যতামূলক মুখস্থ শুনুন।',
    teacherActionAdvisedEn: 'Reduce new Sabaq to half-page and mandate 1 full Para of backward revision daily.',
    dataSource: 'বিগত ৩০ দিনের সবকি ট্র্যাকিং ও আমুন্তা অডিট ডাটা।'
  }
];

export const INITIAL_CLASS_ANALYSIS: ClassPerformanceAnalysis[] = [
  {
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    institutionId: 'inst-001',
    totalStudents: 28,
    attendanceTrend: 94.6,
    examAverage: 88.2,
    passPercentage: 96.4,
    weakSubjectsBn: ['আমুন্তা রিভিশন', 'ওয়াকফ নিয়মাবলি'],
    weakSubjectsEn: ['Amokhta Revision', 'Waqf Rules'],
    strongSubjectsBn: ['দৈনিক সবক', 'তাজবিদ উচ্চারণ'],
    strongSubjectsEn: ['Daily Sabaq', 'Tajweed Articulation'],
    aiOverviewBn: 'শ্রেণির সার্বিক অগ্রগতি অত্যন্ত সন্তোষজনক। বেশিরভাগ শিক্ষার্থী নির্ধারিত সময়ের আগেই পারা সম্পন্ন করতে পারছে।',
    aiOverviewEn: 'Overall class trajectory is exceptional with majority on track to complete Paras ahead of schedule.'
  },
  {
    className: 'মিযান জামাত',
    institutionId: 'inst-001',
    totalStudents: 34,
    attendanceTrend: 91.2,
    examAverage: 79.5,
    passPercentage: 91.1,
    weakSubjectsBn: ['ফারসি কিয়াতাব', 'ইনশা ও মাকালাত'],
    weakSubjectsEn: ['Persian Literature', 'Arabic Essay Composition'],
    strongSubjectsBn: ['ইলমুস সরফ', 'নাহবে মীর'],
    strongSubjectsEn: ['Ilm-us-Sarf', 'Nahw Fundamentals'],
    aiOverviewBn: 'ব্যাকরণে ভিত্তি মজবুত হলেও লিখিত প্রকাশভঙ্গি ও ফারসিতে অতিরিক্ত টিউটোরিয়াল প্রয়োজন।',
    aiOverviewEn: 'Strong grammatical foundation; supplementary tutorial sessions recommended for Persian literature.'
  }
];

export const INITIAL_TEACHER_INSIGHTS: TeacherPerformanceInsight[] = [
  {
    teacherId: 'tch-001',
    teacherName: 'মাওলানা মাহমুদ হাসান',
    institutionId: 'inst-001',
    attendanceRate: 98.5,
    assignedClasses: ['হিফজুল কুরআন (গ্রুপ-ক)', 'হিফজুল কুরআন (গ্রুপ-খ)'],
    assignedStudentsCount: 52,
    classAverageMarks: 87.4,
    hifzProgressRate: 92.0,
    activityRating: 'exceptional',
    summaryBn: 'ক্লাসে উপস্থিতির ধারাবাহিকতা প্রশংসনীয়। উনার তদারকিতে হিফজ শিক্ষার্থীদের রিভিশন ও দৈনিক সবক সম্পন্নতার হার মাদ্রাসায় সর্বোচ্চ।',
    summaryEn: 'Exemplary attendance record. Supervised Hifz cohorts consistently demonstrate the highest completion metrics.',
    dataPointsCount: 420
  },
  {
    teacherId: 'tch-002',
    teacherName: 'মুফতি রফিকুল ইসলাম',
    institutionId: 'inst-001',
    attendanceRate: 95.0,
    assignedClasses: ['মিযান জামাত', 'নাহবে মীর জামাত'],
    assignedStudentsCount: 68,
    classAverageMarks: 81.2,
    activityRating: 'solid',
    summaryBn: 'নিয়মিত ক্লাস রুটিন ও পরীক্ষার খাতা মূল্যায়নে সময়নিষ্ঠ। ছাত্রদের সাথে একাডেমিক যোগাযোগ অত্যন্ত কার্যকর।',
    summaryEn: 'Punctual in course schedules and examination grading. Excellent academic rapport with students.',
    dataPointsCount: 315
  }
];

export const INITIAL_AI_REPORTS: GeneratedAiReport[] = [
  {
    id: 'rep-01',
    institutionId: 'inst-001',
    type: 'monthly',
    titleBn: 'আগস্ট ২০২৬ সামগ্রিক মাসিক প্রাতিষ্ঠানিক পর্যালোচনা',
    titleEn: 'August 2026 Comprehensive Institutional Performance Review',
    dateRange: { start: '2026-08-01', end: '2026-08-31' },
    generatedAt: '2026-09-01 09:00 AM',
    generatedBy: 'MadSol AI Engine v3.0',
    summaryBn: 'আগস্ট মাসে মোট রাজস্ব আদায় হয়েছে ৩,৪৫,০০০৳ এবং মোট পরিচালনা ব্যয় হয়েছে ২,৮৮,২০০৳ (উদ্বৃত্ত: +৫৬,৮০০৳)। প্রাতিষ্ঠানিক সার্বিক উপস্থিতি ৯৩.৮% এবং হিফজ বিভাগে নতুন ৩ জন শিক্ষার্থী পূর্ণ কুরআন খতম সম্পন্ন করেছেন।',
    summaryEn: 'Total revenue collected in August ৳345,000 against operational expenditure of ৳288,200 (Net surplus: +৳56,800). Overall attendance 93.8% and 3 students completed full Quran Hifz.',
    keyStatistics: [
      { labelBn: 'মোট রাজস্ব আদায়', labelEn: 'Total Revenue', value: '৳৩,৪৫,০০০', change: '+১২%', isPositive: true },
      { labelBn: 'পরিচালন ব্যয়', labelEn: 'Operating Cost', value: '৳২,৮৮,২০০', change: '-৪%', isPositive: true },
      { labelBn: 'গড় উপস্থিতি', labelEn: 'Average Attendance', value: '৯৩.৮%', change: '+১.৫%', isPositive: true },
      { labelBn: 'নতুন হিফজ খতম', labelEn: 'New Hifz Khatams', value: '৩ জন', isPositive: true }
    ],
    importantTrendsBn: [
      'ডিজিটাল পেমেন্ট গেটওয়ের মাধ্যমে ফি প্রদানের হার গত মাসের তুলনায় ১৮% বৃদ্ধি পেয়েছে।',
      'মেস ও খাদ্য বিভাগের অপচয় রোধ উদ্যোগের ফলে মাথাপিছু খাবার খরচ ৮% হ্রাস পেয়েছে।'
    ],
    importantTrendsEn: [
      'Digital fee payment adoption increased by 18% compared to prior month.',
      'Per-student dining food expenditure reduced by 8% due to anti-waste initiatives.'
    ],
    issuesIdentifiedBn: [
      'নূরানী বিভাগে ১২ জন শিক্ষার্থীর ২ মাসের অধিক ফি বকেয়া রয়েছে।',
      'আবাসিক ছাত্রদের মধ্যে মৌসুমি জ্বরের কারণে ৩য় সপ্তাহে সাময়িক উপস্থিতি কমেছিল।'
    ],
    issuesIdentifiedEn: [
      'Over 2 months overdue tuition in Noorani section (12 students).',
      'Brief dip in residential attendance during 3rd week due to seasonal flu.'
    ],
    recommendedActionsBn: [
      'বকেয়া আদায়ের জন্য আগামী সপ্তাহে অটোমেটেড এসএমএস ক্যাম্পেইন পরিচালনা করা।',
      'মাদ্রাসার প্রাথমিক স্বাস্থ্য পরীক্ষা ও ক্যাম্পেইন আয়োজন।'
    ],
    recommendedActionsEn: [
      'Dispatch automated SMS recovery reminder campaign for overdue tuition.',
      'Organize a primary healthcare checkup camp on campus.'
    ],
    dataSourceSummaryBn: 'আয়-ব্যয় লেজার, শিক্ষার্থী ফি তালিকা, দৈনিক উপস্থিতি রেজিস্টার ও হিফজ সমাপনী লগ।',
    dataSourceSummaryEn: 'General accounts ledger, student billing, daily attendance logs and Hifz completion registry.'
  },
  {
    id: 'rep-02',
    institutionId: 'inst-001',
    type: 'financial',
    titleBn: 'চলতি ত্রৈমাসিক আয়, ব্যয় ও তহবিল ব্যালেন্স অডিট রিপোর্ট',
    titleEn: 'Quarterly Income, Expenditure & Fund Audit Report',
    dateRange: { start: '2026-06-01', end: '2026-08-31' },
    generatedAt: '2026-09-05 11:30 AM',
    generatedBy: 'MadSol AI Engine v3.0',
    summaryBn: 'ত্রৈমাসিকে মোট অনুদান ও চাঁদা সংগ্রহ হয়েছে ২,৮৫,০০০৳, শিক্ষার্থীদের বেতন আদায় ৭,২০,০০০৳ এবং শিক্ষক-কর্মচারীদের মোট বেতন প্রদান করা হয়েছে ৫,৪০,০০০৳।',
    summaryEn: 'Quarterly donation/chanda collection stood at ৳285,000, tuition fee revenue ৳720,000, and faculty payroll disbursed ৳540,000.',
    keyStatistics: [
      { labelBn: 'মোট সংগৃহীত আয়', labelEn: 'Total Revenue', value: '৳১০,০৫,০০০', isPositive: true },
      { labelBn: 'মোট পরিশোধিত ব্যয়', labelEn: 'Total Expenditure', value: '৳৮,৪৫,০০০', isPositive: true },
      { labelBn: 'রিজার্ভ তহবিল স্থিতি', labelEn: 'Reserve Fund Balance', value: '৳৪,৬০,০০০', isPositive: true }
    ],
    importantTrendsBn: ['মাসিক চাঁদা প্রদানকারী শুভাকাঙ্ক্ষীর সংখ্যা ১৭% বৃদ্ধি পেয়েছে।'],
    importantTrendsEn: ['Recurring monthly Chanda donors expanded by 17%.'],
    issuesIdentifiedBn: ['বিদ্যুৎ বিলের সারচার্জ বৃদ্ধির কারণে ইউটিলিটি ব্যয় কিছুটা বৃদ্ধি পেয়েছে।'],
    issuesIdentifiedEn: ['Utility expense climbed moderately due to peak summer tariff adjustment.'],
    recommendedActionsBn: ['মাদ্রাসার প্রধান ভবনে সোলার প্যানেল স্থাপনের প্রস্তাবনা বিবেচনা করা যেতে পারে।'],
    recommendedActionsEn: ['Evaluate proposal for rooftop solar installation on main administrative building.'],
    dataSourceSummaryBn: 'ব্যাংক স্টেটমেন্ট, ক্যাশ খতিয়ান ও বেতন ভাউচার।',
    dataSourceSummaryEn: 'Bank reconciliation, cash book and faculty payroll receipts.'
  }
];

// ==========================================
// 2. GUARDIAN COMMUNICATION & MESSAGES
// ==========================================

export const INITIAL_GUARDIAN_LOGS: GuardianContactLog[] = [
  {
    id: 'glog-01',
    institutionId: 'inst-001',
    guardianId: 'grd-001',
    guardianName: 'জনাব রফিকুল ইসলাম',
    guardianPhone: '01711223344',
    studentId: 'stu-001',
    studentName: 'মুহাম্মদ আব্দুল্লাহ',
    channel: 'sms',
    title: 'উপস্থিতি ও সাপ্তাহিক অগ্রগতি নোটিফিকেশন',
    content: 'আসসালামু আলাইকুম। আপনার সন্তান মুহাম্মদ আব্দুল্লাহ এ সপ্তাহে শতভাগ উপস্থিত ছিল ও ১৮তম পারা শুরু করেছে। জাযাকাল্লাহু খাইরান।',
    sentAt: '2026-09-11 05:00 PM',
    status: 'delivered',
    senderName: 'সিস্টেম অটোমেশন'
  },
  {
    id: 'glog-02',
    institutionId: 'inst-001',
    guardianId: 'grd-002',
    guardianName: 'মাওলানা আবুল হোসেন',
    guardianPhone: '01811334455',
    studentId: 'stu-002',
    studentName: 'আহমাদ সালমান',
    channel: 'app_message',
    title: 'হিফজ রিভিশন ও বিশেষ মিটিং সংক্রান্ত',
    content: 'মুহতারাম, আহমাদ সালমানের রিভিশন ক্লাসের উন্নতির বিষয়ে আগামী শনিবার আসরের পর উস্তাযের সাথে একটু সাক্ষাতের জন্য অনুরোধ করা যাচ্ছে।',
    sentAt: '2026-09-11 02:30 PM',
    status: 'read',
    senderName: 'মাওলানা মাহমুদ হাসান (উস্তায)'
  },
  {
    id: 'glog-03',
    institutionId: 'inst-001',
    guardianId: 'grd-004',
    guardianName: 'আলহাজ্ব মোকাররম হোসেন',
    guardianPhone: '01911445566',
    studentId: 'stu-004',
    studentName: 'জুবায়ের বিন খালিদ',
    channel: 'sms',
    title: 'অনুপস্থিতির জরুরি নোটিশ',
    content: 'জরুরি নোটিশ: আপনার সন্তান জুবায়ের বিগত ৪ দিন মাদ্রাসায় অনুপস্থিত রয়েছে। অনুগ্রহ করে মাদ্রাসার দফতরে যোগাযোগ করুন।',
    sentAt: '2026-09-12 09:15 AM',
    status: 'sent',
    senderName: 'নাযেম-এ-তা\'লীমাত'
  }
];

export const INITIAL_INTERNAL_MESSAGES: InternalMessage[] = [
  {
    id: 'im-01',
    institutionId: 'inst-001',
    senderId: 'user-003',
    senderName: 'মুহতামিম মুফতি হাবিবুর রহমান',
    senderRole: 'principal',
    recipientId: 'user-002',
    recipientName: 'মাওলানা আবুল কাশেম',
    recipientRole: 'madrasa_admin',
    subject: 'আসন্ন ঈদে মিলাদুন্নবী উপলক্ষে বিশেষ কেরাত মাহফিলের প্রস্তুতি',
    body: 'মুহতারাম অ্যাডমিন সাহেব, আগামী মাসের বিশেষ কেরাত মাহফিল উপলক্ষে হিফজ বিভাগের প্রস্তুত শিক্ষার্থীদের তালিকা ও মেহমানদের আবাসন প্ল্যানটি ফাইনাল করুন।',
    sentAt: '2026-09-11 11:00 AM',
    isRead: true,
    readAt: '2026-09-11 11:20 AM'
  },
  {
    id: 'im-02',
    institutionId: 'inst-001',
    senderId: 'user-004',
    senderName: 'মাওলানা মাহমুদ হাসান',
    senderRole: 'teacher',
    recipientId: 'user-002',
    recipientName: 'মাওলানা আবুল কাশেম',
    recipientRole: 'madrasa_admin',
    subject: 'হিফজ বিভাগের নতুন কুর\'আন শরীফ রেহাল রিকুইজিশন',
    body: 'আসসালামু আলাইকুম। হিফজুল কুরআন গ্রুপ-ক এর শিক্ষার্থীদের জন্য ১০টি কাঠের রেহাল ও ৫টি ৩০ পারা কুরআনুল কারিম কপি প্রয়োজন। অনুগ্রহ করে অনুমোদন দিন।',
    sentAt: '2026-09-12 08:30 AM',
    isRead: false
  },
  {
    id: 'im-03',
    institutionId: 'inst-001',
    senderId: 'user-005',
    senderName: 'মাওলানা তারিক জামিল',
    senderRole: 'accountant',
    recipientId: 'user-003',
    recipientName: 'মুহতামিম মুফতি হাবিবুর রহমান',
    recipientRole: 'principal',
    subject: 'আগস্ট মাসের শিক্ষক বেতন ও মেস ব্যয়ের চূড়ান্ত খতিয়ান প্রস্তুত',
    body: 'শ্রদ্ধেয় মুহতামিম সাহেব, আগস্ট মাসের সকল উস্তায ও কর্মচারীদের পে-রোল ভাউচার প্রস্তুত রয়েছে। আপনার স্বাক্ষর ও অডিট অনুমোদনের অপেক্ষায় আছে।',
    sentAt: '2026-09-10 04:45 PM',
    isRead: true,
    readAt: '2026-09-10 05:10 PM'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    institutionId: 'inst-001',
    ticketNumber: 'TKT-2026-0001',
    userId: 'user-002',
    userName: 'মাওলানা আবুল কাশেম',
    userRole: 'madrasa_admin',
    userPhone: '01712345678',
    subject: 'বাল্ক এসএমএস গেটওয়ে ব্যালেন্স রিচার্জ কনফার্মেশন',
    category: 'account_issue',
    priority: 'high',
    status: 'in_progress',
    description: 'আমরা আজ সকালে বিকাশের মাধ্যমে ৫,০০০ এসএমএস প্যাকের জন্য ২,৫০০৳ পেমেন্ট করেছি। কিন্তু ড্যাশবোর্ডে ক্রেডিট এখনো যুক্ত হয়নি। ট্রানজেকশন আইডি: 9J4K2L8P.',
    attachmentName: 'bkash_receipt_5000_sms.jpg',
    createdAt: '2026-09-11 09:30 AM',
    updatedAt: '2026-09-11 11:00 AM',
    messages: [
      {
        id: 'tm-1',
        ticketId: 'tkt-01',
        senderId: 'user-002',
        senderName: 'মাওলানা আবুল কাশেম',
        senderRole: 'madrasa_admin',
        message: 'পেমেন্ট সম্পন্ন হয়েছে। দ্রুত এসএমএস ক্রেডিট রিচার্জ প্রয়োজন।',
        attachmentName: 'bkash_receipt_5000_sms.jpg',
        timestamp: '2026-09-11 09:30 AM',
        isStaffReply: false
      },
      {
        id: 'tm-2',
        ticketId: 'tkt-01',
        senderId: 'support-01',
        senderName: 'MadSol সেন্ট্রাল সাপোর্ট টিম',
        senderRole: 'super_admin',
        message: 'আসসালামু আলাইকুম। আপনার পেমেন্ট ট্রানজেকশন আইডি ভেরিফাই করা হচ্ছে। পরবর্তী ৩০ মিনিটের মধ্যে ক্রেডিট আপনার অ্যাকাউন্টে অটো রিফ্লেক্ট করবে ইনশাআল্লাহ।',
        timestamp: '2026-09-11 11:00 AM',
        isStaffReply: true
      }
    ],
    statusHistory: [
      { status: 'open', changedBy: 'মাওলানা আবুল কাশেম', timestamp: '2026-09-11 09:30 AM' },
      { status: 'in_progress', changedBy: 'MadSol সেন্ট্রাল সাপোর্ট টিম', timestamp: '2026-09-11 11:00 AM', note: 'গেটওয়ে ভেরিফিকেশন চলমান' }
    ]
  },
  {
    id: 'tkt-02',
    institutionId: 'inst-001',
    ticketNumber: 'TKT-2026-0002',
    userId: 'user-004',
    userName: 'মাওলানা মাহমুদ হাসান',
    userRole: 'teacher',
    userPhone: '01812345678',
    subject: 'হিফজ দৈনিক সবক এন্ট্রিতে ড্রপডাউন সিলেকশন ফিক্স',
    category: 'technical_issue',
    priority: 'medium',
    status: 'resolved',
    description: 'মোবাইল ব্রাউজারে হিফজ ট্র্যাকার থেকে সুরা নির্বাচন করার সময় স্ক্রল মাঝে মাঝে আটকে যাচ্ছিল।',
    createdAt: '2026-09-08 02:15 PM',
    updatedAt: '2026-09-09 10:00 AM',
    messages: [
      {
        id: 'tm-3',
        ticketId: 'tkt-02',
        senderId: 'user-004',
        senderName: 'মাওলানা মাহমুদ হাসান',
        senderRole: 'teacher',
        message: 'মোবাইল ফোনে ড্রপডাউনটি কিছুটা ধীরগতিতে কাজ করছিল।',
        timestamp: '2026-09-08 02:15 PM',
        isStaffReply: false
      },
      {
        id: 'tm-4',
        ticketId: 'tkt-02',
        senderId: 'support-01',
        senderName: 'সিস্টেম ইঞ্জিনিয়ার',
        senderRole: 'super_admin',
        message: 'ভার্চুয়াল স্ক্রলিং অপ্টিমাইজ করা হয়েছে। ক্যাশ রিফ্রেশ করে আবার চেষ্টা করুন।',
        timestamp: '2026-09-09 10:00 AM',
        isStaffReply: true
      }
    ],
    statusHistory: [
      { status: 'open', changedBy: 'মাওলানা মাহমুদ হাসান', timestamp: '2026-09-08 02:15 PM' },
      { status: 'resolved', changedBy: 'সিস্টেম ইঞ্জিনিয়ার', timestamp: '2026-09-09 10:00 AM', note: 'বাগ সমাধান সম্পন্ন' }
    ]
  }
];

// ==========================================
// 3. DOCUMENT MANAGEMENT INITIAL DATA
// ==========================================

export const INITIAL_DOCUMENTS: MadrasaDocument[] = [
  {
    id: 'doc-001',
    institutionId: 'inst-001',
    documentName: 'মাদ্রাসার সরকারি নিবন্ধন ও ওয়াকফ সনদ.pdf',
    category: 'institution_document',
    ownerName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    ownerType: 'institution',
    fileSize: '২.৪ মেগাবাইট',
    fileType: 'pdf',
    fileUrl: '/docs/madrasa_reg_wakf.pdf',
    uploadDate: '2026-01-15',
    status: 'active',
    notes: 'বাংলাদেশ কওমি মাদ্রাসা শিক্ষাবোর্ড ও সমাজসেবা অধিদপ্তরের মূল নিবন্ধন কপি।',
    isSensitive: false,
    permissions: {
      allowedRoles: ['super_admin', 'madrasa_admin', 'principal', 'accountant'],
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false
    },
    uploadedBy: 'প্রিন্সিপাল মুফতি হাবিবুর রহমান'
  },
  {
    id: 'doc-002',
    institutionId: 'inst-001',
    documentName: 'মুহাম্মদ আব্দুল্লাহ - জন্ম নিবন্ধন সনদ.jpg',
    category: 'student_document',
    ownerName: 'মুহাম্মদ আব্দুল্লাহ',
    ownerType: 'student',
    ownerId: 'stu-001',
    fileSize: '৮৫০ কিলোবাইট',
    fileType: 'jpg',
    fileUrl: '/docs/birth_certificate_abdullah.jpg',
    uploadDate: '2026-02-10',
    status: 'active',
    notes: '১৭ ডিজিটের অনলাইন ডিজিটাল জন্ম সনদপত্র।',
    isSensitive: false,
    permissions: {
      allowedRoles: ['super_admin', 'madrasa_admin', 'principal', 'teacher', 'guardian'],
      canView: true,
      canDownload: true,
      canEdit: true,
      canDelete: false
    },
    uploadedBy: 'অফিস সহকারী'
  },
  {
    id: 'doc-003',
    institutionId: 'inst-001',
    documentName: 'মাওলানা মাহমুদ হাসান - নিয়োগপত্র ও দাওরায়ে হাদীস সনদ.pdf',
    category: 'teacher_document',
    ownerName: 'মাওলানা মাহমুদ হাসান',
    ownerType: 'teacher',
    ownerId: 'tch-001',
    fileSize: '১.৮ মেগাবাইট',
    fileType: 'pdf',
    fileUrl: '/docs/appointment_mahmud_hasan.pdf',
    uploadDate: '2026-01-20',
    status: 'active',
    notes: 'মাদ্রাসার মজলিসে শুরার অনুমোদনকৃত পূর্ণাঙ্গ নিয়োগপত্র ও জাতীয় পরিচয়পত্র।',
    isSensitive: true,
    permissions: {
      allowedRoles: ['super_admin', 'madrasa_admin', 'principal'],
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false
    },
    uploadedBy: 'মুহতামিম মুফতি হাবিবুর রহমান'
  },
  {
    id: 'doc-004',
    institutionId: 'inst-001',
    documentName: '২০২৫-২৬ বার্ষিক অডিট রিপোর্ট ও হিসাব বিবরণী.pdf',
    category: 'financial_document',
    ownerName: 'অর্থ ও হিসাব বিভাগ',
    ownerType: 'institution',
    fileSize: '৪.২ মেগাবাইট',
    fileType: 'pdf',
    fileUrl: '/docs/annual_audit_2025_2026.pdf',
    uploadDate: '2026-07-30',
    status: 'active',
    notes: 'স্বতন্ত্র চার্টার্ড অ্যাকাউন্ট্যান্ট কর্তৃক নিরীক্ষিত অডিট খতিয়ান।',
    isSensitive: true,
    permissions: {
      allowedRoles: ['super_admin', 'madrasa_admin', 'principal', 'accountant'],
      canView: true,
      canDownload: true,
      canEdit: false,
      canDelete: false
    },
    uploadedBy: 'মাওলানা তারিক জামিল (হিসাবরক্ষক)'
  }
];

// ==========================================
// 4. ID CARD TEMPLATES & DATA
// ==========================================

export const INITIAL_ID_CARD_TEMPLATES: IdCardTemplate[] = [
  {
    id: 'tmpl-emerald',
    nameBn: 'এমেরাল্ড ক্লাসিক (সবুজ ও সোনালী)',
    nameEn: 'Emerald Classic (Islamic Green & Gold)',
    theme: 'emerald_classic',
    logoPosition: 'top_center',
    primaryColor: '#065f46',
    secondaryColor: '#047857',
    hasBarcode: true,
    hasQrCode: true,
    customBackTextBn: 'এই কার্ডটি মাদ্রাসার সম্পত্তি। পাওয়া গেলে নিকটস্থ ডাকবাক্সে বা মাদ্রাসার দফতরে জমা দিন।',
    customBackTextEn: 'This card is institutional property. If found, please return to the administrative office.',
    signatoryTitleBn: 'মুহতামিম / অধ্যক্ষ',
    signatoryTitleEn: 'Principal / Rector',
    validityYear: '২০২৬-২০২৭'
  },
  {
    id: 'tmpl-navy',
    nameBn: 'নেভি মডার্ন এক্সিকিউটিভ',
    nameEn: 'Navy Modern Executive',
    theme: 'navy_modern',
    logoPosition: 'top_left',
    primaryColor: '#1e3a8a',
    secondaryColor: '#1d4ed8',
    hasBarcode: false,
    hasQrCode: true,
    customBackTextBn: 'আইডি কার্ড সার্বক্ষণিক পরিধান করা বাধ্যতামূলক। জরুরি প্রয়োজনে যোগাযোগ: ০১৭৯৮৭৬৫৪৩২।',
    customBackTextEn: 'Card must be displayed at all times on campus. Emergency: +8801798765432.',
    signatoryTitleBn: 'নাযেম-এ-তা\'লীমাত',
    signatoryTitleEn: 'Academic Director',
    validityYear: '২০২৬-২০২৭'
  },
  {
    id: 'tmpl-gold',
    nameBn: 'রয়েল গোল্ড অ্যারাবিক',
    nameEn: 'Royal Gold Arabic Ornate',
    theme: 'islamic_gold',
    logoPosition: 'top_center',
    primaryColor: '#92400e',
    secondaryColor: '#b45309',
    hasBarcode: true,
    hasQrCode: true,
    customBackTextBn: 'মাদ্রাসার অভ্যন্তরীণ শৃঙ্খলা ও নিয়মানুবর্তিতা মেনে চলা প্রতিটি শিক্ষার্থীর ধর্মীয় দায়িত্ব।',
    customBackTextEn: 'Adherence to institutional discipline is mandatory for all students.',
    signatoryTitleBn: 'মুহতামিম সাহেব',
    signatoryTitleEn: 'Honorable Rector',
    validityYear: '২০২৬-২০২৭'
  }
];

export const INITIAL_STUDENT_ID_CARDS: StudentIdCardData[] = [
  {
    id: 'id-stu-001',
    institutionId: 'inst-001',
    studentId: 'stu-001',
    studentNameBn: 'মুহাম্মদ আব্দুল্লাহ',
    studentNameEn: 'Muhammad Abdullah',
    rollNo: '১০১',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    department: 'হিফজুল কুরআন ও কিরাত বিভাগ',
    guardianMobile: '01711223344',
    bloodGroup: 'B+',
    validityDate: 'ডিসেম্বর ২০২৭',
    qrToken: 'MS-QR-STU001-A9F2',
    issueDate: '০১ জানুয়ারি ২০২৬'
  },
  {
    id: 'id-stu-002',
    institutionId: 'inst-001',
    studentId: 'stu-002',
    studentNameBn: 'আহমাদ সালমান',
    studentNameEn: 'Ahmad Salman',
    rollNo: '১০২',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    department: 'হিফজুল কুরআন বিভাগ',
    guardianMobile: '01811334455',
    bloodGroup: 'O+',
    validityDate: 'ডিসেম্বর ২০২৭',
    qrToken: 'MS-QR-STU002-B7X1',
    issueDate: '০১ জানুয়ারি ২০২৬'
  },
  {
    id: 'id-stu-003',
    institutionId: 'inst-001',
    studentId: 'stu-003',
    studentNameBn: 'মাহমুদুল হাসান',
    studentNameEn: 'Mahmudul Hasan',
    rollNo: '২০১',
    className: 'মিযান জামাত',
    department: 'কিতাব ও ইসলামিক স্টাডিজ',
    guardianMobile: '01911223344',
    bloodGroup: 'A+',
    validityDate: 'ডিসেম্বর ২০২৭',
    qrToken: 'MS-QR-STU003-C3M9',
    issueDate: '০১ জানুয়ারি ২০২৬'
  }
];

export const INITIAL_TEACHER_ID_CARDS: TeacherIdCardData[] = [
  {
    id: 'id-tch-001',
    institutionId: 'inst-001',
    teacherId: 'tch-001',
    teacherNameBn: 'মাওলানা মাহমুদ হাসান',
    teacherNameEn: 'Maulana Mahmud Hasan',
    designationBn: 'প্রধান ক্বারী ও উস্তাযুল হিফজ',
    designationEn: 'Head Qari & Hifz Faculty',
    department: 'হিফজ ও তাজবিদ অনুষদ',
    mobile: '01812345678',
    email: 'mahmud.qari@madrasa.edu',
    bloodGroup: 'O+',
    qrToken: 'MS-QR-TCH001-T9K2',
    issueDate: '০১ জানুয়ারি ২০২৬'
  },
  {
    id: 'id-tch-002',
    institutionId: 'inst-001',
    teacherId: 'tch-002',
    teacherNameBn: 'মুফতি রফিকুল ইসলাম',
    teacherNameEn: 'Mufti Rafiqul Islam',
    designationBn: 'মুহাদ্দিস ও সিনিয়র শিক্ষক',
    designationEn: 'Senior Faculty in Hadith & Fiqh',
    department: 'দাওরা ও কিতাব অনুষদ',
    mobile: '01712345679',
    email: 'rafiqul.mufti@madrasa.edu',
    bloodGroup: 'B+',
    qrToken: 'MS-QR-TCH002-F4W8',
    issueDate: '০১ জানুয়ারি ২০২৬'
  }
];

// ==========================================
// 5. CERTIFICATES & TEMPLATES
// ==========================================

export const INITIAL_CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'ctmpl-hifz',
    institutionId: 'inst-001',
    type: 'hifz_completion',
    titleBn: 'হিফজুল কুরআন সমাপ্তি সনদপত্র',
    titleEn: 'Certificate of Quran Memorization (Sanad Al-Hifz)',
    bodyTemplateBn: 'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, শিক্ষার্থী {{student_name}}, আইডি: {{student_id}}, পিতা: জনাব {{guardian_name}}, অত্র {{institution_name}}-এর হিফজুল কুরআন বিভাগ থেকে সম্পূর্ণ ৩০ পারা পবিত্র কুরআনুল কারিম বিশুদ্ধ মাখরাজ ও তাজবিদ সহকারে সফলতার সাথে হিফজ সম্পন্ন করেছেন। আমরা তাহার ইহকালীন ও পরকালীন সমৃদ্ধি কামনা করি।',
    bodyTemplateEn: 'This is to certify that {{student_name}}, Student ID: {{student_id}}, has successfully completed the memorization of the Holy Quran (all 30 Paras) with proper Tajweed at {{institution_name}}. May Allah bless his endeavor.',
    signatory1TitleBn: 'উস্তাযুল হিফজ',
    signatory1TitleEn: 'Hifz Instructor',
    signatory2TitleBn: 'মুহতামিম / অধ্যক্ষ',
    signatory2TitleEn: 'Principal / Rector',
    hasSeal: true,
    hasBorder: true,
    borderStyle: 'islamic',
    primaryColor: '#065f46'
  },
  {
    id: 'ctmpl-character',
    institutionId: 'inst-001',
    type: 'character',
    titleBn: 'চারিত্রিক প্রশংসাপত্র',
    titleEn: 'Testimonial & Character Certificate',
    bodyTemplateBn: 'প্রত্যয়ন করা যাচ্ছে যে, {{student_name}}, শ্রেণি: {{class_name}}, রোল: {{roll_no}}, অত্র {{institution_name}}-এর একজন নিয়মিত ও সুশৃঙ্খল শিক্ষার্থী। তাহার নৈতিক চরিত্র, দ্বীনি আচার-ব্যবহার ও নিয়মানুবর্তিতা প্রশংসনীয়। মাদ্রাসা বিরোধী কোনো কার্যকলাপে তাহার সংশ্লিষ্টতা পরিলক্ষিত হয় নাই।',
    bodyTemplateEn: 'This certifies that {{student_name}}, Class: {{class_name}}, Roll: {{roll_no}}, has been an upright, obedient student of {{institution_name}} with exemplary Islamic conduct and moral character.',
    signatory1TitleBn: 'নাযেম-এ-তা\'লীমাত',
    signatory1TitleEn: 'Dean of Academics',
    signatory2TitleBn: 'মুহতামিম সাহেব',
    signatory2TitleEn: 'Principal',
    hasSeal: true,
    hasBorder: true,
    borderStyle: 'ornate',
    primaryColor: '#1e3a8a'
  },
  {
    id: 'ctmpl-study',
    institutionId: 'inst-001',
    type: 'study',
    titleBn: 'অধ্যয়নরত প্রত্যয়নপত্র',
    titleEn: 'Bonafide Student Certificate',
    bodyTemplateBn: 'এই মর্মে প্রত্যায়ন করা যাচ্ছে যে, {{student_name}}, অত্র {{institution_name}}-এর {{department_name}} বিভাগের অধীনে {{class_name}} জামাতে অধ্যয়নরত আছেন। তিনি অত্র প্রতিষ্ঠানের নিয়মিত শিক্ষার্থী।',
    bodyTemplateEn: 'This is to certify that {{student_name}} is a bonafide regular student of {{institution_name}} currently enrolled in {{class_name}}.',
    signatory1TitleBn: 'অফিস ইনচার্জ',
    signatory1TitleEn: 'Office Secretary',
    signatory2TitleBn: 'মুহতামিম',
    signatory2TitleEn: 'Principal',
    hasSeal: true,
    hasBorder: true,
    borderStyle: 'modern',
    primaryColor: '#047857'
  }
];

export const INITIAL_GENERATED_CERTIFICATES: GeneratedCertificate[] = [
  {
    id: 'cert-001',
    institutionId: 'inst-001',
    certificateNumber: 'CERT-2026-000001',
    templateId: 'ctmpl-hifz',
    type: 'hifz_completion',
    titleBn: 'হিফজুল কুরআন সমাপ্তি সনদপত্র',
    titleEn: 'Certificate of Quran Memorization',
    studentId: 'stu-001',
    studentNameBn: 'মুহাম্মদ আব্দুল্লাহ',
    studentNameEn: 'Muhammad Abdullah',
    className: 'হিফজুল কুরআন (গ্রুপ-ক)',
    departmentName: 'হিফজুল কুরআন ও কিরাত বিভাগ',
    rollNo: '১০১',
    issueDate: '২০২৬-০৮-১৫',
    contentBn: 'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, শিক্ষার্থী মুহাম্মদ আব্দুল্লাহ, আইডি: stu-001, পিতা: জনাব রফিকুল ইসলাম, অত্র জামেয়া ইসলামিয়া মদিনাতুল উলুম-এর হিফজুল কুরআন বিভাগ থেকে সম্পূর্ণ ৩০ পারা পবিত্র কুরআনুল কারিম বিশুদ্ধ মাখরাজ ও তাজবিদ সহকারে সফলতার সাথে হিফজ সম্পন্ন করেছেন।',
    contentEn: 'This is to certify that Muhammad Abdullah, Student ID: stu-001, has successfully completed the memorization of the Holy Quran (all 30 Paras) with proper Tajweed at Jamia Islamia Madinatul Uloom.',
    qrToken: 'MS-CERT-2026-000001-K9',
    status: 'valid',
    issuedBy: 'মুহতামিম মুফতি হাবিবুর রহমান',
    verificationCount: 14
  },
  {
    id: 'cert-002',
    institutionId: 'inst-001',
    certificateNumber: 'CERT-2026-000002',
    templateId: 'ctmpl-character',
    type: 'character',
    titleBn: 'চারিত্রিক প্রশংসাপত্র',
    titleEn: 'Character Certificate',
    studentId: 'stu-003',
    studentNameBn: 'মাহমুদুল হাসান',
    studentNameEn: 'Mahmudul Hasan',
    className: 'মিযান জামাত',
    departmentName: 'কিতাব ও আরবি সাহিত্য অনুষদ',
    rollNo: '২০১',
    issueDate: '২০২৬-০৯-০২',
    contentBn: 'প্রত্যয়ন করা যাচ্ছে যে, মাহমুদুল হাসান, শ্রেণি: মিযান জামাত, রোল: ২০১, অত্র জামেয়া ইসলামিয়া মদিনাতুল উলুম-এর একজন নিয়মিত ও সুশৃঙ্খল শিক্ষার্থী। তাহার নৈতিক চরিত্র ও দ্বীনি আচরণ প্রশংসনীয়।',
    contentEn: 'This certifies that Mahmudul Hasan, Class: Mizan, Roll: 201, is an exemplary student of Jamia Islamia Madinatul Uloom with commendable Islamic character.',
    qrToken: 'MS-CERT-2026-000002-P4',
    status: 'valid',
    issuedBy: 'নাযেম-এ-তা\'লীমাত',
    verificationCount: 3
  }
];

// ==========================================
// 6. SECURE QR TOKENS
// ==========================================

export const INITIAL_QR_TOKENS: SecureQrToken[] = [
  {
    token: 'MS-CERT-2026-000001-K9',
    type: 'certificate',
    institutionId: 'inst-001',
    referenceId: 'CERT-2026-000001',
    titleBn: 'হিফজুল কুরআন সমাপ্তি সনদপত্র যাচাই',
    titleEn: 'Quran Memorization Certificate Verification',
    issuedAt: '2026-08-15',
    isValid: true,
    scanCount: 14
  },
  {
    token: 'MS-CERT-2026-000002-P4',
    type: 'certificate',
    institutionId: 'inst-001',
    referenceId: 'CERT-2026-000002',
    titleBn: 'চারিত্রিক প্রশংসাপত্র যাচাই',
    titleEn: 'Character Certificate Verification',
    issuedAt: '2026-09-02',
    isValid: true,
    scanCount: 3
  },
  {
    token: 'MS-QR-STU001-A9F2',
    type: 'student_id',
    institutionId: 'inst-001',
    referenceId: 'stu-001',
    titleBn: 'শিক্ষার্থী পরিচয়পত্র যাচাই (মুহাম্মদ আব্দুল্লাহ)',
    titleEn: 'Student ID Verification (Muhammad Abdullah)',
    issuedAt: '2026-01-01',
    isValid: true,
    scanCount: 42
  },
  {
    token: 'MS-QR-TCH001-T9K2',
    type: 'teacher_id',
    institutionId: 'inst-001',
    referenceId: 'tch-001',
    titleBn: 'শিক্ষক পরিচয়পত্র যাচাই (মাওলানা মাহমুদ হাসান)',
    titleEn: 'Faculty ID Verification (Maulana Mahmud Hasan)',
    issuedAt: '2026-01-01',
    isValid: true,
    scanCount: 8
  }
];

// ==========================================
// 7. ADVANCED SETTINGS INITIAL DATA
// ==========================================

export const INITIAL_INSTITUTION_SETTINGS: InstitutionSettingsData = {
  institutionNameBn: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
  institutionNameEn: 'Jamia Islamia Madinatul Uloom',
  shortNameBn: 'মদিনাতুল উলুম',
  shortNameEn: 'Madinatul Uloom',
  logoUrl: '',
  addressBn: 'হাউজ নং ১২, ব্লক-সি, মিরপুর-১২, ঢাকা-১২১৬, বাংলাদেশ',
  addressEn: 'House 12, Block C, Mirpur-12, Dhaka-1216, Bangladesh',
  mobile: '01712345678',
  email: 'info@madinatululoom.edu.bd',
  website: 'https://madinatululoom.edu.bd',
  principalNameBn: 'মুহতামিম মুফতি হাবিবুর রহমান',
  principalNameEn: 'Mufti Habibur Rahman',
  establishedYear: '১৯৯৫',
  eiinNumber: '134562'
};

export const INITIAL_BRANDING_SETTINGS: BrandingSettingsData = {
  primaryColor: '#047857',
  secondaryColor: '#065f46',
  accentColor: '#d97706',
  logoUrl: '',
  loginBgUrl: '',
  appNameBn: 'MadSol স্মার্ট মাদ্রাসা ইকোসিস্টেম',
  appNameEn: 'MadSol Smart Madrasa Ecosystem',
  appTaglineBn: 'আধুনিক মাদ্রাসার পূর্ণাঙ্গ স্মার্ট ব্যবস্থাপনা',
  appTaglineEn: 'Comprehensive Smart Solution for Modern Madrasas'
};

export const INITIAL_DATETIME_SETTINGS: DateTimeSettingsData = {
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  weekStartDay: 'saturday',
  workingDays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu']
};

export const INITIAL_SYSTEM_FORMATS: SystemFormatsSettingsData = {
  studentIdPrefix: 'MS-STU-',
  teacherIdPrefix: 'MS-TCH-',
  receiptPrefix: 'REC-2026-',
  certificatePrefix: 'CERT-2026-',
  currencySymbol: '৳',
  currencyCode: 'BDT',
  activeAcademicSession: '২০২৬-২০২৭'
};

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettingsData = {
  enableDefaultPush: true,
  enableAutomatedSms: true,
  enableAnnouncementAlerts: true,
  enableDueReminders: true,
  enableEmailDigest: false,
  smsGatewayActive: true,
  voiceCallsActive: true
};

export const INITIAL_SECURITY_SETTINGS: SecuritySettingsData = {
  minPasswordLength: 8,
  requireSpecialChar: true,
  maxLoginAttempts: 5,
  sessionTimeoutMinutes: 60,
  twoFactorAuthEnabled: false,
  allowMultipleDeviceSessions: true,
  ipWhitelistEnabled: false,
  auditTrailStrict: true
};

// ==========================================
// 8. SUPER ADMIN PANEL & AUDIT LOGS
// ==========================================

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    nameBn: 'ফ্রি স্টার্টার প্ল্যান',
    nameEn: 'Free Starter Plan',
    tier: 'free',
    pricePerMonth: 0,
    maxStudents: 50,
    maxTeachers: 5,
    storageLimitGb: 1,
    features: ['ছাত্র ব্যবস্থাপনা', 'হাজিরা ট্র্যাকার', 'বেসিক ফি ব্যবস্থাপনা', 'নোটিশ বোর্ড']
  },
  {
    id: 'plan-basic',
    nameBn: 'বেসিক মাদ্রাসা প্ল্যান',
    nameEn: 'Basic Madrasa Plan',
    tier: 'basic',
    pricePerMonth: 1500,
    maxStudents: 200,
    maxTeachers: 15,
    storageLimitGb: 5,
    features: ['সম্পূর্ণ অ্যাকাউন্টিং', 'হিফজ ট্র্যাকার', 'এসএমএস গেটওয়ে ইন্টিগ্রেশন', 'আইডি কার্ড তৈরি', 'অভিভাবক পোর্টাল']
  },
  {
    id: 'plan-premium',
    nameBn: 'প্রিমিয়াম এআই সুপ্রিম',
    nameEn: 'Premium AI Supreme',
    tier: 'premium',
    pricePerMonth: 3500,
    maxStudents: 600,
    maxTeachers: 40,
    storageLimitGb: 20,
    isPopular: true,
    features: [
      'MadSol AI স্মার্ট সহকারী',
      'AI শিক্ষার্থী বিশ্লেষণ ও প্রিডিকশন',
      'স্বয়ংক্রিয় ভয়েস কল ক্যাম্পেইন',
      'বোর্ডিং ও মেস ডাইনিং অডিট',
      'সনদপত্র বিল্ডার ও কিউআর ভেরিফিকেশন',
      'আনলিমিটেড হিস্ট্রি ব্যাকআপ'
    ]
  },
  {
    id: 'plan-enterprise',
    nameBn: 'এন্টারপ্রাইজ ফেডারেশন',
    nameEn: 'Enterprise Federation',
    tier: 'enterprise',
    pricePerMonth: 7500,
    maxStudents: 5000,
    maxTeachers: 200,
    storageLimitGb: 100,
    features: [
      'মাল্টি-ক্যাম্পাস ফেডারেশন',
      'ডেডিকেটেড ক্লাউড ডাটাবেস',
      '২৪/৭ প্রায়োরিটি সাপোর্ট এসএলএ',
      'কাস্টম ডোমেইন ও হোয়াইট লেবেলিং',
      'সম্পূর্ণ কাস্টম এআই ট্রেনিং মডেল'
    ]
  }
];

export const INITIAL_MANAGED_INSTITUTIONS: ManagedInstitutionAccount[] = [
  {
    id: 'inst-001',
    eiin: '134562',
    nameBn: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    nameEn: 'Jamia Islamia Madinatul Uloom',
    principalName: 'মুহতামিম মুফতি হাবিবুর রহমান',
    phone: '01712345678',
    email: 'info@madinatululoom.edu.bd',
    address: 'মিরপুর-১২, ঢাকা-১২১৬',
    planTier: 'premium',
    status: 'active',
    studentsCount: 310,
    teachersCount: 22,
    adminEmail: 'admin@madinatululoom.edu.bd',
    createdAt: '2025-01-10',
    lastActive: 'এইমাত্র'
  },
  {
    id: 'inst-002',
    eiin: '138941',
    nameBn: 'দারুল উলুম আস-সিদ্দিকিয়া মাদরাসা',
    nameEn: 'Darul Uloom As-Siddiqia Madrasa',
    principalName: 'মাওলানা আব্দুল হক',
    phone: '01812345678',
    email: 'contact@darululoom-siddiqia.org',
    address: 'চকবাজার, চট্টগ্রাম',
    planTier: 'basic',
    status: 'active',
    studentsCount: 185,
    teachersCount: 14,
    adminEmail: 'admin@darululoom-siddiqia.org',
    createdAt: '2025-04-12',
    lastActive: '২ ঘণ্টা আগে'
  },
  {
    id: 'inst-003',
    eiin: '142109',
    nameBn: 'আল-জামিয়াতুল আরাবিয়া কাসেমুল উলুম',
    nameEn: 'Al-Jamiatul Arabia Qasimul Uloom',
    principalName: 'মুফতি শফিকুল ইসলাম',
    phone: '01912345678',
    email: 'qasimululoom@sylhet.org',
    address: 'দরগাহ মহল্লা, সিলেট',
    planTier: 'enterprise',
    status: 'active',
    studentsCount: 750,
    teachersCount: 48,
    adminEmail: 'admin@qasimululoom.org',
    createdAt: '2024-11-20',
    lastActive: 'গতকাল'
  }
];

export const INITIAL_INSTITUTION_MODULES: Record<string, InstitutionModuleConfig> = {
  'inst-001': {
    institutionId: 'inst-001',
    hifzEnabled: true,
    boardingEnabled: true,
    foodEnabled: true,
    accountsEnabled: true,
    donationEnabled: true,
    automationEnabled: true,
    aiAssistantEnabled: true,
    smsGatewayEnabled: true,
    voiceCallEnabled: true,
    certificateEnabled: true,
    documentsEnabled: true
  },
  'inst-002': {
    institutionId: 'inst-002',
    hifzEnabled: true,
    boardingEnabled: false,
    foodEnabled: false,
    accountsEnabled: true,
    donationEnabled: true,
    automationEnabled: false,
    aiAssistantEnabled: false,
    smsGatewayEnabled: true,
    voiceCallEnabled: false,
    certificateEnabled: true,
    documentsEnabled: true
  }
};

export const INITIAL_SYSTEM_HEALTH: SystemMonitoringHealth = {
  overallStatus: 'healthy',
  uptimePercentage: 99.98,
  apiLatencyMs: 42,
  databaseStatus: 'connected',
  queueActiveJobs: 0,
  queueFailedJobs: 0,
  memoryUsageMb: 248,
  cpuLoadPercentage: 14.5,
  storageUsedGb: 14.2,
  storageTotalGb: 100.0,
  lastChecked: '2026-09-12 10:05 AM'
};

export const INITIAL_FAILED_JOBS: FailedJobLog[] = [];

export const INITIAL_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'sec-01',
    institutionId: 'inst-001',
    severity: 'medium',
    type: 'repeated_failed_login',
    titleBn: 'অ্যাকাউন্টে একাধিক ভুল পাসওয়ার্ড প্রচেষ্টা',
    titleEn: 'Multiple Failed Password Attempts on Admin Account',
    descriptionBn: 'মাওলানা আবুল কাশেম-এর অ্যাকাউন্টে একই আইপি থেকে ৩ বার ভুল পাসওয়ার্ড দেওয়া হয়েছিল। স্বয়ংক্রিয় লকআউট পলিসি প্রয়োগ হয়েছে।',
    descriptionEn: '3 invalid password attempts recorded from single IP. Rate limiting protection applied.',
    affectedUser: 'admin@madinatululoom.edu.bd',
    ipAddress: '103.145.72.18',
    timestamp: '2026-09-11 08:42 AM',
    isResolved: true
  },
  {
    id: 'sec-02',
    institutionId: 'inst-001',
    severity: 'low',
    type: 'suspicious_ip',
    titleBn: 'নতুন আনট্রাস্টেড ব্রাউজার সেশন শনাক্তকরণ',
    titleEn: 'New Untrusted Browser Session Detected',
    descriptionBn: 'হিসাবরক্ষক অ্যাকাউন্ট নতুন উইন্ডোজ ক্রোম ডিভাইস থেকে সফলভাবে প্রবেশ করেছে। ২-ফ্যাক্টর নোটিফিকেশন প্রেরণ করা হয়েছে।',
    descriptionEn: 'Account logged in from a new Windows Chrome client. Verification notification delivered.',
    affectedUser: 'accountant@madinatululoom.edu.bd',
    ipAddress: '118.179.201.44',
    timestamp: '2026-09-10 11:20 AM',
    isResolved: true
  }
];

export const INITIAL_AUDIT_LOGS_DETAILED: AuditLogDetailed[] = [
  {
    id: 'adt-001',
    institutionId: 'inst-001',
    institutionName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    userId: 'user-002',
    userName: 'মাওলানা আবুল কাশেম',
    userRole: 'madrasa_admin',
    action: 'GENERATE_CERTIFICATE',
    module: 'Certificates',
    details: 'মুহাম্মদ আব্দুল্লাহ (stu-001)-এর জন্য হিফজ সমাপ্তি সনদ CERT-2026-000001 তৈরি করা হয়েছে।',
    ipAddress: '103.145.72.18',
    deviceInfo: 'Chrome 130 / Windows 11',
    status: 'success',
    timestamp: '2026-09-12 09:30 AM'
  },
  {
    id: 'adt-002',
    institutionId: 'inst-001',
    institutionName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    userId: 'user-002',
    userName: 'মাওলানা আবুল কাশেম',
    userRole: 'madrasa_admin',
    action: 'PRINT_ID_CARD',
    module: 'ID Cards',
    details: 'হিফজুল কুরআন জামাতের জন্য ৩টি স্মার্ট কিউআর আইডি কার্ড প্রিন্ট করা হয়েছে।',
    ipAddress: '103.145.72.18',
    deviceInfo: 'Chrome 130 / Windows 11',
    status: 'success',
    timestamp: '2026-09-12 09:10 AM'
  },
  {
    id: 'adt-003',
    institutionId: 'inst-001',
    institutionName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    userId: 'user-005',
    userName: 'মাওলানা তারিক জামিল',
    userRole: 'accountant',
    action: 'FEE_COLLECTION',
    module: 'Accounts',
    details: 'ছাত্র মুহাম্মদ আব্দুল্লাহর কাছ থেকে সেপ্টেম্বর মাসের বেতন ৩,০০০৳ রসিদ REC-2026-0421 ইস্যু।',
    ipAddress: '118.179.201.44',
    deviceInfo: 'Firefox 132 / MacOS',
    status: 'success',
    timestamp: '2026-09-11 04:15 PM'
  },
  {
    id: 'adt-004',
    institutionId: 'inst-001',
    institutionName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    userId: 'user-004',
    userName: 'মাওলানা মাহমুদ হাসান',
    userRole: 'teacher',
    action: 'HIFZ_SABAQ_LOG',
    module: 'Hifz Tracker',
    details: 'শিক্ষার্থী আহমাদ সালমানের নতুন সবক ও আমুন্তা রিভিশন লগ এন্ট্রি করা হয়েছে।',
    ipAddress: '103.145.72.22',
    deviceInfo: 'Safari / iPad iOS 18',
    status: 'success',
    timestamp: '2026-09-11 02:40 PM'
  },
  {
    id: 'adt-005',
    institutionId: 'inst-001',
    institutionName: 'জামেয়া ইসলামিয়া মদিনাতুল উলুম',
    userId: 'user-003',
    userName: 'মুহতামিম মুফতি হাবিবুর রহমান',
    userRole: 'principal',
    action: 'AI_REPORT_EXPORT',
    module: 'AI Reports',
    details: 'আগস্ট ২০২৬ সামগ্রিক মাসিক প্রাতিষ্ঠানিক পর্যালোচনা পিডিএফ আকারে এক্সপোর্ট করা হয়েছে।',
    ipAddress: '103.145.72.18',
    deviceInfo: 'Chrome 130 / Windows 11',
    status: 'success',
    timestamp: '2026-09-11 11:45 AM'
  }
];

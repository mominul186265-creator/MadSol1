import {
  Automation,
  AutomationTriggerMeta,
  MessageTemplate,
  QueuedMessage,
  Announcement,
  VoiceCallCampaign,
  CommunicationLog,
  ProviderConfiguration,
  UserNotificationPreferences,
  AutomationRunLog
} from '../types/automation';

export const AUTOMATION_TRIGGERS_LIST: AutomationTriggerMeta[] = [
  // Student
  {
    type: 'student_absent',
    category: 'student',
    labelBn: 'শিক্ষার্থী অনুপস্থিত হলে (Daily Absent)',
    labelEn: 'Student Marked Absent',
    descriptionBn: 'হাজিরা নেওয়ার সাথে সাথে অনুপস্থিত শিক্ষার্থীর অভিভাবককে তাত্ক্ষণিক সতর্কবার্তা।',
    descriptionEn: 'Instant alert to guardian when student is marked absent in daily roll call.'
  },
  {
    type: 'student_late',
    category: 'student',
    labelBn: 'শিক্ষার্থী দেরিতে প্রবেশ করলে (Late Arrival)',
    labelEn: 'Student Arrived Late',
    descriptionBn: 'নির্দিষ্ট সময়ের পর প্রতিষ্ঠানে পৌঁছালে অভিভাবককে অবগতি।',
    descriptionEn: 'Notify guardian if student enters after scheduled madrasa assembly.'
  },
  {
    type: 'student_admitted',
    category: 'student',
    labelBn: 'নতুন শিক্ষার্থী ভর্তি হলে (New Admission)',
    labelEn: 'Student Admitted',
    descriptionBn: 'ভর্তি নিশ্চিতকরণ এবং স্টুডেন্ট আইডি ও ওয়েলকাম কিট নোটিফিকেশন।',
    descriptionEn: 'Admission confirmation with student ID and welcome packet details.'
  },
  // Fee
  {
    type: 'fee_due',
    category: 'fee',
    labelBn: 'মাসিক ফি বকেয়া থাকলে (Monthly Due Reminder)',
    labelEn: 'Fee Due Reminder',
    descriptionBn: 'চলতি মাসের নির্ধারিত তারিখের পূর্বে বকেয়া ফি পরিশোধের তাগিদ বার্তা।',
    descriptionEn: 'Automated reminder before scheduled payment deadline.'
  },
  {
    type: 'fee_paid',
    category: 'fee',
    labelBn: 'ফি পরিশোধ সফল হলে (Payment Received Receipt)',
    labelEn: 'Fee Paid Successfully',
    descriptionBn: 'টাকা জমা হওয়ার সাথে সাথে স্বয়ংক্রিয় ডিজিটাল রসিদ ও ধন্যবাদ বার্তা।',
    descriptionEn: 'Immediate transaction confirmation with digital receipt token.'
  },
  {
    type: 'fee_overdue',
    category: 'fee',
    labelBn: 'ফি অতিরিক্ত মেয়াদোত্তীর্ণ হলে (Overdue Alert)',
    labelEn: 'Fee Overdue Alert',
    descriptionBn: '১৫ দিনের অধিক বকেয়া থাকলে বিশেষ জরুরি তাগিদ বার্তা।',
    descriptionEn: 'Urgent overdue reminder when dues exceed grace period.'
  },
  // Exam
  {
    type: 'exam_reminder',
    category: 'exam',
    labelBn: 'পরীক্ষার আগের দিন রুটিন নোটিশ (Exam Routine Reminder)',
    labelEn: 'Exam Routine Reminder',
    descriptionBn: 'আগামীকালের পরীক্ষার বিষয় ও সময়সূচি স্মরণ করিয়ে দেওয়া।',
    descriptionEn: 'Send timetable and exam hall guidelines to guardians before exam day.'
  },
  {
    type: 'result_published',
    category: 'exam',
    labelBn: 'ফলাফল / মার্কশিট প্রকাশ হলে (Exam Result Published)',
    labelEn: 'Exam Result Published',
    descriptionBn: 'পরীক্ষার নম্বরপত্র তৈরি হলে মোট নম্বর ও জিপিএ অভিভাবকের মোবাইলে পাঠানো।',
    descriptionEn: 'Direct SMS/Push with marks, GPA and ranking link upon publication.'
  },
  // Hifz
  {
    type: 'hifz_daily_updated',
    category: 'hifz',
    labelBn: 'হিফজ দৈনিক ছবকা রেকর্ড হলে (Daily Sabak Update)',
    labelEn: 'Hifz Daily Sabak Logged',
    descriptionBn: 'আজকের ছবকা, ছবকী ও আমোখতা অগ্রগতির রিপোর্ট অভিভাবককে পাঠানো।',
    descriptionEn: 'Daily progress report of Sabaq, Sabki and Manzil recital.'
  },
  {
    type: 'hifz_low_progress',
    category: 'hifz',
    labelBn: 'হিফজ অগ্রগতি কাঙ্ক্ষিত মানের নিচে হলে (Low Progress Alert)',
    labelEn: 'Hifz Low Progress Alert',
    descriptionBn: 'ধারাবাহিক ৩ দিন কাঙ্ক্ষিত ছবকা না দিলে শিক্ষক ও অভিভাবককে নোটিশ।',
    descriptionEn: 'Notification if student misses target recitation for consecutive days.'
  },
  {
    type: 'hifz_milestone_completed',
    category: 'hifz',
    labelBn: 'পারা / মাইলস্টোন সম্পন্ন হলে (Para Milestone Achieved)',
    labelEn: 'Para Milestone Completed',
    descriptionBn: 'নতুন পারা শেষ হলে অভিভাবক ও শুভাকাঙ্ক্ষীদের অভিনন্দন বার্তা।',
    descriptionEn: 'Congratulatory notification upon completing a full Quranic Para.'
  },
  // Donation / Chanda
  {
    type: 'donation_received',
    category: 'donation',
    labelBn: 'দান / অনুদান জমা হলে (Donation Acknowledgment)',
    labelEn: 'Donation Received',
    descriptionBn: 'যেকোনো অনুদানের ডিজিটাল রসিদ ও দোয়ার বার্তা প্রেরণ।',
    descriptionEn: 'Instant receipt acknowledgement and prayer message to donor.'
  },
  {
    type: 'monthly_chanda_due',
    category: 'donation',
    labelBn: 'মাসিক চাঁদা স্মরণিকা (Monthly Chanda Reminder)',
    labelEn: 'Monthly Chanda Due',
    descriptionBn: 'নিয়মিত শুভাকাঙ্ক্ষীদের মাসের শুরুতে চাঁদা জমার বিনীত অনুরোধ।',
    descriptionEn: 'Gentle reminder to regular members for monthly institutional support.'
  },
  // Boarding
  {
    type: 'boarding_room_assigned',
    category: 'boarding',
    labelBn: 'বোর্ডিং সিট বরাদ্দ হলে (Hostel Room Assigned)',
    labelEn: 'Hostel Seat Assigned',
    descriptionBn: 'আবাসিক হোস্টেল সিট ও নিয়মাবলি সম্পর্কিত নির্দেশনা।',
    descriptionEn: 'Hostel seat assignment confirmation and boarding rules.'
  }
];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-absent',
    institutionId: 'inst-001',
    nameBn: 'শিক্ষার্থী অনুপস্থিতির সতর্কবার্তা',
    nameEn: 'Student Absent Alert',
    category: 'student_absent',
    templateBn: 'সম্মানিত অভিভাবক, আপনার সন্তান {{student_name}} (আইডি: {{student_id}}, শ্রেণি: {{class_name}}) আজ {{date}} তারিখে মাদ্রাসায় অনুপস্থিত। জরুরি প্রয়োজনে যোগাযোগ: {{institution_phone}}। — {{institution_name}}',
    templateEn: 'Dear Guardian, your ward {{student_name}} (ID: {{student_id}}, Class: {{class_name}}) is marked ABSENT today ({{date}}). Contact: {{institution_phone}}. — {{institution_name}}',
    variables: ['student_name', 'student_id', 'class_name', 'date', 'institution_phone', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-fee-due',
    institutionId: 'inst-001',
    nameBn: 'মাসিক বকেয়া ফি রিমাইন্ডার',
    nameEn: 'Monthly Fee Due Reminder',
    category: 'fee_due',
    templateBn: 'আসসালামু আলাইকুম। {{guardian_name}}, আপনার সন্তান {{student_name}}-এর {{month}} মাসের বকেয়া ফি {{due_amount}}/- টাকা। অনুগ্রহ করে আগামী ১০ তারিখের মধ্যে পরিশোধ করুন। — {{institution_name}}',
    templateEn: 'Assalamu Alaikum. {{guardian_name}}, outstanding fee for {{student_name}} is BDT {{due_amount}}/- for the month of {{month}}. Please pay by 10th. — {{institution_name}}',
    variables: ['guardian_name', 'student_name', 'month', 'due_amount', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-fee-paid',
    institutionId: 'inst-001',
    nameBn: 'ফি পরিশোধের ডিজিটাল রসিদ',
    nameEn: 'Payment Receipt Confirmation',
    category: 'payment_received',
    templateBn: 'ধন্যবাদ! {{student_name}}-এর বাবদ {{payment_amount}}/- টাকা জমা হয়েছে। রসিদ নং: {{receipt_no}}। বর্তমান বকেয়া: {{due_amount}}/-। — {{institution_name}}',
    templateEn: 'Thank you! Payment of BDT {{payment_amount}}/- received for {{student_name}}. Receipt: {{receipt_no}}. Current balance: {{due_amount}}/-. — {{institution_name}}',
    variables: ['student_name', 'payment_amount', 'receipt_no', 'due_amount', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-result',
    institutionId: 'inst-001',
    nameBn: 'পরীক্ষার ফলাফল ও মার্কশিট অ্যালার্ট',
    nameEn: 'Exam Result Announcement',
    category: 'result_published',
    templateBn: 'আলহামদুলিল্লাহ! {{exam_name}}-এ আপনার সন্তান {{student_name}} মোট {{total_marks}} নম্বর পেয়ে উত্তীর্ণ হয়েছে (মেধা স্থান: {{merit_position}})। — {{institution_name}}',
    templateEn: 'Alhamdulillah! In {{exam_name}}, {{student_name}} scored {{total_marks}} marks (Rank: {{merit_position}}). Congratulations! — {{institution_name}}',
    variables: ['exam_name', 'student_name', 'total_marks', 'merit_position', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-hifz-progress',
    institutionId: 'inst-001',
    nameBn: 'হিফজ দৈনিক অগ্রগতি রিপোর্ট',
    nameEn: 'Hifz Daily Recitation Report',
    category: 'hifz_progress',
    templateBn: '{{student_name}}-এর আজকের হিফজ: ছবকা: {{sabaq_page}}, ছবকী: {{sabki_para}}, আমোখতা: {{manzil_para}}। মান: {{grade}}। দোয়া কামনায়: {{institution_name}}।',
    templateEn: 'Daily Hifz for {{student_name}}: Sabaq: {{sabaq_page}}, Sabki: {{sabki_para}}, Manzil: {{manzil_para}}. Rating: {{grade}}. — {{institution_name}}',
    variables: ['student_name', 'sabaq_page', 'sabki_para', 'manzil_para', 'grade', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-chanda',
    institutionId: 'inst-001',
    nameBn: 'মাসিক চঁদা শুভাকাঙ্ক্ষী স্মরণিকা',
    nameEn: 'Monthly Chanda Support Reminder',
    category: 'chanda_reminder',
    templateBn: 'সম্মানিত দ্বীনদরদী শুভাকাঙ্ক্ষী {{donor_name}}, দ্বীনি প্রতিষ্ঠান পরিচালনায় আপনার মাসিক ওয়াদা {{amount}}/- টাকা প্রেরণের বিনীত অনুরোধ রইল। বিকাশ/নগদ: {{institution_phone}}। — {{institution_name}}',
    templateEn: 'Respected supporter {{donor_name}}, we kindly request your monthly pledge of BDT {{amount}}/- for madrasa operations. bKash/Nagad: {{institution_phone}}. — {{institution_name}}',
    variables: ['donor_name', 'amount', 'institution_phone', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'tmpl-donation-thanks',
    institutionId: 'inst-001',
    nameBn: 'অনুদান প্রাপ্তি স্বীকার ও দোয়া বার্তা',
    nameEn: 'Donation Gratitude & Dua',
    category: 'donation_thanks',
    templateBn: 'জাযাকাল্লাহু খাইরান! আপনার প্রদত্ত অনুদান {{amount}}/- টাকা (ফান্ড: {{fund_name}}) বিশ্বস্ততার সাথে গৃহীত হয়েছে। আল্লাহ আপনাকে উত্তম প্রতিদান দান করুন। — {{institution_name}}',
    templateEn: 'Jazakallahu Khairan! Your noble donation of BDT {{amount}}/- for {{fund_name}} is faithfully received. May Allah reward you abundantly. — {{institution_name}}',
    variables: ['amount', 'fund_name', 'institution_name'],
    status: 'active',
    createdAt: '2026-03-01'
  }
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-001',
    institutionId: 'inst-001',
    nameBn: 'স্বয়ংক্রিয় অনুপস্থিতি এসএমএস অ্যালার্ট',
    nameEn: 'Auto Absent SMS to Guardian',
    descriptionBn: 'শিক্ষক সকালের হাজিরায় অনুপস্থিত মার্ক করলেই ১০ মিনিট পর অভিভাবকের ফোনে বাংলা এসএমএস যাবে।',
    descriptionEn: 'Sends instant SMS to parent 10 mins after student is marked absent in morning assembly.',
    category: 'student',
    triggerType: 'student_absent',
    conditions: [
      {
        id: 'c-1',
        field: 'attendance_status',
        operator: 'equals',
        value: 'absent'
      },
      {
        id: 'c-2',
        field: 'guardian_mobile',
        operator: 'exists',
        value: true
      }
    ],
    delayMinutes: 10,
    actions: [
      {
        id: 'a-1',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-absent',
        targetRole: 'guardian'
      },
      {
        id: 'a-2',
        type: 'send_app_message',
        channel: 'app',
        templateId: 'tmpl-absent',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'absent_alert',
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
    lastRunAt: 'আজ, সকাল ৯:৪৫',
    runCount: 42,
    successCount: 41,
    failureCount: 1
  },
  {
    id: 'auto-002',
    institutionId: 'inst-001',
    nameBn: 'বকেয়া ফি তাগিদ এসএমএস (১০ তারিখ)',
    nameEn: 'Monthly Fee Due Reminder (10th of Month)',
    descriptionBn: 'যাদের চলতি মাসের ফি অপরিশোধিত রয়েছে, তাদের অভিভাবকদের কাছে স্বয়ংক্রিয় তাগিদপত্র যাবে।',
    descriptionEn: 'Triggers monthly fee payment reminder to all guardians with outstanding balance.',
    category: 'fee',
    triggerType: 'fee_due',
    conditions: [
      {
        id: 'c-3',
        field: 'payment_status',
        operator: 'equals',
        value: 'due'
      },
      {
        id: 'c-4',
        field: 'amount',
        operator: 'greater_than',
        value: 0
      }
    ],
    delayMinutes: 0,
    actions: [
      {
        id: 'a-3',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-fee-due',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'fee_due_reminder',
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
    lastRunAt: 'গতকাল, সকাল ১০:০০',
    runCount: 128,
    successCount: 125,
    failureCount: 3
  },
  {
    id: 'auto-003',
    institutionId: 'inst-001',
    nameBn: 'ফি পরিশোধের ডিজিটাল এসএমএস রসিদ',
    nameEn: 'Instant Payment Receipt Confirmation',
    descriptionBn: 'হিসাবরক্ষক বা বিকাশ পেমেন্ট গ্রহণের সাথে সাথে অভিভাবকের ফোনে তাত্ক্ষণিক নিশ্চিতকরণ রসিদ।',
    descriptionEn: 'Delivers digital receipt SMS immediately after fee payment is recorded.',
    category: 'fee',
    triggerType: 'fee_paid',
    conditions: [
      {
        id: 'c-5',
        field: 'payment_status',
        operator: 'equals',
        value: 'paid'
      }
    ],
    delayMinutes: 0,
    actions: [
      {
        id: 'a-4',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-fee-paid',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'fee_paid_receipt',
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
    lastRunAt: 'আজ, দুপুর ১:৩০',
    runCount: 89,
    successCount: 89,
    failureCount: 0
  },
  {
    id: 'auto-004',
    institutionId: 'inst-001',
    nameBn: 'হিফজ দৈনিক ছবকা পর্যালোচনা বার্তা',
    nameEn: 'Hifz Daily Recitation Parent Update',
    descriptionBn: 'হাফেজ সাহেব দৈনিক ছবকা ও আমোখতা মার্ক করলেই প্রতিদিন মাগরিবের পর অভিভাবকের কাছে বিস্তারিত যাবে।',
    descriptionEn: 'Daily evening recap to guardians summarizing student Hifz progress and teacher marks.',
    category: 'hifz',
    triggerType: 'hifz_daily_updated',
    conditions: [],
    delayMinutes: 30,
    actions: [
      {
        id: 'a-5',
        type: 'send_app_message',
        channel: 'app',
        templateId: 'tmpl-hifz-progress',
        targetRole: 'guardian'
      },
      {
        id: 'a-6',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-hifz-progress',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'hifz_daily_update',
    createdAt: '2026-02-20',
    updatedAt: '2026-03-02',
    lastRunAt: 'গতকাল, সন্ধ্যা ৭:১৫',
    runCount: 164,
    successCount: 160,
    failureCount: 4
  },
  {
    id: 'auto-005',
    institutionId: 'inst-001',
    nameBn: 'পরীক্ষার ফলাফল প্রকাশ নোটিফিকেশন',
    nameEn: 'Exam Result Publication Broadcast',
    descriptionBn: 'মুহতামিম ফলাফল অনুমোদন করলে সকল শিক্ষার্থীর মোট নম্বর ও ফলাফল লিংক অভিভাবকের কাছে যাবে।',
    descriptionEn: 'Broadcasts SMS and push notification once exam results are officially published.',
    category: 'exam',
    triggerType: 'result_published',
    conditions: [
      {
        id: 'c-6',
        field: 'result_status',
        operator: 'equals',
        value: 'published'
      }
    ],
    delayMinutes: 0,
    actions: [
      {
        id: 'a-7',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-result',
        targetRole: 'guardian'
      },
      {
        id: 'a-8',
        type: 'send_push',
        channel: 'push',
        templateId: 'tmpl-result',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'exam_result_publish',
    createdAt: '2026-02-25',
    updatedAt: '2026-03-01',
    lastRunAt: '২৮ ফেব্রুয়ারি, বিকাল ৪:০০',
    runCount: 230,
    successCount: 228,
    failureCount: 2
  },
  {
    id: 'auto-006',
    institutionId: 'inst-001',
    nameBn: 'শুভাকাঙ্ক্ষীদের মাসিক চাঁদা নোটিশ',
    nameEn: 'Monthly Chanda Support Notification',
    descriptionBn: 'প্রতিষ্ঠানের রেজিস্টার্ড দাতা ও শুভাকাঙ্ক্ষীদের প্রতি মাসের ১ তারিখে বিনীত বার্তা।',
    descriptionEn: 'Sends gentle monthly contribution reminder to registered supporters on the 1st of month.',
    category: 'donation',
    triggerType: 'monthly_chanda_due',
    conditions: [],
    delayMinutes: 0,
    actions: [
      {
        id: 'a-9',
        type: 'send_sms',
        channel: 'sms',
        templateId: 'tmpl-chanda',
        targetRole: 'guardian'
      }
    ],
    status: 'active',
    isQuickCard: true,
    quickCardKey: 'chanda_monthly_notice',
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
    lastRunAt: '১ মার্চ, সকাল ৮:০০',
    runCount: 75,
    successCount: 75,
    failureCount: 0
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-001',
    institutionId: 'inst-001',
    titleBn: 'আসন্ন পবিত্র রমাদুল মুবারকের বিশেষ ক্লাস ও ছুটির বিজ্ঞপ্তি',
    titleEn: 'Ramadan Special Class & Vacation Notice',
    messageBn: 'সকল শিক্ষক, শিক্ষার্থী ও অভিভাবকগণের অবগতির জন্য জানানো যাচ্ছে যে, আগামী ১৫ রমাদান পর্যন্ত বিশেষ ছবকা ও তারাবীহ সহ মাদ্রাসা খোলা থাকবে। এরপর ২০ শাওয়াল পর্যন্ত বার্ষিক ছুটি থাকবে। ইনশাআল্লাহ ২১ শাওয়াল থেকে মাদ্রাসার স্বাভাবিক কার্যক্রম পুনরায় শুরু হবে।',
    messageEn: 'Notice to all teachers, students, and guardians: Madrasa classes will continue until 15th Ramadan with special Taraweeh recitation. Eid vacation will be observed until 20th Shawwal.',
    category: 'holiday',
    priority: 'important',
    audience: 'everyone',
    publishDate: '২০২৬-০৩-০১',
    expiryDate: '২০২৬-০৪-১৫',
    channels: ['app', 'push', 'sms'],
    isEmergency: false,
    status: 'published',
    viewsCount: 382,
    createdAt: '2026-03-01 09:30',
    createdBy: 'মুফতি আব্দুল্লাহ আল মামুন (মুহতামিম)'
  },
  {
    id: 'anc-002',
    institutionId: 'inst-001',
    titleBn: 'জরুরি নোটিশ: তীব্র শৈত্যপ্রবাহ ও বৈরী আবহাওয়া সতর্কবার্তা',
    titleEn: 'Emergency Alert: Cold Wave & Adjusted Morning Hours',
    messageBn: 'স্থানীয় আবহাওয়া অধিদপ্তরের সতর্কবার্তার প্রেক্ষিতে আগামী তিনদিন ফজরের পর নূরানী ও নাজেরা বিভাগের ক্লাস সকাল ৭:৩০ এর পরিবর্তে সকাল ৮:৩০ মিনিটে শুরু হবে। বোর্ডিং ছাত্রদের সুষম গরম খাবারের বিশেষ ব্যবস্থা রাখা হয়েছে।',
    messageEn: 'Due to dense fog and severe cold wave, morning assembly for Noorani & Nazera will commence at 8:30 AM instead of 7:30 AM for the next 3 days.',
    category: 'emergency',
    priority: 'emergency',
    audience: 'everyone',
    publishDate: '২০২৬-০৩-০৪',
    expiryDate: '২০২৬-০৩-০৮',
    channels: ['app', 'push', 'sms'],
    isEmergency: true,
    status: 'published',
    viewsCount: 512,
    createdAt: '2026-03-04 06:15',
    createdBy: 'মাওলানা আবুল কাশেম (অ্যাডমিন)'
  },
  {
    id: 'anc-003',
    institutionId: 'inst-001',
    titleBn: 'হিফজুল কুরআন মেধা প্রতিযোগিতা ও পুরস্কার বিতরণী অনুষ্ঠান',
    titleEn: 'Quran Recitation Competition & Annual Prize Giving',
    messageBn: 'আগামী শুক্রবার বাদ আছর মাদ্রাসার কেন্দ্রীয় মিলনায়তনে হিফজ ও কেরাত মেধা প্রতিযোগিতার চূড়ান্ত পর্ব ও পুরস্কার বিতরণী অনুষ্ঠিত হবে। সকল অভিভাবক ও শুভাকাঙ্ক্ষীদের সপরিবারে উপস্থিত থাকার জন্য বিশেষ দাওয়াত দেওয়া যাচ্ছে।',
    messageEn: 'The grand finale and award distribution of the Annual Hifz & Qirat Competition will take place this Friday after Asr. Guardians and patrons are warmly welcomed.',
    category: 'event',
    priority: 'normal',
    audience: 'everyone',
    publishDate: '২০২৬-০৩-০২',
    expiryDate: '২০২৬-০৩-১২',
    channels: ['app', 'push'],
    isEmergency: false,
    status: 'published',
    viewsCount: 290,
    createdAt: '2026-03-02 14:00',
    createdBy: 'হাফেজ ক্বারী ওমর ফারুক (হিফজ প্রধান)'
  }
];

export const INITIAL_QUEUED_MESSAGES: QueuedMessage[] = [
  {
    id: 'q-001',
    institutionId: 'inst-001',
    recipientName: 'মোহাম্মদ সেলিম শিকদার',
    recipientContact: '01711223344',
    recipientRole: 'অভিভাবক (Guardian)',
    channel: 'sms',
    messageText: 'সম্মানিত অভিভাবক, আপনার সন্তান মোহাম্মদ আব্দুল্লাহ আজ মাদ্রাসায় অনুপস্থিত। জরুরি যোগাযোগ: 01712345678।',
    priority: 'urgent',
    status: 'delivered',
    retryCount: 0,
    maxRetries: 3,
    providerId: 'greenweb-sms',
    createdAt: '২০২৬-০৩-০৪ ০৯:৪০',
    processedAt: '২০২৬-০৩-০৪ ০৯:৪২'
  },
  {
    id: 'q-002',
    institutionId: 'inst-001',
    recipientName: 'আব্দুর রহিম মিয়া',
    recipientContact: '01819998877',
    recipientRole: 'অভিভাবক (Guardian)',
    channel: 'sms',
    messageText: 'আসসালামু আলাইকুম। মোহাম্মদ ওবায়দুল্লাহর চলতি মাসের ফি ১,২০০ টাকা পরিশোধের বিনীত তাগিদ রইল।',
    priority: 'normal',
    status: 'delivered',
    retryCount: 0,
    maxRetries: 3,
    providerId: 'greenweb-sms',
    createdAt: '২০২৬-০৩-০৪ ১০:০০',
    processedAt: '২০২৬-০৩-০৪ ১০:০২'
  },
  {
    id: 'q-003',
    institutionId: 'inst-001',
    recipientName: 'মাওলানা মাহবুবুল আলম',
    recipientContact: '01912345678',
    recipientRole: 'শিক্ষক (Teacher)',
    channel: 'push',
    messageText: 'আজ বাদ জোহর জরুরি শিক্ষক পরিষদের মিটিং অনুষ্ঠিত হবে। স্থান: মুহতামিম অফিস।',
    priority: 'important',
    status: 'sent',
    retryCount: 0,
    maxRetries: 2,
    providerId: 'fcm-push',
    createdAt: '২০২৬-০৩-০৪ ১১:১৫',
    processedAt: '২০২৬-০৩-০৪ ১১:১৫'
  },
  {
    id: 'q-004',
    institutionId: 'inst-001',
    recipientName: 'ডা. সাইদুর রহমান',
    recipientContact: '01552334455',
    recipientRole: 'দাতা / শুভাকাঙ্ক্ষী (Donor)',
    channel: 'sms',
    messageText: 'জাযাকাল্লাহু খাইরান! এতিম ফান্ডে আপনার অনুদান ৫,০০০/- টাকা সফলভাবে জমা হয়েছে।',
    priority: 'normal',
    status: 'delivered',
    retryCount: 0,
    maxRetries: 3,
    providerId: 'greenweb-sms',
    createdAt: '২০২৬-০৩-০৪ ১২:৩০',
    processedAt: '২০২৬-০৩-০৪ ১২:৩১'
  },
  {
    id: 'q-005',
    institutionId: 'inst-001',
    recipientName: 'খন্দকার তানভীর হাসান',
    recipientContact: '01678889900',
    recipientRole: 'অভিভাবক (Guardian)',
    channel: 'sms',
    messageText: 'আলহামদুলিল্লাহ! মাসিক পরীক্ষায় আব্দুল কাদির জিপিএ ৫.০০ পেয়ে ১ম স্থান অর্জন করেছে।',
    priority: 'normal',
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    providerId: 'greenweb-sms',
    createdAt: '২০২৬-০৩-০৪ ১৩:০৫'
  }
];

export const INITIAL_VOICE_CAMPAIGNS: VoiceCallCampaign[] = [
  {
    id: 'vc-001',
    institutionId: 'inst-001',
    title: 'জরুরি প্রতিকূল আবহাওয়ায় মাদ্রাসা বন্ধ সংক্রান্ত ভয়েস বার্তা',
    audioName: 'cold_wave_closure_urgent.mp3',
    audioDurationSeconds: 42,
    targetAudience: 'all_guardians',
    targetCount: 156,
    allowedStartTime: '09:00',
    allowedEndTime: '19:30',
    maxCallsPerMinute: 20,
    retryLimit: 2,
    complianceAcknowledged: true,
    status: 'completed',
    answeredCount: 138,
    notAnsweredCount: 12,
    busyCount: 4,
    failedCount: 2,
    createdAt: '২০২৬-০৩-০২ ১০:১৫',
    createdBy: 'মুহতামিম কার্যালয়'
  },
  {
    id: 'vc-002',
    institutionId: 'inst-001',
    title: 'পবিত্র রমাদান আগমনী ও খতমে কুরআন মাহফিল আমন্ত্রণ',
    audioName: 'ramadan_invitation_broadcast.mp3',
    audioDurationSeconds: 58,
    targetAudience: 'donors',
    targetCount: 85,
    allowedStartTime: '10:00',
    allowedEndTime: '18:00',
    maxCallsPerMinute: 15,
    retryLimit: 1,
    complianceAcknowledged: true,
    status: 'completed',
    answeredCount: 78,
    notAnsweredCount: 5,
    busyCount: 2,
    failedCount: 0,
    createdAt: '২০২৬-০২-২৮ ১১:০০',
    createdBy: 'মাওলানা আবুল কাশেম'
  }
];

export const INITIAL_COMMUNICATION_LOGS: CommunicationLog[] = [
  {
    id: 'cl-001',
    institutionId: 'inst-001',
    timestamp: 'আজ, দুপুর ১:৩০',
    recipientName: 'মোহাম্মদ সেলিম শিকদার',
    recipientContact: '01711223344',
    recipientRole: 'অভিভাবক',
    channel: 'sms',
    message: 'সম্মানিত অভিভাবক, আপনার সন্তান মোহাম্মদ আব্দুল্লাহ আজ অনুপস্থিত...',
    status: 'delivered',
    providerName: 'Greenweb SMS Gateway',
    automationName: 'স্বয়ংক্রিয় অনুপস্থিতি এসএমএস অ্যালার্ট',
    sentBy: 'System Automation',
    costBdt: 0.35
  },
  {
    id: 'cl-002',
    institutionId: 'inst-001',
    timestamp: 'আজ, দুপুর ১:১৫',
    recipientName: 'আব্দুর রহিম মিয়া',
    recipientContact: '01819998877',
    recipientRole: 'অভিভাবক',
    channel: 'sms',
    message: 'ধন্যবাদ! মোহাম্মদ ওবায়দুল্লাহর ফি ১,২০০/- টাকা জমা হয়েছে...',
    status: 'delivered',
    providerName: 'Greenweb SMS Gateway',
    automationName: 'ফি পরিশোধের ডিজিটাল এসএমএস রসিদ',
    sentBy: 'System Automation',
    costBdt: 0.35
  },
  {
    id: 'cl-003',
    institutionId: 'inst-001',
    timestamp: 'আজ, দুপুর ১২:০০',
    recipientName: 'সকল শিক্ষক ও স্টাফ',
    recipientContact: '১৫ জন শিক্ষক',
    recipientRole: 'শিক্ষক',
    channel: 'push',
    message: 'জরুরি নোটিশ: তীব্র শৈত্যপ্রবাহ ও বৈরী আবহাওয়া সতর্কবার্তা প্রকাশিত হয়েছে।',
    status: 'delivered',
    providerName: 'FCM Push Adapter',
    sentBy: 'মাওলানা আবুল কাশেম',
    costBdt: 0.00
  },
  {
    id: 'cl-004',
    institutionId: 'inst-001',
    timestamp: 'গতকাল, বিকাল ৫:৪৫',
    recipientName: 'ডা. সাইদুর রহমান',
    recipientContact: '01552334455',
    recipientRole: 'দাতা',
    channel: 'sms',
    message: 'জাযাকাল্লাহু খাইরান! এতিম ফান্ডে অনুদান ৫,০০০/- টাকা প্রাপ্ত হয়েছে...',
    status: 'delivered',
    providerName: 'Greenweb SMS Gateway',
    automationName: 'দান / অনুদান জমা হলে',
    sentBy: 'System Automation',
    costBdt: 0.35
  },
  {
    id: 'cl-005',
    institutionId: 'inst-001',
    timestamp: 'গতকাল, সকাল ১০:০০',
    recipientName: '১৩৮ জন অভিভাবক',
    recipientContact: 'বাল্ক ভয়েস ক্যাম্পেইন',
    recipientRole: 'অভিভাবক',
    channel: 'voice',
    message: 'জরুরি প্রতিকূল আবহাওয়ায় মাদ্রাসা বন্ধ সংক্রান্ত ভয়েস বার্তা (৪২ সেকেন্ড)',
    status: 'delivered',
    providerName: 'Telecom Voice Gateway',
    sentBy: 'মুহতামিম কার্যালয়',
    costBdt: 124.20
  }
];

export const INITIAL_PROVIDER_SETTINGS: ProviderConfiguration = {
  sms: {
    adapter: 'greenweb',
    isConfigured: true,
    senderId: 'MADS0L',
    apiEndpoint: 'https://api.greenweb.com.bd/api.php',
    status: 'active'
  },
  email: {
    adapter: 'smtp',
    isConfigured: true,
    fromEmail: 'notification@madsol.edu.bd',
    fromName: 'MadSol Smart Madrasa',
    status: 'active'
  },
  push: {
    adapter: 'webpush',
    isConfigured: true,
    status: 'active'
  },
  voice: {
    adapter: 'authorized_telecom',
    isConfigured: true,
    status: 'active',
    allowedWindowStart: '09:00',
    allowedWindowEnd: '20:00',
    maxRatePerMin: 30
  }
};

export const INITIAL_AUTOMATION_RUN_LOGS: AutomationRunLog[] = [
  {
    id: 'arl-1',
    institutionId: 'inst-001',
    automationId: 'auto-001',
    automationName: 'স্বয়ংক্রিয় অনুপস্থিতি এসএমএস অ্যালার্ট',
    triggerTime: 'আজ, সকাল ০৯:৪৫',
    recipientName: 'মোহাম্মদ সেলিম শিকদার',
    recipientTarget: '01711223344',
    actionTaken: 'SMS & App Alert Sent',
    status: 'success',
    durationMs: 420
  },
  {
    id: 'arl-2',
    institutionId: 'inst-001',
    automationId: 'auto-003',
    automationName: 'ফি পরিশোধের ডিজিটাল এসএমএস রসিদ',
    triggerTime: 'আজ, দুপুর ০১:১৫',
    recipientName: 'আব্দুর রহিম মিয়া',
    recipientTarget: '01819998877',
    actionTaken: 'SMS Receipt Sent',
    status: 'success',
    durationMs: 310
  },
  {
    id: 'arl-3',
    institutionId: 'inst-001',
    automationId: 'auto-004',
    automationName: 'হিফজ দৈনিক ছবকা পর্যালোচনা বার্তা',
    triggerTime: 'গতকাল, সন্ধ্যা ০৭:১৫',
    recipientName: 'হাফেজ ক্বারী ওমর ফারুক (অভিভাবক তালিকা)',
    recipientTarget: '২৫ জন অভিভাবক',
    actionTaken: 'Bulk Recitation Summary Dispatched',
    status: 'success',
    durationMs: 1250
  }
];

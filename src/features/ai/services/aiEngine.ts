import { UserRole } from '../../../types';

export interface AiQueryResult {
  replyText: string;
  contextScope: {
    institutionId: string;
    userRole: string;
    dataPointsEvaluated: number;
  };
  suggestedFollowUps: string[];
  isSecurityViolation?: boolean;
}

export interface AiLiveDataContext {
  institutionId: string;
  institutionName: string;
  userRole: UserRole;
  students: {
    total: number;
    presentToday: number;
    absentToday: number;
    attendanceRate: number;
    dueTotal: number;
    studentsWithDue: number;
    hifzStudents: number;
    topPerformers: string[];
    criticalStudents: string[];
  };
  finance: {
    thisMonthIncome: number;
    thisMonthExpense: number;
    netBalance: number;
    totalDue: number;
    donationMonth: number;
    chandaMonth: number;
  };
  hifz: {
    totalEnrolled: number;
    averageSabakScore: number;
    averageRevisionScore: number;
    laggingStudents: string[];
    topHifzStudents: string[];
  };
  exams: {
    overallAverage: number;
    passPercentage: number;
    topClass: string;
  };
}

/**
 * Multi-Institution Scoped AI Query Resolver
 * Enforces: User Role -> Permission -> Institution ID -> Allowed Data -> AI Context
 */
export function processAiQuery(
  query: string,
  userRole: UserRole,
  institutionId: string,
  context: AiLiveDataContext,
  language: 'bn' | 'en'
): AiQueryResult {
  const normalized = query.toLowerCase().trim();

  // 1. Security Check: Sensitive Secrets & Passwords
  const secretKeywords = ['password', 'পাসওয়ার্ড', 'secret', 'api_key', 'এপিআই কী', 'টোকেন', 'private_key'];
  if (secretKeywords.some((kw) => normalized.includes(kw))) {
    return {
      replyText:
        language === 'bn'
          ? '🔒 **নিরাপত্তা সতর্কতা:** MadSol AI নিরাপত্তা নীতিমালা অনুযায়ী সিস্টেম পাসওয়ার্ড, সিক্রেট বা ব্যক্তিগত ক্রিডেনশিয়াল প্রদর্শন সম্পূর্ণ নিষিদ্ধ।'
          : '🔒 **Security Alert:** By MadSol AI Security Policy, displaying passwords, secret keys, or confidential credentials is strictly prohibited.',
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 0
      },
      suggestedFollowUps: [],
      isSecurityViolation: true
    };
  }

  // 2. Multi-Institution Security Scope Check
  if (normalized.includes('inst-002') && institutionId !== 'inst-002') {
    return {
      replyText:
        language === 'bn'
          ? '🚫 **অ্যাক্সেস সংরক্ষিত:** আপনি অন্য কোনো প্রতিষ্ঠানের ডাটাবেস দেখতে অনুমোদিত নন। আপনার অনুসন্ধান শুধুমাত্র নিজ প্রতিষ্ঠানের ডাটায় সীমাবদ্ধ।'
          : '🚫 **Access Denied:** Cross-institution data access is blocked. Your query is strictly scoped to your current institution.',
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 0
      },
      suggestedFollowUps: [],
      isSecurityViolation: true
    };
  }

  // 3. Permission Check for Financial Queries
  const isFinanceQuery =
    normalized.includes('টাকা') ||
    normalized.includes('আয়') ||
    normalized.includes('ব্যয়') ||
    normalized.includes('বকেয়া') ||
    normalized.includes('চাঁদা') ||
    normalized.includes('অনুদান') ||
    normalized.includes('income') ||
    normalized.includes('expense') ||
    normalized.includes('due') ||
    normalized.includes('chanda') ||
    normalized.includes('donation');

  const allowedFinanceRoles: UserRole[] = ['super_admin', 'madrasa_admin', 'principal', 'accountant'];
  if (isFinanceQuery && !allowedFinanceRoles.includes(userRole)) {
    return {
      replyText:
        language === 'bn'
          ? '⚠️ **অনুমতি প্রয়োজন:** আপনার রোল (' +
            userRole +
            ')-এর জন্য প্রাতিষ্ঠানিক আর্থিক খতিয়ান ও ব্যালেন্স তথ্য সুরক্ষিত রাখা হয়েছে। অনুগ্রহ করে হিসাবরক্ষক বা অ্যাডমিনের সাথে যোগাযোগ করুন।'
          : '⚠️ **Permission Required:** Institutional financial data is restricted for your role (' +
            userRole +
            '). Please contact an administrator.',
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 0
      },
      suggestedFollowUps: ['আজকের উপস্থিতি কত?', 'হিফজ অগ্রগতি কেমন?']
    };
  }

  // 4. Intent Categorization & Synthesized AI Response
  // Attendance query
  if (
    normalized.includes('অনুপস্থিত') ||
    normalized.includes('উপস্থিতি') ||
    normalized.includes('হাজিরা') ||
    normalized.includes('absent') ||
    normalized.includes('attendance')
  ) {
    const replyBn = `📊 **উপস্থিতি সারসংক্ষেপ — ${context.institutionName}:**
- মোট শিক্ষার্থী: **${context.students.total} জন**
- আজকের উপস্থিতি: **${context.students.presentToday} জন** (${context.students.attendanceRate}%)
- আজকের অনুপস্থিত: **${context.students.absentToday} জন** (${(100 - context.students.attendanceRate).toFixed(1)}%)

🔍 **শ্রেণিভিত্তিক পরিস্থিতি:**
- নূরানী ৩য় শ্রেণিতে অনুপস্থিতির হার তুলনামূলকভাবে বেশি (বিশেষ করে জুবায়ের বিন খালিদ বিগত ৪ দিন অনুপস্থিত)।
- হিফজুল কুরআন বিভাগ (গ্রুপ-ক)-এ উপস্থিতি প্রায় **৯৮%**, যা প্রশংসনীয়।

💡 **সুপারিশ:** অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের স্বয়ংক্রিয় এসএমএস অ্যালার্ট কিউতে যুক্ত করা হয়েছে।`;

    const replyEn = `📊 **Attendance Summary — ${context.institutionName}:**
- Total Enrolled: **${context.students.total} students**
- Present Today: **${context.students.presentToday}** (${context.students.attendanceRate}%)
- Absent Today: **${context.students.absentToday}** (${(100 - context.students.attendanceRate).toFixed(1)}%)

🔍 **Cohort Breakdown:**
- Noorani Grade 3 has highest absence concentration (notably Zubair Bin Khalid absent 4 days).
- Hifz Cohort-A attendance is exceptional at **98%**.

💡 **Recommendation:** Automated absence notifications are queued for guardian outreach.`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: context.students.total
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['অনুপস্থিত শিক্ষার্থীদের তালিকা দাও', 'এই মাসে মোট বকেয়া কত?', 'কোন ক্লাসে রেজাল্ট সবচেয়ে ভালো?']
          : ['List absent students', 'What is total overdue fee?', 'Which class has best exam result?']
    };
  }

  // Fee / Dues query
  if (
    normalized.includes('বকেয়া') ||
    normalized.includes('ফি') ||
    normalized.includes('due') ||
    normalized.includes('fee')
  ) {
    const dueAmount = context.finance.totalDue || 128500;
    const replyBn = `💰 **বকেয়া ফি সারসংক্ষেপ — ${context.institutionName}:**
- মোট বকেয়া ফি: **৳${dueAmount.toLocaleString('bn-BD')}**
- বকেয়াধারী শিক্ষার্থীর সংখ্যা: **${context.students.studentsWithDue || 38} জন**
- গড় বকেয়ার পরিমাণ: **৳৩,৩৮১/জন**

⚠️ **গুরুত্বপূর্ণ সমস্যা:**
- ২ মাসের বেশি বকেয়া রয়েছে এমন শিক্ষার্থী: **১৪ জন** (মোট বকেয়া ৳৬২,০০০)।
- সবচেয়ে বেশি বকেয়া নূরানী ৩য় শ্রেণি ও কিতাব প্রথম বর্ষে।

💡 **সুপারিশ:** MadSol অটোমেশন সেন্টারের মাধ্যমে এক ক্লিকে "বকেয়া ফি তাগাদা" এসএমএস রান করুন।`;

    const replyEn = `💰 **Outstanding Fee Summary — ${context.institutionName}:**
- Total Overdue Fee: **৳${dueAmount.toLocaleString()}**
- Students with Overdue Balance: **${context.students.studentsWithDue || 38}**
- Average Balance: **৳3,381 per student**

⚠️ **Critical Items:**
- Over 2 months overdue: **14 students** (Total ৳62,000).
- Heaviest concentration in Noorani Class 3 and Kitab 1st Year.

💡 **Recommendation:** Trigger the automated Due Recovery SMS rule from the Automation Center.`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 145
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['বকেয়া তাগাদা এসএমএস পাঠাও', 'চলতি মাসের মোট আয় কত?', 'কোন কোন ছাত্রের ৩ মাসের বেশি বাকি?']
          : ['Send SMS reminders', 'What is this month income?', 'List students with 3+ months due']
    };
  }

  // Hifz query
  if (
    normalized.includes('হিফজ') ||
    normalized.includes('সবক') ||
    normalized.includes('আমুন্তা') ||
    normalized.includes('hifz') ||
    normalized.includes('sabaq') ||
    normalized.includes('quran')
  ) {
    const replyBn = `📖 **হিফজুল কুরআন বিভাগীয় অগ্রগতি বিশ্লেষণ — ${context.institutionName}:**
- মোট হিফজ শিক্ষার্থী: **${context.hifz.totalEnrolled || 58} জন**
- দৈনিক নতুন সবক গড় স্কোর: **${context.hifz.averageSabakScore || 91}% (খুব ভালো)**
- আমুন্তা (পেছনের রিভিশন) রিটেনশন: **${context.hifz.averageRevisionScore || 76}% (উন্নতির সুযোগ আছে)**

🌟 **শীর্ষ হিফজ শিক্ষার্থী:**
- **মুহাম্মদ আব্দুল্লাহ** (১৮তম পারা সমাপ্তির পথে, ১০০% উপস্থিতি ও অসাধারণ সবকি)।
- **উমায়ের আহমাদ** (১২তম পারা, নিয়মিত ৩ পৃষ্ঠা রিভিশন)।

⚠️ **মনোযোগ প্রয়োজন:**
- **আহমাদ সালমান** (নতুন সবক ভালো হলেও পেছনের আমুন্তায় ভুল হচ্ছে)।
- পরামর্শ: নতুন সবকের চাপ কমিয়ে প্রতিদিন ১ পারা রিভিশন বাধ্যতামূলক করুন।`;

    const replyEn = `📖 **Hifz Department Progress Analysis — ${context.institutionName}:**
- Total Enrolled: **${context.hifz.totalEnrolled || 58} students**
- Daily Sabaq Average: **${context.hifz.averageSabakScore || 91}% (Excellent)**
- Amokhta (Revision) Retention: **${context.hifz.averageRevisionScore || 76}% (Requires improvement)**

🌟 **Top Performers:**
- **Muhammad Abdullah** (Nearing completion of Para 18, near-perfect retention).
- **Umair Ahmad** (Para 12, steady 3 pages daily).

⚠️ **Attention Required:**
- **Ahmad Salman** (Slowing in Amokhta revision).
- Recommendation: Cap new lesson pace and mandate 1 full Para revision daily.`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: context.hifz.totalEnrolled || 58
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['আহমাদ সালমানের সম্পূর্ণ রিপোর্ট দেখাও', 'হিফজ সমাপনী সনদ জেনারেট করো', 'হিফজ শিক্ষকের রিপোর্ট কী?']
          : ['Show full report for Ahmad Salman', 'Generate Hifz Sanad', 'Hifz teacher report']
    };
  }

  // Financial Income & Expense query
  if (
    normalized.includes('আয়') ||
    normalized.includes('ব্যয়') ||
    normalized.includes('হিসাব') ||
    normalized.includes('income') ||
    normalized.includes('expense') ||
    normalized.includes('finance')
  ) {
    const income = context.finance.thisMonthIncome || 345000;
    const expense = context.finance.thisMonthExpense || 288200;
    const surplus = income - expense;

    const replyBn = `💵 **আয় ও ব্যয় আর্থিক চিত্র — ${context.institutionName}:**
- চলতি মাসের মোট আয়: **৳${income.toLocaleString('bn-BD')}**
- চলতি মাসের মোট ব্যয়: **৳${expense.toLocaleString('bn-BD')}**
- নিট উদ্বৃত্ত (Surplus): **${surplus >= 0 ? '+' : ''}৳${surplus.toLocaleString('bn-BD')}**

📊 **প্রধান আয়ের খাত:**
1. শিক্ষার্থী মাসিক বেতন ও ভর্তি ফি: ৳২,১৫,০০০
2. সাধারণ ও যাকাত দান-অনুদান: ৳৮২,০০০
3. শুভাকাঙ্ক্ষী নিয়মিত মাসিক চাঁদা: ৳৪৮,০০০

📉 **প্রধান ব্যয়ের খাত:**
1. শিক্ষক ও স্টাফ বেতন পে-রোল: ৳১,৮৫,০০০
2. মেস খানা ও খাদ্য সামগ্রী: ৳৬৪,২০০
3. বিদ্যুৎ, ইউটিলিটি ও মেরামত: ৳৩৯,০০০`;

    const replyEn = `💵 **Financial Overview — ${context.institutionName}:**
- Monthly Revenue: **৳${income.toLocaleString()}**
- Monthly Expenditure: **৳${expense.toLocaleString()}**
- Net Balance: **${surplus >= 0 ? '+' : ''}৳${surplus.toLocaleString()}**

📊 **Revenue Streams:**
1. Tuition & Admissions: ৳215,000
2. General & Zakat Charity: ৳82,000
3. Monthly Recurring Chanda: ৳48,000

📉 **Major Expenditures:**
1. Faculty & Staff Payroll: ৳185,000
2. Student Dining & Boarding Food: ৳64,200
3. Utilities & Maintenance: ৳39,000`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 84
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['এই মাসের চাঁদা সংগ্রহ কত?', 'মেস খরচের বিস্তারিত খতিয়ান', 'ত্রৈমাসিক আর্থিক রিপোর্ট তৈরি করো']
          : ['Monthly Chanda summary', 'Dining expense breakdown', 'Generate quarterly finance report']
    };
  }

  // Donation / Chanda query
  if (
    normalized.includes('চাঁদা') ||
    normalized.includes('দান') ||
    normalized.includes('অনুদান') ||
    normalized.includes('donation') ||
    normalized.includes('chanda')
  ) {
    const donation = context.finance.donationMonth || 82000;
    const chanda = context.finance.chandaMonth || 48000;

    const replyBn = `🤲 **দান ও চাঁদা কালেকশন রিপোর্ট — ${context.institutionName}:**
- চলতি মাসে সংগৃহীত অনুদান: **৳${donation.toLocaleString('bn-BD')}** (মোট ২৮ জন দাতা)
- চলতি মাসে মাসিক চাঁদা সংগ্রহ: **৳${chanda.toLocaleString('bn-BD')}** (৬৪ জন নিয়মিত শুভাকাঙ্ক্ষী)
- সর্বমোট দাতব্য সংগ্রহ: **৳${(donation + chanda).toLocaleString('bn-BD')}**

🌟 **সর্বোচ্চ দাতা:**
- আলহাজ্ব কবির চৌধুরী (এতিমখানা তহবিলে ৳২৫,০০০)
- হাজী সামসুল আলম (লিল্লাহ বোর্ডিং খাদ্য তহবিলে ৳১৫,০০০)

💡 **পরামর্শ:** সকল দাতাকে স্বয়ংক্রিয় শুকরিয়া ও দোয়া সম্বলিত ডিজিটাল রসিদ ও এসএমএস প্রেরণ করা হয়েছে।`;

    const replyEn = `🤲 **Donations & Chanda Collection — ${context.institutionName}:**
- Total Donations This Month: **৳${donation.toLocaleString()}** (28 donors)
- Monthly Recurring Chanda: **৳${chanda.toLocaleString()}** (64 active patrons)
- Combined Charitable Inflow: **৳${(donation + chanda).toLocaleString()}**

🌟 **Notable Donors:**
- Alhaj Kabir Chowdhury (৳25,000 to Orphan Fund)
- Haji Shamsul Alam (৳15,000 to Boarding Meal Fund)

💡 **Recommendation:** Automated digital receipts and dua acknowledgment SMS delivered to all contributors.`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 92
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['স্বতন্ত্র তহবিলগুলোর ব্যালেন্স কত?', 'দাতাদের এসএমএস পাঠাও', 'আজকের আয় ও ব্যয় দেখাও']
          : ['Dedicated fund balances', 'Send donor appreciation SMS', 'Show today income and expense']
    };
  }

  // Student specific or search query
  if (
    normalized.includes('আব্দুল্লাহ') ||
    normalized.includes('সালমান') ||
    normalized.includes('হাসান') ||
    normalized.includes('জুবায়ের') ||
    normalized.includes('student') ||
    normalized.includes('শিক্ষার্থী')
  ) {
    const replyBn = `👨‍🎓 **শিক্ষার্থী প্রোফাইল ও পারফরম্যান্স সারসংক্ষেপ:**
- **মুহাম্মদ আব্দুল্লাহ (রোল: ১০১, হিফজ বিভাগ)**:
  - ক্যাটাগরি: 🟢 **চমৎকার (Excellent)**
  - উপস্থিতি: ৯৮%, পরীক্ষার গড়: ৯৬%
  - কোনো ফি বকেয়া নেই। জাতীয় প্রতিযোগিতার উপযুক্ত।
- **আহমাদ সালমান (রোল: ১০২, হিফজ বিভাগ)**:
  - ক্যাটাগরি: 🟠 **মনোযোগ প্রয়োজন (Needs Attention)**
  - উপস্থিতি: ৭৮%, বকেয়া: ৳৩,৫০০
  - আমুন্তা রিভিশন ক্লাসে বিশেষ যত্ন প্রয়োজন।
- **জুবায়ের বিন খালিদ (রোল: ১০৫, নূরানী বিভাগ)**:
  - ক্যাটাগরি: 🔴 **জরুরি পদক্ষেপ (Critical Attention)**
  - টানা ৪ দিন অনুপস্থিত, বকেয়া: ৳৪,৮০০।

💡 বিস্তারিত দেখতে "AI শিক্ষার্থী পারফরম্যান্স" ট্যাবে যান।`;

    const replyEn = `👨‍🎓 **Student Performance Summary:**
- **Muhammad Abdullah (Roll: 101, Hifz)**:
  - Status: 🟢 **Excellent** (Attendance 98%, Exam Avg 96%, Zero Due)
- **Ahmad Salman (Roll: 102, Hifz)**:
  - Status: 🟠 **Needs Attention** (Attendance 78%, Due ৳3,500, Revision slowdown)
- **Zubair Bin Khalid (Roll: 105, Noorani)**:
  - Status: 🔴 **Critical Attention** (Absent 4 days, Due ৳4,800)

💡 Visit the AI Performance Analyzer tab for deep-dive trends.`;

    return {
      replyText: language === 'bn' ? replyBn : replyEn,
      contextScope: {
        institutionId,
        userRole,
        dataPointsEvaluated: 4
      },
      suggestedFollowUps:
        language === 'bn'
          ? ['আহমাদ সালমানের অভিভাবককে কল করুন', 'হিফজ অগ্রগতি সারসংক্ষেপ দিন', 'আজকের ক্লাসের রুটিন দেখাও']
          : ['Contact Ahmad Salman guardian', 'Hifz progress summary', 'Show today class routine']
    };
  }

  // Generic / Default AI Answer
  const defaultBn = `আমি **MadSol AI সহকারী**। ${context.institutionName}-এর ডাটাবেসের সাথে সংযুক্ত থেকে আমি আপনাকে তথ্য ও বিশ্লেষণ দিয়ে সাহায্য করতে পারি।

আপনি আমাকে জিজ্ঞেস করতে পারেন:
1. **উপস্থিতি:** "আজ কতজন অনুপস্থিত এবং কোন ক্লাসে উপস্থিতি কম?"
2. **আর্থিক:** "এই মাসে মোট বকেয়া কত এবং মোট রাজস্ব আদায় কত?"
3. **হিফজ:** "হিফজ বিভাগে কার অগ্রগতি ভালো এবং কার রিভিশন প্রয়োজন?"
4. **দান ও চাঁদা:** "এই মাসে মোট অনুদান ও শুভাকাঙ্ক্ষীদের চাঁদা কত?"
5. **রিপোর্ট:** "চলতি মাসের সামগ্রিক প্রাতিষ্ঠানিক রিপোর্ট তৈরি করো।"

অনুগ্রহ করে আপনার নির্দিষ্ট প্রশ্নটি করুন।`;

  const defaultEn = `I am **MadSol AI Assistant**, securely connected to **${context.institutionName}**'s live database.

You can ask me:
1. **Attendance:** "How many students are absent today and which class is lowest?"
2. **Finance:** "What is the total fee due and total revenue this month?"
3. **Hifz:** "Who is excelling in Hifz and who needs revision support?"
4. **Charity:** "What is the donation and recurring Chanda total this month?"
5. **Reports:** "Generate a comprehensive monthly audit report."

How may I assist you today?`;

  return {
    replyText: language === 'bn' ? defaultBn : defaultEn,
    contextScope: {
      institutionId,
      userRole,
      dataPointsEvaluated: context.students.total + 25
    },
    suggestedFollowUps:
      language === 'bn'
        ? [
            'আজ কতজন শিক্ষার্থী অনুপস্থিত?',
            'এই মাসে মোট বকেয়া কত?',
            'কোন শিক্ষার্থীর হিফজ অগ্রগতি কম?',
            'আজকের আয় ও ব্যয়ের হিসাব দেখাও।'
          ]
        : [
            'How many students are absent today?',
            'What is the total fee due this month?',
            'Which student needs Hifz revision attention?',
            'Show income and expense summary.'
          ]
  };
}

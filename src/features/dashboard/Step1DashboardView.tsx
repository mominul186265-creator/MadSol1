import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  Users,
  CalendarCheck,
  Receipt,
  UserCheck,
  Award,
  Tv,
  Utensils,
  GraduationCap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BD_DISTRICTS } from '../../data/districts';

interface Step1DashboardProps {
  onNavigate: (path: string) => void;
}

// Helper to convert English numbers to Bengali numerals
const toBengaliNumber = (num: string | number) => {
  const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (w) => bnNumbers[parseInt(w, 10)]);
};

export const Step1DashboardView: React.FC<Step1DashboardProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { user, hasPermission } = useAuth();
  const isBn = language === 'bn';
  const role = user?.role_id;
  const isAdminOrPrincipal =
    role === 'super_admin' || role === 'institution_admin' || role === 'principal';

  // Sort districts alphabetically based on language
  const sortedDistricts = [...BD_DISTRICTS].sort((a, b) =>
    isBn ? a.nameBn.localeCompare(b.nameBn) : a.nameEn.localeCompare(b.nameEn)
  );

  const [selectedDistrictId, setSelectedDistrictId] = useState('dhaka');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format digits based on selected language
  const formatDigits = (str: string | number) => {
    return isBn ? toBengaliNumber(str) : String(str);
  };

  // Format live running time (Bengali or English according to language)
  const formatLiveTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? (isBn ? 'পিএম' : 'PM') : (isBn ? 'এএম' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
    const secondsStr = seconds < 10 ? '0' + seconds : String(seconds);
    const timeFormatted = `${hours}:${minutesStr}:${secondsStr}`;
    return `${isBn ? toBengaliNumber(timeFormatted) : timeFormatted} ${ampm}`;
  };

  // Islamic / Hijri Month Names in Bengali & English
  const HIJRI_MONTHS_BN = [
    'মহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল',
    'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
  ];

  const HIJRI_MONTHS_EN = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal',
    'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
  ];

  // Bangla Months in Bengali & English
  const BANGLA_MONTHS_BN = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];

  const BANGLA_MONTHS_EN = [
    'Boishakh', 'Jaishtha', 'Asharh', 'Shrabon', 'Bhadro', 'Ashwin',
    'Kartik', 'Agrahayan', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  // Weekday Name in Bengali / English
  const getWeekdayName = (date: Date) => {
    const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return isBn ? daysBn[date.getDay()] : daysEn[date.getDay()];
  };

  // Calculate Bangla Date & Year
  const getBanglaDate = (date: Date, fullYearLabel = false) => {
    const year = date.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear ? 30 : 29, 30];

    const startOfBaishakh = new Date(year, 3, 14);
    let banglaYear = year - 593;
    let dayDiff = Math.floor((date.getTime() - startOfBaishakh.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff < 0) {
      banglaYear = year - 594;
      const prevYear = year - 1;
      const prevStart = new Date(prevYear, 3, 14);
      dayDiff = Math.floor((date.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
    }

    let monthIndex = 0;
    while (dayDiff >= monthDays[monthIndex] && monthIndex < 11) {
      dayDiff -= monthDays[monthIndex];
      monthIndex++;
    }

    const banglaDay = dayDiff + 1;
    if (isBn) {
      const monthName = BANGLA_MONTHS_BN[monthIndex];
      const yearLabel = fullYearLabel ? ' বঙ্গাব্দ' : '';
      return `${toBengaliNumber(banglaDay)} ${monthName} ${toBengaliNumber(banglaYear)}${yearLabel}`;
    } else {
      const monthName = BANGLA_MONTHS_EN[monthIndex];
      const yearLabel = fullYearLabel ? ' BS' : '';
      return `${banglaDay} ${monthName} ${banglaYear}${yearLabel}`;
    }
  };

  // Calculate Hijri / Arabic Date & Year
  const getHijriDate = (date: Date, fullYearLabel = false) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(date);
      const dayVal = parts.find(p => p.type === 'day')?.value;
      const monthVal = parts.find(p => p.type === 'month')?.value;
      const yearVal = parts.find(p => p.type === 'year')?.value;

      if (dayVal && monthVal && yearVal) {
        const monthNum = parseInt(monthVal, 10);
        if (isBn) {
          const monthName = HIJRI_MONTHS_BN[monthNum - 1] || 'রবিউস সানি';
          const yearLabel = fullYearLabel ? ' হিজরি' : ' হি.';
          return `${toBengaliNumber(dayVal)} ${monthName} ${toBengaliNumber(yearVal)}${yearLabel}`;
        } else {
          const monthName = HIJRI_MONTHS_EN[monthNum - 1] || 'Rabi al-Thani';
          const yearLabel = fullYearLabel ? ' Hijri' : ' AH';
          return `${dayVal} ${monthName} ${yearVal}${yearLabel}`;
        }
      }
    } catch {
      // fallback
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let m = month + 1;
    let y = year;
    if (m < 3) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l1 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719) + Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
    const l2 = l1 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const m2 = Math.floor((24 * l2) / 709);
    const d2 = l2 - Math.floor((709 * m2) / 24);
    const y2 = 30 * n + j - 30;

    if (isBn) {
      const monthName = HIJRI_MONTHS_BN[m2 - 1] || 'রবিউস সানি';
      const yearLabel = fullYearLabel ? ' হিজরি' : ' হি.';
      return `${toBengaliNumber(d2)} ${monthName} ${toBengaliNumber(y2)}${yearLabel}`;
    } else {
      const monthName = HIJRI_MONTHS_EN[m2 - 1] || 'Rabi al-Thani';
      const yearLabel = fullYearLabel ? ' Hijri' : ' AH';
      return `${d2} ${monthName} ${y2}${yearLabel}`;
    }
  };

  // Primary 6 Department Cards — Clean Editorial Typographic Cards (Icon-free & Premium Compact Model)
  const PRIMARY_2COL_CARDS = [
    {
      id: 'hifz',
      index: '01',
      tagBn: 'হিফজ',
      tagEn: 'HIFZ',
      titleBn: 'হিফজুল কুরআন বিভাগ',
      titleEn: 'Hifz Department',
      subtitleBn: 'দৈনিক ছবক, সাত ছবক ও আমপারা',
      subtitleEn: 'Daily Sabaq & Ampara tracker',
      path: '/hifz',
      accentBar: 'from-emerald-500/80 to-teal-500/30',
      tagTone: 'text-emerald-700 dark:text-emerald-400',
      allowed: role !== 'guardian',
    },
    {
      id: 'qawmi',
      index: '02',
      tagBn: 'ক্বওমী',
      tagEn: 'QAWMI',
      titleBn: 'ক্বওমী নেসাব ও জামাত',
      titleEn: 'Qawmi Curriculum',
      subtitleBn: '১০টি জামাত, কিতাব ও পরীক্ষা',
      subtitleEn: '10 classes, Befaq syllabus',
      path: '/qawmi',
      accentBar: 'from-sky-500/80 to-indigo-500/30',
      tagTone: 'text-sky-700 dark:text-sky-400',
      allowed: role !== 'guardian',
    },
    {
      id: 'academic',
      index: '03',
      tagBn: 'নূরানী',
      tagEn: 'NOORANI',
      titleBn: 'নূরানী ও প্রাক-প্রাথমিক',
      titleEn: 'Noorani & Primary',
      subtitleBn: 'প্লে থেকে ৫ম শ্রেণী ও সাময়িক',
      subtitleEn: 'Play to Grade 5 & exams',
      path: '/academic',
      accentBar: 'from-amber-500/80 to-orange-500/30',
      tagTone: 'text-amber-700 dark:text-amber-400',
      allowed: role !== 'guardian',
    },
    {
      id: 'automation',
      index: '04',
      tagBn: 'স্মার্ট',
      tagEn: 'SMART',
      titleBn: 'স্মার্ট অটোমেশন সেন্টার',
      titleEn: 'Automation Center',
      subtitleBn: 'স্বয়ংক্রিয় বার্তা ও ফি রিমাইন্ডার',
      subtitleEn: 'Automated SMS & fee alerts',
      path: '/automation',
      accentBar: 'from-violet-500/80 to-purple-500/30',
      tagTone: 'text-violet-700 dark:text-violet-400',
      allowed: role !== 'guardian' && role !== 'student',
    },
    {
      id: 'teacher-app',
      index: '05',
      tagBn: 'শিক্ষক',
      tagEn: 'FACULTY',
      titleBn: 'সহকারী শিক্ষক অ্যাপ',
      titleEn: 'Teacher Sub-App',
      subtitleBn: 'উস্তায পোর্টাল, ছবক ও হাজিরা',
      subtitleEn: 'Faculty portal & daily sabak',
      path: '/teacher-app',
      accentBar: 'from-teal-500/80 to-emerald-500/30',
      tagTone: 'text-teal-700 dark:text-teal-400',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'guardian-app',
      index: '06',
      tagBn: 'অভিভাবক',
      tagEn: 'PARENT',
      titleBn: 'অভিভাবক অ্যাপ পোর্টাল',
      titleEn: 'Guardian Portal',
      subtitleBn: 'সন্তানের উপস্থিতি ও ফি পেমেন্ট',
      subtitleEn: 'Child attendance & invoices',
      path: '/guardian-app',
      accentBar: 'from-rose-500/80 to-pink-500/30',
      tagTone: 'text-rose-700 dark:text-rose-400',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
  ];

  // Quick Action Administrative Shortcuts (Balanced 8-item grid: 2x4 mobile, 4x2 desktop)
  const QUICK_ACTIONS = [
    {
      id: 'students',
      titleBn: 'শিক্ষার্থী তালিকা',
      titleEn: 'Students Directory',
      path: '/students',
      icon: GraduationCap,
      allowed: hasPermission('students.view') || (role !== 'guardian' && role !== 'student'),
    },
    {
      id: 'attendance',
      titleBn: 'ডিজিটাল হাজিরা',
      titleEn: 'Daily Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      allowed: hasPermission('attendance.view') || role !== 'guardian',
    },
    {
      id: 'fees',
      titleBn: 'ফি ও বেতন আদায়',
      titleEn: 'Fees Collection',
      path: '/fees',
      icon: Receipt,
      allowed: role !== 'guardian' && role !== 'student',
    },
    {
      id: 'teachers',
      titleBn: 'উস্তায ও শিক্ষকবৃন্দ',
      titleEn: 'Teachers List',
      path: '/teachers',
      icon: UserCheck,
      allowed: hasPermission('teachers.view') || role !== 'guardian',
    },
    {
      id: 'exams',
      titleBn: 'পরীক্ষা ও ফলাফল',
      titleEn: 'Exams & Results',
      path: '/exams',
      icon: Award,
      allowed: true,
    },
    {
      id: 'boarding',
      titleBn: 'ছাত্রাবাস ও খাবার',
      titleEn: 'Hostel & Food',
      path: '/boarding',
      icon: Utensils,
      allowed: hasPermission('boarding.view') || (role !== 'guardian' && role !== 'student'),
    },
    {
      id: 'users',
      titleBn: 'ইউজার ও রোল',
      titleEn: 'User & Roles',
      path: '/users',
      icon: Users,
      allowed: isAdminOrPrincipal || role === 'teacher',
    },
    {
      id: 'live_tv',
      titleBn: 'টিভি হাজিরা মনিটর',
      titleEn: 'Live TV Monitor',
      path: '/live_tv',
      icon: Tv,
      allowed: role !== 'guardian',
    },
  ];

  const visibleCards = PRIMARY_2COL_CARDS.filter((item) => item.allowed);
  const visibleQuickActions = QUICK_ACTIONS.filter((action) => action.allowed);

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 pb-4">
      {/* 1. Executive Date & Live Clock Strip */}
      <section aria-label="Date and time summary" className="w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#04392c] via-[#064e3b] to-[#022c22] text-white px-3.5 py-3 sm:px-5 sm:py-3.5 shadow-sm border border-emerald-500/25">
          <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Live Tabular Clock & Gregorian Date */}
            <div className="flex flex-col items-start justify-center shrink-0">
              <span className="text-[13px] sm:text-base font-bold tabular-nums tracking-tight text-white whitespace-nowrap leading-tight">
                {formatLiveTime(currentTime)}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-100/80 font-medium tabular-nums whitespace-nowrap mt-0.5">
                {getWeekdayName(currentTime)}, {formatDigits(currentTime.toLocaleDateString('en-GB'))}
              </span>
            </div>

            {/* Center: Bangla & Hijri Dates */}
            <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-1 border-x border-white/10">
              <span className="text-[11px] sm:text-xs font-semibold text-white/95 truncate max-w-full">
                {getBanglaDate(currentTime, false)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-amber-300/95 truncate max-w-full mt-0.5">
                {getHijriDate(currentTime, false)}
              </span>
            </div>

            {/* Right: District Selector */}
            <div className="relative w-[92px] sm:w-[122px] shrink-0">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-300/90 pointer-events-none">
                <MapPin className="w-3 h-3" />
              </div>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                aria-label={isBn ? 'জেলা নির্বাচন করুন' : 'Select district'}
                className="w-full min-h-[36px] appearance-none bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] sm:text-xs font-semibold rounded-xl pl-6 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-colors cursor-pointer truncate"
              >
                {sortedDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id} className="text-slate-900 font-medium">
                    {isBn ? dist.nameBn : dist.nameEn}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-200/80 pointer-events-none">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Department Modules — Clean Icon-Free Premium Compact Cards */}
      <section className="space-y-2.5">
        <div className="flex items-baseline justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isBn ? 'প্রধান বিভাগ ও ব্যবস্থাপনা' : 'Departments & Portals'}
          </h2>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
            {isBn ? `${toBengaliNumber(visibleCards.length)}টি বিভাগ` : `${visibleCards.length} Modules`}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {visibleCards.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.path)}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/45 dark:hover:border-emerald-500/45 px-3.5 py-3.5 sm:px-4.5 sm:py-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_-8px_rgba(6,95,70,0.14)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-200 active:scale-[0.985] cursor-pointer flex flex-col justify-between min-h-[98px] sm:min-h-[112px]"
            >
              {/* Subtle top hairline accent */}
              <div
                className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${item.accentBar} opacity-75 group-hover:opacity-100 transition-opacity`}
              />

              {/* Eyebrow Metadata Row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${item.tagTone}`}>
                  {isBn ? item.tagBn : item.tagEn}
                </span>
                <span className="text-[10px] font-semibold tabular-nums text-slate-300 dark:text-slate-600 group-hover:text-emerald-600/70 dark:group-hover:text-emerald-400/70 transition-colors">
                  {isBn ? toBengaliNumber(String(idx + 1).padStart(2, '0')) : String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Clean Title & Full Unclipped Subtitle */}
              <div className="min-w-0">
                <h3 className="text-[13px] sm:text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {isBn ? item.titleBn : item.titleEn}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {isBn ? item.subtitleBn : item.subtitleEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Quick Administrative Console Shortcuts */}
      <section className="space-y-2.5 pt-0.5">
        <div className="flex items-baseline justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isBn ? 'অন্যান্য গুরুত্বপূর্ণ অপশন' : 'Core Operations'}
          </h2>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
            {isBn ? `${toBengaliNumber(visibleQuickActions.length)}টি শর্টকাট` : `${visibleQuickActions.length} Shortcuts`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {visibleQuickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.path)}
                className="group flex items-center justify-between gap-2 p-2.5 sm:p-3 min-h-[48px] rounded-xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/45 dark:hover:border-emerald-500/45 text-left shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:shadow-sm transition-all duration-150 active:scale-[0.985] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4 stroke-[1.9]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate transition-colors">
                    {isBn ? action.titleBn : action.titleEn}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 hidden sm:block transition-colors" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};


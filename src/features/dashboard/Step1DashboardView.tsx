import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  BookMarked,
  BookOpen,
  GraduationCap,
  Bot,
  Users,
  Smartphone,
  Heart,
  CalendarCheck,
  Receipt,
  UserCheck,
  Award,
  Tv,
  Utensils,
  Calendar,
  Sparkles,
  ArrowRight,
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
  const { user } = useAuth();
  const isBn = language === 'bn';

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

  // Calculate Bangla Date & Year (Bangladesh Bangla Academy Calendar)
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

    // Algorithmic fallback
    const day = date.getDate();
    const month = date.getMonth();
    let year = date.getFullYear();

    let m = month + 1;
    let y = year;
    if (m < 3) {
      y -= 1;
      m += 12;
    }

    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    let b1 = 0;
    if (jd > 2299160) {
      const a1 = Math.floor((jd - 1867216.25) / 36524.25);
      b1 = 1 + a1 - Math.floor(a1 / 4);
    }
    const bb = jd + b1 + 1524;
    const cc = Math.floor((bb - 122.1) / 365.25);
    const dd = Math.floor(365.25 * cc);
    const ee = Math.floor((bb - dd) / 30.6001);

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

  // Primary 5 Navigation Options from the Bottom Bar moved directly onto Home
  const PRIMARY_NAV_ITEMS = [
    {
      id: 'hifz',
      titleBn: 'হিফজুল কুরআন বিভাগ',
      titleEn: 'Hifz Department',
      subtitleBn: 'দৈনিক ছবক, সাত ছবক ও আমপারা মূল্যায়ন',
      subtitleEn: 'Daily Sabaq, Sabqi & Ampara tracker',
      path: '/hifz',
      icon: BookMarked,
      color: 'from-emerald-600 to-teal-700',
      badge: 'হিফজ',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'qawmi',
      titleBn: 'ক্বওমী নেসাব ও জামাত',
      titleEn: 'Qawmi Curriculum & Classes',
      subtitleBn: '১০টি পূর্ণ জামাত, বেফাক কিতাব ও পরীক্ষার কাঠামো',
      subtitleEn: '10 academic classes, Befaq syllabus & books',
      path: '/qawmi',
      icon: BookOpen,
      color: 'from-blue-600 to-indigo-700',
      badge: 'ক্বওমী',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      id: 'academic',
      titleBn: 'নূরানী ও প্রাক-প্রাথমিক',
      titleEn: 'Noorani & Primary Wing',
      subtitleBn: 'প্লে থেকে ৫ম শ্রেণী, ৩ সাময়িক পরীক্ষা ও সিলেবাস',
      subtitleEn: 'Play to Grade 5, term exams & board syllabus',
      path: '/academic',
      icon: GraduationCap,
      color: 'from-amber-600 to-orange-700',
      badge: 'নূরানী',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      id: 'automation',
      titleBn: 'স্মার্ট অটোমেশন সেন্টার',
      titleEn: 'Smart Automation Center',
      subtitleBn: 'স্বয়ংক্রিয় নোটিফিকেশন, বকেয়া ফি অ্যালার্ট ও মেসেজ',
      subtitleEn: 'Automated SMS, fee reminders & routine alerts',
      path: '/automation',
      icon: Bot,
      color: 'from-purple-600 to-indigo-800',
      badge: 'স্মার্ট',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      id: 'users',
      titleBn: 'ইউজার ও রোল ব্যবস্থাপনা',
      titleEn: 'User & Role Management',
      subtitleBn: 'মুহতামিম, শিক্ষক, হিসাবরক্ষক ও অভিভাবক প্রোফাইল',
      subtitleEn: 'Muhtamim, teachers, accountants & guardians',
      path: '/users',
      icon: Users,
      color: 'from-rose-600 to-pink-700',
      badge: 'ইউজার',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
  ];

  // Quick Action Administrative Shortcuts
  const QUICK_ACTIONS = [
    {
      id: 'attendance',
      titleBn: 'ডিজিটাল হাজিরা',
      titleEn: 'Daily Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      id: 'fees',
      titleBn: 'ফি ও বেতন আদায়',
      titleEn: 'Fees Collection',
      path: '/fees',
      icon: Receipt,
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    {
      id: 'teachers',
      titleBn: 'উস্তায ও শিক্ষকবৃন্দ',
      titleEn: 'Teachers List',
      path: '/teachers',
      icon: UserCheck,
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
    },
    {
      id: 'exams',
      titleBn: 'পরীক্ষা ও ফলাফল',
      titleEn: 'Exams & Results',
      path: '/exams',
      icon: Award,
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    },
    {
      id: 'boarding',
      titleBn: 'ছাত্রাবাস ও খাবার',
      titleEn: 'Hostel & Food',
      path: '/boarding',
      icon: Utensils,
      bgColor: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
    },
    {
      id: 'live_tv',
      titleBn: 'টিভি হাজিরা মনিটর',
      titleEn: 'Live TV Monitor',
      path: '/live_tv',
      icon: Tv,
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* 1. Header Banner: Live Time on Left, Dates in Center, District Selector on Right */}
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#004d3b] via-[#005743] to-[#00382b] text-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-md border-t-2 border-emerald-400">
          <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Left: Live Running Time Shape on Top, Weekday & Date Below */}
            <div className="flex flex-col items-start justify-center gap-0.5 shrink-0">
              <div className="px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-black/25 border border-white/20 shadow-inner flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-sm font-bold tabular-nums tracking-tight text-white whitespace-nowrap">
                  {formatLiveTime(currentTime)}
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] pl-1 tracking-tight flex items-center gap-1 whitespace-nowrap">
                <span className="font-bold text-white">{getWeekdayName(currentTime)},</span>
                <span className="text-emerald-200/90 font-medium">{formatDigits(currentTime.toLocaleDateString('en-GB'))}</span>
              </div>
            </div>

            {/* Center: তারিখ ও হিজরি সাল (নামাজের সময়সূচী লেখাটি ব্যবহারকারীর অনুরোধে বাদ দেওয়া হয়েছে) */}
            <div className="flex-1 flex flex-col items-center justify-center px-1 text-center min-w-0">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 text-[10px] sm:text-xs text-white font-bold leading-tight">
                <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10 whitespace-nowrap">
                  {getBanglaDate(currentTime, false)}
                </span>
                <span className="hidden sm:inline text-emerald-300">•</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-400/30 text-emerald-200 whitespace-nowrap">
                  {getHijriDate(currentTime, false)}
                </span>
              </div>
            </div>

            {/* Right: District Selector (Compact width) */}
            <div className="relative w-[85px] sm:w-[110px] shrink-0">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full appearance-none bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl pl-5 sm:pl-6 pr-5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all cursor-pointer backdrop-blur-xs truncate"
              >
                {sortedDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id} className="text-slate-900 font-medium">
                    {isBn ? dist.nameBn : dist.nameEn}
                  </option>
                ))}
              </select>
              <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-emerald-200 pointer-events-none">
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Options on Home (অ্যাপ ওপেন হলেই সরাসরি অপশনগুলো সামনে আসবে) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2 h-4 rounded bg-emerald-600 inline-block" />
            <span>{isBn ? 'প্রধান বিভাগ ও ব্যবস্থাপনা' : 'Main Departments & Modules'}</span>
          </h2>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {isBn ? 'সরাসরি প্রবেশ করুন' : 'Quick Access'}
          </span>
        </div>

        {/* 5 Primary Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 text-left shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {isBn ? item.titleBn : item.titleEn}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {isBn ? item.subtitleBn : item.subtitleEn}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>{isBn ? 'বিভাগে যান' : 'Open Section'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {/* Sub-Apps Card: সহকারী শিক্ষক অ্যাপ ও অভিভাবক অ্যাপ লিঙ্ক */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-3.5 sm:p-4 border border-emerald-800/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isBn ? 'স্পেশাল অ্যাপস' : 'Sub-Apps'}
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isBn ? 'শিক্ষক ও অভিভাবক পোর্টাল' : 'Teacher & Guardian Portals'}
              </h3>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                {isBn ? 'সহকারী শিক্ষক ও অভিভাবকদের জন্য পৃথক ইন্টারফেস' : 'Dedicated portals for staff & parents'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-emerald-800/60">
              <button
                onClick={() => onNavigate('/teacher-app')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isBn ? 'শিক্ষক অ্যাপ' : 'Teacher'}</span>
              </button>
              <button
                onClick={() => onNavigate('/guardian-app')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-blue-700/80 hover:bg-blue-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{isBn ? 'অভিভাবক' : 'Guardian'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Administrative Shortcuts Grid */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-3 rounded bg-amber-500 inline-block" />
            <span>{isBn ? 'প্রয়োজনীয় দ্রুত অ্যাকশন' : 'Quick Actions'}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.path)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer shadow-2xs ${action.bgColor}`}
              >
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900/80 shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold truncate">
                  {isBn ? action.titleBn : action.titleEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

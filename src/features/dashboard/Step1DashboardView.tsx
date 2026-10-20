import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  MapPin,
  ChevronDown,
  AlertTriangle,
  Star,
  Timer,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BD_DISTRICTS } from '../../data/districts';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';

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
  const isBn = language === 'bn';

  // Sort districts alphabetically based on language
  const sortedDistricts = [...BD_DISTRICTS].sort((a, b) => 
    isBn ? a.nameBn.localeCompare(b.nameBn) : a.nameEn.localeCompare(b.nameEn)
  );

  const [selectedDistrictId, setSelectedDistrictId] = useState('dhaka');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const selectedDistrict = BD_DISTRICTS.find(d => d.id === selectedDistrictId) || BD_DISTRICTS[0];

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate prayer times using Adhan
  const coordinates = new Coordinates(selectedDistrict.lat, selectedDistrict.lng);
  const params = CalculationMethod.Karachi(); // South Asia / Bangladesh
  params.madhab = Madhab.Hanafi; // Hanafi
  
  const prayerTimesObj = new PrayerTimes(coordinates, currentTime, params);

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

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? (isBn ? 'পিএম' : 'PM') : (isBn ? 'এএম' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
    
    const timeFormatted = `${hours}:${minutesStr}`;
    return `${isBn ? toBengaliNumber(timeFormatted) : timeFormatted} ${ampm}`;
  };

  // Islamic / Hijri Month Names in Bengali & English
  const HIJRI_MONTHS_BN = [
    'মহররম',
    'সফর',
    'রবিউল আউয়াল',
    'রবিউস সানি',
    'জমাদিউল আউয়াল',
    'জমাদিউস সানি',
    'রজব',
    'শাবান',
    'রমজান',
    'শাওয়াল',
    'জিলকদ',
    'জিলহজ'
  ];

  const HIJRI_MONTHS_EN = [
    'Muharram',
    'Safar',
    'Rabi al-Awwal',
    'Rabi al-Thani',
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    'Shaban',
    'Ramadan',
    'Shawwal',
    'Dhu al-Qadah',
    'Dhu al-Hijjah'
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

  // Calculate Hijri / Arabic Date & Year (Explicit Arabic Islamic months, no Gregorian fallback)
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
      // fallback to algorithmic computation below
    }

    // Algorithmic Umm al-Qura / Kuwaiti calculation
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
    const dDay = bb - dd - Math.floor(30.6001 * ee);

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

  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);

  // Fasting calculations:
  // Sehri start time: ~1 hr 15 mins before Subh Sadiq (standard Bangladesh / Islamic practice for beginning Sehri)
  const sehriStartTime = new Date(prayerTimesObj.fajr.getTime() - 75 * 60000);
  const sehriTime = new Date(prayerTimesObj.fajr.getTime() - 3 * 60000); // 3 mins safety margin before Fajr (Sehri ends)
  const iftarTime = prayerTimesObj.maghrib;

  const farzPrayers = [
    {
      id: 'fajr',
      key: 'fajr',
      nameBn: 'ফজর',
      nameEn: 'Fajr',
      timeObj: prayerTimesObj.fajr,
      endTimeObj: prayerTimesObj.sunrise,
      icon: Sunrise,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950/80',
    },
    {
      id: 'dhuhr',
      key: 'dhuhr',
      nameBn: 'যোহর',
      nameEn: 'Dhuhr',
      timeObj: prayerTimesObj.dhuhr,
      endTimeObj: prayerTimesObj.asr,
      icon: Sun,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-950/80',
    },
    {
      id: 'asr',
      key: 'asr',
      nameBn: 'আসর',
      nameEn: 'Asr',
      timeObj: prayerTimesObj.asr,
      endTimeObj: prayerTimesObj.maghrib,
      icon: Sunset,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950/80',
    },
    {
      id: 'maghrib',
      key: 'maghrib',
      nameBn: 'মাগরিব',
      nameEn: 'Maghrib',
      timeObj: prayerTimesObj.maghrib,
      endTimeObj: prayerTimesObj.isha,
      icon: Sunset,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-950/80',
    },
    {
      id: 'isha',
      key: 'isha',
      nameBn: 'এশা',
      nameEn: 'Isha',
      timeObj: prayerTimesObj.isha,
      endTimeObj: tomorrowPrayerTimes.fajr,
      icon: Moon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/80',
    }
  ];

  let nextPrayerKey = prayerTimesObj.nextPrayer();
  let nextPrayerTime = nextPrayerKey !== 'none' ? prayerTimesObj.timeForPrayer(nextPrayerKey) : null;
  let currentPrayerKey = prayerTimesObj.currentPrayer();

  if (nextPrayerKey === 'none') {
    nextPrayerKey = 'fajr';
    nextPrayerTime = tomorrowPrayerTimes.fajr;
  }

  if (currentPrayerKey === 'none') {
    currentPrayerKey = 'isha';
  }

  const getRemainingTimeStr = (targetDate: Date | null) => {
    if (!targetDate) return '';
    const diffMs = targetDate.getTime() - currentTime.getTime();
    if (diffMs <= 0) return '';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    let str = '';
    if (hours > 0) {
      str += `${formatDigits(hours)}${isBn ? 'ঘ ' : 'h '}`;
    }
    str += `${formatDigits(mins)}${isBn ? 'মি ' : 'm '}${formatDigits(secs)}${isBn ? 'সে' : 's'}`;
    
    return str;
  };

  // Fasting event state
  let nextFastingEvent = '';
  let nextFastingTime: Date | null = null;

  if (currentTime < sehriTime) {
    nextFastingEvent = 'sehri';
    nextFastingTime = sehriTime;
  } else if (currentTime < iftarTime) {
    nextFastingEvent = 'iftar';
    nextFastingTime = iftarTime;
  } else {
    nextFastingEvent = 'sehri';
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextFastingTime = new Date(tomorrowPrayerTimes.fajr.getTime() - 3 * 60000);
  }

  // Fasting & Solar Horizon Items (Exact same model as Farz prayer cards)
  const fastingAndSolarItems = [
    {
      id: 'sehri',
      nameBn: 'সেহরি',
      nameEn: 'Sehri',
      timeObj: sehriStartTime,
      endTimeObj: sehriTime,
      hasRange: true,
      icon: Moon,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-950/80',
      isNext: nextFastingEvent === 'sehri' && currentTime < sehriStartTime,
      isCurrent: currentTime >= sehriStartTime && currentTime < sehriTime,
      badgeText: isBn ? 'পরবর্তী' : 'Next',
      remaining: nextFastingEvent === 'sehri' && nextFastingTime ? getRemainingTimeStr(nextFastingTime) : '',
    },
    {
      id: 'iftar',
      nameBn: 'ইফতার শুরু',
      nameEn: 'Iftar Starts',
      timeObj: iftarTime,
      hasRange: false,
      icon: Sunset,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950/80',
      isNext: nextFastingEvent === 'iftar',
      isCurrent: false,
      badgeText: isBn ? 'পরবর্তী' : 'Next',
      remaining: nextFastingEvent === 'iftar' && nextFastingTime ? getRemainingTimeStr(nextFastingTime) : '',
    },
    {
      id: 'sunrise',
      nameBn: 'সূর্যোদয়',
      nameEn: 'Sunrise',
      timeObj: prayerTimesObj.sunrise,
      hasRange: false,
      icon: Sun,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950/80',
      isNext: false,
      isCurrent: false,
      badgeText: '',
      remaining: '',
    },
    {
      id: 'sunset',
      nameBn: 'সূর্যাস্ত',
      nameEn: 'Sunset',
      timeObj: prayerTimesObj.maghrib,
      hasRange: false,
      icon: Sunset,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-950/80',
      isNext: false,
      isCurrent: false,
      badgeText: '',
      remaining: '',
    },
  ];

  // Nafal & Sunnah Prayers
  const sunnahTimes = new SunnahTimes(prayerTimesObj);
  const tahajjudTime = sunnahTimes.lastThirdOfTheNight;
  const tahajjudEnd = prayerTimesObj.fajr;
  const ishraqTime = new Date(prayerTimesObj.sunrise.getTime() + 15 * 60000);
  const ishraqEnd = new Date(prayerTimesObj.dhuhr.getTime() - 15 * 60000);
  const awwabinTime = new Date(prayerTimesObj.maghrib.getTime() + 15 * 60000);
  const awwabinEnd = prayerTimesObj.isha;

  // Prohibited / Makruh Times
  const forbiddenSunriseStart = prayerTimesObj.sunrise;
  const forbiddenSunriseEnd = new Date(prayerTimesObj.sunrise.getTime() + 15 * 60000);
  
  const forbiddenZawalStart = new Date(prayerTimesObj.dhuhr.getTime() - 15 * 60000);
  const forbiddenZawalEnd = prayerTimesObj.dhuhr;
  
  const forbiddenSunsetStart = new Date(prayerTimesObj.maghrib.getTime() - 15 * 60000);
  const forbiddenSunsetEnd = prayerTimesObj.maghrib;

  const formatTimeRange = (start: Date, end: Date) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const nextPrayerObj = farzPrayers.find(p => p.key === nextPrayerKey);

  return (
    <div className="space-y-2 w-full max-w-full min-w-0">
      {/* 1. Header Banner (Live Time, Center Title & Compact District Selector) - Scrolls naturally with content */}
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#004d3b] via-[#005743] to-[#00382b] text-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-md border-t-2 border-emerald-400">
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

            {/* Center: উজ্জ্বল শেপে নামাজের সময়সূচী এবং তার নিচে বাংলা ও আরবি তারিখ সাল */}
            <div className="flex-1 flex flex-col items-center justify-center px-0.5 sm:px-1 text-center min-w-0">
              <div className="px-2.5 sm:px-3.5 py-0.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-400/30 via-emerald-300/40 to-teal-400/30 border border-emerald-300/80 shadow-[0_0_10px_rgba(110,231,183,0.45)] backdrop-blur-xs flex items-center justify-center">
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide drop-shadow-xs whitespace-nowrap leading-tight">
                  {isBn ? 'নামাজের সময়সূচী' : 'Prayer Times'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] text-emerald-100/90 font-medium mt-1 leading-none whitespace-nowrap">
                <span>{getBanglaDate(currentTime, false)}</span>
                <span className="text-emerald-400/80">•</span>
                <span>{getHijriDate(currentTime, false)}</span>
              </div>
            </div>

            {/* Right: District Selector (Compact width) */}
            <div className="relative w-[82px] sm:w-[110px] shrink-0">
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

      {/* 2. Five Obligatory Prayers (Farz) - 2 Columns (দুই ভাগে বিভক্ত) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <h2 className="text-xs font-bold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg sm:rounded-xl bg-sky-100/90 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-sky-950 dark:text-sky-100 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{isBn ? 'পাঁচ ওয়াক্ত ফরজ নামাজ' : 'Five Obligatory Prayers'}</span>
          </h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isBn ? 'হানাফী মাযহাব' : 'Hanafi'}
          </span>
        </div>

        {/* 2-Column Responsive Grid: Divided into two parts */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
          {farzPrayers.map((prayer) => {
            const isNext = prayer.key === nextPrayerKey;
            const isCurrent = prayer.key === currentPrayerKey;
            const prayerName = isBn ? prayer.nameBn : prayer.nameEn;
            const prayerTimeStr = formatTime(prayer.timeObj);
            const prayerEndTimeStr = formatTime(prayer.endTimeObj);
            const isIsha = prayer.key === 'isha';

            return (
              <div
                key={prayer.id}
                className={`flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-all duration-150 ${
                  isIsha ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
                } ${
                  isNext
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                    : isCurrent
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800 ring-1 ring-amber-400/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* 1. Left: Prayer Name & Badge */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {prayerName}
                  </span>
                  {isNext && (
                    <span className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs animate-pulse whitespace-nowrap">
                      {isBn ? 'পরবর্তী' : 'Next'}
                    </span>
                  )}
                  {isCurrent && !isNext && (
                    <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      {isBn ? 'বর্তমান' : 'Now'}
                    </span>
                  )}
                </div>

                {/* 2. Right: Start Time (Top) & End Time (Below) - Both exactly the same size */}
                <div className="shrink-0 text-right flex flex-col items-end justify-center pl-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap leading-tight">
                    {isBn ? 'শুরু ' : 'Start '}{prayerTimeStr}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap leading-tight mt-0.5">
                    {isBn ? 'শেষ ' : 'End '}{prayerEndTimeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Fasting & Solar Schedule - 2 Columns (দুই ভাগে বিভক্ত) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5 mt-1">
          <h2 className="text-xs font-bold inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg sm:rounded-xl bg-sky-100/90 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-sky-950 dark:text-sky-100 shadow-2xs">
            <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{isBn ? 'সেহরি, ইফতার ও সূর্যোদয়-সূর্যাস্ত' : 'Sehri, Iftar & Solar Schedule'}</span>
          </h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isBn ? 'দৈনিক সময়' : 'Daily Times'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
          {fastingAndSolarItems.map((item) => {
            const itemName = isBn ? item.nameBn : item.nameEn;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-xl border transition-all duration-150 min-h-[44px] sm:min-h-[48px] ${
                  item.isNext
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                    : item.isCurrent
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800 ring-1 ring-amber-400/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* 1. Left: Item Name & Badge */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {itemName}
                  </span>
                  {item.isNext && (
                    <span className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs animate-pulse whitespace-nowrap">
                      {item.badgeText}
                    </span>
                  )}
                  {item.isCurrent && !item.isNext && (
                    <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      {isBn ? 'চলমান' : 'Now'}
                    </span>
                  )}
                </div>

                {/* 2. Right: Start & End Time (like Prayer cards) or Single Time */}
                {item.hasRange && item.endTimeObj ? (
                  <div className="shrink-0 text-right flex flex-col items-end justify-center pl-1">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap leading-tight">
                      {isBn ? 'শুরু ' : 'Start '}{formatTime(item.timeObj)}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap leading-tight mt-0.5">
                      {isBn ? 'শেষ ' : 'End '}{formatTime(item.endTimeObj)}
                    </span>
                  </div>
                ) : (
                  <div className="shrink-0 text-right flex flex-col items-end justify-center pl-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap leading-tight">
                      {formatTime(item.timeObj)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Nafal Prayers & Prohibited Times - Both with Single-Line Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {/* Left: Nafal Prayers */}
        <div className="p-2 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60 dark:border-emerald-900/40 mb-1.5">
            <h3 className="text-xs font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-100/90 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-sky-950 dark:text-sky-100 shadow-2xs">
              <Star className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>{isBn ? 'নফল নামাজের সময়সূচী' : 'Optional (Nafal) Prayers'}</span>
            </h3>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold">
              {isBn ? 'মুস্তাহাব' : 'Mustahabb'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'তাহাজ্জুদ' : 'Tahajjud'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(tahajjudTime, tahajjudEnd)}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'ইশরাক' : 'Ishraq'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(ishraqTime, ishraqEnd)}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'আওয়াবিন' : 'Awwabin'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(awwabinTime, awwabinEnd)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Prohibited Times */}
        <div className="p-2 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between pb-1 border-b border-rose-200/60 dark:border-rose-900/40 mb-1.5">
            <h3 className="text-xs font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-100/90 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-sky-950 dark:text-sky-100 shadow-2xs">
              <AlertTriangle className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>{isBn ? 'নামাজের ৩টি নিষিদ্ধ সময়' : 'Prohibited Prayer Times'}</span>
            </h3>
            <span className="text-[9px] text-rose-700 dark:text-rose-400 font-semibold">
              {isBn ? 'নামাজ মাকরূহ' : 'Makruh'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300">
                {isBn ? 'সূর্যোদয়কাল' : 'Sunrise'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(forbiddenSunriseStart, forbiddenSunriseEnd)}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300">
                {isBn ? 'দ্বিপ্রহর (যাওয়াল)' : 'Midday (Zawal)'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(forbiddenZawalStart, forbiddenZawalEnd)}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300">
                {isBn ? 'সূর্যাস্তকাল' : 'Sunset'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatTimeRange(forbiddenSunsetStart, forbiddenSunsetEnd)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

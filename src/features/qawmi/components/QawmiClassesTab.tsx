import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Plus,
  Layers,
  Award,
  Clock,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  X,
  FileText,
  Bookmark,
  BookMarked,
  CheckCircle2,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Printer,
  Download,
  User,
  Library,
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
  Pencil,
  Check,
  Phone,
  ArrowLeft,
  UserPlus,
  MapPin,
  Filter,
  Calendar,
  Star,
  ThumbsUp,
  Heart,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  QawmiBranch,
  KitabDetail,
  QawmiClassItem,
  QawmiStudentItem,
} from '../types/qawmi';
import {
  INITIAL_MOHILA_QAWMI_CLASSES,
  SAMPLE_MOHILA_STUDENT_NAMES,
} from '../data/mohilaQawmiData';

export type { QawmiBranch, KitabDetail, QawmiClassItem, QawmiStudentItem };

// 10 Distinct Strict Sequential Classes with authentic books & detailed syllabus
export const INITIAL_QAWMI_CLASSES: QawmiClassItem[] = [
  {
    id: 'qawmi-1',
    order: 1,
    levelBn: '১ম স্তর (বুনিয়াদ)',
    nameBn: 'ইবতিদাইয়্যাহ (তাইসির ও উর্দু-ফারসি জামাত)',
    nameAr: 'المرحلة الابتدائية (تيسير المبتدي والأردية)',
    marhalaBn: 'ইবতিদাইয়্যাহ (বেফাকুল মাদারিস)',
    govEquivalentBn: 'প্রাথমিক সমাপনী (৫ম শ্রেণী সমমান)',
    studentCount: 50,
    totalKitabs: 6,
    headTeacherBn: 'মাওলানা জহিরুল ইসলাম',
    kitabs: [
      {
        nameBn: 'তাইসিরুল মুবতাদী',
        nameAr: 'تيسير المبتدي',
        subject: 'মৌলিক সরফ',
        authorBn: 'মাওলানা আশরাফ আলী থানভী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'ছহীহ, মুযাফ, মেছাল, আজওয়াফ, নাক্বেছ ও লফীফ এর পরিচয় ও সীগাহ চেনার মৌলিক কায়দা।',
        firstTermSyllabusBn: 'প্রথম থেকে বাবে নাসারা ও জরবা এর ছরফ-সংজ্ঞা ও ছগীর-কবীর অনুশীলন।',
        secondTermSyllabusBn: 'মুতাআদ্দি ও লাযিম এবং মুযাফ-মাহমূজের রূপান্তর।',
        finalTermSyllabusBn: 'আজওয়াফ, নাকেস ও লফীফের সম্পূর্ণ অধ্যায় ও বার্ষিক পুনরাবৃত্তি।',
      },
      {
        nameBn: 'কারিমা ও আমাদনামা',
        nameAr: 'نام حق وكريما سعدي',
        subject: 'ফারসি ছন্দ ও ক্রিয়াপদ',
        authorBn: 'শেখ সাদী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ফারসি ক্রিয়া মূল রূপান্তর (আমাদান, বুর্দান, গুফতান) ও শেখ সাদীর নীতিবাক্য মুখস্থ।',
        firstTermSyllabusBn: 'আমাদনামার ২০টি মাজদার ও কারিমার প্রথম ১০টি কবিতা।',
        secondTermSyllabusBn: 'আমাদনামার পরবর্তী ৩০টি মাজদার ও কারিমার দ্বিতীয় খণ্ড।',
        finalTermSyllabusBn: 'সম্পূর্ণ আমাদনামা ও কারিমার সকল বয়েত এবং অর্থসহ ব্যাকরণ।',
      },
      {
        nameBn: 'উর্দু কা কায়দা ও পহলি কিতাব',
        nameAr: 'قاعدة أردية والكتاب الأول',
        subject: 'উর্দু ভাষা শিক্ষা',
        authorBn: 'মৌলভী মুহাম্মদ ইসমাইল',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'উর্দু হরফ জোড়া, বাক্য পাঠ, ছোট ছোট দ্বীনি গল্প ও প্রশ্নোত্তরের রিডিং।',
        firstTermSyllabusBn: 'উর্দু কায়দার সম্পূর্ণ হরফ ও দুই/তিন অক্ষরের শব্দ গঠন।',
        secondTermSyllabusBn: 'পহলি কিতাবের পাঠ ১ থেকে ১৫ পর্যন্ত এবং শ্রুতিলেখন।',
        finalTermSyllabusBn: 'পহলি কিতাবের শেষ পাঠসমূহ এবং সহজ উর্দু রচনা।',
      },
      {
        nameBn: 'তালিমুল ইসলাম (১ম ও ২য় খণ্ড)',
        nameAr: 'تعليم الإسلام ١ و ٢',
        subject: 'ইসলামিয়াত ও আকাইদ',
        authorBn: 'মুফতি কিফায়াতুল্লাহ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 4,
        syllabusScopeBn: 'ঈমানিয়াত, অজু, গোসল, আযান ও নামাজের ফরয-ওয়াজিব মাসায়েল।',
        firstTermSyllabusBn: 'তালিমুল ইসলাম ১ম খণ্ড সম্পূর্ণ (ঈমান ও ইসলামের ৫ স্তম্ভ)।',
        secondTermSyllabusBn: 'তালিমুল ইসলাম ২য় খণ্ডের অর্ধেকাংশ (পাক-নাপাক ও নামাজের শর্ত)।',
        finalTermSyllabusBn: 'তালিমুল ইসলাম ২য় খণ্ড সমাপ্তি ও নামাজের আরকান-আহকাম।',
      },
      {
        nameBn: 'বাংলা, ইংরেজি ও সাধারণ গণিত',
        nameAr: 'اللغة البنغالية والرياضيات',
        subject: 'সাধারণ বুনিয়াদ',
        authorBn: 'প্রাথমিক বোর্ড সিলেবাস',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'মাতৃভাষা বাংলা ব্যাকরণ, ইংরেজি বর্ণ ও মৌলিক চার নিয়মের হিসাব (যোগ, বিয়োগ, গুণ, ভাগ)।',
        firstTermSyllabusBn: 'বাংলা গদ্য-পদ্য পাঠ ও ইংরেজি আলফাবেট ওয়ার্ড বুক।',
        secondTermSyllabusBn: 'গণিতের গুণ-ভাগ ও সহজ জ্যামিতি চিত্র।',
        finalTermSyllabusBn: 'বার্ষিক সামষ্টিক সাধারণ মূল্যায়ন পরীক্ষা।',
      },
      {
        nameBn: 'হিফজে সুরা ও মাসনুন দুআ',
        nameAr: 'حفظ السور والأدعية',
        subject: 'আমল ও আদব',
        authorBn: 'মাসনুন দুআ সংকলন',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'সূরা ফাতেহা সহ শেষ ১০টি সূরা মাখরাজ অনুযায়ী হিফজ ও দৈনন্দিন মাসনুন দুআ।',
        firstTermSyllabusBn: 'সুরা ফীল থেকে নাস পর্যন্ত ও ঘুমানো/খাওয়ার দুআ।',
        secondTermSyllabusBn: 'সুরা যিলযাল থেকে হুমাজাহ পর্যন্ত ও অজু/মসজিদের দুআ।',
        finalTermSyllabusBn: 'পূর্ণাঙ্গ নামাজ বিশুদ্ধভাবে আদায় ও মুখস্থ পরীক্ষা।',
      },
    ],
    descriptionBn: 'ক্বওমী নেসাবের প্রবেশদ্বার ও প্রথম জামাত। শিশু ও কিশোর ছাত্রদের দ্বীনি ও সাধারণ শিক্ষার সমন্বিত পাঠক্রম।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-emerald-950 via-green-950 to-slate-900',
      border: 'border-green-500/50 hover:border-green-400',
      badgeBg: 'bg-green-500/20 border border-green-500/40',
      badgeText: 'text-green-300',
      accentText: 'text-green-400',
      glow: 'shadow-green-950/60',
      iconBg: 'bg-green-600/30 text-green-300 border border-green-500/40',
      stripColor: 'bg-green-500',
    },
    tag: 'ibtidaiya',
  },
  {
    id: 'qawmi-2',
    order: 2,
    levelBn: '২য় স্তর (মুতাওয়াসসিতাহ ১ম)',
    nameBn: 'মুতাওয়াসসিতাহ ১ম বর্ষ (মিজান ও মুনশাইব জামাত)',
    nameAr: 'المتوسطة - السنة الأولى (ميزان الصرف ومنشعب)',
    marhalaBn: 'মুতাওয়াসসিতাহ (বেফাকুল মাদারিস)',
    govEquivalentBn: 'নিম্ন মাধ্যমিক (৬ষ্ঠ ও ৭ম শ্রেণী সমমান)',
    studentCount: 46,
    totalKitabs: 5,
    headTeacherBn: 'মাওলানা মাহমুদুল হাসান',
    kitabs: [
      {
        nameBn: 'মিজানুস সরফ ও মুনশাইব',
        nameAr: 'ميزان الصرف ومنشعب',
        subject: 'মৌলিক সরফ রূপান্তর',
        authorBn: 'সিরাজুদ্দিন আলী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'সুলাসী মুজাররাদ ও মাযীদের বাবাসমূহ, সিগাহ নির্ধারণ ও তাহকীক।',
        firstTermSyllabusBn: 'মিজানুস সরফের ছগীর ও কবীর রূপান্তর সম্পূর্ণ।',
        secondTermSyllabusBn: 'মুনশাইবের সুলাসী মুজাররাদের ৬টি বাব বিস্তারিত।',
        finalTermSyllabusBn: 'সুলাসী মাযীদ ফীহ এর সকল বাব ও পরীক্ষার পূর্ণাঙ্গ তামরীন।',
      },
      {
        nameBn: 'পাঞ্জেগাঞ্জ',
        nameAr: 'پنج گنج',
        subject: 'সরফ শাস্ত্র',
        authorBn: 'উস্তাদানে নেসাব',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'শব্দ গঠনের ৫টি মৌলিক অধ্যায়—ইসমে তাফযীল, যরফ, আলা ও মুবালাগাহ।',
        firstTermSyllabusBn: '১ম ও ২য় বাব (সুলাসী ও রুবায়ী বিশ্লেষণ)।',
        secondTermSyllabusBn: '৩য় ও ৪র্থ বাব (তালীল ও তাখফীফের কায়দাসমূহ)।',
        finalTermSyllabusBn: '৫ম বাব এবং সকল কায়েদার সমন্বিত দরস।',
      },
      {
        nameBn: 'ফারসি কি পহলি ও দুসরি কিতাব',
        nameAr: 'فارسي كي پہلی ودوسري',
        subject: 'ফারসি সাহিত্য ও নীতিবাক্য',
        authorBn: 'মৌলভী মুহাম্মদ ইসমাইল (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 4,
        syllabusScopeBn: 'ফারসি ব্যাকরণ, তারকীব ও সাহিত্যিক গল্পের বাংলা অনুবাদ।',
        firstTermSyllabusBn: 'ফারসি কি পহলি কিতাব সম্পূর্ণ অনুবাদ।',
        secondTermSyllabusBn: 'ফারসি কি দুসরি কিতাবের প্রথমাংশ।',
        finalTermSyllabusBn: 'ফারসি কি দুসরি কিতাব সমাপনী ও গল্প পর্যালোচনা।',
      },
      {
        nameBn: 'তালিমুল ইসলাম (৩য় ও ৪র্থ খণ্ড)',
        nameAr: 'تعليم الإسلام ٣ و ٤',
        subject: 'আকাইদ ও মাসায়েল',
        authorBn: 'মুফতি কিফায়াতুল্লাহ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'যাকাত, রোজা, হজ্ব, কুরবানি ও আকীদার গভীর মাসায়েল।',
        firstTermSyllabusBn: '৩য় খণ্ড সম্পূর্ণ (রোজা ও যাকাত অধ্যায়)।',
        secondTermSyllabusBn: '৪র্থ খণ্ডের হজ্ব ও কুরবানি অধ্যায়।',
        finalTermSyllabusBn: 'মুয়ামালাত ও লেনদেনের প্রাথমিক মাসায়েল।',
      },
      {
        nameBn: 'তাজভীদুল কুরআন ও মশক',
        nameAr: 'تجويد القرآن والمشق',
        subject: 'কুরআন তিলাওয়াত',
        authorBn: 'ক্বারী তাজাম্মুল আলী',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'মাখরাজ, সিফাতে লাযিমাহ ও আরিযাহ এবং তাজবীদের ব্যবহারিক মশক।',
        firstTermSyllabusBn: '১৭টি মাখরাজের স্থান ও হরফ উচ্চারণ অনুশীলন।',
        secondTermSyllabusBn: 'সিফাতে মুতাযাদ্দাহ ও গায়রে মুতাযাদ্দাহ।',
        finalTermSyllabusBn: 'আমপারা সম্পূর্ণ তাজবীদ সহ মশকের পরীক্ষা।',
      },
    ],
    descriptionBn: 'আরবি শব্দের সিগাহ ও বাবে রূপান্তরের কৌশল এবং ফারসি ও নৈতিক শিক্ষার মজবুত বুনিয়াদি জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950',
      border: 'border-teal-500/50 hover:border-teal-400',
      badgeBg: 'bg-teal-500/20 border border-teal-500/40',
      badgeText: 'text-teal-300',
      accentText: 'text-teal-400',
      glow: 'shadow-teal-950/60',
      iconBg: 'bg-teal-600/30 text-teal-300 border border-teal-500/40',
      stripColor: 'bg-teal-500',
    },
    tag: 'mutawassita',
  },
  {
    id: 'qawmi-3',
    order: 3,
    levelBn: '৩য় স্তর (মুতাওয়াসসিতাহ ২য়)',
    nameBn: 'মুতাওয়াসসিতাহ ২য় বর্ষ (নাহবেমীর জামাত)',
    nameAr: 'المتوسطة - السنة الثانية (نحو مير)',
    marhalaBn: 'মুতাওয়াসসিতাহ (বেফাকুল মাদারিস)',
    govEquivalentBn: 'নিম্ন মাধ্যমিক সমাপনী (৮ম শ্রেণী / JSC সমমান)',
    studentCount: 42,
    totalKitabs: 5,
    headTeacherBn: 'মাওলানা সাজিদুর রহমান',
    kitabs: [
      {
        nameBn: 'নাহবেমীর',
        nameAr: 'نحو مير',
        subject: 'মৌলিক নাহু',
        authorBn: 'মীর সাইয়্যেদ শরীফ জুরজানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'কালেমা, কালাম, ইসম, ফেল, হরফের পরিচয় ও ৬০টি আমেল এর বিস্তারিত বিশ্লেষণ।',
        firstTermSyllabusBn: 'মুক্বাদ্দামাহ থেকে আসমায়ে মুরাবা এর প্রকারভেদ পর্যন্ত।',
        secondTermSyllabusBn: 'আমেল, মামুল ও এরাবের সমস্ত নিয়মাবলী।',
        finalTermSyllabusBn: 'আফয়ালে কুলুব ও জুমলা তারকীব তামরীন।',
      },
      {
        nameBn: 'নূরুল ঈযাহ',
        nameAr: 'نور الإيضاح',
        subject: 'ইবাদত ফিকহ',
        authorBn: 'হাসান শুরুনবুলালী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'কিতাবুত তাহারাত, কিতাবুছ সালাত ও কিতাবুছ সাওম এর প্রামাণ্য হানাফী ফিকহ।',
        firstTermSyllabusBn: 'অজু, গোসল, তায়াম্মুম, নাপাক দূর করার অধ্যায়।',
        secondTermSyllabusBn: 'নামাজের ওয়াজিবাত, সাহু সেজদা ও জানাজা নামাজ।',
        finalTermSyllabusBn: 'রোজার ফিকহ ও এতেকাফের আহকাম।',
      },
      {
        nameBn: 'ইলমুস সীগাহ',
        nameAr: 'علم الصيغة',
        subject: 'উচ্চতর সরফ',
        authorBn: 'মুফতি এনায়েত আহমদ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'তালীল ও ইদগামের নিয়মাবলী, কুরানের কঠিন সিগাহ তাহকীক।',
        firstTermSyllabusBn: 'তালীল এর কায়দা ১ হতে ১৫ পর্যন্ত।',
        secondTermSyllabusBn: 'তালীল এর কায়দা ১৬ হতে ৩০ এবং ইদগামের নিয়ম।',
        finalTermSyllabusBn: 'কুরআনী সীগাহ বের করার তামরীন পরীক্ষা।',
      },
      {
        nameBn: 'আত-তরিক ইলাল আরাবিয়্যাহ (১ম ও ২য় খণ্ড)',
        nameAr: 'الطريق إلى العربية',
        subject: 'আরবি কথোপকথন',
        authorBn: 'মাওলানা আবু তাহের মিসবাহ',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'দৈনন্দিন আরবি বাক্য গঠন, আরবি প্রশ্ন-উত্তর ও মুক্ত হস্ত লিখন।',
        firstTermSyllabusBn: '১ম খণ্ড সম্পূর্ণ (ইসমুল ইশারা ও মৌলিক বাক্য)।',
        secondTermSyllabusBn: '২য় খণ্ডের পাঠ ১ হতে ১২ পর্যন্ত।',
        finalTermSyllabusBn: '২য় খণ্ড সমাপ্তি ও আরবি মৌখিক ভাইভা।',
      },
      {
        nameBn: 'তরজমায়ে কুরআনুল কারীম (আমপারা)',
        nameAr: 'ترجمة جزء عم',
        subject: 'কুরআন তরজমা',
        authorBn: 'দারসে কুরআন',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'আমপারার প্রতিটি সূরার শব্দার্থ, সরল তরজমা ও শানে নুযুল।',
        firstTermSyllabusBn: 'সুরা নাবা থেকে তারিক্ব পর্যন্ত তরজমা।',
        secondTermSyllabusBn: 'সুরা আলা থেকে বায়্যিনাহ পর্যন্ত তরজমা।',
        finalTermSyllabusBn: 'সুরা যিলযাল থেকে নাস পর্যন্ত তরজমা।',
      },
    ],
    descriptionBn: 'আরবি ভাষায় বাক্য তৈরি, ইবাদতের জরুরি আহকাম ও সরাসরি কুরআনের তরজমা অনুশীলনের জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-amber-950 via-stone-900 to-yellow-950',
      border: 'border-amber-500/50 hover:border-amber-400',
      badgeBg: 'bg-amber-500/20 border border-amber-500/40',
      badgeText: 'text-amber-300',
      accentText: 'text-amber-400',
      glow: 'shadow-amber-950/60',
      iconBg: 'bg-amber-600/30 text-amber-300 border border-amber-500/40',
      stripColor: 'bg-amber-500',
    },
    tag: 'mutawassita',
  },
  {
    id: 'qawmi-4',
    order: 4,
    levelBn: '৪র্থ স্তর (সানাবিয়া আম্মাহ)',
    nameBn: 'সানাবিয়া আম্মাহ (হেদায়াতুন্নাহু ও কাফিয়া জামাত)',
    nameAr: 'الثانوية العامة (هداية النحو والكافية)',
    marhalaBn: 'সানাবিয়া আম্মাহ (বেফাকুল মাদারিস)',
    govEquivalentBn: 'মাধ্যমিক (দাখিল / SSC সমমান)',
    studentCount: 40,
    totalKitabs: 6,
    headTeacherBn: 'মাওলানা তোফাজ্জল হক',
    kitabs: [
      {
        nameBn: 'হেদায়াতুন্নাহু',
        nameAr: 'هداية النحو',
        subject: 'ইলমুন নাহু',
        authorBn: 'সিরাজুদ্দিন উসমান (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'ইসম, ফেল, হরফের পূর্ণাঙ্গ বিশ্লেষণ, মারফুআত, মানসুবাত ও মাজরুরাত।',
        firstTermSyllabusBn: 'প্রারম্ভ হতে মারফুআতের ৮টি প্রকার সমাপ্তি।',
        secondTermSyllabusBn: 'মানসুবাত এর ১২টি প্রকার ও মাজরুরাত।',
        finalTermSyllabusBn: 'আফয়ালে মুকারাবাহ, মাবনিয়্যাত ও হরফের বহস।',
      },
      {
        nameBn: 'আল-কাফিয়া ফিন নাহু',
        nameAr: 'الكافية في النحو',
        subject: 'নাহু ব্যাকরণ',
        authorBn: 'আল্লামা ইবনুল হাজিব (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ইলমুন নাহুর ক্লাসিক্যাল টেক্সট ও জটিল ব্যাকরণিক সমস্যা সমাধান।',
        firstTermSyllabusBn: 'মুক্বাদ্দামাহ হতে গাইরে মুনসারিফের আলোচনা।',
        secondTermSyllabusBn: 'মারফুআত ও মানসুবাতের গভীর বিশ্লেষণ।',
        finalTermSyllabusBn: 'সম্পূর্ণ কিতাবের সারসংক্ষেপ ও তামরীনাত।',
      },
      {
        nameBn: 'মুখতাসারুল কুদূরী',
        nameAr: 'مختصر القدوري',
        subject: 'মৌলিক ফিকহ',
        authorBn: 'ইমাম আবুল হাসান কুদূরী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'তাহানাত, সালাত, সাওম, যাকাত, হজ্ব ও ক্রয়-বিক্রয় (বুয়ূ) এর মূল মাসায়েল।',
        firstTermSyllabusBn: 'তাহানাত ও সালাত পর্ব সমাপ্তি।',
        secondTermSyllabusBn: 'সাওম, যাকাত ও হজ্জ পর্ব।',
        finalTermSyllabusBn: 'কিতাবুল বুয়ূ (বেচাকেনার বিধিমালা)।',
      },
      {
        nameBn: 'রওজাতুল আদব',
        nameAr: 'روضة الأدب',
        subject: 'আরবি সাহিত্য ও গদ্য',
        authorBn: 'মাওলানা ইজাজ আলী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ধ্রুপদী আরবি উপদেশমালা, শায়ের ও সাহিত্যের তরজমা ও তাহকীক।',
        firstTermSyllabusBn: '১ম থেকে ১০ম রওজা পর্যন্ত আরবি পাঠ ও অর্থ।',
        secondTermSyllabusBn: '১১শ থেকে ২০তম রওজা পর্যন্ত পাঠ।',
        finalTermSyllabusBn: '২১তম থেকে সমাপ্তি পর্যন্ত সাহিত্য চর্চা।',
      },
      {
        nameBn: 'শরহে তাহযীব',
        nameAr: 'شرح التهذيب',
        subject: 'ইলমুল মানতিক (যুক্তিবিদ্যা)',
        authorBn: 'আল্লামা তাফতাযানী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'তাসাওয়ুর ও তাসদীক, দিল্যালাত, কুল্লিয়্যাতে খামসাহ ও কিয়াস।',
        firstTermSyllabusBn: 'তাসাওয়ুর, তাসদীক ও দিল্যালাত এর প্রকারভেদ।',
        secondTermSyllabusBn: 'কুল্লিয়্যাতে খামসাহ ও তারিফাত।',
        finalTermSyllabusBn: 'কদিয়াহ ও কিয়াসের বিভিন্ন রূপ।',
      },
      {
        nameBn: 'আল-ফিকহুল মুয়াসসার',
        nameAr: 'الفقه الميسر',
        subject: 'দৈনন্দিন মাসায়েল',
        authorBn: 'শফিকুর রহমান নদভী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'আধুনিক প্রেক্ষাপটে হানাফী ফিকহের সহজ ও ব্যবহারিক উপস্থাপনা।',
        firstTermSyllabusBn: 'ইবাদত অংশের আধুনিক মাসায়েল।',
        secondTermSyllabusBn: 'মুয়ামালাত ও পারিবারিক আইন।',
        finalTermSyllabusBn: 'সমকালীন সাধারণ সমস্যার শরয়ী সমাধান।',
      },
    ],
    descriptionBn: 'আরবি ভাষার পূর্ণাঙ্গ গঠনরীতি, ইয়ারাব, তারকীব ও মৌলিক ফিকহের প্রধান বুনিয়াদি জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950',
      border: 'border-rose-500/50 hover:border-rose-400',
      badgeBg: 'bg-rose-500/20 border border-rose-500/40',
      badgeText: 'text-rose-300',
      accentText: 'text-rose-400',
      glow: 'shadow-rose-950/60',
      iconBg: 'bg-rose-600/30 text-rose-300 border border-rose-500/40',
      stripColor: 'bg-rose-500',
    },
    tag: 'sanabia',
  },
  {
    id: 'qawmi-5',
    order: 5,
    levelBn: '৫ম স্তর (সানাবিয়া উলইয়া)',
    nameBn: 'সানাবিয়া উলইয়া (শরহে বেকায়া জামাত)',
    nameAr: 'الثانوية العليا (شرح الوقاية)',
    marhalaBn: 'সানাবিয়া উলইয়া (বেফাকুল মাদারিস)',
    govEquivalentBn: 'উচ্চ মাধ্যমিক (আলিম / HSC সমমান)',
    studentCount: 38,
    totalKitabs: 6,
    headTeacherBn: 'মাওলানা আব্দুল ওয়াদুদ',
    kitabs: [
      {
        nameBn: 'শরহুল বেকায়া (১ম ও ২য় খণ্ড)',
        nameAr: 'شرح الوقاية',
        subject: 'ফিকহ শাস্ত্র',
        authorBn: 'উবায়দুল্লাহ ইবনে মাসউদ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'ফিকহের দলিল সহ আলোচনা—তাহারাত, সালাত, নিকাহ, তালাক ও কাসাস।',
        firstTermSyllabusBn: '১ম খণ্ড: কিতাবুত তাহারাত ও কিতাবুছ সালাত।',
        secondTermSyllabusBn: '১ম খণ্ড: কিতাবুছ সাওম, যাকাত ও হজ্ব।',
        finalTermSyllabusBn: '২য় খণ্ড: কিতাবুন নিকাহ ও তালাক অধ্যায়।',
      },
      {
        nameBn: 'শরহে জামী (আল-ফাওয়াইদুল যিয়াইয়্যাহ)',
        nameAr: 'شرح الجامي',
        subject: 'ইলমুন নাহু',
        authorBn: 'আল্লামা আব্দুর রহমান জামী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'কাফিয়ার সর্বোত্তম ব্যাখ্যাগ্রন্থ। ব্যাকরণিক ইবারত তাহকীক।',
        firstTermSyllabusBn: 'মুক্বাদ্দামাহ থেকে গাইরে মুনসারিফ।',
        secondTermSyllabusBn: 'মারফুআত ও মানসুবাতের গভীর তর্ক।',
        finalTermSyllabusBn: 'সম্পূর্ণ ব্যাকরণ তামরীনাত।',
      },
      {
        nameBn: 'মুখতাসারুল মাআনী',
        nameAr: 'مختصر المعاني',
        subject: 'ইলমুল বালাগাত (অলঙ্কার)',
        authorBn: 'আল্লামা সাআদুদ্দিন তাফতাযানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ইলমুল মাআনী, ইলমুল বায়ান ও ইলমুল বাদী এর গভীর অলঙ্কারবিদ্যা।',
        firstTermSyllabusBn: 'ইলমুল মাআনীর ফাসাহাত ও বালাগাত এবং মুসনাদ ইলাইহ।',
        secondTermSyllabusBn: 'কসর, ইনশা, ফাসল ও ওয়াসল।',
        finalTermSyllabusBn: 'ইলমুল বয়ান—তাশবীহ, ইস্তিয়ারা ও কিনায়া।',
      },
      {
        nameBn: 'নূরুল আনওয়ার',
        nameAr: 'نور الأنوار',
        subject: 'উসুলে ফিকহ',
        authorBn: 'মোল্লা জীওয়ান (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'উসুলুল ফিকহের বুনিয়াদি টেক্সট মানার এর ব্যাখ্যা। খাস, আম, মুশতShared ও মুআউওয়াল।',
        firstTermSyllabusBn: 'খাস ও আমের বহস এবং হুকুম।',
        secondTermSyllabusBn: 'মুশতShared ও মুআউওয়াল এবং অমর-নাহীর আহকাম।',
        finalTermSyllabusBn: 'কিতাবুল্লাহ ও সুন্নাহ এর প্রামাণিকতা।',
      },
      {
        nameBn: 'মাকামাতে হারিরী',
        nameAr: 'مقامات الحريري',
        subject: 'উচ্চতর আরবি সাহিত্য',
        authorBn: 'আল্লামা কাসেম হারিরী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'ধ্রুপদী আরবি ভাষার অলঙ্কারপূর্ণ গল্পগাথা ও কাব্য।',
        firstTermSyllabusBn: '১ম থেকে ৫ম মাকামাহ।',
        secondTermSyllabusBn: '৬ষ্ঠ থেকে ১০ম মাকামাহ।',
        finalTermSyllabusBn: '১১শ থেকে ১৫শ মাকামাহ পর্যালোচনা।',
      },
      {
        nameBn: 'উসুলুশ শাশী',
        nameAr: 'أصول الشاشي',
        subject: 'উসুলে তাশরী',
        authorBn: 'ইমাম শাশী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'ইজমা, কিয়াস ও দলিলাদির ব্যবহারিক উসুল।',
        firstTermSyllabusBn: 'উসুলে আরবায়ার প্রাথমিক মূলনীতি।',
        secondTermSyllabusBn: 'ইজমা ও কিয়াসের শর্তাবলী।',
        finalTermSyllabusBn: 'শাশী সমাপ্তি ও পরীক্ষা।',
      },
    ],
    descriptionBn: 'আরবি ব্যাকরণ ও সাহিত্যের জটিল গ্রন্থাবলী এবং ফিকহ ও উসুলে ফিকহের বুৎপত্তি অর্জনের জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-fuchsia-950',
      border: 'border-purple-500/50 hover:border-purple-400',
      badgeBg: 'bg-purple-500/20 border border-purple-500/40',
      badgeText: 'text-purple-300',
      accentText: 'text-purple-400',
      glow: 'shadow-purple-950/60',
      iconBg: 'bg-purple-600/30 text-purple-300 border border-purple-500/40',
      stripColor: 'bg-purple-500',
    },
    tag: 'sanabia',
  },
  {
    id: 'qawmi-6',
    order: 6,
    levelBn: '৬ষ্ঠ স্তর (ফজিলত ১ম)',
    nameBn: 'ফজিলত ১ম বর্ষ (জালালাইন জামাত)',
    nameAr: 'الفضيلة - السنة الأولى (تفسير الجلالين)',
    marhalaBn: 'ফজিলত (বেফাকুল মাদারিস)',
    govEquivalentBn: 'স্নাতক / ফাজিল ১ম বর্ষ সমমান',
    studentCount: 35,
    totalKitabs: 5,
    headTeacherBn: 'মাওলানা মুকাররম হোসাইন',
    kitabs: [
      {
        nameBn: 'তাফসিরে জালালাইন (১ম ও ২য় খণ্ড)',
        nameAr: 'تفسير الجلالين',
        subject: 'তাফসীরুল কুরআন',
        authorBn: 'জালালুদ্দিন মহল্লী ও সুয়ূতী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'পূর্ণ ৩০ পারা কুরআনের সংক্ষিপ্ত অথচ প্রামাণ্য বিশ্লেষণ ও শানে নুযুল।',
        firstTermSyllabusBn: '১ম পারা হতে ১০ম পারা পর্যন্ত বিস্তারিত তাফসীর।',
        secondTermSyllabusBn: '১১শ পারা হতে ২০তম পারা পর্যন্ত তাফসীর।',
        finalTermSyllabusBn: '২১তম পারা হতে ৩০তম পারা পর্যন্ত তাফসীর সমাপনী।',
      },
      {
        nameBn: 'আল-হিদায়া (১ম ও ২য় খণ্ড)',
        nameAr: 'الهداية - الجزء ١ و ٢',
        subject: 'ফিকহুল হানাফী',
        authorBn: 'আল্লামা মারগিনানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'হানাফী ফিকহের শীর্ষ প্রামাণ্য দলীলগ্রন্থ। ইবাদত, নিকাহ, তালাক ও বুয়ূ।',
        firstTermSyllabusBn: '১ম খণ্ড: তাহারাত ও সালাত পর্ব।',
        secondTermSyllabusBn: '১ম খণ্ড: সাওম, যাকাত ও হজ্ব।',
        finalTermSyllabusBn: '২য় খণ্ড: কিতাবুন নিকাহ, তালাক ও বুয়ূ।',
      },
      {
        nameBn: 'আত-তাওযীহ ওয়াত তালবীহ',
        nameAr: 'التوضيح والتلويহ',
        subject: 'উসুলে ফিকহ',
        authorBn: 'সদরুশ শরীআহ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'উসুলে ফিকহের দর্শন ও আইনতত্ত্বের উচ্চতর গবেষণা।',
        firstTermSyllabusBn: 'আহকামে শরইয়্যাহ ও মাবাদি।',
        secondTermSyllabusBn: 'দলায়েলুল আহকাম ও সুন্নাহর মাকাম।',
        finalTermSyllabusBn: 'কিয়াস ও ইজতিহাদের উসুল।',
      },
      {
        nameBn: 'আল-ফুযুলুল আকবরী',
        nameAr: 'الفصول الأكبرية',
        subject: 'ইলমুস সরফ',
        authorBn: 'আলী আকবর দেহলভী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'উচ্চতর সরফ শাস্ত্রের জটিল রূপান্তর ও বাবে মুআমালাত।',
        firstTermSyllabusBn: 'মুক্বাদ্দামাহ হতে বাবে তাফায়েল।',
        secondTermSyllabusBn: 'তালীল ও তাখফীফ এর জটিল কায়দা।',
        finalTermSyllabusBn: 'শব্দ রূপান্তরের পূর্ণাঙ্গ তামরীন।',
      },
      {
        nameBn: 'আল-আদাবুল মুফরাদ',
        nameAr: 'الأدب المفرد',
        subject: 'হাদিস ও শিষ্টাচার',
        authorBn: 'ইমাম বুখারী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'মা-বাবার হক, আত্মীয়তা, শিষ্টাচার ও উত্তম চরিত্রের বিশুদ্ধ হাদিসমালা।',
        firstTermSyllabusBn: 'অধ্যায় ১ হতে ৫০ (মা-বাবা ও প্রতিবেশীর হক)।',
        secondTermSyllabusBn: 'অধ্যায় ৫১ হতে ১০০ (আত্মীয়তা ও চরিত্র)।',
        finalTermSyllabusBn: 'অধ্যায় ১০১ হতে সমাপনী হাদিস।',
      },
    ],
    descriptionBn: 'সম্পূর্ণ তাফসিরে জালালাইন ও ফিকহের প্রামাণ্য কিতাব হিদায়া পাঠদানের মূল জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950',
      border: 'border-indigo-500/50 hover:border-indigo-400',
      badgeBg: 'bg-indigo-500/20 border border-indigo-500/40',
      badgeText: 'text-indigo-300',
      accentText: 'text-indigo-400',
      glow: 'shadow-indigo-950/60',
      iconBg: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40',
      stripColor: 'bg-indigo-500',
    },
    tag: 'fazilat',
  },
  {
    id: 'qawmi-7',
    order: 7,
    levelBn: '৭ম স্তর (ফজিলত ২য়)',
    nameBn: 'ফজিলত ২য় বর্ষ (মেশকাত জামাত)',
    nameAr: 'الفضيلة - السنة الثانية (مشكاة المصابيح)',
    marhalaBn: 'ফজিলত (বেফাকুল মাদারিস)',
    govEquivalentBn: 'স্নাতক সমাপনী / ডিগ্রি পাস সমমান',
    studentCount: 32,
    totalKitabs: 6,
    headTeacherBn: 'মুফতি হারুনুর রশীদ',
    kitabs: [
      {
        nameBn: 'মেশকাতুল মাসাবীহ (১ম খণ্ড)',
        nameAr: 'مشكاة المصابيح - الأول',
        subject: 'হাদিস শরীফ',
        authorBn: 'আল্লামা তিবরিযী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'কিতাবুল ঈমান, কিতাবুত তাহারাত, কিতাবুছ সালাত ও কিতাবুছ সাওম এর হাদিসসমূহ।',
        firstTermSyllabusBn: 'কিতাবুল ঈমান ও কিতাবুত তাহারাত।',
        secondTermSyllabusBn: 'কিতাবুছ সালাত সম্পূর্ণ।',
        finalTermSyllabusBn: 'কিতাবুছ সাওম, যাকাত ও জানাযা পর্ব।',
      },
      {
        nameBn: 'মেশকাতুল মাসাবীহ (২য় খণ্ড)',
        nameAr: 'مشكاة المصابيح - الثاني',
        subject: 'হাদিস শরীফ',
        authorBn: 'আল্লামা তিবরিযী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'কিতাবুল বুয়ূ, নিকাহ, কিসাস, ফিতান ও আখলাক এর বিশুদ্ধ হাদিস সম্ভার।',
        firstTermSyllabusBn: 'কিতাবুল বুয়ূ ও কিতাবুন নিকাহ।',
        secondTermSyllabusBn: 'কিতাবুল হুদুদ ও কিসাস।',
        finalTermSyllabusBn: 'কিতাবুর রিক্বাক্ব ও কিতাবুল ফিতান।',
      },
      {
        nameBn: 'তাফসিরে বায়যাবী',
        nameAr: 'تفسير البيضاوي',
        subject: 'ইলমুত তাফসীর',
        authorBn: 'আল্লামা বায়যাবী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'সুরা বাক্বারাহ এর তাত্ত্বিক ও বালাগাত ভিত্তিক উচ্চতর তাফসীর।',
        firstTermSyllabusBn: 'সুরা বাক্বারাহর রুকু ১ হতে ৮ পর্যন্ত।',
        secondTermSyllabusBn: 'সুরা বাক্বারাহর রুকু ৯ হতে ১৬ পর্যন্ত।',
        finalTermSyllabusBn: 'সুরা বাক্বারাহর সমাপনী রুকুসমূহ।',
      },
      {
        nameBn: 'শরহে আকাঈদ আন-নাসাফিয়্যাহ',
        nameAr: 'شرح العقائد النسفية',
        subject: 'ইলমুল কালাম ও আকাইদ',
        authorBn: 'আল্লামা তাফতাযানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'আহলে সুন্নাত ওয়াল জামাআতের আকাইদ ও বাতিল ফিরকার খণ্ডন।',
        firstTermSyllabusBn: 'ইলম ও আলমের হাকিকত এবং তাওহীদের দলিল।',
        secondTermSyllabusBn: 'সিফাতুল্লাহ ও রুইয়াতুল্লাহ এর বহস।',
        finalTermSyllabusBn: 'রিসালাত, আখিরাত ও ইমামতের মাসআলা।',
      },
      {
        nameBn: 'আল-হিদায়া (৩য় ও ৪র্থ খণ্ড)',
        nameAr: 'الهداية - الجزء ٣ و ٤',
        subject: 'উচ্চতর ফিকহ',
        authorBn: 'আল্লামা মারগিনানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'মুয়ামালাত, কাযা, শাহাদাত, শাফআ, ওয়াকফ ও মীরাসের জটিল আইন।',
        firstTermSyllabusBn: '৩য় খণ্ড: কিতাবুল বুয়ূ ও শাফআ।',
        secondTermSyllabusBn: '৩য় খণ্ড: কিতাবুল কাযা ও আদাবুল কাযী।',
        finalTermSyllabusBn: '৪র্থ খণ্ড: কিতাবুল ফারায়েজ (মীরাস বণ্টন)।',
      },
      {
        nameBn: 'শরহে নুখবাতুল ফিকার',
        nameAr: 'شرح نخبة الفكر',
        subject: 'উসুলে হাদিস',
        authorBn: 'হাফেজ ইবনে হাজার আসকালানী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 4,
        syllabusScopeBn: 'মুতাওয়াতির, আহাদ, সহীহ, হাসান, যয়ীফ ও রিজাল শাস্ত্রের পারিভাষিক উসুল।',
        firstTermSyllabusBn: 'খবরে মুতাওয়াতির ও খবরে ওয়াহেদ।',
        secondTermSyllabusBn: 'সহীহ, হাসান ও যয়ীফ হাদিসের প্রকারভেদ।',
        finalTermSyllabusBn: 'জারহ ও তাদীল এবং মুহাদ্দিসীনদের পরিভাষা।',
      },
    ],
    descriptionBn: 'হাদিস ও উসুলে হাদিসের ভিত্তি এবং ফিকহ ও আকাইদের উচ্চতর গবেষণামূলক জামাত।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      border: 'border-blue-500/50 hover:border-blue-400',
      badgeBg: 'bg-blue-500/20 border border-blue-500/40',
      badgeText: 'text-blue-300',
      accentText: 'text-blue-400',
      glow: 'shadow-blue-950/60',
      iconBg: 'bg-blue-600/30 text-blue-300 border border-blue-500/40',
      stripColor: 'bg-blue-500',
    },
    tag: 'fazilat',
  },
  {
    id: 'qawmi-8',
    order: 8,
    levelBn: '৮ম স্তর (তাকমিল)',
    nameBn: 'দাওরায়ে হাদিস (তাকমিল জামাত)',
    nameAr: 'الدورة الحديثية - التكميل',
    marhalaBn: 'তাকমিল / আল-হাইআতুল উলয়া',
    govEquivalentBn: 'মাস্টার্স (ইসলামিক স্টাডিজ সমমান)',
    studentCount: 28,
    totalKitabs: 8,
    headTeacherBn: 'শায়খুল হাদিস আল্লামা আব্দুল কুদ্দুস',
    kitabs: [
      {
        nameBn: 'সহীহুল বুখারী (১ম ও ২য় খণ্ড)',
        nameAr: 'صحيح البخاري',
        subject: 'হাদিস শরীফ (সিহাহ সিত্তাহ ১)',
        authorBn: 'ইমাম বুখারী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 8,
        syllabusScopeBn: 'কিতাবুল ওহী থেকে কিতাবুত তাওহীদ পর্যন্ত ৭০০০+ হাদিসের বিস্তারিত সনদ ও মতন বিশ্লেষণ।',
        firstTermSyllabusBn: '১ম খণ্ড: ওহী, ঈমান, ইলম, তাহারাত ও সালাত পর্ব।',
        secondTermSyllabusBn: '১ম খণ্ড: সাওম, হজ্ব, জিহাদ ও মাগাযী পর্ব।',
        finalTermSyllabusBn: '২য় খণ্ড: তাফসীর, রিক্বাক্ব, ফিতান ও তাওহীদ পর্ব সমাপ্তি।',
      },
      {
        nameBn: 'সহীহু মুসলিম (১ম ও ২য় খণ্ড)',
        nameAr: 'صحيح مسلم',
        subject: 'হাদিস শরীফ (সিহাহ সিত্তাহ ২)',
        authorBn: 'ইমাম মুসলিম (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'মুক্বাদ্দামাতু সহীহ মুসলিম, আহকামে ঈমান, সালাত, ফাদায়েল ও সিফাত।',
        firstTermSyllabusBn: 'মুক্বাদ্দামাহ ও কিতাবুল ঈমান।',
        secondTermSyllabusBn: 'কিতাবুছ সালাত ও কিতাবুয যাকাত।',
        finalTermSyllabusBn: 'কিতাবুল ফাদায়েল ও সিফাতুল কিয়ামাহ।',
      },
      {
        nameBn: 'জামেউত তিরমিযী (১ম ও ২য় খণ্ড)',
        nameAr: 'جامع الترمذي',
        subject: 'হাদিস ও তুলনামূলক ফিকহ (সিহাহ ৩)',
        authorBn: 'ইমাম তিরমিযী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'চার মাযহাবের ইমামগণের ফিকহী ইখতিলাফ ও হাদিসের দলীলের পর্যালোচনা।',
        firstTermSyllabusBn: '১ম খণ্ড: তাহারাত ও সালাত পর্বের তুলনামূলক ফিকহ।',
        secondTermSyllabusBn: '১ম খণ্ড: সাওম, যাকাত ও নিকাহ পর্ব।',
        finalTermSyllabusBn: '২য় খণ্ড: ইললুত তিরমিযী ও সীরাত পর্ব।',
      },
      {
        nameBn: 'সুনানে আবু দাউদ',
        nameAr: 'سنن أبي داود',
        subject: 'হাদিস ও আহকাম (সিহাহ ৪)',
        authorBn: 'ইমাম আবু দাউদ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'আহকামের সবচেয়ে প্রামাণ্য হাদীস সংকলন। বিচারব্যবস্থা ও ফিকহী প্রয়োগ।',
        firstTermSyllabusBn: 'তাহারাত, সালাত ও যাকাত পর্ব।',
        secondTermSyllabusBn: 'নিকাহ, তালাক ও কিতাবুল বুয়ূ।',
        finalTermSyllabusBn: 'কিতাবুল কাযা ও কিতাবুল আদব।',
      },
      {
        nameBn: 'সুনানে নাসাঈ শরীফ',
        nameAr: 'سنن النسائي',
        subject: 'হাদিস ও ইলল (সিহাহ ৫)',
        authorBn: 'ইমাম নাসাঈ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'সূক্ষ্ম সনদ তাহকীক ও ইবারতের গভীর বিশ্লেষণ।',
        firstTermSyllabusBn: 'তাহারাত ও পানির বিধান সংক্রান্ত বহস।',
        secondTermSyllabusBn: 'সালাতের সময় ও সেজদার আহকাম।',
        finalTermSyllabusBn: 'কিসাস ও বায়আত পর্ব।',
      },
      {
        nameBn: 'সুনানে ইবনে মাজাহ',
        nameAr: 'سنن ابن ماجه',
        subject: 'হাদিস শরীফ (সিহাহ ৬)',
        authorBn: 'ইমাম ইবনে মাজাহ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 4,
        syllabusScopeBn: 'মুক্বাদ্দামাহ ফি ইত্তিবাউস সুন্নাহ ও অনন্য বিরল হাদীস সম্ভার।',
        firstTermSyllabusBn: 'সুন্নাহ অনুসরণ ও ঈমান অধ্যায়।',
        secondTermSyllabusBn: 'ইবাদত ও ক্রয়-বিক্রয় অধ্যায়।',
        finalTermSyllabusBn: 'জুহদ ও আখিরাতের প্রস্তুতি।',
      },
      {
        nameBn: 'শরহু মাআনিল আসার (তহাবী শরীফ)',
        nameAr: 'شرح معاني الآثار',
        subject: 'হাদিস ও আসার',
        authorBn: 'ইমাম তহাবী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'হানাফী মাযহাবের হাদীস ভিত্তিক দলিল ও নাসিখ-মানসুখের সমাধান।',
        firstTermSyllabusBn: 'তাহারাত ও সালাতের মতভেদপূর্ণ হাদীসের সমন্বয়।',
        secondTermSyllabusBn: 'যাকাত ও কুরবানির হাদীস তাহকীক।',
        finalTermSyllabusBn: 'মুয়ামালাত ও সমাপনী অধ্যায়।',
      },
      {
        nameBn: 'শামায়েলে তিরমিযী',
        nameAr: 'الشمائل المحمدية',
        subject: 'সীরাত ও শামায়েল',
        authorBn: 'ইমাম তিরমিযী (রহ.)',
        examMarks: 50,
        passMarks: 20,
        weeklyPeriods: 3,
        syllabusScopeBn: 'রাসূলুল্লাহ (সা.)-এর পবিত্র আকৃতি, মোবারক পোশাক, খাদ্য, আখলাক ও ইবাদত।',
        firstTermSyllabusBn: 'রাসূল (সা.)-এর পবিত্র চেহারা, চুল ও পোশাকের বিবরণ।',
        secondTermSyllabusBn: 'নবীজীর পানাহার, চরিত্র ও রাতের নামাজ।',
        finalTermSyllabusBn: 'নবীজীর ওফাত ও স্বপ্নদর্শন অধ্যায়।',
      },
    ],
    descriptionBn: 'ক্বওমী মাদরাসার সর্বোচ্চ ডিগ্রি স্তর। সিহাহ সিত্তাহ সহ হাদিসের মৌলিক আটটি প্রধান কিতাবের গভীর পর্যালোচনা ও সনদ তাহকীক।',
    durationMonths: 12,
    dailyPeriods: 6,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
      border: 'border-emerald-500/50 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 border border-emerald-500/40',
      badgeText: 'text-emerald-300',
      accentText: 'text-emerald-400',
      glow: 'shadow-emerald-950/60',
      iconBg: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40',
      stripColor: 'bg-emerald-500',
    },
    tag: 'dawra',
  },
  {
    id: 'qawmi-9',
    order: 9,
    levelBn: '৯ম স্তর (উচ্চতর গবেষণা)',
    nameBn: 'তাকাসসুস ফিল ইফতা (উচ্চতর ফতোয়া বিভাগ)',
    nameAr: 'التخصص في الإفتاء والدراسات الفقهية',
    marhalaBn: 'তাকাসসুসাত (পোস্ট-মাস্টার্স স্পেশালাইজেশন)',
    govEquivalentBn: 'উচ্চতর ইসলামিক আইন ও ফতোয়া গবেষণা (এমফিল সমমান)',
    studentCount: 15,
    totalKitabs: 5,
    headTeacherBn: 'মুফতি দেলোয়ার হোসাইন (প্রধান মুফতি)',
    kitabs: [
      {
        nameBn: 'রদ্দুল মুহতার আলাত দুররিল মুখতার (ফতোয়ায়ে শামী)',
        nameAr: 'رد المحتار على الدر المختار',
        subject: 'প্রামাণ্য ফতোয়া শাস্ত্র',
        authorBn: 'আল্লামা ইবনে আবেদীন শামী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'হানাফী মাযহাবের প্রামাণ্য বিশ্বকোষ ফতোয়া ও তামরীনাত।',
        firstTermSyllabusBn: 'মুক্বাদ্দামায়ে শামী ও মুফতির শর্তাবলী।',
        secondTermSyllabusBn: 'সমকালীন বিবাহ-তালাক ও ব্যাংকিং ফতোয়া।',
        finalTermSyllabusBn: 'জটিল সম্পত্তি ও ওয়াকফ বিরোধ নিষ্পত্তি।',
      },
      {
        nameBn: 'আল-আশবাহ ওয়ান নাযায়ির',
        nameAr: 'الأشباه والنظائر',
        subject: 'কাওয়ায়েদুল ফিকহ',
        authorBn: 'আল্লামা ইবনে নুজাইম মিসরী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ফিকহের ৫টি প্রধান মূলনীতি ও বহুবিধ উপনীতি বিশ্লেষণ।',
        firstTermSyllabusBn: 'আল-উমুরু বি মাকাসিদিহা ও আল-ইয়াকিনু লা ইযালু বিশ-শাক।',
        secondTermSyllabusBn: 'আদ-দারারু ইউযাল ও আল-আদাতু মুহাক্কামাহ।',
        finalTermSyllabusBn: 'কাওয়ায়েদে কুল্লিয়াহ ও ফিকহী ইস্তিম্বাত।',
      },
      {
        nameBn: 'বুহুস ফি কাযায়া ফিকহিয়্যাহ মুআসিরাহ',
        nameAr: 'بحوث في قضايا فقهية معاصرة',
        subject: 'সমকালীন আধুনিক মাসায়েল',
        authorBn: 'মুফতি তাকী উসমানী (হাফি.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'ইসলামী অর্থনীতি, শেয়ার মার্কেট, ক্রিপ্টো, অঙ্গ প্রতিস্থাপন ও আধুনিক ইস্যু।',
        firstTermSyllabusBn: 'ইসলামী ব্যাংকিং ও সুদমুক্ত অর্থায়ন।',
        secondTermSyllabusBn: 'আধুনিক চিকিৎসা ও বায়োএথিক্স মাসায়েল।',
        finalTermSyllabusBn: 'ডিজিটাল লেনদেন ও সমকালীন চুক্তিপত্র।',
      },
      {
        nameBn: 'উসুলুল ইফতা ও আদাবুহু',
        nameAr: 'أصول الإفتاء وآدابه',
        subject: 'ফতোয়া প্রণয়নরীতি',
        authorBn: 'মুফতি তাকী উসমানী',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 4,
        syllabusScopeBn: 'ফতোয়া লেখার পদ্ধতি, দলিল উদ্ধৃতি ও দলীয় শৃঙ্খলা।',
        firstTermSyllabusBn: 'মুফতির যোগ্যতা ও ফতোয়া দেওয়ার নীতিমালা।',
        secondTermSyllabusBn: 'দুর্বল ও মারজুহ কওলের উপর আমলের হুকুম।',
        finalTermSyllabusBn: 'বাস্তব ফতোয়া রচনা ও নিরীক্ষণ।',
      },
      {
        nameBn: 'ফতোয়া লিখন প্রশিক্ষণ ও তামরিনাত',
        nameAr: 'التمرين على الإفتاء',
        subject: 'ব্যবহারিক ফতোয়া লিখন',
        authorBn: 'দারুল ইফতা বোর্ড',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'বাস্তবে আগত ১০০০+ প্রশ্নের উত্তর লিখে ফতোয়ার খাতা সম্পাদন।',
        firstTermSyllabusBn: 'ইবাদত ও তাহারাত বিষয়ক ২০টি লিখিত ফতোয়া।',
        secondTermSyllabusBn: 'পারিবারিক ও আর্থিক ৩০টি লিখিত ফতোয়া।',
        finalTermSyllabusBn: 'পূর্ণাঙ্গ ফতোয়া গবেষণাপত্র (থিসিস)।',
      },
    ],
    descriptionBn: 'দাওরায়ে হাদিস উত্তীর্ণ শিক্ষার্থীদের জন্য সমকালীন ও ক্লাসিক্যাল ফতোয়া প্রণয়নের সর্বোচ্চ গবেষণামূলক বিশেষায়িত বিভাগ।',
    durationMonths: 24,
    dailyPeriods: 5,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-yellow-950 via-stone-900 to-amber-950',
      border: 'border-yellow-500/50 hover:border-yellow-400',
      badgeBg: 'bg-yellow-500/20 border border-yellow-500/40',
      badgeText: 'text-yellow-300',
      accentText: 'text-yellow-400',
      glow: 'shadow-yellow-950/60',
      iconBg: 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/40',
      stripColor: 'bg-yellow-500',
    },
    tag: 'takhassus',
  },
  {
    id: 'qawmi-10',
    order: 10,
    levelBn: '১০ম স্তর (উচ্চতর সাহিত্য)',
    nameBn: 'তাকাসসুস ফিল আদব ওয়াল লুগাতিল আরাবিয়্যাহ',
    nameAr: 'التخصص في الأدب واللغة العربية',
    marhalaBn: 'তাকাসসুসাত (উচ্চতর আরবি সাহিত্য)',
    govEquivalentBn: 'উচ্চতর আরবি ভাষা ও গবেষণা ডিপ্লোমা',
    studentCount: 12,
    totalKitabs: 4,
    headTeacherBn: 'শায়খ বশীরুল্লাহ নদভী',
    kitabs: [
      {
        nameBn: 'দিওয়ানে মুতানাব্বী ও দিওয়ানে হামাসা',
        nameAr: 'ديوان المتنبي والحماسة',
        subject: 'জাহেলী ও ইসলামী কাব্য',
        authorBn: 'আবু তাইয়্যেব মুতানাব্বী ও আবু তাম্মাম',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'ক্লাসিক্যাল আরবি কবিতার ছন্দ, অলঙ্কার ও গভীর সাহিত্য বিশ্লেষণ।',
        firstTermSyllabusBn: 'দিওয়ানে মুতানাব্বীর ২০টি নির্বাচিত কাসীদাহ।',
        secondTermSyllabusBn: 'দিওয়ানে হামাসার বাবে বাবাসাহ ও আদব।',
        finalTermSyllabusBn: 'আরবি কাব্য ছন্দ (ইলমুল আরূয)।',
      },
      {
        nameBn: 'আল-কামিল ফিল লুগাহ ওয়াল আদব',
        nameAr: 'الكامل في اللغة والأدب',
        subject: 'ধ্রুপদী আরবি গদ্য',
        authorBn: 'ইমাম আল-মুবররাদ (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'বিশুদ্ধ আরবি ভাষা, প্রবাদ-প্রবচন ও সাহিত্যের মহাকাব্যিক গদ্য।',
        firstTermSyllabusBn: '১ম খণ্ড: আরবের ঐতিহাসিক ভাষণ ও পত্রাবলী।',
        secondTermSyllabusBn: '২য় খণ্ড: প্রবাদ ও সাহিত্যিক বিশ্লেষণ।',
        finalTermSyllabusBn: '৩য় খণ্ড: জটিল ভাষারীতির পর্যালোচনা।',
      },
      {
        nameBn: 'দালাইলুল ইজায ও আসরারুল বালাগাহ',
        nameAr: 'دلائل الإعجاز وأسرار البلاغة',
        subject: 'উচ্চতর অলঙ্কারশাস্ত্র',
        authorBn: 'আব্দুল কাহের জুরজানী (রহ.)',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 5,
        syllabusScopeBn: 'কুরআনুল কারীমের অলৌকিক সাহিত্যসৌন্দর্য ও বালাগাতের শীর্ষ তত্ত্ব।',
        firstTermSyllabusBn: 'নাজমের দর্শন ও বাক্যালঙ্কার।',
        secondTermSyllabusBn: 'ইসতিয়ারা ও হাকিকাত-মাজাযের রহস্য।',
        finalTermSyllabusBn: 'কুরআনের সাহিত্যিক ইজাজতত্ত্ব।',
      },
      {
        nameBn: 'আরবি প্রবন্ধ, জার্নালিজম ও বক্তৃতা চর্চা',
        nameAr: 'الإنشاء والمقالات والخطابة',
        subject: 'ব্যবহারিক আরবি সাহিত্য',
        authorBn: 'বিভাগীয় সাহিত্য পরিষদ',
        examMarks: 100,
        passMarks: 40,
        weeklyPeriods: 6,
        syllabusScopeBn: 'আন্তর্জাতিক মানের আরবি লিখনী, কলাম রচনা, সরাসরি বক্তৃতা ও সাক্ষাৎকার প্রশিক্ষণ।',
        firstTermSyllabusBn: 'মৌলিক ইনশা ও প্রবন্ধ রচনার কাঠামো।',
        secondTermSyllabusBn: 'ইসলামী সাংবাদিকতা ও আরবি প্রেস রিলিজ।',
        finalTermSyllabusBn: 'মৌখিক আরবি বক্তৃতা ও পূর্ণাঙ্গ থিসিস।',
      },
    ],
    descriptionBn: 'আন্তর্জাতিক মানের আরবি লিখনী, বাচনভঙ্গি, ক্লাসিক্যাল সাহিত্য ও প্রবন্ধ রচনার বিশেষায়িত বিভাগ।',
    durationMonths: 12,
    dailyPeriods: 5,
    gradientTheme: {
      cardBg: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-sky-950',
      border: 'border-cyan-500/50 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/20 border border-cyan-500/40',
      badgeText: 'text-cyan-300',
      accentText: 'text-cyan-400',
      glow: 'shadow-cyan-950/60',
      iconBg: 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40',
      stripColor: 'bg-cyan-500',
    },
    tag: 'takhassus',
  },
];

const SAMPLE_STUDENT_NAMES = [
  { name: 'মুহাম্মাদ আব্দুল্লাহ', father: 'মাওলানা মুহাম্মদ আলী', district: 'নরসিংদী', hafez: true },
  { name: 'আহমাদুল্লাহ হাসান', father: 'মুহাম্মদ রফিকুল ইসলাম', district: 'ব্রাহ্মণবাড়িয়া', hafez: false },
  { name: 'সালমান ফারসী', father: 'মুফতী আব্দুর রহমান', district: 'কিশোরগঞ্জ', hafez: true },
  { name: 'যুবায়ের আহমাদ', father: 'মোঃ আব্দুল কুদ্দুস', district: 'ময়মনসিংহ', hafez: true },
  { name: 'মাহমুদুল হাসান', father: 'মাওলানা আবুল হোসেন', district: 'সিলেট', hafez: false },
  { name: 'উসামা বিন যাইদ', father: 'মাওলানা সিরাজুল ইসলাম', district: 'চট্টগ্রাম', hafez: true },
  { name: 'তাওহীদুল ইসলাম', father: 'মোঃ শামসুল হক', district: 'বগুড়া', hafez: false },
  { name: 'মুহাম্মাদ খালিদ সাইফুল্লাহ', father: 'মাওলানা গোলাম মোস্তফা', district: 'গাজীপুর', hafez: true },
  { name: 'হুযাইফা বিন ইয়ামান', father: 'মুহাম্মদ হারুনুর রশীদ', district: 'ঢাকা', hafez: false },
  { name: 'আনাস মাহমুদ', father: 'মোঃ জসিম উদ্দিন', district: 'কুমিল্লা', hafez: true },
  { name: 'মুহাম্মাদ মুস্তাকিম বিল্লাহ', father: 'মাওলানা এনামুল হক', district: 'ফেনী', hafez: true },
  { name: 'সাঈদ বিন মুসাইয়্যিব', father: 'মোঃ মিজানুর রহমান', district: 'নোয়াখালী', hafez: false },
  { name: 'তাহমিদুর রহমান', father: 'মাওলানা নুরুল আমিন', district: 'টাঙ্গাইল', hafez: true },
  { name: 'মুহাম্মাদ রাইয়ান ইসলাম', father: 'মোঃ আকতার হোসেন', district: 'রংপুর', hafez: false },
  { name: 'আরিফুল ইসলাম জাবের', father: 'মুহাম্মদ ফারুক হোসেন', district: 'হবিগঞ্জ', hafez: true },
  { name: 'মুহাম্মাদ তামিম ইকবাল', father: 'মাওলানা জিল্লুর রহমান', district: 'জামালপুর', hafez: false },
  { name: 'মুসাব বিন উমাইর', father: 'মোঃ হাবিবুর রহমান', district: 'নেত্রকোণা', hafez: true },
  { name: 'আশরাফুল ইসলাম আদনান', father: 'মাওলানা আব্দুল হাই', district: 'ফরিদপুর', hafez: false },
  { name: 'মুহাম্মাদ ইয়াসিন আরাফাত', father: 'মোঃ মনির হোসেন', district: 'চাঁদপুর', hafez: true },
  { name: 'মুহাম্মাদ মুজাহিদুল ইসলাম', father: 'মাওলানা বোরহান উদ্দিন', district: 'কক্সবাজার', hafez: true },
];

interface QawmiClassesTabProps {
  branch?: QawmiBranch;
  onBranchChange?: (branch: QawmiBranch) => void;
  mode?: 'qawmi' | 'noorani';
  customBoysClasses?: QawmiClassItem[];
  customGirlsClasses?: QawmiClassItem[];
}

const generateClassStudents = (classItem: QawmiClassItem, isMohila = false, isNoorani = false): QawmiStudentItem[] => {
  const count = classItem.studentCount || 30;
  const list: QawmiStudentItem[] = [];
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n: number | string) => n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);

  const nameSource = isMohila ? SAMPLE_MOHILA_STUDENT_NAMES : SAMPLE_STUDENT_NAMES;
  const regPrefix = isNoorani ? (isMohila ? 'NRN-F' : 'NRN') : (isMohila ? 'QWM-F' : 'QWM');

  for (let i = 0; i < count; i++) {
    const sample = nameSource[i % nameSource.length];
    const roll = i + 1;
    list.push({
      id: `std-${classItem.id}-${roll}`,
      roll,
      nameBn: i < nameSource.length ? sample.name : `${sample.name} (${toBn(Math.floor(i / nameSource.length) + 1)})`,
      fatherNameBn: sample.father,
      regId: `${regPrefix}-${classItem.order.toString().padStart(2, '0')}-${roll.toString().padStart(3, '0')}`,
      mobile: `01${(7 + (i % 3))}1${(i * 137).toString().padStart(7, '0').slice(0, 7)}`,
      districtBn: sample.district,
      isResidential: i % 3 !== 0,
      isHafez: sample.hafez,
      attendancePct: 92 + (i % 8),
      status: 'active',
    });
  }
  return list;
};

export const QawmiClassesTab: React.FC<QawmiClassesTabProps> = ({
  branch = 'boys',
  onBranchChange,
  mode = 'qawmi',
  customBoysClasses,
  customGirlsClasses,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const isMohila = branch === 'mohila';
  const isNoorani = mode === 'noorani';

  const boysData = customBoysClasses || INITIAL_QAWMI_CLASSES;
  const girlsData = customGirlsClasses || INITIAL_MOHILA_QAWMI_CLASSES;

  const [classesList, setClassesList] = useState<QawmiClassItem[]>(() =>
    branch === 'mohila' ? girlsData : boysData
  );

  useEffect(() => {
    setClassesList(branch === 'mohila' ? girlsData : boysData);
    setSelectedClassModal(null);
    setSelectedStudentDetail(null);
  }, [branch, girlsData, boysData]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // 'asc': 1 -> 10, 'desc': 10 -> 1

  // Modals state
  const [selectedClassModal, setSelectedClassModal] = useState<QawmiClassItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dedicated "10 Classes Syllabus & Kitabs Hub" Modal state (Triggered by the Textbooks KPI card)
  const [isSyllabusHubOpen, setIsSyllabusHubOpen] = useState(false);
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState<QawmiClassItem | null>(null);
  const [selectedKitabModal, setSelectedKitabModal] = useState<KitabDetail | null>(null);
  const [syllabusSearch, setSyllabusSearch] = useState('');

  // 👥 Selected Class Full-Page View & Student Roster State
  const [classDetailTab, setClassDetailTab] = useState<'students' | 'sabaq' | 'kitabs' | 'overview'>('students');
  const [classStudentSearch, setClassStudentSearch] = useState('');
  const [classStudentFilter, setClassStudentFilter] = useState<'all' | 'residential' | 'non_residential' | 'hafez'>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<QawmiStudentItem | null>(null);
  const [studentProfileTab, setStudentProfileTab] = useState<'info' | 'sabaq_report'>('info');
  const [studentReportFilterDate, setStudentReportFilterDate] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // 📖 Daily Sabaq (ছবক নেওয়া ও ট্র্যাকিং) State
  const [sabaqDate, setSabaqDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSabaqKitab, setSelectedSabaqKitab] = useState<string>('');
  const [activeSabaqStudentId, setActiveSabaqStudentId] = useState<string>('');
  const [isSabaqStudentPickerOpen, setIsSabaqStudentPickerOpen] = useState(false);
  const [sabaqPickerSearch, setSabaqPickerSearch] = useState('');
  const [sabaqRecords, setSabaqRecords] = useState<Record<string, { lessonRange: string; grade: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbul' | 'na_dahenda' | 'absent'; remarks: string }>>(() => {
    try {
      const saved = localStorage.getItem('madsol_qawmi_sabaq_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [sabaqSavedToast, setSabaqSavedToast] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when switching modal tabs or opening a class
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [classDetailTab, selectedClassModal?.id]);

  // Helper to extract student's sabaq logs
  const getStudentSabaqLogs = (studentId: string, className = '') => {
    const logs: Array<{ date: string; kitab: string; lesson: string; grade: string; remarks: string }> = [];
    Object.entries(sabaqRecords).forEach(([key, val]: [string, any]) => {
      // Key format: `${date}_${classId}_${kitab}_${studentId}`
      const parts = key.split('_');
      if (parts[parts.length - 1] === studentId && val) {
        const d = parts[0] || sabaqDate;
        const k = parts.slice(2, parts.length - 1).join('_') || 'সাধারণ কিতাব';
        logs.push({
          date: d,
          kitab: k,
          lesson: val.lessonRange || 'নির্ধারিত ছবক সম্পন্ন',
          grade: val.grade || 'mumtaz',
          remarks: val.remarks || 'মাশাল্লাহ',
        });
      }
    });

    // If empty, generate rich realistic demo history for today and past days
    if (logs.length === 0) {
      const kitabsList = selectedClassModal?.kitabs.map((k) => k.nameBn) || ['মিশকাতুল মাসাবীহ', 'আল-হিদায়া', 'তাফসীরে জালালাইন'];
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        const dateStr = pastDate.toISOString().split('T')[0];
        logs.push({
          date: dateStr,
          kitab: kitabsList[i % kitabsList.length] || 'পাঠ্য কিতাব',
          lesson: `পৃষ্ঠা নং ${toBnNum(15 + i * 4)} (হাদিস ${toBnNum(1 + i * 3)}-${toBnNum(5 + i * 3)})`,
          grade: i === 0 ? 'mumtaz' : i === 1 ? 'jayyid_jiddan' : i === 2 ? 'jayyid' : 'mumtaz',
          remarks: i === 0 ? 'মাশাল্লাহ উত্তম তেলাওয়াত ও তরজমা' : 'মনোযোগ সন্তোষজনক',
        });
      }
    }

    return logs.sort((a, b) => b.date.localeCompare(a.date));
  };

  const handlePrintStudentReport = (student: QawmiStudentItem, logs: Array<{ date: string; kitab: string; lesson: string; grade: string; remarks: string }>) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gradeLabel = (g: string) => {
      switch (g) {
        case 'mumtaz': return 'মুমতাজ (উৎকৃষ্ট)';
        case 'jayyid_jiddan': return 'জা. জিদ্দান (উত্তম)';
        case 'jayyid': return 'জায়্যিদ (ভালো)';
        case 'maqbul': return 'মাকবুল (চলনসই)';
        case 'na_dahenda': return 'না-দাহেন্দা';
        case 'absent': return 'অনুপস্থিত';
        default: return g || '-';
      }
    };

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="utf-8">
        <title>তালিবুল ইলম ছবক ও হাজিরা রিপোর্ট - ${student.nameBn}</title>
        <style>
          body { font-family: 'SolaimanLipi', 'Kalpurush', sans-serif, system-ui; padding: 25px; color: #0f172a; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: bold; color: #065f46; margin: 0; }
          .subtitle { font-size: 13px; color: #475569; margin: 4px 0; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #059669; color: white; font-weight: bold; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
          .mumtaz { background: #d1fae5; color: #065f46; }
          .jayyid { background: #e0f2fe; color: #0369a1; }
          .absent { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; padding-top: 30px; }
          .sig { border-top: 1px dashed #64748b; width: 150px; text-align: center; padding-top: 4px; }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">মাদরাসা মারকাযুত তালিম আল-ইসলামিয়া</h1>
          <p class="subtitle">মারহালা / জামাত: ${selectedClassModal?.nameBn || 'কওমি মাদ্রাসা'} • শিক্ষাবর্ষ: ১৪৪৭-৪৮ হি.</p>
          <h2 style="font-size: 16px; margin: 6px 0; color: #0f172a;">তালিবুল ইলম দৈনিক ছবক ও হাজিরা মূল্যায়ন রিপোর্ট</h2>
        </div>

        <div class="grid">
          <div><strong>নাম:</strong> ${student.nameBn} ${student.isHafez ? '(হাফেজ)' : ''}</div>
          <div><strong>রোল নং:</strong> #${toBnNum(student.roll)}</div>
          <div><strong>রেজিস্ট্রেশন আইডি:</strong> ${student.regId}</div>
          <div><strong>পিতার নাম:</strong> ${student.fatherNameBn}</div>
          <div><strong>স্থায়ী জেলা:</strong> ${student.districtBn}</div>
          <div><strong>বোর্ডিং ধরণ:</strong> ${student.isResidential ? 'আবাসিক' : 'অনাবাসিক'}</div>
          <div><strong>বার্ষিক মোট উপস্থিতি:</strong> ${toBnNum(student.attendancePct)}%</div>
          <div><strong>রিপোর্ট মুদ্রণের তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</div>
        </div>

        <h3 style="font-size: 13px; margin: 12px 0 6px; color: #065f46;">তারিখ অনুযায়ী ছবকের বিবরণী:</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">ক্র.</th>
              <th style="width: 80px;">তারিখ</th>
              <th>কিতাবের নাম</th>
              <th>পঠিত ছবক (পৃষ্ঠা / হাদিস / মতন)</th>
              <th style="width: 90px; text-align: center;">ছবকের মান</th>
              <th>উস্তাদের মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? '<tr><td colspan="6" style="text-align: center; padding: 15px;">কোন ছবক রেকর্ড পাওয়া যায়নি</td></tr>' : logs.map((r, i) => `
              <tr>
                <td style="text-align: center;">${toBnNum(i + 1)}</td>
                <td>${r.date}</td>
                <td><strong>${r.kitab}</strong></td>
                <td>${r.lesson}</td>
                <td style="text-align: center;"><span class="badge ${r.grade === 'mumtaz' ? 'mumtaz' : r.grade === 'absent' ? 'absent' : 'jayyid'}">${gradeLabel(r.grade)}</span></td>
                <td>${r.remarks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="sig">উস্তাদুল মাদ্দা / শিক্ষক</div>
          <div class="sig">নাযেমে তালিমাত / শিক্ষা সচিব</div>
          <div class="sig">মুহতামিম / অধ্যক্ষ</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleDownloadStudentReport = (student: QawmiStudentItem, logs: Array<{ date: string; kitab: string; lesson: string; grade: string; remarks: string }>) => {
    let content = `মাদরাসা মারকাযুত তালিম আল-ইসলামিয়া\n`;
    content += `তালিবুল ইলম দৈনিক ছবক রিপোর্ট\n`;
    content += `=====================================\n`;
    content += `ছাত্রের নাম: ${student.nameBn} ${student.isHafez ? '(হাফেজ)' : ''}\n`;
    content += `রোল: #${student.roll} | আইডি: ${student.regId}\n`;
    content += `পিতার নাম: ${student.fatherNameBn}\n`;
    content += `জেলা: ${student.districtBn}\n`;
    content += `জামাত: ${selectedClassModal?.nameBn || 'কওমি'}\n`;
    content += `উপস্থিতি: ${student.attendancePct}%\n`;
    content += `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n\n`;
    content += `তারিখ অনুযায়ী ছবক লগ:\n`;
    content += `-------------------------------------\n`;
    logs.forEach((l, i) => {
      content += `${i + 1}. তারিখ: ${l.date} | কিতাব: ${l.kitab} | ছবক: ${l.lesson} | গ্রেড: ${l.grade} | মন্তব্য: ${l.remarks}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sabaq_Report_${student.regId}_${student.nameBn}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateStudentSabaq = (
    classId: string,
    studentId: string,
    field: 'lessonRange' | 'grade' | 'remarks',
    value: string
  ) => {
    const activeKitab = selectedSabaqKitab || (selectedClassModal?.kitabs[0]?.nameBn || 'সাধারণ ছবক');
    const key = `${sabaqDate}_${classId}_${activeKitab}_${studentId}`;
    setSabaqRecords((prev) => {
      const existing = prev[key] || { lessonRange: '', grade: 'mumtaz', remarks: '' };
      const updated = {
        ...prev,
        [key]: {
          ...existing,
          [field]: value,
        },
      };
      try {
        localStorage.setItem('madsol_qawmi_sabaq_records', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSabaqSavedToast(true);
    setTimeout(() => setSabaqSavedToast(false), 2000);
  };

  const handleBulkGrade = (
    classId: string,
    students: QawmiStudentItem[],
    grade: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'na_dahenda'
  ) => {
    const activeKitab = selectedSabaqKitab || (selectedClassModal?.kitabs[0]?.nameBn || 'সাধারণ ছবক');
    setSabaqRecords((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        const key = `${sabaqDate}_${classId}_${activeKitab}_${s.id}`;
        const existing = next[key] || { lessonRange: '', grade: 'mumtaz', remarks: '' };
        next[key] = {
          ...existing,
          grade,
        };
      });
      try {
        localStorage.setItem('madsol_qawmi_sabaq_records', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setSabaqSavedToast(true);
    setTimeout(() => setSabaqSavedToast(false), 2500);
  };

  // 🏛️ Board & Recognition Customization State
  const [boardPrimary, setBoardPrimary] = useState(() => {
    return localStorage.getItem('madsol_qawmi_board_primary') || 'আল-হাইআতুল উলয়া';
  });
  const [boardSecondary, setBoardSecondary] = useState(() => {
    return localStorage.getItem('madsol_qawmi_board_secondary') || 'ও বেফাকুল মাদারিসিল আরাবিয়া';
  });
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editBoardPrimary, setEditBoardPrimary] = useState(boardPrimary);
  const [editBoardSecondary, setEditBoardSecondary] = useState(boardSecondary);

  const QAWMI_BOARD_PRESETS = [
    {
      primary: 'আল-হাইআতুল উলয়া',
      secondary: 'ও বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',
      desc: 'জাতীয় সম্মিলিত সর্বোচ্চ কওমী শিক্ষা বোর্ড',
    },
    {
      primary: 'বেফাকুল মাদারিসিল আরাবিয়া',
      secondary: 'বাংলাদেশ কওমী মাদ্রাসা শিক্ষা বোর্ড (ঢাকা)',
      desc: 'বৃহত্তম কেন্দ্রীয় কওমী মাদ্রাসা শিক্ষাবোর্ড',
    },
    {
      primary: 'বেফাকুল মাদারিসিদ দ্বীনিয়্যা',
      secondary: 'বাংলাদেশ জাতীয় দ্বীনি শিক্ষা বোর্ড',
      desc: 'স্বীকৃত জাতীয় কওমি শিক্ষাবোর্ড',
    },
    {
      primary: 'আঞ্জুমানে ইত্তেহাদুল মাদারিস',
      secondary: 'পটিয়া কওমী মাদ্রাসা শিক্ষা বোর্ড (চট্টগ্রাম)',
      desc: 'ঐতিহ্যবাহী কওমী শিক্ষা বোর্ড',
    },
    {
      primary: 'তানযীমুল মাদারিসিদ দ্বীনিয়্যা',
      secondary: 'উত্তরবঙ্গ কওমী মাদ্রাসা শিক্ষা বোর্ড',
      desc: 'উত্তরবঙ্গীয় আঞ্চলিক কওমি শিক্ষাবোর্ড',
    },
    {
      primary: 'আযাদ দ্বীনি এদারায়ে তা\'লীম',
      secondary: 'সিলেট কওমী মাদ্রাসা শিক্ষা বোর্ড বাংলাদেশ',
      desc: 'সিলেটের সর্বপ্রাচীন দ্বীনি শিক্ষা বোর্ড',
    },
    {
      primary: 'গওহরডাঙ্গা শিক্ষাবোর্ড',
      secondary: 'খাদেমুল ইসলাম কওমী মাদ্রাসা শিক্ষা বোর্ড',
      desc: 'গওহরডাঙ্গা পরিচালিত শিক্ষা বোর্ড',
    },
    {
      primary: 'জাতীয় দ্বীনি মাদ্রাসা শিক্ষাবোর্ড',
      secondary: 'জাতীয় দ্বীনি কওমী শিক্ষা বোর্ড বাংলাদেশ',
      desc: 'কওমী শিক্ষা বোর্ড বাংলাদেশ',
    },
    {
      primary: 'স্বতন্ত্র মাদ্রাসা পরিচালনা বোর্ড',
      secondary: 'নিজস্ব পরিচালনা পর্ষদ ও সিলেবাস',
      desc: 'মাদ্রাসার নিজস্ব স্বায়ত্তশাসিত পরিষদ',
    },
  ];

  const handleOpenBoardModal = () => {
    setEditBoardPrimary(boardPrimary);
    setEditBoardSecondary(boardSecondary);
    setIsBoardModalOpen(true);
  };

  const handleSaveBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBoardPrimary.trim()) return;
    setBoardPrimary(editBoardPrimary.trim());
    setBoardSecondary(editBoardSecondary.trim());
    localStorage.setItem('madsol_qawmi_board_primary', editBoardPrimary.trim());
    localStorage.setItem('madsol_qawmi_board_secondary', editBoardSecondary.trim());
    setIsBoardModalOpen(false);
  };

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassAr, setNewClassAr] = useState('');
  const [newMarhala, setNewMarhala] = useState('তাকমিল / আল-হাইআতুল উলয়া');
  const [newGovEquiv, setNewGovEquiv] = useState('মাস্টার্স সমমান');
  const [newTeacher, setNewTeacher] = useState('');
  const [newStudents, setNewStudents] = useState<number>(30);
  const [newDesc, setNewDesc] = useState('');

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  // Filter and strictly sort by order (a -> b -> c -> d)
  const filteredAndSortedClasses = classesList
    .filter((cls) => {
      const matchesTag = selectedTag === 'all' || cls.tag === selectedTag;
      const matchesSearch =
        cls.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.marhalaBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.headTeacherBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.kitabs.some((k) => k.nameBn.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      return sortDirection === 'asc' ? a.order - b.order : b.order - a.order;
    });

  const totalStudents = classesList.reduce((acc, c) => acc + c.studentCount, 0);
  const totalKitabs = classesList.reduce((acc, c) => acc + c.kitabs.length, 0);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const nextOrder = classesList.length + 1;
    const newClass: QawmiClassItem = {
      id: `qawmi-${Date.now()}`,
      order: nextOrder,
      levelBn: `${toBnNum(nextOrder)}ম স্তর`,
      nameBn: newClassName,
      nameAr: newClassAr || 'الصف الدراسي الجديد',
      marhalaBn: newMarhala,
      govEquivalentBn: newGovEquiv,
      studentCount: Number(newStudents) || 25,
      totalKitabs: 4,
      headTeacherBn: newTeacher || 'নির্ধারিত মুদাররিস',
      kitabs: [
        {
          nameBn: 'প্রধান পাঠ্য কিতাব-১',
          nameAr: 'الكتاب الأول',
          subject: 'মৌলিক বিষয়',
          authorBn: 'প্রখ্যাত মুসান্নিফ',
          examMarks: 100,
          passMarks: 40,
          weeklyPeriods: 6,
          syllabusScopeBn: 'বার্ষিক নির্ধারিত পূর্ণ সিলেবাস ও দরস।',
          firstTermSyllabusBn: '১ম সাময়িক পরীক্ষার অধ্যায় ও পাঠ্যসূচি।',
          secondTermSyllabusBn: '২য় সাময়িক পরীক্ষার অধ্যায় ও পাঠ্যসূচি।',
          finalTermSyllabusBn: 'বার্ষিক সমাপনী পরীক্ষার পূর্ণাঙ্গ সিলেবাস।',
        },
        {
          nameBn: 'সহায়ক কিতাব-২',
          nameAr: 'الكتاب الثاني',
          subject: 'সহায়ক বিষয়',
          authorBn: 'প্রখ্যাত মুসান্নিফ',
          examMarks: 100,
          passMarks: 40,
          weeklyPeriods: 5,
          syllabusScopeBn: 'সহায়ক পাঠ্যসূচি ও তামরীনাত।',
          firstTermSyllabusBn: '১ম সাময়িক অংশ।',
          secondTermSyllabusBn: '২য় সাময়িক অংশ।',
          finalTermSyllabusBn: 'বার্ষিক পরীক্ষার অংশ।',
        },
      ],
      descriptionBn: newDesc || 'কওমী নেসাবের অন্তর্ভুক্ত জামাত।',
      durationMonths: 12,
      dailyPeriods: 6,
      gradientTheme: {
        cardBg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950',
        border: 'border-emerald-500/50 hover:border-emerald-400',
        badgeBg: 'bg-emerald-500/20 border border-emerald-500/40',
        badgeText: 'text-emerald-300',
        accentText: 'text-emerald-400',
        glow: 'shadow-emerald-950/60',
        iconBg: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40',
        stripColor: 'bg-emerald-500',
      },
      tag: 'dawra',
    };

    setClassesList([...classesList, newClass]);
    setIsAddModalOpen(false);
    setNewClassName('');
    setNewClassAr('');
    setNewTeacher('');
    setNewDesc('');
  };

  const tags = [
    { id: 'all', labelBn: 'সকল জামাত (১ হতে ১০)', labelEn: 'All Classes (1-10)' },
    { id: 'ibtidaiya', labelBn: '১. ইবতিদাইয়্যাহ', labelEn: '1. Ibtidaiya' },
    { id: 'mutawassita', labelBn: '২. মুতাওয়াসসিতাহ (মিজান ও নাহবেমীর)', labelEn: '2. Mutawassitah' },
    { id: 'sanabia', labelBn: '৩. সানাবিয়া (কাফিয়া ও শরহে বেকায়া)', labelEn: '3. Sanabia' },
    { id: 'fazilat', labelBn: '৪. ফজিলত (জালালাইন ও মেশকাত)', labelEn: '4. Fazilat' },
    { id: 'dawra', labelBn: '৫. দাওরায়ে হাদিস (তাকমিল)', labelEn: '5. Dawra Hadith' },
    { id: 'takhassus', labelBn: '৬. উচ্চতর তাকাসসুসাত (ইফতা ও আদব)', labelEn: '6. Takhassus' },
  ];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 relative">
      {/* 🌟 Global Floating Toast: ছবক সংরক্ষণ নোটিফিকেশন */}
      {sabaqSavedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-70 w-[92%] max-w-md p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/80 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xl shadow-emerald-950 animate-in slide-in-from-top duration-300">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>ছাত্র প্রোফাইলে ছবক সফলভাবে সংরক্ষিত হয়েছে!</span>
          </span>
          <span className="text-[10px] text-emerald-200 font-mono px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-500/40 shrink-0">
            সংরক্ষিত
          </span>
        </div>
      )}

      {/* Top Banner KPI Cards (Ultra-Slim & Compact - এক লাইনে ৩টি ছোট পরিচ্ছন্ন কার্ড) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {/* 1. Students count */}
        <div className="bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950 border border-blue-700/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white shadow-md shadow-blue-950/40 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-blue-300 truncate">
              {isNoorani
                ? (isMohila ? 'নূরানী ছাত্রী' : 'নূরানী শিক্ষার্থী')
                : (isMohila ? 'তালিবাত (ছাত্রী)' : 'তালিবুল ইলম')}
            </span>
            <div className="p-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              {isMohila ? <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300" /> : <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </div>
          </div>
          <div className="mt-1 sm:mt-1.5">
            <div className="text-base sm:text-xl font-black font-mono text-blue-400 leading-none">{toBnNum(totalStudents)}</div>
            <span className="text-[9px] sm:text-[10px] text-blue-200/80 mt-0.5 block truncate">
              {isNoorani
                ? (isMohila ? 'প্লে - ৫ম শ্রেণী (ছাত্রী)' : 'প্লে - ৫ম শ্রেণী (ছাত্র)')
                : (isMohila ? 'মহিলা শাখায় ছাত্রী' : 'ক্বওমী ছাত্র')}
            </span>
          </div>
        </div>

        {/* 2. Textbooks KPI Card - CLICKABLE TO OPEN BOOKS & SYLLABUS HUB */}
        <div
          onClick={() => setIsSyllabusHubOpen(true)}
          className="bg-gradient-to-br from-amber-950/90 via-stone-900 to-yellow-950 border border-amber-500/60 hover:border-amber-400 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white shadow-md shadow-amber-950/60 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex flex-col justify-between cursor-pointer group min-w-0"
          title="ক্লিক করে সকল ক্লাসের বই ও সিলেবাস বিস্তারিত দেখুন"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-amber-300 truncate flex items-center gap-0.5">
              <span>{isNoorani ? 'পাঠ্য বই' : 'পাঠ্য কিতাব'}</span>
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
            </span>
            <div className="p-1 rounded-lg bg-amber-500/30 text-amber-300 border border-amber-500/40 group-hover:scale-105 transition shrink-0">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          <div className="mt-1 sm:mt-1.5">
            <div className="text-base sm:text-xl font-black font-mono text-amber-400 leading-none">
              {toBnNum(totalKitabs)} <span className="text-[9px] sm:text-[10px] font-bold text-amber-200/90 font-sans">টি</span>
            </div>
            <div className="mt-0.5 flex items-center">
              <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-amber-300 bg-amber-900/60 px-1 py-0.2 rounded border border-amber-500/40 group-hover:bg-amber-800 truncate">
                <span>সিলেবাস</span>
                <ChevronRight className="w-2.5 h-2.5 shrink-0" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. Recognition & Board KPI Card - CUSTOMIZABLE */}
        <div
          onClick={handleOpenBoardModal}
          className="bg-gradient-to-br from-purple-950/90 via-slate-900 to-fuchsia-950 border border-purple-700/50 hover:border-purple-400 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-white shadow-md shadow-purple-950/40 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex flex-col justify-between cursor-pointer group min-w-0"
          title="ক্লিক করে শিক্ষাবোর্ডের নাম ও তথ্য কাস্টমাইজ করুন"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-purple-300 truncate flex items-center gap-1">
              <span>{isNoorani ? 'নূরানী বোর্ড' : (isMohila ? 'মহিলা বোর্ড' : 'বোর্ড')}</span>
              <span className="text-[8px] sm:text-[9px] text-purple-300/90 bg-purple-500/20 px-1 py-0.2 rounded border border-purple-500/30">
                এডিট
              </span>
            </span>
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:bg-purple-500/30 group-hover:scale-105 transition shrink-0">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-1.5">
            <div className="text-[10px] sm:text-xs font-black text-purple-300 group-hover:text-purple-200 transition truncate leading-snug">
              {isNoorani
                ? 'নূরানী তালীমুল কুরআন বোর্ড'
                : (isMohila ? 'বেফাকুল মাদারিস (মহিলা শাখা)' : boardPrimary)}
            </div>
            <span className="text-[8px] sm:text-[9px] text-purple-200/80 mt-0.5 block truncate">
              {isNoorani
                ? 'ও হুফফাজুল কুরআন ফাউন্ডেশন'
                : (isMohila ? 'আল-হাইআতুল উলয়া (বানাত)' : boardSecondary)}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 10 Qawmi Classes Cards (Clean, Ultra-Slim Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {classesList
          .sort((a, b) => a.order - b.order)
          .map((cls) => {
            const theme = cls.gradientTheme;

            // Remove extra outer parentheses if already present in Arabic text
            const cleanAr = cls.nameAr.replace(/^\(+|\)+$/g, '').trim();

            return (
              <div
                key={cls.id}
                onClick={() => setSelectedClassModal(cls)}
                className={`${theme.cardBg} ${theme.border} border rounded-2xl shadow-md ${theme.glow} hover:shadow-lg hover:border-white/30 transition-all duration-200 overflow-hidden group text-white p-2.5 sm:p-3 flex flex-col justify-between gap-2 relative cursor-pointer active:scale-[0.99]`}
                title="বিস্তারিত ও সিলেবাস দেখতে ক্লিক করুন"
              >
                {/* Slim Top Strip Accent */}
                <div className={`h-1 w-full absolute top-0 left-0 ${theme.stripColor}`} />

                {/* Top: Serial Badge, Class Names & Level / Govt Equiv */}
                <div className="pt-0.5 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0 font-mono font-black text-xs sm:text-sm shadow-xs`}>
                      #{toBnNum(cls.order)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition truncate">
                          {cls.nameBn}
                        </h3>
                        {cleanAr && (
                          <span className={`text-[10px] sm:text-[11px] font-arabic ${theme.accentText} font-semibold truncate`}>
                            ({cleanAr})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-slate-300">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                          {cls.levelBn}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium truncate">{cls.govEquivalentBn}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Teacher & Students */}
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-300">
                  <span className="truncate">
                    👤 <strong className="text-white font-medium">{cls.headTeacherBn}</strong>
                  </span>
                  <span className="shrink-0 text-slate-300">
                    👥 <strong className="text-white font-mono">{toBnNum(cls.studentCount)}</strong> জন
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* ========================================================================= */}
      {/* 🌟 10 CLASSES BOOKS & COMPLETE SYLLABUS HUB (FULL SCREEN PAGE VIEW)        */}
      {/* ========================================================================= */}
      {isSyllabusHubOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white w-screen h-screen overflow-hidden animate-in fade-in">
          <div className="bg-slate-900 text-white w-full h-full flex flex-col overflow-hidden">
            
            {/* ------------------------------------------------------------- */}
            {/* 📄 VIEW 1: 10 CLASS CARDS HUB (When no specific class selected) */}
            {/* ------------------------------------------------------------- */}
            {!selectedSyllabusClass ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Hub Header */}
                <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                      <Library className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ১০টি ক্বওমী জামাতের তালিকা (১ হতে ১০)
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          মোট {toBnNum(totalKitabs)} টি কিতাব
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white truncate mt-0.5">
                        ক্বওমী নেসাব ও পাঠ্য কিতাব-সিলেবাস ভাণ্ডার
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSyllabusHubOpen(false)}
                    className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtitle / Tip Bar */}
                <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 flex items-center gap-2 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>যেকোনো জামাতের 'সিলেবাস ও কিতাব দেখুন' বাটনে ক্লিক করলে সেই ক্লাসের তালিকা আলাদা পৃষ্ঠায় দেখতে পাবেন।</span>
                </div>

                {/* 🌟 10 CLASS CARDS GRID (Slim, Clean, Compact) */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {classesList
                      .sort((a, b) => a.order - b.order)
                      .map((cls) => {
                        const theme = cls.gradientTheme;

                        return (
                          <div
                            key={cls.id}
                            className={`${theme.cardBg} ${theme.border} border-2 rounded-2xl p-3 sm:p-3.5 text-white shadow-md transition-all duration-200 flex flex-col justify-between gap-2.5 relative overflow-hidden`}
                          >
                            {/* Accent Top Strip */}
                            <div className={`h-1 w-full absolute top-0 left-0 ${theme.stripColor}`} />

                            {/* Class Names */}
                            <div className="pt-0.5">
                              <h3 className="text-sm sm:text-base font-black text-white">
                                {cls.nameBn}
                              </h3>
                              <p className={`text-xs font-arabic ${theme.accentText} font-medium mt-0.5`}>
                                {cls.nameAr}
                              </p>
                            </div>

                            {/* Slim Teacher & Dedicated Button Shape for Syllabus */}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                              <span className="text-slate-300 truncate max-w-[170px] text-[11px] sm:text-xs">
                                👤 <strong className="text-white font-medium">{cls.headTeacherBn}</strong>
                              </span>

                              {/* 🌟 Dedicated Button Shape: Click only here to view syllabus */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSyllabusClass(cls);
                                  setSyllabusSearch('');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:from-amber-600 active:to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer shrink-0 group/btn"
                              >
                                <span>সিলেবাস ও কিতাব দেখুন</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-950 group-hover/btn:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Hub Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <div className="text-xs text-slate-400">
                    বেফাকুল মাদারিসিল আরাবিয়া ও আল-হাইআতুল উলয়া স্বীকৃত মূল সিলেবাস
                  </div>
                  <button
                    onClick={() => setIsSyllabusHubOpen(false)}
                    className="px-6 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* 📖 VIEW 2: DEDICATED SYLLABUS PAGE FOR THE SELECTED CLASS     */
              /* ------------------------------------------------------------- */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Class Page Header with Back Button and Single Clean Class Title */}
                <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 shrink-0">
                  <button
                    onClick={() => setSelectedSyllabusClass(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-black transition cursor-pointer shrink-0"
                  >
                    <span>← ফিরে যান</span>
                  </button>

                  {/* Single Clean Class Title above the cards */}
                  <div className="text-center min-w-0 flex-1 px-2">
                    <h2 className="text-sm sm:text-base font-black text-white truncate">
                      #{toBnNum(selectedSyllabusClass.order)}. {selectedSyllabusClass.nameBn}
                    </h2>
                    <span className="text-[11px] text-amber-400/90 font-mono font-bold block">
                      মোট কিতাব: {toBnNum(selectedSyllabusClass.kitabs.length)} টি
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => window.print()}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                      title="প্রিন্ট করুন"
                    >
                      <Printer className="w-4 h-4" />
                      <span>প্রিন্ট</span>
                    </button>
                    <button
                      onClick={() => setIsSyllabusHubOpen(false)}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Class Full Syllabus Scrollable Page */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {/* Search Bar for Kitabs */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={syllabusSearch}
                      onChange={(e) => setSyllabusSearch(e.target.value)}
                      placeholder="কিতাবের নাম অথবা লেখকের নাম খুঁজুন..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  {/* Slim Kitabs List: Compact Book Name, Author Name, and Slim Syllabus Button */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {selectedSyllabusClass.kitabs
                      .filter(
                        (k) =>
                          k.nameBn.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
                          k.nameAr.toLowerCase().includes(syllabusSearch.toLowerCase()) ||
                          k.authorBn.toLowerCase().includes(syllabusSearch.toLowerCase())
                      )
                      .map((kitab, kIndex) => (
                        <div
                          key={kIndex}
                          className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-2 sm:p-2.5 px-3 transition-all duration-150 shadow-sm flex items-center justify-between gap-2.5 group"
                        >
                          {/* Left: Serial + Kitab & Author Info */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs shrink-0">
                              {toBnNum(kIndex + 1)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                                  {kitab.nameBn}
                                </h4>
                                <span className="text-[10px] sm:text-[11px] font-arabic text-amber-400/90 hidden xs:inline truncate">
                                  ({kitab.nameAr})
                                </span>
                              </div>

                              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                                <span className="text-slate-400">মুসান্নিফ:</span>{' '}
                                <span className="text-slate-300 font-medium">{kitab.authorBn}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Slim Syllabus Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedKitabModal(kitab)}
                            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-[11px] sm:text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>সিলেবাস</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Class Page Footer */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setSelectedSyllabusClass(null)}
                    className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    ← পূর্বের তালিকায় ফিরে যান
                  </button>

                  <button
                    onClick={() => setIsSyllabusHubOpen(false)}
                    className="px-6 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📖 DEDICATED KITAB SYLLABUS MODAL (Opened from "সিলেবাস" button)          */}
      {/* ========================================================================= */}
      {selectedKitabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl border border-amber-500/40 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    বিষয়: {selectedKitabModal.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    পূর্ণমান: {toBnNum(selectedKitabModal.examMarks)} নম্বর
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {selectedKitabModal.nameBn}
                </h3>
                <p className="text-xs font-arabic text-amber-400 font-medium mt-0.5">
                  {selectedKitabModal.nameAr}
                </p>
              </div>

              <button
                onClick={() => setSelectedKitabModal(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Syllabus Details */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Author & Exam Meta */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">মুসান্নিফ (লেখক): </span>
                  <strong className="text-slate-200 block sm:inline mt-0.5 sm:mt-0 font-bold">
                    {selectedKitabModal.authorBn}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">পাশ মার্কস: </span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    {toBnNum(selectedKitabModal.passMarks || 40)}%
                  </strong>
                </div>
              </div>

              {/* Core Scope */}
              {selectedKitabModal.syllabusScopeBn && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300">
                  <span className="font-bold text-amber-300 block mb-1">
                    📖 সিলেবাসের মূল আলোচ্য বিষয় ও উদ্দেশ্য:
                  </span>
                  <p className="leading-relaxed text-slate-200">{selectedKitabModal.syllabusScopeBn}</p>
                </div>
              )}

              {/* 3 Term Syllabus Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  পরীক্ষাভিত্তিক সিলেবাস বণ্টন:
                </h4>

                {/* 1st Term */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">১ম সাময়িক পরীক্ষা</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4">
                    {selectedKitabModal.firstTermSyllabusBn || 'নির্ধারিত প্রাথমিক অংশ ও সংশ্লিষ্ট কায়েদা।'}
                  </p>
                </div>

                {/* 2nd Term */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-blue-400">২য় সাময়িক পরীক্ষা</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4">
                    {selectedKitabModal.secondTermSyllabusBn || 'মধ্যবর্তী অধ্যায়সমূহ ও ব্যবহারিক তামরীন।'}
                  </p>
                </div>

                {/* Final Term */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-400">বার্ষিক সমাপনী পরীক্ষা</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4">
                    {selectedKitabModal.finalTermSyllabusBn || 'সম্পূর্ণ কিতাবের সারসংক্ষেপ ও পূর্ণাঙ্গ সিলেবাস।'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>

              <button
                onClick={() => setSelectedKitabModal(null)}
                className="px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-lg"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🏛️ BOARD & RECOGNITION CUSTOMIZATION MODAL                                 */}
      {/* ========================================================================= */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl border border-purple-500/40 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    ক্বওমী শিক্ষা বোর্ড ও স্বীকৃতি কাস্টমাইজ করুন
                  </h3>
                  <p className="text-xs text-purple-300/80 mt-0.5">
                    আপনার মাদ্রাসার সংশ্লিষ্ট কওমী শিক্ষাবোর্ড বা স্বাধীন কমিটির নাম পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBoard} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Quick Board Presets */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                  জনপ্রিয় কওমী শিক্ষাবোর্ড তালিকা (এক ক্লিকে নির্বাচন করুন):
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
                  {QAWMI_BOARD_PRESETS.map((preset, pIdx) => {
                    const isSelected =
                      editBoardPrimary === preset.primary &&
                      editBoardSecondary === preset.secondary;

                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setEditBoardPrimary(preset.primary);
                          setEditBoardSecondary(preset.secondary);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-xs'
                            : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-xs font-bold block text-white truncate">
                            {preset.primary}
                          </strong>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {preset.secondary} • <span className="text-purple-400/90">{preset.desc}</span>
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    মূল বোর্ডের নাম (Primary Title) <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editBoardPrimary}
                    onChange={(e) => setEditBoardPrimary(e.target.value)}
                    placeholder="যেমন: আল-হাইআতুল উলয়া / বেফাকুল মাদারিসিল আরাবিয়া"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    সহযোগী বোর্ড / শাখা / সাব-টাইটেল (Secondary Line)
                  </label>
                  <input
                    type="text"
                    value={editBoardSecondary}
                    onChange={(e) => setEditBoardSecondary(e.target.value)}
                    placeholder="যেমন: ও বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ / চট্টগ্রাম অঞ্চল"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 to-slate-950 border border-purple-500/30">
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 block mb-1">
                  কার্ডের প্রিভিউ:
                </span>
                <div className="text-sm font-black text-purple-300">
                  {editBoardPrimary || 'বোর্ডের নাম'}
                </div>
                <div className="text-xs text-purple-200/80 mt-0.5">
                  {editBoardSecondary || 'সহযোগী লাইন'}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBoardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 100% FULL PAGE: SELECTED CLASS DETAILS & STUDENT ROSTER VIEW           */}
      {/* ========================================================================= */}
      {selectedClassModal && (() => {
        // Generate realistic student list for this class
        const studentsList = generateClassStudents(selectedClassModal, isMohila, isNoorani);

        // Filter students
        const filteredStudents = studentsList.filter((std) => {
          const matchesSearch =
            std.nameBn.toLowerCase().includes(classStudentSearch.toLowerCase()) ||
            std.fatherNameBn.toLowerCase().includes(classStudentSearch.toLowerCase()) ||
            std.roll.toString().includes(classStudentSearch) ||
            toBnNum(std.roll).includes(classStudentSearch) ||
            std.regId.toLowerCase().includes(classStudentSearch.toLowerCase()) ||
            std.districtBn.toLowerCase().includes(classStudentSearch.toLowerCase()) ||
            std.mobile.includes(classStudentSearch);

          if (!matchesSearch) return false;

          if (classStudentFilter === 'residential') return std.isResidential;
          if (classStudentFilter === 'non_residential') return !std.isResidential;
          if (classStudentFilter === 'hafez') return std.isHafez;
          return true;
        });

        const residentialCount = studentsList.filter((s) => s.isResidential).length;
        const nonResidentialCount = studentsList.length - residentialCount;
        const hafezCount = studentsList.filter((s) => s.isHafez).length;

        return (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white w-screen h-screen overflow-hidden animate-in fade-in">
            {/* Top Navigation Header */}
            <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    setSelectedClassModal(null);
                    setClassStudentSearch('');
                  }}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  title="পেছনে ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-bold">তালিকায় ফেরত</span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {selectedClassModal.levelBn} • {selectedClassModal.marhalaBn}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      সরকারি সমমান: <strong className="text-emerald-300">{selectedClassModal.govEquivalentBn}</strong>
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-white truncate mt-0.5">
                    {selectedClassModal.nameBn}{' '}
                    <span className="text-xs sm:text-sm font-arabic text-emerald-400 font-semibold font-normal ml-1">
                      ({selectedClassModal.nameAr})
                    </span>
                  </h2>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                  title="এই জামাত ও ছাত্র তালিকা প্রিন্ট করুন"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>প্রিন্ট</span>
                </button>

                <button
                  onClick={() => {
                    const targetClass = selectedClassModal;
                    setSelectedClassModal(null);
                    setSelectedSyllabusClass(targetClass);
                    setIsSyllabusHubOpen(true);
                  }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-amber-950"
                  title="১০ ক্লাসের সিলেবাস ভাণ্ডার"
                >
                  <Library className="w-4 h-4" />
                  <span>সিলেবাস ভাণ্ডার</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedClassModal(null);
                    setClassStudentSearch('');
                  }}
                  className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* In-Page Tab Navigation as 1:1 Equal Grid Cards (নো-স্ক্রোল, ৪টি সমান ঘর) */}
            <div className="bg-slate-900/95 px-2 sm:px-4 py-2 border-b border-slate-800 shrink-0">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-7xl mx-auto">
                {/* 1. ছাত্র/ছাত্রী তালিকা */}
                <button
                  onClick={() => setClassDetailTab('students')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer border shadow-sm ${
                    classDetailTab === 'students'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-950/60'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-0.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black leading-tight truncate w-full">
                    {isMohila ? 'ছাত্রী তালিকা' : 'ছাত্র তালিকা'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold opacity-90 font-mono">
                    ({toBnNum(selectedClassModal.studentCount)} জন)
                  </span>
                </button>

                {/* 2. ছবক গ্রহণ ও ট্র্যাকিং */}
                <button
                  onClick={() => {
                    setClassDetailTab('sabaq');
                    if (!selectedSabaqKitab && selectedClassModal.kitabs.length > 0) {
                      setSelectedSabaqKitab(selectedClassModal.kitabs[0].nameBn);
                    }
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer border shadow-sm ${
                    classDetailTab === 'sabaq'
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-950/60'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 mb-0.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black leading-tight truncate w-full">দৈনিক ছবক</span>
                  <span className="text-[9px] sm:text-[10px] text-cyan-400 font-bold opacity-90">
                    হাজিরা ও ট্র্যাকিং
                  </span>
                </button>

                {/* 3. পাঠ্য কিতাব */}
                <button
                  onClick={() => setClassDetailTab('kitabs')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer border shadow-sm ${
                    classDetailTab === 'kitabs'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500 ring-2 ring-amber-500/30 shadow-amber-950/60'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mb-0.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black leading-tight truncate w-full">পাঠ্য কিতাব</span>
                  <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold opacity-90 font-mono">
                    ({toBnNum(selectedClassModal.kitabs.length)} টি)
                  </span>
                </button>

                {/* 4. পরিচিতি ও লক্ষ্য */}
                <button
                  onClick={() => setClassDetailTab('overview')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer border shadow-sm ${
                    classDetailTab === 'overview'
                      ? 'bg-purple-950/90 text-purple-300 border-purple-500 ring-2 ring-purple-500/30 shadow-purple-950/60'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mb-0.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black leading-tight truncate w-full">জামাত লক্ষ্য</span>
                  <span className="text-[9px] sm:text-[10px] text-purple-400 font-bold opacity-90">
                    পরিচিতি
                  </span>
                </button>
              </div>
            </div>

            {/* Main Content Area Based on Active Tab */}
            <div ref={mainContentRef} className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/70">
              
              {/* ------------------------------------------------------------- */}
              {/* 👥 TAB 1: FULL STUDENT ROSTER LIST (ছাত্র তালিকা)              */}
              {/* ------------------------------------------------------------- */}
              {classDetailTab === 'students' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  {/* Search and Filters Bar */}
                  <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={classStudentSearch}
                        onChange={(e) => setClassStudentSearch(e.target.value)}
                        placeholder="তালিবুল ইলমের নাম, রোল, আইডি, গ্রাম বা মোবাইল দিয়ে খুঁজুন..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                    </div>

                    {/* Filter Pills as Equal Grid Cards (নো-স্ক্রোল) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setClassStudentFilter('all')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border shadow-sm ${
                          classStudentFilter === 'all'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-950/50'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">সকল ({toBnNum(studentsList.length)})</span>
                      </button>

                      <button
                        onClick={() => setClassStudentFilter('residential')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border shadow-sm ${
                          classStudentFilter === 'residential'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-950/50'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs">🏠</span>
                        <span className="truncate">আবাসিক ({toBnNum(residentialCount)})</span>
                      </button>

                      <button
                        onClick={() => setClassStudentFilter('non_residential')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border shadow-sm ${
                          classStudentFilter === 'non_residential'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-950/50'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs">🚶</span>
                        <span className="truncate">অনাবাসিক ({toBnNum(nonResidentialCount)})</span>
                      </button>

                      <button
                        onClick={() => setClassStudentFilter('hafez')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border shadow-sm ${
                          classStudentFilter === 'hafez'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-950/50'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs">📖</span>
                        <span className="truncate">হাফেজ ({toBnNum(hafezCount)})</span>
                      </button>
                    </div>
                  </div>

                  {/* Slim Modern Student Cards List (স্লিম কার্ড) */}
                  <div className="space-y-1.5">
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                        কোন ছাত্রের তথ্য পাওয়া যায়নি
                      </div>
                    ) : (
                      filteredStudents.map((std) => (
                        <div
                          key={std.id}
                          onClick={() => setSelectedStudentDetail(std)}
                          className="group flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs hover:shadow-md hover:shadow-emerald-950/20 active:scale-[0.995]"
                        >
                          {/* Left: Roll, Avatar, Name & Reg ID */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono font-black text-xs text-emerald-400 shrink-0 w-7 text-center">
                              #{toBnNum(std.roll)}
                            </span>

                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0 group-hover:border-emerald-400 transition">
                              {std.nameBn.slice(0, 1)}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                                <span className="truncate group-hover:text-emerald-300 transition">{std.nameBn}</span>
                                {std.isHafez && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                    {isMohila ? 'হাফেজা' : 'হাফেজ'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                আইডি: {std.regId}
                              </span>
                            </div>
                          </div>

                          {/* Right: Boarding Badge & Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                std.isResidential
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {std.isResidential ? 'আবাসিক' : 'অনাবাসিক'}
                            </span>

                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {toBnNum(std.attendancePct)}%
                            </span>

                            <div className="p-1 rounded-lg text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-850 transition">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 🌟 Dedicated Student Details & Date-Wise Sabaq Report Modal (ছাত্র প্রোফাইল ও তারিখ অনুযায়ী ছবক রিপোর্ট প্রিন্ট/ডাউনলোড) */}
              {selectedStudentDetail && (() => {
                const allLogs = getStudentSabaqLogs(selectedStudentDetail.id, selectedClassModal?.nameBn);
                const filteredLogs = allLogs.filter((log) => {
                  if (studentReportFilterDate === 'today') {
                    return log.date === sabaqDate || log.date === new Date().toISOString().split('T')[0];
                  }
                  if (studentReportFilterDate === '7days') {
                    const d = new Date(log.date);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
                    return diffDays <= 7;
                  }
                  if (studentReportFilterDate === '30days') {
                    const d = new Date(log.date);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
                    return diffDays <= 30;
                  }
                  return true;
                });

                const mumtazCount = filteredLogs.filter((l) => l.grade === 'mumtaz').length;
                const totalLogs = filteredLogs.length;

                return (
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 text-white rounded-3xl border border-emerald-500/40 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                      {/* Modal Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-black text-xl shadow-inner">
                            {selectedStudentDetail.nameBn.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-base sm:text-lg font-black text-white">{selectedStudentDetail.nameBn}</h3>
                              {selectedStudentDetail.isHafez && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  📖 হাফেজ
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-emerald-300/80 font-mono block mt-0.5">
                              রোল: #{toBnNum(selectedStudentDetail.roll)} • আইডি: {selectedStudentDetail.regId}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedStudentDetail(null)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Subtabs Selector */}
                      <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setStudentProfileTab('info')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            studentProfileTab === 'info'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>ব্যক্তিগত তথ্য</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentProfileTab('sabaq_report')}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            studentProfileTab === 'sabaq_report'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>তারিখ অনুযায়ী ছবক ও রিপোর্ট</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                            {toBnNum(allLogs.length)}
                          </span>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
                        {studentProfileTab === 'info' ? (
                          <div className="space-y-3.5">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25">
                                <span className="text-[10px] text-emerald-300/70 block font-medium">পিতার নাম</span>
                                <strong className="text-xs font-bold text-white mt-0.5 block">{selectedStudentDetail.fatherNameBn}</strong>
                              </div>

                              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25">
                                <span className="text-[10px] text-emerald-300/70 block font-medium">স্থায়ী জেলা / ঠিকানা</span>
                                <strong className="text-xs font-bold text-emerald-300 mt-0.5 block flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>{selectedStudentDetail.districtBn}</span>
                                </strong>
                              </div>

                              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25">
                                <span className="text-[10px] text-emerald-300/70 block font-medium">বোর্ডিং ধরণ</span>
                                <span
                                  className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    selectedStudentDetail.isResidential
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}
                                >
                                  {selectedStudentDetail.isResidential ? '🏠 আবাসিক ছাত্র' : '🚶 অনাবাসিক ছাত্র'}
                                </span>
                              </div>

                              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25">
                                <span className="text-[10px] text-emerald-300/70 block font-medium">বর্তমান অবস্থা</span>
                                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>নিয়মিত তালিবুল ইলম</span>
                                </span>
                              </div>
                            </div>

                            {/* Attendance Bar */}
                            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-300 font-bold">বার্ষিক মোট উপস্থিতি</span>
                                <strong className="font-mono text-emerald-400 font-black">{toBnNum(selectedStudentDetail.attendancePct)}%</strong>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${selectedStudentDetail.attendancePct}%` }}
                                />
                              </div>
                            </div>

                            {/* Contact / Phone Action */}
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-sm">
                              <div>
                                <span className="text-[10px] text-emerald-300/70 block">অভিভাবকের যোগাযোগ নম্বর</span>
                                <span className="font-mono font-bold text-white text-xs sm:text-sm">{selectedStudentDetail.mobile}</span>
                              </div>
                              <a
                                href={`tel:${selectedStudentDetail.mobile}`}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-950"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>কল দিন</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            {/* Top Filter & Print / Download Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                              {/* Date Filter Pills */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { id: 'all', label: 'সকল তারিখ' },
                                  { id: 'today', label: 'আজকের' },
                                  { id: '7days', label: 'বিগত ৭ দিন' },
                                  { id: '30days', label: 'বিগত ৩০ দিন' },
                                ].map((f) => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setStudentReportFilterDate(f.id as any)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                                      studentReportFilterDate === f.id
                                        ? 'bg-emerald-600 text-white border-emerald-400'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                                    }`}
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>

                              {/* Print & Download Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePrintStudentReport(selectedStudentDetail, filteredLogs)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-950"
                                  title="তারিখ অনুযায়ী ছবক রিপোর্ট প্রিন্ট করুন"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>প্রিন্ট</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadStudentReport(selectedStudentDetail, filteredLogs)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-cyan-950"
                                  title="ছবক রিপোর্ট ডাউনলোড করুন"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>ডাউনলোড</span>
                                </button>
                              </div>
                            </div>

                            {/* Summary Badges */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block">মোট ছবক দিবস</span>
                                <strong className="text-sm font-mono text-white mt-0.5 block">{toBnNum(totalLogs)} টি</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                                <span className="text-[10px] text-emerald-400 block">মুমতাজ প্রাপ্তি</span>
                                <strong className="text-sm font-mono text-emerald-300 mt-0.5 block">{toBnNum(mumtazCount)} টি</strong>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                                <span className="text-[10px] text-blue-400 block">মোট উপস্থিতি</span>
                                <strong className="text-sm font-mono text-blue-300 mt-0.5 block">{toBnNum(selectedStudentDetail.attendancePct)}%</strong>
                              </div>
                            </div>

                            {/* Date-wise Table */}
                            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/70">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800 font-bold text-[11px]">
                                    <tr>
                                      <th className="p-2.5">তারিখ</th>
                                      <th className="p-2.5">কিতাব</th>
                                      <th className="p-2.5">পঠিত ছবক</th>
                                      <th className="p-2.5 text-center">গ্রেড</th>
                                      <th className="p-2.5">মন্তব্য</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60">
                                    {filteredLogs.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="p-6 text-center text-slate-400">
                                          এই সময়ে কোন ছবক রেকর্ড নেই
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredLogs.map((l, lIdx) => (
                                        <tr key={lIdx} className="hover:bg-slate-800/40 transition">
                                          <td className="p-2.5 font-mono text-emerald-400 text-[11px] whitespace-nowrap">
                                            {l.date}
                                          </td>
                                          <td className="p-2.5 font-bold text-white whitespace-nowrap">
                                            {l.kitab}
                                          </td>
                                          <td className="p-2.5 text-slate-300">
                                            {l.lesson}
                                          </td>
                                          <td className="p-2.5 text-center whitespace-nowrap">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                l.grade === 'mumtaz'
                                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                  : l.grade === 'jayyid_jiddan'
                                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                  : l.grade === 'jayyid'
                                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                  : l.grade === 'maqbul'
                                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                  : l.grade === 'na_dahenda'
                                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                  : 'bg-slate-800 text-slate-400'
                                              }`}
                                            >
                                              {l.grade === 'mumtaz'
                                                ? '⭐ মুমতাজ'
                                                : l.grade === 'jayyid_jiddan'
                                                ? '👍 জা. জিদ্দান'
                                                : l.grade === 'jayyid'
                                                ? '👌 জায়্যিদ'
                                                : l.grade === 'maqbul'
                                                ? '⚠️ মাকবুল'
                                                : l.grade === 'na_dahenda'
                                                ? '❌ না-দাহেন্দা'
                                                : '🚫 অনুপ.'}
                                            </span>
                                          </td>
                                          <td className="p-2.5 text-slate-400 text-[11px]">
                                            {l.remarks}
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
                        {studentProfileTab === 'info' ? (
                          <button
                            onClick={() => setStudentProfileTab('sabaq_report')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ছবক রিপোর্ট ও প্রিন্ট দেখুন</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePrintStudentReport(selectedStudentDetail, filteredLogs)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>রিপোর্ট প্রিন্ট করুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ------------------------------------------------------------- */}
              {/* 📖 TAB 2: DAILY SABAQ TRACKING & GRADING (ছবক নেওয়া ও ট্র্যাকিং) */}
              {/* ------------------------------------------------------------- */}
              {classDetailTab === 'sabaq' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  {/* Control Bar: Date Selector, Kitab Dropdown, Bulk Actions & Exit Close Button */}
                  <div className="bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-2.5 shadow-md">
                    {/* Top Row: Date Selector & Exit Button (তীর চিহ্নিত ডান পাশের শীর্ষে ❌ বোতাম) */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Date Picker */}
                      <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-xs">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-400 font-medium">তারিখ:</span>
                        <input
                          type="date"
                          value={sabaqDate}
                          onChange={(e) => setSabaqDate(e.target.value)}
                          className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
                        />
                      </div>

                      {/* ❌ Exit / Close Sabaq Tab Button (অন্য পেজে যাবে না, এই ক্লাসের ছাত্র তালিকায় ফিরে যাবে) */}
                      <button
                        type="button"
                        onClick={() => setClassDetailTab('students')}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 active:bg-rose-700 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                        title="ছবক এন্ট্রি বন্ধ করে ছাত্র তালিকায় ফিরে যান"
                      >
                        <X className="w-4 h-4 text-rose-400 hover:text-white" />
                        <span className="hidden sm:inline">ছাত্র তালিকা</span>
                      </button>
                    </div>

                    {/* Kitab Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-xs w-full">
                      <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-slate-400 font-medium shrink-0">কিতাব:</span>
                      <select
                        value={selectedSabaqKitab || (selectedClassModal.kitabs[0]?.nameBn || '')}
                        onChange={(e) => setSelectedSabaqKitab(e.target.value)}
                        className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer w-full text-xs"
                      >
                        {selectedClassModal.kitabs.map((k, kIdx) => (
                          <option key={kIdx} value={k.nameBn} className="bg-slate-900 text-white">
                            {k.nameBn} ({k.subject})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Bulk Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleBulkGrade(selectedClassModal.id, studentsList, 'mumtaz')}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>সবাইকে মুমতাজ দিন</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkGrade(selectedClassModal.id, studentsList, 'jayyid_jiddan')}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>সবাইকে জায়্যিদ জিদ্দান</span>
                      </button>
                    </div>
                  </div>

                  {/* Sabaq Analytics Summary Cards */}
                  {(() => {
                    const activeKitab = selectedSabaqKitab || (selectedClassModal.kitabs[0]?.nameBn || 'সাধারণ ছবক');
                    let mumtazCount = 0;
                    let jayyidCount = 0;
                    let naDahendaCount = 0;
                    let absentCount = 0;
                    let enteredCount = 0;

                    studentsList.forEach((s) => {
                      const rec = sabaqRecords[`${sabaqDate}_${selectedClassModal.id}_${activeKitab}_${s.id}`];
                      if (rec) {
                        if (rec.lessonRange || rec.grade) enteredCount++;
                        if (rec.grade === 'mumtaz') mumtazCount++;
                        else if (rec.grade === 'jayyid_jiddan' || rec.grade === 'jayyid') jayyidCount++;
                        else if (rec.grade === 'na_dahenda') naDahendaCount++;
                        else if (rec.grade === 'absent') absentCount++;
                      }
                    });

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                          <span className="text-slate-400 text-[11px]">মোট তালিবুল ইলম</span>
                          <strong className="text-base font-black text-white font-mono mt-0.5">
                            {toBnNum(studentsList.length)} জন
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex flex-col justify-between">
                          <span className="text-emerald-400 text-[11px] font-bold">ছবক দিয়েছে</span>
                          <strong className="text-base font-black text-emerald-400 font-mono mt-0.5">
                            {toBnNum(enteredCount)} জন
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex flex-col justify-between">
                          <span className="text-amber-400 text-[11px] font-bold">⭐ মুমতাজ (উৎকৃষ্ট)</span>
                          <strong className="text-base font-black text-amber-400 font-mono mt-0.5">
                            {toBnNum(mumtazCount)} জন
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-blue-500/30 flex flex-col justify-between">
                          <span className="text-blue-400 text-[11px] font-bold">👍 জায়্যিদ (উত্তম)</span>
                          <strong className="text-base font-black text-blue-400 font-mono mt-0.5">
                            {toBnNum(jayyidCount)} জন
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30 flex flex-col justify-between col-span-2 sm:col-span-1">
                          <span className="text-rose-400 text-[11px] font-bold">❌ না-দাহেন্দা / অনুপস্থিত</span>
                          <strong className="text-base font-black text-rose-400 font-mono mt-0.5">
                            {toBnNum(naDahendaCount + absentCount)} জন
                          </strong>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Toast Save Indicator */}
                  {sabaqSavedToast && (
                    <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl shadow-emerald-950/70 animate-in fade-in">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>ছাত্র প্রোফাইলে ছবকের মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে!</span>
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-mono px-2 py-0.5 rounded-md bg-emerald-900/40 border border-emerald-500/30">সংরক্ষিত</span>
                    </div>
                  )}

                  {/* Single Dedicated Interactive Sabaq Card with Popup Student Selector (একটি কার্ড ও লুকানো ছাত্র তালিকা পপআপ) */}
                  {(() => {
                    const activeKitab = selectedSabaqKitab || (selectedClassModal.kitabs[0]?.nameBn || 'সাধারণ ছবক');
                    const currentStudent = studentsList.find((s) => s.id === activeSabaqStudentId) || studentsList[0];
                    const currentIndex = studentsList.findIndex((s) => s.id === (currentStudent?.id || ''));

                    if (!currentStudent) {
                      return (
                        <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                          কোন ছাত্র পাওয়া যায়নি
                        </div>
                      );
                    }

                    const recKey = `${sabaqDate}_${selectedClassModal.id}_${activeKitab}_${currentStudent.id}`;
                    const rec = sabaqRecords[recKey] || { lessonRange: '', grade: 'mumtaz', remarks: '' };

                    const filteredPickerStudents = studentsList.filter((s) => {
                      if (!sabaqPickerSearch) return true;
                      const q = sabaqPickerSearch.toLowerCase();
                      return (
                        s.nameBn.toLowerCase().includes(q) ||
                        s.roll.toString().includes(q) ||
                        s.regId.toLowerCase().includes(q) ||
                        s.fatherNameBn.toLowerCase().includes(q)
                      );
                    });

                    return (
                      <div className="space-y-3">
                        {/* 🎴 The Single Main Sabaq Evaluation Card (তীর চিহ্নিত ডিপ এমারেল্ড থিম অনুযায়ী পুরো কার্ডের রূপরেখা) */}
                        <div className="bg-slate-900/90 bg-gradient-to-b from-slate-900 via-emerald-950/30 to-slate-900 rounded-3xl border border-emerald-500/40 p-4 sm:p-6 shadow-2xl shadow-emerald-950/50 space-y-4 sm:space-y-5">
                          {/* Full-Width Clickable Student Header Banner (পুরোটাতে টাচ করলেই ছাত্র তালিকা পপআপ বা প্রোফাইল আসবে) */}
                          <div className="pb-3 border-b border-emerald-500/20">
                            <div className="w-full group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950/80 active:bg-emerald-900/70 border border-emerald-500/50 hover:border-emerald-400 ring-1 ring-emerald-500/30 hover:ring-emerald-400/50 transition-all shadow-lg shadow-emerald-950/40 select-none">
                              {/* Left / Center: Click to open Student Profile & Date-wise Report */}
                              <div
                                onClick={() => {
                                  setSelectedStudentDetail(currentStudent);
                                  setStudentProfileTab('info');
                                }}
                                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                title="ছাত্রের প্রোফাইল ও রিপোর্ট দেখতে ক্লিক করুন"
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 flex items-center justify-center font-mono font-black text-sm shrink-0 group-hover:border-emerald-300 group-hover:bg-emerald-500/35 transition shadow-inner">
                                  #{toBnNum(currentStudent.roll)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5 truncate">
                                    <span className="truncate group-hover:text-emerald-300 transition">
                                      {currentStudent.nameBn}
                                    </span>
                                    {currentStudent.isHafez && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                        {isMohila ? 'হাফেজা' : 'হাফেজ'}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-emerald-300/80 block truncate mt-0.5 group-hover:text-emerald-200 transition">
                                    পিতা: {currentStudent.fatherNameBn} • আইডি: {currentStudent.regId}
                                  </span>
                                </div>
                              </div>

                              {/* Right: Click to open 50 Student Picker List */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsSabaqStudentPickerOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 active:bg-emerald-500/50 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 text-xs font-bold shrink-0 transition shadow-inner cursor-pointer"
                                title="ছাত্র তালিকা পপআপ খুলুন"
                              >
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="hidden sm:inline">ছাত্র তালিকা</span>
                                <ChevronDown className="w-4 h-4 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>

                          {/* Sabaq Content Input */}
                          <div>
                            <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                              <span>আজকের ছবক (পৃষ্ঠা / হাদিস / মতন / ইবারত):</span>
                            </label>
                            <input
                              type="text"
                              value={rec.lessonRange}
                              onChange={(e) =>
                                updateStudentSabaq(selectedClassModal.id, currentStudent.id, 'lessonRange', e.target.value)
                              }
                              placeholder="যেমন: পৃষ্ঠা নং ১৫ (হাদিস ১-৫) / বাবুন নিকাহ"
                              className="w-full px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 focus:border-emerald-400 text-xs sm:text-sm text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                            />
                          </div>

                          {/* Sabaq Grade Selector (6 Buttons in Emerald Card Style) */}
                          <div>
                            <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>ছবকের মান / গ্রেড নির্বাচন:</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                              {[
                                { id: 'mumtaz', label: '⭐ মুমতাজ', desc: 'উৎকৃষ্ট', bg: 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/50' },
                                { id: 'jayyid_jiddan', label: '👍 জা. জিদ্দান', desc: 'উত্তম', bg: 'bg-blue-600 text-white border-blue-400 shadow-blue-900/50' },
                                { id: 'jayyid', label: '👌 জায়্যিদ', desc: 'ভালো', bg: 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/50' },
                                { id: 'maqbul', label: '⚠️ মাকবুল', desc: 'চলনসই', bg: 'bg-amber-600 text-white border-amber-400 shadow-amber-900/50' },
                                { id: 'na_dahenda', label: '❌ না-দাহেন্দা', desc: 'পড়া দেয়নি', bg: 'bg-rose-600 text-white border-rose-400 shadow-rose-900/50' },
                                { id: 'absent', label: '🚫 অনুপস্থিত', desc: 'হাজির নেই', bg: 'bg-slate-700 text-slate-200 border-slate-500 shadow-slate-900/50' },
                              ].map((g) => {
                                const isSelected = rec.grade === g.id;
                                return (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() =>
                                      updateStudentSabaq(selectedClassModal.id, currentStudent.id, 'grade', g.id)
                                    }
                                    className={`p-3 rounded-2xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                                      isSelected
                                        ? `${g.bg} ring-2 ring-white/60 shadow-lg scale-[1.02]`
                                        : 'bg-emerald-950/40 text-emerald-300/90 hover:text-white border-emerald-500/30 hover:border-emerald-400/70 hover:bg-emerald-950/70 shadow-inner'
                                    }`}
                                  >
                                    <span className="font-bold text-xs sm:text-sm">{g.label}</span>
                                    <span className="text-[10px] opacity-80 mt-0.5">{g.desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Remarks Input */}
                          <div>
                            <label className="text-xs font-semibold text-emerald-300/80 block mb-1">
                              উস্তাদের মন্তব্য (ঐচ্ছিক):
                            </label>
                            <input
                              type="text"
                              value={rec.remarks}
                              onChange={(e) =>
                                updateStudentSabaq(selectedClassModal.id, currentStudent.id, 'remarks', e.target.value)
                              }
                              placeholder="মাশাল্লাহ / মনোযোগ বাড়ানো প্রয়োজন"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/50 text-xs text-white placeholder-emerald-200/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-400 transition"
                            />
                          </div>

                          {/* 💾 সংরক্ষণ বোতাম (উস্তাদ নিজে ছাত্রের নাম নির্বাচন করে ছবক এন্ট্রি ও সংরক্ষণ করবেন) */}
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Ensure current record is formally saved in student profile storage
                                updateStudentSabaq(selectedClassModal.id, currentStudent.id, 'remarks', rec.remarks || '');
                                
                                // Show global toast notification for this student
                                setSabaqSavedToast(true);
                                setTimeout(() => setSabaqSavedToast(false), 2500);
                              }}
                              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-400 text-white font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/70 select-none active:scale-[0.98]"
                            >
                              <Save className="w-5 h-5" />
                              <span>সংরক্ষণ</span>
                            </button>
                          </div>
                        </div>

                        {/* 🌟 Popup Modal: Hidden Student List for Sabaq Selection (ক্লিক করলে পপ আপ হয়ে আসা ছাত্র তালিকা) */}
                        {isSabaqStudentPickerOpen && (
                          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
                            <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                              {/* Popup Header */}
                              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                                <div>
                                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                    <span>তালিবুল ইলম নির্বাচন ({toBnNum(studentsList.length)} জন)</span>
                                  </h3>
                                  <span className="text-xs text-slate-400 mt-0.5 block">
                                    যেকোনো ছাত্রে ক্লিক করে ছবক গ্রহণ করুন
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsSabaqStudentPickerOpen(false);
                                  }}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Students List in Popup (সার্চ অপশন ছাড়া সরাসরি পূর্ণ তালিকা) */}
                              <div className="p-3 sm:p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-800/50">
                                {studentsList.length === 0 ? (
                                  <div className="p-6 text-center text-slate-400 text-xs">
                                    কোন ছাত্র পাওয়া যায়নি
                                  </div>
                                ) : (
                                  studentsList.map((s) => {
                                    const sRec = sabaqRecords[`${sabaqDate}_${selectedClassModal.id}_${activeKitab}_${s.id}`];
                                    const isCurrent = s.id === currentStudent.id;

                                    return (
                                      <div
                                        key={s.id}
                                        onClick={() => {
                                          setActiveSabaqStudentId(s.id);
                                          setIsSabaqStudentPickerOpen(false);
                                        }}
                                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition ${
                                          isCurrent
                                            ? 'bg-emerald-950/80 border border-emerald-500/80 text-emerald-300'
                                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <span className="w-7 text-center font-mono font-black text-xs text-emerald-400">
                                            #{toBnNum(s.roll)}
                                          </span>
                                          <div className="min-w-0">
                                            <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 truncate">
                                              <span className="truncate">{s.nameBn}</span>
                                              {s.isHafez && (
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                  {isMohila ? 'হাফেজা' : 'হাফেজ'}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 block truncate">
                                              পিতা: {s.fatherNameBn} • আইডি: {s.regId}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {sRec?.grade ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                              {sRec.grade === 'mumtaz'
                                                ? '⭐ মুমতাজ'
                                                : sRec.grade === 'jayyid_jiddan'
                                                ? '👍 জা. জিদ্দান'
                                                : sRec.grade === 'jayyid'
                                                ? '👌 জায়্যিদ'
                                                : sRec.grade === 'maqbul'
                                                ? '⚠️ মাকবুল'
                                                : sRec.grade === 'na_dahenda'
                                                ? '❌ না-দাহেন্দা'
                                                : '🚫 অনুপ.'}
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-slate-500">বাকি আছে</span>
                                          )}
                                          <ChevronRight className="w-4 h-4 text-slate-500" />
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Popup Footer */}
                              <div className="p-3 bg-slate-950 border-t border-slate-800 text-right shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsSabaqStudentPickerOpen(false);
                                    setSabaqPickerSearch('');
                                  }}
                                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                                >
                                  বন্ধ করুন
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 📚 TAB 3: KITABS & MARKS TABLE (পাঠ্য কিতাব ও মানবণ্টন)           */}
              {/* ------------------------------------------------------------- */}
              {classDetailTab === 'kitabs' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  {/* Top Summary Banner */}
                  <div className="bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white">
                          {selectedClassModal.nameBn} — মোট পাঠ্য কিতাব ({toBnNum(selectedClassModal.kitabs.length)} টি)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          জামাতের প্রতিটি কিতাবের বিষয়বস্তু, সাপ্তাহিক পিরিয়ড ও পূর্ণমান
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Grid Cards (মোবাইল ও ডেক্সটপ উভয় স্ক্রিনের জন্য সম্পূর্ণ ফ্রেশ ও ক্লিয়ার কার্ড লেআউট) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedClassModal.kitabs.map((k, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/95 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top: Serial, Name, Arabic & Subject Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                                #{toBnNum(i + 1)}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-black text-white text-sm leading-snug">{k.nameBn}</h4>
                                <span className="text-xs font-arabic text-emerald-400 block mt-0.5">{k.nameAr}</span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold shrink-0">
                              {k.subject}
                            </span>
                          </div>

                          {/* Info Box: Author & Weekly Periods */}
                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 mt-3">
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block font-medium">মুসান্নিফ (লেখক):</span>
                              <strong className="text-slate-200 font-semibold text-[11px] truncate block mt-0.5">
                                {k.authorBn}
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">সাপ্তাহিক ক্লাস:</span>
                              <strong className="text-cyan-400 font-mono font-bold text-[11px] block mt-0.5">
                                {toBnNum(k.weeklyPeriods || 5)} ঘণ্টি / পিরিয়ড
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions: Marks & Syllabus Modal Trigger */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-400 text-[10px] block">পরীক্ষার পূর্ণমান:</span>
                            <strong className="text-amber-400 font-mono font-black text-sm">
                              {toBnNum(k.examMarks)} নম্বর
                            </strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedKitabModal(k)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600 active:bg-amber-700 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Library className="w-3.5 h-3.5" />
                            <span>সিলেবাস দেখুন</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 📋 TAB 4: OVERVIEW & CURRICULUM GOALS (জামাত পরিচিতি)          */}
              {/* ------------------------------------------------------------- */}
              {classDetailTab === 'overview' && (
                <div className="space-y-4 max-w-5xl mx-auto">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        জামাত পরিচিতি ও শিক্ষাক্রমের লক্ষ্য
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {selectedClassModal.nameBn} ({selectedClassModal.nameAr})
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                        {selectedClassModal.descriptionBn}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-semibold">মারহালা ও স্তর:</span>
                        <strong className="text-sm font-bold text-emerald-300 mt-0.5 block">
                          {selectedClassModal.levelBn} • {selectedClassModal.marhalaBn}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-semibold">সরকারি সমমান:</span>
                        <strong className="text-sm font-bold text-amber-300 mt-0.5 block">
                          {selectedClassModal.govEquivalentBn}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-semibold">প্রধান শিক্ষক / মুদাররিস:</span>
                        <strong className="text-sm font-bold text-white mt-0.5 block">
                          {selectedClassModal.headTeacherBn}
                        </strong>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block font-semibold">বার্ষিক মেয়াদকাল:</span>
                        <strong className="text-sm font-bold text-white mt-0.5 block">
                          {toBnNum(selectedClassModal.durationMonths)} মাস (১ শিক্ষাবর্ষ)
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Add New Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                নতুন ক্বওমী জামাত বা ক্লাস যুক্ত করুন
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  জামাতের নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তাকমিল ১ম বর্ষ বা সানাবিয়া"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  জামাতের আরবি নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: المرحلة العالية"
                  value={newClassAr}
                  onChange={(e) => setNewClassAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-arabic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    মারহালা / বোর্ড স্তর
                  </label>
                  <select
                    value={newMarhala}
                    onChange={(e) => setNewMarhala(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="ইবতিদাইয়্যাহ (বেফাক)">১. ইবতিদাইয়্যাহ (৫ম শ্রেণী)</option>
                    <option value="মুতাওয়াসসিতাহ (বেফাক)">২. মুতাওয়াসসিতাহ (৮ম শ্রেণী)</option>
                    <option value="সানাবিয়া আম্মাহ (বেফাক)">৩. সানাবিয়া আম্মাহ (SSC)</option>
                    <option value="সানাবিয়া উলইয়া (বেফাক)">৪. সানাবিয়া উলইয়া (HSC)</option>
                    <option value="ফজিলত (বেফাকুল মাদারিস)">৫. ফজিলত (ডিগ্রী/স্নাতক)</option>
                    <option value="তাকমিল / আল-হাইআতুল উলয়া">৬. তাকমিল (মাস্টার্স)</option>
                    <option value="তাকাসসুসাত (উচ্চতর গবেষণা)">৭. তাকাসসুসাত (ইফতা/আদব)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    সরকারি সমমান
                  </label>
                  <input
                    type="text"
                    value={newGovEquiv}
                    onChange={(e) => setNewGovEquiv(e.target.value)}
                    placeholder="যেমন: ফাজিল সমমান"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    প্রধান মুদাররিস / শিক্ষক
                  </label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="মাওলানা / মুফতি..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    আনুমানিক ছাত্র সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={newStudents}
                    onChange={(e) => setNewStudents(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  সংক্ষিপ্ত বিবরণ
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="জামাত ও নেসাব সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

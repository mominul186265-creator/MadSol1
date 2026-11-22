import React, { useState, useRef } from 'react';
import {
  X,
  LogOut,
  ShieldCheck,
  FileText,
  Users,
  Calendar,
  Layers,
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Banknote,
  Gift,
  HeartHandshake,
  CreditCard,
  Award,
  QrCode,
  MessageSquare,
  LifeBuoy,
  Building2,
  ShieldAlert,
  Sliders,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MadSolLogo } from '../common/MadSolLogo';
import { RoleSlug } from '../../types/step1';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSecretAdmin?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  onOpenSecretAdmin,
}) => {
  const { user, institution, logout } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const nextCount = logoClicks + 1;
    if (nextCount >= 7) {
      setLogoClicks(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 50, 60]);
      }
      onClose();
      if (onOpenSecretAdmin) {
        onOpenSecretAdmin();
      }
    } else {
      setLogoClicks(nextCount);
      clickTimeoutRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 2500);
    }
  };

  if (!isOpen) return null;

  const role = user?.role_id;
  const isAdminOrPrincipal = role === 'super_admin' || role === 'institution_admin' || role === 'principal';

  const getRoleLabel = (r?: RoleSlug) => {
    switch (r) {
      case 'super_admin':
        return language === 'bn' ? 'সুপার এডমিন' : 'Super Admin';
      case 'institution_admin':
        return language === 'bn' ? 'মুহতামিম / পরিচালক' : 'Muhtamim / Director';
      case 'principal':
        return language === 'bn' ? 'মুহতামিম / প্রিন্সিপাল' : 'Muhtamim / Principal';
      case 'teacher':
        return language === 'bn' ? 'সহকারী শিক্ষক' : 'Assistant Teacher';
      case 'accountant':
        return language === 'bn' ? 'হিসাবরক্ষক' : 'Accountant';
      case 'guardian':
        return language === 'bn' ? 'অভিভাবক' : 'Guardian';
      case 'student':
        return language === 'bn' ? 'শিক্ষার্থী' : 'Student';
      default:
        return r || '';
    }
  };

  // Section 1: Academic, Admissions & Schedule (Excludes Home Page modules)
  const ACADEMIC_EXTRA_ITEMS = [
    {
      id: 'drawer-nav-admissions',
      path: '/admissions',
      labelBn: 'অনলাইন ভর্তি আবেদন',
      labelEn: 'Online Admission',
      subtitleBn: 'নতুন ভর্তি ফরম ও অনুমোদন',
      subtitleEn: 'Admission applications & review',
      icon: FileText,
      iconBg: 'bg-emerald-600 text-white',
      allowed: isAdminOrPrincipal,
    },
    {
      id: 'drawer-nav-guardians',
      path: '/guardians',
      labelBn: 'অভিভাবক তালিকা',
      labelEn: 'Guardians Directory',
      subtitleBn: 'অভিভাবক তথ্য ও যোগাযোগ',
      subtitleEn: 'Parent registry & contacts',
      icon: Users,
      iconBg: 'bg-sky-600 text-white',
      allowed: isAdminOrPrincipal || role === 'teacher',
    },
    {
      id: 'drawer-nav-routines',
      path: '/routines',
      matchPaths: ['/routines', '/routine'],
      labelBn: 'ক্লাস রুটিন',
      labelEn: 'Class Routine',
      subtitleBn: 'সাপ্তাহিক পাঠদান সময়সূচী',
      subtitleEn: 'Weekly class schedule',
      icon: Calendar,
      iconBg: 'bg-indigo-600 text-white',
      allowed: true,
    },
    {
      id: 'drawer-nav-academic-setup',
      path: '/academic_setup',
      labelBn: 'বিভাগ ও জামাত সেটআপ',
      labelEn: 'Academic Setup',
      subtitleBn: 'শ্রেণী, শাখা ও বিষয় বিন্যাস',
      subtitleEn: 'Classes, sections & subjects',
      icon: Layers,
      iconBg: 'bg-amber-600 text-white',
      allowed: isAdminOrPrincipal,
    },
  ];

  // Section 2: Accounts, Payroll & Funds (Excludes Fees on Home Page)
  const FINANCE_ITEMS = [
    {
      id: 'drawer-nav-accounts',
      path: '/accounts',
      labelBn: 'হিসাব ড্যাশবোর্ড ও খতিয়ান',
      labelEn: 'Accounts & Ledger',
      subtitleBn: 'আয়-ব্যয় ও সাধারণ খতিয়ান',
      subtitleEn: 'Balance & general ledger',
      icon: Wallet,
      iconBg: 'bg-emerald-500 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-dues',
      path: '/dues',
      labelBn: 'বকেয়া ফি ও তাগাদা',
      labelEn: 'Student Dues',
      subtitleBn: 'বকেয়া তালিকা ও এসএমএস তাগাদা',
      subtitleEn: 'Outstanding dues & alerts',
      icon: AlertCircle,
      iconBg: 'bg-rose-500 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-income',
      path: '/income',
      labelBn: 'আয় ব্যবস্থাপনা',
      labelEn: 'Income Ledger',
      subtitleBn: 'রাজস্ব ও বিবিধ আয় এন্ট্রি',
      subtitleEn: 'Revenue & receipts',
      icon: TrendingUp,
      iconBg: 'bg-teal-600 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-expenses',
      path: '/expenses',
      labelBn: 'ব্যয় ও বিল ভাউচার',
      labelEn: 'Expense Management',
      subtitleBn: 'খরচ, বিল ও ভাউচার হিসাব',
      subtitleEn: 'Expenses & vouchers',
      icon: TrendingDown,
      iconBg: 'bg-orange-500 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-salaries',
      path: '/salaries',
      labelBn: 'শিক্ষক বেতন ও পেরোল',
      labelEn: 'Staff Payroll',
      subtitleBn: 'বেতন শিট ও পে-স্লিপ',
      subtitleEn: 'Salary roster & payslips',
      icon: Banknote,
      iconBg: 'bg-cyan-600 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-donations',
      path: '/donations',
      labelBn: 'দান ও অনুদান খতিয়ান',
      labelEn: 'Donations Registry',
      subtitleBn: 'যাকাত, সদকা ও দাতা তালিকা',
      subtitleEn: 'Charity & donor records',
      icon: Gift,
      iconBg: 'bg-violet-600 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-chanda',
      path: '/chanda',
      labelBn: 'মাসিক চাঁদা আদায়',
      labelEn: 'Monthly Chanda',
      subtitleBn: 'নিয়মিত দাতা ও চাঁদা সংগ্রহ',
      subtitleEn: 'Recurring monthly donors',
      icon: HeartHandshake,
      iconBg: 'bg-pink-600 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
    {
      id: 'drawer-nav-funds',
      path: '/funds',
      labelBn: 'স্বতন্ত্র তহবিল ব্যবস্থাপনা',
      labelEn: 'Special Funds',
      subtitleBn: 'লিল্লাহ, যাকাত ও নির্মাণ ফান্ড',
      subtitleEn: 'Lillah, Zakat & reserves',
      icon: Layers,
      iconBg: 'bg-slate-600 text-white',
      allowed: isAdminOrPrincipal || role === 'accountant',
    },
  ];

  const DOCUMENTS_AND_ADMIN_ITEMS: Array<{
    id: string;
    path: string;
    matchPaths?: string[];
    labelBn: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    allowed: boolean;
  }> = [
    {
      id: 'drawer-nav-id-cards',
      path: '/id_cards',
      labelBn: 'স্মার্ট আইডি কার্ড',
      labelEn: 'Smart ID Cards',
      icon: CreditCard,
      allowed: isAdminOrPrincipal,
    },
    {
      id: 'drawer-nav-certificates',
      path: '/certificates',
      labelBn: 'সনদপত্র ও প্রশংসাপত্র',
      labelEn: 'Certificates & Sanad',
      icon: Award,
      allowed: isAdminOrPrincipal || role === 'teacher',
    },
    {
      id: 'drawer-nav-documents',
      path: '/documents',
      labelBn: 'ডকুমেন্ট ভল্ট ও নথিপত্র',
      labelEn: 'Document Vault',
      icon: FileText,
      allowed: isAdminOrPrincipal || role === 'teacher',
    },
    {
      id: 'drawer-nav-qr-verify',
      path: '/qr_verify',
      labelBn: 'কিউআর (QR) যাচাইকরণ',
      labelEn: 'QR Verification',
      icon: QrCode,
      allowed: true,
    },
    {
      id: 'drawer-nav-internal-messages',
      path: '/internal_messages',
      labelBn: 'অভ্যন্তরীণ বার্তা',
      labelEn: 'Internal Messages',
      icon: MessageSquare,
      allowed: role !== 'guardian' && role !== 'student',
    },
    {
      id: 'drawer-nav-support-tickets',
      path: '/support_tickets',
      labelBn: 'সাপোর্ট ও হেল্পডেস্ক',
      labelEn: 'Support Tickets',
      icon: LifeBuoy,
      allowed: true,
    },
    {
      id: 'drawer-nav-institution',
      path: '/institution',
      labelBn: 'প্রতিষ্ঠান ব্যবস্থাপনা',
      labelEn: 'Institution Management',
      icon: Building2,
      allowed: isAdminOrPrincipal,
    },
    {
      id: 'drawer-nav-super-admin',
      path: '/super_admin',
      labelBn: 'সুপার এডমিন প্যানেল',
      labelEn: 'Super Admin Panel',
      icon: ShieldAlert,
      allowed: role === 'super_admin',
    },
    {
      id: 'drawer-nav-advanced-settings',
      path: '/advanced_settings',
      labelBn: 'ব্র্যান্ডিং ও অ্যাডভান্সড সেটিংস',
      labelEn: 'Advanced Settings',
      icon: Sliders,
      allowed: isAdminOrPrincipal,
    },
    {
      id: 'drawer-nav-settings',
      path: '/settings',
      labelBn: 'সেটিংস ও নিরাপত্তা',
      labelEn: 'Settings & Security',
      icon: Settings,
      allowed: true,
    },
  ];

  const isPathMatch = (itemPath: string, matchPaths?: string[]) =>
    matchPaths ? matchPaths.includes(currentPath) : currentPath === itemPath;

  const renderNavCard = (item: {
    id: string;
    path: string;
    matchPaths?: string[];
    labelBn: string;
    labelEn: string;
    subtitleBn?: string;
    subtitleEn?: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg?: string;
  }) => {
    const Icon = item.icon;
    const isActive = isPathMatch(item.path, item.matchPaths);

    return (
      <button
        key={item.id}
        id={item.id}
        onClick={() => {
          onNavigate(item.path);
          onClose();
        }}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
          isActive
            ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-1 ring-emerald-500'
            : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold shadow-xs ${
              isActive ? 'bg-white/20 text-white' : item.iconBg || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              {isBn ? item.labelBn : item.labelEn}
            </div>
            {item.subtitleBn && (
              <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {isBn ? item.subtitleBn : item.subtitleEn}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const visibleAcademicExtra = ACADEMIC_EXTRA_ITEMS.filter((item) => item.allowed);
  const visibleFinance = FINANCE_ITEMS.filter((item) => item.allowed);
  const visibleDocumentsAndAdmin = DOCUMENTS_AND_ADMIN_ITEMS.filter((item) => item.allowed);

  return (
    <div
      id="mobile-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="mobile-drawer-content"
        className="w-[85%] max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200"
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <MadSolLogo
              size="lg"
              showTagline={true}
              onClick={handleLogoClick}
              className="cursor-pointer active:scale-95 transition-transform"
              iconClassName="!w-12 !h-12 rounded-2xl shadow-md ring-2 ring-emerald-500/30"
            />
            <button
              id="mobile-drawer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Info */}
          {user && (
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {isBn ? 'সক্রিয় অ্যাকাউন্ট' : 'Active Account'}
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {user.name}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {getRoleLabel(user.role_id)}
                </span>
                {institution && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {institution.short_name || institution.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Navigation Items (Scrollable — Only Secondary Modules Not on Home Page) */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto min-h-0">
            {/* 1. Academic Setup, Admissions & Routine */}
            {visibleAcademicExtra.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3 h-3" />
                    {isBn ? 'ভর্তি, রুটিন ও অভিভাবক' : 'Admissions & Routine'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {visibleAcademicExtra.map(renderNavCard)}
                </div>
              </div>
            )}

            {/* 2. Accounts, Payroll & Funds */}
            {visibleFinance.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3 h-3 text-amber-500" />
                    {isBn ? 'হিসাব, বেতন ও তহবিল' : 'Accounts & Funds'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {visibleFinance.map(renderNavCard)}
                </div>
              </div>
            )}

            {/* 3. Documents, Certificates, Support & Admin */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="px-1 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {isBn ? 'ডকুমেন্ট, বার্তা ও প্রশাসন' : 'Documents & Administration'}
              </p>
              {visibleDocumentsAndAdmin.map((item) => {
                const Icon = item.icon;
                const isActive = isPathMatch(item.path, item.matchPaths);

                return (
                  <button
                    key={item.id}
                    id={item.id}
                    onClick={() => {
                      onNavigate(item.path);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{isBn ? item.labelBn : item.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MadSol v1.0</span>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? 'লগআউট করুন' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

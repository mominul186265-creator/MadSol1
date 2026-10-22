import React, { useState, useRef } from 'react';
import {
  X,
  GraduationCap,
  LogOut,
  ShieldCheck,
  UserCheck,
  CalendarCheck,
  Calendar,
  Smartphone,
  Heart,
  Award,
  Utensils,
  Tv,
  Radio,
  Sparkles,
  Receipt,
  MessageSquare,
  BookMarked,
  BookOpen,
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

  const getRoleLabel = (role?: RoleSlug) => {
    switch (role) {
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
        return role || '';
    }
  };



  // Section 2: Special Sub-Apps (From Screenshot Block 1)
  const SPECIAL_APPS = [
    {
      id: 'drawer-nav-teacher-app',
      path: '/teacher-app',
      labelBn: '১. সহকারী শিক্ষক অ্যাপ',
      labelEn: '1. Teacher App',
      subtitleBn: 'Teacher Portal & Sabak Diary',
      subtitleEn: 'Teacher Portal & Sabak Diary',
      icon: Smartphone,
      iconBg: 'bg-emerald-500 text-white',
      badge: 'Teacher',
      allowed: true,
    },
    {
      id: 'drawer-nav-guardian-app',
      path: '/guardian-app',
      labelBn: '২. অভিভাবক অ্যাপ',
      labelEn: '2. Guardian App',
      subtitleBn: 'Guardian & Parent Portal',
      subtitleEn: 'Guardian & Parent Portal',
      icon: Heart,
      iconBg: 'bg-blue-500 text-white',
      badge: 'Parent',
      allowed: true,
    },
  ];

  // Section 3: Smart Modules (From Screenshot Block 2)
  const SMART_MODULES = [
    {
      id: 'drawer-nav-exams',
      path: '/exams',
      labelBn: 'পরীক্ষা ও প্রবেশপত্র',
      labelEn: 'Exams & Admit Card',
      subtitleBn: 'এডমিট কার্ড ও সিট প্ল্যান',
      subtitleEn: 'Admit Card & Seat Plan',
      icon: Award,
      iconBg: 'bg-amber-400 text-slate-900',
      badge: 'Exams',
      allowed: true,
    },
    {
      id: 'drawer-nav-live-tv',
      path: '/live_tv',
      labelBn: 'টিভি হাজিরা মনিটর',
      labelEn: 'Live TV Attendance',
      subtitleBn: 'স্মার্ট টিভি ও ডিভাইস',
      subtitleEn: 'Smart TV & Device',
      icon: Tv,
      iconBg: 'bg-cyan-400 text-slate-900',
      badge: 'Live TV',
      allowed: true,
    },
    {
      id: 'drawer-nav-boarding',
      path: '/boarding',
      labelBn: 'ছাত্রাবাস ও মিল খাতা',
      labelEn: 'Boarding & Meals',
      subtitleBn: 'লিল্লাহ বোর্ডিং ও মেমো',
      subtitleEn: 'Lillah Boarding & Memo',
      icon: Utensils,
      iconBg: 'bg-orange-400 text-slate-900',
      badge: 'Hostel',
      allowed: user?.role_id !== 'guardian',
    },
  ];

  // Section 4: General Academic & Administrative Management
  const GENERAL_ITEMS = [
    {
      id: 'drawer-nav-students',
      path: '/students',
      labelBn: 'শিক্ষার্থী তালিকা',
      labelEn: 'Students',
      icon: GraduationCap,
      allowed: user?.role_id !== 'guardian',
    },
    {
      id: 'drawer-nav-fees',
      path: '/fees',
      labelBn: 'শিক্ষার্থী ফি ও বেতন',
      labelEn: 'Student Fees',
      icon: Receipt,
      allowed: user?.role_id !== 'guardian' && user?.role_id !== 'student',
    },
    {
      id: 'drawer-nav-teachers',
      path: '/teachers',
      labelBn: 'শিক্ষক ও স্টাফ',
      labelEn: 'Teachers',
      icon: UserCheck,
      allowed: user?.role_id !== 'guardian',
    },
    {
      id: 'drawer-nav-routines',
      path: '/routines',
      labelBn: 'ক্লাস রুটিন',
      labelEn: 'Class Routine',
      icon: Calendar,
      allowed: true,
    },
    {
      id: 'drawer-nav-attendance',
      path: '/attendance',
      labelBn: 'ডিজিটাল হাজিরা খাতা',
      labelEn: 'Daily Attendance',
      icon: CalendarCheck,
      allowed: user?.role_id !== 'guardian',
    },
  ];

  const renderNavCard = (item: {
    id: string;
    path: string;
    labelBn: string;
    labelEn: string;
    subtitleBn?: string;
    subtitleEn?: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg?: string;
    badge?: string;
  }) => {
    const Icon = item.icon;
    const isActive = currentPath === item.path;

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
        {item.badge && (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
              isActive
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

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


          {/* Navigation Items (Scrollable) */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto min-h-0">


            {/* 2. Special Sub-Apps (From Screenshot) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3" />
                  {isBn ? 'বিশেষ পোর্টাল ও সাব-অ্যাপ' : 'Special Apps & Portals'}
                </p>
                <span className="text-[9px] text-slate-400 font-medium">{isBn ? '২টি অ্যাপ' : '2 Apps'}</span>
              </div>
              <div className="space-y-1.5">
                {SPECIAL_APPS.filter((item) => item.allowed).map(renderNavCard)}
              </div>
            </div>

            {/* 3. Smart Modules (From Screenshot) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {isBn ? 'নতুন স্মার্ট মডিউলসমূহ' : 'Smart Modules'}
                </p>
                <span className="text-[9px] text-slate-400 font-medium">
                  {isBn ? `${SMART_MODULES.filter((item) => item.allowed).length}টি মডিউল` : `${SMART_MODULES.filter((item) => item.allowed).length} Modules`}
                </span>
              </div>
              <div className="space-y-1.5">
                {SMART_MODULES.filter((item) => item.allowed).map(renderNavCard)}
              </div>
            </div>

            {/* 4. General Management */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="px-1 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {isBn ? 'সাধারণ অ্যাকাডেমিক ও প্রশাসন' : 'General Management'}
              </p>
              {GENERAL_ITEMS.filter((item) => item.allowed).map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

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
            <span>MadSol v1.0 • Step 1</span>
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

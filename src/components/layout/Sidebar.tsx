import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
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
import { RoleSlug } from '../../types/step1';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSecretAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenSecretAdmin,
}) => {
  const { user, hasPermission } = useAuth();
  const { language } = useLanguage();

  const [headerClicks, setHeaderClicks] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHeaderSecretClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const nextCount = headerClicks + 1;
    if (nextCount >= 7) {
      setHeaderClicks(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 50, 60]);
      }
      if (onOpenSecretAdmin) {
        onOpenSecretAdmin();
      }
    } else {
      setHeaderClicks(nextCount);
      clickTimeoutRef.current = setTimeout(() => {
        setHeaderClicks(0);
      }, 2500);
    }
  };

  // Role labels for display
  const getRoleBadge = (role?: RoleSlug) => {
    switch (role) {
      case 'super_admin':
        return { labelBn: 'সুপার এডমিন', labelEn: 'Super Admin', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'institution_admin':
        return { labelBn: 'মুহতামিম / পরিচালক', labelEn: 'Muhtamim / Director', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'principal':
        return { labelBn: 'মুহতামিম / প্রিন্সিপাল', labelEn: 'Muhtamim / Principal', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'teacher':
        return { labelBn: 'সহকারী শিক্ষক', labelEn: 'Assistant Teacher', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
      case 'accountant':
        return { labelBn: 'হিসাবরক্ষক', labelEn: 'Accountant', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
      case 'guardian':
        return { labelBn: 'অভিভাবক', labelEn: 'Guardian', color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' };
      case 'student':
        return { labelBn: 'শিক্ষার্থী', labelEn: 'Student', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      default:
        return { labelBn: 'ব্যবহারকারী', labelEn: 'User', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
    }
  };

  const roleMeta = getRoleBadge(user?.role_id);

  interface NavItem {
    id: string;
    path: string;
    labelBn: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    allowed: boolean;
    badge?: number | string;
    badgeColor?: string;
  }

  // STEP 2: Core + Student Management
  const NAV_ITEMS: NavItem[] = [
    {
      id: 'nav-dashboard',
      path: '/dashboard',
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true, // Everyone with login
    },
    {
      id: 'nav-teacher-app',
      path: '/teacher-app',
      labelBn: '১. সহকারী শিক্ষক অ্যাপ',
      labelEn: '1. Teacher App',
      icon: Smartphone,
      allowed: true,
    },
    {
      id: 'nav-guardian-app',
      path: '/guardian-app',
      labelBn: '২. অভিভাবক অ্যাপ',
      labelEn: '2. Guardian App',
      icon: Heart,
      allowed: true,
    },
    {
      id: 'nav-hifz',
      path: '/hifz',
      labelBn: 'হিফজুল কুরআন (ছাত্র)',
      labelEn: 'Hifz (Boys)',
      icon: BookMarked,
      allowed: true,
      badge: 'সবক',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'nav-qawmi',
      path: '/qawmi',
      labelBn: 'ক্বওমী নেসাব (কিতাব বিভাগ)',
      labelEn: 'Qawmi Curriculum',
      icon: BookOpen,
      allowed: true,
      badge: 'ক্বওমী',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'nav-exams',
      path: '/exams',
      labelBn: 'পরীক্ষা ও প্রবেশপত্র',
      labelEn: 'Exams & Admit Card',
      icon: Award,
      allowed: true,
    },
    {
      id: 'nav-live-tv',
      path: '/live_tv',
      labelBn: 'টিভি হাজিরা মনিটর',
      labelEn: 'Live TV Attendance',
      icon: Tv,
      allowed: true,
    },
    {
      id: 'nav-boarding',
      path: '/boarding',
      labelBn: 'ছাত্রাবাস ও মিল খাতা',
      labelEn: 'Boarding & Meals',
      icon: Utensils,
      allowed: hasPermission('boarding.view') || user?.role_id !== 'guardian',
    },
    {
      id: 'nav-automation',
      path: '/automation',
      labelBn: 'অটোমেশন ও যোগাযোগ',
      labelEn: 'Automation & Broadcast',
      icon: Radio,
      allowed: user?.role_id !== 'guardian',
    },
    {
      id: 'nav-students',
      path: '/students',
      labelBn: 'শিক্ষার্থী তালিকা',
      labelEn: 'Students',
      icon: GraduationCap,
      // Accessible to Super Admin, Institution Admin, Principal, Teacher, Accountant
      allowed: hasPermission('students.view') || user?.role_id !== 'guardian',
    },
    {
      id: 'nav-fees',
      path: '/fees',
      labelBn: 'শিক্ষার্থী ফি ও বেতন',
      labelEn: 'Student Fees',
      icon: Receipt,
      allowed: user?.role_id !== 'guardian' && user?.role_id !== 'student',
    },
    {
      id: 'nav-teachers',
      path: '/teachers',
      labelBn: 'শিক্ষক ও স্টাফ',
      labelEn: 'Teachers',
      icon: UserCheck,
      allowed: hasPermission('teachers.view') || user?.role_id !== 'guardian',
    },
    {
      id: 'nav-routines',
      path: '/routines',
      labelBn: 'ক্লাস রুটিন',
      labelEn: 'Class Routine',
      icon: Calendar,
      allowed: true, // Everyone (students, teachers, admins, guardians) can view routine
    },
    {
      id: 'nav-attendance',
      path: '/attendance',
      labelBn: 'ডিজিটাল হাজিরা খাতা',
      labelEn: 'Attendance Sheet',
      icon: CalendarCheck,
      allowed: hasPermission('attendance.view') || user?.role_id !== 'guardian',
    },
    {
      id: 'nav-institution',
      path: '/institution',
      labelBn: 'প্রতিষ্ঠান ব্যবস্থাপনা',
      labelEn: 'Institution',
      icon: Building2,
      // Super Admin, Institution Admin and Principal
      allowed: user?.role_id === 'super_admin' || user?.role_id === 'institution_admin' || user?.role_id === 'principal',
    },
    {
      id: 'nav-users',
      path: '/users',
      labelBn: 'ব্যবহারকারী পরিচালনা',
      labelEn: 'Users',
      icon: Users,
      // Super Admin and Institution Admin have full user management
      allowed: user?.role_id === 'super_admin' || user?.role_id === 'institution_admin',
    },
  ];

  const permittedItems = NAV_ITEMS.filter((item) => item.allowed);

  return (
    <aside
      id="main-sidebar"
      className={`hidden lg:flex flex-col shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* User Role Card inside Sidebar */}
      <div
        onClick={handleHeaderSecretClick}
        className="p-4 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer select-none active:opacity-80 transition-opacity"
        title={language === 'bn' ? 'মাদ্রাসার অভ্যন্তরীণ তথ্য' : 'Confidential Access'}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-amber-300 font-bold text-sm flex items-center justify-center border border-emerald-600/40 shadow-xs shrink-0">
              {user?.name.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name}
              </p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${roleMeta.color}`}>
                {language === 'bn' ? roleMeta.labelBn : roleMeta.labelEn}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-bold text-sm flex items-center justify-center shadow-xs">
              {user?.name.charAt(0) || 'M'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {!isCollapsed ? (language === 'bn' ? 'প্রধান মেনু' : 'MAIN MENU') : '•••'}
        </div>

        {permittedItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => onNavigate(item.path)}
              title={isCollapsed ? (language === 'bn' ? item.labelBn : item.labelEn) : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </span>
              )}
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.badgeColor || 'bg-amber-500 text-white'
                  } ${isCollapsed ? 'ml-auto text-[9px]' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security Status & Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        {!isCollapsed && (
          <div className="p-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              {language === 'bn' ? 'সিস্টেম: সুরক্ষিত ও সক্রিয়' : 'System: Secure & Active'}
            </span>
          </div>
        )}

        <button
          id="collapse-sidebar-btn"
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'সাইডবার ছোট করুন' : 'Collapse Sidebar'}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

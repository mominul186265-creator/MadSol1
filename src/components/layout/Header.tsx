import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  Building2,
  Check,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Heart,
} from 'lucide-react';
import { MadSolLogo } from '../common/MadSolLogo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RoleSlug } from '../../types/step1';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigate,
}) => {
  const { user, institution, logout, switchRole } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role?: RoleSlug) => {
    switch (role) {
      case 'super_admin':
        return language === 'bn' ? 'সুপার এডমিন' : 'Super Admin';
      case 'institution_admin':
        return language === 'bn' ? 'প্রতিষ্ঠান এডমিন' : 'Institution Admin';
      case 'principal':
        return language === 'bn' ? 'প্রিন্সিপাল' : 'Principal';
      case 'teacher':
        return language === 'bn' ? 'শিক্ষক' : 'Teacher';
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

  const ROLES_LIST: { slug: RoleSlug; labelBn: string; labelEn: string }[] = [
    { slug: 'super_admin', labelBn: 'সুপার এডমিন', labelEn: 'Super Admin' },
    { slug: 'institution_admin', labelBn: 'প্রতিষ্ঠান এডমিন', labelEn: 'Institution Admin' },
    { slug: 'principal', labelBn: 'প্রিন্সিপাল / মুহতামিম', labelEn: 'Principal' },
    { slug: 'teacher', labelBn: 'শিক্ষক / উস্তায', labelEn: 'Teacher' },
    { slug: 'accountant', labelBn: 'হিসাবরক্ষক', labelEn: 'Accountant' },
    { slug: 'guardian', labelBn: 'অভিভাবক', labelEn: 'Guardian' },
    { slug: 'student', labelBn: 'শিক্ষার্থী', labelEn: 'Student' },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 w-full max-w-full h-15 sm:h-18 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shrink-0"
    >
      <div className="h-full px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 max-w-full min-w-0">
        {/* Left Side: Mobile Menu Button + MadSol Logo */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 shrink">
          <button
            id="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="p-2 sm:p-2.5 -ml-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none lg:hidden shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div
            onClick={() => onNavigate && onNavigate('/dashboard')}
            className="cursor-pointer flex items-center gap-1.5 sm:gap-2 min-w-0"
          >
            <MadSolLogo size="sm" showTagline={false} iconClassName="hidden sm:flex" />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                MadSol
              </span>
              <p className="text-[10px] text-slate-400 leading-none">
                Smart Solution for Modern Madrasas
              </p>
            </div>
          </div>

          {/* Current Institution Badge (Desktop) */}
          {institution && (
            <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                {institution.name}
              </span>
            </div>
          )}
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Sub-Apps Quick Launch Buttons (Desktop & Tablet) */}
          {onNavigate && (
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <button
                id="header-launch-teacher-app-btn"
                onClick={() => onNavigate('/teacher-app')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                title="সহকারী শিক্ষক অ্যাপ খুলুন"
              >
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>শিক্ষক অ্যাপ</span>
              </button>
              <button
                id="header-launch-guardian-app-btn"
                onClick={() => onNavigate('/guardian-app')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer shadow-2xs"
                title="অভিভাবক অ্যাপ খুলুন"
              >
                <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>অভিভাবক অ্যাপ</span>
              </button>
            </div>
          )}

          {/* Quick Role Switcher for assessment */}
          <div className="relative hidden sm:block" ref={roleRef}>
            <button
              id="header-role-switcher-btn"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Quickly switch between defined roles"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden md:inline font-bold">{getRoleLabel(user?.role_id)}</span>
              <span className="md:hidden font-bold text-[11px]">রোল</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </button>

            {isRoleMenuOpen && (
              <div
                id="header-role-dropdown-menu"
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  {language === 'bn' ? 'রোল পরিবর্তন করুন' : 'SWITCH ROLE'}
                </div>
                {ROLES_LIST.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => {
                      switchRole(r.slug);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      user?.role_id === r.slug
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{language === 'bn' ? r.labelBn : r.labelEn}</span>
                    {user?.role_id === r.slug && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🌐 Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              id="header-lang-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-11 sm:h-11 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-colors text-xs font-semibold shadow-2xs"
              title="Language"
            >
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline font-bold text-xs">{language === 'bn' ? 'বাং' : 'EN'}</span>
            </button>

            {isLangOpen && (
              <div
                id="header-lang-dropdown-menu"
                className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50"
              >
                <button
                  onClick={() => {
                    setLanguage('bn');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
                    language === 'bn'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🇧🇩 বাংলা</span>
                  {language === 'bn' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs ${
                    language === 'en'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {language === 'en' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* 🌙 Dark/Light Mode (Direct toggle, no popup) */}
          <button
            id="header-theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-colors shadow-2xs cursor-pointer active:scale-95"
            title={
              resolvedTheme === 'dark'
                ? language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode'
                : language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode'
            }
            aria-label="Toggle dark/light theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>

          {/* 🔔 Notifications Placeholder - STRICT Step 1 Mandate */}
          <div className="relative" ref={notifRef}>
            <button
              id="header-notifications-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-colors shadow-2xs"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {isNotifOpen && (
              <div
                id="header-notifications-dropdown"
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-center animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {language === 'bn' ? 'কোনো নতুন বিজ্ঞপ্তি নেই' : 'No new notifications'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'নতুন নোটিফিকেশন আসলে এখানে প্রদর্শিত হবে।'
                    : 'Future alerts will appear here.'}
                </p>
              </div>
            )}
          </div>

          {/* 👤 User Profile Dropdown */}
          {user && (
            <div className="relative ml-1 sm:ml-1.5" ref={profileRef}>
              <button
                id="header-user-profile-menu-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer shadow-2xs"
              >
                <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full bg-emerald-800 text-amber-300 font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {user.name.charAt(0) || 'M'}
                </div>
                <div className="hidden md:flex flex-col items-start text-left max-w-[130px]">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight w-full">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate leading-tight font-medium">
                    {getRoleLabel(user.role_id)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div
                  id="header-user-profile-dropdown"
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email || user.mobile}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {getRoleLabel(user.role_id)}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="profile-dropdown-teacher-app-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate && onNavigate('/teacher-app');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors font-semibold"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>📱 সহকারী শিক্ষক অ্যাপ</span>
                    </button>

                    <button
                      id="profile-dropdown-guardian-app-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate && onNavigate('/guardian-app');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-semibold"
                    >
                      <Heart className="w-4 h-4 text-blue-600" />
                      <span>👨‍👩‍👧 অভিভাবক অ্যাপ</span>
                    </button>

                    <button
                      id="profile-dropdown-settings-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate && onNavigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>{language === 'bn' ? 'প্রোফাইল ও নিরাপত্তা সেটিংস' : 'Profile & Security'}</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id="profile-dropdown-logout-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Home, GraduationCap, CalendarCheck, Bot, User, Users, BookMarked, Book, BookOpen } from 'lucide-react';
import { MOBILE_BOTTOM_NAV_ITEMS } from '../../data/initialData';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  GraduationCap,
  CalendarCheck,
  Bot,
  User,
  Users,
  BookMarked,
  Book,
  BookOpen,
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath, onNavigate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] transition-all duration-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-14 sm:h-16 px-1">
        {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
          // Check role permissions if item specifies allowedRoles
          if (item.allowedRoles && user && !item.allowedRoles.includes(user.role)) {
            return null;
          }

          const Icon = ICON_MAP[item.iconName] || Home;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => onNavigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 gap-0.5 transition-all duration-150 relative select-none cursor-pointer ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                )}
              </div>
              <span className="text-[9.5px] sm:text-[11px] leading-tight tracking-tight text-center truncate max-w-[68px]">
                {language === 'bn' ? item.labelBn : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

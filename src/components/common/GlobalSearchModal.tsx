import React, { useState } from 'react';
import { Modal } from './Modal';
import { Search, ArrowRight, CornerDownLeft } from 'lucide-react';
import { SIDEBAR_NAV_ITEMS } from '../../data/initialData';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const { language } = useLanguage();
  const { user } = useAuth();

  const filteredItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (user && !item.allowedRoles.includes(user.role)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.labelBn.toLowerCase().includes(q) ||
      item.labelEn.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q) ||
      (item.descriptionBn && item.descriptionBn.toLowerCase().includes(q))
    );
  });

  return (
    <Modal id="global-search-modal" isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'মডিউল বা ফিচার খুঁজুন (ড্যাশবোর্ড, শিক্ষার্থী, ফি, হিফজ...)'
                : 'Search modules or features (dashboard, students, fees, hifz...)'
            }
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500"
          />
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'No matching results found.'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left group"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                    {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{language === 'bn' ? 'ক্লিক করে নেভিগেট করুন' : 'Click item to navigate'}</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
              ESC
            </kbd>
            {language === 'bn' ? 'দিয়ে বন্ধ করুন' : 'to close'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

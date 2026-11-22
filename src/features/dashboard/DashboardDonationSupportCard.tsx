import React from 'react';
import { HeartHandshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardDonationSupportCardProps {
  onNavigate?: (path: string) => void;
}

export const DashboardDonationSupportCard: React.FC<DashboardDonationSupportCardProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const handleOpenDonationPage = () => {
    if (onNavigate) {
      onNavigate('/donation-support');
    }
  };

  return (
    <div
      id="dashboard-donation-support-section"
      onClick={handleOpenDonationPage}
      className="mt-4 mb-2 rounded-2xl bg-gradient-to-br from-[#04392c] via-[#064e3b] to-[#022c22] text-white shadow-sm border border-emerald-500/25 relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-emerald-400/50 hover:shadow-md group"
    >
      <div className="relative z-10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold tracking-wider uppercase text-amber-300/90">
              {isBn ? 'সদকায়ে জারিয়াহ' : 'Sadaqah Jariyah'}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-snug mt-0.5">
              {isBn ? 'দ্বীনি কাজে দান ও সার্বিক সহযোগিতা' : 'Donation & Madrasah Support'}
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-100/80 mt-1 leading-relaxed">
              {isBn
                ? 'এতিম ও অসচ্ছল শিক্ষার্থীদের খাবার, কিতাব এবং দ্বীনি শিক্ষা প্রসারে আপনার সদকা ও অনুদান পৌঁছিয়ে দিন।'
                : 'Support orphan and underprivileged students with food, books, and Islamic education.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="open-donation-page-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDonationPage();
          }}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 min-h-[40px] text-xs font-bold px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-emerald-950 shadow-xs transition-all duration-150 cursor-pointer self-start sm:self-center"
        >
          <span>{isBn ? 'সহযোগিতা করুন' : 'Donate Now'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-950 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import {
  HeartHandshake,
  Sparkles,
  ArrowRight
} from 'lucide-react';
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
      className="mt-3 sm:mt-4 mb-1.5 rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0d5f57] text-white shadow-lg shadow-emerald-950/20 border-2 border-emerald-400/50 relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl hover:border-emerald-300 group"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-300/15 rounded-full blur-lg pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 p-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-300 text-emerald-950 flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0 mt-0.5 font-bold group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-950" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow-xs">
                <span>{isBn ? 'দ্বীনি কাজে দান ও সার্বিক সহযোগিতা' : 'Donation & Madrasah Support'}</span>{' '}
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold bg-amber-400/25 text-amber-200 rounded-full border border-amber-300/70 align-middle ml-1 whitespace-nowrap shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  {isBn ? 'সদকায়ে জারিয়াহ' : 'Sadaqah Jariyah'}
                </span>
              </h3>
            </div>
          </div>

          {/* Toggle Button - Direct Navigation to Donation Page */}
          <button
            type="button"
            id="open-donation-page-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDonationPage();
            }}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-95 text-emerald-950 shadow-md shadow-amber-950/30 transition-all duration-150 cursor-pointer mt-0.5 group-hover:shadow-lg"
          >
            <span>{isBn ? 'সহযোগিতা করুন' : 'Donate Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-950 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Complete Description Text */}
        <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-1.5 leading-snug font-medium drop-shadow-xs">
          {isBn
            ? 'এতিম ও অসচ্ছল শিক্ষার্থীদের খাবার, কিতাব এবং দ্বীনি শিক্ষা প্রসারে আপনার সদকা ও অনুদান পৌঁছিয়ে দিন।'
            : 'Support orphan and underprivileged students with food, books, and Islamic education.'}
        </p>
      </div>
    </div>
  );
};

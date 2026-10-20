import React from 'react';
import {
  Send,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  TrendingUp,
  Radio,
  FileText,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CommunicationMessage } from '../../../types/communication';

interface CommunicationDashboardTabProps {
  onSelectTab: (tab: string) => void;
  onViewMessageDetail: (msg: CommunicationMessage) => void;
}

export const CommunicationDashboardTab: React.FC<CommunicationDashboardTabProps> = ({
  onSelectTab,
  onViewMessageDetail,
}) => {
  const { statistics, providerConfig, messages, scheduledMessages, refreshBalances } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Provider Status Strip */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {providerConfig.providerName}
              </span>
              {providerConfig.isSandbox && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                  Sandbox Active
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isBn ? 'স্মার্ট যোগাযোগ ও ব্রডকাস্ট ড্যাশবোর্ড' : 'Smart Communication & Broadcast Center'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {isBn
                ? 'অভিভাবক, শিক্ষার্থী ও শিক্ষকদের কাছে স্বয়ংক্রিয় এসএমএস ও অটোমেটেড ভয়েস কল সেবা।'
                : 'Automated SMS alerts and IVR Voice Call broadcasting for Madrasah.'}
            </p>
          </div>

          {/* Quick Balance Widgets */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-emerald-500/30 shrink-0">
            <div className="px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">{isBn ? 'এসএমএস ব্যালেন্স' : 'SMS Balance'}</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {statistics.smsBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">টি</span>
              </div>
            </div>
            <div className="px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">{isBn ? 'ভয়েস কল মিনিট' : 'Voice Minutes'}</div>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {statistics.voiceBalanceMinutes.toLocaleString()} <span className="text-xs font-normal text-slate-400">মি.</span>
              </div>
            </div>
            <button
              onClick={refreshBalances}
              title={isBn ? 'ব্যালেন্স রিফ্রেশ করুন' : 'Refresh Balance'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট প্রেরিত বার্তা' : 'Total Broadcasts'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            {statistics.totalSent.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span>{isBn ? 'আজকে:' : 'Today:'}</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{statistics.smsCountToday + statistics.voiceCallsToday} টি</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'সফল ডেলিভারি রেট' : 'Delivery Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            {statistics.deliverySuccessRate}%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            <span>{statistics.totalDelivered.toLocaleString()} {isBn ? 'টি পৌঁছেছে' : 'delivered'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'ব্যর্থ / আনরিচেবল' : 'Failed Deliveries'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-2">
            {statistics.totalFailed.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span>{isBn ? 'রিট্রাই সুবিধা সচল' : 'Auto retry active'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'শিডিউল কিউ' : 'Scheduled Queue'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-2">
            {scheduledMessages.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span>{statistics.totalPending} {isBn ? 'জন অপেক্ষমান' : 'recipients'}</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Launchpads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab('sms')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 hover:border-emerald-500 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 mb-3 group-hover:scale-105 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {isBn ? 'নতুন এসএমএস পাঠান' : 'Send SMS Broadcast'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'অভিভাবক, শিক্ষার্থী বা নির্দিষ্ট শ্রেণির জন্য একক বা বাল্ক এসএমএস বার্তা প্রেরণ করুন।'
              : 'Send custom or templated SMS to Guardians, Students or Classes.'}
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            <span>{isBn ? 'এসএমএস তৈরি করুন' : 'Compose SMS'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab('voice_call')}
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30 mb-3 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {isBn ? 'অটোমেটেড ভয়েস কল' : 'IVR Voice Call Broadcast'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'বাংলা টেক্সট-টু-স্পিচ বা অডিও রেকর্ডিং দিয়ে স্বয়ংক্রিয় ভয়েস কল ব্রডকাস্ট করুন।'
              : 'Text-to-speech voice broadcasts directly calling guardians phones.'}
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-3">
            <span>{isBn ? 'ভয়েস কল তৈরি করুন' : 'Create Voice Call'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab('templates')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/30 hover:border-indigo-500 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            {isBn ? 'বার্তা টেমপ্লেট ব্যবস্থাপনা' : 'Templates Management'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn
              ? 'বকেয়া ফি, হাজিরা, পরীক্ষার ফলাফল ও জরুরি ছুটির জন্য দ্রুত ব্যবহারের টেমপ্লেট।'
              : 'Reusable dynamic templates with placeholders like student name, dues.'}
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3">
            <span>{isBn ? 'টেমপ্লেট তালিকা' : 'Manage Templates'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. Recent Broadcast Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              {isBn ? 'সাম্প্রতিক ব্রডকাস্ট হিস্টোরি' : 'Recent Broadcast Activity'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn ? 'সর্বশেষ প্রেরিত এসএমএস ও ভয়েস কলের তাৎক্ষণিক অবস্থা।' : 'Real-time status of recent SMS and Voice campaigns.'}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{isBn ? 'সকল হিস্টোরি দেখুন' : 'View Full History'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {messages.slice(0, 5).map((msg) => {
            const isSms = msg.type === 'sms';
            const isDelivered = msg.status === 'delivered';
            const isPending = msg.status === 'pending';

            return (
              <div
                key={msg.id}
                onClick={() => onViewMessageDetail(msg)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSms
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isSms ? <Send className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {msg.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          isSms
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {msg.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {msg.content}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>প্রাপক: {msg.totalRecipients} জন</span>
                      <span>•</span>
                      <span>প্রেরক: {msg.senderName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {msg.deliveredCount}/{msg.totalRecipients} {isBn ? 'সফল' : 'done'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      খরচ: ৳{(msg.actualCost || msg.costEstimate).toFixed(2)}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isPending
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                    {isPending && <Clock className="w-3 h-3" />}
                    <span>{msg.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

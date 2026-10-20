import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ShieldAlert,
  Send,
  PhoneCall,
  Coins,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';

export const DeliveryReportsTab: React.FC = () => {
  const { statistics, exportDeliveryReportCsv, messages } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            {isBn ? 'ডেলিভারি পারফরম্যান্স ও রিপোর্টস' : 'Delivery Analytics & Reports'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'যোগাযোগ সফলতার হার, ব্যর্থতার কারণ বিশ্লেষণ এবং আর্থিক খরচের মাসিক বিবরণী।'
              : 'Statistical delivery breakdown, failure diagnostics, and billing analytics.'}
          </p>
        </div>

        <button
          onClick={() => exportDeliveryReportCsv()}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isBn ? 'সম্পূর্ণ রিপোর্ট ডাউনলোড' : 'Export Full Report'}</span>
        </button>
      </div>

      {/* Top 3 Analytic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isBn ? 'ডেলিভারি অনুপাত' : 'Delivery Success Rate'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {statistics.deliverySuccessRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${statistics.deliverySuccessRate}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${100 - statistics.deliverySuccessRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ {statistics.totalDelivered.toLocaleString()} {isBn ? 'সফল' : 'Delivered'}
            </span>
            <span className="text-rose-500 font-medium">
              ✗ {statistics.totalFailed.toLocaleString()} {isBn ? 'ব্যর্থ' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isBn ? 'চলতি মাসের মোট খরচ' : 'Monthly Expenditure'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            ৳{statistics.totalCostThisMonth.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500">
            {isBn ? 'এসএমএস এবং ভয়েস কল সার্ভিস বাবদ মোট খরচ।' : 'Total SMS and Voice broadcasting expenditure.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{isBn ? 'মাধ্যম অনুপাত' : 'Channel Distribution'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <span>এসএমএস বার্তা</span>
              </span>
              <span className="font-bold text-emerald-600 font-mono">
                {statistics.totalSent > 0 ? ((statistics.smsCountToday / Math.max(1, statistics.smsCountToday + statistics.voiceCallsToday)) * 100).toFixed(0) : '75'}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span>অটো ভয়েস কল</span>
              </span>
              <span className="font-bold text-amber-600 font-mono">
                {statistics.totalSent > 0 ? ((statistics.voiceCallsToday / Math.max(1, statistics.smsCountToday + statistics.voiceCallsToday)) * 100).toFixed(0) : '25'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends & Failure Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bars */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {isBn ? 'মাসিক ব্রডকাস্টের তুলনামূলক চিত্র' : 'Monthly Broadcast Volume Trend'}
          </h3>

          <div className="space-y-3 pt-2">
            {statistics.monthlyTrends.map((t) => (
              <div key={t.month} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">{isBn ? t.monthBn : t.month}</span>
                  <span className="font-mono text-slate-500">
                    {t.smsCount} SMS | {t.voiceCount} Voice ({t.deliveryRate}% Success)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-l-full"
                    style={{ width: `${(t.smsCount / 1800) * 100}%` }}
                    title={`SMS: ${t.smsCount}`}
                  />
                  <div
                    className="bg-amber-500 h-full rounded-r-full"
                    style={{ width: `${(t.voiceCount / 1800) * 100}%` }}
                    title={`Voice: ${t.voiceCount}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Breakdown Analysis */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            {isBn ? 'ব্যর্থতার কারণ বিশ্লেষণ (Failure Diagnostics)' : 'Delivery Failure Diagnostics'}
          </h3>

          <div className="space-y-3 pt-2">
            {statistics.failureBreakdown.map((f) => (
              <div key={f.reason} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBn ? f.reasonBn : f.reason}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {f.count} টি ব্যর্থ রেকর্ড
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {f.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  CalendarClock,
  Send,
  PhoneCall,
  Clock,
  Trash2,
  Play,
  Users,
  AlertCircle,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CommunicationMessage } from '../../../types/communication';

export const ScheduledMessagesTab: React.FC = () => {
  const { scheduledMessages, cancelScheduledBroadcast, sendNowScheduledBroadcast } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const handleRunNow = async (msg: CommunicationMessage) => {
    await sendNowScheduledBroadcast(msg.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-600" />
            {isBn ? 'শিডিউল করা বার্তা ও কলের কিউ' : 'Scheduled Communication Queue'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'ভবিষ্যতে স্বয়ংক্রিয়ভাবে প্রেরণের জন্য অপেক্ষমান এসএমএস এবং ভয়েস কল তালিকা।'
              : 'Messages and voice calls queued for automatic dispatch at scheduled time.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold font-mono">
          {scheduledMessages.length} {isBn ? 'টি ব্রডকাস্ট অপেক্ষমান' : 'Broadcats in Queue'}
        </div>
      </div>

      {scheduledMessages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            {isBn ? 'কোনো বার্তা শিডিউল করা নেই' : 'No Scheduled Messages in Queue'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isBn
              ? 'এসএমএস বা ভয়েস কল কম্পোজ করার সময় "Schedule for Later" চালু করে নির্দিষ্ট সময়ে পাঠানোর জন্য শিডিউল করতে পারেন।'
              : 'You can schedule messages while composing SMS or Voice broadcasts for auto-dispatch.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledMessages.map((msg) => {
            const isSms = msg.type === 'sms';
            const scheduledDate = msg.scheduledAt ? new Date(msg.scheduledAt) : new Date();

            return (
              <div
                key={msg.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isSms
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isSms ? <Send className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {msg.title}
                      </h4>
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

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                      {msg.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{scheduledDate.toLocaleString(isBn ? 'bn-BD' : 'en-GB')}</span>
                      </span>
                      <span>•</span>
                      <span>প্রাপক: {msg.totalRecipients} জন</span>
                      <span>•</span>
                      <span>খরচ: ৳{msg.costEstimate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleRunNow(msg)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isBn ? 'এখনই পাঠান' : 'Send Now'}</span>
                  </button>

                  <button
                    onClick={() => cancelScheduledBroadcast(msg.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                    title={isBn ? 'বাতিল করুন' : 'Cancel Schedule'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  Hash,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { DbAcademicSettings, DbAcademicSession } from '../../types/step5';

interface AcademicSettingsTabProps {
  settings: DbAcademicSettings;
  sessions: DbAcademicSession[];
  onSave: (data: Partial<DbAcademicSettings>) => void;
}

export const AcademicSettingsTab: React.FC<AcademicSettingsTabProps> = ({
  settings,
  sessions,
  onSave,
}) => {
  const [defaultSessionId, setDefaultSessionId] = useState(
    settings.default_session_id || sessions.find((s) => s.is_active)?.id || ''
  );
  const [rollMode, setRollMode] = useState<'manual' | 'auto_sequential'>(
    settings.roll_generation_mode || 'manual'
  );
  const [allowDuplicateAcrossSections, setAllowDuplicateAcrossSections] = useState(
    settings.allow_duplicate_rolls_across_sections || false
  );
  const [autoRollover, setAutoRollover] = useState(settings.auto_session_rollover || false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      default_session_id: defaultSessionId,
      roll_generation_mode: rollMode,
      allow_duplicate_rolls_across_sections: allowDuplicateAcrossSections,
      auto_session_rollover: autoRollover,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>একাডেমিক নীতিমালা ও সেটিংস (Academic Settings)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              মাদরাসার শিক্ষাবর্ষ, রোল নম্বর প্রদান ও ক্লাস ম্যানেজমেন্ট নীতিমালা কনফিগার করুন
            </p>
          </div>

          {isSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              সংরক্ষিত হয়েছে
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Default Academic Session */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ডিফল্ট সক্রিয় শিক্ষাবর্ষ (Default Active Session)</span>
            </label>
            <p className="text-[11px] text-slate-500">
              নতুন শিক্ষার্থী ভর্তি বা হাজিরা গ্রহণের সময় এই সেশনটি প্রাথমিক পছন্দ হিসেবে থাকবে।
            </p>
            <select
              value={defaultSessionId}
              onChange={(e) => setDefaultSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- শিক্ষাবর্ষ নির্বাচন করুন --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? '(বর্তমান সক্রিয়)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Roll Generation Mode */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-500" />
              <span>রোল নম্বর প্রদান পদ্ধতি (Roll Number Generation Mode)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  rollMode === 'manual'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="rollMode"
                  value="manual"
                  checked={rollMode === 'manual'}
                  onChange={() => setRollMode('manual')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold">ম্যানুয়াল রোল ইনপুট (Manual)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ভর্তি বা শ্রেণি পরিবর্তনের সময় এডমিন নিজে রোল নম্বর দেবেন।
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                  rollMode === 'auto_sequential'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="rollMode"
                  value="auto_sequential"
                  checked={rollMode === 'auto_sequential'}
                  onChange={() => setRollMode('auto_sequential')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold">স্বয়ংক্রিয় ধারাবাহিক রোল (Auto Sequential)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ভর্তির ক্রমানুসারে জামাতভিত্তিক ১, ২, ৩... নির্ধারিত হবে।
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Duplicate Roll Rule */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>শাখাভেদে রোল পুনরাবৃত্তি নীতিমালা (Roll Uniqueness Rule)</span>
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicateAcrossSections}
                  onChange={(e) => setAllowDuplicateAcrossSections(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs text-slate-800 dark:text-slate-200">
                  <span className="font-bold">ভিন্ন শাখায় একই রোল অনুমোদিত হবে</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    টিক চিহ্ন দিলে &quot;ক&quot; শাখার রোল ১ এবং &quot;খ&quot; শাখার রোল ১ একই জামাতে আলাদাভাবে থাকতে পারবে।
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Session Rollover Foundation */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>বার্ষিক সেশন রোল-ওভার ও প্রমোশন ব্যাকগ্রাউন্ড (Session Rollover)</span>
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRollover}
                  onChange={(e) => setAutoRollover(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs text-slate-800 dark:text-slate-200">
                  <span className="font-bold">নতুন শিক্ষাবর্ষ চালু হলে শিক্ষার্থীদের স্থিতি সুরক্ষিত রাখা</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    পূর্বের শিক্ষাবর্ষের ফলাফল ও শিক্ষার্থীর রোল অপরিবর্তিত রেখে ইতিহাস টেবিলে স্থায়ীভাবে সংরক্ষিত হবে।
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>নীতিমালা সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileAudio,
  Volume2
} from 'lucide-react';
import { RecipientType } from '../../../types/automation';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../components/common/Badge';

interface VoiceCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceCampaignModal: React.FC<VoiceCampaignModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createVoiceCampaign, providerSettings } = useAutomation();
  const { language } = useLanguage();
  const { user } = useAuth();

  const isBn = language === 'bn';

  const [title, setTitle] = useState('');
  const [audioName, setAudioName] = useState('emergency_closure_announcement.mp3');
  const [audioDurationSeconds, setAudioDurationSeconds] = useState(45);
  const [targetAudience, setTargetAudience] = useState<RecipientType>('all_guardians');
  const [targetCount, setTargetCount] = useState(140);
  const [allowedStartTime, setAllowedStartTime] = useState('09:00');
  const [allowedEndTime, setAllowedEndTime] = useState('20:00');
  const [maxCallsPerMinute, setMaxCallsPerMinute] = useState(25);
  const [retryLimit, setRetryLimit] = useState(2);
  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (!complianceAcknowledged) return;

    createVoiceCampaign({
      title,
      audioName,
      audioDurationSeconds: Number(audioDurationSeconds),
      targetAudience,
      targetCount: Number(targetCount),
      allowedStartTime,
      allowedEndTime,
      maxCallsPerMinute: Number(maxCallsPerMinute),
      retryLimit: Number(retryLimit),
      complianceAcknowledged,
      createdBy: user ? (isBn ? user.fullNameBn : user.fullNameEn) : 'MadSol Admin'
    });

    onClose();
  };

  return (
    <div
      id="voice-campaign-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="voice-campaign-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {isBn ? 'নতুন ভয়েস কল ক্যাম্পেইন' : 'New Voice Call Campaign'}
                <Badge variant="warning">Telecom Foundation</Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'এক ক্লিকে সকল অভিভাবকের ফোনে সরাসরি স্বয়ংক্রিয় অডিও কল ব্রডকাস্ট'
                  : 'Automated outbound voice broadcasting to parents with strict compliance'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Regulatory Compliance Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isBn ? 'বিটিআরসি ও টেলিযোগাযোগ আইনি সময়সীমা' : 'Telecommunications Regulatory Window'}</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
              {isBn
                ? 'আইনানুযায়ী স্বয়ংক্রিয় ভয়েস কল শুধুমাত্র সকাল ৯:০০ টা থেকে রাত ৮:০০ টা পর্যন্ত কার্যকর করা যাবে। রাতের বেলা ভয়েস কল কঠোরভাবে নিষিদ্ধ।'
                : 'Automated voice calls are strictly restricted to 09:00 AM - 08:00 PM BST. Night calls are legally prohibited.'}
            </p>
          </div>

          {/* Campaign Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'ক্যাম্পেইনের নাম / বিষয়*' : 'Campaign Title*'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBn ? 'যেমন: জরুরি প্রতিকূল আবহাওয়ায় মাদ্রাসা বন্ধ সংক্রান্ত' : 'e.g. Weather Emergency Closure Notice'}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Audio File Selection / Simulation */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileAudio className="w-4 h-4 text-purple-600" />
              {isBn ? 'অডিও বার্তা নির্বাচন' : 'Audio Message Track'}
            </label>
            <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{audioName}</p>
                  <p className="text-[10px] text-slate-400">
                    {isBn ? `দৈর্ঘ্য: ${audioDurationSeconds} সেকেন্ড (মানসম্মত অডিও ফরম্যাট)` : `Duration: ${audioDurationSeconds}s`}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                {isBn ? 'রেডি টু ব্রডকাস্ট' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Audience and Target Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'টার্গেট প্রাপক' : 'Target Audience'}
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as RecipientType)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all_guardians">{isBn ? 'সকল অভিভাবক (All Guardians)' : 'All Guardians'}</option>
                <option value="all_teachers">{isBn ? 'সকল শিক্ষক (All Teachers)' : 'All Teachers'}</option>
                <option value="donors">{isBn ? 'শুভাকাঙ্ক্ষী ও দাতা (Donors)' : 'Donors & Patrons'}</option>
                <option value="chanda_members">{isBn ? 'মাসিক চাঁদা সদস্যবৃন্দ' : 'Chanda Members'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আনুমানিক প্রাপক সংখ্যা' : 'Recipient Count'}
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Telecommunication Rate & Timing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শুরুর সময় (Window Start)' : 'Window Start'}
              </label>
              <input
                type="time"
                value={allowedStartTime}
                onChange={(e) => setAllowedStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শেষ সময় (Window End)' : 'Window End'}
              </label>
              <input
                type="time"
                value={allowedEndTime}
                onChange={(e) => setAllowedEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'কল গতি (প্রতি মিনিটে)' : 'Calls per Minute'}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={maxCallsPerMinute}
                onChange={(e) => setMaxCallsPerMinute(Number(e.target.value) || 20)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Compliance Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="voice-compliance-cb"
              checked={complianceAcknowledged}
              onChange={(e) => setComplianceAcknowledged(e.target.checked)}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="voice-compliance-cb" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
              {isBn
                ? 'আমি অঙ্গীকার করছি যে এই বার্তাটি জরুরি প্রাতিষ্ঠানিক প্রয়োজনে পাঠানো হচ্ছে এবং টেলিযোগাযোগ নিয়মনীতি ও সময়সীমা মেনে পরিচালিত হবে।'
                : 'I certify that this broadcast adheres to national telecommunication guidelines and permissible calling hours.'}
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!complianceAcknowledged}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center gap-2 ${
                complianceAcknowledged
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-700/20 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              {isBn ? 'ভয়েস ক্যাম্পেইন চূড়ান্ত করুন' : 'Create Voice Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

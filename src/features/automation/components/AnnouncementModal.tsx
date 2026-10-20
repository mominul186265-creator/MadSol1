import React, { useState } from 'react';
import {
  X,
  Megaphone,
  AlertTriangle,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Radio
} from 'lucide-react';
import {
  Announcement,
  AnnouncementCategory,
  AnnouncementAudience,
  NotificationPriority
} from '../../../types/automation';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAnnouncement?: Announcement | null;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  editAnnouncement
}) => {
  const { createAnnouncement, updateAnnouncement } = useAutomation();
  const { language } = useLanguage();
  const { user } = useAuth();

  const isBn = language === 'bn';

  const [titleBn, setTitleBn] = useState(editAnnouncement?.titleBn || '');
  const [titleEn, setTitleEn] = useState(editAnnouncement?.titleEn || '');
  const [messageBn, setMessageBn] = useState(editAnnouncement?.messageBn || '');
  const [messageEn, setMessageEn] = useState(editAnnouncement?.messageEn || '');
  const [category, setCategory] = useState<AnnouncementCategory>(
    editAnnouncement?.category || 'academic'
  );
  const [priority, setPriority] = useState<NotificationPriority>(
    editAnnouncement?.priority || 'normal'
  );
  const [audience, setAudience] = useState<AnnouncementAudience>(
    editAnnouncement?.audience || 'everyone'
  );
  const [isEmergency, setIsEmergency] = useState<boolean>(
    editAnnouncement?.isEmergency || false
  );
  const [channels, setChannels] = useState<('app' | 'push' | 'sms' | 'email')[]>(
    editAnnouncement?.channels || ['app', 'push']
  );
  const [publishDate, setPublishDate] = useState(
    editAnnouncement?.publishDate || new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    editAnnouncement?.expiryDate || ''
  );

  if (!isOpen) return null;

  const toggleChannel = (ch: 'app' | 'push' | 'sms' | 'email') => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn && !titleEn) return;

    const creator = user
      ? isBn
        ? user.fullNameBn
        : user.fullNameEn
      : 'MadSol Admin';

    const payload = {
      titleBn: titleBn || titleEn,
      titleEn: titleEn || titleBn,
      messageBn: messageBn || messageEn,
      messageEn: messageEn || messageBn,
      category,
      priority: isEmergency ? 'emergency' : priority,
      audience,
      publishDate,
      expiryDate: expiryDate || undefined,
      channels,
      isEmergency,
      status: 'published' as const,
      createdBy: creator
    };

    if (editAnnouncement) {
      updateAnnouncement(editAnnouncement.id, payload);
    } else {
      createAnnouncement(payload);
    }
    onClose();
  };

  return (
    <div
      id="announcement-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="announcement-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isEmergency
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {editAnnouncement
                  ? isBn
                    ? 'ঘোষণা বা নোটিশ সম্পাদনা'
                    : 'Edit Announcement'
                  : isBn
                  ? 'নতুন নোটিশ ও বিজ্ঞপ্তি প্রকাশ'
                  : 'Publish Institutional Announcement'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'মাদ্রাসা নোটিশ বোর্ড, অভিভাবক অ্যাপ ও জরুরি এসএমএস ব্রডকাস্ট'
                  : 'Notice board, parent app feeds & emergency broadcasts'}
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
          {/* Emergency Alert Switch */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-slate-900 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">
                  {isBn ? 'জরুরি জরুরি অ্যালার্ট মোড (Emergency Broadcast)' : 'Emergency Broadcast Mode'}
                </span>
                <span className="text-[11px] text-rose-700 dark:text-rose-400">
                  {isBn
                    ? 'আবহাওয়া দুর্যোগ, তাৎক্ষণিক ছুটি ইত্যাদিতে লাল ব্যানারে হাইলাইট হবে'
                    : 'High-priority banner on apps, override normal schedules'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => {
                  setIsEmergency(e.target.checked);
                  if (e.target.checked) setPriority('emergency');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বিজ্ঞপ্তির শিরোনাম (বাংলা)*' : 'Title (Bangla)*'}
              </label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: পবিত্র রমাদানের ছুটি সংক্রান্ত"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Ramadan Vacation Notice"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Category, Priority, Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="w-full px-2.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="academic">{isBn ? 'একাডেমিক' : 'Academic'}</option>
                <option value="holiday">{isBn ? 'ছুটি সংক্রান্ত' : 'Holiday'}</option>
                <option value="exam">{isBn ? 'পরীক্ষা' : 'Exam'}</option>
                <option value="event">{isBn ? 'অনুষ্ঠান / মাহফিল' : 'Event'}</option>
                <option value="emergency">{isBn ? 'জরুরি বিজ্ঞপ্তি' : 'Emergency'}</option>
                <option value="general">{isBn ? 'সাধারণ' : 'General'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'গুরুত্ব (Priority)' : 'Priority'}
              </label>
              <select
                value={priority}
                disabled={isEmergency}
                onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                className="w-full px-2.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="normal">{isBn ? 'স্বাভাবিক (Normal)' : 'Normal'}</option>
                <option value="important">{isBn ? 'গুরুত্বপূর্ণ (Important)' : 'Important'}</option>
                <option value="urgent">{isBn ? 'জরুরি (Urgent)' : 'Urgent'}</option>
                <option value="emergency">{isBn ? 'মহাজরুরি (Emergency)' : 'Emergency'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'টার্গেট প্রাপক (Audience)' : 'Target Audience'}
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                className="w-full px-2.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="everyone">{isBn ? 'সকলের জন্য (Everyone)' : 'Everyone'}</option>
                <option value="guardians">{isBn ? 'শুধুমাত্র অভিভাবক' : 'Guardians Only'}</option>
                <option value="students">{isBn ? 'শুধুমাত্র শিক্ষার্থী' : 'Students Only'}</option>
                <option value="teachers">{isBn ? 'শুধুমাত্র শিক্ষক ও স্টাফ' : 'Teachers & Staff'}</option>
              </select>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {isBn ? 'বিতরণ চ্যানেল (Delivery Channels)*' : 'Distribution Channels*'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleChannel('app')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  channels.includes('app')
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                {isBn ? 'মাদ্রাসা অ্যাপ নোটিশ বোর্ড' : 'In-App Notice Board'}
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('push')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  channels.includes('push')
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                {isBn ? 'পুশ নোটিফিকেশন' : 'Push Notification'}
              </button>

              <button
                type="button"
                onClick={() => toggleChannel('sms')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  channels.includes('sms')
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {isBn ? 'বাল্ক এসএমএস অ্যালার্ট' : 'Bulk SMS Broadcast'}
              </button>
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'বিজ্ঞপ্তির বিস্তারিত বিবরণ (বাংলা)*' : 'Announcement Body (Bangla)*'}
            </label>
            <textarea
              rows={4}
              required
              value={messageBn}
              onChange={(e) => setMessageBn(e.target.value)}
              placeholder={isBn ? 'বিস্তারিত নোটিশ লিখুন...' : 'Write full announcement text...'}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রকাশের তারিখ' : 'Publish Date'}
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'মেয়াদ শেষের তারিখ (ঐচ্ছিক)' : 'Expiry Date (Optional)'}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
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
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editAnnouncement
                ? isBn
                  ? 'আপডেট সম্পন্ন করুন'
                  : 'Update Announcement'
                : isBn
                ? 'এখনই প্রকাশ করুন'
                : 'Publish Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

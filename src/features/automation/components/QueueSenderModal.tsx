import React, { useState } from 'react';
import {
  X,
  Send,
  Smartphone,
  Mail,
  Bell,
  AlertCircle,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Badge } from '../../../components/common/Badge';

interface QueueSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueSenderModal: React.FC<QueueSenderModalProps> = ({
  isOpen,
  onClose
}) => {
  const { enqueueMessage, templates, renderTemplate } = useAutomation();
  const { language } = useLanguage();

  const isBn = language === 'bn';

  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [recipientRole, setRecipientRole] = useState('অভিভাবক (Guardian)');
  const [channel, setChannel] = useState<'sms' | 'push' | 'email' | 'app'>('sms');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent' | 'emergency'>('normal');

  if (!isOpen) return null;

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setMessageText(isBn ? tmpl.templateBn : tmpl.templateEn);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientContact || !messageText) return;

    const res = enqueueMessage({
      recipientName,
      recipientContact,
      recipientRole,
      channel,
      messageText,
      priority
    });

    if (res.success) {
      onClose();
    }
  };

  return (
    <div
      id="queue-sender-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="queue-sender-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'সরাসরি বার্তা পাঠান (Queue Engine)' : 'Direct Message Dispatch'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'স্বয়ংক্রিয় নম্বর যাচাই ও কিউ সিস্টেম' : 'Mobile validation & rate-limited delivery queue'}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'বার্তা প্রেরণের মাধ্যম (Channel)' : 'Channel'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'sms'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{isBn ? 'এসএমএস (SMS)' : 'SMS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('push')}
                className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'push'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>{isBn ? 'পুশ (Push)' : 'Push'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`p-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  channel === 'email'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{isBn ? 'ইমেইল (Email)' : 'Email'}</span>
              </button>
            </div>
          </div>

          {/* Recipient Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রাপকের নাম*' : 'Recipient Name*'}
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={isBn ? 'যেমন: সেলিম শিকদার' : 'e.g. Salim Shikdar'}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {channel === 'email'
                  ? isBn
                    ? 'ইমেইল ঠিকানা*'
                    : 'Email Address*'
                  : isBn
                  ? 'মোবাইল নম্বর (১১ ডিজিট)*'
                  : 'Phone Number (11 digits)*'}
              </label>
              <input
                type="text"
                required
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                placeholder={channel === 'email' ? 'guardian@example.com' : '017xxxxxxxx'}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Quick Template Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'টেমপ্লেট থেকে পূরণ করুন (ঐচ্ছিক)' : 'Fill from Template (Optional)'}
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">-- {isBn ? 'কাস্টম বার্তা লিখুন' : 'Write Custom Message'} --</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {isBn ? tmpl.nameBn : tmpl.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'বার্তার বিষয়বস্তু*' : 'Message Content*'}
            </label>
            <textarea
              rows={3}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={isBn ? 'বার্তা লিখুন...' : 'Type message...'}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed font-sans"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
              <Send className="w-4 h-4" />
              {isBn ? 'কিউ-তে পাঠান' : 'Enqueue & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

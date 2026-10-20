import React, { useState } from 'react';
import {
  X,
  Send,
  Smartphone,
  PhoneCall,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';

interface BulkBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkBroadcastModal: React.FC<BulkBroadcastModalProps> = ({
  isOpen,
  onClose
}) => {
  const { enqueueMessage, templates } = useAutomation();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [channel, setChannel] = useState<'sms' | 'voice'>('sms');
  const [recipientGroup, setRecipientGroup] = useState('all_parents');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!messageText) return;
    
    setIsProcessing(true);
    
    // Simulating bulk enqueueing for 100+ users
    setTimeout(() => {
      // Demo: enqueue a few just to show in the history/queue
      for (let i = 0; i < 5; i++) {
         enqueueMessage({
           recipientName: `Bulk User ${i+1}`,
           recipientContact: `01711000${100+i}`,
           recipientRole: 'অভিভাবক',
           channel,
           messageText,
           priority: 'urgent'
         });
      }
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {isBn ? 'বাল্ক ব্রডকাস্ট (১০০+ ব্যবহারকারী)' : 'Bulk Broadcast (100+ Users)'}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {isBn ? 'এক ক্লিকে একাধিক ব্যক্তিকে কল বা এসএমএস' : 'One-click massive SMS/Voice dispatch'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full flex items-center justify-center">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
               {isBn ? 'সফলভাবে পাঠানো হয়েছে!' : 'Broadcast Initiated!'}
             </h3>
             <p className="text-sm text-slate-500">
               {isBn ? 'মেসেজগুলো কিউ-তে যুক্ত হয়েছে।' : 'Messages added to delivery queue.'}
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            
            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isBn ? 'কাদের পাঠাবেন? (Target Audience)' : 'Target Audience'}
              </label>
              <select
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all_parents">{isBn ? 'সব অভিভাবক (১০০+)' : 'All Guardians (100+)'}</option>
                <option value="all_teachers">{isBn ? 'সব শিক্ষক ও স্টাফ (৪৫+)' : 'All Teachers (45+)'}</option>
                <option value="absent_students">{isBn ? 'আজকের অনুপস্থিত শিক্ষার্থী (১২)' : 'Absent Students Today (12)'}</option>
                <option value="due_fees">{isBn ? 'বকেয়া ফি আছে এমন (৮৭)' : 'Guardians with Due Fees (87)'}</option>
              </select>
            </div>

            {/* Channel Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isBn ? 'মাধ্যম নির্বাচন করুন (Channel)' : 'Select Channel'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'sms'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isBn ? 'এসএমএস (SMS)' : 'SMS'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('voice')}
                  className={`p-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'voice'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-800 dark:text-purple-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isBn ? 'ভয়েস কল (Voice)' : 'Voice Call'}</span>
                </button>
              </div>
            </div>

            {/* Template or custom message */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isBn ? 'টেমপ্লেট (ঐচ্ছিক)' : 'Template (Optional)'}
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- {isBn ? 'কাস্টম বার্তা' : 'Custom Message'} --</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {isBn ? tmpl.nameBn : tmpl.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {channel === 'voice' 
                    ? isBn ? 'কল করার জন্য টেক্সট (অটো ভয়েস হবে)*' : 'Text to Speech Content*'
                    : isBn ? 'এসএমএস এর বিষয়বস্তু*' : 'SMS Content*'
                  }
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isBn ? 'আপনার বার্তা লিখুন...' : 'Type message...'}
                  className="w-full px-3 py-3 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
               <p className="text-xs text-amber-800 dark:text-amber-200 font-semibold leading-relaxed">
                 {isBn 
                    ? 'সতর্কতা: এটি একসাথে শতাধিক ব্যবহারকারীকে বার্তা পাঠাবে। নিশ্চিত হয়ে "ব্রডকাস্ট শুরু করুন" বাটনে ক্লিক করুন।' 
                    : 'Warning: This will dispatch messages to hundreds of users at once. Please verify before proceeding.'}
               </p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isProcessing || !messageText}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isBn ? 'ব্রডকাস্ট শুরু করুন' : 'Start Broadcast'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

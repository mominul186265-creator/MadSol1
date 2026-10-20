import React, { useState } from 'react';
import {
  X,
  Send,
  Smartphone,
  PhoneCall,
  Plus,
  Trash2,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';

interface ManualDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualDialerModal: React.FC<ManualDialerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { enqueueMessage, templates } = useAutomation();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);
  const [channel, setChannel] = useState<'sms' | 'voice'>('sms');
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

  const handleAddNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const handleRemoveNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newNumbers = [...phoneNumbers];
      newNumbers.splice(index, 1);
      setPhoneNumbers(newNumbers);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...phoneNumbers];
    newNumbers[index] = value;
    setPhoneNumbers(newNumbers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validNumbers = phoneNumbers.filter(n => n.trim().length > 0);
    if (validNumbers.length === 0 || !messageText) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      validNumbers.forEach((num, idx) => {
         enqueueMessage({
           recipientName: `Manual Contact ${idx + 1}`,
           recipientContact: num,
           recipientRole: 'Manual',
           channel,
           messageText,
           priority: 'urgent'
         });
      });
      setIsProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPhoneNumbers(['']);
        setMessageText('');
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                {isBn ? 'ম্যানুয়াল কল ও মেসেজ' : 'Manual Dialer & Message'}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {isBn ? 'সিংগেল বা একাধিক নম্বরে সরাসরি যোগাযোগ' : 'Direct contact to single or multiple numbers'}
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
             <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full flex items-center justify-center">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
               {isBn ? 'সফলভাবে পাঠানো হয়েছে!' : 'Request Processed!'}
             </h3>
             <p className="text-sm text-slate-500">
               {isBn ? 'কল/মেসেজ কিউ-তে যুক্ত হয়েছে।' : 'Calls/Messages added to delivery queue.'}
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            
            {/* Phone Numbers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'মোবাইল নম্বর যুক্ত করুন (Add Numbers)' : 'Add Mobile Numbers'}
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                  {phoneNumbers.length} {isBn ? 'টি নম্বর' : 'Numbers'}
                </span>
              </div>
              <div className="space-y-2 max-h-[160px] overflow-y-auto p-1">
                {phoneNumbers.map((num, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={num}
                      onChange={(e) => handleNumberChange(idx, e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="flex-1 px-3 py-2 rounded-xl text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {phoneNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNumber(idx)}
                        className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddNumber}
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {isBn ? 'আরও নম্বর যোগ করুন' : 'Add Another Number'}
              </button>
            </div>

            {/* Channel Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isBn ? 'যোগাযোগের মাধ্যম' : 'Communication Channel'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'sms'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isBn ? 'টেক্সট মেসেজ (SMS)' : 'Text Message'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('voice')}
                  className={`p-3 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    channel === 'voice'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isBn ? 'অটো ভয়েস কল' : 'Auto Voice Call'}</span>
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
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- {isBn ? 'কাস্টম বার্তা লিখুন' : 'Write Custom Message'} --</option>
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
                    ? isBn ? 'ভয়েস কলে যা বলা হবে*' : 'Text to Speech Content*'
                    : isBn ? 'এসএমএস মেসেজ*' : 'SMS Content*'
                  }
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isBn ? 'আপনার বার্তা লিখুন...' : 'Type message...'}
                  className="w-full px-3 py-3 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
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
                disabled={isProcessing || !messageText || phoneNumbers.every(n => !n.trim())}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-700/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isBn ? 'পাঠান (Send)' : 'Send Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

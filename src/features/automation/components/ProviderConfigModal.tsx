import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  Smartphone,
  Mail,
  PhoneCall
} from 'lucide-react';
import { ProviderConfiguration } from '../../../types/automation';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Badge } from '../../../components/common/Badge';

interface ProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderConfigModal: React.FC<ProviderConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const { providerSettings, updateProviderSettings } = useAutomation();
  const { language } = useLanguage();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'sms' | 'email' | 'push' | 'voice'>('sms');

  // Local form state
  const [smsAdapter, setSmsAdapter] = useState(providerSettings.sms.adapter);
  const [smsSenderId, setSmsSenderId] = useState(providerSettings.sms.senderId);
  const [smsEndpoint, setSmsEndpoint] = useState(providerSettings.sms.apiEndpoint);
  const [smsConfigured, setSmsConfigured] = useState(providerSettings.sms.isConfigured);

  const [emailAdapter, setEmailAdapter] = useState(providerSettings.email.adapter);
  const [fromEmail, setFromEmail] = useState(providerSettings.email.fromEmail);
  const [fromName, setFromName] = useState(providerSettings.email.fromName);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProviderSettings({
      sms: {
        ...providerSettings.sms,
        adapter: smsAdapter,
        senderId: smsSenderId,
        apiEndpoint: smsEndpoint,
        isConfigured: smsConfigured,
        status: smsConfigured ? 'active' : 'not_configured'
      },
      email: {
        ...providerSettings.email,
        adapter: emailAdapter,
        fromEmail,
        fromName
      }
    });
    onClose();
  };

  return (
    <div
      id="provider-config-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="provider-config-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {isBn ? 'যোগাযোগ প্রোভাইডার সেটিংস' : 'Communication Provider Settings'}
                <Badge variant="success">Adapter Architecture</Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'এসএমএস গেটওয়ে, ইমেইল ও পুশ নোটিফিকেশন ইন্টিগ্রেশন'
                  : 'Modular SMS, Email & Push Gateway Adapters'}
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50/40 dark:bg-slate-800/20">
          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'sms'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? 'এসএমএস গেটওয়ে' : 'SMS Gateway'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isBn ? 'ইমেইল (SMTP)' : 'Email (SMTP)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'voice'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isBn ? 'ভয়েস গেটওয়ে' : 'Voice Gateway'}</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'সক্রিয় এসএমএস গেটওয়ে স্ট্যাটাস' : 'Active SMS Gateway Status'}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsConfigured}
                    onChange={(e) => setSmsConfigured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-semibold text-xs">{isBn ? 'সক্রিয় রাখুন' : 'Enabled'}</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'এসএমএস অ্যাডাপ্টার নির্বাচন' : 'SMS Adapter Provider'}
                </label>
                <select
                  value={smsAdapter}
                  onChange={(e) => setSmsAdapter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                >
                  <option value="greenweb">Greenweb SMS BD (Greenweb API)</option>
                  <option value="teletalk">Teletalk Enterprise SMS Gateway</option>
                  <option value="bulksmsbd">BulkSMSBD Provider</option>
                  <option value="infobip">Infobip Global Gateway</option>
                  <option value="custom">Custom HTTP Rest API</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'অনুমোদিত সেন্ডার আইডি (Sender ID)*' : 'Approved Sender ID*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    placeholder="MADS0L"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'এপিআই এন্ডপয়েন্ট' : 'API Endpoint'}
                  </label>
                  <input
                    type="text"
                    value={smsEndpoint}
                    onChange={(e) => setSmsEndpoint(e.target.value)}
                    placeholder="https://api.greenweb.com.bd/api.php"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-slate-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                {isBn
                  ? 'নিরাপত্তা নীতিমালা: কোনো এপিআই সিক্রেট কি ফ্রন্টএন্ডে উন্মুক্ত হয় না; এটি নিরাপদ সার্ভার-সাইড এনভায়রনমেন্টের মাধ্যমে সুরক্ষিত থাকে।'
                  : 'Security policy: API keys are securely managed via server proxies and never exposed in client bundles.'}
              </p>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ইমেইল অ্যাডাপ্টার' : 'Email Adapter'}
                </label>
                <select
                  value={emailAdapter}
                  onChange={(e) => setEmailAdapter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="smtp">Standard SMTP Server</option>
                  <option value="sendgrid">SendGrid Web API</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রেরক ইমেইল (From Email)' : 'From Email'}
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'প্রেরক নাম (From Name)' : 'From Name'}
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300">
                <p className="font-bold mb-1">{isBn ? 'টেলিযোগাযোগ ভয়েস হাব' : 'Voice Gateway Architecture'}</p>
                <p className="text-[11px] leading-relaxed">
                  {isBn
                    ? 'টেলিটক / লাইসেন্সড অডিও ব্রডকাস্ট এপিআই-এর সাথে সংযোগ স্থাপন করে স্বয়ংক্রিয় ভয়েস কল সম্পন্ন হয়।'
                    : 'Outbound telecommunication voice trunking supporting SIP / Authorized telecom lines.'}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
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
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isBn ? 'সংরক্ষণ করুন' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

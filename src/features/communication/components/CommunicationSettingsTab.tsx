import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Lock,
  Globe,
  Radio,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Layers,
  PhoneCall,
  Send,
  Zap,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { ProviderId } from '../../../types/communication';

export const CommunicationSettingsTab: React.FC = () => {
  const { providerConfig, updateProviderSettings, testProviderConnection } = useCommunication();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isBn = language === 'bn';

  const isSuperAdminOrPrincipal =
    user?.role_id === 'super_admin' ||
    user?.role_id === 'principal' ||
    user?.role_id === 'institution_admin';

  const [selectedProviderId, setSelectedProviderId] = useState<ProviderId>(providerConfig.providerId);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [senderIdInput, setSenderIdInput] = useState(providerConfig.senderId);
  const [voiceCallerIdInput, setVoiceCallerIdInput] = useState(providerConfig.voiceCallerId);
  const [isSandbox, setIsSandbox] = useState(providerConfig.isSandbox);
  const [showKey, setShowKey] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    messageBn: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testProviderConnection(selectedProviderId, apiKeyInput || undefined, apiSecretInput || undefined);
      setTestResult({
        success: res.success,
        latencyMs: res.latencyMs,
        message: res.message,
        messageBn: res.messageBn,
      });
    } catch {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: 'Connection failed',
        messageBn: 'সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProviderSettings(
      {
        providerId: selectedProviderId,
        senderId: senderIdInput.trim() || 'MADRASAH',
        voiceCallerId: voiceCallerIdInput.trim() || '+8809612000000',
        isSandbox,
        providerName:
          selectedProviderId === 'protiddhoni'
            ? 'Protiddhoni (ভয়েস ব্রডকাস্ট গেটওয়ে)'
            : selectedProviderId === 'bulksms_bd'
            ? 'BulkSMS BD (National Gateway)'
            : selectedProviderId === 'dnotify'
            ? 'Dnotify API (Deprecated)'
            : 'MadSol Sandbox Simulator',
      },
      apiKeyInput.trim() || undefined,
      apiSecretInput.trim() || undefined
    );
    setApiKeyInput('');
    setApiSecretInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            {isBn ? 'কমিউনিকেশন গেটওয়ে ও প্রোভাইডার সেটিংস' : 'Communication Gateway & Provider Configuration'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'Protiddhoni API ও অন্যান্য ভয়েস/এসএমএস গেটওয়ের সিকিউর কনফিগারেশন এবং প্রোভাইডার পরিবর্তন।'
              : 'Configure secure Protiddhoni API credentials, Sender ID masking, and pluggable gateways.'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'সিকিউর প্রোভাইডার লেয়ার সচল' : 'Secure Provider Layer Active'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 Columns */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-5">
          {/* 1. Provider Switcher */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              {isBn ? '১. সক্রিয় কমিউনিকেশন গেটওয়ে প্রোভাইডার' : '1. Active Provider Gateway'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'protiddhoni',
                  name: 'Protiddhoni Voice',
                  desc: isBn ? 'ভয়েস কল ক্যাম্পেইন (IVR)' : 'Voice Call Campaign (IVR)',
                  badge: isBn ? 'সুপারিশকৃত' : 'Recommended',
                  color: 'emerald',
                },
                {
                  id: 'bulksms_bd',
                  name: 'BulkSMS BD',
                  desc: isBn ? 'শুধু জাতীয় এসএমএস' : 'SMS Gateway Only',
                  badge: 'National',
                  color: 'blue',
                },
                {
                  id: 'mock_simulator',
                  name: 'Sandbox Simulator',
                  desc: isBn ? 'লোকাল টেস্ট সিমুলেটর' : 'Offline Safe Testing',
                  badge: 'Free Test',
                  color: 'amber',
                },
              ].map((p) => {
                const isSelected = selectedProviderId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProviderId(p.id as ProviderId)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{p.desc}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Credentials & Parameters */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              {isBn ? '২. এপিআই ক্রেডেনশিয়াল ও সেন্ডার আইডি' : '2. API Credentials & Sender Identity'}
            </label>

            {/* API Key */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isBn ? 'প্রোভাইডার এপিআই কি (API Key)' : 'Provider API Key'}
                </label>
                <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {providerConfig.hasApiKey ? (isBn ? 'এনক্রিপ্টেড সেভ আছে' : 'Encrypted & Stored') : (isBn ? 'সেট করা নেই' : 'Unset')}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    providerConfig.hasApiKey
                      ? providerConfig.apiKeyMasked
                      : 'dnot_live_sk_••••••••••••••••••••••••••••'
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                {isBn
                  ? 'নিরাপত্তার স্বার্থে আসল এপিআই কি কখনো ব্রাউজারে প্লেইন টেক্সট হিসেবে সংরক্ষিত থাকে না।'
                  : 'For security, raw API keys are never stored in plain text on client side.'}
              </p>
            </div>

            {/* Sender ID & Voice Caller ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isBn ? 'অনুমোদিত এসএমএস সেন্ডার আইডি (Masking)' : 'SMS Masking Sender ID'}
                </label>
                <input
                  type="text"
                  value={senderIdInput}
                  onChange={(e) => setSenderIdInput(e.target.value)}
                  placeholder="MADRASAH"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  {isBn ? 'ভয়েস কলার আইডি (IVR CLI)' : 'Voice Caller CLI Phone'}
                </label>
                <input
                  type="text"
                  value={voiceCallerIdInput}
                  onChange={(e) => setVoiceCallerIdInput(e.target.value)}
                  placeholder="+8809612000000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>

            {/* Sandbox Mode Toggle */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? 'স্যান্ডবক্স / টেস্ট মোড (Sandbox Mode)' : 'Sandbox Test Mode'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isBn ? 'স্যান্ডবক্স চালু থাকলে কোনো ব্যালেন্স বা টাকা কাটবে না।' : 'Simulate API calls without real billing deduction.'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSandbox(!isSandbox)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                  isSandbox ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isSandbox ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* RBAC Notice for Teachers/Staff */}
          {!isSuperAdminOrPrincipal && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isBn
                  ? 'বিজ্ঞপ্তি: শুধুমাত্র মুহতামিম বা প্রিন্সিপাল গেটওয়ে ক্রেডেনশিয়াল এবং প্রোভাইডার সেটিংস পরিবর্তন করতে পারেন।'
                  : 'Notice: Only Principal or Super Admin can modify gateway provider credentials.'}
              </span>
            </div>
          )}

          {/* Test & Save Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
              <span>{isBn ? 'সংযোগ টেস্ট করুন' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              disabled={!isSuperAdminOrPrincipal}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isSuperAdminOrPrincipal
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isBn ? 'সেটিংস সংরক্ষণ করুন' : 'Save Provider Settings'}</span>
            </button>
          </div>

          {/* Test Result Feedback Alert */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>{isBn ? (testResult.success ? 'সংযোগ সফল' : 'সংযোগ ব্যর্থ') : testResult.success ? 'Success' : 'Failed'}</span>
                  <span className="font-mono text-[10px] opacity-80 font-normal">({testResult.latencyMs}ms ping)</span>
                </div>
                <p className="mt-0.5 leading-relaxed">{isBn ? testResult.messageBn : testResult.message}</p>
              </div>
            </div>
          )}
        </form>

        {/* Right 5 Columns: Security Architecture & Webhook Info */}
        <div className="lg:col-span-5 space-y-5">
          {/* Security Guarantee Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-3xl shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100">
                {isBn ? 'সিকিউর আর্কিটেকচার পলিসি' : 'Security Architecture Policy'}
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white">Zero Plain-text Storage:</strong> এপিআই কি ও সিক্রেট টোকেন কখনো ডাটাবেস বা ফ্রন্টএন্ড কোডে উন্মুক্ত থাকে না।
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white">Pluggable Abstraction:</strong> <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">ICommunicationProvider</code> ইন্টারফেসের মাধ্যমে প্রোভাইডার পরিবর্তন করলে পুরো অ্যাপ্লিকেশনের অন্য কোনো কোড পরিবর্তন করতে হয় না।
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white">Protiddhoni & National Gateways:</strong> বাংলাদেশ ও আন্তর্জাতিক স্ট্যান্ডার্ড স্বয়ংক্রিয় ভয়েস কল (IVR) ও এসএমএস গেটওয়ে সম্পূর্ণ প্রস্তুত।
                </p>
              </div>
            </div>

            {/* Inbound Webhook Callback URL */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{isBn ? 'ইনবাউন্ড ডেলিভারি ওয়েবহুক (DLR Webhook)' : 'Inbound DLR Webhook'}</span>
              </label>
              <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 break-all select-all">
                {providerConfig.webhookUrl}
              </div>
            </div>
          </div>

          {/* Protiddhoni API Contract Status Panel */}
          {selectedProviderId === 'protiddhoni' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <Layers className="w-4.5 h-4.5 text-emerald-600" />
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {isBn ? 'Protiddhoni এপিআই চুক্তি স্থিতি (API Contracts)' : 'Protiddhoni API Contract Status'}
                </h4>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    endpoint: 'GET /v1/wallet/balance',
                    name: isBn ? 'ব্যালেন্স ও ওয়ালেট ইনকুয়েরি' : 'Wallet & Balance Inquiry',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/campaigns',
                    name: isBn ? 'ভয়েস ক্যাম্পেইন তালিকা' : 'List Campaigns',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/campaigns/{id}/status',
                    name: isBn ? 'ক্যাম্পেইন স্থিতি বিবরণ' : 'Campaign Status by ID',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/campaigns/{id}/report',
                    name: isBn ? 'ক্যাম্পেইন সিডিআর রিপোর্ট' : 'Campaign CDR Report',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/contacts/groups',
                    name: isBn ? 'কন্টাক্ট গ্রুপস তালিকা' : 'List Contact Groups',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/dynamic-tts/status/{id}',
                    name: isBn ? 'টিটিএস স্থিতি বিবরণ' : 'Dynamic TTS Status',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'GET /v1/cdr',
                    name: isBn ? 'কল ডিটেইল রেকর্ডস (CDR)' : 'List CDR Logs',
                    status: 'Verified Endpoint',
                    statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
                  },
                  {
                    endpoint: 'POST /v1/campaigns',
                    name: isBn ? 'ভয়েস ক্যাম্পেইন তৈরি' : 'Create Voice Campaign',
                    status: 'Schema Unverified / Sandbox Only',
                    statusColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
                  },
                  {
                    endpoint: 'POST /v1/contacts/import',
                    name: isBn ? 'কন্টাক্ট ইমপোর্ট' : 'Import Contacts',
                    status: 'Schema Unverified / Disabled',
                    statusColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
                  },
                  {
                    endpoint: 'POST /v1/dynamic-tts/trigger',
                    name: isBn ? 'ডাইনামিক টিটিএস ট্রিগার' : 'Trigger Dynamic TTS',
                    status: 'Schema Unverified / Disabled',
                    statusColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
                  },
                  {
                    endpoint: 'POST /v1/dynamic-tts/bulk',
                    name: isBn ? 'বাল্ক টিটিএস ক্যাম্পেইন' : 'Trigger Bulk TTS',
                    status: 'Schema Unverified / Disabled',
                    statusColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300',
                  },
                ].map((cap, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0 last:pb-0">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{cap.name}</div>
                      <code className="text-[9px] font-mono text-slate-400">{cap.endpoint}</code>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full text-center shrink-0 self-start sm:self-center ${cap.statusColor}`}>
                      {cap.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

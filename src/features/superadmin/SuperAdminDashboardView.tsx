import React, { useState } from 'react';
import {
  ShieldAlert,
  Server,
  Building2,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Eye,
  Sliders,
  Database,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ManagedInstitutionAccount, InstitutionModuleConfig } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const SuperAdminDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    managedInstitutions,
    addManagedInstitution,
    toggleInstitutionStatus,
    institutionModules,
    toggleInstitutionModule,
    systemHealth,
    failedJobs,
    securityAlerts,
    resolveSecurityAlert,
    auditLogsDetailed
  } = usePart7System();

  const [activeTab, setActiveTab] = useState<'institutions' | 'modules' | 'health' | 'audit'>('institutions');
  const [instSearch, setInstSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [isAddInstOpen, setIsAddInstOpen] = useState(false);

  // New Institution form
  const [newInstNameBn, setNewInstNameBn] = useState('');
  const [newInstNameEn, setNewInstNameEn] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  const [newInstPlan, setNewInstPlan] = useState<'standard' | 'premium' | 'enterprise'>('premium');

  const filteredInstitutions = managedInstitutions.filter(
    (inst) =>
      inst.nameBn.includes(instSearch) ||
      inst.nameEn.toLowerCase().includes(instSearch.toLowerCase()) ||
      inst.eiin.toLowerCase().includes(instSearch.toLowerCase())
  );

  const filteredAuditLogs = auditLogsDetailed.filter(
    (log) =>
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const handleAddInstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstNameBn || !newInstCode) return;

    addManagedInstitution({
      eiin: newInstCode,
      nameBn: newInstNameBn,
      nameEn: newInstNameEn || 'Madrasa',
      principalName: 'মুহতামিম সাহেব',
      phone: '01711-000000',
      email: `info@${newInstCode.toLowerCase()}.edu.bd`,
      address: 'ঢাকা, বাংলাদেশ',
      planTier: newInstPlan,
      status: 'active',
      studentsCount: 0,
      teachersCount: 0,
      adminEmail: `admin@${newInstCode.toLowerCase()}.edu.bd`
    });

    setIsAddInstOpen(false);
    setNewInstNameBn('');
    setNewInstCode('');
    showToast(language === 'bn' ? 'নতুন প্রতিষ্ঠান সফলভাবে যুক্ত হয়েছে।' : 'Institution added.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Top Badge & Scope Notice */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold">
                {language === 'bn' ? 'MadSol সুপার অ্যাডমিন কন্ট্রোল প্যানেল' : 'MadSol Super Admin Ecosystem'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                ROOT ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'সকল মাদ্রাসার কেন্দ্রীয় পর্যবেক্ষণ, মডিউল পারমিশন, সাবস্ক্রিপশন ও সিস্টেম হেলথ অডিট'
                : 'Central multi-tenant governance, SaaS subscription matrix, and realtime cluster monitoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono font-bold">
            Cluster: 100% Operational
          </span>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট প্রতিষ্ঠানসমূহ</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {managedInstitutions.length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">সক্রিয় ক্লাউড ইনস্ট্যান্স</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট শিক্ষার্থী</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {managedInstitutions.reduce((acc, curr) => acc + curr.studentsCount, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">সক্রিয় ডাটাবেস রেকর্ড</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>সিস্টেম আপটাইম</span>
            <Server className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {systemHealth.uptimePercentage}%
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">লেভেল-৪ এসএলএ</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>এপিআই লেটেন্সি</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {systemHealth.apiLatencyMs}ms
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">আল্ট্রা ফাস্ট রেসপন্স</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        {[
          { id: 'institutions', label: 'প্রতিষ্ঠানসমূহ ও একাউন্টস', icon: Building2 },
          { id: 'modules', label: 'SaaS মডিউল পারমিশন ম্যাট্রিক্স', icon: Sliders },
          { id: 'health', label: 'সিস্টেম মনিটরিং ও হেলথ', icon: Server },
          { id: 'audit', label: 'অডিট লগ ও সিকিউরিটি সেন্টার', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INSTITUTION ACCOUNTS */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="প্রতিষ্ঠান বা কোড দিয়ে খুঁজুন..."
                value={instSearch}
                onChange={(e) => setInstSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <Button variant="primary" onClick={() => setIsAddInstOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন প্রতিষ্ঠান যোগ করুন' : 'Add Institution'}</span>
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="p-3.5">প্রতিষ্ঠান</th>
                    <th className="p-3.5">কোড</th>
                    <th className="p-3.5">SaaS প্ল্যান</th>
                    <th className="p-3.5">ছাত্র / শিক্ষক</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{inst.nameBn}</span>
                        <span className="text-[11px] text-slate-500">{inst.nameEn}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{inst.eiin}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase">
                          {inst.planTier}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {inst.studentsCount} ছাত্র / {inst.teachersCount} শিক্ষক
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {inst.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const newStatus = inst.status === 'active' ? 'suspended' : 'active';
                            toggleInstitutionStatus(inst.id, newStatus);
                            showToast(
                              language === 'bn'
                                ? `স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`
                                : `Status changed to ${newStatus}`,
                              'info'
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            inst.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {inst.status === 'active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAAS MODULE CONFIGURATION PER INSTITUTION */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
            💡 <strong>মডিউল পারমিশন পলিসি:</strong> যে কোনো প্রতিষ্ঠানের জন্য স্বতন্ত্রভাবে হিফজ, বোর্ডিং, মেসেজিং, অটোমেশন বা এআই সহকারী মডিউল তাৎক্ষণিক অন/অফ করা যায়।
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managedInstitutions.map((inst) => {
              const modules = institutionModules[inst.id] || {
                institutionId: inst.id,
                hifzEnabled: true,
                boardingEnabled: true,
                foodEnabled: true,
                accountsEnabled: true,
                donationEnabled: true,
                automationEnabled: true,
                aiAssistantEnabled: true,
                smsGatewayEnabled: true,
                voiceCallEnabled: true,
                certificateEnabled: true,
                documentsEnabled: true
              };

              const moduleList: { key: keyof InstitutionModuleConfig; label: string }[] = [
                { key: 'hifzEnabled', label: 'হিফজুল কুরআন বিভাগ' },
                { key: 'boardingEnabled', label: 'লিল্লাহ বোর্ডিং ও মেস' },
                { key: 'accountsEnabled', label: 'হিসাব ও পে-রোল' },
                { key: 'donationEnabled', label: 'দান ও শুভাকাঙ্ক্ষী চাঁদা' },
                { key: 'automationEnabled', label: 'অটোমেশন সেন্টার' },
                { key: 'aiAssistantEnabled', label: 'MadSol AI সহকারী' },
                { key: 'certificateEnabled', label: 'সনদপত্র বিল্ডার' },
                { key: 'documentsEnabled', label: 'ডকুমেন্ট ভল্ট' }
              ];

              return (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{inst.nameBn}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">Plan: {inst.planTier.toUpperCase()}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold">
                      {inst.eiin}
                    </span>
                  </div>

                  {/* Module Toggles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {moduleList.map((m) => {
                      const isEnabled = modules[m.key] !== false;
                      return (
                        <div
                          key={m.key}
                          onClick={() => {
                            toggleInstitutionModule(inst.id, m.key, !isEnabled);
                            showToast(
                              `${m.label} ${!isEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`,
                              'success'
                            );
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isEnabled
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{m.label}</span>
                          {isEnabled ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM MONITORING & HEALTH */}
      {activeTab === 'health' && (
        <div className="space-y-6 w-full max-w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ডাটাবেস কানেকশন স্থিতি</span>
              <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>{systemHealth.databaseStatus.toUpperCase()}</span>
              </p>
              <span className="text-[11px] text-slate-400">
                কানেকশন স্ট্যাটাস: {systemHealth.databaseStatus === 'connected' ? 'সক্রিয় ও প্রস্তুত' : 'রিকানেক্টিং'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">সিস্টেম মেমরি পুল</span>
              <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>{systemHealth.memoryUsageMb} MB</span>
              </p>
              <span className="text-[11px] text-slate-400">সিপিইউ লোড: {systemHealth.cpuLoadPercentage}%</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">অটোমেশন কিউ জব</span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{systemHealth.queueActiveJobs} টি সক্রিয়</span>
              </p>
              <span className="text-[11px] text-slate-400">
                ব্যর্থ জবস: {systemHealth.queueFailedJobs} টি (অটো-রিট্রাইং)
              </span>
            </div>
          </div>

          {/* Failed Jobs Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>ব্যাকগ্রাউন্ড জব ত্রুটি ও রিকভারি কিউ</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {failedJobs.map((job) => (
                <div key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{job.jobType}</span>
                    <p className="text-rose-600 text-[11px] mt-0.5">{job.errorMessage}</p>
                    <span className="text-[10px] text-slate-400">
                      রিট্রাই: {job.attempts}/৩ বার • সময়: {job.failedAt}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      showToast(language === 'bn' ? 'জবটি পুনরায় কিউতে পাঠানো হয়েছে।' : 'Job requeued.', 'info');
                    }}
                  >
                    পুনরায় চালান
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & SECURITY ALERTS */}
      {activeTab === 'audit' && (
        <div className="space-y-6 w-full max-w-full min-w-0">
          {/* Security Alerts Section */}
          {securityAlerts.length > 0 && (
            <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>সিকিউরিটি অ্যালার্ট সেন্টার ({securityAlerts.filter((a) => !a.isResolved).length}টি অমীমাংসিত)</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {securityAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{alert.institutionId}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-bold uppercase">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {language === 'bn' ? alert.descriptionBn : alert.descriptionEn}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        আইপি: {alert.ipAddress} • {alert.timestamp}
                      </span>
                    </div>

                    {!alert.isResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          resolveSecurityAlert(alert.id);
                          showToast(language === 'bn' ? 'অ্যালার্ট মীমাংসিত হয়েছে।' : 'Alert resolved.', 'success');
                        }}
                      >
                        মীমাংসিত
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="অডিট লগে ব্যবহারকারী, অ্যাকশন বা মডিউল খুঁজুন..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <span className="text-xs text-slate-500">মোট লগ: {filteredAuditLogs.length} টি</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-3.5">সময়</th>
                      <th className="p-3.5">ব্যবহারকারী</th>
                      <th className="p-3.5">অ্যাকশন</th>
                      <th className="p-3.5">মডিউল</th>
                      <th className="p-3.5">বিস্তারিত বিবরণ</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{log.userName}</span>
                          <span className="text-[10px] text-slate-400">{log.userRole}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                          {log.action}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{log.module}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Managed Institution */}
      {isAddInstOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>নতুন প্রতিষ্ঠান যুক্ত করুন</span>
              </h3>
              <button onClick={() => setIsAddInstOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInstSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রতিষ্ঠানের নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: দারুল উলুম খাদেমুল ইসলাম"
                  value={newInstNameBn}
                  onChange={(e) => setNewInstNameBn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রতিষ্ঠানের নাম (ইংরেজি)</label>
                <input
                  type="text"
                  placeholder="Darul Uloom Khademul Islam"
                  value={newInstNameEn}
                  onChange={(e) => setNewInstNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">কোড (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: DUK-103"
                    value={newInstCode}
                    onChange={(e) => setNewInstCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">SaaS প্ল্যান</label>
                  <select
                    value={newInstPlan}
                    onChange={(e) => setNewInstPlan(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="standard">Standard (বেসিক)</option>
                    <option value="premium">Premium (প্রস্তাবিত)</option>
                    <option value="enterprise">Enterprise (সর্বোচ্চ)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddInstOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

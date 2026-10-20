import React, { useState } from 'react';
import {
  Zap,
  Bell,
  MessageSquare,
  Megaphone,
  PhoneCall,
  Clock,
  History,
  Settings,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Edit3,
  Sliders,
  ShieldCheck,
  Smartphone,
  Users,
  Mail,
  Radio,
  FileAudio,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  Volume2
} from 'lucide-react';
import { useAutomation } from '../../context/AutomationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Automation, MessageTemplate, Announcement } from '../../types/automation';
import { AutomationBuilderModal } from './components/AutomationBuilderModal';
import { TemplateEditorModal } from './components/TemplateEditorModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { VoiceCampaignModal } from './components/VoiceCampaignModal';
import { BulkBroadcastModal } from './components/BulkBroadcastModal';
import { ManualDialerModal } from './components/ManualDialerModal';
import { ProviderConfigModal } from './components/ProviderConfigModal';

interface AutomationCenterViewProps {
  initialTab?: 'automations' | 'templates' | 'announcements' | 'queue' | 'voice' | 'notifications' | 'history' | 'providers';
}

export const AutomationCenterView: React.FC<AutomationCenterViewProps> = ({
  initialTab = 'automations'
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const autoCtx = useAutomation();
  const automations = autoCtx?.automations || [];
  const toggleAutomationStatus = autoCtx?.toggleAutomationStatus;
  const deleteAutomation = autoCtx?.deleteAutomation;
  const testTriggerAutomation = autoCtx?.testTriggerAutomation;
  const automationLogs = autoCtx?.automationLogs || [];
  const templates = autoCtx?.templates || [];
  const deleteTemplate = autoCtx?.deleteTemplate;
  const notifications = autoCtx?.notifications || [];
  const markNotificationAsRead = autoCtx?.markNotificationAsRead;
  const markAllNotificationsAsRead = autoCtx?.markAllNotificationsAsRead;
  const deleteNotification = autoCtx?.deleteNotification;
  const userPreferences = autoCtx?.userPreferences;
  const updateUserPreferences = autoCtx?.updateUserPreferences;
  const announcements = autoCtx?.announcements || [];
  const deleteAnnouncement = autoCtx?.deleteAnnouncement;
  const queuedMessages = autoCtx?.queuedMessages || [];
  const processQueue = autoCtx?.processQueue;
  const retryQueuedMessage = autoCtx?.retryQueuedMessage;
  const clearDeliveredQueue = autoCtx?.clearDeliveredQueue;
  const voiceCampaigns = autoCtx?.voiceCampaigns || [];
  const executeVoiceCampaign = autoCtx?.executeVoiceCampaign;
  const scheduledMessages = autoCtx?.scheduledMessages || [];
  const toggleScheduledStatus = autoCtx?.toggleScheduledStatus;
  const deleteScheduledMessage = autoCtx?.deleteScheduledMessage;
  const communicationLogs = autoCtx?.communicationLogs || [];
  const providerSettings = autoCtx?.providerSettings;
  const analytics = autoCtx?.analytics || {
    activeAutomationsCount: 0,
    messagesSentToday: 0,
    deliverySuccessRate: 100,
    smsCreditsRemaining: 0,
  };

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Modals state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isQueueSenderOpen, setIsQueueSenderOpen] = useState(false);
  const [isManualDialerOpen, setIsManualDialerOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Filtered automations
  const filteredAutomations = automations.filter((a) => {
    const term = searchTerm.toLowerCase();
    return a.nameBn.toLowerCase().includes(term) || a.nameEn.toLowerCase().includes(term);
  });

  // Filtered templates
  const filteredTemplates = templates.filter((t) => {
    const term = searchTerm.toLowerCase();
    return t.nameBn.toLowerCase().includes(term) || t.nameEn.toLowerCase().includes(term);
  });

  // Filtered history logs
  const filteredLogs = communicationLogs.filter((l) => {
    const matchChannel = channelFilter === 'all' || l.channel === channelFilter;
    const matchTerm =
      l.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.recipientContact.includes(searchTerm) ||
      l.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchChannel && matchTerm;
  });

  return (
    <div id="madsol-automation-center" className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Zap className="w-64 h-64 text-amber-300 transform rotate-12" />
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              <Zap className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
              MadSol Automation & Communication 6.0
            </span>
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-400/40">
              Provider Adapter Architecture
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            {isBn ? 'মাদসোল অটোমেশন ও যোগাযোগ সেন্টার' : 'Automation & Communication Center'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isBn
              ? 'স্বয়ংক্রিয় অনুপস্থিতি অ্যালার্ট, বকেয়া ফি রিমাইন্ডার, পরীক্ষার রেজাল্ট প্রকাশ, নোটিশ ব্রডকাস্ট এবং বিটিআরসি নিয়ন্ত্রিত আইনি ভয়েস কল পরিচালনা।'
              : 'Trigger-based automatic SMS, fee overdue reminders, exam results dispatch, emergency notices and compliant voice broadcasts.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            id="open-queue-sender-btn"
            onClick={() => setIsQueueSenderOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isBn ? 'বাল্ক ব্রডকাস্ট (১০০+)' : 'Bulk Broadcast (100+)'}</span>
          </button>

          <button
            onClick={() => setIsManualDialerOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? 'ম্যানুয়াল কল ও মেসেজ' : 'Manual Call & Message'}</span>
          </button>

          <button
            id="open-builder-btn"
            onClick={() => {
              setEditingAutomation(null);
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন রুল তৈরি' : 'New Rule'}</span>
          </button>

          <button
            onClick={() => setIsProviderModalOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors cursor-pointer"
            title={isBn ? 'প্রোভাইডার কনফিগারেশন' : 'Provider Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'সক্রিয় অটোমেশন' : 'Active Rules'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {analytics.activeAutomationsCount}
            </span>
            <span className="text-xs text-slate-400">/ {automations.length}</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'আজকের প্রেরিত বার্তা' : 'Sent Today'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {analytics.totalSentToday}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% live</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'ডেলিভারি হার' : 'Delivery Rate'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-400">
              {analytics.deliveryRate}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">DLR</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'এসএমএস গেটওয়ে' : 'SMS Gateway'}
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono uppercase">
              {providerSettings.sms.adapter}
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'কিউ পেন্ডিং' : 'Pending Queue'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-bold ${analytics.pendingQueueCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {analytics.pendingQueueCount}
            </span>
            <span className="text-xs text-slate-400">{isBn ? 'টি বার্তা' : 'msgs'}</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {isBn ? 'মোট খরচ (BDT)' : 'Estimated Cost'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              ৳{analytics.totalSmsCost}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('automations')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'automations'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isBn ? 'অটোমেশন রুলসমূহ' : 'Automation Rules'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">
            {automations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isBn ? 'স্বয়ংক্রিয় বার্তা ও টেমপ্লেট' : 'Auto Message Templates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{isBn ? 'নোটিশ ও ঘোষণা' : 'Announcements'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isBn ? 'মেসেজ কিউ ও কর্মী' : 'Message Queue'}</span>
          {analytics.pendingQueueCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold">
              {analytics.pendingQueueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>{isBn ? 'বাল্ক ব্রডকাস্ট (১০০+)' : 'Bulk Broadcast (100+)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{isBn ? 'বিজ্ঞপ্তি সেন্টার' : 'Notifications'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isBn ? 'যোগাযোগ ইতিহাস' : 'History'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AUTOMATIONS LIST & QUICK CARDS */}
      {/* ======================================================== */}
      {activeTab === 'automations' && (
        <div className="space-y-6 w-full max-w-full min-w-0">
          {/* Quick Activation Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {isBn ? 'রেডিমেড স্মার্ট অটোমেশন কার্ড' : 'Pre-Configured Automation Presets'}
              </h3>
              <span className="text-xs text-slate-500">
                {isBn ? 'এক ক্লিকে সক্রিয় বা বিরতি করুন' : 'Instant 1-Click Activation'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {automations.map((auto) => {
                const isActive = auto.status === 'active';
                return (
                  <div
                    key={auto.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 shadow-md shadow-emerald-950/5'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {auto.category}
                        </span>

                        {/* Status Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => toggleAutomationStatus(auto.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{isBn ? 'সক্রিয়' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 text-slate-500" />
                              <span>{isBn ? 'বিরতি' : 'Paused'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {isBn ? auto.nameBn : auto.nameEn}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {isBn ? auto.descriptionBn : auto.descriptionEn}
                      </p>

                      {/* Conditions & Actions Summary */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{isBn ? 'ট্রিগার:' : 'Trigger:'}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono text-[10px]">
                            {auto.triggerType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{isBn ? 'বিলম্ব:' : 'Delay:'}</span>
                          <span>{auto.delayMinutes === 0 ? (isBn ? 'তাৎক্ষণিক' : 'Instant') : `${auto.delayMinutes} ${isBn ? 'মিনিট' : 'mins'}`}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{isBn ? 'অ্যাকশন:' : 'Action:'}</span>
                          <span className="font-semibold">{auto.actions?.length || 0} {isBn ? 'টি চ্যানেল' : 'channels'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="text-[10px] text-slate-400">
                        {isBn ? 'রান হয়েছে:' : 'Runs:'} <span className="font-bold text-slate-700 dark:text-slate-200">{auto.runCount}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => testTriggerAutomation(auto.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 transition-colors cursor-pointer"
                          title={isBn ? 'পরীক্ষামূলক ট্রিগার রান করুন' : 'Test run automation'}
                        >
                          <Play className="w-3 h-3 text-amber-600" />
                          <span>{isBn ? 'টেস্ট রান' : 'Simulate'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingAutomation(auto);
                            setIsBuilderOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteAutomation(auto.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Automation Run Execution Logs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                {isBn ? 'সাম্প্রতিক অটোমেশন এক্সিকিউশন ও অ্যাক্টিভিটি লগ' : 'Recent Automation Execution Logs'}
              </h3>
              <span className="text-[11px] text-slate-500">
                {automationLogs?.length || 0} {isBn ? 'টি ইভেন্ট সম্পন্ন' : 'events recorded'}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(automationLogs || []).slice(0, 5).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{log.automationName}</p>
                      <p className="text-[11px] text-slate-400">
                        {isBn ? 'প্রাপক:' : 'Target:'} {log.recipientName} ({log.recipientTarget}) • {log.actionTaken}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500">{log.triggerTime}</span>
                    <span className="text-[10px] text-emerald-600 block font-mono">
                      {log.durationMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MESSAGE TEMPLATES & DYNAMIC AUTO MESSAGES */}
      {/* ======================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'স্বয়ংক্রিয় বার্তা টেমপ্লেটসমূহ' : 'Auto Message Templates'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'ডাইনামিক ভেরিয়েবল সহ বাংলা ও ইংরেজি এসএমএস কাঠামো'
                  : 'Templates with dynamic placeholders for automated SMS & alerts'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন টেমপ্লেট' : 'Add Template'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tmpl.category}
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? tmpl.nameBn : tmpl.nameEn}
                  </h4>

                  {/* Bangla Text */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {tmpl.templateBn}
                  </div>

                  {/* Variables */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tmpl.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {isBn ? 'দৈর্ঘ্য:' : 'Length:'} {tmpl.templateBn?.length || 0} {isBn ? 'বর্ণ' : 'chars'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTemplate(tmpl);
                        setIsTemplateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(tmpl.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ANNOUNCEMENTS & NOTICE BOARD */}
      {/* ======================================================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'নোটিশ বোর্ড ও প্রাতিষ্ঠানিক ঘোষণা' : 'Notice Board & Institutional Announcements'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'সকল অভিভাবক, শিক্ষার্থী ও শিক্ষকবৃন্দের নিকট জরুরি বিজ্ঞপ্তি ব্রডকাস্ট'
                  : 'Emergency announcements, vacations, exam circulars & news'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setIsAnnouncementModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 cursor-pointer self-start"
            >
              <Megaphone className="w-4 h-4" />
              <span>{isBn ? 'নতুন বিজ্ঞপ্তি প্রকাশ' : 'Publish Notice'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  anc.isEmergency
                    ? 'bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-slate-900 border-rose-300 dark:border-rose-900/60 shadow-md shadow-rose-950/5'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {anc.isEmergency && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {isBn ? 'মহাজরুরি অ্যালার্ট' : 'Emergency Alert'}
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {anc.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {anc.publishDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-slate-500">
                      {isBn ? 'প্রাপক:' : 'Audience:'} <span className="font-semibold">{anc.audience}</span>
                    </span>
                    <button
                      onClick={() => {
                        setEditingAnnouncement(anc);
                        setIsAnnouncementModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(anc.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                  {isBn ? anc.titleBn : anc.titleEn}
                </h4>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {isBn ? anc.messageBn : anc.messageEn}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">{isBn ? 'বিতরণ চ্যানেল:' : 'Channels:'}</span>
                    {anc.channels.map((ch) => (
                      <span key={ch} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                        {ch.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] italic">
                    {isBn ? 'প্রকাশক:' : 'By:'} {anc.createdBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MESSAGE QUEUE & RETRY WORKER */}
      {/* ======================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                {isBn ? 'মেসেজ কিউ ও ব্যাকগ্রাউন্ড ওয়ার্কার' : 'Message Queue & Dispatch Engine'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'রেট লিমিট ও ১১-ডিজিট মোবাইল নম্বর যাচাইকরণ সহ ব্যাকগ্রাউন্ড ডেলিভারি'
                  : 'Queue system handling rate limiting, mobile validation & automated retries'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearDeliveredQueue}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isBn ? 'ডেলিভারি হওয়া তালিকা মুছুন' : 'Clear Delivered'}
              </button>
              <button
                onClick={processQueue}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>{isBn ? 'কিউ প্রসেস করুন' : 'Process Queue Worker'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">{isBn ? 'প্রাপক ও যোগাযোগ' : 'Recipient'}</th>
                  <th className="pb-3">{isBn ? 'মাধ্যম' : 'Channel'}</th>
                  <th className="pb-3">{isBn ? 'বার্তা' : 'Message Text'}</th>
                  <th className="pb-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="pb-3">{isBn ? 'সময়' : 'Time'}</th>
                  <th className="pb-3 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queuedMessages.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      <div>{item.recipientName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.recipientContact}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 font-bold">
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {item.messageText}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'sent'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.status === 'failed'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="py-3 text-right">
                      {item.status === 'failed' && (
                        <button
                          onClick={() => retryQueuedMessage(item.id)}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                        >
                          {isBn ? 'পুনরায় চেষ্টা' : 'Retry'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: VOICE CALL BROADCAST FOUNDATION */}
      {/* ======================================================== */}
      {activeTab === 'voice' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-purple-600" />
                {isBn ? 'বাল্ক ব্রডকাস্ট (১০০+ ব্যবহারকারী)' : 'Bulk Broadcast (100+ Users)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'একসাথে ১০০+ অভিভাবক ও শিক্ষকদের ফোন দেওয়া ও মেসেজ পাঠানোর সিস্টেম'
                  : 'System to send bulk voice calls and messages to 100+ parents and teachers at once.'}
              </p>
            </div>

            <button
              onClick={() => setIsQueueSenderOpen(true)}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer self-start"
            >
              <Users className="w-5 h-5" />
              <span>{isBn ? '১০০+ জনকে কল/মেসেজ পাঠান' : 'Send to 100+ Users'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceCampaigns.map((vc) => (
              <div
                key={vc.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={vc.status === 'completed' ? 'success' : 'warning'}>
                    {vc.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-400">{vc.createdAt}</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {vc.title}
                </h4>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-200">{vc.audioName}</p>
                      <p className="text-[10px] text-purple-600">{vc.audioDurationSeconds} {isBn ? 'সেকেন্ড' : 'seconds'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-bold">
                    {vc.allowedStartTime} - {vc.allowedEndTime} BST
                  </span>
                </div>

                {/* Call delivery stats */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'প্রাপক' : 'Target'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{vc.targetCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                    <span className="text-[10px] block">{isBn ? 'রিসিভড' : 'Answered'}</span>
                    <span className="font-bold">{vc.answeredCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                    <span className="text-[10px] block">{isBn ? 'মিসড' : 'Missed'}</span>
                    <span className="font-bold">{vc.notAnsweredCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                    <span className="text-[10px] block">{isBn ? 'ব্যস্ত' : 'Busy'}</span>
                    <span className="font-bold">{vc.busyCount}</span>
                  </div>
                </div>

                {vc.status === 'pending' && (
                  <button
                    onClick={() => executeVoiceCampaign(vc.id)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isBn ? 'বাল্ক ব্রডকাস্ট (১০০+)' : 'Bulk Broadcast (100+)'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NOTIFICATIONS & USER PREFERENCES */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                {isBn ? 'সিস্টেম ও অ্যাপ বিজ্ঞপ্তি' : 'System & App Notifications'}
              </h3>
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                {isBn ? 'সকল পড়া হয়েছে মার্ক করুন' : 'Mark All as Read'}
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    n.isRead
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isBn ? n.titleBn : n.titleEn}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {isBn ? n.messageBn : n.messageEn}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {n.createdAt}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Notification Preferences */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isBn ? 'নোটিফিকেশন চ্যানেল পছন্দসমূহ' : 'Notification Preferences'}
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'ইন-অ্যাপ অ্যালার্ট' : 'In-App Alerts'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.appNotification}
                  onChange={(e) => updateUserPreferences({ appNotification: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'পুশ নোটিফিকেশন' : 'Push Notifications'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.pushNotification}
                  onChange={(e) => updateUserPreferences({ pushNotification: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'এসএমএস নোটিফিকেশন' : 'SMS Alerts'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.smsNotification}
                  onChange={(e) => updateUserPreferences({ smsNotification: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'হাজিরা ও অনুপস্থিতি অ্যালার্ট' : 'Attendance Alerts'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.attendanceAlerts}
                  onChange={(e) => updateUserPreferences({ attendanceAlerts: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'বকেয়া ফি তাগিদ' : 'Fee Reminders'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.feeReminders}
                  onChange={(e) => updateUserPreferences({ feeReminders: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <span>{isBn ? 'হিফজ দৈনিক অগ্রগতি' : 'Hifz Updates'}</span>
                <input
                  type="checkbox"
                  checked={userPreferences.hifzUpdates}
                  onChange={(e) => updateUserPreferences({ hifzUpdates: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: COMMUNICATION HISTORY & REAL AUDIT LOG */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                {isBn ? 'সকল প্রেরিত বার্তার ইতিহাস ও অডিট ট্রেইল' : 'Communication History & Audit Trail'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'এসএমএস, পুশ ও ভয়েস কলের সময়, প্রাপক ও খরচের সমন্বিত হিসাব'
                  : 'Delivery logs across SMS, Push, Email, and Voice gateways'}
              </p>
            </div>

            {/* Filter by Channel */}
            <div className="flex items-center gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="all">{isBn ? 'সকল মাধ্যম (All Channels)' : 'All Channels'}</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="voice">Voice</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3">{isBn ? 'সময়' : 'Timestamp'}</th>
                  <th className="pb-3">{isBn ? 'প্রাপক' : 'Recipient'}</th>
                  <th className="pb-3">{isBn ? 'মাধ্যম' : 'Channel'}</th>
                  <th className="pb-3">{isBn ? 'বার্তা' : 'Message'}</th>
                  <th className="pb-3">{isBn ? 'গেটওয়ে / সেন্ডার' : 'Gateway'}</th>
                  <th className="pb-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="pb-3 text-right">{isBn ? 'খরচ (টাকা)' : 'Cost'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{log.recipientName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.recipientContact}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 font-bold">
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-3 max-w-sm truncate text-slate-600 dark:text-slate-300">
                      {log.message}
                    </td>
                    <td className="py-3 text-[11px] text-slate-500 font-mono">
                      {log.providerName}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ৳{log.costBdt.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AutomationBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        editAutomation={editingAutomation}
      />

      <TemplateEditorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        editTemplate={editingTemplate}
      />

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        editAnnouncement={editingAnnouncement}
      />

      <VoiceCampaignModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      <ManualDialerModal isOpen={isManualDialerOpen} onClose={() => setIsManualDialerOpen(false)} />
      <BulkBroadcastModal
        isOpen={isQueueSenderOpen}
        onClose={() => setIsQueueSenderOpen(false)}
      />

      <ProviderConfigModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />
    </div>
  );
};

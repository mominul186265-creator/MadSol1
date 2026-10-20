import React, { useState } from 'react';
import {
  LayoutDashboard,
  Send,
  PhoneCall,
  FileText,
  CalendarClock,
  History,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CommunicationDashboardTab } from './components/CommunicationDashboardTab';
import { SmsBroadcastTab } from './components/SmsBroadcastTab';
import { VoiceCallBroadcastTab } from './components/VoiceCallBroadcastTab';
import { TemplatesTab } from './components/TemplatesTab';
import { ScheduledMessagesTab } from './components/ScheduledMessagesTab';
import { CommunicationHistoryTab } from './components/CommunicationHistoryTab';
import { DeliveryReportsTab } from './components/DeliveryReportsTab';
import { CommunicationSettingsTab } from './components/CommunicationSettingsTab';
import { MessageDetailModal } from './components/MessageDetailModal';
import { CommunicationMessage, CommunicationTemplate } from '../../types/communication';

export type CommunicationActiveTab =
  | 'dashboard'
  | 'sms'
  | 'voice_call'
  | 'templates'
  | 'scheduled'
  | 'history'
  | 'reports'
  | 'settings';

interface CommunicationHubViewProps {
  initialTab?: CommunicationActiveTab;
}

export const CommunicationHubView: React.FC<CommunicationHubViewProps> = ({
  initialTab = 'dashboard',
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<CommunicationActiveTab>(initialTab);
  const [selectedDetailMessage, setSelectedDetailMessage] = useState<CommunicationMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewMessage = (msg: CommunicationMessage) => {
    setSelectedDetailMessage(msg);
    setIsDetailOpen(true);
  };

  const handleUseTemplateForSms = (tmpl: CommunicationTemplate) => {
    setActiveTab('sms');
  };

  const handleUseTemplateForVoice = (tmpl: CommunicationTemplate) => {
    setActiveTab('voice_call');
  };

  const tabs = [
    { id: 'dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'sms', labelBn: 'এসএমএস', labelEn: 'SMS Broadcast', icon: Send },
    { id: 'voice_call', labelBn: 'ভয়েস কল', labelEn: 'Voice Call (IVR)', icon: PhoneCall },
    { id: 'templates', labelBn: 'টেমপ্লেট', labelEn: 'Templates', icon: FileText },
    { id: 'scheduled', labelBn: 'শিডিউল বার্তা', labelEn: 'Scheduled', icon: CalendarClock },
    { id: 'history', labelBn: 'হিস্টোরি', labelEn: 'History', icon: History },
    { id: 'reports', labelBn: 'রিপোর্টস', labelEn: 'Delivery Reports', icon: BarChart3 },
    { id: 'settings', labelBn: 'সেটিংস', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Header / Tab Bar Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CommunicationActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Body Content */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'dashboard' && (
          <CommunicationDashboardTab
            onSelectTab={(t) => setActiveTab(t as CommunicationActiveTab)}
            onViewMessageDetail={handleViewMessage}
          />
        )}

        {activeTab === 'sms' && <SmsBroadcastTab />}

        {activeTab === 'voice_call' && <VoiceCallBroadcastTab />}

        {activeTab === 'templates' && (
          <TemplatesTab
            onUseTemplateForSms={handleUseTemplateForSms}
            onUseTemplateForVoice={handleUseTemplateForVoice}
          />
        )}

        {activeTab === 'scheduled' && <ScheduledMessagesTab />}

        {activeTab === 'history' && <CommunicationHistoryTab />}

        {activeTab === 'reports' && <DeliveryReportsTab />}

        {activeTab === 'settings' && <CommunicationSettingsTab />}
      </div>

      <MessageDetailModal
        isOpen={isDetailOpen}
        message={selectedDetailMessage}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Smartphone,
  Search,
  CheckCheck,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  UserCheck,
  Calendar
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { GuardianContactLog } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const GuardianCommunicationView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user, institution } = useAuth();
  const { guardianLogs, addGuardianLog } = usePart7System();

  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose state
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [channel, setChannel] = useState<'sms' | 'app_message' | 'email'>('app_message');
  const [messageText, setMessageText] = useState('');

  const filteredLogs = guardianLogs.filter((log) => {
    const matchesChannel = selectedChannel === 'all' || log.channel === selectedChannel;
    const matchesSearch =
      log.guardianName.includes(searchQuery) ||
      log.guardianPhone.includes(searchQuery) ||
      log.studentName.includes(searchQuery) ||
      log.content.includes(searchQuery);
    return matchesChannel && matchesSearch;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName || !messageText) return;

    addGuardianLog({
      institutionId: institution?.id || 'inst-001',
      guardianId: 'grd-001',
      studentId: 'stu-101',
      studentName: studentName || 'সাধারণ নোটিশ',
      guardianName,
      guardianPhone: guardianPhone || '01700000000',
      channel,
      title: 'অভিভাবক বার্তা',
      content: messageText,
      status: 'delivered',
      senderName: user?.fullNameBn || 'মাদ্রাসা কর্তৃপক্ষ'
    });

    setIsComposeOpen(false);
    setMessageText('');
    setGuardianName('');
    showToast(language === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে।' : 'Message delivered successfully.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'অভিভাবক যোগাযোগ কেন্দ্র (Guardian Center)' : 'Guardian Communication Center'}
            </h1>
            <Badge variant="emerald" size="sm">
              Live Connect
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'অ্যাপ মেসেজ, এসএমএস ও ফোন যোগাযোগের সমন্বিত খতিয়ান ও রিয়েল-টাইম ডেলিভারি হিস্ট্রি'
              : 'Omni-channel guardian correspondence, notification logs and delivery audit'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>{language === 'bn' ? 'অভিভাবককে বার্তা পাঠান' : 'Send Message'}</span>
        </Button>
      </div>

      {/* Channel Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'অভিভাবক, ছাত্র বা বার্তা খুঁজুন...' : 'Search logs or guardian...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'app_message', 'sms', 'email'].map((ch) => (
            <Button
              key={ch}
              size="sm"
              variant={selectedChannel === ch ? 'primary' : 'outline'}
              onClick={() => setSelectedChannel(ch)}
            >
              {ch === 'all'
                ? language === 'bn'
                  ? 'সকল বার্তা'
                  : 'All Channels'
                : ch === 'app_message'
                ? 'অ্যাপ মেসেজ'
                : ch === 'sms'
                ? 'এসএমএস'
                : 'ইমেইল'}
            </Button>
          ))}
        </div>
      </div>

      {/* Communications Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {language === 'bn' ? 'কোনো যোগাযোগ লগ পাওয়া যায়নি' : 'No communication records found'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-2 rounded-xl text-xs ${
                      log.channel === 'app_message'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.channel === 'sms'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {log.channel === 'app_message' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : log.channel === 'sms' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {log.guardianName} ({log.guardianPhone})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      শিক্ষার্থী: <strong>{log.studentName}</strong> • প্রেরক: {log.senderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.status === 'read'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.status === 'delivered'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <CheckCheck className="w-3 h-3" />
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{log.sentAt}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {log.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Compose Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'অভিভাবককে নতুন বার্তা পাঠান' : 'Compose Guardian Message'}
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">যোগাযোগ চ্যানেল</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'app_message', label: 'অ্যাপ নোটিফিকেশন' },
                    { id: 'sms', label: 'এসএমএস গেটওয়ে' },
                    { id: 'email', label: 'অফিসিয়াল ইমেইল' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChannel(item.id as any)}
                      className={`p-2 rounded-xl border text-center font-medium transition-all ${
                        channel === item.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অভিভাবকের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মুহাম্মদ শফিক আলম"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থীর নাম</label>
                  <input
                    type="text"
                    placeholder="যেমন: মুহাম্মদ আব্দুল্লাহ"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বার্তার বিষয়বস্তু</label>
                <textarea
                  rows={3}
                  required
                  placeholder="বার্তা লিখুন..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  পাঠান
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

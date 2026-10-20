import React, { useState } from 'react';
import {
  Inbox,
  Send,
  Mail,
  Search,
  CheckCheck,
  Clock,
  Plus,
  Trash2,
  Reply,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { InternalMessage, UserRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const InternalMessagesView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user, institution } = useAuth();
  const { internalMessages, sendInternalMessage, markInternalMessageAsRead } = usePart7System();

  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(internalMessages[0]?.id || null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose State
  const [recipientRole, setRecipientRole] = useState<UserRole>('teacher');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // Strict RBAC Rules for Internal Communication:
  // - Admin can message anyone
  // - Teacher can only message assigned student guardians or staff
  // - Guardians can only message child's teacher or school admin
  const isAuthorizedToMessage = (targetRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'madrasa_admin' || user.role === 'principal') return true;
    if (user.role === 'teacher') return ['guardian', 'staff', 'teacher', 'principal'].includes(targetRole);
    if (user.role === 'guardian') return ['teacher', 'principal', 'madrasa_admin'].includes(targetRole);
    return true;
  };

  const inboxMessages = internalMessages.filter(
    (m) =>
      m.recipientId === user?.id ||
      m.recipientRole === user?.role ||
      user?.role === 'madrasa_admin' ||
      user?.role === 'super_admin'
  );

  const sentMessages = internalMessages.filter((m) => m.senderId === user?.id || m.senderRole === user?.role);

  const displayedList = (activeTab === 'inbox' ? inboxMessages : sentMessages).filter((m) =>
    m.subject.includes(searchQuery) ||
    m.body.includes(searchQuery) ||
    m.senderName.includes(searchQuery) ||
    m.recipientName.includes(searchQuery)
  );

  const selectedMessage = internalMessages.find((m) => m.id === selectedMessageId) || displayedList[0];

  const handleSelectMessage = (msg: InternalMessage) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      markInternalMessageAsRead(msg.id);
    }
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content || !user) return;

    if (!isAuthorizedToMessage(recipientRole)) {
      showToast(language === 'bn' ? 'এই রোলের ব্যবহারকারীকে বার্তা পাঠানোর অনুমতি নেই।' : 'Permission denied.', 'error');
      return;
    }

    sendInternalMessage({
      institutionId: institution?.id || 'inst-001',
      senderId: user.id,
      senderName: user.fullNameBn,
      senderRole: user.role,
      recipientId: 'rec-custom',
      recipientName: recipientName || `${recipientRole.toUpperCase()} Authority`,
      recipientRole,
      subject,
      body: content
    });

    setIsComposeOpen(false);
    setSubject('');
    setContent('');
    setRecipientName('');
    showToast(language === 'bn' ? 'অভ্যন্তরীণ বার্তা পাঠানো হয়েছে।' : 'Internal message sent.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'অভ্যন্তরীণ মেসেজিং সিস্টেম' : 'Internal Messaging System'}
            </h1>
            <Badge variant="emerald" size="sm">
              Role Scoped
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'মাদ্রাসার শিক্ষক, অভিভাবক ও স্টাফদের মধ্যে সরাসরি ও সুরক্ষিত প্রাতিষ্ঠানিক যোগাযোগ'
              : 'Direct role-bounded messaging between faculty, staff, and authorized guardians'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsComposeOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বার্তা লিখুন' : 'Compose Message'}</span>
        </Button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[550px]">
        {/* Left Column: Inbox / Sent List */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'inbox'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>ইনবক্স ({inboxMessages.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'sent'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>প্রেরিত ({sentMessages.length})</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="বার্তা খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {displayedList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {language === 'bn' ? 'কোনো বার্তা নেই' : 'No messages found'}
              </div>
            ) : (
              displayedList.map((msg) => {
                const isSelected = msg.id === selectedMessage?.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-3.5 transition-colors cursor-pointer text-xs space-y-1 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                        : !msg.isRead
                        ? 'bg-slate-50/80 dark:bg-slate-800/60 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {activeTab === 'inbox' ? msg.senderName : `প্রতি: ${msg.recipientName}`}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{msg.sentAt}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 truncate">{msg.subject}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{msg.body}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Message Thread */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>
                      প্রেরক: <strong>{selectedMessage.senderName}</strong> ({selectedMessage.senderRole})
                    </span>
                    <span>•</span>
                    <span>
                      প্রাপক: <strong>{selectedMessage.recipientName}</strong>
                    </span>
                    <span>•</span>
                    <span>{selectedMessage.sentAt}</span>
                  </div>
                </div>

                <Badge variant="emerald" size="sm">
                  {selectedMessage.senderRole}
                </Badge>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedMessage.body}
              </div>

              {/* Reply Box Footer */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRecipientName(selectedMessage.senderName);
                    setSubject(`Re: ${selectedMessage.subject}`);
                    setIsComposeOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>উত্তর দিন (Reply)</span>
                </Button>
                <span className="text-[11px] text-slate-400 font-mono">MadSol Secure Messaging Protocol</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              বার্তা পড়তে বাম পাশের তালিকা থেকে একটি নির্বাচন করুন
            </div>
          )}
        </div>
      </div>

      {/* Modal: Compose Internal Message */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>নতুন অভ্যন্তরীণ বার্তা</span>
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রাপকের রোল</label>
                  <select
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="teacher">শিক্ষক (Teacher)</option>
                    <option value="guardian">অভিভাবক (Guardian)</option>
                    <option value="principal">মুহতামিম / প্রিন্সিপাল</option>
                    <option value="accountant">হিসাবরক্ষক</option>
                    <option value="staff">স্টাফ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রাপকের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="নির্দিষ্ট ব্যক্তির নাম"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিষয় (Subject)</label>
                <input
                  type="text"
                  required
                  placeholder="বার্তার বিষয় লিখুন..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বার্তার বিস্তারিত</label>
                <textarea
                  rows={4}
                  required
                  placeholder="আপনার বার্তাটি বিস্তারিত লিখুন..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  বার্তা পাঠান
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

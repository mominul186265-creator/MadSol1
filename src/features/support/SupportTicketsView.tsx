import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  FileText,
  ShieldCheck,
  Tag,
  Paperclip
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const SupportTicketsView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    supportTickets,
    createSupportTicket,
    replyToSupportTicket,
    updateSupportTicketStatus
  } = usePart7System();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(supportTickets[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // New Ticket State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('academic');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const filteredTickets = supportTickets.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    createSupportTicket({
      subject,
      category,
      priority,
      description,
      attachmentName: attachmentName ? `${attachmentName}.pdf` : undefined
    });

    setIsCreateOpen(false);
    setSubject('');
    setDescription('');
    setAttachmentName('');
    showToast(language === 'bn' ? 'টিকেট সফলভাবে দাখিল হয়েছে।' : 'Support ticket submitted.', 'success');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    replyToSupportTicket(selectedTicket.id, replyMessage.trim());
    setReplyMessage('');
    showToast(language === 'bn' ? 'উত্তর প্রেরণ করা হয়েছে।' : 'Reply sent.', 'success');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="amber">উন্মুক্ত (Open)</Badge>;
      case 'in_progress':
        return <Badge variant="emerald">চলমান (In Progress)</Badge>;
      case 'waiting':
        return <Badge variant="slate">অপেক্ষমান (Waiting)</Badge>;
      case 'resolved':
        return <Badge variant="emerald">সমাধানকৃত (Resolved)</Badge>;
      case 'closed':
        return <Badge variant="slate">বন্ধ (Closed)</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'সাপোর্ট টিকেট ও হেল্পডেস্ক' : 'Support Ticket System'}
            </h1>
            <Badge variant="emerald" size="sm">
              Helpdesk
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'অভিভাবক ও শিক্ষকদের সমস্যা সমাধান, ক্যাটাগরি ট্র্যাকিং ও দ্রুত রেসপন্স ম্যানেজমেন্ট'
              : 'End-to-end issue reporting, priority routing, multi-tier staff resolution and audit trail'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন টিকেট দাখিল করুন' : 'Open Ticket'}</span>
        </Button>
      </div>

      {/* Grid: Tickets Directory (Left) + Ticket Conversation & Status History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[550px]">
        {/* Left Column: Tickets List */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="টিকেট নং বা বিষয় দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {language === 'bn' ? 'কোনো টিকেট পাওয়া যায়নি' : 'No tickets found'}
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicket?.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 transition-colors cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {t.ticketNumber}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{t.subject}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{t.userName}</span>
                      <span>{t.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Details, Thread & Admin Actions */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {selectedTicket ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Ticket Top Meta */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-semibold uppercase text-[10px]">
                      {selectedTicket.category}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        selectedTicket.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : selectedTicket.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    দাখিলকারী: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userRole})
                  </p>
                </div>

                {/* Quick Status Changer for Staff */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      updateSupportTicketStatus(selectedTicket.id, e.target.value as TicketStatus);
                      showToast(language === 'bn' ? 'টিকেট স্ট্যাটাস আপডেট হয়েছে।' : 'Status updated.', 'success');
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="open">উন্মুক্ত (Open)</option>
                    <option value="in_progress">চলমান (In Progress)</option>
                    <option value="waiting_user">অপেক্ষায় (Waiting)</option>
                    <option value="resolved">সমাধানকৃত (Resolved)</option>
                    <option value="closed">বন্ধ (Closed)</option>
                  </select>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.isStaffReply
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 ml-4 sm:ml-8'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mr-4 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                        <span>{m.senderName}</span>
                        {m.isStaffReply && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px]">
                            OFFICIAL STAFF
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{m.message}</p>
                    {m.attachmentName && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>সংযুক্ত ফাইল: {m.attachmentName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Form Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="উত্তরের বার্তা বা মন্তব্য লিখুন..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                  <Button type="submit" variant="primary" disabled={!replyMessage.trim()} size="sm">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>উত্তর দিন</span>
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              টিকেট বিস্তারিত দেখতে তালিকা থেকে নির্বাচন করুন
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Ticket */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-emerald-600" />
                <span>নতুন সাপোর্ট টিকেট দাখিল</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিষয়ের শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মাসিক ফি পেমেন্ট গেটওয়ে ইস্যু"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="technical">কারিগরি (Technical)</option>
                    <option value="academic">একাডেমিক (Academic)</option>
                    <option value="fee_payment">ফি ও পেমেন্ট (Fee Payment)</option>
                    <option value="student_affairs">শিক্ষার্থী বিষয়াবলি (Student Affairs)</option>
                    <option value="account_access">লগইন ও অ্যাকাউন্ট (Account Access)</option>
                    <option value="other">অন্যান্য (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অগ্রাধিকার (Priority)</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="low">সাধারণ (Low)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="urgent">জরুরি (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সমস্যার বিস্তারিত বর্ণনা</label>
                <textarea
                  rows={4}
                  required
                  placeholder="আপনার সমস্যাটি বিস্তারিত ব্যাখ্যা করুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সংযুক্তি ফাইল নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: payment_receipt_screenshot"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  দাখিল করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

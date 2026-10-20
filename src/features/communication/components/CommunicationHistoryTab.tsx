import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Send,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CommunicationMessage, CommunicationStatus, CommunicationType } from '../../../types/communication';
import { MessageDetailModal } from './MessageDetailModal';

export const CommunicationHistoryTab: React.FC = () => {
  const { messages, exportDeliveryReportCsv, resendFailedRecipients } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CommunicationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CommunicationStatus>('all');
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || msg.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [messages, searchQuery, typeFilter, statusFilter]);

  const handleOpenDetail = (msg: CommunicationMessage) => {
    setSelectedMessage(msg);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            {isBn ? 'যোগাযোগ ও ব্রডকাস্ট হিস্টোরি' : 'Communication & Broadcast History'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'মাদ্রাসা থেকে প্রেরিত সকল এসএমএস ও ভয়েস কলের বিস্তারিত রেকর্ড ও ডেলিভারি রিপোর্ট।'
              : 'Complete audit trail of all SMS and Voice broadcasts with delivery states.'}
          </p>
        </div>

        <button
          onClick={() => exportDeliveryReportCsv(filteredMessages)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{isBn ? 'CSV রিপোর্ট ডাউনলোড' : 'Export CSV Report'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'শিরোনাম, বার্তা বা প্রেরকের নামে খুঁজুন...' : 'Search broadcasts...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | CommunicationType)}
            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">{isBn ? 'সকল মাধ্যম (SMS + Voice)' : 'All Channels'}</option>
            <option value="sms">শুধু এসএমএস (SMS Only)</option>
            <option value="voice_call">শুধু ভয়েস কল (Voice Call Only)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | CommunicationStatus)}
            className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="delivered">Delivered (সফল)</option>
            <option value="sent">Sent (প্রেরিত)</option>
            <option value="pending">Pending (অপেক্ষমান)</option>
            <option value="failed">Failed (ব্যর্থ)</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">তারিখ ও সময়</th>
                <th className="p-3.5">ক্যাম্পেইন ও প্রিভিউ</th>
                <th className="p-3.5">মাধ্যম</th>
                <th className="p-3.5">প্রাপক</th>
                <th className="p-3.5">ডেলিভারি / মোট</th>
                <th className="p-3.5">খরচ</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {isBn ? 'কোনো হিস্টোরি রেকর্ড পাওয়া যায়নি।' : 'No communication records found.'}
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const isSms = msg.type === 'sms';
                  const isDelivered = msg.status === 'delivered';
                  const isPending = msg.status === 'pending';
                  const hasFailed = msg.failedCount > 0;

                  return (
                    <tr
                      key={msg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB')}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="p-3.5 min-w-[220px] max-w-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {msg.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {msg.content}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">প্রেরক: {msg.senderName}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSms
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isSms ? <Send className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}
                          <span>{msg.type}</span>
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                        {msg.recipientGroup}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{msg.deliveredCount}</span>
                        <span className="text-slate-400"> / {msg.totalRecipients}</span>
                        {hasFailed && (
                          <span className="block text-[10px] font-bold text-rose-500">
                            ({msg.failedCount} ব্যর্থ)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                        ৳{(msg.actualCost || msg.costEstimate).toFixed(2)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{msg.status}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(msg)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title={isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasFailed && (
                            <button
                              onClick={() => resendFailedRecipients(msg.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 transition-colors cursor-pointer"
                              title={isBn ? 'ব্যর্থদের আবার পাঠান' : 'Resend Failed'}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MessageDetailModal
        isOpen={isDetailOpen}
        message={selectedMessage}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

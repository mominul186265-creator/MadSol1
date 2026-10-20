import React from 'react';
import {
  X,
  Send,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Download,
  Users,
  Calendar,
  User,
  Shield,
} from 'lucide-react';
import { CommunicationMessage } from '../../../types/communication';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';

interface MessageDetailModalProps {
  isOpen: boolean;
  message: CommunicationMessage | null;
  onClose: () => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  const { resendFailedRecipients } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  if (!isOpen || !message) return null;

  const isSms = message.type === 'sms';
  const hasFailed = message.failedCount > 0;

  const handleResendFailed = async () => {
    await resendFailedRecipients(message.id);
    onClose();
  };

  const handleExportRecipientsCsv = () => {
    const headers = ['Recipient Name', 'Phone', 'Role', 'Status', 'Delivered At', 'Failure Reason'];
    const rows = message.recipients.map((r) => [
      `"${r.name}"`,
      r.phone,
      r.role,
      r.status,
      r.deliveredAt || '',
      `"${r.failedReason || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recipients_${message.id}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                isSms
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
              }`}
            >
              {isSms ? <Send className="w-5 h-5" /> : <PhoneCall className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {message.title}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    isSms ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {message.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {message.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">{isBn ? 'মোট প্রাপক' : 'Total Recipients'}</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                {message.totalRecipients}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400">{isBn ? 'সফল ডেলিভারি' : 'Delivered'}</div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                {message.deliveredCount}
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60">
              <div className="text-[10px] text-rose-700 dark:text-rose-400">{isBn ? 'ব্যর্থ / আনরিচেবল' : 'Failed'}</div>
              <div className="text-base font-bold text-rose-700 dark:text-rose-400 font-mono mt-0.5">
                {message.failedCount}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">{isBn ? 'মোট খরচ' : 'Total Cost'}</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                ৳{(message.actualCost || message.costEstimate).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Message Content Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'বার্তার বিষয়বস্তু / স্ক্রিপ্ট:' : 'Message Content / Voice Script:'}
            </label>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {message.content}
            </div>
          </div>

          {/* Metadata details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">{isBn ? 'প্রেরক' : 'Sender'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{message.senderName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{isBn ? 'তারিখ ও সময়' : 'Timestamp'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {new Date(message.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-GB')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">{isBn ? 'গেটওয়ে প্রোভাইডার' : 'Gateway'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{message.providerName}</span>
            </div>
          </div>

          {/* Recipient breakdown table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'প্রাপক অনুযায়ী ডেলিভারি রিপোর্ট' : 'Recipient Delivery Status'}
              </label>
              <button
                onClick={handleExportRecipientsCsv}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">প্রাপক</th>
                    <th className="p-2.5">মোবাইল</th>
                    <th className="p-2.5">স্ট্যাটাস</th>
                    <th className="p-2.5">সময় / মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {message.recipients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        {isBn ? 'বাল্ক প্রাপক তালিকা সংরক্ষিত আছে।' : 'Bulk recipient list logged.'}
                      </td>
                    </tr>
                  ) : (
                    message.recipients.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{r.name}</td>
                        <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{r.phone}</td>
                        <td className="p-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                            {r.status === 'failed' && <XCircle className="w-3 h-3" />}
                            <span>{r.status}</span>
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-500">
                          {r.failedReason || (r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString() : 'Delivered')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            {hasFailed && (
              <button
                onClick={handleResendFailed}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? `ব্যর্থ ${message.failedCount} জনকে পুনরায় পাঠান` : `Resend to ${message.failedCount} Failed`}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

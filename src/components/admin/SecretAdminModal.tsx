import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Phone,
  Hash,
  Calendar,
  Layers,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { Donation } from '../../types/finance';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const {
    donations,
    verifyDonation,
    rejectDonation,
    funds,
  } = useFinance();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filter donations
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      if (d.isVoided && d.status !== 'rejected') return false;

      // Status filter
      if (statusFilter === 'pending' && d.status !== 'pending') return false;
      if (statusFilter === 'verified' && d.status !== 'verified' && d.status !== undefined) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (d.donorName && d.donorName.toLowerCase().includes(q)) ||
        (d.donorMobile && d.donorMobile.toLowerCase().includes(q)) ||
        (d.trxId && d.trxId.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q))
      );
    });
  }, [donations, searchQuery, statusFilter]);

  // Statistics
  const validDonations = donations.filter((d) => !d.isVoided);
  const pendingCount = donations.filter((d) => !d.isVoided && d.status === 'pending').length;
  const verifiedCount = donations.filter((d) => !d.isVoided && (d.status === 'verified' || !d.status)).length;
  const totalVerifiedDonationAmount = donations
    .filter((d) => !d.isVoided && (d.status === 'verified' || !d.status))
    .reduce((sum, d) => sum + d.amount, 0);

  const handleVerify = (donationId: string, donorName: string) => {
    verifyDonation(donationId);
    setActionSuccessMsg(
      isBn
        ? `সফল: ${donorName || 'দাতা'}-এর অনুদান TrxID যাচাই করে অনুমোদিত হয়েছে এবং তহবিলে জমা হয়েছে।`
        : `Verified: Donation from ${donorName || 'Donor'} approved.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleReject = (donationId: string, donorName: string) => {
    rejectDonation(donationId, 'অ্যাডমিন কর্তৃক ট্রানজেকশন বাতিল');
    setActionSuccessMsg(
      isBn
        ? `নোটিশ: ${donorName || 'দাতা'}-এর ট্রানজেকশন বাতিল করা হয়েছে।`
        : `Donation from ${donorName || 'Donor'} marked as rejected.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const getFundName = (fundId: string) => {
    const f = funds.find((item) => item.id === fundId);
    return f ? (isBn ? f.nameBn : f.nameEn) : fundId;
  };

  if (!isOpen) return null;

  return (
    <div
      id="secret-admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="secret-admin-modal-panel"
        className="relative w-full max-w-4xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border-2 border-emerald-500/50 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Secret Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {isBn ? 'কে টাকা পাঠালো (গোপন এডমিন প্যানেল)' : 'Who Sent Money (Secret Admin)'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/40 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  {isBn ? 'গোপনীয় মোড' : 'Confidential'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'দাতার নাম, মোবাইল নম্বর, ট্রানজেকশন আইডি (TrxID) যাচাই ও অনুমোদন'
                  : 'Track donor names, phone numbers, and verify payment TrxIDs'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-secret-admin-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip (Only donation & TrxID metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 text-xs shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-400" />
              <span>{isBn ? 'মোট সংগৃহীত অনুদান' : 'Total Donations'}</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              ৳{totalVerifiedDonationAmount.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{isBn ? 'অপেক্ষমান TrxID' : 'Pending TrxIDs'}</span>
            </div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
              {pendingCount} {isBn ? 'টি' : 'items'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{isBn ? 'অনুমোদিত অনুদান' : 'Verified Donations'}</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {verifiedCount} {isBn ? 'টি' : 'items'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              <span>{isBn ? 'মোট দাতার সংখ্যা' : 'Total Donors'}</span>
            </div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              {validDonations.length} {isBn ? 'জন' : 'donors'}
            </div>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 shrink-0 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isBn
                    ? 'দাতার নাম, মোবাইল নম্বর বা TrxID দিয়ে খুঁজুন...'
                    : 'Search by donor name, phone, or TrxID...'
                }
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {isBn ? `সকল (${validDonations.length})` : `All (${validDonations.length})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
              >
                {isBn ? `অপেক্ষমান (${pendingCount})` : `Pending (${pendingCount})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                {isBn ? `অনুমোদিত (${verifiedCount})` : `Verified (${verifiedCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Donations List (Who sent money) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDonations.length === 0 ? (
            <div className="p-10 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              {isBn ? 'কোনো অনুদান বা TrxID রেকর্ড পাওয়া যায়নি।' : 'No donation records found.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDonations.map((item: Donation) => {
                const isPending = item.status === 'pending';
                const isVerified = item.status === 'verified' || (!item.status && !item.isVoided);
                const isRejected = item.status === 'rejected' || item.isVoided;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : isVerified
                        ? 'bg-slate-800/50 border-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Donor Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {item.donorName || (isBn ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous')}
                          </span>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                              <Clock className="w-3 h-3" />
                              {isBn ? 'যাচাই অপেক্ষমান' : 'Pending Verification'}
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              {isBn ? 'অনুমোদিত' : 'Verified'}
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                              <XCircle className="w-3 h-3" />
                              {isBn ? 'বাতিল' : 'Rejected'}
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-400 font-mono">
                          {item.donorMobile && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{item.donorMobile}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">{isBn ? 'মাধ্যম:' : 'Method:'}</span>
                            <span className="text-amber-300 font-bold uppercase">{item.paymentMethod}</span>
                          </div>

                          {item.trxId && (
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3 text-amber-400" />
                              <span className="text-slate-400">TrxID:</span>
                              <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-200 font-bold tracking-wider border border-amber-500/30">
                                {item.trxId}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{item.date}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">{getFundName(item.fundId)}</span>
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 italic">
                            "{item.notes}"
                          </p>
                        )}
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 sm:block">{isBn ? 'পরিমাণ' : 'Amount'}</span>
                          <span className="text-base font-extrabold text-amber-400 font-mono">
                            ৳{item.amount.toLocaleString()}
                          </span>
                        </div>

                        {/* Action Buttons for Pending */}
                        {isPending && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerify(item.id, item.donorName)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isBn ? 'অনুমোদন' : 'Verify'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReject(item.id, item.donorName)}
                              className="px-2 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                            </button>
                          </div>
                        )}

                        {isVerified && (
                          <div className="text-[11px] text-emerald-400 font-medium">
                            {isBn ? '✓ তহবিলে জমা হয়েছে' : 'Credited to Fund'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBn ? 'স্লাইড মেনুতে আ্যপের নামে ৭বার ক্লিকে সংরক্ষিত' : 'Encrypted & protected mode'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

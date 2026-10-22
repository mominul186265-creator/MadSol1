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
  Building2,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Save,
  MapPin,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb } from '../../lib/db';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { language } = useLanguage();
  const { user, institution, refreshData } = useAuth();
  const { showToast } = useToast();
  const {
    donations,
    verifyDonation,
    rejectDonation,
    funds,
  } = useFinance();

  const isBn = language === 'bn';

  // Primary tab state: 'institution' (প্রতিষ্ঠান ব্যবস্থাপনা) vs 'donations' (কে টাকা পাঠালো)
  const [activeTab, setActiveTab] = useState<'institution' | 'donations'>('institution');

  // Institution Edit Form State
  const [isEditingInst, setIsEditingInst] = useState(false);
  const [instName, setInstName] = useState(institution?.name || '');
  const [instAddress, setInstAddress] = useState(institution?.address || '');
  const [instPhone, setInstPhone] = useState(institution?.phone || institution?.mobile || '');
  const [instEmail, setInstEmail] = useState(institution?.email || '');
  const [teacherPin, setTeacherPin] = useState(institution?.teacher_access_pin || '849201');
  const [guardianPin, setGuardianPin] = useState(institution?.guardian_access_pin || '772109');

  const [copiedPin, setCopiedPin] = useState<'teacher' | 'guardian' | null>(null);

  // Donations search & filter
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

  const handleCopyPin = (pin: string, type: 'teacher' | 'guardian') => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(type);
    showToast(isBn ? 'পিন কপি করা হয়েছে!' : 'PIN copied to clipboard!', 'success');
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const handleSaveInstitution = () => {
    if (!institution) return;
    madsolDb.updateInstitution(institution.id, {
      name: instName.trim() || institution.name,
      short_name: instName.trim().split(' ')[0] || institution.short_name,
      address: instAddress.trim() || institution.address,
      phone: instPhone.trim() || institution.phone,
      mobile: instPhone.trim() || institution.mobile,
      email: instEmail.trim() || institution.email,
      teacher_access_pin: teacherPin.trim() || institution.teacher_access_pin,
      guardian_access_pin: guardianPin.trim() || institution.guardian_access_pin,
    });
    refreshData();
    setIsEditingInst(false);
    showToast(
      isBn ? 'প্রতিষ্ঠানের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!' : 'Institution updated successfully!',
      'success'
    );
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
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              {activeTab === 'institution' ? (
                <Building2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {activeTab === 'institution'
                    ? (isBn ? 'প্রতিষ্ঠান ব্যবস্থাপনা' : 'Institution Management')
                    : (isBn ? 'কে টাকা পাঠালো (গোপন এডমিন প্যানেল)' : 'Who Sent Money (Secret Admin)')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/40 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  {isBn ? 'এডমিন মোড' : 'Admin Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeTab === 'institution'
                  ? (isBn
                      ? 'মাদ্রাসার মূল তথ্য, শিক্ষক ও অভিভাবক এক্সেস পিন নিয়ন্ত্রণ'
                      : 'Institution details and Access PIN administration')
                  : (isBn
                      ? 'দাতার নাম, মোবাইল নম্বর, ট্রানজেকশন আইডি (TrxID) যাচাই ও অনুমোদন'
                      : 'Track donor names, phone numbers, and verify payment TrxIDs')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="close-secret-admin-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0 overflow-x-auto">
          <button
            type="button"
            id="tab-institution"
            onClick={() => setActiveTab('institution')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'institution'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isBn ? '🏛️ প্রতিষ্ঠান ব্যবস্থাপনা' : 'Institution Management'}</span>
          </button>

          <button
            type="button"
            id="tab-donations"
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{isBn ? '💰 কে টাকা পাঠালো (TrxID)' : 'Donations & TrxID'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => {
                onNavigate('/institution');
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>{isBn ? 'সম্পূর্ণ পেজে যান' : 'Go to Full Page'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Institution Management */}
        {activeTab === 'institution' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Institution Profile Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {institution?.name || (isBn ? 'দারুল উলুম মাদ্রাসা' : 'Darul Uloom Madrasa')}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{institution?.address || (isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInst(!isEditingInst)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditingInst ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'তথ্য এডিট করুন' : 'Edit Info')}</span>
                  </button>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {institution?.status === 'active' ? (isBn ? 'সক্রিয় প্রতিষ্ঠান' : 'Active') : 'Active'}
                  </span>
                </div>
              </div>

              {isEditingInst ? (
                /* Inline Edit Form */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {isBn ? 'মাদ্রাসার পূর্ণ নাম' : 'Institution Name'}
                    </label>
                    <input
                      type="text"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {isBn ? 'মাদ্রাসার ঠিকানা' : 'Address'}
                    </label>
                    <input
                      type="text"
                      value={instAddress}
                      onChange={(e) => setInstAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {isBn ? 'অফিস মোবাইল' : 'Mobile'}
                    </label>
                    <input
                      type="text"
                      value={instPhone}
                      onChange={(e) => setInstPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {isBn ? 'অফিসিয়াল ইমেইল' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveInstitution}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isBn ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Overview Info Grid */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'পরিচালক / মুহতামিম' : 'Director'}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block truncate">
                      {user?.name || (isBn ? 'মাওলানা মাহমুদুল হাসান' : 'Principal')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'মোবাইল নম্বর' : 'Phone'}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block truncate font-mono">
                      {institution?.phone || institution?.mobile || '০১৭xxxxxxxx'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'মাদ্রাসার ধরন' : 'Type'}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">
                      {isBn ? 'কওমি ও হিফজ' : 'Qawmi & Hifz'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isBn ? 'আইডি কোড' : 'Code'}</span>
                    <span className="font-bold text-slate-200 mt-0.5 block font-mono">
                      {institution?.id || 'inst-001'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Access PIN Management (Teachers & Guardians) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>{isBn ? 'মাদ্রাসার সক্রিয় এক্সেস পিন (PIN)' : 'Access PINs'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Teacher PIN */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-200">
                        {isBn ? '👨‍🏫 সহকারী শিক্ষক এক্সেস পিন' : 'Teacher Access PIN'}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded-full bg-indigo-900/60">
                        {isBn ? 'শিক্ষকদের দিন' : 'For Staff'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      {isBn
                        ? 'সহকারী শিক্ষকরা অ্যাপে রেজিস্ট্রেশন করার সময় এই পিনটি ব্যবহার করবেন।'
                        : 'Staff members enter this PIN during sign up.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-indigo-500/30">
                    <span className="text-xl font-mono font-black tracking-widest text-indigo-300">
                      {institution?.teacher_access_pin || '849201'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPin(institution?.teacher_access_pin || '849201', 'teacher')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedPin === 'teacher' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPin === 'teacher' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Guardian PIN */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-200">
                        {isBn ? '👨‍👩‍👦 অভিভাবক এক্সেস পিন' : 'Guardian Access PIN'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-900/60">
                        {isBn ? 'অভিভাবকদের দিন' : 'For Parents'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      {isBn
                        ? 'অভিভাবকরা সন্তানের ছবক ও তথ্য দেখার জন্য এই পিন দিয়ে একাউন্ট খুলবেন।'
                        : 'Parents enter this PIN to access guardian portal.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-amber-500/30">
                    <span className="text-xl font-mono font-black tracking-widest text-amber-300">
                      {institution?.guardian_access_pin || '772109'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPin(institution?.guardian_access_pin || '772109', 'guardian')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedPin === 'guardian' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPin === 'guardian' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Link to Full Institution Page */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onNavigate('/institution');
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>{isBn ? '🏛️ সম্পূর্ণ প্রতিষ্ঠান ব্যবস্থাপনা পেজ খুলুন' : 'Open Full Institution Management Page'}</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Donations & TrxID Verification */}
        {activeTab === 'donations' && (
          <>
            {/* Quick KPI Strip */}
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
                  <UserCheck className="w-3 h-3 text-sky-400" />
                  <span>{isBn ? 'মোট দাতার সংখ্যা' : 'Donors'}</span>
                </div>
                <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                  {validDonations.length} {isBn ? 'জন' : 'people'}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={
                    isBn
                      ? 'দাতার নাম, মোবাইল নম্বর বা TrxID দিয়ে খুঁজুন...'
                      : 'Search by donor name, phone or TrxID...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isBn ? `সকল (${validDonations.length})` : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isBn ? `অপেক্ষমান (${pendingCount})` : 'Pending'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {isBn ? `অনুমোদিত (${verifiedCount})` : 'Verified'}
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border-b border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Donation List Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredDonations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  {isBn ? 'কোনো অনুদানের তথ্য পাওয়া যায়নি।' : 'No donation records found.'}
                </div>
              ) : (
                filteredDonations.map((d) => {
                  const isPending = d.status === 'pending';
                  const isVerified = d.status === 'verified' || !d.status;
                  const isRejected = d.status === 'rejected';

                  return (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : isRejected
                          ? 'bg-rose-950/20 border-rose-800/40 opacity-75'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {d.donorName || (isBn ? 'শুভাকাঙ্ক্ষী দাতা' : 'Anonymous Donor')}
                            </span>
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {isBn ? 'যাচাই প্রয়োজন' : 'Needs Verification'}
                              </span>
                            )}
                            {isVerified && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {isBn ? 'অনুমোদিত' : 'Verified'}
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                {isBn ? 'বাতিল' : 'Rejected'}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            {d.donorMobile && (
                              <span className="flex items-center gap-1 font-mono text-slate-300">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                {d.donorMobile}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">
                              মাধ্যম: <strong className="text-slate-300">{d.paymentMethod}</strong>
                            </span>
                            {d.trxId && (
                              <span className="flex items-center gap-1 text-[11px] bg-slate-900 px-2 py-0.5 rounded font-mono border border-slate-700 text-amber-300 font-semibold">
                                <Hash className="w-3 h-3 text-amber-400" />
                                TrxID: {d.trxId}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {d.date}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                              <Layers className="w-3 h-3" />
                              {getFundName(d.fundId)}
                            </span>
                          </div>

                          {d.notes && (
                            <p className="text-xs text-slate-400 italic mt-1">"{d.notes}"</p>
                          )}
                        </div>

                        <div className="flex items-center sm:flex-col items-end justify-between gap-2 shrink-0">
                          <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                            পরিমাণ: ৳{d.amount.toLocaleString()}
                          </div>

                          <div className="flex items-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleVerify(d.id, d.donorName)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'অনুমোদন করুন' : 'Approve'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(d.id, d.donorName)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition-all cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                                </button>
                              </>
                            )}

                            {isVerified && (
                              <div className="text-[11px] text-emerald-400 font-medium">
                                {isBn ? '✓ তহবিলে জমা হয়েছে' : 'Credited to Fund'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBn ? 'স্লাইড মেনুতে অ্যাপের লোগোতে ক্লিকে সংরক্ষিত' : 'Encrypted admin mode'}</span>
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

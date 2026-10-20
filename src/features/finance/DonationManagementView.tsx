import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Donation, Donor, PaymentMethod, DonationCategory } from '../../types/finance';
import {
  Gift,
  Plus,
  Search,
  Users,
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  ShieldCheck,
  Heart,
  Building2,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Eye,
  Clock,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { IslamicPattern } from '../../components/common/IslamicPattern';

export const DonationManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const {
    donations,
    donors,
    funds,
    recordDonation,
    registerDonor,
    verifyDonation,
    rejectDonation,
    voidTransaction,
  } = useFinance();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'donations' | 'donors'>('donations');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [activeReceiptModalDonation, setActiveReceiptModalDonation] = useState<Donation | null>(null);
  const [selectedDonorProfile, setSelectedDonorProfile] = useState<Donor | null>(null);

  // Verification & Rejection Modal State
  const [rejectingDonation, setRejectingDonation] = useState<Donation | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // New Donation Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [donorNameInput, setDonorNameInput] = useState('');
  const [donorMobileInput, setDonorMobileInput] = useState('');
  const [donorAddressInput, setDonorAddressInput] = useState('');
  const [category, setCategory] = useState<DonationCategory>('lillah');
  const [amount, setAmount] = useState<number>(5000);
  const [fundId, setFundId] = useState('lillah');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // New Donor Form State
  const [newDonorNameBn, setNewDonorNameBn] = useState('');
  const [newDonorNameEn, setNewDonorNameEn] = useState('');
  const [newDonorMobile, setNewDonorMobile] = useState('');
  const [newDonorEmail, setNewDonorEmail] = useState('');
  const [newDonorAddress, setNewDonorAddress] = useState('');
  const [newDonorCategory, setNewDonorCategory] = useState<'general' | 'permanent' | 'monthly' | 'corporate'>('permanent');

  // Aggregates
  const stats = useMemo(() => {
    const activeDonations = donations.filter(d => !d.isVoided && d.status !== 'rejected');
    const verifiedDonations = activeDonations.filter(d => d.status === 'verified' || !d.status);
    const pendingDonations = donations.filter(d => !d.isVoided && d.status === 'pending');
    const total = verifiedDonations.reduce((s, d) => s + d.amount, 0);
    const pendingTotal = pendingDonations.reduce((s, d) => s + d.amount, 0);
    const zakatLillah = verifiedDonations
      .filter(d => d.category === 'zakat' || d.category === 'lillah' || d.category === 'orphan')
      .reduce((s, d) => s + d.amount, 0);

    return {
      total,
      pendingTotal,
      pendingCount: pendingDonations.length,
      donorCount: donors.length,
      zakatLillah,
    };
  }, [donations, donors]);

  // Filtered Donations
  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      // Status filter
      if (selectedStatus !== 'all') {
        const dStatus = d.status || 'verified';
        if (selectedStatus === 'pending') {
          if (d.status !== 'pending') return false;
        } else if (selectedStatus !== dStatus) {
          return false;
        }
      }
      if (selectedFund !== 'all' && d.fundId !== selectedFund) return false;
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.donorNameBn.toLowerCase().includes(q) ||
          d.receiptNumber.toLowerCase().includes(q) ||
          (d.donorMobile && d.donorMobile.includes(q)) ||
          (d.trxId && d.trxId.toLowerCase().includes(q)) ||
          (d.referenceNumber && d.referenceNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [donations, selectedStatus, selectedFund, selectedCategory, searchQuery]);

  // Verify Action Handler
  const handleVerifyDonation = async (don: Donation) => {
    const success = await verifyDonation(don.id, institution?.nameBn || 'প্রধান হিসাবরক্ষক');
    if (success) {
      setActionSuccessMessage(
        isBn
          ? `রসিদ নং ${don.receiptNumber}-এর অনুদানটি সফলভাবে যাচাই ও ফান্ডে জমা করা হয়েছে।`
          : `Donation ${don.receiptNumber} verified and deposited successfully.`
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  // Reject Action Handler
  const handleConfirmReject = async () => {
    if (!rejectingDonation) return;
    const success = await rejectDonation(
      rejectingDonation.id,
      rejectionReasonInput || (isBn ? 'ভুয়া বা অপ্রাপ্ত ট্রানজেকশন (TrxID অমিল)' : 'Invalid transaction ID')
    );
    if (success) {
      setActionSuccessMessage(
        isBn
          ? `রসিদ নং ${rejectingDonation.receiptNumber}-এর অনুদানটি বাতিল করা হয়েছে।`
          : `Donation ${rejectingDonation.receiptNumber} has been rejected.`
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
    setRejectingDonation(null);
    setRejectionReasonInput('');
  };

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    if (!searchQuery.trim()) return donors;
    const q = searchQuery.toLowerCase();
    return donors.filter(
      dn =>
        dn.nameBn.toLowerCase().includes(q) ||
        dn.nameEn.toLowerCase().includes(q) ||
        dn.mobile.includes(q) ||
        (dn.email && dn.email.toLowerCase().includes(q))
    );
  }, [donors, searchQuery]);

  // Handle donor selection in donation form
  const handleSelectExistingDonor = (dId: string) => {
    setSelectedDonorId(dId);
    const found = donors.find(d => d.id === dId);
    if (found) {
      setDonorNameInput(found.nameBn);
      setDonorMobileInput(found.mobile);
      setDonorAddressInput(found.address || '');
    }
  };

  // Submit Donation
  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorNameInput.trim() || amount <= 0) return;

    const donation = await recordDonation({
      donorId: selectedDonorId || undefined,
      donorNameBn: donorNameInput,
      donorMobile: donorMobileInput || undefined,
      donorAddress: donorAddressInput || undefined,
      date,
      category,
      amount,
      fundId,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });

    setIsRecordModalOpen(false);
    setActiveReceiptModalDonation(donation);

    // Reset
    setSelectedDonorId('');
    setDonorNameInput('');
    setDonorMobileInput('');
    setDonorAddressInput('');
    setReferenceNumber('');
    setNotes('');
  };

  // Submit Donor
  const handleSaveDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorNameBn || !newDonorMobile) return;

    await registerDonor({
      nameBn: newDonorNameBn,
      nameEn: newDonorNameEn || newDonorNameBn,
      mobile: newDonorMobile,
      email: newDonorEmail || undefined,
      address: newDonorAddress || undefined,
      category: newDonorCategory,
    });

    setIsDonorModalOpen(false);
    setNewDonorNameBn('');
    setNewDonorNameEn('');
    setNewDonorMobile('');
    setNewDonorEmail('');
    setNewDonorAddress('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Donor Name', 'Mobile', 'Category', 'Fund', 'Amount', 'Payment Method'];
    const rows = filteredDonations.map(d => [
      d.receiptNumber,
      d.date,
      `"${d.donorNameBn}"`,
      d.donorMobile || '-',
      d.category,
      d.fundId,
      d.amount,
      d.paymentMethod,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Donations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <Gift className="w-3.5 h-3.5" />
            {isBn ? 'দান ও অনুদান ব্যবস্থাপনা' : 'Donation & Philanthropy Suite'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'দান, সদকা ও দাতা ডিরেক্টরি' : 'Donation & Donor Management'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'সাধারণ দান, লিল্লাহ, এতিমখানা ও যাকাত ফান্ড কালেকশন, আজীবন দাতা তালিকা ও ডিজিটাল দান রসিদ।'
              : 'Record charitable donations, manage permanent donors, ensure Zakat compliance, and issue receipts.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsDonorModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
          >
            <Users className="w-4 h-4" />
            {isBn ? 'নতুন দাতা নিবন্ধন' : 'Register Donor'}
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'দান গ্রহণ ও রসিদ তৈরি' : 'Record Donation'}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Total */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'অনুমোদিত মোট দান' : 'Total Verified Donations'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              ৳{stats.total.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'যাচাইকৃত ও তহবিলে জমাকৃত' : 'Verified and deposited'}</p>
          </div>
        </div>

        {/* Card 2: Pending Donations (Crucial for Admin Verification) */}
        <div
          onClick={() => {
            setActiveTab('donations');
            setSelectedStatus('pending');
          }}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${
            stats.pendingCount > 0
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 hover:border-amber-400'
              : 'bg-white dark:bg-emerald-950/60 border-stone-200 dark:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <span>{isBn ? 'অপেক্ষমান অনুদান যাচাই' : 'Pending Verification'}</span>
              {stats.pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
                {stats.pendingCount}
              </span>
              <span className="text-xs text-stone-500 ml-1">{isBn ? 'টি আবেদন' : 'requests'}</span>
            </div>
            <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-200">
              ৳{stats.pendingTotal.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 font-medium">
            {stats.pendingCount > 0
              ? (isBn ? '⚠️ TrxID যাচাই করে অনুমোদন দিতে ক্লিক করুন' : 'Click to review & verify')
              : (isBn ? 'কোনো অপেক্ষমান আবেদন নেই' : 'No pending requests')}
          </p>
        </div>

        {/* Card 3: Donors */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'নিবন্ধিত সম্মানিত দাতা' : 'Registered Donors'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-300">
              {stats.donorCount}
            </span>
            <span className="text-xs text-stone-500 ml-1">{isBn ? 'জন' : 'donors'}</span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'আজীবন ও মাসিক দাতা' : 'Permanent & monthly'}</p>
          </div>
        </div>

        {/* Card 4: Zakat & Lillah */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'লিল্লাহ ও যাকাত কালেকশন' : 'Lillah & Zakat Pool'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300">
              ৳{stats.zakatLillah.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'শর্তযুক্ত ও সুরক্ষিত তহবিল' : 'Restricted funds'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-emerald-800 pb-2">
        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'donations'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{isBn ? 'দান তালিকা ও যাচাইকরণ' : 'Donations & Verification'}</span>
          {stats.pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('donors')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'donors'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <Users className="w-4 h-4" />
          {isBn ? 'সম্মানিত দাতা ডিরেক্টরি (Donors)' : 'Donors Directory'}
        </button>
      </div>

      {/* TAB 1: DONATIONS LIST */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          {/* Filter Bar with Status Pills & Categories */}
          <div className="flex flex-col gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-100 dark:border-emerald-900/40">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
                {isBn ? 'স্ট্যাটাস ফিল্টার:' : 'Filter Status:'}
              </span>

              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-emerald-900/40 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {isBn ? `সকল (${donations.length})` : `All (${donations.length})`}
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200/70'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isBn ? 'অপেক্ষমান যাচাই (Pending)' : 'Pending'}</span>
                {stats.pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-700 text-white">
                    {stats.pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('verified')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedStatus === 'verified'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/70'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'যাচাইকৃত ও অনুমোদিত' : 'Verified'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('rejected')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedStatus === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-100/70 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 hover:bg-rose-200/70'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isBn ? 'বাতিলকৃত' : 'Rejected'}</span>
              </button>
            </div>

            {/* Search and Secondary Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={isBn ? 'দাতা নাম, রসিদ নং, TrxID বা মোবাইল...' : 'Search donor, receipt, TrxID or mobile...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
                >
                  <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                  <option value="general">{isBn ? 'সাধারণ দান' : 'General'}</option>
                  <option value="lillah">{isBn ? 'লিল্লাহ ফান্ড' : 'Lillah'}</option>
                  <option value="orphan">{isBn ? 'এতিমখানা' : 'Orphan'}</option>
                  <option value="zakat">{isBn ? 'যাকাত' : 'Zakat'}</option>
                  <option value="sadaqah">{isBn ? 'সদকা / ফিতরা' : 'Sadaqah'}</option>
                  <option value="building">{isBn ? 'ভবন নির্মাণ' : 'Building'}</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="p-2 text-stone-600 dark:text-stone-300 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-900/40"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
                <tr>
                  <th className="p-3">রসিদ নং ও তারিখ</th>
                  <th className="p-3">সম্মানিত দাতা</th>
                  <th className="p-3">দানের খাত (Category)</th>
                  <th className="p-3">পদ্ধতি ও TrxID</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">দানের পরিমাণ</th>
                  <th className="p-3 text-right">যাচাই ও অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-stone-400">
                      {isBn ? 'কোনো অনুদানের তথ্য পাওয়া যায়নি' : 'No donations found'}
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map(don => {
                    const fund = funds.find(f => f.id === don.fundId);
                    const isPending = !don.status || don.status === 'pending';
                    const isVerified = don.status === 'verified';
                    const isRejected = don.status === 'rejected';

                    return (
                      <tr
                        key={don.id}
                        className={`transition-colors ${
                          isPending
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70'
                            : 'hover:bg-stone-50/50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                            {don.receiptNumber}
                          </div>
                          <div className="text-[10px] text-stone-400">{don.date}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-stone-800 dark:text-stone-100">{don.donorNameBn}</div>
                          {don.donorMobile && (
                            <div className="text-[10px] text-stone-400 font-mono">{don.donorMobile}</div>
                          )}
                        </td>

                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-semibold capitalize">
                            {don.category}
                          </span>
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            {isBn ? fund?.nameBn : fund?.nameEn}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="uppercase font-medium text-stone-700 dark:text-stone-300">
                            {don.paymentMethod.replace('_', ' ')}
                          </div>
                          {(don.trxId || don.referenceNumber) && (
                            <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-stone-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              TrxID: {don.trxId || don.referenceNumber}
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="p-3">
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {isBn ? 'অনুমোদিত' : 'Verified'}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {isBn ? 'অপেক্ষমান যাচাই' : 'Pending'}
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300" title={don.rejectionReason}>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              {isBn ? 'বাতিল' : 'Rejected'}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                          ৳{don.amount.toLocaleString()}
                        </td>

                        {/* Actions: Verify & Reject for Pending, and Receipt */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleVerifyDonation(don)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                                  title={isBn ? 'যাচাই ও অনুমোদন করুন' : 'Verify & Approve'}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isBn ? 'অনুমোদন' : 'Verify'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingDonation(don);
                                    setRejectionReasonInput('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                                  title={isBn ? 'ভুয়া বা বাতিল হিসেবে চিহ্নিত করুন' : 'Reject'}
                                >
                                  <X className="w-3 h-3" />
                                  <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setActiveReceiptModalDonation(don)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-emerald-900/40 dark:text-emerald-200 border border-stone-200 dark:border-emerald-800 transition shadow-xs cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              {isBn ? 'রসিদ' : 'Receipt'}
                            </button>
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
      )}

      {/* TAB 2: DONORS DIRECTORY */}
      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map(donor => (
              <div
                key={donor.id}
                className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {donor.category}
                      </span>
                      <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50 mt-1">
                        {donor.nameBn}
                      </h3>
                      <p className="text-xs text-stone-500">{donor.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        ৳{donor.totalDonated.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-stone-400">{isBn ? 'মোট অনুদান' : 'Total Given'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 space-y-1 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono">{donor.mobile}</span>
                    </div>
                    {donor.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{donor.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    {isBn ? 'সর্বশেষ:' : 'Last:'} {donor.lastDonationDate || 'N/A'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDonorId(donor.id);
                      setDonorNameInput(donor.nameBn);
                      setDonorMobileInput(donor.mobile);
                      setDonorAddressInput(donor.address || '');
                      setIsRecordModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
                  >
                    {isBn ? '+ দান গ্রহণ' : '+ Give'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD DONATION MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-emerald-950 dark:text-emerald-50">
                {isBn ? 'দান ও অনুদান গ্রহণ' : 'Record Charitable Donation'}
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDonation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isBn ? 'সম্মানিত দাতা নির্বাচন করুন (ঐচ্ছিক):' : 'Select Registered Donor:'}</label>
                <select
                  value={selectedDonorId}
                  onChange={e => handleSelectExistingDonor(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                >
                  <option value="">{isBn ? '-- নতুন দাতা বা সাধারণ দাতা --' : '-- Walk-in / New Donor --'}</option>
                  {donors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nameBn} ({d.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'দাতার নাম:' : 'Donor Name:'}</label>
                  <input
                    type="text"
                    required
                    value={donorNameInput}
                    onChange={e => setDonorNameInput(e.target.value)}
                    placeholder="হাজী রফিকুল ইসলাম"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'মোবাইল নং:' : 'Mobile No:'}</label>
                  <input
                    type="text"
                    value={donorMobileInput}
                    onChange={e => setDonorMobileInput(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'দানের খাত (Category):' : 'Donation Category:'}</label>
                  <select
                    value={category}
                    onChange={e => {
                      const cat = e.target.value as DonationCategory;
                      setCategory(cat);
                      if (cat === 'zakat') setFundId('zakat');
                      else if (cat === 'orphan') setFundId('orphan');
                      else if (cat === 'building') setFundId('building');
                      else if (cat === 'lillah') setFundId('lillah');
                      else setFundId('general');
                    }}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-medium"
                  >
                    <option value="lillah">{isBn ? 'লিল্লাহ ফান্ড' : 'Lillah'}</option>
                    <option value="orphan">{isBn ? 'এতিমখানা সহায়তা' : 'Orphan'}</option>
                    <option value="zakat">{isBn ? 'যাকাত তহবিল' : 'Zakat'}</option>
                    <option value="sadaqah">{isBn ? 'সাধারণ সদকা / ফিতরা' : 'Sadaqah / Fitra'}</option>
                    <option value="building">{isBn ? 'মসজিদ ও ভবন নির্মাণ' : 'Building'}</option>
                    <option value="general">{isBn ? 'সাধারণ দান' : 'General'}</option>
                    <option value="food">{isBn ? 'খোরাকি ও খাবার' : 'Food'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'জমার তহবিল (Fund):' : 'Target Fund:'}</label>
                  <select
                    value={fundId}
                    onChange={e => setFundId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    {funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {isBn ? f.nameBn : f.nameEn} (৳{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'দানের পরিমাণ (৳):' : 'Amount (BDT):'}</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full p-2 text-base font-bold font-mono rounded-lg border border-emerald-500 text-emerald-700 dark:text-emerald-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                    <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank'}</option>
                    <option value="mobile_banking">{isBn ? 'মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile Banking'}</option>
                    <option value="online">{isBn ? 'অনলাইন' : 'Online'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'চেক / ট্রানজ্যাকশন আইডি:' : 'Trx Ref / Cheque:'}</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    placeholder="TrxID / Cheque #"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'বিশেষ নিয়ত / মন্তব্য:' : 'Niyyah / Notes:'}</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={isBn ? 'মরহুম পিতামাতার মাগফিরাত কামনায়' : 'Notes'}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'দান সংরক্ষণ ও রসিদ তৈরি' : 'Record & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER DONOR MODAL */}
      {isDonorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'নতুন সম্মানিত দাতা নিবন্ধন' : 'Register New Donor'}
            </h3>

            <form onSubmit={handleSaveDonor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (বাংলা):' : 'Name (Bangla):'}</label>
                  <input
                    type="text"
                    required
                    value={newDonorNameBn}
                    onChange={e => setNewDonorNameBn(e.target.value)}
                    placeholder="হাজী মো: শামসুল হক"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (English):' : 'Name (English):'}</label>
                  <input
                    type="text"
                    value={newDonorNameEn}
                    onChange={e => setNewDonorNameEn(e.target.value)}
                    placeholder="Haji Shamsul Haque"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'মোবাইল নং:' : 'Mobile Number:'}</label>
                  <input
                    type="text"
                    required
                    value={newDonorMobile}
                    onChange={e => setNewDonorMobile(e.target.value)}
                    placeholder="01711-xxxxxx"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'দাতার ধরন:' : 'Donor Type:'}</label>
                  <select
                    value={newDonorCategory}
                    onChange={e => setNewDonorCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    <option value="permanent">{isBn ? 'আজীবন / স্থায়ী দাতা' : 'Permanent Donor'}</option>
                    <option value="monthly">{isBn ? 'মাসিক চাঁদা দাতা' : 'Monthly Donor'}</option>
                    <option value="corporate">{isBn ? 'কর্পোরেট / প্রাতিষ্ঠানিক' : 'Corporate Donor'}</option>
                    <option value="general">{isBn ? 'সাধারণ দাতা' : 'General Donor'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ইমেইল (ঐচ্ছিক):' : 'Email (Optional):'}</label>
                <input
                  type="email"
                  value={newDonorEmail}
                  onChange={e => setNewDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ঠিকানা:' : 'Address:'}</label>
                <input
                  type="text"
                  value={newDonorAddress}
                  onChange={e => setNewDonorAddress(e.target.value)}
                  placeholder="ধানমন্ডি, ঢাকা"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDonorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'নিবন্ধন করুন' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL DONATION RECEIPT MODAL */}
      {activeReceiptModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 dark:bg-emerald-900/50 border-b border-emerald-100 dark:border-emerald-800 print:hidden">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                  <Heart className="w-3.5 h-3.5" />
                  {isBn ? 'দান ও সদকার অফিসিয়াল রসিদ' : 'Official Donation Receipt'}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  #{activeReceiptModalDonation.receiptNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {isBn ? 'প্রিন্ট' : 'Print'}
                </button>
                <button
                  onClick={() => setActiveReceiptModalDonation(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 md:p-8 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-100 relative">
              <IslamicPattern opacity={0.03} />

              <div className="text-center pb-6 border-b-2 border-dashed border-emerald-200 dark:border-emerald-800">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
                  <span className="text-2xl font-bold font-serif">ম</span>
                </div>
                <h2 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
                  {institution?.nameBn || 'দারুল উলুম মাদ্রাসা ও এতিমখানা'}
                </h2>
                <p className="text-xs text-stone-500">
                  {institution?.nameEn || 'Darul Uloom Madrasa & Orphanage'}
                </p>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold tracking-wider uppercase">
                  {isBn ? 'দান ও সদকা প্রাপ্তি রসিদ' : 'CHARITY DONATION RECEIPT'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-stone-200 dark:border-emerald-800/80">
                <div className="space-y-1">
                  <p><span className="text-stone-500">{isBn ? 'সম্মানিত দাতার নাম:' : 'Donor Name:'}</span> <strong className="font-semibold text-emerald-900 dark:text-emerald-200">{activeReceiptModalDonation.donorNameBn}</strong></p>
                  {activeReceiptModalDonation.donorMobile && (
                    <p><span className="text-stone-500">{isBn ? 'মোবাইল নং:' : 'Mobile:'}</span> <span className="font-mono">{activeReceiptModalDonation.donorMobile}</span></p>
                  )}
                  {activeReceiptModalDonation.donorAddress && (
                    <p><span className="text-stone-500">{isBn ? 'ঠিকানা:' : 'Address:'}</span> {activeReceiptModalDonation.donorAddress}</p>
                  )}
                  {(activeReceiptModalDonation.trxId || activeReceiptModalDonation.referenceNumber) && (
                    <p><span className="text-stone-500">TrxID:</span> <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{activeReceiptModalDonation.trxId || activeReceiptModalDonation.referenceNumber}</span></p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <p><span className="text-stone-500">{isBn ? 'রসিদ নং:' : 'Receipt No:'}</span> <strong className="font-mono text-emerald-700 dark:text-emerald-300">{activeReceiptModalDonation.receiptNumber}</strong></p>
                  <p><span className="text-stone-500">{isBn ? 'তারিখ:' : 'Date:'}</span> {activeReceiptModalDonation.date}</p>
                  <p><span className="text-stone-500">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</span> <span className="uppercase font-medium">{activeReceiptModalDonation.paymentMethod}</span></p>
                  <div className="pt-1">
                    {(!activeReceiptModalDonation.status || activeReceiptModalDonation.status === 'verified') && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {isBn ? 'যাচাইকৃত ও অনুমোদিত' : 'Verified'}
                      </span>
                    )}
                    {activeReceiptModalDonation.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {isBn ? 'অপেক্ষমান যাচাই' : 'Pending Verification'}
                      </span>
                    )}
                    {activeReceiptModalDonation.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {isBn ? 'বাতিলকৃত' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 my-6 text-center">
                <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-semibold">
                  {isBn ? 'প্রাপ্ত দানের পরিমাণ' : 'TOTAL DONATION AMOUNT'}
                </div>
                <div className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300 my-2">
                  ৳{activeReceiptModalDonation.amount.toLocaleString()}
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold">
                  {isBn ? 'খাত: ' : 'Category: '}
                  {activeReceiptModalDonation.category.toUpperCase()}
                </div>
                {activeReceiptModalDonation.notes && (
                  <p className="mt-3 text-xs italic text-stone-600 dark:text-stone-300">
                    "{activeReceiptModalDonation.notes}"
                  </p>
                )}
                {activeReceiptModalDonation.verifiedBy && (
                  <div className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'যাচাইকারী:' : 'Verified By:'} {activeReceiptModalDonation.verifiedBy}</span>
                  </div>
                )}
              </div>

              {/* Dua */}
              <div className="text-center text-xs text-stone-500 italic pb-6">
                "আল্লাহ তাআলা আপনার এই দান কবুল করুন এবং দুনিয়া ও আখেরাতে উত্তম প্রতিদান দান করুন। আমীন।"
              </div>

              {/* Signature */}
              <div className="flex items-end justify-between pt-4 border-t border-dashed border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'স্বয়ংক্রিয় ডিজিটাল রসিদ' : 'Authorized Digital Receipt'}
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-stone-400 pb-1 mb-1 font-serif text-[11px]">
                    {activeReceiptModalDonation.receivedBy}
                  </div>
                  <span className="text-[10px] text-stone-500">{isBn ? 'আদায়কারী স্বাক্ষর' : 'Received By'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT DONATION CONFIRMATION MODAL */}
      {rejectingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-emerald-950 border border-rose-200 dark:border-rose-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between pb-3 border-b border-stone-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {isBn ? 'অনুদান বাতিল নিশ্চিতকরণ' : 'Reject Donation Submission'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingDonation(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-stone-600 dark:text-stone-300">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই অনুদানটি বাতিল করতে চান? এটি বাতিল করলে তহবিলে কোনো টাকা যোগ হবে না এবং রসিদটিতে বাতিল স্ট্যাটাস প্রদর্শিত হবে।'
                  : 'Are you sure you want to reject this donation? No funds will be credited and the receipt will be marked as rejected.'}
              </p>

              <div className="p-3 bg-stone-50 dark:bg-emerald-900/30 rounded-xl space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">{isBn ? 'রসিদ নং:' : 'Receipt:'}</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{rejectingDonation.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{isBn ? 'দাতা:' : 'Donor:'}</span>
                  <span className="font-bold font-sans text-stone-900 dark:text-stone-100">{rejectingDonation.donorNameBn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{isBn ? 'পরিমাণ:' : 'Amount:'}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">৳{rejectingDonation.amount.toLocaleString()}</span>
                </div>
                {(rejectingDonation.trxId || rejectingDonation.referenceNumber) && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">TrxID:</span>
                    <span className="font-bold text-amber-600">{rejectingDonation.trxId || rejectingDonation.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700 dark:text-stone-300">
                  {isBn ? 'বাতিলের কারণ:' : 'Reason for rejection:'}
                </label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={e => setRejectionReasonInput(e.target.value)}
                  placeholder={isBn ? 'যেমন: ভুয়া TrxID / একাউন্টে টাকা পাওয়া যায়নি' : 'e.g. Invalid TrxID'}
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    isBn ? 'ভুয়া TrxID' : 'Invalid TrxID',
                    isBn ? 'টাকা জমা হয়নি' : 'Payment not received',
                    isBn ? 'পরিমাণের অমিল' : 'Amount mismatch',
                  ].map(quickReason => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() => setRejectionReasonInput(quickReason)}
                      className="px-2 py-0.5 text-[11px] rounded bg-stone-100 hover:bg-stone-200 dark:bg-emerald-900/50 text-stone-600 dark:text-stone-300 cursor-pointer"
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-emerald-800">
              <button
                type="button"
                onClick={() => setRejectingDonation(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-emerald-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40"
              >
                {isBn ? 'বাতিল করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

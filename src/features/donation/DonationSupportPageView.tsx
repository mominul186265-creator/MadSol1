import React, { useState } from 'react';
import {
  HeartHandshake,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Building,
  Gift,
  Sparkles,
  Receipt,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
  X,
  FileText,
  BadgeCheck,
  Info,
  Search,
  Clock,
  AlertTriangle,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, Donation } from '../../types/finance';

interface DonationSupportPageViewProps {
  onBack?: () => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];

// Bengali number converter
const toBengaliNumber = (num: string | number) => {
  const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (w) => bnNumbers[parseInt(w, 10)]);
};

export const DonationSupportPageView: React.FC<DonationSupportPageViewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { funds, addDonation, getDonationsByQuery, donations } = useFinance();

  const [activeTab, setActiveTab] = useState<'quick' | 'funds' | 'verify'>('quick');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [selectedFundId, setSelectedFundId] = useState(funds[0]?.id || 'lillah');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_banking');
  const [channelName, setChannelName] = useState<'bkash' | 'nagad'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [note, setNote] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Tab 3: Verification search state
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [searchedDonations, setSearchedDonations] = useState<Donation[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Success Receipt Modal state
  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    receiptNumber: string;
    amount: number;
    fundName: string;
    donorName: string;
    date: string;
    trxId?: string;
    channelName?: string;
    status: 'pending' | 'verified' | 'rejected';
    verifiedBy?: string;
    verifiedAt?: string;
    rejectionReason?: string;
  } | null>(null);

  // Copy handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const getEffectiveAmount = (): number => {
    if (customAmount && Number(customAmount) > 0) {
      return Number(customAmount);
    }
    return selectedAmount || 500;
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const finalAmount = getEffectiveAmount();
    if (finalAmount <= 0) {
      setFormError(isBn ? 'অনুগ্রহ করে সঠিক অনুদানের পরিমাণ লিখুন।' : 'Please enter a valid amount.');
      return;
    }

    if (!trxId.trim()) {
      setFormError(isBn ? 'অনুগ্রহ করে বিকাশ বা নগদ থেকে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) লিখুন।' : 'Please enter the transaction ID (TrxID).');
      return;
    }

    const finalDonorName = isAnonymous
      ? (isBn ? 'নাম প্রকাশে অনিচ্ছুক (বেনামী দান)' : 'Anonymous Donor')
      : (donorName.trim() || (isBn ? 'শুভাকাঙ্ক্ষী দাতা' : 'Well-wisher'));

    const finalMobile = donorMobile.trim() || (isAnonymous ? '01700000000' : '01970186265');
    const selectedFund = funds.find(f => f.id === selectedFundId) || funds[0];

    try {
      const res = await addDonation({
        donorId: `web_donor_${Date.now()}`,
        donorName: finalDonorName,
        donorMobile: finalMobile,
        category: selectedFund?.nameBn || 'সাধারণ দান',
        fundId: selectedFund?.id || 'lillah',
        amount: finalAmount,
        paymentMethod: paymentMethod,
        trxId: trxId.trim().toUpperCase(),
        channelName,
        referenceNumber: `TRX: ${trxId.trim().toUpperCase()} (${channelName})`,
        notes: note || (isBn ? 'অনলাইন অনুদান পোর্টাল থেকে প্রেরিত' : 'Sent from Online Donation Portal'),
        status: 'pending',
      });

      // Show receipt modal
      setReceiptModal({
        isOpen: true,
        receiptNumber: res.receiptNumber,
        amount: finalAmount,
        fundName: isBn ? (selectedFund?.nameBn || 'সাধারণ তহবিল') : (selectedFund?.nameEn || 'General Fund'),
        donorName: finalDonorName,
        date: new Date().toLocaleDateString('bn-BD'),
        trxId: trxId.trim().toUpperCase(),
        channelName,
        status: 'pending',
      });

      // Reset form
      setTrxId('');
      setNote('');
      if (!isAnonymous) {
        setDonorName('');
        setDonorMobile('');
      }
    } catch (err) {
      console.error('Failed to submit donation', err);
    }
  };

  const handleSearchVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySearchQuery.trim()) return;
    const results = getDonationsByQuery(verifySearchQuery);
    setSearchedDonations(results);
    setHasSearched(true);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      {/* Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
        </button>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isBn ? 'স্বীকৃত ও নিরাপদ অনুদান পোর্টাল' : 'Verified Donation Portal'}</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#0d5f57] text-white p-5 sm:p-7 shadow-xl shadow-emerald-950/20 border-2 border-emerald-400/40">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/60 text-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? 'সদকায়ে জারিয়াহ ও দ্বীনি খেদমত' : 'Sadaqah Jariyah'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isBn ? 'দ্বীনি কাজে দান ও সার্বিক সহযোগিতা' : 'Donation & Madrasah Support'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              {isBn
                ? 'এতিম ও অসচ্ছল শিক্ষার্থীদের খাবার, কিতাব এবং দ্বীনি শিক্ষা প্রসারে আপনার সদকা ও অনুদান সরাসরি মাদরাসায় পৌঁছে দিন।'
                : 'Directly support orphan and underprivileged students with food, education, and boarding facilities.'}
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
            <HeartHandshake className="w-8 h-8 text-amber-300 mb-1" />
            <span className="text-[11px] font-semibold text-emerald-100">
              {isBn ? 'আল্লাহর পথে দান' : 'For Allah\'s Sake'}
            </span>
          </div>
        </div>

        {/* Hadith / Quran Quote */}
        <div className="relative z-10 mt-4 pt-3 border-t border-emerald-400/30 flex items-start gap-2 text-xs text-emerald-100/80 italic">
          <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? '“যারা নিজেদের ধন-সম্পদ আল্লাহর পথে ব্যয় করে, তাদের উপমা একটি শস্যবীজের মতো, যা থেকে সাতটি শীষ জন্মায় এবং প্রতিটি শীষে থাকে একশত দানা।” — (সূরা আল-বাকারা: ২৬১)'
              : '“The example of those who spend their wealth in the way of Allah is like a seed of grain that sprouts seven ears; in every ear, a hundred grains.” — (Surah Al-Baqarah: 261)'}
          </span>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              id="donation-page-tab-quick"
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>{isBn ? 'অনলাইন অনুদান' : 'Donation Form'}</span>
            </button>

            <button
              type="button"
              id="donation-page-tab-funds"
              onClick={() => setActiveTab('funds')}
              className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'funds'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Building className="w-4 h-4 shrink-0" />
              <span>{isBn ? 'ফান্ডের খাতসমূহ' : 'Fund Sectors'}</span>
            </button>

            <button
              type="button"
              id="donation-page-tab-verify"
              onClick={() => setActiveTab('verify')}
              className={`py-2 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'verify'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isBn ? 'রসিদ ও অনুদান যাচাই' : 'Verify Donation'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Online Donation Form */}
        {activeTab === 'quick' && (
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmitDonation} className="space-y-4 max-w-2xl mx-auto">
              {/* Preset Amounts */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {isBn ? 'অনুদানের পরিমাণ নির্বাচন করুন (টাকা)' : 'Select Donation Amount (BDT)'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = selectedAmount === amt && !customAmount;
                    return (
                      <button
                        key={amt}
                        type="button"
                        id={`page-preset-amt-${amt}`}
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm scale-102'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        ৳{isBn ? toBengaliNumber(amt) : amt}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">৳</span>
                  <input
                    type="number"
                    id="page-donation-custom-amount-input"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder={isBn ? 'অন্য যেকোনো পরিমাণ লিখুন (যেমন: ২০০০)' : 'Enter custom amount'}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Fund Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {isBn ? 'ফান্ডের খাত নির্বাচন করুন' : 'Select Fund Category'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {funds.map((fund) => {
                    const isSelected = selectedFundId === fund.id;
                    return (
                      <button
                        key={fund.id}
                        type="button"
                        onClick={() => setSelectedFundId(fund.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">
                          {isBn ? fund.nameBn : fund.nameEn}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {fund.code}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'bkash', name: isBn ? 'বিকাশ' : 'bKash', color: 'bg-pink-600', method: 'mobile_banking' as PaymentMethod },
                    { id: 'nagad', name: isBn ? 'নগদ' : 'Nagad', color: 'bg-amber-600', method: 'mobile_banking' as PaymentMethod },
                  ].map((m) => {
                    const isSelected = channelName === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setChannelName(m.id as 'bkash' | 'nagad');
                          setPaymentMethod(m.method);
                        }}
                        className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${m.color} shrink-0`} />
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Account Reference Box */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {channelName === 'bkash' ? (isBn ? 'বিকাশ (Personal): ' : 'bKash: ') : (isBn ? 'নগদ (Personal): ' : 'Nagad: ')}
                    </span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-200 text-sm ml-1">
                      ০১৯৭০-১৮৬২৬৫
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('01970186265', 'form_number')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {copiedKey === 'form_number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'form_number' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি করুন' : 'Copy')}</span>
                </button>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="page-donation-anonymous-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="page-donation-anonymous-check" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  {isBn ? 'নাম প্রকাশে অনিচ্ছুক (বেনামী অনুদান)' : 'Donate Anonymously'}
                </label>
              </div>

              {/* Donor Info (if not anonymous) */}
              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'আপনার নাম' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      id="page-donor-name-input"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'Full name'}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <input
                      type="text"
                      id="page-donor-mobile-input"
                      value={donorMobile}
                      onChange={(e) => setDonorMobile(e.target.value)}
                      placeholder={isBn ? 'রসিদের জন্য মোবাইল নম্বর' : 'Mobile number for receipt'}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* TrxID & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>{isBn ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{isBn ? 'যাচাইয়ের জন্য আবশ্যক' : 'Required'}</span>
                  </label>
                  <input
                    type="text"
                    id="page-donation-trxid-input"
                    required
                    value={trxId}
                    onChange={(e) => {
                      setTrxId(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={isBn ? 'যেমন: 9J87AK2X3P' : 'e.g. 9J87AK2X3P'}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 dark:text-slate-100 uppercase font-bold tracking-wider"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {isBn
                      ? 'টাকা পাঠানোর পর বিকাশ বা নগদ মেসেজ/অ্যাপ থেকে প্রাপ্ত TrxID লিখুন। মাদরাসা কর্তৃপক্ষ মিলিয়ে ভেরিফাই করবে।'
                      : 'Enter TrxID from bKash/Nagad. The authority verifies this before final approval.'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'দোয়ার অনুরোধ বা মন্তব্য' : 'Dua Request or Note'}
                  </label>
                  <input
                    type="text"
                    id="page-donation-note-input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={isBn ? 'যেমন: পিতা-মাতার মাগফিরাতের জন্য' : 'e.g. For parents\' forgiveness'}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {isBn ? 'বিশেষ কোনো দোয়ার অনুরোধ থাকলে লিখতে পারেন।' : 'Optional dua request or comments.'}
                  </p>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="page-submit-donation-btn"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-98 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <HeartHandshake className="w-5 h-5 text-amber-300" />
                <span>
                  {isBn
                    ? `৳${toBengaliNumber(getEffectiveAmount())} অনুদান নিশ্চিত করুন`
                    : `Confirm Donation of ৳${getEffectiveAmount()}`}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Fund Sectors */}
        {activeTab === 'funds' && (
          <div className="p-4 sm:p-6 space-y-3 max-w-2xl mx-auto">
            <div className="text-center mb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isBn ? 'সদকা ও অনুদানের বিভিন্ন খাতসমূহ' : 'Fund Sectors & Causes'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'আপনার অনুদান শরিয়তসম্মতভাবে সুনির্দিষ্ট খাতে ব্যয় করা হয়'
                  : 'Your donations are distributed transparently as per Shariah'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {funds.map((fund) => (
                <div
                  key={fund.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {isBn ? fund.nameBn : fund.nameEn}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {fund.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {fund.description || (isBn ? 'দ্বীনি শিক্ষা ও শিক্ষার্থীদের সার্বিক কল্যাণে ব্যয়িত তহবিল।' : 'Dedicated fund for students.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFundId(fund.id);
                      setActiveTab('quick');
                    }}
                    className="w-full py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isBn ? 'এই খাতে দান করুন' : 'Donate to this Fund'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Receipt & Verification */}
        {activeTab === 'verify' && (
          <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'অনুদান ও রসিদ সত্যতা যাচাই' : 'Verify Donation & Receipt'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                {isBn
                  ? 'আপনার দেওয়া অনুদান মাদরাসা কর্তৃপক্ষ যাচাই করে অনুমোদন করেছে কি না তা রসিদ নম্বর, TrxID বা মোবাইল নম্বর দিয়ে এখনই চেক করুন।'
                  : 'Check whether your donation has been verified and approved by the madrasa administration.'}
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchVerification} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={verifySearchQuery}
                  onChange={(e) => setVerifySearchQuery(e.target.value)}
                  placeholder={isBn ? 'রসিদ নং (যেমন: MDS-DN-2026-000004), TrxID বা মোবাইল...' : 'Receipt No, TrxID or Mobile...'}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>{isBn ? 'যাচাই করুন' : 'Verify'}</span>
              </button>
            </form>

            {/* Quick Suggestions */}
            {!hasSearched && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <span className="font-semibold text-slate-600 dark:text-slate-300 block text-[11px]">
                  {isBn ? '💡 কীভাবে জানবেন আপনার অনুদান জমা হয়েছে?' : '💡 How verification works:'}
                </span>
                <ul className="text-slate-500 dark:text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                  <li>{isBn ? 'অনলাইনে ফর্ম পূরণ করার সাথে সাথেই এটি ‘অপেক্ষমান যাচাই (Pending)’ হিসেবে নিবন্ধিত হয়।' : 'Submitting the form immediately marks it as Pending.'}</li>
                  <li>{isBn ? 'মাদরাসা অফিসের দায়িত্বপ্রাপ্ত কর্মকর্তা বিকাশ/নগদ ব্যালেন্স ও TrxID মিলিয়ে চূড়ান্ত অনুমোদন দেন।' : 'The authority checks the mobile banking statement against your TrxID.'}</li>
                  <li>{isBn ? 'অনুমোদনের পর এখানে ‘যাচাইকৃত (Verified)’ স্ট্যাটাস দেখাবে এবং অফিশিয়াল রসিদ প্রিন্ট করা যাবে।' : 'Once verified, status updates to Verified and the official receipt can be printed.'}</li>
                </ul>
              </div>
            )}

            {/* Results Display */}
            {hasSearched && (
              <div className="space-y-3 pt-2">
                {searchedDonations && searchedDonations.length > 0 ? (
                  searchedDonations.map((item) => {
                    const isVerified = item.status === 'verified';
                    const isRejected = item.status === 'rejected';
                    const isPending = !item.status || item.status === 'pending';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isVerified
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : isRejected
                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isBn ? 'রসিদ নম্বর' : 'Receipt No'}</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{item.receiptNumber}</span>
                          </div>
                          {/* Status Badge */}
                          <div>
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isBn ? 'যাচাইকৃত ও অনুমোদিত' : 'Verified'}
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                                <Clock className="w-3.5 h-3.5" />
                                {isBn ? 'অপেক্ষমান যাচাই' : 'Pending Verification'}
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                                <X className="w-3.5 h-3.5" />
                                {isBn ? 'বাতিলকৃত' : 'Rejected'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{isBn ? 'দাতার নাম' : 'Donor'}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.donorName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{isBn ? 'পরিমাণ' : 'Amount'}</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">৳{toBengaliNumber(item.amount)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{isBn ? 'খাত' : 'Fund'}</span>
                            <span className="text-slate-700 dark:text-slate-300">{item.category}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{isBn ? 'TrxID' : 'TrxID'}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{item.trxId || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Status Message Box */}
                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
                          {isVerified && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                                <p className="font-semibold">{isBn ? 'আলহামদুলিল্লাহ! আপনার অনুদানটি মাদরাসা কর্তৃপক্ষ যাচাই করে ফান্ডে জমা করেছে।' : 'Your donation has been verified and deposited into the fund.'}</p>
                                {item.verifiedBy && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isBn ? `যাচাইকারী: ${item.verifiedBy}` : `Verified by: ${item.verifiedBy}`}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setReceiptModal({
                                    isOpen: true,
                                    receiptNumber: item.receiptNumber,
                                    amount: item.amount,
                                    fundName: item.category,
                                    donorName: item.donorName,
                                    date: item.donationDate,
                                    trxId: item.trxId,
                                    channelName: item.channelName,
                                    status: 'verified',
                                    verifiedBy: item.verifiedBy,
                                    verifiedAt: item.verifiedAt,
                                  });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isBn ? 'রসিদ দেখুন ও প্রিন্ট' : 'View Receipt'}</span>
                              </button>
                            </div>
                          )}

                          {isPending && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                                {isBn
                                  ? 'আপনার ট্রানজেকশনটি মাদরাসা কর্তৃপক্ষের নিকট জমা আছে। মোবাইল ব্যাংকিং স্টেটমেন্ট চেক করে কর্তৃপক্ষ শীঘ্রই এটি চূড়ান্ত অনুমোদন দেবে।'
                                  : 'Your donation transaction is pending verification against mobile banking statements.'}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setReceiptModal({
                                    isOpen: true,
                                    receiptNumber: item.receiptNumber,
                                    amount: item.amount,
                                    fundName: item.category,
                                    donorName: item.donorName,
                                    date: item.donationDate,
                                    trxId: item.trxId,
                                    channelName: item.channelName,
                                    status: 'pending',
                                  });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{isBn ? 'প্রাথমিক রসিদ' : 'Provisional Receipt'}</span>
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <p className="text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed">
                              {isBn
                                ? `অনুদানটি অনুমোদন পায়নি (কারণ: ${item.rejectionReason || 'ভুয়া TrxID বা অ্যাকাউন্টে টাকা পাওয়া যায়নি'})। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।`
                                : `Donation was rejected. Reason: ${item.rejectionReason || 'Invalid TrxID'}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {isBn ? 'কোনো অনুদানের তথ্য পাওয়া যায়নি' : 'No donation record found'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      {isBn
                        ? 'অনুগ্রহ করে সঠিক রসিদ নম্বর, ট্রানজেকশন আইডি (TrxID) বা মোবাইল নম্বর দিয়ে পুনরায় অনুসন্ধান করুন।'
                        : 'Please check your Receipt Number, TrxID, or mobile number and search again.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable / Downloadable Receipt Modal */}
      {receiptModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-emerald-200 dark:border-emerald-800 shadow-2xl p-5 relative">
            <button
              type="button"
              onClick={() => setReceiptModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              {receiptModal.status === 'verified' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? 'যাচাইকৃত অফিশিয়াল রসিদ' : 'Verified Official Receipt'}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    {isBn ? 'আলহামদুলিল্লাহ! আপনার অনুদান কর্তৃপক্ষ কর্তৃক যাচাই ও অনুমোদিত।' : 'Your donation has been verified and approved.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? 'অনুদান জমা হয়েছে (যাচাই সাপেক্ষ)' : 'Donation Submitted (Pending Verification)'}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {isBn ? 'মাদরাসা কর্তৃপক্ষ TrxID মিলিয়ে চূড়ান্ত অনুমোদন দিলে এটি স্থায়ী হবে।' : 'Authority will verify against statement before final approval.'}
                  </p>
                </>
              )}
            </div>

            {/* Receipt Box */}
            <div className={`mt-4 p-4 rounded-2xl border space-y-2 text-xs ${
              receiptModal.status === 'verified'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'রসিদ নম্বর:' : 'Receipt No:'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receiptModal.receiptNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'ভেরিফিকেশন স্ট্যাটাস:' : 'Status:'}</span>
                {receiptModal.status === 'verified' ? (
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isBn ? 'যাচাইকৃত ও অনুমোদিত' : 'Verified'}
                  </span>
                ) : (
                  <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isBn ? 'অপেক্ষমান যাচাই (Pending)' : 'Pending'}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'দাতার নাম:' : 'Donor Name:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{receiptModal.donorName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'ফান্ডের খাত:' : 'Fund Category:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{receiptModal.fundName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'অনুদানের পরিমাণ:' : 'Amount:'}</span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  ৳{isBn ? toBengaliNumber(receiptModal.amount) : receiptModal.amount}
                </span>
              </div>
              {receiptModal.trxId && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'TrxID:'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{receiptModal.trxId}</span>
                </div>
              )}
              {receiptModal.verifiedBy && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{isBn ? 'যাচাইকারী কর্মকর্তা:' : 'Verified By:'}</span>
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">{receiptModal.verifiedBy}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isBn ? 'তারিখ:' : 'Date:'}</span>
                <span className="text-slate-700 dark:text-slate-300">{receiptModal.date}</span>
              </div>
            </div>

            {/* Status explanation notice */}
            {receiptModal.status === 'pending' && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  {isBn
                    ? 'মাদরাসা অফিসের দায়িত্বপ্রাপ্ত কর্মকর্তা স্টেটমেন্টের সাথে TrxID মিলিয়ে অনুমোদন সম্পন্ন করবেন। ‘রসিদ ও অনুদান যাচাই’ ট্যাবে গিয়ে আপনি যে কোনো সময় স্ট্যাটাস চেক করতে পারবেন।'
                    : 'The authority will verify your TrxID against the statement. You can track this in the Verify tab.'}
                </span>
              </div>
            )}

            {/* Dua */}
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 italic mt-3">
              {isBn
                ? '“আল্লাহ তাআলা আপনার এই দান কবুল করুন এবং দুনিয়া ও আখিরাতে উত্তম প্রতিদান দান করুন। আমীন।”'
                : '“May Allah accept your donation and grant you abundant rewards in both worlds. Ameen.”'}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isBn ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isBn ? 'সম্পন্ন' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

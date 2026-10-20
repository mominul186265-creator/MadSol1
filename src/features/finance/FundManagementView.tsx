import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { Fund } from '../../types/finance';
import {
  Layers,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Building2,
  Heart,
  BookOpen,
  DollarSign,
  TrendingUp,
  History,
} from 'lucide-react';

export const FundManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { funds, transactions, createFund, transferFunds } = useFinance();
  const { showToast } = useToast();

  const isBn = language === 'bn';

  // Modals
  const [isNewFundModalOpen, setIsNewFundModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // New Fund State
  const [fundNameBn, setFundNameBn] = useState('');
  const [fundNameEn, setFundNameEn] = useState('');
  const [fundType, setFundType] = useState<'general' | 'zakat' | 'lillah' | 'building' | 'welfare' | 'project'>('project');
  const [isRestricted, setIsRestricted] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [description, setDescription] = useState('');

  // Transfer State
  const [sourceFundId, setSourceFundId] = useState('general');
  const [targetFundId, setTargetFundId] = useState('building');
  const [transferAmount, setTransferAmount] = useState<number>(10000);
  const [transferReason, setTransferReason] = useState('');

  // Total in all funds
  const totalFundBalance = funds.reduce((s, f) => s + f.balance, 0);

  // Handle New Fund Submission
  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundNameBn) return;

    await createFund({
      nameBn: fundNameBn,
      nameEn: fundNameEn || fundNameBn,
      type: fundType,
      isRestricted: isRestricted || fundType === 'zakat' || fundType === 'lillah',
      balance: initialBalance,
      accountNumber: accountNumber || undefined,
      description: description || undefined,
      institutionId: '',
    });

    showToast(isBn ? 'নতুন তহবিল সফলভাবে তৈরি হয়েছে।' : 'New fund created successfully.', 'success');
    setIsNewFundModalOpen(false);
    setFundNameBn('');
    setFundNameEn('');
    setInitialBalance(0);
    setDescription('');
  };

  // Handle Inter-fund Transfer
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceFundId === targetFundId) {
      showToast(isBn ? 'উৎস এবং গন্তব্য তহবিল একই হতে পারে না।' : 'Source and target funds cannot be identical.', 'error');
      return;
    }

    const sourceFund = funds.find(f => f.id === sourceFundId);
    if (!sourceFund || sourceFund.balance < transferAmount) {
      showToast(isBn ? 'উৎস তহবিলে পর্যাপ্ত ব্যালেন্স নেই।' : 'Insufficient balance in source fund.', 'error');
      return;
    }

    // Strict Shariah Check: Prevent Zakat from being transferred to non-eligible building/general
    if (sourceFund.type === 'zakat' && targetFundId !== 'lillah') {
      const confirmed = window.confirm(
        isBn
          ? 'সতর্কতা: যাকাত তহবিলের অর্থ শরীয়াহ অনুযায়ী শুধুমাত্র নির্দিষ্ট খাতে ব্যবহার্য। আপনি কি এই স্থানান্তরে নিশ্চিত?'
          : 'Warning: Zakat funds are strictly restricted to eligible beneficiaries. Proceed?'
      );
      if (!confirmed) return;
    }

    try {
      await transferFunds(sourceFundId, targetFundId, transferAmount, transferReason);
      showToast(isBn ? 'তহবিল স্থানান্তর সফল হয়েছে।' : 'Fund transfer completed successfully.', 'success');
      setIsTransferModalOpen(false);
      setTransferReason('');
    } catch (err: any) {
      showToast(err.message || 'Transfer failed', 'error');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            {isBn ? 'স্বতন্ত্র তহবিল ও শরীয়াহ হিসাবরক্ষণ' : 'Dedicated Fund Architecture'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'তহবিল ব্যবস্থাপনা ও রূপরেখা' : 'Fund Management & Isolation'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'সাধারণ তহবিল, যাকাত, লিল্লাহ, ভবন নির্মাণ ও কর্মচারীদের ফান্ড আলাদা রাখা ও অনুমোদিত স্থানান্তর।'
              : 'Maintain strict fund separation, track distinct reserve balances, and manage inter-fund transfers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isBn ? 'তহবিল স্থানান্তর' : 'Inter-Fund Transfer'}
          </button>
          <button
            onClick={() => setIsNewFundModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন তহবিল তৈরি' : 'Create Fund'}
          </button>
        </div>
      </div>

      {/* Shariah Policy Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">{isBn ? 'শরীয়াহ বিধান ও তহবিল পৃথকীকরণ নীতিমালা:' : 'Shariah Fund Isolation Policy:'}</h4>
          <p className="mt-0.5 text-stone-700 dark:text-stone-300">
            {isBn
              ? 'যাকাত ও ফিতরা ফান্ডের অর্থ সাধারণ প্রশাসনিক বেতন বা অবকাঠামো নির্মাণে ব্যবহার করা নিষিদ্ধ। সিস্টেম এই তহবিলের ব্যালেন্স পৃথক খতিয়ানে সংরক্ষণ করে।'
              : 'Zakat & Fitra funds must not be commingled with General or Construction accounts. Each fund operates autonomously with its own audit ledger.'}
          </p>
        </div>
      </div>

      {/* Total Aggregation */}
      <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {isBn ? 'সকল তহবিলের মোট বর্তমান সঞ্চিতি' : 'Total Aggregate Fund Reserves'}
          </span>
          <div className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            ৳{totalFundBalance.toLocaleString()}
          </div>
        </div>
        <div className="text-xs text-stone-500 text-right">
          <div>{funds.length} {isBn ? 'টি সক্রিয় স্বতন্ত্র তহবিল' : 'distinct funds'}</div>
          <div className="text-emerald-600 font-medium mt-0.5">{isBn ? 'সর্বশেষ যাচাইকৃত হিসাব' : 'Verified balances'}</div>
        </div>
      </div>

      {/* Funds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {funds.map(fund => {
          const pct = totalFundBalance > 0 ? Math.round((fund.balance / totalFundBalance) * 100) : 0;
          return (
            <div
              key={fund.id}
              className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
                      {isBn ? fund.nameBn : fund.nameEn}
                    </h3>
                    <p className="text-xs text-stone-500">{fund.nameEn}</p>
                  </div>
                  {fund.isRestricted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                      <Lock className="w-3 h-3" />
                      {isBn ? 'শর্তযুক্ত' : 'Restricted'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      {isBn ? 'সাধারণ' : 'General'}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    ৳{fund.balance.toLocaleString()}
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-emerald-950 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                    <span>{isBn ? 'মোট রিজার্ভের:' : 'Share of reserve:'}</span>
                    <span className="font-mono font-bold">{pct}%</span>
                  </div>
                </div>

                {fund.description && (
                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 border-t border-stone-200 dark:border-emerald-800 pt-2">
                    {fund.description}
                  </p>
                )}

                {fund.accountNumber && (
                  <div className="mt-2 text-[11px] font-mono text-stone-400">
                    A/C: {fund.accountNumber}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  {fund.type}
                </span>
                <button
                  onClick={() => {
                    setSourceFundId(fund.id);
                    setIsTransferModalOpen(true);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  {isBn ? 'অর্থ স্থানান্তর →' : 'Transfer →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CREATE FUND */}
      {isNewFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'নতুন স্বতন্ত্র তহবিল তৈরি' : 'Create Dedicated Fund'}
            </h3>

            <form onSubmit={handleCreateFund} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'তহবিলের নাম (বাংলা):' : 'Fund Name (Bangla):'}</label>
                  <input
                    type="text"
                    required
                    value={fundNameBn}
                    onChange={e => setFundNameBn(e.target.value)}
                    placeholder="কিতাব ক্রয় তহবিল"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (English):' : 'Fund Name (English):'}</label>
                  <input
                    type="text"
                    value={fundNameEn}
                    onChange={e => setFundNameEn(e.target.value)}
                    placeholder="Book Purchase Fund"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'তহবিলের ধরন:' : 'Fund Type:'}</label>
                  <select
                    value={fundType}
                    onChange={e => setFundType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                  >
                    <option value="project">{isBn ? 'বিশেষ প্রকল্প (Project)' : 'Project'}</option>
                    <option value="general">{isBn ? 'সাধারণ (General)' : 'General'}</option>
                    <option value="welfare">{isBn ? 'কল্যাণ তহবিল (Welfare)' : 'Welfare'}</option>
                    <option value="building">{isBn ? 'উন্নয়ন ও নির্মাণ (Building)' : 'Building'}</option>
                    <option value="zakat">{isBn ? 'যাকাত (Zakat)' : 'Zakat'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'প্রারম্ভিক ব্যালেন্স (৳):' : 'Opening Balance:'}</label>
                  <input
                    type="number"
                    min={0}
                    value={initialBalance}
                    onChange={e => setInitialBalance(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ব্যাংক একাউন্ট নম্বর (যদি থাকে):' : 'Bank Account No:'}</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="Islami Bank A/C 2050..."
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'বিবরণ ও উদ্দেশ্য:' : 'Description & Policy:'}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={isBn ? 'তহবিলের উদ্দেশ্য ও ব্যয়ের নীতিমালা' : 'Description'}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="restrictedCheck"
                  checked={isRestricted}
                  onChange={e => setIsRestricted(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="restrictedCheck" className="text-stone-700 dark:text-stone-300 font-medium">
                  {isBn ? 'শরীয়াহ বা শর্তযুক্ত তহবিল (অন্য খাতে খরচ নিষিদ্ধ)' : 'Restricted Fund (Shariah compliant)'}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFundModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'তহবিল তৈরি করুন' : 'Create Fund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTER-FUND TRANSFER */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'তহবিল স্থানান্তর (Inter-Fund Transfer)' : 'Transfer Between Funds'}
            </h3>

            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isBn ? 'উৎস তহবিল (From):' : 'Source Fund:'}</label>
                <select
                  value={sourceFundId}
                  onChange={e => setSourceFundId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-medium"
                >
                  {funds.map(f => (
                    <option key={f.id} value={f.id}>
                      {isBn ? f.nameBn : f.nameEn} (ব্যালেন্স: ৳{f.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'গন্তব্য তহবিল (To):' : 'Target Fund:'}</label>
                <select
                  value={targetFundId}
                  onChange={e => setTargetFundId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-medium"
                >
                  {funds.map(f => (
                    <option key={f.id} value={f.id}>
                      {isBn ? f.nameBn : f.nameEn} (ব্যালেন্স: ৳{f.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'স্থানান্তরের পরিমাণ (৳):' : 'Transfer Amount (BDT):'}</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  className="w-full p-2.5 text-base font-bold font-mono rounded-lg border border-emerald-500 text-emerald-700 dark:text-emerald-300"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'স্থানান্তরের কারণ ও রেজুলেশন রেফারেন্স:' : 'Reason & Resolution:'}</label>
                <textarea
                  rows={2}
                  required
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder={isBn ? 'কমিটির রেজুলেশন নম্বর ও সিদ্ধান্ত' : 'Transfer justification'}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'স্থানান্তর কার্যকর করুন' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

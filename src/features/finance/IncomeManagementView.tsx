import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { IncomeCategory, PaymentMethod } from '../../types/finance';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  Paperclip,
  Ban,
  Eye,
  FileText,
  DollarSign,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export const IncomeManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    incomes,
    funds,
    incomeCategories,
    recordIncome,
    voidTransaction,
    addCustomCategory,
  } = useFinance();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [voidModalIncomeId, setVoidModalIncomeId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState<string | null>(null);

  // New Income Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('donation');
  const [amount, setAmount] = useState<number>(5000);
  const [fundId, setFundId] = useState('general');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [payerName, setPayerName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Aggregates
  const stats = useMemo(() => {
    const activeIncomes = incomes.filter(i => !i.isVoided);
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const total = activeIncomes.reduce((s, i) => s + i.amount, 0);
    const today = activeIncomes.filter(i => i.date === todayStr).reduce((s, i) => s + i.amount, 0);
    const thisMonth = activeIncomes.filter(i => i.date.startsWith(thisMonthStr)).reduce((s, i) => s + i.amount, 0);

    return { total, today, thisMonth };
  }, [incomes]);

  // Filtered List
  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      if (selectedFund !== 'all' && inc.fundId !== selectedFund) return false;
      if (selectedCategory !== 'all' && inc.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inc.description.toLowerCase().includes(q) ||
          (inc.payerName && inc.payerName.toLowerCase().includes(q)) ||
          (inc.referenceNumber && inc.referenceNumber.toLowerCase().includes(q)) ||
          inc.transactionNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incomes, selectedFund, selectedCategory, searchQuery]);

  // Handle Save
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !category) return;

    await recordIncome({
      date,
      category,
      amount,
      fundId,
      paymentMethod,
      payerName: payerName || undefined,
      referenceNumber: referenceNumber || undefined,
      description,
      attachmentUrl: attachmentName ? `/uploads/${attachmentName}` : undefined,
    });

    setIsAddModalOpen(false);
    // Reset
    setPayerName('');
    setReferenceNumber('');
    setDescription('');
    setAttachmentName('');
  };

  // Handle Void
  const handleConfirmVoid = async () => {
    if (!voidModalIncomeId || !voidReason.trim()) return;
    await voidTransaction(voidModalIncomeId, voidReason);
    setVoidModalIncomeId(null);
    setVoidReason('');
  };

  // Handle Add New Custom Category
  const handleSaveCustomCategory = () => {
    if (!newCatName.trim()) return;
    addCustomCategory('income', newCatName.trim());
    setCategory(newCatName.trim());
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Trx No', 'Date', 'Category', 'Fund', 'Payer', 'Payment Method', 'Amount', 'Reference', 'Description', 'Voided'];
    const rows = filteredIncomes.map(i => [
      i.transactionNumber,
      i.date,
      `"${i.category}"`,
      `"${funds.find(f => f.id === i.fundId)?.nameBn || i.fundId}"`,
      `"${i.payerName || '-'}"`,
      i.paymentMethod,
      i.amount,
      `"${i.referenceNumber || '-'}"`,
      `"${i.description}"`,
      i.isVoided ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MadSol_Income_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            {isBn ? 'আয় ও প্রাপ্তি হিসাব' : 'Income & Receipts Ledger'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'আয় ব্যবস্থাপনা (Income Management)' : 'Income Management'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'মাদ্রাসার যাবতীয় নিয়মিত ও বিশেষ আয়ের স্বচ্ছ হিসাব, ভাউচার সংযুক্তি ও তহবিলভিত্তিক ট্র্যাকিং।'
              : 'Record institutional receipts, track fund allocations, manage attachments, and audit entries.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            {isBn ? 'এক্সেল রিপোর্ট' : 'Export CSV'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন আয় যুক্ত করুন' : 'Record New Income'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সর্বমোট আদায়কৃত আয়' : 'Total Revenue Collected'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              ৳{stats.total.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'সকল সক্রিয় আয় হিসাব' : 'All active recorded income'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'চলতি মাসের আয়' : 'Current Month Income'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-300">
              ৳{stats.thisMonth.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'সেপ্টেম্বর ২০২৬' : 'September 2026'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'আজকের মোট আয়' : "Today's Collection"}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-300">
              ৳{stats.today.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'আজ নগদ ও ডিজিটাল জমা' : 'Receipts logged today'}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={isBn ? 'ট্রানজ্যাকশন নং, দাতা/প্রদানকারী, বিবরণ...' : 'Search by Trx, payer, description...'}
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
            {incomeCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedFund}
            onChange={e => setSelectedFund(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
          >
            <option value="all">{isBn ? 'সকল ফান্ড / তহবিল' : 'All Funds'}</option>
            {funds.map(f => (
              <option key={f.id} value={f.id}>
                {isBn ? f.nameBn : f.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
            <tr>
              <th className="p-3">ট্রানজ্যাকশন ও তারিখ</th>
              <th className="p-3">ক্যাটাগরি</th>
              <th className="p-3">তহবিল (Fund)</th>
              <th className="p-3">প্রদানকারী / দাতা</th>
              <th className="p-3">বিবরণ ও রেফারেন্স</th>
              <th className="p-3 text-right">পরিমাণ</th>
              <th className="p-3 text-center">ভাউচার</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
            {filteredIncomes.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-400">
                  {isBn ? 'কোনো আয়ের রেকর্ড পাওয়া যায়নি।' : 'No income records found.'}
                </td>
              </tr>
            ) : (
              filteredIncomes.map(inc => {
                const fund = funds.find(f => f.id === inc.fundId);
                return (
                  <tr
                    key={inc.id}
                    className={`hover:bg-stone-50/50 dark:hover:bg-emerald-900/20 ${
                      inc.isVoided ? 'opacity-50 line-through bg-stone-100/50 dark:bg-stone-900/30' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                        {inc.transactionNumber}
                      </div>
                      <div className="text-[10px] text-stone-400">{inc.date}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-medium">
                        {inc.category}
                      </span>
                    </td>
                    <td className="p-3 text-stone-700 dark:text-stone-300">
                      <div>{isBn ? fund?.nameBn : fund?.nameEn}</div>
                      {fund?.isRestricted && (
                        <span className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                          {isBn ? 'শর্তযুক্ত তহবিল' : 'Restricted'}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-stone-800 dark:text-stone-200">{inc.payerName || '-'}</div>
                      <div className="text-[10px] text-stone-400 uppercase">{inc.paymentMethod.replace('_', ' ')}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-600 dark:text-stone-400">
                      <div>{inc.description}</div>
                      {inc.referenceNumber && (
                        <div className="text-[10px] font-mono text-stone-400">Ref: {inc.referenceNumber}</div>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                      ৳{inc.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      {inc.attachmentUrl ? (
                        <button
                          onClick={() => setViewAttachmentUrl(inc.attachmentUrl || null)}
                          className="p-1 text-emerald-600 hover:text-emerald-800"
                          title={isBn ? 'ভাউচার দেখুন' : 'View Attachment'}
                        >
                          <Paperclip className="w-4 h-4 mx-auto" />
                        </button>
                      ) : (
                        <span className="text-stone-300 dark:text-stone-600">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {inc.isVoided ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                          {isBn ? 'বাতিলকৃত' : 'VOIDED'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {isBn ? 'সক্রিয়' : 'ACTIVE'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!inc.isVoided && (
                        <button
                          onClick={() => setVoidModalIncomeId(inc.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title={isBn ? 'এন্ট্রি বাতিল / রিভার্স করুন' : 'Void Entry'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* RECORD INCOME MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-emerald-950 dark:text-emerald-50">
                {isBn ? 'নতুন আয় লিপিবদ্ধ করুন' : 'Record New Income'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIncome} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'তারিখ:' : 'Date:'}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'আয়ের পরিমাণ (৳):' : 'Amount (BDT):'}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">{isBn ? 'আয়ের খাত (Category):' : 'Income Category:'}</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                    className="text-[11px] text-emerald-600 font-semibold underline"
                  >
                    {isAddingNewCat ? (isBn ? 'তালিকায় ফেরত' : 'Cancel') : (isBn ? '+ নতুন খাত যোগ করুন' : '+ Add Custom')}
                  </button>
                </div>

                {isAddingNewCat ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isBn ? 'খাতের নাম লিখুন' : 'Category name'}
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomCategory}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                    >
                      {isBn ? 'যোগ' : 'Add'}
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    {incomeCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'জমার তহবিল (Fund):' : 'Target Fund:'}</label>
                  <select
                    value={fundId}
                    onChange={e => setFundId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    {funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {isBn ? f.nameBn : f.nameEn} (বর্তমান: ৳{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
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
                    <option value="online">{isBn ? 'অনলাইন গেটওয়ে' : 'Online'}</option>
                    <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'প্রদানকারী / দাতা (Payer):' : 'Payer / Donor:'}</label>
                  <input
                    type="text"
                    placeholder={isBn ? 'যেমন: হাজী মো: আবদুল করিম' : 'Payer Name'}
                    value={payerName}
                    onChange={e => setPayerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'চেক / ট্রানজ্যাকশন রেফারেন্স:' : 'Trx Ref / Cheque No:'}</label>
                  <input
                    type="text"
                    placeholder="e.g. TrxID or Cheque No"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'বিবরণ:' : 'Description:'}</label>
                <textarea
                  rows={2}
                  required
                  placeholder={isBn ? 'আয়ের বিস্তারিত বিবরণ লিখুন' : 'Details'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ভাউচার / ব্যাংক রসিদ কপি (ঐচ্ছিক):' : 'Attachment Voucher:'}</label>
                <input
                  type="text"
                  placeholder="receipt_scan_001.pdf / voucher.jpg"
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'আয় সংরক্ষণ করুন' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOID TRANSACTION CONFIRMATION MODAL */}
      {voidModalIncomeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-red-300 dark:border-red-900 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <Ban className="w-6 h-6" />
              <h3 className="text-base font-bold font-serif">
                {isBn ? 'আয় এন্ট্রি বাতিল (Void Entry)' : 'Void Financial Record'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isBn
                ? 'আইনি ও হিসাবের নিয়ম অনুযায়ী এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে না, বরং "বাতিল" হিসেবে চিহ্নিত থাকবে এবং অডিট লগে কারণ সংরক্ষিত হবে।'
                : 'Under audit regulations, this transaction will not be purged; it will be marked as VOID and fund balances will reverse safely.'}
            </p>

            <div>
              <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-200">
                {isBn ? 'বাতিল করার কারণ (বাধ্যতামূলক):' : 'Reason for Cancellation (Required):'}
              </label>
              <textarea
                rows={2}
                required
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder={isBn ? 'যেমন: ভুলবশত দ্বৈত এন্ট্রি করা হয়েছিল' : 'Reason'}
                className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVoidModalIncomeId(null)}
                className="px-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-600"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={!voidReason.trim()}
                className="px-5 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
              >
                {isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTACHMENT PREVIEW MODAL */}
      {viewAttachmentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'সংযুক্ত ভাউচার / রসিদ কপি' : 'Voucher Attachment'}
            </h3>
            <div className="p-8 border-2 border-dashed border-stone-300 dark:border-emerald-800 rounded-xl bg-stone-50 dark:bg-emerald-900/20">
              <FileText className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
              <p className="font-mono text-xs text-stone-700 dark:text-stone-300">{viewAttachmentUrl}</p>
              <p className="text-[11px] text-stone-400 mt-1">
                {isBn ? 'সংরক্ষিত ফাইল প্রিভিউ' : 'Uploaded file voucher artifact'}
              </p>
            </div>
            <button
              onClick={() => setViewAttachmentUrl(null)}
              className="px-5 py-2 text-xs rounded-xl bg-emerald-600 text-white font-bold"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

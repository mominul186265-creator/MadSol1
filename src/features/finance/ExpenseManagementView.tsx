import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { ExpenseCategory, PaymentMethod } from '../../types/finance';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  Paperclip,
  Ban,
  FileText,
  DollarSign,
  Printer,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const ExpenseManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    expenses,
    funds,
    expenseCategories,
    recordExpense,
    voidTransaction,
    addCustomCategory,
  } = useFinance();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [voidModalExpenseId, setVoidModalExpenseId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState<string | null>(null);

  // New Expense Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('খাবার ও রেশন সামগ্রী');
  const [amount, setAmount] = useState<number>(3500);
  const [fundId, setFundId] = useState('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [vendorOrPayee, setVendorOrPayee] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [approvedBy, setApprovedBy] = useState('মুহতামিম / অধ্যক্ষ');
  const [attachmentName, setAttachmentName] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Aggregates
  const stats = useMemo(() => {
    const activeExpenses = expenses.filter(e => !e.isVoided);
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    const total = activeExpenses.reduce((s, e) => s + e.amount, 0);
    const today = activeExpenses.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
    const thisMonth = activeExpenses.filter(e => e.date.startsWith(thisMonthStr)).reduce((s, e) => s + e.amount, 0);

    return { total, today, thisMonth };
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (selectedFund !== 'all' && exp.fundId !== selectedFund) return false;
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          exp.description.toLowerCase().includes(q) ||
          (exp.vendorOrPayee && exp.vendorOrPayee.toLowerCase().includes(q)) ||
          (exp.referenceNumber && exp.referenceNumber.toLowerCase().includes(q)) ||
          exp.transactionNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [expenses, selectedFund, selectedCategory, searchQuery]);

  // Selected Fund for Validation
  const selectedFundObj = useMemo(() => {
    return funds.find(f => f.id === fundId);
  }, [funds, fundId]);

  // Handle Save Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !category) return;

    if (selectedFundObj && selectedFundObj.balance < amount) {
      if (!confirm(isBn ? 'সতর্কতা: নির্বাচিত তহবিলের ব্যালেন্স কম রয়েছে। আপনি কি ব্যয়টি নিশ্চিত করতে চান?' : 'Warning: Fund balance is lower than expense amount. Proceed?')) {
        return;
      }
    }

    await recordExpense({
      date,
      category,
      amount,
      fundId,
      paymentMethod,
      vendorOrPayee: vendorOrPayee || undefined,
      referenceNumber: referenceNumber || undefined,
      description,
      approvedBy,
      attachmentUrl: attachmentName ? `/uploads/${attachmentName}` : undefined,
    });

    setIsAddModalOpen(false);
    // Reset
    setVendorOrPayee('');
    setReferenceNumber('');
    setDescription('');
    setAttachmentName('');
  };

  // Handle Void
  const handleConfirmVoid = async () => {
    if (!voidModalExpenseId || !voidReason.trim()) return;
    await voidTransaction(voidModalExpenseId, voidReason);
    setVoidModalExpenseId(null);
    setVoidReason('');
  };

  // Handle Custom Category
  const handleSaveCustomCategory = () => {
    if (!newCatName.trim()) return;
    addCustomCategory('expense', newCatName.trim());
    setCategory(newCatName.trim());
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Trx No', 'Date', 'Category', 'Fund', 'Vendor/Payee', 'Payment Method', 'Amount', 'Reference', 'Approved By', 'Voided'];
    const rows = filteredExpenses.map(e => [
      e.transactionNumber,
      e.date,
      `"${e.category}"`,
      `"${funds.find(f => f.id === e.fundId)?.nameBn || e.fundId}"`,
      `"${e.vendorOrPayee || '-'}"`,
      e.paymentMethod,
      e.amount,
      `"${e.referenceNumber || '-'}"`,
      `"${e.approvedBy || '-'}"`,
      e.isVoided ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MadSol_Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 text-xs font-semibold mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            {isBn ? 'ব্যয় ও খরচের লেজার' : 'Expenditure & Disbursement Ledger'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'ব্যয় ব্যবস্থাপনা (Expense Management)' : 'Expense Management'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'মাদ্রাসার বেতন, খাবার, বিদ্যুৎ ও মেরামতসহ সকল ব্যয়ের নিখুঁত হিসাব ও ভাউচার ট্র্যাকিং।'
              : 'Record institutional expenses, disburse funds, manage supplier bills, and ensure strict approval.'}
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
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন ব্যয় ভাউচার যুক্ত করুন' : 'Record New Expense'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সর্বমোট কার্যকর ব্যয়' : 'Total Expenditures'}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ৳{stats.total.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'অনুমোদিত মোট ব্যয়' : 'All active recorded expenses'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'চলতি মাসের ব্যয়' : 'Current Month Expense'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300">
              ৳{stats.thisMonth.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'সেপ্টেম্বর ২০২৬' : 'September 2026'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'আজকের মোট খরচ' : "Today's Expense"}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-300">
              ৳{stats.today.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'আজ পরিশোধিত ভাউচার' : 'Expenses paid today'}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={isBn ? 'ভাউচার নং, ভেন্ডর/দোকান, খরচ বিবরণ...' : 'Search by voucher, vendor, details...'}
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
            <option value="all">{isBn ? 'সকল খাতের ব্যয়' : 'All Categories'}</option>
            {expenseCategories.map(c => (
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

      {/* Expense Table */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
            <tr>
              <th className="p-3">ভাউচার ও তারিখ</th>
              <th className="p-3">ব্যয়ের খাত</th>
              <th className="p-3">পরিশোধিত ফান্ড</th>
              <th className="p-3">ভেন্ডর / গ্রহীতা</th>
              <th className="p-3">বিবরণ ও অনুমোদন</th>
              <th className="p-3 text-right">পরিমাণ</th>
              <th className="p-3 text-center">ভাউচার কপি</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-400">
                  {isBn ? 'কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।' : 'No expense records found.'}
                </td>
              </tr>
            ) : (
              filteredExpenses.map(exp => {
                const fund = funds.find(f => f.id === exp.fundId);
                return (
                  <tr
                    key={exp.id}
                    className={`hover:bg-stone-50/50 dark:hover:bg-emerald-900/20 ${
                      exp.isVoided ? 'opacity-50 line-through bg-stone-100/50 dark:bg-stone-900/30' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-mono font-bold text-rose-900 dark:text-rose-200">
                        {exp.transactionNumber}
                      </div>
                      <div className="text-[10px] text-stone-400">{exp.date}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-medium">
                        {exp.category}
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
                      <div className="font-medium text-stone-800 dark:text-stone-200">{exp.vendorOrPayee || '-'}</div>
                      <div className="text-[10px] text-stone-400 uppercase">{exp.paymentMethod.replace('_', ' ')}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-600 dark:text-stone-400">
                      <div>{exp.description}</div>
                      {exp.approvedBy && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400">অনুমোদন: {exp.approvedBy}</div>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ৳{exp.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      {exp.attachmentUrl ? (
                        <button
                          onClick={() => setViewAttachmentUrl(exp.attachmentUrl || null)}
                          className="p-1 text-emerald-600 hover:text-emerald-800"
                          title={isBn ? 'ভাউচার কপি দেখুন' : 'View Attachment'}
                        >
                          <Paperclip className="w-4 h-4 mx-auto" />
                        </button>
                      ) : (
                        <span className="text-stone-300 dark:text-stone-600">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {exp.isVoided ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                          {isBn ? 'বাতিলকৃত' : 'VOIDED'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {isBn ? 'অনুমোদিত' : 'APPROVED'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {!exp.isVoided && (
                        <button
                          onClick={() => setVoidModalExpenseId(exp.id)}
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

      {/* RECORD EXPENSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-emerald-950 dark:text-emerald-50">
                {isBn ? 'নতুন ব্যয় ভাউচার লিপিবদ্ধ করুন' : 'Record New Expense Voucher'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
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
                  <label className="block font-bold mb-1">{isBn ? 'ব্যয়ের পরিমাণ (৳):' : 'Amount (BDT):'}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">{isBn ? 'ব্যয়ের খাত (Category):' : 'Expense Category:'}</label>
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
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পরিশোধের তহবিল (Fund):' : 'Disbursement Fund:'}</label>
                  <select
                    value={fundId}
                    onChange={e => setFundId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    {funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {isBn ? f.nameBn : f.nameEn} (ব্যালেন্স: ৳{f.balance.toLocaleString()})
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
                    <option value="bank">{isBn ? 'ব্যাংক চেক / ট্রান্সফার' : 'Bank'}</option>
                    <option value="mobile_banking">{isBn ? 'মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile'}</option>
                    <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ভেন্ডর / প্রাপকের নাম:' : 'Vendor / Payee Name:'}</label>
                  <input
                    type="text"
                    placeholder={isBn ? 'যেমন: মেসার্স রহিম ব্রাদার্স' : 'Vendor'}
                    value={vendorOrPayee}
                    onChange={e => setVendorOrPayee(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'বিল / ভাউচার রেফারেন্স:' : 'Bill / Voucher Ref:'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Bill #1042"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'অনুমোদনকারী কর্তৃপক্ষ:' : 'Approved By:'}</label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={e => setApprovedBy(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ব্যয়ের বিস্তারিত বিবরণ:' : 'Description:'}</label>
                <textarea
                  rows={2}
                  required
                  placeholder={isBn ? 'ব্যয়ের কারণ ও পণ্য/সেবার বিবরণ' : 'Description'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'স্ক্যান ভাউচার বা ক্যাশ মেমো (ঐচ্ছিক):' : 'Attachment Voucher:'}</label>
                <input
                  type="text"
                  placeholder="memo_scan_food_sept.pdf"
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isBn ? 'ব্যয় ভাউচার সেভ করুন' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOID CONFIRMATION MODAL */}
      {voidModalExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-red-300 dark:border-red-900 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <Ban className="w-6 h-6" />
              <h3 className="text-base font-bold font-serif">
                {isBn ? 'ব্যয় ভাউচার বাতিল (Void Voucher)' : 'Void Expense Record'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isBn
                ? 'আইনি ও হিসাবের নিয়ম অনুযায়ী এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে না, বরং "বাতিল" হিসেবে চিহ্নিত থাকবে এবং তহবিল ব্যালেন্স সমন্বয় হবে।'
                : 'Under audit regulations, this transaction will not be purged; it will be marked as VOID and the fund balance will be restored.'}
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
                placeholder={isBn ? 'যেমন: বিলের হিসাবে গড়মিল থাকায় বাতিল' : 'Reason'}
                className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVoidModalExpenseId(null)}
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
              {isBn ? 'সংযুক্ত ভাউচার / ক্যাশ মেমো' : 'Voucher Attachment'}
            </h3>
            <div className="p-8 border-2 border-dashed border-stone-300 dark:border-emerald-800 rounded-xl bg-stone-50 dark:bg-emerald-900/20">
              <FileText className="w-12 h-12 mx-auto text-rose-600 mb-2" />
              <p className="font-mono text-xs text-stone-700 dark:text-stone-300">{viewAttachmentUrl}</p>
              <p className="text-[11px] text-stone-400 mt-1">
                {isBn ? 'সংরক্ষিত ক্যাশ মেমো বা বিল কপি' : 'Uploaded supplier memo artifact'}
              </p>
            </div>
            <button
              onClick={() => setViewAttachmentUrl(null)}
              className="px-5 py-2 text-xs rounded-xl bg-rose-600 text-white font-bold"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

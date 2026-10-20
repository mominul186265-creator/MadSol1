import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
  Gift,
  AlertCircle,
  Calendar,
  Layers,
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Ban,
  ShieldCheck,
} from 'lucide-react';

export const AccountsDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const {
    transactions,
    incomes,
    expenses,
    funds,
    studentFees,
    donations,
    voidTransaction,
  } = useFinance();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [fundFilter, setFundFilter] = useState<string>('all');
  const [voidModalTrxId, setVoidModalTrxId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Primary Accounts Metrics
  const metrics = useMemo(() => {
    const activeIncomes = incomes.filter(i => !i.isVoided);
    const activeExpenses = expenses.filter(e => !e.isVoided);
    const activeDonations = donations.filter(d => !d.isVoided);

    const totalIncome = activeIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = activeExpenses.reduce((s, e) => s + e.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const totalDonation = activeDonations.reduce((s, d) => s + d.amount, 0);
    const totalDue = studentFees.reduce((s, sf) => s + sf.dueAmount, 0);

    const totalFundBalance = funds.reduce((s, f) => s + f.balance, 0);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      totalDonation,
      totalDue,
      totalFundBalance,
    };
  }, [incomes, expenses, donations, studentFees, funds]);

  // Filtered Ledger Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => {
      if (typeFilter !== 'all' && trx.type !== typeFilter) return false;
      if (fundFilter !== 'all' && trx.fundId !== fundFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          trx.transactionNumber.toLowerCase().includes(q) ||
          trx.description.toLowerCase().includes(q) ||
          (trx.counterparty && trx.counterparty.toLowerCase().includes(q)) ||
          trx.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, typeFilter, fundFilter, searchQuery]);

  // Void execution
  const handleConfirmVoid = async () => {
    if (!voidModalTrxId || !voidReason.trim()) return;
    await voidTransaction(voidModalTrxId, voidReason);
    setVoidModalTrxId(null);
    setVoidReason('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Transaction No', 'Date', 'Type', 'Category', 'Fund', 'Counterparty', 'Inflow', 'Outflow', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.transactionNumber,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${funds.find(f => f.id === t.fundId)?.nameBn || t.fundId}"`,
      `"${t.counterparty || '-'}"`,
      t.type === 'income' ? t.amount : 0,
      t.type === 'expense' ? t.amount : 0,
      t.isVoided ? 'VOIDED' : 'ACTIVE',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `General_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <Scale className="w-3.5 h-3.5" />
            {isBn ? 'কেন্দ্রীয় হিসাব ও ব্যালেন্স শিট' : 'General Accounts & Ledger'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'অ্যাকাউন্টস ড্যাশবোর্ড ও সাধারণ খতিয়ান' : 'Accounts Dashboard & Ledger'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'মাদ্রাসার সকল আর্থিক প্রবাহ, তহবিলের সঞ্চিতি, সামগ্রিক লাভ/ঘাটতি ও সম্পূর্ণ খতিয়ান পর্যবেক্ষণ।'
              : 'Complete financial overview, cash flow analytics, fund balances, and immutable transaction ledger.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            {isBn ? 'লেজার এক্সপোর্ট' : 'Export Ledger'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {isBn ? 'প্রিন্ট বিবরণী' : 'Print Statement'}
          </button>
        </div>
      </div>

      {/* 5 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সর্বমোট আয়' : 'Total Income'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              ৳{metrics.totalIncome.toLocaleString()}
            </span>
            <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{isBn ? 'সকল সক্রিয় প্রাপ্তি' : 'All revenues'}</span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সর্বমোট ব্যয়' : 'Total Expenses'}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ৳{metrics.totalExpense.toLocaleString()}
            </span>
            <div className="text-[10px] text-rose-600 flex items-center gap-1 mt-1">
              <ArrowDownLeft className="w-3 h-3" />
              <span>{isBn ? 'অনুমোদিত ব্যয়' : 'Approved bills'}</span>
            </div>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'নীট ব্যালেন্স / উদ্বৃত্ত' : 'Net Balance'}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-mono ${metrics.netBalance >= 0 ? 'text-sky-600 dark:text-sky-300' : 'text-red-600'}`}>
              ৳{metrics.netBalance.toLocaleString()}
            </span>
            <div className="text-[10px] text-stone-500 mt-1">
              {metrics.netBalance >= 0 ? (isBn ? 'আর্থিক উদ্বৃত্ত' : 'Surplus') : (isBn ? 'ঘাটতি' : 'Deficit')}
            </div>
          </div>
        </div>

        {/* Total Donation */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'মোট দান ও অনুদান' : 'Total Donations'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300">
              ৳{metrics.totalDonation.toLocaleString()}
            </span>
            <div className="text-[10px] text-amber-600 mt-1">
              {isBn ? 'যাকাত ও লিল্লাহ ফান্ডসহ' : 'Zakat & general gifts'}
            </div>
          </div>
        </div>

        {/* Outstanding Student Due */}
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'মোট বকেয়া ফি' : 'Total Fee Due'}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">
              ৳{metrics.totalDue.toLocaleString()}
            </span>
            <div className="text-[10px] text-stone-500 mt-1">
              {isBn ? 'অনাদায়ী মোট অর্থ' : 'Pending student fees'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics / Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fund Reserve Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'তহবিলভিত্তিক ব্যালেন্স বণ্টন (Fund Distribution)' : 'Fund Balances & Liquidity'}
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
              মোট: ৳{metrics.totalFundBalance.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {funds.slice(0, 6).map(f => {
              const pct = metrics.totalFundBalance > 0 ? Math.round((f.balance / metrics.totalFundBalance) * 100) : 0;
              return (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-emerald-900/20 border border-stone-200 dark:border-emerald-800/80"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                        {isBn ? f.nameBn : f.nameEn}
                      </p>
                      {f.isRestricted && (
                        <span className="text-[9px] text-amber-600 font-medium">
                          {isBn ? 'শর্তযুক্ত' : 'Restricted'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-stone-500">{pct}%</span>
                  </div>

                  <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-2">
                    ৳{f.balance.toLocaleString()}
                  </div>

                  <div className="w-full bg-stone-200 dark:bg-emerald-950 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Audit / Safety Health */}
        <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
                {isBn ? 'অডিট ও লেনদেন সুরক্ষা' : 'Audit Trail & Compliance'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isBn
                ? 'মাদ্রাসার প্রতিটি লেনদেন অপরিবর্তনযোগ্যভাবে রেকর্ড করা হয়। কোনো ভাউচার মুছে ফেলার অনুমতি নেই; সকল পরিবর্তন রিভার্সাল ও অডিট লগে সুরক্ষিত।'
                : 'Double-entry immutability enforced. Cancelled records create reversal logs preserving complete audit integrity.'}
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 dark:bg-emerald-900/30">
                <span className="text-stone-500">{isBn ? 'মোট সফল এন্ট্রি:' : 'Active Transactions:'}</span>
                <span className="font-mono font-bold">{transactions.filter(t => !t.isVoided).length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 dark:bg-emerald-900/30">
                <span className="text-stone-500">{isBn ? 'বাতিলকৃত এন্ট্রি (Audit Log):' : 'Voided Entries:'}</span>
                <span className="font-mono font-bold text-red-600">{transactions.filter(t => t.isVoided).length}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 dark:bg-emerald-900/30">
                <span className="text-stone-500">{isBn ? 'তহবিল সংখ্যা:' : 'Total Funds:'}</span>
                <span className="font-mono font-bold">{funds.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 text-[11px] text-stone-400 text-center">
            {isBn ? 'সিস্টেম স্ট্যাটাস: ১০০% সিঙ্ক ও সুরক্ষিত' : 'System status: 100% Synchronized'}
          </div>
        </div>
      </div>

      {/* FILTER & GENERAL LEDGER TABLE */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={isBn ? 'ট্রানজ্যাকশন আইডি, বিবরণ, গ্রহীতা বা খাত...' : 'Search ledger by Trx, detail, party...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
            >
              <option value="all">{isBn ? 'সকল লেনদেন' : 'All Types'}</option>
              <option value="income">{isBn ? 'আয় (Income)' : 'Income'}</option>
              <option value="expense">{isBn ? 'ব্যয় (Expense)' : 'Expense'}</option>
              <option value="transfer">{isBn ? 'তহবিল ট্রান্সফার' : 'Transfer'}</option>
            </select>

            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
            >
              <option value="all">{isBn ? 'সকল তহবিল' : 'All Funds'}</option>
              {funds.map(f => (
                <option key={f.id} value={f.id}>{isBn ? f.nameBn : f.nameEn}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
              <tr>
                <th className="p-3">ট্রানজ্যাকশন আইডি ও তারিখ</th>
                <th className="p-3">ধরন</th>
                <th className="p-3">খাত (Category)</th>
                <th className="p-3">তহবিল (Fund)</th>
                <th className="p-3">বিবরণ ও পক্ষ</th>
                <th className="p-3 text-right">জমা / আয় (+)</th>
                <th className="p-3 text-right">খরচ / ব্যয় (-)</th>
                <th className="p-3 text-center">স্ট্যাটাস</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400">
                    {isBn ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি।' : 'No transactions recorded.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(trx => {
                  const fund = funds.find(f => f.id === trx.fundId);
                  const isIncome = trx.type === 'income';
                  const isExpense = trx.type === 'expense';
                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-stone-50/50 dark:hover:bg-emerald-900/20 ${
                        trx.isVoided ? 'opacity-50 line-through bg-stone-100/50 dark:bg-stone-900/30' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-mono font-bold text-stone-800 dark:text-stone-100">
                          {trx.transactionNumber}
                        </div>
                        <div className="text-[10px] text-stone-400">{trx.date}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              : isExpense
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                          }`}
                        >
                          {trx.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-stone-800 dark:text-stone-200">
                        {trx.category}
                      </td>
                      <td className="p-3 text-stone-600 dark:text-stone-400">
                        {isBn ? fund?.nameBn : fund?.nameEn}
                      </td>
                      <td className="p-3 max-w-xs truncate text-stone-600 dark:text-stone-300">
                        <div>{trx.description}</div>
                        {trx.counterparty && (
                          <div className="text-[10px] text-stone-400">পক্ষ: {trx.counterparty}</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                        {isIncome ? `+৳${trx.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                        {isExpense ? `-৳${trx.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {trx.isVoided ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                            {isBn ? 'বাতিল' : 'VOIDED'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            {isBn ? 'সক্রিয়' : 'ACTIVE'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!trx.isVoided && (
                          <button
                            onClick={() => setVoidModalTrxId(trx.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title={isBn ? 'এন্ট্রি বাতিল করুন' : 'Void Entry'}
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
      </div>

      {/* VOID CONFIRMATION MODAL */}
      {voidModalTrxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-red-300 dark:border-red-900 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Ban className="w-6 h-6" />
              <h3 className="text-base font-bold font-serif">
                {isBn ? 'লেনদেন বাতিল নিশ্চিতকরণ' : 'Confirm Transaction Cancellation'}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isBn
                ? 'আইনগত অডিট ট্রেইল বজায় রাখতে লেনদেন মুছে ফেলা হবে না; বরং এটি বাতিল এবং সংশ্লিষ্ট তহবিলের ব্যালেন্স বিপরীতকরণ (reverse) করা হবে।'
                : 'Auditing standards require reversal transactions instead of deletion. Balance will be reverted immediately.'}
            </p>

            <div>
              <label className="block text-xs font-bold mb-1 text-stone-700 dark:text-stone-200">
                {isBn ? 'বাতিলের কারণ:' : 'Reason for Cancellation:'}
              </label>
              <textarea
                rows={2}
                required
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder={isBn ? 'যথাযথ কারণ লিখুন' : 'Reason'}
                className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVoidModalTrxId(null)}
                className="px-4 py-2 text-xs rounded-xl border border-stone-300 text-stone-600"
              >
                {isBn ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={!voidReason.trim()}
                className="px-5 py-2 text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
              >
                {isBn ? 'বাতিল কার্যকর করুন' : 'Void Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

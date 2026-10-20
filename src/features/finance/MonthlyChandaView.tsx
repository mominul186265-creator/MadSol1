import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { ChandaMember, PaymentMethod } from '../../types/finance';
import {
  HeartHandshake,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Bell,
  Calendar,
  CreditCard,
  Printer,
  Download,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const MonthlyChandaView: React.FC = () => {
  const { language } = useLanguage();
  const {
    chandaMembers,
    funds,
    addChandaMember,
    recordChandaPayment,
    triggerChandaReminderEvent,
  } = useFinance();
  const { showToast } = useToast();

  const isBn = language === 'bn';

  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Collect Chanda Modal State
  const [collectModalMember, setCollectModalMember] = useState<ChandaMember | null>(null);
  const [chandaAmount, setChandaAmount] = useState<number>(0);
  const [chandaMethod, setChandaMethod] = useState<PaymentMethod>('cash');
  const [chandaFundId, setChandaFundId] = useState('general');
  const [chandaRef, setChandaRef] = useState('');
  const [chandaNotes, setChandaNotes] = useState('');
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberNameBn, setMemberNameBn] = useState('');
  const [memberNameEn, setMemberNameEn] = useState('');
  const [memberMobile, setMemberMobile] = useState('');
  const [memberAddress, setMemberAddress] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState<number>(1000);
  const [dueDay, setDueDay] = useState<number>(10);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalCommitted = chandaMembers.reduce((s, m) => s + m.monthlyAmount, 0);
    const totalCollected = chandaMembers.reduce((s, m) => s + m.totalPaid, 0);
    const totalDue = chandaMembers.reduce((s, m) => s + m.totalDue, 0);
    const activeCount = chandaMembers.filter(m => m.status !== 'inactive').length;

    return {
      totalCommitted,
      totalCollected,
      totalDue,
      activeCount,
    };
  }, [chandaMembers]);

  // Filtered List
  const filteredMembers = useMemo(() => {
    return chandaMembers.filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.memberNameBn.toLowerCase().includes(q) ||
          m.memberNameEn.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.mobile.includes(q)
        );
      }
      return true;
    });
  }, [chandaMembers, statusFilter, searchQuery]);

  // Handle Save New Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNameBn || !memberMobile || monthlyAmount <= 0) return;

    await addChandaMember({
      memberCode: `CH-${chandaMembers.length + 101}`,
      memberNameBn,
      memberNameEn: memberNameEn || memberNameBn,
      mobile: memberMobile,
      address: memberAddress,
      monthlyAmount,
      startMonth: selectedMonth,
      dueDay,
      status: 'due',
      totalPaid: 0,
      totalDue: monthlyAmount,
    });

    setIsAddModalOpen(false);
    setMemberNameBn('');
    setMemberNameEn('');
    setMemberMobile('');
    setMemberAddress('');
  };

  // Handle Open Collect Modal
  const handleOpenCollect = (member: ChandaMember) => {
    setCollectModalMember(member);
    setChandaAmount(member.monthlyAmount);
  };

  // Execute Collect Payment
  const handleConfirmCollect = async () => {
    if (!collectModalMember || chandaAmount <= 0) return;

    try {
      const receiptNumber = await recordChandaPayment(
        collectModalMember.id,
        selectedMonth,
        chandaAmount,
        chandaMethod,
        chandaFundId,
        chandaRef,
        chandaNotes
      );

      showToast(
        isBn
          ? `${collectModalMember.memberNameBn}-এর চাঁদা সফলভাবে জমা হয়েছে। রসিদ: ${receiptNumber}`
          : `Chanda recorded successfully. Receipt: ${receiptNumber}`,
        'success'
      );

      setCollectModalMember(null);
      setChandaRef('');
      setChandaNotes('');
    } catch (e: any) {
      showToast(isBn ? 'চাঁদা গ্রহণ ব্যর্থ হয়েছে।' : 'Failed to record chanda.', 'error');
    }
  };

  // Trigger Reminder
  const handleSendReminder = async (memberId: string, memberName: string) => {
    setSendingAlertId(memberId);
    try {
      await triggerChandaReminderEvent(memberId, selectedMonth);
      showToast(
        isBn
          ? `${memberName}-এর মোবাইলে মাসিক চাঁদার তাগাদা ইভেন্ট সফলভাবে পাঠানো হয়েছে।`
          : `Reminder sent to ${memberName}`,
        'success'
      );
    } catch (e) {
      showToast(isBn ? 'তাগাদা পাঠানো সম্ভব হয়নি' : 'Failed to send alert', 'error');
    } finally {
      setSendingAlertId(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            {isBn ? 'মাসিক চাঁদা ও শুভাকাঙ্ক্ষী ফান্ড' : 'Monthly Donor Subscription Scheme'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'মাসিক চাঁদা ব্যবস্থাপনা (Monthly Chanda)' : 'Monthly Chanda Management'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'মাদ্রাসার নিয়মিত শুভাকাঙ্ক্ষী ও আজীবন চাঁদা দাতাদের তালিকা, মাসিক কালেকশন ও তাগাদা ব্যবস্থাপনা।'
              : 'Track monthly recurring donors, collect monthly pledges, and send automated subscription alerts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-100 shadow-sm"
          >
            <option value="September 2026">সেপ্টেম্বর ২০২৬ (September 2026)</option>
            <option value="August 2026">আগস্ট ২০২৬ (August 2026)</option>
            <option value="July 2026">জুলাই ২০২৬ (July 2026)</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন চাঁদা সদস্য নিবন্ধন' : 'Add Chanda Member'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'মাসিক অঙ্গীকারকৃত মোট চাঁদা' : 'Monthly Pledged Total'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              ৳{summary.totalCommitted.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{summary.activeCount} {isBn ? 'জন নিয়মিত শুভাকাঙ্ক্ষী' : 'active supporters'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'আদায়কৃত মোট চাঁদা' : 'Total Collected'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-300">
              ৳{summary.totalCollected.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'জমা হওয়া চাঁদা' : 'All-time collected'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'অবশিষ্ট বকেয়া চাঁদা' : 'Pending Chanda'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              ৳{summary.totalDue.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'আদায়ের অপেক্ষায়' : 'Awaiting collection'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সদস্য সংখ্যা' : 'Active Members'}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-300">
              {summary.activeCount}
            </span>
            <span className="text-xs text-stone-500 ml-1">{isBn ? 'জন' : 'members'}</span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'সক্রিয় দাতা সদস্য' : 'Recurring subscribers'}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={isBn ? 'সদস্যের নাম, কোড বা মোবাইল...' : 'Search member, code or mobile...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
        >
          <option value="all">{isBn ? 'সকল অবস্থা' : 'All Status'}</option>
          <option value="paid">{isBn ? 'পরিশোধিত (Paid)' : 'Paid'}</option>
          <option value="due">{isBn ? 'বকেয়া (Due)' : 'Due'}</option>
          <option value="partial">{isBn ? 'আংশিক (Partial)' : 'Partial'}</option>
        </select>
      </div>

      {/* Chanda Members Table */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
            <tr>
              <th className="p-3">সদস্য কোড ও নাম</th>
              <th className="p-3">মোবাইল ও ঠিকানা</th>
              <th className="p-3">জমার দিন</th>
              <th className="p-3 text-right">মাসিক চাঁদা</th>
              <th className="p-3 text-right">মোট জমা</th>
              <th className="p-3 text-right">বকেয়া</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
            {filteredMembers.map(m => (
              <tr key={m.id} className="hover:bg-stone-50/50 dark:hover:bg-emerald-900/20">
                <td className="p-3">
                  <div className="font-bold text-emerald-950 dark:text-emerald-100">{m.memberNameBn}</div>
                  <div className="text-[10px] text-stone-500 font-mono">{m.memberCode}</div>
                </td>
                <td className="p-3 text-stone-600 dark:text-stone-300">
                  <div className="font-mono">{m.mobile}</div>
                  <div className="text-[10px] text-stone-400">{m.address || '-'}</div>
                </td>
                <td className="p-3 text-stone-600 dark:text-stone-300">
                  প্রতি মাসের {m.dueDay} তারিখ
                </td>
                <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  ৳{m.monthlyAmount.toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono text-emerald-600">
                  ৳{m.totalPaid.toLocaleString()}
                </td>
                <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                  ৳{m.totalDue.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : m.status === 'partial'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleSendReminder(m.id, m.memberNameBn)}
                      disabled={sendingAlertId === m.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition"
                      title={isBn ? 'চাঁদা প্রদানের তাগাদা পাঠান' : 'Send Reminder'}
                    >
                      <Bell className="w-3 h-3" />
                      {sendingAlertId === m.id ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'তাগাদা' : 'Alert')}
                    </button>

                    <button
                      onClick={() => handleOpenCollect(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      <CreditCard className="w-3 h-3" />
                      {isBn ? 'চাঁদা আদায়' : 'Collect'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: COLLECT CHANDA */}
      {collectModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
                  {isBn ? 'মাসিক চাঁদা গ্রহণ ও রসিদ তৈরি' : 'Collect Monthly Chanda'}
                </h3>
                <p className="text-xs text-stone-500">
                  {collectModalMember.memberNameBn} ({collectModalMember.mobile}) - {selectedMonth}
                </p>
              </div>
              <button onClick={() => setCollectModalMember(null)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isBn ? 'চাঁদার পরিমাণ (৳):' : 'Amount (BDT):'}</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={chandaAmount}
                  onChange={e => setChandaAmount(Number(e.target.value))}
                  className="w-full p-2.5 text-base font-bold font-mono rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}</label>
                  <select
                    value={chandaMethod}
                    onChange={e => setChandaMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                  >
                    <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                    <option value="mobile_banking">{isBn ? 'মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile Banking'}</option>
                    <option value="bank">{isBn ? 'ব্যাংক' : 'Bank'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'জমার তহবিল:' : 'Deposit Fund:'}</label>
                  <select
                    value={chandaFundId}
                    onChange={e => setChandaFundId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                  >
                    {funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {isBn ? f.nameBn : f.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ট্রানজ্যাকশন রেফারেন্স (ঐচ্ছিক):' : 'Trx Reference:'}</label>
                <input
                  type="text"
                  placeholder="bKash TrxID or Cheque"
                  value={chandaRef}
                  onChange={e => setChandaRef(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'বিশেষ নোট বা মন্তব্য:' : 'Notes:'}</label>
                <input
                  type="text"
                  placeholder={isBn ? 'মন্তব্য' : 'Notes'}
                  value={chandaNotes}
                  onChange={e => setChandaNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectModalMember(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCollect}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'চাঁদা গ্রহণ ও রসিদ তৈরি' : 'Collect & Issue Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHANDA MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'নতুন চাঁদা সদস্য নিবন্ধন' : 'Register New Chanda Member'}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'সদস্যের নাম (বাংলা):' : 'Name (Bangla):'}</label>
                  <input
                    type="text"
                    required
                    value={memberNameBn}
                    onChange={e => setMemberNameBn(e.target.value)}
                    placeholder="হাজী মোহাম্মদ জসীম উদ্দিন"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (English):' : 'Name (English):'}</label>
                  <input
                    type="text"
                    value={memberNameEn}
                    onChange={e => setMemberNameEn(e.target.value)}
                    placeholder="Haji Mohammad Jasim"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</label>
                  <input
                    type="text"
                    required
                    value={memberMobile}
                    onChange={e => setMemberMobile(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'মাসের জমার দিন:' : 'Due Day:'}</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={dueDay}
                    onChange={e => setDueDay(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'মাসিক নির্ধারিত চাঁদা (৳):' : 'Monthly Pledge Amount (BDT):'}</label>
                <input
                  type="number"
                  min={50}
                  required
                  value={monthlyAmount}
                  onChange={e => setMonthlyAmount(Number(e.target.value))}
                  className="w-full p-2 text-base font-bold font-mono rounded-lg border border-emerald-500 text-emerald-700 dark:text-emerald-300"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ঠিকানা:' : 'Address:'}</label>
                <input
                  type="text"
                  value={memberAddress}
                  onChange={e => setMemberAddress(e.target.value)}
                  placeholder="উত্তরা, ঢাকা"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'সদস্য সংরক্ষণ করুন' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

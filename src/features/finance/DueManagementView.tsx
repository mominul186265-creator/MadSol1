import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import {
  AlertCircle,
  Search,
  Bell,
  Download,
  Filter,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Printer,
} from 'lucide-react';

interface DueManagementViewProps {
  onNavigateToCollection?: (studentId: string) => void;
}

export const DueManagementView: React.FC<DueManagementViewProps> = ({
  onNavigateToCollection,
}) => {
  const { language } = useLanguage();
  const { studentFees, triggerDueReminderEvent } = useFinance();
  const { showToast } = useToast();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Filter only items with due > 0
  const dueItems = useMemo(() => {
    return studentFees.filter(sf => sf.dueAmount > 0);
  }, [studentFees]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalDue = dueItems.reduce((sum, item) => sum + item.dueAmount, 0);
    const uniqueDueStudents = new Set(dueItems.map(item => item.studentId)).size;
    const overdueTotal = dueItems
      .filter(item => item.status === 'overdue')
      .reduce((sum, item) => sum + item.dueAmount, 0);

    const totalAssigned = studentFees.reduce((sum, item) => sum + (item.baseAmount - item.discountAmount + item.fineAmount), 0);
    const totalCollected = studentFees.reduce((sum, item) => sum + item.paidAmount, 0);
    const collectionPercentage = totalAssigned > 0 ? Math.round((totalCollected / totalAssigned) * 100) : 0;

    return {
      totalDue,
      uniqueDueStudents,
      overdueTotal,
      collectionPercentage,
      totalCollected,
    };
  }, [dueItems, studentFees]);

  // Filtered List
  const filteredDueItems = useMemo(() => {
    return dueItems.filter(item => {
      if (selectedDept !== 'all' && item.department !== selectedDept) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.studentNameBn.toLowerCase().includes(q) ||
          item.studentCode.toLowerCase().includes(q) ||
          item.guardianMobile.includes(q) ||
          item.feeTitleBn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dueItems, selectedDept, selectedStatus, searchQuery]);

  // Action: Trigger reminder
  const handleSendReminder = async (studentFeeId: string, studentName: string) => {
    setSendingReminderId(studentFeeId);
    try {
      await triggerDueReminderEvent(studentFeeId);
      showToast(
        isBn
          ? `${studentName}-এর অভিভাবকের কাছে বকেয়া তাগাদা ইভেন্ট সফলভাবে পাঠানো হয়েছে।`
          : `Due reminder alert sent for ${studentName}`,
        'success'
      );
    } catch (e) {
      showToast(isBn ? 'তাগাদা পাঠানো সম্ভব হয়নি' : 'Failed to send reminder', 'error');
    } finally {
      setSendingReminderId(null);
    }
  };

  // Action: Export Due List
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Class', 'Department', 'Guardian Mobile', 'Fee Description', 'Due Date', 'Due Amount', 'Status'];
    const rows = filteredDueItems.map(item => [
      item.studentCode,
      `"${item.studentNameBn}"`,
      `"${item.className}"`,
      `"${item.department}"`,
      item.guardianMobile,
      `"${item.feeTitleBn}"`,
      item.dueDate,
      item.dueAmount,
      item.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Due_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-semibold mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            {isBn ? 'বকেয়া হিসাব ও তাগাদা ব্যবস্থাপনা' : 'Student Due & Reminder Management'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'শিক্ষার্থী বকেয়া ফি পর্যবেক্ষণ' : 'Student Due Management'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'সকল শিক্ষার্থীর বকেয়া ফি তালিকা, বিলম্বিত বকেয়া মনিটরিং এবং স্বয়ংক্রিয় এসএমএস তাগাদা ফাউন্ডেশন।'
              : 'Monitor outstanding dues, track overdue payments, and dispatch guardian notification alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            {isBn ? 'এক্সেল ডাউনলোড' : 'Export CSV'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            {isBn ? 'প্রিন্ট রিপোর্ট' : 'Print List'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'সর্বমোট বকেয়া' : 'Total Outstanding Due'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              ৳{metrics.totalDue.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              {isBn ? 'বর্তমান মোট পাওনা' : 'Total uncollected fees'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'বকেয়া শিক্ষার্থীর সংখ্যা' : 'Students with Dues'}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {metrics.uniqueDueStudents}
            </span>
            <span className="text-xs text-stone-500 ml-1">{isBn ? 'জন' : 'students'}</span>
            <p className="text-[11px] text-stone-500 mt-1">
              {isBn ? 'অনতিবিলম্বে পরিশোধযোগ্য' : 'Awaiting payment'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'বিলম্বিত বকেয়া (Overdue)' : 'Overdue Amount'}
            </span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
              ৳{metrics.overdueTotal.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              {isBn ? 'নির্দিষ্ট সময় পেরিয়ে গেছে' : 'Past deadline'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'ফি আদায়ের হার' : 'Collection Rate'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {metrics.collectionPercentage}%
            </span>
            <div className="w-full bg-stone-200 dark:bg-emerald-900 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.collectionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={isBn ? 'শিক্ষার্থী নাম, আইডি বা অভিভাবক মোবাইল...' : 'Search student, ID or mobile...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
          >
            <option value="all">{isBn ? 'সকল বিভাগ' : 'All Departments'}</option>
            <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
            <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
            <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-200"
          >
            <option value="all">{isBn ? 'সকল অবস্থা' : 'All Status'}</option>
            <option value="due">{isBn ? 'বকেয়া (Due)' : 'Due'}</option>
            <option value="overdue">{isBn ? 'বিলম্বিত (Overdue)' : 'Overdue'}</option>
            <option value="partial">{isBn ? 'আংশিক বকেয়া (Partial)' : 'Partial'}</option>
          </select>
        </div>
      </div>

      {/* Due Table */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
            <tr>
              <th className="p-3">শিক্ষার্থী ও অভিভাবক</th>
              <th className="p-3">শ্রেণি ও বিভাগ</th>
              <th className="p-3">ফি বিবরণ</th>
              <th className="p-3">জমার শেষ তারিখ</th>
              <th className="p-3 text-right">নির্ধারিত ফি</th>
              <th className="p-3 text-right">পরিশোধিত</th>
              <th className="p-3 text-right">বকেয়া পরিমাণ</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
            {filteredDueItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-400">
                  {isBn ? 'কোনো বকেয়া শিক্ষার্থী রেকর্ড পাওয়া যায়নি।' : 'No outstanding due records found.'}
                </td>
              </tr>
            ) : (
              filteredDueItems.map(item => (
                <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-emerald-900/20">
                  <td className="p-3">
                    <div className="font-bold text-emerald-950 dark:text-emerald-100">
                      {item.studentNameBn}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      ID: {item.studentCode} | 📱 {item.guardianMobile}
                    </div>
                  </td>
                  <td className="p-3 text-stone-600 dark:text-stone-300">
                    <div>{item.className}</div>
                    <div className="text-[10px] text-stone-400">{item.department}</div>
                  </td>
                  <td className="p-3 font-medium text-stone-800 dark:text-stone-200">
                    {item.feeTitleBn}
                  </td>
                  <td className="p-3 text-stone-500 font-mono text-[11px]">
                    {item.dueDate}
                  </td>
                  <td className="p-3 text-right font-mono text-stone-600 dark:text-stone-300">
                    ৳{item.baseAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600">
                    ৳{item.paidAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    ৳{item.dueAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.status === 'overdue'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                          : item.status === 'partial'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleSendReminder(item.id, item.studentNameBn)}
                        disabled={sendingReminderId === item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition"
                        title={isBn ? 'অভিভাবককে এসএমএস/নোটিফিকেশন তাগাদা পাঠান' : 'Send Reminder Alert'}
                      >
                        <Bell className="w-3 h-3" />
                        {sendingReminderId === item.id ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'তাগাদা' : 'Alert')}
                      </button>

                      {onNavigateToCollection && (
                        <button
                          onClick={() => onNavigateToCollection(item.studentId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                        >
                          <CreditCard className="w-3 h-3" />
                          {isBn ? 'ফি আদায়' : 'Collect'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  Eye,
  Share2
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { GeneratedAiReport, AiReportType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AiReportsView: React.FC = () => {
  const { user, institution } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { aiReports, generateNewReport, deleteReport } = usePart7System();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(aiReports[0]?.id || null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form State
  const [reportType, setReportType] = useState<AiReportType>('monthly');
  const [reportTitle, setReportTitle] = useState('');
  const [department, setDepartment] = useState('সকল বিভাগ (All Departments)');
  const [dateRangeText, setDateRangeText] = useState('চলতি মাস (Current Month)');

  const selectedReport = aiReports.find((r) => r.id === selectedReportId) || aiReports[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!selectedReport) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `Report Title,${selectedReport.titleEn}\n` +
      `Date Range,${selectedReport.dateRange.start} - ${selectedReport.dateRange.end}\n` +
      `Generated At,${selectedReport.generatedAt}\n\n` +
      'Metric,Value,Change\n' +
      selectedReport.keyStatistics.map((s) => `"${s.labelEn}","${s.value}","${s.change || ''}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport.type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'bn' ? 'CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে।' : 'CSV downloaded successfully.', 'success');
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleBn = reportTitle || getReportDefaultTitle(reportType, 'bn');
    const titleEn = reportTitle || getReportDefaultTitle(reportType, 'en');

    generateNewReport({
      institutionId: institution?.id || 'inst-001',
      type: reportType,
      titleBn,
      titleEn,
      dateRange: { start: '2025-01-01', end: '2025-01-31' },
      departmentOrClass: department,
      generatedBy: user ? (language === 'bn' ? user.fullNameBn : user.fullNameEn) : 'System Admin',
      summaryBn: `এই রিপোর্টটি ${department}-এর চলতি সময়কালের ডাটাবেস রেকর্ড বিশ্লেষণ করে তৈরি করা হয়েছে। সার্বিক কার্যক্রম সন্তোষজনক এবং নির্ধারিত লক্ষ্যমাত্রা অনুযায়ী পরিচালিত হচ্ছে।`,
      summaryEn: `Generated through deep audit synthesis for ${department}. Overall functional trajectory is within the established performance parameters.`,
      keyStatistics: [
        { labelBn: 'কার্যকর উপস্থিতি', labelEn: 'Active Attendance', value: '৯৩.৫%', change: '+২.১%' },
        { labelBn: 'হিসাব রাজস্ব আদায়', labelEn: 'Revenue Collected', value: '৳২,৪৫,০০০', change: '+৫.৪%' },
        { labelBn: 'হিফজ সবক অগ্রগতি', labelEn: 'Sabaq Retention', value: '৯১%', change: '+৩.০%' },
        { labelBn: 'বকেয়া রিকভারি', labelEn: 'Due Recovery', value: '৳৭৪,০০০', change: '+৮.৫%' }
      ],
      importantTrendsBn: [
        'হিফজুল কুরআন বিভাগে রিভিশন নিয়মিতকরণের ফলে ত্রুটি কমেছে ৪২%।',
        'বকেয়া আদায়ের স্বয়ংক্রিয় এসএমএস ক্যাম্পেইন চালুর পর ফি সংগ্রহে ৮.৫% বৃদ্ধি লক্ষিত হয়েছে।'
      ],
      importantTrendsEn: [
        'Structured Amokhta revisions reduced retention errors by 42%.',
        'Automated fee recovery SMS triggers yielded 8.5% faster reconciliation.'
      ],
      issuesIdentifiedBn: [
        'নূরানী ৩য় শ্রেণিতে কিছু ছাত্রের উপস্থিতি তুলনামূলকভাবে কম।',
        '৩ জনের ২ মাসের বেশি বেতন বকেয়া রয়েছে।'
      ],
      issuesIdentifiedEn: [
        'Attendance dips observed in Noorani 3rd Grade cohort.',
        'Three accounts carry over 60 days overdue balances.'
      ],
      recommendedActionsBn: [
        'অনুপস্থিত ছাত্রদের অভিভাবকদের সাথে সরাসরি কাউন্সিলিং নিশ্চিত করুন।',
        'অ্যাকাউন্টিং মডিউলে গিয়ে বকেয়া অভিভাবকদের ডিজিটাল রিমাইন্ডার প্রেরণ করুন।'
      ],
      recommendedActionsEn: [
        'Convene parent-teacher check-in for irregular students.',
        'Dispatch second-tier payment recovery notice.'
      ],
      dataSourceSummaryBn: 'রিয়েলটাইম ডাটাবেজ কোয়েরি: হাজিরা (৩১০ রেকর্ড), খতিয়ান (১২৮ লেনদেন), হিফজ (৫৮ লগ)',
      dataSourceSummaryEn: 'Realtime Database Queries: Attendance (310 records), Ledgers (128 transactions), Hifz (58 logs)'
    });

    setIsGenerateModalOpen(false);
    showToast(language === 'bn' ? 'রিপোর্ট সফলভাবে জেনারেট হয়েছে।' : 'Report generated successfully.', 'success');
  };

  function getReportDefaultTitle(type: AiReportType, lang: 'bn' | 'en'): string {
    const titles: Record<AiReportType, { bn: string; en: string }> = {
      daily: { bn: 'দৈনিক প্রাতিষ্ঠানিক কার্যাবলি রিপোর্ট', en: 'Daily Institutional Report' },
      weekly: { bn: 'সাপ্তাহিক নির্বাহী অগ্রগতি রিপোর্ট', en: 'Weekly Executive Progress Report' },
      monthly: { bn: 'মাসিক সমন্বিত প্রাতিষ্ঠানিক রিপোর্ট', en: 'Monthly Integrated Institutional Report' },
      academic: { bn: 'সামগ্রিক একাডেমিক মূল্যায়ন ও ফলাফল রিপোর্ট', en: 'Academic Evaluation & Results Report' },
      attendance: { bn: 'শিক্ষার্থী ও শিক্ষক উপস্থিতি বিশ্লেষণ রিপোর্ট', en: 'Attendance Analytics Report' },
      financial: { bn: 'আর্থিক হিসাব ও অডিট সারসংক্ষেপ রিপোর্ট', en: 'Financial Audit & Balance Report' },
      hifz: { bn: 'হিফজুল কুরআন বিভাগীয় অগ্রগতি খতিয়ান', en: 'Hifz Department Progress Ledger' },
      performance: { bn: 'শিক্ষার্থী পারফরম্যান্স ও আচরণ রিপোর্ট', en: 'Student Performance & Behavior Report' },
      donation: { bn: 'লিল্লাহ ও সাধারণ দান অনুদান রিপোর্ট', en: 'Donation & Charity Collection Report' },
      chanda: { bn: 'শুভাকাঙ্ক্ষী নিয়মিত মাসিক চাঁদা কালেকশন রিপোর্ট', en: 'Patron Recurring Chanda Report' }
    };
    return titles[type] ? titles[type][lang] : 'MadSol Report';
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'AI রিপোর্ট জেনারেটর ও অডিট' : 'AI Multi-Report Generator'}
            </h1>
            <Badge variant="emerald" size="sm">
              Smart Reports
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? '১০ ধরণের প্রাতিষ্ঠানিক রিপোর্ট: দৈনিক, সাপ্তাহিক, মাসিক, আর্থিক, হিফজ, ফলাফল ও দান খতিয়ান'
              : 'Auto-generate structured reports with key metrics, trends, issues, and action items'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{language === 'bn' ? 'নতুন রিপোর্ট তৈরি করুন' : 'Generate New Report'}</span>
        </Button>
      </div>

      {/* Main Grid: Reports List (Left) + Detailed Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Archive */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>{language === 'bn' ? 'সংরক্ষিত রিপোর্টসমূহ' : 'Generated Reports'} ({aiReports.length})</span>
            <Filter className="w-3.5 h-3.5" />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {aiReports.map((report) => {
              const isSelected = report.id === selectedReport?.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {language === 'bn' ? report.titleBn : report.titleEn}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {report.dateRange.start} - {report.dateRange.end} {report.departmentOrClass ? `• ${report.departmentOrClass}` : ''}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      জেনারেট: {report.generatedAt}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReport(report.id);
                      showToast(language === 'bn' ? 'রিপোর্ট মুছে ফেলা হয়েছে।' : 'Report deleted.', 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formatted Report Printable Sheet */}
        {selectedReport && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 print:m-0 print:p-0 print:border-none">
            {/* Header & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                    {selectedReport.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{selectedReport.generatedAt}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {language === 'bn' ? selectedReport.titleBn : selectedReport.titleEn}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'bn' ? institution?.nameBn : institution?.nameEn} • {selectedReport.dateRange.start} - {selectedReport.dateRange.end}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 print:hidden">
                <Button size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel / CSV</span>
                </Button>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === 'bn' ? '১. সারসংক্ষেপ (Executive Summary)' : '1. Executive Summary'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {language === 'bn' ? selectedReport.summaryBn : selectedReport.summaryEn}
              </p>
            </div>

            {/* Section 2: Key Statistics */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === 'bn' ? '২. মূল পরিসংখ্যান (Key Statistics)' : '2. Key Statistics'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedReport.keyStatistics.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-[11px] text-slate-500 block truncate">
                      {language === 'bn' ? stat.labelBn : stat.labelEn}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {stat.value}
                    </span>
                    {stat.change && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{stat.change}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Important Trends */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {language === 'bn' ? '৩. গুরুত্বপূর্ণ প্রবণতা ও অগ্রগতি' : '3. Important Trends'}
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                {(language === 'bn' ? selectedReport.importantTrendsBn : selectedReport.importantTrendsEn).map(
                  (trend, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{trend}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Section 4 & 5: Issues & Action Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 space-y-2">
                <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  {language === 'bn' ? '৪. চিহ্নিত ত্রুটি বা সমস্যা:' : '4. Issues Identified:'}
                </span>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc">
                  {(language === 'bn' ? selectedReport.issuesIdentifiedBn : selectedReport.issuesIdentifiedEn).map(
                    (issue, idx) => (
                      <li key={idx}>{issue}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'bn' ? '৫. সুপারিশকৃত পদক্ষেপ (Actions):' : '5. Recommended Actions:'}
                </span>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc">
                  {(language === 'bn' ? selectedReport.recommendedActionsBn : selectedReport.recommendedActionsEn).map(
                    (action, idx) => (
                      <li key={idx}>{action}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Section 6: Data Source Footnote */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>
                <strong>{language === 'bn' ? '৬. ডাটা সোর্স সামারি:' : '6. Data Source Summary:'}</strong>{' '}
                {language === 'bn' ? selectedReport.dataSourceSummaryBn : selectedReport.dataSourceSummaryEn}
              </span>
              <span className="font-mono text-[10px] text-slate-500">MadSol Verified Ledger Report</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Generate New Report Form */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'নতুন AI প্রাতিষ্ঠানিক রিপোর্ট তৈরি' : 'Generate AI Institutional Report'}
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  রিপোর্টের ধরন (10 Report Types)
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as AiReportType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="daily_institutional">১. দৈনিক প্রাতিষ্ঠানিক কার্যাবলি রিপোর্ট</option>
                  <option value="weekly_executive">২. সাপ্তাহিক নির্বাহী অগ্রগতি রিপোর্ট</option>
                  <option value="monthly_institutional">৩. মাসিক সমন্বিত প্রাতিষ্ঠানিক রিপোর্ট</option>
                  <option value="academic_evaluation">৪. সামগ্রিক একাডেমিক মূল্যায়ন ও ফলাফল</option>
                  <option value="attendance_analytics">৫. শিক্ষার্থী ও শিক্ষক উপস্থিতি বিশ্লেষণ</option>
                  <option value="financial_audit">৬. আর্থিক হিসাব ও অডিট সারসংক্ষেপ</option>
                  <option value="hifz_progress">৭. হিফজুল কুরআন বিভাগীয় অগ্রগতি খতিয়ান</option>
                  <option value="student_performance">৮. শিক্ষার্থী পারফরম্যান্স ও আচরণ রিপোর্ট</option>
                  <option value="donation_summary">৯. লিল্লাহ ও সাধারণ দান অনুদান রিপোর্ট</option>
                  <option value="chanda_collection">১০. শুভাকাঙ্ক্ষী নিয়মিত মাসিক চাঁদা কালেকশন</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  কাস্টম শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="ডিফল্ট শিরোনাম ব্যবহার করতে খালি রাখুন"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিভাগ/শ্রেণি</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="সকল বিভাগ (All Departments)">সকল বিভাগ</option>
                    <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                    <option value="নূরানী ও নাজেরা বিভাগ">নূরানী ও নাজেরা বিভাগ</option>
                    <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সময়কাল</label>
                  <select
                    value={dateRangeText}
                    onChange={(e) => setDateRangeText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="আজকের দিন (Today)">আজকের দিন</option>
                    <option value="চলতি সপ্তাহ (This Week)">চলতি সপ্তাহ</option>
                    <option value="চলতি মাস (Current Month)">চলতি মাস</option>
                    <option value="গত ত্রৈমাসিক (Last Quarter)">গত ত্রৈমাসিক</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  তৈরি করুন (Generate)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

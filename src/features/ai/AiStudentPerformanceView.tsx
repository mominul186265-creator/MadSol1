import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Sparkles,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { StudentPerformanceCategory } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AiStudentPerformanceView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const {
    studentInsights,
    updateStudentPerformanceCategory,
    performanceAlerts,
    resolvePerformanceAlert
  } = usePart7System();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(studentInsights[0]?.studentId || null);

  const categoryMeta: Record<
    StudentPerformanceCategory,
    { labelBn: string; labelEn: string; color: string; badgeVariant: 'emerald' | 'amber' | 'rose' | 'slate' | 'gold' }
  > = {
    excellent: { labelBn: 'চমৎকার (Excellent)', labelEn: 'Excellent', color: 'bg-emerald-500', badgeVariant: 'emerald' },
    good: { labelBn: 'ভালো (Good)', labelEn: 'Good', color: 'bg-blue-500', badgeVariant: 'emerald' },
    average: { labelBn: 'মাঝারি (Average)', labelEn: 'Average', color: 'bg-amber-500', badgeVariant: 'amber' },
    needs_attention: { labelBn: 'মনোযোগ প্রয়োজন (Needs Attention)', labelEn: 'Needs Attention', color: 'bg-orange-500', badgeVariant: 'amber' },
    critical_attention: { labelBn: 'জরুরি পদক্ষেপ (Critical Attention)', labelEn: 'Critical Attention', color: 'bg-rose-500', badgeVariant: 'rose' }
  };

  const filteredStudents = studentInsights.filter((student) => {
    const matchesCategory = selectedCategory === 'all' || student.category === selectedCategory;
    const matchesSearch =
      student.studentNameBn.includes(searchQuery) ||
      student.studentNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.includes(searchQuery) ||
      student.className.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const selectedStudent = studentInsights.find((s) => s.studentId === selectedStudentId) || filteredStudents[0];

  const unresolvedAlerts = performanceAlerts.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'AI শিক্ষার্থী পারফরম্যান্স ও প্রিডিকশন' : 'AI Student Performance Analytics'}
            </h1>
            <Badge variant="emerald" size="sm">
              AI Powered
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'উপস্থিতি, পরীক্ষার ফলাফল, হিফজ ও ফি খতিয়ানের ভিত্তিতে সামগ্রিক মূল্যায়ন ও আর্লি-ওয়ার্নিং অ্যালার্ট'
              : 'Multi-dimensional evaluation across attendance, marks trend, Hifz retention and fee dues'}
          </p>
        </div>
      </div>

      {/* Early Warning System Alerts Banner */}
      {unresolvedAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm">
              <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>
                {language === 'bn'
                  ? `আর্লি ওয়ার্নিং সিস্টেম: ${unresolvedAlerts.length}টি জরুরি সমস্যা চিহ্নিত হয়েছে`
                  : `Early Warning System: ${unresolvedAlerts.length} Attention Triggers Detected`}
              </span>
            </div>
            <span className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
              {language === 'bn' ? 'স্বয়ংক্রিয় অ্যালার্ট' : 'Automated Triggers'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unresolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {alert.studentName} ({alert.className})
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        alert.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {language === 'bn' ? alert.descriptionBn : alert.descriptionEn}
                  </p>
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold block">
                    {alert.metricValue} • {alert.createdAt}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resolvePerformanceAlert(alert.id);
                    showToast(language === 'bn' ? 'অ্যালার্ট সমাধান হিসেবে চিহ্নিত হয়েছে।' : 'Alert resolved.', 'success');
                  }}
                  className="shrink-0 text-xs"
                >
                  {language === 'bn' ? 'মীমাংসিত' : 'Resolve'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.keys(categoryMeta) as StudentPerformanceCategory[]).map((catKey) => {
          const count = studentInsights.filter((s) => s.category === catKey).length;
          const meta = categoryMeta[catKey];
          const isSelected = selectedCategory === catKey;

          return (
            <div
              key={catKey}
              onClick={() => setSelectedCategory(isSelected ? 'all' : catKey)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {language === 'bn' ? meta.labelBn.split(' ')[0] : meta.labelEn}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {count} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'জন' : 'students'}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, শ্রেণি বা রোল দিয়ে খুঁজুন...' : 'Search student or class...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            {language === 'bn' ? 'সকল শিক্ষার্থী' : 'All Students'} ({studentInsights.length})
          </Button>
        </div>
      </div>

      {/* Main Analysis Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students List */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredStudents.map((student) => {
            const isSelected = student.studentId === selectedStudent?.studentId;
            const meta = categoryMeta[student.category];

            return (
              <div
                key={student.studentId}
                onClick={() => setSelectedStudentId(student.studentId)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm shrink-0">
                    {student.studentNameBn.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {language === 'bn' ? student.studentNameBn : student.studentNameEn}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {student.className} • রোল: {student.rollNo}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      student.category === 'excellent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : student.category === 'critical_attention'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : student.category === 'needs_attention'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {language === 'bn' ? meta.labelBn.split(' ')[0] : meta.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    স্কোর: {student.score}/১০০
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Student AI Insight Card */}
        {selectedStudent && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
            {/* Student Header & Quick Metric */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                  {selectedStudent.studentNameBn.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? selectedStudent.studentNameBn : selectedStudent.studentNameEn}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                      ID: {selectedStudent.studentId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedStudent.className} • রোল নং: {selectedStudent.rollNo}
                  </p>
                </div>
              </div>

              {/* Configure Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">ক্যাটাগরি:</span>
                <select
                  value={selectedStudent.category}
                  onChange={(e) => {
                    const newCat = e.target.value as StudentPerformanceCategory;
                    updateStudentPerformanceCategory(selectedStudent.studentId, newCat);
                    showToast(language === 'bn' ? 'ক্যাটাগরি আপডেট হয়েছে।' : 'Category updated.', 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="excellent">🟢 চমৎকার (Excellent)</option>
                  <option value="good">🔵 ভালো (Good)</option>
                  <option value="average">🟡 মাঝারি (Average)</option>
                  <option value="needs_attention">🟠 মনোযোগ প্রয়োজন (Needs Attention)</option>
                  <option value="critical_attention">🔴 জরুরি পদক্ষেপ (Critical Attention)</option>
                </select>
              </div>
            </div>

            {/* Metrics Dashboard Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">উপস্থিতির হার</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {selectedStudent.attendanceRate}%
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">গত ৩০ দিন</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">পরীক্ষার গড় নম্বর</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {selectedStudent.examAverage}%
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">সাময়িক মূল্যায়ন</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">হিফজ / প্রগ্রেস</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {selectedStudent.hifzProgressRate ? `${selectedStudent.hifzProgressRate}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-amber-600 font-semibold">রিভিশন ও সবক</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">বকেয়া ফি</span>
                <span className={`text-base font-bold mt-1 block ${selectedStudent.feeDueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ৳{selectedStudent.feeDueAmount.toLocaleString('bn-BD')}
                </span>
                <span className="text-[10px] text-slate-400">খতিয়ান ব্যালেন্স</span>
              </div>
            </div>

            {/* AI Performance Insight Core Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-slate-800/50 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'AI বিশ্লেষণ ও পর্যবেক্ষণ' : 'AI Performance Insight'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {language === 'bn' ? selectedStudent.insightBn : selectedStudent.insightEn}
              </p>
            </div>

            {/* Issues & Recommended Actions Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  {language === 'bn' ? 'শনাক্তকৃত দুর্বলতা বা সমস্যা:' : 'Issues Identified:'}
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                  {(language === 'bn' ? selectedStudent.issuesBn : selectedStudent.issuesEn).map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {language === 'bn' ? 'করণীয় পদক্ষেপ (Action Items):' : 'Recommended Actions:'}
                </span>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc">
                  {(language === 'bn' ? selectedStudent.recommendedActionsBn : selectedStudent.recommendedActionsEn).map(
                    (action, idx) => (
                      <li key={idx}>{action}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Data Source Summary Footnote */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                <strong>{language === 'bn' ? 'উৎস ডাটা:' : 'Data Source:'}</strong> {selectedStudent.dataSourceSummary}
              </span>
              <span>হালনাগাদ: {selectedStudent.lastUpdated}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AiHifzAnalysisView: React.FC = () => {
  const { language } = useLanguage();
  const { hifzInsights, classAnalysis, teacherInsights } = usePart7System();
  const [activeTab, setActiveTab] = useState<'hifz' | 'classes' | 'teachers'>('hifz');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHifz = hifzInsights.filter((h) =>
    h.studentName.includes(searchQuery) ||
    h.para.toString().includes(searchQuery) ||
    h.surah.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'AI হিফজ অগ্রগতি ও ক্লাস বিশ্লেষণ' : 'AI Hifz Progress & Class Analytics'}
            </h1>
            <Badge variant="gold" size="sm">
              Hifz Special
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'দৈনিক নতুন সবক, সবকি (৭ দিন) ও আমুন্তা (পেছনের রিভিশন) রিটেনশন মনিটরিং ও ক্লাস পারফরম্যান্স'
              : 'Sabaq pace, Sabki retention, and Amokhta revision regularity monitoring'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('hifz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'hifz'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'হিফজ অগ্রগতি' : 'Hifz Students'} ({hifzInsights.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'শ্রেণিভিত্তিক ফলাফল' : 'Class Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'শিক্ষক বিশ্লেষণ' : 'Teacher Insights'}
          </button>
        </div>
      </div>

      {/* TAB 1: HIFZ STUDENTS ANALYSIS */}
      {activeTab === 'hifz' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'ছাত্রের নাম বা পারা দিয়ে খুঁজুন...' : 'Search student or para...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'মোট হিফজ শিক্ষার্থী:' : 'Total Hifz:'} <strong>{hifzInsights.length} জন</strong>
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHifz.map((hifz) => (
              <div
                key={hifz.studentId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 text-base">
                      {hifz.para} পারা
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {hifz.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        বর্তমান সূরা: <strong>{hifz.surah}</strong> • প্যারা অগ্রগতি: {hifz.para}তম পারা
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      hifz.revisionRegularity >= 85
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : hifz.revisionRegularity >= 70
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {hifz.revisionRegularity >= 85
                      ? 'নিয়মিত রিভিশন'
                      : hifz.revisionRegularity >= 70
                      ? 'অনিয়মিত'
                      : 'দুর্বল রিভিশন'}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">নতুন সবক স্কোর</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {hifz.sabakScore}/১০০
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">সবকি রিটেনশন</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {hifz.sabkiScore}/১০০
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">আমুন্তা নিয়মিত</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {hifz.manzilScore}/১০০
                    </span>
                  </div>
                </div>

                {/* Progress Bar of 30 Paras */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>হিফজ সমাপনী প্রগ্রেস</span>
                    <span>{Math.round((hifz.para / 30) * 100)}% ({hifz.para}/৩০ পারা)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${(hifz.para / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* AI Hifz Analysis Box */}
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'bn' ? 'AI হিফজ মূল্যায়ন ও উস্তাদের করণীয়:' : 'AI Hifz Recommendation:'}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {language === 'bn' ? hifz.aiInsightBn : hifz.aiInsightEn}
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    {language === 'bn' ? `উস্তাদের পরামর্শ: ${hifz.teacherActionAdvisedBn}` : `Advised: ${hifz.teacherActionAdvisedEn}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS LEVEL ANALYTICS */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classAnalysis.map((cls) => (
            <div
              key={cls.className}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {cls.className}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    মোট শিক্ষার্থী: {cls.totalStudents} জন • উপস্থিতি ট্রেন্ড: <strong>{cls.attendanceTrend}%</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {cls.examAverage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">গড় স্কোর (পাস: {cls.passPercentage}%)</span>
                </div>
              </div>

              {/* Subject Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                    🌟 শক্তিশালী বিষয়:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{cls.strongSubjectsBn.join(', ')}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/50">
                  <span className="font-bold text-rose-900 dark:text-rose-300 block mb-1">
                    ⚠️ উন্নতির সুযোগ:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">{cls.weakSubjectsBn.join(', ')}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>পরামর্শ:</strong> {language === 'bn' ? cls.aiOverviewBn : cls.aiOverviewEn}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TEACHER PROFESSIONAL INSIGHTS */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherInsights.map((t) => (
            <div
              key={t.teacherId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-base">
                  {t.teacherName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t.teacherName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.assignedClasses.join(', ')} • ক্লাসে উপস্থিতি: <strong>{t.attendanceRate}%</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ক্লাসের গড় নম্বর</span>
                  <span className="font-bold text-emerald-600 mt-0.5 block">{t.classAverageMarks}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">হিফজ অগ্রগতি রেট</span>
                  <span className="font-bold text-blue-600 mt-0.5 block">{t.hifzProgressRate || 85}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>প্রশাসনিক সারসংক্ষেপ:</strong>{' '}
                {language === 'bn' ? t.summaryBn : t.summaryEn}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Trash2,
  Archive,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Layers,
  GraduationCap,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { DbSubject, SubjectCategory, SubjectStatus } from '../../types/step6';
import { DbDepartment } from '../../types/step5';

interface SubjectManagementTabProps {
  subjects: DbSubject[];
  departments: DbDepartment[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (subject: DbSubject) => void;
  onDeleteSubject: (subject: DbSubject) => void;
  onSelectSubjectDetails?: (subject: DbSubject) => void;
}

const CATEGORY_LABELS: Record<SubjectCategory, { bn: string; en: string; color: string }> = {
  quran: { bn: 'কুরআন ও তাজবীদ', en: 'Quran & Tajweed', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  hadith: { bn: 'হাদিস ও উসুল', en: 'Hadith & Usul', color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800' },
  fiqh: { bn: 'ফিকহ ও ফতোয়া', en: 'Fiqh & Fatwa', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
  arabic: { bn: 'আরবি ভাষা ও ব্যাকরণ', en: 'Arabic Language', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
  islamic: { bn: 'ইসলামিক স্টাডিজ', en: 'Islamic Studies', color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800' },
  language: { bn: 'বাংলা ও ইংরেজি ভাষা', en: 'Language & Lit', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' },
  mathematics: { bn: 'গণিত ও যুক্তিবিদ্যা', en: 'Mathematics', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' },
  science: { bn: 'বিজ্ঞান ও পরিবেশ', en: 'Science', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
  general: { bn: 'সাধারণ পাঠ্য', en: 'General Subject', color: 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
  technical: { bn: 'কারিগরি ও দক্ষতা', en: 'Technical Skill', color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800' },
  other: { bn: 'অন্যান্য', en: 'Other', color: 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700' },
};

export const SubjectManagementTab: React.FC<SubjectManagementTabProps> = ({
  subjects,
  departments,
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteSubject,
  onSelectSubjectDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesDept =
        selectedDeptFilter === 'all' ||
        (s.department_ids && s.department_ids.includes(selectedDeptFilter));

      return matchesSearch && matchesCategory && matchesStatus && matchesDept;
    });
  }, [subjects, searchTerm, selectedCategory, selectedStatus, selectedDeptFilter]);

  // Quick Metrics
  const activeCount = subjects.filter((s) => s.status === 'active').length;
  const quranCount = subjects.filter((s) => s.category === 'quran' || s.category === 'hadith' || s.category === 'fiqh').length;
  const generalCount = subjects.filter((s) => s.category === 'language' || s.category === 'mathematics' || s.category === 'general').length;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>বিষয় ব্যবস্থাপনা (Subject Management)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মাদরাসার সকল পাঠ্য বিষয়, অনন্য বিষয় কোড ও বিভাগ সংযোগ পরিচালনা
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন বিষয় যোগ করুন</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট পাঠ্য বিষয়</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {subjects.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {activeCount} টি সক্রিয় বিষয়
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>কুরআন ও উলূমে দ্বীনিয়া</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {quranCount}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
            হিফজ, হাদিস ও ফিকহ শাস্ত্র
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>সাধারণ শিক্ষা ও ভাষা</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {generalCount}
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
            বাংলা, ইংরেজি, গণিত
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বিভাগ সংযোগসমূহ</span>
            <Building2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {departments.filter((d) => d.status === 'active').length}
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 block">
            বিভাগে নির্ধারিত পাঠ্যক্রম
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-subjects"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বিষয়ের নাম বা বিষয় কোড দিয়ে খুঁজুন (যেমন: QUR-101, বাংলা)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="filter-subject-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all w-full md:w-auto"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="quran">কুরআন ও তাজবীদ</option>
            <option value="hadith">হাদিস ও উসুল</option>
            <option value="fiqh">ফিকহ ও ফতোয়া</option>
            <option value="arabic">আরবি ভাষা ও ব্যাকরণ</option>
            <option value="islamic">ইসলামিক স্টাডিজ</option>
            <option value="language">বাংলা ও ইংরেজি ভাষা</option>
            <option value="mathematics">গণিত ও বিজ্ঞান</option>
            <option value="general">সাধারণ পাঠ্য</option>
          </select>

          {/* Department Filter */}
          <select
            id="filter-subject-dept"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all w-full md:w-auto"
          >
            <option value="all">সকল বিভাগ</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_bn}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="filter-subject-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all w-full md:w-auto"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            <option value="archived">আর্কাইভ (Archived)</option>
          </select>
        </div>
      </div>

      {/* Subject List Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">বিষয় কোড</th>
                <th className="px-6 py-4">বিষয়ের নাম (বাংলা ও ইংরেজি)</th>
                <th className="px-6 py-4">ক্যাটাগরি</th>
                <th className="px-6 py-4">বিভাগ সংযোগ</th>
                <th className="px-6 py-4 text-center">ক্লাস ও শিক্ষক</th>
                <th className="px-6 py-4 text-center">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <span>কোনো বিষয় পাওয়া যায়নি</span>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((s) => {
                  const cat = CATEGORY_LABELS[s.category] || CATEGORY_LABELS.general;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 tracking-wider">
                          {s.code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {s.name_bn}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {s.name_en}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${cat.color}`}
                        >
                          {cat.bn}
                        </span>
                      </td>

                      {/* Department Connection */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.department_names && s.department_names.length > 0 ? (
                            s.department_names.map((deptName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                              >
                                {deptName}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              উন্মুক্ত / সার্বজনীন
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned classes & teachers */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                          <span title="নির্ধারিত জামাত সংখ্যা" className="font-bold text-teal-600 dark:text-teal-400">
                            {s.total_classes || 0} জামাত
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span title="নিয়োগপ্রাপ্ত শিক্ষক সংখ্যা" className="font-bold text-amber-600 dark:text-amber-400">
                            {s.total_teachers || 0} শিক্ষক
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            s.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : s.status === 'archived'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {s.status === 'active' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {s.status === 'active'
                              ? 'সক্রিয়'
                              : s.status === 'archived'
                              ? 'আর্কাইভ'
                              : 'নিষ্ক্রিয়'}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectSubjectDetails && (
                            <button
                              title="বিস্তারিত ও শিক্ষক তালিকা"
                              onClick={() => onSelectSubjectDetails(s)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            id={`btn-edit-subject-${s.id}`}
                            title="সম্পাদনা করুন"
                            onClick={() => onOpenEditModal(s)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-subject-${s.id}`}
                            title="মুছে ফেলুন / আর্কাইভ করুন"
                            onClick={() => onDeleteSubject(s)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject List Cards (Mobile View) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredSubjects.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <span>কোনো বিষয় পাওয়া যায়নি</span>
          </div>
        ) : (
          filteredSubjects.map((s) => {
            const cat = CATEGORY_LABELS[s.category] || CATEGORY_LABELS.general;
            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                      {s.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      {s.name_bn}
                    </h3>
                    <p className="text-[11px] text-slate-400">{s.name_en}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}
                  >
                    {cat.bn}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {s.department_names && s.department_names.length > 0 ? (
                    s.department_names.map((deptName, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                      >
                        {deptName}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">উন্মুক্ত পাঠ্যক্রম</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <span>{s.total_classes || 0} জামাত</span>
                    <span>•</span>
                    <span>{s.total_teachers || 0} শিক্ষক</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(s)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(s)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

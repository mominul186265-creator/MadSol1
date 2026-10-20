import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Sparkles,
  Eye,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { MessageTemplate, MessageCategory } from '../../../types/automation';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Badge } from '../../../components/common/Badge';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTemplate?: MessageTemplate | null;
}

const AVAILABLE_VARIABLES = [
  { key: 'student_name', labelBn: 'শিক্ষার্থীর নাম', labelEn: 'Student Name' },
  { key: 'student_id', labelBn: 'শিক্ষার্থী রোল/আইডি', labelEn: 'Student ID' },
  { key: 'guardian_name', labelBn: 'অভিভাবকের নাম', labelEn: 'Guardian Name' },
  { key: 'class_name', labelBn: 'শ্রেণির নাম', labelEn: 'Class Name' },
  { key: 'department_name', labelBn: 'বিভাগের নাম', labelEn: 'Department Name' },
  { key: 'due_amount', labelBn: 'বকেয়া টাকা', labelEn: 'Due Amount' },
  { key: 'payment_amount', labelBn: 'পরিশোধিত টাকা', labelEn: 'Payment Amount' },
  { key: 'receipt_no', labelBn: 'রসিদ নম্বর', labelEn: 'Receipt No' },
  { key: 'month', labelBn: 'মাসের নাম', labelEn: 'Month' },
  { key: 'exam_name', labelBn: 'পরীক্ষার নাম', labelEn: 'Exam Name' },
  { key: 'total_marks', labelBn: 'মোট প্রাপ্ত নম্বর', labelEn: 'Total Marks' },
  { key: 'merit_position', labelBn: 'মেধা স্থান', labelEn: 'Merit Position' },
  { key: 'sabaq_page', labelBn: 'ছবকা পৃষ্ঠা', labelEn: 'Sabaq Page' },
  { key: 'sabki_para', labelBn: 'ছবকী পারা', labelEn: 'Sabki Para' },
  { key: 'manzil_para', labelBn: 'আমোখতা পারা', labelEn: 'Manzil Para' },
  { key: 'date', labelBn: 'তারিখ', labelEn: 'Current Date' },
  { key: 'institution_name', labelBn: 'প্রতিষ্ঠানের নাম', labelEn: 'Institution Name' },
  { key: 'institution_phone', labelBn: 'মাদ্রাসার ফোন নম্বর', labelEn: 'Madrasa Phone' }
];

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  editTemplate
}) => {
  const { createTemplate, updateTemplate, renderTemplate } = useAutomation();
  const { language } = useLanguage();

  const isBn = language === 'bn';

  const [nameBn, setNameBn] = useState(editTemplate?.nameBn || '');
  const [nameEn, setNameEn] = useState(editTemplate?.nameEn || '');
  const [category, setCategory] = useState<MessageCategory>(
    editTemplate?.category || 'student_absent'
  );
  const [templateBn, setTemplateBn] = useState(
    editTemplate?.templateBn ||
      'সম্মানিত অভিভাবক, আপনার সন্তান {{student_name}} আজ অনুপস্থিত। যোগাযোগ: {{institution_phone}}। — {{institution_name}}'
  );
  const [templateEn, setTemplateEn] = useState(
    editTemplate?.templateEn ||
      'Dear Guardian, your ward {{student_name}} is marked absent today. Contact: {{institution_phone}}.'
  );

  const [activeLangTab, setActiveLangTab] = useState<'bn' | 'en'>('bn');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentText = activeLangTab === 'bn' ? templateBn : templateEn;
  const currentSetText = activeLangTab === 'bn' ? setTemplateBn : setTemplateEn;

  // Insert variable into active cursor or append
  const handleInsertVariable = (key: string) => {
    const varTag = `{{${key}}}`;
    currentSetText((prev) => `${prev} ${varTag} `);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Live preview rendered with sample data
  const sampleData: Record<string, string> = {
    student_name: 'মোহাম্মদ আব্দুল্লাহ',
    student_id: 'STD-1004',
    guardian_name: 'সেলিম শিকদার',
    class_name: 'হিফজুল কুরআন',
    department_name: 'হিফজ বিভাগ',
    due_amount: '১,২০০',
    payment_amount: '১,২০০',
    receipt_no: 'RCT-8849',
    month: 'মার্চ',
    exam_name: 'প্রথম সাময়িক পরীক্ষা',
    total_marks: '৫৮০',
    merit_position: '১ম',
    sabaq_page: 'পৃষ্ঠা ১২ (সূরা বাক্বারাহ)',
    sabki_para: '১ম পারা',
    manzil_para: '১৫তম পারা',
    date: '০৪/০৩/২০২৬',
    institution_name: 'মাদরাসাতুস সুন্নাহ আল-ইসলামিয়া',
    institution_phone: '০১৭০০০০০০০০'
  };

  const previewText = renderTemplate(currentText, sampleData);

  // SMS length calculations
  const charCount = currentText.length;
  // Unicode SMS (Bangla) is 70 chars for 1 SMS, English is 160 chars
  const isUnicode = /[\u0980-\u09FF]/.test(currentText);
  const smsLimit = isUnicode ? 70 : 160;
  const smsCount = Math.max(1, Math.ceil(charCount / smsLimit));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn && !nameEn) return;

    // Extract used variables
    const matches = currentText.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const usedVars = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));

    const payload = {
      nameBn: nameBn || nameEn,
      nameEn: nameEn || nameBn,
      category,
      templateBn,
      templateEn,
      variables: usedVars,
      status: 'active' as const
    };

    if (editTemplate) {
      updateTemplate(editTemplate.id, payload);
    } else {
      createTemplate(payload);
    }
    onClose();
  };

  return (
    <div
      id="template-editor-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="template-editor-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {editTemplate
                  ? isBn
                    ? 'মেসেজ টেমপ্লেট সম্পাদনা'
                    : 'Edit Message Template'
                  : isBn
                  ? 'নতুন মেসেজ টেমপ্লেট তৈরি'
                  : 'Create Message Template'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ডাইনামিক ভেরিয়েবল সহ এসএমএস ও পুশ বার্তা কাঠামো'
                  : 'Dynamic SMS and Push notification template builder'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Names and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'টেমপ্লেট নাম (বাংলা)*' : 'Template Name (Bangla)*'}
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: অনুপস্থিতি বার্তা"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'নাম (ইংরেজি)' : 'Name (English)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Absent Alert"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MessageCategory)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="student_absent">{isBn ? 'অনুপস্থিতি (Absent)' : 'Student Absent'}</option>
                <option value="fee_due">{isBn ? 'বকেয়া ফি (Fee Due)' : 'Fee Due'}</option>
                <option value="payment_received">{isBn ? 'ফি রসিদ (Payment Receipt)' : 'Payment Received'}</option>
                <option value="result_published">{isBn ? 'ফলাফল প্রকাশ (Result)' : 'Result Published'}</option>
                <option value="hifz_progress">{isBn ? 'হিফজ অগ্রগতি (Hifz)' : 'Hifz Progress'}</option>
                <option value="chanda_reminder">{isBn ? 'চাঁদা তাগিদ (Chanda)' : 'Chanda Reminder'}</option>
                <option value="donation_thanks">{isBn ? 'অনুদান দোয়া (Donation)' : 'Donation Thanks'}</option>
                <option value="custom">{isBn ? 'কাস্টম বার্তা (Custom)' : 'Custom'}</option>
              </select>
            </div>
          </div>

          {/* Dynamic Variables Chips */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isBn ? 'ক্লিক করে ভেরিয়েবল যোগ করুন' : 'Click to Insert Dynamic Variable'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isBn ? 'স্বয়ংক্রিয় মান দ্বারা প্রতিস্থাপিত হবে' : 'Replaced with real student data'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
              {AVAILABLE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => handleInsertVariable(v.key)}
                  className="px-2 py-1 rounded-lg text-[11px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>{`{{${v.key}}}`}</span>
                  {copiedKey === v.key ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-slate-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Language Tabs for Template Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveLangTab('bn')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeLangTab === 'bn'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🇧🇩 বাংলা বার্তা (Bangla)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeLangTab === 'en'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🇬🇧 ইংরেজি বার্তা (English)
                </button>
              </div>

              {/* SMS Counter Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {charCount} {isBn ? 'বর্ণ' : 'characters'}
                </span>
                <span>•</span>
                <span className={`font-bold ${smsCount > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {smsCount} {isBn ? 'টি এসএমএস' : 'SMS'}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({isUnicode ? (isBn ? 'বাংলা ইউনিকোড ৭০/প্রতি' : 'Unicode 70/SMS') : 'ASCII 160/SMS'})
                </span>
              </div>
            </div>

            <textarea
              rows={4}
              required
              value={currentText}
              onChange={(e) => currentSetText(e.target.value)}
              placeholder={isBn ? 'টেমপ্লেট বার্তা লিখুন...' : 'Write template text...'}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed font-sans"
            />
          </div>

          {/* Live Mobile SMS Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 dark:bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">
                  {isBn ? 'লাইভ মেসেজ প্রিভিউ (অভিভাবক যেমন দেখবেন)' : 'Live Preview (Guardian View)'}
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">Sender: MADSOL</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 text-xs sm:text-sm font-sans text-slate-200 leading-relaxed">
              {previewText || (
                <span className="text-slate-500 italic">
                  {isBn ? 'টেমপ্লেট লিখলে এখানে প্রিভিউ দেখা যাবে' : 'Template preview will appear here'}
                </span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editTemplate
                ? isBn
                  ? 'টেমপ্লেট আপডেট করুন'
                  : 'Update Template'
                : isBn
                ? 'টেমপ্লেট সংরক্ষণ করুন'
                : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

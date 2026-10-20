import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, FileText, PhoneCall, Layers } from 'lucide-react';
import { CommunicationTemplate, TemplateCategory } from '../../../types/communication';
import { useLanguage } from '../../../context/LanguageContext';

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: CommunicationTemplate | null;
  onClose: () => void;
  onSave: (templateData: {
    name: string;
    nameBn: string;
    category: TemplateCategory;
    type: 'sms' | 'voice_call' | 'both';
    content: string;
    voiceScript?: string;
    placeholders: string[];
    isActive: boolean;
  }) => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  template,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('general_notice');
  const [type, setType] = useState<'sms' | 'voice_call' | 'both'>('sms');
  const [content, setContent] = useState('');
  const [voiceScript, setVoiceScript] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setNameBn(template.nameBn);
      setCategory(template.category);
      setType(template.type);
      setContent(template.content);
      setVoiceScript(template.voiceScript || '');
      setIsActive(template.isActive);
    } else {
      setName('');
      setNameBn('');
      setCategory('general_notice');
      setType('sms');
      setContent('');
      setVoiceScript('');
      setIsActive(true);
    }
  }, [template, isOpen]);

  if (!isOpen) return null;

  const handleInsertToken = (token: string, target: 'sms' | 'voice') => {
    if (target === 'sms') {
      setContent((prev) => `${prev} ${token}`);
    } else {
      setVoiceScript((prev) => `${prev} ${token}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !content.trim()) return;

    // Detect placeholders
    const detectedTokens: string[] = [];
    const standardTokens = [
      '{student_name}',
      '{guardian_name}',
      '{class_name}',
      '{roll_no}',
      '{due_amount}',
      '{institution_name}',
      '{date}',
    ];
    const combinedText = `${content} ${voiceScript}`;
    standardTokens.forEach((tok) => {
      if (combinedText.includes(tok)) {
        detectedTokens.push(tok);
      }
    });

    onSave({
      name: name.trim() || nameBn.trim(),
      nameBn: nameBn.trim(),
      category,
      type,
      content: content.trim(),
      voiceScript: voiceScript.trim() || undefined,
      placeholders: detectedTokens,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {template
                  ? isBn
                    ? 'টেমপ্লেট সম্পাদন করুন'
                    : 'Edit Template'
                  : isBn
                  ? 'নতুন টেমপ্লেট তৈরি করুন'
                  : 'Create New Template'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'ডায়নামিক ভেরিয়েবল দিয়ে পুনরায় ব্যবহারযোগ্য বার্তা তৈরি করুন।' : 'Design reusable templates with auto-replacement tokens.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'টেমপ্লেট নাম (বাংলা)*' : 'Template Name (Bangla)*'}
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: বকেয়া ফি পরিশোধের তাগাদা"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'টেমপ্লেট নাম (ইংরেজি)' : 'Template Name (English)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Fee Payment Due Alert"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="attendance">অনুপস্থিতি ও হাজিরা (Attendance)</option>
                <option value="fee_due">বকেয়া বেতন ও ফি (Fee Due)</option>
                <option value="exam_result">পরীক্ষা ও ফলাফল (Exam Result)</option>
                <option value="hifz_progress">হিফজ সবক অগ্রগতি (Hifz Progress)</option>
                <option value="emergency">জরুরি বিজ্ঞপ্তি (Emergency Notice)</option>
                <option value="event">অনুষ্ঠান ও মিটিং (Event & Meeting)</option>
                <option value="holiday">ছুটি সংক্রান্ত (Holiday)</option>
                <option value="general_notice">সাধারণ নোটিশ (General)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'মাধ্যম বা চ্যানেল' : 'Channel Type'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'sms' | 'voice_call' | 'both')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="sms">শুধু এসএমএস (SMS Only)</option>
                <option value="voice_call">শুধু ভয়েস কল (Voice Call Only)</option>
                <option value="both">উভয় (SMS + Voice Call)</option>
              </select>
            </div>
          </div>

          {/* Tokens bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? 'ক্লিক করে টোকেন যুক্ত করুন:' : 'Click to append token:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: '{student_name}', label: 'শিক্ষার্থী' },
                { tag: '{guardian_name}', label: 'অভিভাবক' },
                { tag: '{due_amount}', label: 'বকেয়া' },
                { tag: '{class_name}', label: 'শ্রেণি' },
                { tag: '{roll_no}', label: 'রোল' },
                { tag: '{institution_name}', label: 'মাদ্রাসা' },
                { tag: '{date}', label: 'তারিখ' },
              ].map((tok) => (
                <button
                  key={tok.tag}
                  type="button"
                  onClick={() => handleInsertToken(tok.tag, 'sms')}
                  className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-emerald-50 text-[11px] font-mono rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {tok.tag}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Content */}
          {(type === 'sms' || type === 'both') && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'এসএমএস বার্তার টেক্সট*' : 'SMS Template Body*'}
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="মুহতারাম {guardian_name}, আপনার সন্তান {student_name}-এর বকেয়া ফি {due_amount} টাকা বাকি..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-sans"
              />
            </div>
          )}

          {/* Voice Script */}
          {(type === 'voice_call' || type === 'both') && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {isBn ? 'ভয়েস কল স্ক্রিপ্ট (IVR Speech)' : 'Voice Call Speech Script'}
              </label>
              <textarea
                rows={3}
                value={voiceScript}
                onChange={(e) => setVoiceScript(e.target.value)}
                placeholder="আসসালামু আলাইকুম। {institution_name} থেকে বলা হচ্ছে..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-sans"
              />
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

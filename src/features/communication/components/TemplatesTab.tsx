import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Send,
  PhoneCall,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CommunicationTemplate, TemplateCategory } from '../../../types/communication';
import { TemplateEditorModal } from './TemplateEditorModal';

interface TemplatesTabProps {
  onUseTemplateForSms?: (template: CommunicationTemplate) => void;
  onUseTemplateForVoice?: (template: CommunicationTemplate) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  onUseTemplateForSms,
  onUseTemplateForVoice,
}) => {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useCommunication();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const matchesSearch =
        tmpl.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
      const matchesType = selectedType === 'all' || tmpl.type === selectedType || tmpl.type === 'both';

      return matchesSearch && matchesCat && matchesType;
    });
  }, [templates, searchQuery, selectedCategory, selectedType]);

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (t: CommunicationTemplate) => {
    setEditingTemplate(t);
    setIsEditorOpen(true);
  };

  const handleSaveModal = (data: {
    name: string;
    nameBn: string;
    category: TemplateCategory;
    type: 'sms' | 'voice_call' | 'both';
    content: string;
    voiceScript?: string;
    placeholders: string[];
    isActive: boolean;
  }) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data);
    } else {
      createTemplate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {isBn ? 'মেসেজ ও ভয়েস কল টেমপ্লেট লাইব্রেরি' : 'Reusable Template Library'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'নিয়মিত পাঠানো বার্তার জন্য টেমপ্লেট সাজিয়ে রাখুন এবং দ্রুত ব্রডকাস্ট করুন।'
              : 'Create dynamic SMS and Voice templates for instant recall and dispatch.'}
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 cursor-pointer self-start sm:self-auto shrink-0 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন টেমপ্লেট তৈরি' : 'Create Template'}</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', labelBn: 'সকল', labelEn: 'All' },
            { id: 'attendance', labelBn: 'হাজিরা / অনুপস্থিতি', labelEn: 'Attendance' },
            { id: 'fee_due', labelBn: 'বকেয়া ফি', labelEn: 'Fee Due' },
            { id: 'exam_result', labelBn: 'পরীক্ষা', labelEn: 'Exams' },
            { id: 'hifz_progress', labelBn: 'হিফজ সবক', labelEn: 'Hifz' },
            { id: 'emergency', labelBn: 'জরুরি নোটিশ', labelEn: 'Emergency' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isBn ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'টেমপ্লেট খুঁজুন...' : 'Search templates...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tmpl) => {
          const isBoth = tmpl.type === 'both';
          const isVoice = tmpl.type === 'voice_call';

          return (
            <div
              key={tmpl.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        isVoice
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : isBoth
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {tmpl.type}
                    </span>
                    <span className="text-[10px] text-slate-400">ব্যবহৃত: {tmpl.usageCount} বার</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 cursor-pointer"
                      title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                      title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? tmpl.nameBn : tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mt-1.5 font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {tmpl.content}
                  </p>
                </div>

                {/* Tokens Badges */}
                <div className="flex flex-wrap gap-1">
                  {tmpl.placeholders.map((tok) => (
                    <span
                      key={tok}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {tmpl.type !== 'voice_call' && onUseTemplateForSms && (
                  <button
                    type="button"
                    onClick={() => onUseTemplateForSms(tmpl)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBn ? 'এসএমএস পাঠান' : 'Use in SMS'}</span>
                  </button>
                )}

                {tmpl.type !== 'sms' && onUseTemplateForVoice && (
                  <button
                    type="button"
                    onClick={() => onUseTemplateForVoice(tmpl)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভয়েস কল' : 'Use in Voice'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TemplateEditorModal
        isOpen={isEditorOpen}
        template={editingTemplate}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  BookMarked,
  Award,
  Calendar,
  User,
  Phone,
  PhoneCall,
  MessageSquare,
  MessageCircle,
  Printer,
  CheckCircle2,
  Clock,
  Star,
  FileText,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  Send,
  Copy,
  Check,
} from 'lucide-react';
import { HifzStudent } from '../../types/hifz';
import { useHifz } from '../../context/HifzContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QURAN_PARAS_INFO } from '../../data/hifzData';
import { HifzStudentPrintModal } from './HifzStudentPrintModal';

interface HifzStudentProfileModalProps {
  student: HifzStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSabakModal?: (student: HifzStudent, tab?: 'sabak' | 'saat_sabak' | 'amukhta') => void;
  onOpenEvalModal?: (student: HifzStudent) => void;
}

export const HifzStudentProfileModal: React.FC<HifzStudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onOpenSabakModal,
  onOpenEvalModal,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const { showToast } = useToast();
  const { getStudentHistory } = useHifz();
  const [activeTab, setActiveTab] = useState<'overview' | 'sabak' | 'saat_sabak' | 'amukhta' | 'paras' | 'evaluations'>('overview');
  const [isMessageComposerOpen, setIsMessageComposerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('sabak_update');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setIsMessageComposerOpen(false);
      setIsPrintModalOpen(false);
    }
  }, [isOpen, student?.id]);

  if (!isOpen || !student) return null;

  const rawHistory = getStudentHistory ? getStudentHistory(student.studentId) : null;
  const history = {
    sabak: rawHistory?.sabak || [],
    sabki: rawHistory?.sabki || [],
    manzil: rawHistory?.manzil || [],
    evaluations: rawHistory?.evaluations || [],
  };
  const isBn = language === 'bn';

  const completedSet = new Set(student.completedParas || []);

  const cleanPhone = (student.guardianMobile || '').replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  const messageTemplates: { [key: string]: string } = {
    sabak_update: `আসসালামু আলাইকুম। সম্মানিত অভিভাবক, অদ্য ${student.fullNameBn}-এর হিফজ ছবক: ${student.currentLessonDescription || student.currentSurah}। অগ্রগতি সন্তোষজনক। - ${institution?.nameBn || 'মাদরাসা কর্তৃপক্ষ'}`,
    absence_alert: `আসসালামু আলাইকুম। সম্মানিত অভিভাবক, অদ্য আপনার সন্তান ${student.fullNameBn} হিফজ ক্লাসে উপস্থিত হয়নি। দ্রুত মাদরাসায় যোগাযোগ করুন। - ${institution?.nameBn || 'মাদরাসা কর্তৃপক্ষ'}`,
    revision_notice: `আসসালামু আলাইকুম। ${student.fullNameBn}-এর সাত ছবক ও আমুক্তা (মনজিল) রিভিশনে আরো যত্নবান হওয়া প্রয়োজন। বাড়িতে তিলাওয়াতের প্রতি লক্ষ্য রাখুন। - ${institution?.nameBn || 'মাদরাসা কর্তৃপক্ষ'}`,
  };

  const currentMessageText = messageTemplates[selectedTemplate] || messageTemplates.sabak_update;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessageText);
    setCopiedMessage(true);
    showToast('মেসেজ কপি করা হয়েছে', 'success');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'qaida':
        return { label: '১. নূরানী কায়দা', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200' };
      case 'ampara':
        return { label: '২. আমপারা বিভাগ', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200' };
      case 'nazra':
        return { label: '৩. নাজেরা কুরআন', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200' };
      case 'revision':
        return { label: '৫. রিভিশন শাখা (দাওর)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200' };
      default:
        return { label: '৪. হিফজুল কুরআন', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' };
    }
  };

  const stageMeta = getStageBadge(student.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                  {student.fullNameBn} - পূর্ণাঙ্গ খতিয়ান
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stageMeta.color}`}>
                  {stageMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                আইডি: {student.studentCode} | রোল: {student.rollNumber} | {student.branch === 'mohila' ? 'মহিলা শাখা' : 'ছাত্র শাখা'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Header */}
        <div className="hidden print:block text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold text-slate-900">{institution?.nameBn || 'মাদরাসা দারুল উলুম'}</h1>
          <p className="text-xs text-slate-600">{institution?.addressBn} | ফোন: {institution?.phone}</p>
          <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-sm font-semibold">
            {student.branch === 'mohila' ? 'মহিলা হিফজ বিভাগ' : 'হিফজুল কুরআন বিভাগ'} - শিক্ষার্থী পূর্ণাঙ্গ অগ্রগতি প্রতিবেদন
          </div>
        </div>

        {/* Student Top Banner Card */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                alt={student.fullNameBn}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-white shadow-md dark:ring-slate-800 shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {student.fullNameBn}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {student.status === 'graduated' ? (isBn ? 'দাওর সম্পন্ন' : 'Completed') : (isBn ? 'চলমান' : 'Active')}
                  </span>
                  {student.lowProgressAlert && (
                    <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      <AlertTriangle className="h-3 w-3" />
                      {isBn ? 'অগ্রগতি মন্থর' : 'Low Progress'}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {student.department} ({student.className})
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <User className="h-3.5 w-3.5 text-teal-600" />
                    উস্তায: {student.assignedTeacherName}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    অভিভাবক: {student.guardianName} ({student.guardianMobile || '01700000000'})
                  </span>
                </div>

                {/* Guardian Quick Call & Message Buttons */}
                <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
                  {/* Call Button */}
                  <a
                    href={`tel:${cleanPhone || '01700000000'}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>কল করুন ({student.guardianMobile})</span>
                  </a>

                  {/* SMS Button */}
                  <button
                    onClick={() => setIsMessageComposerOpen(!isMessageComposerOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>মেসেজ / SMS</span>
                  </button>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessageText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-xs hover:bg-emerald-600 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Pillar Cards: 3 for Hifz, only 1 for non-Hifz */}
            <div className={`grid ${student.stage === 'hifz' ? 'grid-cols-3' : 'grid-cols-1'} gap-2 w-full md:w-auto shrink-0 text-center`}>
              <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                  {student.stage === 'hifz' ? '১. ছবক' : 'বর্তমান ছবক'}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block truncate max-w-[130px]" title={student.currentLessonDescription || student.currentSurah}>
                  {student.stage === 'qaida' ? (student.currentAyah || 'নূরানী কায়দা') : `পারা ${student.currentPara}`}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{student.currentSurah}</span>
              </div>

              {student.stage === 'hifz' && (
                <>
                  <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-teal-200 dark:border-teal-900/50 shadow-xs">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 block uppercase">২. সাত ছবক</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block truncate max-w-[100px]" title={student.currentSaatSabak || 'নিয়মিত'}>
                      ছবকী
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{student.currentSaatSabak || '৭ দিনের রিভিশন'}</span>
                  </div>

                  <div className="p-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block uppercase">৩. আমুক্তা</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block truncate max-w-[100px]" title={student.currentAmukhta || 'মনজিল'}>
                      মনজিল
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{student.currentAmukhta || 'পুরাতন পারা'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                চলতি ছবক:
              </span>
              <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                {student.currentLessonDescription || `পারা ${student.currentPara} - ${student.currentSurah} (${student.currentAyah || 'চলতি'})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSabakModal && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSabakModal(student, 'sabak');
                    }}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>+ ছবক</span>
                  </button>

                  {student.stage === 'hifz' && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenSabakModal(student, 'saat_sabak');
                        }}
                        className="flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>+ সাত ছবক</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenSabakModal(student, 'amukhta');
                        }}
                        className="flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>+ আমুক্তা</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {onOpenEvalModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEvalModal(student);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>+ মূল্যায়ন</span>
                </button>
              )}
            </div>
          </div>

          {/* Instant SMS / Message Composer Drawer */}
          {isMessageComposerOpen && (
            <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-md animate-fadeIn print:hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    অভিভাবককে সরাসরি মেসেজ / SMS পাঠান
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                    {student.guardianName} ({student.guardianMobile})
                  </span>
                </div>
                <button
                  onClick={() => setIsMessageComposerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Templates Selection */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTemplate('sabak_update')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTemplate === 'sabak_update'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  📖 ছবক অগ্রগতি আপডেট
                </button>
                <button
                  onClick={() => setSelectedTemplate('absence_alert')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTemplate === 'absence_alert'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ⚠️ ক্লাসে অনুপস্থিতি নোটিশ
                </button>
                <button
                  onClick={() => setSelectedTemplate('revision_notice')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTemplate === 'revision_notice'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🔄 রিভিশন ও তিলাওয়াত নোটিশ
                </button>
              </div>

              {/* Message Content Preview */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {currentMessageText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMessage ? 'কপি হয়েছে' : 'মেসেজ কপি করুন'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`sms:${cleanPhone || '01700000000'}?body=${encodeURIComponent(currentMessageText)}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>সরাসরি SMS অ্যাপে পাঠান</span>
                  </a>

                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(currentMessageText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp-এ পাঠান</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 dark:border-slate-800 overflow-x-auto print:hidden bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            সারসংক্ষেপ ও তথ্য
          </button>
          <button
            onClick={() => setActiveTab('sabak')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'sabak'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            ছবক খতিয়ান ({history.sabak.length})
          </button>
          {student.stage === 'hifz' && (
            <>
              <button
                onClick={() => setActiveTab('saat_sabak')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'saat_sabak'
                    ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                সাত ছবক (ছবকী) ({history.sabki.length})
              </button>
              <button
                onClick={() => setActiveTab('amukhta')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'amukhta'
                    ? 'border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                আমুক্তা (মনজিল) ({history.manzil.length})
              </button>
            </>
          )}
          {(student.stage === 'hifz' || student.stage === 'najera') && (
            <button
              onClick={() => setActiveTab('paras')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'paras'
                  ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ৩০ পারা গ্রিড
            </button>
          )}
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'evaluations'
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            দৈনিক মূল্যায়ন ({history.evaluations.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">মারহালা / স্তর</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">
                    {stageMeta.label}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">শুরুর তারিখ</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">
                    {student.startedDate}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">সম্ভাব্য সমাপ্তি</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-1 block">
                    {student.targetCompletionDate || 'চলতি শিক্ষাবর্ষ'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">গড় রেটিং</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400" />
                    {student.averageRating || 4.8} / ৫
                  </span>
                </div>
              </div>

              {/* Main Pillars Summary Card: 3 for Hifz, only 1 for non-Hifz */}
              <div className={`grid ${student.stage === 'hifz' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                {/* 1. Sabaq */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <span>{student.stage === 'hifz' ? '১. ছবক (Sabaq)' : '১. বর্তমান ছবক (Sabaq)'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-[10px]">আজকের পড়া</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {student.currentLessonDescription || `পারা ${student.currentPara} - ${student.currentSurah}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    সর্বশেষ এন্ট্রি: {student.lastEvaluatedAt ? new Date(student.lastEvaluatedAt).toLocaleDateString() : 'আজ'}
                  </p>
                </div>

                {student.stage === 'hifz' && (
                  <>
                    {/* 2. Saat Sabaq */}
                    <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
                      <div className="flex items-center justify-between text-xs font-bold text-teal-900 dark:text-teal-300">
                        <span>২. সাত ছবক (Saat Sabaq)</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-200 dark:bg-teal-900 text-[10px]">ছবকী</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                        {student.currentSaatSabak || 'বিগত দিনের পড়া রিভিশন'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        অবস্থা: নিয়মিত ও মজবুত
                      </p>
                    </div>

                    {/* 3. Amukhta */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                        <span>৩. আমুক্তা (Amukhta)</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-[10px]">মনজিল</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                        {student.currentAmukhta || 'পুরনো পারাসমূহ রিভিশন'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        দাওর: নিয়মিত শোনানো হচ্ছে
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Teacher Remarks */}
              {student.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    উস্তাযের বিশেষ পর্যবেক্ষণ ও মন্তব্য:
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    "{student.notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SABAK LOGS */}
          {activeTab === 'sabak' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  দৈনিক নতুন ছবক হিস্ট্রি
                </h4>
                <span className="text-xs text-slate-500">মোট {history.sabak.length} টি রেকর্ড</span>
              </div>

              {history.sabak.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">এখনো কোনো সবক লগ নথিভুক্ত করা হয়নি।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.sabak.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.pageNumber ? `পৃষ্ঠা: ${item.pageNumber} (${item.surahName})` : `পারা ${item.paraNumber}: ${item.surahName} (আয়াত ${item.fromAyah}-${item.toAyah})`}
                          </span>
                          <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 dark:bg-emerald-950 dark:text-emerald-200">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {item.lessonDescription}
                      </p>
                      {item.teacherComment && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 italic mt-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-xl">
                          "{item.teacherComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAAT SABAK (SABKI) */}
          {activeTab === 'saat_sabak' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  সাত ছবক (ছবকী - পূর্বের পড়া রিভিশন) খতিয়ান
                </h4>
                <span className="text-xs text-slate-500">মোট {history.sabki.length} টি রেকর্ড</span>
              </div>

              {history.sabki.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Sparkles className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">এখনো কোনো সাত ছবক রেকর্ড নেই।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.sabki.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.revisionPortion}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold dark:bg-teal-950 dark:text-teal-300">
                          মান: {item.performance}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          ভুলভ্রান্তি: {item.mistakeLevel === 'none' ? 'কোনো ভুল নেই' : item.mistakeLevel}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> {item.stars} স্টার
                        </span>
                      </div>
                      {item.teacherComment && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                          "{item.teacherComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AMUKHTA (MANZIL) */}
          {activeTab === 'amukhta' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  আমুক্তা (মনজিল - পুরনো মুখস্থ পারা দাওর) খতিয়ান
                </h4>
                <span className="text-xs text-slate-500">মোট {history.manzil.length} টি রেকর্ড</span>
              </div>

              {history.manzil.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Award className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">এখনো কোনো আমুক্তা রেকর্ড নেই।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.manzil.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          পারা {item.paraNumber}: {item.revisionPortion}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold dark:bg-amber-950 dark:text-amber-300">
                          মান: {item.performance}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> {item.stars} স্টার
                        </span>
                      </div>
                      {item.teacherComment && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                          "{item.teacherComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 30 PARAS GRID (Only for Hifz & Najera) */}
          {activeTab === 'paras' && (student.stage === 'hifz' || student.stage === 'najera') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  কুরআনুল কারীমের ৩০ পারার অগ্রগতি স্তর। সম্পন্ন হওয়া পারাগুলো সবুজ রঙে চিহ্নিত।
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                    সম্পন্ন
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                    চলতি
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-semibold">
                    <span className="h-3 w-3 rounded-full bg-slate-300 inline-block" />
                    বাকি
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                {QURAN_PARAS_INFO.map((para) => {
                  const isCompleted = completedSet.has(para.number);
                  const isCurrent = student.currentPara === para.number;

                  return (
                    <div
                      key={para.number}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          : isCurrent
                          ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/40 dark:border-amber-700 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold">পারা {para.number}</span>
                        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {isCurrent && <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />}
                      </div>
                      <div className="text-sm font-bold truncate">{para.nameArabic}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{para.nameBn}</div>
                      <div className="text-[9px] text-slate-400 mt-1 truncate">{para.startSurah}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EVALUATIONS */}
          {activeTab === 'evaluations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  দৈনিক পূর্ণাঙ্গ মূল্যায়ন তালিকা
                </h4>
                <span className="text-xs text-slate-500">মোট {history.evaluations.length} টি রেকর্ড</span>
              </div>

              {history.evaluations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Star className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">কোনো মূল্যায়ন রেকর্ড নেই।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.evaluations.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          তারিখ: {ev.date}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < ev.overallStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">ছবকা</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.sabak}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">সাত ছবকী</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.sabki}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">মনজিল</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.manzil}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">তাজবীদ</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.tajweed}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">সাবলীলতা</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.fluency}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                          <span className="text-[10px] text-slate-400 block">উপস্থিতি</span>
                          <span className="text-xs font-semibold text-emerald-600">{ev.attendance}</span>
                        </div>
                      </div>
                      {ev.teacherComment && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                          "{ev.teacherComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Print & Date Range Report Generator Modal */}
      {isPrintModalOpen && (
        <HifzStudentPrintModal
          student={student}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

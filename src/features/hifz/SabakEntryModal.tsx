import React, { useState, useEffect } from 'react';
import { X, BookMarked, Star, Sparkles, Award, BookOpen, UserCheck } from 'lucide-react';
import { HifzStudent, PerformanceRatingLevel } from '../../types/hifz';
import { useHifz } from '../../context/HifzContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QURAN_PARAS_INFO } from '../../data/hifzData';

interface SabakEntryModalProps {
  student: HifzStudent | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'sabak' | 'saat_sabak' | 'amukhta';
}

export const SabakEntryModal: React.FC<SabakEntryModalProps> = ({
  student,
  isOpen,
  onClose,
  initialTab = 'sabak',
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { hifzStudents, recordSabak, recordSabki, recordManzil } = useHifz();
  const isBn = language === 'bn';

  const [selectedStudentId, setSelectedStudentId] = useState<string>(student?.studentId || '');
  const [activeType, setActiveType] = useState<'sabak' | 'saat_sabak' | 'amukhta'>('sabak');

  // Determine current stage & branch from props or initial student
  const targetStage = student?.stage || 'qaida';
  const targetBranch = student?.branch;

  // Filter students strictly belonging to THIS stage (and branch if specified)
  const stageFilteredStudents = hifzStudents.filter((s) => {
    const isSameStage = s.stage === targetStage;
    const isSameBranch = targetBranch ? s.branch === targetBranch : true;
    return isSameStage && isSameBranch;
  });

  // Fallback to all students of that stage if branch filter has none
  const availableStudents = stageFilteredStudents.length > 0 
    ? stageFilteredStudents 
    : hifzStudents.filter((s) => s.stage === targetStage);

  // Find active student within this stage
  const activeStudent = availableStudents.find((s) => s.studentId === selectedStudentId) || availableStudents[0] || student || hifzStudents[0];

  // Form State - Sabak
  const [paraNumber, setParaNumber] = useState<number>(1);
  const [surahName, setSurahName] = useState<string>('সূরা আল-বাক্বারাহ');
  const [pageNumber, setPageNumber] = useState<string>('');
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(10);
  const [lessonDescription, setLessonDescription] = useState<string>('');
  const [rating, setRating] = useState<PerformanceRatingLevel>('excellent');
  const [stars, setStars] = useState<number>(5);
  const [teacherComment, setTeacherComment] = useState<string>('মাশাআল্লাহ সবক সুন্দর হয়েছে।');

  // Form State - Saat Sabak
  const [saatSabakPortion, setSaatSabakPortion] = useState<string>('');
  const [saatMistakeLevel, setSaatMistakeLevel] = useState<'none' | 'few' | 'moderate' | 'high'>('none');
  const [saatRating, setSaatRating] = useState<PerformanceRatingLevel>('excellent');
  const [saatStars, setSaatStars] = useState<number>(5);
  const [saatComment, setSaatComment] = useState<string>('সাত ছবক মজবুত রয়েছে।');

  // Form State - Amukhta
  const [amukhtaPara, setAmukhtaPara] = useState<number>(1);
  const [amukhtaPortion, setAmukhtaPortion] = useState<string>('');
  const [amukhtaRating, setAmukhtaRating] = useState<PerformanceRatingLevel>('excellent');
  const [amukhtaStars, setAmukhtaStars] = useState<number>(5);
  const [amukhtaComment, setAmukhtaComment] = useState<string>('পুরাতন পারা চমৎকার ইয়াদ রয়েছে।');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setSelectedStudentId(student.studentId);
    } else if (hifzStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(hifzStudents[0].studentId);
    }
  }, [student, isOpen, hifzStudents]);

  useEffect(() => {
    if (activeStudent) {
      setParaNumber(activeStudent.currentPara || 1);
      setSurahName(activeStudent.currentSurah || 'সূরা আল-বাক্বারাহ');
      setAmukhtaPara(Math.max(1, (activeStudent.currentPara || 1) - 1));
      
      if (activeStudent.stage === 'qaida') {
        const defaultPage = activeStudent.currentAyah ? activeStudent.currentAyah.replace(/\D/g, '') || '15' : '15';
        setPageNumber(defaultPage);
        setLessonDescription(activeStudent.currentLessonDescription || 'নূরানী কায়দা: পৃষ্ঠা ১৫ - হরকত ও মাখরাজ অনুশীলন');
        setSaatSabakPortion('বিগত ৩ পৃষ্ঠা রিভিশন');
        setAmukhtaPortion('শুরুর হরফ শনাক্তকরণ');
      } else if (activeStudent.stage === 'ampara') {
        setPageNumber('');
        setLessonDescription(activeStudent.currentLessonDescription || 'সূরা আত-ত্বারিক্ব সম্পূর্ণ মুখস্থ');
        setSaatSabakPortion('সূরা আল-বুরুজ ও আল-ইনশিক্বাক্ব');
        setAmukhtaPortion('সূরা আন-নাবা থেকে আল-ইনফিতার');
      } else if (activeStudent.stage === 'nazra') {
        setLessonDescription(activeStudent.currentLessonDescription || `পারা ${activeStudent.currentPara || 5} - তরতীল ও তাজবীদসহ তিলাওয়াত`);
        setSaatSabakPortion('পূর্ববর্তী ২ রুকু');
        setAmukhtaPortion('বিগত পারাসমূহ রিভিশন');
      } else if (activeStudent.stage === 'revision') {
        setLessonDescription(activeStudent.currentLessonDescription || `দাওরুল কুরআন: পারা ${activeStudent.currentPara || 1} খতম দাওর রিভিশন`);
        setSaatSabakPortion(activeStudent.currentSaatSabak || 'পূর্ববর্তী পারা দাওর');
        setAmukhtaPortion(activeStudent.currentAmukhta || 'খতম দাওর মজলিস');
      } else {
        setLessonDescription(activeStudent.currentLessonDescription || `পারা ${activeStudent.currentPara || 1} - ${activeStudent.currentSurah || 'চলতি সূরা'} নতুন ছবকা`);
        setSaatSabakPortion(activeStudent.currentSaatSabak || 'পূর্ববর্তী ৫ পৃষ্ঠা (সাত ছবকী)');
        setAmukhtaPortion(activeStudent.currentAmukhta || 'পুরনো পারা দাওর');
      }
    }
  }, [activeStudent?.studentId, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveType(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  if (!activeStudent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            এই স্তরে কোনো শিক্ষার্থী পাওয়া যায়নি
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            ছবক এন্ট্রি করার জন্য অনুগ্রহ করে প্রথমে এই স্তরে নতুন শিক্ষার্থী ভর্তি করুন।
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer dark:bg-slate-800 dark:text-slate-200"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeType === 'sabak') {
        await recordSabak({
          institutionId: activeStudent.institutionId,
          studentId: activeStudent.studentId,
          studentNameBn: activeStudent.fullNameBn,
          teacherId: user?.id || activeStudent.assignedTeacherId,
          teacherName: user?.fullNameBn || activeStudent.assignedTeacherName,
          date: new Date().toISOString().split('T')[0],
          stage: activeStudent.stage,
          paraNumber,
          surahName: activeStudent.stage === 'qaida' ? (lessonDescription.slice(0, 30) || 'নূরানী কায়দা') : surahName,
          pageNumber: pageNumber ? pageNumber : undefined,
          fromAyah,
          toAyah,
          lessonDescription: lessonDescription || (activeStudent.stage === 'qaida' ? `নূরানী কায়দা: পৃষ্ঠা ${pageNumber}` : `${surahName} (${fromAyah}-${toAyah})`),
          rating,
          stars,
          teacherComment,
        });
      } else if (activeType === 'saat_sabak') {
        await recordSabki({
          institutionId: activeStudent.institutionId,
          studentId: activeStudent.studentId,
          studentNameBn: activeStudent.fullNameBn,
          teacherId: user?.id || activeStudent.assignedTeacherId,
          teacherName: user?.fullNameBn || activeStudent.assignedTeacherName,
          date: new Date().toISOString().split('T')[0],
          stage: activeStudent.stage,
          previousLesson: activeStudent.currentSurah || 'পূর্বের পড়া',
          revisionPortion: saatSabakPortion || 'সাত ছবকী রিভিশন',
          performance: saatRating,
          stars: saatStars,
          mistakeLevel: saatMistakeLevel,
          teacherComment: saatComment,
        });
      } else if (activeType === 'amukhta') {
        await recordManzil({
          institutionId: activeStudent.institutionId,
          studentId: activeStudent.studentId,
          studentNameBn: activeStudent.fullNameBn,
          teacherId: user?.id || activeStudent.assignedTeacherId,
          teacherName: user?.fullNameBn || activeStudent.assignedTeacherName,
          date: new Date().toISOString().split('T')[0],
          stage: activeStudent.stage,
          paraNumber: amukhtaPara,
          surahName: surahName,
          revisionPortion: amukhtaPortion || `${amukhtaPara} নম্বর পারা সম্পূর্ণ`,
          performance: amukhtaRating,
          stars: amukhtaStars,
          teacherComment: amukhtaComment,
        });
      }
      showToast(`${activeStudent.fullNameBn}-এর ছবক সফলভাবে সংরক্ষিত হয়েছে।`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('ছবক সংরক্ষণে সমস্যা হয়েছে।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'qaida': return '১. নূরানী কায়দা';
      case 'ampara': return '২. আমপারা';
      case 'nazra': return '৩. নাজেরা';
      case 'revision': return '৫. রিভিশন শাখা';
      default: return '৪. হিফজুল কুরআন';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                দৈনিক ছবক ও পাঠ এন্ট্রি
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeStudent ? `রোল: ${activeStudent.rollNumber} | ${activeStudent.fullNameBn}` : 'শিক্ষার্থী নির্বাচন করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Entry Type Tabs (3 tabs for ALL stages: Qaida, Ampara, Nazra, Hifz) */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveType('sabak')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeType === 'sabak'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">১. ছবক (নতুন পড়া)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('saat_sabak')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeType === 'saat_sabak'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">২. সাত ছবক (ছবকী)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('amukhta')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeType === 'amukhta'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">৩. আমুক্তা (মনজিল)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 1. Student Selection Dropdown (Filtered strictly by current stage) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                শিক্ষার্থী নির্বাচন করুন *
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {getStageLabel(targetStage)} ({availableStudents.length} জন)
              </span>
            </label>
            <select
              value={activeStudent.studentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white shadow-2xs"
              required
            >
              {availableStudents.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  [রোল {s.rollNumber}] {s.fullNameBn} {s.currentLessonDescription ? `• ${s.currentLessonDescription}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* TAB 1: SABAK (NEW LESSON) */}
          {activeType === 'sabak' && (
            <div className="space-y-4">
              {activeStudent.stage === 'qaida' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কায়দার পৃষ্ঠা / পাঠ নম্বর *
                  </label>
                  <input
                    type="text"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    placeholder="যেমন: পৃষ্ঠা ১৫ বা পাঠ ৪"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        পারা নম্বর *
                      </label>
                      <select
                        value={paraNumber}
                        onChange={(e) => setParaNumber(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {QURAN_PARAS_INFO.map((p) => (
                          <option key={p.number} value={p.number}>
                            পারা {p.number} - {p.nameArabic} ({p.nameBn})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        সূরা *
                      </label>
                      <input
                        type="text"
                        value={surahName}
                        onChange={(e) => setSurahName(e.target.value)}
                        placeholder="যেমন: সূরা আল-বাক্বারাহ"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        কত নম্বর আয়াত থেকে
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={fromAyah}
                        onChange={(e) => setFromAyah(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        কত নম্বর আয়াত পর্যন্ত
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={toAyah}
                        onChange={(e) => setToAyah(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সবকের বিবরণ / পড়া *
                </label>
                <input
                  type="text"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="যেমন: পৃষ্ঠা ১৫ - হরকত ও মাখরাজ অনুশীলন"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মান / মানদণ্ড
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as PerformanceRatingLevel)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="excellent">ممتاز (চমৎকার)</option>
                    <option value="very_good">جيد جدا (উত্তম)</option>
                    <option value="good">جيد (ভালো)</option>
                    <option value="needs_improvement">يحتاج إلى تحسين (উন্নতি প্রয়োজন)</option>
                    <option value="weak">ضعيف (দুর্বল)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    স্টার রেটিং
                  </label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStars(num)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            num <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  উস্তাযের মন্তব্য
                </label>
                <input
                  type="text"
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="যেমন: মাশাআল্লাহ সবক সুন্দর হয়েছে।"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SAAT SABAK / SABKI / REVISION */}
          {activeType === 'saat_sabak' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {activeStudent.stage === 'qaida'
                    ? 'বিগত দিনের পাঠ রিভিশন অংশ *'
                    : activeStudent.stage === 'ampara'
                    ? 'পূর্ববর্তী সূরা রিভিশন অংশ *'
                    : activeStudent.stage === 'nazra'
                    ? 'চলতি পারার পেছনের রিভিশন *'
                    : 'সাত ছবকী অংশ / পৃষ্ঠা *'}
                </label>
                <input
                  type="text"
                  value={saatSabakPortion}
                  onChange={(e) => setSaatSabakPortion(e.target.value)}
                  placeholder={
                    activeStudent.stage === 'qaida'
                      ? 'যেমন: বিগত ৩ পৃষ্ঠা বা অধ্যায় রিভিশন'
                      : activeStudent.stage === 'ampara'
                      ? 'যেমন: সূরা আল-বুরুজ ও আল-ইনশিক্বাক্ব'
                      : activeStudent.stage === 'nazra'
                      ? 'যেমন: পূর্ববর্তী ৩ রুকু বিশুদ্ধ তিলাওয়াত'
                      : 'যেমন: বিগত ৭ দিনের ছবক (পৃষ্ঠা ১২-১৮)'
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ভুলভ্রান্তির মাত্রা
                  </label>
                  <select
                    value={saatMistakeLevel}
                    onChange={(e) => setSaatMistakeLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="none">কোনো ভুল নেই (নির্ভুল)</option>
                    <option value="few">সামান্য ভুল (১-২ টি)</option>
                    <option value="moderate">মাঝারি ভুল</option>
                    <option value="high">অধিক ভুল (পুনরাবৃত্তি প্রয়োজন)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মান
                  </label>
                  <select
                    value={saatRating}
                    onChange={(e) => setSaatRating(e.target.value as PerformanceRatingLevel)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="excellent">ممتاز (মজবুত)</option>
                    <option value="very_good">جيد جدا (উত্তম)</option>
                    <option value="good">جيد (চলনসই)</option>
                    <option value="needs_improvement">يحتاج إلى تحسين (কাঁচা)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রেটিং স্টার
                </label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSaatStars(num)}
                      className="cursor-pointer p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          num <= saatStars ? 'fill-teal-500 text-teal-500' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  উস্তাযের মন্তব্য
                </label>
                <input
                  type="text"
                  value={saatComment}
                  onChange={(e) => setSaatComment(e.target.value)}
                  placeholder="যেমন: মাশাআল্লাহ সাত ছবক খুব মজবুত আছে।"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: AMUKHTA / MANZIL / DAWR */}
          {activeType === 'amukhta' && (
            <div className="space-y-4">
              {activeStudent.stage === 'qaida' || activeStudent.stage === 'ampara' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {activeStudent.stage === 'qaida'
                      ? 'আমুক্তা / পূর্ববর্তী অধ্যায় রিভিশন বিবরণ *'
                      : 'আমুক্তা / পুরাতন সূরা দাওর বিবরণ *'}
                  </label>
                  <textarea
                    rows={2}
                    value={amukhtaPortion}
                    onChange={(e) => setAmukhtaPortion(e.target.value)}
                    placeholder={
                      activeStudent.stage === 'qaida'
                        ? 'যেমন: হরকত, তানভীন ও জজম অনুশীলন সম্পূর্ণ রিভিশন'
                        : 'যেমন: সূরা আন-নাবা থেকে আল-ইনশিক্বাক্ব সম্পূর্ণ দাওর শোনানো হয়েছে'
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      পারা নম্বর *
                    </label>
                    <select
                      value={amukhtaPara}
                      onChange={(e) => setAmukhtaPara(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {QURAN_PARAS_INFO.map((p) => (
                        <option key={p.number} value={p.number}>
                          পারা {p.number} - {p.nameArabic} ({p.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      মান
                    </label>
                    <select
                      value={amukhtaRating}
                      onChange={(e) => setAmukhtaRating(e.target.value as PerformanceRatingLevel)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="excellent">ممتاز (মজবুত ও পরিষ্কার)</option>
                      <option value="very_good">جيد جدا (উত্তম)</option>
                      <option value="good">جيد (মোটামুটি)</option>
                      <option value="needs_improvement">يحتاج إلى تحسين (দাওর বাড়ানো প্রয়োজন)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeStudent.stage !== 'qaida' && activeStudent.stage !== 'ampara' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শোনানো অংশ / বিবরণ *
                  </label>
                  <textarea
                    rows={2}
                    value={amukhtaPortion}
                    onChange={(e) => setAmukhtaPortion(e.target.value)}
                    placeholder="যেমন: ৫ম পারা সম্পূর্ণ এক বৈঠকে শোনানো হয়েছে"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              )}

              {(activeStudent.stage === 'qaida' || activeStudent.stage === 'ampara') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মান
                  </label>
                  <select
                    value={amukhtaRating}
                    onChange={(e) => setAmukhtaRating(e.target.value as PerformanceRatingLevel)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="excellent">ممتاز (মজবুত ও পরিষ্কার)</option>
                    <option value="very_good">جيد جدا (উত্তম)</option>
                    <option value="good">جيد (মোটামুটি)</option>
                    <option value="needs_improvement">يحتاج إلى تحسين (দাওর বাড়ানো প্রয়োজন)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রেটিং স্টার
                </label>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAmukhtaStars(num)}
                      className="cursor-pointer p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          num <= amukhtaStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  উস্তাযের মন্তব্য
                </label>
                <input
                  type="text"
                  value={amukhtaComment}
                  onChange={(e) => setAmukhtaComment(e.target.value)}
                  placeholder="যেমন: মাশাআল্লাহ পুরনো পারা সম্পূর্ণ পরিষ্কার ইয়াদ আছে।"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer ${
                activeType === 'sabak'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : activeType === 'saat_sabak'
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


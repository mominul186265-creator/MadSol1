import React, { useState } from 'react';
import { X, UserPlus, BookMarked, Sparkles } from 'lucide-react';
import { useHifz } from '../../context/HifzContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { QURAN_PARAS_INFO } from '../../data/hifzData';
import { HifzBranch, HifzStage } from '../../types/hifz';
import { StudentPhotoUploader } from '../../components/common/StudentPhotoUploader';

interface AddHifzStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBranch?: HifzBranch;
  defaultStage?: HifzStage;
}

export const AddHifzStudentModal: React.FC<AddHifzStudentModalProps> = ({
  isOpen,
  onClose,
  defaultBranch = 'boys',
  defaultStage = 'hifz',
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const { addHifzStudent } = useHifz();
  const { students, teachers } = useMadrasaData();
  const isBn = language === 'bn';

  const [branch, setBranch] = useState<HifzBranch>(defaultBranch);
  const [stage, setStage] = useState<HifzStage>(defaultStage);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [manualRoll, setManualRoll] = useState<string>('');
  const [manualGuardian, setManualGuardian] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualPhoto, setManualPhoto] = useState<string>('');

  const [currentPara, setCurrentPara] = useState<number>(1);
  const [currentSurah, setCurrentSurah] = useState<string>('সূরা আল-ফাতিহা');
  const [currentAyah, setCurrentAyah] = useState<string>('১-৭');
  const [currentLessonDescription, setCurrentLessonDescription] = useState<string>('নতুন সবক শুরু');
  const [currentSaatSabak, setCurrentSaatSabak] = useState<string>('৭ দিনের ছবকী শুরু');
  const [currentAmukhta, setCurrentAmukhta] = useState<string>('আমুক্তা মনজিল');
  const [totalCompletedParas, setTotalCompletedParas] = useState<number>(0);
  const [assignedTeacherId, setAssignedTeacherId] = useState<string>('usr-004');
  const [targetDate, setTargetDate] = useState<string>('2028-12-31');
  const [notes, setNotes] = useState<string>('হিফজ বিভাগে নতুন ভর্তি ও সবক প্রদান শুরু');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setBranch(defaultBranch);
    setStage(defaultStage);
    if (defaultStage === 'qaida') {
      setCurrentSurah('নূরানী কায়দা');
      setCurrentAyah('পৃষ্ঠা ১');
      setCurrentLessonDescription('নূরানী কায়দা: পৃষ্ঠা ১ - হরফ চেনা ও উচ্চারণ');
      setCurrentSaatSabak('কায়দা রিভিশন');
      setCurrentAmukhta('হরফ মাখরাজ');
    } else if (defaultStage === 'ampara') {
      setCurrentSurah('সূরা আন-নাবা');
      setCurrentAyah('১-২০');
      setCurrentLessonDescription('আমপারা: সূরা আন-নাবা মুখস্থ শুরু');
      setCurrentSaatSabak('আমপারা ছবকী');
      setCurrentAmukhta('কায়দা ও আমপারা রিভিশন');
    } else if (defaultStage === 'nazra') {
      setCurrentSurah('সূরা আল-বাক্বারাহ');
      setCurrentAyah('১-৫০');
      setCurrentLessonDescription('নাজেরা কুরআন তিলাওয়াত: ১ম পারা');
      setCurrentSaatSabak('নাজেরা রিভিশন');
      setCurrentAmukhta('আমপারা ও নাজেরা');
    } else if (defaultStage === 'revision') {
      setCurrentSurah('পূর্ণ কুরআন দাওর');
      setCurrentAyah('১ম-৩য় পারা');
      setCurrentLessonDescription('দাওরুল কুরআন: ১ম থেকে ৩য় পারা রিভিশন');
      setCurrentSaatSabak('বিগত পারা দাওর');
      setCurrentAmukhta('খতম দাওর মজলিস');
    } else {
      setCurrentSurah('সূরা আল-ফাতিহা ও বাক্বারাহ');
      setCurrentAyah('১-২৫');
      setCurrentLessonDescription('১ম পারা - নতুন সবক শুরু');
      setCurrentSaatSabak('১ম পারার পূর্ববর্তী অংশ');
      setCurrentAmukhta('নাজেরা দাওর');
    }
  }, [defaultBranch, defaultStage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const baseStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) : null;
      const teacher = teachers.find((t) => t.id === assignedTeacherId);

      const fullNameBn = baseStudent?.fullNameBn || manualName || 'নতুন শিক্ষার্থী';
      const fullNameEn = baseStudent?.fullNameEn || manualName || 'New Student';
      const studentCode = baseStudent?.studentId || `MDS-${Date.now().toString().slice(-4)}`;
      const rollNumber = baseStudent?.rollNumber || manualRoll || '০১';
      const guardianName = baseStudent?.guardianName || manualGuardian || 'অভিভাবক';
      const guardianMobile = baseStudent?.guardianMobile || manualPhone || '01700000000';

      const departmentName = branch === 'mohila'
        ? (stage === 'qaida' ? 'মহিলা নূরানী কায়দা বিভাগ (ছাত্রী)' : stage === 'ampara' ? 'মহিলা আমপারা বিভাগ (ছাত্রী)' : stage === 'nazra' ? 'মহিলা নাজেরা বিভাগ (ছাত্রী)' : stage === 'revision' ? 'মহিলা হিফজ রিভিশন ও দাওর বিভাগ (ছাত্রী)' : 'মহিলা হিফজ বিভাগ (ছাত্রী)')
        : (stage === 'qaida' ? 'নূরানী কায়দা বিভাগ (ছাত্র)' : stage === 'ampara' ? 'আমপারা বিভাগ (ছাত্র)' : stage === 'nazra' ? 'নাজেরা কুরআন বিভাগ (ছাত্র)' : stage === 'revision' ? 'হিফজ রিভিশন ও দাওর বিভাগ (ছাত্র)' : 'হিফজুল কুরআন বিভাগ (ছাত্র)');

      await addHifzStudent({
        institutionId: institution?.id || 'inst-001',
        studentId: baseStudent?.id || `std-${Date.now()}`,
        studentCode,
        fullNameBn,
        fullNameEn,
        photoUrl: baseStudent?.photoUrl || manualPhoto || undefined,
        gender: branch === 'mohila' ? 'female' : 'male',
        branch,
        stage,
        department: departmentName,
        className: stage === 'qaida' ? 'কায়দা স্তর' : stage === 'ampara' ? 'আমপারা স্তর' : stage === 'nazra' ? 'নাজরা স্তর' : stage === 'revision' ? 'রিভিশন ও দাওর স্তর' : 'হিফজ স্তর',
        section: branch === 'mohila' ? 'মহিলা-ক' : 'ক',
        rollNumber,
        currentPara,
        currentSurah,
        currentAyah,
        currentLessonDescription,
        currentSaatSabak,
        currentAmukhta,
        totalCompletedParas: stage === 'hifz' ? totalCompletedParas : 0,
        completedParas: stage === 'hifz' ? Array.from({ length: totalCompletedParas }, (_, i) => i + 1) : [],
        assignedTeacherId,
        assignedTeacherName: teacher?.fullNameBn || (branch === 'mohila' ? 'হাফেজা আয়েশা সিদ্দিকা' : 'হাফেজ ক্বারী ওমর ফারুক'),
        status: 'active',
        startedDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: targetDate,
        notes,
        guardianMobile,
        guardianName,
        averageRating: 4.8,
        lowProgressAlert: false,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                নতুন শিক্ষার্থী অন্তর্ভুক্তি ও সবক বরাদ্দ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                কায়দা, আমপারা, নাজরা ও হিফজ শাখায় শিক্ষার্থী তালিকাভুক্তি
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Branch & Stage Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ নির্বাচন *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as HifzBranch)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="boys">হিফজুল কুরআন (ছাত্র শাখা)</option>
                <option value="mohila">মহিলা হিফজ বিভাগ (ছাত্রী শাখা)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                মারহালা / স্তর *
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as HifzStage)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="qaida">📖 ১. কায়দা (নূরানী স্তর)</option>
                <option value="ampara">📗 ২. আমপারা (৩০তম পারা স্তর)</option>
                <option value="nazra">📘 ৩. নাজরা (নাজেরা কুরআন স্তর)</option>
                <option value="hifz">🏆 ৪. হিফজ (হিফজুল কুরআন স্তর)</option>
                <option value="revision">🔄 ৫. রিভিশন (দাওরুল কুরআন স্তর)</option>
              </select>
            </div>
          </div>

          {/* Student selection or manual entry */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              বিদ্যমান শিক্ষার্থী নির্বাচন করুন (ঐচ্ছিক)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- নতুন ম্যানুয়াল শিক্ষার্থী এন্ট্রি --</option>
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.fullNameBn} ({std.studentId}) - {std.className} | রোল: {std.rollNumber}
                </option>
              ))}
            </select>
          </div>

          {!selectedStudentId && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থীর নাম *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="যেমন: মুহাম্মদ তাওহীদ"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required={!selectedStudentId}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রোল নম্বর *
                </label>
                <input
                  type="text"
                  value={manualRoll}
                  onChange={(e) => setManualRoll(e.target.value)}
                  placeholder="যেমন: ০৫"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required={!selectedStudentId}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অভিভাবকের নাম
                </label>
                <input
                  type="text"
                  value={manualGuardian}
                  onChange={(e) => setManualGuardian(e.target.value)}
                  placeholder="যেমন: মোঃ জাহিদুল করিম"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অভিভাবক মোবাইল
                </label>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Student Photo Upload */}
          <StudentPhotoUploader
            photo={manualPhoto}
            onChange={setManualPhoto}
            gender={branch === 'mohila' ? 'female' : 'male'}
            label={isBn ? 'হিফজ শিক্ষার্থীর ছবি নির্বাচন / আপলোড' : 'Student Photo Upload'}
            hint={isBn ? 'হিফজ শিক্ষার্থীর ছবি ক্যামেরা বা ফাইল থেকে আপলোড করুন' : 'Upload student photo from device or camera.'}
          />

          {/* Sabaq, Saat Sabaq & Amukhta Initial values */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              প্রাথমিক ছবক, সাত ছবক ও আমুক্তা নির্ধারণ
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ১. বর্তমান নতুন ছবক (Sabaq) *
              </label>
              <input
                type="text"
                value={currentLessonDescription}
                onChange={(e) => setCurrentLessonDescription(e.target.value)}
                placeholder="যেমন: পারা ১৯ - সূরা আল-ফুরকান ২১-৩৪ আয়াত"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ২. সাত ছবক (ছবকী)
                </label>
                <input
                  type="text"
                  value={currentSaatSabak}
                  onChange={(e) => setCurrentSaatSabak(e.target.value)}
                  placeholder="যেমন: পূর্ববর্তী ৫ পৃষ্ঠা"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৩. আমুক্তা (মনজিল)
                </label>
                <input
                  type="text"
                  value={currentAmukhta}
                  onChange={(e) => setCurrentAmukhta(e.target.value)}
                  placeholder="যেমন: ৫ম পারা সম্পূর্ণ"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {stage === 'hifz' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বর্তমান পারা নম্বর
                  </label>
                  <select
                    value={currentPara}
                    onChange={(e) => setCurrentPara(Number(e.target.value))}
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
                    পূর্বে সম্পন্ন পারা সংখ্যা
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={totalCompletedParas}
                    onChange={(e) => setTotalCompletedParas(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                তত্ত্বাবধায়ক উস্তায / শিক্ষিকা
              </label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {branch === 'mohila' ? (
                  <>
                    <option value="usr-005">হাফেজা আয়েশা সিদ্দিকা</option>
                    <option value="usr-006">হাফেজা খাদিজা বেগম</option>
                  </>
                ) : (
                  <>
                    <option value="usr-004">হাফেজ ক্বারী ওমর ফারুক</option>
                    <option value="usr-007">হাফেজ মাওলানা মাহমুদ হাসান</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Actions */}
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
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer"
            >
              {isSubmitting ? 'তালিকাভুক্ত হচ্ছে...' : 'তালিকাভুক্ত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

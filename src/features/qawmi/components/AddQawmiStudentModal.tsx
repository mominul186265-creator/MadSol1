import React, { useState } from 'react';
import {
  X,
  UserPlus,
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  Calendar,
  Building,
  Heart,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { QawmiBranch, QawmiClassItem, QawmiStudentItem } from '../types/qawmi';
import { INITIAL_MOHILA_QAWMI_CLASSES } from '../data/mohilaQawmiData';
import { INITIAL_QAWMI_CLASSES } from './QawmiClassesTab';
import { StudentPhotoUploader } from '../../../components/common/StudentPhotoUploader';

interface AddQawmiStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch?: QawmiBranch;
  mode?: 'qawmi' | 'noorani';
  customBoysClasses?: QawmiClassItem[];
  customGirlsClasses?: QawmiClassItem[];
  onStudentAdded?: (newStudent: QawmiStudentItem, classId: string, branch: QawmiBranch) => void;
}

const DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'ময়মনসিংহ', 'রাজশাহী', 'রংপুর', 'খুলনা', 'বরিশাল',
  'ব্রাহ্মণবাড়িয়া', 'নরসিংদী', 'কিশোরগঞ্জ', 'গাজীপুর', 'টাঙ্গাইল', 'ফেনী', 'কুমিল্লা',
  'নোয়াখালী', 'চাঁদপুর', 'বগুড়া', 'হবিগঞ্জ', 'জামালপুর', 'নেত্রকোণা', 'ফরিদপুর', 'কক্সবাজার'
];

export const AddQawmiStudentModal: React.FC<AddQawmiStudentModalProps> = ({
  isOpen,
  onClose,
  currentBranch = 'boys',
  mode = 'qawmi',
  customBoysClasses,
  customGirlsClasses,
  onStudentAdded,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const isNoorani = mode === 'noorani';

  const [branch, setBranch] = useState<QawmiBranch>(currentBranch);
  const isMohila = branch === 'mohila';

  const boysData = customBoysClasses || INITIAL_QAWMI_CLASSES;
  const girlsData = customGirlsClasses || INITIAL_MOHILA_QAWMI_CLASSES;
  const availableClasses = isMohila ? girlsData : boysData;
  const [selectedClassId, setSelectedClassId] = useState<string>(availableClasses[0].id);

  const selectedClass = availableClasses.find((c) => c.id === selectedClassId) || availableClasses[0];

  // Form Fields
  const [nameBn, setNameBn] = useState('');
  const [fatherNameBn, setFatherNameBn] = useState('');
  const [motherNameBn, setMotherNameBn] = useState('');
  const [mobile, setMobile] = useState('');
  const [districtBn, setDistrictBn] = useState('ঢাকা');
  const [villageAddress, setVillageAddress] = useState('');
  const [isResidential, setIsResidential] = useState(true);
  const [isHafez, setIsHafez] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [previousInstitute, setPreviousInstitute] = useState('');
  const [admissionFee, setAdmissionFee] = useState<number>(2000);
  const [monthlyFee, setMonthlyFee] = useState<number>(3500);
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Sync branch when currentBranch prop updates
  React.useEffect(() => {
    setBranch(currentBranch);
    const classes = currentBranch === 'mohila' ? girlsData : boysData;
    setSelectedClassId(classes[0].id);
  }, [currentBranch, girlsData, boysData]);

  if (!isOpen) return null;

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !fatherNameBn.trim()) return;

    const nextRoll = (selectedClass.studentCount || 30) + 1;
    const regPrefix = isNoorani ? (isMohila ? 'NRN-F' : 'NRN') : (isMohila ? 'QWM-F' : 'QWM');
    const regId = `${regPrefix}-${selectedClass.order.toString().padStart(2, '0')}-${nextRoll.toString().padStart(3, '0')}`;

    const newStudent: QawmiStudentItem = {
      id: `std-${selectedClass.id}-${Date.now()}`,
      roll: nextRoll,
      nameBn: nameBn.trim(),
      fatherNameBn: fatherNameBn.trim(),
      regId,
      mobile: mobile.trim() || '০১৭০০০০০০০০',
      districtBn,
      isResidential,
      isHafez,
      attendancePct: 100,
      status: 'active',
      photoUrl: photo || undefined,
    };

    if (onStudentAdded) {
      onStudentAdded(newStudent, selectedClass.id, branch);
    }

    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      onClose();
      // Reset form
      setNameBn('');
      setFatherNameBn('');
      setMotherNameBn('');
      setMobile('');
      setVillageAddress('');
      setPhoto('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      {/* Success Notification */}
      {isSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-80 w-[90%] max-w-md p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-2xl shadow-emerald-950 animate-in slide-in-from-top">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              {isMohila ? 'ছাত্রী সফলভাবে ভর্তি করা হয়েছে!' : 'ছাত্র সফলভাবে ভর্তি করা হয়েছে!'}
            </span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 border border-emerald-500/40">
            রোল #{toBnNum((selectedClass.studentCount || 30) + 1)}
          </span>
        </div>
      )}

      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isMohila
                  ? 'bg-rose-600 shadow-rose-950/60'
                  : 'bg-emerald-600 shadow-emerald-950/60'
              }`}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>
                  {isNoorani
                    ? (isMohila ? 'নূরানী মহিলা শাখায় নতুন ছাত্রী ভর্তি' : 'নূরানী শাখায় নতুন ছাত্র ভর্তি')
                    : (isMohila ? 'কওমী মহিলা শাখায় নতুন ছাত্রী ভর্তি' : 'কওমী শাখায় নতুন ছাত্র ভর্তি')}
                </span>
                <span
                  className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold border ${
                    isMohila
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isMohila ? 'মহিলা শাখা (ছাত্রী)' : 'ছাত্র শাখা'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isNoorani
                  ? 'প্লে থেকে ৫ম শ্রেণীর যেকোনো জামাত নির্বাচন করে শিক্ষার্থীর তথ্য পূরণ করুন'
                  : 'জামাত নির্বাচন করে শিক্ষার্থীর প্রাতিষ্ঠানিক তথ্য ও অভিভাবকের বিবরণ পূরণ করুন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Branch Switcher Inside Form */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>ভর্তি শাখা নির্বাচন:</span>
            </span>

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setBranch('boys');
                  setSelectedClassId(boysData[0].id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  branch === 'boys'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{isNoorani ? 'নূরানী (ছাত্র শাখা)' : 'কওমী (ছাত্র শাখা)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBranch('mohila');
                  setSelectedClassId(girlsData[0].id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  branch === 'mohila'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>মহিলা শাখা (ছাত্রী)</span>
              </button>
            </div>
          </div>

          {/* 1. Target Class Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              ভর্তি হতে ইচ্ছুক জামাত / স্তর <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-slate-900 text-white py-1">
                  #{toBnNum(cls.order)}. {cls.nameBn} — {cls.marhalaBn} ({cls.govEquivalentBn})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 flex items-center justify-between">
              <span>মুদাররিস: <strong>{selectedClass.headTeacherBn}</strong></span>
              <span>মোট পাঠ্য কিতাব: <strong>{toBnNum(selectedClass.kitabs.length)} টি</strong></span>
              <span>বর্তমান রোল হবে: <strong>#{toBnNum((selectedClass.studentCount || 30) + 1)}</strong></span>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{isMohila ? 'ছাত্রীর ব্যক্তিগত তথ্য' : 'ছাত্রের ব্যক্তিগত তথ্য'}</span>
            </h3>

            {/* Photo Uploader */}
            <StudentPhotoUploader
              photo={photo}
              onChange={setPhoto}
              gender={isMohila ? 'female' : 'male'}
              label={isMohila ? 'ছাত্রীর ছবি নির্বাচন / আপলোড' : 'ছাত্রের ছবি নির্বাচন / আপলোড'}
              hint={isBn ? 'ভর্তির জন্য ছবি ডিভাইস বা ক্যামেরা থেকে সিলেক্ট করুন' : 'Select photo from device or camera'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {isMohila ? 'ছাত্রীর পূর্ণ নাম (বাংলায়)' : 'ছাত্রের পূর্ণ নাম (বাংলায়)'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder={isMohila ? 'উদা: আয়েশা সিদ্দিকা' : 'উদা: মুহাম্মাদ আব্দুল্লাহ'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  পিতার নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fatherNameBn}
                  onChange={(e) => setFatherNameBn(e.target.value)}
                  placeholder="উদা: মাওলানা মুহাম্মদ আলী"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">মাতার নাম</label>
                <input
                  type="text"
                  value={motherNameBn}
                  onChange={(e) => setMotherNameBn(e.target.value)}
                  placeholder="উদা: ফাতেমা বেগম"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  অভিভাবকের মোবাইল নম্বর <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">নিজ জেলা</label>
                <select
                  value={districtBn}
                  onChange={(e) => setDistrictBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">গ্রাম ও ডাকঘর / ঠিকানা</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={villageAddress}
                    onChange={(e) => setVillageAddress(e.target.value)}
                    placeholder="গ্রাম, ডাকঘর, উপজেলা"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Academic & Boarding Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Residential Status */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
              <span className="text-xs font-bold text-slate-300">আবাসন ব্যবস্থা</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsResidential(true)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isResidential
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  আবাসিক
                </button>
                <button
                  type="button"
                  onClick={() => setIsResidential(false)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    !isResidential
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  অনাবাসিক
                </button>
              </div>
            </div>

            {/* Hafez / Hafeza Status */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
              <span className="text-xs font-bold text-slate-300">
                {isMohila ? 'হাফেজা কিনা?' : 'হাফেজ কিনা?'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsHafez(true)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isHafez
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {isMohila ? 'হ্যাঁ (হাফেজা)' : 'হ্যাঁ (হাফেজ)'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHafez(false)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    !isHafez
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  না
                </button>
              </div>
            </div>

            {/* Blood Group */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
              <span className="text-xs font-bold text-slate-300">রক্তের গ্রুপ</span>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Financial & Admission Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">ভর্তি ফি (টাকা)</label>
              <input
                type="number"
                value={admissionFee}
                onChange={(e) => setAdmissionFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">মাসিক খোরাকি / বেতন (টাকা)</label>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-mono font-black text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">ভর্তির তারিখ</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-lg transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                isMohila
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isMohila ? 'ছাত্রী ভর্তি নিশ্চিত করুন' : 'ছাত্র ভর্তি নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

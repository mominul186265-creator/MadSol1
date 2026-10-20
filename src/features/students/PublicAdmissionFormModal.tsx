import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { IslamicPattern } from '../../components/common/IslamicPattern';

interface PublicAdmissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicAdmissionFormModal: React.FC<PublicAdmissionFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const { institution } = useAuth();
  const { submitOnlineAdmission } = useMadrasaData();

  const [formData, setFormData] = useState({
    applicantNameBn: '',
    applicantNameEn: '',
    appliedDepartment: 'হিফজুল কুরআন',
    appliedClass: 'নাজেরা / হিফজ প্রাথমিক',
    guardianName: '',
    guardianMobile: '',
    dateOfBirth: '2015-05-12',
    gender: 'male',
    bloodGroup: 'A+',
    address: '',
    previousSchool: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successApplicationNo, setSuccessApplicationNo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantNameBn.trim() || !formData.guardianName.trim() || !formData.guardianMobile.trim()) {
      setErrorMsg('অনুগ্রহ করে আবশ্যক তথ্যগুলো পূরণ করুন');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const app = await submitOnlineAdmission({
        institutionId: institution?.id || 'inst-001',
        applicantNameBn: formData.applicantNameBn.trim(),
        applicantNameEn: formData.applicantNameEn.trim() || formData.applicantNameBn.trim(),
        appliedDepartment: formData.appliedDepartment,
        appliedClass: formData.appliedClass,
        guardianName: formData.guardianName.trim(),
        guardianMobile: formData.guardianMobile.trim(),
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        address: formData.address,
      });

      setSuccessApplicationNo(app.applicationNumber);
    } catch (err) {
      setErrorMsg('আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Top */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 overflow-hidden">
          <IslamicPattern opacity={0.12} />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-semibold tracking-wider uppercase mb-1">
                পাবলিক অনলাইন ভর্তি পোর্টাল
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {institution?.nameBn || 'জামিয়া ইসলামিয়া দারুল উলুম'}
              </h3>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                শিক্ষাবর্ষ ২০২৬ (১৪৪৭-১৪৪৮ হি.) নতুন ছাত্র ভর্তি ফরম
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {successApplicationNo ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-400 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  ভর্তি আবেদন সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  আপনার আবেদন নম্বরটি সংরক্ষণ করুন। কর্তৃপক্ষ যাচাইপূর্বক আপনার প্রদত্ত মোবাইল নম্বরে এসএমএস প্রদান করবে।
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xs mx-auto">
                <span className="text-[11px] text-slate-500 block">আপনার আবেদন ট্র্যাকিং নম্বর:</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {successApplicationNo}
                </span>
              </div>

              <div className="pt-2">
                <Button variant="primary" onClick={onClose} className="text-xs">
                  পোর্টালে ফিরে যান
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Applicant Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (বাংলায়) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantNameBn}
                    onChange={(e) => setFormData({ ...formData, applicantNameBn: e.target.value })}
                    placeholder="যেমন: মুহাম্মদ ওমর ফারুক"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Student Full Name (English)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantNameEn}
                    onChange={(e) => setFormData({ ...formData, applicantNameEn: e.target.value })}
                    placeholder="e.g. Muhammad Omar Faruk"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Department & Class Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    আবেদিত বিভাগ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.appliedDepartment}
                    onChange={(e) => setFormData({ ...formData, appliedDepartment: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="হিফজুল কুরআন">হিফজুল কুরআন বিভাগ</option>
                    <option value="কিতাব বিভাগ">কিতাব বিভাগ (দরসে নিজামী)</option>
                    <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা বিভাগ</option>
                    <option value="দাওরায়ে হাদিস">দাওরায়ে হাদিস (মাস্টার্স)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শ্রেণি / জামাত
                  </label>
                  <input
                    type="text"
                    value={formData.appliedClass}
                    onChange={(e) => setFormData({ ...formData, appliedClass: e.target.value })}
                    placeholder="যেমন: মিজান / হেদায়া / হিফজ"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    অভিভাবকের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="পিতা বা অভিভাবকের নাম"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    অভিভাবকের মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.guardianMobile}
                    onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full font-mono p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* DOB & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জন্ম তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  বর্তমান ঠিকানা (গ্রাম, ডাকঘর, উপজেলা ও জেলা)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, মিরপুর-১১, ঢাকা"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  {isSubmitting ? 'জমা দেওয়া হচ্ছে...' : 'অনলাইন আবেদন জমা দিন'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

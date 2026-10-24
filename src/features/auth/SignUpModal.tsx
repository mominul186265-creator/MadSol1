import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  KeyRound,
  Smartphone,
  CheckCircle,
  Eye,
  EyeOff,
  Building2,
  User,
  GraduationCap,
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { madsolDb } from '../../lib/db';
import { InstitutionType } from '../../types/step1';
import { HuzoorMascot, MascotFocusField } from '../../components/auth/HuzoorMascot';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SignUpRole = 'director' | 'teacher' | 'guardian';

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { registerMuhtamim, registerWithPin } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const isBn = language === 'bn';

  // State
  const [selectedRole, setSelectedRole] = useState<SignUpRole>('director');
  const [activeField, setActiveField] = useState<MascotFocusField>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields - Common
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Fields - Muhtamim Specific
  const [madrasaName, setMadrasaName] = useState('');
  const [madrasaAddress, setMadrasaAddress] = useState('');
  const [madrasaType, setMadrasaType] = useState<InstitutionType>('madrasa');

  // Form Fields - Teacher & Guardian Specific
  const institutions = madsolDb.getInstitutions();
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || 'inst-001');
  const [accessPin, setAccessPin] = useState('');

  // Form Fields - Teacher Specific
  const [departmentOrSubject, setDepartmentOrSubject] = useState('');

  // Form Fields - Guardian Specific
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');

  // Success Screen State for Muhtamim
  const [createdMuhtamimResult, setCreatedMuhtamimResult] = useState<{
    madrasaName: string;
    teacherPin: string;
    guardianPin: string;
  } | null>(null);

  const [copiedTeacherPin, setCopiedTeacherPin] = useState(false);
  const [copiedGuardianPin, setCopiedGuardianPin] = useState(false);
  const [copiedShareMessage, setCopiedShareMessage] = useState(false);

  const resetForm = () => {
    setFullName('');
    setMobile('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMadrasaName('');
    setMadrasaAddress('');
    setAccessPin('');
    setDepartmentOrSubject('');
    setStudentName('');
    setStudentRoll('');
    setError('');
    setCreatedMuhtamimResult(null);
    setCopiedTeacherPin(false);
    setCopiedGuardianPin(false);
    setCopiedShareMessage(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(isBn ? 'আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!mobile.trim()) {
      setError(isBn ? 'মোবাইল নম্বর লিখুন।' : 'Please enter your mobile number.');
      return;
    }
    if (password.length < 6) {
      setError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError(isBn ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole === 'director') {
        if (!madrasaName.trim()) {
          setError(isBn ? 'মাদ্রাসার নাম লিখুন।' : 'Please enter madrasa name.');
          setIsLoading(false);
          return;
        }

        const res = await registerMuhtamim({
          name: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          password,
          madrasaName: madrasaName.trim(),
          madrasaAddress: madrasaAddress.trim() || undefined,
          madrasaType,
        });

        setIsLoading(false);

        if (res.success && res.teacherPin && res.guardianPin) {
          setCreatedMuhtamimResult({
            madrasaName: res.institution?.name || madrasaName,
            teacherPin: res.teacherPin,
            guardianPin: res.guardianPin,
          });
          showToast(
            isBn
              ? 'মাশাআল্লাহ! মাদ্রাসা ও মুহতামিম অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং এক্সেস পিন জেনারেট হয়েছে।'
              : 'Madrasa and Muhtamim account created! Access PINs generated.',
            'success'
          );
        } else {
          setError(res.message || (isBn ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.'));
        }
      } else {
        // Teacher or Guardian
        if (!accessPin.trim()) {
          setError(
            isBn
              ? `${selectedRole === 'teacher' ? 'শিক্ষক' : 'অভিভাবক'} এক্সেস পিন প্রদান করুন।`
              : 'Please provide access PIN.'
          );
          setIsLoading(false);
          return;
        }

        const res = await registerWithPin({
          role: selectedRole,
          institutionId: selectedInstId,
          accessPin: accessPin.trim(),
          name: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          password,
          studentName: selectedRole === 'guardian' ? studentName.trim() : departmentOrSubject.trim(),
          studentRoll: studentRoll.trim() || undefined,
        });

        setIsLoading(false);

        if (res.success) {
          showToast(
            isBn
              ? `এক্সেস পিন যাচাইকৃত! ${selectedRole === 'teacher' ? 'সহকারী শিক্ষক' : 'অভিভাবক'} হিসেবে সফলভাবে অ্যাকাউন্ট খোলা হয়েছে।`
              : 'PIN verified! Account registered successfully.',
            'success'
          );
          handleClose();
          onSuccess && onSuccess();
        } else {
          setError(res.message || (isBn ? 'এক্সেস পিন সঠিক নয় অথবা নিবন্ধন ব্যর্থ হয়েছে।' : 'PIN verification failed.'));
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || (isBn ? 'নিবন্ধন সম্পন্ন করতে সমস্যা হয়েছে।' : 'An error occurred.'));
    }
  };

  const copyToClipboard = (text: string, type: 'teacher' | 'guardian' | 'share') => {
    navigator.clipboard.writeText(text);
    if (type === 'teacher') {
      setCopiedTeacherPin(true);
      setTimeout(() => setCopiedTeacherPin(false), 2000);
    } else if (type === 'guardian') {
      setCopiedGuardianPin(true);
      setTimeout(() => setCopiedGuardianPin(false), 2000);
    } else {
      setCopiedShareMessage(true);
      setTimeout(() => setCopiedShareMessage(false), 2000);
    }
    showToast(isBn ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard!', 'success');
  };

  const currentSelectedInst = institutions.find((i) => i.id === selectedInstId);

  return (
    <Modal
      id="signup-modal"
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="3xl"
      title={
        createdMuhtamimResult
          ? isBn
            ? '🎉 স্বাগতম! এক্সেস পিন সফলভাবে তৈরি হয়েছে'
            : '🎉 Welcome! Access PINs Generated'
          : isBn
          ? 'MadSol নতুন অ্যাকাউন্ট সাইন আপ'
          : 'MadSol Account Sign Up'
      }
      description={
        createdMuhtamimResult
          ? isBn
            ? 'মুহতামিম হিসেবে আপনার মাদ্রাসার শিক্ষক ও অভিভাবকদের এই পিন প্রদান করুন।'
            : 'Share these access PINs with your teachers and guardians.'
          : isBn
          ? 'আপনার মাদ্রাসার নাম ও তথ্য প্রদান করে সরাসরি অ্যাকাউন্ট তৈরি করুন।'
          : 'Enter your madrasa name and director details to sign up.'
      }
    >
      {createdMuhtamimResult ? (
        /* Muhtamim Success Screen with Generated PINs */
        <div className="space-y-5 py-2">
          <div className="flex justify-center -mb-2">
            <HuzoorMascot
              activeField="submit"
              language={language}
              customTip={
                isBn
                  ? 'মাশাআল্লাহ! মাদ্রাসার পিন সফলভাবে তৈরি হয়েছে! শিক্ষক ও অভিভাবকদের পিন দিয়ে দিন 🎉'
                  : 'MashaAllah! Access PINs generated! Share them with teachers and guardians 🎉'
              }
            />
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center">
            <span className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle className="w-8 h-8" />
            </span>
            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
              {createdMuhtamimResult.madrasaName}
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              {isBn
                ? 'মুহতামিম / প্রধান পরিচালক হিসেবে আপনার অ্যাকাউন্ট সক্রিয় হয়েছে!'
                : 'Your Muhtamim / Director account has been activated!'}
            </p>
          </div>

          {/* Generated PIN Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Teacher Access PIN Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {isBn ? 'সহকারী শিক্ষক এক্সেস পিন' : 'Teacher Access PIN'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {isBn ? 'শিক্ষকদের জন্য' : 'For Teachers'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                  {isBn
                    ? 'সহকারী শিক্ষকরা সাইন আপ করার সময় এই ৬ ডিজিটের পিনটি ব্যবহার করবেন।'
                    : 'Teachers will enter this 6-digit PIN during registration.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/80">
                <span className="text-xl font-mono font-extrabold tracking-widest text-indigo-700 dark:text-indigo-300">
                  {createdMuhtamimResult.teacherPin}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdMuhtamimResult.teacherPin, 'teacher')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  {copiedTeacherPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTeacherPin ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Guardian Access PIN Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    {isBn ? 'অভিভাবক এক্সেস পিন' : 'Guardian Access PIN'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    {isBn ? 'অভিভাবকদের জন্য' : 'For Guardians'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                  {isBn
                    ? 'অভিভাবকরা সাইন আপ করে সন্তানের তথ্য দেখতে এই পিনটি ব্যবহার করবেন।'
                    : 'Guardians will enter this 6-digit PIN during registration.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80">
                <span className="text-xl font-mono font-extrabold tracking-widest text-amber-700 dark:text-amber-300">
                  {createdMuhtamimResult.guardianPin}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdMuhtamimResult.guardianPin, 'guardian')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-colors"
                >
                  {copiedGuardianPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGuardianPin ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Share SMS / WhatsApp Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold block">
                  {isBn ? 'পিন নোটিশ মেসেজ কপি করুন:' : 'Copy Onboarding Message:'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'শিক্ষক ও অভিভাবকদের হোয়াটসঅ্যাপ বা এসএমএসে পাঠানোর জন্য প্রস্তুত বার্তা।'
                    : 'Ready-to-send WhatsApp / SMS text for staff and parents.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const text = `আসসালামু আলাইকুম। ${createdMuhtamimResult.madrasaName}-এর MadSol অ্যাপে সাইন আপ করার এক্সেস পিন:\n👨‍🏫 সহকারী শিক্ষক পিন: ${createdMuhtamimResult.teacherPin}\n👨‍👩‍👦 অভিভাবক পিন: ${createdMuhtamimResult.guardianPin}\nসাইন আপ করতে অ্যাপে গিয়ে আপনার পিন বসিয়ে অ্যাকাউন্ট খুলুন। ধন্যবাদ।`;
                copyToClipboard(text, 'share');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              {copiedShareMessage ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShareMessage ? (isBn ? 'বার্তা কপি হয়েছে!' : 'Message Copied!') : (isBn ? 'সম্পূর্ণ বার্তা কপি করুন' : 'Copy Full Message')}</span>
            </button>
          </div>

          {/* Enter Dashboard Action */}
          <div className="pt-2">
            <Button
              id="signup-enter-dashboard-btn"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                handleClose();
                onSuccess && onSuccess();
              }}
              className="flex items-center justify-center gap-2"
            >
              <span>{isBn ? 'সরাসরি ড্যাশবোর্ডে প্রবেশ করুন' : 'Go to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-start gap-3 sm:gap-5 pt-1">
          {/* Huzoor Mascot Standing on Left Side of Sign Up Form */}
          <div className="shrink-0 flex items-center justify-center">
            <HuzoorMascot
              activeField={activeField}
              language={language}
              size="sm"
            />
          </div>

          <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Madrasa Information Fields */}
            <div className="space-y-3.5">
              <div
                onFocus={() => setActiveField('madrasa-name')}
                onClick={() => setActiveField('madrasa-name')}
              >
                <Input
                  id="signup-madrasa-name"
                  label={isBn ? 'মাদ্রাসার নাম *' : 'Madrasa Name *'}
                  placeholder={isBn ? 'যেমন: দারুস সুন্নাহ ইসলামিয়া মাদ্রাসা' : 'e.g. Darus Sunnah Madrasa'}
                  value={madrasaName}
                  onChange={(e) => setMadrasaName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onFocus={() => setActiveField('signup')}
                  onClick={() => setActiveField('signup')}
                >
                  <Input
                    id="signup-director-name"
                    label={isBn ? 'মুহতামিম / পরিচালকের পূর্ণ নাম *' : 'Director Full Name *'}
                    placeholder={isBn ? 'যেমন: মাওলানা আব্দুল করিম' : 'e.g. Maulana Abdul Karim'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    leftIcon={<User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    required
                  />
                </div>
                <div
                  onFocus={() => setActiveField('mobile')}
                  onClick={() => setActiveField('mobile')}
                >
                  <Input
                    id="signup-director-mobile"
                    label={isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    placeholder={isBn ? 'যেমন: 01712345678' : 'e.g. 01712345678'}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    leftIcon={<Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onFocus={() => setActiveField('madrasa-name')}
                  onClick={() => setActiveField('madrasa-name')}
                >
                  <Input
                    id="signup-director-email"
                    label={isBn ? 'ইমেইল ঠিকানা (ঐচ্ছিক)' : 'Email (Optional)'}
                    placeholder={isBn ? 'director@madrasa.edu.bd' : 'director@madrasa.edu.bd'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div
                  onFocus={() => setActiveField('madrasa-name')}
                  onClick={() => setActiveField('madrasa-name')}
                >
                  <Input
                    id="signup-director-address"
                    label={isBn ? 'মাদ্রাসার ঠিকানা' : 'Madrasa Address'}
                    placeholder={isBn ? 'যেমন: রোড #৩, মিরপুর-১০, ঢাকা' : 'e.g. Mirpur, Dhaka'}
                    value={madrasaAddress}
                    onChange={(e) => setMadrasaAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                className="relative"
                onFocus={() => setActiveField(showPassword ? 'password-peek' : 'password')}
                onClick={() => setActiveField(showPassword ? 'password-peek' : 'password')}
              >
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  label={isBn ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'Password *'}
                  placeholder={isBn ? 'গোপন পাসওয়ার্ড লিখুন' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    const next = !showPassword;
                    setShowPassword(next);
                    setActiveField(next ? 'password-peek' : 'password');
                  }}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div
                onFocus={() => setActiveField(showPassword ? 'password-peek' : 'password')}
                onClick={() => setActiveField(showPassword ? 'password-peek' : 'password')}
              >
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  label={isBn ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                  placeholder={isBn ? 'পুনরায় পাসওয়ার্ড লিখুন' : 'Re-enter password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                id="signup-cancel-btn"
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>

              <div
                onMouseEnter={() => setActiveField('submit')}
                onFocus={() => setActiveField('submit')}
                onMouseLeave={() => setActiveField('signup')}
              >
                <Button
                  id="signup-submit-btn"
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="min-w-[140px] shadow-sm font-bold"
                >
                  {isLoading
                    ? isBn
                      ? 'নিবন্ধন করা হচ্ছে...'
                      : 'Registering...'
                    : selectedRole === 'director'
                    ? isBn
                      ? 'মাদ্রাসা ও অ্যাকাউন্ট খুলুন ➔'
                      : 'Register Madrasa & Director ➔'
                    : isBn
                    ? 'পিন যাচাই করে সাইন আপ ➔'
                    : 'Verify PIN & Sign Up ➔'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Globe,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Building2,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb } from '../../lib/db';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ProfilePhotoUploadModal } from '../../components/common/ProfilePhotoUploadModal';

export const Step1SettingsView: React.FC = () => {
  const { user, institution, changePassword, updateProfile, refreshData } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // DB Reset Dialog
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  // Profile Photo Upload Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast(language === 'bn' ? 'নাম প্রদান করুন।' : 'Name is required.', 'error');
      return;
    }

    setIsSavingProfile(true);
    const res = await updateProfile({ name, mobile, email });
    setIsSavingProfile(false);

    if (res.success) {
      showToast(
        language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।' : 'Profile saved successfully.',
        'success'
      );
    } else {
      showToast(res.message || 'Error updating profile', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPass || !newPass || !confirmPass) {
      showToast(
        language === 'bn' ? 'সকল পাসওয়ার্ড ফিল্ড পূরণ করুন।' : 'Please fill all password fields.',
        'error'
      );
      return;
    }

    if (newPass.length < 6) {
      showToast(
        language === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
        'error'
      );
      return;
    }

    if (newPass !== confirmPass) {
      showToast(
        language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'New passwords do not match.',
        'error'
      );
      return;
    }

    setIsSavingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsSavingPass(false);

    if (res.success) {
      showToast(
        language === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত ও ডাটাবেজে এনক্রিপ্ট করা হয়েছে!'
          : 'Password updated and securely hashed!',
        'success'
      );
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      showToast(res.message || 'Error changing password', 'error');
    }
  };

  const handleResetDatabase = () => {
    madsolDb.resetDatabase();
    refreshData();
    showToast(
      language === 'bn'
        ? 'ডাটাবেজ সফলভাবে ডিফল্ট সিড ডাটাতে রিসেট করা হয়েছে।'
        : 'Database reset to default seed data successfully.',
      'success'
    );
    setIsResetDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>{language === 'bn' ? 'সেটিংস ও নিরাপত্তা' : 'Settings & Security'}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'bn'
            ? 'প্রোফাইল তথ্য, পাসওয়ার্ড পরিবর্তন, ভাষা ও সিস্টেম থিম পছন্দসমূহ'
            : 'Manage personal profile, secure password, language and appearance'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{language === 'bn' ? 'পাসওয়ার্ড ও নিরাপত্তা' : 'Security'}</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'bn' ? 'ভাষা ও থিম' : 'Preferences'}</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                id="profile-name-input"
                label={language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="profile-mobile-input"
                  label={language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
                <Input
                  id="profile-email-input"
                  type="email"
                  label={language === 'bn' ? 'ইমেইল' : 'Email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button id="profile-save-btn" variant="primary" type="submit" isLoading={isSavingProfile}>
                  {language === 'bn' ? 'তথ্য হালনাগাদ করুন' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 font-bold text-xl flex items-center justify-center overflow-hidden border-2 border-emerald-500/40 shadow-xs">
                    {user?.avatarUrl || user?.photo ? (
                      <img src={user.avatarUrl || user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name.charAt(0) || 'M'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900 cursor-pointer transition-transform active:scale-90"
                    title={language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change photo'}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 capitalize font-medium">{user?.role_id}</p>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div>
                  <span className="font-semibold">{language === 'bn' ? 'প্রতিষ্ঠান:' : 'Institution:'}</span>{' '}
                  {institution?.name}
                </div>
                <div>
                  <span className="font-semibold">{language === 'bn' ? 'ইউজার আইডি:' : 'User ID:'}</span>{' '}
                  {user?.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {language === 'bn'
                ? 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে। এটি সল্টেড SHA-256 হ্যাশ দিয়ে এনক্রিপ্ট হবে।'
                : 'Your password is automatically encrypted using salted SHA-256.'}
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <Input
                  id="current-password-input"
                  type={showCurrentPass ? 'text' : 'password'}
                  label={language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="new-password-input"
                  type={showNewPass ? 'text' : 'password'}
                  label={language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                id="confirm-password-input"
                type={showNewPass ? 'text' : 'password'}
                label={language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button id="save-password-btn" variant="primary" type="submit" isLoading={isSavingPass}>
                  {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'নিরাপত্তা নীতিমালা' : 'Security Policy'}</span>
              </div>
              <p className="leading-relaxed">
                {language === 'bn'
                  ? 'MadSol-এ কোনো পাসওয়ার্ড প্লেইন টেক্সটে সংরক্ষিত হয় না। প্রতিটি পাসওয়ার্ড ক্রিপ্টোগ্রাফিক সল্ট ও SHA-256 দিয়ে ওয়ান-ওয়ে হ্যাশ করা হয়।'
                  : 'Zero plain-text storage. Every password is hashed with cryptographic salt & SHA-256.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Language & Theme Preferences */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Preference */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>{language === 'bn' ? 'সিস্টেম ভাষা (Language)' : 'System Language'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'বাংলা অথবা ইংরেজি নির্বাচন করুন। পুরো ইন্টারফেস সাথে সাথে পরিবর্তিত হবে।'
                : 'Select Bangla or English. Changes apply instantly.'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="pref-lang-bn"
                onClick={() => setLanguage('bn')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === 'bn'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-lg mb-1">🇧🇩</div>
                <div className="text-sm">বাংলা (Bangla)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">মাদ্রাসা বন্ধুত্বপূর্ণ ফন্ট ও ইন্টারফেস</div>
              </button>

              <button
                id="pref-lang-en"
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === 'en'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-lg mb-1">🇬🇧</div>
                <div className="text-sm">English</div>
                <div className="text-[10px] text-slate-400 mt-0.5">International standard UI</div>
              </button>
            </div>
          </div>

          {/* Theme Preference */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>{language === 'bn' ? 'থিম ও ডার্ক মোড' : 'Theme & Dark Mode'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'লাইট, ডার্ক অথবা আপনার ডিভাইসের সিস্টেম সেটিংস অনুযায়ী স্বয়ংক্রিয় থিম নির্বাচন করুন।'
                : 'Choose Light, Dark, or System mode.'}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                id="pref-theme-light"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <div className="text-xs">{language === 'bn' ? 'লাইট' : 'Light'}</div>
              </button>

              <button
                id="pref-theme-dark"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <div className="text-xs">{language === 'bn' ? 'ডার্ক' : 'Dark'}</div>
              </button>

              <button
                id="pref-theme-system"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Laptop className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <div className="text-xs">{language === 'bn' ? 'সিস্টেম' : 'System'}</div>
              </button>
            </div>
          </div>

          {/* Seed Data Reset Tool */}
          <div className="lg:col-span-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'ডাটাবেজ ডিফল্ট রিসেট (টেস্টিং টুল)' : 'Database Reset Tool'}</span>
              </h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1 max-w-xl">
                {language === 'bn'
                  ? 'যদি আপনি পরীক্ষা করার সুবিধার্থে ডাটাবেজ পুনরায় প্রাথমিক ২ প্রতিষ্ঠান ও ৭টি রোলের ডিফল্ট ইউজার ডাটাতে ফিরিয়ে নিতে চান।'
                  : 'Reset the database back to clean seed data for testing.'}
              </p>
            </div>

            <Button
              id="reset-db-btn"
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/40 shrink-0"
            >
              {language === 'bn' ? 'ডাটাবেজ রিসেট করুন' : 'Reset Database'}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetDatabase}
        title={language === 'bn' ? 'ডাটাবেজ রিসেট নিশ্চিতকরণ' : 'Confirm Database Reset'}
        message={
          language === 'bn'
            ? 'আপনি কি নিশ্চিত যে ডাটাবেজ প্রাথমিক সিড ডাটাতে রিসেট করতে চান? আপনার কাস্টম তৈরি করা তথ্য রিসেট হয়ে ডিফল্ট ডাটা ফিরে আসবে।'
            : 'Are you sure you want to reset the database to default seed data?'
        }
        confirmText={language === 'bn' ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset'}
        variant="danger"
      />

      {/* Profile Photo Upload Modal */}
      {user && (
        <ProfilePhotoUploadModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          currentPhoto={user.avatarUrl || user.photo}
          userName={user.name}
          onSave={async (photoData) => {
            return updateProfile({ avatarUrl: photoData, photo: photoData });
          }}
        />
      )}
    </div>
  );
};

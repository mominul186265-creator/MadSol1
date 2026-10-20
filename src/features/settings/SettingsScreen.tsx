import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ROLES_DATA } from '../../data/initialData';
import {
  Globe,
  Sun,
  Moon,
  Laptop,
  Lock,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface SettingsScreenProps {
  onOpenRoleSwitcher: () => void;
  onOpenDbViewer: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenRoleSwitcher,
  onOpenDbViewer,
}) => {
  const { user, institution, changePassword } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  const roleMeta = user ? ROLES_DATA[user.role] : null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError(language === 'bn' ? 'সকল ফিল্ড পূরণ করুন।' : 'Please fill all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError(
        language === 'bn'
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(t.settings.passwordMismatch);
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      showToast(t.settings.passwordChangeSuccess, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError(res.message || t.settings.invalidCurrentPassword);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Settings Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* User Profile Card */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.profileDetails}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'আপনার ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্য'
                : 'Your identity and RBAC authorization attributes'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-amber-300 font-extrabold text-lg flex items-center justify-center border border-emerald-600/40">
                  {user.fullNameBn.charAt(0) || 'M'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {language === 'bn' ? user.fullNameBn : user.fullNameEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {user.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="md" hasDot>
                  {roleMeta ? (language === 'bn' ? roleMeta.nameBn : roleMeta.nameEn) : user.role}
                </Badge>
                <Button
                  id="settings-switch-role-btn"
                  variant="outline"
                  size="sm"
                  onClick={onOpenRoleSwitcher}
                >
                  {language === 'bn' ? 'রোল টেস্ট ড্রাইভ' : 'Switch Role'}
                </Button>
              </div>
            </div>

            {/* Institution summary */}
            {institution && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {language === 'bn' ? institution.nameBn : institution.nameEn}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono">
                    EIIN: {institution.eiinNumber} • {institution.phone}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Language & Theme Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.languageSelection}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'অ্যাপ্লিকেশনের ভাষা পরিবর্তন করুন'
                : 'Select UI display language'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <button
              onClick={() => setLanguage('bn')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                language === 'bn'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">🇧🇩 বাংলা (Bangla - ডিফল্ট)</span>
              {language === 'bn' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                language === 'en'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">🇬🇧 English (ইংরেজি)</span>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          </CardContent>
        </Card>

        {/* Theme Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.themeSelection}</CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'লাইট অথবা ডার্ক মোড বেছে নিন'
                : 'Choose Light, Dark, or System mode'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t.theme.light}</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>{t.theme.dark}</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-medium transition-all ${
                  theme === 'system'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Laptop className="w-4 h-4 text-slate-400" />
                <span>{t.theme.system}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.changePassword}</CardTitle>
          <CardDescription>
            {language === 'bn'
              ? 'নিয়মিত পাসওয়ার্ড পরিবর্তন আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করে'
              : 'Keep your credentials secured by changing your password periodically'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              id="settings-current-password"
              type="password"
              label={t.settings.currentPassword}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              id="settings-new-password"
              type="password"
              label={t.settings.newPassword}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Input
              id="settings-confirm-password"
              type="password"
              label={t.settings.confirmNewPassword}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passError}
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Button
              id="save-password-btn"
              type="submit"
              variant="primary"
              isLoading={isChangingPass}
            >
              {t.settings.savePasswordButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

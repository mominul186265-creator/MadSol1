import React, { useState, useEffect } from 'react';
import { MadSolLogo } from '../../components/common/MadSolLogo';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { SignUpModal } from './SignUpModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  Smartphone,
  Lock,
  Globe,
  Sun,
  Moon,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const isBn = language === 'bn';

  const [isPulling, setIsPulling] = useState(true);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  // Initial pull-in animation on mount
  useEffect(() => {
    setIsPulling(true);
    const timer = setTimeout(() => {
      setIsPulling(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      setError(
        isBn
          ? 'ইমেইল বা মোবাইল এবং পাসওয়ার্ড প্রদান করুন।'
          : 'Please enter your email/mobile and password.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        isBn
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setIsLoading(true);
    const result = await login(trimmedId, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      showToast(
        isBn ? 'সফলভাবে লগইন হয়েছে! স্বাগতম।' : 'Login successful! Welcome.',
        'success'
      );
      onSuccess && onSuccess();
    } else {
      const errMsg =
        result.message ||
        (isBn ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email or password.');
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans">
      <IslamicPattern opacity={0.06} />

      {/* Top Header: Brand Name + Language Switcher + Dark Mode */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs bg-white/40 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <MadSolLogo size="sm" showTagline={false} />
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              Smart Solution for Modern Madrasas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sign Up Button */}
          <button
            id="login-header-signup-btn"
            type="button"
            onClick={() => setIsSignUpModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isBn ? 'সাইন আপ' : 'Sign Up'}</span>
          </button>

          {/* Language Switcher */}
          <button
            id="login-lang-switch-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isBn ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="login-theme-switch-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10 max-w-lg mx-auto w-full">
        {/* Main Login Card */}
        <div
          className={`w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-950/10 p-4 sm:p-7 relative z-10 transition-all duration-300 ${
            isPulling ? 'animate-pull-in-card' : ''
          }`}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <MadSolLogo size="lg" showTagline={false} className="mb-2" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              MadSol
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Smart Solution for Modern Madrasas
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {isBn
                ? 'আধুনিক মাদ্রাসার সমন্বিত ক্লাউড ম্যানেজমেন্ট প্ল্যাটফর্ম'
                : 'Integrated Cloud Platform for Educational Institutions'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="transition-transform duration-200 focus-within:scale-[1.01]">
              <Input
                id="login-identifier-input"
                label={isBn ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}
                placeholder={isBn ? 'যেমন: superadmin@madsol.app বা 01711111111' : 'e.g. superadmin@madsol.app'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                leftIcon={<Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                autoComplete="username"
                required
              />
            </div>

            <div className="relative transition-transform duration-200 focus-within:scale-[1.01]">
              <Input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                label={isBn ? 'পাসওয়ার্ড' : 'Password'}
                placeholder={isBn ? 'গোপন পাসওয়ার্ড লিখুন' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                autoComplete="current-password"
                hidePasswordToggle={true}
                required
              />
              <button
                id="login-show-hide-password-btn"
                type="button"
                tabIndex={-1}
                onClick={handleTogglePassword}
                className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
                title={showPassword ? (isBn ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (isBn ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                <input
                  id="login-remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 w-4 h-4 cursor-pointer"
                />
                <span>{isBn ? 'আমাকে মনে রাখুন' : 'Remember Me'}</span>
              </label>

              <button
                id="login-forgot-password-link"
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline focus:outline-none cursor-pointer"
              >
                {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </button>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="mt-2 text-sm font-bold shadow-md shadow-emerald-700/20"
            >
              {isLoading
                ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Signing in...')
                : (isBn ? 'লগইন করুন ➔' : 'Sign In ➔')}
            </Button>
          </form>

          {/* New Account / Sign Up Banner */}
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 transition-colors hover:border-emerald-400">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {isBn ? 'নতুন মাদ্রাসা অ্যাকাউন্ট সাইন আপ' : 'New Madrasa Sign Up'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5 leading-snug">
              {isBn
                ? 'আপনার মাদ্রাসার নাম ও পরিচালকের তথ্য দিয়ে সরাসরি সম্পূর্ণ নতুন অ্যাকাউন্ট খুলুন।'
                : 'Register your madrasa and start managing immediately.'}
            </p>
            <button
              id="login-card-signup-btn"
              type="button"
              onClick={() => setIsSignUpModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন মাদ্রাসার জন্য সাইন আপ করুন' : 'Sign Up for New Madrasa'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>© ২০২৬ MadSol • Smart Solution for Modern Madrasas</p>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={() => {
          showToast(
            isBn
              ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
              : 'Password reset successfully. Sign in with your new password.',
            'success'
          );
        }}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
};

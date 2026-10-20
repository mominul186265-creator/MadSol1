import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Smartphone, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { resetPasswordWithVerification } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError(language === 'bn' ? 'মোবাইল অথবা ইমেইল প্রদান করুন।' : 'Please enter mobile or email.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);

    showToast(
      language === 'bn'
        ? 'আপনার নম্বরে ভেরিফিকেশন কোড পাঠানো হয়েছে।'
        : 'Verification code sent to your mobile/email.',
      'success'
    );
    setStep(2);
    setOtp('1234'); // Pre-fill test code for convenience
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(
        language === 'bn'
          ? 'পাসওয়ার্ড দুটি মিলছে না।'
          : 'Passwords do not match.'
      );
      return;
    }

    setIsLoading(true);
    const res = await resetPasswordWithVerification(identifier, otp, newPassword);
    setIsLoading(false);

    if (res.success) {
      showToast(
        language === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে! এখন লগইন করুন।'
          : 'Password reset successfully. Sign in with your new password.',
        'success'
      );
      onSuccess();
      onClose();
      // Reset state
      setStep(1);
      setIdentifier('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(res.message || (language === 'bn' ? 'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.'));
    }
  };

  return (
    <Modal
      id="forgot-password-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Password Recovery'}
      description={
        language === 'bn'
          ? 'আপনার অ্যাকাউন্টে নিবন্ধিত মোবাইল নম্বর বা ইমেইল লিখুন। আমরা একটি ভেরিফিকেশন কোড পাঠাব।'
          : 'Enter your registered mobile or email to receive a verification code.'
      }
      maxWidth="md"
    >
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            id="reset-identifier-input"
            label={language === 'bn' ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Number or Email'}
            placeholder={language === 'bn' ? 'যেমন: 01711000111 অথবা email@example.com' : 'e.g. 01711000111 or email@example.com'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Smartphone className="w-4 h-4" />}
            error={error}
            autoFocus
            required
          />

          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold">💡 {language === 'bn' ? 'ভেরিফিকেশন নির্দেশনা:' : 'Verification Tip:'}</span>{' '}
            {language === 'bn'
              ? 'নিবন্ধিত যেকোনো ইমেইল বা ফোন নম্বর দিন (যেমন: superadmin@madsol.app)। টেস্ট ওটিপি কোড: ১২৩৪'
              : 'Enter any registered user email/phone. Test verification code: 1234'}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              id="send-otp-btn"
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              {language === 'bn' ? 'যাচাইকরণ কোড পাঠান' : 'Send Verification Code'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              {language === 'bn'
                ? 'আপনার দেওয়া ঠিকানায় ভেরিফিকেশন কোড পাঠানো হয়েছে।'
                : 'Verification code sent to your account.'}
            </span>
          </div>

          <Input
            id="reset-otp-input"
            label={language === 'bn' ? 'ভেরিফিকেশন কোড' : 'Verification Code'}
            placeholder={language === 'bn' ? '৪ ডিজিটের কোড (যেমন: 1234)' : '4-digit code (e.g. 1234)'}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          <div className="relative">
            <Input
              id="reset-new-password-input"
              type={showPassword ? 'text' : 'password'}
              label={language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
              placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড' : 'At least 6 characters'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            id="reset-confirm-password-input"
            type={showPassword ? 'text' : 'password'}
            label={language === 'bn' ? 'পাসওয়ার্ড নিশ্চিতকরণ' : 'Confirm Password'}
            placeholder={language === 'bn' ? 'পাসওয়ার্ড আবার লিখুন' : 'Re-enter password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error}
            required
          />

          <div className="flex items-center justify-between gap-2.5 pt-2">
            <Button variant="ghost" type="button" onClick={() => setStep(1)}>
              {language === 'bn' ? 'পেছনে যান' : 'Go Back'}
            </Button>
            <Button
              id="confirm-reset-password-btn"
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Reset Password'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

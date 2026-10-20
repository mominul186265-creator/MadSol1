import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { QrVerificationResult } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const QrVerificationView: React.FC = () => {
  const { language } = useLanguage();
  const { qrTokens, verifyQrToken } = usePart7System();

  const [inputToken, setInputToken] = useState('');
  const [verificationResult, setVerificationResult] = useState<QrVerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (tokenToVerify?: string) => {
    const token = (tokenToVerify || inputToken).trim();
    if (!token) return;

    const res = verifyQrToken(token);
    setVerificationResult(res);
    setHasSearched(true);
    if (!tokenToVerify) setInputToken('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MadSol Secure QR Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {language === 'bn' ? 'স্মার্ট কিউআর কোড ভেরিফিকেশন পোর্টাল' : 'Smart QR Verification Portal'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {language === 'bn'
            ? 'আইডি কার্ড, সনদপত্র ও অফিশিয়াল নথির কিউআর কোড বা সিকিউর টোকেন যাচাই করে তাৎক্ষণিক বৈধতা পরীক্ষা করুন'
            : 'Scan or input official document QR tokens for tamper-proof institutional validity checking'}
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <QrCode className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              required
              placeholder={
                language === 'bn'
                  ? 'কিউআর টোকেন কোড লিখুন (যেমন: MS-CERT-2026-000001-X9)...'
                  : 'Enter QR token code (e.g. MS-QR-STU-101-ABCD)...'
              }
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto px-6 py-3 shrink-0">
            <span>{language === 'bn' ? 'যাচাই করুন (Verify)' : 'Verify Token'}</span>
          </Button>
        </form>

        {/* Quick Sample Tokens */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">নমুনা টোকেন:</span>
          {qrTokens.slice(0, 3).map((token) => (
            <button
              key={token.token}
              type="button"
              onClick={() => handleVerify(token.token)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 font-mono text-[11px] transition-colors cursor-pointer"
            >
              {token.token}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {hasSearched && (
        <div
          className={`rounded-3xl border p-6 shadow-sm transition-all animate-in fade-in ${
            verificationResult?.isValid
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80'
              : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  verificationResult?.isValid
                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {verificationResult?.isValid ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3
                  className={`text-base sm:text-lg font-bold ${
                    verificationResult?.isValid
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {verificationResult?.isValid
                    ? language === 'bn'
                      ? 'অফিসিয়ালভাবে সত্যায়িত ও বৈধ রেকর্ড'
                      : 'Officially Verified & Valid Document'
                    : language === 'bn'
                    ? 'টোকেনটি অবৈধ বা বাতিলকৃত'
                    : 'Invalid or Revoked Token'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  যাচাইয়ের সময়: <strong>{verificationResult?.verifiedAt}</strong> • মোট স্ক্যান:{' '}
                  <strong>{verificationResult?.scanCount} বার</strong>
                </p>
              </div>
            </div>

            <Badge variant={verificationResult?.isValid ? 'emerald' : 'rose'} size="md">
              {verificationResult?.statusLabelBn || 'অসত্য'}
            </Badge>
          </div>

          {/* Details Table */}
          {verificationResult?.isValid ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">প্রতিষ্ঠানের নাম</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {verificationResult.institutionNameBn}
                </p>
                <p className="text-[11px] text-slate-500">{verificationResult.institutionNameEn}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">নথির মালিক বা বিষয়</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {verificationResult.subjectNameBn}
                </p>
                <p className="text-[11px] text-slate-500">
                  {verificationResult.className} • {verificationResult.identifier}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">নথির ধরন</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">
                  {verificationResult.type?.replace('_', ' ')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">ইস্যুর তারিখ</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {verificationResult.issuedDate || '২০২৬-০৩-১০'}
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-4 text-xs text-rose-800 dark:text-rose-300">
              {verificationResult?.messageBn ||
                'এই টোকেনটি ডাটাবেসে পাওয়া যায়নি অথবা সংশ্লিষ্ট প্রতিষ্ঠান কর্তৃক প্রত্যাহার করা হয়েছে।'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

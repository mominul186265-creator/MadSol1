import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  ScanLine,
  UserCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { AttendanceTargetType, DbAttendanceRecord } from '../../types/step4';
import { useLanguage } from '../../context/LanguageContext';

interface QrAttendanceScannerProps {
  targetType: AttendanceTargetType;
  canRecord: boolean;
  onScan: (code: string) => { success: boolean; message: string; record?: DbAttendanceRecord; targetName?: string };
  recentRecords: DbAttendanceRecord[];
}

interface ScanLogEntry {
  id: string;
  time: string;
  code: string;
  name: string;
  status: 'present' | 'late';
  success: boolean;
  message: string;
}

export const QrAttendanceScanner: React.FC<QrAttendanceScannerProps> = ({
  targetType,
  canRecord,
  onScan,
  recentRecords,
}) => {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

  const [inputCode, setInputCode] = useState<string>('');
  const [logs, setLogs] = useState<ScanLogEntry[]>([]);
  const [lastScanned, setLastScanned] = useState<{
    name: string;
    code: string;
    time: string;
    status: string;
    success: boolean;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = onScan(inputCode.trim());
    const nowTime = new Date().toTimeString().substring(0, 5);

    if (res.success && res.record) {
      setLastScanned({
        name: res.targetName || res.record.target_name_bn,
        code: res.record.target_code || inputCode,
        time: res.record.check_in_time || nowTime,
        status: res.record.status,
        success: true,
      });

      setLogs((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: nowTime,
          code: res.record!.target_code || inputCode,
          name: res.targetName || res.record!.target_name_bn,
          status: res.record!.status === 'late' ? 'late' : 'present',
          success: true,
          message: res.message,
        },
        ...prev.slice(0, 19),
      ]);
    } else {
      setLastScanned({
        name: '',
        code: inputCode,
        time: nowTime,
        status: 'error',
        success: false,
      });

      setLogs((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: nowTime,
          code: inputCode,
          name: 'অজানা',
          status: 'present',
          success: false,
          message: res.message,
        },
        ...prev.slice(0, 19),
      ]);
    }

    setInputCode('');
    inputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Scanner & Input Terminal */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'ডিজিটাল QR ও আইডি চেক-ইন' : 'Digital QR & ID Check-in'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetType === 'student'
                  ? isBn
                    ? 'শিক্ষার্থীর রোল নম্বর বা আইডি স্ক্যান করুন'
                    : 'Scan student roll or ID code'
                  : isBn
                  ? 'শিক্ষকের আইডি কোড বা মোবাইল স্ক্যান করুন'
                  : 'Scan teacher ID or phone number'}
              </p>
            </div>
          </div>

          {/* Virtual Scanner Card */}
          <div className="relative border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950/40 mb-5 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />

            <QrCode className="w-16 h-16 mx-auto text-emerald-600 dark:text-emerald-400 mb-3" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isBn ? 'বারকোড স্ক্যানার বা কীবোর্ড প্রস্তুত' : 'Barcode Scanner Ready'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              {isBn
                ? 'আইডি কার্ড স্ক্যান করলে অটো-এন্টার প্রেস হবে, অথবা নিচে টাইপ করে এন্টার চাপুন।'
                : 'Scanned barcode inputs automatically trigger check-in.'}
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                disabled={!canRecord}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={
                  targetType === 'student'
                    ? isBn
                      ? 'রোল নম্বর বা আইডি লিখুন (যেমন: H-24, std-101)...'
                      : 'Enter Roll or ID (e.g., H-24)...'
                    : isBn
                    ? 'শিক্ষক আইডি বা নম্বর লিখুন (যেমন: TCH-2024-001)...'
                    : 'Enter Teacher ID (e.g., TCH-2024-001)...'
                }
                className="w-full pl-4 pr-24 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/30 dark:border-emerald-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
              <button
                type="submit"
                disabled={!canRecord || !inputCode.trim()}
                className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {isBn ? 'চেক-ইন' : 'Check-In'}
              </button>
            </div>
          </form>

          {/* Instant Last Scanned Feedback Card */}
          {lastScanned && (
            <div
              className={`mt-5 p-4 rounded-2xl border transition-all ${
                lastScanned.success
                  ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60'
                  : 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                {lastScanned.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {lastScanned.success ? lastScanned.name : isBn ? 'ব্যর্থ হয়েছে' : 'Failed'}
                    </h4>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      {lastScanned.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                    ID: {lastScanned.code}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        lastScanned.status === 'late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : lastScanned.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {lastScanned.status === 'late'
                        ? isBn
                          ? 'বিলম্ব (Late)'
                          : 'Late'
                        : lastScanned.success
                        ? isBn
                          ? 'উপস্থিত (Present)'
                          : 'Present'
                        : isBn
                        ? 'অপরিচিত আইডি'
                        : 'Invalid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Check-in Feed / Logs */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-full min-h-[420px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'লাইভ চেক-ইন হিস্ট্রি' : 'Live Check-in Feed'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {logs.length} {isBn ? 'টি এন্ট্রি' : 'entries'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
            {logs.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs">{isBn ? 'এখনো কোনো চেক-ইন হয়নি' : 'No check-ins yet'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isBn
                    ? 'আইডি স্ক্যান বা ইনপুট দিলে এখানে তালিকাভুক্ত হবে।'
                    : 'Scanned entries will appear here.'}
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.success
                          ? log.status === 'late'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {log.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {log.code} • {log.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">
                      {log.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

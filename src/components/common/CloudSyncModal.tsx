import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  ShieldCheck,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Database,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cloudSync, CloudSyncStatus } from '../../lib/cloudSync';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user, institution, refreshData } = useAuth();

  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(cloudSync.getStatus());
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    return cloudSync.subscribe((s) => setSyncStatus(s));
  }, []);

  const handleManualBackup = async () => {
    setIsPushing(true);
    const res = await cloudSync.pushBackup(user?.email, user?.institution_id);
    setIsPushing(false);
    if (res.success) {
      showToast(isBn ? 'আপনার সকল ডেটা ও ডকুমেন্ট সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে।' : 'Data and documents backed up to cloud.', 'success');
    } else {
      showToast(res.message || (isBn ? 'ব্যাকআপ করতে ব্যর্থ হয়েছে।' : 'Backup failed.'), 'error');
    }
  };

  const handleManualRestore = async () => {
    const confirmRestore = window.confirm(
      isBn
        ? 'আপনি কি ক্লাউড সার্ভার থেকে সংরক্ষিত সকল ডকুমেন্ট ও ডেটা পুনরুদ্ধার করতে চান?'
        : 'Do you want to restore all saved documents and data from the cloud server?'
    );
    if (!confirmRestore) return;

    setIsPulling(true);
    const res = await cloudSync.pullAndRestore(user?.email, user?.institution_id);
    setIsPulling(false);

    if (res.success && res.restored) {
      refreshData();
      showToast(res.message || (isBn ? 'ডেটা ও ডকুমেন্ট সফলভাবে পুনরুদ্ধার হয়েছে।' : 'Data restored from cloud.'), 'success');
    } else {
      showToast(res.message || (isBn ? 'পুনরুদ্ধার করার মতো ক্লাউড ডেটা পাওয়া যায়নি।' : 'No cloud data to restore.'), 'info');
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await cloudSync.importBackupJson(file);
    if (res.success) {
      refreshData();
      showToast(res.message || (isBn ? 'ফাইল থেকে সফলভাবে ডেটা রিস্টোর হয়েছে।' : 'Restored successfully from file.'), 'success');
    } else {
      showToast(res.message || (isBn ? 'ফাইল ইমপোর্ট ব্যর্থ হয়েছে।' : 'Import failed.'), 'error');
    }

    if (e.target) e.target.value = '';
  };

  const formatLastSync = (isoStr: string | null) => {
    if (!isoStr) return isBn ? 'এখনও সিঙ্ক হয়নি' : 'Not synced yet';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString(isBn ? 'bn-BD' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Modal
      id="cloud-sync-vault-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={isBn ? 'ক্লাউড ব্যাকআপ ও ডেটা ভল্ট' : 'Cloud Backup & Data Vault'}
      description={
        isBn
          ? 'অ্যাপ আন-ইনস্টল করলেও যেন কোনো ডকুমেন্ট বা তথ্য না হারায়, সেজন্য ক্লাউড অটো-সিঙ্ক ব্যবস্থা।'
          : 'Permanent cloud synchronization protecting all your records across app re-installs.'
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-teal-500/10 border border-emerald-500/20 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                {isBn ? 'ক্লাউড সার্ভার পার্মানেন্ট স্টোরেজ সক্রিয়' : 'Cloud Permanent Storage Active'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {isBn ? 'সুরক্ষিত' : 'Secured'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {isBn
                ? 'আপনার মাদ্রাসার শিক্ষার্থী, শিক্ষক, ফাইল, সনদপত্র ও সকল ডকুমেন্ট স্বয়ংক্রিয়ভাবে কেন্দ্রীয় ক্লাউড ভল্টে সেভ হচ্ছে। মোবাইল পরিবর্তন বা অ্যাপ রি-ইনস্টল করলেও আপনার একাউন্টে লগইন করলেই সবকিছু ফিরে পাবেন।'
                : 'All your student records, documents, certificates and configurations are continuously synced to the cloud server.'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isBn ? 'মোট সংরক্ষিত মডিউল: ' : 'Saved Modules: '}
                  <strong className="text-slate-700 dark:text-slate-200">{syncStatus.totalKeys}টি</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isBn ? 'সর্বশেষ সিঙ্ক: ' : 'Last Synced: '}
                  <strong className="text-slate-700 dark:text-slate-200">{formatLastSync(syncStatus.lastSyncedAt)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Sync Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleManualBackup}
            disabled={isPushing}
            className="p-3.5 rounded-2xl border border-emerald-300/80 dark:border-emerald-800/80 bg-white dark:bg-slate-900 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-left transition-all shadow-xs flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              <CloudUpload className={`w-5 h-5 ${isPushing ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isPushing ? (isBn ? 'ক্লাউডে সেভ হচ্ছে...' : 'Saving to cloud...') : (isBn ? 'এখনই ক্লাউডে সেভ করুন' : 'Backup to Cloud Now')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'বর্তমান সব ডেটা ও ডকুমেন্টের ব্যাকআপ নিন' : 'Push latest database state to server'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleManualRestore}
            disabled={isPulling}
            className="p-3.5 rounded-2xl border border-blue-300/80 dark:border-blue-800/80 bg-white dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-left transition-all shadow-xs flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
              <CloudDownload className={`w-5 h-5 ${isPulling ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isPulling ? (isBn ? 'পুনরুদ্ধার হচ্ছে...' : 'Restoring...') : (isBn ? 'ক্লাউড থেকে ডেটা রিস্টোর করুন' : 'Restore from Cloud')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'সার্ভার থেকে পূর্বের সংরক্ষিত তথ্য নামিয়ে আনুন' : 'Pull latest backup from server'}
              </div>
            </div>
          </button>
        </div>

        {/* Offline File Backup & Restore (Local Device Safety) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isBn ? 'অফলাইন ব্যাকআপ ফাইল (.json)' : 'Offline Local Backup File (.json)'}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            {isBn
              ? 'অতিরিক্ত সতর্কতার জন্য আপনি চাইলে সম্পূর্ণ ডেটাবেসের একটি কপি নিজের মোবাইলের ডাউনলোড ফোল্ডারে সেভ করে রাখতে পারেন এবং যেকোনো সময় এই ফাইল দিয়ে ফিরিয়ে আনতে পারবেন।'
              : 'Export an encrypted JSON file directly to your device storage for offline retention.'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => cloudSync.exportBackupJson()}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              {isBn ? 'ফাইল ডাউনলোড করুন (.json)' : 'Download Backup File'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef?.click()}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              {isBn ? 'ফাইল থেকে রিস্টোর করুন' : 'Import from File'}
            </Button>

            <input
              type="file"
              accept=".json,application/json"
              ref={(r) => setFileInputRef(r)}
              className="hidden"
              onChange={handleFileImport}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
          <span>{isBn ? 'মাদসোল ক্লাউড ইঞ্জিন v2.0 • স্বয়ংক্রিয় ব্যাকআপ' : 'MadSol Cloud Engine v2.0 • Real-Time Sync'}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

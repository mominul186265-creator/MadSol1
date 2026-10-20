import React, { useState } from 'react';
import {
  X,
  Radio,
  Cpu,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Server,
  Activity,
  Trash2,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface BiometricDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceDevice {
  id: string;
  nameBn: string;
  deviceType: 'fingerprint' | 'rfid' | 'face_recognition';
  model: string;
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'syncing';
  location: string;
  lastSync: string;
  totalLogsToday: number;
}

export const BiometricDeviceModal: React.FC<BiometricDeviceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === 'bn';

  const [devices, setDevices] = useState<AttendanceDevice[]>([
    {
      id: 'dev-1',
      nameBn: 'মূল ফটক ফিঙ্গারপ্রিন্ট ও আরএফআইডি টার্মিনাল',
      deviceType: 'fingerprint',
      model: 'ZKTeco K40 Pro / RealTime T502',
      ipAddress: '192.168.1.201',
      port: 4370,
      status: 'online',
      location: 'মাদরাসার প্রধান ফটক (Main Gate)',
      lastSync: '২ মিনিট পূর্বে',
      totalLogsToday: 184,
    },
    {
      id: 'dev-2',
      nameBn: 'উস্তায ও স্টাফ রুম ডিজিটাল পাঞ্চার',
      deviceType: 'face_recognition',
      model: 'Hikvision Face & RFID Scanner',
      ipAddress: '192.168.1.202',
      port: 8000,
      status: 'online',
      location: 'শিক্ষক মিলনায়তন (Staff Room)',
      lastSync: 'ঠিক এখনই',
      totalLogsToday: 28,
    },
    {
      id: 'dev-3',
      nameBn: 'হিফজ ভবন ২য় তলা আরএফআইডি গেটওয়ে',
      deviceType: 'rfid',
      model: 'RFID Pro Access Reader',
      ipAddress: '192.168.1.205',
      port: 4370,
      status: 'online',
      location: 'দারুল হিফজ প্রবেশদ্বার',
      lastSync: '৫ মিনিট পূর্বে',
      totalLogsToday: 65,
    },
  ]);

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIp, setNewDeviceIp] = useState('192.168.1.210');
  const [newDeviceLocation, setNewDeviceLocation] = useState('ছাত্রাবাস প্রবেশপথ');

  if (!isOpen) return null;

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      showToast(
        isBn
          ? 'সকল বায়োমেট্রিক ও আরএফআইডি ডিভাইস হতে হাজিরা সফলভাবে সিঙ্ক হয়েছে।'
          : 'All biometric and RFID logs synchronized successfully.',
        'success'
      );
    }, 1500);
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName) return;

    const newDev: AttendanceDevice = {
      id: `dev-${Date.now()}`,
      nameBn: newDeviceName,
      deviceType: 'fingerprint',
      model: 'ZKTeco Push SDK / Standalone',
      ipAddress: newDeviceIp,
      port: 4370,
      status: 'online',
      location: newDeviceLocation,
      lastSync: 'এইমাত্র সংযুক্ত',
      totalLogsToday: 0,
    };

    setDevices([...devices, newDev]);
    setShowAddForm(false);
    setNewDeviceName('');
    showToast(
      isBn ? 'নতুন হাজিরা ডিভাইস সফলভাবে নেটওয়ার্কে যুক্ত করা হয়েছে।' : 'New attendance device added.',
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isBn ? 'বায়োমেট্রিক ও আরএফআইডি ডিভাইস কানেকশন' : 'Biometric & RFID Device Integration'}
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
                  {toBnNum(devices.length)} টি সচল
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ZKTeco, RealTime বা Hikvision ডিভাইস হতে আঙুলের ছাপ ও কার্ড পাঞ্চের লাইভ সিঙ্ক'
                  : 'Direct TCP/IP / Push protocol synchronization for fingerprint and RFID readers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? (isBn ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (isBn ? 'এখনই সিঙ্ক করুন' : 'Sync Now')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Status overview banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">কানেকশন স্ট্যাটাস</span>
                <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold">সকল ডিভাইস অনলাইন (সচল)</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">আজকের মোট পাঞ্চ লগ</span>
                <strong className="text-xs text-blue-700 dark:text-blue-400 font-bold font-mono">
                  {toBnNum(devices.reduce((acc, d) => acc + d.totalLogsToday, 0))} টি এন্ট্রি
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">অটো পুশ সিঙ্ক</span>
                <strong className="text-xs text-purple-700 dark:text-purple-400 font-bold">প্রতি ৩০ সেকেন্ড অন্তর</strong>
              </div>
            </div>
          </div>

          {/* Add Device Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              সংযুক্ত ডিভাইসের তালিকা
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? (isBn ? 'ফর্ম বন্ধ করুন' : 'Close Form') : (isBn ? 'নতুন মেশিন যুক্ত করুন' : 'Add New Machine')}</span>
            </button>
          </div>

          {/* Add Device Form */}
          {showAddForm && (
            <form onSubmit={handleAddDevice} className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">মেশিনের নাম ও মডেল</label>
                  <input
                    type="text"
                    placeholder="যেমন: গেট-২ ফিঙ্গারপ্রিন্ট ডিভাইস"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">আইপি অ্যাড্রেস (IP Address)</label>
                  <input
                    type="text"
                    value={newDeviceIp}
                    onChange={(e) => setNewDeviceIp(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">অবস্থান / লোকেশন</label>
                  <input
                    type="text"
                    value={newDeviceLocation}
                    onChange={(e) => setNewDeviceLocation(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* Device Cards */}
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{device.nameBn}</h4>
                      <span className="flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        অনলাইন
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      মডেল: <strong className="text-slate-700 dark:text-slate-300">{device.model}</strong> • লোকেশন: {device.location}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        IP: {device.ipAddress}:{device.port}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        আজকের লগ: {toBnNum(device.totalLogsToday)} টি
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        লাস্ট সিঙ্ক: {device.lastSync}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      showToast(
                        `${device.nameBn} থেকে পাঞ্চ ডেটা সফলভাবে হালনাগাদ হয়েছে।`,
                        'success'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    রিফ্রেশ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

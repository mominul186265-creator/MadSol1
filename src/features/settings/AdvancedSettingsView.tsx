import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Palette,
  Globe,
  Calendar,
  Hash,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AdvancedSettingsView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user } = useAuth();
  const {
    institutionSettings,
    updateInstitutionSettings,
    brandingSettings,
    updateBrandingSettings,
    dateTimeSettings,
    updateDateTimeSettings,
    systemFormats,
    updateSystemFormats,
    notificationSettings,
    updateNotificationSettings,
    securitySettings,
    updateSecuritySettings
  } = usePart7System();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'branding' | 'datetime' | 'formats' | 'notifications' | 'security'
  >('profile');

  // Form local state
  const [instForm, setInstForm] = useState(institutionSettings);
  const [brandForm, setBrandForm] = useState(brandingSettings);
  const [dtForm, setDtForm] = useState(dateTimeSettings);
  const [formatForm, setFormatForm] = useState(systemFormats);
  const [notifForm, setNotifForm] = useState(notificationSettings);
  const [secForm, setSecForm] = useState(securitySettings);

  const handleSave = () => {
    updateInstitutionSettings(instForm);
    updateBrandingSettings(brandForm);
    updateDateTimeSettings(dtForm);
    updateSystemFormats(formatForm);
    updateNotificationSettings(notifForm);
    updateSecuritySettings(secForm);
    showToast(language === 'bn' ? 'সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'Settings saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'অ্যাডভান্সড সেটিংস ও ব্র্যান্ডিং' : 'Advanced Settings & Institution Branding'}
            </h1>
            <Badge variant="emerald" size="sm">
              Configuration
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'প্রতিষ্ঠানের প্রোফাইল, কালার থিম, হিজরি তারিখ, আইডি ফরম্যাট, নোটিফিকেশন ও নিরাপত্তা পলিসি'
              : 'Global institution profile, theme palette, Hijri offset, numbering formats and 2FA policy'}
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        {[
          { id: 'profile', label: 'প্রাতিষ্ঠানিক তথ্য', icon: Building2 },
          { id: 'branding', label: 'ব্র্যান্ডিং ও কালার', icon: Palette },
          { id: 'datetime', label: 'তারিখ ও হিজরি ক্যালেন্ডার', icon: Calendar },
          { id: 'formats', label: 'সিস্টেম ফরম্যাট ও আইডি', icon: Hash },
          { id: 'notifications', label: 'নোটিফিকেশন রুলস', icon: Bell },
          { id: 'security', label: 'নিরাপত্তা ও ২এফএ', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        {/* TAB 1: INSTITUTION PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">প্রতিষ্ঠানের পরিচিতি ও ঠিকানা</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রতিষ্ঠানের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={instForm.nameBn}
                  onChange={(e) => setInstForm({ ...instForm, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রতিষ্ঠানের নাম (ইংরেজি)</label>
                <input
                  type="text"
                  value={instForm.nameEn}
                  onChange={(e) => setInstForm({ ...instForm, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রাতিষ্ঠানিক কোড</label>
                <input
                  type="text"
                  value={instForm.code}
                  onChange={(e) => setInstForm({ ...instForm, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ইআইআইএন / রেজিস্ট্রেশন</label>
                <input
                  type="text"
                  value={instForm.eiin}
                  onChange={(e) => setInstForm({ ...instForm, eiin: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অফিসিয়াল ফোন</label>
                <input
                  type="text"
                  value={instForm.phone}
                  onChange={(e) => setInstForm({ ...instForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অফিসিয়াল ইমেইল</label>
                <input
                  type="email"
                  value={instForm.email}
                  onChange={(e) => setInstForm({ ...instForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">পূর্ণাঙ্গ ঠিকানা</label>
              <textarea
                rows={2}
                value={instForm.address}
                onChange={(e) => setInstForm({ ...instForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & THEME */}
        {activeTab === 'branding' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">কালার প্যালেট ও থিম কাস্টমাইজেশন</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">প্রাইমারি কালার</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer"
                  />
                  <span className="font-mono">{brandForm.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সেকেন্ডারি কালার</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandForm.secondaryColor}
                    onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer"
                  />
                  <span className="font-mono">{brandForm.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অ্যাকসেন্ট (গোল্ড)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandForm.accentColor}
                    onChange={(e) => setBrandForm({ ...brandForm, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer"
                  />
                  <span className="font-mono">{brandForm.accentColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মাদ্রাসার মূল নীতিবাক্য (Motto)</label>
              <input
                type="text"
                value={brandForm.mottoBn}
                onChange={(e) => setBrandForm({ ...brandForm, mottoBn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: DATE, TIME & HIJRI */}
        {activeTab === 'datetime' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">হিজরি ক্যালেন্ডার ও সময় অঞ্চল</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">হিজরি তারিখ সমন্বয় (Offset Days)</label>
                <input
                  type="number"
                  min="-2"
                  max="2"
                  value={dtForm.hijriDateOffsetDays}
                  onChange={(e) => setDtForm({ ...dtForm, hijriDateOffsetDays: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">চাঁদ দেখার পার্থক্যের জন্য (+১ বা -১ দিন)</span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সপ্তাহের শুরুর দিন</label>
                <select
                  value={dtForm.weekStartDay}
                  onChange={(e) => setDtForm({ ...dtForm, weekStartDay: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="saturday">শনিবার (Saturday)</option>
                  <option value="sunday">রবিবার (Sunday)</option>
                  <option value="monday">সোমবার (Monday)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM FORMATS */}
        {activeTab === 'formats' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">আইডি কোড ও রসিদ নাম্বার ফরম্যাট</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থী আইডি ফরম্যাট</label>
                <input
                  type="text"
                  value={formatForm.studentIdPrefix}
                  onChange={(e) => setFormatForm({ ...formatForm, studentIdPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ফি রসিদ নাম্বার প্রিফিক্স</label>
                <input
                  type="text"
                  value={formatForm.receiptPrefix}
                  onChange={(e) => setFormatForm({ ...formatForm, receiptPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মুদ্রা প্রতীক</label>
                <input
                  type="text"
                  value={formatForm.currencySymbol}
                  onChange={(e) => setFormatForm({ ...formatForm, currencySymbol: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">নোটিফিকেশন ট্রিগার নীতিমালা</h3>
            <div className="space-y-3">
              {[
                { key: 'enableSmsNotifications', label: 'এসএমএস গেটওয়ে নোটিফিকেশন চালু রাখুন' },
                { key: 'enableEmailNotifications', label: 'ইমেইল অ্যালার্ট ও রিপোর্ট প্রেরণ সক্রিয়' },
                { key: 'enableAppPushNotifications', label: 'মোবাইল/ওয়েব পুশ নোটিফিকেশন সক্রিয়' },
                { key: 'autoAttendanceAlert', label: 'অনুপস্থিতির সাথে সাথে স্বয়ংক্রিয় এসএমএস প্রেরণ' },
                { key: 'autoFeeReminder', label: 'বকেয়া বেতন সংক্রান্ত স্বয়ংক্রিয় তাগাদা অ্যালার্ট' }
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={(notifForm as any)[item.key]}
                    onChange={(e) => setNotifForm({ ...notifForm, [item.key]: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor={item.key} className="text-slate-800 dark:text-slate-200 font-medium cursor-pointer">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">নিরাপত্তা ও ২-ফ্যাক্টর অথেনটিকেশন</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <input
                  type="checkbox"
                  id="twoFactor"
                  checked={secForm.twoFactorAuthEnabled}
                  onChange={(e) => setSecForm({ ...secForm, twoFactorAuthEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="twoFactor" className="text-emerald-900 dark:text-emerald-200 font-bold cursor-pointer">
                  অ্যাডমিন ও শিক্ষকদের জন্য টু-ফ্যাক্টর অথেনটিকেশন (2FA OTP) বাধ্যতামূলক করুন
                </label>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অটোমেটিক সেশন টাইমআউট (মিনিট)</label>
                <input
                  type="number"
                  value={secForm.sessionTimeoutMinutes}
                  onChange={(e) => setSecForm({ ...secForm, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অনুমোদিত আইপি সীমা (ঐচ্ছিক হোয়াইটলিস্ট)</label>
                <input
                  type="text"
                  placeholder="যেমন: 192.168.1.1, 103.45.2.1"
                  value={secForm.ipWhitelist.join(', ')}
                  onChange={(e) =>
                    setSecForm({ ...secForm, ipWhitelist: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

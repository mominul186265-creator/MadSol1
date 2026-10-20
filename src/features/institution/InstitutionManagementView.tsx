import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb } from '../../lib/db';
import { DbInstitution, InstitutionType, InstitutionStatus } from '../../types/step1';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

export const InstitutionManagementView: React.FC = () => {
  const { user, institution, switchInstitution, refreshData } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [institutionsList, setInstitutionsList] = useState<DbInstitution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<DbInstitution | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    institution_type: 'madrasa' as InstitutionType,
    mobile: '',
    email: '',
    address: '',
    language: 'bn' as 'bn' | 'en',
    status: 'active' as InstitutionStatus,
  });

  const loadInstitutions = () => {
    setInstitutionsList(madsolDb.getInstitutions());
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const isSuperAdmin = user?.role_id === 'super_admin';

  const handleOpenCreate = () => {
    setEditingInst(null);
    setFormData({
      name: '',
      short_name: '',
      institution_type: 'madrasa',
      mobile: '',
      email: '',
      address: '',
      language: 'bn',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: DbInstitution) => {
    setEditingInst(inst);
    setFormData({
      name: inst.name,
      short_name: inst.short_name,
      institution_type: inst.institution_type,
      mobile: inst.mobile,
      email: inst.email,
      address: inst.address,
      language: inst.language,
      status: inst.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast(
        language === 'bn' ? 'প্রতিষ্ঠানের নাম লিখুন।' : 'Institution name is required.',
        'error'
      );
      return;
    }

    if (editingInst) {
      // Update
      madsolDb.updateInstitution(editingInst.id, formData);
      madsolDb.addActivityLog({
        user_id: user?.id || 'sys',
        user_name: user?.name || 'Admin',
        institution_id: editingInst.id,
        action: 'INSTITUTION_UPDATED',
        description: `প্রতিষ্ঠান [${formData.name}]-এর তথ্য হালনাগাদ করা হয়েছে।`,
        status: 'success',
      });
      showToast(
        language === 'bn' ? 'প্রতিষ্ঠান সফলভাবে হালনাগাদ করা হয়েছে।' : 'Institution updated successfully.',
        'success'
      );
    } else {
      // Create (Super Admin only)
      const newInst = madsolDb.createInstitution(formData);
      madsolDb.addActivityLog({
        user_id: user?.id || 'sys',
        user_name: user?.name || 'Super Admin',
        institution_id: newInst.id,
        action: 'INSTITUTION_CREATED',
        description: `নতুন প্রতিষ্ঠান [${newInst.name}] সফলভাবে ডাটাবেজে তৈরি করা হয়েছে।`,
        status: 'success',
      });
      showToast(
        language === 'bn' ? 'নতুন প্রতিষ্ঠান ডাটাবেজে সংরক্ষিত হয়েছে।' : 'Institution created successfully.',
        'success'
      );
    }

    loadInstitutions();
    refreshData();
    setIsModalOpen(false);
  };

  const filteredInstitutions = institutionsList.filter((inst) => {
    const q = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.short_name.toLowerCase().includes(q) ||
      inst.mobile.includes(q) ||
      inst.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>{language === 'bn' ? 'প্রতিষ্ঠান ব্যবস্থাপনা' : 'Institution Management'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'মাল্টি-ইনস্টিটিউশন আর্কিটেকচার ও প্রতিষ্ঠানভিত্তিক তথ্য আইসোলেশন'
              : 'Multi-institution foundation with strict tenant data isolation'}
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            id="add-institution-btn"
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {language === 'bn' ? 'নতুন প্রতিষ্ঠান যোগ করুন' : 'Add Institution'}
          </Button>
        )}
      </div>

      {/* Isolation Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'bn' ? 'কঠোর ডাটা আইসোলেশন নীতি:' : 'Strict Data Isolation Enforced:'}
          </span>{' '}
          {language === 'bn'
            ? 'প্রতিটি প্রতিষ্ঠানের ডাটাবেজ রেকর্ড সম্পূর্ণ আলাদা। প্রতিষ্ঠান A কখনোই প্রতিষ্ঠান B-এর ডাটা, ইউজার বা লেনদেন দেখতে বা পরিবর্তন করতে পারে না। শুধুমাত্র সুপার এডমিন সেন্ট্রাল কনসোল থেকে ওভারভিউ করতে পারেন।'
            : 'All data rows are strictly isolated by institution_id. Institution A cannot view or alter Institution B data.'}
        </div>
      </div>

      {/* Active Institution Card */}
      {institution && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {language === 'bn' ? 'বর্তমান সক্রিয় প্রতিষ্ঠান' : 'Active Institution'}
                </span>
                <span className="text-xs text-slate-400">ID: {institution.id}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {institution.name}
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(institution)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              {language === 'bn' ? 'তথ্য সম্পাদনা করুন' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{institution.mobile}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{institution.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{institution.address}</span>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Multi-Institution Directory Table */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'নিবন্ধিত সকল প্রতিষ্ঠানসমূহ' : 'Registered Institutions Directory'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'সুপার এডমিন হিসেবে আপনি যেকোনো প্রতিষ্ঠানে সুইচ করে কার্যক্রম পর্যবেক্ষণ করতে পারেন'
                  : 'As Super Admin, switch context or edit any institution'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'প্রতিষ্ঠান খুঁজুন...' : 'Search institution...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Name'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'ধরন' : 'Type'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="py-3 px-4">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInstitutions.map((inst) => {
                  const isActive = inst.id === institution?.id;
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inst.name}</div>
                        <div className="text-[10px] text-slate-400">{inst.short_name} • {inst.address}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {inst.institution_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{inst.mobile}</div>
                        <div className="text-[10px] text-slate-400">{inst.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          inst.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isActive ? (
                            <button
                              onClick={() => {
                                switchInstitution(inst.id);
                                showToast(
                                  language === 'bn'
                                    ? `প্রতিষ্ঠান পরিবর্তন করে [${inst.name}] সক্রিয় করা হয়েছে।`
                                    : `Switched active institution to ${inst.name}.`,
                                  'success'
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors cursor-pointer text-xs"
                            >
                              {language === 'bn' ? 'সুইচ করুন' : 'Switch'}
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 px-2">
                              {language === 'bn' ? 'সক্রিয়' : 'Active'}
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEdit(inst)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Institution */}
      <Modal
        id="institution-modal"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingInst
            ? (language === 'bn' ? 'প্রতিষ্ঠান তথ্য সম্পাদনা' : 'Edit Institution')
            : (language === 'bn' ? 'নতুন প্রতিষ্ঠান তৈরি' : 'Create New Institution')
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="inst-name-input"
            label={language === 'bn' ? 'প্রতিষ্ঠানের পূর্ণ নাম' : 'Institution Full Name'}
            placeholder={language === 'bn' ? 'যেমন: দারুল উলুম ইসলামিয়া মাদ্রাসা' : 'e.g. Darul Uloom Madrasa'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="inst-shortname-input"
              label={language === 'bn' ? 'সংক্ষিপ্ত নাম' : 'Short Name'}
              placeholder={language === 'bn' ? 'যেমন: দারুল উলুম' : 'e.g. Darul Uloom'}
              value={formData.short_name}
              onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'bn' ? 'প্রতিষ্ঠানের ধরন' : 'Institution Type'}
              </label>
              <select
                id="inst-type-select"
                value={formData.institution_type}
                onChange={(e) => setFormData({ ...formData, institution_type: e.target.value as InstitutionType })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="madrasa">{language === 'bn' ? 'কওমি/আলিয়া মাদ্রাসা' : 'Madrasa'}</option>
                <option value="hifz_madrasa">{language === 'bn' ? 'হিফজুল কুরআন মাদ্রাসা' : 'Hifz Madrasa'}</option>
                <option value="islamic_school">{language === 'bn' ? 'ইসলামিক স্কুল' : 'Islamic School'}</option>
                <option value="school">{language === 'bn' ? 'স্কুল/কলেজ' : 'School'}</option>
                <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="inst-mobile-input"
              label={language === 'bn' ? 'অফিসিয়াল মোবাইল নম্বর' : 'Official Mobile Number'}
              placeholder="01711000111"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
            <Input
              id="inst-email-input"
              label={language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'}
              placeholder="info@institution.edu.bd"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Input
            id="inst-address-input"
            label={language === 'bn' ? 'ঠিকানা ও অবস্থান' : 'Address'}
            placeholder={language === 'bn' ? 'মেইন রোড, ঢাকা' : 'Main Road, Dhaka'}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button id="save-institution-btn" variant="primary" type="submit">
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Institution'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

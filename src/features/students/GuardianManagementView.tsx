import React, { useState } from 'react';
import { Guardian, Student } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface GuardianManagementViewProps {
  onSelectStudent?: (studentId: string) => void;
}

export const GuardianManagementView: React.FC<GuardianManagementViewProps> = ({
  onSelectStudent,
}) => {
  const { language, t } = useLanguage();
  const { scopedGuardians, scopedStudents, addGuardian } = useMadrasaData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Guardian Form State
  const [formData, setFormData] = useState({
    fullNameBn: '',
    fullNameEn: '',
    relationship: 'father',
    mobile: '',
    email: '',
    occupation: 'ব্যবসায়ী',
    nid: '',
    address: 'ঢাকা, বাংলাদেশ',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filter guardians
  const filteredGuardians = scopedGuardians.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      g.fullNameBn.toLowerCase().includes(q) ||
      g.fullNameEn.toLowerCase().includes(q) ||
      g.mobile.includes(q) ||
      g.occupation?.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullNameBn.trim() || !formData.fullNameEn.trim() || !formData.mobile.trim()) {
      setFormError('অনুগ্রহ করে নাম এবং মোবাইল নম্বর প্রদান করুন');
      return;
    }

    try {
      await addGuardian({
        institutionId: 'inst-001',
        fullNameBn: formData.fullNameBn.trim(),
        fullNameEn: formData.fullNameEn.trim(),
        relationship: formData.relationship,
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        occupation: formData.occupation.trim(),
        nid: formData.nid.trim(),
        address: formData.address.trim(),
        linkedStudentIds: [],
      });

      setIsAddModalOpen(false);
      setFormData({
        fullNameBn: '',
        fullNameEn: '',
        relationship: 'father',
        mobile: '',
        email: '',
        occupation: 'ব্যবসায়ী',
        nid: '',
        address: 'ঢাকা, বাংলাদেশ',
      });
      setFormError(null);
    } catch (err) {
      setFormError('অভিভাবক সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.guardians.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {scopedGuardians.length} জন
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.guardians.subtitle}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5 text-xs font-semibold shadow-md bg-emerald-700 hover:bg-emerald-800"
        >
          <Plus className="w-4 h-4" />
          <span>{t.guardians.addGuardian}</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.guardians.searchPlaceholder}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Guardian Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuardians.map((guardian) => {
          // Find linked students
          const linkedStudents = scopedStudents.filter(
            (s) =>
              s.guardianId === guardian.id ||
              guardian.linkedStudentIds?.includes(s.id) ||
              s.guardianMobile === guardian.mobile
          );

          return (
            <div
              key={guardian.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? guardian.fullNameBn : guardian.fullNameEn}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? guardian.fullNameEn : guardian.fullNameBn}
                    </p>
                  </div>
                  <Badge variant="emerald">
                    {guardian.relationship === 'father' ? 'পিতা' : guardian.relationship === 'mother' ? 'মাতা' : 'অভিভাবক'}
                  </Badge>
                </div>

                {/* Contact & Bio */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a
                      href={`tel:${guardian.mobile}`}
                      className="font-mono font-medium hover:underline text-emerald-700 dark:text-emerald-400"
                    >
                      {guardian.mobile}
                    </a>
                  </div>

                  {guardian.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{guardian.email}</span>
                    </div>
                  )}

                  {guardian.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{guardian.occupation}</span>
                    </div>
                  )}

                  {guardian.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{guardian.address}</span>
                    </div>
                  )}
                </div>

                {/* Linked Students Roster */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    {t.guardians.linkedStudents} ({linkedStudents.length}):
                  </span>

                  {linkedStudents.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">কোনো শিক্ষার্থী সংযুক্ত নেই</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedStudents.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => onSelectStudent && onSelectStudent(st.id)}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer border border-slate-200 dark:border-slate-700/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={st.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80'}
                              alt={st.fullNameEn}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {language === 'bn' ? st.fullNameBn : st.fullNameEn}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                রোল: {st.rollNumber} • {st.department}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold ml-2 shrink-0">
                            {st.studentId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${guardian.mobile}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="কল করুন"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`sms:${guardian.mobile}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="এসএমএস পাঠান"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/88${guardian.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="হোয়াটসঅ্যাপ"
                  >
                    <Sparkles className="w-4 h-4" />
                  </a>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`অভিভাবক ${guardian.fullNameBn} এর সাথে এসএমএস নোটিফিকেশন সিঙ্ক সক্রিয় আছে।`)}
                  className="text-xs"
                >
                  যোগাযোগ রেকর্ড
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Guardian Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {t.guardians.addGuardian}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.guardians.guardianName} (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullNameBn}
                onChange={(e) => setFormData({ ...formData, fullNameBn: e.target.value })}
                placeholder="যেমন: আলহাজ্ব মোঃ জাহিদুল করিম"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {t.guardians.guardianName} (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullNameEn}
                onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                placeholder="e.g. Md. Zahidul Karim"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="01711xxxxxx"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  সম্পর্ক
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="father">পিতা (Father)</option>
                  <option value="mother">মাতা (Mother)</option>
                  <option value="uncle">চাচা / মামা (Uncle)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  পেশা
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="যেমন: শিক্ষক / ব্যবসায়ী"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  জাতীয় পরিচয়পত্র (NID)
                </label>
                <input
                  type="text"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  placeholder="NID নম্বর"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" variant="primary" size="sm">
                অভিভাবক যোগ করুন
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

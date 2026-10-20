import React, { useState } from 'react';
import {
  Award,
  Printer,
  Download,
  Plus,
  Search,
  CheckCircle,
  QrCode,
  Sparkles,
  FileCheck,
  Building2,
  Trash2,
  Eye,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CertificateType, GeneratedCertificate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const CertificatesView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { institution, user } = useAuth();
  const {
    certificateTemplates,
    generatedCertificates,
    generateCertificate,
    revokeCertificate
  } = usePart7System();

  const [activeTab, setActiveTab] = useState<'certificates' | 'builder'>('certificates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<string | null>(generatedCertificates[0]?.id || null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Form State
  const [certType, setCertType] = useState<CertificateType>('hifz_completion');
  const [templateId, setTemplateId] = useState(certificateTemplates[0]?.id || 'tmpl-hifz');
  const [studentNameBn, setStudentNameBn] = useState('');
  const [studentNameEn, setStudentNameEn] = useState('');
  const [className, setClassName] = useState('হিফজুল কুরআন বিভাগ');
  const [departmentName, setDepartmentName] = useState('তাহফিজুল কুরআনুল কারীম');
  const [rollNo, setRollNo] = useState('');
  const [customTitleBn, setCustomTitleBn] = useState('');

  const filteredCerts = generatedCertificates.filter(
    (c) =>
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentNameBn.includes(searchQuery) ||
      c.studentNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.titleBn.includes(searchQuery)
  );

  const selectedCert = generatedCertificates.find((c) => c.id === selectedCertId) || filteredCerts[0];

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameBn || !rollNo) return;

    const titleBn = customTitleBn || (certType === 'hifz_completion' ? 'পবিত্র কুরআনুল কারীম হিফজ সমাপনী সনদ' : 'প্রশংসাপত্র ও চরিত্র সনদ');
    const titleEn = certType === 'hifz_completion' ? 'Certificate of Quran Memorization Completion' : 'Testimonial & Character Certificate';

    const newCert = generateCertificate({
      studentId: `stu-${Date.now().toString().slice(-4)}`,
      studentNameBn,
      studentNameEn: studentNameEn || 'Student',
      className,
      departmentName,
      rollNo,
      type: certType,
      templateId,
      titleBn,
      titleEn
    });

    setSelectedCertId(newCert.id);
    setIsGenerateOpen(false);
    setStudentNameBn('');
    setRollNo('');
    showToast(language === 'bn' ? 'সনদপত্র সফলভাবে তৈরি ও সংরক্ষিত হয়েছে।' : 'Certificate issued.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'সনদপত্র ম্যানেজমেন্ট ও বিল্ডার' : 'Certificate Management & Builder'}
            </h1>
            <Badge variant="gold" size="sm">
              Official Sanad
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'হিফজ সমাপনী সনদ, প্রশংসাপত্র, প্রত্যয়নপত্র তৈরি, কিউআর ভেরিফিকেশন ও ডিজিটাল সিল'
              : 'Issue authentic Islamic certificates with dynamic variable interpolation and QR verification'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsGenerateOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন সনদপত্র ইস্যু করুন' : 'Issue Certificate'}</span>
        </Button>
      </div>

      {/* Main Grid: Certificates Directory (Left) + Certificate Visual Layout Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Issued Certificates List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="সনদ নং বা শিক্ষার্থীর নাম..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCerts.map((cert) => {
              const isSelected = cert.id === selectedCert?.id;
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCertId(cert.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {cert.certificateNumber}
                      </span>
                      {cert.status === 'revoked' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                          বাতিল
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                          বৈধ
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {cert.studentNameBn}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{cert.titleBn}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">ইস্যু: {cert.issueDate}</span>
                  </div>

                  {cert.status !== 'revoked' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        revokeCertificate(cert.id);
                        showToast(language === 'bn' ? 'সনদটি বাতিল করা হয়েছে।' : 'Certificate revoked.', 'info');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Revoke Certificate"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ornate Authentic Printable Certificate Sheet */}
        {selectedCert && (
          <div className="lg:col-span-2 space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedCert.certificateNumber}
                </span>
                <span className="text-xs text-slate-400">
                  (যাচাই সংখ্যা: {selectedCert.verificationCount} বার)
                </span>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <Button size="sm" variant="outline" onClick={handlePrintCertificate} className="flex items-center gap-1.5 text-xs">
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রিন্ট সনদপত্র' : 'Print Certificate'}</span>
                </Button>
              </div>
            </div>

            {/* VISUAL ORNATE ISLAMIC CERTIFICATE SHEET */}
            <div
              id="printable-certificate"
              className="bg-amber-50/40 text-slate-900 rounded-3xl p-8 sm:p-10 border-8 border-double border-amber-600/60 shadow-lg relative print:m-0 print:border-8 print:p-8"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at center, rgba(254, 243, 199, 0.4) 0%, rgba(255, 251, 235, 0.9) 100%)'
              }}
            >
              {/* Inner Decorative Golden Border */}
              <div className="border border-amber-600/40 rounded-2xl p-6 sm:p-8 space-y-6 text-center relative">
                {/* Top Bismillah Calligraphy & Header */}
                <div className="space-y-2">
                  <p className="font-serif text-base sm:text-lg font-bold text-amber-900 tracking-wider">
                    بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-wide">
                    {institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম'}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-amber-800">
                    {institution?.nameEn || 'Jamia Islamia Madinatul Uloom'} • স্থাপিত: ১৯৯৮ ইং
                  </p>
                  <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
                </div>

                {/* Certificate Title Badge */}
                <div className="my-3">
                  <span className="inline-block px-6 py-2 rounded-full text-base sm:text-lg font-extrabold bg-gradient-to-r from-emerald-800 to-teal-900 text-amber-200 border-2 border-amber-400 shadow-md">
                    {selectedCert.titleBn}
                  </span>
                  <p className="text-xs text-slate-500 font-serif italic mt-1 font-semibold">
                    {selectedCert.titleEn}
                  </p>
                </div>

                {/* Body Content */}
                <div className="max-w-xl mx-auto text-center space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800">
                  <p className="text-justify sm:text-center">
                    {selectedCert.contentBn}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 italic font-serif text-justify sm:text-center">
                    {selectedCert.contentEn}
                  </p>
                </div>

                {/* Footer Badges, Islamic Seal, Signatures & QR */}
                <div className="pt-8 grid grid-cols-3 items-end gap-4 text-xs">
                  {/* Left: QR Code Verification Badge */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-16 h-16 rounded-xl bg-white border border-amber-400 p-1 flex items-center justify-center shadow-xs">
                      <QrCode className="w-13 h-13 text-slate-800" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-semibold">
                      {selectedCert.certificateNumber}
                    </span>
                    <span className="text-[8px] text-emerald-700 font-bold">সরাসরি কিউআর ভেরিফাইড</span>
                  </div>

                  {/* Center: Official Ornate Gold Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-amber-600/80 bg-amber-100/60 flex flex-col items-center justify-center text-center p-1 text-[9px] font-bold text-amber-900 shadow-inner">
                      <Award className="w-5 h-5 text-amber-700" />
                      <span>অফিসিয়াল সিল</span>
                      <span className="text-[7px]">MADSOL VERIFIED</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">ইস্যু: {selectedCert.issueDate}</span>
                  </div>

                  {/* Right: Signature Lines */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-28 border-b-2 border-slate-700 mb-1" />
                    <span className="text-[11px] font-bold text-slate-800">মুহতামিম / প্রিন্সিপাল</span>
                    <span className="text-[9px] text-slate-500">{institution?.nameBn}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Issue Certificate */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>নতুন সনদপত্র ইস্যু করুন</span>
              </h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">সনদপত্রের প্রকার</label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value as CertificateType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="hifz_completion">হিফজ সমাপনী সনদ</option>
                    <option value="character">প্রশংসাপত্র / চরিত্র সনদ</option>
                    <option value="study">অধ্যয়নরত প্রত্যয়নপত্র</option>
                    <option value="transfer">ছাড়পত্র (TC)</option>
                    <option value="achievement">বিশেষ মেধা পুরস্কার সনদ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">রোল নং</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১০১"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থীর নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মুহাম্মদ তাওহীদ হাসান"
                  value={studentNameBn}
                  onChange={(e) => setStudentNameBn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থীর নাম (ইংরেজি)</label>
                <input
                  type="text"
                  placeholder="Muhammad Tawheed Hasan"
                  value={studentNameEn}
                  onChange={(e) => setStudentNameEn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শ্রেণি</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিভাগ</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  সনদ তৈরি করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

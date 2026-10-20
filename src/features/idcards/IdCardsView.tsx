import React, { useState } from 'react';
import {
  CreditCard,
  Printer,
  Download,
  Plus,
  Search,
  CheckCircle,
  QrCode,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  Droplet
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { IdCardTemplate, StudentIdCardData, TeacherIdCardData } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const IdCardsView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { institution } = useAuth();
  const {
    idCardTemplates,
    studentIdCards,
    teacherIdCards,
    generateStudentIdCard,
    generateTeacherIdCard
  } = usePart7System();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(idCardTemplates[0]?.id || 'tmpl-emerald');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // New Student ID Card Form
  const [studentNameBn, setStudentNameBn] = useState('');
  const [studentNameEn, setStudentNameEn] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [className, setClassName] = useState('হিফজুল কুরআন বিভাগ');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');

  const filteredStudents = studentIdCards.filter((s) =>
    s.studentNameBn.includes(searchQuery) ||
    s.studentNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery) ||
    s.className.includes(searchQuery)
  );

  const filteredTeachers = teacherIdCards.filter((t) =>
    t.teacherNameBn.includes(searchQuery) ||
    t.teacherNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.designationBn.includes(searchQuery)
  );

  const selectedTemplate = idCardTemplates.find((t) => t.id === selectedTemplateId) || idCardTemplates[0];

  const handlePrintCards = () => {
    window.print();
  };

  const handleGenerateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameBn || !rollNo) return;

    generateStudentIdCard({
      institutionId: institution?.id || 'inst-001',
      studentId: `stu-${Date.now().toString().slice(-4)}`,
      studentNameBn,
      studentNameEn: studentNameEn || 'Student',
      rollNo,
      className,
      department: 'হিফজুল কুরআন',
      guardianMobile: guardianPhone || '01711-000000',
      bloodGroup,
      validityDate: '৩১ ডিসেম্বর ২০২৬'
    });

    setIsGenerateOpen(false);
    setStudentNameBn('');
    setStudentNameEn('');
    setRollNo('');
    showToast(language === 'bn' ? 'আইডি কার্ড সফলভাবে তৈরি হয়েছে।' : 'ID Card generated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'স্মার্ট আইডি কার্ড ম্যানেজমেন্ট' : 'Smart ID Card Management'}
            </h1>
            <Badge variant="emerald" size="sm">
              QR Verified
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'শিক্ষার্থী ও শিক্ষকদের ফ্রন্ট/ব্যাক ডিজাইন, কিউআর ভেরিফিকেশন ও এক ক্লিকে ব্যাচ প্রিন্ট'
              : 'Institutional ID cards with dual-sided layout, secure verification QR and batch printing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintCards} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>{language === 'bn' ? 'সকল কার্ড প্রিন্ট' : 'Batch Print'}</span>
          </Button>
          <Button variant="primary" onClick={() => setIsGenerateOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন আইডি কার্ড' : 'Generate ID Card'}</span>
          </Button>
        </div>
      </div>

      {/* Template & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            {language === 'bn' ? 'শিক্ষার্থী আইডি কার্ড' : 'Student Cards'} ({studentIdCards.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            {language === 'bn' ? 'শিক্ষক আইডি কার্ড' : 'Teacher Cards'} ({teacherIdCards.length})
          </button>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">টেমপ্লেট থিম:</span>
          {idCardTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplateId(tmpl.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                selectedTemplateId === tmpl.id
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'bn' ? tmpl.nameBn : tmpl.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'নাম বা রোল দিয়ে কার্ড খুঁজুন...' : 'Search cards...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
        />
      </div>

      {/* Cards Display Grid (Visual Front and Back Render) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {activeTab === 'students' &&
          filteredStudents.map((stu) => (
            <div
              key={stu.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 print:break-inside-avoid"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {stu.studentNameBn} ({stu.rollNo})
                </span>
                <span className="text-[10px] font-mono text-emerald-600">{stu.qrToken}</span>
              </div>

              {/* DUAL SIDED CARD CONTAINER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* FRONT SIDE */}
                <div
                  className={`rounded-2xl p-4 text-white flex flex-col justify-between h-56 shadow-md relative overflow-hidden ${
                    selectedTemplate.theme === 'islamic_gold'
                      ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-yellow-900'
                      : selectedTemplate.theme === 'navy_modern'
                      ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950'
                      : 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900'
                  }`}
                >
                  {/* Watermark Logo */}
                  <Building2 className="w-28 h-28 absolute -right-6 -bottom-6 text-white/10" />

                  {/* Header */}
                  <div className="text-center border-b border-white/20 pb-1.5">
                    <h4 className="text-[11px] font-extrabold tracking-wide uppercase truncate">
                      {institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম'}
                    </h4>
                    <span className="text-[9px] text-emerald-200 tracking-wider">
                      STUDENT IDENTITY CARD
                    </span>
                  </div>

                  {/* Body with Photo & Meta */}
                  <div className="flex items-center gap-3 my-auto">
                    <div className="w-14 h-16 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-inner">
                      {stu.studentNameBn.charAt(0)}
                    </div>

                    <div className="text-[11px] space-y-0.5 leading-tight min-w-0">
                      <p className="font-bold text-white text-xs truncate">{stu.studentNameBn}</p>
                      <p className="text-[9px] text-white/80 truncate font-mono">{stu.studentNameEn}</p>
                      <p className="text-white/90">শ্রেণি: <strong>{stu.className}</strong></p>
                      <p className="text-white/90">রোল নং: <strong>{stu.rollNo}</strong></p>
                      <p className="text-white/90">রক্তের গ্রুপ: <strong>{stu.bloodGroup || 'B+'}</strong></p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px]">
                    <span>মেয়াদ: {stu.validityDate}</span>
                    <span className="font-bold text-amber-300">ID: {stu.studentId}</span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-56 shadow-md relative">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700 pb-1">
                      জরুরি নির্দেশনা ও সত্যায়ন
                    </h5>
                    <ul className="text-[9px] text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc pl-3">
                      <li>এই কার্ডটি মাদ্রাসার ক্যাম্পাসে সর্বদা সাথে রাখা বাধ্যতামূলক।</li>
                      <li>কার্ড হারিয়ে গেলে অবিলম্বে অফিসে জানাতে হবে।</li>
                      <li>অভিভাবক ফোন: <strong>{stu.guardianMobile}</strong></li>
                    </ul>
                  </div>

                  {/* QR Token Box & Sign */}
                  <div className="flex items-end justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-0.5">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-300 dark:border-slate-600 flex items-center justify-center p-1 shadow-2xs">
                        <QrCode className="w-9 h-9 text-slate-800" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[80px]">
                        {stu.qrToken}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="w-20 border-b border-slate-400 dark:border-slate-600 mb-0.5" />
                      <span className="text-[9px] font-bold text-slate-500">মুহতামিম স্বাক্ষর</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {activeTab === 'teachers' &&
          filteredTeachers.map((tch) => (
            <div
              key={tch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 print:break-inside-avoid"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tch.teacherNameBn} ({tch.designationBn})
                </span>
                <span className="text-[10px] font-mono text-emerald-600">{tch.qrToken}</span>
              </div>

              {/* DUAL SIDED TEACHER CARD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* FRONT */}
                <div className="rounded-2xl p-4 text-white flex flex-col justify-between h-56 shadow-md bg-gradient-to-br from-teal-900 via-emerald-800 to-slate-900 relative overflow-hidden">
                  <div className="text-center border-b border-white/20 pb-1.5">
                    <h4 className="text-[11px] font-extrabold uppercase truncate">
                      {institution?.nameBn || 'জামেয়া ইসলামিয়া মদিনাতুল উলুম'}
                    </h4>
                    <span className="text-[9px] text-amber-300 tracking-wider font-bold">
                      FACULTY & TEACHER IDENTITY CARD
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-auto">
                    <div className="w-14 h-16 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg text-white shrink-0">
                      {tch.teacherNameBn.charAt(0)}
                    </div>
                    <div className="text-[11px] space-y-0.5 leading-tight">
                      <p className="font-bold text-white text-xs truncate">{tch.teacherNameBn}</p>
                      <p className="text-[9px] text-white/80 font-mono">{tch.teacherNameEn}</p>
                      <p className="text-emerald-200 font-bold">{tch.designationBn}</p>
                      <p className="text-white/90">বিভাগ: {tch.department}</p>
                      <p className="text-white/90">ফোন: {tch.mobile}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px]">
                    <span>ইস্যু: {tch.issueDate}</span>
                    <span className="font-bold text-amber-300">EMP: {tch.teacherId}</span>
                  </div>
                </div>

                {/* BACK */}
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-56 shadow-md">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700 pb-1">
                      Faculty Terms & Authority
                    </h5>
                    <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      এই পরিচয়পত্রের বাহক অত্র মাদ্রাসার অনুমোদিত উস্তাদ/শিক্ষক। কার্ডের কিউআর কোড স্ক্যান করে প্রাতিষ্ঠানিক বৈধতা যাচাই করা যাবে।
                    </p>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-0.5">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-300 dark:border-slate-600 flex items-center justify-center p-1">
                        <QrCode className="w-9 h-9 text-slate-800" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 block truncate max-w-[80px]">
                        {tch.qrToken}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="w-20 border-b border-slate-400 dark:border-slate-600 mb-0.5" />
                      <span className="text-[9px] font-bold text-slate-500">প্রিন্সিপাল স্বাক্ষর</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal: Generate ID Card */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'নতুন শিক্ষার্থী আইডি কার্ড তৈরি' : 'Generate Student ID Card'}
              </h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থীর নাম (বাংলায়)</label>
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শিক্ষার্থীর নাম (ইংরেজিতে)</label>
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
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">শ্রেণি / বিভাগ</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                    <option value="নূরানী ৩য় শ্রেণি">নূরানী ৩য় শ্রেণি</option>
                    <option value="কিতাব প্রথম বর্ষ">কিতাব প্রথম বর্ষ</option>
                    <option value="নাজেরা শাখা">নাজেরা শাখা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">রোল নং</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১০৭"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অভিভাবক মোবাইল</label>
                  <input
                    type="text"
                    placeholder="01711-xxxxxx"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">রক্তের গ্রুপ</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  তৈরি করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

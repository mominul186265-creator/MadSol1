import React, { useState, useMemo, useRef } from 'react';
import {
  Send,
  Users,
  FileText,
  CalendarClock,
  Sparkles,
  Smartphone,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  Coins,
  CheckCircle2,
  Clock,
  ChevronDown,
  Layers,
  GraduationCap,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useMadrasaData } from '../../../context/MadrasaDataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { IndividualRecipient, RecipientGroupType } from '../../../types/communication';

export const SmsBroadcastTab: React.FC = () => {
  const { templates, sendSmsBroadcast, providerConfig, gateway, isSending } = useCommunication();
  const { students, teachers, classes } = useMadrasaData();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroupType>('all_guardians');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [customNumbersText, setCustomNumbersText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute recipient candidates based on group
  const candidateRecipients = useMemo<IndividualRecipient[]>(() => {
    if (recipientGroup === 'all_guardians') {
      return students.map((s) => ({
        id: `g-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        classId: s.class_id,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        section: s.section,
        rollNumber: String(s.roll_no),
        dueAmount: s.monthly_fee ? s.monthly_fee * 2 : 1200,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'all_students') {
      return students.map((s) => ({
        id: `s-${s.id}`,
        name: s.name,
        phone: s.contact_number || s.guardian_mobile || '01700000000',
        role: 'student',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name,
        classId: s.class_id,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        section: s.section,
        rollNumber: String(s.roll_no),
        status: 'pending',
      }));
    }

    if (recipientGroup === 'all_teachers') {
      return teachers.map((t) => ({
        id: `t-${t.id}`,
        name: t.name,
        phone: t.mobile || '01700000000',
        role: 'teacher',
        className: t.designation,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'class_section') {
      let filtered = students;
      if (selectedClassId) {
        filtered = filtered.filter((s) => s.class_id === selectedClassId);
      }
      if (selectedSection) {
        filtered = filtered.filter((s) => s.section === selectedSection);
      }
      return filtered.map((s) => ({
        id: `cs-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        classId: s.class_id,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        section: s.section,
        rollNumber: String(s.roll_no),
        dueAmount: 1500,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'fee_defaulters') {
      return students.slice(0, 15).map((s) => ({
        id: `due-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        classId: s.class_id,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        section: s.section,
        rollNumber: String(s.roll_no),
        dueAmount: 2400,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'absent_today') {
      return students.slice(0, 6).map((s) => ({
        id: `abs-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        classId: s.class_id,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        section: s.section,
        rollNumber: String(s.roll_no),
        status: 'pending',
      }));
    }

    if (recipientGroup === 'custom_numbers') {
      const lines = customNumbersText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
      return lines.map((num, idx) => ({
        id: `cust-${idx}`,
        name: `গ্রাহক ${idx + 1}`,
        phone: num,
        role: 'custom',
        status: 'pending',
      }));
    }

    return [];
  }, [recipientGroup, students, teachers, classes, selectedClassId, selectedSection, customNumbersText]);

  // Filtered by search
  const filteredRecipients = useMemo(() => {
    if (!searchQuery.trim()) return candidateRecipients;
    const q = searchQuery.toLowerCase();
    return candidateRecipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.studentName && r.studentName.toLowerCase().includes(q))
    );
  }, [candidateRecipients, searchQuery]);

  // Selected recipients count calculation
  const activeRecipients = useMemo(() => {
    if (selectedRecipientIds.size === 0) {
      return filteredRecipients;
    }
    return filteredRecipients.filter((r) => selectedRecipientIds.has(r.id));
  }, [filteredRecipients, selectedRecipientIds]);

  // Auto select all when candidates change
  const handleToggleSelectAll = () => {
    if (selectedRecipientIds.size === filteredRecipients.length) {
      setSelectedRecipientIds(new Set());
    } else {
      setSelectedRecipientIds(new Set(filteredRecipients.map((r) => r.id)));
    }
  };

  const handleToggleSingle = (id: string) => {
    setSelectedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Template Loader
  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setContent(tmpl.content);
      if (!title) {
        setTitle(isBn ? tmpl.nameBn : tmpl.name);
      }
    }
  };

  // Variable token insertion
  const handleInsertToken = (token: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const nextContent = content.substring(0, start) + token + content.substring(end);
    setContent(nextContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + token.length, start + token.length);
      }
    }, 50);
  };

  // Parts calculation
  const smsAnalysis = useMemo(() => {
    return gateway.calculateSmsParts(content);
  }, [content, gateway]);

  const estimatedCost = useMemo(() => {
    return (activeRecipients.length * smsAnalysis.partsCount * providerConfig.smsRateBdt).toFixed(2);
  }, [activeRecipients, smsAnalysis, providerConfig]);

  // Sample preview resolution
  const sampleRecipient = activeRecipients[0] || {
    id: 'sample',
    name: 'আলহাজ্ব মো: জাহিদুল করিম',
    phone: '01766666666',
    role: 'guardian',
    studentName: 'আব্দুল্লাহ আল মাহমুদ',
    guardianName: 'আলহাজ্ব মো: জাহিদুল করিম',
    className: 'হিফজুল কুরআন বিভাগ',
    rollNumber: '১২',
    dueAmount: 1800,
    status: 'pending',
  };

  const samplePreviewText = useMemo(() => {
    return gateway.interpolateTemplate(content || 'বার্তা লিখুন...', sampleRecipient, 'দারুল উলুম মাদ্রাসা');
  }, [content, sampleRecipient, gateway]);

  // Submit Handler
  const handleSend = async () => {
    const success = await sendSmsBroadcast({
      title: title || (isBn ? 'এসএমএস বার্তা' : 'SMS Broadcast'),
      content,
      recipientGroup,
      targetClassId: selectedClassId,
      targetClassName: classes.find((c) => c.id === selectedClassId)?.nameBn,
      targetSection: selectedSection,
      recipients: activeRecipients,
      templateId: selectedTemplateId || undefined,
      scheduledAt: isScheduled && scheduledDateTime ? new Date(scheduledDateTime).toISOString() : undefined,
    });

    if (success) {
      setContent('');
      setTitle('');
      setSelectedTemplateId('');
      setSelectedRecipientIds(new Set());
      setIsScheduled(false);
      setScheduledDateTime('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isBn ? 'এসএমএস ব্রডকাস্ট প্রস্তুতকরণ' : 'SMS Broadcast Composer'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'একক বা বাল্ক প্রাপক নির্বাচন করুন এবং স্বয়ংক্রিয় টেমপ্লেট দিয়ে এসএমএস পাঠান।'
                : 'Select single or bulk recipients and dispatch personalized SMS notifications.'}
            </p>
          </div>
        </div>

        {/* Sender ID & Rate Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-slate-500">Sender ID:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{providerConfig.senderId}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Rate:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">৳{providerConfig.smsRateBdt}/SMS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Content (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Recipient Target Group Selector */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                {isBn ? '১. প্রাপক গ্রুপ নির্বাচন করুন' : '1. Select Recipient Target'}
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {activeRecipients.length} {isBn ? 'জন নির্বাচিত' : 'Selected'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all_guardians', labelBn: 'সকল অভিভাবক', labelEn: 'All Guardians', icon: Shield },
                { id: 'all_students', labelBn: 'সকল শিক্ষার্থী', labelEn: 'All Students', icon: GraduationCap },
                { id: 'all_teachers', labelBn: 'সকল শিক্ষক ও স্টাফ', labelEn: 'All Teachers', icon: UserCheck },
                { id: 'class_section', labelBn: 'শ্রেণি ও শাখা অনুযায়ী', labelEn: 'Class / Section', icon: Layers },
                { id: 'fee_defaulters', labelBn: 'বকেয়া ফি তালিকা', labelEn: 'Fee Defaulters', icon: Coins },
                { id: 'custom_numbers', labelBn: 'কাস্টম মোবাইল নম্বর', labelEn: 'Custom Numbers', icon: Smartphone },
              ].map((grp) => {
                const IconComp = grp.icon;
                const isSelected = recipientGroup === grp.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setRecipientGroup(grp.id as RecipientGroupType)}
                    className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{isBn ? grp.labelBn : grp.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub filter for Class / Section */}
            {recipientGroup === 'class_section' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                    {isBn ? 'শ্রেণি নির্বাচন' : 'Select Class'}
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isBn ? c.nameBn : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                    {isBn ? 'শাখা / সেকশন' : 'Section'}
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                    <option value="A">শাখা - ক (A)</option>
                    <option value="B">শাখা - খ (B)</option>
                    <option value="Hifz">হিফজ শাখা</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom Numbers Textarea */}
            {recipientGroup === 'custom_numbers' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                  {isBn ? 'মোবাইল নম্বরসমূহ (প্রতি লাইনে একটি বা কমা দিয়ে লিখুন)' : 'Enter phone numbers (one per line or comma separated)'}
                </label>
                <textarea
                  rows={3}
                  value={customNumbersText}
                  onChange={(e) => setCustomNumbersText(e.target.value)}
                  placeholder="01711111111, 01822222222, 01933333333..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
            )}
          </div>

          {/* 2. Message Content & Template Composer */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                {isBn ? '২. বার্তা বা টেমপ্লেট নির্বাচন করুন' : '2. Message & Dynamic Variables'}
              </label>

              {/* Template Quick Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-medium cursor-pointer"
                >
                  <option value="">{isBn ? '⚡ টেমপ্লেট বাছাই করুন...' : '⚡ Load Template...'}</option>
                  {templates
                    .filter((t) => t.type === 'sms' || t.type === 'both')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {isBn ? t.nameBn : t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Broadcast Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isBn ? 'ব্রডকাস্টের শিরোনাম (ঐচ্ছিক)' : 'Campaign Title (Optional)'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Dynamic Placeholders Tag Bar */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isBn ? 'ডায়নামিক ভেরিয়েবল (ক্লিক করে টেক্সটে যুক্ত করুন):' : 'Click to insert placeholder token:'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{student_name}', label: isBn ? 'শিক্ষার্থীর নাম' : 'Student Name' },
                  { tag: '{guardian_name}', label: isBn ? 'অভিভাবকের নাম' : 'Guardian Name' },
                  { tag: '{class_name}', label: isBn ? 'শ্রেণি' : 'Class' },
                  { tag: '{roll_no}', label: isBn ? 'রোল' : 'Roll' },
                  { tag: '{due_amount}', label: isBn ? 'বকেয়া টাকা' : 'Due Amount' },
                  { tag: '{institution_name}', label: isBn ? 'মাদ্রাসার নাম' : 'Madrasah' },
                  { tag: '{date}', label: isBn ? 'আজকের তারিখ' : 'Date' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertToken(item.tag)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {item.tag} <span className="text-[10px] text-slate-400">({item.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isBn ? 'এখানে আপনার বাংলা বা ইংরেজি এসএমএস লিখুন...' : 'Type your SMS message here...'}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Character & SMS Part Metric Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  {isBn ? 'ভাষা:' : 'Type:'}{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {smsAnalysis.isUnicode ? 'Unicode (বাংলা)' : 'GSM (English)'}
                  </span>
                </span>
                <span className="text-slate-500">
                  {isBn ? 'অক্ষর:' : 'Chars:'} <span className="font-bold text-slate-800 dark:text-slate-200">{smsAnalysis.characterCount}</span>
                </span>
                <span className="text-slate-500">
                  {isBn ? 'এসএমএস পার্ট:' : 'Parts:'}{' '}
                  <span className="font-bold text-amber-600 dark:text-amber-400">{smsAnalysis.partsCount} টি</span>
                </span>
              </div>
              <div className="text-slate-500">
                {isBn ? 'আনুমানিক খরচ:' : 'Est. Cost:'}{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{estimatedCost}</span>
              </div>
            </div>

            {/* 3. Schedule Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBn ? 'নির্দিষ্ট সময়ে পাঠাতে চান? (Schedule SMS)' : 'Schedule for Later'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                    isScheduled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isScheduled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isScheduled && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60 animate-in fade-in">
                  <label className="text-[11px] font-medium text-indigo-900 dark:text-indigo-300 mb-1 block">
                    {isBn ? 'তারিখ ও সময় নির্ধারণ করুন' : 'Select Broadcast Date & Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="button"
              disabled={isSending || activeRecipients.length === 0 || !content.trim()}
              onClick={handleSend}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSending || activeRecipients.length === 0 || !content.trim()
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none'
                  : isScheduled
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-98'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 active:scale-98'
              }`}
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'বার্তা পাঠানো হচ্ছে...' : 'Dispatching SMS...'}</span>
                </>
              ) : isScheduled ? (
                <>
                  <CalendarClock className="w-4 h-4" />
                  <span>{isBn ? `${activeRecipients.length} জনের জন্য শিডিউল করুন` : `Schedule for ${activeRecipients.length} recipients`}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? `এখনই পাঠান (${activeRecipients.length} জন প্রাপক)` : `Send SMS Now (${activeRecipients.length} recipients)`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Handset Live Preview & Recipient List (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Handset Phone Preview Card */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold tracking-wide">{isBn ? 'লাইভ মেসেজ প্রিভিউ' : 'Live Phone Preview'}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">MadSol Gateway</span>
            </div>

            {/* Handset Screen Bubble */}
            <div className="mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-emerald-400">{providerConfig.senderId}</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="p-3 bg-emerald-900/40 text-emerald-100 rounded-xl rounded-tl-xs text-xs leading-relaxed border border-emerald-500/20 font-sans break-words whitespace-pre-wrap">
                {samplePreviewText}
              </div>

              <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between font-mono">
                <span>To: {sampleRecipient.name} ({sampleRecipient.phone})</span>
                <span className="text-emerald-400">✓✓ Delivered</span>
              </div>
            </div>
          </div>

          {/* Recipient Checkbox List Inspector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs max-h-[460px] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'প্রাপক তালিকা যাচাই' : 'Recipient List'} ({filteredRecipients.length})
              </div>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                {selectedRecipientIds.size === filteredRecipients.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সব আনচেক' : 'Deselect All'}</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সব সিলেক্ট' : 'Select All'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'নাম বা ফোন দিয়ে খুঁজুন...' : 'Search recipient...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecipients.map((rec) => {
                const isChecked = selectedRecipientIds.size === 0 || selectedRecipientIds.has(rec.id);
                return (
                  <div
                    key={rec.id}
                    onClick={() => handleToggleSingle(rec.id)}
                    className="pt-1.5 flex items-center justify-between gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {rec.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {rec.phone} {rec.className && `• ${rec.className}`}
                        </div>
                      </div>
                    </div>
                    {rec.dueAmount && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded shrink-0">
                        ৳{rec.dueAmount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useRef } from 'react';
import {
  PhoneCall,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Users,
  CalendarClock,
  Sparkles,
  Shield,
  Layers,
  Smartphone,
  CheckCircle2,
  Clock,
  Settings2,
  Mic,
  Coins,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { useCommunication } from '../../../context/CommunicationContext';
import { useMadrasaData } from '../../../context/MadrasaDataContext';
import { useLanguage } from '../../../context/LanguageContext';
import { IndividualRecipient, RecipientGroupType, VoiceCallOptions } from '../../../types/communication';

export const VoiceCallBroadcastTab: React.FC = () => {
  const { templates, sendVoiceBroadcast, providerConfig, gateway, isSending } = useCommunication();
  const { students, teachers, classes } = useMadrasaData();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [title, setTitle] = useState('');
  const [voiceScript, setVoiceScript] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroupType>('all_guardians');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [customNumbersText, setCustomNumbersText] = useState('');

  // Voice Engine Config
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [maxDurationSeconds, setMaxDurationSeconds] = useState<number>(45);
  const [retryAttempts, setRetryAttempts] = useState<number>(2);

  // Audio Playback simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Schedule
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Candidate recipients
  const candidateRecipients = useMemo<IndividualRecipient[]>(() => {
    if (recipientGroup === 'all_guardians') {
      return students.map((s) => ({
        id: `vg-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        dueAmount: 1800,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'all_teachers') {
      return teachers.map((t) => ({
        id: `vt-${t.id}`,
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
      return filtered.map((s) => ({
        id: `vcs-${s.id}`,
        name: s.guardian_name || s.name,
        phone: s.guardian_mobile || s.contact_number || '01700000000',
        role: 'guardian',
        studentId: s.id,
        studentName: s.name,
        guardianName: s.guardian_name || s.name,
        className: classes.find((c) => c.id === s.class_id)?.nameBn || s.class_id,
        dueAmount: 1500,
        status: 'pending',
      }));
    }

    if (recipientGroup === 'custom_numbers') {
      const lines = customNumbersText.split(/[\n,]+/).map((l) => l.trim()).filter(Boolean);
      return lines.map((num, idx) => ({
        id: `vcust-${idx}`,
        name: `গ্রাহক ${idx + 1}`,
        phone: num,
        role: 'custom',
        status: 'pending',
      }));
    }

    return students.map((s) => ({
      id: `vdef-${s.id}`,
      name: s.guardian_name || s.name,
      phone: s.guardian_mobile || '01700000000',
      role: 'guardian',
      studentName: s.name,
      status: 'pending',
    }));
  }, [recipientGroup, students, teachers, classes, selectedClassId, customNumbersText]);

  // Insert token helper
  const handleInsertToken = (token: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const next = voiceScript.substring(0, start) + token + voiceScript.substring(end);
    setVoiceScript(next);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + token.length, start + token.length);
      }
    }, 50);
  };

  // Apply template
  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setVoiceScript(tmpl.voiceScript || tmpl.content);
      if (!title) {
        setTitle(isBn ? tmpl.nameBn : tmpl.name);
      }
    }
  };

  // Sample audio TTS Preview player
  const sampleResolvedText = useMemo(() => {
    const sample = candidateRecipients[0] || {
      id: 'samp',
      name: 'আলহাজ্ব মো: জাহিদুল করিম',
      phone: '01766666666',
      role: 'guardian',
      studentName: 'আব্দুল্লাহ আল মাহমুদ',
      guardianName: 'আলহাজ্ব মো: জাহিদুল করিম',
      className: 'হিফজ বিভাগ',
      dueAmount: 1800,
      status: 'pending',
    };
    return gateway.interpolateTemplate(
      voiceScript || 'আসসালামু আলাইকুম। দারুল উলুম মাদ্রাসা থেকে জরুরি বার্তা...',
      sample,
      'দারুল উলুম মাদ্রাসা'
    );
  }, [voiceScript, candidateRecipients, gateway]);

  const handlePlayVoicePreview = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleResolvedText);
      utterance.lang = 'bn-BD';
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  // Calculation of estimated cost
  const estimatedCost = useMemo(() => {
    const estMinutes = Math.ceil(maxDurationSeconds / 60);
    return (candidateRecipients.length * estMinutes * providerConfig.voiceRateBdtPerMin).toFixed(2);
  }, [candidateRecipients, maxDurationSeconds, providerConfig]);

  // Submit Voice Broadcast
  const handleSendVoice = async () => {
    const voiceConfig: VoiceCallOptions = {
      voiceGender,
      language: 'bn-BD',
      speechRate,
      maxDurationSeconds,
      retryAttempts,
    };

    const success = await sendVoiceBroadcast({
      title: title || (isBn ? 'স্বয়ংক্রিয় ভয়েস কল ব্রডকাস্ট' : 'IVR Voice Broadcast'),
      voiceScript,
      recipientGroup,
      targetClassId: selectedClassId,
      targetClassName: classes.find((c) => c.id === selectedClassId)?.nameBn,
      targetSection: selectedSection,
      recipients: candidateRecipients,
      templateId: selectedTemplateId || undefined,
      voiceConfig,
      scheduledAt: isScheduled && scheduledDateTime ? new Date(scheduledDateTime).toISOString() : undefined,
    });

    if (success) {
      setVoiceScript('');
      setTitle('');
      setSelectedTemplateId('');
      setIsScheduled(false);
      setScheduledDateTime('');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isBn ? 'অটোমেটেড ভয়েস কল (IVR) ব্রডকাস্ট' : 'Automated IVR Voice Call Broadcast'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'বাংলা টেক্সট-টু-স্পিচ বা অডিও বার্তার মাধ্যমে স্বয়ংক্রিয়ভাবে অভিভাবকদের ফোনে কল করুন।'
                : 'Broadcast voice calls directly to parent/student phones with natural Bangla voice.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-slate-500">Caller ID:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">{providerConfig.voiceCallerId}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">Rate:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">৳{providerConfig.voiceRateBdtPerMin}/Min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Voice Script & Config */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Recipient Target Selection */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                {isBn ? '১. ভয়েস কলের প্রাপক নির্বাচন' : '1. Select Call Recipients'}
              </label>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                {candidateRecipients.length} {isBn ? 'জন ফোন পাবেন' : 'Recipients'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all_guardians', labelBn: 'সকল অভিভাবক', labelEn: 'All Guardians', icon: Shield },
                { id: 'all_teachers', labelBn: 'সকল শিক্ষক ও স্টাফ', labelEn: 'All Teachers', icon: UserCheck },
                { id: 'class_section', labelBn: 'নির্দিষ্ট শ্রেণি', labelEn: 'Specific Class', icon: Layers },
                { id: 'custom_numbers', labelBn: 'কাস্টম নম্বর', labelEn: 'Custom Numbers', icon: Smartphone },
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
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span className="truncate">{isBn ? grp.labelBn : grp.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {recipientGroup === 'class_section' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="">{isBn ? 'শ্রেণি নির্বাচন করুন' : 'Select Class'}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isBn ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientGroup === 'custom_numbers' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <textarea
                  rows={2}
                  value={customNumbersText}
                  onChange={(e) => setCustomNumbersText(e.target.value)}
                  placeholder="01711111111, 01822222222..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* 2. Voice Script Editor */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-amber-600" />
                {isBn ? '২. ভয়েস কলের কথা বা স্ক্রিপ্ট' : '2. Voice Call Script'}
              </label>

              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-medium cursor-pointer"
              >
                <option value="">{isBn ? '⚡ ভয়েস টেমপ্লেট...' : '⚡ Voice Templates...'}</option>
                {templates
                  .filter((t) => t.type === 'voice_call' || t.type === 'both')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {isBn ? t.nameBn : t.name}
                    </option>
                  ))}
              </select>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBn ? 'ভয়েস ক্যাম্পেইনের শিরোনাম (যেমন: জরুরি ছুটি নোটিশ)' : 'Voice Campaign Title'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />

            {/* Dynamic Tokens */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: '{guardian_name}', label: 'অভিভাবক' },
                { tag: '{student_name}', label: 'শিক্ষার্থী' },
                { tag: '{institution_name}', label: 'মাদ্রাসা' },
                { tag: '{due_amount}', label: 'বকেয়া টাকা' },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleInsertToken(item.tag)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {item.tag} <span className="text-[10px] text-slate-400">({item.label})</span>
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              rows={4}
              value={voiceScript}
              onChange={(e) => setVoiceScript(e.target.value)}
              placeholder={isBn ? 'কল রিসিভ করলে যে বার্তাটি বাংলায় শোনানো হবে তা এখানে লিখুন...' : 'Type Bangla voice script to be read out...'}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
            />

            {/* 3. Voice Settings (Gender, Speed, Retry) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Settings2 className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'ভয়েস ইঞ্জিন ও কল কনফিগারেশন' : 'Voice Engine Settings'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Voice Gender */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                    {isBn ? 'ভয়েস মডেল' : 'Voice Voice'}
                  </label>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value as 'female' | 'male')}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="female">{isBn ? 'আয়েশা (Bangla Female)' : 'Ayesha (Female)'}</option>
                    <option value="male">{isBn ? 'আব্দুল্লাহ (Bangla Male)' : 'Abdullah (Male)'}</option>
                  </select>
                </div>

                {/* Speech Rate */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                    {isBn ? 'কথা বলার গতি' : 'Speech Rate'}: {speechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 mt-2 cursor-pointer"
                  />
                </div>

                {/* Retry Attempts */}
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                    {isBn ? 'কল না ধরলে রিট্রাই' : 'Retry If Busy'}
                  </label>
                  <select
                    value={retryAttempts}
                    onChange={(e) => setRetryAttempts(parseInt(e.target.value))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="1">১ বার চেষ্টা (1 Retry)</option>
                    <option value="2">২ বার চেষ্টা (2 Retries)</option>
                    <option value="3">৩ বার চেষ্টা (3 Retries)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule Voice Call */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isBn ? 'নির্দিষ্ট সময়ে কল করতে চান? (Schedule Call)' : 'Schedule Voice Call'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                    isScheduled ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
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
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 animate-in fade-in">
                  <label className="text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1 block">
                    {isBn ? 'কলের সময় নির্ধারণ করুন' : 'Select Call Schedule Time'}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isSending || candidateRecipients.length === 0 || !voiceScript.trim()}
              onClick={handleSendVoice}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSending || candidateRecipients.length === 0 || !voiceScript.trim()
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 active:scale-98'
              }`}
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ভয়েস কল প্রস্তুত করা হচ্ছে...' : 'Initiating Voice Calls...'}</span>
                </>
              ) : isScheduled ? (
                <>
                  <CalendarClock className="w-4 h-4" />
                  <span>{isBn ? `${candidateRecipients.length} জনের জন্য শিডিউল করুন` : `Schedule Call Broadcast`}</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>{isBn ? `ভয়েস কল শুরু করুন (${candidateRecipients.length} জন)` : `Start Voice Broadcast (${candidateRecipients.length} Calls)`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Audio Player & Simulation */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Voice Player Preview */}
          <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white p-5 rounded-3xl shadow-xl border border-amber-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">{isBn ? 'ভয়েস প্রিভিউ শুনুন' : 'Audio Simulation'}</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">IVR Engine Online</span>
            </div>

            {/* Waveform graphic & Play Button */}
            <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayVoicePreview}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isPlayingAudio ? (isBn ? 'অডিও বাজছে...' : 'Playing Audio...') : (isBn ? 'টেস্ট প্লে করুন' : 'Test Play Script')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {voiceGender === 'female' ? 'আয়েশা (Female TTS)' : 'আব্দুল্লাহ (Male TTS)'} • {speechRate}x Speed
                  </div>
                </div>
              </div>

              {/* Animated audio bar simulation */}
              <div className="flex items-center justify-center gap-1 h-8 pt-1">
                {[4, 8, 12, 16, 10, 6, 14, 18, 12, 8, 14, 10, 6, 12, 16, 8, 4].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlayingAudio ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
                    }`}
                    style={{ height: isPlayingAudio ? `${Math.max(4, (h * (i % 3 + 1)) % 24)}px` : `${h}px` }}
                  />
                ))}
              </div>

              {/* Text being read out */}
              <div className="p-2.5 bg-slate-900 rounded-xl text-[11px] text-slate-300 leading-relaxed max-h-28 overflow-y-auto font-sans">
                {sampleResolvedText}
              </div>
            </div>

            {/* Estimation Summary */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">{isBn ? 'মোট প্রাপক' : 'Recipients'}</div>
                <div className="font-bold text-amber-400 font-mono mt-0.5">{candidateRecipients.length} জন</div>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">{isBn ? 'আনুমানিক খরচ' : 'Est. Cost'}</div>
                <div className="font-bold text-emerald-400 font-mono mt-0.5">৳{estimatedCost}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

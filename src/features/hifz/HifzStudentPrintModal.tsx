import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  BookOpen,
  Sparkles,
  Award,
  Star,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { HifzStudent } from '../../types/hifz';
import { useHifz } from '../../context/HifzContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { QURAN_PARAS_INFO } from '../../data/hifzData';

interface HifzStudentPrintModalProps {
  student: HifzStudent;
  isOpen: boolean;
  onClose: () => void;
}

type DateMode = 'all' | 'today' | 'single' | 'range';

export const HifzStudentPrintModal: React.FC<HifzStudentPrintModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const { institution } = useAuth();
  const { getStudentHistory } = useHifz();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];

  // Simplified Date System
  const [dateMode, setDateMode] = useState<DateMode>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  if (!isOpen) return null;

  const rawHistory = getStudentHistory ? getStudentHistory(student.studentId) : null;
  const allSabak = rawHistory?.sabak || [];
  const allSabki = rawHistory?.sabki || [];
  const allManzil = rawHistory?.manzil || [];
  const allEvaluations = rawHistory?.evaluations || [];

  // Filter records by selected date option
  const filterByDate = (dateStr?: string) => {
    if (!dateStr) return false;
    const entryDate = dateStr.slice(0, 10);

    if (dateMode === 'all') return true;
    if (dateMode === 'today') return entryDate === todayStr;
    if (dateMode === 'single') return entryDate === selectedDate;
    if (dateMode === 'range') {
      if (startDate && endDate) {
        return entryDate >= startDate && entryDate <= endDate;
      }
      if (startDate) return entryDate >= startDate;
      if (endDate) return entryDate <= endDate;
      return true;
    }
    return true;
  };

  const filteredSabak = allSabak.filter((s) => filterByDate(s.date));
  const filteredSabki = allSabki.filter((s) => filterByDate(s.date));
  const filteredManzil = allManzil.filter((s) => filterByDate(s.date));
  const filteredEvaluations = allEvaluations.filter((s) => filterByDate(s.date));

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'qaida':
        return '১. নূরানী কায়দা বিভাগ';
      case 'ampara':
        return '২. আমপারা বিভাগ (৩০তম পারা)';
      case 'nazra':
        return '৩. নাজেরা কুরআন বিভাগ';
      case 'revision':
        return '৫. হিফজ রিভিশন ও দাওর বিভাগ';
      default:
        return '৪. হিফজুল কুরআন বিভাগ';
    }
  };

  const getRatingBadge = (rating?: string) => {
    switch (rating) {
      case 'excellent':
        return 'ممتاز (মমতায / সেরা)';
      case 'very_good':
        return 'جيد جدا (জায়্যিদ জিদ্দান)';
      case 'good':
        return 'جيد (জায়্যিদ / ভালো)';
      case 'needs_improvement':
        return 'يحتاج إلى تحسين (উন্নতি প্রয়োজন)';
      default:
        return 'সন্তোষজনক';
    }
  };

  const getDateRangeLabel = () => {
    if (dateMode === 'all') return 'সকল দিনের পূর্ণাঙ্গ খতিয়ান (প্রথম দিন থেকে আজ পর্যন্ত)';
    if (dateMode === 'today') return `আজকের রিপোর্ট (${todayStr})`;
    if (dateMode === 'single') return `নির্দিষ্ট তারিখের রিপোর্ট: ${selectedDate}`;
    if (dateMode === 'range') return `তারিখের পরিসীমা: ${startDate} হতে ${endDate} পর্যন্ত`;
    return 'সকল দিন';
  };

  const completedSet = new Set(student.completedParas || []);

  // Generate Standalone Printable HTML
  const generateHTMLDocument = () => {
    const instName = institution?.nameBn || 'দারুল উলুম ইসলামিয়া মাদরাসা';
    const instAddr = institution?.addressBn || 'মাদরাসা ক্যাম্পাস';
    const instPhone = institution?.phone || '০১৭০০০০০০০০';
    const stageTitle = getStageTitle(student.stage);
    const branchTitle = student.branch === 'mohila' ? 'মহিলা শাখা' : 'ছাত্র শাখা';

    // Sabak Rows
    const sabakRows = filteredSabak.length === 0
      ? `<tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">উক্ত সময়ে কোনো নতুন ছবক এন্ট্রি নেই।</td></tr>`
      : filteredSabak.map((s) => `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold;">${s.date}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${s.paraNumber ? `পারা ${s.paraNumber}` : s.pageNumber ? `পৃষ্ঠা ${s.pageNumber}` : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${s.lessonDescription || s.surahName || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold; color: #047857;">${getRatingBadge(s.rating)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${s.teacherComment || '-'}</td>
          </tr>
        `).join('');

    // Sabki Rows
    const sabkiRows = filteredSabki.length === 0
      ? `<tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">উক্ত সময়ে কোনো সাত ছবক এন্ট্রি নেই।</td></tr>`
      : filteredSabki.map((sk) => `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold;">${sk.date}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${sk.portion || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${sk.mistakeLevel === 'none' ? 'কোনো ভুল নেই' : sk.mistakeLevel === 'few' ? 'সামান্য ভুল' : 'বেশি ভুল'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold; color: #0f766e;">${getRatingBadge(sk.rating)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${sk.teacherComment || '-'}</td>
          </tr>
        `).join('');

    // Manzil Rows
    const manzilRows = filteredManzil.length === 0
      ? `<tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">উক্ত সময়ে কোনো আমুক্তা এন্ট্রি নেই।</td></tr>`
      : filteredManzil.map((m) => `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold;">${m.date}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${m.paraNumber ? `পারা ${m.paraNumber}` : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${m.portion || '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold; color: #b45309;">${getRatingBadge(m.rating)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${m.teacherComment || '-'}</td>
          </tr>
        `).join('');

    // Evaluations Rows
    const evalRows = filteredEvaluations.length === 0
      ? `<tr><td colspan="8" style="padding: 10px; text-align: center; color: #64748b;">উক্ত সময়ে কোনো দৈনিক মূল্যায়ন নেই।</td></tr>`
      : filteredEvaluations.map((ev) => `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold;">${ev.date}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${ev.sabak}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${ev.sabki}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${ev.manzil}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${ev.tajweed}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">${ev.attendance}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: bold; color: #d97706;">⭐ ${ev.overallStars}/৫</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px; color: #475569;">${ev.teacherComment || '-'}</td>
          </tr>
        `).join('');

    // 30 Paras HTML (for Hifz / Nazra)
    let parasSection = '';
    if (student.stage === 'hifz' || student.stage === 'nazra') {
      const parasGrid = QURAN_PARAS_INFO.map((p) => {
        const isDone = completedSet.has(p.number);
        const isCur = student.currentPara === p.number;
        const bg = isDone ? '#0f172a' : isCur ? '#fef3c7' : '#ffffff';
        const color = isDone ? '#ffffff' : isCur ? '#78350f' : '#64748b';
        const border = isDone ? '#0f172a' : isCur ? '#f59e0b' : '#cbd5e1';
        return `
          <div style="background: ${bg}; color: ${color}; border: 1px solid ${border}; padding: 4px; border-radius: 4px; font-size: 10px; font-weight: bold; text-align: center;">
            <div>পারা ${p.number}</div>
            <div style="font-size: 8px; font-weight: normal;">${isDone ? '✓ সম্পন্ন' : isCur ? '⚡চলতি' : '-'}</div>
          </div>
        `;
      }).join('');

      parasSection = `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
            <strong style="font-size: 13px; color: #0f172a;">৫. কুরআন মাজিদের ৩০ পারা হিফজ অগ্রগতি সারসংক্ষেপ</strong>
            <span style="font-size: 11px; color: #475569; font-weight: bold;">সম্পন্ন: ${completedSet.size} পারা • চলমান: পারা ${student.currentPara} • বাকি: ${30 - completedSet.size} পারা</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px;">
            ${parasGrid}
          </div>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${student.fullNameBn} - খতিয়ান ও অগ্রগতি প্রতিবেদন</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #0f172a; background: #ffffff; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 22px; color: #0f172a; }
    .header p { margin: 4px 0 0; font-size: 12px; color: #475569; }
    .badge { display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 8px; }
    .date-bar { display: flex; justify-content: space-between; font-size: 11px; color: #475569; font-weight: bold; margin-top: 8px; }
    .profile-card { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; }
    .profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .current-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; }
    .current-item { background: #ffffff; border: 1px solid #cbd5e1; padding: 6px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px; }
    th { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    .section-title { font-size: 13px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px; }
    .footer-signatures { margin-top: 30px; padding-top: 20px; border-top: 1px solid #94a3b8; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-size: 12px; }
    .sig-line { height: 40px; border-bottom: 1px dashed #94a3b8; margin-bottom: 6px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 15px; text-align: right;">
    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer;">🖨️ প্রিন্ট করুন / Save as PDF</button>
  </div>

  <div class="header">
    <h1>${instName}</h1>
    <p>${instAddr} • ফোন: ${instPhone}</p>
    <div class="badge">${branchTitle} • ${stageTitle} — শিক্ষার্থী খতিয়ান ও অগ্রগতি প্রতিবেদন</div>
    <div class="date-bar">
      <span>${getDateRangeLabel()}</span>
      <span>প্রিন্ট তারিখ: ${todayStr}</span>
    </div>
  </div>

  <div class="profile-card">
    <div class="profile-grid">
      <div>
        <span style="font-size: 10px; color: #64748b; display: block;">শিক্ষার্থীর নাম:</span>
        <strong style="font-size: 14px; color: #0f172a;">${student.fullNameBn}</strong>
        <span style="font-size: 10px; color: #64748b; display: block;">(${student.fullNameEn})</span>
      </div>
      <div>
        <span style="font-size: 10px; color: #64748b; display: block;">রোল ও আইডি:</span>
        <strong>রোল: ${student.rollNumber}</strong>
        <span style="font-size: 10px; color: #475569; display: block;">আইডি: ${student.studentCode}</span>
      </div>
      <div>
        <span style="font-size: 10px; color: #64748b; display: block;">মারহালা / স্তর:</span>
        <strong style="color: #065f46;">${stageTitle}</strong>
        <span style="font-size: 10px; color: #475569; display: block;">অগ্রগতি: ${student.progressPercentage || 0}%</span>
      </div>
      <div>
        <span style="font-size: 10px; color: #64748b; display: block;">উস্তাদ ও অভিভাবক:</span>
        <strong>উস্তাদ: ${student.assignedTeacherName}</strong>
        <span style="font-size: 10px; color: #475569; display: block;">অভিভাবক: ${student.guardianName} (${student.guardianMobile})</span>
      </div>
    </div>

    <div class="current-grid">
      <div class="current-item">
        <span style="font-size: 10px; color: #64748b; display: block;">বর্তমান ছবক:</span>
        <strong>${student.currentLessonDescription || student.currentSurah || 'নির্ধারিত নয়'}</strong>
      </div>
      <div class="current-item">
        <span style="font-size: 10px; color: #64748b; display: block;">সাত ছবক (ছবকী):</span>
        <strong>${student.currentSaatSabak || 'নিয়মিত'}</strong>
      </div>
      <div class="current-item">
        <span style="font-size: 10px; color: #64748b; display: block;">আমুক্তা (মনজিল):</span>
        <strong>${student.currentAmukhta || 'নিয়মিত'}</strong>
      </div>
    </div>
  </div>

  <div class="section-title">১. নতুন ছবক খতিয়ান তালিকা (${filteredSabak.length} টি রেকর্ড)</div>
  <table>
    <thead>
      <tr>
        <th>তারিখ</th>
        <th>পারা / পৃষ্ঠা</th>
        <th>ছবকের বিবরণ ও পাঠ</th>
        <th>মান / রেটিং</th>
        <th>শিক্ষকের মন্তব্য</th>
      </tr>
    </thead>
    <tbody>${sabakRows}</tbody>
  </table>

  <div class="section-title">২. সাত ছবক (ছবকী রিভিশন) খতিয়ান (${filteredSabki.length} টি রেকর্ড)</div>
  <table>
    <thead>
      <tr>
        <th>তারিখ</th>
        <th>শোনানো অংশ / বিবরণ</th>
        <th>ভুলের মাত্রা</th>
        <th>মান / রেটিং</th>
        <th>শিক্ষকের মন্তব্য</th>
      </tr>
    </thead>
    <tbody>${sabkiRows}</tbody>
  </table>

  <div class="section-title">৩. আমুক্তা (পুরাতন পারা / মনজিল দাওর) খতিয়ান (${filteredManzil.length} টি রেকর্ড)</div>
  <table>
    <thead>
      <tr>
        <th>তারিখ</th>
        <th>পারা / অধ্যায়</th>
        <th>শোনানো অংশ / বিবরণ</th>
        <th>মান / রেটিং</th>
        <th>শিক্ষকের মন্তব্য</th>
      </tr>
    </thead>
    <tbody>${manzilRows}</tbody>
  </table>

  <div class="section-title">৪. দৈনিক সার্বিক মূল্যায়ন ও আচরণ প্রতিবেদন (${filteredEvaluations.length} টি রেকর্ড)</div>
  <table>
    <thead>
      <tr>
        <th>তারিখ</th>
        <th>ছবকা</th>
        <th>সাত ছবকী</th>
        <th>মনজিল</th>
        <th>তাজবীদ</th>
        <th>উপস্থিতি</th>
        <th>সার্বিক স্টার</th>
        <th>মন্তব্য</th>
      </tr>
    </thead>
    <tbody>${evalRows}</tbody>
  </table>

  ${parasSection}

  <div class="footer-signatures">
    <div>
      <div class="sig-line"></div>
      <strong>দায়িত্বপ্রাপ্ত উস্তাযের স্বাক্ষর</strong>
    </div>
    <div>
      <div class="sig-line"></div>
      <strong>অভিভাবকের স্বাক্ষর</strong>
    </div>
    <div>
      <div class="sig-line"></div>
      <strong>মুহতামিম / অধ্যক্ষের স্বাক্ষর ও সিল</strong>
    </div>
  </div>
</body>
</html>`;
  };

  // Direct Browser Download
  const handleDownloadReport = () => {
    try {
      const htmlContent = generateHTMLDocument();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = student.fullNameBn.replace(/\s+/g, '_');
      link.download = `${sanitizedName}_খতিয়ান_${dateMode === 'single' ? selectedDate : todayStr}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('রিপোর্ট ফাইল সফলভাবে ডাউনলোড হয়েছে! ফাইলটি ওপেন করে সরাসরি প্রিন্ট বা PDF হিসেবে সেভ করতে পারবেন।', 'success');
    } catch (e) {
      console.error(e);
      showToast('ডাউনলোড করতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Handle Direct Print with fallback
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
      handleDownloadReport();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Top Header Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 dark:bg-slate-800/80 px-4 sm:px-5 py-3.5 rounded-t-3xl dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                রিপোর্ট প্রিন্ট ও ডাউনলোড
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {student.fullNameBn} (রোল: {student.rollNumber})
              </p>
            </div>
          </div>

          {/* Action Buttons: Both Download and Print */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Download Button (Works 100% on Mobile / Android) */}
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              title="রিপোর্ট ডাউনলোড করুন (HTML / PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              title="সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Clean & Simple Date System Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 print:hidden space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Simple Mode Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                তারিখ:
              </span>

              <button
                type="button"
                onClick={() => setDateMode('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                সব দিন
              </button>

              <button
                type="button"
                onClick={() => setDateMode('today')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateMode === 'today'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                আজকের দিন
              </button>

              <button
                type="button"
                onClick={() => setDateMode('single')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                নির্দিষ্ট তারিখ
              </button>

              <button
                type="button"
                onClick={() => setDateMode('range')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  dateMode === 'range'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                তারিখের পরিসীমা
              </button>
            </div>

            {/* Date Pickers */}
            {dateMode === 'single' && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 font-bold">তারিখ:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {dateMode === 'range' && (
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-500 font-bold">হতে:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-bold">পর্যন্ত:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE DOCUMENT BODY (A4 Paper Print Ready View) */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-8 max-h-[65vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4 text-slate-900 bg-white">
          
          {/* Madrasa Official Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {institution?.nameBn || 'দারুল উলুম ইসলামিয়া মাদরাসা'}
            </h1>
            <p className="text-xs text-slate-700 mt-0.5">
              {institution?.addressBn || 'মাদরাসা ক্যাম্পাস'} • ফোন: {institution?.phone || '০১৭০০০০০০০০'}
            </p>
            <div className="mt-2 inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
              {student.branch === 'mohila' ? 'মহিলা শাখা' : 'ছাত্র শাখা'} • {getStageTitle(student.stage)} — শিক্ষার্থী খতিয়ান ও অগ্রগতি প্রতিবেদন
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600 font-bold px-2">
              <span>{getDateRangeLabel()}</span>
              <span>প্রিন্ট তারিখ: {todayStr}</span>
            </div>
          </div>

          {/* Student Profile Info Summary Card */}
          <div className="mb-4 rounded-xl border border-slate-300 p-3.5 bg-slate-50/70 print:bg-white text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-500 block">শিক্ষার্থীর নাম:</span>
                <span className="font-bold text-slate-900 text-sm">{student.fullNameBn}</span>
                <span className="text-[10px] text-slate-500 block">({student.fullNameEn})</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">রোল ও আইডি:</span>
                <span className="font-bold text-slate-900">রোল: {student.rollNumber}</span>
                <span className="text-[10px] text-slate-600 block">আইডি: {student.studentCode}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">মারহালা / স্তর:</span>
                <span className="font-bold text-emerald-800">{getStageTitle(student.stage)}</span>
                <span className="text-[10px] text-slate-600 block">অগ্রগতি: {student.progressPercentage || 0}%</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">উস্তাদ ও অভিভাবক:</span>
                <span className="font-bold text-slate-900">উস্তাদ: {student.assignedTeacherName}</span>
                <span className="text-[10px] text-slate-600 block">অভিভাবক: {student.guardianName} ({student.guardianMobile})</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
              <div className="p-1 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">বর্তমান ছবক:</span>
                <span className="font-bold text-slate-900">{student.currentLessonDescription || student.currentSurah || 'নির্ধারিত নয়'}</span>
              </div>
              <div className="p-1 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">সাত ছবক (ছবকী):</span>
                <span className="font-bold text-slate-900">{student.currentSaatSabak || 'নিয়মিত'}</span>
              </div>
              <div className="p-1 rounded bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">আমুক্তা (মনজিল):</span>
                <span className="font-bold text-slate-900">{student.currentAmukhta || 'নিয়মিত'}</span>
              </div>
            </div>
          </div>

          {/* 1. SABAK (NEW LESSON) TABLE */}
          <div className="mb-4">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                ১. নতুন ছবক খতিয়ান তালিকা ({filteredSabak.length} টি রেকর্ড)
              </h3>
            </div>

            {filteredSabak.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">উক্ত সময়ে কোনো নতুন ছবক এন্ট্রি নেই।</p>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 px-2 py-1">তারিখ</th>
                    <th className="border border-slate-300 px-2 py-1">পারা / পৃষ্ঠা</th>
                    <th className="border border-slate-300 px-2 py-1">ছবকের বিবরণ ও পাঠ</th>
                    <th className="border border-slate-300 px-2 py-1">মান / রেটিং</th>
                    <th className="border border-slate-300 px-2 py-1">শিক্ষকের মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSabak.map((s) => (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2 py-1 font-semibold whitespace-nowrap">{s.date}</td>
                      <td className="border border-slate-300 px-2 py-1">{s.paraNumber ? `পারা ${s.paraNumber}` : s.pageNumber ? `পৃষ্ঠা ${s.pageNumber}` : '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium">{s.lessonDescription || s.surahName || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 whitespace-nowrap font-bold text-emerald-800">{getRatingBadge(s.rating)}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{s.teacherComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 2. SAAT SABAK (SABKI) TABLE */}
          <div className="mb-4">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                ২. সাত ছবক (ছবকী রিভিশন) খতিয়ান ({filteredSabki.length} টি রেকর্ড)
              </h3>
            </div>

            {filteredSabki.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">উক্ত সময়ে কোনো সাত ছবক এন্ট্রি নেই।</p>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 px-2 py-1">তারিখ</th>
                    <th className="border border-slate-300 px-2 py-1">শোনানো অংশ / বিবরণ</th>
                    <th className="border border-slate-300 px-2 py-1">ভুলের মাত্রা</th>
                    <th className="border border-slate-300 px-2 py-1">মান / রেটিং</th>
                    <th className="border border-slate-300 px-2 py-1">শিক্ষকের মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSabki.map((sk) => (
                    <tr key={sk.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2 py-1 font-semibold whitespace-nowrap">{sk.date}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium">{sk.portion || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1">{sk.mistakeLevel === 'none' ? 'কোনো ভুল নেই' : sk.mistakeLevel === 'few' ? 'সামান্য ভুল' : 'বেশি ভুল'}</td>
                      <td className="border border-slate-300 px-2 py-1 whitespace-nowrap font-bold text-teal-800">{getRatingBadge(sk.rating)}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{sk.teacherComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 3. AMUKHTA (MANZIL) TABLE */}
          <div className="mb-4">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                ৩. আমুক্তা (পুরাতন পারা / মনজিল দাওর) খতিয়ান ({filteredManzil.length} টি রেকর্ড)
              </h3>
            </div>

            {filteredManzil.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">উক্ত সময়ে কোনো আমুক্তা এন্ট্রি নেই।</p>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 px-2 py-1">তারিখ</th>
                    <th className="border border-slate-300 px-2 py-1">পারা / অধ্যায়</th>
                    <th className="border border-slate-300 px-2 py-1">শোনানো অংশ / বিবরণ</th>
                    <th className="border border-slate-300 px-2 py-1">মান / রেটিং</th>
                    <th className="border border-slate-300 px-2 py-1">শিক্ষকের মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManzil.map((m) => (
                    <tr key={m.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2 py-1 font-semibold whitespace-nowrap">{m.date}</td>
                      <td className="border border-slate-300 px-2 py-1">{m.paraNumber ? `পারা ${m.paraNumber}` : '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium">{m.portion || '-'}</td>
                      <td className="border border-slate-300 px-2 py-1 whitespace-nowrap font-bold text-amber-800">{getRatingBadge(m.rating)}</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{m.teacherComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 4. DAILY EVALUATIONS TABLE */}
          <div className="mb-4">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-blue-700" />
                ৪. দৈনিক সার্বিক মূল্যায়ন ও আচরণ প্রতিবেদন ({filteredEvaluations.length} টি রেকর্ড)
              </h3>
            </div>

            {filteredEvaluations.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-1">উক্ত সময়ে কোনো দৈনিক মূল্যায়ন নেই।</p>
            ) : (
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 px-2 py-1">তারিখ</th>
                    <th className="border border-slate-300 px-2 py-1">ছবকা</th>
                    <th className="border border-slate-300 px-2 py-1">সাত ছবকী</th>
                    <th className="border border-slate-300 px-2 py-1">মনজিল</th>
                    <th className="border border-slate-300 px-2 py-1">তাজবীদ</th>
                    <th className="border border-slate-300 px-2 py-1">উপস্থিতি</th>
                    <th className="border border-slate-300 px-2 py-1">সার্বিক স্টার</th>
                    <th className="border border-slate-300 px-2 py-1">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvaluations.map((ev) => (
                    <tr key={ev.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-2 py-1 font-semibold whitespace-nowrap">{ev.date}</td>
                      <td className="border border-slate-300 px-2 py-1">{ev.sabak}</td>
                      <td className="border border-slate-300 px-2 py-1">{ev.sabki}</td>
                      <td className="border border-slate-300 px-2 py-1">{ev.manzil}</td>
                      <td className="border border-slate-300 px-2 py-1">{ev.tajweed}</td>
                      <td className="border border-slate-300 px-2 py-1">{ev.attendance}</td>
                      <td className="border border-slate-300 px-2 py-1 font-bold text-amber-600">⭐ {ev.overallStars}/৫</td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600">{ev.teacherComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 5. 30 PARAS PROGRESS SUMMARY (For Hifz / Nazra) */}
          {(student.stage === 'hifz' || student.stage === 'nazra') && (
            <div className="mb-4">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
                <h3 className="text-xs font-black text-slate-900">
                  ৫. কুরআন মাজিদের ৩০ পারা হিফজ অগ্রগতি সারসংক্ষেপ
                </h3>
                <span className="text-[10px] text-slate-600 font-bold">
                  সম্পন্ন: {completedSet.size} পারা • চলমান: পারা {student.currentPara} • বাকি: {30 - completedSet.size} পারা
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 text-center text-[9px]">
                {QURAN_PARAS_INFO.map((p) => {
                  const isDone = completedSet.has(p.number);
                  const isCur = student.currentPara === p.number;
                  return (
                    <div
                      key={p.number}
                      className={`p-1 rounded border font-bold ${
                        isDone
                          ? 'bg-slate-900 text-white border-slate-900'
                          : isCur
                          ? 'bg-amber-100 text-amber-900 border-amber-500'
                          : 'bg-white text-slate-500 border-slate-300'
                      }`}
                    >
                      <span>পারা {p.number}</span>
                      <span className="block text-[8px] font-normal truncate">{isDone ? '✓ সম্পন্ন' : isCur ? '⚡চলতি' : '-'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Official Signatures & Stamp Footer */}
          <div className="mt-8 pt-8 border-t border-slate-400 grid grid-cols-3 gap-4 text-center text-xs text-slate-800">
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <span className="font-bold">দায়িত্বপ্রাপ্ত উস্তাযের স্বাক্ষর</span>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <span className="font-bold">অভিভাবকের স্বাক্ষর</span>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <span className="font-bold">মুহতামিম / অধ্যক্ষের স্বাক্ষর ও সিল</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

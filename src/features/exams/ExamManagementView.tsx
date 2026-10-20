import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  BookOpen,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Printer,
  Sparkles,
  Search,
  Filter,
  Users,
  Clock,
  Save,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { Exam, StudentResult } from '../../types/academic';
import { CreateExamModal } from './CreateExamModal';
import { AddExamSubjectModal } from './AddExamSubjectModal';
import { DigitalMarksheetModal } from './DigitalMarksheetModal';
import { AdmitCardModal } from './AdmitCardModal';
import { SeatPlanModal } from './SeatPlanModal';

export const ExamManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const madrasaData = useMadrasaData();
  const students = madrasaData?.students || [];
  const examContext = useExam();

  const scopedExams = examContext?.scopedExams || examContext?.exams || [];
  const examSubjects = examContext?.examSubjects || [];
  const studentMarks = examContext?.studentMarks || [];
  const studentResults = examContext?.studentResults || [];
  const saveStudentMarks = examContext?.saveStudentMarks;
  const generateExamResults = examContext?.generateExamResults;
  const publishExamResults = examContext?.publishExamResults;
  const deleteExam = examContext?.deleteExam;

  const isBn = language === 'bn';
  const canManageExams =
    user?.role === 'super_admin' ||
    user?.role === 'madrasa_admin' ||
    user?.role === 'principal' ||
    user?.role === 'teacher';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'exams' | 'subjects' | 'marks_entry' | 'results'>('exams');

  // Selected Exam for sub-views
  const [selectedExamId, setSelectedExamId] = useState<string>(scopedExams[0]?.id || '');
  const selectedExam = (scopedExams || []).find((e) => e.id === selectedExamId) || scopedExams[0];

  // Subject selected for marks entry
  const examSubjs = (examSubjects || []).filter((s) => s.examId === (selectedExam?.id || ''));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(examSubjs[0]?.id || '');

  // Marks Entry Form State
  const [marksData, setMarksData] = useState<Record<string, { marks: number; isAbsent: boolean; remarks: string }>>({});
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Modals state
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);
  const [selectedResultForModal, setSelectedResultForModal] = useState<StudentResult | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');

  // Results for selected exam
  const currentExamResults = (studentResults || []).filter((r) => r.examId === selectedExam?.id);
  const sortedResults = [...currentExamResults].sort((a, b) => a.position - b.position);

  // Sync marks when exam or subject changes
  React.useEffect(() => {
    if ((examSubjs || []).length > 0 && !examSubjs.find((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(examSubjs[0]?.id || '');
    }
  }, [selectedExamId, examSubjs, selectedSubjectId]);

  // Load existing marks into state
  React.useEffect(() => {
    if (selectedExam && selectedSubjectId) {
      const existing = studentMarks.filter(
        (m) => m.examId === selectedExam.id && m.subjectId === selectedSubjectId
      );
      const initialMap: Record<string, { marks: number; isAbsent: boolean; remarks: string }> = {};

      students.forEach((std) => {
        const found = existing.find((m) => m.studentId === std.id);
        if (found) {
          initialMap[std.id] = {
            marks: found.obtainedMarks,
            isAbsent: found.isAbsent,
            remarks: found.remarks || '',
          };
        } else {
          initialMap[std.id] = {
            marks: 85,
            isAbsent: false,
            remarks: '',
          };
        }
      });
      setMarksData(initialMap);
    }
  }, [selectedExam, selectedSubjectId, studentMarks, students]);

  // Handle batch save marks
  const handleSaveAllMarks = async () => {
    if (!selectedExam || !selectedSubjectId) return;
    const currentSubj = examSubjs.find((s) => s.id === selectedSubjectId);
    if (!currentSubj) return;

    setIsSavingMarks(true);
    try {
      const entries = students.map((std) => {
        const val = marksData[std.id] || { marks: 0, isAbsent: false, remarks: '' };
        return {
          institutionId: selectedExam.institutionId,
          examId: selectedExam.id,
          subjectId: selectedSubjectId,
          studentId: std.id,
          studentNameBn: std.fullNameBn,
          studentRoll: std.rollNumber,
          obtainedMarks: val.marks,
          fullMarks: currentSubj.fullMarks,
          passMarks: currentSubj.passMarks,
          isAbsent: val.isAbsent,
          remarks: val.remarks,
        };
      });

      await saveStudentMarks(entries);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMarks(false);
    }
  };

  // KPI calculations
  const totalExams = (scopedExams || []).length;
  const publishedExamsCount = (scopedExams || []).filter((e) => e.status === 'published').length;
  const totalSubjectsCount = (examSubjects || []).length;
  const totalResultsCount = (studentResults || []).length;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isBn ? 'পরীক্ষা ব্যবস্থাপনা, নম্বরপত্র ও মেধা তালিকা' : 'Exam & Automated Result System'}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? 'বিষয়ভিত্তিক নম্বর এন্ট্রি, স্বয়ংক্রিয় জিপিএ গ্রেডিং, মেধা তালিকা ও প্রিন্টেবল ডিজিটাল মার্কশিট'
              : 'Marks entry, automated GPA grade processing, merit list and printable transcripts'}
          </p>
        </div>

        {canManageExams && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAdmitCardOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
              title="প্রবেশপত্র জেনারেট ও প্রিন্ট করুন"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isBn ? 'প্রবেশপত্র (Admit Card)' : 'Admit Cards'}</span>
            </button>

            <button
              onClick={() => setIsSeatPlanOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition cursor-pointer"
              title="সিট প্ল্যান ও বেঞ্চ স্লিপ প্রিন্ট করুন"
            >
              <Award className="h-3.5 w-3.5" />
              <span>{isBn ? 'আসন বিন্যাস (Seat Plan)' : 'Seat Plan'}</span>
            </button>

            <button
              onClick={() => setIsCreateExamOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isBn ? 'নতুন পরীক্ষা তৈরি' : 'Create Exam'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট পরীক্ষাসমূহ' : 'Total Exams'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalExams} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-600 dark:text-blue-400">
            {publishedExamsCount} {isBn ? 'টি ফলাফল প্রকাশিত' : 'published'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'নির্ধারিত বিষয় ও রুটিন' : 'Subjects Scheduled'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalSubjectsCount} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            {isBn ? 'পূর্ণ মান ও সময়সূচিসহ' : 'With full marks & room'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট নম্বর এন্ট্রি' : 'Marks Entries'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Edit3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {(studentMarks || []).length} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
            {isBn ? 'খাতায় মূল্যায়ন সম্পন্ন' : 'Evaluated records'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'প্রস্তুতকৃত ফলাফল' : 'Processed Results'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {totalResultsCount} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-purple-700 dark:text-purple-300">
            {isBn ? 'স্বয়ংক্রিয় জিপিএ ও র‍্যাংক' : 'Auto GPA & Rank'}
          </div>
        </div>
      </div>

      {/* Select Active Exam Dropdown Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isBn ? 'বর্তমান নির্বাচিত পরীক্ষা:' : 'Selected Exam:'}
          </span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 shadow-xs"
          >
            {(scopedExams || []).map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nameBn} ({ex.className} - {ex.session})
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${
              selectedExam.status === 'published'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : selectedExam.status === 'ongoing'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {selectedExam.status === 'published' ? 'ফলাফল প্রকাশিত' : selectedExam.status === 'ongoing' ? 'পরীক্ষা চলমান' : 'আসন্ন পরীক্ষা'}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              তারিখ: {selectedExam.startDate} হতে {selectedExam.endDate}
            </span>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('exams')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'exams'
                ? 'border-b-2 border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'পরীক্ষাসমূহ' : 'All Exams'}
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'subjects'
                ? 'border-b-2 border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? `বিষয় ও পরীক্ষার রুটিন (${(examSubjs || []).length})` : 'Subjects & Schedule'}
          </button>
          <button
            onClick={() => setActiveTab('marks_entry')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'marks_entry'
                ? 'border-b-2 border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'নম্বর এন্ট্রি (Marks Entry)' : 'Marks Entry'}
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'results'
                ? 'border-b-2 border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? `ফলাফল ও মেধা তালিকা (${(currentExamResults || []).length})` : 'Results & Merit List'}
          </button>
        </div>
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(scopedExams || []).map((ex) => {
            const subCount = (examSubjects || []).filter((s) => s.examId === ex.id).length;
            const resCount = (studentResults || []).filter((r) => r.examId === ex.id).length;

            return (
              <div
                key={ex.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {ex.session}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                      {ex.nameBn}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ex.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ex.status === 'ongoing'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {ex.status === 'published' ? 'প্রকাশিত' : ex.status === 'ongoing' ? 'চলমান' : 'আসন্ন'}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>বিভাগ: <strong>{ex.department}</strong> | শ্রেণী: <strong>{ex.className}</strong></p>
                  <p>তারিখ: <strong>{ex.startDate} হতে {ex.endDate}</strong></p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <span>বিষয়: <strong className="text-slate-800 dark:text-white">{subCount} টি</strong></span>
                  <span>ফলাফল: <strong className="text-slate-800 dark:text-white">{resCount} জন</strong></span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveTab('subjects');
                    }}
                    className="flex-1 rounded-xl bg-slate-100 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-center"
                  >
                    বিষয় ও রুটিন
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExamId(ex.id);
                      setActiveTab('results');
                    }}
                    className="flex-1 rounded-xl bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition text-center"
                  >
                    ফলাফল
                  </button>
                  {canManageExams && (
                    <button
                      onClick={() => deleteExam(ex.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                      title="পরীক্ষা মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SUBJECTS & SCHEDULE */}
      {activeTab === 'subjects' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedExam?.nameBn} — বিষয়ভিত্তিক সময়সূচি
              </h3>
              <p className="text-xs text-slate-500">
                পরীক্ষার কক্ষ, হল পরিদর্শক ও পূর্ণ নম্বরের তালিকা
              </p>
            </div>
            {canManageExams && selectedExam && (
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>{isBn ? 'নতুন বিষয় যুক্ত করুন' : 'Add Subject'}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">কোড</th>
                  <th className="py-3 px-4">বিষয়ের নাম</th>
                  <th className="py-3 px-4">পূর্ণ নম্বর</th>
                  <th className="py-3 px-4">পাস নম্বর</th>
                  <th className="py-3 px-4">পরীক্ষার তারিখ</th>
                  <th className="py-3 px-4">সময়কাল</th>
                  <th className="py-3 px-4">কক্ষ</th>
                  <th className="py-3 px-4">হল পরিদর্শক</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {examSubjs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">{sub.subjectCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {sub.subjectNameBn}
                    </td>
                    <td className="py-3 px-4 font-semibold">{sub.fullMarks}</td>
                    <td className="py-3 px-4 font-semibold text-rose-600">{sub.passMarks}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{sub.examDate}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{sub.startTime} - {sub.endTime}</td>
                    <td className="py-3 px-4 font-medium">{sub.roomNumber}</td>
                    <td className="py-3 px-4">{sub.invigilatorTeacherName}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setActiveTab('marks_entry');
                        }}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                      >
                        নম্বর এন্ট্রি
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MARKS ENTRY */}
      {activeTab === 'marks_entry' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'বিষয়ভিত্তিক নম্বর এন্ট্রি ফরম' : 'Subject Marks Entry Form'}
              </h3>
              <p className="text-xs text-slate-500">
                শিক্ষার্থীদের পরীক্ষার প্রাপ্ত নম্বর ইনপুট দিন ও স্বয়ংক্রিয় ফলাফলের জন্য সংরক্ষণ করুন
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Select Subject */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">বিষয়:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {examSubjs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subjectNameBn} (পূর্ণ: {s.fullMarks})
                    </option>
                  ))}
                </select>
              </div>

              {/* Save All Button */}
              {canManageExams && (
                <button
                  onClick={handleSaveAllMarks}
                  disabled={isSavingMarks}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSavingMarks ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সকল নম্বর সংরক্ষণ' : 'Save All Marks')}</span>
                </button>
              )}
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{isBn ? 'সকল শিক্ষার্থীর নম্বর সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!' : 'All marks saved successfully!'}</span>
            </div>
          )}

          {/* Marks Entry Table */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 w-16">রোল</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">আইডি</th>
                  <th className="py-3 px-4 w-32">প্রাপ্ত নম্বর</th>
                  <th className="py-3 px-4 w-28 text-center">অনুপস্থিত</th>
                  <th className="py-3 px-4">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((std) => {
                  const val = marksData[std.id] || { marks: 0, isAbsent: false, remarks: '' };
                  const currentSubj = examSubjs.find((s) => s.id === selectedSubjectId);
                  const fullMarks = currentSubj?.fullMarks || 100;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{std.rollNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                        {std.fullNameBn}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{std.studentId}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max={fullMarks}
                          disabled={val.isAbsent}
                          value={val.marks}
                          onChange={(e) => {
                            const newMarks = Number(e.target.value);
                            setMarksData((prev) => ({
                              ...prev,
                              [std.id]: { ...val, marks: newMarks },
                            }));
                          }}
                          className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={val.isAbsent}
                          onChange={(e) => {
                            const isAbsent = e.target.checked;
                            setMarksData((prev) => ({
                              ...prev,
                              [std.id]: {
                                ...val,
                                isAbsent,
                                marks: isAbsent ? 0 : val.marks,
                              },
                            }));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={val.remarks}
                          onChange={(e) => {
                            const remarks = e.target.value;
                            setMarksData((prev) => ({
                              ...prev,
                              [std.id]: { ...val, remarks },
                            }));
                          }}
                          placeholder="মন্তব্য (ঐচ্ছিক)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED RESULTS & MERIT LIST */}
      {activeTab === 'results' && (
        <div className="space-y-6 w-full max-w-full min-w-0">
          {/* Top Actions for Results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedExam?.nameBn} — মেধা তালিকা ও ফলাফল
              </h3>
              <p className="text-xs text-slate-500">
                নম্বরপত্রের ভিত্তিতে স্বয়ংক্রিয় জিপিএ, লেটার গ্রেড ও মেধা অবস্থান (Merit Position)
              </p>
            </div>

            {canManageExams && selectedExam && (
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    await generateExamResults(selectedExam.id);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isBn ? 'স্বয়ংক্রিয় ফলাফল প্রস্তুত করুন' : 'Generate Results'}</span>
                </button>

                {selectedExam.status !== 'published' && (
                  <button
                    onClick={async () => {
                      await publishExamResults(selectedExam.id);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isBn ? 'ফলাফল প্রকাশ করুন' : 'Publish'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Top 3 Podium Cards */}
          {sortedResults.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="order-2 sm:order-1 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 text-center shadow-xs dark:border-slate-800 dark:from-slate-800 dark:to-slate-900">
                <div className="text-2xl">🥈</div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">২য় স্থান (2nd Position)</span>
                <h4 className="font-black text-slate-900 dark:text-white text-base mt-1">{sortedResults[1]?.studentNameBn}</h4>
                <p className="text-xs text-slate-500">রোল: {sortedResults[1]?.studentRoll} | {sortedResults[1]?.className}</p>
                <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">প্রাপ্ত: {sortedResults[1]?.totalMarksObtained}</span>
                  <span className="font-bold text-emerald-600">GPA: {sortedResults[1]?.gpa.toFixed(2)}</span>
                  <span className="font-bold text-purple-600">{sortedResults[1]?.grade}</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 sm:order-2 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white p-6 text-center shadow-md dark:border-amber-500/50 dark:from-amber-950/20 dark:to-slate-900 relative">
                <div className="text-3xl">🥇</div>
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest block mt-1">১ম স্থান (1st Champion)</span>
                <h4 className="font-black text-slate-900 dark:text-white text-lg mt-1">{sortedResults[0]?.studentNameBn}</h4>
                <p className="text-xs text-slate-500">রোল: {sortedResults[0]?.studentRoll} | {sortedResults[0]?.className}</p>
                <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                  <span className="font-bold text-slate-800 dark:text-white">প্রাপ্ত: {sortedResults[0]?.totalMarksObtained}</span>
                  <span className="font-bold text-emerald-600">GPA: {sortedResults[0]?.gpa.toFixed(2)}</span>
                  <span className="font-bold text-purple-600">{sortedResults[0]?.grade}</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50/40 to-white p-5 text-center shadow-xs dark:border-slate-800 dark:from-slate-800 dark:to-slate-900">
                <div className="text-2xl">🥉</div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mt-1">৩য় স্থান (3rd Position)</span>
                <h4 className="font-black text-slate-900 dark:text-white text-base mt-1">{sortedResults[2]?.studentNameBn}</h4>
                <p className="text-xs text-slate-500">রোল: {sortedResults[2]?.studentRoll} | {sortedResults[2]?.className}</p>
                <div className="mt-3 flex items-center justify-center gap-3 text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">প্রাপ্ত: {sortedResults[2]?.totalMarksObtained}</span>
                  <span className="font-bold text-emerald-600">GPA: {sortedResults[2]?.gpa.toFixed(2)}</span>
                  <span className="font-bold text-purple-600">{sortedResults[2]?.grade}</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete Merit List Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              {isBn ? 'সম্পূর্ণ মেধা তালিকা' : 'Complete Merit List'}
            </h3>

            <div className="overflow-x-auto w-full min-w-0">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">মেধা স্থান</th>
                    <th className="py-3 px-4">রোল</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-4">শ্রেণী</th>
                    <th className="py-3 px-4 text-center">মোট প্রাপ্ত</th>
                    <th className="py-3 px-4 text-center">শতকরা</th>
                    <th className="py-3 px-4 text-center">জিপিএ (GPA)</th>
                    <th className="py-3 px-4 text-center">লেটার গ্রেড</th>
                    <th className="py-3 px-4 text-center">অবস্থা</th>
                    <th className="py-3 px-4 text-center">মার্কশিট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedResults.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center font-black">
                        {res.position === 1 ? '🥇 ১' : res.position === 2 ? '🥈 ২' : res.position === 3 ? '🥉 ৩' : `${res.position}ম`}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{res.studentRoll}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{res.studentNameBn}</td>
                      <td className="py-3 px-4 text-slate-500">{res.className}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-white">
                        {res.totalMarksObtained} / {res.totalFullMarks}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{res.percentage}%</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {res.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-purple-600">{res.grade}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.isPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedResultForModal(res)}
                          className="flex items-center gap-1 mx-auto rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>মার্কশিট</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateExamModal
        isOpen={isCreateExamOpen}
        onClose={() => setIsCreateExamOpen(false)}
      />

      {selectedExam && (
        <AddExamSubjectModal
          examId={selectedExam.id}
          isOpen={isAddSubjectOpen}
          onClose={() => setIsAddSubjectOpen(false)}
        />
      )}

      <DigitalMarksheetModal
        result={selectedResultForModal}
        examNameBn={selectedExam?.nameBn || ''}
        isOpen={!!selectedResultForModal}
        onClose={() => setSelectedResultForModal(null)}
      />

      {selectedExam && (
        <>
          <AdmitCardModal
            isOpen={isAdmitCardOpen}
            onClose={() => setIsAdmitCardOpen(false)}
            exam={selectedExam}
            subjects={examSubjects}
          />

          <SeatPlanModal
            isOpen={isSeatPlanOpen}
            onClose={() => setIsSeatPlanOpen(false)}
            exam={selectedExam}
          />
        </>
      )}
    </div>
  );
};

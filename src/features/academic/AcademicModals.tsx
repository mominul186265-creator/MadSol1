import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Building2,
  BookOpen,
  Layers,
  GraduationCap,
  Save,
  AlertCircle,
  Hash,
} from 'lucide-react';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
  AcademicSessionStatus,
  DepartmentStatus,
  ClassStatus,
  SectionStatus,
  AcademicStudentStatus,
} from '../../types/step5';
import { DbStudent } from '../../types/step2';

// ---------------- Session Modal ----------------
interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: DbAcademicSession | null;
  onSave: (data: {
    name: string;
    start_date: string;
    end_date: string;
    status: AcademicSessionStatus;
    is_active?: boolean;
  }) => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  sessionToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AcademicSessionStatus>('active');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionToEdit) {
      setName(sessionToEdit.name);
      setStartDate(sessionToEdit.start_date);
      setEndDate(sessionToEdit.end_date);
      setStatus(sessionToEdit.status);
      setIsActive(sessionToEdit.is_active);
    } else {
      setName('');
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
      setStatus('active');
      setIsActive(true);
    }
    setError('');
  }, [sessionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('শিক্ষাবর্ষের নাম প্রদান করুন (যেমন: ২০২৬ শিক্ষাবর্ষ)');
      return;
    }
    if (!startDate || !endDate) {
      setError('শুরু ও সমাপ্তির তারিখ নির্বাচন করুন');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('শুরুর তারিখ সমাপ্তির তারিখের পূর্বে হতে হবে');
      return;
    }

    try {
      onSave({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        status,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {sessionToEdit ? 'শিক্ষাবর্ষ সম্পাদনা' : 'নতুন শিক্ষাবর্ষ যুক্ত করুন'}
              </h3>
              <p className="text-[11px] text-slate-500">মাদরাসার বার্ষিক সেশন কনফিগারেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষাবর্ষের নাম *
            </label>
            <input
              type="text"
              placeholder="যেমন: ২০২৬ শিক্ষাবর্ষ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                শুরুর তারিখ *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                সমাপ্তির তারিখ *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              অবস্থা (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AcademicSessionStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="active">সক্রিয় (Active)</option>
              <option value="upcoming">আসন্ন (Upcoming)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="archived">আর্কাইভকৃত (Archived)</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="text-[11px] text-emerald-900 dark:text-emerald-200">
              <span className="font-bold">বর্তমান সক্রিয় সেশন হিসেবে সেট করুন</span>
              <p className="text-slate-500 text-[10px]">
                এটি সক্রিয় করলে পূর্বের সক্রিয় সেশনটি সম্পন্ন হিসেবে চিহ্নিত হবে।
              </p>
            </div>
          </label>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              {sessionToEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Department Modal ----------------
interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: DbDepartment | null;
  onSave: (data: {
    name_bn: string;
    name_en: string;
    code: string;
    description?: string;
    status?: DepartmentStatus;
  }) => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  deptToEdit,
  onSave,
}) => {
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<DepartmentStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (deptToEdit) {
      setNameBn(deptToEdit.name_bn);
      setNameEn(deptToEdit.name_en);
      setCode(deptToEdit.code);
      setDescription(deptToEdit.description || '');
      setStatus(deptToEdit.status || 'active');
    } else {
      setNameBn('');
      setNameEn('');
      setCode('');
      setDescription('');
      setStatus('active');
    }
    setError('');
  }, [deptToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      setError('বিভাগের বাংলা নাম লিখুন');
      return;
    }
    if (!code.trim()) {
      setError('বিভাগ কোড লিখুন (যেমন: HIFZ, KITAB)');
      return;
    }

    try {
      onSave({
        name_bn: nameBn.trim(),
        name_en: nameEn.trim() || nameBn.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {deptToEdit ? 'বিভাগ সম্পাদনা' : 'নতুন বিভাগ তৈরি করুন'}
              </h3>
              <p className="text-[11px] text-slate-500">হিফজ, কিতাব, নূরানী ইত্যাদি বিভাগ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              বিভাগের নাম (বাংলা) *
            </label>
            <input
              type="text"
              placeholder="যেমন: হিফজুল কুরআন বিভাগ"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইংরেজি নাম
              </label>
              <input
                type="text"
                placeholder="Hifz Department"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইউনিক কোড *
              </label>
              <input
                type="text"
                placeholder="HIFZ"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              placeholder="বিভাগের সংক্ষিপ্ত পরিচিতি..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DepartmentStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
            >
              {deptToEdit ? 'আপডেট করুন' : 'তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Class Modal ----------------
interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: DbClass | null;
  departments: DbDepartment[];
  sessions: DbAcademicSession[];
  onSave: (data: {
    department_id: string;
    academic_session_id?: string;
    name_bn: string;
    name_en: string;
    code: string;
    class_order?: number;
    description?: string;
    status?: ClassStatus;
  }) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classToEdit,
  departments,
  sessions,
  onSave,
}) => {
  const [deptId, setDeptId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [classOrder, setClassOrder] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ClassStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (classToEdit) {
      setDeptId(classToEdit.department_id);
      setSessionId(classToEdit.academic_session_id || '');
      setNameBn(classToEdit.name_bn);
      setNameEn(classToEdit.name_en);
      setCode(classToEdit.code);
      setClassOrder(classToEdit.class_order || 1);
      setDescription(classToEdit.description || '');
      setStatus(classToEdit.status || 'active');
    } else {
      setDeptId(departments[0]?.id || '');
      const activeSess = sessions.find((s) => s.is_active);
      setSessionId(activeSess?.id || sessions[0]?.id || '');
      setNameBn('');
      setNameEn('');
      setCode('');
      setClassOrder(1);
      setDescription('');
      setStatus('active');
    }
    setError('');
  }, [classToEdit, isOpen, departments, sessions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptId) {
      setError('বিভাগ নির্বাচন করুন');
      return;
    }
    if (!nameBn.trim()) {
      setError('জামাতের বাংলা নাম লিখুন');
      return;
    }
    if (!code.trim()) {
      setError('জামাত কোড লিখুন (যেমন: HFZ-1, MISHKAT)');
      return;
    }

    try {
      onSave({
        department_id: deptId,
        academic_session_id: sessionId || undefined,
        name_bn: nameBn.trim(),
        name_en: nameEn.trim() || nameBn.trim(),
        code: code.trim().toUpperCase(),
        class_order: Number(classOrder) || 1,
        description: description.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {classToEdit ? 'জামাত সম্পাদনা' : 'নতুন জামাত / শ্রেণি তৈরি'}
              </h3>
              <p className="text-[11px] text-slate-500">বিভাগের অধীনে শ্রেণি তৈরি</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ *
              </label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                শিক্ষাবর্ষ
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.is_active ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              জামাত / শ্রেণির নাম (বাংলা) *
            </label>
            <input
              type="text"
              placeholder="যেমন: মিশকাত জামাত, হিফজ ১ম বর্ষ"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                কোড *
              </label>
              <input
                type="text"
                placeholder="MISHKAT"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div className="col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ক্রম (Order)
              </label>
              <input
                type="number"
                min="1"
                value={classOrder}
                onChange={(e) => setClassOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div className="col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ইংরেজি নাম
              </label>
              <input
                type="text"
                placeholder="Class Name"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              বিবরণ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="শ্রেণির পাঠ্যক্রম ও সংক্ষিপ্ত নোট..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClassStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
            >
              {classToEdit ? 'আপডেট করুন' : 'তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Section Modal ----------------
interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToEdit?: DbSection | null;
  classes: DbClass[];
  onSave: (data: {
    class_id: string;
    name: string;
    code: string;
    capacity?: number;
    status?: SectionStatus;
  }) => void;
}

export const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  sectionToEdit,
  classes,
  onSave,
}) => {
  const [classId, setClassId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState<number>(40);
  const [status, setStatus] = useState<SectionStatus>('active');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sectionToEdit) {
      setClassId(sectionToEdit.class_id);
      setName(sectionToEdit.name || sectionToEdit.name_bn || '');
      setCode(sectionToEdit.code || '');
      setCapacity(sectionToEdit.capacity || 40);
      setStatus(sectionToEdit.status || 'active');
    } else {
      setClassId(classes[0]?.id || '');
      setName('');
      setCode('SEC-A');
      setCapacity(40);
      setStatus('active');
    }
    setError('');
  }, [sectionToEdit, isOpen, classes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setError('জামাত / শ্রেণি নির্বাচন করুন');
      return;
    }
    if (!name.trim()) {
      setError('শাখার নাম লিখুন (যেমন: ক শাখা, Section A)');
      return;
    }
    if (!code.trim()) {
      setError('শাখা কোড লিখুন (যেমন: SEC-A)');
      return;
    }

    try {
      onSave({
        class_id: classId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        capacity: Number(capacity) || 40,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {sectionToEdit ? 'শাখা সম্পাদনা' : 'নতুন শাখা তৈরি'}
              </h3>
              <p className="text-[11px] text-slate-500">জামাতের অধীনে শাখা ও আসন সংখ্যা</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              জামাত / শ্রেণি *
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_bn} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              শাখার নাম *
            </label>
            <input
              type="text"
              placeholder="যেমন: ক শাখা, Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                শাখা কোড *
              </label>
              <input
                type="text"
                placeholder="SEC-A"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ধারণক্ষমতা (আসন)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 40)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SectionStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="active">সক্রিয় (Active)</option>
              <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
            >
              {sectionToEdit ? 'আপডেট করুন' : 'তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- Assign Student Modal ----------------
interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: DbStudent[];
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  onSave: (data: {
    student_id: string;
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string;
    roll_number: string;
    academic_status?: AcademicStudentStatus;
    remarks?: string;
  }) => void;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  onClose,
  students,
  sessions,
  departments,
  classes,
  sections,
  onSave,
}) => {
  const [studentId, setStudentId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [academicStatus, setAcademicStatus] = useState<AcademicStudentStatus>('active');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStudentId(students[0]?.id || '');
      const activeSess = sessions.find((s) => s.is_active);
      setSessionId(activeSess?.id || sessions[0]?.id || '');
      setDeptId(departments[0]?.id || '');
      setRollNumber('');
      setAcademicStatus('active');
      setRemarks('');
      setError('');
    }
  }, [isOpen, students, sessions, departments]);

  // Update classes when department changes
  useEffect(() => {
    const validClasses = classes.filter((c) => !deptId || c.department_id === deptId);
    if (validClasses.length > 0) {
      setClassId(validClasses[0].id);
    } else {
      setClassId('');
    }
  }, [deptId, classes]);

  // Update sections when class changes
  useEffect(() => {
    const validSections = sections.filter((s) => s.class_id === classId);
    if (validSections.length > 0) {
      setSectionId(validSections[0].id);
    } else {
      setSectionId('');
    }
  }, [classId, sections]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('শিক্ষার্থী নির্বাচন করুন');
      return;
    }
    if (!sessionId) {
      setError('শিক্ষাবর্ষ নির্বাচন করুন');
      return;
    }
    if (!deptId) {
      setError('বিভাগ নির্বাচন করুন');
      return;
    }
    if (!classId) {
      setError('জামাত / শ্রেণি নির্বাচন করুন');
      return;
    }
    if (!rollNumber.trim()) {
      setError('রোল নম্বর প্রদান করুন');
      return;
    }

    try {
      onSave({
        student_id: studentId,
        academic_session_id: sessionId,
        department_id: deptId,
        class_id: classId,
        section_id: sectionId || undefined,
        roll_number: rollNumber.trim(),
        academic_status: academicStatus,
        remarks: remarks.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে');
    }
  };

  const availableClasses = classes.filter((c) => !deptId || c.department_id === deptId);
  const availableSections = sections.filter((s) => s.class_id === classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                শিক্ষার্থী একাডেমিক সেশন ও শ্রেণি নির্ধারণ
              </h3>
              <p className="text-[11px] text-slate-500">রোল নম্বর ও শ্রেণি বরাদ্দকরণ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষার্থী নির্বাচন করুন *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name_bn} ({st.admission_number || st.id}) - রোল: {st.roll_number || 'নেই'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                শিক্ষাবর্ষ *
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.is_active ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ *
              </label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                জামাত / শ্রেণি *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                শাখা (Section)
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="">-- শাখা নেই --</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.name_bn} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                রোল নম্বর *
              </label>
              <input
                type="text"
                placeholder="যেমন: 101, 102"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                একাডেমিক অবস্থা
              </label>
              <select
                value={academicStatus}
                onChange={(e) => setAcademicStatus(e.target.value as AcademicStudentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="active">সক্রিয় (Active)</option>
                <option value="promoted">উত্তীর্ণ (Promoted)</option>
                <option value="on_hold">স্থগিত (On Hold)</option>
                <option value="completed">সমাপ্ত (Completed)</option>
                <option value="transferred">স্থানান্তরিত (Transferred)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="ভর্তি বা প্রমোশন সংক্রান্ত নোট..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm"
            >
              নির্ধারণ ও সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  DbSubject,
  DbClassSubject,
  DbTeacherAssignment,
  SubjectCategory,
  SubjectStatus,
  TeacherAssignmentType,
  TeacherAssignmentStatus,
  ClassSubjectStatus,
} from '../../types/step6';
import {
  DbAcademicSession,
  DbDepartment,
  DbClass,
  DbSection,
} from '../../types/step5';
import { DbTeacher } from '../../types/step3';

// -------------------------------------------------------------
// 1. SUBJECT CREATE / EDIT MODAL
// -------------------------------------------------------------

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name_bn: string;
    name_en: string;
    code: string;
    category: SubjectCategory;
    description?: string;
    status?: SubjectStatus;
    department_ids?: string[];
  }) => void;
  subjectToEdit?: DbSubject | null;
  departments: DbDepartment[];
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectToEdit,
  departments,
}) => {
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('general');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubjectStatus>('active');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectToEdit) {
      setNameBn(subjectToEdit.name_bn || '');
      setNameEn(subjectToEdit.name_en || '');
      setCode(subjectToEdit.code || '');
      setCategory(subjectToEdit.category || 'general');
      setDescription(subjectToEdit.description || '');
      setStatus(subjectToEdit.status || 'active');
      setSelectedDepts(subjectToEdit.department_ids || []);
    } else {
      setNameBn('');
      setNameEn('');
      setCode('');
      setCategory('general');
      setDescription('');
      setStatus('active');
      setSelectedDepts([]);
    }
    setError(null);
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleDept = (deptId: string) => {
    if (selectedDepts.includes(deptId)) {
      setSelectedDepts(selectedDepts.filter((id) => id !== deptId));
    } else {
      setSelectedDepts([...selectedDepts, deptId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      setError('অনুগ্রহ করে বিষয়ের বাংলা নাম প্রদান করুন।');
      return;
    }
    if (!code.trim()) {
      setError('অনুগ্রহ করে বিষয়ের একটি অনন্য কোড প্রদান করুন (যেমন: QUR-101)।');
      return;
    }

    try {
      onSave({
        name_bn: nameBn.trim(),
        name_en: nameEn.trim() || nameBn.trim(),
        code: code.trim().toUpperCase(),
        category,
        description: description.trim(),
        status,
        department_ids: selectedDepts,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে, আবার চেষ্টা করুন।');
    }
  };

  return (
    <div
      id="subject-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="subject-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {subjectToEdit ? 'বিষয় সম্পাদনা করুন' : 'নতুন বিষয় যোগ করুন'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subjectToEdit ? 'Edit Subject Information' : 'Add New Subject to Curriculum'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-subject-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Name (Bangla) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিষয়ের নাম (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-subject-name-bn"
                type="text"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: পবিত্র কুরআনুল কারীম"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
              />
            </div>

            {/* Subject Name (English) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিষয়ের নাম (English)
              </label>
              <input
                id="input-subject-name-en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Holy Quran"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিষয় কোড (Subject Code) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-subject-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="যেমন: QUR-101"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs uppercase font-mono font-bold tracking-wider focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">প্রতিষ্ঠানে প্রতিটি বিষয়ের জন্য অনন্য কোড হতে হবে।</span>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ক্যাটাগরি (Category)
              </label>
              <select
                id="select-subject-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
              >
                <option value="quran">কুরআন ও তাজবীদ (Quran & Tajweed)</option>
                <option value="hadith">হাদিস ও উসুল (Hadith & Usul)</option>
                <option value="fiqh">ফিকহ ও ফতোয়া (Fiqh & Fatwa)</option>
                <option value="arabic">আরবি ভাষা ও সাহিত্য (Arabic)</option>
                <option value="islamic">ইসলামিক স্টাডিজ (Islamic Studies)</option>
                <option value="language">ভাষা ও সাহিত্য - বাংলা/ইংরেজি (Language)</option>
                <option value="mathematics">গণিত ও বিজ্ঞান (Math & Science)</option>
                <option value="general">সাধারণ শিক্ষা (General)</option>
                <option value="technical">কারিগরি / আইটি (Technical)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>
          </div>

          {/* Department Associations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              অনুমোদিত বিভাগসমূহ (Departments Connection)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              এই বিষয়টি কোন কোন বিভাগে পাঠদান করা যেতে পারে তা নির্ধারণ করুন:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {departments.filter((d) => d.status === 'active').map((dept) => {
                const isSelected = selectedDepts.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleToggleDept(dept.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/80 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && '✓'}
                    </div>
                    <span className="truncate">{dept.name_bn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              স্ট্যাটাস (Status)
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="subject-status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>সক্রিয় (Active)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="subject-status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>নিষ্ক্রিয় (Inactive)</span>
              </label>
              {subjectToEdit && (
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="subject-status"
                    value="archived"
                    checked={status === 'archived'}
                    onChange={() => setStatus('archived')}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <span>আর্কাইভ (Archived)</span>
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              বিবরণ বা সিলেবাস নোট (Optional)
            </label>
            <textarea
              id="textarea-subject-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="বিষয়ের মূল বিষয়বস্তু বা পাঠ্যবই সংক্রান্ত বিবরণ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-subject-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
            >
              বাতিল
            </button>
            <button
              id="btn-submit-subject-modal"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              {subjectToEdit ? 'আপডেট করুন' : 'বিষয় সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. CLASS-WISE SUBJECT ASSIGNMENT MODAL
// -------------------------------------------------------------

interface AssignClassSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: {
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    status?: ClassSubjectStatus;
  }) => void;
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  subjects: DbSubject[];
  activeSessionId?: string;
}

export const AssignClassSubjectModal: React.FC<AssignClassSubjectModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  sessions,
  departments,
  classes,
  sections,
  subjects,
  activeSessionId,
}) => {
  const [sessionId, setSessionId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState<string>('');
  const [subjectId, setSubjectId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSessionId(activeSessionId || sessions[0]?.id || '');
      setDeptId(departments[0]?.id || '');
      setClassId('');
      setSectionId('');
      setSubjectId('');
      setError(null);
    }
  }, [isOpen, activeSessionId, sessions, departments]);

  // Filter classes by selected department
  const filteredClasses = classes.filter(
    (c) => (!deptId || c.department_id === deptId) && c.status === 'active'
  );

  // Filter sections by selected class
  const filteredSections = sections.filter(
    (s) => (!classId || s.class_id === classId) && s.status === 'active'
  );

  // Filter active subjects
  const activeSubjects = subjects.filter((s) => s.status === 'active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !deptId || !classId || !subjectId) {
      setError('অনুগ্রহ করে শিক্ষাবর্ষ, বিভাগ, শ্রেণি এবং বিষয় নির্বাচন করুন।');
      return;
    }

    try {
      onAssign({
        academic_session_id: sessionId,
        department_id: deptId,
        class_id: classId,
        section_id: sectionId ? sectionId : null,
        subject_id: subjectId,
        status: 'active',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে, আবার চেষ্টা করুন।');
    }
  };

  return (
    <div
      id="assign-class-subject-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="assign-class-subject-card"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                শ্রেণিতে বিষয় সংযুক্তি
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assign Subject to Class & Curriculum
              </p>
            </div>
          </div>
          <button
            id="btn-close-assign-class-subject"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Academic Session */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষাবর্ষ (Academic Session) <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-assign-session"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_active ? ' (বর্তমান সক্রিয়)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ (Department) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assign-dept"
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  setClassId('');
                  setSectionId('');
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all"
              >
                <option value="">-- বিভাগ নির্বাচন করুন --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                জামাত / শ্রেণি (Class) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assign-class"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('');
                }}
                required
                disabled={!deptId}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all disabled:opacity-50"
              >
                <option value="">-- শ্রেণি নির্বাচন করুন --</option>
                {filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Section (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                শাখা (Section) <span className="text-[10px] text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <select
                id="select-assign-section"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all disabled:opacity-50"
              >
                <option value="">সকল শাখা (Whole Class)</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                পাঠ্য বিষয় (Subject) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assign-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 outline-hidden transition-all"
              >
                <option value="">-- বিষয় নির্বাচন করুন --</option>
                {activeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_bn} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-[11px] text-teal-800 dark:text-teal-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              শ্রেণিতে বিষয় সংযুক্তি নিশ্চিত করার পর উক্ত বিষয়ের জন্য প্রধান শিক্ষক ও সহকারী শিক্ষক নিয়োগ দেওয়া যাবে।
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-assign-class-subject"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
            >
              বাতিল
            </button>
            <button
              id="btn-submit-assign-class-subject"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-98 transition-all"
            >
              শ্রেণিতে যুক্ত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. TEACHER SUBJECT ASSIGNMENT MODAL (With One Primary Teacher Rule)
// -------------------------------------------------------------

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    teacher_id: string;
    academic_session_id: string;
    department_id: string;
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    assignment_type: TeacherAssignmentType;
    status?: TeacherAssignmentStatus;
  }) => void;
  assignmentToEdit?: DbTeacherAssignment | null;
  teachers: DbTeacher[];
  sessions: DbAcademicSession[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  subjects: DbSubject[];
  classSubjects: DbClassSubject[];
  activeSessionId?: string;
  allAssignments: DbTeacherAssignment[];
}

export const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignmentToEdit,
  teachers,
  sessions,
  departments,
  classes,
  sections,
  subjects,
  classSubjects,
  activeSessionId,
  allAssignments,
}) => {
  const [teacherId, setTeacherId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [assignmentType, setAssignmentType] = useState<TeacherAssignmentType>('primary');
  const [status, setStatus] = useState<TeacherAssignmentStatus>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentToEdit) {
      setTeacherId(assignmentToEdit.teacher_id);
      setSessionId(assignmentToEdit.academic_session_id);
      setDeptId(assignmentToEdit.department_id);
      setClassId(assignmentToEdit.class_id);
      setSectionId(assignmentToEdit.section_id || '');
      setSubjectId(assignmentToEdit.subject_id);
      setAssignmentType(assignmentToEdit.assignment_type);
      setStatus(assignmentToEdit.status);
    } else {
      setTeacherId('');
      setSessionId(activeSessionId || sessions[0]?.id || '');
      setDeptId(departments[0]?.id || '');
      setClassId('');
      setSectionId('');
      setSubjectId('');
      setAssignmentType('primary');
      setStatus('active');
    }
    setError(null);
  }, [assignmentToEdit, isOpen, activeSessionId, sessions, departments]);

  const filteredClasses = classes.filter(
    (c) => (!deptId || c.department_id === deptId) && c.status === 'active'
  );

  const filteredSections = sections.filter(
    (s) => (!classId || s.class_id === classId) && s.status === 'active'
  );

  // Available subjects for this class from classSubjects or all subjects
  const classAssignedSubjectIds = classSubjects
    .filter(
      (cs) =>
        cs.academic_session_id === sessionId &&
        cs.class_id === classId &&
        (!sectionId || !cs.section_id || cs.section_id === sectionId) &&
        cs.status === 'active'
    )
    .map((cs) => cs.subject_id);

  const availableSubjects = subjects.filter((s) => {
    if (classId && classAssignedSubjectIds.length > 0) {
      return classAssignedSubjectIds.includes(s.id) && s.status === 'active';
    }
    return s.status === 'active';
  });

  // Active Teachers
  const activeTeachers = teachers.filter((t) => t.status === 'active');

  // Check if primary teacher already exists for current selection
  const existingPrimaryTeacher = allAssignments.find(
    (ta) =>
      (!assignmentToEdit || ta.id !== assignmentToEdit.id) &&
      ta.academic_session_id === sessionId &&
      ta.class_id === classId &&
      (ta.section_id || null) === (sectionId ? sectionId : null) &&
      ta.subject_id === subjectId &&
      ta.assignment_type === 'primary' &&
      ta.status === 'active' &&
      !ta.deleted_at
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId || !sessionId || !deptId || !classId || !subjectId) {
      setError('অনুগ্রহ করে শিক্ষক, শিক্ষাবর্ষ, জামাত ও বিষয় নির্বাচন করুন।');
      return;
    }

    // ⭐ Validate One Primary Teacher Constraint
    if (assignmentType === 'primary' && existingPrimaryTeacher) {
      setError(
        `সতর্কতা: এই বিষয়ের জন্য ইতোমধ্যে একজন প্রধান শিক্ষক নির্ধারিত আছেন (${existingPrimaryTeacher.teacher_name_bn})। প্রতি বিষয়ের জন্য শুধুমাত্র ১ জন প্রধান শিক্ষক নিয়োগ সম্ভব। অনুগ্রহ করে সহকারী বা বিষয় শিক্ষক নির্বাচন করুন।`
      );
      return;
    }

    // Validate Duplicate Teacher
    const duplicateTeacher = allAssignments.find(
      (ta) =>
        (!assignmentToEdit || ta.id !== assignmentToEdit.id) &&
        ta.teacher_id === teacherId &&
        ta.academic_session_id === sessionId &&
        ta.class_id === classId &&
        (ta.section_id || null) === (sectionId ? sectionId : null) &&
        ta.subject_id === subjectId &&
        !ta.deleted_at &&
        ta.status !== 'archived'
    );

    if (duplicateTeacher) {
      setError('এই শিক্ষক ইতোমধ্যে একই সেশন, শ্রেণি ও বিষয়ে নিয়োগপ্রাপ্ত আছেন।');
      return;
    }

    try {
      onSave({
        teacher_id: teacherId,
        academic_session_id: sessionId,
        department_id: deptId,
        class_id: classId,
        section_id: sectionId ? sectionId : null,
        subject_id: subjectId,
        assignment_type: assignmentType,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ত্রুটি ঘটেছে, আবার চেষ্টা করুন।');
    }
  };

  return (
    <div
      id="teacher-assignment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="teacher-assignment-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {assignmentToEdit ? 'শিক্ষক নিয়োগ ও দায়িত্ব সংশোধন' : 'শিক্ষক বিষয় নিয়োগ (Teacher Subject Assignment)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Academic Curriculum Responsibility Allocation
              </p>
            </div>
          </div>
          <button
            id="btn-close-teacher-assignment-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Teacher Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষক নির্বাচন করুন (Select Teacher) <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-assignment-teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
            >
              <option value="">-- সম্মানিত শিক্ষক নির্বাচন করুন --</option>
              {activeTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name_bn} ({t.teacher_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Session */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                শিক্ষাবর্ষ (Session) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assignment-session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.is_active ? ' (সক্রিয়)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিভাগ (Department) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assignment-dept"
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  setClassId('');
                  setSectionId('');
                  setSubjectId('');
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
              >
                <option value="">-- বিভাগ নির্বাচন করুন --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                জামাত / শ্রেণি (Class) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-assignment-class"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setSectionId('');
                  setSubjectId('');
                }}
                required
                disabled={!deptId}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all disabled:opacity-50"
              >
                <option value="">-- শ্রেণি নির্বাচন করুন --</option>
                {filteredClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Section (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                শাখা (Section) <span className="text-[10px] text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <select
                id="select-assignment-section"
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setSubjectId('');
                }}
                disabled={!classId}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all disabled:opacity-50"
              >
                <option value="">সকল শাখা (Whole Class)</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name_bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              পাঠদানকৃত বিষয় (Subject) <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-assignment-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
            >
              <option value="">-- বিষয় নির্বাচন করুন --</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn} ({s.code}) - {s.category}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Type (With One Primary Teacher Rule indicator) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                দায়িত্বের ধরন (Assignment Role) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                ⭐ নিয়ম: এক বিষয়ে কেবল ১ জন প্রধান শিক্ষক
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  type: 'primary' as TeacherAssignmentType,
                  labelBn: 'প্রধান শিক্ষক',
                  labelEn: 'Primary',
                  color: 'emerald',
                },
                {
                  type: 'assistant' as TeacherAssignmentType,
                  labelBn: 'সহকারী শিক্ষক',
                  labelEn: 'Assistant',
                  color: 'sky',
                },
                {
                  type: 'subject_teacher' as TeacherAssignmentType,
                  labelBn: 'বিষয় শিক্ষক',
                  labelEn: 'Subject Teacher',
                  color: 'indigo',
                },
                {
                  type: 'guest' as TeacherAssignmentType,
                  labelBn: 'অতিথি শিক্ষক',
                  labelEn: 'Guest',
                  color: 'slate',
                },
              ].map((item) => {
                const isSelected = assignmentType === item.type;
                const isPrimaryConflict =
                  item.type === 'primary' && existingPrimaryTeacher && !isSelected;

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setAssignmentType(item.type)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-extrabold shadow-xs ring-2 ring-amber-500/20'
                        : isPrimaryConflict
                        ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.labelBn}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Primary Teacher Conflict Notice */}
            {existingPrimaryTeacher && assignmentType === 'primary' && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">প্রধান শিক্ষক বিদ্যমান: </span>
                  উক্ত বিষয়ে ইতোমধ্যে <span className="underline font-bold">{existingPrimaryTeacher.teacher_name_bn}</span> প্রধান শিক্ষক হিসেবে আছেন। নতুন শিক্ষককে প্রধান করতে চাইলে আগের জনের দায়িত্ব পরিবর্তন করুন অথবা সহকারী শিক্ষক হিসেবে নিয়োগ দিন।
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              নিয়োগ স্ট্যাটাস (Status)
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="assignment-status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>সক্রিয় (Active)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="assignment-status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="text-slate-600 focus:ring-slate-500"
                />
                <span>অব্যাহতি / নিষ্ক্রিয় (Inactive)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-teacher-assignment"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
            >
              বাতিল
            </button>
            <button
              id="btn-submit-teacher-assignment"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-98 transition-all"
            >
              {assignmentToEdit ? 'আপডেট করুন' : 'নিয়োগ নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. SUBJECT DETAILS & TEACHER ROSTER MODAL
// -------------------------------------------------------------

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: DbSubject | null;
  classSubjects: DbClassSubject[];
  teacherAssignments: DbTeacherAssignment[];
  onOpenTeacherAssignModal?: () => void;
}

export const SubjectDetailsModal: React.FC<SubjectDetailsModalProps> = ({
  isOpen,
  onClose,
  subject,
  classSubjects,
  teacherAssignments,
  onOpenTeacherAssignModal,
}) => {
  if (!isOpen || !subject) return null;

  const subjectClasses = classSubjects.filter(
    (cs) => cs.subject_id === subject.id && cs.status === 'active'
  );

  const subjectTeachers = teacherAssignments.filter(
    (ta) => ta.subject_id === subject.id && ta.status === 'active' && !ta.deleted_at
  );

  return (
    <div
      id="subject-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="subject-details-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {subject.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {subject.name_bn}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                {subject.name_en} • {subject.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Description / Syllabus */}
          {subject.description && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                সিলেবাস বা পাঠ্য পরিচিতি:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {subject.description}
              </p>
            </div>
          )}

          {/* Connected Departments */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>অনুমোদিত বিভাগসমূহ ({subject.department_names?.length || 0})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {subject.department_names && subject.department_names.length > 0 ? (
                subject.department_names.map((dept, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold"
                  >
                    {dept}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">সকল বিভাগে উন্মুক্ত</span>
              )}
            </div>
          </div>

          {/* Assigned Classes */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>সিলেবাসভুক্ত জামাত / শ্রেণি ({subjectClasses.length})</span>
            </h4>
            {subjectClasses.length === 0 ? (
              <p className="text-slate-400 italic p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                এখনো কোনো জামাতে এই বিষয়টি যুক্ত করা হয়নি।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subjectClasses.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {cs.class_name_bn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cs.section_name} • {cs.department_name_bn}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                      {cs.session_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Teachers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>দায়িত্বপ্রাপ্ত সম্মানিত শিক্ষকবৃন্দ ({subjectTeachers.length})</span>
              </h4>
              {onOpenTeacherAssignModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTeacherAssignModal();
                  }}
                  className="text-amber-600 hover:text-amber-700 font-bold text-xs"
                >
                  + শিক্ষক নিয়োগ দিন
                </button>
              )}
            </div>

            {subjectTeachers.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300">
                <span>এই বিষয়ে এখনো কোনো শিক্ষক নিয়োগ দেওয়া হয়নি।</span>
              </div>
            ) : (
              <div className="space-y-2">
                {subjectTeachers.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {ta.teacher_photo_url ? (
                        <img
                          src={ta.teacher_photo_url}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold flex items-center justify-center">
                          {ta.teacher_name_bn?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ta.teacher_name_bn}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ta.class_name_bn} • {ta.section_name} ({ta.session_name})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        ta.assignment_type === 'primary'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-sky-50 text-sky-800 border-sky-300'
                      }`}
                    >
                      {ta.assignment_type === 'primary' ? 'প্রধান শিক্ষক' : 'সহকারী শিক্ষক'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end bg-slate-50/50 dark:bg-slate-800/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Edit,
  Printer,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Clock,
  ShieldCheck,
  Plus,
  ExternalLink,
  AlertCircle,
  Key,
  Unlink,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  DbTeacher,
  DbTeacherDesignation,
  DbTeacherQualification,
  DbTeacherDocument,
  DbTeacherActivity,
  TeacherDocumentCategory,
} from '../../types/step3';
import { DbDepartment } from '../../types/step2';
import { useTeachers } from './useTeachers';
import { TeacherStatusModal } from './TeacherStatusModal';
import { TeacherIdCardModal } from './TeacherIdCardModal';
import { RoleSlug } from '../../types/step1';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: DbTeacher;
  designations: DbTeacherDesignation[];
  departments: DbDepartment[];
  onEdit: (teacher: DbTeacher) => void;
  onTeacherUpdated: (teacher: DbTeacher) => void;
  onTeacherDeleted: (teacherId: string) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacher: initialTeacher,
  designations,
  departments,
  onEdit,
  onTeacherUpdated,
  onTeacherDeleted,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const {
    permissions,
    getQualifications,
    addQualification,
    deleteQualification,
    getDocuments,
    addDocument,
    deleteDocument,
    getActivities,
    getAvailableUsers,
    connectUserAccount,
    disconnectUserAccount,
    createAndConnectUserAccount,
    softDeleteTeacher,
  } = useTeachers();

  const [teacher, setTeacher] = useState<DbTeacher>(initialTeacher);
  const [activeTab, setActiveTab] = useState<'overview' | 'qualifications' | 'documents' | 'activity' | 'account'>('overview');

  // Related data
  const [qualifications, setQualifications] = useState<DbTeacherQualification[]>([]);
  const [documents, setDocuments] = useState<DbTeacherDocument[]>([]);
  const [activities, setActivities] = useState<DbTeacherActivity[]>([]);

  // Sub-modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Add Qualification sub-form modal
  const [isAddQualOpen, setIsAddQualOpen] = useState<boolean>(false);
  const [qualDegreeName, setQualDegreeName] = useState<string>('');
  const [qualType, setQualType] = useState<'general' | 'islamic' | 'other'>('islamic');
  const [qualInstitution, setQualInstitution] = useState<string>('');
  const [qualYear, setQualYear] = useState<string>('');
  const [qualResult, setQualResult] = useState<string>('');

  // Add Document sub-form modal
  const [isAddDocOpen, setIsAddDocOpen] = useState<boolean>(false);
  const [docCategory, setDocCategory] = useState<TeacherDocumentCategory>('certificate');
  const [docTitle, setDocTitle] = useState<string>('');
  const [docFileBase64, setDocFileBase64] = useState<string>('');
  const [docFileName, setDocFileName] = useState<string>('');
  const [docFileType, setDocFileType] = useState<string>('');
  const [docFileSize, setDocFileSize] = useState<number>(0);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Account Linking sub-modal
  const [isLinkAccountOpen, setIsLinkAccountOpen] = useState<boolean>(false);
  const [accountConnectType, setAccountConnectType] = useState<'existing' | 'new'>('existing');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newAccEmail, setNewAccEmail] = useState<string>(teacher.email || '');
  const [newAccPassword, setNewAccPassword] = useState<string>('');
  const [newAccRole, setNewAccRole] = useState<RoleSlug>('teacher');

  // Load related data whenever teacher changes
  useEffect(() => {
    setTeacher(initialTeacher);
  }, [initialTeacher]);

  const loadRelatedData = () => {
    if (!teacher?.id) return;
    const quals = getQualifications(teacher.id);
    setQualifications(quals);

    const docs = getDocuments(teacher.id);
    setDocuments(docs);

    const acts = getActivities(teacher.id);
    setActivities(acts);
  };

  useEffect(() => {
    if (isOpen && teacher?.id) {
      loadRelatedData();
    }
  }, [isOpen, teacher?.id]);

  if (!isOpen || !teacher) return null;

  const designationObj = designations.find((d) => d.id === teacher.designation_id);
  const designationName =
    language === 'bn' ? designationObj?.name_bn || teacher.designation_id : designationObj?.name_en || teacher.designation_id;

  const departmentObj = departments.find((d) => d.id === teacher.department_id);
  const departmentName =
    language === 'bn' ? departmentObj?.name_bn || teacher.department_id : departmentObj?.name_en || teacher.department_id;

  // Status Chip Colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'on_leave':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'resigned':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'terminated':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  // Add Qualification handler
  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualDegreeName.trim() || !qualInstitution.trim()) {
      showToast(language === 'bn' ? 'ডিগ্রি ও প্রতিষ্ঠানের নাম লিখুন' : 'Degree & Institution required', 'error');
      return;
    }

    try {
      await addQualification({
        teacher_id: teacher.id,
        degree_name: qualDegreeName.trim(),
        degree_type: qualType,
        institution_name: qualInstitution.trim(),
        passing_year: qualYear.trim() || undefined,
        result_grade: qualResult.trim() || undefined,
      });

      showToast(language === 'bn' ? 'যোগ্যতা সফলভাবে যুক্ত হয়েছে' : 'Qualification added', 'success');
      setQualDegreeName('');
      setQualInstitution('');
      setQualYear('');
      setQualResult('');
      setIsAddQualOpen(false);
      loadRelatedData();
    } catch (err: any) {
      showToast(err?.message || 'যোগ্যতা যোগ করা যায়নি', 'error');
    }
  };

  // Delete Qualification handler
  const handleDeleteQualification = async (qualId: string) => {
    if (!window.confirm(t.teachers.profile.deleteQualConfirm)) return;
    try {
      await deleteQualification(qualId, teacher.id);
      showToast(language === 'bn' ? 'যোগ্যতা মুছে ফেলা হয়েছে' : 'Qualification removed', 'success');
      loadRelatedData();
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলা যায়নি', 'error');
    }
  };

  // Document Upload File Selection
  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(language === 'bn' ? 'ফাইলের আকার সর্বোচ্চ ৫ মেগাবাইট হতে হবে' : 'Max file size is 5MB', 'error');
      return;
    }

    setDocFileName(file.name);
    setDocFileType(file.type || 'application/octet-stream');
    setDocFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocFileBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add Document handler
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileBase64) {
      showToast(language === 'bn' ? 'ফাইলের নাম এবং ফাইল নির্বাচন করুন' : 'Title and file are required', 'error');
      return;
    }

    try {
      await addDocument({
        teacher_id: teacher.id,
        category: docCategory,
        title: docTitle.trim(),
        file_url: docFileBase64,
        file_name: docFileName || docTitle,
        file_type: docFileType,
        file_size: docFileSize,
      });

      showToast(language === 'bn' ? 'নথি সফলভাবে আপলোড হয়েছে' : 'Document uploaded', 'success');
      setDocTitle('');
      setDocFileBase64('');
      setDocFileName('');
      setIsAddDocOpen(false);
      loadRelatedData();
    } catch (err: any) {
      showToast(err?.message || 'ডকুমেন্ট আপলোড ব্যর্থ হয়েছে', 'error');
    }
  };

  // Delete Document handler
  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm(t.teachers.profile.deleteDocConfirm)) return;
    try {
      await deleteDocument(docId, teacher.id);
      showToast(language === 'bn' ? 'নথি মুছে ফেলা হয়েছে' : 'Document deleted', 'success');
      loadRelatedData();
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলা যায়নি', 'error');
    }
  };

  // Connect Account handler
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (accountConnectType === 'existing') {
        if (!selectedUserId) {
          showToast(language === 'bn' ? 'ব্যবহারকারী নির্বাচন করুন' : 'Select a user', 'error');
          return;
        }
        const updated = await connectUserAccount(teacher.id, selectedUserId);
        if (updated) {
          setTeacher(updated);
          onTeacherUpdated(updated);
          showToast(language === 'bn' ? 'অ্যাকাউন্ট সংযুক্ত হয়েছে' : 'Account linked', 'success');
          setIsLinkAccountOpen(false);
          loadRelatedData();
        }
      } else {
        if (!newAccEmail.trim() || !newAccPassword.trim()) {
          showToast(language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Email and password required', 'error');
          return;
        }
        const updated = await createAndConnectUserAccount(teacher.id, {
          name: teacher.full_name_bn,
          email: newAccEmail.trim().toLowerCase(),
          mobile: teacher.primary_mobile,
          password: newAccPassword,
          role_id: newAccRole,
        });
        if (updated) {
          setTeacher(updated);
          onTeacherUpdated(updated);
          showToast(language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি ও সংযুক্ত হয়েছে' : 'Account created & linked', 'success');
          setIsLinkAccountOpen(false);
          loadRelatedData();
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'অ্যাকাউন্ট সংযোগ ব্যর্থ হয়েছে', 'error');
    }
  };

  // Disconnect Account handler
  const handleDisconnectAccount = async () => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই শিক্ষকের লগইন অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করতে চান?' : 'Unlink user account?')) {
      return;
    }
    try {
      const updated = await disconnectUserAccount(teacher.id);
      if (updated) {
        setTeacher(updated);
        onTeacherUpdated(updated);
        showToast(language === 'bn' ? 'অ্যাকাউন্ট বিচ্ছিন্ন করা হয়েছে' : 'Account unlinked', 'success');
        loadRelatedData();
      }
    } catch (err: any) {
      showToast(err?.message || 'বিচ্ছিন্ন করা যায়নি', 'error');
    }
  };

  // Delete Teacher (Soft Delete)
  const handleSoftDelete = async () => {
    try {
      await softDeleteTeacher(teacher.id);
      showToast(language === 'bn' ? 'শিক্ষক সফলভাবে মুছে ফেলা হয়েছে (Soft Deleted)' : 'Teacher deleted', 'success');
      onTeacherDeleted(teacher.id);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলা ব্যর্থ হয়েছে', 'error');
    }
  };

  const availableUsers = getAvailableUsers(teacher.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Banner & Teacher Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 shadow-xl flex items-center justify-center shrink-0">
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.full_name_en} className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-white/40" />
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {teacher.full_name_bn}
                </h2>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/30 border border-white/20 text-amber-300">
                  {teacher.teacher_id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${getStatusBadge(
                    teacher.employment_status
                  )}`}
                >
                  {(t.teachers.status as any)[teacher.employment_status] || teacher.employment_status}
                </span>
              </div>

              <p className="text-sm font-medium text-emerald-100">{teacher.full_name_en}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-emerald-100/90 pt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                  {designationName} • {departmentName}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  {teacher.primary_mobile}
                </span>
                {teacher.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    {teacher.email}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                {t.teachers.profile.printIdCard}
              </button>

              {permissions.canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(teacher);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {t.teachers.profile.editTeacher}
                </button>
              )}

              {permissions.canChangeStatus && (
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 transition-all flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {t.teachers.profile.changeStatusBtn}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            {t.teachers.profile.tabs.overview}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualifications')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'qualifications'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {t.teachers.profile.tabs.qualifications}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-semibold">
              {qualifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.teachers.profile.tabs.documents}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-semibold">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            {t.teachers.profile.tabs.activity}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 font-semibold">
              {activities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            {t.teachers.profile.tabs.account}
            {teacher.user_id && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {t.teachers.profile.personalInfo}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">জন্ম তারিখ</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.date_of_birth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">রক্তের গ্রুপ</span>
                    <span className="font-semibold text-rose-600">{teacher.blood_group || 'অজানা'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">লিঙ্গ</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(t.teachers.gender as any)[teacher.gender] || teacher.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">জাতীয়তা ও ধর্ম</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {teacher.nationality || 'বাংলাদেশী'} • {teacher.religion || 'ইসলাম'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">এনআইডি / পাসপোর্ট</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {teacher.identification_number || 'প্রদান করা হয়নি'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {t.teachers.profile.employmentInfo}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">পদবী</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{designationName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">বিভাগ</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">চাকরির ধরন</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(t.teachers.employmentType as any)[teacher.employment_type] || teacher.employment_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">যোগদানের তারিখ</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{teacher.joining_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">অভিজ্ঞতা</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {teacher.experience_years} বছর
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">বর্তমান স্ট্যাটাস</span>
                    <span className="font-semibold text-emerald-600">
                      {(t.teachers.status as any)[teacher.employment_status] || teacher.employment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Address Details */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t.teachers.profile.contactInfo}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                    <span className="text-slate-400">প্রধান মোবাইল:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{teacher.primary_mobile}</span>
                  </div>
                  {teacher.alternative_mobile && (
                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                      <span className="text-slate-400">বিকল্প মোবাইল:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{teacher.alternative_mobile}</span>
                    </div>
                  )}
                  {teacher.email && (
                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                      <span className="text-slate-400">ইমেইল:</span>
                      <span className="text-slate-800 dark:text-slate-200">{teacher.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block mb-0.5">বর্তমান ঠিকানা:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.present_address}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">স্থায়ী ঠিকানা:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{teacher.permanent_address}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Academic Details */}
              <div className="space-y-6 w-full max-w-full min-w-0">
                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {t.teachers.profile.emergencyContact}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">ব্যক্তির নাম</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{teacher.emergency_contact_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">সম্পর্ক</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{teacher.emergency_relationship}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 dark:text-slate-400 block">জরুরি মোবাইল নম্বর</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{teacher.emergency_mobile}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {t.teachers.profile.academicInfo}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">সর্বোচ্চ ডিগ্রি</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.highest_qualification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">বিশেষায়িত বিষয়</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{teacher.specialization}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ইসলামিক বিশেষ যোগ্যতা</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {teacher.islamic_qualification || 'তথ্য নেই'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">সর্বশেষ শিক্ষা প্রতিষ্ঠান</span>
                      <span className="text-slate-800 dark:text-slate-200">{teacher.institution_university}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFICATIONS */}
          {activeTab === 'qualifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    শিক্ষাগত ও ইসলামিক সনদের তালিকা
                  </h4>
                  <p className="text-xs text-slate-500">
                    শিক্ষকের দাওরায়ে হাদিস, কওমি, আলিয়া ও সাধারণ ডিগ্রির বিবরণ
                  </p>
                </div>
                {permissions.canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsAddQualOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.teachers.profile.addQualification}
                  </button>
                )}
              </div>

              {/* Add Qualification inline sub-modal */}
              {isAddQualOpen && (
                <form
                  onSubmit={handleAddQualification}
                  className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      নতুন শিক্ষাগত যোগ্যতা যুক্ত করুন
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddQualOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.qualName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={qualDegreeName}
                        onChange={(e) => setQualDegreeName(e.target.value)}
                        placeholder="যেমন: দাওরায়ে হাদিস / কামিল"
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.qualType}
                      </label>
                      <select
                        value={qualType}
                        onChange={(e) => setQualType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="islamic">ইসলামিক / কওমি / ধর্মীয় সনদ</option>
                        <option value="general">সাধারণ শিক্ষা (মাদ্রাসা/স্কুল/ভার্সিটি)</option>
                        <option value="other">অন্যান্য প্রফেশনাল কোর্স</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.qualInstitute} *
                      </label>
                      <input
                        type="text"
                        required
                        value={qualInstitution}
                        onChange={(e) => setQualInstitution(e.target.value)}
                        placeholder="প্রতিষ্ঠান / মাদ্রাসার নাম"
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.qualYear}
                      </label>
                      <input
                        type="text"
                        value={qualYear}
                        onChange={(e) => setQualYear(e.target.value)}
                        placeholder="e.g. 2019"
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ফলাফল / গ্রেড / সনদ নং
                      </label>
                      <input
                        type="text"
                        value={qualResult}
                        onChange={(e) => setQualResult(e.target.value)}
                        placeholder="যেমন: মুমতাজ / ১ম বিভাগ"
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Qualifications Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">সনদ / ডিগ্রি</th>
                      <th className="py-3 px-4">ধরন</th>
                      <th className="py-3 px-4">শিক্ষা প্রতিষ্ঠান / বোর্ড</th>
                      <th className="py-3 px-4">পাশের সন</th>
                      <th className="py-3 px-4">ফলাফল</th>
                      {permissions.canEdit && <th className="py-3 px-4 text-right">পদক্ষেপ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Primary Qualification from profile */}
                    <tr className="bg-emerald-50/20">
                      <td className="py-3 px-4 font-bold text-emerald-900 dark:text-emerald-300">
                        {teacher.highest_qualification}
                        <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          মূল ডিগ্রি
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {teacher.educational_background || 'ইসলামিক'}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {teacher.institution_university}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {teacher.passing_year || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {teacher.specialization || '—'}
                      </td>
                      {permissions.canEdit && <td className="py-3 px-4 text-right text-slate-400">—</td>}
                    </tr>

                    {/* Additional Qualifications */}
                    {qualifications.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {q.degree_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {q.degree_type === 'islamic'
                            ? 'ইসলামিক / ধর্মীয়'
                            : q.degree_type === 'general'
                            ? 'সাধারণ শিক্ষা'
                            : 'অন্যান্য'}
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {q.institution_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {q.passing_year || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {q.result_grade || '—'}
                        </td>
                        {permissions.canEdit && (
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteQualification(q.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    শিক্ষকের অফিসিয়াল নথিপত্র ও ফাইল
                  </h4>
                  <p className="text-xs text-slate-500">
                    এনআইডি, সনদপত্র, জীবনবৃত্তান্ত ও নিয়োগপত্রের সংযুক্তি
                  </p>
                </div>
                {permissions.canManageDocs && (
                  <button
                    type="button"
                    onClick={() => setIsAddDocOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.teachers.profile.uploadDocument}
                  </button>
                )}
              </div>

              {/* Upload Document sub-form */}
              {isAddDocOpen && (
                <form
                  onSubmit={handleAddDocument}
                  className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      নতুন নথি আপলোড ফরম
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsAddDocOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.docCategory} *
                      </label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as TeacherDocumentCategory)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="nid">জাতীয় পরিচয়পত্র (NID/Passport)</option>
                        <option value="certificate">শিক্ষাগত / দাওরায়ে হাদিস সনদ</option>
                        <option value="appointment_letter">নিয়োগপত্র (Appointment Letter)</option>
                        <option value="joining_report">যোগদানপত্র (Joining Report)</option>
                        <option value="cv">জীবনবৃত্তান্ত (Resume / CV)</option>
                        <option value="photo">অতিরিক্ত ছবি</option>
                        <option value="other">অন্যান্য নথি</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.docTitle} *
                      </label>
                      <input
                        type="text"
                        required
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="যেমন: দাওরায়ে হাদিস মূল সনদপত্র"
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.teachers.profile.docFile} *
                      </label>
                      <input
                        ref={docFileInputRef}
                        type="file"
                        required
                        accept="application/pdf,image/*"
                        onChange={handleDocFileSelect}
                        className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddDocOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-200"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        আপলোড সম্পন্ন করুন
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Documents Grid */}
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {doc.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 capitalize">
                            {doc.category} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'ডকুমেন্ট'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.file_name || doc.title}
                            className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="দেখুন / ডাউনলোড"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {permissions.canManageDocs && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">এখনো কোনো নথি আপলোড করা হয়নি।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    শিক্ষক কার্যক্রম ও অডিট ট্রেইল (Activity Log)
                  </h4>
                  <p className="text-xs text-slate-500">
                    এই প্রোফাইলে সম্পন্ন সকল পরিবর্তন ও প্রশাসনিক পদক্ষেপের নিখুঁত রেকর্ড
                  </p>
                </div>
              </div>

              {activities.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(act.created_at).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {act.description}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          সম্পাদনায়: <span className="font-semibold text-slate-600 dark:text-slate-300">{act.performed_by_name}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  কোনো কার্যক্রম লগ পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT & SECURITY */}
          {activeTab === 'account' && (
            <div className="space-y-6 w-full max-w-full min-w-0">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.teachers.profile.tabs.account}
                </h4>
                <p className="text-xs text-slate-500">
                  সফটওয়্যারে শিক্ষকের লগইন অধিকার ও সিস্টেম অ্যাক্সেস ম্যানেজমেন্ট
                </p>
              </div>

              {/* Current Account Status */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {teacher.user_id ? t.teachers.profile.connectedAccount : t.teachers.profile.noConnectedAccount}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {teacher.user_id
                        ? `ইউজার আইডি: ${teacher.user_id}`
                        : 'এই শিক্ষক প্রোফাইলের সাথে সরাসরি কোনো সফটওয়্যার লগইন অ্যাকাউন্ট সংযুক্ত নেই।'}
                    </p>
                  </div>
                </div>

                {permissions.canLinkAccount && (
                  <div className="flex items-center gap-2 shrink-0">
                    {teacher.user_id ? (
                      <button
                        type="button"
                        onClick={handleDisconnectAccount}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        {t.teachers.profile.disconnectAccountBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsLinkAccountOpen(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Key className="w-3.5 h-3.5" />
                        {t.teachers.profile.connectAccountBtn}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Link Account Dialog */}
              {isLinkAccountOpen && (
                <form
                  onSubmit={handleConnectAccount}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      লগইন অ্যাকাউন্ট সংস্থাপন
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsLinkAccountOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        accountConnectType === 'existing'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accType"
                        checked={accountConnectType === 'existing'}
                        onChange={() => setAccountConnectType('existing')}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">{t.teachers.form.linkExistingUser}</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        accountConnectType === 'new'
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accType"
                        checked={accountConnectType === 'new'}
                        onChange={() => setAccountConnectType('new')}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold block">{t.teachers.form.createNewAccount}</span>
                    </label>
                  </div>

                  {accountConnectType === 'existing' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.teachers.form.selectUser} *
                      </label>
                      {availableUsers.length > 0 ? (
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        >
                          <option value="">ব্যবহারকারী নির্বাচন করুন...</option>
                          {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email} - {u.role_id})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
                          বর্তমানে কোনো অসংযুক্ত ইউজার পাওয়া যায়নি। দয়া করে নতুন অ্যাকাউন্ট তৈরি করুন।
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountEmail} *
                        </label>
                        <input
                          type="email"
                          required
                          value={newAccEmail}
                          onChange={(e) => setNewAccEmail(e.target.value)}
                          placeholder="teacher@example.com"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountPassword} *
                        </label>
                        <input
                          type="password"
                          required
                          value={newAccPassword}
                          onChange={(e) => setNewAccPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountRole}
                        </label>
                        <select
                          value={newAccRole}
                          onChange={(e) => setNewAccRole(e.target.value as RoleSlug)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        >
                          <option value="teacher">উস্তায / শিক্ষক (Teacher)</option>
                          <option value="principal">মুহতামিম / প্রিন্সিপাল (Principal)</option>
                          <option value="institution_admin">প্রতিষ্ঠান এডমিন (Institution Admin)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsLinkAccountOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      সংযুক্ত করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Danger Zone: Delete Profile */}
              {permissions.canDelete && (
                <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      শিক্ষক প্রোফাইল মুছে ফেলুন
                    </h5>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      সফট ডিলিটের মাধ্যমে প্রোফাইলটি সংরক্ষণাগারে সরানো হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.teachers.profile.deleteTeacherBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-xs text-slate-500">
            নিবন্ধন তারিখ: {new Date(teacher.created_at).toLocaleDateString('bn-BD')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          >
            {t.teachers.profile.backToList}
          </button>
        </div>

        {/* Sub-modals */}
        {isStatusModalOpen && (
          <TeacherStatusModal
            isOpen={isStatusModalOpen}
            onClose={() => setIsStatusModalOpen(false)}
            teacher={teacher}
            onStatusUpdated={(updated) => {
              setTeacher(updated);
              onTeacherUpdated(updated);
              loadRelatedData();
            }}
          />
        )}

        {isIdCardModalOpen && (
          <TeacherIdCardModal
            isOpen={isIdCardModalOpen}
            onClose={() => setIsIdCardModalOpen(false)}
            teacher={teacher}
            designations={designations}
            departments={departments}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  শিক্ষক প্রোফাইল মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {teacher.full_name_bn} ({teacher.teacher_id})-কে মুছে ফেলা হবে।
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSoftDelete}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  DbStudent,
  DbDepartment,
  DbClass,
  DbSection,
  DbStudentDocument,
  DbStudentActivity,
  StudentStatus,
  DocumentCategory,
} from '../../types/step2';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StudentIDCardModal } from './StudentIDCardModal';
import {
  ArrowLeft,
  User,
  BookOpen,
  Phone,
  FileText,
  Clock,
  Printer,
  Edit,
  Trash2,
  Plus,
  ShieldCheck,
  Calendar,
  MapPin,
  Heart,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
} from 'lucide-react';

interface StudentProfileViewProps {
  student: DbStudent;
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  onBack: () => void;
  onEdit: (student: DbStudent) => void;
  onDelete: (student: DbStudent) => void;
  onChangeStatus: (studentId: string, status: StudentStatus, reason?: string) => Promise<boolean>;
  getDocuments: (studentId: string) => Promise<DbStudentDocument[]>;
  addDocument: (doc: any) => Promise<DbStudentDocument>;
  deleteDocument: (docId: string) => Promise<boolean>;
  getActivities: (studentId: string) => Promise<DbStudentActivity[]>;
  canEdit: boolean;
  canDelete: boolean;
  canStatus: boolean;
  canDocuments: boolean;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  departments,
  classes,
  sections,
  onBack,
  onEdit,
  onDelete,
  onChangeStatus,
  getDocuments,
  addDocument,
  deleteDocument,
  getActivities,
  canEdit,
  canDelete,
  canStatus,
  canDocuments,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history' | 'idcard'>('overview');
  const [documents, setDocuments] = useState<DbStudentDocument[]>([]);
  const [activities, setActivities] = useState<DbStudentActivity[]>([]);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  // Status Change State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Add Document State
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('birth_certificate');
  const [docUrl, setDocUrl] = useState('');
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  // Load documents and activities
  useEffect(() => {
    let isMounted = true;

    getDocuments(student.id).then((docs) => {
      if (isMounted) setDocuments(docs);
    });

    getActivities(student.id).then((acts) => {
      if (isMounted) setActivities(acts);
    });

    return () => {
      isMounted = false;
    };
  }, [student.id, getDocuments, getActivities]);

  const department = departments.find((d) => d.id === student.department_id);
  const studentClass = classes.find((c) => c.id === student.class_id);
  const section = sections.find((s) => s.id === student.section_id);

  const deptName = language === 'bn' ? department?.name_bn : department?.name_en;
  const classNameText = language === 'bn' ? studentClass?.name_bn : studentClass?.name_en;
  const sectionName = language === 'bn' ? section?.name_bn : section?.name_en;

  const handleStatusChange = async (newStatus: StudentStatus) => {
    try {
      setIsChangingStatus(true);
      setIsStatusDropdownOpen(false);
      await onChangeStatus(student.id, newStatus, 'প্রোফাইল থেকে স্ট্যাটাস পরিবর্তন');
      // Refresh activities
      const updatedActs = await getActivities(student.id);
      setActivities(updatedActs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    try {
      setIsSavingDoc(true);
      const newDoc = await addDocument({
        student_id: student.id,
        category: docCategory,
        title: docTitle.trim(),
        file_url: docUrl.trim() || 'https://via.placeholder.com/600x800.png?text=Document',
        file_type: 'image/png',
        file_size: 154200,
      });
      setDocuments((prev) => [newDoc, ...prev]);
      setDocTitle('');
      setDocUrl('');
      setIsAddDocOpen(false);

      // Refresh activity log
      const updatedActs = await getActivities(student.id);
      setActivities(updatedActs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি এই নথিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this document?')) {
      return;
    }
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      // Refresh activity log
      const updatedActs = await getActivities(student.id);
      setActivities(updatedActs);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="emerald">{language === 'bn' ? 'নিয়মিত (Active)' : 'Active'}</Badge>;
      case 'pending':
        return <Badge variant="amber">{language === 'bn' ? 'অপেক্ষমান (Pending)' : 'Pending'}</Badge>;
      case 'on_leave':
        return <Badge variant="sky">{language === 'bn' ? 'ছুটিতে (On Leave)' : 'On Leave'}</Badge>;
      case 'inactive':
        return <Badge variant="neutral">{language === 'bn' ? 'অনিয়মিত (Inactive)' : 'Inactive'}</Badge>;
      case 'transferred':
        return <Badge variant="indigo">{language === 'bn' ? 'ছাড়পত্রপ্রাপ্ত (Transferred)' : 'Transferred'}</Badge>;
      case 'graduated':
        return <Badge variant="gold">{language === 'bn' ? 'উত্তীর্ণ (Graduated)' : 'Graduated'}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back button & Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'শিক্ষার্থী তালিকায় ফিরে যান' : 'Back to Students List'}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Change Dropdown */}
          {canStatus && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                disabled={isChangingStatus}
                className="text-xs font-semibold gap-1.5"
              >
                <span>{language === 'bn' ? 'স্ট্যাটাস পরিবর্তন' : 'Change Status'}</span>
              </Button>

              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'bn' ? 'নতুন স্ট্যাটাস নির্ধারণ' : 'Set New Status'}
                  </div>
                  {[
                    { id: 'active', labelBn: 'নিয়মিত (Active)' },
                    { id: 'pending', labelBn: 'অপেক্ষমান (Pending)' },
                    { id: 'on_leave', labelBn: 'ছুটিতে (On Leave)' },
                    { id: 'inactive', labelBn: 'অনিয়মিত (Inactive)' },
                    { id: 'transferred', labelBn: 'ছাড়পত্রপ্রাপ্ত (Transferred)' },
                    { id: 'graduated', labelBn: 'উত্তীর্ণ (Graduated)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(s.id as StudentStatus)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        student.status === s.id ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {s.labelBn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Print ID Card Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsIdCardOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিজিটাল আইডি কার্ড' : 'ID Card'}</span>
          </Button>

          {/* Edit Button */}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
            </Button>
          )}

          {/* Soft Delete Button */}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(student)}
              className="gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Student Profile Hero Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center shrink-0">
            {student.photo ? (
              <img
                src={student.photo}
                alt={student.full_name_bn}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {student.full_name_bn.charAt(0)}
              </span>
            )}
          </div>

          {/* Title & Core IDs */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {student.full_name_bn}
              </h1>
              <div>{getStatusBadge(student.status)}</div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {student.full_name_en}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                আইডি: {student.student_id}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold">
                রোল: {student.roll_number}
              </span>
              <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                {deptName || 'বিভাগ'} • {classNameText || 'জামাত'}
              </span>
              {sectionName && (
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  শাখা: {sectionName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', labelBn: 'সারসংক্ষেপ (Overview)', icon: User },
            { id: 'documents', labelBn: `নথিপত্র (${documents.length})`, icon: FileText },
            { id: 'history', labelBn: `অ্যাক্টিভিটি হিস্ট্রি (${activities.length})`, icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.labelBn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ব্যক্তিগত বিবরণ (Personal Details)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">লিঙ্গ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {student.gender === 'male' ? 'ছাত্র (Male)' : 'ছাত্রী (Female)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">জন্ম তারিখ</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {student.date_of_birth}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">রক্তের গ্রুপ</span>
                <span className="font-bold text-rose-600">
                  {student.blood_group || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">জাতীয়তা ও ধর্ম</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {student.nationality} • {student.religion}
                </span>
              </div>
            </div>

            {student.birth_registration_number && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  জন্ম নিবন্ধন / এনআইডি নং
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {student.birth_registration_number}
                </span>
              </div>
            )}
          </div>

          {/* Academic Info Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>একাডেমিক তথ্য (Academic Details)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">বিভাগ</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {deptName || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">জামাত / শ্রেণি</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {classNameText || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">শিক্ষাবর্ষ (Session)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {student.academic_session}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">ভর্তির তারিখ</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {student.admission_date}
                </span>
              </div>
            </div>

            {student.previous_institution && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  পূর্ববর্তী প্রতিষ্ঠান
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.previous_institution} {student.previous_class ? `(${student.previous_class})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Emergency & Guardian Contact */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>জরুরী যোগাযোগ ও অভিভাবক (Emergency Contact)</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">অভিভাবকের নাম:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {student.emergency_contact_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">সম্পর্ক:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.emergency_relationship}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">জরুরী মোবাইল নম্বর:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {student.emergency_mobile}
                </span>
              </div>
              {student.emergency_alternative_mobile && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">বিকল্প মোবাইল:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {student.emergency_alternative_mobile}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ঠিকানা (Address Details)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">বর্তমান ঠিকানা</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {student.present_address || 'উল্লেখ নেই'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block font-semibold">স্থায়ী ঠিকানা</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {student.permanent_address || 'উল্লেখ নেই'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'সংযুক্ত নথিপত্র' : 'Student Documents'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'জন্ম নিবন্ধন, প্রশংসাপত্র, জাতীয় পরিচয়পত্র ও অন্যান্য ডকুমেন্ট'
                  : 'Birth certificates, previous testimonials and identity cards'}
              </p>
            </div>

            {canDocuments && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddDocOpen(true)}
                className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নথি যোগ করুন' : 'Add Document'}</span>
              </Button>
            )}
          </div>

          {/* Add Document Form Dialog */}
          {isAddDocOpen && (
            <form
              onSubmit={handleAddDocument}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 shadow-md space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  নতুন নথি আপলোড / সংযোজন
                </h4>
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
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    নথির ধরন (Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="birth_certificate">জন্ম নিবন্ধন সনদ</option>
                    <option value="nid">অভিভাবকের এনআইডি</option>
                    <option value="previous_certificate">পূর্বের মাদ্রাসা সনদ</option>
                    <option value="photo">পাসপোর্ট সাইজ ছবি</option>
                    <option value="medical">মেডিকেল রিপোর্ট</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    নথির শিরোনাম (Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="যেমন: জন্ম নিবন্ধন কপি"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ফাইলের লিংক (URL)
                  </label>
                  <input
                    type="text"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDocOpen(false)}
                  disabled={isSavingDoc}
                  className="text-xs"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingDoc}
                  className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {isSavingDoc ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </Button>
              </div>
            </form>
          )}

          {/* Documents Grid */}
          {documents.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                কোনো নথিপত্র আপলোড করা হয়নি।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {doc.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {new Date(doc.uploaded_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="ডাউনলোড বা দেখুন"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canDocuments && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTIVITY HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'শিক্ষার্থী অ্যাক্টিভিটি টাইমলাইন' : 'Student Activity History'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'ভর্তি, তথ্য পরিবর্তন ও স্ট্যাটাস আপডেটের সম্পূর্ণ অডিট রেকর্ড'
                : 'Complete audit log of admission and profile operations'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                কোনো অ্যাক্টিভিটি হিস্ট্রি পাওয়া যায়নি।
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {act.description}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(act.timestamp).toLocaleString('bn-BD')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        সম্পাদনকারী: <span className="font-semibold">{act.user_name}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      <StudentIDCardModal
        isOpen={isIdCardOpen}
        student={student}
        onClose={() => setIsIdCardOpen(false)}
        classNameText={classNameText}
        departmentNameText={deptName}
      />
    </div>
  );
};

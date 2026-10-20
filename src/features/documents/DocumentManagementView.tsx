import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Archive,
  Search,
  Filter,
  Lock,
  Eye,
  Plus,
  Calendar,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { usePart7System } from '../../context/Part7SystemContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { MadrasaDocument, DocumentCategory, UserRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const DocumentManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { user, institution } = useAuth();
  const { documents, uploadDocument, archiveDocument, deleteDocument } = usePart7System();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('student_document');
  const [fileType, setFileType] = useState('PDF');
  const [ownerName, setOwnerName] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.ownerName && doc.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    uploadDocument({
      institutionId: institution?.id || 'inst-001',
      documentName: docName,
      category,
      fileType,
      fileSize: '1.4 MB',
      fileUrl: '#',
      ownerType: category === 'teacher_document' ? 'teacher' : category === 'student_document' ? 'student' : 'institution',
      ownerName: ownerName || institution?.nameBn || 'মাদ্রাসা কর্তৃপক্ষ',
      isSensitive,
      permissions: {
        allowedRoles: isSensitive
          ? ['super_admin', 'madrasa_admin', 'principal']
          : ['super_admin', 'madrasa_admin', 'principal', 'teacher'],
        canView: true,
        canDownload: true,
        canEdit: true,
        canDelete: false
      },
      status: 'active',
      uploadedBy: user?.fullNameBn || 'অ্যাডমিন'
    });

    setIsUploadOpen(false);
    setDocName('');
    setOwnerName('');
    showToast(language === 'bn' ? 'ডকুমেন্ট সফলভাবে আপলোড হয়েছে।' : 'Document uploaded.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'প্রাতিষ্ঠানিক ডকুমেন্ট ম্যানেজমেন্ট' : 'Document Management System'}
            </h1>
            <Badge variant="emerald" size="sm">
              Secured Vault
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'bn'
              ? 'শিক্ষার্থী ও শিক্ষকদের সনদপত্র, জন্ম নিবন্ধন, চুক্তিপত্র ও প্রাতিষ্ঠানিক ফাইলের সুরক্ষিত ভল্ট'
              : 'Secure encrypted document vault for student files, certificates, contracts and governance'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>{language === 'bn' ? 'ডকুমেন্ট আপলোড' : 'Upload Document'}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'ফাইলের নাম দিয়ে খুঁজুন...' : 'Search documents...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'সকল ফাইল' },
            { id: 'student_document', label: 'শিক্ষার্থী ফাইল' },
            { id: 'teacher_document', label: 'শিক্ষক ফাইল' },
            { id: 'institutional_policy', label: 'প্রাতিষ্ঠানিক পলিসি' },
            { id: 'certificate_record', label: 'সনদপত্র খতিয়ান' }
          ].map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  {doc.fileType}
                </div>
                <div className="flex items-center gap-1.5">
                  {doc.isSensitive && (
                    <span className="p-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>গোপনীয়</span>
                    </span>
                  )}
                  {doc.status === 'archived' && (
                    <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                      আর্কাইভ
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {doc.documentName}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  মালিক: <strong>{doc.ownerName}</strong>
                </p>
              </div>

              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>সাইজ: {doc.fileSize} • তারিখ: {doc.uploadDate}</p>
                <p>আপলোড করেছেন: {doc.uploadedBy}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  showToast(language === 'bn' ? 'ফাইল ডাউনলোড শুরু হয়েছে...' : 'Downloading file...', 'info');
                }}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    archiveDocument(doc.id);
                    showToast(language === 'bn' ? 'আর্কাইভ স্ট্যাটাস পরিবর্তিত হয়েছে।' : 'Archive status updated.', 'info');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Archive/Unarchive"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    deleteDocument(doc.id);
                    showToast(language === 'bn' ? 'ডকুমেন্ট মুছে ফেলা হয়েছে।' : 'Document deleted.', 'info');
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Upload Document */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {language === 'bn' ? 'নতুন ফাইল / ডকুমেন্ট আপলোড' : 'Upload Document'}
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ফাইলের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শিক্ষার্থী জন্ম নিবন্ধন ও চুক্তিপত্র"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="student_document">শিক্ষার্থী ফাইল</option>
                    <option value="teacher_document">শিক্ষক ফাইল</option>
                    <option value="institutional_policy">প্রাতিষ্ঠানিক পলিসি</option>
                    <option value="certificate_record">সনদপত্র রেকর্ড</option>
                    <option value="admission_record">ভর্তি সংক্রান্ত</option>
                    <option value="financial_audit">আর্থিক অডিট</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">ফরম্যাট</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="JPG">JPG / PNG</option>
                    <option value="XLSX">Excel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মালিক বা সংশ্লিষ্ট ব্যক্তি</label>
                <input
                  type="text"
                  placeholder="যেমন: মুহাম্মদ আব্দুল্লাহ (রোল: ১০১)"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSensitive"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isSensitive" className="text-slate-700 dark:text-slate-300 font-medium">
                  গোপনীয় ফাইল (শুধুমাত্র প্রিন্সিপাল ও অ্যাডমিন অ্যাক্সেস)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" variant="primary">
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

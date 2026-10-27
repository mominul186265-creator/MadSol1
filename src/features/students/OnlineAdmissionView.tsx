import React, { useState } from 'react';
import { AdmissionApplication, AdmissionStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Eye,
  Calendar,
  Phone,
  User,
  MapPin,
  GraduationCap,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { PublicAdmissionFormModal } from './PublicAdmissionFormModal';

export const OnlineAdmissionView: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    scopedAdmissions,
    approveAdmissionApplication,
    rejectAdmissionApplication,
  } = useMadrasaData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Modals
  const [isPublicFormOpen, setIsPublicFormOpen] = useState(false);
  const [selectedAppForReview, setSelectedAppForReview] = useState<AdmissionApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const admissionPortalUrl = `${window.location.origin}/apply-online`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(admissionPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter admissions
  const filteredAdmissions = scopedAdmissions.filter((app) => {
    if (selectedStatus && app.status !== selectedStatus) return false;
    if (selectedDepartment && app.appliedDepartment !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        app.applicantNameBn.toLowerCase().includes(q) ||
        app.applicantNameEn.toLowerCase().includes(q) ||
        app.guardianMobile.includes(q) ||
        app.applicationNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{t.admissions.status.pending}</span>
          </span>
        );
      case 'approved':
        return (
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.admissions.status.approved}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-400 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>{t.admissions.status.rejected}</span>
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleApprove = async (app: AdmissionApplication) => {
    setIsApproving(true);
    try {
      await approveAdmissionApplication(app.id);
      setSelectedAppForReview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (app: AdmissionApplication) => {
    if (!rejectReason.trim()) return;
    try {
      await rejectAdmissionApplication(app.id, rejectReason);
      setIsRejecting(false);
      setRejectReason('');
      setSelectedAppForReview(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.admissions.title}
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {scopedAdmissions.filter((a) => a.status === 'pending').length} টি অপেক্ষমাণ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.admissions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 text-xs font-semibold"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.admissions.publicFormLinkCopied}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.admissions.copyPortalLink}</span>
              </>
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPublicFormOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-md bg-emerald-700 hover:bg-emerald-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.admissions.openPublicForm}</span>
          </Button>
        </div>
      </div>

      {/* Shareable Link Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
              {t.admissions.shareableTitle}
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              {t.admissions.shareableDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            readOnly
            value={admissionPortalUrl}
            className="text-[11px] font-mono px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex-1 sm:w-64"
          />
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
            title="লিঙ্ক কপি করুন"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admissions.searchPlaceholder}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">সকল আবেদন ({scopedAdmissions.length})</option>
            <option value="pending">অপেক্ষমাণ (Pending)</option>
            <option value="approved">অনুমোদিত (Approved)</option>
            <option value="rejected">বাতিলকৃত (Rejected)</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">সকল বিভাগ</option>
            <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
            <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
            <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredAdmissions.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p>কোনো ভর্তি আবেদন পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold select-none">
                  <th className="p-3.5">আবেদন নং</th>
                  <th className="p-3.5">আবেদনকারী</th>
                  <th className="p-3.5">আবেদিত বিভাগ ও জামাত</th>
                  <th className="p-3.5">অভিভাবক ও মোবাইল</th>
                  <th className="p-3.5">আবেদনের তারিখ</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredAdmissions.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedAppForReview(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {app.applicationNumber}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 overflow-hidden flex items-center justify-center shrink-0">
                          {app.photoUrl || app.photo ? (
                            <img
                              src={app.photoUrl || app.photo}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {language === 'bn' ? app.applicantNameBn : app.applicantNameEn}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {language === 'bn' ? app.applicantNameEn : app.applicantNameBn}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {app.appliedDepartment}
                      </span>
                      <span className="text-[10px] text-slate-500">{app.appliedClass}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {app.guardianName}
                      </div>
                      <a
                        href={`tel:${app.guardianMobile}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-mono text-emerald-600 hover:underline"
                      >
                        {app.guardianMobile}
                      </a>
                    </td>

                    <td className="p-3.5 text-slate-500">{app.appliedDate}</td>

                    <td className="p-3.5">{getStatusBadge(app.status)}</td>

                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAppForReview(app)}
                        className="text-xs"
                      >
                        পর্যালোচনা
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Approval Modal */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Review Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ভর্তি আবেদন পর্যালোচনা ({selectedAppForReview.applicationNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    আবেদনের তারিখ: {selectedAppForReview.appliedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Details & Photo Grid */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-24 h-28 rounded-xl border-2 border-emerald-500/30 overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center shrink-0">
                {selectedAppForReview.photoUrl || selectedAppForReview.photo ? (
                  <img
                    src={selectedAppForReview.photoUrl || selectedAppForReview.photo}
                    alt={selectedAppForReview.applicantNameBn}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-1 text-slate-400" />
                    <span className="text-[10px] block">ছবি নেই</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs flex-1 w-full">
                <div>
                  <span className="text-slate-500 block">আবেদনকারীর নাম (বাংলা):</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedAppForReview.applicantNameBn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Name (English):</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedAppForReview.applicantNameEn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">জন্ম তারিখ:</span>
                  <span className="font-medium">{selectedAppForReview.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">রক্তের গ্রুপ:</span>
                  <span className="font-bold text-emerald-600">{selectedAppForReview.bloodGroup || 'B+'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">আবেদিত বিভাগ:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedAppForReview.appliedDepartment}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">শ্রেণি / জামাত:</span>
                  <span className="font-semibold">{selectedAppForReview.appliedClass}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">অভিভাবকের নাম:</span>
                  <span className="font-bold">{selectedAppForReview.guardianName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">অভিভাবকের মোবাইল:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {selectedAppForReview.guardianMobile}
                  </span>
                </div>
              </div>
            </div>

            {selectedAppForReview.address && (
              <div className="text-xs">
                <span className="text-slate-500 font-semibold block mb-1">ঠিকানা:</span>
                <p className="text-slate-700 dark:text-slate-300 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedAppForReview.address}
                </p>
              </div>
            )}

            {/* If Already Enrolled */}
            {selectedAppForReview.status === 'approved' && selectedAppForReview.enrolledStudentId && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  এই শিক্ষার্থী ইতোমধ্যে অনুমোদিত ও তালিকাভুক্ত হয়েছে। নির্ধারিত শিক্ষার্থী আইডি:{' '}
                  <strong className="font-mono">{selectedAppForReview.enrolledStudentId}</strong>
                </span>
              </div>
            )}

            {/* Rejection Details */}
            {selectedAppForReview.status === 'rejected' && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block">আবেদন বাতিলের কারণ:</span>
                <p className="mt-0.5">{selectedAppForReview.rejectionReason || 'আসন পূর্ণ ছিল'}</p>
              </div>
            )}

            {/* Reject Box when clicking reject */}
            {isRejecting && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                <label className="text-xs font-semibold text-rose-800 dark:text-rose-300 block">
                  বাতিলের কারণ লিখুন:
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="যেমন: মৌখিক পরীক্ষায় উত্তীর্ণ হতে পারেনি / কোটা পূরণ হয়েছে"
                  className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white text-slate-900"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejecting(false)}
                  >
                    বাতিল
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReject(selectedAppForReview)}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    আবেদন প্রত্যাখ্যান নিশ্চিত করুন
                  </Button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppForReview(null)}
              >
                বন্ধ করুন
              </Button>

              {selectedAppForReview.status === 'pending' && !isRejecting && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejecting(true)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900"
                  >
                    প্রত্যাখ্যান
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isApproving}
                    onClick={() => handleApprove(selectedAppForReview)}
                    className="gap-1.5 shadow-md bg-emerald-700 hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.admissions.approveAndEnroll}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Public Admission Form Preview Modal */}
      <PublicAdmissionFormModal
        isOpen={isPublicFormOpen}
        onClose={() => setIsPublicFormOpen(false)}
      />
    </div>
  );
};

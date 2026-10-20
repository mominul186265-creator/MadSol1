import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Check,
  X,
  FileText,
  User,
  Search,
} from 'lucide-react';
import {
  DbLeaveApplication,
  LeaveStatus,
  LeaveType,
  AttendanceTargetType,
} from '../../types/step4';
import { useLanguage } from '../../context/LanguageContext';

interface LeaveManagementViewProps {
  targetType: AttendanceTargetType;
  applications: DbLeaveApplication[];
  canManageLeaves: boolean;
  filterStatus: LeaveStatus | 'all';
  onFilterStatusChange: (status: LeaveStatus | 'all') => void;
  onApplyLeave: (data: {
    target_id: string;
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }) => any;
  onAction: (id: string, status: LeaveStatus, remarks?: string) => void;
  availableTargets: Array<{ id: string; name_bn: string; code: string }>;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  targetType,
  applications = [],
  canManageLeaves,
  filterStatus,
  onFilterStatusChange,
  onApplyLeave,
  onAction,
  availableTargets = [],
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('sick');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');

  // Action modal
  const [actionItem, setActionItem] = useState<{
    id: string;
    status: LeaveStatus;
    name: string;
  } | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');

  // Calculate days
  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    const days = calculateDays();
    onApplyLeave({
      target_id: selectedTargetId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: days,
      reason: reason.trim() || 'বিশেষ ছুটি',
    });

    setIsApplyModalOpen(false);
    setSelectedTargetId('');
    setReason('');
  };

  const handleConfirmAction = () => {
    if (!actionItem) return;
    onAction(actionItem.id, actionItem.status, actionRemarks);
    setActionItem(null);
    setActionRemarks('');
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    switch (type) {
      case 'sick':
        return isBn ? 'অসুস্থতাজনিত ছুটি' : 'Sick Leave';
      case 'casual':
        return isBn ? 'নৈমিত্তিক ছুটি' : 'Casual Leave';
      case 'emergency':
        return isBn ? 'জরুরি ছুটি' : 'Emergency Leave';
      case 'hajj_umrah':
        return isBn ? 'হজ্ব / উমরাহ ছুটি' : 'Hajj / Umrah';
      case 'academic':
        return isBn ? 'একাডেমিক ছুটি' : 'Academic Leave';
      case 'family':
        return isBn ? 'পারিবারিক ছুটি' : 'Family Leave';
      default:
        return isBn ? 'সাধারণ ছুটি' : 'General Leave';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => onFilterStatusChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isBn ? 'সকল আবেদন' : 'All Requests'}
          </button>
          <button
            type="button"
            onClick={() => onFilterStatusChange('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            {isBn ? 'অপেক্ষমাণ (Pending)' : 'Pending'}
          </button>
          <button
            type="button"
            onClick={() => onFilterStatusChange('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            {isBn ? 'অনুমোদিত (Approved)' : 'Approved'}
          </button>
          <button
            type="button"
            onClick={() => onFilterStatusChange('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            {isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}
          </button>
        </div>

        {/* Apply Leave Button */}
        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {isBn
            ? targetType === 'student'
              ? 'শিক্ষার্থী ছুটির আবেদন'
              : 'শিক্ষক ছুটির আবেদন'
            : 'New Leave Request'}
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-medium">{isBn ? 'কোনো ছুটির আবেদন নেই' : 'No leave applications'}</p>
            <p className="text-xs text-slate-400 mt-1">
              {isBn
                ? 'নতুন আবেদন দাখিল করতে উপরের বাটনে ক্লিক করুন।'
                : 'Submit a new leave application above.'}
            </p>
          </div>
        ) : (
          applications.map((app) => {
            const isPending = app.status === 'pending';
            const isApproved = app.status === 'approved';
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {app.target_name_bn}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {app.target_code}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-medium">
                      {getLeaveTypeLabel(app.leave_type)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {isBn ? 'কারণ:' : 'Reason:'}{' '}
                    </span>
                    {app.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1 pt-1">
                    <span>
                      📅 {app.start_date} {isBn ? 'হতে' : 'to'} {app.end_date}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {app.total_days} {isBn ? 'দিন' : 'Days'}
                    </span>
                    {app.action_remarks && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {isBn ? 'প্রশাসনিক মন্তব্য:' : 'Admin Note:'} {app.action_remarks}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/40'
                    }`}
                  >
                    {isPending && <Clock className="w-3.5 h-3.5" />}
                    {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isRejected && <XCircle className="w-3.5 h-3.5" />}
                    {isPending
                      ? isBn
                        ? 'অপেক্ষমাণ'
                        : 'Pending'
                      : isApproved
                      ? isBn
                        ? 'অনুমোদিত'
                        : 'Approved'
                      : isBn
                      ? 'প্রত্যাখ্যাত'
                      : 'Rejected'}
                  </span>

                  {isPending && canManageLeaves && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setActionItem({
                            id: app.id,
                            status: 'approved',
                            name: app.target_name_bn,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isBn ? 'অনুমোদন' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActionItem({
                            id: app.id,
                            status: 'rejected',
                            name: app.target_name_bn,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        {isBn ? 'বাতিল' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn
                  ? targetType === 'student'
                    ? 'শিক্ষার্থীর ছুটির আবেদন'
                    : 'শিক্ষকের ছুটির আবেদন'
                  : 'Submit Leave Request'}
              </h3>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn
                    ? targetType === 'student'
                      ? 'শিক্ষার্থী নির্বাচন করুন'
                      : 'শিক্ষক নির্বাচন করুন'
                    : 'Select Target'}
                </label>
                <select
                  required
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">
                    {isBn ? '-- নির্বাচন করুন --' : '-- Select --'}
                  </option>
                  {availableTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name_bn} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ছুটির ধরন' : 'Leave Type'}
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sick">{isBn ? 'অসুস্থতাজনিত' : 'Sick'}</option>
                  <option value="casual">{isBn ? 'নৈমিত্তিক' : 'Casual'}</option>
                  <option value="emergency">{isBn ? 'জরুরি' : 'Emergency'}</option>
                  <option value="family">{isBn ? 'পারিবারিক' : 'Family'}</option>
                  <option value="hajj_umrah">{isBn ? 'হজ্ব / উমরাহ' : 'Hajj/Umrah'}</option>
                  <option value="academic">{isBn ? 'একাডেমিক' : 'Academic'}</option>
                  <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'শুরুর তারিখ' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'সমাপ্তির তারিখ' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between font-mono">
                <span>{isBn ? 'মোট ছুটির দিন:' : 'Total Days:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {calculateDays()} {isBn ? 'দিন' : 'Days'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'ছুটির বিস্তারিত কারণ' : 'Detailed Reason'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    isBn
                      ? 'ছুটি নেওয়ার সঠিক কারণ উল্লেখ করুন...'
                      : 'Specify the reason for leave...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!selectedTargetId}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isBn ? 'আবেদন দাখিল করুন' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action (Approval / Rejection) Modal */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {actionItem.status === 'approved'
                ? isBn
                  ? 'ছুটি অনুমোদন নিশ্চিতকরণ'
                  : 'Approve Leave'
                : isBn
                ? 'ছুটি বাতিলকরণ'
                : 'Reject Leave'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {actionItem.status === 'approved'
                ? isBn
                  ? `আপনি কি '${actionItem.name}' এর ছুটির আবেদন অনুমোদন করতে চান? অনুমোদন করলে উক্ত তারিখগুলোর হাজিরা স্বয়ংক্রিয়ভাবে 'ছুটি (LV)' হিসেবে চিহ্নিত হবে।`
                  : `Are you sure you want to approve leave for '${actionItem.name}'? Daily attendance will automatically be set to Leave.`
                : isBn
                ? `আপনি কি '${actionItem.name}' এর ছুটির আবেদন বাতিল করতে চান?`
                : `Are you sure you want to reject leave for '${actionItem.name}'?`}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রশাসনিক মন্তব্য (ঐচ্ছিক)' : 'Admin Note (Optional)'}
              </label>
              <input
                type="text"
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder={
                  actionItem.status === 'approved'
                    ? isBn
                      ? 'অনুমোদনের নোট (যেমন: মঞ্জুর করা হলো)'
                      : 'Approval note'
                    : isBn
                    ? 'বাতিলের কারণ'
                    : 'Rejection reason'
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-colors ${
                  actionItem.status === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionItem.status === 'approved'
                  ? isBn
                    ? 'হ্যাঁ, অনুমোদন করুন'
                    : 'Yes, Approve'
                  : isBn
                  ? 'বাতিল নিশ্চিত করুন'
                  : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

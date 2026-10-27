import React, { useState } from 'react';
import {
  CalendarCheck,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ScanLine,
  LayoutGrid,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tv,
  Cpu,
  Layers,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from './useAttendance';
import { DailyAttendanceSheet } from './DailyAttendanceSheet';
import { AllClassesAttendanceTab } from './AllClassesAttendanceTab';
import { QrAttendanceScanner } from './QrAttendanceScanner';
import { MonthlyAttendanceMatrix } from './MonthlyAttendanceMatrix';
import { LeaveManagementView } from './LeaveManagementView';
import { AttendanceReportModal } from './AttendanceReportModal';
import { LiveTvDisplayModal } from './LiveTvDisplayModal';
import { BiometricDeviceModal } from './BiometricDeviceModal';

type ActiveTab = 'all-classes' | 'sheet' | 'scanner' | 'matrix' | 'leaves';

interface AttendanceManagementViewProps {
  initialOpenTvModal?: boolean;
}

export const AttendanceManagementView: React.FC<AttendanceManagementViewProps> = ({
  initialOpenTvModal = false,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<ActiveTab>('all-classes');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTvModalOpen, setIsTvModalOpen] = useState(initialOpenTvModal);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const {
    targetType,
    setTargetType,
    date,
    setDate,
    departmentId,
    setDepartmentId,
    classId,
    setClassId,
    sectionId,
    setSectionId,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    targetRows,
    filteredRows,
    stats,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    departments,
    classes,
    sections,
    permissions,
    updateTargetStatus,
    updateTargetDetails,
    markAllVisible,
    markClassAll,
    markAllClassesPresent,
    saveAttendanceBatch,
    recordQrCheckIn,
    leaveApplications,
    leaveFilterStatus,
    setLeaveFilterStatus,
    applyLeave,
    handleLeaveAction,
    matrixYear,
    setMatrixYear,
    matrixMonth,
    setMatrixMonth,
    matrixClassId,
    setMatrixClassId,
    monthlyMatrix,
    exportToCsv,
    refreshAttendance,
  } = useAttendance();

  // Pending leaves count
  const pendingLeavesCount = leaveApplications.filter((l) => l.status === 'pending').length;

  // Available target candidates for leave submission
  const availableLeaveTargets = targetRows.map((r) => ({
    id: r.target_id,
    name_bn: r.target_name_bn,
    code: r.target_code,
  }));

  // Selected department and class labels
  const selectedDeptObj = departments.find((d) => d.id === departmentId);
  const selectedClassObj = classes.find((c) => c.id === classId);

  // Quick date change helpers
  const handleSetToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Banner / Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Description */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{isBn ? 'মডিউল ৪: ডিজিটাল হাজিরা ও ছুটি' : 'Step 4: Attendance & Leaves'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isBn ? 'ডিজিটাল হাজিরা ও ছুটি ব্যবস্থাপনা' : 'Digital Attendance & Leave Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {isBn
                ? 'শিক্ষার্থী ও শিক্ষকদের দৈনিক বায়োমেট্রিক/QR ও রোল-কল হাজিরা, ৩০ দিনের রেজিস্টার শিট ও প্রশাসনিক ছুটি অনুমোদন।'
                : 'Daily biometric, QR & manual roll-call attendance, 30-day monthly register and leave workflows.'}
            </p>
          </div>

          {/* Target Toggle Switch: Students vs Teachers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTargetType('student')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  targetType === 'student'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isBn ? 'শিক্ষার্থী হাজিরা' : 'Students'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('teacher')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  targetType === 'teacher'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isBn ? 'শিক্ষক ও স্টাফ' : 'Teachers & Staff'}</span>
              </button>
            </div>

            {/* Smart TV, Biometric, Print and Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTvModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title={isBn ? 'স্মার্ট টিভি ফুলস্ক্রিন মনিটর' : 'Smart TV Screen Mode'}
              >
                <Tv className="w-4 h-4" />
                <span>{isBn ? 'টিভি মনিটর' : 'TV Mode'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </button>

              <button
                type="button"
                onClick={() => setIsDeviceModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                title={isBn ? 'বায়োমেট্রিক ও আরএফআইডি মেশিন' : 'Biometric & RFID Machines'}
              >
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">{isBn ? 'ডিভাইস' : 'Devices'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                title={isBn ? 'প্রিন্ট রিপোর্ট' : 'Print Report'}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{isBn ? 'রিপোর্ট' : 'Report'}</span>
              </button>

              <button
                type="button"
                onClick={exportToCsv}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                title={isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{isBn ? 'এক্সপোর্ট' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isBn ? 'আজ' : 'Today'}
            </button>

            <button
              type="button"
              onClick={handleSetYesterday}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isBn ? 'গতকাল' : 'Yesterday'}
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isBn ? 'নির্বাচিত তারিখ:' : 'Selected Date:'}{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{date}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Targets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">
              {targetType === 'student' ? (isBn ? 'মোট শিক্ষার্থী' : 'Total') : isBn ? 'মোট শিক্ষক' : 'Total'}
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.total}
          </div>
        </div>

        {/* Present Card */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 shadow-sm bg-gradient-to-b from-emerald-50/20 to-transparent">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-medium">{isBn ? 'উপস্থিত' : 'Present'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
            {stats.present}
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800/50 rounded-2xl p-4 shadow-sm bg-gradient-to-b from-rose-50/20 to-transparent">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-xs font-medium">{isBn ? 'অনুপস্থিত' : 'Absent'}</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300 font-mono">
            {stats.absent}
          </div>
        </div>

        {/* Late Card */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm bg-gradient-to-b from-amber-50/20 to-transparent">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-medium">{isBn ? 'বিলম্ব' : 'Late'}</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 font-mono">
            {stats.late}
          </div>
        </div>

        {/* On Leave Card */}
        <div className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-800/50 rounded-2xl p-4 shadow-sm bg-gradient-to-b from-purple-50/20 to-transparent">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
            <span className="text-xs font-medium">{isBn ? 'ছুটিতে' : 'On Leave'}</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono">
            {stats.leave}
          </div>
        </div>

        {/* Percentage Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">{isBn ? 'উপস্থিতির হার' : 'Rate'}</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {stats.attendance_percentage}%
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('all-classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'all-classes'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? 'সব শ্রেণির হাজিরা' : 'All Classes'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'sheet'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{isBn ? 'শ্রেণিভিত্তিক রোল-কল' : 'Class Roll-Call'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'scanner'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>{isBn ? 'ডিজিটাল / QR স্ক্যানার' : 'QR & ID Check-in'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'matrix'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{isBn ? 'মাসিক রেজিস্টার' : 'Monthly Register'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all relative ${
            activeTab === 'leaves'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isBn ? 'ছুটি ব্যবস্থাপনা' : 'Leave Management'}</span>
          {pendingLeavesCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingLeavesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'all-classes' && (
          <AllClassesAttendanceTab
            institutionId={institution?.id || 'inst-001'}
            date={date}
            classes={classes}
            departments={departments}
            allRows={targetRows}
            canRecord={permissions.canRecord}
            onSelectClass={(selectedClsId) => {
              setClassId(selectedClsId);
              setActiveTab('sheet');
            }}
            onMarkClassAll={markClassAll}
            onMarkAllClassesPresent={markAllClassesPresent}
            onSave={saveAttendanceBatch}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
          />
        )}
        {activeTab === 'sheet' && (
          <DailyAttendanceSheet
            targetType={targetType}
            rows={filteredRows}
            totalRows={targetRows.length}
            isLoading={isLoading}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            canRecord={permissions.canRecord}
            departmentId={departmentId}
            setDepartmentId={setDepartmentId}
            classId={classId}
            setClassId={setClassId}
            sectionId={sectionId}
            setSectionId={setSectionId}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            departments={departments}
            classes={classes}
            sections={sections}
            onStatusChange={updateTargetStatus}
            onDetailsChange={updateTargetDetails}
            onMarkAllVisible={markAllVisible}
            onSave={saveAttendanceBatch}
          />
        )}

        {activeTab === 'scanner' && (
          <QrAttendanceScanner
            targetType={targetType}
            canRecord={permissions.canRecord}
            onScan={recordQrCheckIn}
            recentRecords={targetRows
              .filter((r) => r.record_id && r.status === 'present')
              .map((r) => ({
                id: r.record_id!,
                institution_id: 'inst-001',
                target_type: r.target_type,
                target_id: r.target_id,
                target_name_bn: r.target_name_bn,
                target_name_en: r.target_name_en,
                target_code: r.target_code,
                date: date,
                status: r.status,
                check_in_time: r.check_in_time,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }))}
          />
        )}

        {activeTab === 'matrix' && (
          <MonthlyAttendanceMatrix
            targetType={targetType}
            year={matrixYear}
            month={matrixMonth}
            classId={matrixClassId}
            classes={classes}
            matrixData={monthlyMatrix}
            onYearChange={setMatrixYear}
            onMonthChange={setMatrixMonth}
            onClassChange={setMatrixClassId}
            onExport={exportToCsv}
          />
        )}

        {activeTab === 'leaves' && (
          <LeaveManagementView
            targetType={targetType}
            applications={leaveApplications}
            canManageLeaves={permissions.canManageLeaves}
            filterStatus={leaveFilterStatus}
            onFilterStatusChange={setLeaveFilterStatus}
            onApplyLeave={applyLeave}
            onAction={handleLeaveAction}
            availableTargets={availableLeaveTargets}
          />
        )}
      </div>

      {/* Printable Report Modal */}
      <AttendanceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        date={date}
        targetType={targetType}
        rows={filteredRows}
        stats={stats}
        departmentName={selectedDeptObj?.name_bn}
        className={selectedClassObj?.name_bn}
      />

      {/* Smart TV Fullscreen Live Attendance Display */}
      <LiveTvDisplayModal
        isOpen={isTvModalOpen}
        onClose={() => setIsTvModalOpen(false)}
        stats={stats}
      />

      {/* Biometric and RFID Hardware Integration */}
      <BiometricDeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
};

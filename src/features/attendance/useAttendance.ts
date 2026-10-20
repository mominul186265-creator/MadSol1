import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { madsolDb } from '../../lib/db';
import {
  AttendanceStatus,
  AttendanceTargetType,
  DbAttendanceRecord,
  DbLeaveApplication,
  AttendanceStats,
  LeaveType,
  LeaveStatus,
} from '../../types/step4';
import { DbStudent, DbDepartment, DbClass, DbSection } from '../../types/step2';
import { DbTeacher } from '../../types/step3';

export interface AttendanceTargetRow {
  target_id: string;
  target_type: AttendanceTargetType;
  target_name_bn: string;
  target_name_en: string;
  target_code: string;
  department_id?: string;
  department_name_bn?: string;
  class_id?: string;
  class_name_bn?: string;
  section_id?: string;
  section_name_bn?: string;
  status: AttendanceStatus;
  check_in_time: string;
  check_out_time: string;
  remarks: string;
  record_id?: string;
  is_dirty?: boolean;
}

export function useAttendance() {
  const { user, institution, hasPermission } = useAuth();
  const { showToast } = useToast();
  const currentInstitutionId = institution?.id || user?.institution_id || 'inst-001';

  // Core filter state
  const [targetType, setTargetType] = useState<AttendanceTargetType>('student');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [classId, setClassId] = useState<string>('all');
  const [sectionId, setSectionId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Target rows & draft states
  const [targetRows, setTargetRows] = useState<AttendanceTargetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Meta data
  const [departments, setDepartments] = useState<DbDepartment[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);

  // Leaves
  const [leaveApplications, setLeaveApplications] = useState<DbLeaveApplication[]>([]);
  const [leaveFilterStatus, setLeaveFilterStatus] = useState<LeaveStatus | 'all'>('all');
  const [isApplyingLeave, setIsApplyingLeave] = useState<boolean>(false);

  // Monthly Matrix
  const today = new Date();
  const [matrixYear, setMatrixYear] = useState<number>(today.getFullYear());
  const [matrixMonth, setMatrixMonth] = useState<number>(today.getMonth() + 1);
  const [matrixClassId, setMatrixClassId] = useState<string>('all');
  const [monthlyMatrix, setMonthlyMatrix] = useState<any>(null);

  // User permissions
  const roleSlug = user?.role_id;
  const isSuperAdmin = roleSlug === 'super_admin';
  const isInstAdmin = roleSlug === 'institution_admin';
  const isPrincipal = roleSlug === 'principal';
  const isTeacher = roleSlug === 'teacher';
  const isAccountant = roleSlug === 'accountant';
  const isGuardian = roleSlug === 'guardian';
  const isStudent = roleSlug === 'student';

  const permissions = useMemo(() => {
    const canView =
      hasPermission('attendance.view') ||
      isSuperAdmin ||
      isInstAdmin ||
      isPrincipal ||
      isTeacher ||
      isAccountant ||
      isGuardian ||
      isStudent;
    const canRecord =
      hasPermission('attendance.record') || isSuperAdmin || isInstAdmin || isPrincipal || isTeacher;
    const canEdit = hasPermission('attendance.edit') || isSuperAdmin || isInstAdmin || isPrincipal;
    const canExport =
      hasPermission('attendance.export') ||
      isSuperAdmin ||
      isInstAdmin ||
      isPrincipal ||
      isTeacher ||
      isAccountant;
    const canManageLeaves =
      hasPermission('attendance.leave_manage') || isSuperAdmin || isInstAdmin || isPrincipal;

    return {
      canView,
      canRecord,
      canEdit,
      canExport,
      canManageLeaves,
    };
  }, [hasPermission, isSuperAdmin, isInstAdmin, isPrincipal, isTeacher, isAccountant, isGuardian, isStudent]);

  // Load structural data
  useEffect(() => {
    const depts = madsolDb.getDepartments(currentInstitutionId);
    const cls = madsolDb.getClasses(currentInstitutionId);
    const secs = madsolDb.getSections(currentInstitutionId);
    setDepartments(depts);
    setClasses(cls);
    setSections(secs);
  }, [currentInstitutionId]);

  // Load attendance data for current day & targets
  const loadAttendance = useCallback(() => {
    setIsLoading(true);
    try {
      const depts = madsolDb.getDepartments(currentInstitutionId);
      const cls = madsolDb.getClasses(currentInstitutionId);
      const secs = madsolDb.getSections(currentInstitutionId);

      // Existing recorded attendance records
      const { records: existingRecords } = madsolDb.getAttendanceRecords(currentInstitutionId, {
        target_type: targetType,
        date: date,
      });

      const recordsMap = new Map<string, DbAttendanceRecord>();
      existingRecords.forEach((r) => {
        recordsMap.set(r.target_id, r);
      });

      let rows: AttendanceTargetRow[] = [];

      if (targetType === 'student') {
        const students = madsolDb
          .getAllStudentsList(currentInstitutionId)
          .filter((s) => !s.deleted_at && s.status !== 'inactive');

        rows = students.map((s) => {
          const rec = recordsMap.get(s.id);
          const dept = depts.find((d) => d.id === s.department_id);
          const c = cls.find((cl) => cl.id === s.class_id);
          const sec = secs.find((sc) => sc.id === s.section_id);

          return {
            target_id: s.id,
            target_type: 'student',
            target_name_bn: s.full_name_bn,
            target_name_en: s.full_name_en,
            target_code: s.roll_number || s.student_id,
            department_id: s.department_id,
            department_name_bn: dept?.name_bn || 'সাধারণ',
            class_id: s.class_id,
            class_name_bn: c?.name_bn || '',
            section_id: s.section_id,
            section_name_bn: sec?.name_bn || '',
            status: rec ? rec.status : 'present',
            check_in_time: rec?.check_in_time || '08:00',
            check_out_time: rec?.check_out_time || '',
            remarks: rec?.remarks || '',
            record_id: rec?.id,
            is_dirty: false,
          };
        });
      } else {
        const teachers = madsolDb
          .getAllTeachersList(currentInstitutionId)
          .filter((t) => !t.deleted_at && t.employment_status === 'active');

        rows = teachers.map((t) => {
          const rec = recordsMap.get(t.id);
          const dept = depts.find((d) => d.id === t.department_id);

          return {
            target_id: t.id,
            target_type: 'teacher',
            target_name_bn: t.full_name_bn,
            target_name_en: t.full_name_en,
            target_code: t.teacher_id,
            department_id: t.department_id,
            department_name_bn: dept?.name_bn || 'সাধারণ শিক্ষক',
            status: rec ? rec.status : 'present',
            check_in_time: rec?.check_in_time || '07:45',
            check_out_time: rec?.check_out_time || '',
            remarks: rec?.remarks || '',
            record_id: rec?.id,
            is_dirty: false,
          };
        });
      }

      setTargetRows(rows);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      showToast('হাজিরা তথ্য লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentInstitutionId, targetType, date, showToast]);

  // Load leave applications
  const loadLeaves = useCallback(() => {
    try {
      const apps = madsolDb.getLeaveApplications(currentInstitutionId, {
        status: leaveFilterStatus,
        targetType: targetType,
      });
      setLeaveApplications(apps);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    }
  }, [currentInstitutionId, leaveFilterStatus, targetType]);

  // Load monthly matrix
  const loadMonthlyMatrix = useCallback(() => {
    try {
      const matrix = madsolDb.getMonthlyAttendanceMatrix(
        currentInstitutionId,
        targetType,
        matrixYear,
        matrixMonth,
        matrixClassId !== 'all' ? matrixClassId : undefined
      );
      setMonthlyMatrix(matrix);
    } catch (error) {
      console.error('Failed to load monthly matrix:', error);
    }
  }, [currentInstitutionId, targetType, matrixYear, matrixMonth, matrixClassId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  useEffect(() => {
    loadMonthlyMatrix();
  }, [loadMonthlyMatrix]);

  // Filtered rows for UI presentation
  const filteredRows = useMemo(() => {
    return targetRows.filter((r) => {
      if (departmentId !== 'all' && r.department_id !== departmentId) return false;
      if (classId !== 'all' && r.class_id !== classId) return false;
      if (sectionId !== 'all' && r.section_id !== sectionId) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName =
          r.target_name_bn.toLowerCase().includes(q) ||
          r.target_name_en.toLowerCase().includes(q) ||
          r.target_code.toLowerCase().includes(q) ||
          r.remarks.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      return true;
    });
  }, [targetRows, departmentId, classId, sectionId, statusFilter, searchQuery]);

  // Dynamic calculated stats based on current filtered/active rows
  const stats = useMemo<AttendanceStats>(() => {
    const total = filteredRows.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    filteredRows.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'leave') leave++;
    });

    const attendance_percentage =
      total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0;

    return {
      total,
      present,
      absent,
      late,
      leave,
      attendance_percentage,
      total_count: total,
      present_count: present,
      absent_count: absent,
      late_count: late,
      leave_count: leave,
    };
  }, [filteredRows]);

  // Has unsaved changes?
  const hasUnsavedChanges = useMemo(() => {
    return targetRows.some((r) => r.is_dirty);
  }, [targetRows]);

  // Update target row draft status
  const updateTargetStatus = useCallback(
    (targetId: string, status: AttendanceStatus, checkInTime?: string) => {
      setTargetRows((prev) =>
        prev.map((row) => {
          if (row.target_id === targetId) {
            const time =
              checkInTime !== undefined
                ? checkInTime
                : status === 'present' || status === 'late'
                ? row.check_in_time || '08:00'
                : '';
            return {
              ...row,
              status,
              check_in_time: time,
              is_dirty: true,
            };
          }
          return row;
        })
      );
    },
    []
  );

  // Update target row details (remarks, checkInTime, etc.)
  const updateTargetDetails = useCallback((targetId: string, updates: Partial<AttendanceTargetRow>) => {
    setTargetRows((prev) =>
      prev.map((row) => {
        if (row.target_id === targetId) {
          return {
            ...row,
            ...updates,
            is_dirty: true,
          };
        }
        return row;
      })
    );
  }, []);

  // Mark all visible targets with a given status
  const markAllVisible = useCallback(
    (status: AttendanceStatus) => {
      const visibleIds = new Set(filteredRows.map((r) => r.target_id));
      setTargetRows((prev) =>
        prev.map((row) => {
          if (visibleIds.has(row.target_id)) {
            return {
              ...row,
              status,
              check_in_time: status === 'present' || status === 'late' ? row.check_in_time || '08:00' : '',
              is_dirty: true,
            };
          }
          return row;
        })
      );
      showToast(
        `দৃশ্যমান ${visibleIds.size} জনকে '${status === 'present' ? 'উপস্থিত' : status === 'absent' ? 'অনুপস্থিত' : status}' মার্ক করা হয়েছে। সংরক্ষণে ক্লিক করুন।`,
        'info'
      );
    },
    [filteredRows, showToast]
  );

  // Save attendance batch
  const saveAttendanceBatch = useCallback(async () => {
    if (!permissions.canRecord) {
      showToast('আপনার হাজিরা সংরক্ষণ করার অনুমতি নেই।', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const recordsToSave = targetRows.map((r) => ({
        target_type: r.target_type,
        target_id: r.target_id,
        target_name_bn: r.target_name_bn,
        target_name_en: r.target_name_en,
        target_code: r.target_code,
        date: date,
        status: r.status,
        check_in_time: r.check_in_time,
        check_out_time: r.check_out_time,
        department_id: r.department_id,
        class_id: r.class_id,
        section_id: r.section_id,
        remarks: r.remarks,
      }));

      const res = madsolDb.saveBatchAttendance(
        currentInstitutionId,
        recordsToSave,
        user?.id || 'admin'
      );

      if (res.success) {
        showToast(
          `${date} তারিখের ${recordsToSave.length} জন ${targetType === 'student' ? 'শিক্ষার্থী' : 'শিক্ষকের'} হাজিরা সফলভাবে সংরক্ষিত হয়েছে।`,
          'success'
        );
        // Reset dirty flag
        setTargetRows((prev) => prev.map((r) => ({ ...r, is_dirty: false })));
        // Refresh stats & matrix
        loadMonthlyMatrix();
      }
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      showToast(error?.message || 'হাজিরা সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [
    permissions.canRecord,
    targetRows,
    date,
    targetType,
    currentInstitutionId,
    user?.id,
    showToast,
    loadMonthlyMatrix,
  ]);

  // Digital / QR check-in
  const recordQrCheckIn = useCallback(
    (idOrCode: string) => {
      try {
        const result = madsolDb.recordQrAttendance(
          currentInstitutionId,
          targetType,
          idOrCode,
          user?.id || 'admin'
        );

        if (result.success && result.record) {
          showToast(`✅ ${result.message}`, 'success');
          // Update in rows
          setTargetRows((prev) =>
            prev.map((row) => {
              if (row.target_id === result.record!.target_id) {
                return {
                  ...row,
                  status: result.record!.status,
                  check_in_time: result.record!.check_in_time || '08:00',
                  remarks: result.record!.remarks || '',
                  is_dirty: false,
                };
              }
              return row;
            })
          );
          loadMonthlyMatrix();
          return result;
        } else {
          showToast(`⚠️ ${result.message}`, 'warning');
          return result;
        }
      } catch (err: any) {
        showToast(err?.message || 'স্ক্যান ত্রুটি', 'error');
        return { success: false, message: err?.message || 'স্ক্যান ত্রুটি' };
      }
    },
    [currentInstitutionId, targetType, user?.id, showToast, loadMonthlyMatrix]
  );

  // Apply leave application
  const applyLeave = useCallback(
    (data: {
      target_id: string;
      leave_type: LeaveType;
      start_date: string;
      end_date: string;
      total_days: number;
      reason: string;
    }) => {
      setIsApplyingLeave(true);
      try {
        let nameBn = '';
        let nameEn = '';
        let code = '';

        if (targetType === 'student') {
          const s = madsolDb.getStudentById(data.target_id);
          nameBn = s?.full_name_bn || '';
          nameEn = s?.full_name_en || '';
          code = s?.roll_number || s?.student_id || '';
        } else {
          const t = madsolDb.getTeacherById(data.target_id);
          nameBn = t?.full_name_bn || '';
          nameEn = t?.full_name_en || '';
          code = t?.teacher_id || '';
        }

        const newApp = madsolDb.createLeaveApplication(currentInstitutionId, {
          target_type: targetType,
          target_id: data.target_id,
          target_name_bn: nameBn,
          target_name_en: nameEn,
          target_code: code,
          leave_type: data.leave_type,
          start_date: data.start_date,
          end_date: data.end_date,
          total_days: data.total_days,
          reason: data.reason,
        });

        showToast('ছুটির আবেদন সফলভাবে দাখিল করা হয়েছে।', 'success');
        loadLeaves();
        return newApp;
      } catch (error: any) {
        showToast(error?.message || 'আবেদন সম্পন্ন করা যায়নি', 'error');
        return null;
      } finally {
        setIsApplyingLeave(false);
      }
    },
    [currentInstitutionId, targetType, showToast, loadLeaves]
  );

  // Approve or reject leave
  const handleLeaveAction = useCallback(
    (leaveId: string, status: LeaveStatus, remarks?: string) => {
      if (!permissions.canManageLeaves) {
        showToast('ছুটি অনুমোদন বা বাতিল করার অনুমতি নেই।', 'error');
        return;
      }

      try {
        madsolDb.updateLeaveApplicationStatus(
          currentInstitutionId,
          leaveId,
          status,
          user?.id || 'admin',
          remarks
        );

        showToast(
          `ছুটির আবেদন ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} করা হয়েছে।`,
          status === 'approved' ? 'success' : 'info'
        );
        loadLeaves();
        loadAttendance();
        loadMonthlyMatrix();
      } catch (error: any) {
        showToast(error?.message || 'পদক্ষেপ গ্রহণে সমস্যা হয়েছে', 'error');
      }
    },
    [
      permissions.canManageLeaves,
      currentInstitutionId,
      user?.id,
      showToast,
      loadLeaves,
      loadAttendance,
      loadMonthlyMatrix,
    ]
  );

  // Export filtered rows to CSV
  const exportToCsv = useCallback(() => {
    if (filteredRows.length === 0) {
      showToast('এক্সপোর্ট করার মতো কোনো ডাটা নেই।', 'warning');
      return;
    }

    const headers = [
      'তারিখ',
      'আইডি/রোল',
      'নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'ধরন',
      'বিভাগ',
      'শ্রেণি',
      'শাখা',
      'উপস্থিতি স্ট্যাটাস',
      'প্রবেশ সময়',
      'প্রস্থান সময়',
      'মন্তব্য',
    ];

    const rows = filteredRows.map((r) => [
      date,
      r.target_code,
      `"${r.target_name_bn.replace(/"/g, '""')}"`,
      `"${r.target_name_en.replace(/"/g, '""')}"`,
      r.target_type === 'student' ? 'শিক্ষার্থী' : 'শিক্ষক',
      `"${(r.department_name_bn || '').replace(/"/g, '""')}"`,
      `"${(r.class_name_bn || '').replace(/"/g, '""')}"`,
      `"${(r.section_name_bn || '').replace(/"/g, '""')}"`,
      r.status === 'present'
        ? 'উপস্থিত'
        : r.status === 'absent'
        ? 'অনুপস্থিত'
        : r.status === 'late'
        ? 'বিলম্ব'
        : 'ছুটি',
      r.check_in_time || '-',
      r.check_out_time || '-',
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `attendance_${targetType}_${date}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('হাজিরা তালিকা CSV ফাইল হিসেবে ডাউনলোড সম্পন্ন হয়েছে।', 'success');
  }, [filteredRows, date, targetType, showToast]);

  return {
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
    saveAttendanceBatch,
    recordQrCheckIn,
    leaveApplications,
    leaveFilterStatus,
    setLeaveFilterStatus,
    isApplyingLeave,
    applyLeave,
    handleLeaveAction,
    matrixYear,
    setMatrixYear,
    matrixMonth,
    setMatrixMonth,
    matrixClassId,
    setMatrixClassId,
    monthlyMatrix,
    loadMonthlyMatrix,
    refreshAttendance: loadAttendance,
    refreshLeaves: loadLeaves,
    exportToCsv,
  };
}

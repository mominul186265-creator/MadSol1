import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { madsolDb } from '../../lib/db';
import {
  DbStudent,
  DbDepartment,
  DbClass,
  DbSection,
  DbStudentDocument,
  DbStudentActivity,
  StudentFilterOptions,
  StudentStatus,
  StudentStats,
} from '../../types/step2';

export function useStudents(initialFilters?: StudentFilterOptions) {
  const { user, institution, hasPermission } = useAuth();
  const currentInstitutionId = institution?.id || user?.institution_id || 'inst-001';

  const [filters, setFilters] = useState<StudentFilterOptions>(
    initialFilters || {
      search: '',
      department_id: 'all',
      class_id: 'all',
      section_id: 'all',
      academic_session: 'all',
      gender: 'all',
      status: 'all',
      sortBy: 'admission_date',
      sortOrder: 'desc',
      page: 1,
      pageSize: 15,
    }
  );

  const [students, setStudents] = useState<DbStudent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    on_leave: 0,
    transferred: 0,
    graduated: 0,
  });

  const [departments, setDepartments] = useState<DbDepartment[]>([]);
  const [classes, setClasses] = useState<DbClass[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Role Permissions
  const roleSlug = user?.role_id;
  const isSuperAdmin = roleSlug === 'super_admin';
  const isInstAdmin = roleSlug === 'institution_admin';
  const isPrincipal = roleSlug === 'principal';
  const isTeacher = roleSlug === 'teacher';
  const isAccountant = roleSlug === 'accountant';
  const isGuardian = roleSlug === 'guardian';
  const isStudentRole = roleSlug === 'student';

  const permissions = useMemo(() => {
    return {
      canView: hasPermission('students.view') || isSuperAdmin || isInstAdmin || isPrincipal || isTeacher || isAccountant,
      canCreate: hasPermission('students.create') || isSuperAdmin || isInstAdmin || isPrincipal,
      canEdit: hasPermission('students.edit') || isSuperAdmin || isInstAdmin || isPrincipal,
      canChangeStatus: hasPermission('students.status') || isSuperAdmin || isInstAdmin,
      canDelete: hasPermission('students.delete') || isSuperAdmin || isInstAdmin,
      canExport: hasPermission('students.export') || isSuperAdmin || isInstAdmin || isPrincipal,
      canManageDocs: hasPermission('students.documents') || isSuperAdmin || isInstAdmin || isPrincipal,
      isLimitedView: isTeacher || isAccountant || isGuardian || isStudentRole,
    };
  }, [hasPermission, isSuperAdmin, isInstAdmin, isPrincipal, isTeacher, isAccountant, isGuardian, isStudentRole]);

  // Load students and meta
  const refresh = useCallback(() => {
    if (!currentInstitutionId) return;
    setIsLoading(true);

    try {
      // Fetch stats directly from DB
      const currentStats = madsolDb.getStudentStats(currentInstitutionId);
      setStats(currentStats);

      // Fetch academic meta
      const deptList = madsolDb.getDepartments(currentInstitutionId);
      setDepartments(deptList);

      const classList = madsolDb.getClasses(currentInstitutionId);
      setClasses(classList);

      const sectionList = madsolDb.getSections(currentInstitutionId);
      setSections(sectionList);

      // Fetch students with filter & pagination
      const result = madsolDb.getStudents(currentInstitutionId, filters);
      setStudents(result.students);
      setTotalCount(result.total);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentInstitutionId, filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Helper actions
  const getNextId = useCallback(
    (session: string = '2026') => {
      return madsolDb.generateNextStudentId(currentInstitutionId, session);
    },
    [currentInstitutionId]
  );

  const checkIdUnique = useCallback((studentId: string, excludeId?: string) => {
    return madsolDb.checkStudentIdUnique(studentId, excludeId);
  }, []);

  const checkRollUnique = useCallback(
    (classId: string, session: string, roll: string, excludeId?: string) => {
      return madsolDb.checkRollUnique(currentInstitutionId, classId, session, roll, excludeId);
    },
    [currentInstitutionId]
  );

  const createStudent = useCallback(
    async (data: Omit<DbStudent, 'id' | 'institution_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by'>) => {
      if (!permissions.canCreate) {
        throw new Error('আপনার নতুন শিক্ষার্থী যোগ করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const newStudent = madsolDb.createStudent(
        {
          ...data,
          institution_id: currentInstitutionId,
          created_by: actor.id,
        },
        actor
      );

      refresh();
      return newStudent;
    },
    [currentInstitutionId, permissions.canCreate, refresh, user]
  );

  const updateStudent = useCallback(
    async (id: string, updates: Partial<Omit<DbStudent, 'id' | 'institution_id' | 'created_at'>>) => {
      if (!permissions.canEdit) {
        throw new Error('আপনার শিক্ষার্থী তথ্য সম্পাদনা করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const updated = madsolDb.updateStudent(id, updates, actor);
      if (!updated) {
        throw new Error('শিক্ষার্থী খুঁজে পাওয়া যায়নি');
      }

      refresh();
      return updated;
    },
    [permissions.canEdit, refresh, user]
  );

  const changeStatus = useCallback(
    async (id: string, newStatus: StudentStatus, reason?: string) => {
      if (!permissions.canChangeStatus) {
        throw new Error('আপনার শিক্ষার্থীর স্ট্যাটাস পরিবর্তন করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const res = madsolDb.changeStudentStatus(id, newStatus, reason, actor);
      refresh();
      return res;
    },
    [permissions.canChangeStatus, refresh, user]
  );

  const softDeleteStudent = useCallback(
    async (id: string) => {
      if (!permissions.canDelete) {
        throw new Error('আপনার শিক্ষার্থী ডিলিট করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const res = madsolDb.softDeleteStudent(id, actor);
      refresh();
      return res;
    },
    [permissions.canDelete, refresh, user]
  );

  // Documents
  const getDocuments = useCallback(
    (studentId: string) => {
      return madsolDb.getStudentDocuments(studentId, currentInstitutionId);
    },
    [currentInstitutionId]
  );

  const addDocument = useCallback(
    async (doc: Omit<DbStudentDocument, 'id' | 'institution_id' | 'created_at'>) => {
      if (!permissions.canManageDocs) {
        throw new Error('ডকুমেন্ট আপলোড করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.addStudentDocument(
        {
          ...doc,
          institution_id: currentInstitutionId,
        },
        actor
      );
      return res;
    },
    [currentInstitutionId, permissions.canManageDocs, user]
  );

  const deleteDocument = useCallback(
    async (docId: string, studentId: string) => {
      if (!permissions.canManageDocs) {
        throw new Error('ডকুমেন্ট মুছে ফেলার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      return madsolDb.deleteStudentDocument(docId, studentId, actor);
    },
    [permissions.canManageDocs, user]
  );

  // Activities
  const getActivities = useCallback(
    (studentId: string) => {
      return madsolDb.getStudentActivities(studentId, currentInstitutionId);
    },
    [currentInstitutionId]
  );

  // CSV Export utility
  const exportToCsv = useCallback((studentList?: DbStudent[]) => {
    const listToExport = studentList || students;
    if (listToExport.length === 0) {
      alert('রপ্তানি করার জন্য কোনো শিক্ষার্থী তথ্য পাওয়া যায়নি।');
      return;
    }

    const headers = [
      'Student ID',
      'Roll',
      'Full Name (Bangla)',
      'Full Name (English)',
      'Academic Session',
      'Gender',
      'Blood Group',
      'Mobile',
      'Father Name',
      'Mother Name',
      'Emergency Contact Name',
      'Emergency Mobile',
      'Relationship',
      'Status',
      'Admission Date',
    ];

    const rows = listToExport.map((s) => [
      `"${s.student_id}"`,
      `"${s.roll_number}"`,
      `"${s.full_name_bn.replace(/"/g, '""')}"`,
      `"${s.full_name_en.replace(/"/g, '""')}"`,
      `"${s.academic_session}"`,
      `"${s.gender}"`,
      `"${s.blood_group || ''}"`,
      `"${s.mobile || ''}"`,
      `"${s.father_name.replace(/"/g, '""')}"`,
      `"${s.mother_name.replace(/"/g, '""')}"`,
      `"${s.emergency_contact_name.replace(/"/g, '""')}"`,
      `"${s.emergency_mobile || ''}"`,
      `"${s.emergency_relationship}"`,
      `"${s.status}"`,
      `"${s.admission_date}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `madsol_students_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [students]);

  return {
    students,
    totalCount,
    stats,
    departments,
    classes,
    sections,
    filters,
    setFilters,
    isLoading,
    permissions,
    refresh,
    getNextId,
    getNextStudentId: getNextId,
    checkIdUnique,
    isStudentIdUnique: checkIdUnique,
    checkRollUnique,
    isRollUnique: checkRollUnique,
    createStudent,
    updateStudent,
    changeStatus,
    changeStudentStatus: changeStatus,
    softDeleteStudent,
    deleteStudent: softDeleteStudent,
    getDocuments,
    getStudentDocuments: getDocuments,
    addDocument,
    addStudentDocument: addDocument,
    deleteDocument,
    deleteStudentDocument: deleteDocument,
    getActivities,
    getStudentActivities: getActivities,
    exportToCsv,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { madsolDb } from '../../lib/db';
import {
  DbTeacher,
  DbTeacherDesignation,
  DbTeacherQualification,
  DbTeacherDocument,
  DbTeacherActivity,
  TeacherFilterOptions,
  TeacherStatus,
  TeacherStats,
} from '../../types/step3';
import { DbDepartment } from '../../types/step2';
import { DbUser } from '../../types/step1';
import { RoleSlug } from '../../types/step1';

export function useTeachers(initialFilters?: TeacherFilterOptions) {
  const { user, institution, hasPermission } = useAuth();
  const currentInstitutionId = institution?.id || user?.institution_id || 'inst-001';

  const [filters, setFilters] = useState<TeacherFilterOptions>(
    initialFilters || {
      search: '',
      designation_id: 'all',
      department_id: 'all',
      employment_type: 'all',
      employment_status: 'all',
      status: 'all',
      gender: 'all',
      sortBy: 'joining_date',
      sortOrder: 'desc',
      page: 1,
      pageSize: 15,
    }
  );

  const [teachers, setTeachers] = useState<DbTeacher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<TeacherStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    on_leave: 0,
    resigned: 0,
    terminated: 0,
    suspended: 0,
    retired: 0,
    left: 0,
  });

  const [designations, setDesignations] = useState<DbTeacherDesignation[]>([]);
  const [departments, setDepartments] = useState<DbDepartment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Role Permissions
  const roleSlug = user?.role_id;
  const isSuperAdmin = roleSlug === 'super_admin';
  const isInstAdmin = roleSlug === 'institution_admin';
  const isPrincipal = roleSlug === 'principal';
  const isTeacher = roleSlug === 'teacher';
  const isAccountant = roleSlug === 'accountant';

  const permissions = useMemo(() => {
    return {
      canView: hasPermission('teachers.view') || isSuperAdmin || isInstAdmin || isPrincipal || isTeacher || isAccountant,
      canCreate: hasPermission('teachers.create') || isSuperAdmin || isInstAdmin || isPrincipal,
      canEdit: hasPermission('teachers.edit') || isSuperAdmin || isInstAdmin || isPrincipal,
      canChangeStatus: hasPermission('teachers.status') || isSuperAdmin || isInstAdmin || isPrincipal,
      canDelete: hasPermission('teachers.delete') || isSuperAdmin || isInstAdmin,
      canExport: hasPermission('teachers.export') || isSuperAdmin || isInstAdmin || isPrincipal,
      canManageDocs: hasPermission('teachers.documents') || isSuperAdmin || isInstAdmin || isPrincipal,
      canLinkAccount: hasPermission('teachers.account') || isSuperAdmin || isInstAdmin,
      isReadOnly: isTeacher || isAccountant,
    };
  }, [hasPermission, isSuperAdmin, isInstAdmin, isPrincipal, isTeacher, isAccountant]);

  // Load teachers and metadata
  const refresh = useCallback(() => {
    if (!currentInstitutionId) return;
    setIsLoading(true);

    try {
      // Fetch stats from DB
      const currentStats = madsolDb.getTeacherStats(currentInstitutionId);
      setStats(currentStats);

      // Fetch metadata
      const desigList = madsolDb.getTeacherDesignations();
      setDesignations(desigList);

      const deptList = madsolDb.getDepartments(currentInstitutionId);
      setDepartments(deptList);

      // Fetch filtered teachers
      const result = madsolDb.getTeachers(currentInstitutionId, filters);
      setTeachers(result.teachers);
      setTotalCount(result.total);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentInstitutionId, filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Helper actions
  const getNextId = useCallback(
    (year: string = '2026') => {
      return madsolDb.generateNextTeacherId(currentInstitutionId, year);
    },
    [currentInstitutionId]
  );

  const checkIdUnique = useCallback((teacherId: string, excludeId?: string) => {
    return madsolDb.checkTeacherIdUnique(teacherId, excludeId);
  }, []);

  const createTeacher = useCallback(
    async (
      data: Omit<DbTeacher, 'id' | 'institution_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by'>
    ) => {
      if (!permissions.canCreate) {
        throw new Error('আপনার নতুন শিক্ষক যোগ করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const newTeacher = madsolDb.createTeacher(
        {
          ...data,
          institution_id: currentInstitutionId,
          created_by: actor.id,
        },
        actor
      );

      refresh();
      return newTeacher;
    },
    [currentInstitutionId, permissions.canCreate, refresh, user]
  );

  const updateTeacher = useCallback(
    async (id: string, updates: Partial<Omit<DbTeacher, 'id' | 'institution_id' | 'created_at'>>) => {
      if (!permissions.canEdit) {
        throw new Error('আপনার শিক্ষক তথ্য সম্পাদনা করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const updated = madsolDb.updateTeacher(id, updates, actor);
      if (!updated) {
        throw new Error('শিক্ষক খুঁজে পাওয়া যায়নি');
      }

      refresh();
      return updated;
    },
    [permissions.canEdit, refresh, user]
  );

  const changeStatus = useCallback(
    async (id: string, newStatus: TeacherStatus, reason?: string) => {
      if (!permissions.canChangeStatus) {
        throw new Error('আপনার শিক্ষকের স্ট্যাটাস পরিবর্তন করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const res = madsolDb.changeTeacherStatus(id, newStatus, reason, actor);
      refresh();
      return res;
    },
    [permissions.canChangeStatus, refresh, user]
  );

  const softDeleteTeacher = useCallback(
    async (id: string) => {
      if (!permissions.canDelete) {
        throw new Error('আপনার শিক্ষক ডিলিট করার অনুমতি নেই। (Unauthorized)');
      }

      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };

      const res = madsolDb.softDeleteTeacher(id, actor);
      refresh();
      return res;
    },
    [permissions.canDelete, refresh, user]
  );

  // Qualifications
  const getQualifications = useCallback(
    (teacherId: string) => {
      return madsolDb.getTeacherQualifications(teacherId, currentInstitutionId);
    },
    [currentInstitutionId]
  );

  const addQualification = useCallback(
    async (qual: Omit<DbTeacherQualification, 'id' | 'institution_id' | 'created_at' | 'updated_at'>) => {
      if (!permissions.canEdit) {
        throw new Error('যোগ্যতা যোগ করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.addTeacherQualification(
        {
          ...qual,
          institution_id: currentInstitutionId,
        },
        actor
      );
      return res;
    },
    [currentInstitutionId, permissions.canEdit, user]
  );

  const deleteQualification = useCallback(
    async (id: string, teacherId: string) => {
      if (!permissions.canEdit) {
        throw new Error('যোগ্যতা মুছে ফেলার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      return madsolDb.deleteTeacherQualification(id, teacherId, actor);
    },
    [permissions.canEdit, user]
  );

  // Documents
  const getDocuments = useCallback(
    (teacherId: string) => {
      return madsolDb.getTeacherDocuments(teacherId, currentInstitutionId);
    },
    [currentInstitutionId]
  );

  const addDocument = useCallback(
    async (doc: Omit<DbTeacherDocument, 'id' | 'institution_id' | 'created_at'>) => {
      if (!permissions.canManageDocs) {
        throw new Error('ডকুমেন্ট আপলোড করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.addTeacherDocument(
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
    async (docId: string, teacherId: string) => {
      if (!permissions.canManageDocs) {
        throw new Error('ডকুমেন্ট মুছে ফেলার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      return madsolDb.deleteTeacherDocument(docId, teacherId, actor);
    },
    [permissions.canManageDocs, user]
  );

  // Activities
  const getActivities = useCallback(
    (teacherId: string) => {
      return madsolDb.getTeacherActivities(teacherId, currentInstitutionId);
    },
    [currentInstitutionId]
  );

  // User Account Connection
  const getAvailableUsers = useCallback(
    (currentTeacherId?: string): DbUser[] => {
      return madsolDb.getAvailableUsersForTeacher(currentInstitutionId, currentTeacherId);
    },
    [currentInstitutionId]
  );

  const connectUserAccount = useCallback(
    async (teacherId: string, userId: string) => {
      if (!permissions.canLinkAccount) {
        throw new Error('ইউজার অ্যাকাউন্ট সংযুক্ত করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.connectTeacherUserAccount(teacherId, userId, actor);
      refresh();
      return res;
    },
    [permissions.canLinkAccount, refresh, user]
  );

  const disconnectUserAccount = useCallback(
    async (teacherId: string) => {
      if (!permissions.canLinkAccount) {
        throw new Error('ইউজার অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.disconnectTeacherUserAccount(teacherId, actor);
      refresh();
      return res;
    },
    [permissions.canLinkAccount, refresh, user]
  );

  const createAndConnectUserAccount = useCallback(
    async (
      teacherId: string,
      params: { name: string; email: string; mobile: string; password: string; role_id: RoleSlug }
    ) => {
      if (!permissions.canLinkAccount) {
        throw new Error('নতুন ইউজার অ্যাকাউন্ট তৈরি করার অনুমতি নেই');
      }
      const actor = {
        id: user?.id || 'usr-system',
        name: user?.name || 'System User',
      };
      const res = madsolDb.createAndConnectTeacherUserAccount(teacherId, params, actor);
      refresh();
      return res;
    },
    [permissions.canLinkAccount, refresh, user]
  );

  // Export Teachers to CSV
  const exportToCsv = useCallback(
    (teacherList?: DbTeacher[]) => {
      const listToExport = teacherList || teachers;
      if (listToExport.length === 0) {
        alert('রপ্তানি করার জন্য কোনো শিক্ষকের তথ্য পাওয়া যায়নি।');
        return;
      }

      const headers = [
        'Teacher ID',
        'Full Name (Bangla)',
        'Full Name (English)',
        'Gender',
        'Blood Group',
        'Primary Mobile',
        'Alternative Mobile',
        'Email',
        'Designation',
        'Department',
        'Joining Date',
        'Employment Type',
        'Status',
        'Highest Qualification',
        'Specialization',
        'Experience (Years)',
        'Emergency Contact Name',
        'Emergency Mobile',
      ];

      const rows = listToExport.map((t) => {
        const desig = designations.find((d) => d.id === t.designation_id)?.name_bn || t.designation_id;
        const dept = departments.find((d) => d.id === t.department_id)?.name_bn || t.department_id;

        return [
          `"${t.teacher_id}"`,
          `"${t.full_name_bn.replace(/"/g, '""')}"`,
          `"${t.full_name_en.replace(/"/g, '""')}"`,
          `"${t.gender}"`,
          `"${t.blood_group || ''}"`,
          `"${t.primary_mobile}"`,
          `"${t.alternative_mobile || ''}"`,
          `"${t.email || ''}"`,
          `"${desig}"`,
          `"${dept}"`,
          `"${t.joining_date}"`,
          `"${t.employment_type}"`,
          `"${t.employment_status}"`,
          `"${(t.highest_qualification || '').replace(/"/g, '""')}"`,
          `"${(t.specialization || '').replace(/"/g, '""')}"`,
          `"${t.experience_years || 0}"`,
          `"${(t.emergency_contact_name || '').replace(/"/g, '""')}"`,
          `"${t.emergency_mobile || ''}"`,
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `madsol_teachers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [teachers, designations, departments]
  );

  return {
    teachers,
    totalCount,
    stats,
    designations,
    departments,
    filters,
    setFilters,
    isLoading,
    permissions,
    refresh,
    getNextId,
    getNextTeacherId: getNextId,
    checkIdUnique,
    isTeacherIdUnique: checkIdUnique,
    createTeacher,
    updateTeacher,
    changeStatus,
    changeTeacherStatus: changeStatus,
    softDeleteTeacher,
    deleteTeacher: softDeleteTeacher,
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
    exportToCsv,
  };
}

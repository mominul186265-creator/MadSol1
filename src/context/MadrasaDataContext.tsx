import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Guardian,
  AdmissionRequest,
  StudentDocument,
  StudentStatus,
  HeaderNotificationItem,
  ActivityLog,
} from '../types';
import { INITIAL_STUDENTS, INITIAL_GUARDIANS, INITIAL_ADMISSIONS, INITIAL_DOCUMENTS } from '../data/studentData';
import { INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS } from '../data/initialData';
import { useAuth } from './AuthContext';
import { madsolDb } from '../lib/db';

interface MadrasaDataContextType {
  students: Student[];
  guardians: Guardian[];
  admissions: AdmissionRequest[];
  documents: StudentDocument[];
  notifications: HeaderNotificationItem[];
  activityLogs: ActivityLog[];
  classes: any[];
  teachers: any[];
  
  // Scoped lists according to user's role & institution
  scopedStudents: Student[];
  scopedGuardians: Guardian[];
  scopedAdmissions: AdmissionRequest[];
  
  // Student operations
  addStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Student>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<boolean>;
  archiveStudent: (id: string, reason?: string) => Promise<boolean>;
  restoreStudent: (id: string) => Promise<boolean>;
  deleteStudentPermanent: (id: string) => Promise<boolean>;
  bulkArchiveStudents: (ids: string[]) => Promise<boolean>;
  bulkChangeStatus: (ids: string[], status: StudentStatus) => Promise<boolean>;
  generateNextStudentId: () => string;
  getStudentById: (id: string) => Student | undefined;

  // Guardian operations
  addGuardian: (data: Omit<Guardian, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Guardian>;
  updateGuardian: (id: string, updates: Partial<Guardian>) => Promise<boolean>;
  linkStudentToGuardian: (guardianId: string, studentId: string) => Promise<boolean>;
  getGuardianById: (id: string) => Guardian | undefined;

  // Online Admission operations
  submitOnlineAdmission: (
    data: Omit<AdmissionRequest, 'id' | 'applicationNumber' | 'status' | 'submittedAt'>
  ) => Promise<AdmissionRequest>;
  approveAdmission: (
    admissionId: string,
    options?: { roll?: string; section?: string; studentId?: string }
  ) => Promise<{ success: boolean; student?: Student }>;
  rejectAdmission: (admissionId: string, reason?: string) => Promise<boolean>;

  // Document operations
  addDocument: (doc: Omit<StudentDocument, 'id' | 'uploadedAt'>) => Promise<StudentDocument>;
  deleteDocument: (docId: string) => Promise<boolean>;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<HeaderNotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Export
  exportStudentsToCsv: (studentsToExport?: Student[]) => void;
}

const MadrasaDataContext = createContext<MadrasaDataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_STUDENTS = 'madsol_data_students_v2';
const LOCAL_STORAGE_KEY_GUARDIANS = 'madsol_data_guardians_v2';
const LOCAL_STORAGE_KEY_ADMISSIONS = 'madsol_data_admissions_v2';
const LOCAL_STORAGE_KEY_DOCUMENTS = 'madsol_data_documents_v2';
const LOCAL_STORAGE_KEY_NOTIFS = 'madsol_data_notifications_v2';

export const MadrasaDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();

  // 1. Students State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved students', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  // 2. Guardians State
  const [guardians, setGuardians] = useState<Guardian[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GUARDIANS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved guardians', e);
      }
    }
    return INITIAL_GUARDIANS;
  });

  // 3. Online Admissions State
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ADMISSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved admissions', e);
      }
    }
    return INITIAL_ADMISSIONS;
  });

  // 4. Documents State
  const [documents, setDocuments] = useState<StudentDocument[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DOCUMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved documents', e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  // 5. Notifications State
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 6. Dynamic Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_GUARDIANS, JSON.stringify(guardians));
  }, [guardians]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ADMISSIONS, JSON.stringify(admissions));
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  // Helper to log activities
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      institutionId: institution?.id || 'inst-001',
      userId: user?.id || 'sys',
      userName: user ? user.fullNameBn : 'সিস্টেম অ্যাডমিন',
      userRole: user?.role || 'madrasa_admin',
      action,
      details,
      timestamp: 'এইমাত্র',
      ipAddress: '127.0.0.1 (App)',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Helper to add notification
  const addNotification = (notif: Omit<HeaderNotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: HeaderNotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'এইমাত্র',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Multi-Institution & Role-based Data Isolation Scope
  const currentInstitutionId = institution?.id || 'inst-001';

  const scopedStudents = React.useMemo(() => {
    if (!user) return [];

    let list = students;
    // Multi-institution isolation (unless Super Admin with no filter)
    if (user.role !== 'super_admin') {
      list = list.filter((s) => s.institutionId === currentInstitutionId);
    }

    // Role-specific narrowing
    if (user.role === 'guardian') {
      // Guardian only sees their linked child/children
      const myGuardian = guardians.find((g) => g.mobile === user.phone || g.id === user.guardianStudentId);
      const linkedIds = myGuardian ? myGuardian.linkedStudentIds : [user.guardianStudentId || 'std-101'];
      return list.filter((s) => linkedIds.includes(s.id) || linkedIds.includes(s.studentId));
    }

    if (user.role === 'student') {
      // Student only sees their personal profile
      return list.filter(
        (s) => s.id === 'std-101' || s.studentId === 'MDS-2026-0001' || s.rollNumber === user.studentRoll
      );
    }

    if (user.role === 'teacher' && user.department) {
      // Teachers primarily see students in their department, or all students in institution
      // We can sort them so teacher's department is prioritized or full list is available
      return list;
    }

    return list;
  }, [students, user, currentInstitutionId, guardians]);

  const scopedGuardians = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'super_admin') return guardians;
    return guardians.filter((g) => g.institutionId === currentInstitutionId);
  }, [guardians, user, currentInstitutionId]);

  const scopedAdmissions = React.useMemo(() => {
    if (!user) return [];
    if (user.role === 'super_admin') return admissions;
    return admissions.filter((a) => a.institutionId === currentInstitutionId);
  }, [admissions, user, currentInstitutionId]);

  const classes = React.useMemo(() => {
    try {
      return madsolDb.getClasses(currentInstitutionId) || [];
    } catch (e) {
      return [];
    }
  }, [currentInstitutionId]);

  const teachers = React.useMemo(() => {
    try {
      const res = madsolDb.getTeachers(currentInstitutionId);
      return (res?.teachers || []).filter((t: any) => !t.deleted_at) || [];
    } catch (e) {
      return [];
    }
  }, [currentInstitutionId]);

  // ID Generator: e.g. MDS-2026-0007
  const generateNextStudentId = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    const serial = String(count).padStart(4, '0');
    return `MDS-${year}-${serial}`;
  };

  const getStudentById = (id: string) => {
    return students.find((s) => s.id === id || s.studentId === id);
  };

  const getGuardianById = (id: string) => {
    return guardians.find((g) => g.id === id);
  };

  // Add new student
  const addStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [newStudent, ...prev]);

    // If guardian exists, link this student to guardian
    if (data.guardianId) {
      setGuardians((prev) =>
        prev.map((g) => {
          if (g.id === data.guardianId && !g.linkedStudentIds.includes(newStudent.id)) {
            return {
              ...g,
              linkedStudentIds: [...g.linkedStudentIds, newStudent.id],
              updatedAt: new Date().toISOString(),
            };
          }
          return g;
        })
      );
    }

    logActivity('STUDENT_ENROLLED', `${newStudent.fullNameBn} (${newStudent.studentId}) কে নতুন শিক্ষার্থী হিসেবে তালিকাভুক্ত করা হয়েছে।`);

    addNotification({
      titleBn: 'নতুন শিক্ষার্থী ভর্তি সম্পন্ন',
      titleEn: 'New Student Enrolled',
      messageBn: `${newStudent.fullNameBn} (আইডি: ${newStudent.studentId}) ${newStudent.department} বিভাগে সফলভাবে যুক্ত হয়েছে।`,
      messageEn: `${newStudent.fullNameEn} (ID: ${newStudent.studentId}) has been successfully enrolled in ${newStudent.department}.`,
      type: 'success',
    });

    return newStudent;
  };

  // Update student
  const updateStudent = async (id: string, updates: Partial<Student>): Promise<boolean> => {
    let targetName = '';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          targetName = s.fullNameBn;
          return {
            ...s,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    logActivity('STUDENT_UPDATED', `${targetName || 'শিক্ষার্থী'} এর তথ্য সফলভাবে আপডেট করা হয়েছে।`);
    return true;
  };

  // Archive student (Soft delete)
  const archiveStudent = async (id: string, reason?: string): Promise<boolean> => {
    let studentName = '';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          studentName = s.fullNameBn;
          return {
            ...s,
            status: 'archived',
            specialNotes: reason ? `${s.specialNotes || ''} [আর্কাইভ কারণ: ${reason}]` : s.specialNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    logActivity('STUDENT_ARCHIVED', `${studentName} কে সিস্টেমে আর্কাইভ করা হয়েছে।`);
    return true;
  };

  // Restore student
  const restoreStudent = async (id: string): Promise<boolean> => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'active',
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    return true;
  };

  // Delete permanent
  const deleteStudentPermanent = async (id: string): Promise<boolean> => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logActivity('STUDENT_DELETED', `শিক্ষার্থী রেকর্ড স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
    return true;
  };

  // Bulk actions
  const bulkArchiveStudents = async (ids: string[]): Promise<boolean> => {
    setStudents((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status: 'archived', updatedAt: new Date().toISOString() } : s))
    );
    logActivity('BULK_ARCHIVE', `${ids.length} জন শিক্ষার্থীকে একযোগে আর্কাইভ করা হয়েছে।`);
    return true;
  };

  const bulkChangeStatus = async (ids: string[], status: StudentStatus): Promise<boolean> => {
    setStudents((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    );
    logActivity('BULK_STATUS_CHANGE', `${ids.length} জন শিক্ষার্থীর স্ট্যাটাস পরিবর্তিত হয়েছে।`);
    return true;
  };

  // Guardian Management
  const addGuardian = async (data: Omit<Guardian, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guardian> => {
    const newGuardian: Guardian = {
      ...data,
      id: `grd-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGuardians((prev) => [newGuardian, ...prev]);

    logActivity('GUARDIAN_ADDED', `নতুন অভিভাবক ${newGuardian.fullNameBn} (${newGuardian.mobile}) যুক্ত করা হয়েছে।`);
    return newGuardian;
  };

  const updateGuardian = async (id: string, updates: Partial<Guardian>): Promise<boolean> => {
    setGuardians((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
    return true;
  };

  const linkStudentToGuardian = async (guardianId: string, studentId: string): Promise<boolean> => {
    setGuardians((prev) =>
      prev.map((g) => {
        if (g.id === guardianId && !g.linkedStudentIds.includes(studentId)) {
          return { ...g, linkedStudentIds: [...g.linkedStudentIds, studentId] };
        }
        return g;
      })
    );
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, guardianId } : s))
    );
    return true;
  };

  // Online Admissions
  const submitOnlineAdmission = async (
    data: Omit<AdmissionRequest, 'id' | 'applicationNumber' | 'status' | 'submittedAt'>
  ): Promise<AdmissionRequest> => {
    const year = new Date().getFullYear();
    const appCount = admissions.length + 101;
    const appNumber = `APP-${year}-${String(appCount).padStart(3, '0')}`;

    const newReq: AdmissionRequest = {
      ...data,
      id: `adm-${Date.now()}`,
      applicationNumber: appNumber,
      status: 'pending',
      submittedAt: new Date().toLocaleString('bn-BD'),
    };

    setAdmissions((prev) => [newReq, ...prev]);

    logActivity('ONLINE_ADMISSION_SUBMITTED', `নতুন অনলাইন ভর্তি আবেদন #${appNumber} (${newReq.applicantNameBn}) দাখিল করা হয়েছে।`);

    addNotification({
      titleBn: 'নতুন অনলাইন ভর্তি আবেদন',
      titleEn: 'New Online Admission Submitted',
      messageBn: `${newReq.applicantNameBn} এর জন্য #${appNumber} ভর্তি আবেদন গৃহীত হয়েছে। পর্যালোচনার জন্য প্রস্তুত।`,
      messageEn: `Application #${appNumber} submitted for ${newReq.applicantNameEn}. Awaiting review.`,
      type: 'info',
    });

    return newReq;
  };

  const approveAdmission = async (
    admissionId: string,
    options?: { roll?: string; section?: string; studentId?: string }
  ): Promise<{ success: boolean; student?: Student }> => {
    const req = admissions.find((a) => a.id === admissionId);
    if (!req) return { success: false };

    const newStudentId = options?.studentId || generateNextStudentId();
    const roll = options?.roll || '০১';
    const section = options?.section || 'ক';

    // Find or create guardian
    let guardian = guardians.find((g) => g.mobile === req.guardianMobile);
    if (!guardian) {
      guardian = {
        id: `grd-${Date.now()}`,
        institutionId: req.institutionId,
        fullNameBn: req.guardianName,
        fullNameEn: req.guardianName,
        mobile: req.guardianMobile,
        email: req.guardianEmail,
        address: req.presentAddress,
        relationship: req.guardianRelationship || 'father',
        linkedStudentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGuardians((prev) => [guardian!, ...prev]);
    }

    // Create student
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      institutionId: req.institutionId,
      studentId: newStudentId,
      admissionId: req.applicationNumber,
      fullNameBn: req.applicantNameBn,
      fullNameEn: req.applicantNameEn,
      dateOfBirth: req.dateOfBirth,
      gender: req.gender,
      bloodGroup: req.bloodGroup,
      nationality: 'বাংলাদেশী',
      religion: 'ইসলাম',
      department: req.department,
      className: req.desiredClass,
      section,
      session: req.session || '২০২৬ (১৪৪৭-১৪৪৮ হি.)',
      rollNumber: roll,
      admissionDate: new Date().toISOString().split('T')[0],
      previousInstitution: req.previousInstitution,
      guardianId: guardian.id,
      guardianRelationship: 'father',
      fatherName: req.guardianName,
      fatherMobile: req.guardianMobile,
      motherName: 'মাতা',
      guardianName: req.guardianName,
      guardianMobile: req.guardianMobile,
      guardianEmail: req.guardianEmail,
      presentAddress: {
        village: req.presentAddress,
        postOffice: '',
        upazila: '',
        district: 'ঢাকা',
        division: 'ঢাকা',
        country: 'বাংলাদেশ',
        fullAddress: req.presentAddress,
      },
      permanentAddress: {
        village: req.presentAddress,
        postOffice: '',
        upazila: '',
        district: 'ঢাকা',
        division: 'ঢাকা',
        country: 'বাংলাদেশ',
        fullAddress: req.presentAddress,
      },
      isSameAddress: true,
      isBoarding: req.isBoarding,
      isOrphan: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update admission record
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === admissionId
          ? {
              ...a,
              status: 'approved',
              reviewedAt: new Date().toLocaleString('bn-BD'),
              reviewedBy: user?.fullNameBn || 'মাদ্রাসা অ্যাডমিন',
              generatedStudentId: newStudentId,
            }
          : a
      )
    );

    // Add student to student list
    setStudents((prev) => [newStudent, ...prev]);

    // Link student to guardian
    setGuardians((prev) =>
      prev.map((g) =>
        g.id === guardian!.id ? { ...g, linkedStudentIds: [...g.linkedStudentIds, newStudent.id] } : g
      )
    );

    logActivity('ADMISSION_APPROVED', `ভর্তি আবেদন #${req.applicationNumber} অনুমোদন করা হয়েছে। শিক্ষার্থী আইডি: ${newStudentId}`);

    addNotification({
      titleBn: 'ভর্তি আবেদন অনুমোদিত হয়েছে',
      titleEn: 'Admission Approved',
      messageBn: `${req.applicantNameBn} এর আবেদন অনুমোদন করা হয়েছে। নতুন আইডি: ${newStudentId}`,
      messageEn: `Application for ${req.applicantNameEn} approved. Student ID assigned: ${newStudentId}`,
      type: 'success',
    });

    return { success: true, student: newStudent };
  };

  const rejectAdmission = async (admissionId: string, reason?: string): Promise<boolean> => {
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === admissionId
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason || 'আবেদনের শর্তাবলী অপূর্ণ',
              reviewedAt: new Date().toLocaleString('bn-BD'),
              reviewedBy: user?.fullNameBn || 'মাদ্রাসা অ্যাডমিন',
            }
          : a
      )
    );
    logActivity('ADMISSION_REJECTED', `ভর্তি আবেদন প্রত্যাখ্যান করা হয়েছে।`);
    return true;
  };

  // Documents
  const addDocument = async (doc: Omit<StudentDocument, 'id' | 'uploadedAt'>): Promise<StudentDocument> => {
    const newDoc: StudentDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logActivity('DOCUMENT_UPLOADED', `শিক্ষার্থীর নথি সংযুক্ত করা হয়েছে: ${doc.title}`);
    return newDoc;
  };

  const deleteDocument = async (docId: string): Promise<boolean> => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    return true;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Export to CSV with UTF-8 BOM so Bangla displays correctly in Excel
  const exportStudentsToCsv = (studentsToExport?: Student[]) => {
    const list = studentsToExport || scopedStudents;
    const headers = [
      'Student ID',
      'Full Name (Bangla)',
      'Full Name (English)',
      'Department',
      'Class',
      'Roll',
      'Section',
      'Guardian Name',
      'Guardian Mobile',
      'Status',
      'Admission Date',
    ];

    const rows = list.map((s) => [
      `"${s.studentId}"`,
      `"${s.fullNameBn}"`,
      `"${s.fullNameEn}"`,
      `"${s.department}"`,
      `"${s.className}"`,
      `"${s.rollNumber}"`,
      `"${s.section}"`,
      `"${s.guardianName}"`,
      `"${s.guardianMobile}"`,
      `"${s.status}"`,
      `"${s.admissionDate}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MadSol_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MadrasaDataContext.Provider
      value={{
        students,
        guardians,
        admissions,
        documents,
        notifications,
        activityLogs,
        scopedStudents,
        scopedGuardians,
        scopedAdmissions,
        classes,
        teachers,
        addStudent,
        updateStudent,
        archiveStudent,
        restoreStudent,
        deleteStudentPermanent,
        bulkArchiveStudents,
        bulkChangeStatus,
        generateNextStudentId,
        getStudentById,
        getGuardianById,
        addGuardian,
        updateGuardian,
        linkStudentToGuardian,
        submitOnlineAdmission,
        approveAdmission,
        rejectAdmission,
        addDocument,
        deleteDocument,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        exportStudentsToCsv,
      }}
    >
      {children}
    </MadrasaDataContext.Provider>
  );
};

export const useMadrasaData = () => {
  const context = useContext(MadrasaDataContext);
  if (!context) {
    throw new Error('useMadrasaData must be used within a MadrasaDataProvider');
  }
  return context;
};

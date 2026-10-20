import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HifzStudent,
  SabakEntry,
  SabkiEntry,
  ManzilEntry,
  RevisionEntry,
  DailyHifzEvaluation,
  HifzTeacherAssignment,
  HifzAlertEvent,
  PerformanceRatingLevel,
} from '../types/hifz';
import {
  INITIAL_HIFZ_STUDENTS,
  INITIAL_SABAK_ENTRIES,
  INITIAL_SABKI_ENTRIES,
  INITIAL_MANZIL_ENTRIES,
  INITIAL_REVISIONS,
  INITIAL_DAILY_EVALUATIONS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_HIFZ_ALERTS,
} from '../data/hifzData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface HifzContextType {
  hifzStudents: HifzStudent[];
  sabakEntries: SabakEntry[];
  sabkiEntries: SabkiEntry[];
  manzilEntries: ManzilEntry[];
  revisionEntries: RevisionEntry[];
  evaluations: DailyHifzEvaluation[];
  teacherAssignments: HifzTeacherAssignment[];
  alertEvents: HifzAlertEvent[];

  // Filtered/Scoped for current user role
  scopedHifzStudents: HifzStudent[];

  // Actions
  addHifzStudent: (data: Omit<HifzStudent, 'id' | 'progressPercentage'>) => Promise<HifzStudent>;
  updateHifzStudent: (id: string, updates: Partial<HifzStudent>) => Promise<boolean>;
  recordSabak: (entry: Omit<SabakEntry, 'id' | 'createdAt'>) => Promise<SabakEntry>;
  recordSabki: (entry: Omit<SabkiEntry, 'id' | 'createdAt'>) => Promise<SabkiEntry>;
  recordManzil: (entry: Omit<ManzilEntry, 'id' | 'createdAt'>) => Promise<ManzilEntry>;
  recordRevision: (entry: Omit<RevisionEntry, 'id' | 'createdAt'>) => Promise<RevisionEntry>;
  recordDailyEvaluation: (evalData: Omit<DailyHifzEvaluation, 'id' | 'createdAt'>) => Promise<DailyHifzEvaluation>;
  assignTeacherToStudent: (teacherId: string, teacherName: string, studentId: string) => Promise<boolean>;
  getStudentHistory: (studentId: string) => {
    sabak: SabakEntry[];
    sabki: SabkiEntry[];
    manzil: ManzilEntry[];
    revisions: RevisionEntry[];
    evaluations: DailyHifzEvaluation[];
  };
  resolveAlert: (alertId: string) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
}

const HifzContext = createContext<HifzContextType | undefined>(undefined);

const LS_KEY_HIFZ_STUDENTS = 'madsol_hifz_students_v4';
const LS_KEY_SABAK = 'madsol_hifz_sabak_v4';
const LS_KEY_SABKI = 'madsol_hifz_sabki_v4';
const LS_KEY_MANZIL = 'madsol_hifz_manzil_v4';
const LS_KEY_REVISION = 'madsol_hifz_revision_v4';
const LS_KEY_EVAL = 'madsol_hifz_eval_v4';
const LS_KEY_ASSIGNMENTS = 'madsol_hifz_assignments_v4';
const LS_KEY_ALERTS = 'madsol_hifz_alerts_v4';

export const HifzProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const { showToast } = useToast();
  const currentInstId = institution?.id || 'inst-001';

  // 1. Students - Starts empty by default for clean user experience; only shows user added students
  const [hifzStudents, setHifzStudents] = useState<HifzStudent[]>(() => {
    const saved = localStorage.getItem(LS_KEY_HIFZ_STUDENTS);
    if (saved) {
      try {
        const parsed: HifzStudent[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // 2. Sabak
  const [sabakEntries, setSabakEntries] = useState<SabakEntry[]>(() => {
    const saved = localStorage.getItem(LS_KEY_SABAK);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 3. Sabki
  const [sabkiEntries, setSabkiEntries] = useState<SabkiEntry[]>(() => {
    const saved = localStorage.getItem(LS_KEY_SABKI);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 4. Manzil
  const [manzilEntries, setManzilEntries] = useState<ManzilEntry[]>(() => {
    const saved = localStorage.getItem(LS_KEY_MANZIL);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 5. Revision
  const [revisionEntries, setRevisionEntries] = useState<RevisionEntry[]>(() => {
    const saved = localStorage.getItem(LS_KEY_REVISION);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 6. Evaluations
  const [evaluations, setEvaluations] = useState<DailyHifzEvaluation[]>(() => {
    const saved = localStorage.getItem(LS_KEY_EVAL);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 7. Teacher Assignments
  const [teacherAssignments, setTeacherAssignments] = useState<HifzTeacherAssignment[]>(() => {
    const saved = localStorage.getItem(LS_KEY_ASSIGNMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // 8. Alerts
  const [alertEvents, setAlertEvents] = useState<HifzAlertEvent[]>(() => {
    const saved = localStorage.getItem(LS_KEY_ALERTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const loadDemoData = () => {
    setHifzStudents(INITIAL_HIFZ_STUDENTS);
    setSabakEntries(INITIAL_SABAK_ENTRIES);
    setSabkiEntries(INITIAL_SABKI_ENTRIES);
    setManzilEntries(INITIAL_MANZIL_ENTRIES);
    setRevisionEntries(INITIAL_REVISIONS);
    setEvaluations(INITIAL_DAILY_EVALUATIONS);
    setTeacherAssignments(INITIAL_TEACHER_ASSIGNMENTS);
    setAlertEvents(INITIAL_HIFZ_ALERTS);
    showToast('ডেমো শিক্ষার্থীদের তথ্য সফলভাবে লোড হয়েছে।', 'success');
  };

  const clearAllData = () => {
    setHifzStudents([]);
    setSabakEntries([]);
    setSabkiEntries([]);
    setManzilEntries([]);
    setRevisionEntries([]);
    setEvaluations([]);
    setTeacherAssignments([]);
    setAlertEvents([]);
    localStorage.removeItem(LS_KEY_HIFZ_STUDENTS);
    localStorage.removeItem(LS_KEY_SABAK);
    localStorage.removeItem(LS_KEY_SABKI);
    localStorage.removeItem(LS_KEY_MANZIL);
    localStorage.removeItem(LS_KEY_REVISION);
    localStorage.removeItem(LS_KEY_EVAL);
    localStorage.removeItem(LS_KEY_ASSIGNMENTS);
    localStorage.removeItem(LS_KEY_ALERTS);
    showToast('সকল ডাটা ক্লিয়ার করা হয়েছে। এখন নতুন শিক্ষার্থী যুক্ত করতে পারেন।', 'info');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LS_KEY_HIFZ_STUDENTS, JSON.stringify(hifzStudents));
  }, [hifzStudents]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_SABAK, JSON.stringify(sabakEntries));
  }, [sabakEntries]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_SABKI, JSON.stringify(sabkiEntries));
  }, [sabkiEntries]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_MANZIL, JSON.stringify(manzilEntries));
  }, [manzilEntries]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_REVISION, JSON.stringify(revisionEntries));
  }, [revisionEntries]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_EVAL, JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ASSIGNMENTS, JSON.stringify(teacherAssignments));
  }, [teacherAssignments]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ALERTS, JSON.stringify(alertEvents));
  }, [alertEvents]);

  // Scoped students by role & institution
  const scopedHifzStudents = hifzStudents.filter((std) => {
    if (std.institutionId !== currentInstId) return false;

    if (!user) return true;
    if (user.role === 'super_admin' || user.role === 'madrasa_admin' || user.role === 'principal') {
      return true;
    }
    if (user.role === 'teacher') {
      // Show assigned students or all if unassigned
      const myAssignment = teacherAssignments.find((a) => a.teacherId === user.id);
      if (myAssignment && myAssignment.studentIds.length > 0) {
        return myAssignment.studentIds.includes(std.studentId) || std.assignedTeacherId === user.id;
      }
      return true;
    }
    if (user.role === 'guardian') {
      const childId = user.guardianStudentId || 'std-101';
      return std.studentId === childId;
    }
    if (user.role === 'student') {
      // Student only sees themselves
      return std.studentId === 'std-101' || std.fullNameBn.includes(user.fullNameBn);
    }
    return true;
  });

  // Add Hifz Student
  const addHifzStudent = async (data: Omit<HifzStudent, 'id' | 'progressPercentage'>) => {
    const totalCompleted = data.totalCompletedParas || (data.completedParas ? data.completedParas.length : 0);
    const progressPercentage = Number(((totalCompleted / 30) * 100).toFixed(1));

    const newStudent: HifzStudent = {
      ...data,
      id: `hifz-std-${Date.now()}`,
      institutionId: currentInstId,
      progressPercentage,
      totalCompletedParas: totalCompleted,
      completedParas: data.completedParas || Array.from({ length: totalCompleted }, (_, i) => i + 1),
    };

    setHifzStudents((prev) => [newStudent, ...prev]);
    showToast('নতুন হিফজ শিক্ষার্থী সফলভাবে তালিকাভুক্ত হয়েছে।', 'success');
    return newStudent;
  };

  // Update Hifz Student
  const updateHifzStudent = async (id: string, updates: Partial<HifzStudent>) => {
    setHifzStudents((prev) =>
      prev.map((std) => {
        if (std.id !== id) return std;
        const totalCompleted = updates.totalCompletedParas !== undefined
          ? updates.totalCompletedParas
          : std.totalCompletedParas;
        const progressPercentage = Number(((totalCompleted / 30) * 100).toFixed(1));
        return {
          ...std,
          ...updates,
          progressPercentage,
        };
      })
    );
    showToast('হিফজ শিক্ষার্থীর তথ্য আপডেট করা হয়েছে।', 'success');
    return true;
  };

  // Record New Sabak
  const recordSabak = async (entry: Omit<SabakEntry, 'id' | 'createdAt'>) => {
    const newEntry: SabakEntry = {
      ...entry,
      id: `sbk-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
    };

    setSabakEntries((prev) => [newEntry, ...prev]);

    // Automatically update student's current Para, Surah, Ayah, Lesson & last evaluated date
    setHifzStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === entry.studentId) {
          const updatedParas = new Set<number>(s.completedParas || []);
          if (entry.paraNumber > 1) {
            for (let i = 1; i < entry.paraNumber; i++) {
              updatedParas.add(i);
            }
          }
          const completedList: number[] = Array.from(updatedParas).sort((a: number, b: number) => a - b);
          const totalCompleted = completedList.length;
          const progressPercentage = s.stage === 'hifz'
            ? Number(((totalCompleted / 30) * 100).toFixed(1))
            : s.progressPercentage;

          const lessonDesc = entry.stage === 'qaida'
            ? `নূরানী কায়দা: পৃষ্ঠা ${entry.pageNumber || ''} - ${entry.lessonDescription}`
            : entry.stage === 'ampara'
            ? `আমপারা: ${entry.surahName} (আয়াত ${entry.fromAyah}-${entry.toAyah})`
            : entry.stage === 'nazra'
            ? `নাজেরা: পারা ${entry.paraNumber} - ${entry.surahName}`
            : `পারা ${entry.paraNumber} - ${entry.surahName} (আয়াত ${entry.fromAyah}-${entry.toAyah})`;

          return {
            ...s,
            currentPara: entry.paraNumber,
            currentSurah: entry.surahName,
            currentAyah: `${entry.fromAyah}-${entry.toAyah}`,
            currentLessonDescription: lessonDesc,
            completedParas: completedList,
            totalCompletedParas: totalCompleted,
            progressPercentage,
            lastEvaluatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    showToast('আজকের নতুন সবক সফলভাবে সংরক্ষিত হয়েছে।', 'success');
    return newEntry;
  };

  // Record Sabki (Saat Sabak)
  const recordSabki = async (entry: Omit<SabkiEntry, 'id' | 'createdAt'>) => {
    const newEntry: SabkiEntry = {
      ...entry,
      id: `sbki-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
    };
    setSabkiEntries((prev) => [newEntry, ...prev]);

    // Update student's current saat sabak
    setHifzStudents((prev) =>
      prev.map((s) =>
        s.studentId === entry.studentId
          ? { ...s, currentSaatSabak: entry.revisionPortion, lastEvaluatedAt: new Date().toISOString() }
          : s
      )
    );

    showToast('সাত ছবক (ছবকী) সফলভাবে নথিভুক্ত হয়েছে।', 'success');
    return newEntry;
  };

  // Record Manzil (Amukhta Sabak)
  const recordManzil = async (entry: Omit<ManzilEntry, 'id' | 'createdAt'>) => {
    const newEntry: ManzilEntry = {
      ...entry,
      id: `mnz-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
    };
    setManzilEntries((prev) => [newEntry, ...prev]);

    // Update student's current amukhta
    setHifzStudents((prev) =>
      prev.map((s) =>
        s.studentId === entry.studentId
          ? { ...s, currentAmukhta: entry.revisionPortion, lastEvaluatedAt: new Date().toISOString() }
          : s
      )
    );

    showToast('আমুক্তা ছবক (মনজিল) সফলভাবে সংরক্ষিত হয়েছে।', 'success');
    return newEntry;
  };

  // Record Revision
  const recordRevision = async (entry: Omit<RevisionEntry, 'id' | 'createdAt'>) => {
    const newEntry: RevisionEntry = {
      ...entry,
      id: `rev-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
    };
    setRevisionEntries((prev) => [newEntry, ...prev]);
    showToast('রিভিশন রেকর্ড সফলভাবে সংরক্ষিত হয়েছে।', 'success');
    return newEntry;
  };

  // Record Daily Evaluation
  const recordDailyEvaluation = async (evalData: Omit<DailyHifzEvaluation, 'id' | 'createdAt'>) => {
    const newEval: DailyHifzEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
    };

    setEvaluations((prev) => [newEval, ...prev]);

    // Check if rating is low (<= 2 stars or weak), trigger alert event foundation
    if (evalData.overallStars <= 2 || evalData.sabak === 'weak' || evalData.memorization === 'weak') {
      const student = hifzStudents.find((s) => s.studentId === evalData.studentId);
      const newAlert: HifzAlertEvent = {
        id: `alert-${Date.now()}`,
        institutionId: currentInstId,
        studentId: evalData.studentId,
        studentName: evalData.studentNameBn,
        studentCode: student?.studentCode || 'MDS-000',
        alertType: 'low_progress',
        thresholdValue: 70,
        actualValue: Math.round((evalData.overallStars / 5) * 100),
        descriptionBn: `${evalData.studentNameBn}-এর আজকের হিফজ মূল্যায়নে দুর্বলতা পরিলক্ষিত হয়েছে (${evalData.overallStars} স্টার)। বিশেষ রিভিশন প্রয়োজন।`,
        descriptionEn: `Low performance alert for ${evalData.studentNameBn} (${evalData.overallStars} stars). Needs special revision.`,
        triggeredAt: new Date().toISOString(),
        status: 'pending',
      };
      setAlertEvents((prev) => [newAlert, ...prev]);

      // Update student lowProgressAlert flag
      setHifzStudents((prev) =>
        prev.map((s) => (s.studentId === evalData.studentId ? { ...s, lowProgressAlert: true } : s))
      );
    } else {
      // Normal rating, clear low progress alert if any
      setHifzStudents((prev) =>
        prev.map((s) => (s.studentId === evalData.studentId ? { ...s, lowProgressAlert: false } : s))
      );
    }

    showToast('দৈনিক মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে।', 'success');
    return newEval;
  };

  // Assign teacher
  const assignTeacherToStudent = async (teacherId: string, teacherName: string, studentId: string) => {
    setHifzStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId ? { ...s, assignedTeacherId: teacherId, assignedTeacherName: teacherName } : s
      )
    );

    setTeacherAssignments((prev) => {
      const existing = prev.find((a) => a.teacherId === teacherId);
      if (existing) {
        return prev.map((a) =>
          a.teacherId === teacherId
            ? { ...a, studentIds: Array.from(new Set([...a.studentIds, studentId])) }
            : a
        );
      } else {
        return [
          ...prev,
          {
            id: `hta-${Date.now()}`,
            institutionId: currentInstId,
            teacherId,
            teacherNameBn: teacherName,
            teacherNameEn: teacherName,
            studentIds: [studentId],
          },
        ];
      }
    });

    showToast('উস্তায সফলভাবে অ্যাসাইন করা হয়েছে।', 'success');
    return true;
  };

  // Get student history
  const getStudentHistory = (studentId: string) => {
    return {
      sabak: sabakEntries.filter((e) => e.studentId === studentId),
      sabki: sabkiEntries.filter((e) => e.studentId === studentId),
      manzil: manzilEntries.filter((e) => e.studentId === studentId),
      revisions: revisionEntries.filter((e) => e.studentId === studentId),
      evaluations: evaluations.filter((e) => e.studentId === studentId),
    };
  };

  const resolveAlert = (alertId: string) => {
    setAlertEvents((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as const } : a))
    );
    showToast('অ্যালার্ট নিষ্পত্তি করা হয়েছে।', 'info');
  };

  return (
    <HifzContext.Provider
      value={{
        hifzStudents,
        sabakEntries,
        sabkiEntries,
        manzilEntries,
        revisionEntries,
        evaluations,
        teacherAssignments,
        alertEvents,
        scopedHifzStudents,
        addHifzStudent,
        updateHifzStudent,
        recordSabak,
        recordSabki,
        recordManzil,
        recordRevision,
        recordDailyEvaluation,
        assignTeacherToStudent,
        getStudentHistory,
        resolveAlert,
        loadDemoData,
        clearAllData,
      }}
    >
      {children}
    </HifzContext.Provider>
  );
};

export const useHifz = () => {
  const context = useContext(HifzContext);
  if (!context) {
    throw new Error('useHifz must be used within a HifzProvider');
  }
  return context;
};

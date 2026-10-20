import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Exam,
  ExamSubject,
  StudentMark,
  GradeScale,
  StudentResult,
  ClassRoutineEntry,
  RoutineConflict,
} from '../types/academic';
import {
  INITIAL_EXAMS,
  INITIAL_EXAM_SUBJECTS,
  INITIAL_STUDENT_MARKS,
  INITIAL_STUDENT_RESULTS,
  DEFAULT_GRADE_SCALES,
  INITIAL_ROUTINES,
} from '../data/academicData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ExamContextType {
  exams: Exam[];
  scopedExams: Exam[];
  examSubjects: ExamSubject[];
  studentMarks: StudentMark[];
  studentResults: StudentResult[];
  gradeScales: GradeScale[];
  routines: ClassRoutineEntry[];

  // Exam Operations
  createExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Exam>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;

  // Subject Operations
  addExamSubject: (subject: Omit<ExamSubject, 'id'>) => Promise<ExamSubject>;
  addSubjectToExam: (subject: Omit<ExamSubject, 'id'>) => Promise<ExamSubject>;
  deleteExamSubject: (id: string) => Promise<boolean>;
  getSubjectsForExam: (examId: string) => ExamSubject[];

  // Marks Operations & Validation
  saveStudentMarks: (marks: Array<{
    examId: string;
    subjectId: string;
    studentId: string;
    studentRoll: string;
    studentNameBn: string;
    marksObtained: number;
    isAbsent?: boolean;
    remarks?: string;
  }>) => Promise<boolean>;
  getMarksForSubject: (examId: string, subjectId: string) => StudentMark[];

  // Automated Result Generation
  generateExamResults: (examId: string, students: Array<{
    id: string;
    studentId: string;
    fullNameBn: string;
    fullNameEn: string;
    rollNumber: string;
    className: string;
    department: string;
  }>) => Promise<StudentResult[]>;
  publishExamResults: (examId: string) => Promise<boolean>;

  // Routine Operations
  addRoutineEntry: (entry: Omit<ClassRoutineEntry, 'id'>) => Promise<{ success: boolean; conflict?: RoutineConflict }>;
  updateRoutineEntry: (id: string, updates: Partial<ClassRoutineEntry>) => Promise<{ success: boolean; conflict?: RoutineConflict }>;
  deleteRoutineEntry: (id: string) => Promise<boolean>;
  checkRoutineConflict: (newEntry: Omit<ClassRoutineEntry, 'id'>, excludeId?: string) => RoutineConflict | null;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const LS_KEY_EXAMS = 'madsol_exams_v1';
const LS_KEY_SUBJECTS = 'madsol_exam_subjects_v1';
const LS_KEY_MARKS = 'madsol_exam_marks_v1';
const LS_KEY_RESULTS = 'madsol_exam_results_v1';
const LS_KEY_ROUTINES = 'madsol_exam_routines_v1';

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const { showToast } = useToast();
  const currentInstId = institution?.id || 'inst-001';

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(LS_KEY_EXAMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EXAMS;
  });

  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>(() => {
    const saved = localStorage.getItem(LS_KEY_SUBJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EXAM_SUBJECTS;
  });

  const [studentMarks, setStudentMarks] = useState<StudentMark[]>(() => {
    const saved = localStorage.getItem(LS_KEY_MARKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STUDENT_MARKS;
  });

  const [studentResults, setStudentResults] = useState<StudentResult[]>(() => {
    const saved = localStorage.getItem(LS_KEY_RESULTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STUDENT_RESULTS;
  });

  const [gradeScales] = useState<GradeScale[]>(DEFAULT_GRADE_SCALES);

  const [routines, setRoutines] = useState<ClassRoutineEntry[]>(() => {
    const saved = localStorage.getItem(LS_KEY_ROUTINES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ROUTINES;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LS_KEY_EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_SUBJECTS, JSON.stringify(examSubjects));
  }, [examSubjects]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_MARKS, JSON.stringify(studentMarks));
  }, [studentMarks]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_RESULTS, JSON.stringify(studentResults));
  }, [studentResults]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ROUTINES, JSON.stringify(routines));
  }, [routines]);

  // Exam Operations
  const createExam = async (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExam: Exam = {
      ...examData,
      id: `ex-${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExams((prev) => [newExam, ...prev]);
    showToast('নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে।', 'success');
    return newExam;
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
    showToast('পরীক্ষার তথ্য সফলভাবে আপডেট হয়েছে।', 'success');
    return true;
  };

  const deleteExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    setExamSubjects((prev) => prev.filter((s) => s.examId !== id));
    setStudentMarks((prev) => prev.filter((m) => m.examId !== id));
    setStudentResults((prev) => prev.filter((r) => r.examId !== id));
    showToast('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।', 'info');
    return true;
  };

  // Subjects
  const addExamSubject = async (subj: Omit<ExamSubject, 'id'>) => {
    const newSubj: ExamSubject = {
      ...subj,
      id: `sbj-${Date.now()}`,
    };
    setExamSubjects((prev) => [...prev, newSubj]);
    showToast('পরীক্ষার বিষয় ও রুটিন সফলভাবে যুক্ত হয়েছে।', 'success');
    return newSubj;
  };

  const deleteExamSubject = async (id: string) => {
    setExamSubjects((prev) => prev.filter((s) => s.id !== id));
    setStudentMarks((prev) => prev.filter((m) => m.subjectId !== id));
    showToast('বিষয় মুছে ফেলা হয়েছে।', 'info');
    return true;
  };

  const getSubjectsForExam = (examId: string) => {
    return examSubjects.filter((s) => s.examId === examId);
  };

  // Marks
  const saveStudentMarks = async (
    marksList: Array<{
      examId: string;
      subjectId: string;
      studentId: string;
      studentRoll: string;
      studentNameBn: string;
      marksObtained: number;
      isAbsent?: boolean;
      remarks?: string;
    }>
  ) => {
    // Validate marks before saving
    const subject = examSubjects.find((s) => s.id === marksList[0]?.subjectId);
    const fullMarks = subject?.fullMarks || 100;

    for (const m of marksList) {
      if (m.marksObtained < 0) {
        showToast('নম্বর কখনো ঋণাত্মক (Negative) হতে পারে না।', 'error');
        return false;
      }
      if (m.marksObtained > fullMarks) {
        showToast(`নম্বর মোট নম্বর (${fullMarks})-এর বেশি হতে পারবে না।`, 'error');
        return false;
      }
    }

    setStudentMarks((prev) => {
      const updated = [...prev];
      for (const m of marksList) {
        const existingIdx = updated.findIndex(
          (item) => item.examId === m.examId && item.subjectId === m.subjectId && item.studentId === m.studentId
        );
        const record: StudentMark = {
          id: existingIdx >= 0 ? updated[existingIdx].id : `mrk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          institutionId: currentInstId,
          examId: m.examId,
          subjectId: m.subjectId,
          studentId: m.studentId,
          studentRoll: m.studentRoll,
          studentNameBn: m.studentNameBn,
          marksObtained: Number(m.marksObtained),
          isAbsent: !!m.isAbsent,
          remarks: m.remarks,
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          updated[existingIdx] = record;
        } else {
          updated.push(record);
        }
      }
      return updated;
    });

    showToast('শিক্ষার্থীদের প্রাপ্ত নম্বর সফলভাবে সংরক্ষণ করা হয়েছে।', 'success');
    return true;
  };

  const getMarksForSubject = (examId: string, subjectId: string) => {
    return studentMarks.filter((m) => m.examId === examId && m.subjectId === subjectId);
  };

  // Helper for grade and GPA calculation
  const calculateGradeAndGPA = (obtained: number, full: number) => {
    const percentage = full > 0 ? (obtained / full) * 100 : 0;
    for (const scale of gradeScales) {
      if (percentage >= scale.minMarks && percentage <= scale.maxMarks) {
        return { grade: scale.grade, gpa: scale.gpa, percentage };
      }
    }
    return { grade: 'F', gpa: 0.0, percentage };
  };

  // Automated Result Calculation
  const generateExamResults = async (
    examId: string,
    students: Array<{
      id: string;
      studentId: string;
      fullNameBn: string;
      fullNameEn: string;
      rollNumber: string;
      className: string;
      department: string;
    }>
  ) => {
    const subjects = examSubjects.filter((s) => s.examId === examId);
    if (subjects.length === 0) {
      showToast('এই পরীক্ষায় এখনো কোনো বিষয় যুক্ত করা হয়নি।', 'error');
      return [];
    }

    const calculatedList: Omit<StudentResult, 'position'>[] = [];

    for (const student of students) {
      let totalObtained = 0;
      let totalFull = 0;
      let allPassed = true;
      let totalGPA = 0;

      const subjectResults = subjects.map((subj) => {
        const mark = studentMarks.find(
          (m) => m.examId === examId && m.subjectId === subj.id && m.studentId === student.id
        );
        const obtained = mark ? mark.marksObtained : 0;
        const isAbsent = mark ? mark.isAbsent : false;
        totalObtained += isAbsent ? 0 : obtained;
        totalFull += subj.fullMarks;

        const isPassed = !isAbsent && obtained >= subj.passMarks;
        if (!isPassed) allPassed = false;

        const { grade, gpa } = calculateGradeAndGPA(obtained, subj.fullMarks);
        totalGPA += isPassed ? gpa : 0;

        return {
          subjectId: subj.id,
          subjectNameBn: subj.subjectNameBn,
          subjectNameEn: subj.subjectNameEn,
          fullMarks: subj.fullMarks,
          passMarks: subj.passMarks,
          obtainedMarks: obtained,
          grade,
          gpa,
          isPassed,
          isAbsent,
        };
      });

      const avgPercentage = totalFull > 0 ? Number(((totalObtained / totalFull) * 100).toFixed(2)) : 0;
      const averageGPA = subjects.length > 0 ? Number((totalGPA / subjects.length).toFixed(2)) : 0;

      const overallGradeCalc = calculateGradeAndGPA(totalObtained, totalFull);

      calculatedList.push({
        id: `res-${examId}-${student.id}`,
        institutionId: currentInstId,
        examId,
        studentId: student.id,
        studentCode: student.studentId,
        studentNameBn: student.fullNameBn,
        studentNameEn: student.fullNameEn,
        studentRoll: student.rollNumber,
        className: student.className,
        department: student.department,
        totalMarksObtained: totalObtained,
        totalFullMarks: totalFull,
        percentage: avgPercentage,
        gpa: allPassed ? averageGPA : 0.0,
        grade: allPassed ? overallGradeCalc.grade : 'F',
        isPassed: allPassed,
        subjectResults,
        publishedAt: new Date().toISOString(),
      });
    }

    // Sort by totalMarksObtained descending to determine positions with tie-handling
    calculatedList.sort((a, b) => b.totalMarksObtained - a.totalMarksObtained);

    const finalResults: StudentResult[] = calculatedList.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    // Update state
    setStudentResults((prev) => {
      const filtered = prev.filter((r) => r.examId !== examId);
      return [...finalResults, ...filtered];
    });

    showToast(`স্বয়ংক্রিয়ভাবে ${finalResults.length} জন শিক্ষার্থীর ফলাফল প্রস্তুত করা হয়েছে।`, 'success');
    return finalResults;
  };

  const publishExamResults = async (examId: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, status: 'published' as const, updatedAt: new Date().toISOString() } : e))
    );
    showToast('ফলাফল সফলভাবে প্রকাশ করা হয়েছে। শিক্ষার্থীরা এখন মার্কশিট দেখতে পাবে।', 'success');
    return true;
  };

  // Routine Conflict Detection
  const checkRoutineConflict = (
    newEntry: Omit<ClassRoutineEntry, 'id'>,
    excludeId?: string
  ): RoutineConflict | null => {
    const existingSameDay = routines.filter(
      (r) => r.day === newEntry.day && (!excludeId || r.id !== excludeId)
    );

    for (const existing of existingSameDay) {
      // Time overlap check
      const startA = newEntry.startTime;
      const endA = newEntry.endTime;
      const startB = existing.startTime;
      const endB = existing.endTime;

      const isOverlapping = startA < endB && endA > startB;

      if (isOverlapping) {
        // Check Teacher conflict
        if (newEntry.teacherId === existing.teacherId) {
          return {
            type: 'teacher',
            entryA: { ...newEntry, id: 'temp' },
            entryB: existing,
            messageBn: `উস্তায ${newEntry.teacherName} এই সময়ে (${newEntry.startTime} - ${newEntry.endTime}) ইতোমধ্যে '${existing.className}' জামাতে ক্লাসে নিয়োজিত আছেন!`,
            messageEn: `Teacher ${newEntry.teacherName} is already assigned to '${existing.className}' during ${newEntry.startTime} - ${newEntry.endTime}!`,
          };
        }

        // Check Room conflict
        if (newEntry.room.trim().toLowerCase() === existing.room.trim().toLowerCase()) {
          return {
            type: 'room',
            entryA: { ...newEntry, id: 'temp' },
            entryB: existing,
            messageBn: `কক্ষ '${newEntry.room}' এই সময়ে (${newEntry.startTime} - ${newEntry.endTime}) ইতোমধ্যে '${existing.className}' জামাতের ব্যবহারের জন্য নির্ধারিত রয়েছে!`,
            messageEn: `Room '${newEntry.room}' is already occupied by '${existing.className}' at ${newEntry.startTime} - ${newEntry.endTime}!`,
          };
        }
      }
    }

    return null;
  };

  const addRoutineEntry = async (entry: Omit<ClassRoutineEntry, 'id'>) => {
    const conflict = checkRoutineConflict(entry);
    if (conflict) {
      showToast(conflict.messageBn, 'warning');
      return { success: false, conflict };
    }

    const newRoutine: ClassRoutineEntry = {
      ...entry,
      id: `rt-${Date.now()}`,
      institutionId: currentInstId,
    };
    setRoutines((prev) => [...prev, newRoutine]);
    showToast('ক্লাস রুটিন সফলভাবে যুক্ত হয়েছে।', 'success');
    return { success: true };
  };

  const updateRoutineEntry = async (id: string, updates: Partial<ClassRoutineEntry>) => {
    const existing = routines.find((r) => r.id === id);
    if (!existing) return { success: false };

    const merged = { ...existing, ...updates };
    const conflict = checkRoutineConflict(merged, id);
    if (conflict) {
      showToast(conflict.messageBn, 'warning');
      return { success: false, conflict };
    }

    setRoutines((prev) => prev.map((r) => (r.id === id ? merged : r)));
    showToast('রুটিন আপডেট সম্পন্ন হয়েছে।', 'success');
    return { success: true };
  };

  const deleteRoutineEntry = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    showToast('রুটিন এন্ট্রি মুছে ফেলা হয়েছে।', 'info');
    return true;
  };

  return (
    <ExamContext.Provider
      value={{
        exams,
        scopedExams: exams,
        examSubjects,
        studentMarks,
        studentResults,
        gradeScales,
        routines,
        createExam,
        updateExam,
        deleteExam,
        addExamSubject,
        addSubjectToExam: addExamSubject,
        deleteExamSubject,
        getSubjectsForExam,
        saveStudentMarks,
        getMarksForSubject,
        generateExamResults,
        publishExamResults,
        addRoutineEntry,
        updateRoutineEntry,
        deleteRoutineEntry,
        checkRoutineConflict,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

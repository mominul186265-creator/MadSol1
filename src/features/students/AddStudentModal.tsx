import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DbStudent,
  DbDepartment,
  DbClass,
  DbSection,
  StudentGender,
  BloodGroup,
  DocumentCategory,
} from '../../types/step2';
import { Button } from '../../components/common/Button';
import {
  X,
  User,
  BookOpen,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: DbStudent) => void;
  editStudent?: DbStudent | null;
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  getNextId: (session?: string) => string;
  checkIdUnique: (id: string, excludeId?: string) => boolean;
  checkRollUnique: (classId: string, session: string, roll: string, excludeId?: string) => boolean;
  createStudent: (data: any) => Promise<DbStudent>;
  updateStudent: (id: string, data: any) => Promise<DbStudent>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editStudent,
  departments,
  classes,
  sections,
  getNextId,
  checkIdUnique,
  checkRollUnique,
  createStudent,
  updateStudent,
}) => {
  const { language } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [photo, setPhoto] = useState<string>('');
  const [fullNameBn, setFullNameBn] = useState<string>('');
  const [fullNameEn, setFullNameEn] = useState<string>('');
  const [gender, setGender] = useState<StudentGender>('male');
  const [dateOfBirth, setDateOfBirth] = useState<string>('2012-01-01');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('A+');
  const [nationality, setNationality] = useState<string>('বাংলাদেশী');
  const [religion, setReligion] = useState<string>('ইসলাম');
  const [birthRegNo, setBirthRegNo] = useState<string>('');

  // Step 2 Academic
  const [departmentId, setDepartmentId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [academicSession, setAcademicSession] = useState<string>('2026');
  const [studentId, setStudentId] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>('০১');
  const [admissionDate, setAdmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [previousInstitution, setPreviousInstitution] = useState<string>('');
  const [previousClass, setPreviousClass] = useState<string>('');

  // Step 3 Contact & Emergency
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [presentAddress, setPresentAddress] = useState<string>('');
  const [permanentAddress, setPermanentAddress] = useState<string>('');
  const [sameAddress, setSameAddress] = useState<boolean>(true);
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyRelationship, setEmergencyRelationship] = useState<string>('পিতা (Father)');
  const [emergencyMobile, setEmergencyMobile] = useState<string>('');
  const [emergencyAltMobile, setEmergencyAltMobile] = useState<string>('');
  const [emergencyAddress, setEmergencyAddress] = useState<string>('');

  // Validation Warnings
  const [rollWarning, setRollWarning] = useState<string | null>(null);
  const [idWarning, setIdWarning] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (editStudent) {
      setPhoto(editStudent.photo || '');
      setFullNameBn(editStudent.full_name_bn || '');
      setFullNameEn(editStudent.full_name_en || '');
      setGender(editStudent.gender || 'male');
      setDateOfBirth(editStudent.date_of_birth || '2012-01-01');
      setBloodGroup((editStudent.blood_group as BloodGroup) || 'A+');
      setNationality(editStudent.nationality || 'বাংলাদেশী');
      setReligion(editStudent.religion || 'ইসলাম');
      setBirthRegNo(editStudent.birth_registration_number || '');

      setDepartmentId(editStudent.department_id || (departments[0]?.id || ''));
      setClassId(editStudent.class_id || (classes[0]?.id || ''));
      setSectionId(editStudent.section_id || '');
      setAcademicSession(editStudent.academic_session || '2026');
      setStudentId(editStudent.student_id);
      setRollNumber(editStudent.roll_number);
      setAdmissionDate(editStudent.admission_date || new Date().toISOString().split('T')[0]);
      setPreviousInstitution(editStudent.previous_institution || '');
      setPreviousClass(editStudent.previous_class || '');

      setMobile(editStudent.mobile || '');
      setEmail(editStudent.email || '');
      setPresentAddress(editStudent.present_address || '');
      setPermanentAddress(editStudent.permanent_address || '');
      setSameAddress(editStudent.present_address === editStudent.permanent_address);
      setEmergencyContactName(editStudent.emergency_contact_name || '');
      setEmergencyRelationship(editStudent.emergency_relationship || 'পিতা (Father)');
      setEmergencyMobile(editStudent.emergency_mobile || '');
      setEmergencyAltMobile(editStudent.emergency_alternative_mobile || '');
      setEmergencyAddress(editStudent.emergency_address || '');
    } else {
      // New Student Defaults
      setPhoto('');
      setFullNameBn('');
      setFullNameEn('');
      setGender('male');
      setDateOfBirth('2012-01-01');
      setBloodGroup('A+');
      setNationality('বাংলাদেশী');
      setReligion('ইসলাম');
      setBirthRegNo('');

      const defaultDept = departments[0]?.id || 'dept-001';
      setDepartmentId(defaultDept);
      const defaultCls = classes.find((c) => c.department_id === defaultDept)?.id || classes[0]?.id || 'cls-001';
      setClassId(defaultCls);
      setSectionId(sections[0]?.id || '');
      setAcademicSession('2026');

      const nextAutoId = getNextId('2026');
      setStudentId(nextAutoId);
      setRollNumber('০৭');
      setAdmissionDate(new Date().toISOString().split('T')[0]);
      setPreviousInstitution('');
      setPreviousClass('');

      setMobile('');
      setEmail('');
      setPresentAddress('');
      setPermanentAddress('');
      setSameAddress(true);
      setEmergencyContactName('');
      setEmergencyRelationship('পিতা (Father)');
      setEmergencyMobile('');
      setEmergencyAltMobile('');
      setEmergencyAddress('');
    }

    setStep(1);
    setErrorMessage(null);
    setRollWarning(null);
    setIdWarning(null);
  }, [isOpen, editStudent, departments, classes, sections, getNextId]);

  // Dependent classes
  const filteredClasses = classes.filter(
    (c) => !departmentId || c.department_id === departmentId
  );

  // Dependent sections
  const filteredSections = sections.filter(
    (s) => !classId || s.class_id === classId
  );

  // Validate live unique ID
  useEffect(() => {
    if (!studentId.trim()) {
      setIdWarning('শিক্ষার্থী আইডি আবশ্যক');
      return;
    }
    const isUnique = checkIdUnique(studentId, editStudent?.id);
    if (!isUnique) {
      setIdWarning('এই শিক্ষার্থী আইডি ইতোমধ্যে ব্যবহৃত হয়েছে!');
    } else {
      setIdWarning(null);
    }
  }, [studentId, checkIdUnique, editStudent]);

  // Validate live unique Roll
  useEffect(() => {
    if (!rollNumber.trim() || !classId) {
      setRollWarning(null);
      return;
    }
    const isUnique = checkRollUnique(classId, academicSession, rollNumber, editStudent?.id);
    if (!isUnique) {
      setRollWarning('এই ক্লাসে এই রোল নম্বরটি ইতিমধ্যে অন্য শিক্ষার্থীকে দেওয়া হয়েছে!');
    } else {
      setRollWarning(null);
    }
  }, [rollNumber, classId, academicSession, checkRollUnique, editStudent]);

  if (!isOpen) return null;

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    if (!fullNameBn.trim()) {
      setErrorMessage('শিক্ষার্থীর পূর্ণ নাম (বাংলা) আবশ্যক');
      return;
    }
    if (!fullNameEn.trim()) {
      setErrorMessage('শিক্ষার্থীর পূর্ণ নাম (ইংরেজি) আবশ্যক');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    if (!departmentId) {
      setErrorMessage('অনুগ্রহ করে বিভাগ নির্বাচন করুন');
      return;
    }
    if (!classId) {
      setErrorMessage('অনুগ্রহ করে জামাত/শ্রেণি নির্বাচন করুন');
      return;
    }
    if (!studentId.trim()) {
      setErrorMessage('শিক্ষার্থী আইডি খালি থাকতে পারে না');
      return;
    }
    if (idWarning) {
      setErrorMessage(idWarning);
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMessage('ক্লাস রোল খালি থাকতে পারে না');
      return;
    }
    if (rollWarning) {
      setErrorMessage(rollWarning);
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  // Step 3 Validation
  const handleNextFromStep3 = () => {
    if (!emergencyContactName.trim()) {
      setErrorMessage('জরুরী অভিভাবকের নাম আবশ্যক');
      return;
    }
    if (!emergencyMobile.trim()) {
      setErrorMessage('জরুরী যোগাযোগের মোবাইল নম্বর আবশ্যক');
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  // Final Submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const finalPermAddress = sameAddress ? presentAddress : permanentAddress;

      const payload = {
        student_id: studentId.trim().toUpperCase(),
        full_name_bn: fullNameBn.trim(),
        full_name_en: fullNameEn.trim(),
        photo: photo.trim() || undefined,
        gender,
        date_of_birth: dateOfBirth,
        blood_group: bloodGroup,
        nationality,
        religion,
        birth_registration_number: birthRegNo.trim() || undefined,
        department_id: departmentId,
        class_id: classId,
        section_id: sectionId || undefined,
        roll_number: rollNumber.trim(),
        academic_session: academicSession,
        admission_date: admissionDate,
        previous_institution: previousInstitution.trim() || undefined,
        previous_class: previousClass.trim() || undefined,
        mobile: mobile.trim() || undefined,
        email: email.trim() || undefined,
        present_address: presentAddress.trim() || undefined,
        permanent_address: finalPermAddress.trim() || undefined,
        emergency_contact_name: emergencyContactName.trim(),
        emergency_relationship: emergencyRelationship.trim(),
        emergency_mobile: emergencyMobile.trim(),
        emergency_alternative_mobile: emergencyAltMobile.trim() || undefined,
        emergency_address: emergencyAddress.trim() || undefined,
        status: editStudent ? editStudent.status : ('active' as const),
      };

      let resultStudent: DbStudent;

      if (editStudent) {
        resultStudent = await updateStudent(editStudent.id, payload);
      } else {
        resultStudent = await createStudent(payload);
      }

      onSuccess(resultStudent);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-student-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="add-student-modal-dialog"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editStudent
                  ? (language === 'bn' ? 'শিক্ষার্থীর তথ্য সম্পাদনা' : 'Edit Student Information')
                  : (language === 'bn' ? 'নতুন শিক্ষার্থী ভর্তি ফরম' : 'New Student Admission Form')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'চারটি ধাপে সম্পূর্ণ প্রাতিষ্ঠানিক তথ্য ও অভিভাবকের বিবরণ সংগ্রহ'
                  : 'Complete multi-step admission & guardian records'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={step === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
              ১. ব্যক্তিগত
            </span>
            <span className={step === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
              ২. একাডেমিক
            </span>
            <span className={step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
              ৩. যোগাযোগ ও জরুরী
            </span>
            <span className={step === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
              ৪. পর্যালোচনা
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>ব্যক্তিগত তথ্য (Personal Information)</span>
              </div>

              {/* Photo Input */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    শিক্ষার্থীর ছবির লিংক (Photo URL)
                  </label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    জেপিজি বা পিএনজি ছবির সরাসরি ইউআরএল দিন।
                  </p>
                </div>
              </div>

              {/* Full Name BN & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পূর্ণ নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullNameBn}
                    onChange={(e) => setFullNameBn(e.target.value)}
                    placeholder="যেমন: মুহাম্মদ সাআদ করিম"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পূর্ণ নাম (ইংরেজি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullNameEn}
                    onChange={(e) => setFullNameEn(e.target.value)}
                    placeholder="e.g. Muhammad Saad Karim"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender, DOB, Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    লিঙ্গ (Gender) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as StudentGender)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="male">ছাত্র (Male)</option>
                    <option value="female">ছাত্রী (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জন্ম তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Religion, Nationality, Birth Reg No */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ধর্ম (Religion)
                  </label>
                  <input
                    type="text"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জাতীয়তা
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জন্ম নিবন্ধন / এনআইডি নং
                  </label>
                  <input
                    type="text"
                    value={birthRegNo}
                    onChange={(e) => setBirthRegNo(e.target.value)}
                    placeholder="১৭ সংখ্যার জন্ম নিবন্ধন"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>একাডেমিক তথ্য (Academic Information)</span>
              </div>

              {/* Department, Class, Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    বিভাগ (Department) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => {
                      setDepartmentId(e.target.value);
                      const matchedClass = classes.find((c) => c.department_id === e.target.value);
                      if (matchedClass) setClassId(matchedClass.id);
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === 'bn' ? d.name_bn : d.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জামাত / শ্রেণি (Class) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {filteredClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'bn' ? c.name_bn : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শাখা (Section)
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">সাধারণ / কোনো শাখা নেই</option>
                    {filteredSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'bn' ? s.name_bn : s.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student ID & Class Roll with Live Uniqueness validation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শিক্ষার্থী আইডি (Student ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="MDS-2026-00001"
                    className={`w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border bg-white dark:bg-slate-900 focus:outline-none ${
                      idWarning
                        ? 'border-rose-500 text-rose-600 focus:ring-2 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {idWarning ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {idWarning}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      সিস্টেম অটো-জেনারেটেড ইউনিক আইডি
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ক্লাস রোল (Roll Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="যেমন: ০১"
                    className={`w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border bg-white dark:bg-slate-900 focus:outline-none ${
                      rollWarning
                        ? 'border-rose-500 text-rose-600 focus:ring-2 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {rollWarning ? (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {rollWarning}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      ক্লাসে রোল অবশ্যই ইউনিক হতে হবে
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    সেশন / শিক্ষাবর্ষ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="2026">২০২৬ (১৪৪৭-৪৮ হি.)</option>
                    <option value="2025">২০২৫ (১৪৪৬-৪৭ হি.)</option>
                    <option value="2024">২০২৪ (১৪৪৫-৪৬ হি.)</option>
                  </select>
                </div>
              </div>

              {/* Admission Date, Previous School */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ভর্তির তারিখ
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পূর্ববর্তী মাদ্রাসা / স্কুলের নাম
                  </label>
                  <input
                    type="text"
                    value={previousInstitution}
                    onChange={(e) => setPreviousInstitution(e.target.value)}
                    placeholder="যেমন: দারুল উলুম মাদ্রাসা"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পূর্ববর্তী জামাত / শ্রেণি
                  </label>
                  <input
                    type="text"
                    value={previousClass}
                    onChange={(e) => setPreviousClass(e.target.value)}
                    placeholder="যেমন: নাজেরা"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT & EMERGENCY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>যোগাযোগ ও জরুরী অভিভাবক (Contact & Emergency)</span>
              </div>

              {/* Student Own Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    শিক্ষার্থীর ব্যক্তিগত মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Present & Permanent Address */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  বর্তমান ঠিকানা (Present Address)
                </label>
                <textarea
                  rows={2}
                  value={presentAddress}
                  onChange={(e) => setPresentAddress(e.target.value)}
                  placeholder="গ্রাম/বাসা নং, ডাকঘর, থানা/উপজেলা, জেলা"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAddressCheck"
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="sameAddressCheck" className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  স্থায়ী ঠিকানা বর্তমান ঠিকানার অনুরূপ (Same as Present)
                </label>
              </div>

              {!sameAddress && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    স্থায়ী ঠিকানা (Permanent Address)
                  </label>
                  <textarea
                    rows={2}
                    value={permanentAddress}
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="স্থায়ী ঠিকানা লিখুন..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Emergency Contact Information Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  জরুরী অভিভাবকের তথ্য (Emergency Contact)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      অভিভাবকের নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="পিতা / অভিভাবকের নাম"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      সম্পর্ক (Relationship) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      placeholder="যেমন: পিতা (Father), মাতা (Mother)"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      জরুরী মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyMobile}
                      onChange={(e) => setEmergencyMobile(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      বিকল্প মোবাইল নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={emergencyAltMobile}
                      onChange={(e) => setEmergencyAltMobile(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>তথ্য পর্যালোচনা ও নিশ্চিতকরণ (Review & Confirm)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                {/* Photo & Names */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center overflow-hidden border border-emerald-300 shrink-0">
                    {photo ? (
                      <img src={photo} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-700 font-bold text-lg">
                        {fullNameBn ? fullNameBn.charAt(0) : 'ম'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {fullNameBn}
                    </h4>
                    <p className="text-xs text-slate-500">{fullNameEn}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        আইডি: {studentId}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold">
                        রোল: {rollNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">বিভাগ:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {departments.find((d) => d.id === departmentId)?.name_bn || departmentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">জামাত:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {classes.find((c) => c.id === classId)?.name_bn || classId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">সেশন:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {academicSession}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">লিঙ্গ ও রক্ত:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {gender === 'male' ? 'ছাত্র' : 'ছাত্রী'} • {bloodGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">অভিভাবক:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {emergencyContactName} ({emergencyRelationship})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">জরুরী মোবাইল:</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {emergencyMobile}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-medium">
                  অনুগ্রহ করে নিশ্চিত করুন যে সমস্ত তথ্য নির্ভুলভাবে দেওয়া হয়েছে। সাবমিট বাটনে চাপ দিলে স্বয়ংক্রিয়ভাবে ডাটাবেজে রেকর্ডটি সংরক্ষিত হবে এবং অ্যাক্টিভিটি হিস্ট্রিতে লিপিবদ্ধ হবে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                disabled={isSubmitting}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  if (step === 1) handleNextFromStep1();
                  else if (step === 2) handleNextFromStep2();
                  else if (step === 3) handleNextFromStep3();
                }}
                className="gap-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <span>{language === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : (editStudent ? (language === 'bn' ? 'তথ্য আপডেট করুন' : 'Update Student') : (language === 'bn' ? 'ভর্তি সম্পন্ন করুন' : 'Complete Admission'))}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

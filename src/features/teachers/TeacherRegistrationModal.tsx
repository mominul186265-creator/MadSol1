import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  User,
  Phone,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  DbTeacher,
  TeacherGender,
  TeacherEmploymentType,
  TeacherStatus,
} from '../../types/step3';
import { BloodGroup } from '../../types/step2';
import { RoleSlug } from '../../types/step1';
import { useTeachers } from './useTeachers';

interface TeacherRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: DbTeacher | null;
  onSaved: (teacher: DbTeacher) => void;
}

export const TeacherRegistrationModal: React.FC<TeacherRegistrationModalProps> = ({
  isOpen,
  onClose,
  teacherToEdit,
  onSaved,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const {
    designations,
    departments,
    getNextTeacherId,
    checkIdUnique,
    createTeacher,
    updateTeacher,
    getAvailableUsers,
    connectUserAccount,
    createAndConnectUserAccount,
  } = useTeachers();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [photo, setPhoto] = useState<string>('');
  const [fullNameBn, setFullNameBn] = useState<string>('');
  const [fullNameEn, setFullNameEn] = useState<string>('');
  const [gender, setGender] = useState<TeacherGender>('male');
  const [dateOfBirth, setDateOfBirth] = useState<string>('1990-01-01');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('unknown');
  const [nationality, setNationality] = useState<string>('বাংলাদেশী');
  const [religion, setReligion] = useState<string>('ইসলাম');
  const [identificationNumber, setIdentificationNumber] = useState<string>('');

  // Contact
  const [primaryMobile, setPrimaryMobile] = useState<string>('');
  const [alternativeMobile, setAlternativeMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [presentAddress, setPresentAddress] = useState<string>('');
  const [permanentAddress, setPermanentAddress] = useState<string>('');
  const [sameAsPresent, setSameAsPresent] = useState<boolean>(false);

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyRelationship, setEmergencyRelationship] = useState<string>('পিতা');
  const [emergencyMobile, setEmergencyMobile] = useState<string>('');
  const [emergencyAltMobile, setEmergencyAltMobile] = useState<string>('');

  // Academic & Qualification
  const [highestQualification, setHighestQualification] = useState<string>('দাওরায়ে হাদিস');
  const [educationalBackground, setEducationalBackground] = useState<string>('কওমি ও আলিয়া');
  const [islamicQualification, setIslamicQualification] = useState<string>('হাফেজ ও মাওলানা');
  const [institutionUniversity, setInstitutionUniversity] = useState<string>('');
  const [passingYear, setPassingYear] = useState<string>('2018');
  const [specialization, setSpecialization] = useState<string>('হাদিস ও আরবি সাহিত্য');
  const [experienceYears, setExperienceYears] = useState<number>(5);

  // Employment
  const [teacherId, setTeacherId] = useState<string>('');
  const [designationId, setDesignationId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [employmentType, setEmploymentType] = useState<TeacherEmploymentType>('full_time');
  const [employmentStatus, setEmploymentStatus] = useState<TeacherStatus>('active');

  // Account Linking Mode (only during creation or if no account attached)
  const [accountMode, setAccountMode] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [newAccountEmail, setNewAccountEmail] = useState<string>('');
  const [newAccountMobile, setNewAccountMobile] = useState<string>('');
  const [newAccountPassword, setNewAccountPassword] = useState<string>('');
  const [newAccountRole, setNewAccountRole] = useState<RoleSlug>('teacher');

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // Initialize or reset form
  useEffect(() => {
    if (isOpen) {
      if (teacherToEdit) {
        setPhoto(teacherToEdit.photo || '');
        setFullNameBn(teacherToEdit.full_name_bn);
        setFullNameEn(teacherToEdit.full_name_en);
        setGender(teacherToEdit.gender);
        setDateOfBirth(teacherToEdit.date_of_birth || '1990-01-01');
        setBloodGroup(teacherToEdit.blood_group || 'unknown');
        setNationality(teacherToEdit.nationality || 'বাংলাদেশী');
        setReligion(teacherToEdit.religion || 'ইসলাম');
        setIdentificationNumber(teacherToEdit.identification_number || '');

        setPrimaryMobile(teacherToEdit.primary_mobile);
        setAlternativeMobile(teacherToEdit.alternative_mobile || '');
        setEmail(teacherToEdit.email || '');
        setPresentAddress(teacherToEdit.present_address);
        setPermanentAddress(teacherToEdit.permanent_address);
        setSameAsPresent(teacherToEdit.present_address === teacherToEdit.permanent_address);

        setEmergencyContactName(teacherToEdit.emergency_contact_name);
        setEmergencyRelationship(teacherToEdit.emergency_relationship);
        setEmergencyMobile(teacherToEdit.emergency_mobile);
        setEmergencyAltMobile(teacherToEdit.emergency_alternative_mobile || '');

        setHighestQualification(teacherToEdit.highest_qualification);
        setEducationalBackground(teacherToEdit.educational_background);
        setIslamicQualification(teacherToEdit.islamic_qualification || '');
        setInstitutionUniversity(teacherToEdit.institution_university);
        setPassingYear(teacherToEdit.passing_year || '');
        setSpecialization(teacherToEdit.specialization);
        setExperienceYears(teacherToEdit.experience_years || 0);

        setTeacherId(teacherToEdit.teacher_id);
        setDesignationId(teacherToEdit.designation_id);
        setDepartmentId(teacherToEdit.department_id);
        setJoiningDate(teacherToEdit.joining_date);
        setEmploymentType(teacherToEdit.employment_type);
        setEmploymentStatus(teacherToEdit.employment_status);

        setAccountMode('none');
      } else {
        // New Teacher Mode
        setPhoto('');
        setFullNameBn('');
        setFullNameEn('');
        setGender('male');
        setDateOfBirth('1992-05-15');
        setBloodGroup('O+');
        setNationality('বাংলাদেশী');
        setReligion('ইসলাম');
        setIdentificationNumber('');

        setPrimaryMobile('');
        setAlternativeMobile('');
        setEmail('');
        setPresentAddress('');
        setPermanentAddress('');
        setSameAsPresent(false);

        setEmergencyContactName('');
        setEmergencyRelationship('পিতা');
        setEmergencyMobile('');
        setEmergencyAltMobile('');

        setHighestQualification('দাওরায়ে হাদিস');
        setEducationalBackground('কওমি ও দাওরায়ে হাদিস সনদ');
        setIslamicQualification('মুফতি ও হাফেজ');
        setInstitutionUniversity('দারুল উলুম হাটহাজারী');
        setPassingYear('2019');
        setSpecialization('হাদিস ও আরবি সাহিত্য');
        setExperienceYears(4);

        const nextId = getNextTeacherId('2026');
        setTeacherId(nextId);

        setDesignationId(designations[0]?.id || 'desig-01');
        setDepartmentId(departments[0]?.id || 'dept-01');
        setJoiningDate(new Date().toISOString().slice(0, 10));
        setEmploymentType('full_time');
        setEmploymentStatus('active');

        setAccountMode('none');
        setSelectedUserId('');
        setNewAccountName('');
        setNewAccountEmail('');
        setNewAccountMobile('');
        setNewAccountPassword('');
        setNewAccountRole('teacher');
      }
      setCurrentStep(1);
    }
  }, [isOpen, teacherToEdit, getNextTeacherId, designations, departments]);

  // Load available users for account linking
  useEffect(() => {
    if (isOpen) {
      const users = getAvailableUsers(teacherToEdit?.id);
      setAvailableUsers(users);
    }
  }, [isOpen, getAvailableUsers, teacherToEdit]);

  // Keep permanent address in sync if sameAsPresent is checked
  useEffect(() => {
    if (sameAsPresent) {
      setPermanentAddress(presentAddress);
    }
  }, [sameAsPresent, presentAddress]);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(language === 'bn' ? 'শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please select an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast(language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট হতে পারবে' : 'Image size must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!fullNameBn.trim()) {
        showToast(language === 'bn' ? 'বাংলায় পূর্ণ নাম লিখুন' : 'Full Name (Bangla) is required', 'error');
        return false;
      }
      if (!fullNameEn.trim()) {
        showToast(language === 'bn' ? 'ইংরেজিতে পূর্ণ নাম লিখুন' : 'Full Name (English) is required', 'error');
        return false;
      }
      if (!dateOfBirth) {
        showToast(language === 'bn' ? 'জন্ম তারিখ নির্বাচন করুন' : 'Date of Birth is required', 'error');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!primaryMobile.trim() || primaryMobile.trim().length < 11) {
        showToast(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Valid 11-digit mobile number is required', 'error');
        return false;
      }
      if (!presentAddress.trim()) {
        showToast(language === 'bn' ? 'বর্তমান ঠিকানা লিখুন' : 'Present address is required', 'error');
        return false;
      }
      if (!permanentAddress.trim()) {
        showToast(language === 'bn' ? 'স্থায়ী ঠিকানা লিখুন' : 'Permanent address is required', 'error');
        return false;
      }
      if (!emergencyContactName.trim()) {
        showToast(language === 'bn' ? 'জরুরি যোগাযোগের ব্যক্তির নাম লিখুন' : 'Emergency contact name is required', 'error');
        return false;
      }
      if (!emergencyMobile.trim() || emergencyMobile.trim().length < 11) {
        showToast(language === 'bn' ? 'জরুরি মোবাইল নম্বর দিন (১১ ডিজিট)' : 'Emergency mobile number is required', 'error');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!highestQualification.trim()) {
        showToast(language === 'bn' ? 'সর্বোচ্চ শিক্ষাগত যোগ্যতা লিখুন' : 'Highest qualification is required', 'error');
        return false;
      }
      if (!institutionUniversity.trim()) {
        showToast(language === 'bn' ? 'শিক্ষা প্রতিষ্ঠান / মাদ্রাসার নাম লিখুন' : 'Institution name is required', 'error');
        return false;
      }
      if (!specialization.trim()) {
        showToast(language === 'bn' ? 'বিশেষায়িত বিষয় লিখুন' : 'Specialization is required', 'error');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!teacherId.trim()) {
        showToast(language === 'bn' ? 'শিক্ষক আইডি পূরণ করুন' : 'Teacher ID is required', 'error');
        return false;
      }
      if (!checkIdUnique(teacherId, teacherToEdit?.id)) {
        showToast(language === 'bn' ? 'এই শিক্ষক আইডি ইতিমধ্যে ব্যবহৃত হয়েছে' : 'Teacher ID is already in use', 'error');
        return false;
      }
      if (!designationId) {
        showToast(language === 'bn' ? 'পদবী নির্বাচন করুন' : 'Please select a designation', 'error');
        return false;
      }
      if (!departmentId) {
        showToast(language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Please select a department', 'error');
        return false;
      }
      if (!joiningDate) {
        showToast(language === 'bn' ? 'যোগদানের তারিখ নির্বাচন করুন' : 'Joining date is required', 'error');
        return false;
      }
      return true;
    }

    if (currentStep === 5) {
      if (accountMode === 'existing') {
        if (!selectedUserId) {
          showToast(language === 'bn' ? 'অনুগ্রহ করে একজন ব্যবহারকারী নির্বাচন করুন' : 'Please select a user account', 'error');
          return false;
        }
      } else if (accountMode === 'new') {
        if (!newAccountEmail.trim() || !newAccountEmail.includes('@')) {
          showToast(language === 'bn' ? 'সঠিক ইমেইল এড্রেস লিখুন' : 'Valid email is required', 'error');
          return false;
        }
        if (!newAccountPassword.trim() || newAccountPassword.length < 6) {
          showToast(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters', 'error');
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const teacherPayload = {
        teacher_id: teacherId.trim(),
        full_name_bn: fullNameBn.trim(),
        full_name_en: fullNameEn.trim(),
        photo: photo || undefined,
        gender,
        date_of_birth: dateOfBirth,
        blood_group: bloodGroup,
        nationality: nationality.trim() || 'বাংলাদেশী',
        religion: religion.trim() || 'ইসলাম',
        identification_number: identificationNumber.trim() || undefined,
        primary_mobile: primaryMobile.trim(),
        alternative_mobile: alternativeMobile.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        present_address: presentAddress.trim(),
        permanent_address: permanentAddress.trim(),
        emergency_contact_name: emergencyContactName.trim(),
        emergency_relationship: emergencyRelationship.trim(),
        emergency_mobile: emergencyMobile.trim(),
        emergency_alternative_mobile: emergencyAltMobile.trim() || undefined,
        highestQualification: highestQualification.trim(),
        highest_qualification: highestQualification.trim(),
        educational_background: educationalBackground.trim(),
        islamic_qualification: islamicQualification.trim() || undefined,
        institution_university: institutionUniversity.trim(),
        passing_year: passingYear.trim() || undefined,
        specialization: specialization.trim(),
        experience_years: Number(experienceYears) || 0,
        designation_id: designationId,
        department_id: departmentId,
        joining_date: joiningDate,
        employment_type: employmentType,
        employment_status: employmentStatus,
      };

      let savedTeacher: DbTeacher;

      if (teacherToEdit) {
        const updated = await updateTeacher(teacherToEdit.id, teacherPayload);
        savedTeacher = updated;
        showToast(t.teachers.form.updateSuccess, 'success');
      } else {
        const created = await createTeacher(teacherPayload);
        savedTeacher = created;

        // Handle Account Creation / Linking if requested
        if (accountMode === 'existing' && selectedUserId) {
          await connectUserAccount(savedTeacher.id, selectedUserId);
        } else if (accountMode === 'new') {
          await createAndConnectUserAccount(savedTeacher.id, {
            name: newAccountName.trim() || fullNameBn.trim(),
            email: newAccountEmail.trim().toLowerCase(),
            mobile: newAccountMobile.trim() || primaryMobile.trim(),
            password: newAccountPassword,
            role_id: newAccountRole,
          });
        }

        showToast(t.teachers.form.saveSuccess, 'success');
      }

      onSaved(savedTeacher);
      onClose();
    } catch (err: any) {
      console.error('Error saving teacher:', err);
      showToast(err?.message || t.teachers.form.saveError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: t.teachers.form.step1Title, icon: User },
    { number: 2, title: t.teachers.form.step2Title, icon: Phone },
    { number: 3, title: t.teachers.form.step3Title, icon: GraduationCap },
    { number: 4, title: t.teachers.form.step4Title, icon: Briefcase },
    { number: 5, title: t.teachers.form.step5Title, icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {teacherToEdit ? t.teachers.form.editModalTitle : t.teachers.form.modalTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.teachers.form.modalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isDone = currentStep > step.number;
              const isCurrent = currentStep === step.number;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => {
                    if (step.number < currentStep || validateCurrentStep()) {
                      setCurrentStep(step.number);
                    }
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                      : isDone
                      ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'text-slate-400 dark:text-slate-500 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : isDone
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="hidden sm:block truncate">
                    <p className="text-[10px] font-medium opacity-70">ধাপ {step.number}</p>
                    <p className="text-xs font-semibold truncate">{step.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[62vh] overflow-y-auto space-y-6">
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 w-full max-w-full min-w-0">
                {/* Photo Upload Area */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="relative group w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                    {photo ? (
                      <img src={photo} alt="Teacher" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title={t.teachers.form.uploadPhoto}
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {t.teachers.form.photo}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t.teachers.form.photoHint}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {t.teachers.form.uploadPhoto}
                      </button>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          মুছে ফেলুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name BN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.fullNameBn} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullNameBn}
                      onChange={(e) => setFullNameBn(e.target.value)}
                      placeholder={t.teachers.form.fullNameBnPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Full Name EN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.fullNameEn} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullNameEn}
                      onChange={(e) => setFullNameEn(e.target.value)}
                      placeholder={t.teachers.form.fullNameEnPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.gender}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as TeacherGender)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="male">{t.teachers.gender.male}</option>
                      <option value="female">{t.teachers.gender.female}</option>
                      <option value="other">{t.teachers.gender.other}</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.dateOfBirth} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.bloodGroup}
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="unknown">জানা নেই (Unknown)</option>
                    </select>
                  </div>

                  {/* NID / Passport */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.nidOrPassport}
                    </label>
                    <input
                      type="text"
                      value={identificationNumber}
                      onChange={(e) => setIdentificationNumber(e.target.value)}
                      placeholder={t.teachers.form.nidPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.nationality}
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.religion}
                    </label>
                    <input
                      type="text"
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact & Address */}
            {currentStep === 2 && (
              <div className="space-y-6 w-full max-w-full min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.primaryMobile} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={primaryMobile}
                      onChange={(e) => setPrimaryMobile(e.target.value)}
                      placeholder={t.teachers.form.primaryMobilePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Alternative Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.alternativeMobile}
                    </label>
                    <input
                      type="tel"
                      value={alternativeMobile}
                      onChange={(e) => setAlternativeMobile(e.target.value)}
                      placeholder="018xxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.teachers.form.emailPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Present Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.presentAddress} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={presentAddress}
                      onChange={(e) => setPresentAddress(e.target.value)}
                      placeholder="বাসা নং, রোড, এলাকা, ডাকঘর, উপজেলা, জেলা"
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  {/* Same as present checkbox */}
                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={sameAsPresent}
                        onChange={(e) => setSameAsPresent(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{t.teachers.form.sameAsPresent}</span>
                    </label>
                  </div>

                  {/* Permanent Address */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.permanentAddress} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      disabled={sameAsPresent}
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Emergency Contact Group */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                    জরুরি যোগাযোগ তথ্য (Emergency Contact)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.teachers.form.emergencyContactName} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="অভিভাবক বা নিকটাত্মীয়ের নাম"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.teachers.form.emergencyRelationship} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        placeholder="যেমন: পিতা, বড় ভাই, মামা, চাচা"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.teachers.form.emergencyMobile} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={emergencyMobile}
                        onChange={(e) => setEmergencyMobile(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t.teachers.form.emergencyAltMobile}
                      </label>
                      <input
                        type="tel"
                        value={emergencyAltMobile}
                        onChange={(e) => setEmergencyAltMobile(e.target.value)}
                        placeholder="বিকল্প ফোন নম্বর (ঐচ্ছিক)"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Academic & Qualifications */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Highest Qualification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.highestQualification} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={highestQualification}
                      onChange={(e) => setHighestQualification(e.target.value)}
                      placeholder={t.teachers.form.highestQualificationPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Educational Background */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.educationalBackground}
                    </label>
                    <input
                      type="text"
                      value={educationalBackground}
                      onChange={(e) => setEducationalBackground(e.target.value)}
                      placeholder={t.teachers.form.educationalBackgroundPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Islamic Qualification */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.islamicQualification}
                    </label>
                    <input
                      type="text"
                      value={islamicQualification}
                      onChange={(e) => setIslamicQualification(e.target.value)}
                      placeholder={t.teachers.form.islamicQualificationPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Last Attended Institution */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.institutionUniversity} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={institutionUniversity}
                      onChange={(e) => setInstitutionUniversity(e.target.value)}
                      placeholder={t.teachers.form.institutionPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Passing Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.passingYear}
                    </label>
                    <input
                      type="text"
                      value={passingYear}
                      onChange={(e) => setPassingYear(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.specialization} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder={t.teachers.form.specializationPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Teaching Experience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.experienceYears}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Employment & Role */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teacher ID (System Generated or Custom) */}
                  <div className="md:col-span-2 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                    <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                      {t.teachers.form.teacherIdLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={teacherId}
                        onChange={(e) => setTeacherId(e.target.value.toUpperCase())}
                        placeholder="MDS-T-2026-00001"
                        className="flex-1 px-3.5 py-2.5 rounded-xl font-mono font-bold text-sm bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {!teacherToEdit && (
                        <button
                          type="button"
                          onClick={() => setTeacherId(getNextTeacherId('2026'))}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
                        >
                          পুনরায় তৈরি
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5">
                      {t.teachers.form.teacherIdHint}
                    </p>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.designation} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={designationId}
                      onChange={(e) => setDesignationId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      {designations.map((desig) => (
                        <option key={desig.id} value={desig.id}>
                          {language === 'bn' ? desig.name_bn : desig.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.department} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {language === 'bn' ? dept.name_bn : dept.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.joiningDate} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.employmentTypeLabel}
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as TeacherEmploymentType)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="full_time">{t.teachers.employmentType.full_time}</option>
                      <option value="part_time">{t.teachers.employmentType.part_time}</option>
                      <option value="contract">{t.teachers.employmentType.contract}</option>
                      <option value="temporary">{t.teachers.employmentType.temporary}</option>
                    </select>
                  </div>

                  {/* Initial Employment Status */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.teachers.form.statusLabel}
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value as TeacherStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="active">{t.teachers.status.active}</option>
                      <option value="pending">{t.teachers.status.pending}</option>
                      <option value="on_leave">{t.teachers.status.on_leave}</option>
                      <option value="inactive">{t.teachers.status.inactive}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: System Account & Security */}
            {currentStep === 5 && (
              <div className="space-y-6 w-full max-w-full min-w-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.teachers.form.accountSectionTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.teachers.form.accountSectionDesc}
                  </p>
                </div>

                {/* Account Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      accountMode === 'none'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountMode"
                      checked={accountMode === 'none'}
                      onChange={() => setAccountMode('none')}
                      className="sr-only"
                    />
                    <p className="text-xs font-bold">{t.teachers.form.noAccountForNow}</p>
                    <p className="text-[11px] opacity-70 mt-1">লগইন অ্যাকাউন্ট ছাড়াই কেবল শিক্ষক প্রোফাইল সংরক্ষণ হবে</p>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      accountMode === 'existing'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountMode"
                      checked={accountMode === 'existing'}
                      onChange={() => setAccountMode('existing')}
                      className="sr-only"
                    />
                    <p className="text-xs font-bold">{t.teachers.form.linkExistingUser}</p>
                    <p className="text-[11px] opacity-70 mt-1">সিস্টেমে ইতিমধ্যে তৈরি অ্যাকাউন্ট সংযুক্ত করুন</p>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      accountMode === 'new'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountMode"
                      checked={accountMode === 'new'}
                      onChange={() => {
                        setAccountMode('new');
                        if (!newAccountEmail) setNewAccountEmail(email || '');
                        if (!newAccountMobile) setNewAccountMobile(primaryMobile || '');
                        if (!newAccountName) setNewAccountName(fullNameBn || '');
                      }}
                      className="sr-only"
                    />
                    <p className="text-xs font-bold">{t.teachers.form.createNewAccount}</p>
                    <p className="text-[11px] opacity-70 mt-1">নতুন ইমেইল ও পাসওয়ার্ড দিয়ে একাউন্ট খুলুন</p>
                  </label>
                </div>

                {/* Sub-form: Link Existing User */}
                {accountMode === 'existing' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.teachers.form.selectUser} <span className="text-rose-500">*</span>
                    </label>
                    {availableUsers.length > 0 ? (
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">ব্যবহারকারী নির্বাচন করুন...</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email} - {u.role_id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl">
                        কোনো মুক্ত বা অসংযুক্ত অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নতুন অ্যাকাউন্ট তৈরি করুন।
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-form: Create New User */}
                {accountMode === 'new' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          লগইন নাম
                        </label>
                        <input
                          type="text"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          placeholder="পুরো নাম"
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountRole}
                        </label>
                        <select
                          value={newAccountRole}
                          onChange={(e) => setNewAccountRole(e.target.value as RoleSlug)}
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="teacher">উস্তায / শিক্ষক (Teacher)</option>
                          <option value="principal">মুহতামিম / প্রিন্সিপাল (Principal)</option>
                          <option value="institution_admin">প্রতিষ্ঠান এডমিন (Institution Admin)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountEmail} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={newAccountEmail}
                          onChange={(e) => setNewAccountEmail(e.target.value)}
                          placeholder="teacher@madsol.edu.bd"
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.teachers.form.accountPassword} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={newAccountPassword}
                          onChange={(e) => setNewAccountPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                >
                  পূর্ববর্তী ধাপ
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              >
                বাতিল
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  পরবর্তী ধাপ
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <span>{teacherToEdit ? t.teachers.form.updateBtn : t.teachers.form.submitBtn}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

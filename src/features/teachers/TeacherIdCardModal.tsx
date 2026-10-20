import React, { useRef } from 'react';
import { X, Printer, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DbTeacher, DbTeacherDesignation } from '../../types/step3';
import { DbDepartment } from '../../types/step2';

interface TeacherIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: DbTeacher;
  designations: DbTeacherDesignation[];
  departments: DbDepartment[];
}

export const TeacherIdCardModal: React.FC<TeacherIdCardModalProps> = ({
  isOpen,
  onClose,
  teacher,
  designations,
  departments,
}) => {
  const { t, language } = useLanguage();
  const { institution } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const designationObj = designations.find((d) => d.id === teacher.designation_id);
  const designationName =
    language === 'bn' ? designationObj?.name_bn || teacher.designation_id : designationObj?.name_en || teacher.designation_id;

  const departmentObj = departments.find((d) => d.id === teacher.department_id);
  const departmentName =
    language === 'bn' ? departmentObj?.name_bn || teacher.department_id : departmentObj?.name_en || teacher.department_id;

  const instNameBn = institution?.nameBn || institution?.name || 'দারুল উলুম আল-ইসলামিয়া মাদরাসা';
  const instNameEn = institution?.nameEn || institution?.name || 'Darul Uloom Al-Islamia Madrasa';
  const instAddress = institution?.addressBn || institution?.address || 'ঢাকা, বাংলাদেশ';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.teachers.idCard.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.teachers.idCard.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.teachers.idCard.printButton}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div ref={printRef} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
            {/* FRONT SIDE */}
            <div className="w-72 h-[430px] rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col justify-between overflow-hidden relative text-slate-900 select-none">
              {/* Top Islamic Geometric Pattern Header */}
              <div className="bg-emerald-800 text-white p-3 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <h4 className="text-xs font-bold truncate leading-tight">{instNameBn}</h4>
                </div>
                <p className="text-[9px] text-emerald-100 font-medium tracking-wide uppercase">
                  {instNameEn}
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-[9px] font-semibold text-amber-300 tracking-wider">
                  TEACHER / STAFF ID
                </div>
              </div>

              {/* Photo & Info */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 text-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-600 shadow-inner flex items-center justify-center mb-2.5">
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={teacher.full_name_en} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{teacher.full_name_bn}</h3>
                <p className="text-[11px] font-medium text-slate-600">{teacher.full_name_en}</p>

                <div className="mt-1 px-3 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  {designationName}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{departmentName}</p>

                {/* Key Details Matrix */}
                <div className="w-full mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-left text-[10px]">
                  <div>
                    <span className="text-slate-400 block">{t.teachers.idCard.teacherIdLabel}:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{teacher.teacher_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.teachers.idCard.bloodGroupLabel}:</span>
                    <span className="font-bold text-rose-600">{teacher.blood_group || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.teachers.idCard.mobileLabel}:</span>
                    <span className="font-medium text-slate-800">{teacher.primary_mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.teachers.idCard.joiningDateLabel}:</span>
                    <span className="font-medium text-slate-800">{teacher.joining_date}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="bg-slate-50 border-t border-slate-100 py-1.5 px-3 text-center text-[9px] text-slate-500 flex justify-between items-center">
                <span>{instAddress}</span>
                <span className="font-semibold text-emerald-700">MADS-ID-PASS</span>
              </div>
            </div>

            {/* BACK SIDE */}
            <div className="w-72 h-[430px] rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col justify-between overflow-hidden relative text-slate-900 select-none">
              {/* Back Top Header */}
              <div className="bg-slate-900 text-white p-2.5 text-center">
                <p className="text-[11px] font-bold text-emerald-400">জরুরি তথ্য ও প্রাতিষ্ঠানিক নির্দেশনাবলী</p>
                <p className="text-[9px] text-slate-300">Terms & Emergency Notice</p>
              </div>

              {/* Rules & Emergency Info */}
              <div className="flex-1 p-4 flex flex-col justify-between text-[10px] space-y-2 text-slate-700">
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500 font-medium">জরুরি যোগাযোগ:</span>
                    <span className="font-bold text-slate-800">{teacher.emergency_contact_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500 font-medium">সম্পর্ক:</span>
                    <span className="font-semibold text-slate-800">{teacher.emergency_relationship}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">জরুরি মোবাইল:</span>
                    <span className="font-mono font-bold text-emerald-800">{teacher.emergency_mobile}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-[9.5px] leading-relaxed">
                  <p className="font-semibold mb-1">নির্দেশনা:</p>
                  <p>{t.teachers.idCard.rulesNotice}</p>
                </div>

                {/* Barcode Mockup */}
                <div className="flex flex-col items-center py-1">
                  <div className="flex items-center gap-0.5 h-8">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 3, 1].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w * 1.5}px` }}
                      ></div>
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-slate-500 tracking-widest mt-1">
                    *{teacher.teacher_id}*
                  </span>
                </div>

                {/* Signature */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400">মেয়াদ:</p>
                    <p className="font-bold text-slate-700 text-[10px]">ডিসেম্বর ২০২৭</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-6 border-b border-slate-400 flex items-center justify-center">
                      <span className="font-serif italic text-slate-500 text-[10px]">Muhtamim</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                      {t.teachers.idCard.authorizedSignature}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="bg-emerald-900 text-white py-1.5 px-3 text-center text-[9px] font-medium">
                MadSol Education Management System • Verified Smart ID
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
          প্রিন্ট করার জন্য রঙিন কালার ও হেভি পেপার (PVC বা 300 GSM কার্ড) সুপারিশকৃত।
        </div>
      </div>
    </div>
  );
};

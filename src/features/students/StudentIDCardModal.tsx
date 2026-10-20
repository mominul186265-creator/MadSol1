import React, { useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DbStudent } from '../../types/step2';
import { Button } from '../../components/common/Button';
import { Printer, X, ShieldCheck, QrCode } from 'lucide-react';

interface StudentIDCardModalProps {
  isOpen: boolean;
  student: DbStudent | null;
  onClose: () => void;
  classNameText?: string;
  departmentNameText?: string;
}

export const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({
  isOpen,
  student,
  onClose,
  classNameText,
  departmentNameText,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const institutionName = language === 'bn' 
    ? (institution?.nameBn || institution?.name || 'দারুল উলুম মাদ্রাসা')
    : (institution?.nameEn || institution?.name || 'Darul Uloom Madrasa');

  return (
    <div
      id="student-id-card-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="student-id-card-container"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'শিক্ষার্থী ডিজিটাল আইডি কার্ড' : 'Student Digital ID Card'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {student.student_id} • {student.roll_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="py-6 flex justify-center">
          <div
            ref={printRef}
            id="printable-id-card"
            className="w-[340px] rounded-2xl overflow-hidden shadow-lg border border-emerald-700 bg-white text-slate-900 relative print:shadow-none print:border-emerald-800"
          >
            {/* Card Header */}
            <div className="bg-emerald-800 text-white p-3.5 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                {language === 'bn' ? 'মাদ্রাসা শিক্ষাবোর্ড নিবন্ধিত' : 'Registered Madrasa'}
              </p>
              <h4 className="text-sm font-black tracking-tight leading-tight mt-0.5">
                {institutionName}
              </h4>
              <p className="text-[9px] text-emerald-100/90 mt-0.5">
                {institution?.address || 'ঢাকা, বাংলাদেশ'}
              </p>
            </div>

            {/* Photo & Basic Details */}
            <div className="p-4 flex flex-col items-center text-center">
              <div className="relative -mt-8 mb-2">
                <div className="w-20 h-20 rounded-full border-3 border-white shadow-md overflow-hidden bg-slate-100">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.full_name_bn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-lg">
                      {student.full_name_bn.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <h5 className="text-base font-bold text-slate-900 leading-tight">
                {student.full_name_bn}
              </h5>
              <p className="text-xs text-slate-500 font-medium">{student.full_name_en}</p>

              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                <span>আইডি:</span>
                <span>{student.student_id}</span>
              </div>

              {/* Academic Grid */}
              <div className="w-full mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold">জামাত / শ্রেণি</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {classNameText || 'হিফজুল কুরআন'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold">ক্লাস রোল</span>
                  <span className="font-bold font-mono text-slate-800 block">
                    {student.roll_number}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold">রক্তের গ্রুপ</span>
                  <span className="font-bold text-rose-600 block">
                    {student.blood_group || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold">সেশন</span>
                  <span className="font-bold text-slate-800 block">
                    {student.academic_session}
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="w-full mt-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-left text-[11px]">
                <span className="text-[9px] text-emerald-800 font-bold block uppercase tracking-wider">
                  জরুরী যোগাযোগ (Emergency Contact)
                </span>
                <p className="font-medium text-slate-700 truncate mt-0.5">
                  {student.emergency_contact_name} ({student.emergency_relationship})
                </p>
                <p className="font-mono font-bold text-emerald-900 mt-0.5">
                  {student.emergency_mobile || student.mobile || '০১৭০০০০০০০০'}
                </p>
              </div>

              {/* Barcode & Seal area */}
              <div className="w-full mt-3 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <QrCode className="w-6 h-6 text-slate-700" />
                  <span className="text-[9px] font-mono text-slate-400">VERIFIED</span>
                </div>
                <div className="text-right">
                  <div className="w-20 border-b border-slate-400 mb-0.5" />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    মুহতামিম / অধ্যক্ষ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'প্রিন্ট করার জন্য প্রিন্ট বাটনে চাপ দিন' : 'Click print to print physical badge'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'আইডি কার্ড প্রিন্ট' : 'Print ID Card'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SalaryPayment } from '../../types/finance';
import { Printer, Download, X, CheckCircle2, Award } from 'lucide-react';
import { IslamicPattern } from '../../components/common/IslamicPattern';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaryPayment: SalaryPayment | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  salaryPayment,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();

  if (!isOpen || !salaryPayment) return null;

  const isBn = language === 'bn';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 dark:bg-emerald-900/50 border-b border-emerald-100 dark:border-emerald-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
              <Award className="w-3.5 h-3.5" />
              {isBn ? 'বেতন স্লিপ (Salary Slip)' : 'Official Salary Slip'}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              #{salaryPayment.slipNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              {isBn ? 'প্রিন্ট স্লিপ' : 'Print Slip'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-6 md:p-8 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-100 relative">
          <IslamicPattern opacity={0.03} />

          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-dashed border-emerald-200 dark:border-emerald-800">
            <h2 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {institution?.nameBn || 'দারুল উলুম মাদ্রাসা ও এতিমখানা'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {institution?.nameEn || 'Darul Uloom Madrasa & Orphanage'}
            </p>
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold tracking-wider uppercase">
              {isBn ? 'কর্মকর্তা ও শিক্ষক বেতন বিবরণী' : 'MONTHLY PAYROLL STATEMENT'}
            </div>
          </div>

          {/* Employee & Month Info */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-stone-200 dark:border-emerald-800/80">
            <div className="space-y-1">
              <p><span className="text-stone-500">{isBn ? 'নাম:' : 'Employee Name:'}</span> <strong className="font-semibold text-emerald-900 dark:text-emerald-200">{salaryPayment.employeeNameBn}</strong></p>
              <p><span className="text-stone-500">{isBn ? 'পদবি:' : 'Designation:'}</span> {salaryPayment.designation}</p>
              <p><span className="text-stone-500">{isBn ? 'কর্মী আইডি:' : 'Employee ID:'}</span> <span className="font-mono">{salaryPayment.employeeCode}</span></p>
            </div>
            <div className="space-y-1 text-right">
              <p><span className="text-stone-500">{isBn ? 'স্লিপ নং:' : 'Slip No:'}</span> <strong className="font-mono text-emerald-700 dark:text-emerald-300">{salaryPayment.slipNumber}</strong></p>
              <p><span className="text-stone-500">{isBn ? 'বেতনের মাস:' : 'Salary Month:'}</span> <strong className="text-stone-800 dark:text-stone-100">{salaryPayment.salaryMonth}</strong></p>
              <p><span className="text-stone-500">{isBn ? 'পরিশোধের অবস্থা:' : 'Payment Status:'}</span> <span className="font-semibold uppercase text-emerald-600">{salaryPayment.status}</span></p>
            </div>
          </div>

          {/* Detailed Earnings vs Deductions Table */}
          <div className="grid grid-cols-2 gap-4 my-4">
            {/* Earnings */}
            <div className="border border-stone-200 dark:border-emerald-800 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-900/40 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 border-b border-stone-200 dark:border-emerald-800">
                {isBn ? 'প্রাপ্তি ও সুবিধাসমূহ (Earnings)' : 'Earnings & Allowances'}
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-300">{isBn ? 'মূল বেতন (Basic Salary):' : 'Basic Salary:'}</span>
                  <span className="font-mono">৳{salaryPayment.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-300">{isBn ? 'ভাতা (Allowance):' : 'Allowance:'}</span>
                  <span className="font-mono">৳{salaryPayment.allowance.toLocaleString()}</span>
                </div>
                {salaryPayment.bonus > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>{isBn ? 'ঈদ / বিশেষ বোনাস:' : 'Bonus:'}</span>
                    <span className="font-mono">+ ৳{salaryPayment.bonus.toLocaleString()}</span>
                  </div>
                )}
                {salaryPayment.overtime > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>{isBn ? 'ওভারটাইম / বিশেষ ক্লাস:' : 'Overtime:'}</span>
                    <span className="font-mono">+ ৳{salaryPayment.overtime.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-stone-200 dark:border-emerald-800 rounded-xl overflow-hidden">
              <div className="bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 border-b border-stone-200 dark:border-emerald-800">
                {isBn ? 'কর্তনসমূহ (Deductions)' : 'Deductions & Adjustments'}
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-300">{isBn ? 'অগ্রিম গ্রহণ (Advance):' : 'Advance Taken:'}</span>
                  <span className="font-mono">৳{salaryPayment.advance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-300">{isBn ? 'ছুটি / সাধারণ কর্তন:' : 'General Deduction:'}</span>
                  <span className="font-mono">৳{salaryPayment.deduction.toLocaleString()}</span>
                </div>
                {salaryPayment.fine > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>{isBn ? 'জরিমানা (Fine):' : 'Fine:'}</span>
                    <span className="font-mono">- ৳{salaryPayment.fine.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Net Salary Summary Banner */}
          <div className="p-4 bg-emerald-900 text-white rounded-xl flex items-center justify-between my-5">
            <div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider">{isBn ? 'নীট প্রদেয় বেতন (Net Salary)' : 'Net Payable Salary'}</div>
              <div className="text-2xl font-bold font-mono">৳{salaryPayment.netSalary.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-200">{isBn ? 'পরিশোধিত অর্থ:' : 'Amount Paid:'}</div>
              <div className="text-lg font-bold font-mono text-emerald-100">৳{salaryPayment.paidAmount.toLocaleString()}</div>
              {salaryPayment.dueAmount > 0 && (
                <div className="text-xs text-amber-300 font-medium">{isBn ? 'অবশিষ্ট বকেয়া: ৳' : 'Due: BDT '}{salaryPayment.dueAmount.toLocaleString()}</div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs border-t border-dashed border-emerald-200 dark:border-emerald-800">
            <div>
              <div className="border-b border-stone-400 dark:border-stone-600 pb-1 mb-1 font-serif text-[11px]">
                {salaryPayment.employeeNameBn}
              </div>
              <span className="text-[10px] text-stone-500">{isBn ? 'গ্রহীতার স্বাক্ষর' : 'Employee Signature'}</span>
            </div>
            <div>
              <div className="border-b border-stone-400 dark:border-stone-600 pb-1 mb-1 font-serif text-[11px]">
                {salaryPayment.processedBy}
              </div>
              <span className="text-[10px] text-stone-500">{isBn ? 'হিসাবরক্ষক স্বাক্ষর' : 'Accountant'}</span>
            </div>
            <div>
              <div className="border-b border-stone-400 dark:border-stone-600 pb-1 mb-1 font-serif text-[11px]">
                মাওলানা আবদুল বাতেন
              </div>
              <span className="text-[10px] text-stone-500">{isBn ? 'মুহতামিম / অধ্যক্ষ' : 'Principal / Muhtamim'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

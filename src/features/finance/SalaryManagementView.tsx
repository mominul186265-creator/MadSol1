import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { SalaryStructure, SalaryPayment, PaymentMethod } from '../../types/finance';
import { SalarySlipModal } from './SalarySlipModal';
import {
  Award,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Edit2,
  FileText,
  UserCheck,
  Building2,
} from 'lucide-react';

export const SalaryManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    salaryStructures,
    salaryPayments,
    funds,
    createSalaryStructure,
    updateSalaryStructure,
    generateMonthlyPayroll,
    disburseSalary,
  } = useFinance();

  const isBn = language === 'bn';

  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlipModalPayment, setActiveSlipModalPayment] = useState<SalaryPayment | null>(null);

  // Pay Salary Modal State
  const [payModalStructure, setPayModalStructure] = useState<SalaryStructure | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [overtimeInput, setOvertimeInput] = useState<number>(0);
  const [advanceInput, setAdvanceInput] = useState<number>(0);
  const [deductionInput, setDeductionInput] = useState<number>(0);
  const [fineInput, setFineInput] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bank');
  const [payFundId, setPayFundId] = useState('general');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Add/Edit Employee Structure Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingStructureId, setEditingStructureId] = useState<string | null>(null);
  const [empCode, setEmpCode] = useState('');
  const [empNameBn, setEmpNameBn] = useState('');
  const [empNameEn, setEmpNameEn] = useState('');
  const [empDesignation, setEmpDesignation] = useState('সহকারী শিক্ষক');
  const [empDept, setEmpDept] = useState('হিফজুল কুরআন');
  const [empBasic, setEmpBasic] = useState<number>(18000);
  const [empAllowance, setEmpAllowance] = useState<number>(2000);
  const [empBankDetails, setEmpBankDetails] = useState('');

  // Combine structures with payment records for current selected month
  const monthlyRoster = useMemo(() => {
    return salaryStructures.map(structure => {
      const payment = salaryPayments.find(
        sp => sp.employeeId === structure.employeeId && sp.salaryMonth === selectedMonth
      );
      return {
        structure,
        payment,
      };
    });
  }, [salaryStructures, salaryPayments, selectedMonth]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalPayrollBudget = salaryStructures.reduce(
      (s, str) => s + (str.basicSalary + str.housingAllowance + str.medicalAllowance + str.otherAllowance),
      0
    );

    const paymentsThisMonth = salaryPayments.filter(sp => sp.salaryMonth === selectedMonth);
    const totalPaid = paymentsThisMonth.reduce((s, p) => s + p.paidAmount, 0);
    const pendingDue = Math.max(0, totalPayrollBudget - totalPaid);

    return {
      totalPayrollBudget,
      totalPaid,
      pendingDue,
      employeeCount: salaryStructures.length,
    };
  }, [salaryStructures, salaryPayments, selectedMonth]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return monthlyRoster.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.structure.employeeNameBn.toLowerCase().includes(q) ||
          item.structure.employeeNameEn.toLowerCase().includes(q) ||
          item.structure.employeeCode.toLowerCase().includes(q) ||
          item.structure.designation.toLowerCase().includes(q) ||
          item.structure.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [monthlyRoster, searchQuery]);

  // Open Pay Modal
  const handleOpenPayModal = (structure: SalaryStructure, existingPayment?: SalaryPayment) => {
    setPayModalStructure(structure);
    const basic = structure.basicSalary || 0;
    const allowances = ((structure.housingAllowance || 0) + (structure.medicalAllowance || 0) + (structure.transportAllowance || 0) + (structure.otherAllowance || 0)) || structure.allowance || 0;
    const initialNet = basic + allowances;

    setPayAmount(existingPayment ? existingPayment.dueAmount : initialNet);
    setBonusInput(existingPayment ? existingPayment.bonus : 0);
    setOvertimeInput(existingPayment ? existingPayment.overtime : 0);
    setAdvanceInput(existingPayment ? existingPayment.advance : 0);
    setDeductionInput(existingPayment ? existingPayment.deduction : 0);
    setFineInput(existingPayment ? existingPayment.fine : 0);
  };

  // Submit Pay Salary
  const handleConfirmDisburseSalary = async () => {
    if (!payModalStructure || payAmount <= 0) return;

    try {
      const calculatedAllowance = ((payModalStructure.housingAllowance || 0) +
        (payModalStructure.medicalAllowance || 0) +
        (payModalStructure.transportAllowance || 0) +
        (payModalStructure.otherAllowance || 0)) || payModalStructure.allowance || 0;

      const payment = await disburseSalary({
        employeeId: payModalStructure.employeeId,
        employeeCode: payModalStructure.employeeCode || 'EMP-000',
        employeeNameBn: payModalStructure.employeeNameBn || 'শিক্ষক',
        employeeNameEn: payModalStructure.employeeNameEn || 'Faculty',
        designation: payModalStructure.designation || 'উস্তায',
        department: payModalStructure.department || 'শিক্ষা বিভাগ',
        salaryMonth: selectedMonth,
        basicSalary: payModalStructure.basicSalary || 0,
        allowance: calculatedAllowance,
        bonus: bonusInput,
        overtime: overtimeInput,
        advance: advanceInput,
        deduction: deductionInput,
        fine: fineInput,
        paidAmount: payAmount,
        paymentMethod: payMethod,
        fundId: payFundId,
        accountOrChequeRef: payRef,
        notes: payNotes,
      });

      setPayModalStructure(null);
      setActiveSlipModalPayment(payment);
    } catch (e: any) {
      alert(isBn ? 'বেতন প্রদান সফল হয়নি।' : 'Failed to disburse salary.');
    }
  };

  // Handle Save Employee Structure
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNameBn || !empNameEn || empBasic <= 0) return;

    if (editingStructureId) {
      await updateSalaryStructure(editingStructureId, {
        employeeNameBn: empNameBn,
        employeeNameEn: empNameEn,
        designation: empDesignation,
        department: empDept,
        basicSalary: empBasic,
        housingAllowance: empAllowance,
        bankAccountDetails: empBankDetails,
      });
    } else {
      await createSalaryStructure({
        employeeId: `emp_${Date.now()}`,
        employeeCode: empCode || `EMP-${salaryStructures.length + 101}`,
        employeeNameBn: empNameBn,
        employeeNameEn: empNameEn,
        designation: empDesignation,
        department: empDept,
        basicSalary: empBasic,
        housingAllowance: empAllowance,
        medicalAllowance: 0,
        transportAllowance: 0,
        otherAllowance: 0,
        taxDeduction: 0,
        providentFund: 0,
        bankAccountDetails: empBankDetails,
        isActive: true,
      });
    }

    setIsEmployeeModalOpen(false);
    setEditingStructureId(null);
    setEmpNameBn('');
    setEmpNameEn('');
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            {isBn ? 'বেতন ও পারিশ্রমিক ব্যবস্থাপনা' : 'Payroll & Salary Management'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'শিক্ষক ও কর্মচারী বেতন শিট' : 'Teacher & Staff Payroll'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'মাসিক বেতন কাঠামো তৈরি, বোনাস/অগ্রিম সমন্বয়, ব্যাংক ও নগদ পরিশোধ এবং স্বয়ংক্রিয় বেতন স্লিপ প্রিন্ট।'
              : 'Configure pay scales, compute overtime and deductions, disburse salaries, and generate official slips.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 text-xs font-bold rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-100 shadow-sm"
          >
            <option value="September 2026">সেপ্টেম্বর ২০২৬ (September 2026)</option>
            <option value="August 2026">আগস্ট ২০২৬ (August 2026)</option>
            <option value="July 2026">জুলাই ২০২৬ (July 2026)</option>
          </select>

          <button
            onClick={() => {
              setEditingStructureId(null);
              setEmpCode(`EMP-${salaryStructures.length + 101}`);
              setEmpNameBn('');
              setEmpNameEn('');
              setEmpBasic(18000);
              setEmpAllowance(2000);
              setIsEmployeeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন কর্মী নিবন্ধন' : 'Add Employee'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'মাসিক মোট পেরোল বাজেট' : 'Monthly Payroll Budget'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              ৳{summary.totalPayrollBudget.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{summary.employeeCount} {isBn ? 'জন কর্মকর্তা ও শিক্ষক' : 'employees'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'পরিশোধিত বেতন' : 'Salaries Paid'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-300">
              ৳{summary.totalPaid.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{selectedMonth}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'অবশিষ্ট বকেয়া বেতন' : 'Pending Payroll'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              ৳{summary.pendingDue.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'পরিশোধের অপেক্ষায়' : 'Awaiting payment'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {isBn ? 'কর্মকর্তা ও শিক্ষক সংখ্যা' : 'Active Staff'}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-300">
              {summary.employeeCount}
            </span>
            <span className="text-xs text-stone-500 ml-1">{isBn ? 'জন' : 'staff'}</span>
            <p className="text-[11px] text-stone-500 mt-1">{isBn ? 'নিয়মিত পেরোল সদস্য' : 'On payroll'}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={isBn ? 'শিক্ষক বা কর্মীর নাম, আইডি, পদবি...' : 'Search teacher, ID or designation...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        <button
          onClick={() => generateMonthlyPayroll(selectedMonth)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          {isBn ? 'চলতি মাসের শিট অটো-জেনারেট' : 'Auto-Generate Month Sheet'}
        </button>
      </div>

      {/* Salary Roster Table */}
      <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
            <tr>
              <th className="p-3">কর্মী ও পদবি</th>
              <th className="p-3">বিভাগ</th>
              <th className="p-3 text-right">মূল বেতন</th>
              <th className="p-3 text-right">ভাতা</th>
              <th className="p-3 text-right">বোনাস / অন্যান্য</th>
              <th className="p-3 text-right">কর্তন</th>
              <th className="p-3 text-right">নীট বেতন</th>
              <th className="p-3 text-right">পরিশোধিত</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              <th className="p-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
            {filteredRoster.map(({ structure, payment }) => {
              const allowanceTotal =
                structure.housingAllowance +
                structure.medicalAllowance +
                structure.transportAllowance +
                structure.otherAllowance;
              const bonus = payment?.bonus || 0;
              const overtime = payment?.overtime || 0;
              const advance = payment?.advance || 0;
              const deduction = payment?.deduction || 0;
              const fine = payment?.fine || 0;

              const calculatedNet = payment
                ? payment.netSalary
                : structure.basicSalary + allowanceTotal;
              const paidAmount = payment?.paidAmount || 0;
              const isPaid = payment?.status === 'paid';
              const isPartial = payment?.status === 'partially_paid';

              return (
                <tr key={structure.id} className="hover:bg-stone-50/50 dark:hover:bg-emerald-900/20">
                  <td className="p-3">
                    <div className="font-bold text-emerald-950 dark:text-emerald-100">
                      {structure.employeeNameBn}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {structure.employeeCode} | {structure.designation}
                    </div>
                  </td>
                  <td className="p-3 text-stone-600 dark:text-stone-300">
                    {structure.department}
                  </td>
                  <td className="p-3 text-right font-mono">
                    ৳{structure.basicSalary.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-stone-600 dark:text-stone-300">
                    ৳{allowanceTotal.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600">
                    {bonus + overtime > 0 ? `+৳${(bonus + overtime).toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-600">
                    {advance + deduction + fine > 0 ? `-৳${(advance + deduction + fine).toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-950 dark:text-emerald-100">
                    ৳{calculatedNet.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    ৳{paidAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {isPaid ? (isBn ? 'পরিশোধিত' : 'Paid') : isPartial ? (isBn ? 'আংশিক' : 'Partial') : (isBn ? 'প্রক্রিয়াধীন' : 'Pending')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {payment ? (
                        <button
                          onClick={() => setActiveSlipModalPayment(payment)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition"
                          title={isBn ? 'বেতন স্লিপ দেখুন ও প্রিন্ট করুন' : 'View Salary Slip'}
                        >
                          <FileText className="w-3 h-3" />
                          {isBn ? 'স্লিপ' : 'Slip'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenPayModal(structure)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                        >
                          <CreditCard className="w-3 h-3" />
                          {isBn ? 'বেতন দিন' : 'Pay'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingStructureId(structure.id);
                          setEmpCode(structure.employeeCode);
                          setEmpNameBn(structure.employeeNameBn);
                          setEmpNameEn(structure.employeeNameEn);
                          setEmpDesignation(structure.designation);
                          setEmpDept(structure.department);
                          setEmpBasic(structure.basicSalary);
                          setEmpAllowance(structure.housingAllowance);
                          setEmpBankDetails(structure.bankAccountDetails || '');
                          setIsEmployeeModalOpen(true);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition"
                        title={isBn ? 'কাঠামো সম্পাদনা' : 'Edit Structure'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: PAY SALARY */}
      {payModalStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
                  {isBn ? 'বেতন পরিশোধ ও স্লিপ জেনারেট' : 'Disburse Salary & Issue Slip'}
                </h3>
                <p className="text-xs text-stone-500">
                  {payModalStructure.employeeNameBn} ({payModalStructure.designation}) - {selectedMonth}
                </p>
              </div>
              <button onClick={() => setPayModalStructure(null)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 dark:bg-emerald-900/30">
                <div>
                  <span className="text-stone-500">{isBn ? 'মূল বেতন:' : 'Basic:'}</span>
                  <div className="font-mono font-bold">৳{payModalStructure.basicSalary.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-stone-500">{isBn ? 'ভাতা (Allowance):' : 'Allowances:'}</span>
                  <div className="font-mono font-bold">
                    ৳{(payModalStructure.housingAllowance + payModalStructure.medicalAllowance).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ঈদ / বিশেষ বোনাস:' : 'Bonus (BDT):'}</label>
                  <input
                    type="number"
                    min={0}
                    value={bonusInput}
                    onChange={e => setBonusInput(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ওভারটাইম / বিশেষ ক্লাস:' : 'Overtime:'}</label>
                  <input
                    type="number"
                    min={0}
                    value={overtimeInput}
                    onChange={e => setOvertimeInput(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'অগ্রিম কর্তন (Advance):' : 'Advance Deduction:'}</label>
                  <input
                    type="number"
                    min={0}
                    value={advanceInput}
                    onChange={e => setAdvanceInput(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পরিশোধ মাধ্যম:' : 'Payment Method:'}</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                  >
                    <option value="bank">{isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                    <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                    <option value="mobile_banking">{isBn ? 'মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile Banking'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পরিশোধের তহবিল (Fund):' : 'Disbursement Fund:'}</label>
                  <select
                    value={payFundId}
                    onChange={e => setPayFundId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                  >
                    {funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {isBn ? f.nameBn : f.nameEn} (৳{f.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'পরিশোধিত টাকার পরিমাণ (৳):' : 'Paid Amount (BDT):'}</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 text-base font-bold font-mono rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'চেক নং / ট্রানজ্যাকশন আইডি:' : 'Cheque / Trx Ref:'}</label>
                <input
                  type="text"
                  placeholder="e.g. Cheque #492810"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalStructure(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisburseSalary}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'বেতন পরিশোধ নিশ্চিত করুন' : 'Disburse & Print Slip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {editingStructureId
                ? (isBn ? 'বেতন কাঠামো হালনাগাদ' : 'Edit Employee Salary Structure')
                : (isBn ? 'নতুন কর্মী ও বেতন স্কেল নিবন্ধন' : 'Register New Employee')}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (বাংলা):' : 'Name (Bangla):'}</label>
                  <input
                    type="text"
                    required
                    value={empNameBn}
                    onChange={e => setEmpNameBn(e.target.value)}
                    placeholder="মাওলানা আবদুল্লাহ"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'নাম (English):' : 'Name (English):'}</label>
                  <input
                    type="text"
                    required
                    value={empNameEn}
                    onChange={e => setEmpNameEn(e.target.value)}
                    placeholder="Mawlana Abdullah"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পদবি:' : 'Designation:'}</label>
                  <input
                    type="text"
                    required
                    value={empDesignation}
                    onChange={e => setEmpDesignation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'বিভাগ:' : 'Department:'}</label>
                  <select
                    value={empDept}
                    onChange={e => setEmpDept(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                  >
                    <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
                    <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                    <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা</option>
                    <option value="প্রশাসন ও হিসাব">প্রশাসন ও হিসাব</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'মূল বেতন (Basic):' : 'Basic Salary:'}</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={empBasic}
                    onChange={e => setEmpBasic(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ভাতা (Allowance):' : 'Allowance:'}</label>
                  <input
                    type="number"
                    min={0}
                    value={empAllowance}
                    onChange={e => setEmpAllowance(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ব্যাংক একাউন্ট বিবরণ (ঐচ্ছিক):' : 'Bank Account:'}</label>
                <input
                  type="text"
                  placeholder="Islami Bank A/C: 2050..."
                  value={empBankDetails}
                  onChange={e => setEmpBankDetails(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALARY SLIP MODAL */}
      <SalarySlipModal
        isOpen={!!activeSlipModalPayment}
        onClose={() => setActiveSlipModalPayment(null)}
        salaryPayment={activeSlipModalPayment}
      />
    </div>
  );
};

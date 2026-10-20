import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Fund,
  FeeStructure,
  StudentFee,
  Payment,
  IncomeCategory,
  ExpenseCategory,
  FinancialTransaction,
  Employee,
  SalaryStructure,
  SalaryPayment,
  Donor,
  Donation,
  DonationStatus,
  ChandaMember,
  ChandaPayment,
  FinancialAuditLog,
  DueReminderEvent,
  PaymentMethod,
} from '../types/finance';
import {
  INITIAL_FUNDS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_STUDENT_FEES,
  INITIAL_PAYMENTS,
  INITIAL_INCOME_CATEGORIES,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_EMPLOYEES,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_SALARY_PAYMENTS,
  INITIAL_DONORS,
  INITIAL_DONATIONS,
  INITIAL_CHANDA_MEMBERS,
  INITIAL_CHANDA_PAYMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/financeData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface FinanceContextType {
  // Scoped Data
  funds: Fund[];
  feeStructures: FeeStructure[];
  studentFees: StudentFee[];
  payments: Payment[];
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
  transactions: FinancialTransaction[];
  employees: Employee[];
  salaryStructures: Record<string, SalaryStructure>;
  salaryPayments: SalaryPayment[];
  donors: Donor[];
  donations: Donation[];
  chandaMembers: ChandaMember[];
  chandaPayments: ChandaPayment[];
  auditLogs: FinancialAuditLog[];
  dueReminders: DueReminderEvent[];

  // Statistics
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  totalDonation: number;
  totalDueAmount: number;
  totalDueStudentsCount: number;

  // Fee Structure Ops
  createFeeStructure: (fee: Omit<FeeStructure, 'id' | 'institutionId' | 'createdAt' | 'updatedAt'>) => Promise<FeeStructure>;
  updateFeeStructure: (id: string, updates: Partial<FeeStructure>) => Promise<boolean>;
  toggleFeeStructureStatus: (id: string) => Promise<boolean>;

  // Student Fee Ops
  assignFeeToStudents: (
    feeStructureId: string,
    target: { type: 'all' | 'department' | 'class' | 'individual'; targetId?: string; studentIds?: string[] },
    period: string
  ) => Promise<number>;
  applyStudentDiscount: (studentFeeId: string, discountAmount: number, reason: string) => Promise<boolean>;

  // Fee Collection & Receipt Ops
  collectStudentFeePayment: (params: {
    studentId: string;
    studentCode: string;
    studentNameBn: string;
    studentNameEn: string;
    studentRoll?: string;
    studentClass: string;
    department: string;
    guardianMobile: string;
    paymentMethod: PaymentMethod;
    accountOrTrxRef?: string;
    paidAmount: number;
    discountAmount?: number;
    discountReason?: string;
    fineAmount?: number;
    fundId?: string;
    notes?: string;
    selectedFeeIds: string[];
  }) => Promise<Payment>;
  getPaymentByReceipt: (receiptNumber: string) => Payment | undefined;

  // Due Reminder Event
  triggerDueReminder: (studentId: string, guardianMobile: string, studentName: string, amountDue: number, dueMonth: string) => Promise<DueReminderEvent>;

  // Income & Expense Ops
  addIncome: (params: {
    date: string;
    category: string;
    amount: number;
    fundId: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    description: string;
    payeeOrPayer: string;
    attachmentName?: string;
  }) => Promise<FinancialTransaction>;
  addExpense: (params: {
    date: string;
    category: string;
    amount: number;
    fundId: string;
    paymentMethod: PaymentMethod;
    payeeOrPayer: string;
    description: string;
    referenceNumber?: string;
    approvedBy?: string;
    attachmentName?: string;
  }) => Promise<FinancialTransaction>;
  voidTransaction: (trxId: string, reason: string) => Promise<boolean>;

  // Category Ops
  addIncomeCategory: (nameBn: string, nameEn: string) => Promise<IncomeCategory>;
  addExpenseCategory: (nameBn: string, nameEn: string) => Promise<ExpenseCategory>;

  // Salary & Payroll Ops
  addEmployee: (data: Omit<Employee, 'id' | 'institutionId'>) => Promise<Employee>;
  updateSalaryStructure: (employeeId: string, structure: Partial<SalaryStructure>) => Promise<boolean>;
  generateMonthlyPayroll: (month: string) => Promise<number>;
  paySalary: (params: {
    salaryPaymentId: string;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    fundId?: string;
    notes?: string;
  }) => Promise<SalaryPayment>;

  // Donation & Donor Ops
  addDonor: (data: Omit<Donor, 'id' | 'institutionId' | 'totalDonation' | 'totalChanda' | 'createdAt'>) => Promise<Donor>;
  updateDonor: (id: string, updates: Partial<Donor>) => Promise<boolean>;
  addDonation: (params: {
    donorId: string;
    donorName: string;
    donorMobile: string;
    category: string;
    fundId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    status?: 'pending' | 'verified' | 'rejected';
    trxId?: string;
    channelName?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  }) => Promise<Donation>;
  verifyDonation: (donationId: string, verifiedBy?: string) => Promise<boolean>;
  rejectDonation: (donationId: string, reason?: string) => Promise<boolean>;
  getDonationByReceipt: (receiptNumber: string) => Donation | undefined;
  getDonationsByQuery: (query: string) => Donation[];
  recordDonation?: any;
  registerDonor?: any;

  // Monthly Chanda Ops
  addChandaMember: (data: Omit<ChandaMember, 'id' | 'institutionId' | 'totalPaid' | 'totalDue' | 'createdAt'>) => Promise<ChandaMember>;
  updateChandaMember: (id: string, updates: Partial<ChandaMember>) => Promise<boolean>;
  recordChandaPayment: (params: {
    memberId: string;
    month: string;
    amount: number;
    fundId?: string;
    paymentMethod: PaymentMethod;
  }) => Promise<ChandaPayment>;
  triggerChandaReminder: (memberId: string) => Promise<void>;

  // Fund Ops
  createFund: (data: Omit<Fund, 'id' | 'institutionId' | 'balance' | 'totalIncome' | 'totalExpense'>) => Promise<Fund>;
  transferFund: (sourceFundId: string, destinationFundId: string, amount: number, reason: string) => Promise<boolean>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FUNDS: 'madsol_fin_funds_v1',
  FEE_STRUCTURES: 'madsol_fin_fee_structures_v1',
  STUDENT_FEES: 'madsol_fin_student_fees_v1',
  PAYMENTS: 'madsol_fin_payments_v1',
  INCOME_CATS: 'madsol_fin_income_cats_v1',
  EXPENSE_CATS: 'madsol_fin_expense_cats_v1',
  TRANSACTIONS: 'madsol_fin_transactions_v1',
  EMPLOYEES: 'madsol_fin_employees_v1',
  SALARY_STRUCTURES: 'madsol_fin_salary_structures_v1',
  SALARY_PAYMENTS: 'madsol_fin_salary_payments_v1',
  DONORS: 'madsol_fin_donors_v1',
  DONATIONS: 'madsol_fin_donations_v1',
  CHANDA_MEMBERS: 'madsol_fin_chanda_members_v1',
  CHANDA_PAYMENTS: 'madsol_fin_chanda_payments_v1',
  AUDIT_LOGS: 'madsol_fin_audit_logs_v1',
  DUE_REMINDERS: 'madsol_fin_due_reminders_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
  }
  return fallback;
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, institution } = useAuth();
  const { showToast: toastFn } = useToast();

  const showToast = (
    msgOrObj: string | { title?: string; description?: string; type?: 'success' | 'error' | 'warning' | 'info' },
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    if (typeof msgOrObj === 'string') {
      toastFn(msgOrObj, type);
    } else if (msgOrObj && typeof msgOrObj === 'object') {
      const parts = [msgOrObj.title, msgOrObj.description].filter(Boolean);
      const text = parts.join(': ');
      toastFn(text || 'Action completed', msgOrObj.type || type);
    }
  };

  const currentInstId = institution?.id || 'inst_01';

  // State
  const [funds, setFunds] = useState<Fund[]>(() => loadStored(STORAGE_KEYS.FUNDS, INITIAL_FUNDS));
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => loadStored(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES));
  const [studentFees, setStudentFees] = useState<StudentFee[]>(() => loadStored(STORAGE_KEYS.STUDENT_FEES, INITIAL_STUDENT_FEES));
  const [payments, setPayments] = useState<Payment[]>(() => loadStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS));
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(() => loadStored(STORAGE_KEYS.INCOME_CATS, INITIAL_INCOME_CATEGORIES));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => loadStored(STORAGE_KEYS.EXPENSE_CATS, INITIAL_EXPENSE_CATEGORIES));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => loadStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS));
  const [employees, setEmployees] = useState<Employee[]>(() => loadStored(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES));
  const [salaryStructures, setSalaryStructures] = useState<Record<string, SalaryStructure>>(() => loadStored(STORAGE_KEYS.SALARY_STRUCTURES, INITIAL_SALARY_STRUCTURES));
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(() => loadStored(STORAGE_KEYS.SALARY_PAYMENTS, INITIAL_SALARY_PAYMENTS));
  const [donors, setDonors] = useState<Donor[]>(() => loadStored(STORAGE_KEYS.DONORS, INITIAL_DONORS));
  const [donations, setDonations] = useState<Donation[]>(() => loadStored(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS));
  const [chandaMembers, setChandaMembers] = useState<ChandaMember[]>(() => loadStored(STORAGE_KEYS.CHANDA_MEMBERS, INITIAL_CHANDA_MEMBERS));
  const [chandaPayments, setChandaPayments] = useState<ChandaPayment[]>(() => loadStored(STORAGE_KEYS.CHANDA_PAYMENTS, INITIAL_CHANDA_PAYMENTS));
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>(() => loadStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS));
  const [dueReminders, setDueReminders] = useState<DueReminderEvent[]>(() => loadStored(STORAGE_KEYS.DUE_REMINDERS, []));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FUNDS, JSON.stringify(funds)); }, [funds]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURES, JSON.stringify(feeStructures)); }, [feeStructures]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STUDENT_FEES, JSON.stringify(studentFees)); }, [studentFees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INCOME_CATS, JSON.stringify(incomeCategories)); }, [incomeCategories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSE_CATS, JSON.stringify(expenseCategories)); }, [expenseCategories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(salaryStructures)); }, [salaryStructures]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALARY_PAYMENTS, JSON.stringify(salaryPayments)); }, [salaryPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors)); }, [donors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations)); }, [donations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CHANDA_MEMBERS, JSON.stringify(chandaMembers)); }, [chandaMembers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CHANDA_PAYMENTS, JSON.stringify(chandaPayments)); }, [chandaPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DUE_REMINDERS, JSON.stringify(dueReminders)); }, [dueReminders]);

  // Scoped lists by institution
  const scopedFunds = useMemo(() => funds.filter(f => f.institutionId === currentInstId), [funds, currentInstId]);
  const scopedFeeStructures = useMemo(() => feeStructures.filter(fs => fs.institutionId === currentInstId), [feeStructures, currentInstId]);
  const scopedStudentFees = useMemo(() => studentFees.filter(sf => sf.institutionId === currentInstId), [studentFees, currentInstId]);
  const scopedPayments = useMemo(() => payments.filter(p => p.institutionId === currentInstId), [payments, currentInstId]);
  const scopedIncomeCategories = useMemo(() => incomeCategories.filter(ic => ic.institutionId === currentInstId), [incomeCategories, currentInstId]);
  const scopedExpenseCategories = useMemo(() => expenseCategories.filter(ec => ec.institutionId === currentInstId), [expenseCategories, currentInstId]);
  const scopedTransactions = useMemo(() => transactions.filter(t => t.institutionId === currentInstId), [transactions, currentInstId]);
  const scopedEmployees = useMemo(() => employees.filter(e => e.institutionId === currentInstId), [employees, currentInstId]);
  const scopedSalaryPayments = useMemo(() => salaryPayments.filter(sp => sp.institutionId === currentInstId), [salaryPayments, currentInstId]);
  const scopedDonors = useMemo(() => donors.filter(d => d.institutionId === currentInstId), [donors, currentInstId]);
  const scopedDonations = useMemo(() => donations.filter(d => d.institutionId === currentInstId), [donations, currentInstId]);
  const scopedChandaMembers = useMemo(() => chandaMembers.filter(cm => cm.institutionId === currentInstId), [chandaMembers, currentInstId]);
  const scopedChandaPayments = useMemo(() => chandaPayments.filter(cp => cp.institutionId === currentInstId), [chandaPayments, currentInstId]);
  const scopedAuditLogs = useMemo(() => auditLogs.filter(al => al.institutionId === currentInstId), [auditLogs, currentInstId]);

  // Statistics calculation
  const totalIncome = useMemo(() => {
    return scopedTransactions
      .filter(t => t.type === 'income' && t.status === 'active')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [scopedTransactions]);

  const totalExpense = useMemo(() => {
    return scopedTransactions
      .filter(t => t.type === 'expense' && t.status === 'active')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [scopedTransactions]);

  const currentBalance = useMemo(() => {
    return scopedFunds.reduce((sum, f) => sum + f.balance, 0);
  }, [scopedFunds]);

  const totalDonation = useMemo(() => {
    return scopedDonations.reduce((sum, d) => sum + d.amount, 0);
  }, [scopedDonations]);

  const totalDueAmount = useMemo(() => {
    return scopedStudentFees.reduce((sum, sf) => sum + sf.dueAmount, 0);
  }, [scopedStudentFees]);

  const totalDueStudentsCount = useMemo(() => {
    const studentSet = new Set(scopedStudentFees.filter(sf => sf.dueAmount > 0).map(sf => sf.studentId));
    return studentSet.size;
  }, [scopedStudentFees]);

  // Audit helper
  const logAction = (
    module: FinancialAuditLog['module'],
    action: FinancialAuditLog['action'],
    targetId: string,
    targetRef?: string,
    newValue?: string,
    reason?: string,
    previousValue?: string
  ) => {
    const newLog: FinancialAuditLog = {
      id: `flog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      institutionId: currentInstId,
      timestamp: new Date().toISOString(),
      performedBy: user?.fullNameBn || user?.fullNameEn || 'Authorized Admin',
      performedByRole: user?.role || 'admin',
      module,
      action,
      targetId,
      targetRef,
      newValue,
      previousValue,
      reason,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Fee Structure Ops
  const createFeeStructure = async (
    data: Omit<FeeStructure, 'id' | 'institutionId' | 'createdAt' | 'updatedAt'>
  ): Promise<FeeStructure> => {
    const newFee: FeeStructure = {
      ...data,
      id: `fs_${Date.now()}`,
      institutionId: currentInstId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setFeeStructures(prev => [newFee, ...prev]);
    logAction('fee', 'create', newFee.id, newFee.nameBn, `Created fee structure ${newFee.nameEn} (Amount: ${newFee.amount})`);
    showToast({ title: 'ফি তৈরি হয়েছে', description: `${newFee.nameBn} সফলভাবে যোগ করা হয়েছে।`, type: 'success' });
    return newFee;
  };

  const updateFeeStructure = async (id: string, updates: Partial<FeeStructure>): Promise<boolean> => {
    setFeeStructures(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : f));
    logAction('fee', 'update', id, undefined, JSON.stringify(updates));
    showToast({ title: 'ফি আপডেট হয়েছে', description: 'সফলভাবে পরিবর্তন সংরক্ষিত হয়েছে।', type: 'success' });
    return true;
  };

  const toggleFeeStructureStatus = async (id: string): Promise<boolean> => {
    const fee = feeStructures.find(f => f.id === id);
    if (!fee) return false;
    const nextStatus = !fee.isActive;
    return updateFeeStructure(id, { isActive: nextStatus });
  };

  // Student Fee Assignment
  const assignFeeToStudents = async (
    feeStructureId: string,
    target: { type: 'all' | 'department' | 'class' | 'individual'; targetId?: string; studentIds?: string[] },
    period: string
  ): Promise<number> => {
    const fee = feeStructures.find(f => f.id === feeStructureId);
    if (!fee) throw new Error('Fee structure not found');

    // Filter relevant students from existing student fees or target
    // In our context we create records for matching students
    const targetStudents = (loadStored(STORAGE_KEYS.STUDENT_FEES, INITIAL_STUDENT_FEES) as StudentFee[])
      .filter(sf => sf.institutionId === currentInstId);

    // Group by unique student
    const uniqueStudents = Array.from(new Map(targetStudents.map(s => [s.studentId, s])).values());
    
    let count = 0;
    const newFees: StudentFee[] = [];

    uniqueStudents.forEach(stu => {
      // Check target match
      if (target.type === 'department' && target.targetId && stu.department !== target.targetId) return;
      if (target.type === 'class' && target.targetId && stu.className !== target.targetId) return;
      if (target.type === 'individual' && target.studentIds && !target.studentIds.includes(stu.studentId)) return;

      const newId = `sf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      newFees.push({
        id: newId,
        institutionId: currentInstId,
        studentId: stu.studentId,
        studentCode: stu.studentCode,
        studentNameBn: stu.studentNameBn,
        studentNameEn: stu.studentNameEn,
        department: stu.department,
        className: stu.className,
        rollNumber: stu.rollNumber,
        guardianMobile: stu.guardianMobile,
        feeStructureId: fee.id,
        feeTitleBn: `${fee.nameBn} (${period})`,
        feeTitleEn: `${fee.nameEn} (${period})`,
        feeCategory: fee.category,
        period,
        baseAmount: fee.amount,
        discountAmount: 0,
        fineAmount: 0,
        totalPayable: fee.amount,
        paidAmount: 0,
        dueAmount: fee.amount,
        status: 'due',
        dueDate: `2026-09-${fee.dueDate.padStart(2, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      count++;
    });

    if (newFees.length > 0) {
      setStudentFees(prev => [...newFees, ...prev]);
      logAction('fee', 'create', fee.id, period, `Assigned fee ${fee.nameBn} to ${count} students`);
      showToast({ title: 'ফি বরাদ্দ সম্পন্ন', description: `${count} জন শিক্ষার্থীর ফি সফলভাবে বরাদ্দ করা হয়েছে।`, type: 'success' });
    }
    return count;
  };

  const applyStudentDiscount = async (studentFeeId: string, discountAmount: number, reason: string): Promise<boolean> => {
    setStudentFees(prev => prev.map(sf => {
      if (sf.id !== studentFeeId) return sf;
      const prevDue = sf.dueAmount;
      const newPayable = Math.max(0, sf.baseAmount - discountAmount + sf.fineAmount);
      const newDue = Math.max(0, newPayable - sf.paidAmount);
      const nextStatus = newDue === 0 ? 'paid' : sf.paidAmount > 0 ? 'partial' : 'due';

      logAction('fee', 'update', studentFeeId, sf.studentCode, `Discount: BDT ${discountAmount} applied. Reason: ${reason}`, reason, `Previous Due: BDT ${prevDue}`);

      return {
        ...sf,
        discountAmount,
        discountReason: reason,
        totalPayable: newPayable,
        dueAmount: newDue,
        status: nextStatus,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }));
    showToast({ title: 'ছাড় কার্যকর হয়েছে', description: `৳${discountAmount.toLocaleString()} টাকা ছাড় সফলভাবে সংরক্ষণ করা হয়েছে।`, type: 'success' });
    return true;
  };

  // Fee Collection & Digital Receipt Generator
  const collectStudentFeePayment = async (params: {
    studentId: string;
    studentCode: string;
    studentNameBn: string;
    studentNameEn: string;
    studentRoll?: string;
    studentClass: string;
    department: string;
    guardianMobile: string;
    paymentMethod: PaymentMethod;
    accountOrTrxRef?: string;
    paidAmount: number;
    discountAmount?: number;
    discountReason?: string;
    fineAmount?: number;
    fundId?: string;
    notes?: string;
    selectedFeeIds: string[];
  }): Promise<Payment> => {
    // Generate unique receipt number: MDS-RC-2026-XXXXXX
    const countSeq = payments.length + 1;
    const receiptNumber = `MDS-RC-2026-${String(countSeq).padStart(6, '0')}`;
    const targetFundId = params.fundId || 'general';

    // Calculate item allocation
    const targetFees = studentFees.filter(sf => params.selectedFeeIds.includes(sf.id));
    const subtotal = targetFees.reduce((sum, sf) => sum + sf.dueAmount, 0);
    const discount = params.discountAmount || 0;
    const fine = params.fineAmount || 0;
    const previousDue = subtotal;
    const netPayable = Math.max(0, subtotal - discount + fine);
    const totalPaid = Math.min(params.paidAmount, netPayable);
    const currentDue = Math.max(0, netPayable - totalPaid);

    let remainingPaid = totalPaid;
    const paymentItems = targetFees.map(sf => {
      const allocatedPaid = Math.min(remainingPaid, sf.dueAmount);
      remainingPaid -= allocatedPaid;
      return {
        studentFeeId: sf.id,
        feeTitleBn: sf.feeTitleBn,
        feeTitleEn: sf.feeTitleEn,
        amount: sf.dueAmount,
        paid: allocatedPaid,
      };
    });

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      institutionId: currentInstId,
      receiptNumber,
      studentId: params.studentId,
      studentCode: params.studentCode,
      studentNameBn: params.studentNameBn,
      studentNameEn: params.studentNameEn,
      studentRoll: params.studentRoll,
      studentClass: params.studentClass,
      department: params.department,
      guardianMobile: params.guardianMobile,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: params.paymentMethod,
      accountOrTrxRef: params.accountOrTrxRef,
      subtotal,
      discount,
      fine,
      totalPaid,
      previousDue,
      currentDue,
      fundId: targetFundId,
      items: paymentItems,
      receivedBy: user?.fullNameBn || user?.fullNameEn || 'মোহাম্মদ জসিম উদ্দিন (হিসাবরক্ষক)',
      notes: params.notes,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Update student fee statuses
    setStudentFees(prev => prev.map(sf => {
      const item = paymentItems.find(p => p.studentFeeId === sf.id);
      if (!item) return sf;
      const newPaid = sf.paidAmount + item.paid;
      const newDue = Math.max(0, sf.totalPayable - newPaid);
      const newStatus = newDue === 0 ? 'paid' : newPaid > 0 ? 'partial' : sf.status;
      return {
        ...sf,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }));

    // Record Payment
    setPayments(prev => [newPayment, ...prev]);

    // Create Financial Transaction
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: newPayment.paymentDate,
      type: 'income',
      category: 'শিক্ষার্থী বেতন ও ফি',
      fundId: targetFundId,
      amount: totalPaid,
      paymentMethod: params.paymentMethod,
      referenceNumber: receiptNumber,
      payeeOrPayer: `${params.studentNameBn} (${params.studentCode})`,
      description: `ফি আদায় - রসিদ নং ${receiptNumber}`,
      receivedOrPaidBy: newPayment.receivedBy,
      status: 'active',
      sourceModule: 'fee_collection',
      sourceId: newPayment.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);

    // Update Fund Balance
    setFunds(prev => prev.map(f => {
      if (f.id !== targetFundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance + totalPaid,
        totalIncome: f.totalIncome + totalPaid,
      };
    }));

    // Audit Log
    logAction(
      'fee',
      'create',
      newPayment.id,
      receiptNumber,
      `Payment of BDT ${totalPaid.toLocaleString()} collected for ${params.studentNameBn} (${receiptNumber})`,
      params.notes
    );

    showToast({
      title: 'পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।',
      description: `রসিদ নং: ${receiptNumber} | আদায়কৃত অর্থ: ৳${totalPaid.toLocaleString()}`,
      type: 'success',
    });

    return newPayment;
  };

  const getPaymentByReceipt = (receiptNumber: string) => {
    return payments.find(p => p.receiptNumber === receiptNumber && p.institutionId === currentInstId);
  };

  // Due Reminder Event Trigger (foundation for future automated SMS)
  const triggerDueReminder = async (
    studentId: string,
    guardianMobile: string,
    studentName: string,
    amountDue: number,
    dueMonth: string
  ): Promise<DueReminderEvent> => {
    const newEvent: DueReminderEvent = {
      id: `rem_${Date.now()}`,
      institutionId: currentInstId,
      studentId,
      studentName,
      guardianMobile,
      amountDue,
      dueMonth,
      triggerDate: new Date().toISOString(),
      status: 'queued',
      channel: 'sms',
    };
    setDueReminders(prev => [newEvent, ...prev]);

    logAction('fee', 'create', newEvent.id, studentId, `Due reminder event queued for ${studentName} (${guardianMobile}) - BDT ${amountDue}`);

    showToast({
      title: 'বকেয়া নোটিশ ইভেন্ট তৈরি হয়েছে',
      description: `${studentName}-এর অভিভাবক (${guardianMobile})-কে ৳${amountDue.toLocaleString()} বকেয়া সংক্রান্ত মেসেজ কিউতে যুক্ত করা হয়েছে।`,
      type: 'info',
    });

    return newEvent;
  };

  // Income Operations
  const addIncome = async (params: {
    date: string;
    category: string;
    amount: number;
    fundId: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    description: string;
    payeeOrPayer: string;
    attachmentName?: string;
  }): Promise<FinancialTransaction> => {
    const trxNumber = `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`;
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: trxNumber,
      institutionId: currentInstId,
      date: params.date,
      type: 'income',
      category: params.category,
      fundId: params.fundId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      referenceNumber: params.referenceNumber || trxNumber,
      payeeOrPayer: params.payeeOrPayer,
      description: params.description,
      receivedOrPaidBy: user?.fullNameBn || user?.fullNameEn || 'অফিস ক্যাশিয়ার',
      attachmentName: params.attachmentName,
      status: 'active',
      sourceModule: 'direct_income',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTrx, ...prev]);

    // Update Fund Balance
    setFunds(prev => prev.map(f => {
      if (f.id !== params.fundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance + params.amount,
        totalIncome: f.totalIncome + params.amount,
      };
    }));

    logAction('income', 'create', newTrx.id, trxNumber, `Added income BDT ${params.amount} in ${params.category}`);

    showToast({ title: 'সফলভাবে সংরক্ষণ করা হয়েছে।', description: `আয়: ৳${params.amount.toLocaleString()} জমা করা হয়েছে।`, type: 'success' });
    return newTrx;
  };

  // Expense Operations
  const addExpense = async (params: {
    date: string;
    category: string;
    amount: number;
    fundId: string;
    paymentMethod: PaymentMethod;
    payeeOrPayer: string;
    description: string;
    referenceNumber?: string;
    approvedBy?: string;
    attachmentName?: string;
  }): Promise<FinancialTransaction> => {
    // Check fund balance
    const targetFund = funds.find(f => f.id === params.fundId && f.institutionId === currentInstId);
    if (targetFund && targetFund.balance < params.amount) {
      // Still allow but warn
      showToast({ title: 'সতর্কতা: ফান্ডের ব্যালেন্স কম', description: 'নির্দিষ্ট ফান্ডের বর্তমান ব্যালেন্স অপর্যাপ্ত।', type: 'warning' });
    }

    const trxNumber = `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`;
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: trxNumber,
      institutionId: currentInstId,
      date: params.date,
      type: 'expense',
      category: params.category,
      fundId: params.fundId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      payeeOrPayer: params.payeeOrPayer,
      description: params.description,
      referenceNumber: params.referenceNumber || trxNumber,
      receivedOrPaidBy: user?.fullNameBn || user?.fullNameEn || 'অফিস ক্যাশিয়ার',
      approvedBy: params.approvedBy || 'মাওলানা আবদুল বাতেন (মুহতামিম)',
      attachmentName: params.attachmentName,
      status: 'active',
      sourceModule: 'direct_expense',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTrx, ...prev]);

    // Update Fund Balance
    setFunds(prev => prev.map(f => {
      if (f.id !== params.fundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance - params.amount,
        totalExpense: f.totalExpense + params.amount,
      };
    }));

    logAction('expense', 'create', newTrx.id, trxNumber, `Added expense BDT ${params.amount} in ${params.category}`);

    showToast({ title: 'সফলভাবে সংরক্ষণ করা হয়েছে।', description: `ব্যয়: ৳${params.amount.toLocaleString()} অন্তর্ভুক্ত করা হয়েছে।`, type: 'success' });
    return newTrx;
  };

  // Void/Cancel Transaction (never hard delete)
  const voidTransaction = async (trxId: string, reason: string): Promise<boolean> => {
    const trx = transactions.find(t => t.id === trxId);
    if (!trx) return false;
    if (trx.status === 'voided') {
      showToast({ title: 'ইতিমধ্যে বাতিল করা হয়েছে', description: 'এই লেনদেনটি পূর্বেই বাতিলকৃত।', type: 'error' });
      return false;
    }

    setTransactions(prev => prev.map(t => {
      if (t.id !== trxId) return t;
      return {
        ...t,
        status: 'voided',
        voidReason: reason,
        updatedAt: new Date().toISOString(),
      };
    }));

    // Revert fund balance
    setFunds(prev => prev.map(f => {
      if (f.id !== trx.fundId || f.institutionId !== currentInstId) return f;
      if (trx.type === 'income') {
        return { ...f, balance: f.balance - trx.amount, totalIncome: f.totalIncome - trx.amount };
      } else if (trx.type === 'expense') {
        return { ...f, balance: f.balance + trx.amount, totalExpense: f.totalExpense - trx.amount };
      }
      return f;
    }));

    logAction(
      trx.type === 'income' ? 'income' : 'expense',
      'void',
      trxId,
      trx.transactionNumber,
      `Voided transaction ${trx.transactionNumber} of BDT ${trx.amount}`,
      reason,
      'Status: active'
    );

    showToast({ title: 'লেনদেন বাতিল করা হয়েছে', description: `ভাউচার ${trx.transactionNumber} সফলভাবে ভয়েড (Void) করা হয়েছে।`, type: 'info' });
    return true;
  };

  // Categories
  const addIncomeCategory = async (nameBn: string, nameEn: string): Promise<IncomeCategory> => {
    const newCat: IncomeCategory = {
      id: `inc_cat_${Date.now()}`,
      institutionId: currentInstId,
      nameBn,
      nameEn,
    };
    setIncomeCategories(prev => [...prev, newCat]);
    logAction('income', 'create', newCat.id, nameBn, `Added income category ${nameEn}`);
    return newCat;
  };

  const addExpenseCategory = async (nameBn: string, nameEn: string): Promise<ExpenseCategory> => {
    const newCat: ExpenseCategory = {
      id: `exp_cat_${Date.now()}`,
      institutionId: currentInstId,
      nameBn,
      nameEn,
    };
    setExpenseCategories(prev => [...prev, newCat]);
    logAction('expense', 'create', newCat.id, nameBn, `Added expense category ${nameEn}`);
    return newCat;
  };

  // Salary & Payroll Ops
  const addEmployee = async (data: Omit<Employee, 'id' | 'institutionId'>): Promise<Employee> => {
    const newEmp: Employee = {
      ...data,
      id: `emp_${Date.now()}`,
      institutionId: currentInstId,
    };
    setEmployees(prev => [...prev, newEmp]);
    // Create default salary structure
    const defaultStructure: SalaryStructure = {
      id: `ss_${Date.now()}`,
      institutionId: currentInstId,
      employeeId: newEmp.id,
      basicSalary: 15000,
      allowance: 2000,
      bonus: 0,
      overtime: 0,
      advance: 0,
      deduction: 0,
      fine: 0,
      otherAdjustment: 0,
      netSalary: 17000,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSalaryStructures(prev => ({ ...prev, [newEmp.id]: defaultStructure }));
    logAction('salary', 'create', newEmp.id, newEmp.employeeCode, `Created employee record for ${newEmp.nameBn}`);
    showToast({ title: 'কর্মকর্তা যুক্ত হয়েছে', description: `${newEmp.nameBn} সফলভাবে তালিকায় যোগ করা হয়েছে।`, type: 'success' });
    return newEmp;
  };

  const updateSalaryStructure = async (employeeId: string, structure: Partial<SalaryStructure>): Promise<boolean> => {
    setSalaryStructures(prev => {
      const current = prev[employeeId] || {
        id: `ss_${Date.now()}`,
        institutionId: currentInstId,
        employeeId,
        basicSalary: 0,
        allowance: 0,
        bonus: 0,
        overtime: 0,
        advance: 0,
        deduction: 0,
        fine: 0,
        otherAdjustment: 0,
        netSalary: 0,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const updated = { ...current, ...structure, updatedAt: new Date().toISOString().split('T')[0] };
      // Formula: Basic + Allowance + Bonus + Overtime - Advance - Deduction - Fine + OtherAdjustment
      updated.netSalary = Math.max(
        0,
        (updated.basicSalary || 0) +
        (updated.allowance || 0) +
        (updated.bonus || 0) +
        (updated.overtime || 0) -
        (updated.advance || 0) -
        (updated.deduction || 0) -
        (updated.fine || 0) +
        (updated.otherAdjustment || 0)
      );

      return { ...prev, [employeeId]: updated };
    });

    logAction('salary', 'update', employeeId, undefined, `Updated salary structure for employee ${employeeId}`);
    showToast({ title: 'বেতন কাঠামো সংরক্ষিত', description: 'বেতন স্কেল সফলভাবে পুনর্নির্ধারণ করা হয়েছে।', type: 'success' });
    return true;
  };

  const generateMonthlyPayroll = async (month: string): Promise<number> => {
    const instEmployees = employees.filter(e => e.institutionId === currentInstId && e.status === 'active');
    let generatedCount = 0;
    const newPayments: SalaryPayment[] = [];

    instEmployees.forEach(emp => {
      // Check if already generated for this month
      const exists = salaryPayments.find(sp => sp.employeeId === emp.id && sp.salaryMonth === month);
      if (exists) return;

      const struct = salaryStructures[emp.id] || {
        basicSalary: 15000,
        allowance: 2000,
        bonus: 0,
        overtime: 0,
        advance: 0,
        deduction: 0,
        fine: 0,
        netSalary: 17000,
      };

      const slipNumber = `SLIP-2026-${String(salaryPayments.length + newPayments.length + 1).padStart(6, '0')}`;
      newPayments.push({
        id: `sal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        institutionId: currentInstId,
        slipNumber,
        employeeId: emp.id,
        employeeNameBn: emp.nameBn,
        employeeNameEn: emp.nameEn,
        employeeCode: emp.employeeCode,
        designation: emp.designationBn,
        employeeType: emp.type,
        salaryMonth: month,
        basicSalary: struct.basicSalary,
        allowance: struct.allowance,
        bonus: struct.bonus,
        overtime: struct.overtime,
        advance: struct.advance,
        deduction: struct.deduction,
        fine: struct.fine,
        netSalary: struct.netSalary,
        paidAmount: 0,
        dueAmount: struct.netSalary,
        status: 'pending',
        fundId: 'general',
        processedBy: user?.fullNameBn || user?.fullNameEn || 'অফিস হিসাবরক্ষক',
        createdAt: new Date().toISOString(),
      });
      generatedCount++;
    });

    if (newPayments.length > 0) {
      setSalaryPayments(prev => [...newPayments, ...prev]);
      logAction('salary', 'create', month, undefined, `Generated payroll for ${month} (${generatedCount} employees)`);
      showToast({ title: 'বেতন শিট তৈরি হয়েছে', description: `${month} মাসের জন্য ${generatedCount} জন কর্মীর বেতন তালিকা প্রস্তুত।`, type: 'success' });
    } else {
      showToast({ title: 'ইতিমধ্যে তৈরি রয়েছে', description: `${month} মাসের বেতন শিট পূর্বেই প্রস্তুত করা হয়েছে।`, type: 'info' });
    }

    return generatedCount;
  };

  const paySalary = async (params: {
    salaryPaymentId: string;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    fundId?: string;
    notes?: string;
  }): Promise<SalaryPayment> => {
    const payment = salaryPayments.find(sp => sp.id === params.salaryPaymentId);
    if (!payment) throw new Error('Salary record not found');

    const targetFundId = params.fundId || 'general';
    const newPaid = payment.paidAmount + params.paidAmount;
    const newDue = Math.max(0, payment.netSalary - newPaid);
    const newStatus: SalaryPayment['status'] = newDue === 0 ? 'paid' : 'partially_paid';

    const updatedPayment: SalaryPayment = {
      ...payment,
      paidAmount: newPaid,
      dueAmount: newDue,
      status: newStatus,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: params.paymentMethod,
      fundId: targetFundId,
      notes: params.notes,
    };

    setSalaryPayments(prev => prev.map(sp => sp.id === params.salaryPaymentId ? updatedPayment : sp));

    // Record Transaction
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: updatedPayment.paymentDate!,
      type: 'expense',
      category: payment.employeeType === 'teacher' ? 'উস্তায ও শিক্ষক বেতন' : 'কর্মচারী ও স্টাফ বেতন',
      fundId: targetFundId,
      amount: params.paidAmount,
      paymentMethod: params.paymentMethod,
      referenceNumber: payment.slipNumber,
      payeeOrPayer: `${payment.employeeNameBn} (${payment.designation})`,
      description: `${payment.salaryMonth} মাসের বেতন প্রদান - স্লিপ নং ${payment.slipNumber}`,
      receivedOrPaidBy: user?.fullNameBn || user?.fullNameEn || 'অফিস ক্যাশিয়ার',
      status: 'active',
      sourceModule: 'salary',
      sourceId: payment.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);

    // Deduct Fund
    setFunds(prev => prev.map(f => {
      if (f.id !== targetFundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance - params.paidAmount,
        totalExpense: f.totalExpense + params.paidAmount,
      };
    }));

    logAction('salary', 'update', payment.id, payment.slipNumber, `Paid BDT ${params.paidAmount.toLocaleString()} to ${payment.employeeNameBn}`);

    showToast({ title: 'বেতন পরিশোধিত হয়েছে', description: `স্লিপ নং ${payment.slipNumber} বাবদ ৳${params.paidAmount.toLocaleString()} টাকা প্রদান সম্পন্ন।`, type: 'success' });
    return updatedPayment;
  };

  // Donation Ops
  const addDonor = async (
    data: Omit<Donor, 'id' | 'institutionId' | 'totalDonation' | 'totalChanda' | 'createdAt'>
  ): Promise<Donor> => {
    const newDonor: Donor = {
      ...data,
      id: `dnr_${Date.now()}`,
      institutionId: currentInstId,
      totalDonation: 0,
      totalChanda: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDonors(prev => [newDonor, ...prev]);
    logAction('donation', 'create', newDonor.id, newDonor.mobile, `Added donor ${newDonor.nameBn}`);
    showToast({ title: 'দাতা যুক্ত হয়েছে', description: `${newDonor.nameBn} সফলভাবে দাতা তালিকায় যোগ করা হয়েছে।`, type: 'success' });
    return newDonor;
  };

  const updateDonor = async (id: string, updates: Partial<Donor>): Promise<boolean> => {
    setDonors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    logAction('donation', 'update', id, undefined, JSON.stringify(updates));
    showToast({ title: 'দাতা তথ্য সংরক্ষিত', description: 'সফলভাবে পরিবর্তন হালনাগাদ করা হয়েছে।', type: 'success' });
    return true;
  };

  const addDonation = async (params: {
    donorId: string;
    donorName: string;
    donorMobile: string;
    category: string;
    fundId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    status?: 'pending' | 'verified' | 'rejected';
    trxId?: string;
    channelName?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  }): Promise<Donation> => {
    const isOnlinePending = params.status === 'pending';
    const status: DonationStatus = params.status || 'verified';
    const receiptNumber = `MDS-DN-2026-${String(donations.length + 1).padStart(6, '0')}`;
    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      receiptNumber,
      institutionId: currentInstId,
      donorId: params.donorId,
      donorName: params.donorName,
      donorNameBn: params.donorName,
      donorMobile: params.donorMobile,
      category: params.category,
      fundId: params.fundId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      referenceNumber: params.referenceNumber,
      trxId: params.trxId,
      channelName: params.channelName,
      notes: params.notes,
      receivedBy: isOnlinePending
        ? 'অনলাইন পোর্টাল (যাচাই সাপেক্ষ)'
        : (user?.fullNameBn || user?.fullNameEn || 'মাওলানা আবদুল বাতেন (মুহতামিম)'),
      donationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status,
      verifiedBy: status === 'verified' ? (user?.fullNameBn || user?.fullNameEn || 'মাওলানা আবদুল বাতেন (মুহতামিম)') : undefined,
      verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
    };

    setDonations(prev => [newDonation, ...prev]);

    // ONLY deposit into fund & record active ledger transaction if verified
    if (status === 'verified') {
      // Update Donor Record
      setDonors(prev => prev.map(d => {
        if (d.id !== params.donorId) return d;
        return { ...d, totalDonation: d.totalDonation + params.amount };
      }));

      // Record Transaction
      const newTrx: FinancialTransaction = {
        id: `trx_${Date.now()}`,
        transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
        institutionId: currentInstId,
        date: newDonation.donationDate,
        type: 'income',
        category: params.category,
        fundId: params.fundId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        referenceNumber: receiptNumber,
        payeeOrPayer: `${params.donorName} (${params.donorMobile})`,
        description: `দান ও ফান্ড জমা - রসিদ নং ${receiptNumber}`,
        receivedOrPaidBy: newDonation.receivedBy,
        status: 'active',
        sourceModule: 'donation',
        sourceId: newDonation.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransactions(prev => [newTrx, ...prev]);

      // Update Fund Balance
      setFunds(prev => prev.map(f => {
        if (f.id !== params.fundId || f.institutionId !== currentInstId) return f;
        return {
          ...f,
          balance: f.balance + params.amount,
          totalIncome: f.totalIncome + params.amount,
        };
      }));

      logAction('donation', 'create', newDonation.id, receiptNumber, `Donation BDT ${params.amount} received from ${params.donorName}`);

      showToast({
        title: 'দান সফলভাবে গ্রহণ করা হয়েছে।',
        description: `রসিদ নং: ${receiptNumber} | অনুদানের পরিমাণ: ৳${params.amount.toLocaleString()}`,
        type: 'success',
      });
    } else {
      // Pending verification
      logAction('donation', 'create', newDonation.id, receiptNumber, `Online pending donation BDT ${params.amount} from ${params.donorName} (TrxID: ${params.trxId || 'N/A'})`);
      showToast({
        title: 'অনুদান তথ্য জমা হয়েছে (যাচাই সাপেক্ষ)',
        description: `রসিদ নং: ${receiptNumber}। মাদরাসা কর্তৃপক্ষ বিকাশ/নগদ TrxID মিলিয়ে অনুমোদন দিলে এটি স্থায়ী হবে।`,
        type: 'info',
      });
    }

    return newDonation;
  };

  const verifyDonation = async (donationId: string, verifiedBy?: string): Promise<boolean> => {
    const target = donations.find(d => d.id === donationId);
    if (!target) return false;
    if (target.status === 'verified') {
      showToast({ title: 'ইতিমধ্যে ভেরিফাইড', description: 'এই অনুদানটি আগেই অনুমোদন করা হয়েছে।', type: 'info' });
      return true;
    }

    const approverName = verifiedBy || user?.fullNameBn || user?.fullNameEn || 'মাওলানা আবদুল বাতেন (মুহতামিম)';
    const verifiedAt = new Date().toISOString();

    // 1. Update Donation Status
    setDonations(prev => prev.map(d => {
      if (d.id !== donationId) return d;
      return {
        ...d,
        status: 'verified',
        verifiedBy: approverName,
        verifiedAt,
        receivedBy: approverName,
      };
    }));

    // 2. Deposit into fund balance
    setFunds(prev => prev.map(f => {
      if (f.id !== target.fundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance + target.amount,
        totalIncome: f.totalIncome + target.amount,
      };
    }));

    // 3. Create real income transaction
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: target.category,
      fundId: target.fundId,
      amount: target.amount,
      paymentMethod: target.paymentMethod,
      referenceNumber: target.receiptNumber,
      payeeOrPayer: `${target.donorName} (${target.donorMobile})`,
      description: `অনলাইন দান যাচাই ও অনুমোদন - রসিদ নং ${target.receiptNumber} (TrxID: ${target.trxId || target.referenceNumber || 'N/A'})`,
      receivedOrPaidBy: approverName,
      status: 'active',
      sourceModule: 'donation',
      sourceId: target.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);

    // 4. Update Donor stats
    setDonors(prev => prev.map(d => {
      if (d.id !== target.donorId && d.mobile !== target.donorMobile) return d;
      return { ...d, totalDonation: d.totalDonation + target.amount };
    }));

    logAction('donation', 'update', target.id, target.receiptNumber, `Donation BDT ${target.amount} verified by ${approverName}`);
    showToast({
      title: 'অনুদান সফলভাবে ভেরিফাই ও অনুমোদিত!',
      description: `রসিদ নং: ${target.receiptNumber} বাবদ ৳${target.amount.toLocaleString()} তহবিলে যুক্ত হয়েছে।`,
      type: 'success',
    });

    return true;
  };

  const rejectDonation = async (donationId: string, reason?: string): Promise<boolean> => {
    const target = donations.find(d => d.id === donationId);
    if (!target) return false;

    setDonations(prev => prev.map(d => {
      if (d.id !== donationId) return d;
      return {
        ...d,
        status: 'rejected',
        rejectionReason: reason || 'টাকা পাওয়া যায়নি বা ভুয়া ট্রানজেকশন আইডি',
      };
    }));

    logAction('donation', 'void', target.id, target.receiptNumber, `Rejected: ${reason || 'Invalid TrxID'}`);
    showToast({
      title: 'অনুদানটি প্রত্যাখ্যান করা হয়েছে',
      description: `রসিদ নং: ${target.receiptNumber} বাতিল চিহ্নিত করা হয়েছে।`,
      type: 'warning',
    });
    return true;
  };

  const getDonationByReceipt = (receiptNumber: string) => {
    return donations.find(d => d.receiptNumber === receiptNumber && d.institutionId === currentInstId);
  };

  const getDonationsByQuery = (query: string): Donation[] => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return donations.filter(d =>
      d.institutionId === currentInstId &&
      (d.receiptNumber.toLowerCase().includes(clean) ||
       d.donorMobile.includes(clean) ||
       (d.trxId && d.trxId.toLowerCase().includes(clean)) ||
       d.donorName.toLowerCase().includes(clean))
    );
  };

  // Monthly Chanda Ops
  const addChandaMember = async (
    data: Omit<ChandaMember, 'id' | 'institutionId' | 'totalPaid' | 'totalDue' | 'createdAt'>
  ): Promise<ChandaMember> => {
    const newMember: ChandaMember = {
      ...data,
      id: `chm_${Date.now()}`,
      institutionId: currentInstId,
      totalPaid: 0,
      totalDue: data.monthlyAmount,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setChandaMembers(prev => [newMember, ...prev]);
    logAction('chanda', 'create', newMember.id, newMember.mobile, `Added Chanda member ${newMember.memberNameBn}`);
    showToast({ title: 'চাঁদা সদস্য নিবন্ধিত', description: `${newMember.memberNameBn} সদস্য তালিকায় যুক্ত হয়েছেন।`, type: 'success' });
    return newMember;
  };

  const updateChandaMember = async (id: string, updates: Partial<ChandaMember>): Promise<boolean> => {
    setChandaMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    logAction('chanda', 'update', id, undefined, JSON.stringify(updates));
    showToast({ title: 'সদস্য তথ্য হালনাগাদ', description: 'সফলভাবে পরিবর্তন সংরক্ষিত হয়েছে।', type: 'success' });
    return true;
  };

  const recordChandaPayment = async (params: {
    memberId: string;
    month: string;
    amount: number;
    fundId?: string;
    paymentMethod: PaymentMethod;
  }): Promise<ChandaPayment> => {
    const member = chandaMembers.find(m => m.id === params.memberId);
    if (!member) throw new Error('Chanda member not found');

    const receiptNumber = `MDS-CH-2026-${String(chandaPayments.length + 1).padStart(6, '0')}`;
    const targetFundId = params.fundId || 'general';

    const newPayment: ChandaPayment = {
      id: `chp_${Date.now()}`,
      receiptNumber,
      institutionId: currentInstId,
      memberId: params.memberId,
      memberName: member.memberNameBn,
      month: params.month,
      amount: params.amount,
      fundId: targetFundId,
      paymentMethod: params.paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      receivedBy: user?.fullNameBn || user?.fullNameEn || 'অফিস ক্যাশিয়ার',
      createdAt: new Date().toISOString(),
    };

    setChandaPayments(prev => [newPayment, ...prev]);

    // Update Member Record
    setChandaMembers(prev => prev.map(m => {
      if (m.id !== params.memberId) return m;
      const newPaid = m.totalPaid + params.amount;
      const newDue = Math.max(0, m.totalDue - params.amount);
      const newStatus: ChandaMember['status'] = newDue === 0 ? 'paid' : newPaid > 0 ? 'partial' : m.status;
      return {
        ...m,
        totalPaid: newPaid,
        totalDue: newDue,
        status: newStatus,
        lastPaymentDate: newPayment.paymentDate,
      };
    }));

    // Record Transaction
    const newTrx: FinancialTransaction = {
      id: `trx_${Date.now()}`,
      transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: newPayment.paymentDate,
      type: 'income',
      category: 'মাসিক চাঁদা',
      fundId: targetFundId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      referenceNumber: receiptNumber,
      payeeOrPayer: `${member.memberNameBn} (${member.mobile})`,
      description: `${params.month} মাসের চাঁদা আদায় - রসিদ নং ${receiptNumber}`,
      receivedOrPaidBy: newPayment.receivedBy,
      status: 'active',
      sourceModule: 'chanda',
      sourceId: newPayment.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTrx, ...prev]);

    // Update Fund
    setFunds(prev => prev.map(f => {
      if (f.id !== targetFundId || f.institutionId !== currentInstId) return f;
      return {
        ...f,
        balance: f.balance + params.amount,
        totalIncome: f.totalIncome + params.amount,
      };
    }));

    logAction('chanda', 'create', newPayment.id, receiptNumber, `Chanda BDT ${params.amount} collected from ${member.memberNameBn}`);

    showToast({ title: 'চাঁদা আদায় সম্পন্ন', description: `৳${params.amount.toLocaleString()} টাকা চাঁদা সফলভাবে জমা হয়েছে।`, type: 'success' });
    return newPayment;
  };

  const triggerChandaReminder = async (memberId: string): Promise<void> => {
    const member = chandaMembers.find(m => m.id === memberId);
    if (!member) return;
    logAction('chanda', 'create', memberId, member.mobile, `Chanda due reminder notification queued for ${member.memberNameBn}`);
    showToast({
      title: 'চাঁদা তাগাদা নোটিশ',
      description: `${member.memberNameBn} (${member.mobile})-কে মাসিক চাঁদা সংক্রান্ত নোটিশ পাঠানো হয়েছে।`,
      type: 'info',
    });
  };

  // Fund Ops
  const createFund = async (
    data: Omit<Fund, 'id' | 'institutionId' | 'balance' | 'totalIncome' | 'totalExpense'>
  ): Promise<Fund> => {
    const newFund: Fund = {
      ...data,
      id: `fnd_${Date.now()}`,
      institutionId: currentInstId,
      balance: 0,
      totalIncome: 0,
      totalExpense: 0,
    };
    setFunds(prev => [...prev, newFund]);
    logAction('fund', 'create', newFund.id, newFund.code, `Created separate fund: ${newFund.nameBn}`);
    showToast({ title: 'তহবিল তৈরি হয়েছে', description: `${newFund.nameBn} সফলভাবে যুক্ত করা হয়েছে।`, type: 'success' });
    return newFund;
  };

  const transferFund = async (
    sourceFundId: string,
    destinationFundId: string,
    amount: number,
    reason: string
  ): Promise<boolean> => {
    const source = funds.find(f => f.id === sourceFundId && f.institutionId === currentInstId);
    const dest = funds.find(f => f.id === destinationFundId && f.institutionId === currentInstId);

    if (!source || !dest) {
      showToast({ title: 'ত্রুটি', description: 'উৎস বা গন্তব্য ফান্ড পাওয়া যায়নি।', type: 'error' });
      return false;
    }

    if (source.isRestricted && !dest.isRestricted) {
      // Religious restriction safeguard (e.g. Zakat to general)
      showToast({
        title: 'শরীয়াহ সীমাবদ্ধতা',
        description: 'যাকাত বা লিল্লাহ ফান্ডের টাকা সাধারণ তহবিলে স্থানান্তর শরিয়তসম্মত নয়।',
        type: 'error',
      });
      return false;
    }

    if (source.balance < amount) {
      showToast({ title: 'অপর্যাপ্ত ব্যালেন্স', description: `${source.nameBn}-এ পর্যাপ্ত ব্যালেন্স নেই।`, type: 'error' });
      return false;
    }

    const transferRef = `FTR-2026-${Date.now().toString().slice(-6)}`;

    // Update fund balances
    setFunds(prev => prev.map(f => {
      if (f.institutionId !== currentInstId) return f;
      if (f.id === sourceFundId) return { ...f, balance: f.balance - amount, totalExpense: f.totalExpense + amount };
      if (f.id === destinationFundId) return { ...f, balance: f.balance + amount, totalIncome: f.totalIncome + amount };
      return f;
    }));

    // Record source debit transaction
    const debitTrx: FinancialTransaction = {
      id: `trx_${Date.now()}_d`,
      transactionNumber: `TRX-2026-${String(transactions.length + 1).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: new Date().toISOString().split('T')[0],
      type: 'fund_transfer',
      category: 'তহবিল স্থানান্তর (ডেবিট)',
      fundId: sourceFundId,
      amount,
      paymentMethod: 'bank',
      referenceNumber: transferRef,
      payeeOrPayer: dest.nameBn,
      description: `${source.nameBn} হতে ${dest.nameBn}-এ স্থানান্তর। কারণ: ${reason}`,
      receivedOrPaidBy: user?.fullNameBn || user?.fullNameEn || 'Authorized Admin',
      status: 'active',
      sourceModule: 'fund_transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Record dest credit transaction
    const creditTrx: FinancialTransaction = {
      id: `trx_${Date.now()}_c`,
      transactionNumber: `TRX-2026-${String(transactions.length + 2).padStart(6, '0')}`,
      institutionId: currentInstId,
      date: new Date().toISOString().split('T')[0],
      type: 'fund_transfer',
      category: 'তহবিল স্থানান্তর (ক্রেডিট)',
      fundId: destinationFundId,
      amount,
      paymentMethod: 'bank',
      referenceNumber: transferRef,
      payeeOrPayer: source.nameBn,
      description: `${source.nameBn} হতে ${dest.nameBn}-এ স্থানান্তর। কারণ: ${reason}`,
      receivedOrPaidBy: user?.fullNameBn || user?.fullNameEn || 'Authorized Admin',
      status: 'active',
      sourceModule: 'fund_transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions(prev => [creditTrx, debitTrx, ...prev]);

    logAction('fund', 'transfer', transferRef, `${source.code} -> ${dest.code}`, `Transferred BDT ${amount} from ${source.nameBn} to ${dest.nameBn}`, reason);

    showToast({
      title: 'তহবিল স্থানান্তর সম্পন্ন',
      description: `৳${amount.toLocaleString()} টাকা ${source.nameBn} হতে ${dest.nameBn}-এ সফলভাবে স্থানান্তর করা হয়েছে।`,
      type: 'success',
    });

    return true;
  };

  const value = {
    funds: scopedFunds,
    feeStructures: scopedFeeStructures,
    studentFees: scopedStudentFees,
    payments: scopedPayments,
    incomeCategories: scopedIncomeCategories,
    expenseCategories: scopedExpenseCategories,
    transactions: scopedTransactions,
    employees: scopedEmployees,
    salaryStructures,
    salaryPayments: scopedSalaryPayments,
    donors: scopedDonors,
    donations: scopedDonations,
    chandaMembers: scopedChandaMembers,
    chandaPayments: scopedChandaPayments,
    auditLogs: scopedAuditLogs,
    dueReminders,

    totalIncome,
    totalExpense,
    currentBalance,
    totalDonation,
    totalDueAmount,
    totalDueStudentsCount,

    createFeeStructure,
    updateFeeStructure,
    toggleFeeStructureStatus,
    assignFeeToStudents,
    applyStudentDiscount,
    collectStudentFeePayment,
    getPaymentByReceipt,
    triggerDueReminder,
    addIncome,
    addExpense,
    voidTransaction,
    addIncomeCategory,
    addExpenseCategory,
    addEmployee,
    updateSalaryStructure,
    generateMonthlyPayroll,
    paySalary,
    addDonor,
    updateDonor,
    addDonation,
    verifyDonation,
    rejectDonation,
    getDonationByReceipt,
    getDonationsByQuery,
    recordDonation: addDonation,
    registerDonor: addDonor,
    addChandaMember,
    updateChandaMember,
    recordChandaPayment,
    triggerChandaReminder,
    createFund,
    transferFund,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

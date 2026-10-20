import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { FeeStructure, FeeFrequency, PaymentMethod, StudentFee } from '../../types/finance';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Percent,
  CreditCard,
  Building2,
  Smartphone,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Tag,
  DollarSign,
  Filter,
} from 'lucide-react';

export const FeeManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    feeStructures,
    studentFees,
    payments,
    createFeeStructure,
    toggleFeeStructureStatus,
    assignFeeToStudents,
    applyStudentDiscount,
    collectStudentFeePayment,
    funds,
  } = useFinance();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'collection' | 'structures' | 'assignment' | 'registry'>('collection');

  // Collection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('stu_02'); // Default selected for instant usability
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>(['sf_03', 'sf_04']);
  const [paidAmountInput, setPaidAmountInput] = useState<number>(1000);
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState('');
  const [fineInput, setFineInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [trxRef, setTrxRef] = useState('');
  const [targetFundId, setTargetFundId] = useState('general');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [activeReceiptModal, setActiveReceiptModal] = useState<any | null>(null);

  // Fee Structure Modal State
  const [isAddStructureOpen, setIsAddStructureOpen] = useState(false);
  const [newFeeNameBn, setNewFeeNameBn] = useState('');
  const [newFeeNameEn, setNewFeeNameEn] = useState('');
  const [newCategory, setNewCategory] = useState('monthly_tuition');
  const [newDepartment, setNewDepartment] = useState('all');
  const [newClassId, setNewClassId] = useState('all');
  const [newAmount, setNewAmount] = useState<number>(1500);
  const [newFrequency, setNewFrequency] = useState<FeeFrequency>('monthly');
  const [newDueDate, setNewDueDate] = useState('10');
  const [newLateFine, setNewLateFine] = useState<number>(100);
  const [newDescription, setNewDescription] = useState('');

  // Fee Assignment Modal State
  const [assignFeeStructureId, setAssignFeeStructureId] = useState(feeStructures[0]?.id || '');
  const [assignTargetType, setAssignTargetType] = useState<'all' | 'department' | 'class'>('all');
  const [assignTargetDept, setAssignTargetDept] = useState('হিফজুল কুরআন');
  const [assignTargetClass, setAssignTargetClass] = useState('all');
  const [assignPeriod, setAssignPeriod] = useState('September 2026');

  // Registry Filter State
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState<string>('all');
  const [registryDeptFilter, setRegistryDeptFilter] = useState<string>('all');

  // Discount Modal State
  const [discountModalFee, setDiscountModalFee] = useState<StudentFee | null>(null);
  const [discountModalAmount, setDiscountModalAmount] = useState<number>(0);
  const [discountModalReason, setDiscountModalReason] = useState('');

  // Extract unique students with pending or active fees
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, {
      studentId: string;
      studentCode: string;
      studentNameBn: string;
      studentNameEn: string;
      department: string;
      className: string;
      rollNumber?: string;
      guardianMobile: string;
      unpaidCount: number;
      totalDue: number;
    }>();

    studentFees.forEach(sf => {
      if (!map.has(sf.studentId)) {
        map.set(sf.studentId, {
          studentId: sf.studentId,
          studentCode: sf.studentCode,
          studentNameBn: sf.studentNameBn,
          studentNameEn: sf.studentNameEn,
          department: sf.department,
          className: sf.className,
          rollNumber: sf.rollNumber,
          guardianMobile: sf.guardianMobile,
          unpaidCount: 0,
          totalDue: 0,
        });
      }
      const entry = map.get(sf.studentId)!;
      if (sf.dueAmount > 0) {
        entry.unpaidCount += 1;
        entry.totalDue += sf.dueAmount;
      }
    });

    return Array.from(map.values());
  }, [studentFees]);

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return uniqueStudents;
    const q = searchQuery.toLowerCase();
    return uniqueStudents.filter(
      s =>
        s.studentNameBn.toLowerCase().includes(q) ||
        s.studentNameEn.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.guardianMobile.includes(q) ||
        (s.rollNumber && s.rollNumber.includes(q))
    );
  }, [uniqueStudents, searchQuery]);

  // Selected Student's Fees
  const selectedStudent = useMemo(() => {
    return uniqueStudents.find(s => s.studentId === selectedStudentId);
  }, [uniqueStudents, selectedStudentId]);

  const selectedStudentFees = useMemo(() => {
    if (!selectedStudentId) return [];
    return studentFees.filter(sf => sf.studentId === selectedStudentId);
  }, [studentFees, selectedStudentId]);

  // Calculations for current collection selection
  const selectedFeesObjects = useMemo(() => {
    return selectedStudentFees.filter(sf => selectedFeeIds.includes(sf.id));
  }, [selectedStudentFees, selectedFeeIds]);

  const calculatedSubtotal = useMemo(() => {
    return selectedFeesObjects.reduce((sum, sf) => sum + sf.dueAmount, 0);
  }, [selectedFeesObjects]);

  const calculatedNetPayable = useMemo(() => {
    return Math.max(0, calculatedSubtotal - discountInput + fineInput);
  }, [calculatedSubtotal, discountInput, fineInput]);

  const calculatedRemainingDue = useMemo(() => {
    return Math.max(0, calculatedNetPayable - paidAmountInput);
  }, [calculatedNetPayable, paidAmountInput]);

  // Filtered Registry Fees
  const filteredRegistryFees = useMemo(() => {
    return studentFees.filter(sf => {
      if (registryStatusFilter !== 'all' && sf.status !== registryStatusFilter) return false;
      if (registryDeptFilter !== 'all' && sf.department !== registryDeptFilter) return false;
      if (registrySearch.trim()) {
        const q = registrySearch.toLowerCase();
        return (
          sf.studentNameBn.toLowerCase().includes(q) ||
          sf.studentCode.toLowerCase().includes(q) ||
          sf.feeTitleBn.toLowerCase().includes(q) ||
          sf.guardianMobile.includes(q)
        );
      }
      return true;
    });
  }, [studentFees, registryStatusFilter, registryDeptFilter, registrySearch]);

  // Handler: Select Student
  const handleSelectStudent = (stuId: string) => {
    setSelectedStudentId(stuId);
    const fees = studentFees.filter(sf => sf.studentId === stuId && sf.dueAmount > 0);
    const feeIds = fees.map(f => f.id);
    setSelectedFeeIds(feeIds);
    const dueTotal = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    setPaidAmountInput(dueTotal);
    setDiscountInput(0);
    setFineInput(0);
  };

  // Handler: Execute Payment Collection
  const handleCollectPayment = async () => {
    if (!selectedStudent || selectedFeeIds.length === 0 || paidAmountInput <= 0) {
      alert(isBn ? 'অনুগ্রহ করে অন্তত একটি ফি ও পরিশোধিত টাকার পরিমাণ দিন।' : 'Please select at least one fee and enter paid amount.');
      return;
    }

    try {
      const payment = await collectStudentFeePayment({
        studentId: selectedStudent.studentId,
        studentCode: selectedStudent.studentCode,
        studentNameBn: selectedStudent.studentNameBn,
        studentNameEn: selectedStudent.studentNameEn,
        studentRoll: selectedStudent.rollNumber,
        studentClass: selectedStudent.className,
        department: selectedStudent.department,
        guardianMobile: selectedStudent.guardianMobile,
        paymentMethod,
        accountOrTrxRef: trxRef,
        paidAmount: paidAmountInput,
        discountAmount: discountInput,
        discountReason,
        fineAmount: fineInput,
        fundId: targetFundId,
        notes: paymentNotes,
        selectedFeeIds,
      });

      setActiveReceiptModal(payment);
      // Reset inputs
      setSelectedFeeIds([]);
      setPaidAmountInput(0);
      setDiscountInput(0);
      setFineInput(0);
      setTrxRef('');
      setPaymentNotes('');
    } catch (err: any) {
      console.error('Error collecting fee:', err);
      alert(isBn ? 'পেমেন্ট সম্পন্ন করা সম্ভব হয়নি।' : 'Failed to collect payment.');
    }
  };

  // Handler: Create Fee Structure
  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeNameBn || !newFeeNameEn || newAmount <= 0) return;

    await createFeeStructure({
      nameBn: newFeeNameBn,
      nameEn: newFeeNameEn,
      category: newCategory,
      department: newDepartment,
      classId: newClassId,
      amount: newAmount,
      frequency: newFrequency,
      dueDate: newDueDate,
      lateFine: newLateFine,
      descriptionBn: newDescription,
      isActive: true,
    });

    setIsAddStructureOpen(false);
    setNewFeeNameBn('');
    setNewFeeNameEn('');
  };

  // Handler: Assign Fee
  const handleAssignFee = async () => {
    if (!assignFeeStructureId) return;
    await assignFeeToStudents(
      assignFeeStructureId,
      {
        type: assignTargetType,
        targetId: assignTargetType === 'department' ? assignTargetDept : undefined,
      },
      assignPeriod
    );
    setActiveTab('registry');
  };

  // Handler: Apply Discount
  const handleSaveDiscount = async () => {
    if (!discountModalFee) return;
    await applyStudentDiscount(discountModalFee.id, discountModalAmount, discountModalReason);
    setDiscountModalFee(null);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-semibold mb-2">
            <Receipt className="w-3.5 h-3.5" />
            {isBn ? 'অর্থ ও হিসাব মডিউল' : 'Financial Management Suite'}
          </div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
            {isBn ? 'ফি ব্যবস্থাপনা ও কালেকশন' : 'Fee Management & Collection'}
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            {isBn
              ? 'শিক্ষার্থী ফি তৈরি, বরাদ্দ, দ্রুত ফি আদায় এবং তাৎক্ষণিক ডিজিটাল রসিদ প্রিন্ট।'
              : 'Structure tuition fees, assign to cohorts, collect payments, and issue digital receipts.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAddStructureOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন ফি তৈরি করুন' : 'Create Fee Structure'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-emerald-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('collection')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'collection'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {isBn ? 'ফি আদায় (Quick Collection)' : 'Fee Collection'}
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'structures'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          {isBn ? 'ফি কাঠামো (Fee Types)' : 'Fee Structures'}
        </button>

        <button
          onClick={() => setActiveTab('assignment')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'assignment'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {isBn ? 'ফি বরাদ্দ (Assign Fees)' : 'Fee Assignment'}
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === 'registry'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {isBn ? 'শিক্ষার্থী ফি রেজিস্ট্রি (Records)' : 'Student Fee Registry'}
        </button>
      </div>

      {/* TAB 1: QUICK FEE COLLECTION */}
      {activeTab === 'collection' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Search & Selection List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                {isBn ? 'শিক্ষার্থী খুঁজুন' : 'Search Student'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={isBn ? 'নাম, রোল, আইডি বা মোবাইল...' : 'Name, ID, Roll or Mobile...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="mt-3 space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-center py-6 text-stone-400">
                    {isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found.'}
                  </p>
                ) : (
                  filteredStudents.map(stu => {
                    const isSelected = stu.studentId === selectedStudentId;
                    return (
                      <div
                        key={stu.studentId}
                        onClick={() => handleSelectStudent(stu.studentId)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/50 border-emerald-500 dark:border-emerald-500 shadow-sm'
                            : 'bg-white dark:bg-emerald-900/20 border-stone-200 dark:border-emerald-800 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                              {stu.studentNameBn}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                              {stu.studentCode} | রোল: {stu.rollNumber || 'N/A'}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400">
                              {stu.className}
                            </p>
                          </div>
                          <div className="text-right">
                            {stu.totalDue > 0 ? (
                              <span className="inline-block text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                                বকেয়া: ৳{stu.totalDue.toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-block text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                                {isBn ? 'পরিশোধিত' : 'Paid'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Collection Form & Calculation */}
          <div className="lg:col-span-8 space-y-4">
            {selectedStudent ? (
              <div className="bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm space-y-6">
                {/* Student Banner */}
                <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/80">
                  <div>
                    <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
                      {selectedStudent.studentNameBn} ({selectedStudent.studentNameEn})
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      আইডি: <span className="font-mono font-bold">{selectedStudent.studentCode}</span> | বিভাগ: {selectedStudent.department} | শ্রেণি: {selectedStudent.className}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      অভিভাবক মোবাইল: <span className="font-mono">{selectedStudent.guardianMobile}</span>
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <span className="text-xs text-stone-500">{isBn ? 'সর্বমোট বকেয়া:' : 'Total Due:'}</span>
                    <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                      ৳{selectedStudent.totalDue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Assigned Fees Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      {isBn ? 'বকেয়া ও প্রদেয় ফি নির্বাচন করুন' : 'Select Fees to Collect'}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {selectedFeesObjects.length} {isBn ? 'টি ফি নির্বাচিত' : 'fees selected'}
                    </span>
                  </div>

                  <div className="border border-stone-200 dark:border-emerald-800 rounded-xl overflow-hidden divide-y divide-stone-200 dark:divide-emerald-800">
                    {selectedStudentFees.length === 0 ? (
                      <p className="p-4 text-xs text-stone-400 text-center">
                        {isBn ? 'কোনো বরাদ্দকৃত ফি নেই।' : 'No fees assigned yet.'}
                      </p>
                    ) : (
                      selectedStudentFees.map(fee => {
                        const isChecked = selectedFeeIds.includes(fee.id);
                        return (
                          <div
                            key={fee.id}
                            onClick={() => {
                              setSelectedFeeIds(prev =>
                                prev.includes(fee.id) ? prev.filter(id => id !== fee.id) : [...prev, fee.id]
                              );
                            }}
                            className={`flex items-center justify-between p-3 cursor-pointer transition ${
                              isChecked
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/30'
                                : 'hover:bg-stone-50 dark:hover:bg-emerald-900/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                  {fee.feeTitleBn}
                                </p>
                                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                                  নির্ধারিত তারিখ: {fee.dueDate} | শ্রেণি: {fee.className}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-mono font-bold text-stone-800 dark:text-stone-100">
                                বকেয়া: ৳{fee.dueAmount.toLocaleString()}
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  fee.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : fee.status === 'partial'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {fee.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Adjustments: Discount, Late Fine, Fund, Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 dark:bg-emerald-900/20 border border-stone-200 dark:border-emerald-800">
                  {/* Discount */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'বিশেষ ছাড় (৳):' : 'Discount (BDT):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discountInput}
                      onChange={e => setDiscountInput(Number(e.target.value))}
                      className="w-full p-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    />
                  </div>

                  {/* Late Fine */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'বিলম্ব জরিমানা (৳):' : 'Late Fine (BDT):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={fineInput}
                      onChange={e => setFineInput(Number(e.target.value))}
                      className="w-full p-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Method:'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    >
                      <option value="cash">{isBn ? 'নগদ (Cash)' : 'Cash'}</option>
                      <option value="mobile_banking">{isBn ? 'মোবাইল ব্যাংকিং (bKash/Nagad)' : 'Mobile Banking'}</option>
                      <option value="bank">{isBn ? 'ব্যাংক চেক / ট্রান্সফার' : 'Bank Transfer'}</option>
                      <option value="online">{isBn ? 'অনলাইন পেমেন্ট গেটওয়ে' : 'Online Gateway'}</option>
                      <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Receiving Fund */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'জমার তহবিল (Fund):' : 'Deposit Fund:'}
                    </label>
                    <select
                      value={targetFundId}
                      onChange={e => setTargetFundId(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    >
                      {funds.map(f => (
                        <option key={f.id} value={f.id}>
                          {isBn ? f.nameBn : f.nameEn} (৳{f.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Trx Reference & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'ট্রানজ্যাকশন / চেক রেফারেন্স নং (ঐচ্ছিক):' : 'Trx Ref / Cheque No:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. bKash TrxID or Cheque Number"
                      value={trxRef}
                      onChange={e => setTrxRef(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {isBn ? 'রসিদ সংক্রান্ত বিশেষ মন্তব্য:' : 'Receipt Notes:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isBn ? 'যেমন: বাকি টাকা আগামী সপ্তাহে প্রদান করবে' : 'Notes'}
                      value={paymentNotes}
                      onChange={e => setPaymentNotes(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
                    />
                  </div>
                </div>

                {/* Payment Calculation Box & Submit */}
                <div className="p-4 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-emerald-200">
                      {isBn ? 'নির্বাচিত ফি মোট:' : 'Subtotal:'} ৳{calculatedSubtotal.toLocaleString()}
                      {discountInput > 0 && ` | ছাড়: -৳${discountInput}`}
                      {fineInput > 0 && ` | জরিমানা: +৳${fineInput}`}
                    </div>
                    <div className="text-xl font-bold font-mono">
                      {isBn ? 'মোট প্রদেয়:' : 'Net Payable:'} ৳{calculatedNetPayable.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-300">
                      {calculatedRemainingDue > 0 ? (
                        <span>{isBn ? 'আংশিক জমা শেষে অবশিষ্ট বকেয়া থাকবে: ৳' : 'Due remaining: BDT '}{calculatedRemainingDue.toLocaleString()}</span>
                      ) : (
                        <span>{isBn ? 'সম্পূর্ণ পরিশোধিত হবে' : 'Full payment cleared'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div>
                      <span className="block text-[10px] text-emerald-200 uppercase">{isBn ? 'আদায়কৃত অর্থ:' : 'Amount Paid:'}</span>
                      <input
                        type="number"
                        min={1}
                        max={calculatedNetPayable}
                        value={paidAmountInput}
                        onChange={e => setPaidAmountInput(Number(e.target.value))}
                        className="w-32 p-2 text-base font-bold font-mono rounded-lg bg-emerald-950 text-white border border-emerald-700 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleCollectPayment}
                      disabled={calculatedSubtotal === 0 || paidAmountInput <= 0}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-lg transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                      <Receipt className="w-4 h-4" />
                      {isBn ? 'পেমেন্ট গ্রহণ করুন ও রসিদ তৈরি' : 'Collect & Issue Receipt'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-emerald-950/60 rounded-2xl border border-dashed border-stone-300 dark:border-emerald-800 text-stone-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
                <p className="text-sm font-medium">
                  {isBn ? 'বাম পাশের তালিকা থেকে শিক্ষার্থী নির্বাচন করুন' : 'Select a student from the left panel to collect fee.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEE STRUCTURES */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map(fee => (
              <div
                key={fee.id}
                className="bg-white dark:bg-emerald-950/60 p-5 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {fee.frequency}
                      </span>
                      <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50 mt-1">
                        {fee.nameBn}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{fee.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        ৳{fee.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-stone-400">{isBn ? 'নির্ধারিত ফি' : 'Fee Amount'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-3 line-clamp-2">
                    {fee.descriptionBn || 'মাদ্রাসার নিয়মিত ফি কাঠামো'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 text-[11px] text-stone-500 space-y-1">
                    <p>{isBn ? 'জমা দেওয়ার শেষ তারিখ:' : 'Due Day:'} প্রতি মাসের <strong>{fee.dueDate}</strong> তারিখ</p>
                    <p>{isBn ? 'বিলম্ব জরিমানা:' : 'Late Fine:'} ৳{fee.lateFine}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-800 flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      fee.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {fee.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
                  </span>

                  <button
                    onClick={() => toggleFeeStructureStatus(fee.id)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
                  >
                    {fee.isActive ? (isBn ? 'নিষ্ক্রিয় করুন' : 'Deactivate') : (isBn ? 'সক্রিয় করুন' : 'Activate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FEE ASSIGNMENT */}
      {activeTab === 'assignment' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-emerald-950/60 p-6 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'শিক্ষার্থীদের ফি বরাদ্দ করুন' : 'Assign Fee to Students'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isBn
                ? 'এক ক্লিকে নির্দিষ্ট বিভাগ, শ্রেণি বা সমগ্র মাদ্রাসার শিক্ষার্থীদের ফি বরাদ্দ করুন।'
                : 'Bulk assign tuition or exam fees to whole cohorts with custom billing periods.'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">{isBn ? 'ফি কাঠামো নির্বাচন করুন:' : 'Select Fee Structure:'}</label>
              <select
                value={assignFeeStructureId}
                onChange={e => setAssignFeeStructureId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40"
              >
                {feeStructures.map(fs => (
                  <option key={fs.id} value={fs.id}>
                    {fs.nameBn} - ৳{fs.amount} ({fs.frequency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">{isBn ? 'ফি বরাদ্দ স্কোপ:' : 'Assignment Scope:'}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'department', 'class'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssignTargetType(type)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition capitalize ${
                      assignTargetType === type
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-stone-300 dark:border-emerald-800 hover:bg-stone-50 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    {type === 'all'
                      ? isBn ? 'সকল শিক্ষার্থী' : 'All Students'
                      : type === 'department'
                      ? isBn ? 'বিভাগ ভিত্তিক' : 'Department Wise'
                      : isBn ? 'শ্রেণি ভিত্তিক' : 'Class Wise'}
                  </button>
                ))}
              </div>
            </div>

            {assignTargetType === 'department' && (
              <div>
                <label className="block font-bold mb-1">{isBn ? 'বিভাগ নির্বাচন করুন:' : 'Select Department:'}</label>
                <select
                  value={assignTargetDept}
                  onChange={e => setAssignTargetDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40"
                >
                  <option value="হিফজুল কুরআন">হিফজুল কুরআন (Hifzul Quran)</option>
                  <option value="কিতাব বিভাগ">কিতাব বিভাগ (Kitab)</option>
                  <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা (Noorani)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold mb-1">{isBn ? 'প্রযোজ্য মাস / সেশন:' : 'Applicable Month/Session:'}</label>
              <input
                type="text"
                value={assignPeriod}
                onChange={e => setAssignPeriod(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40"
              />
            </div>

            <button
              onClick={handleAssignFee}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition"
            >
              {isBn ? 'ফি বরাদ্দ কার্যকর করুন' : 'Execute Fee Assignment'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT FEE REGISTRY */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-emerald-950/60 p-4 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={isBn ? 'শিক্ষার্থী, আইডি বা ফি বিবরণ...' : 'Search student or fee...'}
                value={registrySearch}
                onChange={e => setRegistrySearch(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={registryStatusFilter}
                onChange={e => setRegistryStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
              >
                <option value="all">{isBn ? 'সব স্ট্যাটাস' : 'All Statuses'}</option>
                <option value="paid">{isBn ? 'পরিশোধিত (Paid)' : 'Paid'}</option>
                <option value="due">{isBn ? 'বকেয়া (Due)' : 'Due'}</option>
                <option value="partial">{isBn ? 'আংশিক (Partial)' : 'Partial'}</option>
                <option value="overdue">{isBn ? 'বিলম্বিত (Overdue)' : 'Overdue'}</option>
              </select>

              <select
                value={registryDeptFilter}
                onChange={e => setRegistryDeptFilter(e.target.value)}
                className="py-1.5 px-3 text-xs rounded-lg border border-stone-300 dark:border-emerald-800 bg-white dark:bg-emerald-950"
              >
                <option value="all">{isBn ? 'সব বিভাগ' : 'All Departments'}</option>
                <option value="হিফজুল কুরআন">হিফজুল কুরআন</option>
                <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
                <option value="নূরানী ও নাজেরা">নূরানী ও নাজেরা</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-emerald-950/60 rounded-2xl border border-stone-200 dark:border-emerald-800 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-emerald-900/40 border-b border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-stone-300 font-semibold">
                <tr>
                  <th className="p-3">শিক্ষার্থী ও আইডি</th>
                  <th className="p-3">শ্রেণি ও বিভাগ</th>
                  <th className="p-3">ফি বিবরণ</th>
                  <th className="p-3 text-right">মূল ফি</th>
                  <th className="p-3 text-right">ছাড়</th>
                  <th className="p-3 text-right">আদায়</th>
                  <th className="p-3 text-right">বকেয়া</th>
                  <th className="p-3 text-center">স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/60">
                {filteredRegistryFees.map(fee => (
                  <tr key={fee.id} className="hover:bg-stone-50/50 dark:hover:bg-emerald-900/20">
                    <td className="p-3">
                      <div className="font-bold text-emerald-950 dark:text-emerald-100">{fee.studentNameBn}</div>
                      <div className="text-[10px] font-mono text-stone-500">{fee.studentCode}</div>
                    </td>
                    <td className="p-3 text-stone-600 dark:text-stone-300">
                      <div>{fee.className}</div>
                      <div className="text-[10px] text-stone-400">{fee.department}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-stone-800 dark:text-stone-200">{fee.feeTitleBn}</div>
                      <div className="text-[10px] text-stone-400">Due: {fee.dueDate}</div>
                    </td>
                    <td className="p-3 text-right font-mono">৳{fee.baseAmount.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-emerald-600">
                      {fee.discountAmount > 0 ? `৳${fee.discountAmount}` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                      ৳{fee.paidAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      ৳{fee.dueAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          fee.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            : fee.status === 'partial'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setDiscountModalFee(fee);
                          setDiscountModalAmount(fee.discountAmount || 0);
                          setDiscountModalReason(fee.discountReason || '');
                        }}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-900 transition"
                        title={isBn ? 'ছাড় বা বৃত্তি নির্ধারণ করুন' : 'Apply Discount / Scholarship'}
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD FEE STRUCTURE */}
      {isAddStructureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'নতুন ফি কাঠামো তৈরি করুন' : 'Create New Fee Structure'}
            </h3>

            <form onSubmit={handleCreateStructure} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ফি নাম (বাংলা):' : 'Fee Name (Bangla):'}</label>
                  <input
                    type="text"
                    required
                    value={newFeeNameBn}
                    onChange={e => setNewFeeNameBn(e.target.value)}
                    placeholder="যেমন: মাসিক খোরাকি ও বোর্ডিং ফি"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ফি নাম (English):' : 'Fee Name (English):'}</label>
                  <input
                    type="text"
                    required
                    value={newFeeNameEn}
                    onChange={e => setNewFeeNameEn(e.target.value)}
                    placeholder="e.g. Monthly Mess Fee"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ক্যাটাগরি:' : 'Category:'}</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    <option value="admission">{isBn ? 'ভর্তি ফি (Admission Fee)' : 'Admission Fee'}</option>
                    <option value="monthly_tuition">{isBn ? 'মাসিক বেতন (Monthly Fee)' : 'Monthly Fee'}</option>
                    <option value="exam">{isBn ? 'পরীক্ষা ফি (Exam Fee)' : 'Exam Fee'}</option>
                    <option value="boarding">{isBn ? 'বোর্ডিং ফি (Boarding Fee)' : 'Boarding Fee'}</option>
                    <option value="food">{isBn ? 'খাবার ফি (Food Fee)' : 'Food Fee'}</option>
                    <option value="development">{isBn ? 'উন্নয়ন ফি (Development Fee)' : 'Development Fee'}</option>
                    <option value="transport">{isBn ? 'পরিবহন ফি (Transport Fee)' : 'Transport Fee'}</option>
                    <option value="other">{isBn ? 'অন্যান্য ফি (Other Fee)' : 'Other Fee'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'ফ্রিকোয়েন্সি:' : 'Frequency:'}</label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as FeeFrequency)}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                  >
                    <option value="one_time">One Time (এককালীন)</option>
                    <option value="monthly">Monthly (মাসিক)</option>
                    <option value="quarterly">Quarterly (ত্রৈমাসিক)</option>
                    <option value="yearly">Yearly (বার্ষিক)</option>
                    <option value="custom">Custom (কাস্টম)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'পরিমাণ (৳):' : 'Amount (BDT):'}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newAmount}
                    onChange={e => setNewAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'জমার দিন:' : 'Due Date:'}</label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    placeholder="10"
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isBn ? 'বিলম্ব জরিমানা:' : 'Late Fine:'}</label>
                  <input
                    type="number"
                    min={0}
                    value={newLateFine}
                    onChange={e => setNewLateFine(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'বিবরণ:' : 'Description:'}</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-emerald-800 bg-stone-50 dark:bg-emerald-900/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStructureOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'ফি সংরক্ষণ করুন' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHOLARSHIP / DISCOUNT */}
      {discountModalFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {isBn ? 'শিক্ষার্থী ফি ছাড় / বৃত্তি নির্ধারণ' : 'Assign Student Discount / Scholarship'}
            </h3>
            <p className="text-xs text-stone-500">
              {discountModalFee.studentNameBn} - {discountModalFee.feeTitleBn} (মূল ফি: ৳{discountModalFee.baseAmount})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isBn ? 'ছাড়ের পরিমাণ (৳):' : 'Discount Amount (BDT):'}</label>
                <input
                  type="number"
                  min={0}
                  max={discountModalFee.baseAmount}
                  value={discountModalAmount}
                  onChange={e => setDiscountModalAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-emerald-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isBn ? 'ছাড়ের কারণ:' : 'Reason for Discount:'}</label>
                <input
                  type="text"
                  value={discountModalReason}
                  onChange={e => setDiscountModalReason(e.target.value)}
                  placeholder={isBn ? 'যেমন: মেধা বৃত্তি / এতিমখানা ফান্ড ছাড়' : 'e.g. Merit Scholarship'}
                  className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDiscountModalFee(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveDiscount}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Apply Discount'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL RECEIPT MODAL */}
      <DigitalReceiptModal
        isOpen={!!activeReceiptModal}
        onClose={() => setActiveReceiptModal(null)}
        payment={activeReceiptModal}
      />
    </div>
  );
};

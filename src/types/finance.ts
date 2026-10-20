export type FeeFrequency = 'one_time' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type PaymentMethod = 'cash' | 'bank' | 'mobile_banking' | 'online' | 'other';

export interface FeeStructure {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  category: string; // e.g., 'admission', 'monthly_tuition', 'exam', 'boarding', 'food', 'development', 'transport', 'other'
  department: string; // 'all' or specific department id
  classId: string; // 'all' or specific class id
  amount: number;
  frequency: FeeFrequency;
  dueDate: string; // e.g., '10' for 10th of month or specific date
  lateFine: number;
  descriptionBn?: string;
  descriptionEn?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StudentFeeStatus = 'paid' | 'partial' | 'due' | 'overdue';

export interface StudentFee {
  id: string;
  institutionId: string;
  studentId: string; // references Student.id or Student.studentId
  studentCode: string;
  studentNameBn: string;
  studentNameEn: string;
  department: string;
  className: string;
  rollNumber?: string;
  guardianMobile: string;
  feeStructureId: string;
  feeTitleBn: string;
  feeTitleEn: string;
  feeCategory: string;
  period: string; // e.g., "September 2026", "2026-09"
  baseAmount: number;
  discountAmount: number;
  discountReason?: string;
  fineAmount: number;
  totalPayable: number;
  paidAmount: number;
  dueAmount: number;
  status: StudentFeeStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentItem {
  studentFeeId: string;
  feeTitleBn: string;
  feeTitleEn: string;
  amount: number;
  paid: number;
}

export interface Payment {
  id: string;
  institutionId: string;
  receiptNumber: string; // e.g. "MDS-RC-2026-000001"
  studentId: string;
  studentCode: string;
  studentNameBn: string;
  studentNameEn: string;
  studentRoll?: string;
  studentClass: string;
  department: string;
  guardianMobile: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  accountOrTrxRef?: string;
  subtotal: number;
  discount: number;
  fine: number;
  totalPaid: number;
  previousDue: number;
  currentDue: number;
  fundId: string; // default 'general'
  items: PaymentItem[];
  receivedBy: string;
  notes?: string;
  status: 'completed' | 'voided' | 'cancelled';
  voidReason?: string;
  createdAt: string;
}

export interface IncomeCategory {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  isSystemDefault?: boolean;
}

export interface ExpenseCategory {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  isSystemDefault?: boolean;
}

export interface Fund {
  id: string; // 'general', 'lillah', 'orphan', 'food', 'building', 'development', 'zakat', 'sadaqah', 'other'
  institutionId: string;
  nameBn: string;
  nameEn: string;
  code: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  descriptionBn?: string;
  descriptionEn?: string;
  isRestricted: boolean; // e.g. Zakat/Lillah funds must not be mixed with general expenses
}

export interface FinancialTransaction {
  id: string;
  transactionNumber: string; // e.g. "TRX-2026-000001"
  institutionId: string;
  date: string;
  type: 'income' | 'expense' | 'fund_transfer';
  category: string;
  fundId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  payeeOrPayer: string;
  description: string;
  receivedOrPaidBy: string;
  approvedBy?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'active' | 'voided' | 'reversed';
  voidReason?: string;
  sourceModule: 'fee_collection' | 'direct_income' | 'direct_expense' | 'salary' | 'donation' | 'chanda' | 'fund_transfer';
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundTransfer {
  id: string;
  institutionId: string;
  transferNumber: string; // e.g. "FTR-2026-000001"
  sourceFundId: string;
  destinationFundId: string;
  amount: number;
  reason: string;
  approvedBy: string;
  transferDate: string;
  createdAt: string;
}

export type EmployeeType = 'teacher' | 'staff' | 'other';

export interface Employee {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  employeeCode: string; // e.g. "EMP-2026-001"
  type: EmployeeType;
  designationBn: string;
  designationEn: string;
  department: string;
  mobile: string;
  email?: string;
  joinDate: string;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface SalaryStructure {
  id: string;
  institutionId: string;
  employeeId: string;
  employeeCode?: string;
  employeeNameBn?: string;
  employeeNameEn?: string;
  designation?: string;
  department?: string;
  employeeType?: EmployeeType;
  basicSalary: number;
  allowance: number;
  housingAllowance?: number;
  medicalAllowance?: number;
  transportAllowance?: number;
  otherAllowance?: number;
  bonus: number;
  overtime: number;
  advance: number;
  deduction: number;
  fine: number;
  otherAdjustment: number;
  netSalary: number; // Basic + Allowance + Bonus + Overtime - Advance - Deduction - Fine + OtherAdjustment
  updatedAt: string;
}

export type DonationCategory = 'general' | 'zakat' | 'lillah' | 'orphan' | 'building' | 'iftar' | 'other' | string;

export type SalaryStatus = 'pending' | 'processing' | 'paid' | 'partially_paid';

export interface SalaryPayment {
  id: string;
  institutionId: string;
  slipNumber: string; // e.g. "SLIP-2026-000001"
  employeeId: string;
  employeeNameBn: string;
  employeeNameEn: string;
  employeeCode: string;
  designation: string;
  employeeType: EmployeeType;
  salaryMonth: string; // e.g., "September 2026"
  basicSalary: number;
  allowance: number;
  bonus: number;
  overtime: number;
  advance: number;
  deduction: number;
  fine: number;
  netSalary: number;
  paidAmount: number;
  dueAmount: number;
  status: SalaryStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  fundId: string;
  processedBy: string;
  notes?: string;
  createdAt: string;
}

export type DonorType = 'general' | 'permanent' | 'monthly_donor' | 'corporate' | 'organization';

export interface Donor {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  mobile: string;
  alternativeMobile?: string;
  email?: string;
  address: string;
  donorType: DonorType;
  totalDonation: number;
  totalChanda: number;
  notes?: string;
  createdAt: string;
}

export type DonationStatus = 'pending' | 'verified' | 'rejected';

export interface Donation {
  id: string;
  receiptNumber: string; // e.g. "MDS-DN-2026-000001"
  institutionId: string;
  donorId: string;
  donorName: string;
  donorNameBn?: string;
  donorMobile: string;
  category: string; // 'General Donation', 'Lillah', 'Zakat', 'Orphan Fund', etc.
  fundId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  trxId?: string;
  channelName?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  notes?: string;
  receivedBy: string;
  donationDate: string;
  createdAt: string;
  status?: DonationStatus; // 'pending' | 'verified' | 'rejected'
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  date?: string;
  isVoided?: boolean;
}

export type ChandaStatus = 'paid' | 'partial' | 'due' | 'inactive';

export interface ChandaMember {
  id: string;
  institutionId: string;
  donorId?: string;
  memberNameBn: string;
  memberNameEn: string;
  mobile: string;
  address: string;
  monthlyAmount: number;
  startMonth: string; // e.g., "January 2026"
  dueDayOfMonth: number; // e.g. 10 for 10th of every month
  status: ChandaStatus;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ChandaPayment {
  id: string;
  receiptNumber: string; // e.g. "MDS-CH-2026-000001"
  institutionId: string;
  memberId: string;
  memberName: string;
  month: string; // e.g. "September 2026"
  amount: number;
  fundId: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receivedBy: string;
  createdAt: string;
}

export interface FinancialAuditLog {
  id: string;
  institutionId: string;
  timestamp: string;
  performedBy: string;
  performedByRole: string;
  action: 'create' | 'update' | 'void' | 'cancel' | 'transfer' | 'reverse';
  module: 'fee' | 'income' | 'expense' | 'salary' | 'donation' | 'chanda' | 'fund';
  targetId: string;
  targetRef?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface DueReminderEvent {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  guardianMobile: string;
  amountDue: number;
  dueMonth: string;
  triggerDate: string;
  status: 'queued' | 'dispatched';
  channel: 'sms';
}

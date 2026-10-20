export type RoomType = 'dormitory' | 'general' | 'senior' | 'special';
export type RoomStatus = 'active' | 'maintenance' | 'closed';
export type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface BoardingBuilding {
  id: string;
  institutionId: string;
  nameBn: string;
  nameEn: string;
  floorsCount: number;
  totalRooms: number;
  description?: string;
}

export interface BoardingRoom {
  id: string;
  institutionId: string;
  buildingId: string;
  buildingNameBn: string;
  roomNumber: string;
  floor: number | string;
  capacity: number;
  roomType: RoomType;
  status: RoomStatus;
  notes?: string;
}

export interface BoardingBed {
  id: string;
  institutionId: string;
  roomId: string;
  roomNumber: string;
  buildingNameBn: string;
  bedNumber: string;
  status: BedStatus;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  allocatedDate?: string;
}

export interface BoardingAllocation {
  id: string;
  institutionId: string;
  studentId: string;
  studentCode: string;
  studentNameBn: string;
  studentRoll: string;
  department: string;
  className: string;
  buildingName: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedNumber: string;
  allocatedAt: string;
  releasedAt?: string;
  status: 'active' | 'transferred' | 'released';
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DailyMealPlan {
  id: string;
  institutionId: string;
  dayOfWeek: string; // 'Saturday', 'Sunday', etc.
  mealType: MealType;
  menuItemsBn: string;
  menuItemsEn: string;
  timing: string;
  specialNote?: string;
}

export type FoodExpenseCategory =
  | 'rice_flour'
  | 'fish_meat'
  | 'vegetables'
  | 'oil_spices'
  | 'milk_dairy'
  | 'gas_firewood'
  | 'cook_honorarium'
  | 'other';

export interface FoodExpense {
  id: string;
  institutionId: string;
  voucherNumber: string;
  date: string; // YYYY-MM-DD
  category: FoodExpenseCategory;
  categoryLabelBn: string;
  amount: number;
  vendor: string;
  description: string;
  fundId: string; // Links to Finance Fund (e.g. 'lillah_fund' or 'general')
  paidVia: 'cash' | 'bank' | 'bkash';
  attachmentName?: string;
  approvedBy: string;
  createdAt: string;
}

export type AutomationEventType =
  | 'hifz_progress_updated'
  | 'low_progress_alert'
  | 'exam_created'
  | 'exam_reminder'
  | 'result_published'
  | 'boarding_allocation'
  | 'food_fee_due';

export interface AutomationEventItem {
  id: string;
  institutionId: string;
  eventType: AutomationEventType;
  titleBn: string;
  titleEn: string;
  payload: Record<string, any>;
  triggeredAt: string;
  status: 'queued' | 'processed';
}

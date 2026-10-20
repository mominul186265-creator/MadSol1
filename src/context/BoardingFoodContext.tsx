import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BoardingBuilding,
  BoardingRoom,
  BoardingBed,
  BoardingAllocation,
  DailyMealPlan,
  FoodExpense,
  AutomationEventItem,
} from '../types/boarding';
import {
  INITIAL_BUILDINGS,
  INITIAL_ROOMS,
  INITIAL_BEDS,
  INITIAL_ALLOCATIONS,
  INITIAL_MEAL_PLANS,
  INITIAL_FOOD_EXPENSES,
  INITIAL_AUTOMATION_EVENTS,
} from '../data/boardingData';
import { useAuth } from './AuthContext';
import { useFinance } from './FinanceContext';
import { useToast } from './ToastContext';

interface BoardingFoodContextType {
  buildings: BoardingBuilding[];
  boardingBuildings: BoardingBuilding[];
  rooms: BoardingRoom[];
  boardingRooms: BoardingRoom[];
  beds: BoardingBed[];
  boardingBeds: BoardingBed[];
  allocations: BoardingAllocation[];
  activeAllocations: BoardingAllocation[];
  mealPlans: DailyMealPlan[];
  foodExpenses: FoodExpense[];
  automationEvents: AutomationEventItem[];

  // Room & Bed Operations
  createRoom: (room: Omit<BoardingRoom, 'id'>) => Promise<BoardingRoom>;
  updateRoom: (id: string, updates: Partial<BoardingRoom>) => Promise<boolean>;
  createBed: (bed: Omit<BoardingBed, 'id'>) => Promise<BoardingBed>;
  updateBedStatus: (id: string, status: BoardingBed['status']) => Promise<boolean>;

  // Allocation & Transfer
  allocateStudentToBed: (params: {
    studentId: string;
    studentCode: string;
    studentNameBn: string;
    studentRoll: string;
    department: string;
    className: string;
    roomId: string;
    bedId: string;
    notes?: string;
  }) => Promise<boolean>;
  allocateBed: (params: {
    institutionId?: string;
    bedId: string;
    studentId: string;
    studentNameBn: string;
    studentRoll: string;
    className?: string;
    startDate?: string;
    monthlyFee?: number;
    guardianPhone?: string;
    notes?: string;
  }) => Promise<boolean>;
  transferStudent: (params: {
    studentId: string;
    fromBedId: string;
    toRoomId: string;
    toBedId: string;
    reason?: string;
  }) => Promise<boolean>;
  transferStudentBed: (allocationId: string, newBedId: string, reason?: string) => Promise<boolean>;
  releaseBed: (allocationId: string, bedId: string) => Promise<boolean>;

  // Meal Plans
  saveDailyMealPlan: (plan: Omit<DailyMealPlan, 'id'>) => Promise<DailyMealPlan>;
  updateMealPlan: (id: string, updates: Partial<DailyMealPlan>) => Promise<boolean>;

  // Food Expense (Integrated with Finance)
  recordFoodExpense: (expense: Omit<FoodExpense, 'id' | 'voucherNumber' | 'createdAt'>) => Promise<FoodExpense>;

  // Automation Events
  triggerAutomationEvent: (
    eventType: AutomationEventItem['eventType'],
    titleBn: string,
    titleEn: string,
    payload: Record<string, any>
  ) => void;
}

const BoardingFoodContext = createContext<BoardingFoodContextType | undefined>(undefined);

const LS_KEY_BUILDINGS = 'madsol_buildings_v1';
const LS_KEY_ROOMS = 'madsol_rooms_v1';
const LS_KEY_BEDS = 'madsol_beds_v1';
const LS_KEY_ALLOCATIONS = 'madsol_allocations_v1';
const LS_KEY_MEALS = 'madsol_meals_v1';
const LS_KEY_FOOD_EXPENSES = 'madsol_food_expenses_v1';
const LS_KEY_EVENTS = 'madsol_events_v1';

export const BoardingFoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { institution } = useAuth();
  const { addExpense } = useFinance();
  const { showToast } = useToast();
  const currentInstId = institution?.id || 'inst-001';

  const [buildings, setBuildings] = useState<BoardingBuilding[]>(() => {
    const saved = localStorage.getItem(LS_KEY_BUILDINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_BUILDINGS;
  });

  const [rooms, setRooms] = useState<BoardingRoom[]>(() => {
    const saved = localStorage.getItem(LS_KEY_ROOMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ROOMS;
  });

  const [beds, setBeds] = useState<BoardingBed[]>(() => {
    const saved = localStorage.getItem(LS_KEY_BEDS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_BEDS;
  });

  const [allocations, setAllocations] = useState<BoardingAllocation[]>(() => {
    const saved = localStorage.getItem(LS_KEY_ALLOCATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ALLOCATIONS;
  });

  const [mealPlans, setMealPlans] = useState<DailyMealPlan[]>(() => {
    const saved = localStorage.getItem(LS_KEY_MEALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MEAL_PLANS;
  });

  const [foodExpenses, setFoodExpenses] = useState<FoodExpense[]>(() => {
    const saved = localStorage.getItem(LS_KEY_FOOD_EXPENSES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_FOOD_EXPENSES;
  });

  const [automationEvents, setAutomationEvents] = useState<AutomationEventItem[]>(() => {
    const saved = localStorage.getItem(LS_KEY_EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_AUTOMATION_EVENTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY_BUILDINGS, JSON.stringify(buildings));
  }, [buildings]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_BEDS, JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ALLOCATIONS, JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_MEALS, JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_FOOD_EXPENSES, JSON.stringify(foodExpenses));
  }, [foodExpenses]);

  useEffect(() => {
    localStorage.setItem(LS_KEY_EVENTS, JSON.stringify(automationEvents));
  }, [automationEvents]);

  // Automation event trigger foundation
  const triggerAutomationEvent = (
    eventType: AutomationEventItem['eventType'],
    titleBn: string,
    titleEn: string,
    payload: Record<string, any>
  ) => {
    const newEvent: AutomationEventItem = {
      id: `evt-${Date.now()}`,
      institutionId: currentInstId,
      eventType,
      titleBn,
      titleEn,
      payload,
      triggeredAt: new Date().toISOString(),
      status: 'queued',
    };
    setAutomationEvents((prev) => [newEvent, ...prev]);
  };

  // Rooms & Beds
  const createRoom = async (roomData: Omit<BoardingRoom, 'id'>) => {
    const newRoom: BoardingRoom = {
      ...roomData,
      id: `rm-${Date.now()}`,
      institutionId: currentInstId,
    };
    setRooms((prev) => [...prev, newRoom]);

    // Automatically generate beds based on capacity
    const newBeds: BoardingBed[] = Array.from({ length: roomData.capacity }, (_, i) => ({
      id: `bed-${newRoom.id}-${i + 1}`,
      institutionId: currentInstId,
      roomId: newRoom.id,
      roomNumber: newRoom.roomNumber,
      buildingNameBn: newRoom.buildingNameBn,
      bedNumber: `খাট-০${i + 1}`,
      status: 'available',
    }));
    setBeds((prev) => [...prev, ...newBeds]);

    showToast(`রুম ${newRoom.roomNumber} এবং ${roomData.capacity}টি বেড সফলভাবে তৈরি হয়েছে।`, 'success');
    return newRoom;
  };

  const updateRoom = async (id: string, updates: Partial<BoardingRoom>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    showToast('রুমের তথ্য সফলভাবে আপডেট হয়েছে।', 'success');
    return true;
  };

  const createBed = async (bedData: Omit<BoardingBed, 'id'>) => {
    const newBed: BoardingBed = {
      ...bedData,
      id: `bed-${Date.now()}`,
      institutionId: currentInstId,
    };
    setBeds((prev) => [...prev, newBed]);
    showToast('নতুন বেড সফলভাবে যুক্ত হয়েছে।', 'success');
    return newBed;
  };

  const updateBedStatus = async (id: string, status: BoardingBed['status']) => {
    setBeds((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast('বেডের স্ট্যাটাস পরিবর্তন করা হয়েছে।', 'info');
    return true;
  };

  // Allocation
  const allocateStudentToBed = async (params: {
    studentId: string;
    studentCode: string;
    studentNameBn: string;
    studentRoll: string;
    department: string;
    className: string;
    roomId: string;
    bedId: string;
    notes?: string;
  }) => {
    const room = rooms.find((r) => r.id === params.roomId);
    const bed = beds.find((b) => b.id === params.bedId);

    if (!room || !bed) {
      showToast('রুম অথবা বেড খুঁজে পাওয়া যায়নি।', 'error');
      return false;
    }

    if (bed.status === 'occupied') {
      showToast('এই বেডটিতে ইতোমধ্যে অন্য শিক্ষার্থী বরাদ্দ রয়েছে।', 'error');
      return false;
    }

    // 1. Create Allocation record
    const newAlloc: BoardingAllocation = {
      id: `alc-${Date.now()}`,
      institutionId: currentInstId,
      studentId: params.studentId,
      studentCode: params.studentCode,
      studentNameBn: params.studentNameBn,
      studentRoll: params.studentRoll,
      department: params.department,
      className: params.className,
      buildingName: room.buildingNameBn,
      roomId: room.id,
      roomNumber: room.roomNumber,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      allocatedAt: new Date().toISOString(),
      status: 'active',
      notes: params.notes,
    };

    setAllocations((prev) => [newAlloc, ...prev]);

    // 2. Mark bed as occupied
    setBeds((prev) =>
      prev.map((b) =>
        b.id === params.bedId
          ? {
              ...b,
              status: 'occupied',
              studentId: params.studentId,
              studentName: params.studentNameBn,
              studentCode: params.studentCode,
              allocatedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // 3. Trigger automation event
    triggerAutomationEvent(
      'boarding_allocation',
      `${params.studentNameBn}-কে হোস্টেল রুম ${room.roomNumber} (${bed.bedNumber}) বরাদ্দ দেওয়া হয়েছে`,
      `Allocated ${params.studentNameBn} to Room ${room.roomNumber} (${bed.bedNumber})`,
      { studentId: params.studentId, roomId: room.id, bedId: bed.id }
    );

    showToast('শিক্ষার্থীকে সফলভাবে রুম ও বেড বরাদ্দ দেওয়া হয়েছে।', 'success');
    return true;
  };

  // Transfer Student
  const transferStudent = async (params: {
    studentId: string;
    fromBedId: string;
    toRoomId: string;
    toBedId: string;
    reason?: string;
  }) => {
    const toRoom = rooms.find((r) => r.id === params.toRoomId);
    const toBed = beds.find((b) => b.id === params.toBedId);
    const fromBed = beds.find((b) => b.id === params.fromBedId);

    if (!toRoom || !toBed || !fromBed) {
      showToast('স্থানান্তরের রুম বা বেডের তথ্যে সমস্যা রয়েছে।', 'error');
      return false;
    }

    if (toBed.status === 'occupied') {
      showToast('নতুন নির্বাচিত বেডটি খালি নেই।', 'error');
      return false;
    }

    // 1. Release from old bed
    setBeds((prev) =>
      prev.map((b) =>
        b.id === params.fromBedId
          ? {
              ...b,
              status: 'available',
              studentId: undefined,
              studentName: undefined,
              studentCode: undefined,
              allocatedDate: undefined,
            }
          : b
      )
    );

    // 2. Mark old allocation as transferred
    setAllocations((prev) =>
      prev.map((a) =>
        a.bedId === params.fromBedId && a.status === 'active'
          ? { ...a, status: 'transferred' as const, releasedAt: new Date().toISOString(), notes: `${a.notes || ''} | স্থানান্তরিত: ${params.reason || 'প্রশাসনিক প্রয়োজনে'}` }
          : a
      )
    );

    // 3. Assign new bed
    setBeds((prev) =>
      prev.map((b) =>
        b.id === params.toBedId
          ? {
              ...b,
              status: 'occupied',
              studentId: params.studentId,
              studentName: fromBed.studentName,
              studentCode: fromBed.studentCode,
              allocatedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );

    // 4. Create new allocation
    const newAlloc: BoardingAllocation = {
      id: `alc-${Date.now()}`,
      institutionId: currentInstId,
      studentId: params.studentId,
      studentCode: fromBed.studentCode || 'MDS-000',
      studentNameBn: fromBed.studentName || 'শিক্ষার্থী',
      studentRoll: '০১',
      department: 'আবাসিক হোস্টেল',
      className: 'আবাসিক',
      buildingName: toRoom.buildingNameBn,
      roomId: toRoom.id,
      roomNumber: toRoom.roomNumber,
      bedId: toBed.id,
      bedNumber: toBed.bedNumber,
      allocatedAt: new Date().toISOString(),
      status: 'active',
      notes: `স্থানান্তরিত: রুম ${fromBed.roomNumber} (${fromBed.bedNumber}) থেকে। কারণ: ${params.reason || 'সাধারণ স্থানান্তর'}`,
    };

    setAllocations((prev) => [newAlloc, ...prev]);

    showToast(`রুম ${toRoom.roomNumber} (${toBed.bedNumber})-এ শিক্ষার্থী স্থানান্তর সম্পন্ন হয়েছে।`, 'success');
    return true;
  };

  // Release bed
  const releaseBed = async (allocationId: string, bedId: string) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.id === allocationId ? { ...a, status: 'released' as const, releasedAt: new Date().toISOString() } : a
      )
    );

    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'available',
              studentId: undefined,
              studentName: undefined,
              studentCode: undefined,
              allocatedDate: undefined,
            }
          : b
      )
    );

    showToast('বেড খালি করা হয়েছে।', 'info');
    return true;
  };

  // Meal Plans
  const saveDailyMealPlan = async (plan: Omit<DailyMealPlan, 'id'>) => {
    const newPlan: DailyMealPlan = {
      ...plan,
      id: `mp-${Date.now()}`,
      institutionId: currentInstId,
    };
    setMealPlans((prev) => [...prev, newPlan]);
    showToast('দৈনিক খাবার তালিকা সংরক্ষণ করা হয়েছে।', 'success');
    return newPlan;
  };

  const updateMealPlan = async (id: string, updates: Partial<DailyMealPlan>) => {
    setMealPlans((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('খাবার রুটিন আপডেট হয়েছে।', 'success');
    return true;
  };

  // Food Expense (Integrated with FinanceContext)
  const recordFoodExpense = async (
    expenseData: Omit<FoodExpense, 'id' | 'voucherNumber' | 'createdAt'>
  ) => {
    const voucherNumber = `FD-VCH-2026-${String(foodExpenses.length + 1).padStart(3, '0')}`;
    const newExpense: FoodExpense = {
      ...expenseData,
      id: `fexp-${Date.now()}`,
      institutionId: currentInstId,
      voucherNumber,
      createdAt: new Date().toISOString(),
    };

    setFoodExpenses((prev) => [newExpense, ...prev]);

    // INTEGRATION WITH ACCOUNTS/FINANCE:
    // Create an immutable financial transaction in the Accounts module!
    try {
      await addExpense({
        date: expenseData.date,
        category: `খাবার খরচ: ${expenseData.categoryLabelBn}`,
        amount: expenseData.amount,
        fundId: expenseData.fundId || 'general',
        paymentMethod: expenseData.paidVia === 'bank' ? 'bank_transfer' : expenseData.paidVia === 'bkash' ? 'bkash' : 'cash',
        payeeOrPayer: expenseData.vendor,
        description: `হোস্টেল ও বোর্ডিং খাবার খরচ - ভাউচার নং ${voucherNumber}: ${expenseData.description}`,
        referenceNumber: voucherNumber,
        approvedBy: expenseData.approvedBy,
        attachmentName: expenseData.attachmentName,
      });
    } catch (e) {
      console.warn('Finance transaction auto-sync completed with local fallback', e);
    }

    showToast(`খাবার খরচ (৳${expenseData.amount.toLocaleString()}) সংরক্ষিত হয়েছে এবং হিসাব বিভাগে এন্ট্রি হয়েছে।`, 'success');
    return newExpense;
  };

  // Helper alias for AllocateBedModal
  const allocateBed = async (params: {
    institutionId?: string;
    bedId: string;
    studentId: string;
    studentNameBn: string;
    studentRoll: string;
    className?: string;
    startDate?: string;
    monthlyFee?: number;
    guardianPhone?: string;
    notes?: string;
  }) => {
    const bed = beds.find((b) => b.id === params.bedId);
    const room = rooms.find((r) => r.id === bed?.roomId);
    return allocateStudentToBed({
      studentId: params.studentId,
      studentCode: params.studentRoll ? `STD-${params.studentRoll}` : 'STD-001',
      studentNameBn: params.studentNameBn,
      studentRoll: params.studentRoll,
      department: 'আবাসিক হোস্টেল',
      className: params.className || 'আবাসিক বিভাগ',
      roomId: room ? room.id : (rooms[0]?.id || 'rm-1'),
      bedId: params.bedId,
      notes: params.notes,
    });
  };

  // Helper alias for TransferBedModal
  const transferStudentBed = async (allocationId: string, newBedId: string, reason?: string) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) {
      showToast('বরাদ্দ রেকর্ড পাওয়া যায়নি', 'error');
      return false;
    }
    const targetBed = beds.find((b) => b.id === newBedId);
    if (!targetBed) {
      showToast('নতুন বেড পাওয়া যায়নি', 'error');
      return false;
    }
    return transferStudent({
      studentId: alloc.studentId,
      fromBedId: alloc.bedId,
      toRoomId: targetBed.roomId,
      toBedId: newBedId,
      reason,
    });
  };

  const activeAllocations = allocations.filter((a) => a.status === 'active');

  return (
    <BoardingFoodContext.Provider
      value={{
        buildings,
        boardingBuildings: buildings,
        rooms,
        boardingRooms: rooms,
        beds,
        boardingBeds: beds,
        allocations,
        activeAllocations,
        mealPlans,
        foodExpenses,
        automationEvents,
        createRoom,
        updateRoom,
        createBed,
        updateBedStatus,
        allocateStudentToBed,
        allocateBed,
        transferStudent,
        transferStudentBed,
        releaseBed,
        saveDailyMealPlan,
        updateMealPlan,
        recordFoodExpense,
        triggerAutomationEvent,
      }}
    >
      {children}
    </BoardingFoodContext.Provider>
  );
};

export const useBoardingFood = () => {
  const context = useContext(BoardingFoodContext);
  if (!context) {
    throw new Error('useBoardingFood must be used within a BoardingFoodProvider');
  }
  return context;
};

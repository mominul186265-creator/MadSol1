import React, { useState } from 'react';
import {
  Home,
  Bed,
  Utensils,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  DollarSign,
  Coffee,
  Sun,
  Moon,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useBoardingFood } from '../../context/BoardingFoodContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BoardingAllocation } from '../../types/boarding';
import { AllocateBedModal } from './AllocateBedModal';
import { TransferBedModal } from './TransferBedModal';
import { AddFoodExpenseModal } from './AddFoodExpenseModal';
import { DailyMealRosterView } from './DailyMealRosterView';

export const BoardingManagementView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const boardingContext = useBoardingFood();

  const boardingBuildings = boardingContext.boardingBuildings || boardingContext.buildings || [];
  const boardingRooms = boardingContext.boardingRooms || boardingContext.rooms || [];
  const boardingBeds = boardingContext.boardingBeds || boardingContext.beds || [];
  const activeAllocations = boardingContext.activeAllocations || boardingContext.allocations || [];
  const mealPlans = boardingContext.mealPlans || [];
  const foodExpenses = boardingContext.foodExpenses || [];
  const releaseBed = boardingContext.releaseBed;

  const isBn = language === 'bn';
  const canManage =
    user?.role === 'super_admin' ||
    user?.role === 'madrasa_admin' ||
    user?.role === 'principal' ||
    user?.role === 'accountant';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'rooms_beds' | 'allocations' | 'daily_meals' | 'meal_plans' | 'food_expenses'>('rooms_beds');

  // Modals state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedAllocationForTransfer, setSelectedAllocationForTransfer] = useState<BoardingAllocation | null>(null);
  const [isFoodExpenseOpen, setIsFoodExpenseOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');

  // Stats Calculations
  const totalBuildings = (boardingBuildings || []).length;
  const totalRooms = (boardingRooms || []).length;
  const totalBeds = (boardingBeds || []).length;
  const occupiedBeds = (boardingBeds || []).filter((b) => b.status === 'occupied').length;
  const availableBeds = (boardingBeds || []).filter((b) => b.status === 'available').length;
  const totalFoodExpensesAmt = (foodExpenses || []).reduce((acc, f) => acc + (f.totalAmount || f.amount || 0), 0);

  // Filtered rooms
  const filteredRooms = (boardingRooms || []).filter((r) => {
    if (selectedBuildingId !== 'all' && r.buildingId !== selectedBuildingId) return false;
    if (searchQuery && !r.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) && !r.roomNameBn?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Home className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isBn ? 'আবাসিক হোস্টেল ও মেস খানা ব্যবস্থাপনা' : 'Hostel Boarding & Food Management'}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? 'ভবন ও রুম সিট বণ্টন, শিক্ষার্থী স্থানান্তর, মেস মেন্যু ও হিসাবের সাথে সংযুক্ত খাদ্য ব্যয়'
              : 'Hostel bed allocations, room transfers, daily meal plans and finance-integrated food ledger'}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAllocateOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              <Bed className="h-4 w-4" />
              <span>{isBn ? 'নতুন সিট বরাদ্দ' : 'Allocate Bed'}</span>
            </button>
            <button
              onClick={() => setIsFoodExpenseOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>{isBn ? 'খাদ্য খরচ এন্ট্রি' : 'Record Meal Expense'}</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট আবাসিক রুম' : 'Total Rooms'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalRooms} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalBuildings} {isBn ? 'টি ভবনে' : 'buildings'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'মোট হোস্টেল বেড' : 'Total Beds'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
            {totalBeds} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-700 dark:text-blue-300">
            {isBn ? 'ধারণক্ষমতা' : 'Total capacity'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'বরাদ্দকৃত সিট' : 'Occupied Beds'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {occupiedBeds} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
            {Math.round((occupiedBeds / (totalBeds || 1)) * 100)}% {isBn ? 'পূর্ণ' : 'occupied'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'ফাঁকা বেড' : 'Available Beds'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {availableBeds} <span className="text-xs font-normal text-slate-500">{isBn ? 'টি' : ''}</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
            {isBn ? 'অবিলম্বে বরাদ্দযোগ্য' : 'Ready to allocate'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isBn ? 'চলতি মাসে খাদ্য ব্যয়' : 'Food Expenses'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            ৳{totalFoodExpensesAmt.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {isBn ? 'হিসাব বহিতে অন্তর্ভুক্ত' : 'Finance synced'}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('rooms_beds')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'rooms_beds'
                ? 'border-b-2 border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'ভবন ও রুম বিন্যাস' : 'Rooms & Bed Grid'}
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'allocations'
                ? 'border-b-2 border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? `সিট বরাদ্দ ও স্থানান্তর (${(activeAllocations || []).length})` : 'Allocations & Transfer'}
          </button>
          <button
            onClick={() => setActiveTab('daily_meals')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'daily_meals'
                ? 'border-b-2 border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'দৈনিক মিল খাতা ও লিল্লাহ খাদ্য' : 'Daily Meal Roster'}
          </button>
          <button
            onClick={() => setActiveTab('meal_plans')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'meal_plans'
                ? 'border-b-2 border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? 'সাপ্তাহিক মেস খাবার তালিকা' : 'Weekly Meal Plan'}
          </button>
          <button
            onClick={() => setActiveTab('food_expenses')}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold rounded-t-xl transition ${
              activeTab === 'food_expenses'
                ? 'border-b-2 border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {isBn ? `খাদ্য ব্যয় হিসাব (${(foodExpenses || []).length})` : 'Food Expenses'}
          </button>
        </div>
      </div>

      {/* TAB 1: ROOMS & BEDS GRID */}
      {activeTab === 'rooms_beds' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'রুম নম্বর বা নাম দিয়ে খুঁজুন...' : 'Search room...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">{isBn ? 'সকল ভবন' : 'All Buildings'}</option>
                {boardingBuildings.map((bld) => (
                  <option key={bld.id} value={bld.id}>
                    {bld.nameBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const bld = boardingBuildings.find((b) => b.id === room.buildingId);
              const roomBeds = boardingBeds.filter((b) => b.roomId === room.id);
              const occupiedCount = roomBeds.filter((b) => b.status === 'occupied').length;

              return (
                <div
                  key={room.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {bld?.nameBn} — তলা {room.floor}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                        রুম {room.roomNumber} ({room.roomNameBn})
                      </h3>
                    </div>

                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      ধারণ: {occupiedCount}/{room.capacity}
                    </span>
                  </div>

                  {/* Bed Slots Visuals */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {roomBeds.map((bed) => {
                      const isOccupied = bed.status === 'occupied';

                      return (
                        <div
                          key={bed.id}
                          className={`p-2 rounded-xl border text-center transition ${
                            isOccupied
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                              : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400'
                          }`}
                        >
                          <Bed className={`h-4 w-4 mx-auto mb-1 ${isOccupied ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <div className="text-[11px] font-bold">বেড {bed.bedNumber}</div>
                          <div className="text-[10px] truncate">
                            {isOccupied ? bed.occupiedStudentName : 'ফাঁকা'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 dark:border-slate-800">
                    <span>রুম তত্ত্বাবধায়ক: {room.supervisorTeacherName || 'নির্ধারিত নয়'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ALLOCATIONS & TRANSFER */}
      {activeTab === 'allocations' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {isBn ? 'সক্রিয় হোস্টেল সিট বরাদ্দ তালিকা' : 'Active Hostel Seat Allocations'}
            </h3>
            <span className="text-xs text-slate-500">মোট {(activeAllocations || []).length} জন শিক্ষার্থী</span>
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">রোল ও জামাত</th>
                  <th className="py-3 px-4">রুম ও বেড</th>
                  <th className="py-3 px-4">বরাদ্দের তারিখ</th>
                  <th className="py-3 px-4">মাসিক ফি</th>
                  <th className="py-3 px-4">অভিভাবকের ফোন</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeAllocations.map((alloc) => {
                  const b = boardingBeds.find((bed) => bed.id === alloc.bedId);
                  const r = boardingRooms.find((room) => room.id === b?.roomId);

                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {alloc.studentNameBn}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        রোল: {alloc.studentRoll} | {alloc.className}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">রুম {r?.roomNumber}</span> — বেড {b?.bedNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{alloc.startDate}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 whitespace-nowrap">৳{alloc.monthlyFee}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono">{alloc.guardianPhone || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canManage && (
                            <>
                              <button
                                onClick={() => setSelectedAllocationForTransfer(alloc)}
                                className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                                title="রুম স্থানান্তর"
                              >
                                <ArrowRightLeft className="h-3 w-3" />
                                <span>স্থানান্তর</span>
                              </button>
                              <button
                                onClick={() => releaseBed(alloc.id)}
                                className="rounded-lg bg-rose-50 p-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                                title="বেড মুক্ত করুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DAILY MEAL ROSTER & LILLAH MESS */}
      {activeTab === 'daily_meals' && <DailyMealRosterView />}

      {/* TAB 3: WEEKLY MEAL PLANS */}
      {activeTab === 'meal_plans' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              {isBn ? 'সাপ্তাহিক মেস খাবার তালিকা (৭ দিনের মেন্যু)' : 'Weekly Mess Dining Menu Schedule'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              আবাসিক ও অনাবাসিক শিক্ষার্থীদের সকালের নাস্তা, দুপুর ও রাতের সুষম খাবার রুটিন
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealPlans.map((mp) => (
                <div
                  key={mp.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-300">
                      {mp.dayBn}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">{mp.dayEn}</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Breakfast */}
                    <div className="flex items-start gap-2">
                      <Coffee className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">সকাল:</span>
                        <span className="text-slate-600 dark:text-slate-400">{mp.breakfastMenuBn}</span>
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="flex items-start gap-2">
                      <Sun className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">দুপুর:</span>
                        <span className="text-slate-600 dark:text-slate-400">{mp.lunchMenuBn}</span>
                      </div>
                    </div>

                    {/* Snacks */}
                    {mp.snacksMenuBn && (
                      <div className="flex items-start gap-2">
                        <Utensils className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">বিকাল:</span>
                          <span className="text-slate-600 dark:text-slate-400">{mp.snacksMenuBn}</span>
                        </div>
                      </div>
                    )}

                    {/* Dinner */}
                    <div className="flex items-start gap-2">
                      <Moon className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">রাত:</span>
                        <span className="text-slate-600 dark:text-slate-400">{mp.dinnerMenuBn}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOOD EXPENSES & FINANCE SYNC */}
      {activeTab === 'food_expenses' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {isBn ? 'খাদ্য সামগ্রী ক্রয় ও মেস খরচ খতিয়ান' : 'Food Purchases & Meal Ledger'}
              </h3>
              <p className="text-xs text-slate-500">
                প্রতিটি খরচের এন্ট্রি স্বয়ংক্রিয়ভাবে মাদরাসার সাধারণ হিসাব বহিতে (Accounts) যুক্ত থাকে
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => setIsFoodExpenseOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>{isBn ? 'নতুন খরচ এন্ট্রি' : 'Add Expense'}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">ভাউচার</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">পণ্য ও বিবরণ</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">দোকান / সরবরাহকারী</th>
                  <th className="py-3 px-4">টাকা (BDT)</th>
                  <th className="py-3 px-4">অনুমোদনকারী</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {foodExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{exp.voucherNumber}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{exp.itemNameBn}</td>
                    <td className="py-3 px-4">{exp.quantity}</td>
                    <td className="py-3 px-4">{exp.vendorName}</td>
                    <td className="py-3 px-4 font-bold text-rose-600 whitespace-nowrap">৳{exp.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500">{exp.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AllocateBedModal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
      />

      <TransferBedModal
        allocation={selectedAllocationForTransfer}
        isOpen={!!selectedAllocationForTransfer}
        onClose={() => setSelectedAllocationForTransfer(null)}
      />

      <AddFoodExpenseModal
        isOpen={isFoodExpenseOpen}
        onClose={() => setIsFoodExpenseOpen(false)}
      />
    </div>
  );
};

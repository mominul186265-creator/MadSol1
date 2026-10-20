import React, { useState } from 'react';
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Printer,
  Calendar,
  Sparkles,
  HeartHandshake,
  ChefHat,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { useBoardingFood } from '../../context/BoardingFoodContext';
import { useToast } from '../../context/ToastContext';

interface StudentMealStatus {
  studentId: string;
  fullNameBn: string;
  roll: number;
  roomName: string;
  isLillah: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export const DailyMealRosterView: React.FC = () => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const madrasaData = useMadrasaData();
  const students = madrasaData?.students || [];
  const boardingCtx = useBoardingFood();
  const activeAllocations = boardingCtx.activeAllocations || boardingCtx.allocations || [];
  const { showToast } = useToast();
  const isBn = language === 'bn';

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lillah' | 'general'>('all');
  const [guestMeals, setGuestMeals] = useState<number>(3);

  // Initialize meal roster from active allocations or students
  const [mealRoster, setMealRoster] = useState<StudentMealStatus[]>(() => {
    return (students || []).slice(0, 15).map((s, idx) => ({
      studentId: s.id,
      fullNameBn: s.fullNameBn,
      roll: s.rollNumber,
      roomName: idx < 6 ? 'রুম ১০১ (হযরত আবু বকর রা.)' : 'রুম ১০২ (হযরত উমর রা.)',
      isLillah: idx % 3 === 0, // 1 in 3 is Lillah orphan/insolvent student
      breakfast: true,
      lunch: idx !== 2, // one student has meal off
      dinner: true,
    }));
  });

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  const toggleMeal = (studentId: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    setMealRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, [meal]: !item[meal] } : item
      )
    );
  };

  const filteredList = mealRoster.filter((item) => {
    const matchQuery =
      item.fullNameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roll.toString().includes(searchQuery) ||
      item.roomName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType =
      filterType === 'all'
        ? true
        : filterType === 'lillah'
        ? item.isLillah
        : !item.isLillah;

    return matchQuery && matchType;
  });

  // Calculate totals
  const totalBreakfast = mealRoster.filter((m) => m.breakfast).length + guestMeals;
  const totalLunch = mealRoster.filter((m) => m.lunch).length + guestMeals;
  const totalDinner = mealRoster.filter((m) => m.dinner).length + guestMeals;
  const lillahCount = mealRoster.filter((m) => m.isLillah).length;

  // Approx Rice estimation (approx 130g unboiled rice per meal)
  const totalMealsToday = totalBreakfast + totalLunch + totalDinner;
  const approxRiceKg = ((totalMealsToday * 130) / 1000).toFixed(1);

  const handlePrintMemo = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Print - Screen Only */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সকল আবাসিক ({toBnNum(mealRoster.length)})
            </button>
            <button
              onClick={() => setFilterType('lillah')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                filterType === 'lillah'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              লিল্লাহ বোর্ডিং ({toBnNum(lillahCount)})
            </button>
            <button
              onClick={() => setFilterType('general')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                filterType === 'general'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সাধারণ বোর্ডিং
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <span>মেহমান মিল:</span>
            <input
              type="number"
              min="0"
              max="50"
              value={guestMeals}
              onChange={(e) => setGuestMeals(parseInt(e.target.value, 10) || 0)}
              className="w-10 text-center font-bold font-mono rounded bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700"
            />
          </div>

          <button
            onClick={handlePrintMemo}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'বাবুর্চির মেমো প্রিন্ট' : 'Print Kitchen Memo'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Breakfast, Lunch, Dinner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">সকালের নাস্তা</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {toBnNum(totalBreakfast)} <span className="text-xs font-normal text-slate-500">মিল</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">মেহমান: {toBnNum(guestMeals)} টি অন্তর্ভুক্ত</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">দুপুরের খাবার</span>
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-orange-600 dark:text-orange-400 font-mono">
            {toBnNum(totalLunch)} <span className="text-xs font-normal text-slate-500">মিল</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">মেহমান: {toBnNum(guestMeals)} টি অন্তর্ভুক্ত</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">রাতের খাবার</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {toBnNum(totalDinner)} <span className="text-xs font-normal text-slate-500">মিল</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">মেহমান: {toBnNum(guestMeals)} টি অন্তর্ভুক্ত</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">চাল পরিমাপ মেমো</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {toBnNum(approxRiceKg)} <span className="text-xs font-normal text-slate-500">কেজি চাল</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-bold">
            লিল্লাহ ছাত্র: {toBnNum(lillahCount)} জন (ফ্রি)
          </div>
        </div>
      </div>

      {/* Printable Kitchen Slip Header (shows on print) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h2 className="text-xl font-black text-slate-900">{institution?.nameBn || 'দারুল উলুম ইসলামিয়া কওমি মাদরাসা'}</h2>
        <p className="text-xs text-slate-600">মেস ও বোর্ডিং বিভাগ • দৈনিক বাবুর্চির রান্নার মেমো</p>
        <div className="mt-1 text-xs font-bold text-slate-800">
          তারিখ: {date} | মোট রান্নার মিল: {toBnNum(totalMealsToday)} টি (চাল প্রয়োজন: {toBnNum(approxRiceKg)} কেজি)
        </div>
      </div>

      {/* Search Bar - Screen Only */}
      <div className="print:hidden relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={isBn ? 'নাম, রোল বা রুম নং দিয়ে খুঁজুন...' : 'Search student or room...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Meal Roster Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">রোল</th>
                <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                <th className="py-3 px-4">কক্ষ ও সিট</th>
                <th className="py-3 px-4 text-center">ক্যাটাগরি</th>
                <th className="py-3 px-4 text-center">সকালের নাস্তা</th>
                <th className="py-3 px-4 text-center">দুপুরের খাবার</th>
                <th className="py-3 px-4 text-center">রাতের খাবার</th>
                <th className="py-3 px-4 text-center print:hidden">আজকের স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map((item) => {
                const totalActive = (item.breakfast ? 1 : 0) + (item.lunch ? 1 : 0) + (item.dinner ? 1 : 0);
                return (
                  <tr key={item.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      #{toBnNum(item.roll)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {item.fullNameBn}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {item.roomName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isLillah ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          লিল্লাহ বোর্ডিং (ফ্রি)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          সাধারণ মেস
                        </span>
                      )}
                    </td>

                    {/* Breakfast Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleMeal(item.studentId, 'breakfast')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer print:pointer-events-none ${
                          item.breakfast
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                        }`}
                      >
                        {item.breakfast ? 'চালু (On)' : 'বন্ধ (Off)'}
                      </button>
                    </td>

                    {/* Lunch Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleMeal(item.studentId, 'lunch')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer print:pointer-events-none ${
                          item.lunch
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                        }`}
                      >
                        {item.lunch ? 'চালু (On)' : 'বন্ধ (Off)'}
                      </button>
                    </td>

                    {/* Dinner Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleMeal(item.studentId, 'dinner')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer print:pointer-events-none ${
                          item.dinner
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 line-through'
                        }`}
                      >
                        {item.dinner ? 'চালু (On)' : 'বন্ধ (Off)'}
                      </button>
                    </td>

                    {/* Total Status */}
                    <td className="py-3 px-4 text-center print:hidden">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        totalActive === 3
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : totalActive > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {toBnNum(totalActive)} বেলা সচল
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Bed, CheckCircle } from 'lucide-react';
import { useBoardingFood } from '../../context/BoardingFoodContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AllocateBedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AllocateBedModal: React.FC<AllocateBedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { institution } = useAuth();
  const { language } = useLanguage();
  const { students } = useMadrasaData();
  const boardingCtx = useBoardingFood();
  const boardingRooms = boardingCtx.boardingRooms || boardingCtx.rooms || [];
  const boardingBeds = boardingCtx.boardingBeds || boardingCtx.beds || [];
  const activeAllocations = boardingCtx.activeAllocations || boardingCtx.allocations || [];
  const allocateBed = boardingCtx.allocateBed;

  const isBn = language === 'bn';

  // Available beds only
  const availableBeds = (boardingBeds || []).filter((b) => b.status === 'available');

  const [studentId, setStudentId] = useState('');
  const [bedId, setBedId] = useState(availableBeds[0]?.id || '');
  const [monthlyFee, setMonthlyFee] = useState(2500);
  const [notes, setNotes] = useState('আবাসিক হোস্টেলে সিট বরাদ্দ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out students who already have an active bed
  const allocatedStudentIds = new Set((activeAllocations || []).map((a) => a.studentId));
  const unallocatedStudents = (students || []).filter((s) => !allocatedStudentIds.has(s.id));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !bedId) return;

    const selectedStudent = students.find((s) => s.id === studentId);
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      await allocateBed({
        institutionId: institution?.id || 'inst-001',
        bedId,
        studentId,
        studentNameBn: selectedStudent.fullNameBn,
        studentRoll: selectedStudent.rollNumber,
        className: selectedStudent.className || 'হিফজ বিভাগ',
        startDate: new Date().toISOString().split('T')[0],
        monthlyFee,
        guardianPhone: selectedStudent.guardianMobile,
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <Bed className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              {isBn ? 'নতুন সিট বরাদ্দ করুন' : 'Allocate Hostel Bed'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'শিক্ষার্থী নির্বাচন করুন' : 'Select Student'} *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            >
              <option value="">{isBn ? '-- শিক্ষার্থী বেছে নিন --' : '-- Choose Student --'}</option>
              {unallocatedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullNameBn} (রোল: {s.rollNumber}) - {s.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'ফাঁকা বেড / সিট নির্বাচন করুন' : 'Select Available Bed'} *
            </label>
            {availableBeds.length === 0 ? (
              <p className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg">
                {isBn ? 'দুঃখিত, বর্তমানে কোনো ফাঁকা বেড নেই।' : 'No available beds currently.'}
              </p>
            ) : (
              <select
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              >
                {availableBeds.map((b) => {
                  const r = boardingRooms.find((room) => room.id === b.roomId);
                  return (
                    <option key={b.id} value={b.id}>
                      রুম {r?.roomNumber} - বেড {b.bedNumber} ({b.bedLabel})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'মাসিক আবাসিক / খোরাকি ফি (টাকা)' : 'Monthly Boarding Fee (BDT)'}
            </label>
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'বিশেষ মন্তব্য' : 'Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !studentId || !bedId}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'বরাদ্দ হচ্ছে...' : 'Allocating...') : (isBn ? 'সিট বরাদ্দ নিশ্চিত করুন' : 'Confirm Allocation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

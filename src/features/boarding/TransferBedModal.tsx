import React, { useState } from 'react';
import { X, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { useBoardingFood } from '../../context/BoardingFoodContext';
import { useLanguage } from '../../context/LanguageContext';
import { BoardingAllocation } from '../../types/boarding';

interface TransferBedModalProps {
  allocation: BoardingAllocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferBedModal: React.FC<TransferBedModalProps> = ({
  allocation,
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const boardingCtx = useBoardingFood();
  const boardingRooms = boardingCtx.boardingRooms || boardingCtx.rooms || [];
  const boardingBeds = boardingCtx.boardingBeds || boardingCtx.beds || [];
  const transferStudentBed = boardingCtx.transferStudentBed;
  const isBn = language === 'bn';

  const availableBeds = (boardingBeds || []).filter((b) => b.status === 'available');

  const [newBedId, setNewBedId] = useState(availableBeds[0]?.id || '');
  const [reason, setReason] = useState('পড়াশোনার সুবিধার্থে অন্য রুমে স্থানান্তর');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !allocation) return null;

  const currentBed = (boardingBeds || []).find((b) => b.id === allocation.bedId);
  const currentRoom = (boardingRooms || []).find((r) => r.id === currentBed?.roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedId) return;

    setIsSubmitting(true);
    try {
      await transferStudentBed(allocation.id, newBedId, reason);
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
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                {isBn ? 'রুম ও বেড স্থানান্তর' : 'Transfer Bed / Room'}
              </h3>
              <p className="text-xs text-slate-500">{allocation.studentNameBn}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 block">বর্তমান বরাদ্দ:</span>
            <strong className="text-slate-800 dark:text-white mt-0.5 block">
              রুম {currentRoom?.roomNumber} ({currentRoom?.roomNameBn}) — বেড {currentBed?.bedNumber}
            </strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'নতুন ফাঁকা বেড নির্বাচন করুন' : 'Select Destination Bed'} *
            </label>
            {availableBeds.length === 0 ? (
              <p className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg">
                {isBn ? 'বর্তমানে কোনো বিকল্প ফাঁকা বেড নেই।' : 'No other vacant beds available.'}
              </p>
            ) : (
              <select
                value={newBedId}
                onChange={(e) => setNewBedId(e.target.value)}
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
              {isBn ? 'স্থানান্তরের কারণ' : 'Reason for Transfer'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              disabled={isSubmitting || !newBedId}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'স্থানান্তর হচ্ছে...' : 'Transferring...') : (isBn ? 'স্থানান্তর নিশ্চিত করুন' : 'Confirm Transfer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

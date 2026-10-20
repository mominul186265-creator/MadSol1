import React, { useState } from 'react';
import {
  X,
  Printer,
  Search,
  Users,
  Grid,
  MapPin,
  Building,
  CheckCircle,
  FileSpreadsheet,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMadrasaData } from '../../context/MadrasaDataContext';
import { Exam } from '../../types/academic';
import { MadSolLogo } from '../../components/common/MadSolLogo';

interface SeatPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
}

export const SeatPlanModal: React.FC<SeatPlanModalProps> = ({
  isOpen,
  onClose,
  exam,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();
  const { students } = useMadrasaData();
  const isBn = language === 'bn';

  const [viewMode, setViewMode] = useState<'slips' | 'room_chart'>('slips');
  const [selectedRoom, setSelectedRoom] = useState<string>('হল-১: মূল ভবন মিলনায়তন');
  const [perBenchStudents, setPerBenchStudents] = useState<number>(2);

  if (!isOpen) return null;

  const toBnNum = (n: number | string) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().replace(/[0-9]/g, (w) => bnNums[parseInt(w, 10)]);
  };

  const roomsList = [
    { id: 'room-1', name: 'হল-১: মূল ভবন মিলনায়তন', capacity: 40, rollStart: 1, rollEnd: 40 },
    { id: 'room-2', name: 'হল-২: হিফজ ভবন ৩য় তলা', capacity: 30, rollStart: 41, rollEnd: 70 },
    { id: 'room-3', name: 'কক্ষ-১০১: কিতাব বিভাগ পশ্চিম', capacity: 25, rollStart: 71, rollEnd: 95 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="print:hidden flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/40 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isBn ? 'পরীক্ষার আসন বিন্যাস (Seat Plan Generator)' : 'Exam Seat Plan & Desk Slips'}
                <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-medium">
                  {exam.nameBn}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'বেঞ্চ স্টিকার স্লিপ এবং নোটিশ বোর্ডের জন্য রুমভিত্তিক মাস্টার শিট প্রিন্ট করুন'
                  : 'Generate bench slips with cut lines and master notice board room charts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'সিট প্ল্যান প্রিন্ট করুন' : 'Print Seat Plan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="print:hidden p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('slips')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'slips'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 inline mr-1" />
                {isBn ? 'বেঞ্চ স্টিকার স্লিপ' : 'Desk Slips'}
              </button>
              <button
                onClick={() => setViewMode('room_chart')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'room_chart'
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" />
                {isBn ? 'রুমভিত্তিক মাস্টার চার্ট' : 'Room Chart'}
              </button>
            </div>

            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
            >
              {roomsList.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name} ({toBnNum(r.capacity)} সিট)
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            মোট পরীক্ষার্থী: <strong className="text-teal-700 dark:text-teal-400">{toBnNum(students.length)}</strong> জন
          </div>
        </div>

        {/* Printable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 print:bg-white print:p-0">
          {viewMode === 'slips' ? (
            /* VIEW 1: DESK SLIPS (Cut-outs for each bench) */
            <div className="max-w-4xl mx-auto print:max-w-none">
              <div className="text-center mb-6 print:mb-4">
                <h2 className="text-xl font-bold text-slate-900 print:text-black">{institution?.nameBn || 'দারুল উলুম ইসলামিয়া কওমি মাদরাসা'}</h2>
                <p className="text-xs text-slate-600">{exam.nameBn} ({exam.academicYear}) • আসন বিন্যাস স্লিপ (Desk Slips)</p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                  কক্ষ: {selectedRoom}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
                {students.map((student, idx) => (
                  <div
                    key={student.id}
                    className="border-2 border-dashed border-slate-400 rounded-xl p-3 bg-white text-slate-900 shadow-2xs relative print:shadow-none print:break-inside-avoid"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                        বেঞ্চ #{toBnNum(Math.floor(idx / 2) + 1)}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {student.studentId}
                      </span>
                    </div>

                    <div className="text-center py-1">
                      <span className="text-[10px] text-slate-500 block">রোল নম্বর:</span>
                      <strong className="text-2xl font-black text-slate-900 block font-mono">
                        #{toBnNum(student.rollNumber)}
                      </strong>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 mt-1 text-[11px] space-y-0.5">
                      <p className="font-bold truncate text-slate-800">{student.fullNameBn}</p>
                      <p className="text-[10px] text-slate-500 truncate">{student.currentClass || 'হিফজুল কুরআন বিভাগ'}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] text-slate-400">
                      <span>{exam.nameBn}</span>
                      <Scissors className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VIEW 2: NOTICE BOARD MASTER ROOM CHART */
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h1 className="text-2xl font-black text-slate-900">{institution?.nameBn || 'দারুল উলুম ইসলামিয়া কওমি মাদরাসা'}</h1>
                <p className="text-xs text-slate-600 mt-1">{institution?.address || 'মিরপুর-১২, ঢাকা-১২১৬'}</p>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                  {exam.nameBn} • কেন্দ্রীয় আসন বিন্যাস তালিকা (Master Seat Plan)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {roomsList.map((r, i) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <h3 className="text-xs font-bold text-slate-800 mb-1">{r.name}</h3>
                    <div className="text-lg font-black text-teal-800 font-mono">
                      রোল #{toBnNum(r.rollStart)} - #{toBnNum(r.rollEnd)}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">মোট আসন: {toBnNum(r.capacity)} টি</span>
                  </div>
                ))}
              </div>

              {/* Master Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-800 text-white text-[11px]">
                  <tr>
                    <th className="p-2 border border-slate-700 text-center w-12">ক্রম</th>
                    <th className="p-2 border border-slate-700 text-center w-24">রোল নং</th>
                    <th className="p-2 border border-slate-700">শিক্ষার্থীর নাম</th>
                    <th className="p-2 border border-slate-700">বিভাগ / জামাত</th>
                    <th className="p-2 border border-slate-700 text-center">নির্ধারিত কক্ষ ও বেঞ্চ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50 text-[11px]">
                      <td className="p-2 border border-slate-300 text-center font-mono">{toBnNum(idx + 1)}</td>
                      <td className="p-2 border border-slate-300 text-center font-black font-mono text-emerald-800">
                        #{toBnNum(st.rollNumber)}
                      </td>
                      <td className="p-2 border border-slate-300 font-bold">{st.fullNameBn}</td>
                      <td className="p-2 border border-slate-300">{st.currentClass || 'হিফজুল কুরআন'}</td>
                      <td className="p-2 border border-slate-300 text-center font-medium text-slate-700">
                        {idx < 40 ? 'হল-১ (বেঞ্চ ' + toBnNum(Math.floor(idx / 2) + 1) + ')' : 'হল-২ (বেঞ্চ ' + toBnNum(Math.floor((idx - 40) / 2) + 1) + ')'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-12 flex justify-between text-xs pt-6 border-t border-slate-300">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="text-slate-600">হল পরিদর্শক</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="text-slate-600">পরীক্ষা নিয়ন্ত্রক</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="text-slate-900 font-bold">মুহতামিম / অধ্যক্ষ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

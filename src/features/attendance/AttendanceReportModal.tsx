import React from 'react';
import { Printer, X, Download, Building, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AttendanceTargetType, AttendanceStats } from '../../types/step4';
import { AttendanceTargetRow } from './useAttendance';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  targetType: AttendanceTargetType;
  rows: AttendanceTargetRow[];
  stats: AttendanceStats;
  departmentName?: string;
  className?: string;
}

export const AttendanceReportModal: React.FC<AttendanceReportModalProps> = ({
  isOpen,
  onClose,
  date,
  targetType,
  rows,
  stats,
  departmentName,
  className,
}) => {
  const { institution } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:m-0 print:w-full print:max-w-none">
        {/* Controls - Hidden on print */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {isBn ? 'অফিসিয়াল হাজিরা রিপোর্ট' : 'Official Attendance Report'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {isBn ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save PDF'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="space-y-6 print:space-y-4">
          {/* Institutional Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              {institution?.nameBn || 'দারুল উলুম ইসলামিয়া মাদ্রাসা'}
            </h1>
            <p className="text-xs font-medium text-slate-600">
              {institution?.nameEn || 'Darul Uloom Islamia Madrasa'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {institution?.addressBn || 'ঢাকা, বাংলাদেশ'} • ফোন: {institution?.phone || '০১৭১১০০০১১১'} • EIIN: {institution?.eiinNumber || '১৩৪৫৮৯'}
            </p>

            <div className="mt-4 inline-block bg-slate-100 px-4 py-1.5 rounded-full border border-slate-300">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {targetType === 'student' ? 'শিক্ষার্থী দৈনিক হাজিরা প্রতিবেদন' : 'শিক্ষক ও স্টাফ দৈনিক হাজিরা প্রতিবেদন'}
              </span>
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">তারিখ:</span>
              <span className="font-bold text-slate-800 font-mono">{date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">বিভাগ:</span>
              <span className="font-bold text-slate-800">{departmentName || 'সকল বিভাগ'}</span>
            </div>
            {targetType === 'student' && (
              <div>
                <span className="text-slate-500 block text-[11px]">শ্রেণি / জামাত:</span>
                <span className="font-bold text-slate-800">{className || 'সকল শ্রেণি'}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block text-[11px]">উপস্থিতির হার:</span>
              <span className="font-bold text-emerald-700 font-mono">{stats.attendance_percentage}%</span>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-[10px] text-slate-500">মোট সংখ্যা</div>
              <div className="font-bold text-base font-mono">{stats.total}</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="text-[10px] text-emerald-600">উপস্থিত</div>
              <div className="font-bold text-base font-mono">{stats.present}</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              <div className="text-[10px] text-rose-600">অনুপস্থিত</div>
              <div className="font-bold text-base font-mono">{stats.absent}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <div className="text-[10px] text-amber-600">বিলম্ব</div>
              <div className="font-bold text-base font-mono">{stats.late}</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">
              <div className="text-[10px] text-purple-600">ছুটি</div>
              <div className="font-bold text-base font-mono">{stats.leave}</div>
            </div>
          </div>

          {/* Report Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-center w-10">#</th>
                  <th className="px-3 py-2 w-20">রোল/আইডি</th>
                  <th className="px-3 py-2">নাম</th>
                  <th className="px-3 py-2">বিভাগ/শ্রেণি</th>
                  <th className="px-3 py-2 text-center w-24">স্ট্যাটাস</th>
                  <th className="px-3 py-2 w-24 text-center">প্রবেশ সময়</th>
                  <th className="px-3 py-2">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.target_id} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 text-center text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-3 py-1.5 font-mono font-semibold">{r.target_code}</td>
                    <td className="px-3 py-1.5 font-medium text-slate-900">{r.target_name_bn}</td>
                    <td className="px-3 py-1.5 text-slate-600">
                      {r.department_name_bn} {r.class_name_bn ? `• ${r.class_name_bn}` : ''}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : r.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.status === 'present'
                          ? 'উপস্থিত'
                          : r.status === 'absent'
                          ? 'অনুপস্থিত'
                          : r.status === 'late'
                          ? 'বিলম্ব'
                          : 'ছুটি'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center font-mono text-slate-600">
                      {r.check_in_time || '-'}
                    </td>
                    <td className="px-3 py-1.5 text-slate-500 text-[11px]">{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Bar */}
          <div className="pt-16 grid grid-cols-3 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
              হাজিরা গ্রহণকারী উস্তায
            </div>
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
              বিভাগীয় প্রধান (নাযেমাত)
            </div>
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
              মুহতামিম / প্রিন্সিপাল
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

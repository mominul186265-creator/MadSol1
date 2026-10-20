import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Payment } from '../../types/finance';
import { Printer, Download, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { IslamicPattern } from '../../components/common/IslamicPattern';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const { language } = useLanguage();
  const { institution } = useAuth();

  if (!isOpen || !payment) return null;

  const isBn = language === 'bn';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${institution?.nameBn || 'MadSol'} - ${payment.receiptNumber}`,
        text: `Student Fee Receipt for ${payment.studentNameBn} (${payment.studentCode}). Amount Paid: BDT ${payment.totalPaid}. Receipt: ${payment.receiptNumber}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Receipt ${payment.receiptNumber}: ${payment.studentNameBn} (${payment.studentCode}) paid BDT ${payment.totalPaid} on ${payment.paymentDate}.`
      );
      alert(isBn ? 'রসিদের বিবরণ ক্লিপবোর্ডে কপি হয়েছে।' : 'Receipt summary copied to clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 dark:bg-emerald-900/50 border-b border-emerald-100 dark:border-emerald-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isBn ? 'ডিজিটাল পেমেন্ট রসিদ' : 'Digital Payment Receipt'}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              #{payment.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
              title={isBn ? 'প্রিন্ট করুন' : 'Print Receipt'}
            >
              <Printer className="w-3.5 h-3.5" />
              {isBn ? 'প্রিন্ট' : 'Print'}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-emerald-800/60 text-stone-700 dark:text-stone-200 hover:bg-stone-200 transition"
              title={isBn ? 'শেয়ার করুন' : 'Share'}
            >
              <Share2 className="w-3.5 h-3.5" />
              {isBn ? 'শেয়ার' : 'Share'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="madsol-printable-receipt" className="p-6 md:p-8 bg-white dark:bg-emerald-950 text-stone-800 dark:text-stone-100 relative">
          <IslamicPattern opacity={0.03} />

          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-emerald-200 dark:border-emerald-800">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
              <span className="text-2xl font-bold font-serif">ম</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-50">
              {institution?.nameBn || 'দারুল উলুম মাদ্রাসা ও এতিমখানা'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {institution?.nameEn || 'Darul Uloom Madrasa & Orphanage'}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              {(isBn ? institution?.addressBn : institution?.addressEn) || institution?.addressBn || 'মিরপুর রোড, ঢাকা-১২১৬'} | ফোন: {institution?.phone || '০১৭০০-০০০০০০'} | ইমেইল: {institution?.email || 'office@madsol.edu.bd'}
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold tracking-wide uppercase">
              {isBn ? 'ফি আদায়ের অফিসিয়াল রসিদ' : 'OFFICIAL STUDENT FEE RECEIPT'}
            </div>
          </div>

          {/* Receipt Meta & Student Information */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-stone-200 dark:border-emerald-800/80">
            <div className="space-y-1">
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'শিক্ষার্থীর নাম:' : 'Student Name:'}</span> <strong className="font-semibold text-emerald-900 dark:text-emerald-200">{payment.studentNameBn}</strong></p>
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'আইডি নং:' : 'Student ID:'}</span> <span className="font-mono font-medium">{payment.studentCode}</span></p>
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'বিভাগ ও শ্রেণি:' : 'Class & Dept:'}</span> {payment.studentClass} ({payment.department})</p>
              {payment.studentRoll && (
                <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'রোল নং:' : 'Roll No:'}</span> {payment.studentRoll}</p>
              )}
            </div>
            <div className="space-y-1 text-right">
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'রসিদ নং:' : 'Receipt No:'}</span> <strong className="font-mono text-emerald-700 dark:text-emerald-300">{payment.receiptNumber}</strong></p>
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'তারিখ:' : 'Date:'}</span> {payment.paymentDate}</p>
              <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span> <span className="uppercase font-medium">{payment.paymentMethod.replace('_', ' ')}</span></p>
              {payment.accountOrTrxRef && (
                <p><span className="text-stone-500 dark:text-stone-400">{isBn ? 'ট্রানজ্যাকশন আইডি:' : 'Trx Ref:'}</span> <span className="font-mono text-[11px]">{payment.accountOrTrxRef}</span></p>
              )}
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="my-4">
            <table className="w-full text-left text-xs border border-stone-200 dark:border-emerald-800/80 rounded-lg overflow-hidden">
              <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border-b border-stone-200 dark:border-emerald-800">
                <tr>
                  <th className="p-2.5 font-semibold">#</th>
                  <th className="p-2.5 font-semibold">{isBn ? 'ফি বিবরণ' : 'Fee Description'}</th>
                  <th className="p-2.5 text-right font-semibold">{isBn ? 'নির্ধারিত ফি' : 'Fee Amount'}</th>
                  <th className="p-2.5 text-right font-semibold">{isBn ? 'আদায়' : 'Paid Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-emerald-800/50">
                {payment.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-emerald-900/20">
                    <td className="p-2.5 text-stone-400">{idx + 1}</td>
                    <td className="p-2.5 font-medium">{isBn ? item.feeTitleBn : item.feeTitleEn}</td>
                    <td className="p-2.5 text-right text-stone-600 dark:text-stone-300 font-mono">৳{item.amount.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-semibold text-emerald-700 dark:text-emerald-300 font-mono">৳{item.paid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="bg-stone-50 dark:bg-emerald-900/30 rounded-xl p-4 border border-stone-200 dark:border-emerald-800/60 mb-6">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-stone-600 dark:text-stone-300">{isBn ? 'সর্বমোট প্রদেয়:' : 'Subtotal Payable:'}</div>
              <div className="text-right font-mono text-stone-800 dark:text-stone-100">৳{payment.subtotal.toLocaleString()}</div>

              {payment.discount > 0 && (
                <>
                  <div className="text-emerald-600 dark:text-emerald-400">{isBn ? 'বিশেষ ছাড় (Discount):' : 'Special Discount:'}</div>
                  <div className="text-right font-mono text-emerald-600 dark:text-emerald-400">- ৳{payment.discount.toLocaleString()}</div>
                </>
              )}

              {payment.fine > 0 && (
                <>
                  <div className="text-amber-600 dark:text-amber-400">{isBn ? 'বিলম্ব জরিমানা (Late Fine):' : 'Late Fine:'}</div>
                  <div className="text-right font-mono text-amber-600 dark:text-amber-400">+ ৳{payment.fine.toLocaleString()}</div>
                </>
              )}

              <div className="border-t border-stone-300 dark:border-emerald-800 pt-2 font-bold text-sm text-emerald-900 dark:text-emerald-100">
                {isBn ? 'মোট আদায়কৃত অর্থ:' : 'Total Amount Paid:'}
              </div>
              <div className="border-t border-stone-300 dark:border-emerald-800 pt-2 text-right font-mono font-bold text-base text-emerald-700 dark:text-emerald-300">
                ৳{payment.totalPaid.toLocaleString()}
              </div>

              <div className="text-stone-500 dark:text-stone-400 pt-1">{isBn ? 'অবশিষ্ট বকেয়া:' : 'Remaining Current Due:'}</div>
              <div className={`text-right font-mono font-semibold pt-1 ${payment.currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ৳{payment.currentDue.toLocaleString()}
              </div>
            </div>

            {payment.notes && (
              <p className="mt-3 pt-2 border-t border-stone-200 dark:border-emerald-800/60 text-[11px] text-stone-500 dark:text-stone-400 italic">
                {isBn ? 'মন্তব্য: ' : 'Notes: '}{payment.notes}
              </p>
            )}
          </div>

          {/* Barcode / QR & Signatures */}
          <div className="flex items-end justify-between pt-4 border-t border-dashed border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="space-y-1">
              <div className="font-mono text-[10px] tracking-widest text-stone-400 uppercase">
                |||| | |||||| ||| ||||| |||| ||||||
              </div>
              <div className="text-[10px] text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {isBn ? 'কম্পিউটার জেনারেটেড ডিজিটাল রসিদ' : 'Computer Generated Digital Receipt'}
              </div>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-stone-400 dark:border-stone-600 pb-1 mb-1 font-serif text-[11px] text-emerald-900 dark:text-emerald-200">
                {payment.receivedBy}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                {isBn ? 'আদায়কারী / ক্যাশিয়ার স্বাক্ষর' : 'Authorized Signature'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

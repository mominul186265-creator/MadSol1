import React, { useState } from 'react';
import { X, Utensils, CheckCircle } from 'lucide-react';
import { useBoardingFood } from '../../context/BoardingFoodContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FoodExpenseCategory } from '../../types/boarding';

interface AddFoodExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFoodExpenseModal: React.FC<AddFoodExpenseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { institution, user } = useAuth();
  const { language } = useLanguage();
  const { recordFoodExpense } = useBoardingFood();
  const isBn = language === 'bn';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<FoodExpenseCategory>('rice_flour');
  const [itemNameBn, setItemNameBn] = useState('');
  const [quantity, setQuantity] = useState('২ বস্তা');
  const [unitPrice, setUnitPrice] = useState(3200);
  const [totalAmount, setTotalAmount] = useState(6400);
  const [vendorName, setVendorName] = useState('মেসার্স মদিনা ট্রেডার্স');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'bKash'>('cash');
  const [fundId, setFundId] = useState('fund-001');
  const [notes, setNotes] = useState('মেসের শিক্ষার্থীদের জন্য মাসিক খাদ্য সামগ্রী ক্রয়');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameBn || totalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await recordFoodExpense({
        institutionId: institution?.id || 'inst-001',
        date,
        category,
        itemNameBn,
        itemNameEn: itemNameBn,
        quantity,
        unitPrice,
        totalAmount,
        vendorName,
        paymentMethod,
        fundId,
        voucherNumber: `FD-EXP-${Date.now().toString().slice(-4)}`,
        approvedBy: user?.fullNameBn || 'মুহতামিম সাহেব',
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                {isBn ? 'নতুন খাদ্য সামগ্রী ও মেস খরচ যুক্তকরণ' : 'Record Food & Meal Expense'}
              </h3>
              <p className="text-xs text-slate-500">অ্যাকাউন্টস লেজারের সাথে সরাসরি যুক্ত</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'খরচের ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodExpenseCategory)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="rice_flour">চাল ও আটা (Rice/Flour)</option>
                <option value="fish_meat">মাছ, মাংস ও ডিম (Fish/Meat)</option>
                <option value="vegetables">শাকসবজি ও ফলমূল (Vegetables)</option>
                <option value="oil_spices">তেল, ডাল ও মশলা (Oil/Spices)</option>
                <option value="gas_fuel">রান্নার গ্যাস ও জ্বালানি (Gas/Fuel)</option>
                <option value="groceries">অন্যান্য মুদি সামগ্রী (Groceries)</option>
                <option value="other">বিবিধ মেস খরচ (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'তারিখ' : 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'পণ্যের নাম ও বিবরণ' : 'Item Description'} *
            </label>
            <input
              type="text"
              value={itemNameBn}
              onChange={(e) => setItemNameBn(e.target.value)}
              placeholder="যেমন: মিনিকেট চাল ৫০ কেজি বস্তা"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পরিমাণ' : 'Quantity'}
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="যেমন: ৫০ কেজি"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'দর / রেট' : 'Rate'}
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setUnitPrice(p);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'মোট খরচ (টাকা)' : 'Total (BDT)'} *
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'দোকান / ভেন্ডার' : 'Vendor / Supplier'}
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পরিশোধের মাধ্যম' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="cash">নগদ (Cash)</option>
                <option value="bank">ব্যাংক (Bank)</option>
                <option value="bKash">বিকাশ (bKash)</option>
              </select>
            </div>
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
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isSubmitting ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'খরচ রেকর্ড করুন' : 'Record Expense')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

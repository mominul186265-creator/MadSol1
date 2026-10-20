import React, { useState } from 'react';
import {
  X,
  Zap,
  Sliders,
  Plus,
  Trash2,
  Clock,
  Send,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import {
  Automation,
  AutomationTriggerType,
  AutomationTriggerCategory,
  ConditionField,
  ConditionOperator,
  AutomationCondition,
  AutomationAction,
  AutomationActionType
} from '../../../types/automation';
import { useAutomation } from '../../../context/AutomationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Badge } from '../../../components/common/Badge';

interface AutomationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAutomation?: Automation | null;
}

export const AutomationBuilderModal: React.FC<AutomationBuilderModalProps> = ({
  isOpen,
  onClose,
  editAutomation
}) => {
  const { triggers, templates, createAutomation, updateAutomation } = useAutomation();
  const { language } = useLanguage();

  const isBn = language === 'bn';

  const [nameBn, setNameBn] = useState(editAutomation?.nameBn || '');
  const [nameEn, setNameEn] = useState(editAutomation?.nameEn || '');
  const [descriptionBn, setDescriptionBn] = useState(editAutomation?.descriptionBn || '');
  const [descriptionEn, setDescriptionEn] = useState(editAutomation?.descriptionEn || '');
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>(
    editAutomation?.triggerType || 'student_absent'
  );
  const [delayMinutes, setDelayMinutes] = useState<number>(editAutomation?.delayMinutes || 0);

  const [conditions, setConditions] = useState<AutomationCondition[]>(
    editAutomation?.conditions || [
      {
        id: 'c-init',
        field: 'attendance_status',
        operator: 'equals',
        value: 'absent'
      }
    ]
  );

  const [actions, setActions] = useState<AutomationAction[]>(
    editAutomation?.actions || [
      {
        id: 'a-init',
        type: 'send_sms',
        channel: 'sms',
        templateId: templates[0]?.id || 'tmpl-absent',
        targetRole: 'guardian'
      }
    ]
  );

  if (!isOpen) return null;

  const selectedTrigger = triggers.find((t) => t.type === triggerType);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        id: `cond-${Date.now()}`,
        field: 'amount',
        operator: 'greater_than',
        value: 0
      }
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        id: `act-${Date.now()}`,
        type: 'send_push',
        channel: 'push',
        templateId: templates[0]?.id || 'tmpl-absent',
        targetRole: 'guardian'
      }
    ]);
  };

  const handleRemoveAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn && !nameEn) return;

    const payload = {
      nameBn: nameBn || nameEn,
      nameEn: nameEn || nameBn,
      descriptionBn: descriptionBn || 'কাস্টম স্মার্ট অটোমেশন',
      descriptionEn: descriptionEn || 'Custom smart automation rule',
      category: (selectedTrigger?.category || 'student') as AutomationTriggerCategory,
      triggerType,
      conditions,
      delayMinutes: Number(delayMinutes) || 0,
      actions,
      status: 'active' as const
    };

    if (editAutomation) {
      updateAutomation(editAutomation.id, payload);
    } else {
      createAutomation(payload);
    }
    onClose();
  };

  return (
    <div
      id="automation-builder-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="automation-builder-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {editAutomation
                  ? isBn
                    ? 'অটোমেশন সম্পাদনা করুন'
                    : 'Edit Automation Rule'
                  : isBn
                  ? 'নতুন স্মার্ট অটোমেশন তৈরি করুন'
                  : 'Create Smart Automation Rule'}
                <Badge variant="primary">Rule Engine</Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'ট্রিগার ➔ শর্ত যাচাই ➔ বিলম্ব ➔ স্বয়ংক্রিয় অ্যাকশন'
                  : 'Trigger ➔ Condition Check ➔ Delay ➔ Automated Action'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Rule Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>১.</span> {isBn ? 'অটোমেশনের সাধারণ তথ্য' : 'General Information'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অটোমেশনের নাম (বাংলা)*' : 'Rule Name (Bangla)*'}
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: অনুপস্থিতি এসএমএস অ্যালার্ট"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'নাম (ইংরেজি)' : 'Rule Name (English)'}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Absent Student SMS Alert"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'বিবরণ' : 'Description'}
              </label>
              <input
                type="text"
                value={nameBn ? descriptionBn : descriptionEn}
                onChange={(e) =>
                  isBn ? setDescriptionBn(e.target.value) : setDescriptionEn(e.target.value)
                }
                placeholder={isBn ? 'কখন এবং কার কাছে বার্তা যাবে তার সংক্ষিপ্ত বিবরণ' : 'Brief summary of this workflow'}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Step 2: Select Trigger */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>২.</span> {isBn ? 'ট্রিগার নির্বাচন করুন (কখন সক্রিয় হবে?)' : 'Select Trigger Event'}
            </h4>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as AutomationTriggerType)}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {triggers.map((trig) => (
                <option key={trig.type} value={trig.type}>
                  [{trig.category.toUpperCase()}] {isBn ? trig.labelBn : trig.labelEn}
                </option>
              ))}
            </select>
            {selectedTrigger && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isBn ? selectedTrigger.descriptionBn : selectedTrigger.descriptionEn}</span>
              </p>
            )}
          </div>

          {/* Step 3: Conditions */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>৩.</span> {isBn ? 'শর্ত নির্ধারণ (Conditions)' : 'Filtering Conditions'}
              </h4>
              <button
                type="button"
                onClick={handleAddCondition}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {isBn ? 'শর্ত যোগ করুন' : 'Add Condition'}
              </button>
            </div>

            {conditions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                {isBn ? 'কোনো শর্ত নেই (ট্রিগার হলেই সরাসরি কার্যকর হবে)' : 'No conditions set (runs directly upon trigger)'}
              </p>
            ) : (
              <div className="space-y-2">
                {conditions.map((cond, idx) => (
                  <div
                    key={cond.id}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <select
                      value={cond.field}
                      onChange={(e) => {
                        const val = e.target.value as ConditionField;
                        setConditions(conditions.map((c, i) => (i === idx ? { ...c, field: val } : c)));
                      }}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="attendance_status">{isBn ? 'হাজিরা স্ট্যাটাস' : 'Attendance Status'}</option>
                      <option value="guardian_mobile">{isBn ? 'অভিভাবক মোবাইল' : 'Guardian Mobile'}</option>
                      <option value="department">{isBn ? 'বিভাগ (Department)' : 'Department'}</option>
                      <option value="amount">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</option>
                      <option value="payment_status">{isBn ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}</option>
                      <option value="result_status">{isBn ? 'ফলাফল স্ট্যাটাস' : 'Result Status'}</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const op = e.target.value as ConditionOperator;
                        setConditions(conditions.map((c, i) => (i === idx ? { ...c, operator: op } : c)));
                      }}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="equals">=</option>
                      <option value="not_equals">≠</option>
                      <option value="greater_than">&gt;</option>
                      <option value="less_than">&lt;</option>
                      <option value="contains">{isBn ? 'ধারণ করে' : 'contains'}</option>
                      <option value="exists">{isBn ? 'বিদ্যমান' : 'exists'}</option>
                    </select>

                    <input
                      type="text"
                      value={String(cond.value)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setConditions(conditions.map((c, i) => (i === idx ? { ...c, value: v } : c)));
                      }}
                      placeholder="Value..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Delay setting */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? '৪. কার্যকর হওয়ার বিলম্ব (Delay in Minutes)' : '4. Execution Delay (Minutes)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isBn
                    ? '০ মিনিট দিলে তাত্ক্ষণিক, অথবা শিক্ষক হাজিরা সংশোধন করার সময় পেতে ১০-১৫ মিনিট বিলম্ব দিতে পারেন।'
                    : '0 for instant dispatch, or 10-15 mins grace period.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="1440"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 px-2.5 py-1.5 text-center text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-xs text-slate-500">{isBn ? 'মিনিট' : 'mins'}</span>
            </div>
          </div>

          {/* Step 5: Actions */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                <span>৫.</span> {isBn ? 'অটোমেশন অ্যাকশন (কী করা হবে?)' : 'Automated Actions'}
              </h4>
              <button
                type="button"
                onClick={handleAddAction}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {isBn ? 'অ্যাকশন যোগ করুন' : 'Add Action'}
              </button>
            </div>

            <div className="space-y-2">
              {actions.map((act, idx) => (
                <div
                  key={act.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-400 block mb-0.5">{isBn ? 'অ্যাকশনের ধরন' : 'Action Type'}</label>
                    <select
                      value={act.type}
                      onChange={(e) => {
                        const val = e.target.value as AutomationActionType;
                        setActions(
                          actions.map((a, i) =>
                            i === idx
                              ? {
                                  ...a,
                                  type: val,
                                  channel: val === 'send_sms' ? 'sms' : val === 'send_push' ? 'push' : 'app'
                                }
                              : a
                          )
                        );
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="send_sms">{isBn ? 'এসএমএস পাঠান (SMS)' : 'Send SMS'}</option>
                      <option value="send_push">{isBn ? 'পুশ নোটিফিকেশন (Push)' : 'Send Push Notification'}</option>
                      <option value="send_app_message">{isBn ? 'ইন-অ্যাপ বার্তা (In-App)' : 'Send In-App Message'}</option>
                      <option value="create_admin_alert">{isBn ? 'অ্যাডমিন অ্যালার্ট (Admin Alert)' : 'Create Admin Alert'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-400 block mb-0.5">{isBn ? 'মেসেজ টেমপ্লেট' : 'Message Template'}</label>
                    <select
                      value={act.templateId}
                      onChange={(e) => {
                        const tId = e.target.value;
                        setActions(actions.map((a, i) => (i === idx ? { ...a, templateId: tId } : a)));
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {templates.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {isBn ? tmpl.nameBn : tmpl.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-0.5">{isBn ? 'প্রাপক রোল' : 'Recipient Role'}</label>
                    <select
                      value={act.targetRole || 'guardian'}
                      onChange={(e) => {
                        const r = e.target.value as any;
                        setActions(actions.map((a, i) => (i === idx ? { ...a, targetRole: r } : a)));
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="guardian">{isBn ? 'অভিভাবক (Guardian)' : 'Guardian'}</option>
                      <option value="student">{isBn ? 'শিক্ষার্থী (Student)' : 'Student'}</option>
                      <option value="teacher">{isBn ? 'শিক্ষক (Teacher)' : 'Teacher'}</option>
                      <option value="admin">{isBn ? 'মুহতামিম / অ্যাডমিন' : 'Admin'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(act.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editAutomation
                ? isBn
                  ? 'পরিবর্তন সংরক্ষণ করুন'
                  : 'Save Changes'
                : isBn
                ? 'অটোমেশন সক্রিয় করুন'
                : 'Activate Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

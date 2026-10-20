import React from 'react';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { Check, Shield, Building2 } from 'lucide-react';
import { DEMO_USERS, INSTITUTIONS_DATA, ROLES_DATA } from '../../data/initialData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { user, institution, switchRole, switchInstitution } = useAuth();
  const { language } = useLanguage();

  return (
    <Modal
      id="role-switcher-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'bn' ? 'ইউজার রোল ও পারমিশন টেস্ট ড্রাইভ' : 'Role-Based Access (RBAC) Switcher'}
      description={
        language === 'bn'
          ? 'MadSol-এর ৭টি ভিন্ন ভিন্ন রোলের অ্যাক্সেস ও ভিউ পরীক্ষা করতে যেকোনো প্রোফাইলে ক্লিক করুন।'
          : 'Click any of the 7 roles below to test how menus and data dynamically change based on authorization.'
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Multi-Institution Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'বর্তমান মাদ্রাসা প্রতিষ্ঠান (Multi-Tenancy)' : 'Active Institution (Multi-Tenancy)'}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INSTITUTIONS_DATA.map((inst) => {
              const isSelected = institution?.id === inst.id;
              return (
                <div
                  key={inst.id}
                  onClick={() => switchInstitution(inst.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? inst.nameBn : inst.nameEn}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'bn' ? inst.addressBn : inst.addressEn}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      EIIN: {inst.eiinNumber} • {inst.studentCount} {language === 'bn' ? 'শিক্ষার্থী' : 'Students'}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 Roles List */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'অনুমোদিত ভূমিকা / ইউজার রোল তালিকা' : 'Predefined User Roles'}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_USERS.map((demoUser) => {
              const roleMeta = ROLES_DATA[demoUser.role];
              const isCurrent = user?.role === demoUser.role;

              return (
                <div
                  key={demoUser.id}
                  id={`role-card-${demoUser.role}`}
                  onClick={() => {
                    const mappedRole = (demoUser.role === 'madrasa_admin' ? 'institution_admin' : demoUser.role) as any;
                    switchRole(mappedRole);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left flex items-start justify-between gap-2.5 group ${
                    isCurrent
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {language === 'bn' ? demoUser.fullNameBn : demoUser.fullNameEn}
                      </span>
                    </div>
                    <Badge variant={isCurrent ? 'emerald' : 'slate'} size="sm">
                      {language === 'bn' ? roleMeta.nameBn : roleMeta.nameEn}
                    </Badge>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-tight">
                      {language === 'bn' ? roleMeta.descriptionBn : roleMeta.descriptionEn}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

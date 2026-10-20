import React, { useState } from 'react';
import { BookOpen, GraduationCap, Heart, UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { QawmiClassesTab, QawmiBranch, QawmiStudentItem } from './components/QawmiClassesTab';
import { AddQawmiStudentModal } from './components/AddQawmiStudentModal';

interface QawmiManagementViewProps {
  onNavigate?: (path: string) => void;
}

export const QawmiManagementView: React.FC<QawmiManagementViewProps> = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // Branch Selection: 'boys' (কওমী ছাত্র শাখা) vs 'mohila' (কওমী মহিলা শাখা)
  const [selectedBranch, setSelectedBranch] = useState<QawmiBranch>(() => {
    try {
      const saved = localStorage.getItem('madsol_qawmi_active_branch');
      return (saved as QawmiBranch) || 'boys';
    } catch {
      return 'boys';
    }
  });

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const handleBranchChange = (branch: QawmiBranch) => {
    setSelectedBranch(branch);
    try {
      localStorage.setItem('madsol_qawmi_active_branch', branch);
    } catch {
      // ignore
    }
  };

  const handleStudentAdded = (newStudent: QawmiStudentItem, classId: string, branch: QawmiBranch) => {
    // Optionally trigger any app-wide update
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
      {/* Header with Title, Branch Switcher & Admission Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className={`w-6 h-6 ${selectedBranch === 'mohila' ? 'text-rose-400' : 'text-emerald-500'}`} />
            <span>
              {selectedBranch === 'mohila'
                ? (isBn ? 'কওমী মহিলা নেসাব ও জামাত ব্যবস্থাপনা' : 'Qawmi Female Wing & Nesab')
                : (isBn ? 'কওমী নেসাব ও জামাত ব্যবস্থাপনা' : 'Qawmi Branch & Nesab Hub')}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                selectedBranch === 'mohila'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {selectedBranch === 'mohila' ? 'মহিলা শাখা (বানাত)' : 'ছাত্র শাখা'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {selectedBranch === 'mohila'
              ? (isBn
                  ? '১০টি কওমী মহিলা ক্লাসের তালিকা, কিতাব নেসাব, তালিবাত ও পূর্ণাঙ্গ সিলেবাস ভাণ্ডার'
                  : '10 Qawmi female classes list, textbook syllabus, and academic curriculum')
              : (isBn
                  ? '১০টি কওমী ক্লাসের তালিকা, কিতাব নেসাব ও পূর্ণাঙ্গ সিলেবাস ভাণ্ডার'
                  : '10 Qawmi classes list, textbook syllabus, and academic curriculum')}
          </p>
        </div>

        {/* Right Section: Branch Switcher Toggle Pill + Admission Button (ছাত্র/ছাত্রী ভর্তি) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Branch Switcher Toggle Pill */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleBranchChange('boys')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                selectedBranch === 'boys'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>কওমী (ছাত্র শাখা)</span>
            </button>

            <button
              type="button"
              onClick={() => handleBranchChange('mohila')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                selectedBranch === 'mohila'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>মহিলা শাখা (ছাত্রী)</span>
            </button>
          </div>

          {/* Admission Button (লাল চিহ্নিত স্থানে ছাত্র/ছাত্রী ভর্তি করা বোতাম) */}
          <button
            type="button"
            onClick={() => setIsAddStudentModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              selectedBranch === 'mohila'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/60'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{selectedBranch === 'mohila' ? 'নতুন ছাত্রী ভর্তি' : 'নতুন ছাত্র ভর্তি'}</span>
          </button>
        </div>
      </div>

      {/* Render Qawmi Classes & Syllabus Tab with current branch */}
      <QawmiClassesTab branch={selectedBranch} onBranchChange={handleBranchChange} />

      {/* Full Qawmi Student Admission Modal */}
      <AddQawmiStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        currentBranch={selectedBranch}
        onStudentAdded={handleStudentAdded}
      />
    </div>
  );
};

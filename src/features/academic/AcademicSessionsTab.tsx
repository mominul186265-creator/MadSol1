import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Archive,
  Edit2,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import { DbAcademicSession, AcademicSessionStatus } from '../../types/step5';

interface AcademicSessionsTabProps {
  sessions: DbAcademicSession[];
  onSetActive: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (session: DbAcademicSession) => void;
  onOpenCreate: () => void;
}

export const AcademicSessionsTab: React.FC<AcademicSessionsTabProps> = ({
  sessions,
  onSetActive,
  onArchive,
  onEdit,
  onOpenCreate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (session: DbAcademicSession) => {
    if (session.is_active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          সক্রিয় শিক্ষাবর্ষ (Active)
        </span>
      );
    }
    switch (session.status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            আসন্ন (Upcoming)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            সম্পন্ন (Completed)
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Archive className="w-3.5 h-3.5" />
            আর্কাইভকৃত (Archived)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative min-w-0 w-full sm:w-[240px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শিক্ষাবর্ষ খুঁজুন (যেমন: ২০২৬)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="upcoming">আসন্ন (Upcoming)</option>
            <option value="completed">সম্পন্ন (Completed)</option>
            <option value="archived">আর্কাইভ (Archived)</option>
          </select>
        </div>

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন শিক্ষাবর্ষ যুক্ত করুন</span>
        </button>
      </div>

      {/* Info Notice about Single Active Session */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>সতর্কতা ও নীতিমালা:</strong> একটি প্রতিষ্ঠানে একই সময়ে শুধুমাত্র <strong>একটিমাত্র সক্রিয় শিক্ষাবর্ষ</strong> কার্যকর থাকবে। আপনি যেকোনো সেশনকে &quot;সক্রিয় করুন&quot; বাটনে ক্লিক করলে পূর্বের সক্রিয় সেশনটি স্বয়ংক্রিয়ভাবে সম্পন্ন (completed) হিসেবে সংরক্ষিত হবে।
        </div>
      </div>

      {/* Sessions Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              session.is_active
                ? 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      session.is_active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {session.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">ID: {session.id}</p>
                  </div>
                </div>
                {getStatusBadge(session)}
              </div>

              <div className="mt-4 space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>শুরুর তারিখ:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {session.start_date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>সমাপ্তির তারিখ:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {session.end_date}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(session)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>সম্পাদনা</span>
                </button>

                {!session.is_active && session.status !== 'archived' && (
                  <button
                    onClick={() => onArchive(session.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold transition-colors"
                    title="আর্কাইভ করুন"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>আর্কাইভ</span>
                  </button>
                )}
              </div>

              {!session.is_active && session.status !== 'archived' && (
                <button
                  onClick={() => onSetActive(session.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>সক্রিয় করুন</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              কোনো শিক্ষাবর্ষ পাওয়া যায়নি
            </p>
            <p className="text-xs text-slate-500 mt-1">
              অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন শিক্ষাবর্ষ যুক্ত করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

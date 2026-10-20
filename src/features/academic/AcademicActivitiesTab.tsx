import React from 'react';
import { Activity, Clock, User, ShieldCheck } from 'lucide-react';
import { DbAcademicActivity } from '../../types/step5';

interface AcademicActivitiesTabProps {
  activities: DbAcademicActivity[];
}

export const AcademicActivitiesTab: React.FC<AcademicActivitiesTabProps> = ({
  activities,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden max-w-4xl">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            একাডেমিক কার্যক্রম ও অডিট ট্রেইল (Academic Activity Audit Log)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">সর্বশেষ {activities.length}টি কার্যক্রম</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs"
          >
            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                  {act.action}
                </span>
                <span>{act.description}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.created_at).toLocaleString('bn-BD', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                {act.user_id && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    ব্যবহারকারী: {act.user_id}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-[11px] font-semibold text-slate-500 uppercase">
              {act.entity_type}
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            এখনও কোনো একাডেমিক অডিট লগ তৈরি হয়নি।
          </div>
        )}
      </div>
    </div>
  );
};

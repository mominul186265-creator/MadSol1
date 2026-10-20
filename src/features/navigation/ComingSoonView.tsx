import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { SIDEBAR_NAV_ITEMS } from '../../data/initialData';
import { Bell, Sparkles, Database, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComingSoonViewProps {
  currentPath: string;
  onOpenDbViewer?: () => void;
  onNavigate?: (path: string) => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  currentPath,
  onOpenDbViewer,
  onNavigate,
}) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const activeItem = SIDEBAR_NAV_ITEMS.find((item) => item.path === currentPath);
  const title = activeItem
    ? language === 'bn'
      ? activeItem.labelBn
      : activeItem.labelEn
    : language === 'bn'
    ? 'নতুন মডিউল'
    : 'Module';

  const description = activeItem
    ? language === 'bn'
      ? activeItem.descriptionBn
      : activeItem.descriptionEn
    : '';

  const handleNotify = () => {
    setIsSubscribed(true);
    showToast(
      language === 'bn'
        ? `${title} মডিউলের আপডেটের জন্য আপনাকে নোটিফিকেশন তালিকায় যুক্ত করা হয়েছে।`
        : `You will be alerted when ${title} module launches in the next phase.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header Breadcrumb Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {language === 'bn' ? 'মডিউল নেভিগেশন' : 'Module Navigation'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {title}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span>{title}</span>
            <Badge variant="gold" size="sm">
              {language === 'bn' ? 'পরবর্তী ফেজে আসছে' : 'Phase 2 Planned'}
            </Badge>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Database className="w-4 h-4 text-amber-500" />}
            onClick={onOpenDbViewer}
          >
            {language === 'bn' ? 'স্কিমা স্ট্রাকচার' : 'View DB Schema'}
          </Button>
        </div>
      </div>

      {/* Main Premium Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center">
        <IslamicPattern opacity={0.04} />

        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-slate-800 border border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-5 shadow-inner">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse text-amber-500" />
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t.emptyState.comingSoonTitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
            {description || t.emptyState.comingSoonDesc}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              id="coming-soon-notify-btn"
              variant={isSubscribed ? 'outline' : 'primary'}
              size="md"
              leftIcon={isSubscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Bell className="w-4 h-4" />}
              onClick={handleNotify}
              disabled={isSubscribed}
            >
              {isSubscribed ? t.buttons.subscribed : t.buttons.notifyMe}
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => onNavigate && onNavigate('/dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Readiness Specs Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="space-y-1.5 p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
              {language === 'bn' ? 'ডাটাবেজ আর্কিটেকচার' : 'Database Model'}
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'সম্পূর্ণ প্রস্তুত' : '100% Schema Ready'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? 'টেবিল, কলাম ও মাল্টি-টেন্যান্ট আইসোলেশন সংজ্ঞায়িত করা রয়েছে।'
                : 'Relational table structure and foreign keys fully drafted.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1.5 p-4">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              {language === 'bn' ? 'রোলের অনুমতি' : 'RBAC Permission'}
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'কনফিগার করা হয়েছে' : 'Role Scoped'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? 'শুধুমাত্র অনুমোদিত রোলসমূহ এই মেনুটি অ্যাক্সেস করতে পারবে।'
                : 'Configured strictly according to the 7-role access matrix.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1.5 p-4">
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
              {language === 'bn' ? 'পরবর্তী রিলিজ' : 'Next Phase Release'}
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'ফেজ ২ আপডেট' : 'Phase 2 Rollout'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn'
                ? 'শিক্ষার্থী ভর্তি, হাজিরা ও ফি কালেকশন সরাসরি কার্যকর হবে।'
                : 'Active CRUD interfaces and live forms will be integrated.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

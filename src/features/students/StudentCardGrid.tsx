import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DbStudent,
  DbDepartment,
  DbClass,
  DbSection,
  StudentStatus,
} from '../../types/step2';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Eye,
  Edit,
  Printer,
  Trash2,
  Phone,
  Calendar,
  BookOpen,
  User,
} from 'lucide-react';

interface StudentCardGridProps {
  students: DbStudent[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  onView: (student: DbStudent) => void;
  onEdit: (student: DbStudent) => void;
  onDelete: (student: DbStudent) => void;
  onPrintId: (student: DbStudent) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const StudentCardGrid: React.FC<StudentCardGridProps> = ({
  students,
  departments,
  classes,
  sections,
  onView,
  onEdit,
  onDelete,
  onPrintId,
  canEdit,
  canDelete,
}) => {
  const { language } = useLanguage();

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="emerald">{language === 'bn' ? 'নিয়মিত' : 'Active'}</Badge>;
      case 'pending':
        return <Badge variant="amber">{language === 'bn' ? 'অপেক্ষমান' : 'Pending'}</Badge>;
      case 'on_leave':
        return <Badge variant="sky">{language === 'bn' ? 'ছুটিতে' : 'On Leave'}</Badge>;
      case 'inactive':
        return <Badge variant="neutral">{language === 'bn' ? 'অনিয়মিত' : 'Inactive'}</Badge>;
      case 'transferred':
        return <Badge variant="indigo">{language === 'bn' ? 'ছাড়পত্রপ্রাপ্ত' : 'Transferred'}</Badge>;
      case 'graduated':
        return <Badge variant="gold">{language === 'bn' ? 'উত্তীর্ণ' : 'Graduated'}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-xs">
        <User className="w-8 h-8 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No Students Found'}
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((student) => {
        const department = departments.find((d) => d.id === student.department_id);
        const studentClass = classes.find((c) => c.id === student.class_id);
        const section = sections.find((s) => s.id === student.section_id);

        const deptName = language === 'bn' ? department?.name_bn : department?.name_en;
        const classNameText = language === 'bn' ? studentClass?.name_bn : studentClass?.name_en;
        const sectionName = language === 'bn' ? section?.name_bn : section?.name_en;

        return (
          <div
            key={student.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with Photo & Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.full_name_bn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                        {student.full_name_bn.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4
                      onClick={() => onView(student)}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors cursor-pointer text-sm leading-snug"
                    >
                      {student.full_name_bn}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[140px]">
                      {student.full_name_en}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(student.status)}</div>
              </div>

              {/* ID & Roll Pills */}
              <div className="flex items-center gap-2 mt-3.5">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                  {student.student_id}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold">
                  রোল: {student.roll_number}
                </span>
              </div>

              {/* Academic & Contact Info */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 text-[11px]">শ্রেণি:</span>
                  <span className="font-semibold truncate max-w-[160px]">
                    {classNameText} {sectionName ? `(${sectionName})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 text-[11px]">বিভাগ:</span>
                  <span className="truncate max-w-[160px]">{deptName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 text-[11px]">যোগাযোগ:</span>
                  <span className="font-mono text-emerald-600 font-medium truncate max-w-[160px]">
                    {student.emergency_mobile || student.mobile || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(student)}
                className="text-xs h-7 gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
              </Button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPrintId(student)}
                  title="আইডি কার্ড"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(student)}
                    title="সম্পাদনা"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(student)}
                    title="মুছে ফেলুন"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

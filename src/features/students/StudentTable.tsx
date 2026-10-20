import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
  User,
  CheckCircle2,
} from 'lucide-react';

interface StudentTableProps {
  students: DbStudent[];
  departments: DbDepartment[];
  classes: DbClass[];
  sections: DbSection[];
  onView: (student: DbStudent) => void;
  onEdit: (student: DbStudent) => void;
  onDelete: (student: DbStudent) => void;
  onPrintId: (student: DbStudent) => void;
  onChangeStatus: (studentId: string, status: StudentStatus) => Promise<boolean>;
  canEdit: boolean;
  canDelete: boolean;
  canStatus: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students = [],
  departments = [],
  classes = [],
  sections = [],
  onView,
  onEdit,
  onDelete,
  onPrintId,
  onChangeStatus,
  canEdit,
  canDelete,
  canStatus,
}) => {
  const { language } = useLanguage();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Close menus on outside click
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No Students Found'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {language === 'bn'
            ? 'আপনার ফিল্টারিংয়ের সাথে কোনো তথ্য মেলেনি অথবা এখনো কোনো শিক্ষার্থী ভর্তি করা হয়নি।'
            : 'No student matches the search or filter criteria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto w-full min-w-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">{language === 'bn' ? 'ছবি ও নাম' : 'Student & Photo'}</th>
              <th className="py-3.5 px-4">{language === 'bn' ? 'শিক্ষার্থী আইডি' : 'Student ID'}</th>
              <th className="py-3.5 px-4">{language === 'bn' ? 'রোল' : 'Roll'}</th>
              <th className="py-3.5 px-4">{language === 'bn' ? 'বিভাগ ও জামাত' : 'Dept & Class'}</th>
              <th className="py-3.5 px-4">{language === 'bn' ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}</th>
              <th className="py-3.5 px-4">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
              <th className="py-3.5 px-4 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {paginatedStudents.map((student) => {
              const department = departments.find((d) => d.id === student.department_id);
              const studentClass = classes.find((c) => c.id === student.class_id);
              const section = sections.find((s) => s.id === student.section_id);

              const deptName = language === 'bn' ? department?.name_bn : department?.name_en;
              const classNameText = language === 'bn' ? studentClass?.name_bn : studentClass?.name_en;
              const sectionName = language === 'bn' ? section?.name_bn : section?.name_en;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Photo & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt={student.full_name_bn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {student.full_name_bn.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => onView(student)}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors block"
                        >
                          {student.full_name_bn}
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {student.full_name_en}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {student.student_id}
                  </td>

                  {/* Class Roll */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {student.roll_number}
                  </td>

                  {/* Dept & Class */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {classNameText || 'জামাত'}
                        {sectionName ? ` (${sectionName})` : ''}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                        {deptName || 'বিভাগ'} • {student.academic_session}
                      </span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block truncate max-w-[150px]">
                        {student.emergency_contact_name} ({student.emergency_relationship})
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.emergency_mobile || student.mobile || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(student.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(student)}
                        title={language === 'bn' ? 'প্রোফাইল দেখুন' : 'View Profile'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onPrintId(student)}
                        title={language === 'bn' ? 'আইডি কার্ড' : 'ID Card'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onEdit(student)}
                          title={language === 'bn' ? 'তথ্য সম্পাদনা' : 'Edit'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => onDelete(student)}
                          title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          {language === 'bn'
            ? `সর্বমোট ${students.length} জন শিক্ষার্থীর মধ্যে ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                currentPage * pageSize,
                students.length
              )} প্রদর্শন করা হচ্ছে`
            : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
                currentPage * pageSize,
                students.length
              )} of ${students.length} students`}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value={10}>১০ জন / পৃষ্ঠা</option>
            <option value={25}>২৫ জন / পৃষ্ঠা</option>
            <option value={50}>৫০ জন / পৃষ্ঠা</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-slate-800 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

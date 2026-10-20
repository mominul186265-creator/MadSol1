import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { DATABASE_TABLES_SCHEMA } from '../../data/databaseSchema';
import { useLanguage } from '../../context/LanguageContext';
import { Database, ShieldCheck, Key, Link as LinkIcon, Layers } from 'lucide-react';

interface DatabaseSchemaViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaViewer: React.FC<DatabaseSchemaViewerProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'academic' | 'finance' | 'automation'>('all');
  const [selectedTableName, setSelectedTableName] = useState<string>('institutions');

  const filteredTables = DATABASE_TABLES_SCHEMA.filter((table) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'core') return table.status === 'active';
    return table.category === activeCategory;
  });

  const selectedTable =
    DATABASE_TABLES_SCHEMA.find((t) => t.name === selectedTableName) || DATABASE_TABLES_SCHEMA[0];

  return (
    <Modal
      id="db-schema-viewer-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t.dbViewer.title}
      description={t.dbViewer.subtitle}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Multi-Tenancy Architecture Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-300/40 dark:border-emerald-800/40">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.dbViewer.tenantIsolationTitle}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.dbViewer.tenantIsolationDesc}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'bn' ? 'সকল টেবিল (১৫)' : 'All Tables (15)'}
          </button>
          <button
            onClick={() => setActiveCategory('core')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'core'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {language === 'bn' ? 'কোর টেবিল (ফেজ ১)' : 'Core Tables (Phase 1)'}
          </button>
          <button
            onClick={() => setActiveCategory('academic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'academic'
                ? 'bg-sky-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'bn' ? 'একাডেমিক ও হিফজ' : 'Academic & Hifz'}
          </button>
          <button
            onClick={() => setActiveCategory('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'finance'
                ? 'bg-amber-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'bn' ? 'ফি ও হিসাব' : 'Finance & Fees'}
          </button>
          <button
            onClick={() => setActiveCategory('automation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'automation'
                ? 'bg-purple-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'bn' ? 'অটোমেশন ও ভয়েস' : 'Automation'}
          </button>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Table list selector */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {filteredTables.map((table) => {
              const isSelected = selectedTableName === table.name;
              return (
                <div
                  key={table.name}
                  onClick={() => setSelectedTableName(table.name)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold truncate">{table.name}</span>
                    <Badge variant={table.status === 'active' ? 'emerald' : 'gold'} size="sm">
                      {table.status === 'active'
                        ? language === 'bn'
                          ? 'সক্রিয়'
                          : 'Active'
                        : language === 'bn'
                        ? 'প্রস্তুত'
                        : 'Ready'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                    {language === 'bn' ? table.descriptionBn : table.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Table Columns View */}
          <div className="md:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedTable.name}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn' ? selectedTable.descriptionBn : selectedTable.descriptionEn}
                  </p>
                </div>
                <Badge variant={selectedTable.status === 'active' ? 'emerald' : 'gold'}>
                  {selectedTable.columns.length} {language === 'bn' ? 'কলাম' : 'Columns'}
                </Badge>
              </div>

              {/* Columns Table */}
              <div className="mt-3 overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="py-2 px-2">{t.dbViewer.columnHeader}</th>
                      <th className="py-2 px-2">{t.dbViewer.typeHeader}</th>
                      <th className="py-2 px-2">{t.dbViewer.constraintHeader}</th>
                      <th className="py-2 px-2">{t.dbViewer.descHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-white/80 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-2 font-mono font-medium text-slate-900 dark:text-slate-100">
                          {col.name}
                        </td>
                        <td className="py-2 px-2 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {col.type}
                        </td>
                        <td className="py-2 px-2">
                          {col.isPrimary && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              <Key className="w-2.5 h-2.5" /> PK
                            </span>
                          )}
                          {col.isForeign && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                              <LinkIcon className="w-2.5 h-2.5" /> FK → {col.foreignTable}
                            </span>
                          )}
                          {!col.isPrimary && !col.isForeign && col.isNullable && (
                            <span className="text-[10px] text-slate-400">NULL</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                          {language === 'bn' ? col.descriptionBn : col.descriptionEn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>SQL PostgreSQL / Cloud SQL DDL & Drizzle ORM Compatible</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">UUID v4 Indexed</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

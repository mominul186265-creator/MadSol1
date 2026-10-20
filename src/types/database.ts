export interface DbColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  isNullable?: boolean;
  descriptionBn: string;
  descriptionEn: string;
}

export interface DbTableSchema {
  name: string;
  category: 'core' | 'academic' | 'finance' | 'communication' | 'automation';
  descriptionBn: string;
  descriptionEn: string;
  status: 'active' | 'prepared';
  columns: DbColumn[];
}

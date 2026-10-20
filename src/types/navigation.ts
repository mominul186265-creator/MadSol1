import { UserRole } from './auth';

export interface NavItem {
  id: string;
  labelBn: string;
  labelEn: string;
  iconName: string;
  path: string;
  allowedRoles: UserRole[];
  badge?: string;
  isImplemented?: boolean;
  category?: 'main' | 'academic' | 'finance' | 'admin' | 'communication' | 'automation';
  descriptionBn?: string;
  descriptionEn?: string;
}

export interface BottomNavItem {
  id: string;
  labelBn: string;
  labelEn: string;
  iconName: string;
  path: string;
  allowedRoles?: UserRole[];
}

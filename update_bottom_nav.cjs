const fs = require('fs');
const file = 'src/data/initialData.ts';
let code = fs.readFileSync(file, 'utf8');

const newNav = `export const MOBILE_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { id: 'dashboard', labelBn: 'হোম', labelEn: 'Home', iconName: 'Home', path: '/dashboard' },
  { id: 'hifz', labelBn: 'হিফজ', labelEn: 'Hifz', iconName: 'BookMarked', path: '/hifz' },
  { id: 'academic', labelBn: 'একাডেমিক', labelEn: 'Academic', iconName: 'BookOpen', path: '/academic' },
  { id: 'qawmi', labelBn: 'ক্বওমী', labelEn: 'Qawmi', iconName: 'Book', path: '/qawmi' },
  { id: 'automation', labelBn: 'অটোমেশন', labelEn: 'Automation', iconName: 'Bot', path: '/automation', allowedRoles: ['super_admin', 'madrasa_admin', 'principal'] },
];`;

code = code.replace(/export const MOBILE_BOTTOM_NAV_ITEMS: BottomNavItem\[\] = \[[\s\S]*?\];/, newNav);

fs.writeFileSync(file, code);

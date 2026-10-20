import { bn } from './bn';
import { en } from './en';
import { Language } from '../types';

export const translations = {
  bn,
  en,
};

export type TranslationKey = typeof bn;

// Helper to get nested translation or fallback
export function getTranslation(lang: Language): TranslationKey {
  return translations[lang] || translations.bn;
}

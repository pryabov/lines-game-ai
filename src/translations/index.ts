import { en } from './en';
import { ru } from './ru';
import { es } from './es';
import { de } from './de';
import { pl } from './pl';
import { zh } from './zh';
import { ja } from './ja';

export type Language = 'en' | 'ru' | 'es' | 'de' | 'pl' | 'zh' | 'ja';
export type Translation = typeof en;

export const translations: Record<Language, Translation> = {
  en,
  ru,
  es,
  de,
  pl,
  zh,
  ja
};

// Language names for the dropdown
export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  de: 'Deutsch',
  pl: 'Polski',
  zh: '中文',
  ja: '日本語'
};

// Map languages to country ISO codes for flags
export const languageCountryCodes: Record<Language, string> = {
  en: 'gb', // United Kingdom
  ru: 'ru', // Russia
  es: 'es', // Spain
  de: 'de', // Germany
  pl: 'pl', // Poland
  zh: 'cn', // China
  ja: 'jp'  // Japan
};

// Get browser language or default to 'en'
export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ru') return 'ru';
  if (browserLang === 'es') return 'es';
  if (browserLang === 'de') return 'de';
  if (browserLang === 'pl') return 'pl';
  if (browserLang === 'zh') return 'zh';
  if (browserLang === 'ja') return 'ja';
  return 'en';
};

// Local storage key for language
export const LANGUAGE_STORAGE_KEY = 'lines-game-language';

// Get language from localStorage or browser settings
export const getInitialLanguage = (): Language => {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
  return savedLanguage || getBrowserLanguage();
}; 
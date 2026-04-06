import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations } from '../translations';
import { storageService } from '../services/storageService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translation;
}

const SUPPORTED_LANGUAGES: Language[] = ['en', 'ru', 'es', 'de', 'pl', 'zh', 'ja'];

const getLanguageFromUrl = (): Language | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
      return lang as Language;
    }
  } catch {
    // Ignore URL parsing errors
  }
  return null;
};

const updateUrlLanguage = (lang: Language) => {
  try {
    const url = new URL(window.location.href);
    if (lang === 'en') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore URL update errors
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en'); // Start with default
  const [currentTranslations, setCurrentTranslations] = useState<Translation>(translations['en']);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    // Priority: URL param → localStorage → browser language → 'en'
    const urlLanguage = getLanguageFromUrl();
    const initialLanguage = urlLanguage || storageService.getInitialLanguage();
    setLanguage(initialLanguage);
    setCurrentTranslations(translations[initialLanguage]);
    document.documentElement.lang = initialLanguage;

    // If language came from URL, save it to storage
    if (urlLanguage) {
      storageService.setSetting('language', urlLanguage);
    }

    setIsInitialized(true);
  }, []);

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    if (isInitialized) {
      storageService.setSetting('language', lang);
      updateUrlLanguage(lang);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      setCurrentTranslations(translations[language]);
      document.documentElement.lang = language;
    }
  }, [language, isInitialized]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: updateLanguage, translations: currentTranslations }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

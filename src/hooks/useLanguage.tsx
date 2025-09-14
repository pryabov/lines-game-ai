import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations } from '../translations';
import { storageService } from '../services/storageService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(storageService.getInitialLanguage());
  const [currentTranslations, setCurrentTranslations] = useState<Translation>(translations[language]);

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    storageService.setSetting('language', lang);
  };

  useEffect(() => {
    setCurrentTranslations(translations[language]);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, translations: currentTranslations }}>
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

import React, { createContext, useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'ar';
type Translations = Record<string, string>;

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

declare global {
    interface Window {
        translations: Record<Language, Translations>;
    }
}
window.translations = { en: {}, ar: {} };

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'en';
  });
  
  const [translations, setTranslations] = useState<Record<Language, Translations> | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
        try {
            const [enResponse, arResponse] = await Promise.all([
                fetch('translations/en.json'),
                fetch('translations/ar.json')
            ]);
            if (!enResponse.ok || !arResponse.ok) {
                throw new Error(`Failed to load translation files: ${enResponse.statusText}, ${arResponse.statusText}`);
            }
            const en = await enResponse.json();
            const ar = await arResponse.json();
            const loadedTranslations = { en, ar };
            setTranslations(loadedTranslations);
            window.translations = loadedTranslations;
        } catch (error) {
            console.error("Could not load translations:", error);
            setTranslations({ en: {}, ar: {} }); // fallback
        }
    };
    fetchTranslations();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (!translations) {
        return key; 
    }
    let translation = translations[language][key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [language, translations]);


  const value = { language, setLanguage, t };

  if (!translations) {
    // Render a global loading indicator while translations are being fetched
    return (
        <div className="flex justify-center items-center h-screen bg-primary dark:bg-dark-primary">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-highlight dark:border-dark-highlight"></div>
        </div>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

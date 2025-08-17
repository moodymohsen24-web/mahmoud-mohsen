
import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-text-primary dark:text-dark-text-primary font-medium px-3 py-2 rounded-md hover:bg-accent dark:hover:bg-dark-accent transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 018 8c0 2.895-1.54 5.43-3.823 6.83l-.004.002-.002.001a7.978 7.978 0 01-8.356 0l-.002-.001-.004-.002A8.001 8.001 0 012 10a8 8 0 018-8zm0 14a6 6 0 100-12 6 6 0 000 12z" />
          <path d="M10 4a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 4zM8.5 7.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3zM7.5 11.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
        </svg>
        <span>{language === 'ar' ? 'العربية' : 'English'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 end-0 bg-secondary dark:bg-dark-secondary rounded-md shadow-lg py-1 w-32 z-20">
          {language === 'en' ? (
            <button
              onClick={() => toggleLanguage('ar')}
              className="block w-full text-start px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-accent dark:hover:bg-dark-accent"
            >
              العربية
            </button>
          ) : (
            <button
              onClick={() => toggleLanguage('en')}
              className="block w-full text-start px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-accent dark:hover:bg-dark-accent"
            >
              English
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ComputerDesktopIcon } from './icons/ComputerDesktopIcon';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const themes = [
    { name: 'light', label: t('theme.light'), icon: <SunIcon className="w-5 h-5" /> },
    { name: 'dark', label: t('theme.dark'), icon: <MoonIcon className="w-5 h-5" /> },
    { name: 'system', label: t('theme.system'), icon: <ComputerDesktopIcon className="w-5 h-5" /> },
  ];

  const currentTheme = themes.find(t => t.name === theme);

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
        aria-label="Switch theme"
      >
        {currentTheme?.icon}
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 end-0 bg-secondary dark:bg-dark-secondary rounded-md shadow-lg py-1 w-36 z-20">
          {themes.map(({ name, label, icon }) => (
            <button
              key={name}
              onClick={() => { setTheme(name as 'light' | 'dark' | 'system'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 text-start px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-accent dark:hover:bg-dark-accent"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
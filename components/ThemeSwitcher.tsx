import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ComputerDesktopIcon } from './icons/ComputerDesktopIcon';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const themes = [
    { name: 'light', label: t('theme.light'), icon: <SunIcon className="w-5 h-5" /> },
    { name: 'dark', label: t('theme.dark'), icon: <MoonIcon className="w-5 h-5" /> },
    { name: 'system', label: t('theme.system'), icon: <ComputerDesktopIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-accent dark:bg-dark-accent p-1 rounded-full flex items-center gap-1" role="radiogroup" aria-label="Theme switcher">
      {themes.map(({ name, label, icon }) => (
        <button
          key={name}
          onClick={() => setTheme(name as 'light' | 'dark' | 'system')}
          className={`p-1.5 rounded-full transition-all duration-300 ease-in-out ${
            theme === name
              ? 'bg-secondary dark:bg-dark-secondary shadow-md text-highlight dark:text-dark-highlight'
              : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
          }`}
          aria-label={label}
          title={label}
          role="radio"
          aria-checked={theme === name}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;

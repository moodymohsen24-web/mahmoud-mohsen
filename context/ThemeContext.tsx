
import React, { createContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'system';
  });

  const prefersDarkMode = useMemo(() => 
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches, 
    []
  );

  const effectiveTheme = useMemo(() => {
    return theme === 'system' ? (prefersDarkMode ? 'dark' : 'light') : theme;
  }, [theme, prefersDarkMode]);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newEffectiveTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || (theme === 'system' && prefersDarkMode)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, prefersDarkMode]);
  
  const value = { theme, setTheme, effectiveTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'money-tracker-theme';

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  return isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
      if (current === 'system') setResolvedTheme(applyTheme('system'));
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  function setTheme(t: Theme) {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
    setResolvedTheme(applyTheme(t));
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Inline script injected into <head> so the correct theme class is set
 * on <html> BEFORE React hydrates / first paint — avoids a light-mode
 * flash for users who have dark mode saved.
 */
export const NO_FLASH_THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}') || 'system';
    var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

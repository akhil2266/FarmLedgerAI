import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../styles/theme';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'farmledger_theme_preference';

const getSystemPrefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [resolvedMode, setResolvedMode] = useState(
    preference === 'system' ? (getSystemPrefersDark() ? 'dark' : 'light') : preference
  );

  useEffect(() => {
    if (preference !== 'system') {
      setResolvedMode(preference);
      return undefined;
    }
    setResolvedMode(getSystemPrefersDark() ? 'dark' : 'light');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setResolvedMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [preference]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
    document.body.classList.toggle('dark', resolvedMode === 'dark');
  }, [preference, resolvedMode]);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const setThemePreference = useCallback((mode) => setPreference(mode), []);

  const muiTheme = useMemo(() => getAppTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({ preference, resolvedMode, toggleTheme, setThemePreference }),
    [preference, resolvedMode, toggleTheme, setThemePreference]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within a ThemeProvider');
  return ctx;
};

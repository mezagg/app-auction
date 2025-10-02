import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { Colors } from '@/constants/Colors';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  colors: typeof Colors.light;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
};

const storage = new MMKV();
const THEME_KEY = 'app_theme';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = rnUseColorScheme();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = storage.getString(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return systemScheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    storage.set(THEME_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const colors = useMemo(() => Colors[theme], [theme]);

  const value = useMemo(
    () => ({ theme, colors, setTheme, toggleTheme }),
    [theme, colors, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  return (
    ctx || {
      theme: rnUseColorScheme() === 'dark' ? 'dark' : 'light',
      colors: Colors[rnUseColorScheme() === 'dark' ? 'dark' : 'light'],
      setTheme: () => {},
      toggleTheme: () => {},
    }
  );
};
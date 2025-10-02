import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  colors: typeof Colors.light;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
};

const THEME_KEY = 'app_theme';

// Referencia a almacenamiento nativo (MMKV) si está disponible.
const storageRef: { current: any | null } = { current: null };

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = rnUseColorScheme();

  const [theme, setThemeState] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  // Cargar tema guardado: en Expo Go usar SecureStore; en dev build/native intentar MMKV.
  useEffect(() => {
    let cancelled = false;
    const appOwnership = (Constants as any)?.appOwnership;
    if (appOwnership === 'expo') {
      // Expo Go: solo SecureStore
      SecureStore.getItemAsync(THEME_KEY)
        .then((saved) => {
          if (!cancelled && (saved === 'light' || saved === 'dark')) {
            setThemeState(saved as ThemeMode);
          }
        })
        .catch(() => {});
    } else {
      import('react-native-mmkv')
        .then((mod) => {
          try {
            const MMKV = (mod as any).MMKV;
            const mmkv = new MMKV();
            storageRef.current = mmkv;
            const saved = mmkv.getString(THEME_KEY);
            if (!cancelled && (saved === 'light' || saved === 'dark')) {
              setThemeState(saved);
            }
          } catch {
            SecureStore.getItemAsync(THEME_KEY)
              .then((saved) => {
                if (!cancelled && (saved === 'light' || saved === 'dark')) {
                  setThemeState(saved as ThemeMode);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          SecureStore.getItemAsync(THEME_KEY)
            .then((saved) => {
              if (!cancelled && (saved === 'light' || saved === 'dark')) {
                setThemeState(saved as ThemeMode);
              }
            })
            .catch(() => {});
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const appOwnership = (Constants as any)?.appOwnership;
    const mmkv = storageRef.current;
    if (appOwnership !== 'expo' && mmkv) {
      try {
        mmkv.set(THEME_KEY, theme);
        return;
      } catch {}
    }
    SecureStore.setItemAsync(THEME_KEY, theme).catch(() => {});
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
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@seatsip:darkMode';

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => Promise<void>;
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  setDarkMode: async () => {},
  hydrated: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw === '1') setDarkModeState(true);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setDarkMode = useCallback(async (v: boolean) => {
    setDarkModeState(v);
    await AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  }, []);

  const value = useMemo(() => ({ darkMode, setDarkMode, hydrated }), [darkMode, setDarkMode, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

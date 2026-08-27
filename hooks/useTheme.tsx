// ThemeProvider — مدیریت تم تاریک/روشن + هوک useTheme
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { DARK, LIGHT, Palette, Mode } from '@/constants/theme';

type Ctx = {
  p: Palette;            // پالت فعلی
  mode: Mode;
  toggle: () => void;
  setMode: (m: Mode) => void;
};

const ThemeCtx = createContext<Ctx>({
  p: DARK,
  mode: 'dark',
  toggle: () => {},
  setMode: () => {},
});

let savedMode: Mode | null = null;

export function saveThemeMode(m: Mode) {
  savedMode = m;
  try {
    const g = globalThis as any;
    g.localStorage?.setItem?.('buti.theme', m);
  } catch {}
}

function loadMode(): Mode {
  if (savedMode) return savedMode;
  try {
    const g = globalThis as any;
    const v = g.localStorage?.getItem?.('buti.theme');
    if (v === 'light' || v === 'dark') return v;
  } catch {}
  // پیش‌فرض از سیستم‌عامل
  const sys = Appearance.getColorScheme();
  return sys === 'light' ? 'light' : 'dark';
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    setModeState(loadMode());
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    saveThemeMode(m);
  };

  const value = useMemo<Ctx>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode(mode === 'dark' ? 'light' : 'dark'),
      p: mode === 'dark' ? DARK : LIGHT,
    }),
    [mode]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

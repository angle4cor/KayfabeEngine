/**
 * Kayfabe Engine – Settings Context (Theme + Zoom)
 * Persists to localStorage under ke_settings.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SettingsContext = createContext(null);
const STORAGE_KEY = 'ke_settings';

const THEMES = {
  dark: {
    bg: '#0a0a0a',
    bgSecondary: '#111111',
    bgTertiary: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textDim: '#666666',
    border: '#333333',
    accent: '#c9a227',
    glow: 'rgba(255,255,255,0.1)',
    glowStrong: 'rgba(255,255,255,0.2)',
  },
  light: {
    bg: '#f5f5f5',
    bgSecondary: '#e8e8e8',
    bgTertiary: '#ddd',
    text: '#111',
    textSecondary: '#333',
    textDim: '#777',
    border: '#bbb',
    accent: '#8b6914',
    glow: 'rgba(0,0,0,0.08)',
    glowStrong: 'rgba(0,0,0,0.15)',
  },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { theme: 'dark', fontScale: 100 };
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const theme = THEMES[settings.theme] || THEMES.dark;
    const scalePct = Math.max(70, Math.min(150, Number(settings.fontScale) || 100));
    const zoom = scalePct / 100;
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-bg-secondary', theme.bgSecondary);
    root.style.setProperty('--color-bg-tertiary', theme.bgTertiary);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-dim', theme.textDim);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-glow', theme.glow);
    root.style.setProperty('--color-glow-strong', theme.glowStrong);
    root.style.zoom = String(zoom);
    document.body.dataset.theme = settings.theme;
  }, [settings]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const setFontScale = useCallback((scale) => {
    const n = Math.max(70, Math.min(150, Number(scale) || 100));
    setSettings((prev) => ({ ...prev, fontScale: n }));
  }, []);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      isDark: settings.theme === 'dark',
      fontScale: Number(settings.fontScale || 100),
      toggleTheme,
      setFontScale,
    }),
    [settings, toggleTheme, setFontScale]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

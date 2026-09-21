import { useEffect, useMemo, useState } from 'react';
import type { Locale } from '../content/types';
import {
  isThemePreference,
  LOCALE_STORAGE_KEY,
  resolveInitialLocale,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from '../lib/preferences';

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preferences still apply for the current page when storage is unavailable.
  }
}

function darkModeQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
}

export function useSitePreferences() {
  const [locale, setLocaleState] = useState<Locale>(() =>
    resolveInitialLocale(
      readStoredValue(LOCALE_STORAGE_KEY),
      navigator.languages.length > 0 ? navigator.languages : [navigator.language],
    ),
  );
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const stored = readStoredValue(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'system';
  });
  const [prefersDark, setPrefersDark] = useState(() => darkModeQuery()?.matches ?? false);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  useEffect(() => {
    if (themePreference !== 'system') {
      return undefined;
    }
    const query = darkModeQuery();
    if (!query) {
      return undefined;
    }
    const updatePreference = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    setPrefersDark(query.matches);
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, [themePreference]);

  const resolvedTheme = useMemo(
    () => resolveTheme(themePreference, prefersDark),
    [themePreference, prefersDark],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    writeStoredValue(LOCALE_STORAGE_KEY, nextLocale);
  };

  const setThemePreference = (nextTheme: ThemePreference) => {
    setThemePreferenceState(nextTheme);
    writeStoredValue(THEME_STORAGE_KEY, nextTheme);
  };

  return {
    locale,
    setLocale,
    themePreference,
    setThemePreference,
    resolvedTheme,
  };
}

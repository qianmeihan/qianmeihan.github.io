import type { Locale } from '../content/types';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const LOCALE_STORAGE_KEY = 'qian-portfolio-locale';
export const THEME_STORAGE_KEY = 'qian-portfolio-theme';

export function resolveInitialLocale(
  stored: string | null,
  browserLanguages: readonly string[],
): Locale {
  if (stored === 'zh' || stored === 'en') {
    return stored;
  }
  return browserLanguages.some((language) => language.toLowerCase().startsWith('zh'))
    ? 'zh'
    : 'en';
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return preference;
}

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

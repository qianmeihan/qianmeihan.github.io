import { describe, expect, it } from 'vitest';
import { resolveInitialLocale, resolveTheme } from './preferences';

describe('resolveInitialLocale', () => {
  it('uses a stored supported locale first', () => {
    expect(resolveInitialLocale('en', ['zh-CN'])).toBe('en');
    expect(resolveInitialLocale('zh', ['en-US'])).toBe('zh');
  });

  it('defaults to Chinese for zh browser languages', () => {
    expect(resolveInitialLocale(null, ['fr-FR', 'zh-Hans-CN'])).toBe('zh');
  });

  it('defaults to English for all other browser languages', () => {
    expect(resolveInitialLocale(null, ['fr-FR', 'en-US'])).toBe('en');
    expect(resolveInitialLocale('unsupported', [])).toBe('en');
  });
});

describe('resolveTheme', () => {
  it('resolves system theme from prefers-color-scheme', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('keeps explicit light and dark choices', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

import { Monitor, Moon, Sun } from 'lucide-react';
import type { Locale } from '../content/types';
import type { ThemePreference } from '../lib/preferences';

interface ThemeSwitchProps {
  locale: Locale;
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
}

const choices = [
  { value: 'light', zh: '亮色', en: 'Light', Icon: Sun },
  { value: 'dark', zh: '暗色', en: 'Dark', Icon: Moon },
  { value: 'system', zh: '跟随系统', en: 'System', Icon: Monitor },
] as const;

export function ThemeSwitch({ locale, preference, onChange }: ThemeSwitchProps) {
  return (
    <div className="theme-switch" role="group" aria-label={locale === 'zh' ? '主题' : 'Theme'}>
      {choices.map(({ value, zh, en, Icon }) => {
        const label = locale === 'zh' ? zh : en;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={preference === value}
            title={label}
            onClick={() => onChange(value)}
          >
            <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

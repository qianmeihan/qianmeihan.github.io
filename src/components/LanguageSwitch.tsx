import type { Locale } from '../content/types';

interface LanguageSwitchProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageSwitch({ locale, onChange }: LanguageSwitchProps) {
  return (
    <div className="language-switch" role="group" aria-label="语言 / Language">
      <button
        type="button"
        aria-pressed={locale === 'zh'}
        onClick={() => onChange('zh')}
      >
        中文
      </button>
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => onChange('en')}
      >
        EN
      </button>
    </div>
  );
}

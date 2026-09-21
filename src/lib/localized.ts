import type { Locale, LocalizedText } from '../content/types';

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

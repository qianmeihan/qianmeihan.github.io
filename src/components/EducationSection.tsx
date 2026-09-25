import type { EducationItem, Locale } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface EducationSectionProps {
  items: EducationItem[];
  locale: Locale;
}

export function EducationSection({ items, locale }: EducationSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section education-section" id="education">
      <SectionHeading title={locale === 'zh' ? '教育经历' : 'Education'} />
      <div className="education-grid">
        {items.map((item) => (
          <article key={item.id} className="education-card">
            <div className="education-card__header">
              <img
                className="education-card__logo"
                src={item.logo.src}
                alt=""
              />
              <div>
                <time>{localized(item.period, locale)}</time>
                <h3>{localized(item.institution, locale)}</h3>
              </div>
            </div>
            <p className="education-card__degree">{localized(item.degree, locale)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

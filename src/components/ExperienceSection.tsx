import type { ExperienceItem, Locale } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface ExperienceSectionProps {
  items: ExperienceItem[];
  locale: Locale;
}

export function ExperienceSection({ items, locale }: ExperienceSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section experience-section" id="experience">
      <SectionHeading title={locale === 'zh' ? '工作经历' : 'Experience'} />
      <ol className="timeline">
        {items.map((item) => (
          <li
            key={item.id}
            className={`timeline-item${item.featured ? ' timeline-item--featured' : ' timeline-item--secondary'}`}
          >
            <div className="timeline-item__meta">
              <img
                className="timeline-item__logo"
                src={item.logo.src}
                alt=""
              />
              <div className="timeline-item__meta-copy">
                <time>{localized(item.period, locale)}</time>
                <span>{localized(item.context, locale)}</span>
              </div>
            </div>
            <div className="timeline-item__body">
              {item.featured ? (
                <p className="timeline-item__featured-label">
                  {locale === 'zh' ? '核心研发经历' : 'Core R&D experience'}
                </p>
              ) : null}
              <h3>{localized(item.role, locale)}</h3>
              <p>{localized(item.summary, locale)}</p>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight.zh}>{localized(highlight, locale)}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

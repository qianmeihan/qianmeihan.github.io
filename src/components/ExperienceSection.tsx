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
      <SectionHeading
        number="02"
        title={locale === 'zh' ? '工作经历' : 'Experience'}
        aside={locale === 'zh' ? '从结构研发到整车项目产品工程' : 'From mechanical R&D to vehicle-program product engineering'}
      />
      <ol className="timeline">
        {items.map((item) => (
          <li key={item.id} className="timeline-item">
            <div className="timeline-item__meta">
              <time>{localized(item.period, locale)}</time>
              <span>{localized(item.context, locale)}</span>
            </div>
            <div className="timeline-item__body">
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

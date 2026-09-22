import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import type { Locale, PatentItem } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface PatentSectionProps {
  items: PatentItem[];
  locale: Locale;
}

export function PatentSection({ items, locale }: PatentSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section patent-section" id="patent">
      <SectionHeading title={locale === 'zh' ? '公开专利' : 'Published Patent'} />
      {items.map((item) => (
        <article key={item.id} className="patent-card">
          <figure className="patent-card__figure">
            <img
              src={item.image.src}
              alt={localized(item.image.alt, locale)}
              width="729"
              height="1000"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{localized(item.image.credit, locale)}</figcaption>
          </figure>
          <div className="patent-card__body">
            <p className="patent-card__status">
              <BadgeCheck aria-hidden="true" size={17} />
              {localized(item.status, locale)}
            </p>
            <p className="patent-card__number">{item.number}</p>
            <h3>{localized(item.title, locale)}</h3>
            <p>{localized(item.summary, locale)}</p>
            <ul>
              {item.engineeringValue.map((value) => (
                <li key={value.zh}>{localized(value, locale)}</li>
              ))}
            </ul>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              {localized(item.sourceLabel, locale)}
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Locale, PatentItem } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';
import { PatentImageDialog } from './PatentImageDialog';

interface PatentSectionProps {
  items: PatentItem[];
  locale: Locale;
}

function displayPatentTitle(item: PatentItem, locale: Locale) {
  const title = localized(item.displayTitle ?? item.title, locale);
  return locale === 'zh' && !(title.startsWith('《') && title.endsWith('》')) ? `《${title}》` : title;
}

export function PatentSection({ items, locale }: PatentSectionProps) {
  const [enlargedItem, setEnlargedItem] = useState<PatentItem | null>(null);

  if (items.length === 0) {
    return null;
  }

  const ownership = localized(items[0].ownership, locale);
  const sharedOwnership = items.every((item) => localized(item.ownership, locale) === ownership)
    ? ownership
    : null;

  return (
    <section className="content-section patent-section" id="patent">
      <SectionHeading title={locale === 'zh' ? '公开专利' : 'Published Patents'} />
      <div className="patent-list">
        {items.map((item) => (
          <article key={item.id} className="patent-card">
            <figure className="patent-card__figure">
              <button
                type="button"
                className="patent-card__image-button"
                aria-label={locale === 'zh' ? `放大查看 ${item.number} 附图` : `Enlarge drawing for ${item.number}`}
                onClick={() => setEnlargedItem(item)}
              >
                <img
                  src={item.image.src}
                  alt={localized(item.image.alt, locale)}
                  width="729"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </figure>
            <div className="patent-card__body">
              <p className="patent-card__number">{item.number}</p>
              <h3 title={item.displayTitle ? localized(item.title, locale) : undefined}>
                {displayPatentTitle(item, locale)}
              </h3>
              <p className="patent-card__summary">{localized(item.summary, locale)}</p>
              <p className="patent-card__inventors">{localized(item.inventors, locale)}</p>
              {!sharedOwnership && <p className="patent-card__ownership">{localized(item.ownership, locale)}</p>}
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                {localized(item.sourceLabel, locale)}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
      {sharedOwnership && <p className="patent-section__ownership">{sharedOwnership}</p>}
      <PatentImageDialog item={enlargedItem} locale={locale} onClose={() => setEnlargedItem(null)} />
    </section>
  );
}

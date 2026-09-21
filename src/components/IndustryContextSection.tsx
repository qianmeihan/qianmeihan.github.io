import { ArrowUpRight } from 'lucide-react';
import type { IndustryContextItem, Locale } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface IndustryContextSectionProps {
  items: IndustryContextItem[];
  locale: Locale;
}

export function IndustryContextSection({ items, locale }: IndustryContextSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section industry-section" id="industry-context">
      <SectionHeading
        number="CTX"
        title={locale === 'zh' ? '相关产品与行业背景' : 'Relevant Product and Industry Context'}
        aside={locale === 'zh' ? '图片和资料仅说明相关技术领域，不代表个人直接负责所示产品' : 'Images and references illustrate related technical fields and do not claim direct responsibility for the products shown'}
      />
      <div className="industry-grid">
        {items.map((item) => (
          <article key={item.id} className="industry-card">
            <figure>
              <img
                src={item.image.src}
                alt={localized(item.image.alt, locale)}
                width="1200"
                height="800"
                loading="lazy"
                decoding="async"
              />
              <figcaption>{localized(item.image.credit, locale)}</figcaption>
            </figure>
            <div>
              <h3>{localized(item.title, locale)}</h3>
              <p>{localized(item.description, locale)}</p>
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                {localized(item.sourceLabel, locale)}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { Locale, ProjectItem } from '../content/types';
import { localized } from '../lib/localized';

interface EngineeringSectionProps {
  items: ProjectItem[];
  locale: Locale;
  id?: string;
  onOpen?: (project: ProjectItem, trigger: HTMLButtonElement) => void;
}

export function EngineeringSection({ items, locale, id, onOpen }: EngineeringSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="experience-projects" id={id} aria-label={locale === 'zh' ? '代表项目' : 'Selected projects'}>
      <h4 className="experience-projects__heading">
        {locale === 'zh' ? '代表项目' : 'Selected Projects'}
      </h4>
      <div className="project-list">
        {items.map((item) => (
          <article key={item.id} className="media-tile project-card">
            <button
              className="media-tile__button"
              type="button"
              aria-label={localized(item.title, locale)}
              onClick={(event) => onOpen?.(item, event.currentTarget)}
            >
              <span className="media-tile__visual project-card__image">
                <img src={item.image.src} alt="" loading="lazy" decoding="async" />
              </span>
              <h5 className="media-tile__label">{localized(item.displayTitle ?? item.title, locale)}</h5>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

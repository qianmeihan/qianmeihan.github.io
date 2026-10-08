import { ArrowUpRight } from 'lucide-react';
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
          <article key={item.id} className="project-card">
            <div className="project-card__index">
              <span>{item.code}</span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </div>
            <div className="project-card__body">
              <h5>
                <button type="button" onClick={(event) => onOpen?.(item, event.currentTarget)}>
                  {localized(item.title, locale)}
                </button>
              </h5>
              <p>{localized(item.summary, locale)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

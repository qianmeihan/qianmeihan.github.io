import { CornerDownRight } from 'lucide-react';
import type { Locale, ProjectItem } from '../content/types';
import { localized } from '../lib/localized';

interface EngineeringSectionProps {
  items: ProjectItem[];
  locale: Locale;
}

export function EngineeringSection({ items, locale }: EngineeringSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="experience-projects" id="work" aria-labelledby="work-heading">
      <h3 className="experience-projects__heading" id="work-heading">
        {locale === 'zh' ? '代表项目' : 'Selected Projects'}
      </h3>
      <div className="project-list">
        {items.map((item) => (
          <article key={item.id} className="project-card">
            <div className="project-card__index">
              <span>{item.code}</span>
              <CornerDownRight aria-hidden="true" size={18} />
            </div>
            <div className="project-card__body">
              <h4>{localized(item.title, locale)}</h4>
              <p>{localized(item.summary, locale)}</p>
              <ul className="tag-list" aria-label={locale === 'zh' ? '相关能力' : 'Related capabilities'}>
                {item.capabilities.map((capability) => (
                  <li key={capability.zh}>{localized(capability, locale)}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

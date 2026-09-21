import { CornerDownRight } from 'lucide-react';
import type { Locale, ProjectItem } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface EngineeringSectionProps {
  items: ProjectItem[];
  locale: Locale;
}

export function EngineeringSection({ items, locale }: EngineeringSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section engineering-section" id="work">
      <SectionHeading
        number="03"
        title={locale === 'zh' ? '代表性工程工作' : 'Selected Engineering Work'}
        aside={locale === 'zh' ? '公开范围内的职责与方法，不展示保密参数' : 'Portfolio-safe responsibilities and methods without confidential parameters'}
      />
      <div className="project-list">
        {items.map((item) => (
          <article key={item.id} className="project-card">
            <div className="project-card__index">
              <span>{item.code}</span>
              <CornerDownRight aria-hidden="true" size={18} />
            </div>
            <div className="project-card__body">
              <h3>{localized(item.title, locale)}</h3>
              <p>{localized(item.summary, locale)}</p>
              <ul className="project-card__contributions">
                {item.contributions.map((contribution) => (
                  <li key={contribution.zh}>{localized(contribution, locale)}</li>
                ))}
              </ul>
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

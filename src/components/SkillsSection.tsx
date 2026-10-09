import type { Locale, SkillGroup } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface SkillsSectionProps {
  groups: SkillGroup[];
  locale: Locale;
}

export function SkillsSection({ groups, locale }: SkillsSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="content-section skills-section" id="skills">
      <SectionHeading
        title={locale === 'zh' ? '工程能力' : 'Engineering Capabilities'}
      />
      <div className="skills-grid">
        {groups.map((group) => (
          <article key={group.id} className="skill-group">
            <h3>{localized(group.title, locale)}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.id} className={`skill-item${item.imageStyle === 'contain' ? ' skill-item--logo' : ''}`}>
                  <span className="skill-item__visual">
                    <img src={item.image.src} alt={localized(item.image.alt, locale)} loading="lazy" />
                  </span>
                  <span className="skill-item__label">{localized(item.label, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

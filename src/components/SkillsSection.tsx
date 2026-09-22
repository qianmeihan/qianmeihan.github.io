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
                <li key={item.zh}>{localized(item, locale)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

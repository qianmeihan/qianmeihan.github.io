import type { EducationItem, Locale } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface EducationSectionProps {
  items: EducationItem[];
  locale: Locale;
}

export function EducationSection({ items, locale }: EducationSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="content-section education-section" id="education">
      <SectionHeading title={locale === 'zh' ? '教育经历' : 'Education'} />
      <p className="education-section__lead">
        {locale === 'zh'
          ? '材料科学与机械学背景，课程涵盖结构设计、材料性能与制造工艺。'
          : 'A foundation in materials science and mechanics, with coursework spanning structural design, materials, and manufacturing.'}
      </p>
      <div className="education-grid">
        {items.map((item) => (
          <article key={item.id} className="education-card">
            <div className="education-card__header">
              <img
                className="education-card__logo"
                src={item.logo.src}
                alt=""
              />
              <div>
                <time>{localized(item.period, locale)}</time>
                <h3>{localized(item.institution, locale)}</h3>
              </div>
            </div>
            <p className="education-card__degree">{localized(item.degree, locale)}</p>
            <div className="education-card__coursework">
              <h4>{locale === 'zh' ? '相关课程' : 'Selected coursework'}</h4>
              <ul className="education-card__courses">
                {item.courses.map((course) => <li key={course.zh}>{localized(course, locale)}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

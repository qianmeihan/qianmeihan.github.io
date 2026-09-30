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
          ? '材料科学与机械学背景，课程涵盖结构设计、材料性能与制造工艺。跨学科的课程组合为兼顾结构性能与制造可行性的产品设计提供了基础。'
          : 'Materials and mechanics: design, properties, manufacturing. This cross-disciplinary coursework connects structural performance with manufacturability.'}
      </p>
      <div className="education-schools">
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
                <p className="education-card__degree">{localized(item.degree, locale)}</p>
              </div>
              <a className="education-card__curriculum" href={item.curriculumUrl} target="_blank" rel="noopener noreferrer">
                {locale === 'zh' ? '学校课程设置 ↗' : 'University curriculum ↗'}
              </a>
            </div>
            {item.courses.length > 0 && (
              <div className="education-card__coursework">
                <div className="education-card__coursework-heading">
                  <h4>{locale === 'zh' ? '精选课程' : 'Selected coursework'}</h4>
                </div>
                <div className="education-course-grid">
                  {item.courses.map((course) => (
                    <article className="course-card" key={course.id}>
                      <div className="course-card__image">
                        <img src={course.image.src} alt={localized(course.image.alt, locale)} loading="lazy" decoding="async" />
                      </div>
                      <div className="course-card__body">
                        <h5>{localized(course.title, locale)}</h5>
                        <p>{localized(course.summary, locale)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

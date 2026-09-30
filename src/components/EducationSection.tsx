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
            </div>
            {item.courses.length > 0 && (
              <div className="education-card__coursework">
                <h4>{locale === 'zh' ? '精选课程' : 'Selected coursework'}</h4>
                <div className="education-course-grid" data-course-count={item.courses.length}>
                  {item.courses.map((course) => (
                    <article className="course-card" key={course.id}>
                      <a
                        className="course-card__image-link"
                        href={course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${locale === 'zh' ? '查看学校课程设置' : 'View university curriculum'}：${localized(course.title, locale)}`}
                      >
                        <img src={course.image.src} alt={localized(course.image.alt, locale)} loading="lazy" decoding="async" />
                      </a>
                      <div className="course-card__body">
                        <h5>{localized(course.title, locale)}</h5>
                        <p>{localized(course.summary, locale)}</p>
                        <div className="course-card__links">
                          <a href={course.courseUrl} target="_blank" rel="noopener noreferrer">
                            {locale === 'zh' ? '学校课程设置 ↗' : 'University curriculum ↗'}
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      <p className="education-section__note">
        {locale === 'zh'
          ? '课程图片为开放许可或公有领域的相关主题配图，不是本人上课现场或课程作品。图片来源与许可见页尾。'
          : 'Course images are openly licensed or public-domain topic illustrations, not photos of my classes or personal coursework. Image credits appear at the end of this page.'}
      </p>
    </section>
  );
}

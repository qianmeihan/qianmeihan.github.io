import type { EducationItem, Locale } from '../content/types';
import { localized } from '../lib/localized';

interface CourseImageCreditsProps {
  items: EducationItem[];
  locale: Locale;
}

export function CourseImageCredits({ items, locale }: CourseImageCreditsProps) {
  const courses = items.flatMap((school) => school.courses);
  if (courses.length === 0) return null;

  return (
    <section
      className="site-footer__credits"
      aria-label={locale === 'zh' ? '图片与图标来源与许可' : 'Image and icon credits and licenses'}
    >
      <h2>{locale === 'zh' ? '图片与图标来源与许可' : 'Image and icon credits and licenses'}</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.image.id}>
            <span>{localized(course.title, locale)}</span>
            <a href={course.image.sourceUrl} target="_blank" rel="noopener noreferrer">
              {localized(course.image.credit, locale)}
            </a>
            {course.image.licenseUrl && (
              <a href={course.image.licenseUrl} target="_blank" rel="noopener noreferrer">
                {locale === 'zh' ? '许可协议' : 'License'}
              </a>
            )}
          </li>
        ))}
      </ul>
      <p>
        {locale === 'zh' ? '能力图标：' : 'Capability icons: '}
        <a href="https://lucide.dev/license" target="_blank" rel="noopener noreferrer">Lucide</a>
        {locale === 'zh' ? '（ISC）；软件标识：' : ' (ISC); software marks: '}
        <a href="https://commons.wikimedia.org/wiki/File:CATIA_Logotype_RGB_Blue.png" target="_blank" rel="noopener noreferrer">CATIA</a>
        {' · '}
        <a href="https://commons.wikimedia.org/wiki/File:PTC_Creo_logo.svg" target="_blank" rel="noopener noreferrer">Creo</a>
        {' · '}
        <a href="https://commons.wikimedia.org/wiki/File:Autodesk_AutoCAD_Logo.svg" target="_blank" rel="noopener noreferrer">AutoCAD</a>
        {locale === 'zh' ? '。标识仅用于说明软件能力，不代表厂商背书。' : '. Marks identify software only; no vendor endorsement is implied.'}
      </p>
      <p>
        {locale === 'zh'
          ? '图片为网页缩放副本；卡片显示可能裁切并轻微降低饱和度。图片作者与学校不对本网页背书。'
          : 'Images are web-sized copies; card display may crop and slightly desaturate them. Creators and universities do not endorse this site.'}
      </p>
    </section>
  );
}

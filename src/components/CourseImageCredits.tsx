import type { EducationItem, Locale, MediaItem, SkillGroup } from '../content/types';
import { localized } from '../lib/localized';

interface CourseImageCreditsProps {
  items: EducationItem[];
  skillGroups: SkillGroup[];
  locale: Locale;
}

export function CourseImageCredits({ items, skillGroups, locale }: CourseImageCreditsProps) {
  const courses = items.flatMap((school) => school.courses);
  const credits: { label: { zh: string; en: string }; image: MediaItem }[] = courses.map((course) => ({
    label: course.title,
    image: course.image,
  }));
  const creditedSources = new Set(credits.map(({ image }) => image.sourceUrl));
  for (const group of skillGroups) {
    for (const item of group.items) {
      if (!creditedSources.has(item.image.sourceUrl)) {
        credits.push({ label: item.label, image: item.image });
        creditedSources.add(item.image.sourceUrl);
      }
    }
  }
  if (credits.length === 0) return null;

  return (
    <section
      className="site-footer__credits"
      aria-label={locale === 'zh' ? '图片与图标来源与许可' : 'Image and icon credits and licenses'}
    >
      <h2>{locale === 'zh' ? '图片与图标来源与许可' : 'Image and icon credits and licenses'}</h2>
      <ul>
        {credits.map(({ label, image }) => (
          <li key={image.id}>
            <span>{localized(label, locale)}</span>
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">
              {localized(image.credit, locale)}
            </a>
            {image.licenseUrl && (
              <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">
                {locale === 'zh' ? '许可协议' : 'License'}
              </a>
            )}
          </li>
        ))}
      </ul>
      <p>
        {locale === 'zh' ? '界面图标：' : 'Interface icons: '}
        <a href="https://lucide.dev/license" target="_blank" rel="noopener noreferrer">Lucide</a>
        {locale === 'zh' ? '（ISC）。软件标识仅用于说明软件能力，不代表厂商背书。' : ' (ISC). Software marks identify software only; no vendor endorsement is implied.'}
      </p>
      <p>
        {locale === 'zh'
          ? '图片为网页缩放副本；卡片显示可能裁切。课程与能力配图仅作主题示意，并非本人课程作品、项目实物或工作现场。图片作者与学校不对本网页背书。'
          : 'Images are web-sized copies and may be cropped in cards. Course and capability images illustrate topics only, not personal classwork, projects or workplaces. Creators and universities do not endorse this site.'}
      </p>
    </section>
  );
}

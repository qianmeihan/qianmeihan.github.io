import type { Locale } from '../content/types';

interface SiteNavProps {
  locale: Locale;
}

const links = [
  { id: 'profile', zh: '概述', en: 'Profile' },
  { id: 'experience', zh: '经历', en: 'Experience' },
  { id: 'work', zh: '工程工作', en: 'Engineering' },
  { id: 'patent', zh: '专利', en: 'Patent' },
  { id: 'skills', zh: '能力', en: 'Capabilities' },
  { id: 'contact', zh: '联系', en: 'Contact' },
] as const;

export function SiteNav({ locale }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label={locale === 'zh' ? '主导航' : 'Primary navigation'}>
      <ol>
        {links.map((link) => (
          <li key={link.id}>
            <a href={`#${link.id}`}>
              {locale === 'zh' ? link.zh : link.en}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

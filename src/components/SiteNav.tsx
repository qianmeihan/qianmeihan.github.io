import type { Locale } from '../content/types';

interface SiteNavProps {
  locale: Locale;
}

const links = [
  { id: 'profile', number: '01', zh: '概述', en: 'Profile' },
  { id: 'experience', number: '02', zh: '经历', en: 'Experience' },
  { id: 'work', number: '03', zh: '工程工作', en: 'Engineering' },
  { id: 'patent', number: '04', zh: '专利', en: 'Patent' },
  { id: 'skills', number: '05', zh: '能力', en: 'Capabilities' },
  { id: 'contact', number: '06', zh: '联系', en: 'Contact' },
] as const;

export function SiteNav({ locale }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label={locale === 'zh' ? '主导航' : 'Primary navigation'}>
      <ol>
        {links.map((link) => (
          <li key={link.id}>
            <a href={`#${link.id}`}>
              <span aria-hidden="true">{link.number}</span>
              {locale === 'zh' ? link.zh : link.en}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

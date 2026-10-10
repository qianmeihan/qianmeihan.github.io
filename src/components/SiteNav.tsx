import { Award, BriefcaseBusiness, GraduationCap, Mail, UserRound, Wrench } from 'lucide-react';
import type { Locale } from '../content/types';
import type { SectionId } from '../lib/sectionNavigation';

interface SiteNavProps {
  locale: Locale;
  activeId: SectionId;
}

const groups = [
  [{ id: 'profile', zh: '概述', en: 'Overview', Icon: UserRound }],
  [
    { id: 'education', zh: '教育经历', en: 'Education', Icon: GraduationCap },
    { id: 'experience', zh: '工作经历', en: 'Experience', Icon: BriefcaseBusiness },
  ],
  [
    { id: 'patent', zh: '专利', en: 'Patent', Icon: Award },
    { id: 'skills', zh: '专业能力', en: 'Skills', Icon: Wrench },
  ],
  [{ id: 'contact', zh: '联系', en: 'Contact', Icon: Mail }],
] as const;

export const navigationItems = groups.flat();

export function SiteNav({ locale, activeId }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label={locale === 'zh' ? '主导航' : 'Primary navigation'}>
      <div className="site-nav__groups">
        {groups.map((group, index) => (
          <ol className="site-nav__group" key={index}>
            {group.map(({ id, zh, en, Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={activeId === id ? 'location' : undefined}
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span>{locale === 'zh' ? zh : en}</span>
                </a>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </nav>
  );
}

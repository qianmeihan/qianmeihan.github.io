import { Award, BriefcaseBusiness, FolderKanban, GraduationCap, Mail, UserRound, Wrench, Factory } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '../content/types';

interface SiteNavProps {
  locale: Locale;
}

const groups = [
  [{ id: 'profile', zh: '概述', en: 'Overview', Icon: UserRound }],
  [
    { id: 'education', zh: '教育经历', en: 'Education', Icon: GraduationCap },
    { id: 'experience', zh: '工作经历', en: 'Experience', Icon: BriefcaseBusiness },
  ],
  [
    { id: 'work', zh: '代表项目', en: 'Projects', Icon: FolderKanban },
    { id: 'patent', zh: '专利', en: 'Patent', Icon: Award },
    { id: 'skills', zh: '专业能力', en: 'Skills', Icon: Wrench },
    { id: 'industry-context', zh: '产品领域', en: 'Products', Icon: Factory },
  ],
  [{ id: 'contact', zh: '联系', en: 'Contact', Icon: Mail }],
] as const;

export function SiteNav({ locale }: SiteNavProps) {
  const [activeId, setActiveId] = useState('profile');

  useEffect(() => {
    const sections = groups.flat().map(({ id }) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

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
                  onClick={() => setActiveId(id)}
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

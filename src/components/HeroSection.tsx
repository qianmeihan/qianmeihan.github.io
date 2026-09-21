import { ArrowDown, ArrowUpRight, BriefcaseBusiness, Code2, Mail, MapPin } from 'lucide-react';
import type { Locale, SiteContent } from '../content/types';
import { localized } from '../lib/localized';

interface HeroSectionProps {
  hero: SiteContent['hero'];
  profile: SiteContent['profile'];
  locale: Locale;
}

const linkIcons = {
  email: Mail,
  linkedin: BriefcaseBusiness,
  github: Code2,
} as const;

export function HeroSection({ hero, profile, locale }: HeroSectionProps) {
  return (
    <section className="hero-section" id="profile">
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <span aria-hidden="true">MQ / 01</span>
          {localized(hero.eyebrow, locale)}
        </p>
        <h1>{localized(profile.name, locale)}</h1>
        <p className="hero-role">{localized(profile.role, locale)}</p>
        <p className="hero-statement">{localized(hero.title, locale)}</p>
        <p className="hero-summary">{localized(hero.summary, locale)}</p>

        <dl className="hero-facts">
          <div>
            <dt>{locale === 'zh' ? '年龄' : 'Age'}</dt>
            <dd>{locale === 'zh' ? `${profile.age} 岁` : profile.age}</dd>
          </div>
          <div>
            <dt>{locale === 'zh' ? '所在地' : 'Based in'}</dt>
            <dd>
              <MapPin aria-hidden="true" size={15} />
              {localized(profile.location, locale)}
            </dd>
          </div>
          <div>
            <dt>{locale === 'zh' ? '方向' : 'Focus'}</dt>
            <dd>{locale === 'zh' ? '结构设计与产品开发' : 'Structures and product development'}</dd>
          </div>
        </dl>

        <div className="hero-actions">
          {profile.links.map((link) => {
            const Icon = linkIcons[link.id as keyof typeof linkIcons] ?? ArrowUpRight;
            const external = link.href.startsWith('https://');
            return (
              <a
                key={link.id}
                className={link.id === 'email' ? 'button-link button-link--primary' : 'button-link'}
                href={link.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                <Icon aria-hidden="true" size={16} />
                {localized(link.label, locale)}
                {external ? <ArrowUpRight aria-hidden="true" size={14} /> : null}
              </a>
            );
          })}
          <a className="text-link" href="#experience">
            {locale === 'zh' ? '查看经历' : 'View experience'}
            <ArrowDown aria-hidden="true" size={15} />
          </a>
        </div>
      </div>

      <figure className="hero-portrait">
        <div className="hero-portrait__frame">
          <img
            src={profile.portrait.src}
            alt={localized(profile.portrait.alt, locale)}
            width="900"
            height="1200"
            fetchPriority="high"
          />
          <span className="hero-portrait__index" aria-hidden="true">
            R&amp;D / STRUCTURES
          </span>
        </div>
        <figcaption>{localized(profile.portrait.credit, locale)}</figcaption>
      </figure>
    </section>
  );
}

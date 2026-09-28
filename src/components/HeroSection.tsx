import { ArrowDown, ArrowUpRight, FileDown, Mail } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import type { LinkItem, Locale, SiteContent } from '../content/types';
import { localized } from '../lib/localized';

interface HeroSectionProps {
  hero: SiteContent['hero'];
  profile: SiteContent['profile'];
  locale: Locale;
}

const linkIcons = {
  resume: FileDown,
  'resume-en': FileDown,
} as const;

export function HeroSection({ hero, profile, locale }: HeroSectionProps) {
  const renderProfileLink = (link: LinkItem) => {
    const Icon = linkIcons[link.id as keyof typeof linkIcons] ?? ArrowUpRight;
    const external = link.href.startsWith('https://');
    const downloadName = link.id === 'resume'
      ? 'Meihan-Qian-Resume-ZH.pdf'
      : link.id === 'resume-en' ? 'Meihan-Qian-Resume-EN.pdf' : undefined;
    const updatedAt = link.updatedAt
      ? `${locale === 'zh' ? '更新于' : 'Updated'} ${link.updatedAt}`
      : undefined;

    return (
      <a
        key={link.id}
        className="button-link"
        href={link.href}
        download={downloadName}
        data-updated-at={updatedAt}
        aria-description={updatedAt}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {link.id === 'linkedin' || link.id === 'github' ? (
          <BrandIcon brand={link.id as 'linkedin' | 'github'} size={18} />
        ) : (
          <Icon aria-hidden="true" className={downloadName ? 'resume-icon' : undefined} size={18} />
        )}
        {localized(link.label, locale)}
        {external ? <ArrowUpRight aria-hidden="true" size={14} /> : null}
      </a>
    );
  };

  return (
    <>
      <section className="hero-section" id="profile">
        <div className="hero-copy">
          <h1>{localized(profile.name, locale)}</h1>
          <p className="hero-role">{localized(profile.role, locale)}</p>
          <p className="hero-intro">{localized(hero.intro, locale)}</p>

          <div className="hero-actions">
            {profile.links.filter((link) => link.id === 'resume' || link.id === 'resume-en').map(renderProfileLink)}
            {profile.links.filter((link) => !['resume', 'resume-en', 'email'].includes(link.id)).map(renderProfileLink)}
            <a className="text-link" href="#contact">
              <Mail aria-hidden="true" size={18} />
              {locale === 'zh' ? '联系我' : 'Contact me'}
            </a>
            <a className="text-link" href="#education">
              {locale === 'zh' ? '了解更多' : 'Learn more'}
              <ArrowDown aria-hidden="true" size={15} />
            </a>
          </div>
        </div>

        <figure className="hero-portrait">
          <div className="hero-portrait__frame">
            <img
              src={profile.portrait.src}
              alt={localized(profile.portrait.alt, locale)}
              width="684"
              height="900"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
      </section>

      <section
        className="evidence-strip"
        aria-label={locale === 'zh' ? '核心经验' : 'Core experience'}
      >
        {hero.metrics.map((metric) => (
          <div key={metric.id} className="evidence-strip__item">
            <strong>{localized(metric.value, locale)}</strong>
            <span>{localized(metric.label, locale)}</span>
          </div>
        ))}
      </section>
    </>
  );
}

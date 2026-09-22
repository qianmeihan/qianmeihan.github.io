import { ArrowUpRight, BriefcaseBusiness, Code2, Mail } from 'lucide-react';
import type { LinkItem, Locale, SiteContent } from '../content/types';
import { localized } from '../lib/localized';

interface ContactSectionProps {
  contact: SiteContent['contact'];
  links: LinkItem[];
  locale: Locale;
}

const icons = { email: Mail, linkedin: BriefcaseBusiness, github: Code2 } as const;

export function ContactSection({ contact, links, locale }: ContactSectionProps) {
  return (
    <section className="contact-section" id="contact">
      <h2>{localized(contact.heading, locale)}</h2>
      <p>{localized(contact.invitation, locale)}</p>
      <div className="contact-links">
        {links.map((link) => {
          const Icon = icons[link.id as keyof typeof icons] ?? ArrowUpRight;
          const external = link.href.startsWith('https://');
          return (
            <a
              key={link.id}
              href={link.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
            >
              <Icon aria-hidden="true" size={18} />
              <span>{localized(link.label, locale)}</span>
              {external ? <ArrowUpRight aria-hidden="true" size={16} /> : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}

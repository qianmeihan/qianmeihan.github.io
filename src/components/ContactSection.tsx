import { ArrowUpRight, Mail } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import type { LinkItem, Locale, SiteContent } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface ContactSectionProps {
  contact: SiteContent['contact'];
  email: string;
  links: LinkItem[];
  locale: Locale;
}

export function ContactSection({ contact, email, links, locale }: ContactSectionProps) {
  const socials = links.filter((link) => link.id === 'linkedin' || link.id === 'github');
  return (
    <section className="content-section contact-section" id="contact">
      <SectionHeading title={localized(contact.heading, locale)} />
      <div className="contact-section__body">
        <p className="contact-section__invitation">{localized(contact.invitation, locale)}</p>
        <div className="contact-section__channels">
          <a className="contact-email" href={`mailto:${email}`}>
            <Mail aria-hidden="true" size={22} strokeWidth={1.7} />
            <span>{email}</span>
            <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.7} />
          </a>
          <div className="contact-socials">
            {socials.map((link) => (
              <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
                <BrandIcon brand={link.id as 'linkedin' | 'github'} size={18} />
                <span>{localized(link.label, locale)}</span>
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.7} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from 'react';
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
  children?: ReactNode;
}

export function ContactSection({ contact, email, links, locale, children }: ContactSectionProps) {
  const socials = links.filter((link) => link.id === 'linkedin' || link.id === 'github');
  return (
    <section className="content-section contact-section" id="contact">
      <SectionHeading title={localized(contact.heading, locale)} />
      <div className="contact-section__body">
        <p className="contact-section__invitation">{localized(contact.invitation, locale)}</p>
        <div className="contact-section__channels">
          <a className="contact-channel" href={`mailto:${email}`}>
            <Mail aria-hidden="true" size={20} strokeWidth={1.7} />
            <span>{email}</span>
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
          </a>
          {socials.map((link) => (
            <a className="contact-channel" key={link.id} href={link.href} target="_blank" rel="noopener noreferrer">
              <BrandIcon brand={link.id as 'linkedin' | 'github'} size={20} />
              <span>{localized(link.label, locale)}</span>
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
            </a>
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
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
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socials = links.filter((link) => link.id === 'linkedin' || link.id === 'github');

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  async function copyEmail() {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    resetTimer.current = window.setTimeout(() => {
      setCopyState('idle');
      resetTimer.current = null;
    }, 2000);
  }

  const copyMessage = copyState === 'copied'
    ? (locale === 'zh' ? '已复制' : 'Copied')
    : copyState === 'failed'
      ? (locale === 'zh' ? '复制失败' : 'Copy failed')
      : '';

  return (
    <section className="content-section contact-section" id="contact">
      <SectionHeading title={localized(contact.heading, locale)} />
      <div className="contact-section__body">
        <p className="contact-section__invitation">{localized(contact.invitation, locale)}</p>
        <div className="contact-section__channels">
          <button
            className="contact-channel contact-channel--copy"
            type="button"
            onClick={copyEmail}
            aria-label={locale === 'zh' ? `复制邮箱地址 ${email}` : `Copy email address ${email}`}
          >
            <Mail aria-hidden="true" size={20} strokeWidth={1.7} />
            <span className="contact-channel__email">{email}</span>
            <span className="contact-channel__copy-indicator">
              {copyState === 'copied'
                ? <Check aria-hidden="true" size={16} strokeWidth={1.7} />
                : <Copy aria-hidden="true" size={16} strokeWidth={1.7} />}
              <span className="contact-channel__copy-status" role="status">{copyMessage}</span>
            </span>
          </button>
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

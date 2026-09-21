import type { Locale, SiteContent } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface SummarySectionProps {
  summary: SiteContent['summary'];
  locale: Locale;
}

export function SummarySection({ summary, locale }: SummarySectionProps) {
  if (summary.paragraphs.length === 0) {
    return null;
  }

  return (
    <section className="content-section summary-section" aria-labelledby="profile-heading">
      <SectionHeading number="01" title={<span id="profile-heading">{localized(summary.heading, locale)}</span>} />
      <div className="summary-grid">
        <p className="summary-lead">{localized(summary.paragraphs[0], locale)}</p>
        <div className="summary-detail">
          {summary.paragraphs.slice(1).map((paragraph) => (
            <p key={paragraph.zh}>{localized(paragraph, locale)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

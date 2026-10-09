import {
  Box, CircuitBoard, ClipboardCheck, Languages, Layers3, Puzzle,
  Ruler, ScanSearch, ThermometerSun, UsersRound,
} from 'lucide-react';
import type { Locale, SkillGroup, SkillItem } from '../content/types';
import { localized } from '../lib/localized';
import { SectionHeading } from './SectionHeading';

interface SkillsSectionProps {
  groups: SkillGroup[];
  locale: Locale;
}

const visualIcons = {
  stamping: Layers3,
  casting: Box,
  molding: Puzzle,
  mounting: CircuitBoard,
  tolerances: Ruler,
  thermal: ThermometerSun,
  review: ClipboardCheck,
  collaboration: UsersRound,
  analysis: ScanSearch,
  languages: Languages,
} as const;

const softwareLogos = [
  { name: 'CATIA', src: '/media/skill-catia-logo.png' },
  { name: 'Creo', src: '/media/skill-creo-logo.svg' },
  { name: 'AutoCAD', src: '/media/skill-autocad-logo.svg' },
];

function SkillVisual({ item }: { item: SkillItem }) {
  if (item.visual === 'software') {
    return (
      <span className="skill-item__visual skill-item__visual--software">
        {softwareLogos.map(({ name, src }) => (
          <span className="skill-item__logo" key={name}>
            <img src={src} alt={name} loading="lazy" />
          </span>
        ))}
      </span>
    );
  }

  const Icon = visualIcons[item.visual];
  return (
    <span className="skill-item__visual skill-item__visual--icon" aria-hidden="true">
      <Icon size={25} strokeWidth={1.5} />
    </span>
  );
}

export function SkillsSection({ groups, locale }: SkillsSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="content-section skills-section" id="skills">
      <SectionHeading
        title={locale === 'zh' ? '工程能力' : 'Engineering Capabilities'}
      />
      <div className="skills-grid">
        {groups.map((group) => (
          <article key={group.id} className="skill-group">
            <h3>{localized(group.title, locale)}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.id} className={`skill-item${item.visual === 'software' ? ' skill-item--software' : ''}`}>
                  <SkillVisual item={item} />
                  <span className="skill-item__label">{localized(item.label, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

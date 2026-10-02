import { useRef, useState } from 'react';
import type { ExperienceItem, Locale, ProjectItem } from '../content/types';
import { localized } from '../lib/localized';
import { EngineeringSection } from './EngineeringSection';
import { ProjectDialog } from './ProjectDialog';
import { SectionHeading } from './SectionHeading';

interface ExperienceSectionProps {
  items: ExperienceItem[];
  projects?: ProjectItem[];
  locale: Locale;
}

export function ExperienceSection({ items, projects = [], locale }: ExperienceSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (items.length === 0 && projects.length === 0) {
    return null;
  }

  return (
    <section className="content-section experience-section" id="experience">
      <SectionHeading title={locale === 'zh' ? '工作经历' : 'Experience'} />
      {items.length > 0 ? (
        <ol className="timeline">
          {items.map((item) => (
            <li
              key={item.id}
              className="timeline-item"
            >
              <header className="timeline-item__header">
                <div className="timeline-item__identity">
                  <div className="timeline-item__logo-frame">
                    <img className="timeline-item__logo" src={item.logo.src} alt="" />
                  </div>
                  <div className="timeline-item__identity-copy">
                    <p className="timeline-item__context">{localized(item.context, locale)}</p>
                    <h3>{localized(item.role, locale)}</h3>
                  </div>
                </div>
                <time>{localized(item.period, locale)}</time>
              </header>
              <div className="timeline-item__body">
                <p>{localized(item.summary, locale)}</p>
                <ul>
                  {item.highlights.map((highlight) => (
                    <li key={highlight.zh}>{localized(highlight, locale)}</li>
                  ))}
                </ul>
              </div>
              <EngineeringSection
                items={projects.filter((project) => project.experienceId === item.id)}
                locale={locale}
                id={projects[0]?.experienceId === item.id ? 'work' : undefined}
                onOpen={(project, trigger) => {
                  triggerRef.current = trigger;
                  setSelectedProject(project);
                }}
              />
            </li>
          ))}
        </ol>
      ) : null}
      <ProjectDialog
        project={selectedProject}
        locale={locale}
        onClose={() => {
          setSelectedProject(null);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      />
    </section>
  );
}

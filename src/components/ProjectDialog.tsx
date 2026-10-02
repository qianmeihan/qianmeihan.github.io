import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Locale, ProjectItem } from '../content/types';
import { localized } from '../lib/localized';

interface ProjectDialogProps {
  project: ProjectItem | null;
  locale: Locale;
  onClose: () => void;
}

export function ProjectDialog({ project, locale, onClose }: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !project) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [project]);

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {project ? (
        <div className="project-dialog__inner">
          <div className="project-dialog__topline">
            <span>{project.code}</span>
            <button
              type="button"
              className="project-dialog__close"
              aria-label={locale === 'zh' ? '关闭项目详情' : 'Close project details'}
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <h3 id="project-dialog-title">{localized(project.title, locale)}</h3>
          <p className="project-dialog__summary">{localized(project.summary, locale)}</p>
          <h4>{locale === 'zh' ? '项目工作' : 'Project work'}</h4>
          <ul className="project-dialog__details">
            {project.details.map((detail) => <li key={detail.zh}>{localized(detail, locale)}</li>)}
          </ul>
          <ul className="tag-list" aria-label={locale === 'zh' ? '相关能力' : 'Related capabilities'}>
            {project.capabilities.map((capability) => (
              <li key={capability.zh}>{localized(capability, locale)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </dialog>
  );
}

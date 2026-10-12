import { useRef } from 'react';
import { X } from 'lucide-react';
import type { EducationItem, Locale, SkillGroup } from '../content/types';
import { CourseImageCredits } from './CourseImageCredits';

interface CreditsDialogProps {
  items: EducationItem[];
  skillGroups: SkillGroup[];
  locale: Locale;
}

export function CreditsDialog({ items, skillGroups, locale }: CreditsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="site-footer__credits-trigger" onClick={() => dialogRef.current?.showModal()}>
        {locale === 'zh' ? '图片来源与许可' : 'Image sources & licenses'}
      </button>
      <dialog
        ref={dialogRef}
        className="credits-dialog"
        aria-label={locale === 'zh' ? '图片来源与许可' : 'Image sources and licenses'}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="credits-dialog__inner">
          <button
            type="button"
            className="credits-dialog__close"
            aria-label={locale === 'zh' ? '关闭图片来源与许可' : 'Close image sources and licenses'}
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden="true" size={20} />
          </button>
          <CourseImageCredits items={items} skillGroups={skillGroups} locale={locale} />
        </div>
      </dialog>
    </>
  );
}

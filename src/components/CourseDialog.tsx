import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { EducationCourse, Locale } from '../content/types';
import { localized } from '../lib/localized';

interface CourseDialogProps {
  course: EducationCourse | null;
  locale: Locale;
  onClose: () => void;
}

export function CourseDialog({ course, locale, onClose }: CourseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !course) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [course]);

  return (
    <dialog
      ref={dialogRef}
      className="course-dialog"
      aria-labelledby="course-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {course && (
        <div className="course-dialog__inner">
          <button
            type="button"
            className="course-dialog__close"
            aria-label={locale === 'zh' ? '关闭课程详情' : 'Close course details'}
            onClick={() => dialogRef.current?.close()}
          >
            <X aria-hidden="true" size={20} />
          </button>
          <img src={course.image.src} alt={localized(course.image.alt, locale)} />
          <div className="course-dialog__copy">
            <h3 id="course-dialog-title">{localized(course.title, locale)}</h3>
            <p>{localized(course.summary, locale)}</p>
          </div>
        </div>
      )}
    </dialog>
  );
}

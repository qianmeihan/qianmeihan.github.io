import { useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Locale, PatentItem } from '../content/types';
import { localized } from '../lib/localized';

interface PatentImageDialogProps {
  item: PatentItem | null;
  locale: Locale;
  onClose: () => void;
}

export function PatentImageDialog({ item, locale, onClose }: PatentImageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !item) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      className="patent-image-dialog"
      aria-label={item ? (locale === 'zh' ? `${item.number} 附图` : `Drawing for ${item.number}`) : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {item && (
        <div className="patent-image-dialog__inner">
          <div className="patent-image-dialog__topline">
            <span>{item.number}</span>
            <button
              type="button"
              className="patent-image-dialog__close"
              aria-label={locale === 'zh' ? '关闭附图' : 'Close drawing'}
              onClick={() => dialogRef.current?.close()}
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <img src={item.image.src} alt={localized(item.image.alt, locale)} width="729" height="1000" />
          <a
            className="patent-image-dialog__record"
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {localized(item.sourceLabel, locale)}
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
      )}
    </dialog>
  );
}

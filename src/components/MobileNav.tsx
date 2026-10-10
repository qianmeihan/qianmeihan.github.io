import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Locale } from '../content/types';
import type { ThemePreference } from '../lib/preferences';
import { sectionIds, type SectionId } from '../lib/sectionNavigation';
import { LanguageSwitch } from './LanguageSwitch';
import { navigationItems } from './SiteNav';
import { ThemeSwitch } from './ThemeSwitch';

interface MobileNavProps {
  locale: Locale;
  activeId: SectionId;
  themePreference: ThemePreference;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (preference: ThemePreference) => void;
}

export function MobileNav({ locale, activeId, themePreference, onLocaleChange, onThemeChange }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const index = sectionIds.indexOf(activeId);
  const previous = navigationItems[index - 1];
  const current = navigationItems[index];
  const next = navigationItems[index + 1];
  const name = (item: typeof current) => locale === 'zh' ? item.zh : item.en;

  const openMenu = () => {
    dialogRef.current?.showModal();
    setMenuOpen(true);
  };
  const closeMenu = () => {
    dialogRef.current?.close();
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="mobile-dock" aria-label={locale === 'zh' ? '手机导航' : 'Mobile navigation'}>
        {previous ? (
          <a href={`#${previous.id}`} aria-label={locale === 'zh' ? `上一节：${name(previous)}` : `Previous: ${name(previous)}`}>
            <ChevronLeft aria-hidden="true" size={17} strokeWidth={1.8} />
            <span>{locale === 'zh' ? '上一节' : 'Previous'}</span>
          </a>
        ) : (
          <button type="button" disabled aria-label={locale === 'zh' ? '上一节' : 'Previous'}>
            <ChevronLeft aria-hidden="true" size={17} strokeWidth={1.8} />
            <span>{locale === 'zh' ? '上一节' : 'Previous'}</span>
          </button>
        )}
        <button
          type="button"
          className="mobile-dock__current"
          aria-label={locale === 'zh' ? `${name(current)}，打开模块目录` : `${name(current)}, open section menu`}
          aria-controls="mobile-section-menu"
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          <span>{name(current)}</span>
          <ChevronDown aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>
        {next ? (
          <a href={`#${next.id}`} aria-label={locale === 'zh' ? `下一节：${name(next)}` : `Next: ${name(next)}`}>
            <span>{locale === 'zh' ? '下一节' : 'Next'}</span>
            <ChevronRight aria-hidden="true" size={17} strokeWidth={1.8} />
          </a>
        ) : (
          <button type="button" disabled aria-label={locale === 'zh' ? '下一节' : 'Next'}>
            <span>{locale === 'zh' ? '下一节' : 'Next'}</span>
            <ChevronRight aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        )}
      </nav>

      <dialog
        id="mobile-section-menu"
        ref={dialogRef}
        className="mobile-menu"
        aria-labelledby="mobile-menu-title"
        onClose={() => setMenuOpen(false)}
      >
        <div className="mobile-menu__heading">
          <h2 id="mobile-menu-title">{locale === 'zh' ? '模块目录' : 'Sections'}</h2>
          <button type="button" onClick={closeMenu} aria-label={locale === 'zh' ? '关闭模块目录' : 'Close section menu'}>
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>
        <nav aria-label={locale === 'zh' ? '模块目录' : 'Sections'}>
          {navigationItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={item.id === activeId ? 'location' : undefined} onClick={closeMenu}>
              <item.Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>{name(item)}</span>
            </a>
          ))}
        </nav>
        <div className="mobile-menu__settings">
          <div>
            <span>{locale === 'zh' ? '语言' : 'Language'}</span>
            <LanguageSwitch locale={locale} onChange={(value) => { onLocaleChange(value); closeMenu(); }} />
          </div>
          <div>
            <span>{locale === 'zh' ? '外观' : 'Appearance'}</span>
            <ThemeSwitch locale={locale} preference={themePreference} onChange={(value) => { onThemeChange(value); closeMenu(); }} />
          </div>
        </div>
      </dialog>
    </>
  );
}

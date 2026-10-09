import { useCallback, useEffect, useRef, useState } from 'react';
import { ContactSection } from './components/ContactSection';
import { CourseImageCredits } from './components/CourseImageCredits';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { HeroSection } from './components/HeroSection';
import { LanguageSwitch } from './components/LanguageSwitch';
import { PatentSection } from './components/PatentSection';
import { SiteNav } from './components/SiteNav';
import { SkillsSection } from './components/SkillsSection';
import { ThemeSwitch } from './components/ThemeSwitch';
import { loadSiteContent } from './content/loadSiteContent';
import type { SiteContent } from './content/types';
import { useSitePreferences } from './hooks/useSitePreferences';
import { localized } from './lib/localized';
import { sectionFromHash, type SectionId } from './lib/sectionNavigation';
import { sectionIds } from './lib/sectionNavigation';

interface AppProps {
  contentLoader?: () => Promise<SiteContent>;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; content: SiteContent }
  | { status: 'error' };

export default function App({ contentLoader = loadSiteContent }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [activeSection, setActiveSection] = useState<SectionId>(() => sectionFromHash(window.location.hash));
  const mainRef = useRef<HTMLElement>(null);
  const {
    locale,
    setLocale,
    themePreference,
    setThemePreference,
  } = useSitePreferences();

  const load = useCallback(() => {
    setLoadState({ status: 'loading' });
    void contentLoader()
      .then((content) => setLoadState({ status: 'ready', content }))
      .catch(() => setLoadState({ status: 'error' }));
  }, [contentLoader]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const syncSection = () => setActiveSection(sectionFromHash(window.location.hash));
    window.addEventListener('hashchange', syncSection);
    window.addEventListener('popstate', syncSection);
    return () => {
      window.removeEventListener('hashchange', syncSection);
      window.removeEventListener('popstate', syncSection);
    };
  }, []);

  useEffect(() => {
    if (loadState.status !== 'ready') return;

    const initialTarget = sectionFromHash(window.location.hash);
    const scrollTarget = window.location.hash === '#work' ? 'work' : initialTarget;
    let frame = 0;
    if (window.location.hash && initialTarget !== 'profile') {
      frame = window.requestAnimationFrame(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ block: 'start' });
      });
    }

    if (typeof IntersectionObserver === 'undefined') {
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(() => {
      const footer = document.querySelector('.site-footer');
      if (footer && footer.getBoundingClientRect().top < window.innerHeight) {
        setActiveSection('contact');
        return;
      }
      const guide = window.innerHeight * 0.34;
      const current = [...sectionIds].reverse().find((id) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= guide;
      });
      setActiveSection(current ?? 'profile');
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    const footer = document.querySelector('.site-footer');
    if (footer) observer.observe(footer);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [loadState.status]);

  if (loadState.status === 'loading') {
    return <main role="status">Loading portfolio</main>;
  }

  if (loadState.status === 'error') {
    return (
      <main role="alert">
        <p>作品集内容暂时无法加载。</p>
        <p>Portfolio content could not be loaded.</p>
        <button type="button" onClick={load}>
          重试 / Retry
        </button>
      </main>
    );
  }

  const { content } = loadState;
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        mainRef.current?.focus();
      }}>
        {locale === 'zh' ? '跳到主要内容' : 'Skip to main content'}
      </a>
      <div className="site-shell">
        <header className="site-sidebar">
          <a className="site-brand" href="#profile" aria-label={localized(content.profile.name, locale)}>
            <img className="site-brand__portrait" src={content.profile.portrait.src} alt="" />
            <span className="site-brand__text">
              <strong>{localized(content.profile.name, locale)}</strong>
              <span>
                {locale === 'zh'
                  ? '机械/产品工程师'
                  : 'Mechanical / Product Engineer'}
              </span>
            </span>
          </a>

          <SiteNav locale={locale} activeId={activeSection} />

          <div className="sidebar-tools">
            <LanguageSwitch locale={locale} onChange={setLocale} />
            <ThemeSwitch
              locale={locale}
              preference={themePreference}
              onChange={setThemePreference}
            />
          </div>

          <div className="sidebar-contact">
            <span>{locale === 'zh' ? '开放联系' : 'Open to connect'}</span>
            <a href={`mailto:${content.profile.email}`}>{content.profile.email}</a>
          </div>
        </header>

        <div className="site-content">
          <main id="main-content" ref={mainRef} tabIndex={-1} aria-label={locale === 'zh' ? '主要内容' : 'Main content'}>
            <HeroSection hero={content.hero} profile={content.profile} locale={locale} />
            <EducationSection items={content.education} locale={locale} />
            <ExperienceSection items={content.experience} projects={content.projects} locale={locale} />
            <PatentSection items={content.patents} locale={locale} />
            <SkillsSection groups={content.skillGroups} locale={locale} />
            <ContactSection contact={content.contact} links={content.profile.links} locale={locale} />
          </main>
          <footer className="site-footer">
            <div className="site-footer__top">
              <span>© 2026 {localized(content.profile.name, locale)}</span>
              <a href="#profile">{locale === 'zh' ? '返回概述' : 'Back to overview'}</a>
            </div>
            <CourseImageCredits items={content.education} locale={locale} />
          </footer>
        </div>
      </div>
    </>
  );
}

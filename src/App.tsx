import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ContactSection } from './components/ContactSection';
import { CreditsDialog } from './components/CreditsDialog';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { HeroSection } from './components/HeroSection';
import { LanguageSwitch } from './components/LanguageSwitch';
import { MobileNav } from './components/MobileNav';
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

type SwipeDirection = 'next' | 'previous';

export default function App({ contentLoader = loadSiteContent }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [activeSection, setActiveSection] = useState<SectionId>(() => sectionFromHash(window.location.hash));
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  const mainRef = useRef<HTMLElement>(null);
  const gestureLandingRef = useRef<{ target: SectionId; direction: SwipeDirection } | null>(null);
  const lastPhoneSectionRef = useRef(activeSection);
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
    const media = window.matchMedia('(max-width: 600px)');
    const syncViewport = () => {
      setIsPhone(media.matches);
      if (media.matches && window.location.hash) {
        setActiveSection(sectionFromHash(window.location.hash));
      }
    };
    media.addEventListener('change', syncViewport);
    return () => media.removeEventListener('change', syncViewport);
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
      if (window.matchMedia('(max-width: 600px)').matches) return;
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

  useLayoutEffect(() => {
    if (loadState.status !== 'ready' || !isPhone) {
      lastPhoneSectionRef.current = activeSection;
      return;
    }
    const main = mainRef.current;
    const changed = lastPhoneSectionRef.current !== activeSection;
    const landing = gestureLandingRef.current?.target === activeSection ? gestureLandingRef.current : null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lastPhoneSectionRef.current = activeSection;
    gestureLandingRef.current = null;
    if (changed && !reducedMotion && main) main.style.opacity = '0';

    let entrance: Animation | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (landing?.direction === 'previous') {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      } else {
        const target = window.location.hash === '#work' ? 'work' : activeSection;
        document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      if (changed && !reducedMotion && main?.animate) {
        const offset = landing?.direction === 'previous' ? '-14px' : '14px';
        entrance = main.animate([
          { opacity: 0, transform: `translate3d(0, ${offset}, 0)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ], { duration: 230, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' });
        void entrance.finished.then(() => entrance?.cancel()).catch(() => {});
      }
      if (main) main.style.opacity = '';
    });
    return () => {
      window.cancelAnimationFrame(frame);
      entrance?.cancel();
      if (main) main.style.opacity = '';
    };
  }, [activeSection, isPhone, loadState.status]);

  useEffect(() => {
    if (loadState.status !== 'ready' || !isPhone) return;
    const main = mainRef.current;
    const index = sectionIds.indexOf(activeSection);
    const previousSection = sectionIds[index - 1];
    const nextSection = sectionIds[index + 1];
    if (!main || (!previousSection && !nextSection)) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let startX = 0;
    let startY = 0;
    let pullDistance = 0;
    let canPull = false;
    let isPulling = false;
    let canGoPrevious = false;
    let canGoNext = false;
    let direction: SwipeDirection | null = null;
    let navigating = false;
    let exitAnimation: Animation | undefined;
    let resetTimer = 0;

    const resetPull = (springBack = true) => {
      if (springBack && !reducedMotion && isPulling) {
        main.style.transition = 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)';
        main.style.transform = '';
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => { main.style.transition = ''; }, 180);
      } else if (!springBack) {
        main.style.transition = '';
        main.style.transform = '';
      }
      canPull = false;
      isPulling = false;
      pullDistance = 0;
      direction = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      canPull = false;
      if (navigating || event.touches.length !== 1 || document.querySelector('dialog[open]')) return;
      const target = event.target;
      // A deliberate pull can begin on a course or project card; taps still activate its button.
      if (target instanceof Element && target.closest('a, input, select, textarea, [role="button"]')) return;
      canGoPrevious = Boolean(previousSection) && window.scrollY <= 4;
      canGoNext = Boolean(nextSection) && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (!canGoPrevious && !canGoNext) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      pullDistance = 0;
      direction = null;
      canPull = true;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!canPull) return;
      if (event.touches.length !== 1) {
        resetPull();
        return;
      }
      const deltaX = event.touches[0].clientX - startX;
      const deltaY = startY - event.touches[0].clientY;
      if (Math.abs(deltaY) <= 4 || Math.abs(deltaX) > Math.abs(deltaY)) {
        if (isPulling) resetPull();
        return;
      }
      const candidate: SwipeDirection = deltaY > 0 ? 'next' : 'previous';
      if ((candidate === 'next' && !canGoNext) || (candidate === 'previous' && !canGoPrevious) || (direction && direction !== candidate)) {
        if (isPulling) resetPull();
        return;
      }
      event.preventDefault();
      isPulling = true;
      direction = candidate;
      pullDistance = Math.abs(deltaY);
      if (!reducedMotion) {
        window.clearTimeout(resetTimer);
        main.style.transition = 'none';
        main.style.transform = `translate3d(0, ${candidate === 'next' ? '-' : ''}${Math.min(pullDistance * 0.17, 22)}px, 0)`;
      }
    };

    const onTouchEnd = () => {
      const destination = direction === 'next' ? nextSection : previousSection;
      if (!isPulling || pullDistance < 88 || !direction || !destination) {
        resetPull();
        return;
      }
      const swipeDirection = direction;
      const pullTransform = main.style.transform || 'none';
      resetPull(false);
      navigating = true;
      const navigate = () => {
        gestureLandingRef.current = { target: destination, direction: swipeDirection };
        window.location.hash = `#${destination}`;
      };
      if (reducedMotion || !main.animate) {
        navigate();
        return;
      }
      exitAnimation = main.animate([
        { opacity: 1, transform: pullTransform },
        { opacity: 0, transform: `translate3d(0, ${swipeDirection === 'next' ? '-30px' : '30px'}, 0)` },
      ], { duration: 140, easing: 'cubic-bezier(0.4, 0, 0.7, 0.2)', fill: 'forwards' });
      void exitAnimation.finished.then(() => {
        main.style.opacity = '0';
        exitAnimation?.cancel();
        navigate();
      }).catch(() => {});
    };
    const onTouchCancel = () => resetPull();

    main.addEventListener('touchstart', onTouchStart, { passive: true });
    main.addEventListener('touchmove', onTouchMove, { passive: false });
    main.addEventListener('touchend', onTouchEnd);
    main.addEventListener('touchcancel', onTouchCancel);
    return () => {
      main.removeEventListener('touchstart', onTouchStart);
      main.removeEventListener('touchmove', onTouchMove);
      main.removeEventListener('touchend', onTouchEnd);
      main.removeEventListener('touchcancel', onTouchCancel);
      window.clearTimeout(resetTimer);
      exitAnimation?.cancel();
      main.style.transition = '';
      main.style.transform = '';
    };
  }, [activeSection, isPhone, loadState.status]);

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

        <div className="site-content" data-active-section={activeSection}>
          <main id="main-content" ref={mainRef} tabIndex={-1} data-active-section={activeSection} aria-label={locale === 'zh' ? '主要内容' : 'Main content'}>
            <HeroSection hero={content.hero} profile={content.profile} locale={locale} />
            <EducationSection items={content.education} locale={locale} />
            <ExperienceSection items={content.experience} projects={content.projects} locale={locale} />
            <PatentSection items={content.patents} locale={locale} />
            <SkillsSection groups={content.skillGroups} locale={locale} />
            <ContactSection contact={content.contact} email={content.profile.email} links={content.profile.links} locale={locale}>
              <footer className="site-footer">
                <span>© 2026 {localized(content.profile.name, locale)}</span>
                <div className="site-footer__links">
                  <a href="#profile">{locale === 'zh' ? '返回概述' : 'Back to overview'}</a>
                  <CreditsDialog items={content.education} skillGroups={content.skillGroups} locale={locale} />
                </div>
              </footer>
            </ContactSection>
          </main>
        </div>
      </div>
      {isPhone && (
        <MobileNav
          locale={locale}
          activeId={activeSection}
          themePreference={themePreference}
          onLocaleChange={setLocale}
          onThemeChange={setThemePreference}
        />
      )}
    </>
  );
}

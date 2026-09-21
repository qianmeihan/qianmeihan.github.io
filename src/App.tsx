import { useCallback, useEffect, useState } from 'react';
import { LanguageSwitch } from './components/LanguageSwitch';
import { SiteNav } from './components/SiteNav';
import { ThemeSwitch } from './components/ThemeSwitch';
import { loadSiteContent } from './content/loadSiteContent';
import type { SiteContent } from './content/types';
import { useSitePreferences } from './hooks/useSitePreferences';
import { localized } from './lib/localized';

interface AppProps {
  contentLoader?: () => Promise<SiteContent>;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; content: SiteContent }
  | { status: 'error' };

export default function App({ contentLoader = loadSiteContent }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
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
      <a className="skip-link" href="#main-content">
        {locale === 'zh' ? '跳到主要内容' : 'Skip to main content'}
      </a>
      <div className="site-shell">
        <header className="site-sidebar">
          <a className="site-brand" href="#profile" aria-label={localized(content.profile.name, locale)}>
            <span className="site-brand__mark" aria-hidden="true">
              MQ
            </span>
            <span className="site-brand__text">
              <strong>{localized(content.profile.name, locale)}</strong>
              <span>{locale === 'zh' ? '机械设计档案' : 'Mechanical dossier'}</span>
            </span>
          </a>

          <SiteNav locale={locale} />

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
          <main id="main-content">
            <section className="shell-profile" id="profile">
              <p className="shell-profile__eyebrow">{localized(content.hero.eyebrow, locale)}</p>
              <h1>{localized(content.profile.name, locale)}</h1>
              <p className="shell-profile__role">{localized(content.profile.role, locale)}</p>
            </section>
          </main>
          <footer className="site-footer">
            <span>© 2026 {localized(content.profile.name, locale)}</span>
            <a href="#profile">{locale === 'zh' ? '返回顶部' : 'Back to top'}</a>
          </footer>
        </div>
      </div>
    </>
  );
}

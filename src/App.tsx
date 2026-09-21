import { useCallback, useEffect, useState } from 'react';
import { loadSiteContent } from './content/loadSiteContent';
import type { SiteContent } from './content/types';

interface AppProps {
  contentLoader?: () => Promise<SiteContent>;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; content: SiteContent }
  | { status: 'error' };

export default function App({ contentLoader = loadSiteContent }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

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
    <main>
      <h1>{content.profile.name.zh}</h1>
      <p>{content.profile.role.zh}</p>
    </main>
  );
}

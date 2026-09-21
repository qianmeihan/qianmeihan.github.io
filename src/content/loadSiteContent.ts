import type { SiteContent } from './types';
import { validateSiteContent } from './validateSiteContent';

export async function loadSiteContent(
  fetcher: typeof fetch = fetch,
): Promise<SiteContent> {
  const response = await fetcher('/content/site.json', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Unable to load portfolio content (${response.status})`);
  }

  return validateSiteContent(await response.json());
}

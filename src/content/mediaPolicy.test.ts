import { describe, expect, it } from 'vitest';
import siteContentJson from '../../public/content/site.json';
import type { MediaItem } from './types';
import { validateSiteContent } from './validateSiteContent';

const siteContent = validateSiteContent(siteContentJson);
const bundledMedia = import.meta.glob('../../public/media/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

const mediaItems: MediaItem[] = [
  siteContent.profile.portrait,
  ...siteContent.experience.map((item) => item.logo),
  ...siteContent.patents.map((patent) => patent.image),
  ...siteContent.education.map((item) => item.logo),
  ...siteContent.industryContext.map((item) => item.image),
];

describe('portfolio media policy', () => {
  it('requires traceable bilingual metadata for every image', () => {
    for (const media of mediaItems) {
      expect(media.src).toMatch(/^\/media\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/i);
      expect(media.alt.zh.trim()).not.toBe('');
      expect(media.alt.en.trim()).not.toBe('');
      expect(media.credit.zh.trim()).not.toBe('');
      expect(media.credit.en.trim()).not.toBe('');
      expect(media.sourceUrl).toMatch(/^https:\/\//);
      expect(media.usageNote.zh.trim()).not.toBe('');
      expect(media.usageNote.en.trim()).not.toBe('');
    }
  });

  it('uses unique media ids and excludes generated-image markers', () => {
    const ids = mediaItems.map((media) => media.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const media of mediaItems) {
      expect(`${media.src} ${media.credit.zh} ${media.credit.en}`).not.toMatch(
        /AI生成|豆包|generated|placeholder/i,
      );
    }
  });

  it('ships every referenced image as a repository-local asset', () => {
    const assetNames = Object.keys(bundledMedia).map((path) => path.split('/').at(-1));
    for (const media of mediaItems) {
      expect(assetNames).toContain(media.src.split('/').at(-1));
    }
  });
});

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

interface EditablePortraitContent {
  profile?: {
    portrait?: {
      src?: unknown;
    };
  };
}

export function portraitPreloadPlugin(projectRoot = process.cwd()) {
  const contentPath = resolve(projectRoot, 'public/content/site.json');

  return {
    name: 'qian-portrait-preload',
    transformIndexHtml: {
      order: 'pre',
      async handler() {
        const content = JSON.parse(
          await readFile(contentPath, 'utf8'),
        ) as EditablePortraitContent;
        const portraitSource = content.profile?.portrait?.src;

        if (typeof portraitSource !== 'string' || portraitSource.trim() === '') {
          throw new Error('profile.portrait.src must be set before building the site');
        }

        return [
          {
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'image',
              href: portraitSource,
              fetchpriority: 'high',
            },
            injectTo: 'head' as const,
          },
        ];
      },
    },
  } satisfies Plugin;
}

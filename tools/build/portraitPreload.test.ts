import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { portraitPreloadPlugin } from './portraitPreload.ts';

describe('portraitPreloadPlugin', () => {
  it('reads the editable portrait path when each HTML page is transformed', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'qian-portrait-preload-'));
    const contentDirectory = join(projectRoot, 'public', 'content');
    const contentPath = join(contentDirectory, 'site.json');
    await mkdir(contentDirectory, { recursive: true });
    await writeFile(
      contentPath,
      JSON.stringify({ profile: { portrait: { src: '/media/first-portrait.webp' } } }),
    );

    const plugin = portraitPreloadPlugin(projectRoot);
    const firstTags = await plugin.transformIndexHtml.handler('');

    expect(firstTags).toEqual([
      {
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'image',
          href: '/media/first-portrait.webp',
          fetchpriority: 'high',
        },
        injectTo: 'head',
      },
    ]);

    await writeFile(
      contentPath,
      JSON.stringify({ profile: { portrait: { src: '/media/replacement-portrait.jpg' } } }),
    );

    const replacementTags = await plugin.transformIndexHtml.handler('');
    expect(replacementTags[0].attrs.href).toBe('/media/replacement-portrait.jpg');
  });
});

import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import siteContent from '../../public/content/site.json';
import {
  saveMediaFile,
  validateEditorContent,
  writeSiteContentAtomic,
} from './localEditorServer';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

function cloneContent(): unknown {
  return JSON.parse(JSON.stringify(siteContent));
}

describe('local editor content validation', () => {
  it('accepts the current bilingual public content', () => {
    expect(validateEditorContent(cloneContent())).toEqual(siteContent);
  });

  it('rejects content that removes an English translation', () => {
    const draft = cloneContent() as typeof siteContent;
    draft.hero.title.en = '';

    expect(() => validateEditorContent(draft)).toThrow('hero.title.en');
  });

  it('rejects current-employer fields and excluded work topics', () => {
    const employerDraft = cloneContent() as typeof siteContent & {
      experience: Array<Record<string, unknown>>;
    };
    employerDraft.experience[0].employer = 'Private employer';

    expect(() => validateEditorContent(employerDraft)).toThrow('employer');

    const topicDraft = cloneContent() as typeof siteContent;
    topicDraft.hero.title.zh = '生产计划工具';
    expect(() => validateEditorContent(topicDraft)).toThrow('生产计划');
  });

  it('writes valid JSON atomically and leaves no temporary file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'qian-editor-'));
    temporaryDirectories.push(directory);
    const target = join(directory, 'site.json');

    await writeSiteContentAtomic(cloneContent(), target);

    expect(JSON.parse(await readFile(target, 'utf8'))).toEqual(siteContent);
    await expect(readFile(`${target}.tmp`, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});

describe('local editor media uploads', () => {
  it('stores a safe image filename and rejects unsupported files', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'qian-media-'));
    temporaryDirectories.push(directory);

    const publicPath = await saveMediaFile(
      new Uint8Array([0xff, 0xd8, 0xff]),
      'Project Photo.JPG',
      directory,
    );

    expect(publicPath).toBe('/media/project-photo.jpg');
    await expect(readFile(join(directory, 'project-photo.jpg'))).resolves.toEqual(
      Buffer.from([0xff, 0xd8, 0xff]),
    );
    await expect(
      saveMediaFile(new Uint8Array([1]), '../secret.svg', directory),
    ).rejects.toThrow('JPG, PNG, or WebP');
  });
});

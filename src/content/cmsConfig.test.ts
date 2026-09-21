import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import siteContent from '../../public/content/site.json';
import cmsConfigYaml from '../../public/admin/config.yml?raw';

type CmsField = {
  name: string;
  widget?: string;
  fields?: CmsField[];
  field?: CmsField;
};

type CmsConfig = {
  backend: {
    name: string;
    repo: string;
    branch: string;
    auth_methods: string[];
  };
  media_folder: string;
  public_folder: string;
  collections: Array<{
    name: string;
    files?: Array<{ name: string; file: string; fields: CmsField[] }>;
  }>;
};

const config = parse(cmsConfigYaml) as CmsConfig;
const fileEntries = config.collections.flatMap((collection) => collection.files ?? []);
const siteFile = fileEntries.find((entry) => entry.file === 'public/content/site.json');

function findField(fields: CmsField[], path: string[]): CmsField | undefined {
  const [name, ...rest] = path;
  const field = fields.find((candidate) => candidate.name === name);
  if (!field || rest.length === 0) return field;
  return findField(field.fields ?? field.field?.fields ?? [], rest);
}

function expectLocalized(path: string[]) {
  const field = findField(siteFile?.fields ?? [], path);
  expect(field, path.join('.')).toBeDefined();
  expect(['object', 'list'], path.join('.')).toContain(field?.widget);
  const localizedFields = field?.fields ?? field?.field?.fields;
  expect(localizedFields?.map((child) => child.name), path.join('.')).toEqual([
    'zh',
    'en',
  ]);
}

function collectNames(fields: CmsField[]): string[] {
  return fields.flatMap((field) => [
    field.name,
    ...collectNames(field.fields ?? []),
    ...(field.field ? collectNames([field.field]) : []),
  ]);
}

function expectFieldsToMatchValue(fields: CmsField[], value: unknown, path: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;

  const objectValue = value as Record<string, unknown>;
  expect(
    fields.map((field) => field.name),
    path,
  ).toEqual(Object.keys(objectValue));

  for (const field of fields) {
    const childValue = objectValue[field.name];
    const childPath = `${path}.${field.name}`;

    if (Array.isArray(childValue)) {
      if (childValue.length > 0 && typeof childValue[0] === 'object') {
        expectFieldsToMatchValue(
          field.fields ?? field.field?.fields ?? [],
          childValue[0],
          `${childPath}[]`,
        );
      }
    } else if (childValue && typeof childValue === 'object') {
      expectFieldsToMatchValue(field.fields ?? [], childValue, childPath);
    }
  }
}

describe('Sveltia CMS configuration', () => {
  it('uses the owner repository and token authentication', () => {
    expect(config.backend.name).toBe('github');
    expect(config.backend.repo).toBe('qianmeihan/qianmeihan.github.io');
    expect(config.backend.branch).toBe('main');
    expect(config.backend.auth_methods).toEqual(['token']);
    expect(config.media_folder).toBe('public/media');
    expect(config.public_folder).toBe('/media');
  });

  it('edits the validated JSON content file through one file collection', () => {
    expect(fileEntries).toHaveLength(1);
    expect(siteFile).toBeDefined();
    expect(siteFile?.fields.map((field) => field.name)).toEqual([
      'meta',
      'profile',
      'hero',
      'summary',
      'experience',
      'projects',
      'patents',
      'skillGroups',
      'education',
      'industryContext',
      'contact',
    ]);
  });

  it('keeps every core public-facing field bilingual', () => {
    [
      ['profile', 'name'],
      ['profile', 'location'],
      ['profile', 'role'],
      ['profile', 'portrait', 'alt'],
      ['profile', 'portrait', 'credit'],
      ['profile', 'portrait', 'usageNote'],
      ['hero', 'eyebrow'],
      ['hero', 'title'],
      ['hero', 'summary'],
      ['summary', 'heading'],
      ['summary', 'paragraphs'],
      ['experience', 'role'],
      ['experience', 'context'],
      ['experience', 'summary'],
      ['projects', 'title'],
      ['projects', 'summary'],
      ['patents', 'title'],
      ['patents', 'summary'],
      ['education', 'institution'],
      ['education', 'degree'],
      ['industryContext', 'title'],
      ['industryContext', 'description'],
      ['contact', 'heading'],
      ['contact', 'invitation'],
    ].forEach(expectLocalized);
  });

  it('mirrors every key in the validated site content schema', () => {
    expectFieldsToMatchValue(siteFile?.fields ?? [], siteContent, 'site');
  });

  it('does not expose sensitive or secret-bearing fields', () => {
    const names = collectNames(siteFile?.fields ?? []);
    expect(names).not.toEqual(
      expect.arrayContaining([
        'phone',
        'salary',
        'employer',
        'organization',
        'secret',
        'token',
        'password',
      ]),
    );
  });
});

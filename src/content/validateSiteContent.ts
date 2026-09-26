import type {
  EducationItem,
  ExperienceItem,
  HeroMetric,
  IndustryContextItem,
  LinkItem,
  LocalizedText,
  MediaItem,
  PatentItem,
  ProjectItem,
  SiteContent,
  SkillGroup,
} from './types.ts';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown, path: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as UnknownRecord;
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string`);
  }
  return value;
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${path} must be a boolean`);
  }
  return value;
}

function localized(value: unknown, path: string): LocalizedText {
  const item = record(value, path);
  return {
    zh: string(item.zh, `${path}.zh`),
    en: string(item.en, `${path}.en`),
  };
}

function array<T>(
  value: unknown,
  path: string,
  validate: (item: unknown, path: string) => T,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array`);
  }
  return value.map((item, index) => validate(item, `${path}[${index}]`));
}

function localizedArray(value: unknown, path: string): LocalizedText[] {
  return array(value, path, localized);
}

function media(value: unknown, path: string): MediaItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    src: string(item.src, `${path}.src`),
    alt: localized(item.alt, `${path}.alt`),
    credit: localized(item.credit, `${path}.credit`),
    sourceUrl: string(item.sourceUrl, `${path}.sourceUrl`),
    usageNote: localized(item.usageNote, `${path}.usageNote`),
  };
}

function link(value: unknown, path: string): LinkItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    label: localized(item.label, `${path}.label`),
    href: string(item.href, `${path}.href`),
  };
}

function experience(value: unknown, path: string): ExperienceItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    featured: boolean(item.featured, `${path}.featured`),
    logo: media(item.logo, `${path}.logo`),
    period: localized(item.period, `${path}.period`),
    role: localized(item.role, `${path}.role`),
    context: localized(item.context, `${path}.context`),
    summary: localized(item.summary, `${path}.summary`),
    highlights: localizedArray(item.highlights, `${path}.highlights`),
  };
}

function project(value: unknown, path: string): ProjectItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    code: string(item.code, `${path}.code`),
    title: localized(item.title, `${path}.title`),
    summary: localized(item.summary, `${path}.summary`),
    capabilities: localizedArray(item.capabilities, `${path}.capabilities`),
  };
}

function heroMetric(value: unknown, path: string): HeroMetric {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    value: localized(item.value, `${path}.value`),
    label: localized(item.label, `${path}.label`),
  };
}

function patent(value: unknown, path: string): PatentItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    number: string(item.number, `${path}.number`),
    title: localized(item.title, `${path}.title`),
    status: localized(item.status, `${path}.status`),
    summary: localized(item.summary, `${path}.summary`),
    engineeringValue: localizedArray(
      item.engineeringValue,
      `${path}.engineeringValue`,
    ),
    sourceLabel: localized(item.sourceLabel, `${path}.sourceLabel`),
    sourceUrl: string(item.sourceUrl, `${path}.sourceUrl`),
    image: media(item.image, `${path}.image`),
  };
}

function skillGroup(value: unknown, path: string): SkillGroup {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    title: localized(item.title, `${path}.title`),
    items: localizedArray(item.items, `${path}.items`),
  };
}

function education(value: unknown, path: string): EducationItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    logo: media(item.logo, `${path}.logo`),
    period: localized(item.period, `${path}.period`),
    institution: localized(item.institution, `${path}.institution`),
    degree: localized(item.degree, `${path}.degree`),
  };
}

function industryContext(value: unknown, path: string): IndustryContextItem {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    title: localized(item.title, `${path}.title`),
    description: localized(item.description, `${path}.description`),
    image: media(item.image, `${path}.image`),
    sourceLabel: localized(item.sourceLabel, `${path}.sourceLabel`),
    sourceUrl: string(item.sourceUrl, `${path}.sourceUrl`),
  };
}

export function validateSiteContent(value: unknown): SiteContent {
  const root = record(value, 'content');
  const meta = record(root.meta, 'meta');
  const defaultLocale = meta.defaultLocale;
  if (defaultLocale !== 'zh' && defaultLocale !== 'en') {
    throw new Error('meta.defaultLocale must be "zh" or "en"');
  }

  const profile = record(root.profile, 'profile');
  const hero = record(root.hero, 'hero');
  const contact = record(root.contact, 'contact');
  const metrics = array(hero.metrics, 'hero.metrics', heroMetric);
  if (metrics.length !== 3) {
    throw new Error('hero.metrics must contain exactly 3 items');
  }

  return {
    meta: {
      updatedAt: string(meta.updatedAt, 'meta.updatedAt'),
      defaultLocale,
    },
    profile: {
      name: localized(profile.name, 'profile.name'),
      email: string(profile.email, 'profile.email'),
      role: localized(profile.role, 'profile.role'),
      portrait: media(profile.portrait, 'profile.portrait'),
      links: array(profile.links, 'profile.links', link),
    },
    hero: {
      intro: localized(hero.intro, 'hero.intro'),
      metrics,
    },
    experience: array(root.experience, 'experience', experience),
    projects: array(root.projects, 'projects', project),
    patents: array(root.patents, 'patents', patent),
    skillGroups: array(root.skillGroups, 'skillGroups', skillGroup),
    education: array(root.education, 'education', education),
    industryContext: array(
      root.industryContext,
      'industryContext',
      industryContext,
    ),
    contact: {
      heading: localized(contact.heading, 'contact.heading'),
      invitation: localized(contact.invitation, 'contact.invitation'),
    },
  };
}

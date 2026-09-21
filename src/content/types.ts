export type Locale = 'zh' | 'en';

export type LocalizedText = {
  zh: string;
  en: string;
};

export interface LinkItem {
  id: string;
  label: LocalizedText;
  href: string;
}

export interface MediaItem {
  id: string;
  src: string;
  alt: LocalizedText;
  credit: LocalizedText;
  sourceUrl: string;
  usageNote: LocalizedText;
}

export interface ExperienceItem {
  id: string;
  period: LocalizedText;
  role: LocalizedText;
  context: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
}

export interface ProjectItem {
  id: string;
  code: string;
  title: LocalizedText;
  summary: LocalizedText;
  contributions: LocalizedText[];
  capabilities: LocalizedText[];
}

export interface PatentItem {
  id: string;
  number: string;
  title: LocalizedText;
  status: LocalizedText;
  summary: LocalizedText;
  engineeringValue: LocalizedText[];
  sourceLabel: LocalizedText;
  sourceUrl: string;
  image: MediaItem;
}

export interface SkillGroup {
  id: string;
  title: LocalizedText;
  items: LocalizedText[];
}

export interface EducationItem {
  id: string;
  period: LocalizedText;
  institution: LocalizedText;
  degree: LocalizedText;
  summary: LocalizedText;
  coursework: LocalizedText[];
}

export interface IndustryContextItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  image: MediaItem;
  sourceLabel: LocalizedText;
  sourceUrl: string;
}

export interface SiteContent {
  meta: {
    updatedAt: string;
    defaultLocale: Locale;
  };
  profile: {
    name: LocalizedText;
    age: number;
    email: string;
    location: LocalizedText;
    role: LocalizedText;
    portrait: MediaItem;
    links: LinkItem[];
  };
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    summary: LocalizedText;
  };
  summary: {
    heading: LocalizedText;
    paragraphs: LocalizedText[];
  };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  patents: PatentItem[];
  skillGroups: SkillGroup[];
  education: EducationItem[];
  industryContext: IndustryContextItem[];
  contact: {
    heading: LocalizedText;
    invitation: LocalizedText;
  };
}

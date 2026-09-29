export const sectionIds = [
  'profile',
  'education',
  'experience',
  'work',
  'patent',
  'skills',
  'industry-context',
  'contact',
] as const;

export type SectionId = (typeof sectionIds)[number];

export function sectionFromHash(hash: string): SectionId {
  const id = hash.replace(/^#/, '');
  return sectionIds.includes(id as SectionId) ? (id as SectionId) : 'profile';
}

export const sectionIds = [
  'profile',
  'education',
  'experience',
  'patent',
  'skills',
  'industry-context',
  'contact',
] as const;

export type SectionId = (typeof sectionIds)[number];

export function sectionFromHash(hash: string): SectionId {
  const id = hash.replace(/^#/, '');
  if (id === 'work') return 'experience';
  return sectionIds.includes(id as SectionId) ? (id as SectionId) : 'profile';
}

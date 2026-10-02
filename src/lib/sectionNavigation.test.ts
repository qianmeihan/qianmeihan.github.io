import { describe, expect, it } from 'vitest';
import { sectionFromHash, sectionIds } from './sectionNavigation';

describe('section navigation', () => {
  it('defaults to overview for empty and unknown hashes', () => {
    expect(sectionFromHash('')).toBe('profile');
    expect(sectionFromHash('#missing')).toBe('profile');
  });

  it('recognizes every primary module hash', () => {
    for (const id of sectionIds) expect(sectionFromHash(`#${id}`)).toBe(id);
  });

  it('keeps old project links inside the work experience navigation state', () => {
    expect(sectionFromHash('#work')).toBe('experience');
  });
});

import { describe, expect, it } from 'vitest';
import siteContent from '../../public/content/site.json';

const serialized = JSON.stringify(siteContent);

describe('public content policy', () => {
  it('contains the approved career facts and one verified patent', () => {
    expect(serialized).toContain('BMW Brilliance');
    expect(serialized).toContain('宝马华晨');
    expect(serialized).toContain('Schaeffler');
    expect(serialized).toContain('舍弗勒');
    expect(serialized).toContain('CN223978857U');
    expect(serialized.match(/CN223978857U/g)?.length).toBeGreaterThan(0);
    expect(serialized).toContain('1287187051@qq.com');
    expect(siteContent.profile).not.toHaveProperty('age');
    expect(siteContent.profile).not.toHaveProperty('location');
    expect(siteContent.patents).toHaveLength(1);
  });

  it('excludes private and out-of-scope material', () => {
    expect(serialized).not.toMatch(/\b1[3-9]\d{9}\b/);
    expect(serialized).not.toMatch(
      /生产计划|库存优化|优化算法|production planning|inventory optimization/i,
    );
    expect(serialized).not.toMatch(/[—–]/);

    const currentExperience = siteContent.experience.find(
      (item) => item.id === 'bmw-brilliance-product-engineer',
    );
    expect(currentExperience).toBeDefined();
    expect(currentExperience).not.toHaveProperty('company');
    expect(currentExperience).not.toHaveProperty('employer');
    expect(currentExperience).not.toHaveProperty('organization');
  });

  it('keeps stable ids unique in every repeatable collection', () => {
    const collections = [
      siteContent.profile.links,
      siteContent.experience,
      siteContent.projects,
      siteContent.patents,
      siteContent.skillGroups,
      siteContent.education,
      siteContent.industryContext,
    ];

    for (const collection of collections) {
      const ids = collection.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    }
  });

  it('covers every approved engineering capability group', () => {
    expect(siteContent.skillGroups.map((group) => group.id)).toEqual([
      'structures',
      'methods-tools',
      'collaboration-languages',
    ]);
  });

  it('keeps the public portfolio focused on three strongest projects', () => {
    expect(siteContent.projects).toHaveLength(3);
    expect(siteContent.projects.map((project) => project.id)).toEqual([
      'd5-pdcu-platform',
      'd3-ecu-housing',
      'bms-csc-plastic-housings',
    ]);
  });

  it('uses one official product-domain reference without overstating ownership', () => {
    expect(siteContent.industryContext).toHaveLength(1);
    expect(siteContent.industryContext[0].image.src).toBe(
      '/media/schaeffler-pcb-embedded-power-module.jpg',
    );
    expect(siteContent.industryContext[0].description.zh).toContain('不代表');
    expect(siteContent.industryContext[0].description.en).toContain('does not imply');
  });
});

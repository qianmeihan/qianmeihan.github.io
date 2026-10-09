import { describe, expect, it } from 'vitest';
import siteContent from '../../public/content/site.json';

const serialized = JSON.stringify(siteContent);

describe('public content policy', () => {
  it('uses verified education dates and selected courses without private transcript data', () => {
    expect(siteContent.education[0].courses.map((course) => course.title.zh)).toContain('材料力学');
    expect(siteContent.education[1].period.zh).toBe('2021 至 2022');
    expect(siteContent.education[1].degree.zh).toBe('机械学学士（航空机械工程方向）');
    expect(siteContent.education[1].courses.map((course) => course.title.zh)).toContain('机械设计');
    expect(serialized).not.toMatch(/成绩单|学号|绩点|GPA|transcript|student number|grade point/i);
  });

  it('links each school to its official curriculum with traceable course photo licenses', () => {
    expect(siteContent.education.map((school) => school.courses.length)).toEqual([8, 8]);
    expect(siteContent.education[0].courses.slice(0, 4).map((course) => course.title.zh)).toEqual([
      '机械工程', '材料力学', '流体力学', '动力学',
    ]);
    expect(siteContent.education[1].courses.slice(0, 4).map((course) => course.title.zh)).toEqual([
      '机械设计', '连续介质力学', '机械学', '结构',
    ]);
    for (const school of siteContent.education) {
      expect(school.curriculumUrl).toMatch(/^https:\/\/(?:sfie\.neu\.edu\.cn|fsi\.utoulouse\.fr)\//);
      for (const course of school.courses) {
        expect(course).not.toHaveProperty('courseUrl');
        expect(course.image.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
        expect(course.image.usageNote.zh).toContain('非本人课程作品');
        if (!course.image.credit.en.includes('Public domain') && !course.image.credit.en.includes('CC0')) {
          expect(course.image.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\//);
        }
      }
    }
  });
  it('contains the approved career facts and two verified patents', () => {
    expect(serialized).toContain('BMW Brilliance');
    expect(serialized).toContain('宝马华晨');
    expect(serialized).toContain('Schaeffler');
    expect(serialized).toContain('舍弗勒');
    expect(serialized).toContain('CN223978857U');
    expect(serialized).toContain('CN222839946U');
    expect(serialized.match(/CN223978857U/g)?.length).toBeGreaterThan(0);
    expect(serialized).toContain('1287187051@qq.com');
    expect(siteContent.profile).not.toHaveProperty('age');
    expect(siteContent.profile).not.toHaveProperty('location');
    expect(siteContent.patents).toHaveLength(2);
    expect(siteContent.patents.map((patent) => patent.number)).toEqual([
      'CN222839946U',
      'CN223978857U',
    ]);
    expect(siteContent.patents.map((patent) => patent.title.zh)).toEqual([
      '用于BMS控制器壳体的卡扣结构和BMS控制器壳体',
      '电子装置',
    ]);
    expect(siteContent.patents[0].inventors.zh).toBe('发明人：钱美含');
    expect(siteContent.patents[1].inventors.zh).toBe('共同发明人：李雪、钱美含');
    expect(siteContent.patents.every((patent) => patent.ownership.zh.includes('原单位'))).toBe(true);
    expect(siteContent.patents.every((patent) => patent.summary.zh.length <= 28)).toBe(true);
    expect(siteContent.patents.every((patent) => patent.summary.en.length <= 90)).toBe(true);
    expect(siteContent.patents[0].summary.zh).toContain('卡扣');
    expect(siteContent.patents[1].summary.zh).toContain('爬电距离');
    expect(siteContent.hero.metrics.map((metric) => metric.id)).toEqual([
      'experience',
      'structures',
      'patent',
      'languages',
    ]);
    expect(siteContent.hero.metrics.map((metric) => metric.value.zh)).toEqual([
      '4年经验',
      '3种工艺',
      '2项专利',
      '3种语言',
    ]);
  });

  it('describes both positions with resume-supported scope in both languages', () => {
    const bmw = siteContent.experience.find((item) => item.id === 'bmw-brilliance-product-engineer');
    const schaeffler = siteContent.experience.find((item) => item.id === 'schaeffler-mechanical-rd');
    expect(bmw?.summary.zh).toContain('iRAM');
    expect(bmw?.summary.en).toContain('GAMS');
    expect(bmw?.highlights.length).toBeGreaterThanOrEqual(2);
    expect(schaeffler?.summary.zh).toContain('量产');
    expect(schaeffler?.summary.en).toContain('production');
    expect(schaeffler?.highlights.length).toBeGreaterThanOrEqual(3);
    expect(siteContent.experience.every((item) => !('featured' in item))).toBe(true);
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

  it('keeps five resume-backed projects under the Schaeffler experience', () => {
    expect(siteContent.projects).toHaveLength(5);
    expect(siteContent.projects.map((project) => project.id)).toEqual([
      'd5-pdcu-platform',
      'd3-ecu-housing',
      'd3-tcu-die-cast-housing',
      'bms-csc-plastic-housings',
      'bms-oem-technical-support',
    ]);
    expect(siteContent.projects.every((project) => project.experienceId === 'schaeffler-mechanical-rd')).toBe(true);
    expect(siteContent.projects.every((project) => project.details.length > 1 && project.details.every((detail) => detail.zh && detail.en))).toBe(true);
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

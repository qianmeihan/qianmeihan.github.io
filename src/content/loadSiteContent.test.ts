import { describe, expect, it, vi } from 'vitest';
import { loadSiteContent } from './loadSiteContent';
import { validateSiteContent } from './validateSiteContent';

const bilingual = (zh: string, en: string) => ({ zh, en });

const validContent = {
  meta: { updatedAt: '2026-09-21', defaultLocale: 'zh' },
  profile: {
    name: bilingual('钱美含', 'Meihan Qian'),
    age: 26,
    email: '1287187051@qq.com',
    location: bilingual('沈阳', 'Shenyang, China'),
    role: bilingual('机械研发工程师', 'Mechanical R&D Engineer'),
    portrait: {
      id: 'portrait',
      src: '/media/meihan-qian-headshot-optimized.jpg',
      alt: bilingual('钱美含职业照', 'Professional portrait of Meihan Qian'),
      credit: bilingual('本人提供', 'Provided by Meihan Qian'),
      sourceUrl: 'https://github.com/qianmeihan',
      usageNote: bilingual('本人授权用于个人作品集', 'Authorized for this personal portfolio'),
    },
    links: [
      {
        id: 'email',
        label: bilingual('邮箱', 'Email'),
        href: 'mailto:1287187051@qq.com',
      },
    ],
  },
  hero: {
    intro: bilingual('你好，我是钱美含。', "Hi, I'm Meihan Qian."),
    metrics: [
      { id: 'experience', value: bilingual('4 年', '4 years'), label: bilingual('汽车电子结构研发', 'Automotive electronics R&D') },
      { id: 'structures', value: bilingual('3 类', '3 types'), label: bilingual('冲压、压铸、注塑结构', 'Stamped, die-cast, and molded structures') },
      { id: 'patent', value: bilingual('1 项', '1 published'), label: bilingual('公开实用新型专利', 'Utility model patent') },
    ],
  },
  experience: [],
  projects: [],
  patents: [],
  skillGroups: [],
  education: [],
  industryContext: [],
  contact: {
    heading: bilingual('联系', 'Contact'),
    invitation: bilingual('欢迎联系。', 'Get in touch.'),
  },
};

describe('validateSiteContent', () => {
  it('accepts a complete bilingual content document', () => {
    expect(validateSiteContent(validContent)).toEqual(validContent);
  });

  it('rejects an unsupported default locale', () => {
    const input = structuredClone(validContent);
    input.meta.defaultLocale = 'fr';

    expect(() => validateSiteContent(input)).toThrow(
      'meta.defaultLocale must be "zh" or "en"',
    );
  });

  it('rejects a profile role missing English copy', () => {
    const input = structuredClone(validContent) as Record<string, any>;
    delete input.profile.role.en;

    expect(() => validateSiteContent(input)).toThrow(
      'profile.role.en must be a non-empty string',
    );
  });

  it('requires an English introduction', () => {
    const input = structuredClone(validContent) as Record<string, any>;
    delete input.hero.intro.en;

    expect(() => validateSiteContent(input)).toThrow(
      'hero.intro.en must be a non-empty string',
    );
  });

  it('requires exactly three recruiter proof metrics', () => {
    const input = structuredClone(validContent) as Record<string, any>;
    input.hero.metrics.pop();

    expect(() => validateSiteContent(input)).toThrow(
      'hero.metrics must contain exactly 3 items',
    );
  });

  it('requires a boolean featured flag for experience entries', () => {
    const input = structuredClone(validContent) as Record<string, any>;
    input.experience = [
      {
        id: 'example-experience',
        featured: 'yes',
        period: bilingual('2022 至今', '2022 to present'),
        role: bilingual('机械工程师', 'Mechanical Engineer'),
        context: bilingual('示例公司', 'Example company'),
        summary: bilingual('产品开发。', 'Product development.'),
        highlights: [bilingual('结构设计', 'Mechanical design')],
        logo: validContent.profile.portrait,
      },
    ];

    expect(() => validateSiteContent(input)).toThrow(
      'experience[0].featured must be a boolean',
    );
  });

  it('rejects repeated items without stable ids', () => {
    const input = structuredClone(validContent) as Record<string, any>;
    input.projects = [
      {
        title: bilingual('控制器壳体', 'Controller housing'),
        system: 'ECU',
        summary: bilingual('结构开发。', 'Structural development.'),
        contributions: [bilingual('设计支持。', 'Design support.')],
        capabilities: [bilingual('冲压', 'Stamping')],
      },
    ];

    expect(() => validateSiteContent(input)).toThrow(
      'projects[0].id must be a non-empty string',
    );
  });

  it.each([
    ['experience', 'experience[0].logo'],
    ['education', 'education[0].logo'],
  ])('requires traceable logo metadata for %s items', (collection, expectedPath) => {
    const input = structuredClone(validContent) as Record<string, any>;
    input[collection] = [
      collection === 'experience'
          ? {
            id: 'example-experience',
            featured: false,
            period: bilingual('2022 至今', '2022 to present'),
            role: bilingual('机械工程师', 'Mechanical Engineer'),
            context: bilingual('示例公司', 'Example company'),
            summary: bilingual('产品开发。', 'Product development.'),
            highlights: [bilingual('结构设计', 'Mechanical design')],
          }
        : {
            id: 'example-education',
            period: bilingual('2018 至 2022', '2018 to 2022'),
            institution: bilingual('示例大学', 'Example University'),
            degree: bilingual('工学学士', 'Bachelor of Engineering'),
          },
    ];

    expect(() => validateSiteContent(input)).toThrow(expectedPath);
  });
});

describe('loadSiteContent', () => {
  it('throws a readable error for a non-OK response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('', { status: 503, statusText: 'Service Unavailable' }),
    );

    await expect(loadSiteContent(fetcher)).rejects.toThrow(
      'Unable to load portfolio content (503)',
    );
  });

  it('loads /content/site.json and validates it', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(validContent), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(loadSiteContent(fetcher)).resolves.toEqual(validContent);
    expect(fetcher).toHaveBeenCalledWith('/content/site.json', {
      headers: { Accept: 'application/json' },
    });
  });
});

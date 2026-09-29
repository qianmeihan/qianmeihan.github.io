import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EducationSection } from './EducationSection';
import { EngineeringSection } from './EngineeringSection';
import { ExperienceSection } from './ExperienceSection';
import { IndustryContextSection } from './IndustryContextSection';
import { PatentSection } from './PatentSection';
import { SkillsSection } from './SkillsSection';

describe('optional portfolio sections', () => {
  it.each([
    ['experience', <ExperienceSection key="experience" items={[]} locale="zh" />],
    ['engineering', <EngineeringSection key="engineering" items={[]} locale="zh" />],
    ['patents', <PatentSection key="patents" items={[]} locale="zh" />],
    ['skills', <SkillsSection key="skills" groups={[]} locale="zh" />],
    ['education', <EducationSection key="education" items={[]} locale="zh" />],
    [
      'industry context',
      <IndustryContextSection key="industry" items={[]} locale="zh" />,
    ],
  ])('does not render an empty %s block', (_name, element) => {
    const { container } = render(element);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [
      'experience',
      <ExperienceSection
        key="experience-logo"
        locale="zh"
        items={[
          {
            id: 'schaeffler',
            featured: true,
            period: { zh: '2022 至 2026', en: '2022 to 2026' },
            role: { zh: '研发机械工程师', en: 'R&D Mechanical Engineer' },
            context: { zh: '舍弗勒', en: 'Schaeffler' },
            summary: { zh: '结构开发。', en: 'Mechanical development.' },
            highlights: [{ zh: '结构设计', en: 'Mechanical design' }],
            logo: {
              id: 'schaeffler-logo',
              src: '/media/logo-schaeffler.png',
              alt: { zh: '舍弗勒标志', en: 'Schaeffler logo' },
              credit: { zh: '舍弗勒', en: 'Schaeffler' },
              sourceUrl: 'https://www.schaeffler.com/',
              usageNote: { zh: '用于标识经历', en: 'Used to identify the experience' },
            },
          },
        ]}
      />,
      '.timeline-item__logo',
    ],
    [
      'education',
      <EducationSection
        key="education-logo"
        locale="zh"
        items={[
          {
            id: 'neu',
            period: { zh: '2018 至 2022', en: '2018 to 2022' },
            institution: { zh: '东北大学', en: 'Northeastern University' },
            degree: { zh: '工学学士', en: 'Bachelor of Engineering' },
            courses: [{ zh: '材料力学', en: 'Mechanics of Materials' }],
            logo: {
              id: 'neu-logo',
              src: '/media/logo-northeastern-university.png',
              alt: { zh: '东北大学校徽', en: 'Northeastern University logo' },
              credit: { zh: '东北大学', en: 'Northeastern University' },
              sourceUrl: 'https://www.neu.edu.cn/',
              usageNote: { zh: '用于标识教育经历', en: 'Used to identify the education entry' },
            },
          },
        ]}
      />,
      '.education-card__logo',
    ],
  ])('renders a decorative official logo for an %s item', (_name, element, selector) => {
    const { container } = render(element);
    const logo = container.querySelector(selector);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', '');
  });

  it('shows selected coursework in both languages', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const { rerender } = render(<EducationSection items={content.education} locale="zh" />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('材料力学')).toBeInTheDocument();
    expect(screen.getByText('连续介质力学')).toBeInTheDocument();
    rerender(<EducationSection items={content.education} locale="en" />);
    expect(screen.getByText('Mechanics of Materials')).toBeInTheDocument();
    expect(screen.getByText('Continuum Mechanics')).toBeInTheDocument();
  });

  it('visually marks the core R&D experience', () => {
    const item = {
      id: 'schaeffler',
      featured: true,
      period: { zh: '2022 至 2026', en: '2022 to 2026' },
      role: { zh: '研发机械工程师', en: 'R&D Mechanical Engineer' },
      context: { zh: '舍弗勒', en: 'Schaeffler' },
      summary: { zh: '结构开发。', en: 'Mechanical development.' },
      highlights: [{ zh: '结构设计', en: 'Mechanical design' }],
      logo: {
        id: 'schaeffler-logo',
        src: '/media/logo-schaeffler.png',
        alt: { zh: '舍弗勒标志', en: 'Schaeffler logo' },
        credit: { zh: '舍弗勒', en: 'Schaeffler' },
        sourceUrl: 'https://www.schaeffler.com/',
        usageNote: { zh: '用于标识经历', en: 'Used to identify the experience' },
      },
    };

    const { container } = render(
      <ExperienceSection items={[item]} locale="zh" />,
    );

    expect(container.querySelector('.timeline-item--featured')).toBeInTheDocument();
    expect(screen.getByText('核心研发经历')).toBeInTheDocument();
  });

  it('keeps the complete portrait patent drawing ratio', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);

    render(<PatentSection items={content.patents} locale="zh" />);

    const drawing = screen.getByRole('img', {
      name: 'CN223978857U 公开专利结构图',
    });
    expect(drawing).toHaveAttribute('width', '729');
    expect(drawing).toHaveAttribute('height', '1000');
  });

  it('shows both employer-owned published patents with inventor credit', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const { container } = render(<PatentSection items={content.patents} locale="zh" />);

    expect(container.querySelectorAll('.patent-card')).toHaveLength(2);
    expect(screen.getByText('发明人：钱美含')).toBeInTheDocument();
    expect(screen.getByText('共同发明人：李雪、钱美含')).toBeInTheDocument();
    expect(screen.getAllByText('职务发明，专利权归原单位')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: '查看公开专利记录' })).toHaveLength(2);
  });
});

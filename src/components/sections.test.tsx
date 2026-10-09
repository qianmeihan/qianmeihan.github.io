import { render, screen, within } from '@testing-library/react';
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
            curriculumUrl: 'https://sfie.neu.edu.cn/pyfa/list.htm',
            courses: [{
              id: 'materials-mechanics',
              title: { zh: '材料力学', en: 'Mechanics of Materials' },
              summary: { zh: '结构强度分析。', en: 'Structural strength analysis.' },
              image: {
                id: 'materials-mechanics-photo',
                src: '/media/edu-materials-mechanics.jpg',
                alt: { zh: '材料拉伸试验设备', en: 'Materials tensile testing equipment' },
                credit: { zh: '图源：公开授权摄影', en: 'Photo: openly licensed source' },
                sourceUrl: 'https://commons.wikimedia.org/',
                usageNote: { zh: '课程示意图', en: 'Course illustration' },
              },
            }],
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
    expect(screen.getAllByRole('article')).toHaveLength(18);
    expect(screen.getByText('材料力学')).toBeInTheDocument();
    expect(screen.getByText('连续介质力学')).toBeInTheDocument();
    const schools = screen.getAllByRole('article').filter((article) => article.classList.contains('education-card'));
    expect(schools).toHaveLength(2);
    expect(within(schools[0]).getByRole('link', { name: /学校课程设置/ })).toHaveAttribute('href', 'https://sfie.neu.edu.cn/pyfa/list.htm');
    expect(within(schools[1]).getByRole('link', { name: /学校课程设置/ })).toHaveAttribute('href', 'https://fsi.utoulouse.fr/licence-parcours-genie-mecanique-en-aeronautique-gma');
    expect(screen.getAllByRole('link', { name: /学校课程设置/ })).toHaveLength(2);
    for (const card of document.querySelectorAll('.course-card')) {
      expect(within(card as HTMLElement).queryByRole('link')).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/不是本人上课现场或课程作品/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /课程示意/ })).toHaveLength(16);
    rerender(<EducationSection items={content.education} locale="en" />);
    expect(screen.getByText('Mechanics of Materials')).toBeInTheDocument();
    expect(screen.getByText('Continuum Mechanics')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /University curriculum/ })).toHaveLength(2);
    expect(screen.queryByText(/Course images are openly licensed/)).not.toBeInTheDocument();
  });

  it('renders the education introduction as one naturally wrapping paragraph', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const { container, rerender } = render(<EducationSection items={content.education} locale="zh" />);

    const lead = container.querySelector('.education-section__lead');
    expect(lead).toHaveTextContent('材料科学与机械学背景，课程涵盖结构设计、材料性能与制造工艺。这些课程为兼顾结构性能与制造可行性的产品设计奠定基础。');
    expect(lead).not.toHaveTextContent('我');
    expect(lead?.children).toHaveLength(0);

    rerender(<EducationSection items={content.education} locale="en" />);
    expect(container.querySelector('.education-section__lead')?.children).toHaveLength(0);
  });

  it('shows a licensed numerical simulation for scientific computing', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const { container } = render(<EducationSection items={content.education} locale="zh" />);

    const course = [...container.querySelectorAll('.course-card')].find((card) => card.textContent?.includes('科学计算'));
    expect(course).toBeDefined();
    expect(within(course as HTMLElement).getByRole('img')).toHaveAttribute('src', '/media/edu-scientific-computing-cfd.jpg');
    expect(within(course as HTMLElement).getByRole('img')).toHaveAccessibleName('课程示意：催化转化器内部流速数值模拟');
    const media = content.education.flatMap((school) => school.courses).find((item) => item.id === 'scientific-computing')?.image;
    expect(media?.sourceUrl).toBe('https://commons.wikimedia.org/wiki/File:Catalytic-converter-simulation-velocity-streamlines.jpg');
    expect(media?.credit.zh).toContain('Atif Masood');
  });

  it('renders work history without a special visual label', () => {
    const item = {
      id: 'schaeffler',
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

    expect(container.querySelector('.timeline-item')).toBeInTheDocument();
    expect(container.querySelector('.timeline-item--featured')).not.toBeInTheDocument();
    expect(screen.queryByText('核心研发经历')).not.toBeInTheDocument();
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

  it('links each patent drawing to its full-size local image', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);

    render(<PatentSection items={content.patents} locale="zh" />);

    for (const patent of content.patents) {
      const drawingLink = screen.getByRole('link', { name: `查看 ${patent.number} 附图原图` });
      expect(drawingLink).toHaveAttribute('href', patent.image.src);
      expect(drawingLink).toHaveAttribute('target', '_blank');
      expect(drawingLink).toContainElement(screen.getByRole('img', { name: patent.image.alt.zh }));
    }
  });

  it('frames Chinese patent names with book-title marks but leaves English names unquoted', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);

    const { rerender } = render(<PatentSection items={content.patents} locale="zh" />);
    expect(screen.getByRole('heading', { name: '《用于BMS控制器壳体的卡扣结构和BMS控制器壳体》' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '《电子装置》' })).toBeInTheDocument();

    rerender(<PatentSection items={content.patents} locale="en" />);
    expect(screen.getByRole('heading', { name: 'Electronic Device' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '《电子装置》' })).not.toBeInTheDocument();
  });

  it('does not duplicate book-title marks entered through the editor', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const items = structuredClone(content.patents);
    items[0].title.zh = '《已编辑的专利名称》';

    render(<PatentSection items={items} locale="zh" />);

    expect(screen.getByRole('heading', { name: '《已编辑的专利名称》' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '《《已编辑的专利名称》》' })).not.toBeInTheDocument();
  });

  it('shows two concise patent cards with one shared ownership note', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const { container } = render(<PatentSection items={content.patents} locale="zh" />);

    expect(container.querySelectorAll('.patent-card')).toHaveLength(2);
    expect(screen.getByText('发明人：钱美含')).toBeInTheDocument();
    expect(screen.getByText('共同发明人：李雪、钱美含')).toBeInTheDocument();
    expect(screen.getAllByText('职务发明，专利权归原单位')).toHaveLength(1);
    expect(container.querySelector('.patent-section__ownership')).toHaveTextContent('职务发明，专利权归原单位');
    for (const card of container.querySelectorAll('.patent-card')) {
      expect(card.querySelector('.patent-card__status')).not.toBeInTheDocument();
      expect(card.querySelector('ul')).not.toBeInTheDocument();
      expect(card.querySelector('figcaption')).not.toBeInTheDocument();
      expect(card.querySelector('.patent-card__ownership')).not.toBeInTheDocument();
    }
    expect(screen.getAllByRole('link', { name: '查看公开专利记录' })).toHaveLength(2);
  });

  it('keeps ownership attributed to each patent when the notes differ', async () => {
    const { validateSiteContent } = await import('../content/validateSiteContent');
    const { default: rawContent } = await import('../../public/content/site.json');
    const content = validateSiteContent(rawContent);
    const items = structuredClone(content.patents);
    items[1].ownership = { zh: '另一权属说明', en: 'Different ownership note' };
    const { container } = render(<PatentSection items={items} locale="zh" />);

    expect(container.querySelector('.patent-section__ownership')).not.toBeInTheDocument();
    const cards = container.querySelectorAll('.patent-card');
    expect(within(cards[0] as HTMLElement).getByText('职务发明，专利权归原单位')).toBeInTheDocument();
    expect(within(cards[1] as HTMLElement).getByText('另一权属说明')).toBeInTheDocument();
  });
});

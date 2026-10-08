import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import siteContentJson from '../public/content/site.json';
import App from './App';
import { validateSiteContent } from './content/validateSiteContent';

const siteContent = validateSiteContent(siteContentJson);

function stubColorScheme(prefersDark = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' && prefersDark,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.localStorage.clear();
    stubColorScheme();
    vi.stubGlobal('scrollTo', vi.fn());
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['zh-CN']);
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('zh-CN');
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('style');
  });

  it('renders the loading state while content is being fetched', () => {
    const contentLoader = () => new Promise<typeof siteContent>(() => undefined);

    render(<App contentLoader={contentLoader} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading portfolio');
  });

  it('renders validated profile content after loading', async () => {
    render(<App contentLoader={async () => siteContent} />);

    expect(await screen.findByRole('heading', { name: '钱美含' })).toBeInTheDocument();
    expect(screen.getAllByText('机械/产品工程师')).toHaveLength(2);
    expect(screen.queryByText('机械设计与产品开发')).not.toBeInTheDocument();
    expect(screen.getByText(/你好，我是钱美含。热衷于把机械结构设计转化为可靠、可制造的产品/)).toBeInTheDocument();
    expect(document.querySelector('.hero-meta')).not.toBeInTheDocument();
    expect(document.querySelector('.hero-section')).not.toHaveTextContent('法语 B2');
    expect(screen.getByRole('link', { name: '了解更多' })).toHaveAttribute('href', '#education');
    expect(screen.getByRole('link', { name: '联系我' })).toHaveAttribute('href', '#contact');
  });

  it('keeps every module in one continuous page while following hash changes', async () => {
    window.history.replaceState(null, '', '/#education');
    const { container } = render(<App contentLoader={async () => siteContent} />);
    expect(await screen.findByRole('heading', { name: '教育经历' })).toBeInTheDocument();
    expect(container.querySelector('#education')).toBeInTheDocument();
    expect(container.querySelector('#profile')).toBeInTheDocument();
    expect(container.querySelector('#experience')).toBeInTheDocument();
    expect(container.querySelector('#contact')).toBeInTheDocument();

    act(() => {
      window.history.pushState(null, '', '/#patent');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(container.querySelector('#patent')).toBeInTheDocument();
    expect(container.querySelector('#education')).toBeInTheDocument();
    expect(container.querySelector('.site-nav a[aria-current="location"]')).toHaveAttribute('href', '#patent');

    act(() => {
      window.history.pushState(null, '', '/#profile');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(container.querySelector('.hero-section')).toBeInTheDocument();
    expect(container.querySelector('#patent')).toBeInTheDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('moves each course image attribution to a small footer list', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    const credits = await screen.findByRole('region', { name: '课程图片来源与许可' });
    expect(within(credits).getAllByRole('listitem')).toHaveLength(16);
    expect(within(credits).getAllByRole('link', { name: '许可协议' })).toHaveLength(12);
    expect(within(credits).getByText('材料力学')).toBeInTheDocument();
    expect(within(credits).getByRole('link', { name: 'Sigmund / CC BY-SA 3.0' })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Cast_iron_tensile_test.JPG',
    );
    expect(credits).toHaveTextContent('缩放');
    expect(within(container.querySelector('#education') as HTMLElement).queryByRole('link', { name: '许可协议' })).not.toBeInTheDocument();
  });

  it('keeps the selected module when skipping to main content', async () => {
    window.history.replaceState(null, '', '/#education');
    const user = userEvent.setup();
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '教育经历' });
    await user.click(screen.getByRole('link', { name: '跳到主要内容' }));
    expect(window.location.hash).toBe('#education');
    expect(container.querySelector('#education')).toBeInTheDocument();
    expect(document.activeElement).toBe(container.querySelector('#main-content'));
  });

  it('groups the six hero actions without an email button and keeps email in contact', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    const actions = container.querySelector('.hero-actions');
    expect(actions).not.toBeNull();
    const expectedOrder = [
      '/downloads/meihan-qian-resume.pdf',
      '/downloads/meihan-qian-resume-en.pdf',
      'https://www.linkedin.com/in/qianmeihan/',
      'https://github.com/qianmeihan',
      '#contact',
      '#education',
    ];
    expect(within(actions as HTMLElement).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(expectedOrder);
    expect(within(actions as HTMLElement).getByRole('link', { name: '联系我' })).toHaveClass('text-link');
    expect(within(actions as HTMLElement).getByRole('link', { name: '了解更多' })).toHaveClass('text-link');
    expect(within(actions as HTMLElement).queryByRole('link', { name: '邮箱' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'EN' }));
    expect(within(actions as HTMLElement).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(expectedOrder);
    await userEvent.setup().click(screen.getByRole('link', { name: 'Contact' }));
    expect(within(container.querySelector('#contact') as HTMLElement).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:1287187051@qq.com');
  });

  it('puts four recruiter proof points before the detailed sections', async () => {
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    const evidence = screen.getByRole('region', { name: '核心经验' });
    expect(evidence).toHaveTextContent('4年经验');
    expect(evidence).toHaveTextContent('3种工艺');
    expect(evidence).toHaveTextContent('2项专利');
    expect(evidence).toHaveTextContent('3种语言');
  });

  it('places five selected projects inside the Schaeffler experience', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });
    const experience = container.querySelector<HTMLElement>('#experience');
    const projects = container.querySelector<HTMLElement>('#work');
    const schaeffler = [...container.querySelectorAll<HTMLElement>('.timeline-item')].find((item) => item.textContent?.includes('舍弗勒'));
    const bmw = [...container.querySelectorAll<HTMLElement>('.timeline-item')].find((item) => item.textContent?.includes('宝马华晨项目'));
    expect(experience).toContainElement(projects);
    expect(schaeffler).toContainElement(projects);
    expect(bmw?.querySelector('.project-card')).toBeNull();
    expect(within(projects as HTMLElement).getByRole('heading', { name: '代表项目', level: 4 })).toBeInTheDocument();
    expect(within(projects as HTMLElement).getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('navigation', { name: '主导航' }).querySelector('a[href="#work"]')).not.toBeInTheDocument();
  });

  it('shows project cards without capability chips in either language', async () => {
    const user = userEvent.setup();
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    for (const title of ['D5 PDCU 平台适配', 'D5 PDCU Platform Adaptation']) {
      const cards = [...container.querySelectorAll<HTMLElement>('#work .project-card')];
      expect(cards).toHaveLength(5);
      for (const card of cards) {
        expect(within(card).getByRole('button')).toBeInTheDocument();
        expect(card.querySelector('.project-card__body > p')).toBeInTheDocument();
        expect(card.querySelector('.tag-list')).not.toBeInTheDocument();
      }
      expect(within(cards[0]).getByRole('button')).toHaveTextContent(title);
      if (title.startsWith('D5 PDCU 平台')) {
        await user.click(screen.getByRole('button', { name: 'EN' }));
      }
    }
  });

  it('uses the same identity, date, and description structure for both work entries', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });
    const entries = [...container.querySelectorAll<HTMLElement>('#experience .timeline-item')];
    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      const header = entry.querySelector<HTMLElement>('.timeline-item__header');
      expect(header).not.toBeNull();
      expect(header?.querySelector('.timeline-item__logo-frame img')).toBeInTheDocument();
      expect(header?.querySelector('time')).toBeInTheDocument();
      expect(header?.querySelector('.timeline-item__context')).toBeInTheDocument();
      expect(header?.querySelector('h3')).toBeInTheDocument();
      expect(entry.querySelector('.timeline-item__body > p')).toBeInTheDocument();
      expect(entry.querySelectorAll('.timeline-item__body li').length).toBeGreaterThanOrEqual(2);
      expect(entry.querySelector('.timeline-item__featured-label')).toBeNull();
    }
  });

  it('offers separate Chinese and English resume downloads in both languages', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    for (const labels of [
      ['中文简历', '英文简历'],
      ['Chinese résumé', 'English résumé'],
    ]) {
      for (const [label, href, filename] of [
        [labels[0], '/downloads/meihan-qian-resume.pdf', 'Meihan-Qian-Resume-ZH.pdf'],
        [labels[1], '/downloads/meihan-qian-resume-en.pdf', 'Meihan-Qian-Resume-EN.pdf'],
      ]) {
        const links = screen.getAllByRole('link', { name: label });
        expect(links).toHaveLength(2);
        for (const link of links) {
          expect(link).toHaveAttribute('href', href);
          expect(link).toHaveAttribute('download', filename);
        }
      }
      if (labels[0] === '中文简历') await user.click(screen.getByRole('button', { name: 'EN' }));
    }
  });

  it('shows each original resume date on its own download link without changing the link label', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    for (const [label, date] of [
      ['中文简历', '2026.08.25'],
      ['英文简历', '2026.04.17'],
    ]) {
      for (const link of screen.getAllByRole('link', { name: label })) {
        expect(link).toHaveAttribute('data-updated-at', `更新于 ${date}`);
        expect(link).toHaveAttribute('aria-description', `更新于 ${date}`);
        expect(link).not.toHaveAttribute('title');
      }
    }

    await user.click(screen.getByRole('button', { name: 'EN' }));
    for (const [label, date] of [
      ['Chinese résumé', '2026.08.25'],
      ['English résumé', '2026.04.17'],
    ]) {
      for (const link of screen.getAllByRole('link', { name: label })) {
        expect(link).toHaveAttribute('data-updated-at', `Updated ${date}`);
      }
    }
  });

  it('omits the redundant profile summary and decorative section numbers', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(container.querySelector('.summary-section')).not.toBeInTheDocument();
    expect(container.querySelector('.section-heading__number')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.site-nav a svg')).toHaveLength(7);
  });

  it('shows a bilingual error and retries without exposing the exception', async () => {
    const user = userEvent.setup();
    const contentLoader = vi
      .fn<() => Promise<typeof siteContent>>()
      .mockRejectedValueOnce(new Error('private stack details'))
      .mockResolvedValueOnce(siteContent);

    render(<App contentLoader={contentLoader} />);

    expect(await screen.findByText('作品集内容暂时无法加载。')).toBeInTheDocument();
    expect(
      screen.getByText('Portfolio content could not be loaded.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/private stack details/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '重试 / Retry' }));

    expect(await screen.findByRole('heading', { name: '钱美含' })).toBeInTheDocument();
    expect(contentLoader).toHaveBeenCalledTimes(2);
  });

  it('switches to English without reloading content and persists the locale', async () => {
    const user = userEvent.setup();
    const contentLoader = vi.fn().mockResolvedValue(siteContent);
    render(<App contentLoader={contentLoader} />);
    await screen.findByRole('heading', { name: '钱美含' });

    await user.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('heading', { name: 'Meihan Qian' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Core experience' })).toHaveTextContent(
      '4 years',
    );
    expect(screen.getByRole('region', { name: 'Core experience' })).not.toHaveTextContent(
      '4年经验',
    );
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(window.localStorage.getItem('qian-portfolio-locale')).toBe('en');
    expect(contentLoader).toHaveBeenCalledTimes(1);
  });

  it('shows both engineering role titles in Chinese and English', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(screen.getAllByText('机械/产品工程师')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getAllByText('Mechanical / Product Engineer')).toHaveLength(2);
    expect(screen.getByText(/Hi, I'm Meihan Qian\. I enjoy turning mechanical designs/)).toBeInTheDocument();
  });

  it('switches to dark mode and persists the theme preference', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    await user.click(screen.getByRole('button', { name: '暗色' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('qian-portfolio-theme')).toBe('dark');
  });

  it('renders one accessible portfolio shell with unique section ids', async () => {
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(screen.getByRole('link', { name: '跳到主要内容' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    const navigation = screen.getByRole('navigation', { name: '主导航' });
    for (const target of [
      'profile',
      'education',
      'experience',
      'patent',
      'skills',
      'industry-context',
      'contact',
    ]) {
      expect(navigation.querySelector(`a[href="#${target}"]`)).not.toBeNull();
    }
    expect(document.querySelector('#profile')).toBeInTheDocument();
    expect(document.querySelector('#education')).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);

    const ids = Array.from(document.querySelectorAll<HTMLElement>('[id]')).map(
      (element) => element.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks the selected navigation section and uses the requested section labels', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    const navigation = screen.getByRole('navigation', { name: '主导航' });
    expect(navigation.querySelector('a[aria-current="location"]')).toHaveAttribute(
      'href',
      '#profile',
    );
    await user.click(screen.getByRole('link', { name: '工作经历' }));

    expect(navigation.querySelector('a[aria-current="location"]')).toHaveAttribute(
      'href',
      '#experience',
    );
    expect(screen.getByRole('link', { name: '教育经历' })).toHaveAttribute(
      'href',
      '#education',
    );
    expect(within(navigation).queryByRole('link', { name: '代表项目' })).not.toBeInTheDocument();
  });
});

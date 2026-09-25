import { render, screen } from '@testing-library/react';
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
    window.localStorage.clear();
    stubColorScheme();
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['zh-CN']);
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('zh-CN');
  });

  afterEach(() => {
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
    expect(screen.getAllByText('机械工程师 / 产品工程师')).toHaveLength(2);
    expect(screen.getByText('机械设计与产品开发')).toBeInTheDocument();
    const facts = document.querySelector('.hero-facts');
    expect(facts).toHaveTextContent('年龄');
    expect(facts).toHaveTextContent('所在地');
    expect(facts).toHaveTextContent('语言');
    expect(facts).toHaveTextContent('中文 / 英语 / 法语 B2');
    expect(screen.getByRole('link', { name: /查看代表项目/ })).toHaveAttribute('href', '#work');
  });

  it('puts three recruiter proof points before the detailed sections', async () => {
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    const evidence = screen.getByRole('region', { name: '核心经验' });
    expect(evidence).toHaveTextContent('4 年');
    expect(evidence).toHaveTextContent('3 类');
    expect(evidence).toHaveTextContent('1 项');
  });

  it('shows only three selected engineering projects', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(container.querySelectorAll('.project-card')).toHaveLength(3);
  });

  it('offers the same downloadable Chinese resume in the hero and contact area in both languages', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    for (const label of ['下载中文简历 · PDF', 'Download résumé · Chinese PDF']) {
      const links = screen.getAllByRole('link', { name: label });
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link).toHaveAttribute('href', '/downloads/meihan-qian-resume.pdf');
        expect(link).toHaveAttribute('download', 'Meihan-Qian-Resume.pdf');
      }
      if (label.startsWith('下载')) await user.click(screen.getByRole('button', { name: 'EN' }));
    }
  });

  it('omits the redundant profile summary and decorative section numbers', async () => {
    const { container } = render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(container.querySelector('.summary-section')).not.toBeInTheDocument();
    expect(container.querySelector('.section-heading__number')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.site-nav a svg')).toHaveLength(8);
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
      '4 年',
    );
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(window.localStorage.getItem('qian-portfolio-locale')).toBe('en');
    expect(contentLoader).toHaveBeenCalledTimes(1);
  });

  it('shows both engineering role titles in Chinese and English', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    expect(screen.getAllByText('机械工程师 / 产品工程师')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByText('Mechanical Engineer / Product Engineer')).toBeInTheDocument();
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
      'work',
      'patent',
      'skills',
      'industry-context',
      'contact',
    ]) {
      expect(navigation.querySelector(`a[href="#${target}"]`)).not.toBeNull();
    }
    expect(
      document.querySelector('#education')!.compareDocumentPosition(document.querySelector('#experience')!),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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
    expect(screen.getByRole('link', { name: '代表项目' })).toHaveAttribute(
      'href',
      '#work',
    );
  });
});

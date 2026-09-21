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

    expect(await screen.findByText('钱美含')).toBeInTheDocument();
    expect(screen.getByText('机械研发工程师 / 结构设计')).toBeInTheDocument();
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

    expect(await screen.findByText('钱美含')).toBeInTheDocument();
    expect(contentLoader).toHaveBeenCalledTimes(2);
  });

  it('switches to English without reloading content and persists the locale', async () => {
    const user = userEvent.setup();
    const contentLoader = vi.fn().mockResolvedValue(siteContent);
    render(<App contentLoader={contentLoader} />);
    await screen.findByRole('heading', { name: '钱美含' });

    await user.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByRole('heading', { name: 'Meihan Qian' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(window.localStorage.getItem('qian-portfolio-locale')).toBe('en');
    expect(contentLoader).toHaveBeenCalledTimes(1);
  });

  it('switches to dark mode and persists the theme preference', async () => {
    const user = userEvent.setup();
    render(<App contentLoader={async () => siteContent} />);
    await screen.findByRole('heading', { name: '钱美含' });

    await user.click(screen.getByRole('button', { name: '暗色' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('qian-portfolio-theme')).toBe('dark');
  });
});

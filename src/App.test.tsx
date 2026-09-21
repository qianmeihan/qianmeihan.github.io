import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import siteContentJson from '../public/content/site.json';
import App from './App';
import { validateSiteContent } from './content/validateSiteContent';

const siteContent = validateSiteContent(siteContentJson);

describe('App', () => {
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
});

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('shows core recruiter information in Chinese', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('钱美含');
  await expect(page.getByText('机械研发工程师 / 结构设计')).toBeVisible();
  await expect(page.getByText('宝马华晨项目')).toBeVisible();
  await expect(page.getByText('舍弗勒', { exact: true })).toBeVisible();
  await expect(page.getByText('CN223978857U', { exact: true })).toBeVisible();
  await expect(page.getByText('1287187051@qq.com', { exact: true }).first()).toBeVisible();
});

test('switches to English without a reload and persists the choice', async ({ page }) => {
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meihan Qian');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('qian-portfolio-locale'))).toBe('en');

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meihan Qian');
});

test('applies dark and system themes', async ({ page }) => {
  await page.getByRole('button', { name: '暗色' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: '跟随系统' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('navigates to experience, patent, and contact sections', async ({ page }) => {
  for (const [name, hash] of [
    ['经历', '#experience'],
    ['专利', '#patent'],
    ['联系', '#contact'],
  ] as const) {
    await page.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.locator(hash)).toBeVisible();
  }
});

test('opens safe external links with noopener and noreferrer', async ({ page }) => {
  const externalLinks = page.locator('a[target="_blank"]');
  expect(await externalLinks.count()).toBeGreaterThan(0);

  for (let index = 0; index < (await externalLinks.count()); index += 1) {
    await expect(externalLinks.nth(index)).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(externalLinks.nth(index)).toHaveAttribute('rel', /\bnoreferrer\b/);
  }
});

for (const viewport of [
  { width: 360, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`contains no horizontal overflow at ${viewport.width} by ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(metrics.page).toBeLessThanOrEqual(metrics.viewport);
  });
}

test('renders the Sveltia editor shell at /admin/', async ({ page }) => {
  await page.route('https://unpkg.com/**', (route) => route.abort());
  await page.goto('/admin/');
  await expect(page).toHaveTitle('钱美含作品集编辑器 · Portfolio Editor');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('script[src*="@sveltia/cms"]')).toHaveCount(1);
});

test('supports keyboard navigation through all header controls', async ({ page }) => {
  const expected = ['钱美含', '概述', '经历', '工程工作', '专利', '能力', '联系', '中文', 'EN', '亮色', '暗色', '跟随系统'];
  const visited: string[] = [];

  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.getAttribute('aria-label') || active?.innerText?.trim() || '';
    });
    if (label) visited.push(label.replace(/\s+/g, ' '));
  }

  for (const label of expected) {
    expect(visited.some((value) => value.includes(label)), `keyboard focus reaches ${label}`).toBe(true);
  }
});

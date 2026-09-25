import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('shows core recruiter information in Chinese', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('钱美含');
  await expect(page.getByText('机械研发工程师', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '核心经验' })).toContainText('4 年');
  await expect(page.getByText('宝马华晨项目', { exact: true })).toBeVisible();
  await expect(page.getByText('舍弗勒', { exact: true })).toBeVisible();
  await expect(page.getByText('CN223978857U', { exact: true })).toBeVisible();
  await expect(page.getByText('1287187051@qq.com', { exact: true }).first()).toBeVisible();
});

test('prioritizes three selected projects and the complete patent drawing', async ({ page }) => {
  await expect(page.locator('.project-card')).toHaveCount(3);
  await expect(page.locator('.timeline-item--featured')).toContainText('核心研发经历');
  await expect(page.locator('.patent-card__figure img')).toHaveAttribute('width', '729');
  await expect(page.locator('.patent-card__figure img')).toHaveAttribute('height', '1000');
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
  await expect.poll(() => page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-paper').trim(),
  )).toBe('#0b0f0c');
  await expect.poll(() => page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-accent').trim(),
  )).toBe('#2f7042');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: '跟随系统' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('navigates to the selected sections and keeps the current section highlighted', async ({ page }) => {
  for (const [name, hash] of [
    ['教育经历', '#education'],
    ['工作经历', '#experience'],
    ['代表项目', '#work'],
    ['专利', '#patent'],
    ['联系', '#contact'],
  ] as const) {
    await page.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.locator(hash)).toBeVisible();
    await expect(page.locator('.site-nav a[aria-current="location"]')).toHaveAttribute('href', hash);
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

test('loads every portfolio image when it enters the viewport', async ({ page }) => {
  const images = page.locator('main img');
  expect(await images.count()).toBeGreaterThan(0);

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test('has no automatically detectable WCAG A or AA violations', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
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

test('fits the complete navigation inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const layout = await page.locator('.site-nav').evaluate((navigation) => {
    const links = Array.from(navigation.querySelectorAll('a'));
    return {
      clientWidth: navigation.clientWidth,
      scrollWidth: navigation.scrollWidth,
      links: links.map((link) => {
        const bounds = link.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      }),
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  for (const bounds of layout.links) {
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(390);
  }
});

test('stacks education cards before tablet columns become cramped', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 900 });

  const columns = await page.locator('.education-grid').evaluate((grid) =>
    getComputedStyle(grid).gridTemplateColumns.split(' ').length,
  );

  expect(columns).toBe(1);
});

test('keeps phone anchor targets visible below the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('link', { name: '工作经历', exact: true }).click();

  const positions = await page.evaluate(() => ({
    headerBottom: document.querySelector('.site-sidebar')?.getBoundingClientRect().bottom ?? 0,
    targetTop: document.querySelector('#experience')?.getBoundingClientRect().top ?? 0,
  }));

  expect(positions.targetTop).toBeGreaterThanOrEqual(positions.headerBottom);
});

test('preserves the desktop sidebar and two-column hero composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const layout = await page.evaluate(() => {
    const sidebar = document.querySelector('.site-sidebar')?.getBoundingClientRect();
    const heading = document.querySelector('.hero-section h1')?.getBoundingClientRect();
    const portrait = document.querySelector('.hero-portrait')?.getBoundingClientRect();
    return {
      sidebarHeight: sidebar?.height ?? 0,
      sidebarWidth: sidebar?.width ?? 0,
      headingRight: heading?.right ?? 0,
      portraitLeft: portrait?.left ?? 0,
    };
  });

  expect(layout.sidebarHeight).toBe(900);
  expect(layout.sidebarWidth).toBeGreaterThan(200);
  expect(layout.portraitLeft).toBeGreaterThan(layout.headingRight);
});

test('supports keyboard navigation through all header controls', async ({ page }) => {
  const expected = ['钱美含', '概述', '教育经历', '工作经历', '代表项目', '专利', '专业能力', '产品领域', '联系', '中文', 'EN', '亮色', '暗色', '跟随系统'];
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

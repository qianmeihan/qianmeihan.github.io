import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('shows core recruiter information in Chinese', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('钱美含');
  await expect(page.locator('.hero-role')).toHaveText('机械/产品工程师');
  await expect(page.locator('.hero-intro')).toContainText('你好，我是钱美含');
  await expect(page.locator('.hero-meta')).toHaveCount(0);
  await expect(page.locator('.hero-actions .button-link')).toHaveCount(4);
  await expect(page.locator('.hero-actions .text-link')).toHaveCount(2);
  await expect(page.locator('.hero-actions a')).toHaveCount(6);
  expect(await page.locator('.hero-actions a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual([
    '/downloads/meihan-qian-resume.pdf',
    '/downloads/meihan-qian-resume-en.pdf',
    'https://www.linkedin.com/in/qianmeihan/',
    'https://github.com/qianmeihan',
    '#contact',
    '#education',
  ]);
  for (const path of ['/downloads/meihan-qian-resume.pdf', '/downloads/meihan-qian-resume-en.pdf']) {
    const response = await page.request.get(path);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  }
  await expect(page.locator('.hero-section')).not.toContainText('法语 B2');
  await expect(page.locator('.hero-actions').getByRole('link', { name: '了解更多' })).toHaveAttribute('href', '#education');
  await expect(page.locator('.hero-actions').getByRole('link', { name: '联系我' })).toHaveAttribute('href', '#contact');
  await expect(page.getByRole('region', { name: '核心经验' })).toContainText('4年经验');
  await expect(page.getByText('1287187051@qq.com', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  await expect(page.getByText('舍弗勒', { exact: true })).toBeVisible();
  await expect(page.getByText('宝马华晨项目', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: '代表项目', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('link', { name: '专利', exact: true }).click();
  await expect(page.getByText('CN223978857U', { exact: true })).toBeVisible();
});

test('keeps each hero action in its own matching pill and reveals resume dates on hover', async ({ page }) => {
  const actions = page.locator('.hero-actions');
  const chinese = actions.getByRole('link', { name: '中文简历' });
  const english = actions.getByRole('link', { name: '英文简历' });
  const contact = actions.getByRole('link', { name: '联系我' });
  const learnMore = actions.getByRole('link', { name: '了解更多' });

  expect(await contact.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    await learnMore.evaluate((element) => getComputedStyle(element).backgroundColor),
  );
  await expect(contact).toHaveCSS('color', await learnMore.evaluate((element) => getComputedStyle(element).color));
  await expect(contact).toHaveCSS('border-color', await learnMore.evaluate((element) => getComputedStyle(element).borderColor));
  await expect(contact).toHaveCSS('border-radius', await learnMore.evaluate((element) => getComputedStyle(element).borderRadius));
  await expect(contact.locator('svg')).toHaveCSS('color', await learnMore.locator('svg').evaluate((element) => getComputedStyle(element).color));
  await expect(actions.getByRole('link', { name: '邮箱' })).toHaveCount(0);

  for (const [link, date] of [[chinese, '更新于 2026.08.25'], [english, '更新于 2026.04.17']] as const) {
    await expect(link).toHaveAttribute('data-updated-at', date);
    await link.hover();
    await expect.poll(() => link.evaluate((element) => getComputedStyle(element, '::after').opacity)).toBe('1');
  }
});

test('prioritizes three selected projects and the complete patent drawing', async ({ page }) => {
  await page.getByRole('link', { name: '代表项目', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  await expect(page.locator('.timeline-item--featured')).toContainText('核心研发经历');
  await page.getByRole('link', { name: '专利', exact: true }).click();
  const drawing = page.getByRole('img', { name: 'CN223978857U 公开专利结构图' });
  await expect(drawing).toHaveAttribute('width', '729');
  await expect(drawing).toHaveAttribute('height', '1000');
});

test('shows four proof points and two verified patents in both languages', async ({ page }) => {
  await expect(page.locator('.evidence-strip__item')).toHaveCount(4);
  await page.getByRole('link', { name: '专利', exact: true }).click();
  await expect(page.locator('.patent-card')).toHaveCount(2);
  await expect(page.locator('.patent-card a[href="https://patents.google.com/patent/CN222839946U/zh"]')).toHaveCount(1);
  await expect(page.locator('.patent-card a[href="https://patents.google.com/patent/CN223978857U/zh"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Published Patents' })).toBeVisible();
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.locator('.evidence-strip')).toContainText('3 languages');
  await page.getByRole('link', { name: 'Patent' }).click();
  await expect(page.locator('.patent-card')).toHaveCount(2);
});

test('switches to English without a reload and persists the choice', async ({ page }) => {
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meihan Qian');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('qian-portfolio-locale'))).toBe('en');

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meihan Qian');
});

test('keeps the English role descriptor on one line in the desktop sidebar', async ({ page }) => {
  await page.getByRole('button', { name: 'EN' }).click();
  const lineCount = await page.locator('.site-brand__text span').evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  });

  expect(lineCount).toBe(1);
});

test('keeps English name headings on one line across desktop widths', async ({ page }) => {
  await page.getByRole('button', { name: 'EN' }).click();

  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [nav, selector] of [['Overview', '.hero-section h1'], ['Contact', '.contact-section h2']] as const) {
      await page.getByRole('link', { name: nav, exact: true }).click();
      const lineCount = await page.locator(selector).evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getClientRects().length;
      });
      expect(lineCount, `${selector} stays on one line at ${width}px`).toBe(1);
    }
  }
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
    await expect(page.locator('main > section')).toHaveCount(1);
  }
});

test('highlights contact after the hero contact button changes the active module', async ({ page }) => {
  await page.locator('.hero-actions').getByRole('link', { name: '联系我' }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('.site-nav a[href="#contact"]')).toHaveAttribute('aria-current', 'location');
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
  for (const hash of ['#profile', '#education', '#experience', '#patent', '#industry-context']) {
    await page.goto(`/${hash}`);
    const images = page.locator('main img');
    expect(await images.count()).toBeGreaterThan(0);
    for (let index = 0; index < (await images.count()); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
  }
});

test('has no automatically detectable WCAG A or AA violations', async ({ page }) => {
  for (const hash of ['#profile', '#education']) {
    await page.goto(`/${hash}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

for (const viewport of [
  { width: 360, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`contains no horizontal overflow at ${viewport.width} by ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const hash of ['#profile', '#education']) {
      await page.goto(`/${hash}`);
      const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(metrics.page).toBeLessThanOrEqual(metrics.viewport);
    }
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
  await page.getByRole('link', { name: '教育经历', exact: true }).click();

  const columns = await page.locator('.education-grid').evaluate((grid) =>
    getComputedStyle(grid).gridTemplateColumns.split(' ').length,
  );

  expect(columns).toBe(1);
});

test('opens a selected module directly and restores it through browser history', async ({ page }) => {
  await page.goto('/#education');
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#profile')).toHaveCount(0);
  await expect(page.getByText('材料力学')).toBeVisible();
  await expect(page.getByText('连续介质力学')).toBeVisible();
  await page.getByRole('link', { name: '代表项目', exact: true }).click();
  await expect(page.locator('#work')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#education')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#work')).toBeVisible();
});

test('keeps education content bilingual in the same view', async ({ page }) => {
  await page.getByRole('link', { name: '教育经历', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByText('Mechanics of Materials')).toBeVisible();
  await expect(page.getByText('Continuum Mechanics')).toBeVisible();
  await expect(page.locator('.education-card')).toHaveCount(2);
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
    const actionGrid = document.querySelector('.hero-actions');
    return {
      sidebarHeight: sidebar?.height ?? 0,
      sidebarWidth: sidebar?.width ?? 0,
      headingRight: heading?.right ?? 0,
      portraitLeft: portrait?.left ?? 0,
      actionColumns: actionGrid ? getComputedStyle(actionGrid).gridTemplateColumns.split(' ').length : 0,
    };
  });

  expect(layout.sidebarHeight).toBe(900);
  expect(layout.sidebarWidth).toBeGreaterThan(200);
  expect(layout.portraitLeft).toBeGreaterThan(layout.headingRight);
  expect(layout.actionColumns).toBe(3);
});

test('fits the complete overview in a compact desktop viewport in both languages', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 650 });

  for (const locale of ['zh', 'en'] as const) {
    if (locale === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();

    const bounds = await page.evaluate(() => ({
      viewport: window.innerHeight,
      heroTop: document.querySelector('.hero-section')?.getBoundingClientRect().top ?? Infinity,
      metricsBottom: document.querySelector('.evidence-strip')?.getBoundingClientRect().bottom ?? Infinity,
      portraitBottom: document.querySelector('.hero-portrait')?.getBoundingClientRect().bottom ?? Infinity,
      actionsBottom: document.querySelector('.hero-actions')?.getBoundingClientRect().bottom ?? Infinity,
    }));

    expect(bounds.heroTop).toBeGreaterThanOrEqual(0);
    expect(bounds.metricsBottom).toBeLessThanOrEqual(bounds.viewport);
    expect(bounds.portraitBottom).toBeLessThanOrEqual(bounds.viewport);
    expect(bounds.actionsBottom).toBeLessThanOrEqual(bounds.viewport);
  }
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

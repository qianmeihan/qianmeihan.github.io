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
  await expect(page.locator('#experience .project-card')).toHaveCount(5);
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

test('shows five resume-backed projects and the complete patent drawing', async ({ page }) => {
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  await expect(page.locator('#experience .project-card')).toHaveCount(5);
  await expect(page.locator('#experience .timeline-item').nth(0).locator('.project-card')).toHaveCount(0);
  await expect(page.locator('#experience .timeline-item').nth(1).locator('.project-card')).toHaveCount(5);
  await page.getByRole('link', { name: '专利', exact: true }).click();
  const drawing = page.getByRole('img', { name: 'CN223978857U 公开专利结构图' });
  await expect(drawing).toHaveAttribute('width', '729');
  await expect(drawing).toHaveAttribute('height', '1000');
});

test('keeps selected project cards compact after removing capability chips', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto('/#work');
  const cards = page.locator('#work .project-card');
  await expect(cards).toHaveCount(5);
  const heights = await cards.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
  for (const height of heights) {
    expect(height).toBeLessThan(200);
  }
});

test('presents both employers with matching card colors and identity geometry', async ({ page }) => {
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  const cards = page.locator('#experience .timeline-item');
  await expect(cards).toHaveCount(2);
  await expect(cards.locator('.timeline-item__header')).toHaveCount(2);
  const styles = await cards.evaluateAll((items) => items.map((item) => {
    const card = item as HTMLElement;
    const logo = card.querySelector('.timeline-item__logo-frame')!.getBoundingClientRect();
    const header = card.querySelector('.timeline-item__header')!.getBoundingClientRect();
    return {
      background: getComputedStyle(card).backgroundColor,
      borderColor: getComputedStyle(card).borderTopColor,
      radius: getComputedStyle(card).borderTopLeftRadius,
      logoWidth: Math.round(logo.width),
      logoHeight: Math.round(logo.height),
      headerLeft: Math.round(header.left),
    };
  }));
  expect(styles[0]).toEqual(styles[1]);
});

test('gives both schools the same quiet outer frame as work experience', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), theme);
    const frames = await page.locator('.timeline-item, .education-card').evaluateAll((items) => items.map((item) => {
      const style = getComputedStyle(item);
      const course = getComputedStyle(document.querySelector('.course-card')!);
      return {
        border: style.borderTopColor,
        borderWidth: style.borderTopWidth,
        radius: style.borderTopLeftRadius,
        background: style.backgroundColor,
        courseBorder: course.borderTopColor,
      };
    }));
    expect(frames).toHaveLength(4);
    expect(frames.every((frame) => frame.borderWidth === '1px')).toBe(true);
    expect(frames.every((frame) => frame.border !== frame.courseBorder)).toBe(true);
    expect(frames.map(({ border, radius, background }) => ({ border, radius, background }))).toEqual(
      Array(4).fill({ border: frames[0].border, radius: frames[0].radius, background: frames[0].background }),
    );
  }
});

test('keeps both brand marks inside their equal-size logo frames', async ({ page }) => {
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  const contained = await page.locator('#experience .timeline-item').evaluateAll((items) => items.map((item) => {
    const frame = item.querySelector('.timeline-item__logo-frame')!.getBoundingClientRect();
    const image = item.querySelector('.timeline-item__logo')!.getBoundingClientRect();
    return image.top >= frame.top && image.bottom <= frame.bottom && image.left >= frame.left && image.right <= frame.right;
  }));
  expect(contained).toEqual([true, true]);
});

test('lets work copy use the desktop width and keeps the project label subordinate', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#work');

  const experience = page.locator('#experience .timeline-item').nth(1);
  const metrics = await experience.evaluate((card) => {
    const body = card.querySelector('.timeline-item__body')!;
    const summary = body.querySelector('p')!;
    const role = card.querySelector('h3')!;
    const projects = card.querySelector('.experience-projects')!;
    const heading = projects.querySelector('h4')!;
    return {
      summaryWidth: summary.getBoundingClientRect().width,
      bodyWidth: body.getBoundingClientRect().width,
      roleSize: parseFloat(getComputedStyle(role).fontSize),
      headingSize: parseFloat(getComputedStyle(heading).fontSize),
      dividerWidth: parseFloat(getComputedStyle(projects).borderTopWidth),
    };
  });

  expect(metrics.summaryWidth / metrics.bodyWidth).toBeGreaterThan(0.95);
  expect(metrics.headingSize).toBeLessThan(metrics.roleSize * 0.7);
  expect(metrics.dividerWidth).toBe(0);

  await page.setViewportSize({ width: 1200, height: 900 });
  const firstTitle = page.locator('#work .project-card h5').first();
  const titleMetrics = await firstTitle.evaluate((title) => ({
    height: title.getBoundingClientRect().height,
    lineHeight: parseFloat(getComputedStyle(title).lineHeight),
  }));
  expect(titleMetrics.height).toBeLessThan(titleMetrics.lineHeight * 1.5);
});

test('opens a project detail dialog and closes it with Escape and its close button', async ({ page }) => {
  await page.getByRole('link', { name: '工作经历', exact: true }).click();
  const project = page.getByRole('button', { name: /D3 TCU 压铸壳体开发/ });
  await project.click();
  const dialog = page.getByRole('dialog', { name: 'D3 TCU 压铸壳体开发' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('PCB');
  await expect(dialog.getByRole('list', { name: '相关能力' })).toContainText('压铸件设计');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(project).toBeFocused();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: /D3 TCU Die-Cast Housing Development/ }).click();
  const englishDialog = page.getByRole('dialog', { name: 'D3 TCU Die-Cast Housing Development' });
  await expect(englishDialog).toContainText('supplier technical reviews');
  await expect(englishDialog.getByRole('list', { name: 'Related capabilities' })).toContainText('Die-cast design');
  await englishDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(englishDialog).not.toBeVisible();
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
  await page.getByRole('link', { name: 'Patent', exact: true }).click();
  await expect(page.locator('.patent-card')).toHaveCount(2);
});

test('centers each proof point within its overview cell', async ({ page }) => {
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const gaps = await page.locator('.evidence-strip__item').evaluateAll((items) =>
      items.map((item) => {
        const strip = item.parentElement!.getBoundingClientRect();
        const cell = item.getBoundingClientRect();
        const value = item.querySelector('strong')!.getBoundingClientRect();
        const label = item.querySelector('span')!.getBoundingClientRect();
        return {
          valueTop: value.top,
          top: value.top - strip.top,
          bottom: strip.bottom - label.bottom,
          valueCenterOffset: (value.left + value.right - cell.left - cell.right) / 2,
          labelCenterOffset: (label.left + label.right - cell.left - cell.right) / 2,
        };
      }),
    );
    expect(gaps).toHaveLength(4);
    for (const gap of gaps) {
      expect(Math.abs(gap.top - gap.bottom)).toBeLessThan(11);
      expect(Math.abs(gap.valueCenterOffset)).toBeLessThan(3);
      expect(Math.abs(gap.labelCenterOffset)).toBeLessThan(3);
    }
    const valueTops = gaps.map((gap) => gap.valueTop);
    expect(Math.max(...valueTops) - Math.min(...valueTops)).toBeLessThan(2);
  }
});

test('keeps proof point values on one line in the narrow desktop layout', async ({ page }) => {
  await page.setViewportSize({ width: 821, height: 900 });
  const layout = await page.locator('.evidence-strip').evaluate((strip) => ({
    columns: getComputedStyle(strip).gridTemplateColumns.split(' ').length,
    values: [...strip.querySelectorAll('strong')].map((value) => ({
      height: value.getBoundingClientRect().height,
      lineHeight: parseFloat(getComputedStyle(value).lineHeight),
    })),
  }));
  expect(layout.columns).toBe(2);
  for (const value of layout.values) {
    expect(value.height).toBeLessThan(value.lineHeight * 1.2);
  }
});

test('keeps the three-process proof point label on one line at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  const label = page.locator('.evidence-strip__item').nth(1).locator('span');
  await expect(label).toHaveText('冲压、压铸、注塑件设计');
  const renderedLines = await label.evaluate((element) => {
    const text = document.createRange();
    text.selectNodeContents(element);
    return text.getClientRects().length;
  });
  expect(renderedLines).toBe(1);
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

test('navigates within one continuous page and highlights the selected section', async ({ page }) => {
  for (const [name, hash] of [
    ['教育经历', '#education'],
    ['工作经历', '#experience'],
    ['专利', '#patent'],
    ['联系', '#contact'],
  ] as const) {
    await page.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.locator(hash)).toBeInViewport();
    await expect(page.locator('.site-nav a[aria-current="location"]')).toHaveAttribute('href', hash);
    await expect(page.locator('main > section')).toHaveCount(8);
  }
});

test('scrolling from education continues into experience and updates navigation', async ({ page }) => {
  await page.getByRole('link', { name: '教育经历', exact: true }).click();
  await expect(page.locator('#education')).toBeInViewport();
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await expect(page.locator('#experience')).toBeInViewport();
  await expect(page.locator('.site-nav a[href="#experience"]')).toHaveAttribute('aria-current', 'location');
});

test('highlights contact after the hero contact button changes the active module', async ({ page }) => {
  await page.locator('.hero-actions').getByRole('link', { name: '联系我' }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
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
  const images = page.locator('main img');
  expect(await images.count()).toBeGreaterThan(11);
  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
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

test('keeps the final course row in the same card format at every breakpoint', async ({ page }) => {
  for (const [width, expectedColumns] of [[1440, 4], [1024, 3], [821, 2], [768, 2], [390, 1]] as const) {
    await page.setViewportSize({ width, height: 900 });
    const grids = page.locator('.education-course-grid');
    for (const grid of await grids.all()) {
      const columns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(expectedColumns);
      const cards = grid.locator('.course-card');
      const firstWidth = await cards.first().evaluate((card) => card.getBoundingClientRect().width);
      const firstImageRatio = await cards.first().locator('.course-card__image').evaluate((image) => {
        const bounds = image.getBoundingClientRect();
        return bounds.width / bounds.height;
      });
      const cardCount = await cards.count();
      for (const index of [4, 5]) {
        if (index >= cardCount) continue;
        const lastWidth = await cards.nth(index).evaluate((card) => card.getBoundingClientRect().width);
        const lastImageRatio = await cards.nth(index).locator('.course-card__image').evaluate((image) => {
          const bounds = image.getBoundingClientRect();
          return bounds.width / bounds.height;
        });
        expect(Math.abs(lastWidth - firstWidth)).toBeLessThan(2);
        expect(Math.abs(lastImageRatio - firstImageRatio)).toBeLessThan(0.05);
      }
    }
  }
});

test('groups each school with a quiet header instead of a heavy divider', async ({ page }) => {
  for (const width of [821, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['zh', 'en']) {
      await page.getByRole('button', { name: locale === 'zh' ? '中文' : 'EN', exact: true }).click();
      const lead = page.locator('.education-section__lead');
      if (locale === 'zh') {
        await expect(lead).toContainText('这些课程为兼顾结构性能与制造可行性的产品设计奠定基础。');
        await expect(lead).not.toContainText('我');
      } else {
        await expect(lead).toContainText('structural performance with manufacturability');
      }
      await expect(lead.locator('.education-section__lead-line')).toHaveCount(0);
      const dimensions = await lead.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(element).lineHeight),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));
      if (locale === 'zh' && width === 1440) {
        expect(dimensions.height).toBeLessThan(dimensions.lineHeight * 1.2);
      }
      expect(dimensions.height).toBeLessThan(dimensions.lineHeight * 3.4);
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  }
  await page.getByRole('button', { name: '中文', exact: true }).click();
  const schools = page.locator('.education-card');
  await expect(schools).toHaveCount(2);
  await expect(schools.nth(0).locator('.education-card__header').getByRole('link', { name: /学校课程设置/ })).toHaveCount(1);
  await expect(schools.nth(1).locator('.education-card__header').getByRole('link', { name: /学校课程设置/ })).toHaveCount(1);
  await expect(page.locator('.course-card a')).toHaveCount(0);
  await expect(page.locator('.education-section__note')).toHaveCount(0);
  for (const school of await schools.all()) {
    const header = school.locator('.education-card__header');
    const colors = await header.evaluate((element) => ({
      header: getComputedStyle(element).backgroundColor,
      section: getComputedStyle(element.closest('.education-section')!).backgroundColor,
    }));
    expect(colors.header).not.toBe('rgba(0, 0, 0, 0)');
    expect(colors.header).not.toBe(colors.section);
  }
  const separatorWidth = await schools.nth(1).evaluate((school) => parseFloat(getComputedStyle(school).borderTopWidth));
  expect(separatorWidth).toBeLessThanOrEqual(1);
});

test('short content sections end near their content rather than leaving a viewport-sized blank tail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [sectionSelector, contentSelector] of [
    ['#experience', '.project-list'],
    ['#skills', '.skills-grid'],
  ] as const) {
    const trailingSpace = await page.locator(sectionSelector).evaluate((section, selector) => {
      const content = section.querySelector(selector as string);
      if (!content) throw new Error(`Missing content ${selector}`);
      return section.getBoundingClientRect().bottom - content.getBoundingClientRect().bottom;
    }, contentSelector);
    expect(trailingSpace, `${sectionSelector} has a consistent lower margin`).toBeLessThan(140);
  }
});

test('keeps course image attribution visually quiet in the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const credits = page.getByRole('region', { name: '课程图片来源与许可' });
  await expect(credits.getByRole('listitem')).toHaveCount(16);
  const desktopFontSize = await credits.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(desktopFontSize).toBeLessThan(10.5);
  await page.setViewportSize({ width: 390, height: 844 });
  const phoneFontSize = await credits.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(phoneFontSize).toBeGreaterThanOrEqual(10);
});

test('keeps course photos compact at desktop and phone widths', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#education');
    const imageFrame = page.locator('.course-card__image').first();
    const bounds = await imageFrame.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height / bounds!.width).toBeLessThanOrEqual(0.65);
  }
});

test('opens a selected module directly and restores it through browser history', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#work');
  await expect(page.locator('#work')).toBeInViewport();
  await expect(page.locator('.site-nav a[aria-current="location"]')).toHaveAttribute('href', '#experience');
  await page.goto('/#education');
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#profile')).toHaveCount(1);
  await expect(page.locator('#education').getByRole('heading', { name: '材料力学' })).toBeVisible();
  await expect(page.locator('#education').getByRole('heading', { name: '连续介质力学' })).toBeVisible();
  await page.evaluate(() => { window.location.hash = '#work'; });
  await expect(page.locator('#work')).toBeInViewport();
  await expect(page.locator('.site-nav a[aria-current="location"]')).toHaveAttribute('href', '#experience');
  await page.goBack();
  await expect(page.locator('#education')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#work')).toBeInViewport();
});

test('keeps education content bilingual in the same view', async ({ page }) => {
  await page.getByRole('link', { name: '教育经历', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('#education').getByRole('heading', { name: 'Mechanics of Materials' })).toBeVisible();
  await expect(page.locator('#education').getByRole('heading', { name: 'Continuum Mechanics' })).toBeVisible();
  await expect(page.locator('.education-card')).toHaveCount(2);
  await expect(page.locator('.course-card')).toHaveCount(16);
  await expect(page.locator('.course-card__image img')).toHaveCount(16);
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
  const expected = ['钱美含', '概述', '教育经历', '工作经历', '专利', '专业能力', '产品领域', '联系', '中文', 'EN', '亮色', '暗色', '跟随系统'];
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

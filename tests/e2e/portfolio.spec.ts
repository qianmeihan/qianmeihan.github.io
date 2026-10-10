import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function selectSection(page: Page, name: string) {
  if (await page.evaluate(() => window.innerWidth <= 600)) {
    await expect(page.locator('.mobile-dock')).toBeVisible();
    await page.locator('.mobile-dock__current').click();
    await page.locator('.mobile-menu').getByRole('link', { name, exact: true }).click();
  } else {
    await page.getByRole('link', { name, exact: true }).click();
  }
}

async function selectPhoneSetting(page: Page, name: string) {
  await expect(page.locator('.mobile-dock')).toBeVisible();
  await page.locator('.mobile-dock__current').click();
  await page.locator('.mobile-menu').getByRole('button', { name, exact: true }).click();
}

async function dragPhoneSectionUp(page: Page, distance: number, retreatTo = distance) {
  await page.evaluate(({ dragDistance, endDistance }) => {
    const target = document.querySelector<HTMLElement>('#main-content')!;
    const touch = (y: number) => new Touch({ identifier: 1, target, clientX: 190, clientY: y });
    target.dispatchEvent(new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [touch(650)],
      targetTouches: [touch(650)],
      changedTouches: [touch(650)],
    }));
    target.dispatchEvent(new TouchEvent('touchmove', {
      bubbles: true,
      cancelable: true,
      touches: [touch(650 - dragDistance)],
      targetTouches: [touch(650 - dragDistance)],
      changedTouches: [touch(650 - dragDistance)],
    }));
    if (endDistance !== dragDistance) {
      target.dispatchEvent(new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [touch(650 - endDistance)],
        targetTouches: [touch(650 - endDistance)],
        changedTouches: [touch(650 - endDistance)],
      }));
    }
    target.dispatchEvent(new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
      targetTouches: [],
      changedTouches: [touch(650 - endDistance)],
    }));
  }, { dragDistance: distance, endDistance: retreatTo });
}

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

test('aligns school name and degree in two rows with the date and curriculum link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const locale of ['zh', 'en'] as const) {
    await page.getByRole('button', { name: locale === 'zh' ? '中文' : 'EN', exact: true }).click();
    const rows = await page.locator('.education-card__header').evaluateAll((headers) => headers.map((header) => {
      const name = header.querySelector('h3')!;
      const degree = header.querySelector('.education-card__degree')!;
      const date = header.querySelector('time')!;
      const curriculum = header.querySelector('.education-card__curriculum')!;
      const centerY = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return (bounds.top + bounds.bottom) / 2;
      };
      return {
        nameDateOffset: Math.abs(centerY(name) - centerY(date)),
        degreeLinkOffset: Math.abs(centerY(degree) - centerY(curriculum)),
        nameLines: name.getBoundingClientRect().height / parseFloat(getComputedStyle(name).lineHeight),
        degreeLines: degree.getBoundingClientRect().height / parseFloat(getComputedStyle(degree).lineHeight),
        dateColor: getComputedStyle(date).color,
        degreeColor: getComputedStyle(degree).color,
      };
    }));
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.nameDateOffset).toBeLessThan(10);
      expect(row.degreeLinkOffset).toBeLessThan(10);
      expect(row.nameLines).toBeLessThan(1.4);
      expect(row.degreeLines).toBeLessThan(1.4);
      expect(row.dateColor).not.toBe(row.degreeColor);
    }
  }
  const workDate = await page.locator('.timeline-item time').first().evaluate((date) => ({
    color: getComputedStyle(date).color,
    fontSize: parseFloat(getComputedStyle(date).fontSize),
  }));
  const workCopy = await page.locator('.timeline-item__body p').first().evaluate((copy) => getComputedStyle(copy).color);
  expect(workDate.color).not.toBe(workCopy);
  expect(workDate.fontSize).toBeGreaterThanOrEqual(12.5);
});

test('keeps long English degree names on one line in a compact desktop header', async ({ page }) => {
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  for (const width of [1024, 1101, 1199]) {
    await page.setViewportSize({ width, height: 900 });
    const headers = await page.locator('.education-card__header').evaluateAll((items) => items.map((header) => {
      const name = header.querySelector('h3')!;
      const date = header.querySelector('time')!;
      const degree = header.querySelector('.education-card__degree')!;
      const curriculum = header.querySelector('.education-card__curriculum')!;
      const bounds = (element: Element) => element.getBoundingClientRect();
      return {
        degreeLines: bounds(degree).height / parseFloat(getComputedStyle(degree).lineHeight),
        dateTop: bounds(date).top,
        linkTop: bounds(curriculum).top,
        titleTop: bounds(name).top,
        degreeTop: bounds(degree).top,
        titleBottom: bounds(name).bottom,
        dateRight: bounds(date).right,
        linkLeft: bounds(curriculum).left,
      };
    }));
    expect(headers).toHaveLength(2);
    for (const header of headers) {
      expect(header.degreeLines).toBeLessThan(1.4);
      expect(Math.abs(header.dateTop - header.linkTop)).toBeLessThan(8);
      expect(Math.abs(header.dateTop - header.titleTop)).toBeLessThan(10);
      expect(header.degreeTop).toBeGreaterThan(header.titleBottom);
      expect(header.dateRight).toBeLessThan(header.linkLeft);
    }
  }
});

test('stacks school metadata below the degree before the phone breakpoint', async ({ page }) => {
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  for (const width of [821, 960]) {
    await page.setViewportSize({ width, height: 900 });
    const headers = await page.locator('.education-card__header').evaluateAll((items) => items.map((header) => {
      const name = header.querySelector('h3')!;
      const degree = header.querySelector('.education-card__degree')!;
      const date = header.querySelector('time')!;
      const curriculum = header.querySelector('.education-card__curriculum')!;
      const bounds = (element: Element) => element.getBoundingClientRect();
      return {
        nameLines: bounds(name).height / parseFloat(getComputedStyle(name).lineHeight),
        degreeLines: bounds(degree).height / parseFloat(getComputedStyle(degree).lineHeight),
        degreeBottom: bounds(degree).bottom,
        dateTop: bounds(date).top,
        linkTop: bounds(curriculum).top,
        dateRight: bounds(date).right,
        linkLeft: bounds(curriculum).left,
      };
    }));
    expect(headers).toHaveLength(2);
    for (const header of headers) {
      expect(header.nameLines).toBeLessThan(1.4);
      expect(header.degreeLines).toBeLessThan(2.4);
      expect(header.dateTop).toBeGreaterThan(header.degreeBottom);
      expect(Math.abs(header.dateTop - header.linkTop)).toBeLessThan(8);
      expect(header.dateRight).toBeLessThan(header.linkLeft);
    }
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

test('enlarges patent drawings in a dismissible in-page dialog without an original-image action', async ({ page }) => {
  await page.getByRole('link', { name: '专利', exact: true }).click();
  const button = page.getByRole('button', { name: '放大查看 CN223978857U 附图' });
  const thumbnailSource = await button.getByRole('img').getAttribute('src');
  await button.click();

  const dialog = page.getByRole('dialog', { name: 'CN223978857U 附图' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveAttribute('src', thumbnailSource!);
  const fitsWithoutScrolling = await dialog.evaluate((element) => element.scrollHeight <= element.clientHeight + 1);
  expect(fitsWithoutScrolling).toBe(true);
  await expect(dialog.getByRole('link', { name: '查看公开专利记录' })).toHaveAttribute(
    'href',
    'https://patents.google.com/patent/CN223978857U/zh',
  );
  await expect(dialog).not.toContainText('打开原图');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();

  await button.click();
  await dialog.getByRole('button', { name: '关闭附图' }).click();
  await expect(dialog).not.toBeVisible();

  await button.click();
  await page.mouse.click(5, 5);
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('button', { name: 'Enlarge drawing for CN223978857U' }).click();
  const englishDialog = page.getByRole('dialog', { name: 'Drawing for CN223978857U' });
  await expect(englishDialog).toBeVisible();
  await expect(englishDialog.getByRole('link', { name: 'View public patent record' })).toHaveAttribute(
    'href',
    'https://patents.google.com/patent/CN223978857U/zh',
  );
  await englishDialog.getByRole('button', { name: 'Close drawing' }).click();
  await expect(englishDialog).not.toBeVisible();
});

test('places each public patent link below its enlarged drawing', async ({ page }) => {
  await page.getByRole('link', { name: '专利', exact: true }).click();
  for (const number of ['CN222839946U', 'CN223978857U']) {
    await page.getByRole('button', { name: `放大查看 ${number} 附图` }).click();
    const dialog = page.getByRole('dialog', { name: `${number} 附图` });
    const link = dialog.getByRole('link', { name: '查看公开专利记录' });
    await expect(link).toHaveAttribute('href', `https://patents.google.com/patent/${number}/zh`);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const positions = await dialog.evaluate((element) => {
      const image = element.querySelector('img')!.getBoundingClientRect();
      const record = element.querySelector('a')!.getBoundingClientRect();
      return { imageBottom: image.bottom, linkTop: record.top };
    });
    expect(positions.linkTop).toBeGreaterThan(positions.imageBottom);
    await dialog.getByRole('button', { name: '关闭附图' }).click();
  }
});

test('keeps each patent summary compact and places one ownership note below both cards', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.getByRole('link', { name: '专利', exact: true }).click();
  await expect(page.locator('.patent-card')).toHaveCount(2);
  await expect(page.locator('.patent-section__ownership')).toHaveCount(1);
  const spacing = await page.locator('.patent-card__body').evaluateAll((bodies) => bodies.map((body) => {
    const selectors = ['.patent-card__number', 'h3', '.patent-card__summary', '.patent-card__inventors', 'a'];
    const bounds = selectors.map((selector) => body.querySelector(selector)!.getBoundingClientRect());
    return {
      topInset: bounds[0].top - body.getBoundingClientRect().top,
      gaps: bounds.slice(1).map((next, index) => next.top - bounds[index].bottom),
    };
  }));
  for (const card of spacing) {
    expect(card.topInset).toBeLessThan(6);
    expect(Math.max(...card.gaps)).toBeLessThan(18);
  }
});

test('slightly enlarges patent detail text while keeping its compact two-column layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('link', { name: '专利', exact: true }).click();
  const sizes = await page.locator('.patent-card').evaluateAll((cards) => cards.map((card) => {
    const fontSize = (selector: string) => Number.parseFloat(getComputedStyle(card.querySelector(selector)!).fontSize);
    return {
      cardWidth: card.getBoundingClientRect().width,
      title: fontSize('h3'),
      summary: fontSize('.patent-card__summary'),
      inventors: fontSize('.patent-card__inventors'),
      record: fontSize('.patent-card__body a'),
    };
  }));
  for (const item of sizes) {
    expect(item.cardWidth).toBeLessThanOrEqual(760);
    expect(item.title).toBeGreaterThanOrEqual(30);
    expect(item.summary).toBeGreaterThanOrEqual(18.5);
    expect(item.inventors).toBeGreaterThanOrEqual(15);
    expect(item.record).toBeGreaterThanOrEqual(14.5);
  }
});

test('stacks two matching patent rows with complete drawings beside concise details', async ({ page }) => {
  for (const width of [1440, 821, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await selectSection(page, '专利');
    const cards = page.locator('.patent-card');
    await expect(cards).toHaveCount(2);
    const measurements = await cards.evaluateAll((elements) => elements.map((element) => {
      const drawing = element.querySelector('.patent-card__figure img') as HTMLImageElement;
      const bounds = drawing.getBoundingClientRect();
      const body = element.querySelector('.patent-card__body')!.getBoundingClientRect();
      const card = element.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        imageRight: bounds.right,
        imageBottom: bounds.bottom,
        bodyLeft: body.left,
        bodyTop: body.top,
        bodyWidth: body.width,
        objectFit: getComputedStyle(drawing).objectFit,
        cardWidth: card.width,
        cardHeight: card.height,
        cardTop: card.top,
        cardBottom: card.bottom,
      };
    }));
    expect(Math.abs(measurements[0].width - measurements[1].width)).toBeLessThan(1);
    expect(Math.abs(measurements[0].height - measurements[1].height)).toBeLessThan(1);
    expect(measurements[1].cardTop).toBeGreaterThan(measurements[0].cardBottom);
    for (const drawing of measurements) {
      expect(drawing.height / drawing.width).toBeCloseTo(1000 / 729, 2);
      expect(drawing.objectFit).toBe('contain');
      expect(drawing.width).toBeLessThanOrEqual(drawing.cardWidth);
    }
    if (width >= 821) {
      expect(Math.abs(measurements[0].cardWidth - measurements[1].cardWidth)).toBeLessThan(1);
      expect(Math.abs(measurements[0].cardHeight - measurements[1].cardHeight)).toBeLessThan(1);
      expect(measurements[0].imageRight).toBeLessThan(measurements[0].bodyLeft);
      expect(measurements[1].imageRight).toBeLessThan(measurements[1].bodyLeft);
      if (width === 1440) {
        expect(measurements[0].cardWidth).toBeLessThanOrEqual(760);
        expect(measurements[0].width).toBeGreaterThan(190);
        expect(measurements[0].width).toBeLessThanOrEqual(225);
        expect(measurements[0].bodyWidth).toBeLessThanOrEqual(470);
      } else {
        expect(measurements[0].width).toBeLessThan(220);
        expect(measurements[0].bodyWidth).toBeGreaterThan(240);
        expect(measurements[1].bodyWidth).toBeGreaterThan(240);
      }
    } else {
      expect(measurements[0].width).toBeLessThanOrEqual(300);
      expect(measurements[0].bodyTop).toBeGreaterThan(measurements[0].imageBottom);
      expect(measurements[1].bodyTop).toBeGreaterThan(measurements[1].imageBottom);
    }
  }
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
    for (const [nav, selector] of [['Overview', '.hero-section h1'], ['Contact', '.contact-section > .section-heading h2']] as const) {
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
  )).toBe('#1d2226');
  await expect.poll(() => page.locator('html').evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--color-accent').trim(),
  )).toBe('#5b6971');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: '跟随系统' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('uses a brief color-only theme transition without moving the phone layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const layoutBefore = await page.locator('.mobile-dock').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height };
  });

  await page.evaluate(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (!root.classList.contains('theme-transition')) return;
      const body = getComputedStyle(document.body);
      const contact = getComputedStyle(document.querySelector('.contact-section')!);
      const portrait = getComputedStyle(document.querySelector('.hero-portrait img')!);
      Reflect.set(window, '__themeTransitionSample', {
        properties: body.transitionProperty.split(',').map((value) => value.trim()),
        durationMs: parseFloat(body.transitionDuration) * 1000,
        contactProperties: contact.transitionProperty.split(',').map((value) => value.trim()),
        portraitDuration: parseFloat(portrait.transitionDuration),
      });
      observer.disconnect();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  });
  await selectPhoneSetting(page, '暗色');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const motion = await page.evaluate(() => Reflect.get(window, '__themeTransitionSample'));
  expect(motion).toBeTruthy();
  expect(motion.properties).toEqual(expect.arrayContaining(['background-color', 'color', 'border-color']));
  expect(motion.properties).not.toContain('all');
  expect(motion.properties).not.toContain('transform');
  expect(motion.durationMs).toBeGreaterThan(0);
  expect(motion.durationMs).toBeLessThanOrEqual(220);
  expect(motion.contactProperties).toContain('background-color');
  expect(motion.portraitDuration).toBe(0);

  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(29, 34, 38)');
  const layoutAfter = await page.locator('.mobile-dock').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height };
  });
  expect(layoutAfter).toEqual(layoutBefore);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await selectPhoneSetting(page, '亮色');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 243, 239)');
});

test('does not animate manual theme changes when reduced motion is requested', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await selectPhoneSetting(page, '暗色');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(29, 34, 38)');
});

test('keeps dark experience and education cards distinct from the page', async ({ page }) => {
  await page.getByRole('button', { name: '暗色' }).click();
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  const contrast = await page.locator('.timeline-item, .education-card').evaluateAll((cards) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const channels = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const luminance = (value: string) => channels(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const ratio = (first: string, second: string) => {
      const values = [luminance(first), luminance(second)].sort((left, right) => right - left);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };
    const pageBackground = getComputedStyle(document.body).backgroundColor;
    return cards.map((card) => {
      const style = getComputedStyle(card);
      return {
        fill: ratio(style.backgroundColor, pageBackground),
        edge: ratio(style.borderTopColor, style.backgroundColor),
      };
    });
  });
  expect(contrast).toHaveLength(4);
  for (const card of contrast) {
    expect(card.fill).toBeGreaterThanOrEqual(1.25);
    expect(card.edge).toBeGreaterThanOrEqual(2);
  }
});

test('uses neutral graphite rather than green for dark interface chrome', async ({ page }) => {
  await page.getByRole('button', { name: '暗色' }).click();
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  const palette = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const color = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
    return {
      surfaces: [
        color(getComputedStyle(document.documentElement).backgroundColor),
        color(style('.site-sidebar').backgroundColor),
        color(style('.timeline-item').backgroundColor),
        color(style('.contact-section').backgroundColor),
        color(style('.theme-switch button[aria-pressed="true"]').backgroundColor),
        color(style('.timeline-item__logo-frame').backgroundColor),
      ],
      pagePattern: getComputedStyle(document.body).backgroundImage,
      backdrop: color(getComputedStyle(document.querySelector('.project-dialog')!, '::backdrop').backgroundColor),
    };
  });
  for (const [index, channels] of palette.surfaces.entries()) {
    expect(Math.max(...channels) - Math.min(...channels), `dark surface ${index} stays neutral`).toBeLessThanOrEqual(24);
  }
  expect(Math.max(...palette.backdrop) - Math.min(...palette.backdrop)).toBeLessThanOrEqual(8);
  expect(palette.pagePattern).toBe('none');
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
    await expect(page.locator('main > section')).toHaveCount(7);
  }
});

test('places clicked section headings close to the top at desktop, tablet, and phone widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await selectSection(page, '教育经历');
    const heading = page.locator('#education .section-heading');
    await expect(heading).toBeInViewport();
    const gap = await heading.evaluate((element) => {
      const headerBottom = window.innerWidth > 600 && window.innerWidth <= 820
        ? document.querySelector('.site-sidebar')!.getBoundingClientRect().bottom
        : 0;
      return element.getBoundingClientRect().top - headerBottom;
    });
    expect(gap, `heading clearance at ${width}px`).toBeGreaterThanOrEqual(20);
    expect(gap, `heading clearance at ${width}px`).toBeLessThanOrEqual(72);
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

test('keeps the green light endcap and gives the dark endcap graphite with three equal rows', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#contact');
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), theme);
    await expect(page.locator('#contact .contact-channel')).toHaveCount(3);
    const styles = await page.locator('#contact').evaluate((section) => {
      const channels = [...section.querySelectorAll<HTMLElement>('.contact-channel')];
      return {
        sectionBackground: getComputedStyle(section).backgroundColor,
        pageBackground: getComputedStyle(document.querySelector('#education')!).backgroundColor,
        headingCount: section.querySelectorAll('.section-heading h2').length,
        rows: channels.map((channel) => ({
          top: Math.round(channel.getBoundingClientRect().top),
          left: Math.round(channel.getBoundingClientRect().left),
          width: Math.round(channel.getBoundingClientRect().width),
          height: Math.round(channel.getBoundingClientRect().height),
          fontSize: parseFloat(getComputedStyle(channel).fontSize),
        })),
      };
    });
    expect(styles.sectionBackground).not.toBe(styles.pageBackground);
    expect(styles.sectionBackground).toBe(theme === 'light' ? 'rgb(49, 89, 76)' : 'rgb(48, 56, 61)');
    expect(styles.headingCount).toBe(1);
    expect(styles.rows.map(({ fontSize }) => fontSize)).toEqual(Array(3).fill(styles.rows[0].fontSize));
    expect(styles.rows.map(({ left, width, height }) => ({ left, width, height }))).toEqual(
      Array(3).fill({ left: styles.rows[0].left, width: styles.rows[0].width, height: styles.rows[0].height }),
    );
    expect(styles.rows[0].top).toBeLessThan(styles.rows[1].top);
    expect(styles.rows[1].top).toBeLessThan(styles.rows[2].top);
  }
});

test('brightens dark footer link underlines on hover', async ({ page }) => {
  await page.getByRole('button', { name: '暗色' }).click();
  await page.goto('/#contact');
  const link = page.locator('.site-footer__links a').first();
  await link.hover();
  await expect(link).toHaveCSS('color', 'rgb(241, 244, 245)');
  await expect(link).toHaveCSS('text-decoration-color', 'rgb(241, 244, 245)');
});

test('copies the contact email with a quiet bilingual confirmation and keeps its mail icon', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/#contact');
  const chinese = page.locator('#contact').getByRole('button', { name: '复制邮箱地址 1287187051@qq.com' });
  await expect(chinese.locator('.lucide-mail')).toBeVisible();
  const rowHeight = await chinese.evaluate((button) => button.getBoundingClientRect().height);
  await chinese.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('1287187051@qq.com');
  const chineseStatus = chinese.getByRole('status');
  await expect(chineseStatus).toHaveText('已复制');
  expect(await chineseStatus.evaluate((status) => parseFloat(getComputedStyle(status).fontSize))).toBeLessThan(
    await chinese.evaluate((button) => parseFloat(getComputedStyle(button).fontSize)),
  );
  expect(await chinese.evaluate((button) => button.getBoundingClientRect().height)).toBeCloseTo(rowHeight, 1);
  await expect(chinese.locator('.lucide-mail')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(chinese.locator('.contact-channel__copy-status')).toBeEmpty({ timeout: 3500 });

  await selectPhoneSetting(page, 'EN');
  const english = page.locator('#contact').getByRole('button', { name: 'Copy email address 1287187051@qq.com' });
  await english.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('1287187051@qq.com');
  await expect(english.getByRole('status')).toHaveText('Copied');
  await expect(page).toHaveURL(/#contact$/);
});

test('keeps clipboard errors inside the email row instead of opening a mail app', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('clipboard denied')) },
    });
  });
  await page.goto('/#contact');
  const email = page.locator('#contact').getByRole('button', { name: '复制邮箱地址 1287187051@qq.com' });
  await email.click();
  await expect(email.getByRole('status')).toHaveText('复制失败');
  await expect(email.locator('.lucide-mail')).toBeVisible();
  await expect(page).toHaveURL(/#contact$/);
});

test('keeps the contact endcap compact without shrinking its touch targets', async ({ page }) => {
  for (const [width, height, limits] of [
    [1440, 900, { top: [42, 47], heading: [26, 29], footer: [30, 35], bottom: [18, 22] }],
    [390, 844, { top: [34, 38], heading: [19, 22], footer: [26, 29], bottom: [16, 18] }],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/#contact');
    const spacing = await page.locator('#contact').evaluate((section) => {
      const heading = section.querySelector<HTMLElement>('.section-heading')!;
      const footer = section.querySelector<HTMLElement>('.site-footer')!;
      const channels = [...section.querySelectorAll<HTMLElement>('.contact-channel')];
      const style = getComputedStyle(section);
      return {
        top: parseFloat(style.paddingTop),
        heading: parseFloat(getComputedStyle(heading).marginBottom),
        footer: parseFloat(getComputedStyle(footer).marginTop),
        bottom: parseFloat(style.paddingBottom),
        rowHeights: channels.map((channel) => channel.getBoundingClientRect().height),
      };
    });
    for (const key of ['top', 'heading', 'footer', 'bottom'] as const) {
      expect(spacing[key], `${key} spacing at ${width}px`).toBeGreaterThanOrEqual(limits[key][0]);
      expect(spacing[key], `${key} spacing at ${width}px`).toBeLessThanOrEqual(limits[key][1]);
    }
    expect(spacing.rowHeights).toHaveLength(3);
    expect(Math.min(...spacing.rowHeights)).toBeGreaterThanOrEqual(44);
  }
});

test('keeps contact actions and the attribution dialog readable without phone overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/#contact');
  await expect(page.locator('.contact-channel')).toHaveCount(3);
  const trigger = page.locator('#contact').getByRole('button', { name: '图片来源与许可' });
  await expect(trigger).toBeVisible();
  await expect(page.locator('.site-footer__credits')).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: '图片来源与许可' })).toBeVisible();
  await expect(page.locator('.site-footer__credits a').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '图片来源与许可' })).toBeHidden();
});

test('keeps the credits close button available at the end of the phone dialog', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/#contact');
  const trigger = page.getByRole('button', { name: '图片来源与许可' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '图片来源与许可' });
  await dialog.locator('.site-footer__credits p').last().scrollIntoViewIfNeeded();
  const close = dialog.getByRole('button', { name: '关闭图片来源与许可' });
  const bounds = await dialog.evaluate((element) => {
    const dialogBounds = element.getBoundingClientRect();
    const closeBounds = element.querySelector<HTMLButtonElement>('.credits-dialog__close')!.getBoundingClientRect();
    return { dialogTop: dialogBounds.top, dialogBottom: dialogBounds.bottom, closeTop: closeBounds.top, closeBottom: closeBounds.bottom };
  });
  expect(bounds.closeTop).toBeGreaterThanOrEqual(bounds.dialogTop);
  expect(bounds.closeBottom).toBeLessThanOrEqual(bounds.dialogBottom);
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
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
  test.setTimeout(60_000);
  for (const theme of ['light', 'dark'] as const) {
    await page.getByRole('button', { name: theme === 'light' ? '亮色' : '暗色' }).click();
    for (const hash of ['#profile', '#education']) {
      await page.goto(`/${hash}`);
      await expect(page.locator('.project-card').first()).toHaveCSS(
        'background-color', theme === 'light' ? 'rgb(244, 243, 239)' : 'rgb(29, 34, 38)',
      );
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations, `${theme} ${hash} accessibility`).toEqual([]);
    }
  }
});

test('opens image credits from the keyboard without dialog accessibility violations', async ({ page }) => {
  await page.goto('/#contact');
  const trigger = page.getByRole('button', { name: '图片来源与许可' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: '图片来源与许可' });
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
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

test('fits the complete section menu inside a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-dock__current').click();
  const layout = await page.locator('.mobile-menu nav').evaluate((navigation) => {
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

test('uses a single bottom phone dock with an accessible section menu and settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.site-sidebar')).toBeHidden();
  const dock = page.locator('.mobile-dock');
  await expect(dock).toHaveAttribute('aria-label', '手机导航');
  await expect(dock).toBeVisible();
  await expect(dock.getByRole('button', { name: '上一节' })).toBeDisabled();
  await expect(dock.getByRole('button', { name: '概述，打开模块目录' })).toBeVisible();
  await dock.getByRole('link', { name: '下一节：教育经历' }).click();
  await expect(page).toHaveURL(/#education$/);
  await expect(page.locator('#education')).toBeVisible();
  await expect(dock.getByRole('button', { name: '教育经历，打开模块目录' })).toBeVisible();

  await dock.getByRole('button', { name: '教育经历，打开模块目录' }).click();
  const menu = page.locator('.mobile-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
  await expect(menu.getByRole('link')).toHaveCount(6);
  await expect(menu.getByRole('group', { name: '语言 / Language' })).toBeVisible();
  await expect(menu.getByRole('group', { name: '主题' })).toBeVisible();
  await menu.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(dock).toHaveAttribute('aria-label', 'Mobile navigation');
  await expect(dock.getByRole('button', { name: 'Education, open section menu' })).toBeVisible();
  await dock.getByRole('button', { name: 'Education, open section menu' }).click();
  await menu.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(menu).toBeHidden();
  await dock.getByRole('button', { name: 'Education, open section menu' }).click();
  await menu.getByRole('link', { name: 'Skills' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#skills')).toBeVisible();
  await expect(dock.getByRole('button', { name: 'Skills, open section menu' })).toBeVisible();
});

test('keeps the phone dock on one row, above the safe area, without changing tablet navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  const dock = page.getByRole('navigation', { name: '手机导航' });
  const layout = await dock.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const controls = [...element.querySelectorAll('a, button')].map((control) => control.getBoundingClientRect());
    return {
      left: bounds.left,
      right: bounds.right,
      bottom: bounds.bottom,
      controlTops: controls.map((control) => control.top),
      controlHeights: controls.map((control) => control.height),
    };
  });
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.bottom).toBeLessThanOrEqual(780);
  expect(Math.max(...layout.controlTops) - Math.min(...layout.controlTops)).toBeLessThan(2);
  expect(Math.min(...layout.controlHeights)).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(dock).toBeHidden();
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
});

test('places the phone portrait beside the name instead of below the action buttons', async ({ page }) => {
  for (const width of [320, 390, 600]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    for (const locale of ['zh', 'en'] as const) {
      if (locale === 'zh' && await page.locator('html').getAttribute('lang') === 'en') {
        await selectPhoneSetting(page, '中文');
      }
      if (locale === 'en') await selectPhoneSetting(page, 'EN');

      const layout = await page.locator('#profile').evaluate((section) => {
        const bounds = (selector: string) => {
          const box = section.querySelector(selector)!.getBoundingClientRect();
          return { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width };
        };
        const name = bounds('h1');
        const role = bounds('.hero-role');
        const portrait = bounds('.hero-portrait');
        const intro = bounds('.hero-intro');
        const actions = bounds('.hero-actions');
        return { name, role, portrait, intro, actions, viewport: document.documentElement.clientWidth };
      });
      expect(layout.portrait.width, `${locale} at ${width}px`).toBeLessThanOrEqual(120);
      expect(layout.portrait.width, `${locale} at ${width}px`).toBeGreaterThanOrEqual(88);
      expect(layout.portrait.left, `${locale} at ${width}px`).toBeGreaterThanOrEqual(layout.name.right + 8);
      expect(layout.portrait.top, `${locale} at ${width}px`).toBeLessThanOrEqual(layout.name.top + 10);
      expect(layout.portrait.bottom, `${locale} at ${width}px`).toBeLessThan(layout.intro.top);
      expect(layout.intro.bottom, `${locale} at ${width}px`).toBeLessThan(layout.actions.top);
      expect(layout.portrait.right, `${locale} at ${width}px`).toBeLessThanOrEqual(layout.viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});

test('keeps the phone proof points compact directly below the overview actions', async ({ page }) => {
  for (const width of [320, 390, 600]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    for (const locale of ['zh', 'en'] as const) {
      if (locale === 'zh' && await page.locator('html').getAttribute('lang') === 'en') {
        await selectPhoneSetting(page, '中文');
      }
      if (locale === 'en') await selectPhoneSetting(page, 'EN');

      const layout = await page.locator('.evidence-strip').evaluate((strip) => {
        const stripBox = strip.getBoundingClientRect();
        const actionsBox = document.querySelector('.hero-actions')!.getBoundingClientRect();
        const items = [...strip.querySelectorAll('.evidence-strip__item')].map((item) => {
          const box = item.getBoundingClientRect();
          const value = item.querySelector('strong')!;
          const label = item.querySelector('span')!;
          const labelBox = label.getBoundingClientRect();
          return {
            top: box.top,
            bottom: box.bottom,
            height: box.height,
            valueSize: parseFloat(getComputedStyle(value).fontSize),
            labelSize: parseFloat(getComputedStyle(label).fontSize),
            labelRight: labelBox.right,
            labelBottom: labelBox.bottom,
            right: box.right,
          };
        });
        return {
          columns: getComputedStyle(strip).gridTemplateColumns.split(' ').length,
          gapAfterActions: stripBox.top - actionsBox.bottom,
          height: stripBox.height,
          items,
          pageWidth: document.documentElement.scrollWidth,
        };
      });

      expect(layout.columns, `${locale} at ${width}px`).toBe(2);
      expect(layout.gapAfterActions, `${locale} at ${width}px`).toBeGreaterThanOrEqual(8);
      expect(layout.gapAfterActions, `${locale} at ${width}px`).toBeLessThanOrEqual(32);
      expect(layout.height, `${locale} at ${width}px`).toBeLessThanOrEqual(220);
      expect(Math.abs(layout.items[0].top - layout.items[1].top)).toBeLessThan(2);
      expect(Math.abs(layout.items[2].top - layout.items[3].top)).toBeLessThan(2);
      expect(layout.items[2].top).toBeGreaterThanOrEqual(layout.items[0].bottom);
      for (const item of layout.items) {
        expect(item.valueSize).toBeLessThanOrEqual(24);
        expect(item.labelSize).toBeGreaterThanOrEqual(12);
        expect(item.labelRight).toBeLessThanOrEqual(item.right + 1);
        expect(item.labelBottom).toBeLessThanOrEqual(item.bottom + 1);
      }
      expect(layout.pageWidth).toBeLessThanOrEqual(width);
    }
  }
});

test('keeps the phone contact footer above the fixed dock and the menu keyboard-accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#contact');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const spacing = await page.evaluate(() => {
    const footerLink = document.querySelector('.site-footer__links a')!.getBoundingClientRect();
    const dock = document.querySelector('.mobile-dock')!.getBoundingClientRect();
    return { footerBottom: footerLink.bottom, dockTop: dock.top };
  });
  expect(spacing.footerBottom).toBeLessThan(spacing.dockTop - 8);

  const trigger = page.locator('.mobile-dock__current');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: '模块目录' });
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('keeps the final course row in the same card format at every breakpoint', async ({ page }) => {
  for (const [width, expectedColumns] of [[1440, 4], [1024, 3], [821, 2], [768, 2], [390, 1]] as const) {
    await page.setViewportSize({ width, height: 900 });
    if (width <= 600) await selectSection(page, '教育经历');
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

test('keeps complete course image attribution in a legible dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: '图片来源与许可' }).click();
  const credits = page.getByRole('region', { name: '图片与图标来源与许可' });
  await expect(credits.getByRole('listitem')).toHaveCount(23);
  const desktopFontSize = await credits.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(desktopFontSize).toBeGreaterThanOrEqual(12);
  await page.setViewportSize({ width: 390, height: 844 });
  const phoneFontSize = await credits.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(phoneFontSize).toBeGreaterThanOrEqual(12);
});

test('keeps source links identifiable in the dialog in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), theme);
    await page.getByRole('button', { name: '图片来源与许可' }).click();
    const link = page.locator('.site-footer__credits a').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
    await page.keyboard.press('Escape');
  }
});

test('keeps the attribution dialog close focus ring visible in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => document.documentElement.setAttribute('data-theme', nextTheme), theme);
    await page.getByRole('button', { name: '图片来源与许可' }).click();
    const close = page.getByRole('button', { name: '关闭图片来源与许可' });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    const contrast = await close.evaluate((button) => {
      const color = (value: string) => value.match(/\d+/g)!.slice(0, 3).map(Number);
      const luminance = (rgb: number[]) => rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const outline = luminance(color(getComputedStyle(button).outlineColor));
      const background = luminance(color(getComputedStyle(button.closest('dialog')!).backgroundColor));
      return (Math.max(outline, background) + 0.05) / (Math.min(outline, background) + 0.05);
    });
    expect(contrast, `${theme} modal close focus contrast`).toBeGreaterThanOrEqual(3);
    await page.keyboard.press('Escape');
  }
});

test('aligns capability image tiles across desktop and phone layouts', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/#skills');
    const skillImages = page.locator('.skill-item__visual img');
    await expect(skillImages).toHaveCount(10);
    const frames = await page.locator('.skill-item__visual').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      }),
    );
    expect(new Set(frames.map((frame) => frame.height)).size).toBe(1);
    expect(new Set(frames.map((frame) => frame.width)).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
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

test('keeps phone anchor targets visible with the top header removed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await selectSection(page, '工作经历');

  const positions = await page.evaluate(() => ({
    headerBottom: document.querySelector('.site-sidebar')?.getBoundingClientRect().bottom ?? 0,
    targetTop: document.querySelector('#experience')?.getBoundingClientRect().top ?? 0,
  }));

  expect(positions.targetTop).toBeGreaterThanOrEqual(positions.headerBottom);
});

test('shows one selected section at a time on phones, including hash navigation and history', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect(page.locator('#profile')).toBeVisible();
  await expect(page.locator('.evidence-strip')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await selectSection(page, '教育经历');
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#profile')).toBeHidden();
  await expect(page.locator('.evidence-strip')).toBeHidden();
  await expect(page.locator('#experience')).toBeHidden();
  await expect(page.locator('.mobile-dock__current')).toContainText('教育经历');

  await selectSection(page, '专业能力');
  await expect(page.locator('#skills')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await page.goBack();
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#skills')).toBeHidden();

  await page.goto('/#patent');
  await expect(page.locator('#patent')).toBeVisible();
  await expect(page.locator('#profile')).toBeHidden();
  await expect(page.locator('#education')).toBeHidden();
});

test('advances phone sections only after a deliberate pull past the section end', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await selectSection(page, '教育经历');
  await expect(page.locator('#education')).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await dragPhoneSectionUp(page, 140);
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#experience')).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() =>
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
  )).toBe(true);
  await dragPhoneSectionUp(page, 35);
  await expect(page.locator('#education')).toBeVisible();

  await dragPhoneSectionUp(page, 140, 0);
  await expect(page.locator('#education')).toBeVisible();

  await dragPhoneSectionUp(page, 140);
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await expect(page.locator('.mobile-dock__current')).toContainText('工作经历');
});

test('recognizes a real emulated touch pull at the phone section boundary', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await selectSection(page, '教育经历');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() =>
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
  )).toBe(true);

  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
  for (const y of [620, 585, 550, 510]) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await client.detach();
});

test('separates desktop sections with an asymmetric rule and generous title spacing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const sections = page.locator('.content-section');
  await expect(sections).toHaveCount(5);
  const boundaries = await sections.evaluateAll((elements) => elements.map((element) => {
    const section = element as HTMLElement;
    const heading = section.querySelector('.section-heading') as HTMLElement;
    const sectionStyle = getComputedStyle(section);
    const headingStyle = getComputedStyle(heading);
    const shortRule = getComputedStyle(heading, '::before');
    const longRule = getComputedStyle(heading, '::after');
    const sectionBounds = section.getBoundingClientRect();
    const headingBounds = heading.getBoundingClientRect();
    const titleBounds = heading.querySelector('h2')!.getBoundingClientRect();
    return {
      id: section.id,
      sectionBackground: sectionStyle.backgroundColor,
      headingBackground: headingStyle.backgroundColor,
      topBorder: parseFloat(headingStyle.borderTopWidth),
      bottomBorder: parseFloat(headingStyle.borderBottomWidth),
      titleAligned: Math.abs(titleBounds.left - headingBounds.left) < 2,
      headingInset: Math.abs(headingBounds.left - (sectionBounds.left + parseFloat(sectionStyle.paddingLeft))) < 2,
      topSpace: parseFloat(sectionStyle.paddingTop),
      contentGap: parseFloat(headingStyle.marginBottom),
      shortRuleWidth: parseFloat(shortRule.width),
      longRuleWidth: parseFloat(longRule.width),
      longRuleColor: longRule.borderTopColor,
    };
  }));
  for (const boundary of boundaries) {
    expect(boundary.sectionBackground).toBe(boundary.id === 'contact' ? 'rgb(49, 89, 76)' : 'rgba(0, 0, 0, 0)');
    expect(boundary.headingBackground).toBe('rgba(0, 0, 0, 0)');
    expect(boundary.topBorder).toBe(0);
    expect(boundary.bottomBorder).toBe(0);
    expect(boundary.titleAligned).toBe(true);
    expect(boundary.headingInset).toBe(true);
    expect(boundary.topSpace).toBeGreaterThanOrEqual(boundary.id === 'contact' ? 42 : 48);
    expect(boundary.contentGap).toBeGreaterThanOrEqual(boundary.id === 'contact' ? 26 : 32);
    expect(boundary.shortRuleWidth).toBeGreaterThanOrEqual(16);
    expect(boundary.shortRuleWidth).toBeLessThan(40);
    expect(boundary.longRuleWidth).toBeGreaterThan(200);
    expect(boundary.longRuleColor).not.toBe('rgba(0, 0, 0, 0)');
  }
  await expect(page.locator('#profile')).toBeVisible();
  await expect(page.locator('#education')).toBeVisible();
  await expect(page.locator('#skills')).toBeVisible();
});

test('keeps the section rule and breathing room proportionate on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#education');
  const spacing = await page.locator('#education').evaluate((section) => {
    const heading = section.querySelector('.section-heading')!;
    const sectionStyle = getComputedStyle(section);
    const headingStyle = getComputedStyle(heading);
    return {
      topSpace: parseFloat(sectionStyle.paddingTop),
      contentGap: parseFloat(headingStyle.marginBottom),
      shortRuleWidth: parseFloat(getComputedStyle(heading, '::before').width),
      longRuleWidth: parseFloat(getComputedStyle(heading, '::after').width),
    };
  });
  expect(spacing.topSpace).toBeGreaterThanOrEqual(36);
  expect(spacing.topSpace).toBeLessThan(64);
  expect(spacing.contentGap).toBeGreaterThanOrEqual(24);
  expect(spacing.contentGap).toBeLessThan(40);
  expect(spacing.shortRuleWidth).toBeGreaterThan(8);
  expect(spacing.longRuleWidth).toBeGreaterThan(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('keeps the short section rule inside narrow tablet viewports', async ({ page }) => {
  for (const width of [601, 680, 720, 768]) {
    await page.setViewportSize({ width, height: 900 });
    const ruleLeft = await page.locator('#education .section-heading').evaluate((heading) => {
      const rule = getComputedStyle(heading, '::before');
      const probe = document.createElement('span');
      probe.style.position = 'absolute';
      probe.style.right = rule.right;
      probe.style.width = rule.width;
      probe.style.height = '1px';
      heading.append(probe);
      const left = probe.getBoundingClientRect().left;
      probe.remove();
      return left;
    });
    expect(ruleLeft, `short rule at ${width}px`).toBeGreaterThanOrEqual(0);
  }
});

test('keeps all English section dividers balanced at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await selectPhoneSetting(page, 'EN');
  for (const sectionId of ['education', 'experience', 'patent', 'skills']) {
    await page.goto(`/#${sectionId}`);
    const geometry = await page.locator(`#${sectionId} .section-heading`).evaluate((heading) => {
      const title = heading.querySelector('h2')!;
      const titleStyle = getComputedStyle(title);
      const headingBounds = heading.getBoundingClientRect();
      const titleBounds = title.getBoundingClientRect();
      const shortRule = getComputedStyle(heading, '::before');
      const longRule = getComputedStyle(heading, '::after');
      const probe = document.createElement('span');
      probe.style.position = 'absolute';
      probe.style.right = shortRule.right;
      probe.style.width = shortRule.width;
      probe.style.height = '1px';
      heading.append(probe);
      const shortRuleLeft = probe.getBoundingClientRect().left;
      probe.remove();
      return {
        titleLines: Math.round(titleBounds.height / parseFloat(titleStyle.lineHeight)),
        headingRight: headingBounds.right,
        longRuleWidth: parseFloat(longRule.width),
        shortRuleWidth: parseFloat(shortRule.width),
        shortRuleLeft,
        headingLeft: headingBounds.left,
      };
    });
    expect(geometry.titleLines, `${sectionId} heading lines`).toBe(1);
    expect(geometry.headingLeft, `${sectionId} left inset`).toBeGreaterThan(20);
    expect(geometry.headingRight, `${sectionId} right edge`).toBeLessThanOrEqual(320);
    expect(geometry.longRuleWidth, `${sectionId} long rule`).toBeGreaterThanOrEqual(16);
    expect(geometry.shortRuleWidth, `${sectionId} short rule`).toBeGreaterThan(8);
    expect(geometry.shortRuleLeft, `${sectionId} short rule left edge`).toBeGreaterThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${sectionId} page width`).toBeLessThanOrEqual(320);
  }
});

test('keeps the selected hash section when the viewport changes from desktop to phone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#skills');
  await expect(page.locator('#skills')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#skills')).toBeVisible();
  await expect(page.locator('#skills')).toBeInViewport();
  await expect(page.locator('#education')).toBeHidden();
  await expect(page.locator('#contact')).toBeHidden();
  await expect(page.locator('.mobile-dock__current')).toContainText('专业能力');
});

test('preserves the legacy project anchor within the phone experience module', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#work');
  await expect(page.locator('#experience')).toBeVisible();
  await expect(page.locator('#education')).toBeHidden();
  await expect(page.locator('#work')).toBeInViewport();
  await expect(page.locator('.mobile-dock__current')).toContainText('工作经历');

  await selectSection(page, '教育经历');
  await page.goBack();
  await expect(page.locator('#work')).toBeInViewport();
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
  const expected = ['钱美含', '概述', '教育经历', '工作经历', '专利', '专业能力', '联系', '中文', 'EN', '亮色', '暗色', '跟随系统'];
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

test('removes the standalone product-domain module and its navigation entry', async ({ page }) => {
  await expect(page.locator('#industry-context')).toHaveCount(0);
  await expect(page.getByRole('link', { name: '产品领域', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '产品领域参考' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '专业能力', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '联系', exact: true })).toBeVisible();
});

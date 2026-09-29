# Two Public Patents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present both published employer-owned utility-model patents accurately in the bilingual portfolio, and update the overview to four verified proof points.

**Architecture:** Keep the existing JSON-driven React site and local editor. Add two inventor/ownership text fields to the patent content schema, render two compact cards from the content array, and use complete drawings from the two public patent records. No backend or new dependency is needed.

**Tech Stack:** React 19, TypeScript, CSS Grid, Vite, Vitest, Playwright, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-29-two-public-patents-design.md`

---

## File map

- `public/content/site.json`: source of all bilingual metric, patent, attribution, and link data; local editor reads and writes this file.
- `src/content/types.ts` and `src/content/validateSiteContent.ts`: typed and validated patent fields.
- `src/components/PatentSection.tsx`: two-item semantic patent presentation.
- `src/styles/global.css`: four-metric strip and compact two-card patent layout, including mobile fallback.
- `tools/editor/editor.js`: Chinese captions for the new editable inventor/ownership fields.
- `public/media/patent-cn222839946u-figure.png`: complete public drawing page from [CN222839946U](https://patents.google.com/patent/CN222839946U/zh); existing `patent-cn223978857u-figure.png` stays.
- `src/content/contentPolicy.test.ts`, `src/components/sections.test.tsx`, `tests/e2e/portfolio.spec.ts`: fact, rendering, and responsive regressions.

## Task 1: Lock the intended facts with failing tests

**Files:** Modify `src/content/contentPolicy.test.ts`, `src/components/sections.test.tsx`, and `tests/e2e/portfolio.spec.ts`.

- [ ] **Step 1: Change the content-policy patent expectations.** Require exactly two ordered publications, formal Chinese titles, inventor attribution, separate assignee wording, and four metrics:

```ts
expect(siteContent.hero.metrics.map((metric) => metric.id)).toEqual([
  'experience', 'structures', 'patent', 'languages',
]);
expect(siteContent.hero.metrics.find((metric) => metric.id === 'patent')?.value.zh).toBe('2 项');
expect(siteContent.patents.map((patent) => patent.number)).toEqual([
  'CN222839946U', 'CN223978857U',
]);
expect(siteContent.patents.map((patent) => patent.title.zh)).toEqual([
  '用于BMS控制器壳体的卡扣结构和BMS控制器壳体', '电子装置',
]);
expect(siteContent.patents[0].inventors.zh).toBe('发明人：钱美含');
expect(siteContent.patents[1].inventors.zh).toBe('共同发明人：钱美含、李雪');
expect(siteContent.patents.every((patent) => patent.ownership.zh.includes('原单位'))).toBe(true);
```

- [ ] **Step 2: Add a component test** in `src/components/sections.test.tsx` after the current drawing test. Keep the existing full-drawing ratio test for CN223978857U.

```ts
it('shows both employer-owned published patents with inventor credit', async () => {
  const { validateSiteContent } = await import('../content/validateSiteContent');
  const { default: rawContent } = await import('../../public/content/site.json');
  const content = validateSiteContent(rawContent);
  const { container } = render(<PatentSection items={content.patents} locale="zh" />);

  expect(container.querySelectorAll('.patent-card')).toHaveLength(2);
  expect(screen.getByText('发明人：钱美含')).toBeInTheDocument();
  expect(screen.getByText('共同发明人：钱美含、李雪')).toBeInTheDocument();
  expect(screen.getAllByText('职务发明，专利权归原单位')).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: '查看公开专利记录' })).toHaveLength(2);
});
```

- [ ] **Step 3: Add a browser test** that checks four metric cells and two patent cards in Chinese and English; update the old one-image assertion to identify the existing image by its alt text rather than selecting the first image. Add a check that both record links use the expected Google Patents URLs.

```ts
test('shows four proof points and two verified patents in both languages', async ({ page }) => {
  await expect(page.locator('.evidence-strip__item')).toHaveCount(4);
  await expect(page.locator('.patent-card')).toHaveCount(2);
  await expect(page.locator('.patent-card a[href="https://patents.google.com/patent/CN222839946U/zh"]')).toHaveCount(1);
  await expect(page.locator('.patent-card a[href="https://patents.google.com/patent/CN223978857U/zh"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Published Patents' })).toBeVisible();
  await expect(page.locator('.evidence-strip')).toContainText('3 languages');
  await expect(page.locator('.patent-card')).toHaveCount(2);
});
```

- [ ] **Step 4: Run the focused tests and confirm red.** Run `pnpm exec vitest run src/content/contentPolicy.test.ts src/components/sections.test.tsx` and `pnpm exec playwright test tests/e2e/portfolio.spec.ts -g 'patent|overview'`. Expected: failures for the missing second patent, fields, fourth metric, and plural section heading.

## Task 2: Implement bilingual facts, attribution, and public drawing

**Files:** Modify `public/content/site.json`, `src/content/types.ts`, `src/content/validateSiteContent.ts`, `tools/editor/editor.js`; create `public/media/patent-cn222839946u-figure.png`.

- [ ] **Step 1: Add two typed fields to `PatentItem`** in `src/content/types.ts`, parse them in `patent()` in `src/content/validateSiteContent.ts`, and add their local-editor captions in `tools/editor/editor.js`:

```ts
// src/content/types.ts, inside PatentItem
inventors: LocalizedText;
ownership: LocalizedText;

// src/content/validateSiteContent.ts, inside patent() return value
inventors: localized(item.inventors, `${path}.inventors`),
ownership: localized(item.ownership, `${path}.ownership`),
```

```js
// tools/editor/editor.js, inside labels
inventors: '发明人', ownership: '权利归属',
```
- [ ] **Step 2: Change the overview data** to the exact short values below, retaining `4 年 / 4 years` and adding the fourth metric. Both labels must remain honest about language proficiency.

```json
[
  { "id": "experience", "value": { "zh": "4 年", "en": "4 years" }, "label": { "zh": "机械与产品研发经验", "en": "Mechanical and product development" } },
  { "id": "structures", "value": { "zh": "3 类", "en": "3 types" }, "label": { "zh": "冲压件、压铸件、注塑件设计", "en": "Stamped, die-cast and molded part design" } },
  { "id": "patent", "value": { "zh": "2 项", "en": "2 published" }, "label": { "zh": "公开实用新型专利", "en": "Utility model patents" } },
  { "id": "languages", "value": { "zh": "3 种语言", "en": "3 languages" }, "label": { "zh": "中文、英语、法语 B2", "en": "Chinese, English, French B2" } }
]
```

- [ ] **Step 3: Replace `patents` in `public/content/site.json`** with these two entries in publication-date order, and set `meta.updatedAt` to `2026-09-29`:

```json
[
  {
    "id": "cn222839946u-bms-housing-snap-fit",
    "number": "CN222839946U",
    "title": { "zh": "用于BMS控制器壳体的卡扣结构和BMS控制器壳体", "en": "Buckle Structure for a BMS Controller Housing and BMS Controller Housing" },
    "status": { "zh": "公开实用新型专利", "en": "Published utility model patent" },
    "summary": { "zh": "双面卡扣限制壳体连接处双向位移，降低振动或外力下的脱开风险。", "en": "A double-sided snap-fit limits movement at the housing joint and reduces disengagement risk under vibration or external force." },
    "inventors": { "zh": "发明人：钱美含", "en": "Inventor: Meihan Qian" },
    "ownership": { "zh": "职务发明，专利权归原单位", "en": "Employer-owned patent; inventor credit does not imply ownership" },
    "engineeringValue": [
      { "zh": "双面卡扣结构", "en": "Double-sided snap-fit" },
      { "zh": "壳体装配可靠性", "en": "Housing assembly reliability" }
    ],
    "sourceLabel": { "zh": "查看公开专利记录", "en": "View public patent record" },
    "sourceUrl": "https://patents.google.com/patent/CN222839946U/zh",
    "image": {
      "id": "patent-cn222839946u-figure",
      "src": "/media/patent-cn222839946u-figure.png",
      "alt": { "zh": "CN222839946U 公开专利完整附图", "en": "Complete published drawing from patent CN222839946U" },
      "credit": { "zh": "CN222839946U 公开专利文件", "en": "Published patent document CN222839946U" },
      "sourceUrl": "https://patents.google.com/patent/CN222839946U/zh",
      "usageNote": { "zh": "仅展示已公开的专利附图", "en": "Displays only the published patent drawing" }
    }
  },
  {
    "id": "cn223978857u-electronic-device",
    "number": "CN223978857U",
    "title": { "zh": "电子装置", "en": "Electronic Device" },
    "status": { "zh": "公开实用新型专利", "en": "Published utility model patent" },
    "summary": { "zh": "壳体结构固定 PCB，并通过条形槽与压接柱改善导体之间的爬电距离。", "en": "Housing features retain the PCB while a strip groove and pressure posts improve creepage distance between conductors." },
    "inventors": { "zh": "共同发明人：钱美含、李雪", "en": "Co-inventors: Meihan Qian and Xue Li" },
    "ownership": { "zh": "职务发明，专利权归原单位", "en": "Employer-owned patent; inventor credit does not imply ownership" },
    "engineeringValue": [
      { "zh": "壳体与 PCB 固定", "en": "Housing and PCB retention" },
      { "zh": "爬电距离与卡接装配", "en": "Creepage distance and snap-fit assembly" }
    ],
    "sourceLabel": { "zh": "查看公开专利记录", "en": "View public patent record" },
    "sourceUrl": "https://patents.google.com/patent/CN223978857U/zh",
    "image": {
      "id": "patent-cn223978857u-figure",
      "src": "/media/patent-cn223978857u-figure.png",
      "alt": { "zh": "CN223978857U 公开专利结构图", "en": "Public structural drawing from patent CN223978857U" },
      "credit": { "zh": "CN223978857U 公开专利文件", "en": "Published patent document CN223978857U" },
      "sourceUrl": "https://patents.google.com/patent/CN223978857U/zh",
      "usageNote": { "zh": "仅展示已公开的专利附图", "en": "Displays only the published patent drawing" }
    }
  }
]
```

- [ ] **Step 4: Obtain the second image from the published patent document.** The [original public PDF](https://patentimages.storage.googleapis.com/12/78/39/2ecd9e3767cb11/CN222839946U.pdf) has three drawing pages. Use the bundled Poppler renderer for the first complete drawing page (PDF page 8), visually inspect the PNG, then copy it as the local asset. Keep the existing full drawing image for CN223978857U.

```bash
curl -L --fail 'https://patentimages.storage.googleapis.com/12/78/39/2ecd9e3767cb11/CN222839946U.pdf' -o /tmp/cn222839946u-source.pdf
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm -f 8 -l 8 -r 130 -png -singlefile /tmp/cn222839946u-source.pdf /tmp/cn222839946u-figure
cp /tmp/cn222839946u-figure.png public/media/patent-cn222839946u-figure.png
```
- [ ] **Step 5: Run content and media tests.** Run `pnpm exec vitest run src/content/contentPolicy.test.ts src/content/mediaPolicy.test.ts`. Expected: pass with two traceable local patent images and no private material in the new content.
- [ ] **Step 6: Commit the data/schema/asset change** with `git add` paths explicitly; leave the pre-existing `tmp/` directory untouched.

## Task 3: Render compact cards and preserve the first viewport

**Files:** Modify `src/components/PatentSection.tsx`, `src/styles/global.css`, `src/components/sections.test.tsx`, `tests/e2e/portfolio.spec.ts`.

- [ ] **Step 1: Render the two new fields and plural heading** in `PatentSection`, retaining semantic article/figure/link markup and `rel="noopener noreferrer"`. Replace the current returned JSX with:

```tsx
return (
  <section className="content-section patent-section" id="patent">
    <SectionHeading title={locale === 'zh' ? '公开专利' : 'Published Patents'} />
    <div className="patent-list">
      {items.map((item) => (
        <article key={item.id} className="patent-card">
          <figure className="patent-card__figure">
            <img
              src={item.image.src}
              alt={localized(item.image.alt, locale)}
              width="729"
              height="1000"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{localized(item.image.credit, locale)}</figcaption>
          </figure>
          <div className="patent-card__body">
            <p className="patent-card__status">
              <BadgeCheck aria-hidden="true" size={17} />
              {localized(item.status, locale)}
            </p>
            <p className="patent-card__number">{item.number}</p>
            <h3>{localized(item.title, locale)}</h3>
            <p>{localized(item.summary, locale)}</p>
            <p className="patent-card__inventors">{localized(item.inventors, locale)}</p>
            <p className="patent-card__ownership">{localized(item.ownership, locale)}</p>
            <ul>
              {item.engineeringValue.map((value) => (
                <li key={value.zh}>{localized(value, locale)}</li>
              ))}
            </ul>
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              {localized(item.sourceLabel, locale)}
              <ArrowUpRight aria-hidden="true" size={15} />
            </a>
          </div>
        </article>
      ))}
    </div>
  </section>
);
```

- [ ] **Step 2: Add layout CSS** after the current evidence-strip and patent-card blocks, then use the existing narrow-screen media rules to retain the one-per-row metric layout. A single patent-card column starts below 1100 px so the long formal title remains readable:

```css
.evidence-strip {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-bottom: 1.4rem;
}

.evidence-strip__item {
  padding-block: 0.8rem;
}

.evidence-strip__item strong {
  font-size: clamp(1.7rem, 2.5vw, 2.4rem);
}

.patent-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.patent-card {
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-content: start;
  align-items: start;
  border-top: 1px solid var(--color-line-strong);
  padding-top: 1rem;
}

.patent-card__figure img {
  max-height: 15rem;
  object-fit: contain;
}

.patent-card h3 {
  font-size: clamp(1.25rem, 2vw, 1.65rem);
}

.patent-card__inventors {
  color: var(--color-ink) !important;
  font-weight: 620;
}

.patent-card__ownership {
  font-size: 0.78rem;
}

@media (max-width: 1100px) {
  .patent-list { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 820px) {
  .evidence-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```

At `max-width: 480px`, the existing `.evidence-strip { grid-template-columns: 1fr; }` rule is later in the stylesheet and continues to override the four-column desktop rule.
- [ ] **Step 3: Run the focused unit and browser tests.** Run `pnpm exec vitest run src/components/sections.test.tsx` and `pnpm exec playwright test tests/e2e/portfolio.spec.ts -g 'patent|overview|horizontal overflow'`. Expected: all pass; if the four-item metric strip extends below 650 px, reduce only evidence-strip vertical padding or metric type/line spacing until the existing `1366 × 650` test passes without hiding content.
- [ ] **Step 4: Inspect both languages visually** at 1366 × 650 and 1440 × 900 desktop, and 360 × 800 mobile. Confirm the full overview is visible at the compact desktop size, patent images are not cropped, patent cards remain balanced, English titles and links wrap cleanly, and the page has no horizontal overflow.
- [ ] **Step 5: Commit the component/style/test change** with an explicit path list.

## Task 4: Verify and publish

**Files:** No further production files unless a check reveals a specific defect.

- [ ] **Step 1: Run `pnpm check` and `pnpm test:e2e`.** Expected: exit code 0 for unit tests, TypeScript/build, and browser suite. Run `git diff --check`; expected: no output.
- [ ] **Step 2: Verify the only new public material is the second patent's published drawing, text, and links.** Confirm neither downloadable résumé was edited and no customer CAD, internal figure, or user-owned `tmp/` file was staged.
- [ ] **Step 3: Push the verified commits** to the site's `main` branch using the existing qianmeihan GitHub account, then restore the previous active `gh` account.
- [ ] **Step 4: Confirm GitHub Pages deployment and live content.** Wait for the workflow to succeed at the pushed commit, then load `https://qianmeihan.github.io/` and verify two record links, four bilingual metrics, and the published images on the deployed page.

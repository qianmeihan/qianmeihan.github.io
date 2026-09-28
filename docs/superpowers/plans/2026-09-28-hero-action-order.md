# Hero Action Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the current six-button hero at three columns by two rows on desktop, with Contact me and Learn more in the last two positions and the same muted style.

**Architecture:** Keep link data in `public/content/site.json` unchanged. Change `HeroSection` rendering order, which also controls keyboard order and responsive row-major order. Apply the existing `text-link` class to both final actions. Lock the order and style in existing component and browser tests.

**Tech Stack:** React, TypeScript, Vitest, Playwright, CSS Grid.

---

### Task 1: Lock the six-link order in a failing test

**Files:**
- Modify: `src/App.test.tsx`

- [x] **Step 1: Update the existing `groups the six hero actions` test**

Replace its expected `href` array with:

```ts
[
  '/downloads/meihan-qian-resume.pdf',
  '/downloads/meihan-qian-resume-en.pdf',
  'https://www.linkedin.com/in/qianmeihan/',
  'https://github.com/qianmeihan',
  '#contact',
  '#education',
]
```

Store that array as `expectedOrder`, assert against it, then add this assertion after clicking the `EN` language button:

```ts
await userEvent.setup().click(screen.getByRole('button', { name: 'EN' }));
expect(within(actions as HTMLElement).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(expectedOrder);
```

- [x] **Step 2: Verify the test fails for order mismatch**

Run: `pnpm exec vitest run src/App.test.tsx -t 'groups the six hero actions'`

Expected: one failed assertion showing `#education` in the old third position.

- [x] **Step 3: Add a failing style assertion**

After the order assertions, check that both final anchors use the existing secondary class:

```ts
expect(within(actions as HTMLElement).getByRole('link', { name: '联系我' })).toHaveClass('text-link');
expect(within(actions as HTMLElement).getByRole('link', { name: '了解更多' })).toHaveClass('text-link');
```

Run the same focused Vitest command. Expected: Contact me lacks `text-link`.

### Task 2: Render the approved order

**Files:**
- Modify: `src/components/HeroSection.tsx`

- [x] **Step 1: Move the social-link render before the two in-page links**

Inside `.hero-actions`, preserve the resume render first. Next render the current non-resume, non-email profile links. Then render `#contact`, followed by `#education`, preserving their existing labels, icons, and classes. The final JSX order is:

```tsx
{profile.links.filter((link) => link.id === 'resume' || link.id === 'resume-en').map(renderProfileLink)}
{profile.links.filter((link) => !['resume', 'resume-en', 'email'].includes(link.id)).map(renderProfileLink)}
<a className="text-link" href="#contact">
  <Mail aria-hidden="true" size={18} />
  {locale === 'zh' ? '联系我' : 'Contact me'}
</a>
<a className="text-link" href="#education">
  {locale === 'zh' ? '了解更多' : 'Learn more'}
  <ArrowDown aria-hidden="true" size={15} />
</a>
```

- [x] **Step 2: Verify the unit test passes**

Run: `pnpm exec vitest run src/App.test.tsx -t 'groups the six hero actions'`

Expected: the focused test passes.

### Task 3: Verify behavior and publish

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`

- [x] **Step 1: Add the browser-level link-order assertion**

Within `shows core recruiter information in Chinese`, change the `.button-link` count assertion to four, assert both final links have `text-link`, and add:

```ts
await expect(page.locator('.hero-actions a')).toHaveCount(6);
expect(await page.locator('.hero-actions a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual([
  '/downloads/meihan-qian-resume.pdf',
  '/downloads/meihan-qian-resume-en.pdf',
  'https://www.linkedin.com/in/qianmeihan/',
  'https://github.com/qianmeihan',
  '#contact',
  '#education',
]);
```

- [x] **Step 2: Run project verification**

Run: `pnpm check` and `pnpm test:e2e`.

Expected: exit code 0 and no test failures. Inspect Chinese and English hero at wide and phone widths, in both themes. Confirm both final buttons have the same muted color and border, with no horizontal overflow or label wrapping regression.

- [ ] **Step 3: Commit and push**

Run `git add src/App.test.tsx src/components/HeroSection.tsx tests/e2e/portfolio.spec.ts docs/superpowers/plans/2026-09-28-hero-action-order.md`, commit with `Reorder hero actions with calls to action last`, then push `main` to the existing GitHub Pages repository. Do not stage the pre-existing `tmp/` directory.

- [ ] **Step 4: Verify publication**

Fetch `https://qianmeihan.github.io/` and its deployed asset; confirm the page loads. If deployment is pending, report that explicitly rather than claim completion.

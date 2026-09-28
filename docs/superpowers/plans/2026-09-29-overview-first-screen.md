# Overview First Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the full Overview, including all three proof points, without scrolling at 1366 × 650 on desktop in Chinese and English.

**Architecture:** The existing `HeroSection` already renders the complete overview. Reduce only the desktop hero's reserved vertical height in CSS; add one browser regression test that measures the bottom of the proof-point strip against the viewport.

**Tech Stack:** CSS Grid, React, Playwright, Vite.

---

### Task 1: Add a failing viewport test

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`

- [x] **Step 1: Add the test after the desktop hero composition test**

```ts
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
```

- [x] **Step 2: Verify it fails on the old layout**

Run: `pnpm exec playwright test tests/e2e/portfolio.spec.ts -g 'fits the complete overview'`

Expected: the proof-point strip bottom is greater than 650 px.

### Task 2: Reduce reserved hero height

**Files:**
- Modify: `src/styles/global.css`

- [x] **Step 1: Shorten only the desktop hero height and block padding**

```css
@media (min-width: 821px) {
  .hero-section {
    min-height: min(540px, 76dvh);
    padding-block: clamp(2rem, 3vw, 2.75rem);
  }
}
```

Add this override after the existing `.hero-section` block. The mobile layout, typography, portrait width, grid columns, and content remain unchanged.

- [x] **Step 2: Verify green**

Run: `pnpm exec playwright test tests/e2e/portfolio.spec.ts -g 'fits the complete overview'`

Expected: 1 test passes in Chinese and English.

### Task 3: Full verification and publication

**Files:**
- No additional production files.

- [x] **Step 1: Run full checks**

Run: `pnpm check` and `pnpm test:e2e`.

Expected: exit code 0 for both commands. Confirm desktop 1366 × 650 and 1440 × 900 visually, and phone 360 × 800 remains readable with no horizontal overflow.

- [ ] **Step 2: Commit and push the scoped changes**

Stage `docs/superpowers/plans/2026-09-29-overview-first-screen.md`, `src/styles/global.css`, and `tests/e2e/portfolio.spec.ts` only; do not stage the pre-existing `tmp/` directory. Commit with `Fit complete overview in compact desktop viewport`, then push to the existing GitHub Pages `main` branch.

- [ ] **Step 3: Confirm the deployment and live page**

Wait for the GitHub Pages action at the new commit to complete successfully. Load `https://qianmeihan.github.io/` and confirm the deployed JS/CSS assets changed and the live layout passes the 1366 × 650 geometry check.

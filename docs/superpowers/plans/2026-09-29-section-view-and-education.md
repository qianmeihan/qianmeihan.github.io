# Section Views and Education Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep one portfolio URL while showing one selected module at a time, and expand the education module with verified, privacy-safe coursework.

**Architecture:** The active module is derived from the URL hash and rendered conditionally in `App`; `SiteNav` receives the active id instead of observing a long page. Education data stays in editable bilingual JSON and is validated before rendering. No router, CMS, transcript asset, or mentor claim is added.

**Tech Stack:** React 19, TypeScript, Vite, CSS, Vitest, Playwright, GitHub Pages.

---

## File map

- Create `src/lib/sectionNavigation.ts`: stable section ids, hash parsing, localized names.
- Create `src/lib/sectionNavigation.test.ts`: valid/unknown hash behavior.
- Modify `src/App.tsx`, `src/components/SiteNav.tsx`: one active view and navigation state.
- Modify `src/App.test.tsx`, `tests/e2e/portfolio.spec.ts`: view switching, direct hash, back/forward, CTA links, localization, a11y and image-loading regression.
- Modify `src/content/types.ts`, `src/content/validateSiteContent.ts`, `src/content/loadSiteContent.test.ts`: bilingual education courses.
- Modify `public/content/site.json`, `src/content/contentPolicy.test.ts`: verified selected courses, French degree and 2021-2022 period without grades or identifiers.
- Modify `src/components/EducationSection.tsx`, `src/components/sections.test.tsx`, `src/styles/global.css`, `tools/editor/editor.js`: education presentation and editable field label.
- Modify `README.md`: explain same-page views and private transcript boundary.

### Task 1: Hash-backed section state

- [ ] **Step 1: Write failing hash tests.** In `src/lib/sectionNavigation.test.ts`, assert `sectionFromHash('') === 'profile'`, `sectionFromHash('#education') === 'education'`, and unknown hashes fall back to `profile`.
- [ ] **Step 2: Run RED.** `pnpm exec vitest run src/lib/sectionNavigation.test.ts`; expected failure because the module does not exist.
- [ ] **Step 3: Implement the utility.** Export the exact eight existing ids and a guarded parser:

```ts
export const sectionIds = ['profile', 'education', 'experience', 'work', 'patent', 'skills', 'industry-context', 'contact'] as const;
export type SectionId = (typeof sectionIds)[number];
export function sectionFromHash(hash: string): SectionId {
  const id = hash.replace(/^#/, '');
  return sectionIds.includes(id as SectionId) ? id as SectionId : 'profile';
}
```
- [ ] **Step 4: Run GREEN.** The focused utility test passes.
- [ ] **Step 5: Write failing App tests.** Assert that initial `#education` renders education and not experience; clicking or changing to `#patent` renders patent only; `hashchange` back to `#profile` restores overview.
- [ ] **Step 6: Run RED.** `pnpm exec vitest run src/App.test.tsx`; the new view assertions fail against the current long page.
- [ ] **Step 7: Implement view switching.** Initialize active id from `window.location.hash`; subscribe to `hashchange` and `popstate`; render only the matching existing section in `<main>`. Give `<main>` `tabIndex={-1}` and an accessible localized name; focus it and scroll to the top after a real module switch (not on first load). Pass active id to `SiteNav` and remove its `IntersectionObserver` state. Adapt old App tests that relied on all modules being rendered at once.

```tsx
const [activeSection, setActiveSection] = useState<SectionId>(() => sectionFromHash(window.location.hash));
useEffect(() => {
  const sync = () => setActiveSection(sectionFromHash(window.location.hash));
  window.addEventListener('hashchange', sync);
  window.addEventListener('popstate', sync);
  return () => {
    window.removeEventListener('hashchange', sync);
    window.removeEventListener('popstate', sync);
  };
}, []);
// A switch on activeSection renders exactly one of the existing section components.
```
- [ ] **Step 8: Run GREEN.** Focused App and navigation tests pass. Commit only these files with `git add` paths and `git commit -m "Switch portfolio modules within one page"`.

### Task 2: Verified education content model

- [ ] **Step 1: Write failing content tests.** Require `education[0].courses` to be a bilingual array; reject a course missing `en`. Assert the published JSON contains the selected courses and the Toulouse degree and period, but no grade/GPA/student number/transcript URL.
- [ ] **Step 2: Run RED.** `pnpm exec vitest run src/content/loadSiteContent.test.ts src/content/contentPolicy.test.ts` fails for absent course fields.
- [ ] **Step 3: Implement the schema.** Add `courses: LocalizedText[]` to `EducationItem`; parse with `localizedArray(item.courses, path)`; add editor label `courses: '精选课程'`.

```ts
// EducationItem
courses: LocalizedText[];
// education() return value
courses: localizedArray(item.courses, `${path}.courses`),
// editor labels
courses: '精选课程',
```
- [ ] **Step 4: Update JSON.** NEU courses: 工程图学基础, 材料力学, 动力学, 材料性能, 计算机辅助设计 (CAD). Toulouse courses: 机械学, 连续介质力学, 机械设计, 材料, 制造工艺, 结构. Provide concise English translations; change Toulouse period to 2021-2022 and degree to 机械学学士（航空机械工程方向） / Bachelor's degree in Mechanics, Aeronautical Mechanical Engineering track. Do not copy private PDF files into the repo. Each course entry has the existing `{ "zh": "...", "en": "..." }` shape.
- [ ] **Step 5: Run GREEN.** Content tests pass. Commit explicit paths with `git commit -m "Add verified education coursework"`.

### Task 3: Education view and responsive layout

- [ ] **Step 1: Write failing component test.** Render `EducationSection` with validated site content; assert two school cards, selected Chinese course names, and English equivalents after locale switch.
- [ ] **Step 2: Run RED.** `pnpm exec vitest run src/components/sections.test.tsx` fails because courses are not rendered.
- [ ] **Step 3: Render a full education view.** Keep the two school logos, dates and degrees; add a brief factual lead; add a titled course list per school using `item.courses.map(localized)`; no marks, identifiers or mentor names.

```tsx
<h4>{locale === 'zh' ? '相关课程' : 'Selected coursework'}</h4>
<ul className="education-card__courses">
  {item.courses.map((course) => <li key={course.zh}>{localized(course, locale)}</li>)}
</ul>
```
- [ ] **Step 4: Style the view.** Keep existing green/neutral tokens, typography and sidebar; make the active module fill available content height without forcing long content into one viewport. Maintain 2-column school layout on desktop and 1-column on phone. Ensure long English degree/course labels wrap cleanly.
- [ ] **Step 5: Run GREEN.** Focused component tests pass. Commit explicit paths with `git commit -m "Expand education view with selected courses"`.

### Task 4: Browser regression and publish

- [ ] **Step 1: Update E2E tests before final run.** Change tests that previously assumed every section was in the DOM. Add checks for one active section, direct `#education`, hash navigation, back/forward, active nav state, CTA targets, desktop and phone overflow, and bilingual education content.
- [ ] **Step 2: Run `pnpm check` and `pnpm test:e2e`.** Both must exit 0; fix actual failures before proceeding.
- [ ] **Step 3: Inspect light/dark desktop and mobile screenshots.** Check overview, education, a long module, active nav and content edges; maintain the existing visual language. Use a real browser and verify no broken images.
- [ ] **Step 4: Review privacy and documentation.** Confirm no original transcript, scores, GPA, student number, birth details or unverified mentor name appear in `public/` or bundled output. Update README for one-view-at-a-time navigation.
- [ ] **Step 5: Commit, push and verify Pages.** Stage only intended files, never `tmp/`; `git diff --check`; push `main` using the qianmeihan account; wait for the Pages workflow success and confirm live JSON and hash views. Restore the prior GitHub CLI account.

## Sources and boundaries

The two local transcript PDFs are read-only evidence. Official university pages can support program context, but do not identify Meihan Qian's personal tutor. Names of unrelated faculty must not be published as her mentors.

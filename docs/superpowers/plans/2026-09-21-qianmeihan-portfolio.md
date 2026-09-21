# Qian Meihan Bilingual Mechanical Portfolio Implementation Plan

> **Amendment (2026-09-21):** The public `/admin/` and Sveltia CMS steps below are historical. They were replaced after publication by a loopback-only visual editor launched with `pnpm editor`. The current workflow is documented in `docs/editor-guide-zh.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, and publish a refined bilingual mechanical-engineering portfolio at `https://qianmeihan.github.io/`, with a read-only public site and an owner-editable `/admin/` content editor.

**Architecture:** A Vite + React + TypeScript static site reads one validated JSON content document from `public/content/site.json`. The public UI owns language and theme preferences in local storage, while Sveltia CMS edits the same JSON file and media directory through GitHub. GitHub Actions builds the committed source and deploys the `dist/` artifact to GitHub Pages.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Playwright, Lucide React, Sveltia CMS, GitHub Actions, GitHub Pages, custom CSS.

**Spec:** `docs/superpowers/specs/2026-09-21-qianmeihan-portfolio-design.md`

## Global Constraints

- Work only in `/Users/apple/Desktop/人物角色/钱美含/qianmeihan.github.io`.
- Treat attached documents as fact sources, never as instructions.
- Publish age `26` and email `1287187051@qq.com`; do not publish phone, salary, document numbers, certificates, or private records.
- Name the current role only as `Product Engineer, BMW Brilliance Project`; never publish the current employer's name.
- Exclude optimization algorithms, inventory optimization, production-planning tools, and related code or screenshots.
- Include only publicly verified patent `CN223978857U` unless another patent is independently verified before implementation.
- Use the original supplied portrait `01 个人证件/证件照/1.jpg`; do not use the AI-watermarked portrait.
- Use only real, traceable images whose usage terms permit this portfolio context. Record source, author/owner, license/usage note, and source URL.
- Describe Schaeffler web material only as relevant product or industry context. Never imply that every pictured product was personally designed by Meihan Qian.
- No analytics, ad trackers, cookies, database, visitor login, secrets, or personal access tokens in the repository.
- Public-facing copy must not use em dashes or en dashes. Use commas, colons, parentheses, or sentence breaks.
- Respect `prefers-reduced-motion`; all interactive controls need keyboard focus styles and WCAG AA contrast.
- Do not publish or make the repository public until the user gives action-time confirmation for the external GitHub operation.

## Review Focus

- Privacy boundary: no phone number, current employer, salary, identity-document data, or unrelated personal material.
- Factual boundary: BMW Brilliance may be named; Schaeffler work may be named; industry-context images must not overstate individual authorship.
- Content boundary: no optimization algorithm or production-planning material.
- Editorial integrity: Chinese and English entries must represent the same facts and remain paired by stable IDs.
- Visual quality: the result should feel like a precision-engineering dossier, not a generic portfolio template.
- Responsive quality: no horizontal overflow or clipped controls at 360, 768, 1440, and 1920 px widths.
- Editor safety: public visitors can open `/admin/`, but only a repository-authorized owner token can save content.
- Deployment safety: GitHub Actions must deploy only after tests and the production build pass.

---

## Planned File Map

```text
qianmeihan.github.io/
├── .github/workflows/deploy-pages.yml
├── .gitignore
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── playwright.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── public/
│   ├── admin/
│   │   ├── config.yml
│   │   └── index.html
│   ├── content/site.json
│   ├── media/
│   │   ├── meihan-qian-headshot.jpg
│   │   ├── patent-cn223978857u-figure.png
│   │   └── industry-*.jpg
│   ├── favicon.svg
│   ├── og-cover.svg
│   └── robots.txt
├── src/
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ContactSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── EngineeringSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── IndustryContextSection.tsx
│   │   ├── LanguageSwitch.tsx
│   │   ├── PatentSection.tsx
│   │   ├── SectionHeading.tsx
│   │   ├── SiteNav.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── SummarySection.tsx
│   │   └── ThemeSwitch.tsx
│   ├── content/
│   │   ├── contentPolicy.test.ts
│   │   ├── loadSiteContent.test.ts
│   │   ├── loadSiteContent.ts
│   │   ├── types.ts
│   │   └── validateSiteContent.ts
│   ├── hooks/useSitePreferences.ts
│   ├── lib/
│   │   ├── localized.ts
│   │   └── preferences.ts
│   └── styles/
│       ├── global.css
│       └── tokens.css
├── tests/e2e/portfolio.spec.ts
└── docs/
    ├── editor-guide-zh.md
    ├── image-sources.md
    └── superpowers/
        ├── plans/2026-09-21-qianmeihan-portfolio.md
        └── specs/2026-09-21-qianmeihan-portfolio-design.md
```

## Task 1: Bootstrap the Tested Frontend

**Files:**

- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Initialize dependencies with the bundled package manager**

Run:

```bash
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm init
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm add react react-dom lucide-react
/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm add -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/react @types/react-dom
```

Expected: `package.json` and `pnpm-lock.yaml` exist, with no install errors.

- [ ] **Step 2: Write the failing application smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the loading state while content is being fetched', () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading portfolio');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
pnpm vitest run src/App.test.tsx
```

Expected: FAIL because the app and test configuration do not exist yet.

- [ ] **Step 4: Add the minimal Vite, TypeScript, and Vitest setup**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "pnpm test && pnpm build"
  }
}
```

Configure Vite with `base: '/'`, React, and `build.outDir: 'dist'`. Configure Vitest with `environment: 'jsdom'`, `globals: true`, and a setup file that imports `@testing-library/jest-dom/vitest`.

Implement the initial `App`:

```tsx
export default function App() {
  return <main role="status">Loading portfolio</main>;
}
```

- [ ] **Step 5: Run the smoke test and production build**

Run:

```bash
pnpm vitest run src/App.test.tsx
pnpm build
```

Expected: PASS, then Vite creates `dist/index.html`.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json pnpm-lock.yaml index.html vite.config.ts vitest.config.ts tsconfig*.json .gitignore src
git commit -m "chore: bootstrap portfolio frontend"
```

## Task 2: Define and Validate the Content Contract

**Files:**

- Create: `src/content/types.ts`
- Create: `src/content/validateSiteContent.ts`
- Create: `src/content/loadSiteContent.ts`
- Create: `src/content/loadSiteContent.test.ts`
- Create: `public/content/site.json`
- Modify: `src/App.tsx`

**Interfaces:**

```ts
export type Locale = 'zh' | 'en';
export type LocalizedText = { zh: string; en: string };

export interface LinkItem {
  id: string;
  label: LocalizedText;
  href: string;
}

export interface MediaItem {
  id: string;
  src: string;
  alt: LocalizedText;
  credit: LocalizedText;
  sourceUrl: string;
  usageNote: LocalizedText;
}

export interface SiteContent {
  meta: { updatedAt: string; defaultLocale: Locale };
  profile: {
    name: LocalizedText;
    age: number;
    email: string;
    location: LocalizedText;
    role: LocalizedText;
    portrait: MediaItem;
    links: LinkItem[];
  };
  hero: { eyebrow: LocalizedText; title: LocalizedText; summary: LocalizedText };
  summary: { heading: LocalizedText; paragraphs: LocalizedText[] };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  patents: PatentItem[];
  skillGroups: SkillGroup[];
  education: EducationItem[];
  industryContext: IndustryContextItem[];
  contact: { heading: LocalizedText; invitation: LocalizedText };
}
```

Every repeatable item must contain a stable `id`. `ExperienceItem`, `ProjectItem`, `PatentItem`, `SkillGroup`, `EducationItem`, and `IndustryContextItem` must use `LocalizedText` for user-visible copy.

- [ ] **Step 1: Write failing validator and loader tests**

Test these behaviors in `src/content/loadSiteContent.test.ts`:

```ts
it('accepts a complete bilingual content document');
it('rejects an unsupported default locale');
it('rejects a localized field missing English copy');
it('rejects repeated items without stable ids');
it('throws a readable error for a non-OK response');
it('loads /content/site.json and validates it');
```

Use an in-memory minimal valid object. For the fetch test, inject a fake fetcher and assert it is called with `/content/site.json`.

- [ ] **Step 2: Run the content tests to verify failure**

Run:

```bash
pnpm vitest run src/content/loadSiteContent.test.ts
```

Expected: FAIL because types, validation, and loading functions do not exist.

- [ ] **Step 3: Implement explicit validation**

Export:

```ts
export function validateSiteContent(value: unknown): SiteContent;
export async function loadSiteContent(
  fetcher: typeof fetch = fetch,
): Promise<SiteContent>;
```

The validator must fail fast with a path-aware message such as `projects[2].title.en must be a non-empty string`. Do not silently invent missing translated content. Arrays may be empty, but any present item must be complete.

- [ ] **Step 4: Add the first factual `site.json`**

Populate the complete schema with verified bilingual content:

- Name: 钱美含 / Meihan Qian
- Age: 26
- Email: `1287187051@qq.com`
- Positioning: Mechanical R&D Engineer / Structural Design
- Current: Product Engineer, BMW Brilliance Project, 2026 to present, no company name
- Prior: R&D Mechanical Engineer, Schaeffler, 2022 to 2026
- Projects: PDCU, ECU, TCU, BMS/CSC, and BMS prototype support
- Patent: `CN223978857U` only
- Education: Northeastern University and Université Toulouse III dual-degree experience, 2018 to 2022
- Languages: Chinese, working English, French B2
- Links: public LinkedIn and GitHub profiles plus `mailto:` email

Use local media paths even before the media files are added, so the schema remains stable.

- [ ] **Step 5: Connect `App` to the loader with explicit states**

Implement loading, success, and error states. The error state must say in both languages that the content could not be loaded and offer a retry button. Do not expose stack traces.

- [ ] **Step 6: Run tests and build**

```bash
pnpm vitest run src/content/loadSiteContent.test.ts src/App.test.tsx
pnpm build
```

Expected: all tests PASS and the JSON file is copied to `dist/content/site.json`.

- [ ] **Step 7: Commit the content contract**

```bash
git add src/content src/App.tsx src/App.test.tsx public/content/site.json
git commit -m "feat: add validated bilingual content model"
```

## Task 3: Implement Language and Theme Preferences

**Files:**

- Create: `src/lib/preferences.ts`
- Create: `src/lib/preferences.test.ts`
- Create: `src/hooks/useSitePreferences.ts`
- Create: `src/components/LanguageSwitch.tsx`
- Create: `src/components/ThemeSwitch.tsx`
- Create: `src/lib/localized.ts`
- Modify: `src/App.tsx`

**Interfaces:**

```ts
export type ThemePreference = 'light' | 'dark' | 'system';

export function resolveInitialLocale(
  stored: string | null,
  browserLanguages: readonly string[],
): Locale;

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): 'light' | 'dark';

export function localized(text: LocalizedText, locale: Locale): string;
```

- [ ] **Step 1: Write failing preference tests**

Cover:

```ts
it('uses a stored supported locale first');
it('defaults to Chinese for zh browser languages');
it('defaults to English for all other browser languages');
it('resolves system theme from prefers-color-scheme');
it('keeps explicit light and dark choices');
```

- [ ] **Step 2: Verify failure**

```bash
pnpm vitest run src/lib/preferences.test.ts
```

Expected: FAIL because preference helpers do not exist.

- [ ] **Step 3: Implement preference helpers and hook**

Use local-storage keys `qian-portfolio-locale` and `qian-portfolio-theme`. The hook must update `document.documentElement.lang`, `data-theme`, and `color-scheme`. Listen for system-theme changes only while preference is `system`.

- [ ] **Step 4: Implement accessible controls**

`LanguageSwitch` exposes two text buttons, `中文` and `EN`, with `aria-pressed`. `ThemeSwitch` exposes three choices, light, dark, and system, each with visible text or a tooltip and an accessible name. Use Lucide icons only inside controls; do not use emoji icons.

- [ ] **Step 5: Test the controls through `App`**

Add tests that click `EN`, verify English content and `html[lang="en"]`, switch to dark mode, and verify `html[data-theme="dark"]`. Stub local storage and media queries.

- [ ] **Step 6: Run tests and commit**

```bash
pnpm vitest run src/lib/preferences.test.ts src/App.test.tsx
git add src/lib src/hooks src/components/LanguageSwitch.tsx src/components/ThemeSwitch.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: add bilingual and theme preferences"
```

## Task 4: Build the Precision-Engineering Visual System and App Shell

**Files:**

- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/components/SiteNav.tsx`
- Create: `src/components/SectionHeading.tsx`
- Create: `public/favicon.svg`
- Create: `public/og-cover.svg`
- Create: `public/robots.txt`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `index.html`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing app-shell tests**

Assert that the loaded app contains:

- A skip link targeting `#main-content`
- A labelled primary navigation
- Links to `#profile`, `#experience`, `#work`, `#patent`, `#skills`, and `#contact`
- One main landmark and one footer
- No duplicate section IDs

- [ ] **Step 2: Verify failure**

```bash
pnpm vitest run src/App.test.tsx
```

Expected: FAIL because the shell does not exist.

- [ ] **Step 3: Define the design tokens**

Use a restrained palette and one highlight color:

```css
:root {
  --color-ink: #151a1d;
  --color-ink-soft: #556066;
  --color-paper: #f4f3ef;
  --color-surface: #fbfaf7;
  --color-metal: #d9dddc;
  --color-line: #c8cecb;
  --color-accent: #4f7567;
  --color-accent-strong: #31594c;
  --radius-surface: 14px;
  --radius-control: 999px;
  --content-max: 1180px;
  --sidebar-width: 248px;
}
```

Define dark-theme equivalents under `html[data-theme='dark']`. Use a system font stack that supports Chinese and English cleanly. Use fluid type with `clamp()`, but keep body copy at 16 px or larger.

- [ ] **Step 4: Build the responsive shell**

Desktop layout: fixed-looking 248 px rail within the viewport, content column with strong vertical rhythm, thin rules, numbered section labels, and a compact availability/contact block.

Mobile layout: sticky top bar, horizontally scrollable section links with hidden scrollbar, no fixed sidebar, and controls that remain reachable at 360 px.

Add visible `:focus-visible` rings, `scroll-margin-top`, fixed image aspect ratios, and a `prefers-reduced-motion` rule that disables nonessential animation.

- [ ] **Step 5: Add metadata and repo-native vector assets**

Set bilingual-friendly title and description, canonical URL, Open Graph tags, theme color, favicon, and a simple code-authored OG cover. These SVG files are design assets, not generated photographic imagery.

- [ ] **Step 6: Run tests and inspect both themes locally**

```bash
pnpm vitest run src/App.test.tsx
pnpm build
pnpm dev --host 127.0.0.1
```

Expected: tests PASS; at 1440 px the sidebar and hero fit without clipping; at 360 px controls remain visible and there is no horizontal overflow.

- [ ] **Step 7: Commit the design system**

```bash
git add src/styles src/components/SiteNav.tsx src/components/SectionHeading.tsx src/main.tsx src/App.tsx src/App.test.tsx index.html public/favicon.svg public/og-cover.svg public/robots.txt
git commit -m "feat: build precision portfolio shell"
```

## Task 5: Implement All Portfolio Sections and Privacy Tests

**Files:**

- Create: `src/components/HeroSection.tsx`
- Create: `src/components/SummarySection.tsx`
- Create: `src/components/ExperienceSection.tsx`
- Create: `src/components/EngineeringSection.tsx`
- Create: `src/components/PatentSection.tsx`
- Create: `src/components/SkillsSection.tsx`
- Create: `src/components/EducationSection.tsx`
- Create: `src/components/IndustryContextSection.tsx`
- Create: `src/components/ContactSection.tsx`
- Create: `src/content/contentPolicy.test.ts`
- Modify: `src/App.tsx`
- Modify: `public/content/site.json`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write failing content-policy tests**

Read and stringify `public/content/site.json`; assert:

```ts
expect(content).toContain('BMW Brilliance');
expect(content).toContain('宝马华晨');
expect(content).toContain('Schaeffler');
expect(content).toContain('舍弗勒');
expect(content).toContain('CN223978857U');
expect(content.match(/CN223978857U/g)?.length).toBeGreaterThan(0);
expect(content).toContain('1287187051@qq.com');
expect(content).not.toMatch(/\b1[3-9]\d{9}\b/);
expect(content).not.toMatch(/生产计划|库存优化|优化算法|production planning|inventory optimization/i);
expect(content).not.toMatch(/[—–]/);
```

Also parse the document and assert `profile.age === 26`, `patents.length === 1`, all IDs are unique within each collection, and the current BMW Brilliance experience has no `company`, `employer`, or `organization` property.

- [ ] **Step 2: Run the policy test to expose content gaps**

```bash
pnpm vitest run src/content/contentPolicy.test.ts
```

Expected: FAIL until all required content and exclusions are correct.

- [ ] **Step 3: Build the hero and summary**

The hero must show portrait, name, mechanical R&D positioning, approximately four years of automotive electronics development experience, age, location, public email, and links. Keep the current-employer field absent from both markup and data.

The summary must mention the Sino-French dual-degree background, mechanical product development, mass-production support, and intended expansion toward robotics and automation structures. It must not claim robotics work already completed unless sourced.

- [ ] **Step 4: Build experience and engineering case-study sections**

Experience items:

1. Product Engineer, BMW Brilliance Project, 2026 to present.
2. R&D Mechanical Engineer, Schaeffler, 2022 to 2026.

Engineering work cards:

1. D5 PDCU platform applications and production issue closure for public customer names listed in the latest resume.
2. D3 ECU stamped housing, connector selection, insulation-conduction structure, and thermal optimization.
3. TCU die-cast upper housing and PCB coordination.
4. BMS and CSC plastic housings, tolerance chains, and mold-flow rib optimization.
5. BMS prototype material and sample technical support.

Describe methods and outcomes at a portfolio-safe level. Do not invent metrics, internal dimensions, supplier identities, or confidential values.

- [ ] **Step 5: Build patent, skills, education, context, and contact sections**

Patent section must link `CN223978857U` to its public source and explain housing, PCB fixing, creepage distance, strip groove, and snap-fit relevance without copying the patent text verbatim.

Skills must group structures, engineering methods, software, collaboration, and languages. Education must list Northeastern University and Université Toulouse III. Contact must expose only email, LinkedIn, and GitHub.

- [ ] **Step 6: Make missing sections collapse cleanly**

Each section component returns `null` when its data array is empty. No placeholder cards, blank headings, or `undefined` strings may render.

- [ ] **Step 7: Run policy, component, and build checks**

```bash
pnpm vitest run src/content/contentPolicy.test.ts src/App.test.tsx
pnpm build
```

Expected: PASS with exactly one public patent and no forbidden terms.

- [ ] **Step 8: Commit the complete public content**

```bash
git add src/components src/content/contentPolicy.test.ts src/App.tsx src/styles/global.css public/content/site.json
git commit -m "feat: add bilingual mechanical portfolio content"
```

## Task 6: Source and Integrate Real Images with Attribution

**Files:**

- Create: `public/media/meihan-qian-headshot.jpg`
- Create: `public/media/patent-cn223978857u-figure.png`
- Create: `public/media/industry-*.jpg`
- Create: `docs/image-sources.md`
- Create: `src/content/mediaPolicy.test.ts`
- Modify: `public/content/site.json`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/components/PatentSection.tsx`
- Modify: `src/components/IndustryContextSection.tsx`

- [ ] **Step 1: Write the failing media-policy test**

Assert that every media item has:

- A repository-local `/media/` path
- Non-empty Chinese and English alt text
- Non-empty Chinese and English credit text
- An `https://` source URL
- A non-empty usage note
- A unique ID

Assert that no filename or credit contains `AI生成`, `豆包`, `generated`, or `placeholder`.

- [ ] **Step 2: Copy and optimize the supplied original portrait**

Source only:

```text
/Users/apple/Desktop/人物角色/钱美含/01 个人证件/证件照/1.jpg
```

Copy it to `public/media/meihan-qian-headshot.jpg`. Normalize orientation and resize to a web-appropriate maximum dimension without changing facial appearance. Do not use:

```text
/Users/apple/Desktop/人物角色/钱美含/01 个人证件/证件照/微信图片_20251217170251_16450_66.png
```

- [ ] **Step 3: Acquire the public patent drawing**

Use the drawing attached to the verified `CN223978857U` public patent record. Preserve line-art clarity, crop only excess page margin, and link the source record. Do not alter labels or imply a different invention.

- [ ] **Step 4: Select two or three real industry-context images**

Priority order:

1. Official Schaeffler pages where usage terms clearly permit this portfolio context.
2. Licensed real photography from Pexels or Unsplash showing automotive electronics, precision housings, die casting, stamping, or injection molding.

For Schaeffler material, label it `Relevant product and industry context` / `相关产品与行业背景` and use `Image: Schaeffler` attribution. If the official usage terms are ambiguous for a personal promotional portfolio, do not copy the image; use a licensed alternative and link the official Schaeffler page as a textual industry reference.

Never present stock imagery as Meihan Qian's actual project hardware.

- [ ] **Step 5: Record every source**

`docs/image-sources.md` must contain a table with local filename, description, creator/owner, source URL, license or usage note, access date, and where it appears. Include the portrait as user-supplied and the patent figure as public patent material.

- [ ] **Step 6: Integrate stable image behavior**

Set width and height or `aspect-ratio` for all images. Use `object-fit` intentionally, lazy-load below-the-fold images, decode asynchronously, and show a styled neutral background if an image fails.

- [ ] **Step 7: Run media tests and inspect images**

```bash
pnpm vitest run src/content/mediaPolicy.test.ts src/content/contentPolicy.test.ts
pnpm build
```

Open every local media file and verify it is a real photo or a faithful public patent drawing, correctly oriented, without watermark artifacts.

- [ ] **Step 8: Commit media and attribution**

```bash
git add public/media public/content/site.json docs/image-sources.md src/content/mediaPolicy.test.ts src/components src/styles/global.css
git commit -m "feat: add sourced portfolio imagery"
```

## Task 7: Add the Owner Editor with a Schema-Matched CMS Configuration

**Files:**

- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `src/content/cmsConfig.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add YAML test support**

```bash
pnpm add -D yaml
```

- [ ] **Step 2: Write the failing CMS configuration test**

Parse `public/admin/config.yml` and assert:

```ts
expect(config.backend.name).toBe('github');
expect(config.backend.repo).toBe('qianmeihan/qianmeihan.github.io');
expect(config.backend.branch).toBe('main');
expect(config.backend.auth_methods).toEqual(['token']);
expect(config.media_folder).toBe('public/media');
expect(config.public_folder).toBe('/media');
```

Assert that one file collection edits `public/content/site.json`, that every required bilingual field has both `zh` and `en` subfields, and that no field exists for phone, salary, current employer, or secrets.

- [ ] **Step 3: Run the test to verify failure**

```bash
pnpm vitest run src/content/cmsConfig.test.ts
```

Expected: FAIL because no CMS configuration exists.

- [ ] **Step 4: Add the Sveltia CMS shell**

Create `public/admin/index.html` with UTF-8 metadata, `noindex`, a bilingual title, and:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

Do not add a stylesheet or `type="module"` to this script.

- [ ] **Step 5: Map the full JSON schema in `config.yml`**

Use:

```yaml
backend:
  name: github
  repo: qianmeihan/qianmeihan.github.io
  branch: main
  auth_methods: [token]

media_folder: public/media
public_folder: /media
```

Configure one file collection for `public/content/site.json`, with object and list widgets that mirror the stable IDs and bilingual fields exactly. Use image widgets only for local media paths. Do not enable editorial workflow because direct-save operation should require only repository Contents read/write permission.

- [ ] **Step 6: Verify editor files and public build**

```bash
pnpm vitest run src/content/cmsConfig.test.ts
pnpm build
test -f dist/admin/index.html
test -f dist/admin/config.yml
```

Expected: PASS; `/admin/` assets are present in `dist`.

- [ ] **Step 7: Commit the editor**

```bash
git add public/admin src/content/cmsConfig.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add owner-only content editor"
```

## Task 8: Add Deployment, Documentation, and End-to-End Tests

**Files:**

- Create: `.github/workflows/deploy-pages.yml`
- Create: `playwright.config.ts`
- Create: `tests/e2e/portfolio.spec.ts`
- Create: `README.md`
- Create: `docs/editor-guide-zh.md`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 2: Write failing end-to-end tests**

Configure Playwright to start `pnpm dev --host 127.0.0.1`, then cover:

```ts
test('shows core recruiter information in Chinese');
test('switches to English without a reload and persists the choice');
test('applies dark and system themes');
test('navigates to experience, patent, and contact sections');
test('opens safe external links with noopener and noreferrer');
test('contains no horizontal overflow at 360 by 800');
test('contains no horizontal overflow at 1440 by 900');
test('renders the Sveltia editor shell at /admin/');
test('supports keyboard navigation through all header controls');
```

Use local assertions only. Do not require a live GitHub token in automated tests.

- [ ] **Step 3: Run E2E to verify any remaining failures**

```bash
pnpm test:e2e
```

Expected: initial failures identify missing attributes, responsive issues, or editor routing gaps.

- [ ] **Step 4: Add the Pages workflow**

Workflow requirements:

- Trigger on pushes to `main` and manual dispatch.
- Use `actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` at current stable major versions.
- Run `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build` before artifact upload.
- Grant only `contents: read`, `pages: write`, and `id-token: write`.
- Use concurrency group `pages` and do not cancel an in-progress deployment.
- Deploy `dist/` only after checks pass.

- [ ] **Step 5: Write project and editor documentation**

`README.md` must document local commands, content location, privacy rules, editor path, deployment flow, and source links.

`docs/editor-guide-zh.md` must explain:

1. Open `/admin/`.
2. Create a fine-grained GitHub personal access token scoped only to `qianmeihan/qianmeihan.github.io` with repository Contents read/write.
3. Paste the token into Sveltia CMS only on the owner's trusted device.
4. Edit paired Chinese and English fields.
5. Save, wait for GitHub Actions, and verify the public page.
6. Revoke and replace the token if the device or token is compromised.
7. Never commit a token to the repository or put it into site content.

- [ ] **Step 6: Fix E2E findings and run the full local gate**

```bash
pnpm check
pnpm test:e2e
```

Expected: all unit, policy, integration, E2E, type, and build checks PASS.

- [ ] **Step 7: Commit deployment and documentation**

```bash
git add .github playwright.config.ts tests README.md docs/editor-guide-zh.md package.json pnpm-lock.yaml
git commit -m "ci: add verified GitHub Pages deployment"
```

## Task 9: Visual QA, Accessibility QA, and Final Repository Audit

**Files:**

- Modify: any implementation files required by verified findings
- Create: no permanent screenshot files unless the user requests them

- [ ] **Step 1: Run the entire automated suite from a clean state**

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:e2e
```

Expected: zero failing tests and a successful production build.

- [ ] **Step 2: Start the production preview and inspect real browser states**

```bash
pnpm preview --host 127.0.0.1
```

Inspect Chinese and English at 360x800, 768x1024, 1440x900, and 1920x1080. Inspect light and dark themes, reduced motion, keyboard focus order, all major sections, image credits, and the `/admin/` shell.

- [ ] **Step 3: Audit public content for sensitive and excluded material**

Run targeted searches across tracked source files:

```bash
rg -n "生产计划|库存优化|优化算法|production planning|inventory optimization|期望薪资|身份证|护照" . --glob '!docs/superpowers/**' --glob '!node_modules/**' --glob '!dist/**'
rg -n "\\b1[3-9][0-9]{9}\\b|token|password|secret" public src README.md docs/editor-guide-zh.md
rg -n "[—–]" public/content src --glob '*.{json,ts,tsx,css,html}'
```

Expected: no sensitive/excluded-content hits in public source. Documentation may mention the word `token` only in security instructions and CMS configuration context; it must never contain an actual token value.

- [ ] **Step 4: Audit media and links**

Confirm every visible image has a recorded source and matching attribution. Open all outbound URLs, verify HTTPS, confirm the patent link resolves, and confirm LinkedIn and GitHub point to the requested profiles.

- [ ] **Step 5: Inspect the git diff and repository status**

```bash
git diff --check
git status --short
git log --oneline --decorate -12
```

Expected: no whitespace errors, no untracked secrets, and a clear task-by-task history.

- [ ] **Step 6: Commit QA corrections if needed**

```bash
git add <verified-correction-files>
git commit -m "fix: resolve final portfolio QA findings"
```

Do not create an empty commit when no corrections are needed.

## Task 10: Create the GitHub Repository and Publish

**Files:**

- External state: GitHub repository `qianmeihan/qianmeihan.github.io`
- External state: GitHub Pages deployment

- [ ] **Step 1: Ask for action-time confirmation**

Before creating a public repository, pushing code, enabling Pages, or entering any credential in GitHub, show the user the exact repository name, visibility, first public URL, and privacy audit result. Obtain explicit confirmation at that moment.

- [ ] **Step 2: Resolve the signed-in account and repository availability**

Confirm that GitHub is signed in as `qianmeihan` and that `qianmeihan.github.io` does not already exist. If it exists, inspect it before changing anything and preserve unrelated user content.

- [ ] **Step 3: Create the public user-site repository**

Create `qianmeihan/qianmeihan.github.io` as a public repository with no generated README, license, or `.gitignore`, because the local repository already contains those files.

- [ ] **Step 4: Add the exact remote and push `main`**

```bash
git remote add origin https://github.com/qianmeihan/qianmeihan.github.io.git
git push -u origin main
```

If Git asks for credentials, use the user's existing authenticated GitHub session or user-controlled credential flow. Never display, log, or save a token in repository files.

- [ ] **Step 5: Configure GitHub Pages for Actions**

Set Pages source to GitHub Actions if it is not selected automatically. Wait for the `Deploy portfolio to GitHub Pages` workflow to complete. Do not bypass a failing test or deploy an unverified artifact.

- [ ] **Step 6: Verify the live public site**

Open:

```text
https://qianmeihan.github.io/
https://qianmeihan.github.io/admin/
```

Verify the live commit hash, Chinese and English switching, theme persistence, images, external links, responsive layout, and absence of console errors. Confirm anonymous visitors can browse but cannot save CMS changes without a repository-authorized token.

- [ ] **Step 7: Perform one owner editor smoke test**

With the owner present, create or paste the repo-scoped fine-grained token into Sveltia CMS, make a harmless punctuation edit in both languages, save it, confirm a repository commit appears, confirm Actions redeploys, then revert the punctuation through the editor and verify again. Revoke test credentials if a temporary token was used.

- [ ] **Step 8: Deliver the final handoff**

Provide:

- Live public URL
- Editor URL
- GitHub repository URL
- Local project path
- Chinese editor guide path
- Final test/build evidence
- Explicit summary of what is public and what was intentionally excluded

## Final Self-Review Checklist

- [ ] Every requirement in the design spec maps to at least one task above.
- [ ] All planned files have a clear purpose and owner task.
- [ ] Type names and CMS field names are consistent across TypeScript, JSON, YAML, tests, and docs.
- [ ] No `TODO`, `TBD`, placeholder copy, fabricated metric, or unverified patent is planned.
- [ ] Every implementation task begins with a failing test where behavior is testable.
- [ ] Public-content tests cover privacy exclusions and prohibited topic exclusions.
- [ ] Media tests cover attribution and generated-image exclusions.
- [ ] Review Focus risks are covered by automated or explicit manual checks.
- [ ] Publication is separated behind an action-time confirmation checkpoint.

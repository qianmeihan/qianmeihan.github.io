# Four Resume Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show exactly the four Schaeffler projects in the October 2026 résumé, with current names and descriptions, while keeping the established portfolio design.

**Architecture:** The bilingual copy remains in `public/content/site.json`. Existing cards and dialogs render it unchanged. A narrowly scoped CSS selector makes exactly four desktop cards form two even rows; responsive rules keep mobile cards in one column.

**Tech Stack:** React, TypeScript, Vite, Vitest, Playwright, CSS Grid.

**Spec:** User-approved request in this chat: four projects only, rename them completely, remove TCU and D5/D3; desktop cards 2×2, mobile layout unchanged.

## Global Constraints

- Preserve the current typography, colors, cards, dialogs, mobile layout, and all non-project content.
- Preserve the pre-existing untracked `tmp/` directory.
- Use only résumé-supported claims; no new company or personal information.

## Review Focus

- Both Chinese and English names match the new résumé projects, and no old D5/D3/TCU title remains in published data.
- All four cards belong to the Schaeffler experience, not the separate BMW entry.
- Desktop 1440px layout is an even 2×2 grid with matching card widths.
- Mobile 390px layout remains a single column with the same dialog behavior.
- Built and deployed JSON both contain the four-project set.

---

### Task 1: Replace project content

**Files:** `public/content/site.json`, `src/content/contentPolicy.test.ts`, `src/App.test.tsx`, `tests/e2e/portfolio.spec.ts`.

**Interfaces:** `SiteContent.projects: ProjectItem[]` remains unchanged; existing project card and dialog components consume it.

- [x] Update content and UI tests to require four projects, approved bilingual names, no TCU/D5/D3, and functioning detail dialogs.
- [x] Run focused tests and confirm failure against the old five-project content.
- [x] Replace the project data with exactly the four résumé-backed projects and complete bilingual details.
- [x] Re-run focused tests and confirm success.

### Task 2: Keep four-card desktop rhythm

**Files:** `src/styles/global.css`, `tests/e2e/portfolio.spec.ts`.

**Interfaces:** No component API changes; the grid uses the existing `.project-list` and `.project-card` markup.

- [x] Update desktop and mobile layout assertions: desktop 2×2, mobile one column.
- [x] Run the layout tests and confirm failure against the old desktop rule.
- [x] Add a four-card-only desktop grid rule with responsive override.
- [x] Run focused tests, `pnpm check`, and `pnpm test:e2e`.
- [x] Commit scoped files, push to GitHub Pages, and verify the deployed JSON and workflow.

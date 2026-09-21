# Meihan Qian · Mechanical Engineering Portfolio

A bilingual, responsive mechanical-engineering portfolio for Meihan Qian. The public site is read-only; the owner can update the structured Chinese and English content through Sveltia CMS at `/admin/`.

## Local development

Requirements: Node.js 24 and pnpm 11.

```bash
pnpm install
pnpm dev
```

Quality gates:

```bash
pnpm check
pnpm test:e2e
```

The first local end-to-end run may require:

```bash
pnpm exec playwright install chromium
```

## Content and media

- Public content: `public/content/site.json`
- Owner editor: `public/admin/`
- Repository-local images: `public/media/`
- Image provenance: `docs/image-sources.md`
- Chinese editor instructions: `docs/editor-guide-zh.md`

Every public-facing text field is maintained as paired `zh` and `en` values. The content contract and CMS schema are checked automatically so an editor change cannot silently remove required structure.

## Privacy rules

- The BMW Brilliance project may be named, but the current employer must remain undisclosed.
- Do not add a phone number, home address, identity-document number, salary, account credential, internal supplier identity, confidential dimension, or unreleased program detail.
- Do not add optimization-algorithm or production-planning-tool content.
- Portfolio project descriptions must stay at a public, recruiter-safe level and must not invent metrics.
- Stock photography is contextual only and must never be presented as hardware directly developed by Meihan Qian.
- Never place a GitHub token in source files, content, screenshots, issues, or commit messages.

## Editing and deployment

The editor writes changes directly to `public/content/site.json` on `main` after the owner signs in with a repository-scoped token. A push to `main` triggers `.github/workflows/deploy-pages.yml`, which installs locked dependencies, runs unit and policy tests, builds `dist/`, and deploys that artifact to GitHub Pages.

The workflow follows GitHub's [custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) model. Full owner instructions are in [docs/editor-guide-zh.md](docs/editor-guide-zh.md).

## Public references

- [LinkedIn](https://www.linkedin.com/in/qianmeihan/)
- [GitHub](https://github.com/qianmeihan)
- [CN223978857U public patent record](https://eureka.patsnap.com/patent/CN223978857U)
- [Schaeffler BMS and integrated power-electronics context](https://www.schaeffler.com/en/media/press-releases/press-releases-detail.jsp?id=88211712)
- [Schaeffler Auto Shanghai electrification context](https://www.schaeffler.com/en/media/press-releases/press-releases-detail.jsp?id=88093185)

See `docs/image-sources.md` for each image source and usage basis.

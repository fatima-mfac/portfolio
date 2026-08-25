# fatimacunha.com

Source of [fatimacunha.com](https://fatimacunha.com) — my portfolio site, designed and built by me.

## Stack

Next.js 16 (App Router, static export) with React 19 and TypeScript, Tailwind CSS v4 for styling, GSAP and Lenis for motion, Storybook 10 and Vitest for component work, hosted on Cloudflare Pages.

## How it's built

Designed and developed solo, AI-assisted with Claude Code. All architecture decisions, code reviews and releases are mine.

## Structure

- `app/` — App Router routes. `(shell)` holds the home, work and about pages that share one persistent shell; `_shell` holds the client components they compose; `herc`, `patina` and `vodafone` are standalone case studies.
- `src/components/` — reusable components, one folder each.
- `src/styles/tokens.css` — every design token, as a Tailwind v4 `@theme` block. This file is the source of truth; the Figma variables are generated from it.
- `src/.ai/` — per-component metadata describing intended use and constraints. Read by AI tooling, not shipped.
- `stories/` — Storybook stories.
- `docs/` — design system notes and audits.
- `public/` — fonts, images, video, and the Cloudflare `_redirects` file.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run storybook  # http://localhost:6006
```

## Deployment

Pushing to `main` deploys to production via the Cloudflare Pages Git integration. The build is a static export — `output: 'export'` in `next.config.ts`, output in `out/`, no server runtime. Redirects live in `public/_redirects`, since Next's `redirects()` does not run under a static export.

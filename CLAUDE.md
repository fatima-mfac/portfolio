# Portfolio — Project Context

Read this file at the start of every session. It defines the project structure, tools, and rules that apply to all work in this repo.

---

## Project

Personal portfolio for Fátima Cunha, senior UX/UI designer. The portfolio doubles as a proof of concept for an AI-assisted design-to-code pipeline. It is built with the same system and workflow used to build production products.

---

## Figma

- **Design system file**: https://www.figma.com/design/MiM7PXW375WlL6qjWW8ulM/Portfolio-3.0-Design-System?node-id=0-1&t=GgPi5ZGECEoZWnlB-1
  - Variables and text styles live here
  - Component library lives here
  - This is the Figma source — all other Figma files consume it as a library

- **Design file**: https://www.figma.com/design/chAVjIQwt0zKg1APSSaFZL/Portfolio-3.0?node-id=0-1&t=9QRr1cXm2klpGd9d-1
  - Layouts and page designs live here
  - Consumes the design system file via Figma library
  - Use this file as the layout reference when building components

---

## Repo Structure

```
portfolio/
├── app/                      ← Next.js App Router pages
├── src/
│   ├── .ai/                  ← AI-readable component metadata (not shipped)
│   ├── styles/
│   │   └── tokens.css        ← all design tokens, Tailwind v4 @theme
│   └── components/           ← React components
├── public/                   ← images, icons, SVGs
├── stories/                  ← Storybook stories
├── CLAUDE.md                 ← this file
├── next.config.ts
└── tsconfig.json
```

---

## Stack

- Next.js 16 (App Router)
- React + TypeScript
- Tailwind CSS v4 (`@theme` directive, no `tailwind.config.js`)
- Storybook 10

---

## Hosting & Deployment

- **Host**: Cloudflare Pages (not Vercel)
- The site is a **static export** — `output: 'export'` in `next.config.ts`, build output in `out/`, no server runtime
- Deploys are triggered by pushes to `main` via the Cloudflare Pages Git integration — merging to `main` means deploying to production
- Redirects live in `public/_redirects` (Cloudflare Pages format) — Next's `redirects()` does not work under static export
- **Rollback**: every previous deployment is kept in the Cloudflare Pages dashboard and can be re-promoted to production instantly
- `images.unoptimized` is required by the static export — pre-compress source images if file size matters

---

## Source of Truth

**Code is the source of truth.** The hierarchy is:

```
tokens.css  →  Figma variables (synced via Console MCP)
            →  Tailwind → components
            →  Storybook (documents what exists, not what should exist)
```

Figma reflects the token system — it does not define it. If there is ever a conflict between Figma and `tokens.css`, `tokens.css` wins.

Storybook is documentation and component testing only. Build components in code first, Storybook reflects them.

---

## Design Token Pipeline

This is the required order — never skip or reverse steps:

1. Token decisions approved by Fatima
2. Claude Code writes tokens to `src/styles/tokens.css` via `@theme {}`
3. Claude Code creates Figma variables and text styles in the design system file via Console MCP
4. Components built against token system only
5. Storybook updated to reflect new components

---

## Connected MCPs

- **Figma MCP**: read layout context from the design file
- **Figma Console MCP**: write variables and text styles to the design system file

---

## Rules

- Before building any UI, read all files in `src/.ai/` to understand what components exist, how they should be used, and what patterns to avoid
- No hardcoded hex values, px values, or font names anywhere in components
- Always use `var(--token-name)` referencing `tokens.css`
- No inline styles
- Radius tokens are named (`--radius-sm`) never numbered
- Spell `tertiary` correctly — never `terciary`
- Before creating similar-looking tokens, flag and confirm with Fatima
- When in doubt about a design decision, ask — never assume
- Always write variables and text styles to the design system file, never the design file

---

## Out of Scope

- User authentication
- CMS
- Dark mode

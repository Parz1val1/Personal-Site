# Personal Portfolio Site — Claude Code Guide

Astro 6 static site, TypeScript, vitest. Node ≥ 22 (portable Node 24 — see
global CLAUDE.md if `npm` is missing from PATH).

## Commands
- `npm run dev` — dev server
- `npm run verify` — `astro check` + vitest + build; run before every commit
- `npm run test` / `npm run check` / `npm run build` — individual steps
- `npm run gen:og` — regenerate the OG image (`scripts/make-og-image.mjs`)

## Architecture
- Two-view design: pixel-art "room" (desktop) + standalone accessible view.
  Spec: `docs/superpowers/specs/2026-06-10-portfolio-two-views-design.md`
- Active plan: `docs/superpowers/plans/2026-06-10-m0-m1-foundations-standalone.md`
  (3-plan execution; Plan 1 / M0–M1 complete)
- Content collections in `src/content/` (projects, flavor, `site.json`),
  validated by zod schemas in `src/data/schemas.ts` + `src/content.config.ts`.
  Content is fully decoupled from presentation — edit JSON, not components.
- Design tokens in `src/styles/tokens.css`. The grape/aqua palette is **locked**
  (commit 551bc4f) — do not change palette values without an explicit request.
- `src/lib/contrast.ts` enforces AA contrast pairs (covered by tests).

## Constraints
- Bar: Lighthouse 100s, zero `astro check` errors, all vitest passing.
- The standalone view is the canonical accessible experience — accessibility
  regressions there are blockers.

# After Hours — Standalone Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle and extend the existing standalone view (`/`) to the resolved "After Hours" visual design (spec §16): black-night palette, Silkscreen/Geist/Geist Mono type, nav, a scene-banner hero, featured + grid project cards with a scanline poster treatment, a retro `.exe` expanded-detail modal, and CSS hover/ripple effects — all on the Plan-1 Astro foundation, with the contrast test, video facade, and a11y/SEO kept green.

**Architecture:** This is a *restyle + extension* of the shipped standalone view, NOT a new project and NOT a port of the prototype's React-over-CDN structure. We recreate the design's visual output in our Astro 6 + content-collections + `tokens.css` idiom. The design handoff prototype lives in `.design-tmp/personal-website-game/project/` (gitignored) as the pixel-level visual reference — `ph-views.jsx` (layouts/modal), `ph-atoms.jsx` (card/poster/data), and `After Hours - Site.html` (the full `<style>` block with every exact value). When a task says "reference prototype," open that file for the exact CSS.

**Tech Stack:** Astro 6 + TypeScript (strict), Zod, Vitest, `@fontsource/silkscreen` + `@fontsource/geist-sans` + `@fontsource/geist-mono`. No new runtime framework — components stay `.astro`; interactivity (hamburger, modal, copy-email) stays vanilla `<script>`, matching Plan 1.

**Spec:** `docs/superpowers/specs/2026-06-10-portfolio-two-views-design.md` (§16 is the design; §4 content model; §5 palette/fonts; §9 nav/routing; §11 a11y).

**Plan-1 state this builds on:** `/` renders hero/bio + project grid (`ProjectCard.astro` wrapping `VideoFacade.astro`) + `ContactSection.astro`, from the `projects`/`site` content collections, styled by `tokens.css` + `global.css`. `npm run verify` = `astro check && vitest run && astro build`. 35 tests pass at the start of this plan. Node is a portable install — if `npm` is missing from PATH, prepend `C:\Users\Tim\Tools\node-v24.16.0-win-x64` (see global CLAUDE.md).

**Conventions:**
- Commands run from repo root; npm scripts are cross-platform.
- "Expected: PASS" = exits 0, no errors.
- `.astro` components have no unit-test hook; their "test" is `npm run verify` green + inspecting built HTML/CSS in `dist/`, exactly as Plan 1 did.
- Commit after every task. Do NOT push (the user pushes / the deploy pipeline auto-builds).

---

## Phase A — Palette + fonts (foundation)

### Task 1: Re-map the palette to the black-night scheme (TDD via contrast test)

The contrast test is the guard; rewrite it to the new tier list FIRST (red), then re-map `tokens.css` to make it green. Five locked hexes keep their values; their *roles* change per spec §5/§16.

**Files:**
- Modify: `tests/palette-contrast.test.ts`
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Rewrite the approved-pairs in `tests/palette-contrast.test.ts`**

Replace the `AA_NORMAL` and `AA_LARGE` arrays (keep the `readTokens()` helper and the two `describe`/`it.each` blocks exactly as they are) with:

```ts
const AA_NORMAL: Array<[fg: string, bg: string]> = [
  ["--c-ink", "--c-s2"], // body copy on card/panel fill
  ["--c-ink", "--c-bg"], // body copy on the night
  ["--c-muted", "--c-s2"], // secondary / meta on panels
  ["--c-faint", "--c-s2"], // tertiary captions on panels — must clear 4.5
  ["--c-accent", "--c-bg"], // aqua links on the night
  ["--c-accent", "--c-s2"], // aqua links on panels
  ["--c-btn-ink", "--c-accent"], // dark button label on aqua
];

const AA_LARGE: Array<[fg: string, bg: string]> = [
  ["--c-heading", "--c-bg"], // wisteria headings on the night
  ["--c-heading", "--c-s2"], // wisteria headings on panels
  ["--c-accent-2", "--c-bg"], // teal category chips / large accents on night
  ["--c-accent-2", "--c-s2"], // teal on panels
];
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- palette-contrast`
Expected: FAIL — the new `--c-*` tokens don't exist yet (or fail contrast), e.g. `--c-ink missing from tokens.css`.

- [ ] **Step 3: Re-map `src/styles/tokens.css`**

Replace the entire `:root` palette section (the `--- palette ---`, `--- palette: derived shades ---` groups and the header comment) with the black-night scheme. Keep the `--- type ---` (amended below), `--- spacing ---`, and `--- hard-edged styling ---` groups. New top of file:

```css
/* ============================================================
   Design tokens — THE canonical palette/type/spacing source.
   Both views consume these. The art-tool swatch export (Plan 2)
   parses this file. Keep colors as 6-digit hex on single lines.

   LOCKED palette — "After Hours" night mapping (spec §5/§16,
   2026-06-13). Five core hexes; roles per the design handoff.
   Black is the page; grape is structure; a dark grape-tinted
   elevation scale carries near-white body text. Two-tier
   contrast test (4.5 body / 3.0 large) enforces every pair.
   ============================================================ */
:root {
  /* --- core locked palette --- */
  --c-bg: #000000;        /* the night — page background */
  --c-grape: #564592;     /* raised STRUCTURE: borders, chips, active rings, title bars */
  --c-accent: #1ac8ed;    /* sky aqua — links, interactive, focus, play buttons */
  --c-accent-2: #2ebfa5;  /* ocean mist — secondary accent (category chips, tertiary) */
  --c-heading: #b79ced;   /* wisteria — headings & large text on dark */

  /* --- derived grape-tinted elevation --- */
  --c-s1: #0b0916;        /* deep section band */
  --c-s2: #15102a;        /* card / panel fill — home of body text */
  --c-s3: #221a40;        /* raised / hover within a card */
  --c-line: #362c5e;      /* hairline divider, chip borders */

  /* --- text on dark --- */
  --c-ink: #ece9f7;       /* body — near-white lavender (15.4:1 on s2) */
  --c-muted: #aba0ce;     /* secondary / meta (7.6:1 on s2) */
  --c-faint: #9a8fc4;     /* tertiary / captions — lightened to clear 4.5:1 on s2 */
  --c-btn-ink: #04161c;   /* dark label on aqua/teal button faces */

  /* --- stepped shadow inks --- */
  --c-drop: #000000;
  --c-aqua-deep: #06343f;
  --c-teal-deep: #0c3b33;

  /* --- type --- */
  --font-pixel: "Silkscreen", monospace;        /* headings + UI accents only */
  --font-body: "Geist", system-ui, sans-serif;  /* body copy */
  --font-mono: "Geist Mono", monospace;         /* meta: year·role, durations, footer */
  --text-sm: 0.875rem;
  --text-base: 1.0625rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2.25rem;

  /* --- spacing (4px base grid) --- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --space-6: 4rem;

  /* --- hard-edged styling --- */
  --border-px: 2px;       /* the design uses 2px borders throughout */
  --shadow-step: 6px;     /* stepped (offset, unblurred) shadow */
  --focus-ring: 3px solid var(--c-accent);
}
```

Note: `--c-faint` is `#9a8fc4` (not the prototype's `#7d72a6`, which was only 4.24:1). This keeps the same hue, lightened to clear AA-normal — verified in the next step.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- palette-contrast`
Expected: PASS — all AA_NORMAL ≥ 4.5, all AA_LARGE ≥ 3.0. If `--c-faint` is still < 4.5 on s2, lighten it further (e.g. `#a99ed0`) until green; do not drop it from the list.

- [ ] **Step 5: Commit**

```bash
git add tests/palette-contrast.test.ts src/styles/tokens.css
git commit -m "feat: re-map design tokens to After Hours black-night palette"
```

---

### Task 2: Self-hosted fonts + global base styles

Wire Geist + Geist Mono (self-hosted, no CDN) and re-base `global.css` for the night scheme: black page, near-white text, wisteria headings, aqua links, `.pixel-box` = s2 fill / grape border, `.btn` = aqua face.

**Files:**
- Modify: `package.json` (deps via npm)
- Modify: `src/layouts/Base.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Install the body + mono fonts**

Run: `npm install @fontsource/geist-sans @fontsource/geist-mono`
Expected: exits 0. (`@fontsource/silkscreen` is already installed.)

- [ ] **Step 2: Import the fonts in `src/layouts/Base.astro`**

The layout already imports Silkscreen + tokens + global at the top of the frontmatter (with a `@ts-expect-error` above the silkscreen side-effect import). Add the two new font imports directly below the silkscreen import, each preceded by its own `@ts-expect-error` line (these packages ship no types, same as silkscreen):

```ts
// @ts-expect-error - @fontsource/silkscreen has no type declarations
import "@fontsource/silkscreen";
// @ts-expect-error - @fontsource/geist-sans has no type declarations
import "@fontsource/geist-sans";
// @ts-expect-error - @fontsource/geist-mono has no type declarations
import "@fontsource/geist-mono";
import "../styles/tokens.css";
import "../styles/global.css";
```

- [ ] **Step 3: Re-base `src/styles/global.css`**

Replace the whole file with the night-scheme base. This removes the Plan-1 wisteria-panel rules (no longer needed — body text now lives on dark surfaces) and sets the shared `.pixel-box`/`.btn` building blocks to the design:

```css
*,
*::before,
*::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--c-bg);
  /* faint top twilight so the night has depth (spec §16) */
  background-image: radial-gradient(130% 70% at 50% -8%, rgba(86,69,146,0.30), rgba(86,69,146,0) 58%);
  color: var(--c-ink);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-pixel);
  line-height: 1.25;
  color: var(--c-heading);
}

img { display: block; max-width: 100%; }

a { color: var(--c-accent); }

:focus-visible { outline: var(--focus-ring); outline-offset: 3px; }

.skip-link {
  position: absolute; left: -999px; top: 0; z-index: 100;
  background: var(--c-accent); color: var(--c-btn-ink);
  padding: var(--space-2) var(--space-3); font-family: var(--font-pixel);
}
.skip-link:focus { left: 0; }

/* Hard-edged building blocks. Panels are dark s2 framed in true grape;
   body text on them is near-white and clears AA (spec §5). */
.pixel-box {
  background: var(--c-s2);
  border: var(--border-px) solid var(--c-grape);
  box-shadow: var(--shadow-step) var(--shadow-step) 0 var(--c-drop);
  color: var(--c-ink);
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-height: 44px; padding: 15px 20px;
  font-family: var(--font-pixel); font-size: var(--text-sm); letter-spacing: 0.5px;
  text-transform: uppercase; text-decoration: none; cursor: pointer;
  color: var(--c-btn-ink); background: var(--c-accent); border: 0;
  box-shadow: 4px 4px 0 var(--c-aqua-deep);
  transition: transform .1s steps(2), box-shadow .1s;
}
.btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--c-aqua-deep), 0 0 26px rgba(26,200,237,0.45); }
.btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 var(--c-aqua-deep); }
.btn--ghost { background: transparent; color: var(--c-accent); box-shadow: inset 0 0 0 2px var(--c-accent); }
.btn--ghost:hover { background: rgba(26,200,237,0.10); box-shadow: inset 0 0 0 2px var(--c-accent), 0 0 22px rgba(26,200,237,0.25); }
.btn--teal { background: var(--c-accent-2); color: var(--c-btn-ink); box-shadow: 4px 4px 0 var(--c-teal-deep); }

.link {
  color: var(--c-accent); text-decoration: none; font-weight: 500;
  border-bottom: 2px solid rgba(26,200,237,0.4); padding-bottom: 1px;
}
.link:hover { border-bottom-color: var(--c-accent); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Update existing component token references**

The Plan-1 components reference old token names (`--c-bg-deep`, `--c-surface`, `--c-text`, `--c-text-dim`, `--c-text-soft`, `--c-border`, `--c-accent` unchanged). Find and update them so nothing references a now-deleted token:

Run: `npm test -- palette-contrast && npm run check`
Expected: `astro check` will FAIL with unknown-token / no errors? CSS custom props aren't type-checked, so `astro check` won't catch them — instead grep for stale tokens:

Run: `git grep -nE "var\(--c-(bg-deep|surface|text|text-dim|text-soft|border)\)" src`
Expected: lists references in `index.astro`, `ProjectCard.astro`, `ContactSection.astro`, `404.astro`, `VideoFacade.astro`. These are all replaced wholesale in Tasks 5–9 (cards, contact, hero) and Task 10 (404). For THIS task, only fix the ones in files not otherwise rewritten: `src/pages/404.astro`. Replace its `var(--c-text-?)`/`var(--c-border)` usages with night-scheme equivalents (`--c-ink`, `--c-grape`) and confirm it builds. Leave `index.astro`/`ProjectCard`/`ContactSection`/`VideoFacade` as-is for now (rewritten in later tasks) — they will still build because the old token names simply resolve to nothing and fall back, which is visually wrong but not a build error. (Their correct restyle lands in Tasks 5–9.)

- [ ] **Step 5: Verify build + fonts**

Run: `npm run verify`
Expected: astro check 0 errors, tests pass, build exit 0. Then inspect `dist/index.html` `<head>`: confirm `geist-sans` and `geist-mono` CSS are bundled (search the built `dist/_astro/*.css` for `Geist` `@font-face`). No `fonts.googleapis.com` anywhere in `dist`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/layouts/Base.astro src/styles/global.css src/pages/404.astro
git commit -m "feat: self-hosted Geist fonts and night-scheme global base styles"
```

---

## Phase B — Navigation

### Task 3: Nav with mobile hamburger (Base layout)

Adds the `<nav>` landmark to every page (spec §9): wordmark + glowing dot, Work/About/Contact anchors, the "Try the room" pill on hover-capable devices, and a progressive-enhancement hamburger on narrow viewports.

**Files:**
- Create: `src/components/SiteNav.astro`
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Write `src/components/SiteNav.astro`**

Reference prototype: `ph-views.jsx` `Nav()` + `After Hours - Site.html` lines ~66–102 (`.ph-nav*`, `.ph-try`, `.ph-burger`). Recreate as a static `<nav>` with a vanilla disclosure script:

```astro
---
const links = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];
---

<nav class="nav" aria-label="Primary">
  <a class="nav__mark" href="#main"><span class="nav__dot" aria-hidden="true"></span>AFTER&nbsp;HOURS</a>

  <button class="nav__burger" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu">
    <span aria-hidden="true"></span><span aria-hidden="true"></span>
  </button>

  <div class="nav__menu" id="nav-menu">
    <ul class="nav__links" role="list">
      {links.map((l) => <li><a class="nav__link" href={l.href}>{l.label}</a></li>)}
    </ul>
    <a class="nav__try" href="/room" data-room-link>
      <span class="crt" aria-hidden="true"></span>
      <span>Try the room<br /><small>best on desktop</small></span>
    </a>
  </div>
</nav>

<script>
  const nav = document.querySelector<HTMLElement>(".nav");
  const burger = nav?.querySelector<HTMLButtonElement>(".nav__burger");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("nav--open", !open);
  });
</script>

<style>
  .nav { display: flex; align-items: center; gap: 28px; height: 76px; border-bottom: var(--border-px) solid var(--c-line); position: relative; }
  .nav__mark { font-family: var(--font-pixel); font-size: 16px; letter-spacing: 0.5px; color: var(--c-heading); text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }
  .nav__dot { width: 9px; height: 9px; background: var(--c-accent); box-shadow: 0 0 10px rgba(26,200,237,0.7); }
  .nav__menu { display: contents; }
  .nav__links { display: flex; align-items: center; gap: 26px; margin: 0 0 0 8px; padding: 0; list-style: none; }
  .nav__link { font-family: var(--font-pixel); font-size: 10px; letter-spacing: 1px; color: var(--c-muted); text-decoration: none; text-transform: uppercase; padding: 6px 2px; min-height: 44px; display: inline-flex; align-items: center; }
  .nav__link:hover { color: var(--c-accent); }
  .nav__try { margin-left: auto; display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-pixel); font-size: 10px; letter-spacing: 0.5px; color: var(--c-accent); text-decoration: none; text-transform: uppercase; padding: 9px 13px; background: var(--c-s2); border: var(--border-px) solid var(--c-accent); box-shadow: 3px 3px 0 var(--c-aqua-deep); }
  .nav__try small { color: var(--c-faint); font-size: 9px; }
  .nav__burger { display: none; width: 44px; height: 44px; border: var(--border-px) solid var(--c-line); background: var(--c-s2); cursor: pointer; flex-direction: column; gap: 5px; align-items: center; justify-content: center; margin-left: auto; }
  .nav__burger span { display: block; width: 16px; height: 2px; background: var(--c-accent); }

  /* hover-capable devices: the room is worth offering; touch defaults to standalone */
  @media (hover: none), (pointer: coarse) { .nav__try { display: none; } }

  @media (max-width: 760px) {
    .nav__burger { display: flex; }
    .nav__menu { position: absolute; top: 76px; left: 0; right: 0; z-index: 20; flex-direction: column; display: none; background: var(--c-s1); border: var(--border-px) solid var(--c-line); }
    .nav--open .nav__menu { display: flex; }
    .nav__links { flex-direction: column; align-items: stretch; gap: 0; margin: 0; }
    .nav__link { padding: 14px 18px; border-bottom: var(--border-px) solid var(--c-line); }
    .nav__try { margin: 12px 18px 16px; }
  }
</style>
```

Note: with JS disabled on mobile the menu stays `display:none` (the burger can't open it). To honor §9 "never a dead hamburger," add a no-JS fallback: in the `<head>` slot or global, the burger only appears when JS runs. Implement by defaulting `.nav__burger` to `display:none` and having the script add a `nav--enhanced` class to `.nav` on load; gate the mobile rules on `.nav--enhanced`. Adjust the script:

```js
  nav?.classList.add("nav--enhanced");
```

and change the mobile media block selectors to `.nav--enhanced .nav__burger { display:flex; }` and `.nav--enhanced .nav__menu { ... display:none }`, `.nav--enhanced.nav--open .nav__menu { display:flex }`. Without JS, the menu renders inline (links stacked, visible) — never a dead control.

- [ ] **Step 2: Mount in `src/layouts/Base.astro`**

Import and render it as the first child of `<body>`, after the skip link:

```astro
---
// @ts-expect-error - @fontsource/silkscreen has no type declarations
import "@fontsource/silkscreen";
// @ts-expect-error - @fontsource/geist-sans has no type declarations
import "@fontsource/geist-sans";
// @ts-expect-error - @fontsource/geist-mono has no type declarations
import "@fontsource/geist-mono";
import "../styles/tokens.css";
import "../styles/global.css";
import SiteNav from "../components/SiteNav.astro";
// ...existing Props interface + canonical/ogImage consts unchanged...
---
```

In the body:

```astro
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="nav-wrap"><SiteNav /></div>
    <slot />
  </body>
```

Add a `.nav-wrap` width constraint matching the page wrap (so nav aligns with content), plus the shared `.crt` glyph utility (reused by the hero's scene hint in Task 9 — it must be global, not scoped). Put both in `global.css`:

```css
.nav-wrap { max-width: 1200px; margin: 0 auto; padding: 0 56px; }
@media (max-width: 760px) { .nav-wrap { padding: 0 20px; } }

/* shared CRT-screen glyph for "try the room" affordances */
.crt { width: 16px; height: 12px; border: 2px solid var(--c-accent); position: relative; flex: 0 0 auto; }
.crt::after { content:""; position:absolute; left:50%; bottom:-5px; transform:translateX(-50%); width:8px; height:2px; background: var(--c-accent); }
```

- [ ] **Step 3: Verify**

Run: `npm run verify`
Expected: green. Inspect `dist/index.html`: `<nav aria-label="Primary">` present with the three anchors (`#work`/`#about`/`#contact`), the room link (`href="/room"`), and the burger button with `aria-expanded="false"` / `aria-controls="nav-menu"`. The `/room` link will 404 until Plan 2 — acceptable (it's the documented forward link).

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteNav.astro src/layouts/Base.astro src/styles/global.css
git commit -m "feat: site nav with progressive-enhancement mobile hamburger"
```

---

## Phase C — Content model

### Task 4: Extend the project schema (TDD) + update content entries

Add `category`, `year`, `role`, `duration?`, `featured?` to `projectSchema` (spec §4), enforce at most one featured project, and populate the existing five entries.

**Files:**
- Modify: `tests/schemas.test.ts`
- Modify: `src/data/schemas.ts`
- Modify: `tests/content-order.test.ts`
- Modify: `src/content/projects/*.json` (all 5)

- [ ] **Step 1: Add failing schema tests**

In `tests/schemas.test.ts`, update the `validProject` fixture to include the new required fields, and add cases. Replace the existing `validProject` const with:

```ts
const validProject = {
  title: "Showreel",
  blurb: "A rolling cut of recent work.",
  description: "Longer description for the standalone page.",
  category: "SHOWREEL",
  year: "2025",
  role: "Direction · Edit",
  duration: "1:24",
  featured: true,
  tags: ["video"],
  video: { provider: "youtube", id: "abc123", poster: "/posters/showreel.svg" },
  links: [{ label: "GitHub", url: "https://github.com/example/repo" }],
  order: 1,
};
```

Add these `it` cases inside `describe("projectSchema", ...)`:

```ts
  it("requires category, year, and role", () => {
    for (const field of ["category", "year", "role"]) {
      const bad = { ...validProject };
      delete (bad as Record<string, unknown>)[field];
      expect(() => projectSchema.parse(bad)).toThrow();
    }
  });
  it("allows duration and featured to be omitted", () => {
    const { duration, featured, ...rest } = validProject;
    const parsed = projectSchema.parse(rest);
    expect(parsed.featured).toBe(false);
    expect(parsed.duration).toBeUndefined();
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- schemas`
Expected: FAIL — `category`/`year`/`role` not yet in schema, `featured` default not applied.

- [ ] **Step 3: Extend `projectSchema` in `src/data/schemas.ts`**

Add the fields (place after `description`, before `tags`):

```ts
export const projectSchema = z.object({
  title: z.string().min(1),
  blurb: z.string().min(1).max(280),
  description: z.string().min(1),
  category: z.string().min(1), // card/poster chip, e.g. "SHOWREEL"
  year: z.string().min(1),
  role: z.string().min(1), // e.g. "Direction · Edit"
  duration: z.string().min(1).optional(), // clip length, e.g. "1:24"
  featured: z.boolean().default(false), // span-2 hero card; at most one (checked in content-order test)
  tags: z.array(z.string().min(1)).default([]),
  video: videoSchema.optional(),
  links: z.array(z.object({ label: z.string().min(1), url: httpUrl })).default([]),
  order: z.number().int(),
});
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- schemas`
Expected: PASS.

- [ ] **Step 5: Add a "single featured" guard to `tests/content-order.test.ts`**

Add a second `it` inside the existing describe (it already reads `src/content/projects/*.json`):

```ts
  it("has at most one featured project", () => {
    const featured = readdirSync(projectsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(new URL(f, projectsDir), "utf8")))
      .filter((p) => p.featured === true);
    expect(featured.length, `featured projects: ${featured.map((p) => p.title).join(", ")}`).toBeLessThanOrEqual(1);
  });
```

- [ ] **Step 6: Populate the five content entries**

Add the new fields to each `src/content/projects/*.json`. Use the design's placeholder content (`ph-atoms.jsx` `PROJECTS`) mapped to our slugs. Exact values:

`showreel.json` — add: `"category": "SHOWREEL", "year": "2025", "role": "Direction · Edit", "duration": "1:24", "featured": true`
`mobile-work.json` — add: `"category": "MOBILE APP", "year": "2024", "role": "Product · SwiftUI", "duration": "0:48", "featured": false`
`figurine-3d.json` — add: `"category": "3D / GAME", "year": "2024", "role": "Gameplay · Shaders", "featured": false` (no video → no duration)
`dev-tool.json` — add: `"category": "DEV TOOLING", "year": "2023", "role": "Solo · CLI", "featured": false`
`corkboard-game.json` — add: `"category": "GAME", "year": "2023", "role": "Solo · Web Audio", "duration": "0:52", "featured": false`

- [ ] **Step 7: Verify**

Run: `npm run verify`
Expected: green (schema validates all 5 entries at build; the featured guard passes — only showreel is featured).

- [ ] **Step 8: Commit**

```bash
git add tests/schemas.test.ts tests/content-order.test.ts src/data/schemas.ts src/content/projects/
git commit -m "feat: add category/year/role/duration/featured to project schema and content"
```

---

## Phase D — Cards, posters, work section

### Task 5: Video poster treatment (wraps the facade)

Restyle the poster shell to the scanline/dither/vignette treatment with a chunky play button, category chip, and duration — while keeping the existing click-to-load `VideoFacade` behavior (no third-party request pre-click).

**Files:**
- Modify: `src/components/VideoFacade.astro`

- [ ] **Step 1: Restyle `VideoFacade.astro`**

Reference prototype: `ph-atoms.jsx` `VideoPoster()` + `After Hours - Site.html` lines ~261–299 (`.ph-poster*`, `.ph-play`, `.ph-cat`, `.ph-dur`). Keep the existing `<script>` (the click→iframe swap) and the `Props` exactly as they are, but accept two new optional props and rework the markup/styles. New frontmatter:

```ts
---
interface Props {
  provider: "youtube" | "vimeo";
  id: string;
  poster: string;
  title: string;
  category?: string;
  duration?: string;
}
const { provider, id, poster, title, category, duration } = Astro.props;
const embedUrl =
  provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
    : `https://player.vimeo.com/video/${id}?autoplay=1`;
---
```

Markup (the button stays the click target; chip/duration are decorative overlays inside it):

```astro
<div class="facade" data-embed-url={embedUrl} data-video-title={title}>
  <button class="facade__play-area" type="button" aria-label={`Play video: ${title}`}>
    <img src={poster} alt="" loading="lazy" width="640" height="360" />
    {category && <span class="facade__cat" aria-hidden="true">{category}</span>}
    <span class="facade__play" aria-hidden="true"><i></i></span>
    {duration && <span class="facade__dur" aria-hidden="true">{duration}</span>}
  </button>
</div>
```

Keep the existing `<script>` block unchanged except update the selector from `.facade button` to `.facade__play-area` if needed (it currently queries `facade.querySelector("button")`, which still works). Replace the `<style>` with the design poster treatment (adapt from prototype, using our tokens):

```astro
<style>
  .facade { aspect-ratio: 16/9; border: var(--border-px) solid var(--c-grape); }
  .facade__play-area {
    position: relative; display: block; width: 100%; height: 100%; padding: 0; border: 0;
    background: var(--c-s1);
    background-image: repeating-linear-gradient(135deg, #1a1336 0 10px, #120c27 10px 20px);
    cursor: pointer; overflow: hidden;
  }
  .facade__play-area img { width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated; }
  .facade__play-area::after { content:""; position:absolute; inset:0; pointer-events:none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.26) 2px 3px); }
  .facade__play-area::before { content:""; position:absolute; inset:0; pointer-events:none; background: radial-gradient(80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.45)); }
  .facade__play { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:2; width:64px; height:64px; display:grid; place-items:center; background:var(--c-s2); border:2px solid var(--c-accent); box-shadow:4px 4px 0 var(--c-drop), 0 0 24px rgba(26,200,237,0.40); transition: transform .12s steps(2); }
  .facade__play-area:hover .facade__play { transform: translate(-50%,-50%) scale(1.06); }
  .facade__play i { width:0; height:0; border-left:18px solid var(--c-accent); border-top:11px solid transparent; border-bottom:11px solid transparent; margin-left:5px; }
  .facade__cat { position:absolute; top:12px; left:12px; z-index:3; font-family:var(--font-pixel); font-size:9px; letter-spacing:1px; color:var(--c-accent-2); text-transform:uppercase; background:rgba(11,9,22,0.85); border:2px solid var(--c-accent-2); padding:5px 8px; }
  .facade__dur { position:absolute; bottom:12px; right:12px; z-index:3; font-family:var(--font-mono); font-size:12px; color:var(--c-ink); background:rgba(11,9,22,0.85); border:1px solid var(--c-line); padding:3px 7px; }
  .facade :global(.facade__iframe) { width:100%; height:100%; border:0; display:block; }
</style>
```

Confirm the `<script>` still sets `iframe.className = "facade__iframe"` and `iframe.allowFullscreen = true` (from Plan 1) — keep those lines.

- [ ] **Step 2: Verify the no-third-party guarantee still holds**

Run: `npm run verify` then inspect `dist/index.html`: no `youtube`/`vimeo` host appears outside `data-embed-url`. The poster `<img>` src is the local `/posters/*.svg`.

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoFacade.astro
git commit -m "feat: scanline video poster treatment with category chip and duration"
```

---

### Task 6: Project card restyle + featured variant + work section

Restyle `ProjectCard` to the design (s2 fill, Silkscreen title, mono meta, chips), add the `featured` row-layout variant, and rebuild the work section in `index.astro` (featured span-2 + 2-up grid, "01 · SELECTED WORK" header).

**Files:**
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Rewrite `src/components/ProjectCard.astro`**

Reference prototype: `ph-atoms.jsx` `ProjectCard()` + `After Hours - Site.html` lines ~212–323. Pass the new fields through to the poster and render the meta:

```astro
---
import type { Project } from "../data/schemas";
import VideoFacade from "./VideoFacade.astro";

interface Props {
  project: Project;
  featured?: boolean;
}
const { project, featured = false } = Astro.props;
---

<article class:list={["card", { "card--featured": featured }]}>
  <span class="card__ripple" aria-hidden="true"></span>
  {project.video && (
    <VideoFacade
      provider={project.video.provider}
      id={project.video.id}
      poster={project.video.poster}
      title={project.title}
      category={project.category}
      duration={project.duration}
    />
  )}
  <div class="card__body">
    <h3 class="card__title">{project.title}</h3>
    <p class="card__blurb">{featured ? project.description : project.blurb}</p>
    <p class="card__meta"><span>{project.year}</span><span class="card__sep" aria-hidden="true"></span><span>{project.role}</span></p>
    {project.tags.length > 0 && (
      <ul class="card__tags" role="list">{project.tags.map((t) => <li>{t}</li>)}</ul>
    )}
  </div>
</article>

<style>
  .card { position: relative; display: flex; flex-direction: column; background: var(--c-s2); border: var(--border-px) solid var(--c-grape); box-shadow: 6px 6px 0 var(--c-drop); transition: transform .14s steps(2), box-shadow .14s; }
  .card__body { padding: 22px 22px 24px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; background: var(--c-s2); }
  .card__title { font-family: var(--font-pixel); font-size: 17px; color: var(--c-heading); margin: 0; line-height: 1.35; }
  .card__blurb { font-size: 15px; line-height: 1.58; color: var(--c-muted); margin: 0; text-wrap: pretty; }
  .card__meta { display: flex; align-items: center; gap: 10px; margin: 2px 0 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.5px; color: var(--c-faint); }
  .card__sep { width: 4px; height: 4px; background: var(--c-grape); }
  .card__tags { display: flex; flex-wrap: wrap; gap: 7px; margin: 4px 0 0; padding: 0; list-style: none; }
  .card__tags li { font-family: var(--font-pixel); font-size: 8px; letter-spacing: 0.5px; color: var(--c-accent); text-transform: uppercase; border: 2px solid var(--c-line); background: var(--c-s1); padding: 5px 8px 4px; }

  /* featured = row layout on desktop, stacks on mobile */
  .card--featured { flex-direction: row; }
  .card--featured :global(.facade) { flex: 1 1 58%; border-right: var(--border-px) solid var(--c-grape); border-bottom: none; }
  .card--featured .card__body { flex: 1 1 42%; justify-content: center; padding: 36px 34px; }
  .card--featured .card__title { font-size: 22px; }
  .card--featured .card__blurb { font-size: 16px; color: var(--c-ink); }
  @media (max-width: 760px) {
    .card--featured { flex-direction: column; }
    .card--featured :global(.facade) { border-right: none; border-bottom: var(--border-px) solid var(--c-grape); }
  }
</style>
```

The hover/glow/ripple CSS is added in Task 7 (kept separate so this task is purely structural). `.card__ripple` is in the markup now but inert until Task 7 styles it.

- [ ] **Step 2: Rebuild the work section in `src/pages/index.astro`**

The frontmatter already loads + sorts `projects`. Split out the featured one. Replace the frontmatter projects line with:

```ts
const projects = (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
const featured = projects.find((p) => p.data.featured);
const rest = projects.filter((p) => p !== featured);
```

Replace the existing projects `<section>` with the design's work section:

```astro
<section class="section work" id="work" aria-labelledby="work-heading">
  <div class="sec-head">
    <h2 class="sec-title" id="work-heading"><span class="sec-idx">01</span>SELECTED WORK</h2>
    <span class="sec-meta">{projects.length} projects · 2023–2025</span>
  </div>
  <div class="work-grid">
    {featured && <div class="work-grid__featured"><ProjectCard project={featured.data} featured /></div>}
    {rest.map((entry) => <ProjectCard project={entry.data} />)}
  </div>
</section>
```

Add to the page `<style>` (replace the old `.projects-grid` rule):

```css
.sec-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 38px; }
.sec-title { font-family: var(--font-pixel); font-size: 24px; color: var(--c-heading); margin: 0; display: inline-flex; align-items: center; gap: 14px; }
.sec-idx { font-size: 11px; color: var(--c-accent-2); letter-spacing: 1px; }
.sec-meta { font-family: var(--font-mono); font-size: 12px; color: var(--c-faint); letter-spacing: 0.5px; }
.work-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.work-grid__featured { grid-column: 1 / -1; }
@media (max-width: 760px) { .work-grid { grid-template-columns: 1fr; gap: 22px; } .sec-title { font-size: 17px; } }
```

- [ ] **Step 3: Verify**

Run: `npm run verify`
Expected: green. Inspect `dist/index.html`: featured card is `article.card.card--featured` spanning the grid, four standard cards below; section header "01 SELECTED WORK"; heading order remains h1 → h2 (no skips). Reflow to one column at 360px.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.astro src/pages/index.astro
git commit -m "feat: After Hours project cards with featured row variant and work section"
```

---

### Task 7: Card hover glow + one-shot ripple (CSS, reduced-motion aware)

The steady purple glow + the expanding ripple pulse on first hover (spec §16.8). Pure CSS, gated behind `prefers-reduced-motion`.

**Files:**
- Modify: `src/components/ProjectCard.astro` (append to its `<style>`)

- [ ] **Step 1: Append hover + ripple CSS**

Reference prototype: `After Hours - Site.html` lines ~224–255 (`.ph-card:hover`, `.ph-ripple`, `@keyframes ph-ripple-pulse`). Append to the ProjectCard `<style>`:

```css
  .card:hover { transform: translate(-3px,-3px); box-shadow: 9px 9px 0 var(--c-drop), 0 0 0 2px var(--c-accent), 0 0 22px rgba(26,200,237,0.28), 0 0 60px 14px rgba(135,99,214,0.45), 0 0 110px 30px rgba(86,69,146,0.40); }
  .card__ripple { position: absolute; left: 50%; top: 50%; z-index: -1; width: 60px; height: 60px; border-radius: 50%; transform: translate(-50%,-50%) scale(0); background: radial-gradient(circle, rgba(135,99,214,0.55) 0%, rgba(86,69,146,0.40) 32%, rgba(86,69,146,0.16) 55%, rgba(86,69,146,0) 72%); pointer-events: none; opacity: 0; will-change: transform, opacity; }
  .card:hover .card__ripple { animation: card-ripple 900ms cubic-bezier(.16,.7,.3,1) forwards; }
  @keyframes card-ripple {
    0% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
    12% { opacity: 0.95; }
    100% { transform: translate(-50%,-50%) scale(34); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) { .card:hover .card__ripple { animation: none; } }
```

The ripple sits at `z-index:-1` (behind the card) and the card body has opaque `background: var(--c-s2)` (set in Task 6), so the pulse blooms onto the black around the card, not over the text — matching the design.

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: green. (Visual effect can't be asserted headlessly; confirm the `card-ripple` keyframes and the reduced-motion override are present in `dist/_astro/*.css` via grep.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectCard.astro
git commit -m "feat: card hover glow and one-shot ripple pulse"
```

---

## Phase E — Expanded detail modal

### Task 8: Retro `.exe` modal / mobile bottom sheet

A focus-trapped expanded project view (spec §16.5): each card opens a retro window showing the playing video beside its detail. Mobile renders a bottom sheet. New interaction: open from card, `Esc`/close/scrim-click dismiss, focus restored.

**Files:**
- Create: `src/components/ProjectModal.astro`
- Modify: `src/components/ProjectCard.astro` (make the card open the modal)
- Modify: `src/pages/index.astro` (render one modal host)

- [ ] **Step 1: Decide the open mechanism**

The standalone view is static + tiny vanilla scripts. The modal is one `<dialog>` per page reused for every project; cards carry their data in `data-*` attributes and a single script populates + opens the dialog. Using the native `<dialog>` element gives us focus trap, `Esc`, and backdrop for free.

- [ ] **Step 2: Write `src/components/ProjectModal.astro`**

Reference prototype: `ph-views.jsx` `WindowInner()`/`ExpandedModal()` + `After Hours - Site.html` lines ~385–414 (`.ph-window`, `.ph-winbar`, `.ph-winbody`, `.ph-windetail`, `.ph-sheet`). One empty dialog, populated by script:

```astro
---
import VideoFacade from "./VideoFacade.astro";
---
<dialog class="modal" aria-labelledby="modal-title">
  <div class="modal__bar">
    <span class="modal__dot modal__dot--a" aria-hidden="true"></span>
    <span class="modal__dot" aria-hidden="true"></span>
    <span class="modal__dot" aria-hidden="true"></span>
    <span class="modal__bar-title" id="modal-title" data-modal-exe></span>
    <button class="modal__x" type="button" aria-label="Close" data-modal-close>×</button>
  </div>
  <div class="modal__body">
    <div class="modal__media" data-modal-media></div>
    <div class="modal__detail">
      <span class="modal__cat" data-modal-cat></span>
      <h2 class="modal__title" data-modal-title></h2>
      <p class="modal__blurb" data-modal-blurb></p>
      <dl class="modal__meta">
        <dt>Year</dt><dd data-modal-year></dd>
        <dt>Role</dt><dd data-modal-role></dd>
        <dt>Stack</dt><dd data-modal-stack></dd>
      </dl>
    </div>
  </div>
</dialog>

<style>
  .modal { width: 880px; max-width: calc(100% - 80px); padding: 0; border: 2px solid var(--c-accent); background: var(--c-s2); color: var(--c-ink); box-shadow: 0 0 0 2px var(--c-bg), 14px 16px 0 rgba(0,0,0,0.55), 0 0 60px rgba(26,200,237,0.18); }
  .modal::backdrop { background: rgba(5,4,12,0.74); }
  .modal__bar { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--c-grape); border-bottom: 2px solid var(--c-bg); }
  .modal__dot { width: 9px; height: 9px; background: var(--c-bg); }
  .modal__dot--a { background: var(--c-accent); }
  .modal__bar-title { font-family: var(--font-pixel); font-size: 12px; letter-spacing: 0.5px; color: #efeaff; flex: 1; }
  .modal__x { font-family: var(--font-pixel); font-size: 12px; color: var(--c-grape); background: var(--c-bg); border: 0; width: 26px; height: 22px; cursor: pointer; min-height: 0; }
  .modal__body { display: grid; grid-template-columns: 1.15fr 1fr; }
  .modal__media { border-right: 2px solid var(--c-grape); }
  .modal__detail { padding: 30px 30px 32px; display: flex; flex-direction: column; gap: 14px; }
  .modal__cat { font-family: var(--font-pixel); font-size: 9px; letter-spacing: 1px; color: var(--c-accent-2); text-transform: uppercase; }
  .modal__title { font-family: var(--font-pixel); font-size: 22px; line-height: 1.3; color: var(--c-heading); margin: 0; }
  .modal__blurb { font-size: 16px; line-height: 1.6; color: var(--c-ink); margin: 0; }
  .modal__meta { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--c-muted); margin: 2px 0 0; }
  .modal__meta dt { color: var(--c-faint); text-transform: uppercase; letter-spacing: 0.5px; }
  .modal__meta dd { margin: 0; }

  @media (max-width: 760px) {
    .modal { width: 100%; max-width: 100%; margin: auto auto 0; /* bottom sheet */ border: 0; border-top: 2px solid var(--c-accent); }
    .modal__body { grid-template-columns: 1fr; }
    .modal__media { border-right: none; border-bottom: 2px solid var(--c-grape); }
  }
</style>
```

Note: this task renders the *poster/scanline* treatment inside the modal media slot by cloning the card's facade markup via script (simplest: the script moves a clone of the clicked card's `.facade` into `[data-modal-media]`). Document that in the script step.

- [ ] **Step 3: Make cards open the modal (`ProjectCard.astro`)**

Wrap the card content trigger: add a button overlay or make the title a button. Simplest accessible approach — add a visually-spanning open button that doesn't swallow the video play button. Add to the card body, after the title:

```astro
    <button class="card__open" type="button"
      data-open-modal
      data-title={project.title}
      data-category={project.category}
      data-year={project.year}
      data-role={project.role}
      data-stack={project.tags.join(" · ")}
      data-blurb={project.description}>
      <span class="visually-hidden">Open {project.title} details</span>
    </button>
```

CSS (append to ProjectCard style):

```css
  .card__open { position: absolute; inset: 0; z-index: 2; background: none; border: 0; cursor: pointer; min-height: 0; }
  /* keep the video play button clickable above the open overlay */
  .card :global(.facade) { position: relative; z-index: 3; }
  .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

Tradeoff documented: the poster (z-3) plays the video; the rest of the card (open overlay z-2) opens the modal. This keeps both actions reachable by keyboard (two focusable controls per card).

Add `.visually-hidden` to `global.css` instead if preferred (it's reused) — put it in `global.css` and drop it from the component to avoid duplication.

- [ ] **Step 4: Render one modal + wire the open/close script in `index.astro`**

Import and render `<ProjectModal />` once, just before `</Base>` close. Add a script (module) that opens/populates it:

```astro
<script>
  const dialog = document.querySelector<HTMLDialogElement>(".modal");
  if (dialog) {
    const set = (sel: string, val: string) => { const el = dialog.querySelector<HTMLElement>(sel); if (el) el.textContent = val; };
    let lastTrigger: HTMLElement | null = null;
    for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-open-modal]")) {
      btn.addEventListener("click", () => {
        const d = btn.dataset;
        set("[data-modal-exe]", `${d.title}.exe`);
        set("[data-modal-cat]", d.category ?? "");
        set("[data-modal-title]", d.title ?? "");
        set("[data-modal-blurb]", d.blurb ?? "");
        set("[data-modal-year]", d.year ?? "");
        set("[data-modal-role]", d.role ?? "");
        set("[data-modal-stack]", d.stack ?? "");
        // clone the card's poster into the modal media slot
        const media = dialog.querySelector<HTMLElement>("[data-modal-media]");
        const facade = btn.closest(".card")?.querySelector(".facade");
        if (media) { media.replaceChildren(); if (facade) media.appendChild(facade.cloneNode(true)); }
        lastTrigger = btn;
        dialog.showModal();
      });
    }
    dialog.querySelector("[data-modal-close]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // scrim click
    dialog.addEventListener("close", () => lastTrigger?.focus());
  }
</script>
```

Note: the cloned facade in the modal is a fresh DOM node, so its click→iframe script (registered at page load on the originals) won't be bound. Acceptable for v1: the modal shows the poster; "play" inside the modal is a follow-up. Document this limitation in the task. (If play-in-modal is wanted now, the facade script must delegate from `document` instead of binding per-node — note as an optional enhancement, not required.)

- [ ] **Step 5: Verify**

Run: `npm run verify`
Expected: green. Inspect `dist/index.html`: one `<dialog class="modal">`, each card has a `[data-open-modal]` button with the data attributes, and the modal script is bundled. Native `<dialog>` gives focus trap + Esc.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectModal.astro src/components/ProjectCard.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: retro .exe project detail modal with mobile bottom sheet"
```

---

## Phase F — Hero, decorative accents, final sweep

### Task 9: Scene-banner hero (desktop) + intro band + mobile hero

Restyle the hero to the design (spec §16.2): desktop gets a full-bleed pixel-scene placeholder banner with hotspots + corner mark + room hint, then an intro band (eyebrow, wordmark, lede, signature, CTAs); mobile stacks without the banner.

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Rewrite the hero in `index.astro`**

Reference prototype: `ph-views.jsx` `HeroDesktop()`/`Hero()` + `After Hours - Site.html` lines ~104–197 (`.ph-hero-stage`, `.ph-scene`, `.ph-hotspot`, `.ph-intro`, `.ph-eyebrow`, `.ph-wordmark`, `.ph-lede`, `.ph-sig`). The frontmatter already has `name`, `tagline`, `bio`. Replace the existing `<header class="hero">` block with:

```astro
<header class="hero">
  <div class="scene">
    <span class="scene__mark" aria-hidden="true"><span class="scene__dot"></span>THE ROOM</span>
    <span class="scene__slot" aria-hidden="true">pixel scene — full bleed<br /><small>authored room art loads here</small></span>
    <span class="hotspot" style="left:20%;top:32%" aria-hidden="true"><span>+</span></span>
    <span class="hotspot" style="left:46%;top:46%" aria-hidden="true"><span>+</span></span>
    <span class="hotspot" style="left:68%;top:30%" aria-hidden="true"><span>+</span></span>
    <span class="hotspot" style="left:78%;top:62%" aria-hidden="true"><span>+</span></span>
    <span class="hotspot" style="left:34%;top:70%" aria-hidden="true"><span>+</span></span>
    <a class="scene__hint" href="/room" data-room-link><span class="crt" aria-hidden="true"></span><span>Explore the interactive room<small>best on desktop</small></span></a>
  </div>
  <div class="intro">
    <div class="intro__left">
      <span class="eyebrow">Portfolio · after dark</span>
      <h1 class="wordmark">{name}</h1>
    </div>
    <div class="intro__right">
      <p class="lede">{bio}</p>
      <p class="sig"><span class="sig__cur">&gt;</span> {tagline}</p>
      <div class="cta-row">
        <a class="btn" href="#work">View the work ↓</a>
        <a class="btn btn--ghost" href="#contact">Say hello</a>
      </div>
    </div>
  </div>
</header>
```

The `.scene` is `aria-hidden` decorative (it's a placeholder/preview; the real room link is also in the nav and as the `.scene__hint`). The `.scene__hint` room link is hidden on touch via the same media query as `.nav__try`.

- [ ] **Step 2: Add hero CSS to the page `<style>`**

Adapt from the prototype (using tokens). Add:

```css
.hero { padding-top: 30px; }
.scene { position: relative; width: 100%; aspect-ratio: 16/7; min-height: 380px; background: var(--c-s2); background-image: radial-gradient(120% 130% at 50% 8%, rgba(86,69,146,0.34), rgba(86,69,146,0) 60%), repeating-linear-gradient(135deg, #1a1338 0 12px, #130d29 12px 24px); border: var(--border-px) solid var(--c-grape); box-shadow: 8px 8px 0 var(--c-drop), inset 0 0 0 2px rgba(86,69,146,0.25), inset 0 0 120px rgba(86,69,146,0.30); overflow: hidden; }
.scene__mark { position: absolute; top: 16px; left: 18px; display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-pixel); font-size: 12px; letter-spacing: 1px; color: var(--c-heading); background: rgba(11,9,22,0.7); border: 2px solid var(--c-line); padding: 7px 11px; }
.scene__dot { width: 9px; height: 9px; background: var(--c-accent); box-shadow: 0 0 10px rgba(26,200,237,0.7); }
.scene__slot { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); font-family: var(--font-mono); font-size: 12px; letter-spacing: 1px; color: var(--c-faint); text-transform: uppercase; text-align: center; line-height: 1.8; border: 2px dashed var(--c-line); padding: 16px 22px; background: rgba(11,9,22,0.6); }
.hotspot { position: absolute; width: 34px; height: 34px; transform: translate(-50%,-50%); display: grid; place-items: center; background: rgba(86,69,146,0.55); border: 2px solid var(--c-accent); border-radius: 50%; box-shadow: 0 0 0 4px rgba(11,9,22,0.55), 0 0 18px rgba(26,200,237,0.55); }
.hotspot span { font-family: var(--font-pixel); font-size: 15px; color: var(--c-accent); }
.scene__hint { position: absolute; right: 16px; bottom: 16px; display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-pixel); font-size: 10px; letter-spacing: 0.5px; color: var(--c-accent); text-decoration: none; text-transform: uppercase; padding: 9px 13px; background: rgba(11,9,22,0.82); border: 2px solid var(--c-accent); box-shadow: 3px 3px 0 var(--c-aqua-deep); }
.scene__hint small { display: block; color: var(--c-faint); font-size: 9px; }
.intro { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: end; margin-top: 46px; }
.eyebrow { font-family: var(--font-pixel); font-size: 11px; letter-spacing: 3px; color: var(--c-accent); text-transform: uppercase; margin-bottom: 28px; display: inline-flex; align-items: center; gap: 12px; }
.eyebrow::before { content:""; width: 26px; height: 2px; background: var(--c-accent); box-shadow: 0 0 8px rgba(26,200,237,0.6); }
.wordmark { font-family: var(--font-pixel); font-size: 72px; line-height: 0.98; letter-spacing: -1px; color: var(--c-heading); margin: 0; text-shadow: 0 0 26px rgba(183,156,237,0.28), 5px 5px 0 rgba(86,69,146,0.45); }
.lede { font-size: 19px; line-height: 1.62; color: var(--c-ink); max-width: 30em; margin: 0 0 16px; text-wrap: pretty; }
.sig { font-family: var(--font-mono); font-size: 13px; color: var(--c-muted); margin: 0 0 34px; }
.sig__cur { color: var(--c-accent); }
.cta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
@media (hover: none), (pointer: coarse) { .scene, .scene__hint { display: none; } }
@media (max-width: 760px) {
  .intro { grid-template-columns: 1fr; gap: 24px; margin-top: 0; }
  .wordmark { font-size: 48px; }
  .lede { font-size: 16px; }
}
```

Note the touch query hides `.scene` entirely on mobile (the design's mobile hero has no scene banner), so mobile users land directly on the intro band.

- [ ] **Step 3: Add the `#about` anchor**

The nav links to `#about`. The bio currently lives in the hero lede. Either keep a dedicated About section (Plan 1 had one) or point `#about` at the intro. Simplest: add `id="about"` to the `.intro` div so the nav anchor resolves. Update: `<div class="intro" id="about">`.

- [ ] **Step 4: Verify**

Run: `npm run verify`
Expected: green. Inspect `dist/index.html`: hero has the decorative scene (aria-hidden), the intro band with the single h1 wordmark, and `#work`/`#about`/`#contact` anchors all resolve. At 360px the scene is hidden, intro stacks.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: scene-banner hero with intro band, mobile-stacked"
```

---

### Task 10: Contact restyle, decorative twinkles, and final a11y/contrast/Lighthouse sweep

Restyle the contact/footer to the design, add CSS twinkle stars as decorative accents, and run the full quality gate (spec §11).

**Files:**
- Modify: `src/components/ContactSection.astro`
- Modify: `src/pages/index.astro` (footer + a couple of twinkles)
- Modify: any file a check below flags.

- [ ] **Step 1: Restyle `ContactSection.astro`**

Reference prototype: `ph-views.jsx` `Contact()` + `After Hours - Site.html` lines ~369–383. Keep the existing obfuscated-mailto frontmatter + copy-email `<script>` exactly. Update the markup wrapper to the design's contact panel and footer, and replace the `<style>` to use night tokens (`.contact-panel` → grape-framed s2; title Silkscreen 34 wisteria; sub 17 ink; footer mono social links). Keep the `aria-labelledby="contact-heading"` section and the `id="contact"`.

Concretely, change the section opening so the nav anchor resolves and the heading uses the design treatment:

```astro
<section class="section" id="contact" aria-labelledby="contact-heading">
  <div class="sec-head"><h2 class="sec-title" id="contact-heading"><span class="sec-idx">02</span>GET IN TOUCH</h2></div>
  <div class="pixel-box contact-panel">
    <h3 class="contact__title">LET’S MAKE<br />SOMETHING LATE</h3>
    <p class="contact__sub">Commissions, collaborations, or just trading favourite 2&nbsp;a.m. records — the inbox is always open.</p>
    <div class="contact" >
      <Fragment set:html={`<a class="btn" href="mailto:${encoded}">${encoded}</a>`} />
      <button class="btn btn--ghost" type="button" aria-live="polite" data-user={user} data-domain={domain}>Copy email</button>
    </div>
    <ul class="socials" role="list">{socials.map((s) => <li><a class="link" href={s.url}>{s.label}</a></li>)}</ul>
  </div>
</section>
```

Update the `<style>` `.contact__title { font-family: var(--font-pixel); font-size: 34px; color: var(--c-heading); margin: 0 0 16px; line-height: 1.05; }`, `.contact__sub { font-size: 17px; color: var(--c-ink); max-width: 34em; margin: 0 0 28px; }`, keep `.contact`/`.socials` flex rules, and reuse the shared `.sec-head`/`.sec-title`/`.sec-idx` (move those to `global.css` so both the work section and contact can use them without duplication — do that as part of this step: cut `.sec-head/.sec-title/.sec-idx/.sec-meta` from `index.astro`'s `<style>` into `global.css`).

- [ ] **Step 2: Restyle the footer in `index.astro`**

Replace the existing `.footer` block with the design's footer:

```astro
<footer class="footer">
  <span class="footer__mark">© {new Date().getFullYear()} {name}</span>
  <div class="footer__soc">{site.data.socials.map((s) => <a class="footer__link" href={s.url}>{s.label}</a>)}</div>
</footer>
```

CSS:

```css
.footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 30px 0 46px; border-top: var(--border-px) solid var(--c-line); margin-top: 56px; flex-wrap: wrap; }
.footer__mark { font-family: var(--font-pixel); font-size: 11px; color: var(--c-muted); letter-spacing: 1px; }
.footer__soc { display: flex; gap: 18px; }
.footer__link { font-family: var(--font-mono); font-size: 13px; color: var(--c-faint); text-decoration: none; }
.footer__link:hover { color: var(--c-accent); }
```

- [ ] **Step 3: Add a couple of decorative twinkle stars**

Add a reusable `.star` rule to `global.css` and sprinkle 2–3 `aria-hidden` spans in the hero/contact (decorative only):

```css
.star { position: absolute; width: 2px; height: 2px; background: var(--c-accent); box-shadow: 0 -4px var(--c-accent), 0 4px var(--c-accent), -4px 0 var(--c-accent), 4px 0 var(--c-accent), 0 0 7px rgba(26,200,237,0.8); }
.star--teal { background: var(--c-accent-2); box-shadow: 0 -3px var(--c-accent-2), 0 3px var(--c-accent-2), -3px 0 var(--c-accent-2), 3px 0 var(--c-accent-2); }
.star--lav { background: var(--c-heading); box-shadow: 0 -3px var(--c-heading), 0 3px var(--c-heading), -3px 0 var(--c-heading), 3px 0 var(--c-heading); }
```

Add e.g. `<span class="star" style="left:12%;top:120px" aria-hidden="true"></span>` inside the hero (the `.hero` needs `position: relative`). Keep it minimal — these are accents, not the focus.

- [ ] **Step 4: Keyboard + semantics walkthrough**

With `npm run dev`: Tab from the address bar. Confirm: skip link first; nav (mark → links → room pill / or burger); hero CTAs; each card exposes two controls (play + open-details) reachable in order; modal opens on Enter, traps focus, `Esc` closes, focus returns to the card; copy-email flashes "Copied!"; contact mailto + socials reachable. One h1 (wordmark); h2s = Work, Contact; h3s = card/contact titles — no skipped levels.

- [ ] **Step 5: Reflow + reduced motion + Lighthouse**

- 360px: no horizontal scroll; scene banner hidden; cards single-column; featured stacks; tap targets ≥ 44px.
- Emulate `prefers-reduced-motion: reduce`: ripple/hover transitions suppressed.
- Run Lighthouse against `npm run preview` (desktop + mobile). Expected: Accessibility ≥ 95, SEO ≥ 95, Performance ≥ 90, Best Practices ≥ 95. The contrast test already guards color; fix any other finding.

- [ ] **Step 6: Full verify + commit**

Run: `npm run verify`
Expected: green.

```bash
git add -A
git commit -m "feat: After Hours contact, footer, twinkles, and final a11y sweep"
```

---

## Plan completion criteria

- `npm run verify` passes (astro check 0 errors, all Vitest suites, build exit 0).
- The standalone view renders the After Hours design: black-night palette, Silkscreen/Geist/Geist Mono type, nav (with mobile hamburger), scene-banner hero + intro band, "01 SELECTED WORK" with a featured row card + grid, scanline posters, retro `.exe` modal / mobile sheet, contact panel + footer, twinkles, hover glow + ripple.
- All color comes from `tokens.css`; AA contrast stays test-enforced (two-tier); the video facade still makes zero third-party requests before click; semantic landmarks, keyboard operability, and reduced-motion hold.
- Content remains fully collection-driven; the new project fields validate at build.
- `/room` link is present but 404s until Plan 2 (documented forward link); the desktop hero scene is a drop-in placeholder for the same authored room art Plan 2 will produce.

## Known follow-ups (out of scope here)

- **Play-in-modal:** the cloned facade in the modal shows the poster but doesn't re-bind the click→iframe script. If wanted, refactor the facade script to event-delegate from `document` so cloned nodes work. (Task 8 note.)
- **Real room art** for the hero scene banner arrives with Plan 2 (shared authored asset).
- **`/room` route** itself is Plan 2.

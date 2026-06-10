# M0–M1: Foundations + Standalone Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the resilient baseline of the two-view portfolio — shared content collections, design tokens, and the complete standalone view — deployed to Cloudflare Pages and publicly shippable on its own.

**Architecture:** Astro 5 static site. Content lives in Zod-validated content collections (the single content source both views will read). Design tokens are CSS custom properties in one canonical file. The standalone view is semantic, zero-JS-by-default HTML with two tiny opt-in scripts (video facade, copy-email). The room (M2+) is a later plan; nothing here depends on it.

**Tech Stack:** Astro 5 + TypeScript (strict), Zod, Vitest, @astrojs/sitemap, @fontsource/silkscreen (placeholder pixel font), pngjs (OG placeholder generation), Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-06-10-portfolio-two-views-design.md`

**This is Plan 1 of 3.** Plan 2 (M2–M3, room scaffold + interactivity) and Plan 3 (M4–M6, discovery + atmosphere + launch) are written just-in-time after this plan executes.

**Conventions for this plan:**
- All commands run from the repo root. npm scripts are cross-platform.
- "Expected: PASS" means the command exits 0 with no errors in output.
- Placeholder values that get swapped later are marked `PLACEHOLDER` in code comments — they are deliberate per the spec (§15), not gaps.
- The deploy pipeline goes live in Task 2 (spec M0: deploy early). Every push to `main` after that auto-deploys to the `*.pages.dev` preview domain; that's intended — no custom domain is attached until launch.

---

### Task 1: Astro scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro` (minimal; replaced in Task 8)

- [ ] **Step 1: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "personal-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "check": "astro check",
    "verify": "astro check && vitest run && astro build"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install astro @astrojs/sitemap @astrojs/check typescript zod @fontsource/silkscreen`
Expected: exits 0, creates `package-lock.json`.

- [ ] **Step 4: Write `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // PLACEHOLDER domain — swapped for the real custom domain at launch (Plan 3 / M6).
  // Also update public/robots.txt when this changes.
  site: "https://personal-site.example.com",
  integrations: [sitemap()],
});
```

- [ ] **Step 5: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 6: Write minimal `src/pages/index.astro`**

```astro
---
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Personal Site</title>
  </head>
  <body>
    <h1>Scaffold OK</h1>
  </body>
</html>
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: exits 0; `dist/index.html` and `dist/sitemap-index.xml` exist.

- [ ] **Step 8: Commit**

```bash
git add .gitignore package.json package-lock.json astro.config.mjs tsconfig.json src/pages/index.astro
git commit -m "feat: scaffold Astro 5 project with sitemap and strict TS"
```

---

### Task 2: Deploy pipeline live (Cloudflare Pages)

Spec M0 requires the deploy pipeline live from the start, not at the end. Manual dashboard task — after this, every push to `main` auto-deploys.

- [ ] **Step 1: Push main**

Run: `git push origin main`

- [ ] **Step 2: Create the Pages project (Cloudflare dashboard)**

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Select the `Personal-Site` repo, production branch `main`.
3. Framework preset: **Astro**. Build command: `npm run build`. Build output directory: `dist`.
4. Save and deploy.

- [ ] **Step 3: Verify the live scaffold**

Open the assigned `*.pages.dev` URL.
Expected: "Scaffold OK" page renders; `/sitemap-index.xml` reachable.

- [ ] **Step 4: Record the deployment URL and commit**

Add the `*.pages.dev` URL to `README.md` under a "Deployment" heading:

```markdown
## Deployment

Deployed via Cloudflare Pages (auto-deploys on push to `main`): <https://YOUR-PROJECT.pages.dev>
```

```bash
git add README.md
git commit -m "docs: record Cloudflare Pages deployment URL"
git push origin main
```

Confirm the push triggers a new deployment in the Pages dashboard.

---

### Task 3: Vitest + WCAG contrast utility (TDD)

The contrast utility powers an automated guard: every approved text/background token pair must meet WCAG AA. When the real palette replaces the placeholder, this test is what catches a failing pair.

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/contrast.test.ts`
- Create: `src/lib/contrast.ts`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: exits 0.

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {},
});
```

- [ ] **Step 3: Write the failing test `tests/contrast.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, relativeLuminance } from "../src/lib/contrast";

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#1a1c2c")).toEqual([26, 28, 44]);
  });
  it("expands 3-digit hex", () => {
    expect(hexToRgb("#abc")).toEqual([170, 187, 204]);
  });
  it("throws on invalid input", () => {
    expect(() => hexToRgb("#12345")).toThrow(/Invalid hex/);
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
  it("is symmetric", () => {
    expect(contrastRatio("#1a1c2c", "#ffcd75")).toBeCloseTo(
      contrastRatio("#ffcd75", "#1a1c2c"),
      10,
    );
  });
  it("matches known WCAG value for red on white", () => {
    expect(contrastRatio("#ff0000", "#ffffff")).toBeCloseTo(4.0, 1);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/lib/contrast`.

- [ ] **Step 5: Write `src/lib/contrast.ts`**

```ts
/** WCAG 2.x relative luminance and contrast ratio (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio). */

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const six =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(six)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(six.slice(0, 2), 16),
    parseInt(six.slice(2, 4), 16),
    parseInt(six.slice(4, 6), 16),
  ];
}

function channelLuminance(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all contrast tests green.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts tests/contrast.test.ts src/lib/contrast.ts package.json package-lock.json
git commit -m "feat: add WCAG contrast utility with vitest setup"
```

---

### Task 4: Design tokens with AA-enforced palette (TDD)

`src/styles/tokens.css` is the canonical token sheet per spec §5. The placeholder palette is a Sweetie 16 subset (warm amber lamp light against deep blue-night shadows — matches the after-hours mood until the real palette arrives). The test parses the CSS file directly, so tokens.css stays the single source of truth with no duplicated palette in TS.

**Files:**
- Create: `tests/palette-contrast.test.ts`
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write the failing test `tests/palette-contrast.test.ts`**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/lib/contrast";

function readTokens(): Record<string, string> {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)) {
    map[m[1]!] = m[2]!;
  }
  return map;
}

/** Approved foreground/background pairs. Every text-bearing combination used
 *  in either view must be listed here and meet WCAG AA (4.5:1). */
const APPROVED_PAIRS: Array<[fg: string, bg: string]> = [
  ["--c-text", "--c-bg"],
  ["--c-text-dim", "--c-bg"],
  ["--c-accent", "--c-bg"],
  ["--c-link", "--c-bg"],
  ["--c-text", "--c-surface"],
  ["--c-text-dim", "--c-surface"],
  ["--c-bg", "--c-accent"], // dark text on accent buttons
];

describe("token palette", () => {
  const tokens = readTokens();

  it("defines every token used in approved pairs", () => {
    for (const [fg, bg] of APPROVED_PAIRS) {
      expect(tokens[fg], `${fg} missing from tokens.css`).toBeDefined();
      expect(tokens[bg], `${bg} missing from tokens.css`).toBeDefined();
    }
  });

  it.each(APPROVED_PAIRS)("%s on %s meets WCAG AA (4.5:1)", (fg, bg) => {
    const ratio = contrastRatio(tokens[fg]!, tokens[bg]!);
    expect(
      ratio,
      `${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `ENOENT` reading `src/styles/tokens.css`.

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
/* ============================================================
   Design tokens — THE canonical palette/type/spacing source.
   Both views consume these. The art-tool swatch export (Plan 2)
   parses this file. Keep colors as 6-digit hex on single lines.

   PLACEHOLDER palette: Sweetie 16 subset. Swap values (not names)
   when the locked palette from the design-pass reference lands.
   The palette-contrast test enforces WCAG AA on approved pairs.
   ============================================================ */
:root {
  /* --- palette --- */
  --c-bg-deep: #11121f;   /* deepest shadow, page edges, stepped shadows */
  --c-bg: #1a1c2c;        /* page background, night blue-black */
  --c-surface: #333c57;   /* cards, panels */
  --c-border: #566c86;    /* hard edges, dividers */
  --c-text: #f4f4f4;      /* primary text */
  --c-text-dim: #94b0c2;  /* secondary text */
  --c-accent: #ffcd75;    /* lamp amber — headings, focus, buttons */
  --c-accent-2: #ef7d57;  /* ember orange — hover, highlights */
  --c-link: #73eff7;      /* links */

  /* --- type --- */
  --font-pixel: "Silkscreen", monospace; /* PLACEHOLDER pixel font; headings + UI accents only */
  --font-body: system-ui, "Segoe UI", sans-serif; /* body copy stays highly legible */
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
  --border-px: 3px;       /* chunky borders */
  --shadow-step: 6px;     /* stepped (offset, unblurred) shadow */
  --focus-ring: 3px solid var(--c-accent);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — every approved pair ≥ 4.5:1.

- [ ] **Step 5: Commit**

```bash
git add tests/palette-contrast.test.ts src/styles/tokens.css
git commit -m "feat: add canonical design tokens with AA contrast enforcement"
```

---

### Task 5: Content schemas (TDD)

Schemas live in `src/data/schemas.ts` as plain Zod (not `astro:content` imports) so Vitest can test them without the Astro runtime. `content.config.ts` (Task 6) imports them — one definition, used by both the build and the tests. In Plan 2, the manifest validator reuses these to check content references.

**Files:**
- Create: `tests/schemas.test.ts`
- Create: `src/data/schemas.ts`

- [ ] **Step 1: Write the failing test `tests/schemas.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { flavorSchema, projectSchema, siteSchema } from "../src/data/schemas";

const validProject = {
  title: "Showreel",
  blurb: "A rolling cut of recent work.",
  description: "Longer description for the standalone page.",
  tags: ["video"],
  video: { provider: "youtube", id: "abc123", poster: "/posters/showreel.svg" },
  links: [{ label: "GitHub", url: "https://github.com/example/repo" }],
  order: 1,
};

describe("projectSchema", () => {
  it("accepts a complete project", () => {
    expect(projectSchema.parse(validProject)).toMatchObject({ title: "Showreel" });
  });
  it("accepts a project without video or links", () => {
    const { video, links, ...rest } = validProject;
    expect(projectSchema.parse(rest).links).toEqual([]);
  });
  it("rejects a video without a poster (spec: posters are required + self-hosted)", () => {
    const bad = { ...validProject, video: { provider: "youtube", id: "abc123" } };
    expect(() => projectSchema.parse(bad)).toThrow();
  });
  it("rejects an unknown video provider", () => {
    const bad = { ...validProject, video: { ...validProject.video, provider: "dailymotion" } };
    expect(() => projectSchema.parse(bad)).toThrow();
  });
  it("rejects a non-URL link", () => {
    const bad = { ...validProject, links: [{ label: "x", url: "not-a-url" }] };
    expect(() => projectSchema.parse(bad)).toThrow();
  });
  it("rejects a missing title", () => {
    const { title, ...bad } = validProject;
    expect(() => projectSchema.parse(bad)).toThrow();
  });
});

describe("flavorSchema", () => {
  it("accepts flavor text", () => {
    expect(flavorSchema.parse({ text: "The mug is still warm." }).text).toBeTruthy();
  });
  it("rejects empty text", () => {
    expect(() => flavorSchema.parse({ text: "" })).toThrow();
  });
});

describe("siteSchema", () => {
  const validSite = {
    name: "Tim Hawkins",
    tagline: "Games, tools, and experiments.",
    bio: "Placeholder bio paragraph.",
    email: "timmyhawkins3@gmail.com",
    socials: [{ label: "GitHub", url: "https://github.com/example" }],
    ogDescription: "Portfolio of Tim Hawkins.",
  };
  it("accepts valid site data", () => {
    expect(siteSchema.parse(validSite).name).toBe("Tim Hawkins");
  });
  it("rejects an invalid email", () => {
    expect(() => siteSchema.parse({ ...validSite, email: "nope" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../src/data/schemas`.

- [ ] **Step 3: Write `src/data/schemas.ts`**

```ts
import { z } from "zod";

/** Self-hosted poster is REQUIRED with any video: no third-party requests
 *  (including provider thumbnails) before the visitor clicks play. Spec §4. */
export const videoSchema = z.object({
  provider: z.enum(["youtube", "vimeo"]),
  id: z.string().min(1),
  poster: z.string().min(1),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  blurb: z.string().min(1).max(280), // room panel copy — short by design
  description: z.string().min(1), // standalone page copy
  tags: z.array(z.string()).default([]),
  video: videoSchema.optional(),
  links: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).default([]),
  order: z.number().int(),
});

export const flavorSchema = z.object({
  text: z.string().min(1),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  email: z.string().email(),
  socials: z.array(z.object({ label: z.string().min(1), url: z.string().url() })),
  ogDescription: z.string().min(1),
});

export type Video = z.infer<typeof videoSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Flavor = z.infer<typeof flavorSchema>;
export type Site = z.infer<typeof siteSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/schemas.test.ts src/data/schemas.ts
git commit -m "feat: add zod content schemas (projects, flavor, site)"
```

---

### Task 6: Content collections + placeholder entries

Wires the schemas into Astro content collections and creates one entry per spec §4 content slot. Entry filenames are the slugs the room manifest will reference in Plan 2. All copy is placeholder (spec §15.3).

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/showreel.json`
- Create: `src/content/projects/mobile-work.json`
- Create: `src/content/projects/figurine-3d.json`
- Create: `src/content/projects/dev-tool.json`
- Create: `src/content/projects/corkboard-game.json`
- Create: `src/content/flavor/{mug,plant,headphones,cat,record-player,window}.json` (6 files)
- Create: `src/content/site.json`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { flavorSchema, projectSchema, siteSchema } from "./data/schemas";

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
    schema: projectSchema,
  }),
  flavor: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/flavor" }),
    schema: flavorSchema,
  }),
  // Singleton: a one-element array so the file() loader gets an id.
  site: defineCollection({
    loader: file("./src/content/site.json"),
    schema: siteSchema,
  }),
};
```

- [ ] **Step 2: Write the five project entries**

`src/content/projects/showreel.json`:

```json
{
  "title": "Showreel",
  "blurb": "PLACEHOLDER — a rolling cut of recent work: games, tools, and experiments.",
  "description": "PLACEHOLDER — longer showreel description for the standalone page. Two or three sentences about the breadth of work shown in the reel.",
  "tags": ["showreel"],
  "video": { "provider": "youtube", "id": "PLACEHOLDER_ID", "poster": "/posters/showreel.svg" },
  "links": [],
  "order": 1
}
```

`src/content/projects/mobile-work.json`:

```json
{
  "title": "Mobile Work",
  "blurb": "PLACEHOLDER — mobile apps and prototypes.",
  "description": "PLACEHOLDER — description of mobile projects: what was built, for whom, with what.",
  "tags": ["mobile"],
  "video": { "provider": "youtube", "id": "PLACEHOLDER_ID", "poster": "/posters/mobile-work.svg" },
  "links": [{ "label": "GitHub", "url": "https://github.com/example/placeholder" }],
  "order": 2
}
```

`src/content/projects/figurine-3d.json`:

```json
{
  "title": "3D & Game Art",
  "blurb": "PLACEHOLDER — 3D modeling and game work.",
  "description": "PLACEHOLDER — description of 3D / game art projects.",
  "tags": ["3d", "games"],
  "links": [{ "label": "ArtStation", "url": "https://artstation.com/example" }],
  "order": 3
}
```

`src/content/projects/dev-tool.json`:

```json
{
  "title": "Dev Tooling Side Project",
  "blurb": "PLACEHOLDER — a developer tooling side project.",
  "description": "PLACEHOLDER — what the tool does, why it exists, what it's built with.",
  "tags": ["tooling"],
  "links": [{ "label": "GitHub", "url": "https://github.com/example/placeholder-tool" }],
  "order": 4
}
```

`src/content/projects/corkboard-game.json`:

```json
{
  "title": "Game Project",
  "blurb": "PLACEHOLDER — a game project pinned to the corkboard.",
  "description": "PLACEHOLDER — description of the game: genre, engine, role.",
  "tags": ["games"],
  "video": { "provider": "youtube", "id": "PLACEHOLDER_ID", "poster": "/posters/corkboard-game.svg" },
  "links": [],
  "order": 5
}
```

- [ ] **Step 3: Write the six flavor entries**

Each file follows this shape — `src/content/flavor/mug.json`:

```json
{ "text": "PLACEHOLDER — the mug is still warm. Third refill tonight." }
```

`plant.json`: `{ "text": "PLACEHOLDER — somehow still alive. Watered biweekly, admired daily." }`
`headphones.json`: `{ "text": "PLACEHOLDER — current rotation: lo-fi and rain sounds. Mostly rain sounds." }`
`cat.json`: `{ "text": "PLACEHOLDER — chief quality assurance officer. Sleeps on the warmest hardware." }`
`record-player.json`: `{ "text": "PLACEHOLDER — vinyl for focus sessions. The crackle is a feature." }`
`window.json`: `{ "text": "PLACEHOLDER — it's been raining all evening. Best debugging weather." }`

- [ ] **Step 4: Write `src/content/site.json`**

```json
[
  {
    "id": "main",
    "name": "Tim Hawkins",
    "tagline": "PLACEHOLDER — games, tools, and late-night experiments.",
    "bio": "PLACEHOLDER — a short bio paragraph. Who you are, what you build, what you care about. Two to four sentences.",
    "email": "timmyhawkins3@gmail.com",
    "socials": [
      { "label": "GitHub", "url": "https://github.com/example" },
      { "label": "LinkedIn", "url": "https://linkedin.com/in/example" }
    ],
    "ogDescription": "PLACEHOLDER — portfolio of Tim Hawkins: games, tools, and experiments."
  }
]
```

- [ ] **Step 5: Verify collections load and validate**

Run: `npm run build`
Expected: exits 0 (collection schemas validate at build). To prove validation is live, temporarily delete `"title"` from `showreel.json`, run `npm run build` again, and confirm it FAILS with a schema error naming the entry — then restore the field.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: wire content collections with placeholder entries for all slots"
```

---

### Task 7: Base layout, global styles, robots.txt

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/styles/global.css`
- Create: `public/robots.txt`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.65;
}

h1,
h2,
h3 {
  font-family: var(--font-pixel);
  line-height: 1.25;
  color: var(--c-accent);
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: var(--c-link);
}

:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  z-index: 100;
  background: var(--c-accent);
  color: var(--c-bg);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-pixel);
}

.skip-link:focus {
  left: 0;
}

/* Hard-edged building blocks shared across the standalone view */
.pixel-box {
  background: var(--c-surface);
  border: var(--border-px) solid var(--c-border);
  box-shadow: var(--shadow-step) var(--shadow-step) 0 var(--c-bg-deep);
}

.btn {
  display: inline-block;
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  background: var(--c-accent);
  color: var(--c-bg);
  border: var(--border-px) solid var(--c-bg-deep);
  box-shadow: var(--shadow-step) var(--shadow-step) 0 var(--c-bg-deep);
  font-family: var(--font-pixel);
  font-size: var(--text-base);
  text-decoration: none;
  cursor: pointer;
}

.btn:hover {
  background: var(--c-accent-2);
}

.btn:active {
  translate: var(--shadow-step) var(--shadow-step);
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Write `src/layouts/Base.astro`**

```astro
---
import "@fontsource/silkscreen";
import "../styles/tokens.css";
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  noindex?: boolean;
}

const { title, description, noindex = false } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL("/og.png", Astro.site);
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex" />}
    <link rel="canonical" href={canonical} />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />
    <slot name="head" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <slot />
  </body>
</html>
```

The `noindex` prop exists now because `/room` (Plan 2) requires it per spec §9. `/room` also needs its canonical pointed at `/` rather than itself — Plan 2 extends this layout for that; the default self-canonical is correct for every page in this plan.

- [ ] **Step 3: Write `public/robots.txt`**

```
User-agent: *
Allow: /

# PLACEHOLDER domain — swapped at launch alongside astro.config.mjs `site`.
Sitemap: https://personal-site.example.com/sitemap-index.xml
```

- [ ] **Step 4: Verify**

Run: `npm run verify`
Expected: PASS (check + tests + build all exit 0).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/styles/global.css public/robots.txt
git commit -m "feat: add base layout with meta/OG, global pixel styling, robots.txt"
```

---

### Task 8: Index page with hero/bio from content

Replaces the scaffold index with the real page skeleton: hero + bio from the `site` collection, with section placeholders that Tasks 10–11 fill.

**Files:**
- Modify: `src/pages/index.astro` (full replacement)

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import { getEntry } from "astro:content";
import Base from "../layouts/Base.astro";

const site = await getEntry("site", "main");
if (!site) throw new Error("site content entry 'main' is missing");
const { name, tagline, bio, ogDescription } = site.data;
---

<Base title={`${name} — Portfolio`} description={ogDescription}>
  <header class="hero">
    <h1>{name}</h1>
    <p class="hero__tagline">{tagline}</p>
  </header>

  <main id="main">
    <section class="section" aria-labelledby="about-heading">
      <h2 id="about-heading">About</h2>
      <p>{bio}</p>
    </section>

    <!-- Projects section added in Task 10 -->
    <!-- Contact section added in Task 11 -->
  </main>

  <footer class="footer">
    <p>&copy; {new Date().getFullYear()} {name}</p>
  </footer>
</Base>

<style>
  .hero {
    padding: var(--space-6) var(--space-4) var(--space-5);
    max-width: 56rem;
    margin-inline: auto;
  }

  .hero h1 {
    font-size: var(--text-2xl);
    margin: 0 0 var(--space-2);
  }

  .hero__tagline {
    color: var(--c-text-dim);
    font-size: var(--text-lg);
    margin: 0;
  }

  main {
    max-width: 56rem;
    margin-inline: auto;
    padding: 0 var(--space-4) var(--space-6);
  }

  .section {
    margin-block: var(--space-5);
  }

  .section h2 {
    font-size: var(--text-xl);
  }

  .footer {
    border-top: var(--border-px) solid var(--c-border);
    color: var(--c-text-dim);
    font-size: var(--text-sm);
    padding: var(--space-4);
    text-align: center;
  }
</style>
```

- [ ] **Step 2: Verify visually and in build**

Run: `npm run dev`, open `http://localhost:4321`.
Expected: hero with pixel-font name in amber, tagline, About section; readable body font; skip link appears on first Tab press.
Then run: `npm run build` — exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: index page hero and bio rendered from site content"
```

---

### Task 9: Video facade component + placeholder posters

Click-to-load facade per spec §9/§11: a labeled button with a self-hosted poster; the provider iframe is created only on click, so no third-party request happens before opt-in. Placeholder posters are SVG (text-authorable now; real art will be PNG — the schema field is a path, agnostic to format).

**Files:**
- Create: `src/components/VideoFacade.astro`
- Create: `public/posters/showreel.svg`
- Create: `public/posters/mobile-work.svg`
- Create: `public/posters/corkboard-game.svg`

- [ ] **Step 1: Write `src/components/VideoFacade.astro`**

```astro
---
interface Props {
  provider: "youtube" | "vimeo";
  id: string;
  poster: string;
  title: string;
}

const { provider, id, poster, title } = Astro.props;
const embedUrl =
  provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
    : `https://player.vimeo.com/video/${id}?autoplay=1`;
---

<div class="facade" data-embed-url={embedUrl} data-video-title={title}>
  <button class="facade__play" type="button" aria-label={`Play video: ${title}`}>
    <img src={poster} alt="" loading="lazy" width="640" height="360" />
    <span class="facade__icon" aria-hidden="true">&#9654;</span>
  </button>
</div>

<script>
  for (const facade of document.querySelectorAll<HTMLElement>(".facade")) {
    facade.querySelector("button")?.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = facade.dataset.embedUrl ?? "";
      iframe.title = facade.dataset.videoTitle ?? "Video";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.className = "facade__iframe";
      facade.replaceChildren(iframe);
      iframe.focus();
    });
  }
</script>

<style>
  .facade {
    aspect-ratio: 16 / 9;
    border: var(--border-px) solid var(--c-bg-deep);
  }

  .facade__play {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: var(--c-bg-deep);
    cursor: pointer;
  }

  .facade__play img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: pixelated;
  }

  .facade__icon {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 3rem;
    color: var(--c-accent);
    text-shadow: var(--shadow-step) var(--shadow-step) 0 var(--c-bg-deep);
  }

  .facade__play:hover .facade__icon {
    color: var(--c-accent-2);
  }

  .facade :global(.facade__iframe) {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
</style>
```

- [ ] **Step 2: Write the three placeholder posters**

Same shape for each, label differing — `public/posters/showreel.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#333c57"/>
  <rect x="10" y="10" width="620" height="340" fill="none" stroke="#ffcd75" stroke-width="8"/>
  <text x="320" y="190" text-anchor="middle" font-family="monospace" font-size="28" fill="#f4f4f4">poster: showreel</text>
</svg>
```

`mobile-work.svg` and `corkboard-game.svg`: identical except the `<text>` label (`poster: mobile-work`, `poster: corkboard-game`).

- [ ] **Step 3: Verify in isolation**

Temporarily add to `index.astro` inside `<main>`:

```astro
<VideoFacade provider="youtube" id="PLACEHOLDER_ID" poster="/posters/showreel.svg" title="Showreel" />
```

(with `import VideoFacade from "../components/VideoFacade.astro";` in frontmatter). Run `npm run dev`:
- Poster renders with play glyph; no `youtube` request in the network tab before click.
- Click swaps in the iframe (it will show a YouTube "video unavailable" error for `PLACEHOLDER_ID` — expected until real IDs land).
Remove the temporary usage afterward (Task 10 adds the real usage).

- [ ] **Step 4: Commit**

```bash
git add src/components/VideoFacade.astro public/posters/
git commit -m "feat: click-to-load video facade with self-hosted placeholder posters"
```

---

### Task 10: Project cards + projects section

**Files:**
- Create: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro` (replace the `<!-- Projects section added in Task 10 -->` comment)

- [ ] **Step 1: Write `src/components/ProjectCard.astro`**

```astro
---
import type { Project } from "../data/schemas";
import VideoFacade from "./VideoFacade.astro";

interface Props {
  project: Project;
}

const { project } = Astro.props;
---

<article class="card pixel-box">
  {
    project.video && (
      <VideoFacade
        provider={project.video.provider}
        id={project.video.id}
        poster={project.video.poster}
        title={project.title}
      />
    )
  }
  <div class="card__body">
    <h3>{project.title}</h3>
    <p>{project.description}</p>
    {
      project.tags.length > 0 && (
        <ul class="card__tags" role="list">
          {project.tags.map((tag) => (
            <li>{tag}</li>
          ))}
        </ul>
      )
    }
    {
      project.links.length > 0 && (
        <p class="card__links">
          {project.links.map((link) => (
            <a href={link.url}>{link.label}</a>
          ))}
        </p>
      )
    }
  </div>
</article>

<style>
  .card__body {
    padding: var(--space-3) var(--space-4) var(--space-4);
  }

  .card__body h3 {
    font-size: var(--text-lg);
    margin: 0 0 var(--space-2);
  }

  .card__body p {
    margin: 0 0 var(--space-3);
  }

  .card__tags {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0 0 var(--space-3);
    padding: 0;
  }

  .card__tags li {
    font-family: var(--font-pixel);
    font-size: var(--text-sm);
    color: var(--c-text-dim);
    border: 2px solid var(--c-border);
    padding: var(--space-1) var(--space-2);
  }

  .card__links {
    margin: 0;
    display: flex;
    gap: var(--space-3);
  }

  .card__links a {
    font-family: var(--font-pixel);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
</style>
```

- [ ] **Step 2: Add the projects section to `src/pages/index.astro`**

In the frontmatter, add:

```ts
import { getCollection } from "astro:content";
import ProjectCard from "../components/ProjectCard.astro";

const projects = (await getCollection("projects")).sort(
  (a, b) => a.data.order - b.data.order,
);
```

Replace `<!-- Projects section added in Task 10 -->` with:

```astro
<section class="section" aria-labelledby="projects-heading">
  <h2 id="projects-heading">Projects</h2>
  <div class="projects-grid">
    {projects.map((entry) => <ProjectCard project={entry.data} />)}
  </div>
</section>
```

Add to the page `<style>` block:

```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
  gap: var(--space-4);
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: five project cards sorted by `order`; three show video facades; cards reflow to one column at narrow widths (test at 360px in devtools responsive mode).
Run: `npm run verify` — PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.astro src/pages/index.astro
git commit -m "feat: project cards grid rendered from content collection"
```

---

### Task 11: Contact section + footer wiring

Mailto with HTML-entity-encoded address (real link, works with JS disabled — the obfuscation is build-time encoding only), plus a JS-enhanced copy-email button and social links. Spec §2.

**Files:**
- Create: `src/components/ContactSection.astro`
- Modify: `src/pages/index.astro` (replace the `<!-- Contact section added in Task 11 -->` comment)

- [ ] **Step 1: Write `src/components/ContactSection.astro`**

```astro
---
interface Props {
  email: string;
  socials: { label: string; url: string }[];
}

const { email, socials } = Astro.props;
// Light obfuscation: entity-encode every character so the raw HTML never
// contains the plain address. Browsers decode entities in href + text,
// so the mailto link works without JS.
const encoded = email
  .split("")
  .map((c) => `&#${c.charCodeAt(0)};`)
  .join("");
const [user = "", domain = ""] = email.split("@");
---

<section class="section" aria-labelledby="contact-heading">
  <h2 id="contact-heading">Get in touch</h2>
  <div class="contact">
    <Fragment set:html={`<a class="btn" href="mailto:${encoded}">${encoded}</a>`} />
    <button class="btn" type="button" data-user={user} data-domain={domain}>
      Copy email
    </button>
  </div>
  <ul class="socials" role="list">
    {
      socials.map((s) => (
        <li>
          <a href={s.url}>{s.label}</a>
        </li>
      ))
    }
  </ul>
</section>

<script>
  const button = document.querySelector<HTMLButtonElement>("button[data-user]");
  button?.addEventListener("click", async () => {
    const email = `${button.dataset.user}@${button.dataset.domain}`;
    await navigator.clipboard.writeText(email);
    const original = button.textContent;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = original;
    }, 1500);
  });
</script>

<style>
  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .socials {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
  }

  .socials a {
    font-family: var(--font-pixel);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
</style>
```

- [ ] **Step 2: Wire into `src/pages/index.astro`**

Frontmatter: `import ContactSection from "../components/ContactSection.astro";`

Replace `<!-- Contact section added in Task 11 -->` with:

```astro
<ContactSection email={site.data.email} socials={site.data.socials} />
```

- [ ] **Step 3: Verify**

Run: `npm run dev`. Expected:
- "View source" shows no plain-text email (entities only).
- Mailto button opens the mail client; copy button writes the address to the clipboard and flashes "Copied!".
- With JS disabled (devtools), the mailto link still works.
Run: `npm run verify` — PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactSection.astro src/pages/index.astro
git commit -m "feat: contact section with obfuscated mailto and copy-email button"
```

---

### Task 12: OG placeholder image + 404 page

**Files:**
- Create: `scripts/make-og-image.mjs`
- Create: `public/og.png` (generated)
- Create: `src/pages/404.astro`

- [ ] **Step 1: Install pngjs**

Run: `npm install -D pngjs`
Expected: exits 0.

- [ ] **Step 2: Write `scripts/make-og-image.mjs`**

```js
// Generates the PLACEHOLDER OG image (1200x630, token colors, hard border).
// The real pixel-art OG card replaces public/og.png in M6 — same path, no code change.
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const W = 1200;
const H = 630;
const BORDER = 24;
const bg = [0x1a, 0x1c, 0x2c];
const accent = [0xff, 0xcd, 0x75];

const png = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const isBorder = x < BORDER || y < BORDER || x >= W - BORDER || y >= H - BORDER;
    const [r, g, b] = isBorder ? accent : bg;
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = 255;
  }
}
writeFileSync("public/og.png", PNG.sync.write(png));
console.log("wrote public/og.png");
```

- [ ] **Step 3: Generate the image**

Run: `node scripts/make-og-image.mjs`
Expected: prints `wrote public/og.png`; file is 1200×630.

- [ ] **Step 4: Write `src/pages/404.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---

<Base title="404 — Not found" description="Page not found." noindex>
  <main id="main" class="lost">
    <h1>404</h1>
    <p>This room doesn't exist. The one with all the projects is over here:</p>
    <a class="btn" href="/">Back home</a>
  </main>
</Base>

<style>
  .lost {
    min-height: 80vh;
    display: grid;
    place-content: center;
    gap: var(--space-3);
    text-align: center;
    padding: var(--space-4);
  }

  .lost h1 {
    font-size: var(--text-2xl);
    margin: 0;
  }
</style>
```

- [ ] **Step 5: Verify**

Run: `npm run build`, then `npm run preview`, open `http://localhost:4321/nope`.
Expected: 404 page renders on-theme. `dist/og.png` exists.

- [ ] **Step 6: Commit**

```bash
git add scripts/make-og-image.mjs public/og.png src/pages/404.astro package.json package-lock.json
git commit -m "feat: placeholder OG image generator and 404 page"
```

---

### Task 13: Accessibility + quality pass, live verification

No new features — a structured verification of spec §11 requirements (fixing anything found), then confirmation against the live deployment.

**Files:**
- Modify: any file where a check below fails.

- [ ] **Step 1: Keyboard walkthrough**

With `npm run dev` open: Tab from the address bar through the whole page.
Expected: first Tab reveals the skip link; skip link jumps to `#main`; every link, facade play button, and the copy button is reachable in document order with the chunky amber focus ring visible; no focus traps.

- [ ] **Step 2: Structure and semantics check**

In browser devtools (or with a screen reader):
- Landmarks: one `header`, one `main`, one `footer`; sections labelled via `aria-labelledby`.
- Exactly one `h1`; heading levels never skip (h1 → h2 → h3).
- Facade buttons announce "Play video: {title}"; poster images have empty `alt` (decorative).

- [ ] **Step 3: Lighthouse audit (local)**

Run Lighthouse (devtools, against `npm run preview` build) on desktop and mobile.
Expected: Accessibility ≥ 95, SEO ≥ 95, Performance ≥ 90 mobile. Fix regressions before proceeding — common offenders: contrast (must not happen — token test covers it), missing meta, tap target sizing.

- [ ] **Step 4: Reflow + reduced motion**

- 360px viewport: no horizontal scrolling, single-column cards, all controls ≥ 44px tall.
- Emulate `prefers-reduced-motion: reduce` (devtools rendering tab): no element animates (the `.btn:active` translate is an instant state change, acceptable).

- [ ] **Step 5: Commit fixes and push**

Run: `npm run verify`
Expected: PASS.

```bash
git add -A
git commit -m "fix: accessibility pass findings for standalone view"
git push origin main
```

(Skip the commit if the pass found nothing to fix — but still push any unpushed work.)

- [ ] **Step 6: Verify the live deployment**

Open the `*.pages.dev` URL after the deployment finishes. Expected:
- Full standalone page renders identically to local preview.
- `/robots.txt`, `/sitemap-index.xml`, `/og.png` all reachable; 404 page appears for unknown paths.
- Re-run Lighthouse against the live URL: scores match Step 3.

---

## Plan completion criteria

- `npm run verify` passes (astro check, all Vitest suites, build).
- The standalone view is live on Cloudflare Pages: hero/bio, five project cards (three with click-to-load video facades), contact with obfuscated mailto + copy button, 404, robots/sitemap/OG meta.
- All content renders from collections; all colors come from `tokens.css`; AA contrast is test-enforced.
- Deliberately deferred to Plan 2 (M2–M3): the `/room` route, capability routing, and the standalone view's "try the interactive version" link (it can't link to a route that doesn't exist yet).
- Nothing in this plan references the room — Plan 2 builds it on top of these foundations without modifying content or tokens.

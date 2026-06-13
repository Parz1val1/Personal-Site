# Personal Portfolio — Two-View Design Spec

**Date:** 2026-06-10 (amended 2026-06-13: §16 After Hours standalone design; §4/§5 palette + content-model updates)
**Status:** Plan 1 (M0–M1 standalone baseline) shipped. Standalone visual redesign (§16) planned next; room (M2+) pending.
**Repo:** Personal-Site

## 1. Overview

A personal portfolio with two views sharing one content source and one visual language:

1. **The room** (`/room`) — a pixel-art point-and-click scene for desktop/pointer devices. A single cozy, side-on cutaway room ("after-hours dev session": warm lamp light, cool shadows, rain on the window). Hovering objects highlights them with a label; clicking opens a discovery panel with a blurb and, for some objects, a project video. A quiet completion meter unlocks a small reward (hidden drawer/note + contact action) when filled.
2. **The standalone portfolio** (`/`) — the resilient, accessible, mobile, share-friendly baseline. Same projects, videos, and bio in a responsive semantic layout that carries the same pixel-art aesthetic through CSS rather than sprites.

The room is progressive enhancement on top of the standalone view. The two views must never drift: single content source, single token sheet.

**The hard architectural constraint:** all room art (objects *and* UI) is hand-authored later and drops in with **zero code changes** — only files replacing placeholders that match a data manifest.

## 2. Decisions log

| Decision | Choice | Why |
|---|---|---|
| Stack | Astro + React/TS `client:only` island for the room | Static zero-JS HTML baseline for `/`; typed content collections as the single content source; React where interactivity justifies it |
| Room renderer | DOM stage (no canvas/WebGL) | Real `<button>` hotspots give free a11y/keyboard; real-text-over-frames requirement is just HTML; CSS `border-image` implements 9-slice; ~12 objects is trivial DOM load |
| Videos | YouTube/Vimeo embeds behind a theme-styled click-to-load facade | No bandwidth/encoding burden; facade preserves the aesthetic and blocks third-party requests until opt-in click |
| Hosting | Cloudflare Pages (Netlify = equivalent fallback) | Free tier, custom domain, immutable asset caching; pipeline live from M0 |
| Contact | `mailto:` + copy-email button + social links | No backend or form service; lightly obfuscated from naive scrapers |
| Persistence | `localStorage` for discovery state | Revisits keep progress; no accounts, no server |

## 3. Architecture

```
/        → standalone view. Pure static Astro. Canonical, indexed. Zero JS by default
           (plus: tiny inline capability-redirect script, copy-email button, video facades).
/room    → Astro page mounting one client:only React island. noindex, canonical → /.
shared   → content collections (Zod-validated), tokens.css, fonts.
```

The room island receives content + manifest as build-time props serialized by the Astro page — no client-side fetching, no API.

## 4. Content model

Astro content collections, schemas in `src/content.config.ts` (Zod). Drift between views is a build error.

- **`projects`** — one JSON entry per project:
  `slug`, `title`, `blurb` (short; room panel copy + standalone card), `description` (full; standalone modal), `category` (e.g. "SHOWREEL", "MOBILE APP" — the card/poster chip), `year` (string), `role` (e.g. "Direction · Edit"), `duration?` (clip length, e.g. "1:24"), `featured?` (boolean; at most one — the span-2 hero card), `tags`, `video?: { provider: "youtube" | "vimeo", id: string, poster: string }`, `links?: { label, url }[]`, `order`.
  Posters are **required** when a video is present and are always self-hosted images — never hotlinked provider thumbnails — so no third-party request happens before the visitor clicks (§9, §11). `category`/`year`/`role`/`duration`/`featured` were added by the After Hours design handoff (§16); the room reads only `title`/`blurb`/`video`, so these fields are standalone-only and optional to the room.
- **`flavor`** — room-only personality copy (mug, cat, plant, record player, headphones, window…): `id`, `text`. Lives in content land so *all prose* is in one place; never in the manifest, never in art.
- **`site`** — singleton: `name`, `tagline`, `bio`, `email`, `socials[]`, `ogDescription`.

The room manifest binds objects to content by reference:
`content: { kind: "project", slug } | { kind: "flavor", id } | { kind: "bio" } | { kind: "contact" }`.
A build-time check verifies every manifest content reference resolves to a real entry.

Initial content slots (entries created with placeholder copy in M0):

| Room object | Content |
|---|---|
| Monitor | project: showreel (centerpiece) |
| Phone/tablet | project: mobile work |
| Shelf figurine | project: 3D / game work |
| Sticky badge on monitor | project: dev-tooling side project |
| Corkboard card | project: game work |
| Mug, plant, headphones, cat, record player, rainy window | flavor entries |
| Hidden drawer (reward) | contact |

Default: every object except the hidden drawer has `countsTowardCompletion: true`. The flag is per-object manifest data, so this is tunable without code changes.

## 5. Design tokens & palette pipeline

- `src/styles/tokens.css` is **canonical**: locked palette, type scale, spacing scale, hard-edged border/stepped-shadow styles, `--font-pixel`, `--font-body`. Both views import it; the island styles against the same custom properties. No smooth gradients anywhere.
- `scripts/export-palette.mjs` exports the token palette to `.gpl`/`.hex` swatch files for art tools (Aseprite etc.). Palette is defined once; the art tool consumes a generated artifact.
- **Fonts:** `--font-pixel` = **Silkscreen** (bitmap; headings + UI accents only); `--font-body` = **Geist** (legible body); `--font-mono` = **Geist Mono** (meta/captions: durations, role, footer). All three via `@fontsource` self-hosted packages — no Google Fonts CDN (preserves the no-third-party-request rule). No paragraphs in the pixel font.
- **LOCKED palette — five core hexes, "After Hours" night mapping (design handoff 2026-06-12, §16; supersedes the 2026-06-11 grape-background reading):** black `#000000` (the night — page background), dusty grape `#564592` (raised *structure*: card borders, chips, active rings, window title bars), sky aqua `#1ac8ed` (primary accent — links, interactive, focus, play buttons), ocean mist `#2ebfa5` (secondary accent — category chips, tertiary), wisteria `#b79ced` (headings & large text on dark).
- **Derived grape-tinted elevation + text shades** (low-chroma, all AA-checked): `--s1 #0b0916` (deep section band), `--s2 #15102a` (card/panel fill — the home of body text), `--s3 #221a40` (raised/hover within a card), `--line #362c5e` (hairline divider), `--ink #ece9f7` (near-white lavender body — 15.4:1 on s2), `--muted #aba0ce` (secondary/meta — 7.6:1 on s2), `--faint #7d72a6` (tertiary/captions — **4.24:1 on s2, below AA-normal; must be lightened to ≥4.5:1 for any body-size use, or restricted to large/decorative meta** — resolve in the plan), `--aqua-deep #06343f` (button stepped-shadow ink).
- **Why this mapping wins:** body text on the dark elevation surfaces clears AA with huge headroom (15–17:1) where the earlier black-on-grape reading failed (2.66:1) and forced wisteria panels. Full grape `#564592` is reserved for chrome/borders/chips; card *fills* are the darker `--s2` framed in true grape, so near-white body text clears AA on every surface.
- **Contrast rule:** the palette-contrast test enforces two tiers — 4.5:1 for body-size text pairs, 3:1 for pairs the CSS guarantees render only at large size (≥24px regular / ≥18.66px bold). Every text/ground combination must be listed in the appropriate tier; `--faint` must pass whichever tier it is used at. The room's art palette (Plan 2) may extend the locked set; the same rules apply to any text it carries.

## 6. Room manifest

`src/data/room-manifest.json`, validated by `src/data/room-manifest.schema.ts` (Zod; exported TS types; friendly parse errors). The manifest owns everything spatial and visual — **code never references object names**.

```jsonc
{
  "canvas": {
    "width": 384, "height": 216,            // source px; final value confirmed against reference art
    "minViewport": { "w": 900, "h": 560 }   // below this, route to standalone
  },
  "background": { "src": "bg/room-plate.png" },   // full-canvas plate; non-interactive scenery lives here
  "objects": [
    {
      "id": "monitor",
      "sprite": { "src": "objects/monitor.png" },
      // animated form:
      // "sprite": { "src": "objects/cat.sheet.png", "frameW": 32, "frameH": 24,
      //             "frames": 6, "fps": 8, "loop": true },
      "hoverSrc": "objects/monitor.hover.png",  // optional authored hover variant;
                                                // omitted → CSS brightness highlight fallback
      "pos": { "x": 150, "y": 70 },
      "z": 30,
      "hotspot": { "x": 148, "y": 66, "w": 60, "h": 48 },  // canvas px; omit → sprite bounds
      "label": "Examine monitor",
      "content": { "kind": "project", "slug": "showreel" },
      "countsTowardCompletion": true
    }
  ],
  "ui": {
    "panel":  { "src": "ui/panel.png",  "slice": { "top": 8, "right": 8, "bottom": 8, "left": 8 } },
    "button": { "src": "ui/button.png", "slice": { "top": 4, "right": 6, "bottom": 4, "left": 6 } },
    "label":  { "src": "ui/label.png",  "slice": { "top": 4, "right": 4, "bottom": 4, "left": 4 } },
    "meter":  { "src": "ui/meter.sheet.png", "frames": 9 },   // frame n = n/(frames-1) filled
    "cursor": { "src": "ui/cursor.png", "hotX": 1, "hotY": 1 },
    "note":   { "src": "ui/hurry-note.png" },
    "icons":  { "close": "ui/icon-close.png", "play": "ui/icon-play.png" }
  }
}
```

Schema rules:

- Every interactive object is its own transparent sprite. Non-interactive scenery is baked into the background plate.
- Animated sprites: horizontal strip spritesheets, frames left→right, single row; sheet width must equal `frameW × frames` (validated).
- Overlapping hotspots (e.g. sticky badge on monitor): resolved by `z` — DOM stacking gives the topmost element pointer events naturally.
- All visible text (labels, panel copy, buttons) is real HTML text in the pixel font layered over frames — **never baked into images**. Manifest `label` strings are data, rendered as text.

## 7. Room rendering

- **Stage:** fixed `canvas.width × canvas.height` div, scaled by the largest integer factor fitting the viewport (CSS transform), letterboxed, `image-rendering: pixelated` on all sprites. No anti-aliasing, no fractional scaling.
- **Sprites:** absolutely positioned `<img>` (or div with background for sheets) per object.
- **Hotspots:** real `<button>` elements with `aria-label` = manifest label. Tabbable in manifest order; visible pixel-style focus ring.
- **Hover:** authored `hoverSrc` swap when present, else CSS brightness bump; label tooltip (9-slice `ui/label` frame, pixel font) follows the cursor; custom cursor via CSS `cursor: url(...) hotX hotY, auto`.
  - Cursor constraint: browsers reliably support ~32px cursor images; cursor is authored at 16 or 32 px and does **not** scale with the stage.
- **Discovery panel:** dialog pattern — focus trapped, `Esc` and close-button dismiss, background inert. 9-slice frame via CSS `border-image` (sliced per manifest insets); content is live text + optional video facade.
  - **Known risk:** `border-image` + `image-rendering: pixelated` has had browser inconsistencies. Verified in M2; fallback is a 3×3 grid with `background-position` slicing — same manifest schema either way.
- **Animation:** spritesheet playback via CSS `steps(frames)` keyframes from manifest `fps`. Ambient loops (steam, cat, rain, record player) use the same pipeline.
- **Reduced motion:** `prefers-reduced-motion` → ambient loops hold their first frame; opening sequence replaced by the settled end state.
- **Opening sequence (M5):** short (~2s) lamp-on/fade-in choreographed with CSS classes; skippable by any click/keypress.
- **Completion:** discovered set persisted to `localStorage` (`room-discoveries-v1`). Meter shows `discovered / countsTowardCompletion-total` via the meter spritesheet frames (nearest frame for fractional fill) + `aria` progressbar. At 100%: hidden drawer object becomes interactive, revealing the reward note + contact action (mailto + copy-email).
- The room assumes desktop pointer + `minViewport`. It is **not** mobile-responsive and does not support touch — by design.

## 8. Drop-in asset pipeline

Three scripts make the zero-code-swap constraint enforceable:

- **`scripts/make-placeholders.mjs`** — reads the manifest; generates correctly-sized, labeled placeholder PNGs for every sprite (objects, hover variants, sheets with visible frame divisions, UI with visible slice guides, background plate). Placeholders cannot drift from the spec because the manifest *is* the spec.
- **`scripts/validate-assets.mjs`** — verifies every manifest-referenced file exists, dimensions match, sheets equal `frameW × frames`, and content references resolve. Runs in CI and via `npm run check:assets`. A wrong-sized real sprite fails loudly instead of rendering weird.
- **`scripts/export-palette.mjs`** — tokens → art-tool swatches (§5).

**`docs/asset-spec.md`** (written in M2) is the artist contract:

- Canvas size and integer-scaling model; art authored at 1× source resolution only.
- Per-sprite dimension table (generated from the manifest): filename, w×h, frames/fps if animated, slice insets if 9-slice.
- Locked palette (the exported swatches); PNG-24 with binary transparency (alpha 0 or 255), no anti-aliasing, no semi-transparent pixels.
- Naming: `objects/<id>.png`, `objects/<id>.hover.png`, `objects/<id>.sheet.png` (horizontal strip), `ui/<name>.png`, `bg/room-plate.png`.
- 9-slice authoring: corners render unscaled; edges tile; author UI sprites at minimum natural size; inset diagrams per sprite.
- **No text baked into art, ever.** Text renders live in the pixel font over the frames.

Drop-in flow: replace files in `public/room/sprites/**` → run `npm run check:assets` → done. Position/z/hotspot tuning happens in the manifest (data, not code).

## 9. Navigation, capability routing & SEO

- `/` is canonical and indexed; full content as static HTML.
- Inline `<head>` script on `/`: if `matchMedia("(hover: hover) and (pointer: fine)")` matches **and** viewport ≥ `minViewport` **and** no `sessionStorage` opt-out **and** `!navigator.webdriver` → `location.replace("/room")` before first paint. Capability detection, no UA sniffing.
- `/room`: `<meta name="robots" content="noindex">`, canonical → `/`.
- "In a hurry? →" note in the room links to `/` and sets the session opt-out (no redirect bounce-back).

**Site navigation (standalone view, lands in M2):**

- A `<nav>` landmark in the Base layout (so the 404 page gets it too) with jump links — About / Projects / Contact — targeting the existing section anchors, plus the "try the interactive version (best on desktop)" room link, visible only on hover-capable devices via media query.
- **Progressive enhancement hamburger:** the links render as a plain visible list in the HTML; a small script (same pattern as the copy-email button) collapses them behind a hamburger `<button>` with `aria-expanded`/`aria-controls` at narrow widths. With JS disabled, mobile gets the expanded vertical list — never a dead hamburger.
- Touch targets ≥ 44px, pixel styling from existing tokens/classes, the standard amber focus ring.
- Smooth scrolling to anchors gated behind `prefers-reduced-motion: no-preference`.
- Default behavior: sticky bar on desktop, static (scrolls away) on mobile — tunable at implementation.
- `prefers-reduced-motion` does **not** change routing; the room honors it internally.
- **Known risk:** JS-redirecting the canonical page can confuse crawlers despite the `navigator.webdriver` gate. M6 includes Search Console verification post-deploy; pre-agreed fallback (one-line change): drop the auto-redirect, make the room link a prominent styled "door" on `/`.
- SEO basics: per-page titles/descriptions, Open Graph + Twitter cards, OG image (placeholder generated; real pixel-art card authored in M6), sitemap, canonicals.

## 10. Folder structure

```
public/room/sprites/{bg,objects,ui}/   ← drop-in art; nothing else lives here
src/content/{projects,flavor,site}/    ← content collections
src/content.config.ts                  ← Zod schemas for collections
src/data/room-manifest.json
src/data/room-manifest.schema.ts       ← Zod + exported TS types
src/styles/{tokens.css,global.css}
src/pages/{index.astro,room.astro,404.astro}
src/components/                        ← Astro components (standalone view)
src/room/                              ← React island
  ├─ Room.tsx                          ← root
  ├─ stage/                            ← Stage, SpriteObject, Hotspot
  ├─ ui/                               ← Panel9Slice, Meter, PixelButton, LabelTip, HurryNote
  ├─ state/                            ← discovery store/reducer + persistence
  └─ hooks/                            ← useIntegerScale, useReducedMotion, useSpritesheet
scripts/{make-placeholders,validate-assets,export-palette}.mjs
docs/asset-spec.md
docs/superpowers/specs/
```

## 11. Accessibility

- **Standalone:** semantic landmarks, single `h1`, skip link, chunky on-theme `:focus-visible`, touch targets ≥ 44px, WCAG AA contrast on all text pairs, fluid reflow, `prefers-reduced-motion` respected; animation decorative, never required. Nav disclosure (hamburger) uses a real `<button>` with `aria-expanded`/`aria-controls` and works without JS (§9).
- **Room:** hotspots are labeled, tabbable buttons; panels are focus-trapped dialogs with `Esc`; meter is an `aria` progressbar; full keyboard operability despite being a pointer-first experience.
- **Video:** facade is a labeled button with self-hosted poster `<img>` (lazy-loaded); the third-party iframe loads only on click.

## 12. Milestones

- **M0 — Foundations:** Astro + TS scaffold, tokens.css + fonts, content schemas + placeholder entries for every slot (§4 table), Cloudflare Pages pipeline live.
- **M1 — Standalone view (independently shippable):** full responsive page — hero/bio, project grid with video facades, contact (mailto + copy), meta/OG/sitemap, a11y pass. Site is publicly launchable after M1.
- **M2 — Room scaffold:** manifest + schema, placeholder generator + asset validator, `asset-spec.md`, stage rendering background + static sprites from manifest with integer scaling, capability routing live, site nav on the standalone view (About/Projects/Contact jump links + the room link, hamburger on mobile).
- **M3 — Interactivity:** hover highlights + label tips, custom cursor, discovery panels (9-slice, focus-trapped, real text), video facade in panels, content binding end-to-end.
- **M4 — Discovery layer:** completion meter, localStorage persistence, reward unlock (drawer/note + contact action).
- **M5 — Atmosphere:** spritesheet animation pipeline, ambient loops (steam, cat, rain, record), opening sequence, reduced-motion paths, hurry-note.
- **M6 — Art swap + launch:** drop in authored art (validator-enforced, zero code changes), tune manifest positions, cross-browser check (`border-image` + pixelated), real OG image, Search Console verification, perf audit, launch.

Each milestone leaves the repo deployable; M1 is a complete public site on its own.

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `border-image` + `pixelated` browser quirks | Verify in M2; fallback: 3×3 background-position grid, same manifest |
| JS capability redirect harms indexing | `navigator.webdriver` gate; noindex+canonical on `/room`; Search Console check in M6; one-line fallback to "door" link |
| Locked art palette can't hit AA text contrast | Token-level UI-text shades added to the locked palette, documented in asset-spec |
| Custom cursor size limits | Author at 16/32px; cursor doesn't scale with stage; `auto` fallback always present |
| Canvas size wrong for the reference art | 384×216 is a placeholder default; confirmed against the design-pass image before asset-spec freezes (manifest-only change) |

## 14. Out of scope

Audio, CMS, blog, analytics, i18n, mobile/touch support for the room, contact form backend.

## 15. Pending inputs (don't block scaffolding)

1. Design-pass reference image → room asset-spec and canvas-size confirmation. (Standalone visual design: LANDED 2026-06-12, see §16. Palette: LOCKED, see §5 — room art may extend it.)
2. Pixel font: Silkscreen confirmed (§5). Body: Geist; mono: Geist Mono.
3. Real project copy + video IDs (placeholder entries until then).
4. Hand-authored art — the room sprites/scenes and the standalone's full-bleed hero "pixel scene" plate (placeholders until M6).

## 16. Standalone visual design — "After Hours" (design handoff 2026-06-12)

A fully-resolved visual design for the standalone view (`/`), produced in Claude Design and handed off as an HTML/CSS/JS prototype. **We recreate the visual output in our Astro + tokens idiom — we do not port the prototype's React-over-CDN structure.** The handoff bundle (canvas HTML, `ph-atoms.jsx`, `ph-views.jsx`, both chat transcripts, and the separate `pixelroom.js` room renderer) is kept under `.design-tmp/` (gitignored) as build reference; the durable reference is this section.

Mood: "after hours", neon-at-night, intensity ~65 — neon glow on interactive elements, restrained body. Mobile-first; tap targets ≥ 44px.

**Type system:** Silkscreen for the wordmark, section titles, card titles, nav, chips, buttons; Geist for all body/blurb copy; Geist Mono for meta (year · role, durations, footer, captions).

**Layout & components to build:**

1. **Nav** (in the Base layout; §9 already specs the hamburger): Silkscreen wordmark with a glowing aqua dot, links (Work / About / Contact) jumping to section anchors, and the "Try the room — best on desktop" pill (CRT glyph) shown on hover-capable devices. Mobile collapses links to the hamburger.
2. **Hero — desktop:** a **full-bleed "pixel scene" banner** directly under the nav (the room preview), framed in grape with stepped shadow, carrying scattered `+` hotspot markers, a "THE ROOM" corner mark, and an "explore the interactive room" hint pill. The room art is a **drop-in placeholder slot** now (dashed box) — real art is the same authored-room asset as Plan 2, so this overlaps the room milestone. Below it, an **intro band**: eyebrow ("Portfolio · after dark"), the `AFTER HOURS`-scale wordmark (here the site name), lede/bio, mono signature line, and CTA row (primary + ghost). **Hero — mobile:** no scene banner; stacked eyebrow → wordmark → lede → CTAs, with a small art slot.
3. **Work section** ("01 · SELECTED WORK"): a **featured span-2 card** (row layout on desktop: poster left, body right; stacks on mobile) followed by a 2-up grid of standard cards.
4. **Project card:** dark `--s2` fill, grape border, stepped drop shadow. Contains the **video poster treatment** (16:9, dithered diagonal-stripe fill, scanline + vignette overlays, chunky aqua play button, category chip top-left, duration bottom-right) — this wraps the existing click-to-load `VideoFacade` (§9). Body: Silkscreen title, Geist blurb, mono `year · role` meta, tag chips. Hover: lift + aqua ring + the two purple effects below.
5. **Expanded view — retro `.exe` modal / mobile bottom sheet:** a focus-trapped window (title-bar with dots + `title.exe` + close) showing the playing video beside detail (category, title, blurb, `Year/Role/Stack` definition list, action buttons). On mobile it's a bottom sheet with a grab handle. This is the standalone's project-detail interaction (the room has its own discovery panel). New interaction layer: `Esc`/close/scrim-click dismiss, background inert, focus restored to the trigger.
6. **Contact / footer:** "GET IN TOUCH / LET'S MAKE SOMETHING LATE" panel (grape-framed `--s2`), sub-copy, CTA row (mailto + CV), then a footer with the Silkscreen mark and mono social links. Reuses the §2 obfuscated-mailto + copy-email behavior.
7. **Buttons & links:** primary (aqua fill, `--aqua-deep` stepped shadow, nudge-on-hover / press-in-on-active), ghost (aqua inset ring), teal variant; text links in aqua with a soft underline. Focus: 3px aqua outline + offset + glow, never hidden.
8. **Decorative pixel accents (CSS, not authored assets):** small box-shadow "twinkle" stars (aqua/teal/lavender), and the two purple motion effects on card hover — a **steady lavender/grape glow** spilling onto the black, and a **one-shot ripple pulse** expanding to the screen edges on first hover. Both gated behind `prefers-reduced-motion`. Dashed `--line` boxes mark where authored pixel sprites drop in later.

**Carried-over guarantees:** all copy/projects remain content-collection-driven placeholders; the video poster wraps the no-third-party-request facade; AA contrast stays test-enforced (§5); semantic landmarks, keyboard operability, and reduced-motion from §11 hold — the modal and the hover effects must honor them.

**Scope note:** the desktop hero scene-banner is a preview of the interactive room and shares its authored art, so it is the one piece of this redesign that genuinely overlaps Plan 2. Everything else is standalone-only and builds on the existing `/` foundation.

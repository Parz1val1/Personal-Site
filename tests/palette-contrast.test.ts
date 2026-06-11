import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/lib/contrast";

function readTokens(): Record<string, string> {
  const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
    map[m[1]!] = m[2]!;
  }
  return map;
}

/** Approved foreground/background pairs. Every text-bearing combination used
 *  in either view must be listed in one of the two tiers below.
 *
 *  AA_NORMAL (4.5:1): body-size text.
 *  AA_LARGE (3:1): large text only — h1/h2-scale pixel headings (WCAG large
 *  = 24px regular / 18.66px bold). A combination may live here only if the
 *  CSS guarantees it never renders at body size. */
const AA_NORMAL: Array<[fg: string, bg: string]> = [
  ["--c-text", "--c-surface"], // general copy on wisteria panels
  ["--c-text-soft", "--c-surface"], // secondary text on panels (tags)
  ["--c-text-dim", "--c-bg"], // chrome text directly on grape (tagline, footer)
  ["--c-link", "--c-bg"], // links on the grape background
  ["--c-text", "--c-accent"], // button faces / skip link
  ["--c-text", "--c-accent-2"], // button hover ground, panel-link hover chips
];

const AA_LARGE: Array<[fg: string, bg: string]> = [
  ["--c-accent", "--c-bg"], // sky-aqua pixel headings on grape
  ["--c-accent-2", "--c-bg"], // large ocean-mist accents on grape
];

describe("token palette", () => {
  const tokens = readTokens();

  it("defines every token used in approved pairs", () => {
    for (const [fg, bg] of [...AA_NORMAL, ...AA_LARGE]) {
      expect(tokens[fg], `${fg} missing from tokens.css`).toBeDefined();
      expect(tokens[bg], `${bg} missing from tokens.css`).toBeDefined();
    }
  });

  it.each(AA_NORMAL)("%s on %s meets WCAG AA for body text (4.5:1)", (fg, bg) => {
    const ratio = contrastRatio(tokens[fg]!, tokens[bg]!);
    expect(
      ratio,
      `${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(AA_LARGE)("%s on %s meets WCAG AA for large text (3:1)", (fg, bg) => {
    const ratio = contrastRatio(tokens[fg]!, tokens[bg]!);
    expect(
      ratio,
      `${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

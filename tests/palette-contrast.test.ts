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
  ["--c-ink", "--c-s2"], // body copy on card/panel fill
  ["--c-ink", "--c-bg"], // body copy on the night
  ["--c-muted", "--c-s2"], // secondary / meta on panels
  ["--c-faint", "--c-s2"], // tertiary captions on panels — must clear 4.5
  ["--c-accent", "--c-bg"], // aqua links on the night
  ["--c-accent", "--c-s2"], // aqua links on panels
  ["--c-btn-ink", "--c-accent"], // dark button label on aqua
  ["--c-btn-ink", "--c-accent-2"], // dark button label on teal (.btn--teal / hover)
];

const AA_LARGE: Array<[fg: string, bg: string]> = [
  ["--c-heading", "--c-bg"], // wisteria headings on the night
  ["--c-heading", "--c-s2"], // wisteria headings on panels
  ["--c-accent-2", "--c-bg"], // teal category chips / large accents on night
  ["--c-accent-2", "--c-s2"], // teal on panels
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

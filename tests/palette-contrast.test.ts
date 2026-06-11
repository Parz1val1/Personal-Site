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
 *  in either view must be listed here and meet WCAG AA (4.5:1). */
const APPROVED_PAIRS: Array<[fg: string, bg: string]> = [
  ["--c-text", "--c-bg"],
  ["--c-text-dim", "--c-bg"],
  ["--c-accent", "--c-bg"],
  ["--c-link", "--c-bg"],
  ["--c-text", "--c-surface"],
  ["--c-text-dim", "--c-surface"],
  ["--c-link", "--c-surface"], // links inside cards
  ["--c-bg", "--c-accent"], // dark text on accent buttons
  ["--c-bg", "--c-accent-2"], // dark text on hover-state buttons
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

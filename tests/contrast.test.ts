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

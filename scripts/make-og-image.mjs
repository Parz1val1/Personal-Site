// Generates the PLACEHOLDER OG image (1200x630, token colors, hard border).
// The real pixel-art OG card replaces public/og.png in M6 — same path, no code change.
import { writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const W = 1200;
const H = 630;
const BORDER = 24;
const bg = [0x56, 0x45, 0x92]; // dusty grape
const accent = [0x1a, 0xc8, 0xed]; // sky aqua

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

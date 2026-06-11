import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const projectsDir = new URL("../src/content/projects/", import.meta.url);

describe("project content entries", () => {
  it("have unique order values", () => {
    const orders = readdirSync(projectsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const data = JSON.parse(readFileSync(new URL(f, projectsDir), "utf8"));
        return data.order as number;
      });
    expect(new Set(orders).size, `duplicate order values in ${orders.join(", ")}`).toBe(
      orders.length,
    );
  });
});

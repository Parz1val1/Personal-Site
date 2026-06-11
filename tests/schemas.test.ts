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

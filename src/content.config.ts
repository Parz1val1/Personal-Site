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
  // Keep EXACTLY one element — extra elements would load as additional
  // silently-accepted entries that getEntry("site", "main") ignores.
  site: defineCollection({
    loader: file("./src/content/site.json"),
    schema: siteSchema,
  }),
};

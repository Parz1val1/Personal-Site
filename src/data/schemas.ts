import { z } from "zod";

/** Only http(s) — blocks javascript:/data: URIs from ever reaching an href. */
const httpUrl = z.url({ protocol: /^https?$/ });

/** Self-hosted poster is REQUIRED with any video: no third-party requests
 *  (including provider thumbnails) before the visitor clicks play. Spec §4. */
export const videoSchema = z.object({
  provider: z.enum(["youtube", "vimeo"]),
  id: z.string().regex(/^[A-Za-z0-9_-]+$/, "video id must contain only letters, digits, _ or -"),
  poster: z.string().min(1).startsWith("/", "poster must be a root-relative self-hosted path"),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  blurb: z.string().min(1).max(280), // room panel copy — short by design
  description: z.string().min(1), // standalone page copy
  tags: z.array(z.string().min(1)).default([]),
  video: videoSchema.optional(),
  links: z.array(z.object({ label: z.string().min(1), url: httpUrl })).default([]),
  order: z.number().int(),
});

export const flavorSchema = z.object({
  text: z.string().min(1),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  email: z.email(),
  // Required (no default): the site always ships with at least one profile link.
  socials: z.array(z.object({ label: z.string().min(1), url: httpUrl })).min(1),
  ogDescription: z.string().min(1),
});

export type Video = z.infer<typeof videoSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Flavor = z.infer<typeof flavorSchema>;
export type Site = z.infer<typeof siteSchema>;

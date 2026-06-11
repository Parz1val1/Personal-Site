import { z } from "zod";

/** Self-hosted poster is REQUIRED with any video: no third-party requests
 *  (including provider thumbnails) before the visitor clicks play. Spec §4. */
export const videoSchema = z.object({
  provider: z.enum(["youtube", "vimeo"]),
  id: z.string().min(1),
  poster: z.string().min(1),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  blurb: z.string().min(1).max(280), // room panel copy — short by design
  description: z.string().min(1), // standalone page copy
  tags: z.array(z.string()).default([]),
  video: videoSchema.optional(),
  links: z.array(z.object({ label: z.string().min(1), url: z.url() })).default([]),
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
  socials: z.array(z.object({ label: z.string().min(1), url: z.url() })),
  ogDescription: z.string().min(1),
});

export type Video = z.infer<typeof videoSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Flavor = z.infer<typeof flavorSchema>;
export type Site = z.infer<typeof siteSchema>;

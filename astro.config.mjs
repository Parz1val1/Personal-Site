import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // PLACEHOLDER domain — swapped for the real custom domain at launch (Plan 3 / M6).
  // Also update public/robots.txt when this changes.
  site: "https://personal-site.example.com",
  integrations: [sitemap()],
});

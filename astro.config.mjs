import { defineConfig } from "astro/config";
import { origin } from "./site.config.mjs";
export default defineConfig({
  site: origin,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
});

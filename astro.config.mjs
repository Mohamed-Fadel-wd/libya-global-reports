import { defineConfig } from "astro/config";

const site = process.env.LGR_SITE_URL || "http://localhost:4321";
const base = process.env.LGR_BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  trailingSlash: "never",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
  },
  vite: {
    resolve: {
      alias: {
        "@lib": new URL("./src/lib", import.meta.url).pathname,
      },
    },
  },
});

// https://nuxt.com/docs/api/configuration/nuxt-config
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Local velair-ui repo (sibling of this project). Imports resolve to `src` for HMR without publishing to npm. */
const velairUiRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../velair-ui",
);

export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("vl-"),
    },
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^velair-ui$/,
          replacement: resolve(velairUiRoot, "src/index.ts"),
        },
      ],
    },
    server: {
      fs: {
        allow: [velairUiRoot],
      },
    },
    optimizeDeps: {
      exclude: ["velair-ui"],
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    public: {
      /** Production: set `NUXT_PUBLIC_ADMIN_PASSWORD`. If empty, login is disabled outside dev (dev fallback: `admin`). */
      adminPassword: "",
    },
  },
  css: ["velair-ui/themes/default.css", "@/assets/styles/main.scss"],
  app: {
    head: {
      title: "MotoService",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Twinkle+Star&display=swap",
        },
      ],
    },
  },
});

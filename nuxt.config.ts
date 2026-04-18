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
      /** GraphQL HTTP endpoint (`NUXT_PUBLIC_GRAPHQL_URL`; dev fallback matches backend default PORT). */
      graphqlUrl:
        process.env.NUXT_PUBLIC_GRAPHQL_URL ||
        "http://localhost:3030/graphql",
      /** Legacy; cabinet uses GraphQL JWT. */
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
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Twinkle+Star&display=swap",
        },
      ],
    },
  },
});

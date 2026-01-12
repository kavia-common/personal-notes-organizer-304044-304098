// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Ocean Notes",
      meta: [
        { name: "description", content: "Local-first notes app with tags, search, autosave, and optional markdown preview." },
        { name: "theme-color", content: "#2563EB" },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    },
  },

  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      port: 3000,
    },
  },
});

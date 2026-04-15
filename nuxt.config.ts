// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['@/assets/styles/main.scss'],
  app: {
    head: {
      title: 'MotoService',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Twinkle+Star&display=swap',
        },
      ],
    },
  },
})

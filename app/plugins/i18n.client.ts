import { createI18n } from 'vue-i18n'
import en from '~/locales/en.json'
import ru from '~/locales/ru.json'
import ka from '~/locales/ka.json'
import { readSavedLocale } from '~/utils/locale'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: readSavedLocale(),
    fallbackLocale: 'en',
    messages: {
      en,
      ru,
      ka,
    },
  })
  vueApp.use(i18n)
})

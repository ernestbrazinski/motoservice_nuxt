import { applyTheme, theme } from '~/utils/theme'

export default defineNuxtPlugin(() => {
  applyTheme(theme.value)
})

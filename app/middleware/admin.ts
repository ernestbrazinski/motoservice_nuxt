import { ADMIN_SESSION_STORAGE_KEY } from '~/composables/useAdminSession'

export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return
  if (sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) !== '1') {
    return navigateTo('/cabinet')
  }
})

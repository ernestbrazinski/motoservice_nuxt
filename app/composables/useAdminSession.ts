export const ADMIN_SESSION_STORAGE_KEY = 'motoservice_admin_session'

export function useAdminSession() {
  const authed = useState<boolean>('admin-session', () => false)

  function readStorage(): boolean {
    if (!import.meta.client) return false
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === '1'
  }

  function sync() {
    authed.value = readStorage()
  }

  function login() {
    if (!import.meta.client) return
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, '1')
    authed.value = true
  }

  function logout() {
    if (!import.meta.client) return
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    authed.value = false
  }

  return { authed, sync, login, logout }
}

import { ref } from 'vue'

const STORAGE_KEY = 'motoservice-theme'

export type Theme = 'light' | 'dark'

function readInitial(): Theme {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === 'light' || s === 'dark') return s
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }
  return 'light'
}

export const theme = ref<Theme>(readInitial())

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore */
  }
  theme.value = t
}

export function setTheme(t: Theme) {
  applyTheme(t)
}

export function toggleTheme() {
  applyTheme(theme.value === 'light' ? 'dark' : 'light')
}

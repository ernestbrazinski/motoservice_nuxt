export type AppLocale = 'ru' | 'en' | 'ka'

export const LOCALE_OPTIONS: { value: AppLocale; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'ka', label: 'ქართული' },
]

const STORAGE_KEY = 'motoservice-locale'

export function readSavedLocale(): AppLocale {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === 'ru' || s === 'en' || s === 'ka') return s
  } catch {
    /* ignore */
  }
  return 'ru'
}

export function saveLocale(locale: AppLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

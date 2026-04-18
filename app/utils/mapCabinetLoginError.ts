import {
  CONFIG_ERROR,
  INVALID_CREDENTIALS,
  NETWORK_ERROR,
} from "~/utils/auth-graphql";

/** Maps login error codes to short RU copy; replace with i18n when you localize the app. */
export function mapCabinetLoginError(code: string, fallback: string): string {
  switch (code) {
    case INVALID_CREDENTIALS:
      return "Неверный email или пароль.";
    case NETWORK_ERROR:
      return "Нет связи с сервером (сеть / CORS).";
    case CONFIG_ERROR:
      return "Не задан NUXT_PUBLIC_GRAPHQL_URL.";
    default:
      return fallback;
  }
}

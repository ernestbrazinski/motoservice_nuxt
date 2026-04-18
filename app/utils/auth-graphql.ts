/** UI marker: map to a generic invalid-login message (no backend detail leak). */
export const INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

/** Network / CORS / server unreachable. */
export const NETWORK_ERROR = "NETWORK_ERROR";

/** Missing or empty GraphQL URL (e.g. NUXT_PUBLIC_GRAPHQL_URL). */
export const CONFIG_ERROR = "CONFIG_ERROR";

export function isInvalidCredentialsMarker(message: string): boolean {
  return message === INVALID_CREDENTIALS;
}

export function isNetworkErrorMarker(message: string): boolean {
  return message === NETWORK_ERROR;
}

export function isConfigErrorMarker(message: string): boolean {
  return message === CONFIG_ERROR;
}

const rawMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err !== null && "data" in err) {
    const data = (err as { data?: { errors?: { message: string }[] } }).data;
    const first = data?.errors?.[0]?.message;
    if (first) return first;
  }
  if (typeof err === "object" && err !== null && "response" in err) {
    const body = (err as { response?: { _data?: { errors?: { message: string }[] } } })
      .response?._data;
    const first = body?.errors?.[0]?.message;
    if (first) return first;
  }
  return "";
};

export function toLoginFailureMessage(err: unknown): string {
  const raw = rawMessage(err);
  if (raw === "GRAPHQL_URL_MISSING" || /graphql_url_missing/i.test(raw)) {
    return CONFIG_ERROR;
  }
  const lower = raw.toLowerCase();
  if (
    /failed to fetch|networkerror|load failed|fetcherror|econnrefused|network request failed/i.test(
      lower,
    )
  ) {
    return NETWORK_ERROR;
  }
  if (lower.includes("invalid email or password")) return INVALID_CREDENTIALS;
  if (raw.includes("UNAUTHENTICATED")) return INVALID_CREDENTIALS;
  if (lower.includes("unauthorized")) return INVALID_CREDENTIALS;
  if (lower.includes("graphql_url_missing")) return NETWORK_ERROR;
  return INVALID_CREDENTIALS;
}

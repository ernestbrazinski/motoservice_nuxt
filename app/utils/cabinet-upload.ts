import { AUTH_ACCESS_TOKEN_KEY } from "~/composables/useAuthSession";

/** Absolute URL for paths like `/upload/…` (same origin as GraphQL). */
export function cabinetPublicFileUrl(
  graphqlHttpUrl: string,
  path: string,
): string {
  const p = path.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  try {
    const origin = new URL(graphqlHttpUrl.trim()).origin;
    const rel = p.startsWith("/") ? p : `/${p}`;
    return `${origin}${rel}`;
  } catch {
    return p;
  }
}

function readAccessToken(): string | null {
  if (!import.meta.client) return null;
  return sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

/**
 * POST multipart to API `POST /cabinet/upload` (same origin as GraphQL).
 * Returns public path e.g. `/upload/<uuid>.jpg` for listing image mutations.
 */
export async function uploadCabinetImage(
  graphqlHttpUrl: string,
  file: File,
): Promise<string> {
  const token = readAccessToken();
  if (!token) throw new Error("Not authenticated");
  const origin = new URL(graphqlHttpUrl.trim()).origin;
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${origin}/cabinet/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || res.statusText || `HTTP ${res.status}`);
  }
  let data: { url?: string };
  try {
    data = JSON.parse(text) as { url?: string };
  } catch {
    throw new Error("Invalid JSON from upload");
  }
  if (!data.url) throw new Error("Response missing url");
  return data.url;
}

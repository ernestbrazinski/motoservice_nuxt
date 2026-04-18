import { toLoginFailureMessage } from "~/utils/auth-graphql";
import { graphqlRequest } from "~/utils/graphql";

export const AUTH_ACCESS_TOKEN_KEY = "motoservice_access_token";
export const AUTH_USER_KEY = "motoservice_auth_user";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

const LOGIN_MUTATION = `
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    user {
      id
      email
      role
    }
  }
}
`;

const ME_QUERY = `
query Me {
  me {
    id
    email
    role
  }
}
`;

const ADMIN_PING_QUERY = `
query AdminPing {
  adminPing {
    ok
    scope
  }
}
`;

function graphqlUrl(): string {
  const config = useRuntimeConfig();
  return (config.public.graphqlUrl as string)?.trim() || "";
}

export function useAuthSession() {
  const authed = useState<boolean>("auth-session", () => false);
  const user = useState<AuthUser | null>("auth-user", () => null);
  const hydrated = useState<boolean>("auth-hydrated", () => false);

  function readToken(): string | null {
    if (!import.meta.client) return null;
    return sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
  }

  function readUser(): AuthUser | null {
    if (!import.meta.client) return null;
    try {
      const raw = sessionStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  function persistUser(u: AuthUser | null) {
    if (!import.meta.client) return;
    if (u) sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(AUTH_USER_KEY);
  }

  /** Sync auth flags from sessionStorage (no network). */
  function sync() {
    const token = readToken();
    authed.value = Boolean(token);
    user.value = readUser();
  }

  /** Restore user via `me` when a JWT exists; clear session if the token is invalid. */
  async function hydrateFromToken() {
    if (!import.meta.client) return;
    const url = graphqlUrl();
    const token = readToken();
    if (!token) {
      sync();
      hydrated.value = true;
      return;
    }
    try {
      const data = await graphqlRequest<{ me: AuthUser }>(
        url,
        ME_QUERY,
        undefined,
        token,
      );
      persistUser(data.me);
      sync();
    } catch {
      logout();
    } finally {
      hydrated.value = true;
    }
  }

  async function login(email: string, password: string) {
    const url = graphqlUrl();
    try {
      const data = await graphqlRequest<{
        login: { accessToken: string; user: AuthUser };
      }>(url, LOGIN_MUTATION, {
        input: { email: email.trim(), password },
      });

      if (!import.meta.client) return;
      sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, data.login.accessToken);
      persistUser(data.login.user);
      sync();
    } catch (e) {
      const code = toLoginFailureMessage(e);
      throw new Error(code);
    }
  }

  function logout() {
    if (!import.meta.client) return;
    sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sync();
  }

  /** Optional: `adminPing` (superadmin-only on the server). */
  async function adminPing(): Promise<{ ok: boolean; scope: string } | null> {
    const url = graphqlUrl();
    const token = readToken();
    if (!token) return null;
    try {
      const data = await graphqlRequest<{
        adminPing: { ok: boolean; scope: string };
      }>(url, ADMIN_PING_QUERY, undefined, token);
      return data.adminPing;
    } catch {
      return null;
    }
  }

  /** GraphQL with `Authorization: Bearer`. */
  async function gqlAuthorized<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    return graphqlRequest<T>(
      graphqlUrl(),
      query,
      variables,
      readToken(),
    );
  }

  return {
    authed,
    user,
    hydrated,
    sync,
    hydrateFromToken,
    login,
    logout,
    adminPing,
    gqlAuthorized,
  };
}

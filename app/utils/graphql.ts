export type GraphQLErrorPayload = {
  errors?: { message: string; extensions?: { code?: string } }[];
  data?: unknown;
};

export async function graphqlRequest<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  authToken?: string | null,
): Promise<T> {
  if (!endpoint?.trim()) {
    throw new Error("GRAPHQL_URL_MISSING");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  try {
    const body = await $fetch<GraphQLErrorPayload & { data?: T }>(endpoint, {
      method: "POST",
      body: { query, variables },
      headers,
    });

    if (body.errors?.length) {
      const msg =
        body.errors[0]?.message ||
        body.errors[0]?.extensions?.code ||
        "GraphQL error";
      throw new Error(msg);
    }
    if (body.data === undefined || body.data === null) {
      throw new Error("Empty GraphQL response");
    }
    return body.data as T;
  } catch (e) {
    const msg = extractMessageFromFetchError(e);
    if (msg) throw new Error(msg);
    throw e;
  }
}

function extractMessageFromFetchError(e: unknown): string | null {
  if (typeof e !== "object" || e === null) return null;
  const any = e as {
    data?: { errors?: { message: string }[] };
    response?: { _data?: { errors?: { message: string }[] } };
  };
  const fromData = any.data?.errors?.[0]?.message;
  if (fromData) return fromData;
  const fromResp = any.response?._data?.errors?.[0]?.message;
  if (fromResp) return fromResp;
  return null;
}

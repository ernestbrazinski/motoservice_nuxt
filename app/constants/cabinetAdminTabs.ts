/** Admin catalog sub-tabs inside the cabinet (URL `?tab=` slug). */
export type CabinetAdminTab =
  | "refs"
  | "newProduct"
  | "editProduct"
  | "motorcycle";

export const CABINET_ADMIN_TAB_QUERY = "tab";

/** Query string values (kebab-case for URLs). */
export const CABINET_ADMIN_TAB_TO_QUERY: Record<CabinetAdminTab, string> = {
  refs: "refs",
  newProduct: "new-product",
  editProduct: "edit-product",
  motorcycle: "motorcycle",
};

const QUERY_TO_TAB = Object.fromEntries(
  Object.entries(CABINET_ADMIN_TAB_TO_QUERY).map(([k, v]) => [
    v,
    k as CabinetAdminTab,
  ]),
) as Record<string, CabinetAdminTab>;

/** Parse `tab` from vue-router `LocationQuery` value(s). */
export function cabinetAdminTabFromQuery(raw: unknown): CabinetAdminTab | null {
  if (raw == null) return null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s !== "string" || !s) return null;
  return QUERY_TO_TAB[s] ?? null;
}

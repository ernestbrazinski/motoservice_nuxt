export function isSuperadminRole(role: string | null | undefined): boolean {
  if (role == null || role === "") return false;
  return String(role).toLowerCase() === "superadmin";
}

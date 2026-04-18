import type { InjectionKey, Ref } from "vue";

/** Shared busy flag for admin catalog panels (single-flight across tabs). */
export const CabinetAdminBusyKey: InjectionKey<Ref<boolean>> = Symbol(
  "CabinetAdminBusy",
);

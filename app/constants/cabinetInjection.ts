import type { InjectionKey, Ref } from "vue";

/** Shared busy flag for admin catalog panels (single-flight across tabs). */
export const CabinetAdminBusyKey: InjectionKey<Ref<boolean>> = Symbol(
  "CabinetAdminBusy",
);

/**
 * When set, `AdminCatalogNewProductTab` selects this product id and fills the form.
 * Parent clears it after the child consumes the value.
 */
export const CabinetAdminPendingEditProductIdKey: InjectionKey<
  Ref<number | null>
> = Symbol("CabinetAdminPendingEditProductId");

/** Filled by main list "edit" on categories; consumed by `AdminCatalogRefsTab`. */
export const CabinetAdminPendingEditCategoryIdKey: InjectionKey<
  Ref<number | null>
> = Symbol("CabinetAdminPendingEditCategoryId");

/** Filled by main list "edit" on brands; consumed by `AdminCatalogRefsTab`. */
export const CabinetAdminPendingEditBrandIdKey: InjectionKey<
  Ref<number | null>
> = Symbol("CabinetAdminPendingEditBrandId");

/** Filled by main list "edit" on motorcycle listings; consumed by `AdminCatalogMotorcycleTab`. */
export const CabinetAdminPendingEditMotorcycleListingIdKey: InjectionKey<
  Ref<number | null>
> = Symbol("CabinetAdminPendingEditMotorcycleListingId");

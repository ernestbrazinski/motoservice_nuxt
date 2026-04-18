import type { VlSelectOption } from "velair-ui";

/** Shop price currencies (aligned with backend `IsIn(['GEL','USD'])`). */
export const SHOP_CURRENCIES = ["GEL", "USD"] as const;
export type ShopCurrency = (typeof SHOP_CURRENCIES)[number];

export const DEFAULT_SHOP_CURRENCY: ShopCurrency = "GEL";

export const SHOP_CURRENCY_SELECT_OPTIONS: VlSelectOption[] = [
  { value: "GEL", label: "GEL (₾)" },
  { value: "USD", label: "USD ($)" },
];

export function isShopCurrency(value: string): boolean {
  return (SHOP_CURRENCIES as readonly string[]).includes(value.trim());
}

/** Map stored currency to UI select (unknown → GEL). */
export function normalizeShopCurrency(currency: string): ShopCurrency {
  return currency === "USD" ? "USD" : "GEL";
}

/** Mileage unit for motorcycle listings (GraphQL enum KM | MI). */
export const MILEAGE_UNITS = ["KM", "MI"] as const;
export type MileageUnitUi = (typeof MILEAGE_UNITS)[number];

export const DEFAULT_MILEAGE_UNIT: MileageUnitUi = "KM";

export const MILEAGE_UNIT_SELECT_OPTIONS: VlSelectOption[] = [
  { value: "KM", label: "км" },
  { value: "MI", label: "мили" },
];

export function isMileageUnitUi(v: string): v is MileageUnitUi {
  return v === "KM" || v === "MI";
}

/** Engine displacement cc (aligned with backend). */
export const DISPLACEMENT_CC_MIN = 1;
export const DISPLACEMENT_CC_MAX = 5000;

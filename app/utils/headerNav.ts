export type HeaderNavChild = { labelKey: string; to: string };

export type HeaderNavItem =
  | { kind: "link"; labelKey: string; to: string }
  | { kind: "menu"; id: string; labelKey: string; children: HeaderNavChild[] };

export const headerNavItems: HeaderNavItem[] = [
  { kind: "link", labelKey: "nav.home", to: "/" },
  {
    kind: "menu",
    id: "motorcycles",
    labelKey: "nav.motorcycles",
    children: [
      { labelKey: "nav.sale", to: "/" },
      { labelKey: "nav.workshop", to: "/" },
      { labelKey: "nav.parts", to: "/" },
      { labelKey: "nav.rental", to: "/" },
      { labelKey: "nav.bikeMatch", to: "/" },
      { labelKey: "nav.tow", to: "/" },
    ],
  },
  {
    kind: "menu",
    id: "gear",
    labelKey: "nav.gear",
    children: [
      { labelKey: "nav.helmets", to: "/" },
      { labelKey: "nav.outerwear", to: "/" },
      { labelKey: "nav.footwear", to: "/" },
    ],
  },
  {
    kind: "menu",
    id: "community",
    labelKey: "nav.community",
    children: [
      { labelKey: "nav.social", to: "/" },
      { labelKey: "nav.groupRides", to: "/" },
    ],
  },
];

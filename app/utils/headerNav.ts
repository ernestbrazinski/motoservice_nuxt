export type HeaderNavChild = {
  labelKey: string;
  to: string;
  /** Optional image URL from /public (e.g. /header-menu/sale.webp). */
  imageSrc?: string;
};

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
      { labelKey: "nav.sale", to: "/", imageSrc: "/header-menu/sale.webp" },
      { labelKey: "nav.rental", to: "/", imageSrc: "/header-menu/rent.webp" },
    ],
  },
  {
    kind: "menu",
    id: "service",
    labelKey: "nav.service",
    children: [
      {
        labelKey: "nav.workshop",
        to: "/",
        imageSrc: "/header-menu/repair.webp",
      },
      {
        labelKey: "nav.bikeMatch",
        to: "/",
        imageSrc: "/header-menu/selection.webp",
      },
      { labelKey: "nav.tow", to: "/", imageSrc: "/header-menu/evacuator.webp" },
    ],
  },
  {
    kind: "menu",
    id: "store",
    labelKey: "nav.store",
    children: [
      { labelKey: "nav.gear", to: "/", imageSrc: "/header-menu/equip.webp" },
      { labelKey: "nav.parts", to: "/", imageSrc: "/header-menu/parts.webp" },
    ],
  },
  {
    kind: "menu",
    id: "community",
    labelKey: "nav.community",
    children: [
      {
        labelKey: "nav.social",
        to: "/",
        imageSrc: "/header-menu/socials.webp",
      },
      {
        labelKey: "nav.groupRides",
        to: "/",
        imageSrc: "/header-menu/trips.webp",
      },
    ],
  },
];

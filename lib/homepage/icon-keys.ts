export const CATEGORY_ICON_KEYS = [
  "vanities",
  "toilets",
  "basins",
  "tapware",
  "showers",
  "mirrors-cabinets",
  "accessories",
  "door-handles",
  "kitchen-sinks",
  "laundry-tubs",
  "cabinet-handles",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

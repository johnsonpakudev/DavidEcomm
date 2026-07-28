export const CATEGORY_ICON_KEYS = [
  "vanities",
  "bath-tubs",
  "toilet-suites",
  "tapware",
  "doors",
  "kitchen-sinks",
  "basins",
  "mirrors",
  "shower-screens",
  "floor-wastes",
  "door-handles",
  "bidets",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

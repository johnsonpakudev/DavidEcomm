import type { CsvProductRow } from "@/scripts/catalog/types";

export interface GroupOverrides {
  forceGroup: Record<string, string>;
  forceStandalone: string[];
  swatchColors: Record<string, string>;
}

export const FINISH_TOKENS = [
  "Empire Oak",
  "Wash White",
  "Matte Black",
  "Brushed Brass",
  "Chrome",
  "White Oak",
  "Natural Oak",
] as const;

export function normalizeTitle(title: string): string {
  let normalized = title;

  for (const token of [...FINISH_TOKENS].sort((left, right) => right.length - left.length)) {
    normalized = normalized.replaceAll(token, "{COLOUR}");
  }

  return normalized.replace(/\s+/g, " ").trim();
}

export function basinSuffix(sku: string): string {
  const segments = sku.split("-");
  return segments[segments.length - 1] ?? sku;
}

export function buildGroupKey(row: CsvProductRow): string {
  const specificSize = row["Specific Size"]?.trim() ?? "";
  const specificType = row["Specific Type"]?.trim() ?? "";

  return [
    normalizeTitle(row.Title),
    basinSuffix(row.SKU),
    specificSize,
    specificType,
  ].join("|");
}

function bucketKeyForRow(row: CsvProductRow, overrides: GroupOverrides): string {
  if (overrides.forceStandalone.includes(row.SKU)) {
    return `standalone:${row.SKU}`;
  }

  const forcedGroup = overrides.forceGroup[row.SKU];
  if (forcedGroup) {
    return `force:${forcedGroup}`;
  }

  return buildGroupKey(row);
}

function distinctColourCount(rows: CsvProductRow[]): number {
  return new Set(rows.map((entry) => entry.Colour.trim()).filter(Boolean)).size;
}

export function groupRows(
  rows: CsvProductRow[],
  overrides: GroupOverrides,
): Array<{ key: string; rows: CsvProductRow[] }> {
  const buckets = new Map<string, CsvProductRow[]>();

  for (const row of rows) {
    const key = bucketKeyForRow(row, overrides);
    const bucket = buckets.get(key) ?? [];
    bucket.push(row);
    buckets.set(key, bucket);
  }

  const groups: Array<{ key: string; rows: CsvProductRow[] }> = [];

  for (const [key, bucketRows] of buckets) {
    if (key.startsWith("standalone:")) {
      for (const row of bucketRows) {
        groups.push({ key: `standalone:${row.SKU}`, rows: [row] });
      }
      continue;
    }

    if (key.startsWith("force:")) {
      groups.push({ key, rows: bucketRows });
      continue;
    }

    if (bucketRows.length >= 2 && distinctColourCount(bucketRows) >= 2) {
      groups.push({ key, rows: bucketRows });
      continue;
    }

    for (const row of bucketRows) {
      groups.push({ key: buildGroupKey(row), rows: [row] });
    }
  }

  return groups;
}

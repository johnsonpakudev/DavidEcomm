import { deterministicId } from "@/scripts/catalog/utils";
import type { CsvProductRow } from "@/scripts/catalog/types";
import type { ProductImage, ProductSpecification } from "@/lib/supabase/types";

const IMAGE_COLUMNS = Array.from({ length: 15 }, (_, index) => `Image ${index + 1}`);

const SPEC_GROUP_RULES: Array<{ match: RegExp; group: string }> = [
  { match: /height|length|width|weight|thickness|measurement|size|volume/i, group: "Dimensions" },
  { match: /material|glass|stone|plumbing/i, group: "Materials" },
  { match: /wels|watermark|certified|safety/i, group: "Compliance" },
];

function specGroup(label: string): string {
  return SPEC_GROUP_RULES.find((rule) => rule.match.test(label))?.group ?? "Details";
}

function titleCase(label: string): string {
  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapRowImages(row: CsvProductRow, productId: string): ProductImage[] {
  return IMAGE_COLUMNS.flatMap((column, index) => {
    const url = row[column]?.trim();
    if (!url) return [];

    return [{
      id: deterministicId("image", `${productId}:${index}`),
      product_id: productId,
      url,
      alt_text: row.Title,
      sort_order: index,
    }];
  });
}

export function mapRowSpecifications(
  row: CsvProductRow,
  productId: string,
): ProductSpecification[] {
  const specs: ProductSpecification[] = [];
  let sortOrder = 0;

  for (const [key, rawValue] of Object.entries(row)) {
    if (!key.startsWith("Specific ") || !rawValue?.trim()) continue;

    const label = titleCase(key.replace(/^Specific /, ""));

    specs.push({
      id: deterministicId("spec", `${productId}:${key}`),
      product_id: productId,
      group_name: specGroup(label),
      label,
      value: rawValue.trim(),
      sort_order: sortOrder++,
    });
  }

  if (row.Warranty?.trim()) {
    try {
      const warranty = JSON.parse(row.Warranty) as { text?: string; url?: string };
      if (warranty.text) {
        specs.push({
          id: deterministicId("spec", `${productId}:warranty`),
          product_id: productId,
          group_name: "Details",
          label: "Warranty",
          value: warranty.url ? `${warranty.text} (${warranty.url})` : warranty.text,
          sort_order: sortOrder++,
        });
      }
    } catch {
      // ignore malformed warranty json
    }
  }

  return specs;
}

import { normalizePackageType } from "@/lib/shipping/estimate";
import type { ShippingLineInput } from "@/lib/shipping/estimate";

function parseDimension(value: string | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function shippingFromProductAttributes(
  attributes: Record<string, string> | null | undefined,
  quantity: number,
): ShippingLineInput {
  const attrs = attributes ?? {};

  return {
    weightKg: parseDimension(attrs.product_weight),
    lengthCm: parseDimension(attrs.shipping_length_cm),
    widthCm: parseDimension(attrs.shipping_width_cm),
    heightCm: parseDimension(attrs.shipping_height_cm),
    packageType: attrs.package_type
      ? normalizePackageType(attrs.package_type)
      : null,
    quantity,
  };
}

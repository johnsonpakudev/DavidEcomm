import type { CartLineRequest } from "@/lib/cart/types";
import { normalizePackageType } from "@/lib/shipping/estimate";
import type { ShippingLineInput } from "@/lib/shipping/estimate";
import { createServiceClient } from "@/lib/supabase/admin";

export interface ValidatedCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
  variantName: string | null;
  sku: string;
  unitPriceCents: number;
  shipping: ShippingLineInput;
}

export interface ValidatedCart {
  lines: ValidatedCartLine[];
  subtotalCents: number;
}

export async function validateCartItems(
  items: CartLineRequest[],
): Promise<ValidatedCart> {
  if (!items.length) {
    throw new Error("Your cart is empty.");
  }

  const supabase = createServiceClient();

  if (!supabase) {
    throw new Error("Checkout is unavailable right now.");
  }

  const lines: ValidatedCartLine[] = [];

  for (const item of items) {
    if (item.quantity < 1) {
      continue;
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        "id, name, price, sku, active, weight_kg, shipping_length_cm, shipping_width_cm, shipping_height_cm, package_type",
      )
      .eq("id", item.product_id)
      .maybeSingle();

    if (productError || !product || !product.active) {
      throw new Error("A product in your cart is no longer available.");
    }

    let variantName: string | null = null;
    let sku = product.sku;
    let unitPriceCents = product.price;
    const shipping: ShippingLineInput = {
      weightKg: product.weight_kg,
      lengthCm: product.shipping_length_cm,
      widthCm: product.shipping_width_cm,
      heightCm: product.shipping_height_cm,
      packageType: product.package_type
        ? normalizePackageType(product.package_type)
        : null,
      quantity: item.quantity,
    };

    if (item.variant_id) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("id, name, sku, price, active")
        .eq("id", item.variant_id)
        .eq("product_id", item.product_id)
        .maybeSingle();

      if (variantError || !variant || !variant.active) {
        throw new Error("A selected product option is no longer available.");
      }

      variantName = variant.name;
      sku = variant.sku;
      if (variant.price !== null) {
        unitPriceCents = variant.price;
      }
    }

    lines.push({
      productId: product.id,
      variantId: item.variant_id ?? null,
      quantity: item.quantity,
      productName: product.name,
      variantName,
      sku,
      unitPriceCents,
      shipping,
    });
  }

  if (!lines.length) {
    throw new Error("Your cart is empty.");
  }

  const subtotalCents = lines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0,
  );

  return { lines, subtotalCents };
}

export async function loadShippingConfig() {
  const supabase = createServiceClient();

  if (!supabase) {
    throw new Error("Checkout is unavailable right now.");
  }

  const [{ data: zones, error: zonesError }, { data: rates, error: ratesError }] =
    await Promise.all([
      supabase.from("shipping_zones").select("slug, postcode_ranges"),
      supabase
        .from("shipping_rates")
        .select(
          "package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct, shipping_zones(slug)",
        ),
    ]);

  if (zonesError || ratesError || !zones?.length || !rates?.length) {
    throw new Error("Shipping is unavailable right now.");
  }

  return {
    zones: zones.map((zone) => ({
      slug: zone.slug,
      postcodeRanges: zone.postcode_ranges as Array<{ from: number; to: number }>,
    })),
    rates: rates.map((rate) => {
      const zone = rate.shipping_zones as { slug: string } | { slug: string }[] | null;
      const zoneSlug = Array.isArray(zone) ? zone[0]?.slug : zone?.slug;

      return {
        zoneSlug: zoneSlug ?? "regional",
        packageType: normalizePackageType(rate.package_type),
        minWeightKg: Number(rate.min_weight_kg),
        maxWeightKg:
          rate.max_weight_kg === null ? null : Number(rate.max_weight_kg),
        rateCents: rate.rate_cents,
        multiItemSurchargePct: Number(rate.multi_item_surcharge_pct ?? 0),
      };
    }),
  };
}

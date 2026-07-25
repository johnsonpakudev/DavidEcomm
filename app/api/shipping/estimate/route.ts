import { NextResponse } from "next/server";
import { z } from "zod";

import {
  SHIPPING_DISCLAIMER,
  type CheckoutEstimate,
} from "@/lib/cart/types";
import {
  loadShippingConfig,
  validateCartItems,
} from "@/lib/checkout/validate-cart";
import { isCheckoutEnabled } from "@/lib/config/features";
import { estimateShipping } from "@/lib/shipping/estimate";
import {
  optionalPostgresUuidSchema,
  postgresUuidSchema,
} from "@/lib/validation/id";

const estimateSchema = z.object({
  items: z.array(
    z.object({
      product_id: postgresUuidSchema,
      variant_id: optionalPostgresUuidSchema,
      quantity: z.number().int().positive(),
    }),
  ),
  postcode: z.string().regex(/^\d{4}$/),
  state: z.string().min(2).max(3),
});

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json({ error: "Checkout is disabled." }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = estimateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid cart and delivery address." },
      { status: 400 },
    );
  }

  try {
    const validatedCart = await validateCartItems(parsed.data.items);
    const shippingConfig = await loadShippingConfig();
    const shipping = estimateShipping({
      lines: validatedCart.lines.map((line) => line.shipping),
      postcode: parsed.data.postcode,
      zones: shippingConfig.zones,
      rates: shippingConfig.rates,
    });

    const payload: CheckoutEstimate = {
      subtotal_cents: validatedCart.subtotalCents,
      shipping_cents: shipping.shippingCents,
      tax_cents: 0,
      total_cents: validatedCart.subtotalCents + shipping.shippingCents,
      zone: shipping.zone,
      disclaimer: SHIPPING_DISCLAIMER,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate shipping.",
      },
      { status: 400 },
    );
  }
}

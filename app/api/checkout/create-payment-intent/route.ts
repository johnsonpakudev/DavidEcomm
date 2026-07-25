import { NextResponse } from "next/server";
import { z } from "zod";

import { SHIPPING_DISCLAIMER } from "@/lib/cart/types";
import {
  loadShippingConfig,
  validateCartItems,
} from "@/lib/checkout/validate-cart";
import { isCheckoutEnabled } from "@/lib/config/features";
import { estimateShipping } from "@/lib/shipping/estimate";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  optionalPostgresUuidSchema,
  postgresUuidSchema,
} from "@/lib/validation/id";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      product_id: postgresUuidSchema,
      variant_id: optionalPostgresUuidSchema,
      quantity: z.number().int().positive(),
    }),
  ),
  shippingAddress: z.object({
    email: z.string().email(),
    phone: z.string().min(6),
    line1: z.string().min(3),
    line2: z.string().optional(),
    suburb: z.string().min(2),
    state: z.string().min(2).max(3),
    postcode: z.string().regex(/^\d{4}$/),
  }),
});

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json({ error: "Checkout is disabled." }, { status: 403 });
  }

  const stripe = getStripeClient();
  const supabase = createServiceClient();

  if (!stripe || !supabase) {
    return NextResponse.json(
      { error: "Checkout is unavailable right now." },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide valid checkout details." },
      { status: 400 },
    );
  }

  try {
    const validatedCart = await validateCartItems(parsed.data.items);
    const shippingConfig = await loadShippingConfig();
    const shipping = estimateShipping({
      lines: validatedCart.lines.map((line) => line.shipping),
      postcode: parsed.data.shippingAddress.postcode,
      zones: shippingConfig.zones,
      rates: shippingConfig.rates,
    });

    const shippingCents = shipping.shippingCents;
    const totalCents = validatedCart.subtotalCents + shippingCents;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        guest_email: parsed.data.shippingAddress.email,
        guest_phone: parsed.data.shippingAddress.phone,
        status: "pending",
        subtotal_cents: validatedCart.subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: 0,
        total_cents: totalCents,
        shipping_address: parsed.data.shippingAddress,
        shipping_zone: shipping.zone,
        shipping_disclaimer: SHIPPING_DISCLAIMER,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Unable to create order." },
        { status: 500 },
      );
    }

    const { error: orderItemsError } = await supabase.from("order_items").insert(
      validatedCart.lines.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        variant_id: line.variantId,
        product_name: line.productName,
        variant_name: line.variantName,
        sku: line.sku,
        quantity: line.quantity,
        unit_price: line.unitPriceCents,
      })),
    );

    if (orderItemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Unable to create order." },
        { status: 500 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      receipt_email: parsed.data.shippingAddress.email,
      metadata: {
        order_id: order.id,
      },
    });

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", order.id);

    if (updateOrderError) {
      return NextResponse.json(
        { error: "Unable to initialize payment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      { status: 400 },
    );
  }
}

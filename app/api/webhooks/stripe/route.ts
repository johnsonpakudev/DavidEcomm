import { NextResponse } from "next/server";

import { trackServer } from "@/lib/analytics/server-track";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const supabase = createServiceClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !supabase || !webhookSecret) {
    return NextResponse.json({ error: "Webhook unavailable." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;

      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status, total_cents")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!existingOrder) {
        return NextResponse.json({ received: true });
      }

      if (existingOrder.status === "paid") {
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", existingOrder.id);

      if (updateError) {
        throw updateError;
      }

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity, unit_price")
        .eq("order_id", existingOrder.id);

      await trackServer("purchase", {
        order_id: existingOrder.id,
        value: existingOrder.total_cents / 100,
        items: (orderItems ?? []).map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price / 100,
        })),
      });

      if (!orderId) {
        return NextResponse.json({ received: true });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      await supabase
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .eq("status", "pending");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}

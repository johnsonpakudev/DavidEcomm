import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { CartLineRequest } from "@/lib/cart/types";
import { SESSION_COOKIE_NAME } from "@/lib/cart/types";
import { isCheckoutEnabled } from "@/lib/config/features";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  optionalPostgresUuidSchema,
  postgresUuidSchema,
} from "@/lib/validation/id";

const syncSchema = z.object({
  items: z.array(
    z.object({
      product_id: postgresUuidSchema,
      variant_id: optionalPostgresUuidSchema,
      quantity: z.number().int().positive(),
    }),
  ),
});

function getOrCreateSessionId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (existing) {
    return existing;
  }

  return crypto.randomUUID();
}

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json({ error: "Checkout is disabled." }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = syncSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Cart sync is unavailable." },
      { status: 503 },
    );
  }

  const cookieStore = await cookies();
  const sessionId = getOrCreateSessionId(cookieStore);

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .upsert({ session_id: sessionId, updated_at: new Date().toISOString() }, {
      onConflict: "session_id",
    })
    .select("id")
    .single();

  if (cartError || !cart) {
    return NextResponse.json({ error: "Unable to sync cart." }, { status: 500 });
  }

  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  const items = parsed.data.items as CartLineRequest[];

  if (items.length) {
    const { error: itemsError } = await supabase.from("cart_items").insert(
      items.map((item) => ({
        cart_id: cart.id,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
      })),
    );

    if (itemsError) {
      return NextResponse.json({ error: "Unable to sync cart." }, { status: 500 });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

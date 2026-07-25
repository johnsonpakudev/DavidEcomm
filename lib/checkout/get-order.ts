import { createServiceClient } from "@/lib/supabase/admin";
import type { OrderSummary } from "@/lib/cart/types";

export async function getOrderById(orderId: string): Promise<OrderSummary | null> {
  const supabase = createServiceClient();

  if (!supabase) {
    return null;
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, guest_email, guest_phone, status, subtotal_cents, shipping_cents, tax_cents, total_cents, shipping_address, shipping_zone, shipping_disclaimer, created_at, order_items(id, product_name, variant_name, sku, quantity, unit_price)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return null;
  }

  return {
    id: order.id,
    guest_email: order.guest_email,
    guest_phone: order.guest_phone,
    status: order.status as OrderSummary["status"],
    subtotal_cents: order.subtotal_cents,
    shipping_cents: order.shipping_cents,
    tax_cents: order.tax_cents,
    total_cents: order.total_cents,
    shipping_address: order.shipping_address as OrderSummary["shipping_address"],
    shipping_zone: order.shipping_zone,
    shipping_disclaimer: order.shipping_disclaimer,
    created_at: order.created_at,
    order_items: (order.order_items ?? []) as OrderSummary["order_items"],
  };
}

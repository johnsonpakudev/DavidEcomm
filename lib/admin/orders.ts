import { createServiceClient } from "@/lib/supabase/admin";
import type { OrderRecord } from "@/lib/supabase/types";

export interface AdminOrderListItem {
  id: string;
  guest_email: string;
  status: OrderRecord["status"];
  total_cents: number;
  created_at: string;
  isStalePending: boolean;
}

export interface AdminOrderDetail extends OrderRecord {
  order_items: Array<{
    id: string;
    product_name: string;
    variant_name: string | null;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
}

const PAGE_SIZE = 25;
const STALE_PENDING_MS = 60 * 60 * 1000;

export async function listAdminOrders(input: {
  status?: OrderRecord["status"] | "all";
  email?: string;
  page?: number;
}) {
  const supabase = createServiceClient();

  if (!supabase) {
    return { orders: [] as AdminOrderListItem[], total: 0, page: 1, pageSize: PAGE_SIZE };
  }

  const page = Math.max(1, input.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("id, guest_email, status, total_cents, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  if (input.email?.trim()) {
    query = query.ilike("guest_email", `%${input.email.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    return { orders: [] as AdminOrderListItem[], total: 0, page, pageSize: PAGE_SIZE };
  }

  const now = Date.now();

  return {
    orders: data.map((order) => ({
      ...order,
      isStalePending:
        order.status === "pending" &&
        now - new Date(order.created_at).getTime() > STALE_PENDING_MS,
    })),
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getAdminOrderById(orderId: string) {
  const supabase = createServiceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_phone, stripe_payment_intent_id, status, subtotal_cents, shipping_cents, tax_cents, total_cents, shipping_address, shipping_method, fulfillment_status, shipping_zone, shipping_disclaimer, created_at, updated_at, order_items(id, product_name, variant_name, sku, quantity, unit_price)",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AdminOrderDetail;
}

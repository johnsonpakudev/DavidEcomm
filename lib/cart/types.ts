export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  variantName: string | null;
  sku: string;
  unitPriceCents: number;
  imageUrl: string | null;
  slug: string;
}

export interface CartLineRequest {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
}

export const CART_STORAGE_KEY = "bdk-cart";
export const SESSION_COOKIE_NAME = "bdk_session";

export const SHIPPING_DISCLAIMER =
  "Shipping is estimated. Final cost confirmed before dispatch.";

export interface ShippingAddress {
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface CheckoutEstimate {
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  zone: string;
  disclaimer: string;
}

export type PackageType = "envelope" | "carton" | "skid";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderSummary {
  id: string;
  guest_email: string;
  guest_phone: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number | null;
  total_cents: number;
  shipping_address: ShippingAddress;
  shipping_zone: string | null;
  shipping_disclaimer: string;
  created_at: string;
  order_items: OrderItemSummary[];
}

export interface OrderItemSummary {
  id: string;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity: number;
  unit_price: number;
}

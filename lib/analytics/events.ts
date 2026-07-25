export type AnalyticsEventMap = {
  page_view: { path: string; referrer?: string };
  product_impression: {
    product_id: string;
    position: number;
    category?: string;
  };
  product_click: { product_id: string; source: string };
  product_view: { product_id: string; name: string; price: number };
  add_to_cart: {
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    cart_value: number;
  };
  begin_checkout: { cart_value: number; item_count: number };
  purchase: {
    order_id: string;
    value: number;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

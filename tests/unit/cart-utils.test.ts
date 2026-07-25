import { describe, expect, it } from "vitest";

import {
  getCartItemCount,
  getCartSubtotal,
  mergeCartItem,
} from "@/lib/cart/utils";
import type { CartItem } from "@/lib/cart/types";

const sampleItem: CartItem = {
  productId: "11111111-1111-1111-1111-111111111111",
  variantId: null,
  quantity: 1,
  name: "Test Vanity",
  variantName: null,
  sku: "TEST-001",
  unitPriceCents: 100000,
  imageUrl: null,
  slug: "test-vanity",
};

describe("cart utils", () => {
  it("calculates subtotal and item count", () => {
    const items = [
      sampleItem,
      { ...sampleItem, productId: "22222222-2222-2222-2222-222222222222", quantity: 2 },
    ];

    expect(getCartSubtotal(items)).toBe(300000);
    expect(getCartItemCount(items)).toBe(3);
  });

  it("merges duplicate lines by product and variant", () => {
    const merged = mergeCartItem([sampleItem], { ...sampleItem, quantity: 2 });

    expect(merged).toHaveLength(1);
    expect(merged[0]?.quantity).toBe(3);
  });
});

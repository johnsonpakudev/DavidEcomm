import type { CartItem } from "@/lib/cart/types";
import { CART_STORAGE_KEY } from "@/lib/cart/types";

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function clearCartStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
}

export function mergeCartItem(items: CartItem[], nextItem: CartItem) {
  const index = items.findIndex(
    (item) =>
      item.productId === nextItem.productId &&
      item.variantId === nextItem.variantId,
  );

  if (index === -1) {
    return [...items, nextItem];
  }

  return items.map((item, itemIndex) =>
    itemIndex === index
      ? { ...item, quantity: item.quantity + nextItem.quantity }
      : item,
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  if (quantity <= 0) {
    return items.filter(
      (item) =>
        !(item.productId === productId && item.variantId === variantId),
    );
  }

  return items.map((item) =>
    item.productId === productId && item.variantId === variantId
      ? { ...item, quantity }
      : item,
  );
}

export function removeCartItem(
  items: CartItem[],
  productId: string,
  variantId: string | null,
) {
  return items.filter(
    (item) => !(item.productId === productId && item.variantId === variantId),
  );
}

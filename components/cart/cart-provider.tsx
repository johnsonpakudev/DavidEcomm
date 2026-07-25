"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CartItem } from "@/lib/cart/types";
import { isCheckoutEnabled } from "@/lib/config/features";
import {
  clearCartStorage,
  getCartItemCount,
  getCartSubtotal,
  loadCartFromStorage,
  mergeCartItem,
  removeCartItem,
  saveCartToStorage,
  updateCartItemQuantity,
} from "@/lib/cart/utils";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  isReady: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

async function syncCart(items: CartItem[]) {
  if (!isCheckoutEnabled()) {
    return;
  }

  try {
    await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });
  } catch {
    // Best-effort sync — localStorage remains source of truth for UX.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Hydrate cart from localStorage after mount to avoid SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage hydration
    setItems(loadCartFromStorage());
    setIsReady(true);
  }, []);

  const scheduleSync = useCallback((nextItems: CartItem[]) => {
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void syncCart(nextItems);
    }, 2000);
  }, []);

  const commitItems = useCallback(
    (updater: (current: CartItem[]) => CartItem[]) => {
      setItems((current) => {
        const nextItems = updater(current);
        saveCartToStorage(nextItems);
        scheduleSync(nextItems);
        return nextItems;
      });
    },
    [scheduleSync],
  );

  const addItem = useCallback(
    (item: CartItem) => {
      commitItems((current) => mergeCartItem(current, item));
    },
    [commitItems],
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      commitItems((current) =>
        updateCartItemQuantity(current, productId, variantId, quantity),
      );
    },
    [commitItems],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null) => {
      commitItems((current) => removeCartItem(current, productId, variantId));
    },
    [commitItems],
  );

  const clearCart = useCallback(() => {
    clearCartStorage();
    setItems([]);
    scheduleSync([]);
  }, [scheduleSync]);

  const value = useMemo(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      subtotalCents: getCartSubtotal(items),
      isReady,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, isReady, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}

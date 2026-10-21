'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string; // unique key e.g. `${productId}-${variantId}-${colour}`
  productId: number;
  variantId: number;
  productName: string;
  variantName?: string;
  sizeName?: string;
  price?: number;
  unitPrice?: number;
  originalPrice?: number;
  quantity: number;
  totalPrice?: number;
  imageUrl?: string;
  colour?: string;
  colourHex?: string;
}

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (item: any, openDrawer?: boolean) => void;
  updateQuantity: (id: string, deltaOrQuantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  items: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  subtotal: 0,
  totalPrice: 0,
  totalItems: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sf_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.error('Error loading initial cart from localStorage:', err);
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load / hydration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse cart on mount:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage ONLY after initial load has finished
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sf_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart, isLoaded]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sf_cart' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // OPTIMIZATION: useCallback for all cart mutation actions
  const addToCart = useCallback((item: any, openDrawer: boolean = true) => {
    const id = item.id || `${item.productId}-${item.variantId || 'std'}-${item.colour || ''}`;
    const price = Number(item.price ?? item.unitPrice ?? 0);
    const qty = Math.max(1, Number(item.quantity) || 1);
    const variantName = item.variantName || item.sizeName || 'Standard';

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        const newQty = existing.quantity + qty;
        return prev.map((i) =>
          i.id === id
            ? {
                ...i,
                quantity: newQty,
                price,
                unitPrice: price,
                totalPrice: newQty * price,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          ...item,
          id,
          price,
          unitPrice: price,
          variantName,
          sizeName: variantName,
          quantity: qty,
          totalPrice: price * qty,
        },
      ];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
  }, []);

  const updateQuantity = useCallback((id: string, newQty: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            if (newQty <= 0) return null;
            const price = Number(item.price || item.unitPrice || 0);
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // OPTIMIZATION: Single-pass O(N) reduction for subtotal and item count wrapped in useMemo
  const { subtotal, totalItems } = useMemo(() => {
    let sub = 0;
    let itemsCount = 0;
    for (let i = 0; i < cart.length; i++) {
      const it = cart[i];
      const itemTotal = Number(it.totalPrice || Number(it.price || it.unitPrice || 0) * it.quantity);
      sub += isNaN(itemTotal) ? 0 : itemTotal;
      itemsCount += Number(it.quantity) || 0;
    }
    return { subtotal: sub, totalItems: itemsCount };
  }, [cart]);

  // OPTIMIZATION: Memoize context value to prevent full app rerender cascades on unrelated state updates
  const contextValue = useMemo(
    () => ({
      cart,
      items: cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      totalPrice: subtotal,
      totalItems,
      isCartOpen,
      setIsCartOpen,
    }),
    [
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      totalItems,
      isCartOpen,
      setIsCartOpen,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

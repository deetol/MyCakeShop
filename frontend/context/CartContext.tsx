"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export interface CartItem {
  id: string;          // product_id or "productId-sizeName"
  cartItemId?: number; // backend cart_items.id (for update/delete)
  name: string;
  price: number;
  image: string;
  quantity: number;
  unit?: string;
  stock?: number;      // max quantity allowed
  productId?: number;  // numeric product id for API calls
  productSizeId?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, token } = useAuth();

  // ── Sync cart from backend when user logs in ────────────────────────────────
  const syncFromBackend = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<any>('/cart', token);
      const items = res.data?.items || [];
      const mapped: CartItem[] = items.map((item: any) => ({
        id: item.size
          ? `${item.product.id}-${item.size.size_name.replace(/\s+/g, '-').toLowerCase()}`
          : item.product.id.toString(),
        cartItemId: item.id,
        name: item.size
          ? `${item.product.name} (${item.size.size_name})`
          : item.product.name,
        price: item.price,           // root-level price from CartItemResource
        image: item.product.main_image || '/placeholder-cake.svg',
        quantity: item.quantity,
        stock: item.product.stock,
        productId: item.product.id,
        productSizeId: item.size?.id,
      }));
      setCartItems(mapped);
    } catch {
      // If backend fails, keep existing cart
    }
  }, [token]);

  // Load from localStorage on first mount, then sync from backend
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("mycakeshop_cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  // When user logs in, sync from backend
  useEffect(() => {
    if (user && token) {
      syncFromBackend();
    }
    // When user logs out, clear cart
    if (!user) {
      setCartItems([]);
    }
  }, [user, token, syncFromBackend]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("mycakeshop_cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems, isInitialized]);

  // ── Add to cart (sync with backend if logged in) ────────────────────────────
  const addToCart = useCallback(async (
    item: Omit<CartItem, "quantity">,
    quantity = 1
  ) => {
    // Enforce stock limit before even trying
    const maxQty = item.stock ?? 999;
    const clampedQty = Math.min(quantity, maxQty);

    if (clampedQty <= 0) {
      alert('Stok produk habis.');
      return;
    }

    // Check if already in cart and would exceed stock
    const existingItem = cartItems.find(i => i.id === item.id);
    if (existingItem) {
      const newQty = existingItem.quantity + clampedQty;
      if (item.stock !== undefined && newQty > item.stock) {
        alert(`Stok tidak mencukupi. Tersedia: ${item.stock} item.`);
        return;
      }
    }

    // Optimistic update
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + clampedQty, maxQty);
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { ...item, quantity: clampedQty }];
    });

    // Sync to backend
    if (token && item.productId) {
      try {
        await api.post('/cart', {
          product_id: item.productId,
          product_size_id: item.productSizeId || null,
          quantity: clampedQty,
        }, token);
        // Re-sync to get updated cartItemId from backend
        await syncFromBackend();
      } catch (e: any) {
        // Show user-friendly error and revert optimistic update
        const message = e?.message || '';
        if (message.includes('Insufficient stock') || message.includes('stock')) {
          const available = message.match(/\d+/)?.[0];
          alert(`Stok tidak mencukupi.${available ? ` Tersedia: ${available} item.` : ''}`);
        } else {
          alert('Gagal menambahkan ke keranjang. Coba lagi.');
        }
        // Revert
        await syncFromBackend();
      }
    }
  }, [token, syncFromBackend, cartItems]);

  // ── Remove from cart ────────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (id: string) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(prev => prev.filter(i => i.id !== id));

    if (token && item?.cartItemId) {
      try {
        await api.delete(`/cart/items/${item.cartItemId}`, token);
      } catch {
        await syncFromBackend();
      }
    }
  }, [cartItems, token, syncFromBackend]);

  // ── Update quantity ─────────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Enforce stock limit
    const maxQty = item.stock ?? 999;
    if (quantity > maxQty) {
      // Silently clamp — button is already disabled at max, this is just a safety net
      quantity = maxQty;
    }

    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, quantity } : i)
    );

    if (token && item.cartItemId) {
      try {
        await api.put(`/cart/items/${item.cartItemId}`, { quantity }, token);
      } catch (e: any) {
        const message = e?.message || '';
        if (message.includes('stock')) {
          const available = message.match(/\d+/)?.[0];
          if (available) {
            setCartItems(prev =>
              prev.map(i => i.id === id ? { ...i, quantity: parseInt(available) } : i)
            );
          }
        } else {
          await syncFromBackend();
        }
      }
    }
  }, [cartItems, token, syncFromBackend, removeFromCart]);

  // ── Clear cart ──────────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (token) {
      try {
        await api.delete('/cart', token);
      } catch {}
    }
    try { localStorage.removeItem("mycakeshop_cart"); } catch {}
  }, [token]);

  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, isCartOpen, setCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

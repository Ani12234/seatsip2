import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Cart, CartItem } from '../types';
import { cartApi } from '../services/api';
import { safeLog } from '../security/safeLog';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (cafe_id: string, menu_item_id: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

async function retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** i));
    }
  }
  throw lastError;
}

function recalc(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  return { items, subtotal, tax, total: subtotal + tax };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = useMemo(() => cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0, [cart]);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await retry(() => cartApi.get());
      setCart(data.data);
    } catch (e) {
      safeLog.error('fetchCart error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (cafe_id: string, menu_item_id: string, quantity = 1) => {
    const previous = cart;
    try {
      const { data } = await retry(() => cartApi.add(cafe_id, menu_item_id, quantity));
      setCart(data.data);
    } catch (error) {
      setCart(previous);
      throw error;
    }
  }, [cart]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    const previous = cart;
    if (cart) {
      const items = quantity <= 0
        ? cart.items.filter((item) => item.id !== id)
        : cart.items.map((item) => (item.id === id ? { ...item, quantity } : item));
      setCart(recalc(items));
    }

    try {
      const { data } = await retry(() => cartApi.update(id, quantity));
      setCart(data.data);
    } catch (error) {
      setCart(previous);
      throw error;
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    const previous = cart;
    setCart(null);
    try {
      const { data } = await retry(() => cartApi.clear());
      setCart(data.data);
    } catch (error) {
      setCart(previous);
      throw error;
    }
  }, [cart]);

  const removeFromCart = useCallback(async (id: string) => {
    await updateQuantity(id, 0);
  }, [updateQuantity]);

  return (
    <CartContext.Provider value={{ cart, cartCount, isLoading, fetchCart, addToCart, updateQuantity, clearCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

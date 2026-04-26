import React, { createContext, useContext, useState, useCallback } from 'react';
import { cartApi } from '../services/api';
import { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (cafe_id: string, menu_item_id: string, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await cartApi.get();
      setCart(data.data);
    } catch (e) {
      console.error('fetchCart error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (cafe_id: string, menu_item_id: string, quantity = 1) => {
    await cartApi.add(cafe_id, menu_item_id, quantity);
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    await cartApi.update(id, quantity);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setCart(null);
  }, []);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, isLoading, fetchCart, addToCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

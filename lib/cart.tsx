'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getProductById } from './products';
import type { Product } from './products';
import { DISCOUNT } from './config';

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface DetailedCartItem extends CartItem {
  product: Product;
}

interface CartContextValue {
  items: CartItem[];
  detailedItems: DetailedCartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  discountCode: string;
  discountApplied: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyDiscountCode: (code: string) => boolean;
  removeDiscountCode: () => void;
  notify: (message: string, isError?: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'nutrinuts_cart';

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const notify = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const addToCart = useCallback(
    (productId: number, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { productId, quantity }];
      });
      notify('Item added to cart!');
    },
    [notify],
  );

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const applyDiscountCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (normalized === DISCOUNT.code) {
        setDiscountCode(DISCOUNT.code);
        setDiscountApplied(true);
        notify(`Code ${DISCOUNT.code} applied — ${DISCOUNT.percent}% off!`);
        return true;
      }
      setDiscountCode('');
      setDiscountApplied(false);
      notify('Invalid discount code', true);
      return false;
    },
    [notify],
  );

  const removeDiscountCode = useCallback(() => {
    setDiscountCode('');
    setDiscountApplied(false);
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const detailedItems: DetailedCartItem[] = items
    .map((i) => ({ ...i, product: getProductById(i.productId) }))
    .filter((i): i is DetailedCartItem => Boolean(i.product));

  const subtotal = detailedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = discountApplied ? Math.round((subtotal * (100 - DISCOUNT.percent)) / 100) : subtotal;
  const discount = subtotal - total;

  return (
    <CartContext.Provider
      value={{
        items,
        detailedItems,
        count,
        subtotal,
        discount,
        total,
        discountCode,
        discountApplied,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyDiscountCode,
        removeDiscountCode,
        notify,
      }}
    >
      {children}
      {toast && <div className={'toast show' + (toast.isError ? ' error' : '')}>{toast.message}</div>}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

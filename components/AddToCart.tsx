'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function AddToCart({ productId }: { productId: number }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <>
      <div className="quantity-control">
        <button className="quantity-btn" onClick={() => setQty((v) => (v > 1 ? v - 1 : v))}>−</button>
        <input type="text" className="quantity-input" value={qty} readOnly onChange={() => {}} />
        <button className="quantity-btn" onClick={() => setQty((v) => v + 1)}>+</button>
      </div>
      <button className="btn btn-secondary" onClick={() => addToCart(productId, qty)}>Add to Cart</button>
    </>
  );
}

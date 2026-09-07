'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import ProductImage from '@/components/ProductImage';
import { formatPackSize } from '@/lib/products';
import { DISCOUNT } from '@/lib/config';

export default function CartPage() {
  const {
    detailedItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    total,
    discountCode,
    discountApplied,
    applyDiscountCode,
    removeDiscountCode,
  } = useCart();
  const [codeInput, setCodeInput] = useState('');

  return (
    <section className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        {detailedItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added any products yet.</p>
            <Link href="/shop" className="btn btn-secondary">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div id="cart-items-container">
              {detailedItems.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <div className="cart-item-image">
                    <ProductImage src={`/images/${item.product.image}`} alt={item.product.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    <p>{formatPackSize(item.product)}</p>
                    <div className="cart-item-price">Rs. {item.product.price.toLocaleString()}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control" style={{ margin: 0 }}>
                      <button className="quantity-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                      <input type="text" className="quantity-input" value={item.quantity} readOnly onChange={() => {}} style={{ width: 44 }} />
                      <button className="quantity-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">Rs. {(item.product.price * item.quantity).toLocaleString()}</div>
                    <button className="remove-item" onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="discount-code">
                {discountApplied ? (
                  <div className="discount-applied">
                    <span>Code {discountCode} applied — {DISCOUNT.percent}% off</span>
                    <button className="discount-remove" onClick={removeDiscountCode}>Remove</button>
                  </div>
                ) : (
                  <div className="discount-input-row">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder={`Discount code (${DISCOUNT.code})`}
                      aria-label="Discount code"
                    />
                    <button className="btn btn-outline btn-sm" onClick={() => applyDiscountCode(codeInput)}>Apply</button>
                  </div>
                )}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountApplied && (
                <div className="summary-row discount">
                  <span>Discount ({discountCode})</span>
                  <span>−Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row delivery">
                <span>Delivery</span>
                <span>To be confirmed</span>
              </div>
              <div className="summary-row total">
                <span>Grand Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 12, lineHeight: 1.5 }}>
                Delivery charges will be calculated based on your location and confirmed before dispatch.
              </p>
              <Link href="/checkout" className="btn btn-secondary">Proceed to Checkout</Link>
              <Link href="/shop" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

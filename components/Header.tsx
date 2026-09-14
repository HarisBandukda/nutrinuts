'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { categories } from '@/lib/products';

// Category nav — derived from products.ts so names stay in sync.
const navCategories = categories
  .filter((c) => c !== 'All')
  .map((c) => ({
    label: c === 'Pine Nuts (Chilgoza)' ? 'Pine Nuts' : c,
    category: c,
  }));

export default function Header() {
  const { count } = useCart();

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          <img src="/images/logo.png" alt="NutriNuts" className="logo-img" />
        </Link>
        <nav className="nav">
          {navCategories.map((item) => (
            <Link
              key={item.category}
              href={{ pathname: '/shop', query: { category: item.category } }}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-right">
          <Link href="/track" className="track-link">Track Order</Link>
          <Link href="/cart" className="cart-btn" id="header-cart">
            🛒<span className="cart-count" style={{ display: count > 0 ? 'flex' : 'none' }}>{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

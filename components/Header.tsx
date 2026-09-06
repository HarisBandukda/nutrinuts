'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart';

const links = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          <img src="/images/logo.png" alt="NutriNuts" className="logo-img" />
        </Link>
        <nav className={'nav' + (open ? ' open' : '')}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={'nav-link' + (pathname === l.href ? ' active' : '')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="cart-btn" id="header-cart">
          🛒<span className="cart-count" style={{ display: count > 0 ? 'flex' : 'none' }}>{count}</span>
        </Link>
        <button
          className={'hamburger' + (open ? ' active' : '')}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

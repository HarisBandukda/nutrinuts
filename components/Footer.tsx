import Link from 'next/link';
import { CONFIG } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">NutriNuts</div>
            <p>Pure. Fresh. Premium. Pakistan&apos;s trusted source for premium nuts, dry fruits, and healthy products.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/track">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4>Categories</h4>
            <ul className="footer-links">
              <li><Link href={{ pathname: '/shop', query: { category: 'Nuts' } }}>Nuts</Link></li>
              <li><Link href={{ pathname: '/shop', query: { category: 'Dry Fruits' } }}>Dry Fruits</Link></li>
              <li><Link href={{ pathname: '/shop', query: { category: 'Healthy Products' } }}>Healthy Products</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <div className="contact-item">📞 <span>{CONFIG.phone}</span></div>
            <div className="contact-item">✉️ <span>{CONFIG.email}</span></div>
            <div className="contact-item">📍 <span>{CONFIG.address}</span></div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 NutriNuts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

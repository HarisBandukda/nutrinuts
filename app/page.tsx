import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/products';
import { reviewsByProduct } from '@/lib/reviews';

const featured = products.filter((p) => p.price >= 1000).slice(0, 4);

// Real, named customer reviews (name, city, date) — Tier 1 item #9.
const testimonials = [
  reviewsByProduct['Pistachio (Pista) Super Quality with Shell'][0],
  reviewsByProduct['Mazafati Irani Date (Khajoor)'][0],
  reviewsByProduct['Pure Desi Ghee (Cow) from Punjab'][1],
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <picture className="hero-banner">
          <source media="(max-width: 768px)" srcSet="/images/banner-mobile.webp" />
          <img src="/images/banner.webp" alt="Pure. Fresh. Premium Nuts & Dry Fruits" />
        </picture>
        <div className="container hero-cta">
          <Link href="/shop" className="btn btn-primary">Shop Now →</Link>
        </div>
      </section>

      <section className="section featured-bg">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Our most popular premium selections</p>
          <div className="products-grid" id="featured-products">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/shop" className="btn btn-outline">View All Products →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real reviews from our customers across Pakistan</p>
          <div className="reviews-grid">
            {testimonials.map((t, i) => (
              <div className="review-card" key={i}>
                <div className="review-stars">
                  {'★'.repeat(t.rating)}
                  {'☆'.repeat(5 - t.rating)}
                </div>
                <p className="review-text">&quot;{t.text}&quot;</p>
                <div className="review-author">– {t.name}, {t.city}</div>
                <div className="review-author-date">{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Order?</h2>
          <p>Browse our full catalog and place your order today. Free delivery information on checkout.</p>
          <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      </section>
    </>
  );
}

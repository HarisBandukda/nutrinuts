import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/products';

const featured = products.filter((p) => p.price >= 1000).slice(0, 4);

// NOTE: These are placeholder reviews (Tier 1 item #9) — replace with real
// named customer reviews (name, city, date) once Haris provides them.
const testimonials = [
  {
    text: "Excellent quality pistachios! The best I've found in Pakistan. Fast delivery and great packaging.",
    author: 'Ahmed K.',
  },
  {
    text: 'The Mazafati dates are incredibly fresh and juicy. My go-to store for dry fruits now.',
    author: 'Fatima S.',
  },
  {
    text: 'Pure Desi Ghee is authentic and aromatic. Reminds me of home. Highly recommended!',
    author: 'Usman R.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero" style={{ backgroundImage: "url('/images/banner.png')" }}>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Premium Quality</div>
            <h1>Pure. Fresh.<br />Premium Nuts &amp; Dry Fruits</h1>
            <p>
              Discover Pakistan&apos;s finest selection of premium nuts, dry fruits, and healthy
              products. Sourced globally, delivered to your doorstep.
            </p>
            <Link href="/shop" className="btn btn-primary">Shop Now →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Explore our carefully curated categories</p>
          <div className="categories-grid">
            <Link href={{ pathname: '/shop', query: { category: 'Nuts' } }} className="category-card">
              <h3>Nuts</h3>
              <p>Almonds, Cashews, Pistachios, Walnuts &amp; more</p>
            </Link>
            <Link href={{ pathname: '/shop', query: { category: 'Dry Fruits' } }} className="category-card">
              <h3>Dry Fruits</h3>
              <p>Figs, Raisins &amp; premium dried fruits</p>
            </Link>
            <Link href={{ pathname: '/shop', query: { category: 'Healthy Products' } }} className="category-card">
              <h3>Healthy Products</h3>
              <p>Honey, Chikki, Dates &amp; Pure Desi Ghee</p>
            </Link>
          </div>
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
          <p className="section-subtitle">Trusted by hundreds of customers across Pakistan</p>
          <div className="reviews-grid">
            {testimonials.map((t, i) => (
              <div className="review-card" key={i}>
                <div className="review-stars">★★★★★</div>
                <p className="review-text">&quot;{t.text}&quot;</p>
                <div className="review-author">– {t.author}</div>
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

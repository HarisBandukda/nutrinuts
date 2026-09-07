import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { categories, products } from '@/lib/products';
import { reviewsByProduct } from '@/lib/reviews';

const featured = products.filter((p) => p.price >= 1000).slice(0, 4);

// Homepage "Shop by Category" — derived from products.ts so names stay in sync.
const shopCategories = categories.filter((c) => c !== 'All');
const shopCategorySubtitles: Record<string, string> = {
  Almonds: 'Premium USA & imported almonds',
  Cashews: 'Plain & roasted big cashews',
  Pistachios: 'With shell & ready-to-eat',
  Walnuts: 'Shelled, omega-3 rich',
  'Pine Nuts (Chilgoza)': 'Rare & luxurious chilgoza',
  'Dry Fruits': 'Figs, raisins & premium dried fruits',
  'Healthy Products': 'Honey, chikki, dates & desi ghee',
};

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
            {shopCategories.map((c) => (
              <Link key={c} href={{ pathname: '/shop', query: { category: c } }} className="category-card">
                <h3>{c}</h3>
                <p>{shopCategorySubtitles[c] || ''}</p>
              </Link>
            ))}
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

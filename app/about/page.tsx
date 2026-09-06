export const metadata = { title: 'About Us' };

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>Our Story</h1>
          <p style={{ color: 'var(--color-text-light)', maxWidth: 600, margin: '0 auto' }}>
            Pure. Fresh. Premium. — That&apos;s our promise to you.
          </p>
        </div>
      </div>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Delivering Nature&apos;s Finest</h2>
              <p>
                NutriNuts was founded with a simple mission: to bring Pakistan the finest quality
                nuts, dry fruits, and healthy products from around the world. We believe that good
                nutrition starts with pure, natural ingredients.
              </p>
              <p>
                Every product in our catalog is carefully selected, thoroughly inspected, and
                packaged with care to ensure you receive only the best. From the almond orchards of
                California to the date farms of Iran, we source directly from trusted producers.
              </p>
              <p>
                Our commitment to quality, freshness, and customer satisfaction sets us apart. We&apos;re
                not just selling products — we&apos;re delivering health and happiness to your doorstep.
              </p>
            </div>
            <div
              style={{
                background: 'var(--color-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '60px 40px',
                textAlign: 'center',
                fontSize: '6rem',
              }}
            >
              🌰
            </div>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌿</div>
              <h3>Pure Quality</h3>
              <p>We source only the finest nuts and dry fruits, ensuring every product meets our strict quality standards.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚚</div>
              <h3>Fresh Delivery</h3>
              <p>Properly stored and carefully packaged to maintain freshness from our facility to your home.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Trust &amp; Care</h3>
              <p>Your satisfaction is our priority. We personally handle every order with the care it deserves.</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

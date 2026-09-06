import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2 className="section-title">Page not found</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          Sorry, we couldn&apos;t find what you were looking for.
        </p>
        <Link href="/shop" className="btn btn-secondary">Browse Products</Link>
      </div>
    </section>
  );
}

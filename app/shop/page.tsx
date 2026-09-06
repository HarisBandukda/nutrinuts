import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import ShopControls from '@/components/ShopControls';
import { getProductsByCategory, searchProducts, sortProducts } from '@/lib/products';

export const metadata = { title: 'Shop' };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = (await searchParams) || {};
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const q = typeof sp.q === 'string' ? sp.q : undefined;
  const sort = typeof sp.sort === 'string' ? sp.sort : 'default';

  let result = getProductsByCategory(category);
  result = searchProducts(result, q);
  result = sortProducts(result, sort);

  return (
    <>
      <section className="shop-header">
        <div className="container">
          <h1>Our Products</h1>
          <p>Premium nuts, dry fruits &amp; healthy products</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Suspense fallback={null}>
            <ShopControls />
          </Suspense>
          <p
            style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}
            id="result-count"
          >
            {result.length} product{result.length !== 1 ? 's' : ''}
          </p>
          <div className="products-grid" id="shop-products">
            {result.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

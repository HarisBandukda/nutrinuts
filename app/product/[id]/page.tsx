import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import AddToCart from '@/components/AddToCart';
import ProductReviews from '@/components/ProductReviews';
import { getProductById, products, formatPackSize, discountPercent } from '@/lib/products';

export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product ? product.name : 'Product' };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();
  const off = discountPercent(product);

  return (
    <section className="product-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <span>{product.category}</span>
        </div>
        <div className="product-detail">
          <div className="product-detail-image">
            <ProductImage src={`/images/${product.image}`} alt={product.name} />
          </div>
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1>{product.name}</h1>
            <div className="product-detail-price">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="price-original">Rs. {product.compareAtPrice.toLocaleString()}</span>
              )}
              Rs. {product.price.toLocaleString()}
              <span className="product-detail-per"> / {formatPackSize(product)}</span>
              {off && <span className="discount-badge">-{off}% OFF</span>}
            </div>
            <p className="product-detail-desc">{product.description}</p>
            <AddToCart productId={product.id} />
          </div>
        </div>
        <ProductReviews productName={product.name} />
      </div>
    </section>
  );
}

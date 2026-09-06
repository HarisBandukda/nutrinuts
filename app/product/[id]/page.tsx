import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import AddToCart from '@/components/AddToCart';
import { getProductById, products, formatPackSize } from '@/lib/products';

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
            <div className="product-detail-price">Rs. {product.price.toLocaleString()}</div>
            <div className="product-detail-pack">{formatPackSize(product)}</div>
            <p className="product-detail-desc">{product.description}</p>
            <AddToCart productId={product.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

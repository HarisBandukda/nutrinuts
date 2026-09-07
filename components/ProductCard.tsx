'use client';

import Link from 'next/link';
import ProductImage from './ProductImage';
import { formatPackSize, discountPercent, badgeLabel } from '@/lib/products';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const off = discountPercent(product);

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <div className="product-image">
          <ProductImage src={`/images/${product.image}`} alt={product.name} />
          {product.badge && <span className={`badge-${product.badge}`}>{badgeLabel(product.badge)}</span>}
          {off && <span className="sale-badge">-{off}%</span>}
        </div>
      </Link>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link href={`/product/${product.id}`}><h3 className="product-name">{product.name}</h3></Link>
        <div className="product-pack">{formatPackSize(product)}</div>
        <div className="product-price">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="price-original">Rs. {product.compareAtPrice.toLocaleString()}</span>
          )}
          Rs. {product.price.toLocaleString()}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => addToCart(product.id)}>Add to Cart</button>
      </div>
    </div>
  );
}

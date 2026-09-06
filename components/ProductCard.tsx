'use client';

import Link from 'next/link';
import ProductImage from './ProductImage';
import { formatPackSize } from '@/lib/products';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <div className="product-image">
          <ProductImage src={`/images/${product.image}`} alt={product.name} />
        </div>
      </Link>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link href={`/product/${product.id}`}><h3 className="product-name">{product.name}</h3></Link>
        <div className="product-pack">{formatPackSize(product)}</div>
        <div className="product-price">Rs. {product.price.toLocaleString()}</div>
        <button className="btn btn-secondary btn-sm" onClick={() => addToCart(product.id)}>Add to Cart</button>
      </div>
    </div>
  );
}

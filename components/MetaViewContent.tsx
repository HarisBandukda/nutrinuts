'use client';

import { useEffect } from 'react';
import type { Product } from '@/lib/products';
import { trackMetaEvent } from '@/lib/meta-pixel';

/**
 * Fires the Meta Pixel `ViewContent` event when a product page is viewed.
 * Renders nothing — exists only for tracking.
 */
export default function MetaViewContent({ product }: { product: Product }) {
  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: 'product',
      content_category: product.category,
      value: product.price,
      currency: 'PKR',
    });
  }, [product]);

  return null;
}

'use client';

import { useState } from 'react';

// Renders a product image, falling back to a 🥜 emoji if the file is missing.
export default function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return <span>🥜</span>;
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setError(true)} />;
}

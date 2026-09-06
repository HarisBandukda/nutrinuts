'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/lib/products';

export default function ShopControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams?.get('q') || '');

  const currentCategory = searchParams?.get('category') || 'All';
  const currentSort = searchParams?.get('sort') || 'default';

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 'All' || value === 'default') params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.push(pathname + (qs ? '?' + qs : ''));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (search === (searchParams?.get('q') || '')) return;
      updateParams({ q: search });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="shop-controls">
      <div className="search-bar">
        <input
          type="text"
          id="search-input"
          placeholder="Search products..."
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filter-group">
        {categories.map((c) => (
          <button
            key={c}
            className={'filter-btn' + (currentCategory === c ? ' active' : '')}
            onClick={() => updateParams({ category: c })}
          >
            {c}
          </button>
        ))}
      </div>
      <select
        className="sort-select"
        id="sort-select"
        aria-label="Sort products"
        value={currentSort}
        onChange={(e) => updateParams({ sort: e.target.value })}
      >
        <option value="default">Default</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name: A to Z</option>
      </select>
    </div>
  );
}

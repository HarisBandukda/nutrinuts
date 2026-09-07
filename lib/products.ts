// Product catalog — single source of truth.
// Ported verbatim from the previous static site (assets/js/products.js).
// Pack model (Tier 2 #10): every product is sold in one standard pack —
//   nuts/dry fruits/chikki → 250g paper (kraft) pouch
//   ghee/honey → 500g jar
//   Mazafati dates → 500g box
// There is no multi-weight-variant selector; quantity is adjusted instead.

export type PackType = 'Pouch' | 'Jar' | 'Box';

export interface Product {
  id: number;
  name: string;
  category: string;
  packSize: string;
  packType: PackType;
  price: number;
  compareAtPrice?: number; // original price when on sale (strikethrough)
  image: string;
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Almond (Badam) USA Big',
    category: 'Almonds',
    packSize: '250g',
    packType: 'Pouch',
    price: 1150,
    image: 'Almond (Badam) USA Big.jpg',
    description: 'Premium quality large almonds imported from USA. Perfect for snacking, garnishing, and healthy eating.',
  },
  {
    id: 2,
    name: 'Cashewnuts (Kaju) Plain Big',
    category: 'Cashews',
    packSize: '250g',
    packType: 'Pouch',
    price: 1320,
    image: 'Cashewnuts (Kaju) Plain Big.jpg',
    description: 'Big size plain cashewnuts with a rich, buttery flavor. Ideal for direct consumption and cooking.',
  },
  {
    id: 3,
    name: 'Cashewnuts (Kaju) Roasted Big',
    category: 'Cashews',
    packSize: '250g',
    packType: 'Pouch',
    price: 1320,
    image: 'Cashewnuts (Kaju) Roasted Big.jpg',
    description: 'Perfectly roasted big cashewnuts with a delightful crunchy texture.',
  },
  {
    id: 4,
    name: 'Fig (Injeer) Super Quality',
    category: 'Dry Fruits',
    packSize: '250g',
    packType: 'Pouch',
    price: 1250,
    image: 'Fig (Injeer) Super Quality.jpg',
    description: 'Super quality dried figs with natural sweetness. Rich in fiber and essential minerals.',
  },
  {
    id: 5,
    name: 'Pistachio (Pista) Super Quality with Shell',
    category: 'Pistachios',
    packSize: '250g',
    packType: 'Pouch',
    price: 1150,
    image: 'Pistachio (Pista) Super Quality with Shell.jpg',
    description: 'Premium quality pistachios with shell. Naturally colorful and delicious.',
  },
  {
    id: 6,
    name: 'Pistachio (Pista) without Shell',
    category: 'Pistachios',
    packSize: '250g',
    packType: 'Pouch',
    price: 1800,
    image: 'Pistachio (Pista) without Shell.jpg',
    description: 'Premium quality shelled pistachios. Ready to eat and perfect for baking.',
  },
  {
    id: 7,
    name: 'Walnut (Akhrot) without Shell',
    category: 'Walnuts',
    packSize: '250g',
    packType: 'Pouch',
    price: 920,
    image: 'Walnut (Akhrot) without Shell.jpg',
    description: 'High-quality shelled walnuts. Rich in omega-3 fatty acids and antioxidants.',
  },
  {
    id: 8,
    name: 'Chickpeas (Channa)',
    category: 'Healthy Products',
    packSize: '250g',
    packType: 'Pouch',
    price: 250,
    image: 'Chickpeas (Channa).jpg',
    description: 'Premium roasted chickpeas. A healthy and crunchy snack option.',
  },
  {
    id: 9,
    name: 'Chikki Peanuts',
    category: 'Healthy Products',
    packSize: '250g',
    packType: 'Pouch',
    price: 300,
    image: 'Chikki Peanuts.jpg',
    description: 'Traditional peanut chikki made with jaggery. A classic energy-packed treat.',
  },
  {
    id: 10,
    name: 'Chikki Til',
    category: 'Healthy Products',
    packSize: '250g',
    packType: 'Pouch',
    price: 300,
    image: 'Chikki Til.jpg',
    description: 'Traditional sesame seed chikki. Rich in calcium and natural energy.',
  },
  {
    id: 11,
    name: 'Honey Baeri Super Quality',
    category: 'Healthy Products',
    packSize: '500g',
    packType: 'Jar',
    price: 940,
    image: 'Honey Baeri Super Quality.jpg',
    description: 'Super quality Baeri honey. Pure, natural, and rich in flavor.',
  },
  {
    id: 12,
    name: 'Honey Golden Clear',
    category: 'Healthy Products',
    packSize: '500g',
    packType: 'Jar',
    price: 500,
    image: 'Honey Golden Clear.jpg',
    description: 'Premium golden clear honey. Perfect for daily use and natural sweetness.',
  },
  {
    id: 13,
    name: 'Raisin (Kishmish) Kandhari Sundarkhani',
    category: 'Dry Fruits',
    packSize: '250g',
    packType: 'Pouch',
    price: 490,
    image: 'Raisin (Kishmish) Kandhari Sundarkhani.jpg',
    description: 'Premium Kandhari Sundarkhani raisins. Naturally sweet and full of flavor.',
  },
  {
    id: 14,
    name: 'Pine Nuts (Chilgoza) with Shell',
    category: 'Pine Nuts (Chilgoza)',
    packSize: '250g',
    packType: 'Pouch',
    price: 2400,
    image: 'Pine Nuts (Chilgoza) with Shell.jpg',
    description: 'Premium pine nuts with shell. A rare and luxurious nut variety.',
  },
  {
    id: 15,
    name: 'Pine Nuts (Chilgoza) without Shell',
    category: 'Pine Nuts (Chilgoza)',
    packSize: '250g',
    packType: 'Pouch',
    price: 2970,
    image: 'Pine Nuts (Chilgoza) without Shell.jpg',
    description: 'Premium shelled pine nuts. Delicate flavor and buttery texture.',
  },
  {
    id: 16,
    name: 'Mazafati Irani Date (Khajoor)',
    category: 'Healthy Products',
    packSize: '500g',
    packType: 'Box',
    price: 400,
    image: 'Mazafati Irani Date (Khajoor).jpg',
    description: 'Premium Mazafati dates from Iran. Soft, juicy, and naturally sweet.',
  },
  {
    id: 17,
    name: 'Pure Desi Ghee (Cow) from Punjab',
    category: 'Healthy Products',
    packSize: '500g',
    packType: 'Jar',
    price: 1600,
    image: 'Pure Desi Ghee (Cow) from Punjab.jpg',
    description: 'Traditional pure desi ghee from Punjab. Made from cow milk using authentic methods.',
  },
];

export const categories = ['All', 'Almonds', 'Cashews', 'Pistachios', 'Walnuts', 'Pine Nuts (Chilgoza)', 'Dry Fruits', 'Healthy Products'];

export function getProductById(id: number | string | undefined | null): Product | undefined {
  if (id === undefined || id === null) return undefined;
  return products.find((p) => p.id === Number(id));
}

export function getProductsByCategory(category?: string | null): Product[] {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
}

export function searchProducts(list: Product[], query?: string | null): Product[] {
  const q = (query || '').toLowerCase().trim();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}

export function sortProducts(list: Product[], sortBy?: string): Product[] {
  const sorted = [...list];
  switch (sortBy) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return sorted;
}

export function formatPackSize(p: { packSize: string; packType: PackType }): string {
  return p.packSize + ' ' + p.packType;
}

// Returns the % discount when a product is on sale, otherwise null.
export function discountPercent(p: Product): number | null {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return null;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

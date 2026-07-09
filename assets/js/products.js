const products = [
  {
    id: 1,
    name: "Almond (Badam) USA Big",
    category: "Nuts",
    packSize: "250g",
    price: 1150,
    unit: "Grams",
    image: "Almond (Badam) USA Big.jpg",
    description: "Premium quality large almonds imported from USA. Perfect for snacking, garnishing, and healthy eating."
  },
  {
    id: 2,
    name: "Cashewnuts (Kaju) Plain Big",
    category: "Nuts",
    packSize: "250g",
    price: 1320,
    unit: "Grams",
    image: "Cashewnuts (Kaju) Plain Big.jpg",
    description: "Big size plain cashewnuts with a rich, buttery flavor. Ideal for direct consumption and cooking."
  },
  {
    id: 3,
    name: "Cashewnuts (Kaju) Roasted Big",
    category: "Nuts",
    packSize: "250g",
    price: 1320,
    unit: "Grams",
    image: "Cashewnuts (Kaju) Roasted Big.jpg",
    description: "Perfectly roasted big cashewnuts with a delightful crunchy texture."
  },
  {
    id: 4,
    name: "Fig (Injeer) Super Quality",
    category: "Dry Fruits",
    packSize: "250g",
    price: 1250,
    unit: "Grams",
    image: "Fig (Injeer) Super Quality.jpg",
    description: "Super quality dried figs with natural sweetness. Rich in fiber and essential minerals."
  },
  {
    id: 5,
    name: "Pistachio (Pista) Super Quality with Shell",
    category: "Nuts",
    packSize: "250g",
    price: 1150,
    unit: "Grams",
    image: "Pistachio (Pista) Super Quality with Shell.jpg",
    description: "Premium quality pistachios with shell. Naturally colorful and delicious."
  },
  {
    id: 6,
    name: "Pistachio (Pista) without Shell",
    category: "Nuts",
    packSize: "250g",
    price: 1800,
    unit: "Grams",
    image: "Pistachio (Pista) without Shell.jpg",
    description: "Premium quality shelled pistachios. Ready to eat and perfect for baking."
  },
  {
    id: 7,
    name: "Walnut (Akhrot) without Shell",
    category: "Nuts",
    packSize: "250g",
    price: 920,
    unit: "Grams",
    image: "Walnut (Akhrot) without Shell.jpg",
    description: "High-quality shelled walnuts. Rich in omega-3 fatty acids and antioxidants."
  },
  {
    id: 8,
    name: "Chickpeas (Channa)",
    category: "Nuts",
    packSize: "250g",
    price: 250,
    unit: "Grams",
    image: "Chickpeas (Channa).jpg",
    description: "Premium roasted chickpeas. A healthy and crunchy snack option."
  },
  {
    id: 9,
    name: "Chikki Peanuts",
    category: "Healthy Products",
    packSize: "250g",
    price: 300,
    unit: "Grams",
    image: "Chikki Peanuts.jpg",
    description: "Traditional peanut chikki made with jaggery. A classic energy-packed treat."
  },
  {
    id: 10,
    name: "Chikki Til",
    category: "Healthy Products",
    packSize: "250g",
    price: 300,
    unit: "Grams",
    image: "Chikki Til.jpg",
    description: "Traditional sesame seed chikki. Rich in calcium and natural energy."
  },
  {
    id: 11,
    name: "Honey Baeri Super Quality",
    category: "Healthy Products",
    packSize: "500g",
    price: 940,
    unit: "Grams",
    image: "Honey Baeri Super Quality.jpg",
    description: "Super quality Baeri honey. Pure, natural, and rich in flavor."
  },
  {
    id: 12,
    name: "Honey Golden Clear",
    category: "Healthy Products",
    packSize: "1000g",
    price: 1000,
    unit: "Grams",
    image: "Honey Golden Clear.jpg",
    description: "Premium golden clear honey. Perfect for daily use and natural sweetness."
  },
  {
    id: 13,
    name: "Raisin (Kishmish) Kandhari Sundarkhani",
    category: "Dry Fruits",
    packSize: "250g",
    price: 490,
    unit: "Grams",
    image: "Raisin (Kishmish) Kandhari Sundarkhani.jpg",
    description: "Premium Kandhari Sundarkhani raisins. Naturally sweet and full of flavor."
  },
  {
    id: 14,
    name: "Pine Nuts (Chilgoza) with Shell",
    category: "Nuts",
    packSize: "250g",
    price: 2400,
    unit: "Grams",
    image: "Pine Nuts (Chilgoza) with Shell.jpg",
    description: "Premium pine nuts with shell. A rare and luxurious nut variety."
  },
  {
    id: 15,
    name: "Pine Nuts (Chilgoza) without Shell",
    category: "Nuts",
    packSize: "250g",
    price: 2970,
    unit: "Grams",
    image: "Pine Nuts (Chilgoza) without Shell.png",
    description: "Premium shelled pine nuts. Delicate flavor and buttery texture."
  },
  {
    id: 16,
    name: "Mazafati Irani Date (Khajoor)",
    category: "Healthy Products",
    packSize: "500g",
    price: 400,
    unit: "Box",
    image: "Mazafati Irani Date (Khajoor).jpg",
    description: "Premium Mazafati dates from Iran. Soft, juicy, and naturally sweet."
  },
  {
    id: 17,
    name: "Pure Desi Ghee (Cow) from Punjab",
    category: "Healthy Products",
    packSize: "500g",
    price: 1600,
    unit: "Jar",
    image: "Pure Desi Ghee (Cow) from Punjab.jpg",
    description: "Traditional pure desi ghee from Punjab. Made from cow milk using authentic methods."
  }
];

function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}

function getProductsByCategory(category) {
  if (!category || category === 'All') return products;
  return products.filter(p => p.category === category);
}

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}

function sortProducts(productList, sortBy) {
  const sorted = [...productList];
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

const categories = ['All', 'Nuts', 'Dry Fruits', 'Healthy Products'];

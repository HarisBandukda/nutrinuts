function getCart() {
  try {
    return JSON.parse(localStorage.getItem('nutrinuts_cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('nutrinuts_cart', JSON.stringify(cart));
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  saveCart(cart);
  updateCartCount();
  showToast('Item added to cart!');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
}

function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  item.quantity = quantity;
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getCartItems() {
  const cart = getCart();
  return cart.map(item => {
    const product = getProductById(item.productId);
    return { ...item, product };
  }).filter(item => item.product);
}

function clearCart() {
  localStorage.removeItem('nutrinuts_cart');
  updateCartCount();
  renderCartPage();
  renderCheckoutSummary();
}

function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const count = getCartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

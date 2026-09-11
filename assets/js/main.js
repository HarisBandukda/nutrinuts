/* ───────── Path Helpers ───────── */
function imgPath(filename) {
  const inSubdir = window.location.pathname.includes('/pages/');
  return (inSubdir ? '../' : '') + 'assets/images/' + filename;
}

function pagePath(page) {
  const inSubdir = window.location.pathname.includes('/pages/');
  return inSubdir ? page : 'pages/' + page;
}

/* ───────── Navigation ───────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  updateCartCount();
  initPageSpecific();
  initContactInfo();
});

function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close nav on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  highlightActiveNav();
}

function highlightActiveNav() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === page) link.classList.add('active');
  });
}

/* ───────── Business Config ───────── */
function initContactInfo() {
  if (typeof CONFIG === 'undefined') return;
  document.querySelectorAll('[data-contact="phone"]').forEach(el => el.textContent = CONFIG.phone);
  document.querySelectorAll('[data-contact="email"]').forEach(el => el.textContent = CONFIG.email);
  document.querySelectorAll('[data-contact="address"]').forEach(el => el.textContent = CONFIG.address);
  const waBtn = document.getElementById('contact-whatsapp-btn');
  if (waBtn) waBtn.href = waLink();
}

/* ───────── Toast ───────── */
function showToast(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ───────── Product Cards ───────── */
function renderProductCards(products, containerId = 'products-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!products.length) {
    container.innerHTML = '<div class="empty-cart"><p style="padding:60px">No products found.</p></div>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="product-card">
      <a href="${pagePath('product.html')}?id=${p.id}">
        <div class="product-image">
          <img src="${imgPath(p.image)}" alt="${p.name}" width="300" height="300" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy">
          <span style="display:none;font-size:4rem">🥜</span>
          <div class="quick-add-overlay">
            <button class="btn btn-secondary btn-sm" onclick="event.preventDefault();event.stopPropagation();addToCart(${p.id})">Quick Add</button>
          </div>
        </div>
      </a>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <a href="${pagePath('product.html')}?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
        <div class="product-pack">${p.packSize}${p.unit !== 'Grams' ? ' ' + p.unit : ''}</div>
        <div class="product-price">Rs. ${p.price.toLocaleString()}</div>
        <button class="btn btn-secondary btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

/* ───────── Home Page Featured Products ───────── */
function loadFeaturedProducts() {
  const featured = products.filter(p => p.price >= 1000).slice(0, 4);
  renderProductCards(featured, 'featured-products');
}

/* ───────── Shop Page ───────── */
function initShop() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sort-select');
  let currentCategory = categoryParam || 'All';
  let currentSearch = '';
  let currentSort = 'default';

  function applyFilters() {
    let result = getProductsByCategory(currentCategory === 'All' ? null : currentCategory);
    result = searchProducts(currentSearch);
    result = sortProducts(result, currentSort);
    renderProductCards(result, 'shop-products');
    document.getElementById('result-count').textContent = `${result.length} product${result.length !== 1 ? 's' : ''}`;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });

  if (categoryParam) {
    filterBtns.forEach(btn => {
      if (btn.dataset.category === categoryParam) {
        btn.classList.add('active');
      }
    });
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = searchInput.value;
        applyFilters();
      }, 300);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      applyFilters();
    });
  }

  applyFilters();
}

/* ───────── Product Page ───────── */
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const product = getProductById(productId);

  if (!product) {
    document.querySelector('.product-detail').innerHTML = '<div class="empty-cart"><h2>Product not found</h2><a href="shop.html" class="btn btn-secondary" style="margin-top:1rem">Browse Products</a></div>';
    return;
  }

  document.title = `${product.name} - NutriNuts`;
  document.getElementById('product-category').textContent = product.category;
  if (document.getElementById('product-category-label')) {
    document.getElementById('product-category-label').textContent = product.category;
  }
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = `Rs. ${product.price.toLocaleString()}`;
  document.getElementById('product-pack').textContent = `${product.packSize}${product.unit !== 'Grams' ? ' ' + product.unit : ''}`;
  document.getElementById('product-desc').textContent = product.description;

  const img = document.getElementById('product-img');
  img.src = `../assets/images/${product.image}`;
  img.alt = product.name;
  img.onload = function() { document.getElementById('product-img-fallback').style.display = 'none'; };
  img.onerror = function() { this.style.display = 'none'; document.getElementById('product-img-fallback').style.display = 'flex'; };

  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-minus').addEventListener('click', () => {
    const val = parseInt(qtyInput.value);
    if (val > 1) qtyInput.value = val - 1;
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    addToCart(product.id, parseInt(qtyInput.value));
  });
}

/* ───────── Cart Page ───────── */
function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const summary = document.getElementById('cart-summary');
  const empty = document.getElementById('empty-cart');
  const items = getCartItems();

  if (!container) return;

  if (!items.length) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (summary) summary.style.display = 'block';

  container.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${imgPath(item.product.image)}" alt="${item.product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy">
        <span style="display:none;font-size:2.5rem">🥜</span>
      </div>
      <div class="cart-item-info">
        <h3>${item.product.name}</h3>
        <p>${item.product.packSize}${item.product.unit !== 'Grams' ? ' ' + item.product.unit : ''}</p>
        <div class="cart-item-price">Rs. ${item.product.price.toLocaleString()}</div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control" style="margin:0">
          <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">-</button>
          <input type="text" class="quantity-input" value="${item.quantity}" readonly style="width:44px">
          <button class="quantity-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">Rs. ${(item.product.price * item.quantity).toLocaleString()}</div>
        <button class="remove-item" onclick="confirmRemoveFromCart(${item.productId})">Remove</button>
      </div>
    </div>
  `).join('');

  updateCartSummary();
}

function updateCartSummary() {
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-grand-total');
  if (!subtotalEl) return;
  const total = getCartTotal();
  subtotalEl.textContent = `Rs. ${total.toLocaleString()}`;
  totalEl.textContent = `Rs. ${total.toLocaleString()}`;
}

/* ───────── Checkout Page ───────── */
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-grand-total');
  if (!container) return;

  const items = getCartItems();
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--color-text-light)">Your cart is empty.</p>';
    if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
    if (totalEl) totalEl.textContent = 'Rs. 0';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="checkout-item">
      <span>${item.product.name} × ${item.quantity}</span>
      <span>Rs. ${(item.product.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join('');

  const total = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = `Rs. ${total.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
}

function selectPayment(method) {
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.toggle('selected', el.dataset.method === method);
    const radio = el.querySelector('input');
    if (radio) radio.checked = el.classList.contains('selected');
  });
}

function validateCheckout() {
  let valid = true;
  const fields = [
    { id: 'customer-name', label: 'Customer Name' },
    { id: 'customer-phone', label: 'Customer Phone' },
    { id: 'receiver-name', label: 'Receiver Name' },
    { id: 'receiver-phone', label: 'Receiver Phone' },
    { id: 'delivery-address', label: 'Delivery Address' }
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const group = el.closest('.form-group');
    if (!el.value.trim()) {
      group.classList.add('error');
      group.querySelector('.form-error').textContent = `${f.label} is required`;
      valid = false;
    } else {
      group.classList.remove('error');
    }
  });

  const phoneEl = document.getElementById('customer-phone');
  const phoneGroup = phoneEl.closest('.form-group');
  const phone = phoneEl.value.trim().replace(/\s/g, '');
  if (phone && !/^(\+92|0)?3\d{9}$/.test(phone)) {
    phoneGroup.classList.add('error');
    phoneGroup.querySelector('.form-error').textContent = 'Enter a valid Pakistani phone number (e.g. 03XX-XXXXXXX)';
    valid = false;
  }

  const receiverPhoneEl = document.getElementById('receiver-phone');
  const receiverPhoneGroup = receiverPhoneEl.closest('.form-group');
  const rPhone = receiverPhoneEl.value.trim().replace(/\s/g, '');
  if (rPhone && !/^(\+92|0)?3\d{9}$/.test(rPhone)) {
    receiverPhoneGroup.classList.add('error');
    receiverPhoneGroup.querySelector('.form-error').textContent = 'Enter a valid Pakistani phone number';
    valid = false;
  }

  const payment = document.querySelector('.payment-method.selected');
  if (!payment) {
    showToast('Please select a payment method', true);
    valid = false;
  }

  return valid;
}

function generateOrderId() {
  const lastId = parseInt(localStorage.getItem('nutrinuts_last_order_id') || '0');
  const newId = lastId + 1;
  localStorage.setItem('nutrinuts_last_order_id', newId.toString());
  return `NN-${String(newId).padStart(6, '0')}`;
}

async function placeOrder() {
  if (!validateCheckout()) return;

  const items = getCartItems();
  if (!items.length) {
    showToast('Your cart is empty!', true);
    return;
  }

  const orderId = generateOrderId();
  const now = new Date();
  const dateTime = now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

  const grandTotal = getCartTotal();
  const formData = {
    orderId,
    dateTime,
    customerName: document.getElementById('customer-name').value.trim(),
    customerPhone: document.getElementById('customer-phone').value.trim(),
    receiverName: document.getElementById('receiver-name').value.trim(),
    receiverPhone: document.getElementById('receiver-phone').value.trim(),
    deliveryAddress: document.getElementById('delivery-address').value.trim(),
    mapsLink: document.getElementById('maps-link').value.trim(),
    specialInstructions: document.getElementById('special-instructions').value.trim(),
    paymentMethod: document.querySelector('.payment-method.selected')?.dataset.method || '',
    paymentStatus: 'Pending',
    deliveryStatus: 'Pending',
    items: items.map(i => ({
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
      lineTotal: i.product.price * i.quantity
    })),
    grandTotal
  };

  const submitBtn = document.getElementById('place-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    await saveToGoogleSheets(formData);
  } catch (e) {
    console.warn('Google Sheets save failed, continuing with WhatsApp:', e);
  }

  // ── Admin Notifications (never blocks checkout) ──
  // Channel 1: Local browser notification (instant, zero latency)
  try {
    if (typeof Notifications !== 'undefined') {
      Notifications.notifyNewOrder(formData);
    }
  } catch (e) {
    console.warn('Local notification delivery failed:', e);
  }

  // Channel 2: FCM push notification relay via Google Apps Script backend
  // The GAS backend sends FCM push to all registered admin devices.
  // This is handled server-side in handleOrder() — no client call needed here.
  // The order data is already sent to GAS via saveToGoogleSheets() above,
  // which triggers sendOrderPushNotification() on the backend.

  submitBtn.disabled = false;
  submitBtn.textContent = 'Place Order';

  openWhatsApp(formData);

  showOrderModal(orderId);
  clearCart();
  document.getElementById('checkout-form').reset();
  document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
}

/* ───────── Google Sheets ───────── */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzajJGRq456pL82TGsRATSjH8-exOeuBWdqxH7HQeMC6F1zOV_5HuLZiFUSaXHIbotbzA/exec';

async function saveToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_URL) {
    console.log('Google Sheets URL not configured. Order data:', data);
    return;
  }
  const response = await fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response;
}

/* ───────── Contact Form ───────── */
async function submitContactForm(formData) {
  if (!GOOGLE_SHEETS_URL) {
    showToast('Contact service not configured yet.', true);
    return;
  }
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'contact', ...formData })
    });
    showToast('Thank you! Your message has been sent.');
  } catch {
    showToast('Failed to send message. Please try again.', true);
  }
}

/* ───────── Location Detection ───────── */
function detectLocation() {
  const statusEl = document.getElementById('location-status');
  const inputEl = document.getElementById('maps-link');
  if (!statusEl || !inputEl) return;

  if (!navigator.geolocation) {
    statusEl.textContent = 'Location detection not supported in your browser.';
    return;
  }

  statusEl.textContent = 'Detecting location...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      inputEl.value = mapsUrl;
      statusEl.textContent = `✓ Location detected! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    },
    (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          statusEl.textContent = 'Location access denied. Please paste a Google Maps link manually.';
          break;
        case err.POSITION_UNAVAILABLE:
          statusEl.textContent = 'Location unavailable. Please paste a Google Maps link manually.';
          break;
        default:
          statusEl.textContent = 'Could not detect location. Please paste a Google Maps link manually.';
      }
    }
  );
}

/* ───────── WhatsApp ───────── */
function openWhatsApp(data) {
  const phone = typeof CONFIG !== 'undefined' ? CONFIG.whatsapp : '92300XXXXXXX';
  const message = encodeURIComponent(
    `🛒 *New Order: ${data.orderId}*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Customer:* ${data.customerName}\n` +
    `*Phone:* ${data.customerPhone}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Receiver:* ${data.receiverName}\n` +
    `*Phone:* ${data.receiverPhone}\n` +
    `*Address:* ${data.deliveryAddress}\n` +
    `${data.mapsLink ? `*Maps:* ${data.mapsLink}\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━\n` +
    data.items.map(i => `*${i.productName}* × ${i.quantity} = Rs. ${i.lineTotal.toLocaleString()}\n`).join('') +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Delivery:* To be confirmed\n` +
    `*Grand Total:* Rs. ${data.grandTotal.toLocaleString()}\n` +
    `*Payment:* ${data.paymentMethod}\n` +
    `${data.specialInstructions ? `*Notes:* ${data.specialInstructions}\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Order Date:* ${data.dateTime}`
  );
  window.location.href = `https://wa.me/${phone}?text=${message}`;
}

/* ───────── Order Modal ───────── */
function showOrderModal(orderId) {
  const modal = document.getElementById('order-modal');
  if (!modal) return;
  document.getElementById('modal-order-id').textContent = orderId;
  modal.classList.add('show');
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) modal.classList.remove('show');
}

/* ───────── Page Init ───────── */
function initPageSpecific() {
  const bodyId = document.body.id;

  if (bodyId === 'home-page') {
    loadFeaturedProducts();
  }

  if (bodyId === 'shop-page') {
    initShop();
  }

  if (bodyId === 'product-page') {
    initProductPage();
  }

  if (bodyId === 'cart-page') {
    renderCartPage();
  }

  if (bodyId === 'checkout-page') {
    renderCheckoutSummary();
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', placeOrder);
    }
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', detectLocation);
    }
    // Request notification permission early (prompts user before checkout completes)
    if (typeof Notifications !== 'undefined') {
      Notifications.requestPermission();
    }
  }
}

/* ═══════════════════════════════════════════
   UI/UX Pro Max Additions — Phase 2: P1 Features
   ═══════════════════════════════════════════ */

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Header Scroll Shadow ── */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ── Cart Remove Confirmation ── */
function confirmRemoveFromCart(productId) {
  const btn = event.target;
  if (btn.classList.contains('confirming')) {
    removeFromCart(productId);
    renderCartPage();
    showToast('Item removed from cart');
    return;
  }
  btn.classList.add('confirming');
  btn.textContent = 'Click again to remove';
  setTimeout(() => {
    btn.classList.remove('confirming');
    btn.textContent = 'Remove';
  }, 3000);
}

/* ── Enhanced Toast (with icon + progress bar) ── */
const _originalShowToast = showToast;
showToast = function(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = isError ? '⚠️' : '✅';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span><div class="toast-progress"></div>`;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
};

/* ── Cart Bounce Animation ── */
function triggerCartBounce() {
  const cartBtn = document.getElementById('header-cart');
  if (!cartBtn) return;
  cartBtn.classList.remove('cart-bounce');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-bounce');
}

/* ── Override addToCart to trigger bounce ── */
const _originalAddToCart = addToCart;
addToCart = function(productId, quantity = 1) {
  _originalAddToCart(productId, quantity);
  triggerCartBounce();
  updateCartCount();
};

/* ── Scroll Reveal (Intersection Observer) ── */
function initScrollReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── GSAP ScrollTrigger Animations ── */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero parallax (homepage only) */
  const hero = document.querySelector('.hero');
  if (hero) {
    gsap.to('.hero', {
      backgroundPositionY: '40%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });
  }

  /* Section fade-up reveals */
  gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true
      }
    });
  });

  /* Staggered product card reveals */
  gsap.utils.toArray('.products-grid .product-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card.closest('.products-grid'),
        start: 'top 85%',
        once: true
      }
    });
  });

  /* Category cards reveal */
  gsap.utils.toArray('.category-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card.closest('.categories-grid'),
        start: 'top 85%',
        once: true
      }
    });
  });

  /* Review cards reveal */
  gsap.utils.toArray('.review-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card.closest('.reviews-grid'),
        start: 'top 85%',
        once: true
      }
    });
  });

  /* USP strip items */
  gsap.utils.toArray('.usp-item').forEach((item, i) => {
    gsap.from(item, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item.closest('.usp-strip'),
        start: 'top 85%',
        once: true
      }
    });
  });

  /* CTA section scale-in */
  const cta = document.querySelector('.cta-section');
  if (cta) {
    gsap.from(cta, {
      scale: 0.97,
      opacity: 0.6,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cta,
        start: 'top 90%',
        once: true
      }
    });
  }

  /* Value cards reveal (about page) */
  gsap.utils.toArray('.value-card').forEach((card, i) => {
    gsap.from(card, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card.closest('.values-grid'),
        start: 'top 85%',
        once: true
      }
    });
  });

  /* Product detail page image reveal */
  const detailImg = document.querySelector('.product-detail-image');
  if (detailImg) {
    gsap.from(detailImg, {
      x: -30,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.product-detail',
        start: 'top 80%',
        once: true
      }
    });
    gsap.from('.product-detail-info', {
      x: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.product-detail',
        start: 'top 80%',
        once: true
      }
    });
  }
}

/* ── Skeleton Loading ── */
function showSkeletons(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array(count).fill(
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
}

/* ── Related Products ── */
function renderRelatedProducts(productId) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;
  const current = getProductById(productId);
  if (!current) return;
  const related = getProductsByCategory(current.category)
    .filter(p => p.id !== current.id)
    .slice(0, 4);
  if (!related.length) {
    container.closest('.related-products').style.display = 'none';
    return;
  }
  renderProductCards(related, 'related-products-grid');
}

/* ── Quick View Modal ── */
function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  let modal = document.getElementById('quick-view-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'quick-view-modal';
    modal.innerHTML = `
      <div class="modal quick-view-modal">
        <button class="modal-close" onclick="closeQuickView()" aria-label="Close">×</button>
        <div class="quick-view-content">
          <div class="quick-view-image">
            <img src="" alt="" id="qv-img">
            <span id="qv-img-fallback" style="display:none;font-size:8rem">🥜</span>
          </div>
          <div class="quick-view-details">
            <div class="product-detail-category" id="qv-category"></div>
            <h2 id="qv-name"></h2>
            <div class="product-detail-price" id="qv-price"></div>
            <div class="product-detail-pack" id="qv-pack"></div>
            <button class="btn btn-secondary btn-sm" id="qv-add-btn">Add to Cart</button>
            <a href="#" class="btn btn-outline btn-sm" id="qv-view-link" style="margin-top:8px">View Full Details →</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('qv-img').src = imgPath(product.image);
  document.getElementById('qv-img').alt = product.name;
  document.getElementById('qv-img').onerror = function() {
    this.style.display = 'none';
    document.getElementById('qv-img-fallback').style.display = 'flex';
  };
  document.getElementById('qv-img').onload = function() {
    document.getElementById('qv-img-fallback').style.display = 'none';
  };
  document.getElementById('qv-category').textContent = product.category;
  document.getElementById('qv-name').textContent = product.name;
  document.getElementById('qv-price').textContent = `Rs. ${product.price.toLocaleString()}`;
  document.getElementById('qv-pack').textContent = `${product.packSize}${product.unit !== 'Grams' ? ' ' + product.unit : ''}`;
  document.getElementById('qv-add-btn').onclick = () => {
    addToCart(product.id);
    closeQuickView();
  };
  document.getElementById('qv-view-link').href = pagePath('product.html') + '?id=' + product.id;

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  /* Trap focus */
  modal.querySelector('.modal-close').focus();
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

/* ── Update initPageSpecific for Phase 3 ── */
const _originalInitPageSpecific = initPageSpecific;
initPageSpecific = function() {
  _originalInitPageSpecific();

  /* Product page: related products + benefits */
  if (document.body.id === 'product-page') {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId && getProductById(productId)) {
      setTimeout(() => renderRelatedProducts(productId), 100);
    }
  }

  /* Homepage: skeleton then load */
  if (document.body.id === 'home-page') {
    const featuredGrid = document.getElementById('featured-products');
    if (featuredGrid && !featuredGrid.children.length) {
      showSkeletons('featured-products', 4);
    }
  }
};

/* ── Init UX Enhancements ── */
function initUXEnhancements() {
  initBackToTop();
  initHeaderScroll();
  initScrollReveal();

  /* GSAP animations after a short delay to ensure DOM ready */
  setTimeout(initGSAPAnimations, 300);
}

/* Update DOMContentLoaded to include UX enhancements */
document.addEventListener('DOMContentLoaded', () => {
  initUXEnhancements();
});

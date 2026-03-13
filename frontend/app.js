/* =============================================
   SPICE GARDEN — Main Application JS
   Handles: Auth, Cart, Orders, UI helpers
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
// MENU DATA
// ─────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 1,  name: 'Chicken Biryani',      category: 'main',     price: 280, rating: 4.8, emoji: '🍛', desc: 'Aromatic basmati rice with juicy chicken',   veg: false, bestseller: true  },
  { id: 2,  name: 'Paneer Butter Masala', category: 'main',     price: 220, rating: 4.7, emoji: '🧆', desc: 'Rich creamy tomato & paneer curry',           veg: true,  bestseller: true  },
  { id: 3,  name: 'Tandoori Chicken',     category: 'starters', price: 320, rating: 4.9, emoji: '🍗', desc: 'Marinated chicken grilled in tandoor',        veg: false, bestseller: true  },
  { id: 4,  name: 'Dal Makhani',          category: 'main',     price: 180, rating: 4.6, emoji: '🥘', desc: 'Slow-cooked black lentils in butter',         veg: true,  bestseller: false },
  { id: 5,  name: 'Garlic Naan',          category: 'breads',   price: 60,  rating: 4.5, emoji: '🫓', desc: 'Soft bread with garlic & herb butter',        veg: true,  bestseller: false },
  { id: 6,  name: 'Veg Fried Rice',       category: 'main',     price: 160, rating: 4.4, emoji: '🍚', desc: 'Wok-tossed seasonal vegetables with rice',    veg: true,  bestseller: false },
  { id: 7,  name: 'Fish Curry',           category: 'main',     price: 280, rating: 4.7, emoji: '🐟', desc: 'Coastal style fish in coconut gravy',         veg: false, bestseller: false },
  { id: 8,  name: 'Gulab Jamun',          category: 'desserts', price: 80,  rating: 4.9, emoji: '🍮', desc: 'Soft milk solids soaked in sugar syrup',      veg: true,  bestseller: false },
  { id: 9,  name: 'Butter Chicken',       category: 'main',     price: 260, rating: 4.8, emoji: '🍲', desc: 'Tender chicken in rich buttery tomato sauce', veg: false, bestseller: true  },
  { id: 10, name: 'Mutton Rogan Josh',    category: 'main',     price: 360, rating: 4.7, emoji: '🥩', desc: 'Kashmiri style slow-cooked mutton curry',     veg: false, bestseller: false },
  { id: 11, name: 'Paneer Tikka',         category: 'starters', price: 240, rating: 4.6, emoji: '🧀', desc: 'Marinated paneer grilled to perfection',      veg: true,  bestseller: false },
  { id: 12, name: 'Mango Lassi',          category: 'drinks',   price: 80,  rating: 4.8, emoji: '🥭', desc: 'Cool mango blended with yogurt',              veg: true,  bestseller: false },
  { id: 13, name: 'Masala Dosa',          category: 'starters', price: 140, rating: 4.6, emoji: '🥞', desc: 'Crispy crepe with spiced potato filling',     veg: true,  bestseller: false },
  { id: 14, name: 'Chicken 65',           category: 'starters', price: 220, rating: 4.7, emoji: '🍖', desc: 'Spicy deep-fried chicken specialty',           veg: false, bestseller: true  },
  { id: 15, name: 'Raita',               category: 'drinks',   price: 60,  rating: 4.4, emoji: '🥛', desc: 'Cooling yogurt with cucumber & spices',       veg: true,  bestseller: false },
  { id: 16, name: 'Kulfi',               category: 'desserts', price: 100, rating: 4.8, emoji: '🍦', desc: 'Traditional Indian ice cream',                 veg: true,  bestseller: false },
  { id: 17, name: 'Seekh Kebab',         category: 'starters', price: 280, rating: 4.7, emoji: '🍢', desc: 'Spiced minced meat grilled on skewers',        veg: false, bestseller: false },
  { id: 18, name: 'Shahi Paneer',        category: 'main',     price: 230, rating: 4.6, emoji: '🫕', desc: 'Paneer in rich royal cream-based gravy',       veg: true,  bestseller: false },
  { id: 19, name: 'Butter Naan',         category: 'breads',   price: 50,  rating: 4.5, emoji: '🥙', desc: 'Fluffy oven-baked bread with butter',          veg: true,  bestseller: false },
  { id: 20, name: 'Rasmalai',            category: 'desserts', price: 90,  rating: 4.8, emoji: '🍛', desc: 'Soft cheese patties in sweet saffron cream',   veg: true,  bestseller: false },
];

const CATEGORIES = [
  { key: 'all',      label: '🍽 All' },
  { key: 'starters', label: '🥗 Starters' },
  { key: 'main',     label: '🍛 Main Course' },
  { key: 'breads',   label: '🫓 Breads' },
  { key: 'desserts', label: '🍮 Desserts' },
  { key: 'drinks',   label: '🥤 Drinks' },
];

const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_ABOVE = 500;

// ─────────────────────────────────────────────
// AUTH MANAGER
// ─────────────────────────────────────────────
const Auth = {
  SESSION_KEY: 'spiceGarden_session',
  USER_KEY: 'spiceGarden_user',

  /** Store login session */
  login(identifier, method) {
    const session = {
      identifier,
      method,          // 'mobile' | 'email'
      name: '',
      loggedInAt: Date.now(),
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  /** Update user profile */
  updateProfile(name) {
    const s = this.getSession();
    if (s) {
      s.name = name;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(s));
    }
  },

  /** Get current session */
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(this.SESSION_KEY));
    } catch { return null; }
  },

  /** Check if logged in */
  isLoggedIn() {
    return !!this.getSession();
  },

  /** Logout */
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'login.html';
  },

  /** Redirect if not logged in (call on protected pages) */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  },

  /** Redirect if already logged in (call on login page) */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  },

  /** Generate a fake 6-digit OTP */
  generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },
};

// ─────────────────────────────────────────────
// CART MANAGER
// ─────────────────────────────────────────────
const Cart = {
  CART_KEY: 'spiceGarden_cart',

  /** Get full cart array */
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.CART_KEY)) || [];
    } catch { return []; }
  },

  /** Save cart array */
  _save(items) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this._dispatchUpdate(items);
  },

  /** Dispatch custom event so all UI elements can react */
  _dispatchUpdate(items) {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items } }));
  },

  /** Get quantity of a specific item */
  getQty(itemId) {
    const item = this.getItems().find(i => i.id === itemId);
    return item ? item.qty : 0;
  },

  /** Add or increment */
  add(menuItem, qty = 1) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === menuItem.id);
    if (idx > -1) {
      items[idx].qty += qty;
    } else {
      items.push({ ...menuItem, qty });
    }
    this._save(items);
  },

  /** Decrease qty or remove */
  decrease(itemId) {
    let items = this.getItems();
    const idx = items.findIndex(i => i.id === itemId);
    if (idx > -1) {
      items[idx].qty -= 1;
      if (items[idx].qty <= 0) items.splice(idx, 1);
    }
    this._save(items);
  },

  /** Set specific quantity (0 = remove) */
  setQty(itemId, qty) {
    let items = this.getItems();
    if (qty <= 0) {
      items = items.filter(i => i.id !== itemId);
    } else {
      const idx = items.findIndex(i => i.id === itemId);
      if (idx > -1) items[idx].qty = qty;
      else {
        const menuItem = MENU_ITEMS.find(m => m.id === itemId);
        if (menuItem) items.push({ ...menuItem, qty });
      }
    }
    this._save(items);
  },

  /** Remove item entirely */
  remove(itemId) {
    const items = this.getItems().filter(i => i.id !== itemId);
    this._save(items);
  },

  /** Clear cart */
  clear() {
    this._save([]);
  },

  /** Total item count */
  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  /** Subtotal */
  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  /** Delivery charge */
  getDeliveryCharge() {
    const sub = this.getSubtotal();
    return sub === 0 ? 0 : sub >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  },

  /** Grand total */
  getTotal() {
    return this.getSubtotal() + this.getDeliveryCharge();
  },
};

// ─────────────────────────────────────────────
// ORDER MANAGER
// ─────────────────────────────────────────────
const Orders = {
  ORDERS_KEY: 'spiceGarden_orders',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.ORDERS_KEY)) || [];
    } catch { return []; }
  },

  _save(orders) {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  },

  /** Place a new order */
  place(customerDetails, paymentMethod) {
    const orders = this.getAll();
    const orderId = 'SG' + Date.now().toString().slice(-6);
    const order = {
      id: orderId,
      items: Cart.getItems(),
      subtotal: Cart.getSubtotal(),
      deliveryCharge: Cart.getDeliveryCharge(),
      total: Cart.getTotal(),
      customer: customerDetails,
      payment: paymentMethod,
      status: 'pending',             // pending | preparing | ready | delivered
      placedAt: Date.now(),
      estimatedMinutes: Math.floor(Math.random() * 10) + 25, // 25-35 min
    };
    orders.unshift(order);
    this._save(orders);
    // Store latest order id for confirmation page
    localStorage.setItem('spiceGarden_lastOrder', orderId);
    Cart.clear();
    return order;
  },

  /** Get single order by ID */
  getById(orderId) {
    return this.getAll().find(o => o.id === orderId) || null;
  },

  /** Get last order */
  getLatest() {
    const id = localStorage.getItem('spiceGarden_lastOrder');
    return id ? this.getById(id) : null;
  },

  /** Update order status (admin) */
  updateStatus(orderId, status) {
    const orders = this.getAll();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) orders[idx].status = status;
    this._save(orders);
    window.dispatchEvent(new CustomEvent('ordersUpdated'));
  },

  /** Format timestamp */
  formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },
};

// ─────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────
const Toast = {
  container: null,

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  },

  /**
   * Show a toast message.
   * @param {string} msg
   * @param {'default'|'success'|'error'|'gold'} type
   * @param {number} duration ms
   */
  show(msg, type = 'default', duration = 2800) {
    const c = this._getContainer();
    const el = document.createElement('div');
    el.className = `toast${type !== 'default' ? ' ' + type : ''}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
      el.classList.add('fadeout');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
  },
};

// ─────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────

/** Update all cart badge counts on the page */
function updateCartBadges() {
  const count = Cart.getCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  // Sticky bar
  const bar = document.getElementById('sticky-cart-bar');
  if (bar) {
    if (count > 0) {
      bar.classList.remove('hidden');
      const barCount = bar.querySelector('.bar-count');
      const barTotal = bar.querySelector('.bar-total');
      if (barCount) barCount.textContent = `${count} item${count > 1 ? 's' : ''}`;
      if (barTotal) barTotal.textContent = `₹${Cart.getTotal()}`;
    } else {
      bar.classList.add('hidden');
    }
  }
}

/** Animate "fly to cart" from button position to cart icon */
function flyToCart(fromEl, emoji) {
  const cartIcon = document.querySelector('.cart-icon-target');
  if (!cartIcon || !fromEl) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = cartIcon.getBoundingClientRect();

  const fly = document.createElement('div');
  fly.className = 'fly-item';
  fly.textContent = emoji;
  fly.style.left = fromRect.left + fromRect.width / 2 - 22 + 'px';
  fly.style.top  = fromRect.top  + fromRect.height / 2 - 22 + 'px';

  const tx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2) + 'px';
  const ty = (toRect.top  + toRect.height / 2) - (fromRect.top  + fromRect.height / 2) + 'px';
  fly.style.setProperty('--tx', tx);
  fly.style.setProperty('--ty', ty);

  document.body.appendChild(fly);
  fly.addEventListener('animationend', () => fly.remove(), { once: true });
}

/** Open bottom sheet */
function openSheet(sheetId, overlayId) {
  const sheet   = document.getElementById(sheetId);
  const overlay = document.getElementById(overlayId);
  if (sheet)   sheet.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/** Close bottom sheet */
function closeSheet(sheetId, overlayId) {
  const sheet   = document.getElementById(sheetId);
  const overlay = document.getElementById(overlayId);
  if (sheet)   sheet.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/** Format price */
function fmt(n) { return '₹' + n; }

/** Generate star string */
function stars(rating) {
  const full = Math.floor(rating);
  return '★'.repeat(full) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
}

/** Rating display (simplified) */
function ratingDisplay(rating) {
  return `<span class="stars">★</span> ${rating}`;
}

// ─────────────────────────────────────────────
// BUILD FOOD CARD HTML
// ─────────────────────────────────────────────
function buildFoodCard(item) {
  const qty    = Cart.getQty(item.id);
  const vegDot = item.veg
    ? `<div class="veg-badge veg"><div class="dot"></div></div>`
    : `<div class="veg-badge nonveg"><div class="dot"></div></div>`;
  const bestseller = item.bestseller
    ? `<span class="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">🔥 Best</span>`
    : '';

  const addControl = qty === 0
    ? `<button class="add-btn" onclick="handleAddToCart(${item.id}, this)">
         <span>+</span> Add
       </button>`
    : `<div class="qty-control" id="qtyCtrl_${item.id}">
         <button onclick="handleDecrease(${item.id})">−</button>
         <span id="qty_${item.id}">${qty}</span>
         <button onclick="handleIncrease(${item.id})">+</button>
       </div>`;

  return `
  <div class="food-card" id="card_${item.id}">
    <div class="relative">
      <div class="w-full h-28 flex items-center justify-center text-6xl"
           style="background:linear-gradient(135deg,#FDF8F3,#F5ECD9)">
        ${item.emoji}
      </div>
      ${bestseller}
      <div class="absolute top-2 right-2">${vegDot}</div>
    </div>
    <div class="p-3">
      <h3 class="font-semibold text-sm leading-tight mb-1" style="color:#1A1A1A">${item.name}</h3>
      <p class="text-xs text-gray-400 mb-2 leading-relaxed line-clamp-2">${item.desc}</p>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-400 mb-0.5">${ratingDisplay(item.rating)}</div>
          <div class="font-bold text-base" style="color:#D4A853">₹${item.price}</div>
        </div>
        <div id="addControl_${item.id}">${addControl}</div>
      </div>
    </div>
  </div>`;
}

/** Re-render a single card's add control */
function refreshCardControl(itemId) {
  const el  = document.getElementById(`addControl_${itemId}`);
  if (!el) return;
  const item = MENU_ITEMS.find(m => m.id === itemId);
  const qty  = Cart.getQty(itemId);
  if (qty === 0) {
    el.innerHTML = `<button class="add-btn" onclick="handleAddToCart(${itemId}, this)"><span>+</span> Add</button>`;
  } else {
    el.innerHTML = `<div class="qty-control" id="qtyCtrl_${itemId}">
      <button onclick="handleDecrease(${itemId})">−</button>
      <span id="qty_${itemId}">${qty}</span>
      <button onclick="handleIncrease(${itemId})">+</button>
    </div>`;
  }
}

// ─────────────────────────────────────────────
// CART ACTION HANDLERS (used in HTML)
// ─────────────────────────────────────────────
function handleAddToCart(itemId, btn) {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) return;
  Cart.add(item);
  flyToCart(btn, item.emoji);
  btn.classList.add('add-cart-anim');
  setTimeout(() => refreshCardControl(itemId), 100);
  Toast.show(`${item.emoji} ${item.name} added to cart`, 'gold');
}

function handleIncrease(itemId) {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (!item) return;
  Cart.add(item);
  const el = document.getElementById(`qty_${itemId}`);
  if (el) el.textContent = Cart.getQty(itemId);
}

function handleDecrease(itemId) {
  Cart.decrease(itemId);
  const qty = Cart.getQty(itemId);
  if (qty === 0) {
    refreshCardControl(itemId);
  } else {
    const el = document.getElementById(`qty_${itemId}`);
    if (el) el.textContent = qty;
  }
}

// ─────────────────────────────────────────────
// RENDER MENU (used on index.html)
// ─────────────────────────────────────────────
function renderMenu(category = 'all') {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  const filtered = category === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(m => m.category === category);

  grid.innerHTML = filtered.map(buildFoodCard).join('');
}

// ─────────────────────────────────────────────
// RENDER CART ITEMS (inside bottom sheet / cart page)
// ─────────────────────────────────────────────
function renderCartSheet() {
  const list = document.getElementById('cart-sheet-list');
  if (!list) return;
  const items = Cart.getItems();

  if (items.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <p class="font-semibold text-gray-500">Your cart is empty</p>
        <p class="text-sm text-gray-400 mt-1">Add some delicious food!</p>
      </div>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="flex items-center gap-3 py-3 border-b border-gray-100" id="cartRow_${item.id}">
      <div class="text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
           style="background:#FDF8F3">${item.emoji}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm leading-tight truncate">${item.name}</p>
        <p class="text-xs text-gray-400 mt-0.5">₹${item.price} × ${item.qty}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="qty-control">
          <button onclick="cartSheetDecrease(${item.id})">−</button>
          <span id="sheetQty_${item.id}">${item.qty}</span>
          <button onclick="cartSheetIncrease(${item.id})">+</button>
        </div>
        <span class="font-bold text-sm w-16 text-right" style="color:#D4A853"
              id="sheetPrice_${item.id}">₹${item.price * item.qty}</span>
      </div>
    </div>
  `).join('');

  // update totals
  updateCartSheetTotals();
}

function updateCartSheetTotals() {
  const sub = Cart.getSubtotal();
  const del = Cart.getDeliveryCharge();
  const tot = Cart.getTotal();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('cart-subtotal', `₹${sub}`);
  setEl('cart-delivery', del === 0 ? 'FREE' : `₹${del}`);
  setEl('cart-total', `₹${tot}`);
  if (del === 0 && sub > 0) {
    const note = document.getElementById('free-delivery-note');
    if (note) note.classList.remove('hidden');
  }
}

function cartSheetIncrease(itemId) {
  const item = MENU_ITEMS.find(m => m.id === itemId);
  if (item) Cart.add(item);
  const qty = Cart.getQty(itemId);
  const qEl = document.getElementById(`sheetQty_${itemId}`);
  const pEl = document.getElementById(`sheetPrice_${itemId}`);
  if (qEl) qEl.textContent = qty;
  if (pEl) pEl.textContent = `₹${item.price * qty}`;
  updateCartSheetTotals();
  // also update card
  refreshCardControl(itemId);
}

function cartSheetDecrease(itemId) {
  Cart.decrease(itemId);
  const qty = Cart.getQty(itemId);
  if (qty === 0) {
    const row = document.getElementById(`cartRow_${itemId}`);
    if (row) row.remove();
    if (Cart.getItems().length === 0) renderCartSheet();
  } else {
    const item = MENU_ITEMS.find(m => m.id === itemId);
    const qEl  = document.getElementById(`sheetQty_${itemId}`);
    const pEl  = document.getElementById(`sheetPrice_${itemId}`);
    if (qEl) qEl.textContent = qty;
    if (pEl && item) pEl.textContent = `₹${item.price * qty}`;
  }
  updateCartSheetTotals();
  refreshCardControl(itemId);
}

// ─────────────────────────────────────────────
// SEARCH FILTER
// ─────────────────────────────────────────────
function filterMenuBySearch(query) {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  const q = query.toLowerCase().trim();
  if (!q) { renderMenu(window._activeCategory || 'all'); return; }

  const filtered = MENU_ITEMS.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.desc.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  );
  grid.innerHTML = filtered.length
    ? filtered.map(buildFoodCard).join('')
    : `<div class="col-span-2 text-center py-12 text-gray-400">
         <div class="text-5xl mb-3">🔍</div>
         <p>No results for "${query}"</p>
       </div>`;
}

// ─────────────────────────────────────────────
// CHECKOUT HELPERS
// ─────────────────────────────────────────────
function renderCheckoutSummary() {
  const c = document.getElementById('checkout-order-summary');
  if (!c) return;
  const items = Cart.getItems();
  if (items.length === 0) { window.location.href = 'index.html'; return; }

  c.innerHTML = items.map(i => `
    <div class="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
      <span class="text-gray-700">${i.emoji} ${i.name} × ${i.qty}</span>
      <span class="font-semibold">₹${i.price * i.qty}</span>
    </div>`).join('') + `
    <div class="flex justify-between py-2 text-sm text-gray-500">
      <span>Delivery</span>
      <span>${Cart.getDeliveryCharge() === 0 ? '<span class="text-green-600 font-semibold">FREE</span>' : '₹' + Cart.getDeliveryCharge()}</span>
    </div>
    <div class="flex justify-between py-2 font-bold text-base border-t border-gray-200 mt-1">
      <span>Total</span>
      <span style="color:#D4A853">₹${Cart.getTotal()}</span>
    </div>`;
}

// ─────────────────────────────────────────────
// INPUT VALIDATORS
// ─────────────────────────────────────────────
const Validate = {
  mobile(val) { return /^[6-9]\d{9}$/.test(val.trim()); },
  email(val)  { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); },
  otp(val)    { return /^\d{6}$/.test(val.trim()); },
  name(val)   { return val.trim().length >= 2; },
};

// ─────────────────────────────────────────────
// EXPOSE GLOBALS
// ─────────────────────────────────────────────
window.MENU_ITEMS       = MENU_ITEMS;
window.CATEGORIES       = CATEGORIES;
window.DELIVERY_CHARGE  = DELIVERY_CHARGE;
window.Auth             = Auth;
window.Cart             = Cart;
window.Orders           = Orders;
window.Toast            = Toast;
window.Validate         = Validate;
window.updateCartBadges = updateCartBadges;
window.flyToCart        = flyToCart;
window.openSheet        = openSheet;
window.closeSheet       = closeSheet;
window.fmt              = fmt;
window.ratingDisplay    = ratingDisplay;
window.buildFoodCard    = buildFoodCard;
window.renderMenu       = renderMenu;
window.filterMenuBySearch = filterMenuBySearch;
window.refreshCardControl = refreshCardControl;
window.renderCartSheet  = renderCartSheet;
window.updateCartSheetTotals = updateCartSheetTotals;
window.cartSheetIncrease = cartSheetIncrease;
window.cartSheetDecrease = cartSheetDecrease;
window.handleAddToCart  = handleAddToCart;
window.handleIncrease   = handleIncrease;
window.handleDecrease   = handleDecrease;
window.renderCheckoutSummary = renderCheckoutSummary;

// Listen for cart updates everywhere
window.addEventListener('cartUpdated', updateCartBadges);

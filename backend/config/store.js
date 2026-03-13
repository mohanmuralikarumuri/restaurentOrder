/**
 * config/store.js
 * In-memory data store — used when MongoDB is not available.
 * All 20 menu items are pre-seeded. Users and orders are kept
 * in plain arrays for the lifetime of the process.
 */

const bcrypt = require('bcryptjs');

// ── Pre-seeded menu ───────────────────────────
const MENU_SEED = [
  { itemId: '1',  name: 'Paneer Tikka',        category: 'starters', price: 220, emoji: '🧀', rating: 4.8, veg: true,  bestseller: true,  description: 'Smoky marinated cottage cheese grilled in tandoor' },
  { itemId: '2',  name: 'Chicken 65',           category: 'starters', price: 260, emoji: '🍗', rating: 4.7, veg: false, bestseller: true,  description: 'Spicy crispy fried chicken — a South Indian classic' },
  { itemId: '3',  name: 'Veg Spring Rolls',     category: 'starters', price: 160, emoji: '🥢', rating: 4.3, veg: true,  bestseller: false, description: 'Crispy rolls stuffed with seasoned mixed vegetables' },
  { itemId: '4',  name: 'Seekh Kebab',          category: 'starters', price: 280, emoji: '🍢', rating: 4.6, veg: false, bestseller: false, description: 'Minced chicken kebabs cooked on open flame' },
  { itemId: '5',  name: 'Hara Bhara Kebab',     category: 'starters', price: 180, emoji: '🥗', rating: 4.4, veg: true,  bestseller: false, description: 'Spinach & pea patties packed with herbs' },
  { itemId: '6',  name: 'Butter Chicken',       category: 'main',     price: 320, emoji: '🍛', rating: 4.9, veg: false, bestseller: true,  description: 'Tender chicken in rich buttery tomato gravy' },
  { itemId: '7',  name: 'Paneer Butter Masala', category: 'main',     price: 280, emoji: '🍲', rating: 4.8, veg: true,  bestseller: true,  description: 'Cottage cheese in creamy tomato-cashew sauce' },
  { itemId: '8',  name: 'Dal Makhani',          category: 'main',     price: 220, emoji: '🫕', rating: 4.7, veg: true,  bestseller: false, description: 'Slow-cooked black lentils with butter & cream' },
  { itemId: '9',  name: 'Chicken Biryani',      category: 'main',     price: 360, emoji: '🍚', rating: 4.9, veg: false, bestseller: true,  description: 'Aromatic basmati rice layered with spiced chicken' },
  { itemId: '10', name: 'Palak Paneer',         category: 'main',     price: 260, emoji: '🥬', rating: 4.5, veg: true,  bestseller: false, description: 'Fresh spinach curry with soft paneer cubes' },
  { itemId: '11', name: 'Garlic Naan',          category: 'breads',   price: 60,  emoji: '🫓', rating: 4.7, veg: true,  bestseller: true,  description: 'Leavened bread topped with garlic butter' },
  { itemId: '12', name: 'Butter Roti',          category: 'breads',   price: 40,  emoji: '🫓', rating: 4.5, veg: true,  bestseller: false, description: 'Whole wheat flatbread with butter' },
  { itemId: '13', name: 'Peshwari Naan',        category: 'breads',   price: 80,  emoji: '🫓', rating: 4.6, veg: true,  bestseller: false, description: 'Sweet naan stuffed with coconut & nuts' },
  { itemId: '14', name: 'Paratha',              category: 'breads',   price: 50,  emoji: '🫓', rating: 4.4, veg: true,  bestseller: false, description: 'Layered whole wheat flatbread' },
  { itemId: '15', name: 'Laccha Paratha',       category: 'breads',   price: 55,  emoji: '🫓', rating: 4.5, veg: true,  bestseller: false, description: 'Multi-layered crispy wheat bread' },
  { itemId: '16', name: 'Gulab Jamun',          category: 'desserts', price: 100, emoji: '🍮', rating: 4.8, veg: true,  bestseller: true,  description: 'Soft milk dumplings soaked in rose sugar syrup' },
  { itemId: '17', name: 'Rasgulla',             category: 'desserts', price: 100, emoji: '⚪', rating: 4.6, veg: true,  bestseller: false, description: 'Spongy cottage cheese balls in light syrup' },
  { itemId: '18', name: 'Kulfi',                category: 'desserts', price: 120, emoji: '🍦', rating: 4.7, veg: true,  bestseller: false, description: 'Traditional Indian ice cream with cardamom' },
  { itemId: '19', name: 'Mango Lassi',          category: 'drinks',   price: 120, emoji: '🥭', rating: 4.8, veg: true,  bestseller: true,  description: 'Chilled blended yogurt drink with fresh mango' },
  { itemId: '20', name: 'Masala Chaas',         category: 'drinks',   price: 80,  emoji: '🥛', rating: 4.5, veg: true,  bestseller: false, description: 'Spiced buttermilk with cumin and fresh coriander' },
];

// ── Collections ───────────────────────────────
const collections = {
  users: [],
  orders: [],
  menu: MENU_SEED.map((item, i) => ({
    ...item,
    _id: String(i + 1),
    available: true,
    createdAt: new Date(),
  })),
};

let _uidSeq = 0;
let _oidSeq = 0;

// ── Pricing constants ─────────────────────────
const DELIVERY_CHARGE = 40;
const FREE_DELIVERY_ABOVE = 500;
const TAX_RATE = 0.05;

function computePricing(items) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + deliveryCharge + tax) * 100) / 100;
  return { subtotal, deliveryCharge, tax, total };
}

// ── User operations ───────────────────────────

function findUserByField(field, value) {
  return collections.users.find(u => u[field] === value) || null;
}

function findUserById(id) {
  return collections.users.find(u => u._id === id) || null;
}

function findOrCreateUser(field, value, extra = {}) {
  let user = findUserByField(field, value);
  if (!user) {
    user = {
      _id: String(++_uidSeq),
      name: null,
      email: null,
      mobile: null,
      isVerified: false,
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,
      createdAt: new Date(),
      ...extra,
      [field]: value,
    };
    collections.users.push(user);
  }
  return user;
}

async function setUserOtp(user, otp) {
  const salt = await bcrypt.genSalt(10);
  user.otpHash = await bcrypt.hash(otp, salt);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  user.otpAttempts = 0;
}

async function verifyUserOtp(user, otp) {
  if (!user.otpHash || !user.otpExpiry) return false;
  if (new Date() > user.otpExpiry) return false;
  return bcrypt.compare(otp, user.otpHash);
}

// ── Order operations ──────────────────────────

function createOrder(data) {
  const year = new Date().getFullYear();
  const orderId = `ORD-${year}-${String(++_oidSeq).padStart(4, '0')}`;
  const pricing = computePricing(data.items);
  const order = {
    _id: orderId,
    orderId,
    orderStatus: 'pending',
    statusHistory: [{ status: 'pending', updatedAt: new Date() }],
    emailSent: false,
    createdAt: new Date(),
    ...data,
    pricing, // always recompute server-side
  };
  collections.orders.push(order);
  return order;
}

function getOrders(filter = 'all', page = 1, limit = 20) {
  let orders = [...collections.orders];

  if (filter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    orders = orders.filter(o => o.createdAt >= start);
  } else if (filter === 'pending') {
    orders = orders.filter(o => ['pending', 'preparing'].includes(o.orderStatus));
  } else if (filter === 'delivered') {
    orders = orders.filter(o => o.orderStatus === 'delivered');
  } else if (filter === 'cancelled') {
    orders = orders.filter(o => o.orderStatus === 'cancelled');
  }

  orders.sort((a, b) => b.createdAt - a.createdAt);
  const total = orders.length;
  const skip = (page - 1) * limit;
  return { orders: orders.slice(skip, skip + limit), total };
}

function findOrder(orderId) {
  return collections.orders.find(o => o.orderId === orderId) || null;
}

function updateOrderStatus(orderId, status) {
  const order = collections.orders.find(o => o.orderId === orderId);
  if (!order) return null;
  order.orderStatus = status;
  order.statusHistory.push({ status, updatedAt: new Date() });
  return order;
}

// ── Menu operations ───────────────────────────

function getMenu(category) {
  return collections.menu
    .filter(item => {
      if (!item.available) return false;
      if (category && category !== 'all') return item.category === category;
      return true;
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

module.exports = {
  // user
  findUserByField,
  findUserById,
  findOrCreateUser,
  setUserOtp,
  verifyUserOtp,
  // order
  createOrder,
  getOrders,
  findOrder,
  updateOrderStatus,
  computePricing,
  // menu
  getMenu,
  // raw collections (read-only use)
  collections,
};

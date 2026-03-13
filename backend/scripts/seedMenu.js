/**
 * scripts/seedMenu.js
 * Seeds the 20 Spice Garden menu items into MongoDB.
 *
 * Usage:
 *   npm run seed
 *   node scripts/seedMenu.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Menu = require('../models/Menu');

const MENU_ITEMS = [
  // ── Starters ─────────────────────────────────
  { itemId: '1', name: 'Paneer Tikka',      category: 'starters', price: 220, emoji: '🧀', rating: 4.8, veg: true,  bestseller: true,  description: 'Smoky marinated cottage cheese grilled in tandoor' },
  { itemId: '2', name: 'Chicken 65',        category: 'starters', price: 260, emoji: '🍗', rating: 4.7, veg: false, bestseller: true,  description: 'Spicy crispy fried chicken — a South Indian classic' },
  { itemId: '3', name: 'Veg Spring Rolls',  category: 'starters', price: 160, emoji: '🥢', rating: 4.3, veg: true,  bestseller: false, description: 'Crispy rolls stuffed with seasoned mixed vegetables' },
  { itemId: '4', name: 'Seekh Kebab',       category: 'starters', price: 280, emoji: '🍢', rating: 4.6, veg: false, bestseller: false, description: 'Minced chicken kebabs cooked on open flame' },
  { itemId: '5', name: 'Hara Bhara Kebab',  category: 'starters', price: 180, emoji: '🥗', rating: 4.4, veg: true,  bestseller: false, description: 'Spinach & pea patties packed with herbs' },

  // ── Main Course ───────────────────────────────
  { itemId: '6',  name: 'Butter Chicken',     category: 'main', price: 320, emoji: '🍛', rating: 4.9, veg: false, bestseller: true,  description: 'Tender chicken in rich buttery tomato gravy' },
  { itemId: '7',  name: 'Paneer Butter Masala', category: 'main', price: 280, emoji: '🍲', rating: 4.8, veg: true,  bestseller: true,  description: 'Cottage cheese in creamy tomato-cashew sauce' },
  { itemId: '8',  name: 'Dal Makhani',         category: 'main', price: 220, emoji: '🫕', rating: 4.7, veg: true,  bestseller: false, description: 'Slow-cooked black lentils with butter & cream' },
  { itemId: '9',  name: 'Chicken Biryani',     category: 'main', price: 360, emoji: '🍚', rating: 4.9, veg: false, bestseller: true,  description: 'Aromatic basmati rice layered with spiced chicken' },
  { itemId: '10', name: 'Palak Paneer',        category: 'main', price: 260, emoji: '🥬', rating: 4.5, veg: true,  bestseller: false, description: 'Fresh spinach curry with soft paneer cubes' },

  // ── Breads ────────────────────────────────────
  { itemId: '11', name: 'Garlic Naan',    category: 'breads', price: 60,  emoji: '🫓', rating: 4.7, veg: true, bestseller: true,  description: 'Leavened bread topped with garlic butter' },
  { itemId: '12', name: 'Butter Roti',   category: 'breads', price: 40,  emoji: '🫓', rating: 4.5, veg: true, bestseller: false, description: 'Whole wheat flatbread with butter' },
  { itemId: '13', name: 'Peshwari Naan', category: 'breads', price: 80,  emoji: '🫓', rating: 4.6, veg: true, bestseller: false, description: 'Sweet naan stuffed with coconut & nuts' },
  { itemId: '14', name: 'Paratha',       category: 'breads', price: 50,  emoji: '🫓', rating: 4.4, veg: true, bestseller: false, description: 'Layered whole wheat flatbread' },
  { itemId: '15', name: 'Laccha Paratha', category: 'breads', price: 55, emoji: '🫓', rating: 4.5, veg: true, bestseller: false, description: 'Multi-layered crispy wheat bread' },

  // ── Desserts ──────────────────────────────────
  { itemId: '16', name: 'Gulab Jamun',  category: 'desserts', price: 100, emoji: '🍮', rating: 4.8, veg: true, bestseller: true,  description: 'Soft milk dumplings soaked in rose sugar syrup' },
  { itemId: '17', name: 'Rasgulla',     category: 'desserts', price: 100, emoji: '⚪', rating: 4.6, veg: true, bestseller: false, description: 'Spongy cottage cheese balls in light syrup' },
  { itemId: '18', name: 'Kulfi',        category: 'desserts', price: 120, emoji: '🍦', rating: 4.7, veg: true, bestseller: false, description: 'Traditional Indian ice cream with cardamom' },

  // ── Drinks ────────────────────────────────────
  { itemId: '19', name: 'Mango Lassi',   category: 'drinks', price: 120, emoji: '🥭', rating: 4.8, veg: true, bestseller: true,  description: 'Chilled blended yogurt drink with fresh mango' },
  { itemId: '20', name: 'Masala Chaas',  category: 'drinks', price: 80,  emoji: '🥛', rating: 4.5, veg: true, bestseller: false, description: 'Spiced buttermilk with cumin and fresh coriander' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅  Connected to MongoDB');

    await Menu.deleteMany({});
    console.log('🗑   Cleared existing menu items');

    const inserted = await Menu.insertMany(MENU_ITEMS);
    console.log(`🌱  Seeded ${inserted.length} menu items`);

    await mongoose.disconnect();
    console.log('👋  Done — disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

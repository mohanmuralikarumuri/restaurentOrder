const mongoose = require('mongoose');

const CATEGORIES = ['starters', 'main', 'breads', 'desserts', 'drinks'];

const menuSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true }, // matches frontend MENU_ITEMS id
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      lowercase: true,
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    emoji: { type: String, default: '🍽' },
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    veg: { type: Boolean, default: true },
    bestseller: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    image: { type: String, trim: true }, // optional remote URL
  },
  { timestamps: true }
);

menuSchema.index({ category: 1, available: 1 });

module.exports = mongoose.model('Menu', menuSchema);

const mongoose = require('mongoose');
const store = require('../config/store');

const dbConnected = () => mongoose.connection.readyState === 1;

/**
 * GET /api/menu
 * Returns all available menu items.
 * Optional query: ?category=starters|main|breads|desserts|drinks
 */
const getMenu = async (req, res, next) => {
  try {
    const category = req.query.category ? req.query.category.toLowerCase() : null;
    let items;

    if (dbConnected()) {
      const Menu = require('../models/Menu');
      const filter = { available: true };
      if (category && category !== 'all') filter.category = category;
      items = await Menu.find(filter).sort({ category: 1, name: 1 }).lean();
    } else {
      items = store.getMenu(category && category !== 'all' ? category : null);
    }

    res.json({ success: true, count: items.length, items });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu };

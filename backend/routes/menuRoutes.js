const express = require('express');
const { getMenu } = require('../controllers/menuController');

const router = express.Router();

// GET /api/menu          — all available items
// GET /api/menu?category=starters  — filter by category
router.get('/', getMenu);

module.exports = router;

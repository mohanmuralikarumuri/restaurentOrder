const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  placeOrder,
  getAdminOrders,
  updateOrderStatus,
  getOrderById,
} = require('../controllers/orderController');

const router = express.Router();

// POST /api/orders  — place order (auth optional; links to user if logged in)
router.post('/', optionalAuth, placeOrder);

// GET /api/orders/admin  — list all orders (admin protected)
router.get('/admin', protect, getAdminOrders);

// GET /api/orders/:id  — get order by orderId (e.g. ORD-2026-0001)
router.get('/:id', getOrderById);

// PATCH /api/orders/:id/status  — update order status (admin protected)
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;

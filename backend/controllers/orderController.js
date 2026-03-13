const { body } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidation } = require('../middleware/validate');
const { sendNewOrderNotification, sendOrderConfirmation } = require('../services/emailService');
const store = require('../config/store');

const dbConnected = () => mongoose.connection.readyState === 1;

// ── Validation rules ──────────────────────────
const placeOrderRules = [
  body('customer.name').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 60 }).withMessage('Name too long'),
  body('customer.mobile').trim().notEmpty().withMessage('Mobile number is required').matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  body('customer.email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email').normalizeEmail(),
  body('delivery.address').trim().notEmpty().withMessage('Delivery address is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menuItemId').notEmpty().withMessage('Item ID is required'),
  body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be positive'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('paymentMethod').isIn(['cod', 'upi', 'card']).withMessage('Invalid payment method'),
];

const updateStatusRules = [
  body('status').isIn(['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid status value'),
];

// ── Helper for DB email marking ───────────────
const fireEmails = (order, isDB) => {
  Promise.allSettled([
    sendNewOrderNotification(order),
    sendOrderConfirmation(order),
  ]).then((results) => {
    results.forEach((r, i) => { if (r.status === 'rejected') console.error(`[Email ${i}]`, r.reason?.message); });
    if (isDB && results[0].status === 'fulfilled') {
      const Order = require('../models/Order');
      Order.findByIdAndUpdate(order._id, { emailSent: true }).exec();
    } else if (!isDB) {
      order.emailSent = results[0].status === 'fulfilled';
    }
  });
};

// ── Controllers ───────────────────────────────

/**
 * POST /api/orders
 */
const placeOrder = [
  ...placeOrderRules,
  handleValidation,
  async (req, res, next) => {
    try {
      const { customer, delivery, items, paymentMethod } = req.body;
      let order;

      if (dbConnected()) {
        const Order = require('../models/Order');
        order = await Order.create({ customer, delivery, items, pricing: store.computePricing(items), paymentMethod, userId: req.user?._id });
        fireEmails(order, true);
      } else {
        order = store.createOrder({ customer, delivery, items, paymentMethod, userId: req.user?._id });
        fireEmails(order, false);
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        orderId: order.orderId,
        order: { id: order._id, orderId: order.orderId, orderStatus: order.orderStatus, pricing: order.pricing },
      });
    } catch (err) { next(err); }
  },
];

/**
 * GET /api/orders/admin  — protected
 * Query: filter=today|pending|delivered|all  page=1  limit=20
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 20 } = req.query;

    if (dbConnected()) {
      const Order = require('../models/Order');
      const matchStage = {};
      if (filter === 'today') { const s = new Date(); s.setHours(0,0,0,0); matchStage.createdAt = { $gte: s }; }
      else if (filter === 'pending') matchStage.orderStatus = { $in: ['pending','preparing'] };
      else if (filter === 'delivered') matchStage.orderStatus = 'delivered';
      else if (filter === 'cancelled') matchStage.orderStatus = 'cancelled';
      const skip = (Number(page)-1)*Number(limit);
      const [orders, total] = await Promise.all([Order.find(matchStage).sort({createdAt:-1}).skip(skip).limit(Number(limit)).lean(), Order.countDocuments(matchStage)]);
      return res.json({ success: true, total, page: Number(page), totalPages: Math.ceil(total/Number(limit)), orders });
    }

    // in-memory
    const { orders, total } = store.getOrders(filter, Number(page), Number(limit));
    res.json({ success: true, total, page: Number(page), totalPages: Math.ceil(total/Number(limit)), orders });
  } catch (err) { next(err); }
};

/**
 * PATCH /api/orders/:id/status  — protected
 */
const updateOrderStatus = [
  ...updateStatusRules,
  handleValidation,
  async (req, res, next) => {
    try {
      let order;
      if (dbConnected()) {
        const Order = require('../models/Order');
        order = await Order.findOne({ orderId: req.params.id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        order.orderStatus = req.body.status;
        await order.save();
      } else {
        order = store.updateOrderStatus(req.params.id, req.body.status);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, message: `Order status updated to "${req.body.status}"`, orderId: order.orderId, orderStatus: order.orderStatus });
    } catch (err) { next(err); }
  },
];

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    let order;
    if (dbConnected()) {
      const Order = require('../models/Order');
      order = await Order.findOne({ orderId: req.params.id }).lean();
    } else {
      order = store.findOrder(req.params.id);
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

module.exports = { placeOrder, getAdminOrders, updateOrderStatus, getOrderById };

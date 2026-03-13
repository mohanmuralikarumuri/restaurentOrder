const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    emoji: { type: String, default: '🍽' },
  },
  { _id: false }
);

const ORDER_STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      // auto-generated in pre-save hook
    },
    customer: {
      name: { type: String, required: [true, 'Customer name is required'], trim: true },
      mobile: {
        type: String,
        required: [true, 'Customer mobile is required'],
        match: [/^[6-9]\d{9}$/, 'Invalid mobile number'],
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
      },
    },
    delivery: {
      address: { type: String, required: [true, 'Delivery address is required'], trim: true },
      landmark: { type: String, trim: true },
    },
    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: 'Order must have at least one item' },
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      deliveryCharge: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card'],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        updatedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Auto-generate orderId: ORD-YYYY-XXXX ─────
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
    this.statusHistory.push({ status: this.orderStatus });
  }
  next();
});

// ── Track status changes ──────────────────────
orderSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('orderStatus')) {
    this.statusHistory.push({ status: this.orderStatus });
  }
  next();
});

// ── Virtual: itemCount ────────────────────────
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);

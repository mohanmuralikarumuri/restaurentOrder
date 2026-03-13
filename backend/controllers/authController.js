const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const mongoose = require('mongoose');
const { handleValidation } = require('../middleware/validate');
const { sendOtpEmail } = require('../services/emailService');
const store = require('../config/store');

// ── Validation rules ──────────────────────────
const sendOtpRules = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number is required')
    .custom((val) => {
      const isEmailVal = /^\S+@\S+\.\S+$/.test(val);
      const isMobile = /^[6-9]\d{9}$/.test(val);
      if (!isEmailVal && !isMobile)
        throw new Error('Provide a valid email address or 10-digit mobile number');
      return true;
    }),
];

const verifyOtpRules = [
  body('identifier').trim().notEmpty().withMessage('Identifier is required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number'),
];

// ── Helpers ───────────────────────────────────
const isEmail = (s) => /^\S+@\S+\.\S+$/.test(s);
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const dbConnected = () => mongoose.connection.readyState === 1;

// ── Controllers ───────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { identifier: string }   — email or mobile
 */
const sendOtp = [
  ...sendOtpRules,
  handleValidation,
  async (req, res, next) => {
    try {
      const { identifier, name } = req.body;
      const field = isEmail(identifier) ? 'email' : 'mobile';
      let user;

      if (dbConnected()) {
        const User = require('../models/User');
        user = await User.findOne({ [field]: identifier }).select('+otpHash +otpExpiry +otpAttempts');
        if (!user) user = new User({ [field]: identifier, name: name || undefined });
        const otp = generateOtp();
        await user.setOtp(otp);
        await user.save();
        if (field === 'email') {
          try { await sendOtpEmail(identifier, otp, user.name); } catch (e) { console.error('[Email]', e.message); }
        }
        if (process.env.NODE_ENV !== 'production') console.log(`[Dev OTP] ${identifier} → ${otp}`);
        return res.json({
          success: true,
          message: `OTP sent to ${field === 'email' ? 'your email' : 'your mobile number'}`,
          ...(process.env.NODE_ENV !== 'production' && { otp }),
        });
      }

      // ── In-memory mode ──
      user = store.findOrCreateUser(field, identifier, { name: name || null });
      if (name && !user.name) user.name = name;
      const otp = generateOtp();
      await store.setUserOtp(user, otp);

      if (field === 'email') {
        try { await sendOtpEmail(identifier, otp, user.name); } catch (e) { console.error('[Email]', e.message); }
      }
      if (process.env.NODE_ENV !== 'production') console.log(`[Dev OTP] ${identifier} → ${otp}`);

      res.json({
        success: true,
        message: `OTP sent to ${field === 'email' ? 'your email' : 'your mobile number'}`,
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /api/auth/verify-otp
 * Body: { identifier: string, otp: string }
 */
const verifyOtp = [
  ...verifyOtpRules,
  handleValidation,
  async (req, res, next) => {
    try {
      const { identifier, otp, name } = req.body;
      const field = isEmail(identifier) ? 'email' : 'mobile';
      let user;

      if (dbConnected()) {
        const User = require('../models/User');
        user = await User.findOne({ [field]: identifier }).select('+otpHash +otpExpiry +otpAttempts');
        if (!user) return res.status(404).json({ success: false, message: 'User not found. Please request an OTP first.' });
        if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        const valid = await user.verifyOtp(otp);
        if (!valid) {
          user.otpAttempts = (user.otpAttempts || 0) + 1;
          await user.save();
          return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        user.isVerified = true;
        if (name && !user.name) user.name = name;
        user.otpHash = undefined; user.otpExpiry = undefined; user.otpAttempts = 0;
        await user.save();
        const token = signToken(user._id);
        return res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
      }

      // ── In-memory mode ──
      user = store.findUserByField(field, identifier);
      if (!user) return res.status(404).json({ success: false, message: 'User not found. Please request an OTP first.' });
      if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });

      const valid = await store.verifyUserOtp(user, otp);
      if (!valid) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
      }

      user.isVerified = true;
      if (name && !user.name) user.name = name;
      user.otpHash = null; user.otpExpiry = null; user.otpAttempts = 0;

      const token = signToken(user._id);
      res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile } });
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { sendOtp, verifyOtp };

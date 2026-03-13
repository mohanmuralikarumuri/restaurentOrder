const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const store = require('../config/store');

const dbConnected = () => mongoose.connection.readyState === 1;

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (dbConnected()) {
      const User = require('../models/User');
      user = await User.findById(decoded.id).select('-otpHash -otpExpiry -otpAttempts');
    } else {
      user = store.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (dbConnected()) {
        const User = require('../models/User');
        req.user = await User.findById(decoded.id).select('-otpHash -otpExpiry -otpAttempts');
      } else {
        req.user = store.findUserById(decoded.id);
      }
    }
  } catch (_err) {
    // ignore token errors for optional auth
  }
  next();
};

module.exports = { protect, optionalAuth };

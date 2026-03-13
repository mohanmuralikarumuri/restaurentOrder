const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // allow null but enforce uniqueness when present
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

// At least one of email or mobile must be present
userSchema.pre('validate', function (next) {
  if (!this.email && !this.mobile) {
    this.invalidate('email', 'Either email or mobile is required');
  }
  next();
});

// Hash OTP before saving
userSchema.methods.setOtp = async function (plainOtp) {
  const salt = await bcrypt.genSalt(10);
  this.otpHash = await bcrypt.hash(plainOtp, salt);
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpAttempts = 0;
};

userSchema.methods.verifyOtp = async function (plainOtp) {
  if (!this.otpHash || !this.otpExpiry) return false;
  if (new Date() > this.otpExpiry) return false;
  return bcrypt.compare(plainOtp, this.otpHash);
};

module.exports = mongoose.model('User', userSchema);

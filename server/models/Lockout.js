import mongoose from 'mongoose';

const lockoutSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  reason: {
    type: String,
    default: 'Exceeded 5 failed OTP verification attempts'
  },
  lockedUntil: {
    type: Date,
    required: true
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    deviceMac: String,
    location: Object
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically expire lockout document after 24 hours (86400 seconds)
  }
});

export default mongoose.model('Lockout', lockoutSchema);

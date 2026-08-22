import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Otp from '../server/models/Otp.js';
import Lockout from '../server/models/Lockout.js';
import crypto from 'crypto';

dotenv.config();

function hashOtp(otp, salt) {
  return crypto.scryptSync(otp, salt, 64).toString('hex');
}

async function testLockoutAndTelemetry() {
  console.log('=== TESTING 5-ATTEMPT LOCKOUT & TELEMETRY DISPATCH ===\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean previous OTPs and Lockouts for test email
  const testEmail = 'karanankade12@gmail.com';
  await Otp.deleteMany({ email: testEmail });
  await Lockout.deleteMany({ identifier: testEmail });

  // 1. Manually create a known OTP for test email
  const validOtp = '123456';
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOtp(validOtp, salt);

  await Otp.create({
    email: testEmail,
    otpHash,
    salt,
    attempts: 0,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 300000)
  });
  console.log('1. Created seed OTP record (valid: 123456).');

  // 2. Perform 4 failed verification attempts
  for (let i = 1; i <= 4; i++) {
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' })
    }).then(r => r.json());
    console.log(`- Attempt ${i} response:`, res.error);
  }

  // 3. Perform 5th failed verification attempt (Expect Lockout)
  const resFifth = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      otp: '000000',
      clientMeta: {
        platform: 'Win32',
        screen: '1920x1080',
        timezone: 'Asia/Kolkata',
        userAgent: 'Security-Audit-Automated-Runner/1.0'
      }
    })
  });
  const dataFifth = await resFifth.json();
  console.log(`\n2. 5th Attempt (HTTP ${resFifth.status}):`, dataFifth);

  // 4. Verify that a Lockout record exists in MongoDB
  const lockoutRecord = await Lockout.findOne({ identifier: testEmail });
  console.log('\n3. Verified Lockout in DB:', {
    identifier: lockoutRecord?.identifier,
    ip: lockoutRecord?.ip,
    failedAttempts: lockoutRecord?.failedAttempts,
    lockedUntil: lockoutRecord?.lockedUntil,
    deviceMac: lockoutRecord?.deviceInfo?.deviceMac
  });

  // 5. Try requesting a new OTP while locked out (Expect 403 Blocked)
  const resBlockedSendOtp = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const dataBlockedSendOtp = await resBlockedSendOtp.json();
  console.log(`\n4. Requesting OTP during Lockout (HTTP ${resBlockedSendOtp.status}):`, dataBlockedSendOtp);

  // 6. Clean up test lockout record so admin can log in normally
  await Lockout.deleteMany({ identifier: testEmail });
  await Otp.deleteMany({ email: testEmail });
  console.log('\n5. Cleaned test lockout record. Test complete.');

  process.exit(0);
}

testLockoutAndTelemetry();

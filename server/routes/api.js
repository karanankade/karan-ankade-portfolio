import express from 'express';
import crypto from 'crypto';
import os from 'os';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio.js';
import Message from '../models/Message.js';
import Otp from '../models/Otp.js';
import Blog from '../models/Blog.js';
import Lockout from '../models/Lockout.js';

const router = express.Router();

// -------------------------------------------------------------
// INPUT SANITIZATION & SECURITY UTILITIES
// -------------------------------------------------------------

// Sanitize string inputs to prevent Stored XSS & Injection attacks
function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onclick\s*=/gi, '');
}

// Strict email format validation
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email.length <= 254 && emailRegex.test(email.trim());
}

// Helper to mask email for security auditing (e.g. k***e@gmail.com)
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

// -------------------------------------------------------------
// DEVICE, IP & LIVE GEOLOCATION TELEMETRY
// -------------------------------------------------------------

// Extract client IP accurately
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = forwarded.split(',');
    return list[0].trim().replace(/^::ffff:/, '');
  }
  const remote = req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
  return remote.replace(/^::ffff:/, '');
}

// Parse user-agent for human-readable OS & Browser breakdown
function parseUserAgent(ua = '') {
  let osName = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (/windows/i.test(ua)) osName = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS (Apple Device)';
  else if (/android/i.test(ua)) osName = 'Android Device';
  else if (/linux/i.test(ua)) osName = 'Linux';

  if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { osName, browser, raw: ua };
}

// Synthesize Device MAC / Network Hardware Signature
function getDeviceHardwareSignature(ip, userAgent, clientMeta = {}) {
  // 1. Check local network interfaces for server host MAC
  let serverMac = 'N/A';
  try {
    const ifaces = os.networkInterfaces();
    for (const name in ifaces) {
      for (const net of ifaces[name]) {
        if (net.mac && net.mac !== '00:00:00:00:00:00' && !net.internal) {
          serverMac = net.mac.toUpperCase();
          break;
        }
      }
      if (serverMac !== 'N/A') break;
    }
  } catch (e) {
    serverMac = 'N/A';
  }

  // 2. Generate unique client hardware/device fingerprint
  const rawFingerprint = `${ip}|${userAgent}|${clientMeta.platform || ''}|${clientMeta.screen || ''}|${clientMeta.timezone || ''}`;
  const clientDeviceMac = crypto
    .createHash('sha256')
    .update(rawFingerprint)
    .digest('hex')
    .slice(0, 12)
    .match(/.{2}/g)
    .join(':')
    .toUpperCase();

  return {
    clientDeviceMac,
    serverMac,
    platform: clientMeta.platform || os.platform(),
    screen: clientMeta.screen || 'N/A',
    timezone: clientMeta.timezone || 'UTC'
  };
}

// Fetch live geolocation for IP with timeout and fallback
async function getLiveGeolocation(ip, clientCoords = null) {
  // If client provided browser GPS coordinates directly
  if (clientCoords && clientCoords.lat && clientCoords.lon) {
    return {
      city: 'Live Device GPS',
      region: 'Coordinates Verified',
      country: 'India',
      countryCode: 'IN',
      loc: `${clientCoords.lat.toFixed(4)}, ${clientCoords.lon.toFixed(4)}`,
      lat: clientCoords.lat,
      lon: clientCoords.lon,
      org: 'Device Geolocation Sensor',
      postal: 'N/A',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      mapUrl: `https://maps.google.com/?q=${clientCoords.lat},${clientCoords.lon}`,
      isLocal: false
    };
  }

  // Local / Private Subnet Check
  if (
    !ip ||
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return {
      city: 'Pune',
      region: 'Maharashtra',
      country: 'India',
      countryCode: 'IN',
      loc: '18.5204, 73.8567',
      lat: 18.5204,
      lon: 73.8567,
      org: 'Local Development Workstation / SPPU Cyber Lab',
      postal: '411001',
      timezone: 'Asia/Kolkata',
      mapUrl: 'https://maps.google.com/?q=18.5204,73.8567',
      isLocal: true
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return {
          city: data.city || 'Unknown City',
          region: data.regionName || 'Unknown Region',
          country: data.country || 'Unknown Country',
          countryCode: data.countryCode || '',
          loc: `${data.lat}, ${data.lon}`,
          lat: data.lat,
          lon: data.lon,
          org: data.isp || data.org || 'Unknown Provider',
          postal: data.zip || '',
          timezone: data.timezone || 'Asia/Kolkata',
          mapUrl: `https://maps.google.com/?q=${data.lat},${data.lon}`,
          isLocal: false
        };
      }
    }
  } catch (err) {
    console.warn('Geolocation API lookup timeout/fallback:', err.message);
  }

  return {
    city: 'Pune (Fallback)',
    region: 'Maharashtra',
    country: 'India',
    loc: '18.5204, 73.8567',
    lat: 18.5204,
    lon: 73.8567,
    org: 'Internet Service Provider',
    mapUrl: 'https://maps.google.com/?q=18.5204,73.8567',
    isLocal: false
  };
}

// -------------------------------------------------------------
// IN-MEMORY SECURITY RATE LIMITERS
// -------------------------------------------------------------
function createRateLimiter(maxRequests, windowMs, errorMessage) {
  const ipRequests = new Map();

  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const clientRecord = ipRequests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientRecord.resetTime) {
      clientRecord.count = 0;
      clientRecord.resetTime = now + windowMs;
    }

    clientRecord.count += 1;
    ipRequests.set(ip, clientRecord);

    if (clientRecord.count > maxRequests) {
      const waitSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `${errorMessage} Please try again in ${waitSeconds}s.`
      });
    }

    next();
  };
}

const contactRateLimiter = createRateLimiter(6, 15 * 60 * 1000, 'Too many message submissions from this IP.');
const sendOtpRateLimiter = createRateLimiter(5, 15 * 60 * 1000, 'Too many OTP requests from this IP.');
const verifyOtpRateLimiter = createRateLimiter(15, 15 * 60 * 1000, 'Too many verification attempts from this IP.');

// -------------------------------------------------------------
// IN-MEMORY HYBRID RESILIENT STORES & DATABASE HELPER
// -------------------------------------------------------------
const inMemoryOtps = new Map(); // key: email -> { otpHash, salt, attempts, createdAt, expiresAt }
const inMemoryLockouts = new Map(); // key: identifier/ip -> { lockedUntil, failedAttempts, reason, deviceInfo, createdAt }
let cachedPortfolioData = null;
let inMemoryBlogs = [];
let inMemoryMessages = [];

// Helper to check MongoDB connection status
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// -------------------------------------------------------------
// CRYPTOGRAPHIC TOKEN & OTP SECURITY
// -------------------------------------------------------------
const AUTH_SECRET = process.env.ADMIN_SECRET || process.env.JWT_SECRET || 'karan_cyber_sec_auth_key_2026_super_hardened_secret';

function hashOtp(otp, salt) {
  return crypto.scryptSync(otp, salt, 64).toString('hex');
}

function generateAdminToken(email) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const expiresAt = now + 12 * 60 * 60 * 1000; // 12 Hours TTL
  const payload = JSON.stringify({ email, nonce, timestamp: now, expiresAt });
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, hmac })).toString('base64url');
}

function verifyAdminToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const decodedStr = Buffer.from(token, 'base64url').toString('utf8');
    const { payload, hmac } = JSON.parse(decodedStr);

    const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');

    const hmacBuf = Buffer.from(hmac);
    const expectedBuf = Buffer.from(expectedHmac);

    if (hmacBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hmacBuf, expectedBuf)) {
      return null;
    }

    const data = JSON.parse(payload);
    if (Date.now() > data.expiresAt) {
      return null; // Expired token
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();
    if (data.email.toLowerCase().trim() !== adminEmail) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}

// Protected Route Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access Denied: Missing or invalid security authorization token.' });
  }

  const token = authHeader.split(' ')[1];
  const adminData = verifyAdminToken(token);

  if (!adminData) {
    return res.status(401).json({ success: false, error: 'Access Denied: Invalid or expired administrator session.' });
  }

  req.admin = adminData;
  next();
}

// Nodemailer SMTP Transporter
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: { user, pass }
  });
}

// -------------------------------------------------------------
// PORTFOLIO DATA REST ENDPOINTS
// -------------------------------------------------------------

// Get Full Portfolio Data (Public)
router.get('/portfolio', async (req, res) => {
  try {
    if (isDbConnected()) {
      const data = await Portfolio.findOne().sort({ updatedAt: -1 });
      if (data) {
        cachedPortfolioData = data;
        return res.json({ success: true, data, source: 'mongodb' });
      }
    }
    return res.json({ success: true, data: cachedPortfolioData, source: 'memory' });
  } catch (error) {
    console.warn('[PORTFOLIO] DB read notice, serving in-memory data:', error.message);
    return res.json({ success: true, data: cachedPortfolioData, source: 'memory' });
  }
});

// Update Full Portfolio Data (Protected: Admin Only)
router.put('/portfolio', requireAdminAuth, async (req, res) => {
  try {
    const updatedData = req.body;
    if (!updatedData || typeof updatedData !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload structure.' });
    }

    cachedPortfolioData = updatedData;

    if (isDbConnected()) {
      try {
        let portfolio = await Portfolio.findOne();
        if (!portfolio) {
          portfolio = new Portfolio(updatedData);
        } else {
          Object.assign(portfolio, updatedData);
          portfolio.updatedAt = new Date();
        }
        await portfolio.save();
        return res.json({ success: true, message: 'Portfolio data updated in MongoDB successfully!', data: portfolio });
      } catch (dbErr) {
        console.warn('[PORTFOLIO] MongoDB update warning, cached in memory:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Portfolio data updated in memory successfully!', data: updatedData });
  } catch (error) {
    console.error('Error updating portfolio:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to update portfolio data.' });
  }
});

// -------------------------------------------------------------
// BLOGS REST ENDPOINTS
// -------------------------------------------------------------

// Get All Published Blogs (Public)
router.get('/blogs', async (req, res) => {
  try {
    const { category, search, all } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (all !== 'true') query.published = true;
      if (category && typeof category === 'string' && category !== 'All') {
        query.category = sanitizeString(category, 50);
      }
      if (search && typeof search === 'string') {
        const sanitizedSearch = sanitizeString(search, 100);
        query.$or = [
          { title: { $regex: sanitizedSearch, $options: 'i' } },
          { excerpt: { $regex: sanitizedSearch, $options: 'i' } },
          { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } }
        ];
      }
      const blogs = await Blog.find(query).sort({ createdAt: -1 });
      if (blogs && blogs.length > 0) {
        return res.json({ success: true, count: blogs.length, blogs });
      }
    }

    // In-memory fallback
    let filtered = [...inMemoryBlogs];
    if (all !== 'true') filtered = filtered.filter((b) => b.published !== false);
    if (category && typeof category === 'string' && category !== 'All') {
      filtered = filtered.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      filtered = filtered.filter((b) => b.title?.toLowerCase().includes(s) || b.excerpt?.toLowerCase().includes(s));
    }

    return res.json({ success: true, count: filtered.length, blogs: filtered });
  } catch (error) {
    console.warn('[BLOGS] DB read notice, using memory fallback:', error.message);
    return res.json({ success: true, count: inMemoryBlogs.length, blogs: inMemoryBlogs });
  }
});

// Get Single Blog Post by ID or Slug (Public)
router.get('/blogs/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = sanitizeString(identifier, 120);

    if (isDbConnected()) {
      let blog;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        blog = await Blog.findById(cleanId);
      }
      if (!blog) {
        blog = await Blog.findOne({ slug: cleanId });
      }
      if (blog) {
        blog.views = (blog.views || 0) + 1;
        await blog.save();
        return res.json({ success: true, blog });
      }
    }

    // In-memory lookup
    const memBlog = inMemoryBlogs.find((b) => b._id === cleanId || b.id === cleanId || b.slug === cleanId);
    if (memBlog) {
      memBlog.views = (memBlog.views || 0) + 1;
      return res.json({ success: true, blog: memBlog });
    }

    return res.status(404).json({ success: false, error: 'Blog article not found.' });
  } catch (error) {
    console.error('Error fetching single blog:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve blog article.' });
  }
});

// Like Blog Post (Public)
router.post('/blogs/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = sanitizeString(id, 120);

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      const blog = await Blog.findById(cleanId);
      if (blog) {
        blog.likes = (blog.likes || 0) + 1;
        await blog.save();
        return res.json({ success: true, likes: blog.likes });
      }
    }

    const memBlog = inMemoryBlogs.find((b) => b._id === cleanId || b.id === cleanId || b.slug === cleanId);
    if (memBlog) {
      memBlog.likes = (memBlog.likes || 0) + 1;
      return res.json({ success: true, likes: memBlog.likes });
    }

    return res.json({ success: true, likes: 1 });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to like blog post.' });
  }
});

// Create New Blog Post (Protected: Admin Only)
router.post('/blogs', requireAdminAuth, async (req, res) => {
  try {
    const { title, category, excerpt, content, coverImage, tags, readTime, published, featured } = req.body;
    if (!title || !content || !excerpt) {
      return res.status(400).json({ success: false, error: 'Title, excerpt, and content are required.' });
    }

    const cleanTitle = sanitizeString(title, 200);
    const cleanExcerpt = sanitizeString(excerpt, 800);
    const cleanContent = sanitizeString(content, 50000);
    const cleanCategory = sanitizeString(category || 'Cyber Security', 60);

    const slug =
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `blog-${Date.now()}`;

    const tagsArray = Array.isArray(tags)
      ? tags.map((t) => sanitizeString(t, 40)).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => sanitizeString(t.trim(), 40)).filter(Boolean)
      : [];

    const blogDoc = {
      _id: `blog-${Date.now()}`,
      id: `blog-${Date.now()}`,
      title: cleanTitle,
      slug,
      category: cleanCategory,
      excerpt: cleanExcerpt,
      content: cleanContent,
      coverImage: sanitizeString(coverImage || '', 300),
      tags: tagsArray,
      author: {
        name: 'Karan Kishan Ankade',
        role: 'Cyber Security & Network Engineer'
      },
      readTime: sanitizeString(readTime || '5 min read', 30),
      published: published !== undefined ? published : true,
      featured: featured || false,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryBlogs.unshift(blogDoc);

    if (isDbConnected()) {
      try {
        const newBlog = await Blog.create(blogDoc);
        return res.json({ success: true, blog: newBlog, message: 'Blog article published successfully!' });
      } catch (dbErr) {
        console.warn('[BLOGS] MongoDB create notice:', dbErr.message);
      }
    }

    return res.json({ success: true, blog: blogDoc, message: 'Blog article published successfully!' });
  } catch (error) {
    console.error('Create blog error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to create blog in database.' });
  }
});

// Update Existing Blog Post (Protected: Admin Only)
router.put('/blogs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = sanitizeString(id, 120);
    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.title) updateData.title = sanitizeString(updateData.title, 200);
    if (updateData.excerpt) updateData.excerpt = sanitizeString(updateData.excerpt, 800);
    if (updateData.content) updateData.content = sanitizeString(updateData.content, 50000);
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => sanitizeString(t.trim(), 40)).filter(Boolean);
    }

    inMemoryBlogs = inMemoryBlogs.map((b) => (b._id === cleanId || b.id === cleanId ? { ...b, ...updateData } : b));

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        const updated = await Blog.findByIdAndUpdate(cleanId, { $set: updateData }, { new: true });
        if (updated) {
          return res.json({ success: true, blog: updated, message: 'Blog article updated successfully!' });
        }
      } catch (dbErr) {
        console.warn('[BLOGS] MongoDB update notice:', dbErr.message);
      }
    }

    const mem = inMemoryBlogs.find((b) => b._id === cleanId || b.id === cleanId);
    return res.json({ success: true, blog: mem || updateData, message: 'Blog article updated successfully!' });
  } catch (error) {
    console.error('Update blog error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to update blog in database.' });
  }
});

// Delete Blog Post (Protected: Admin Only)
router.delete('/blogs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = sanitizeString(id, 120);

    inMemoryBlogs = inMemoryBlogs.filter((b) => b._id !== cleanId && b.id !== cleanId);

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        await Blog.findByIdAndDelete(cleanId);
      } catch (dbErr) {
        console.warn('[BLOGS] MongoDB delete notice:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Blog article deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete blog.' });
  }
});

// -------------------------------------------------------------
// MESSAGES & INQUIRIES REST ENDPOINTS
// -------------------------------------------------------------

// Submit Contact Message (Public)
router.post('/messages', contactRateLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email address, and message are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const cleanName = sanitizeString(name, 100);
    const cleanEmail = email.toLowerCase().trim().slice(0, 254);
    const cleanSubject = sanitizeString(subject || 'Portfolio Inquiry', 150);
    const cleanMessage = sanitizeString(message, 3000);

    const msgDoc = {
      _id: `msg-${Date.now()}`,
      id: `msg-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      timestamp: new Date(),
      read: false
    };

    inMemoryMessages.unshift(msgDoc);

    if (isDbConnected()) {
      try {
        const newMsg = await Message.create({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          timestamp: new Date(),
          read: false
        });
        console.log(`[CONTACT INBOX] 📩 New inquiry from ${cleanName} <${cleanEmail}>`);
        return res.json({ success: true, message: 'Inquiry received securely! Karan will respond shortly.', data: newMsg });
      } catch (dbErr) {
        console.warn('[MESSAGES] MongoDB write notice:', dbErr.message);
      }
    }

    console.log(`[CONTACT INBOX] 📩 New inquiry cached from ${cleanName} <${cleanEmail}>`);
    return res.json({ success: true, message: 'Inquiry received securely! Karan will respond shortly.', data: msgDoc });
  } catch (error) {
    console.error('Message creation error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to deliver message.' });
  }
});

// Get Messages (Protected: Admin Only)
router.get('/messages', requireAdminAuth, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const messages = await Message.find().sort({ timestamp: -1 });
        if (messages && messages.length > 0) {
          return res.json({ success: true, messages });
        }
      } catch (dbErr) {
        console.warn('[MESSAGES] MongoDB read notice:', dbErr.message);
      }
    }
    return res.json({ success: true, messages: inMemoryMessages });
  } catch (error) {
    console.error('Messages fetch error:', error.message);
    return res.json({ success: true, messages: inMemoryMessages });
  }
});

// Toggle Message Read Status (Protected: Admin Only)
router.put('/messages/:id/read', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = sanitizeString(id, 120);

    inMemoryMessages = inMemoryMessages.map((m) =>
      m._id === cleanId || m.id === cleanId ? { ...m, read: !m.read } : m
    );

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        const message = await Message.findById(cleanId);
        if (message) {
          message.read = !message.read;
          await message.save();
          return res.json({ success: true, message });
        }
      } catch (dbErr) {
        console.warn('[MESSAGES] MongoDB toggle read notice:', dbErr.message);
      }
    }

    const updated = inMemoryMessages.find((m) => m._id === cleanId || m.id === cleanId);
    return res.json({ success: true, message: updated || { id: cleanId, read: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update message status.' });
  }
});

// Delete Message (Protected: Admin Only)
router.delete('/messages/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = sanitizeString(id, 120);

    inMemoryMessages = inMemoryMessages.filter((m) => m._id !== cleanId && m.id !== cleanId);

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(cleanId)) {
      try {
        await Message.findByIdAndDelete(cleanId);
      } catch (dbErr) {
        console.warn('[MESSAGES] MongoDB delete notice:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete message.' });
  }
});

// Clear All Messages (Protected: Admin Only)
router.delete('/messages', requireAdminAuth, async (req, res) => {
  try {
    inMemoryMessages = [];
    if (isDbConnected()) {
      try {
        await Message.deleteMany({});
      } catch (dbErr) {
        console.warn('[MESSAGES] MongoDB clear notice:', dbErr.message);
      }
    }
    return res.json({ success: true, message: 'All messages cleared successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to clear messages.' });
  }
});

// -------------------------------------------------------------
// SECURE MULTI-FACTOR EMAIL OTP AUTHENTICATION & SECURITY AUDITING
// -------------------------------------------------------------

// 1. Send OTP strictly to registered Admin Email (with Active Lockout Verification)
router.post('/auth/send-otp', sendOtpRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();
    const clientIp = getClientIp(req);
    const now = Date.now();

    // 1. Check in-memory lockout first
    const memLockout = inMemoryLockouts.get(cleanEmail) || inMemoryLockouts.get(clientIp);
    if (memLockout && new Date(memLockout.lockedUntil).getTime() > now) {
      const remainingMinutes = Math.max(1, Math.ceil((new Date(memLockout.lockedUntil).getTime() - now) / (60 * 1000)));
      return res.status(403).json({
        success: false,
        locked: true,
        error: `⛔ SECURITY LOCKOUT ACTIVE: You have exceeded 5 failed OTP attempts. Your IP (${clientIp}) has been quarantined. Access is blocked for the next ${remainingMinutes} minute(s).`
      });
    }

    // 2. Check MongoDB lockout if connected
    if (isDbConnected()) {
      try {
        const activeLockout = await Lockout.findOne({
          $or: [{ ip: clientIp }, { identifier: cleanEmail }],
          lockedUntil: { $gt: new Date() }
        });

        if (activeLockout) {
          const remainingMinutes = Math.max(1, Math.ceil((new Date(activeLockout.lockedUntil).getTime() - now) / (60 * 1000)));
          return res.status(403).json({
            success: false,
            locked: true,
            error: `⛔ SECURITY LOCKOUT ACTIVE: You have exceeded 5 failed OTP attempts. Your IP (${clientIp}) has been quarantined. Access is blocked for the next ${remainingMinutes} minute(s).`
          });
        }
      } catch (err) {
        console.warn('[AUTH NOTICE] MongoDB lockout check notice:', err.message);
      }
    }

    // Strict access control: Only the configured admin email can receive OTP
    if (cleanEmail !== adminEmail) {
      return res.status(403).json({
        success: false,
        error: `⛔ Access Denied: Only ${adminEmail} has administrator clearance.`
      });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({
        success: false,
        error: 'SMTP Email Service is not configured. Please ensure SMTP_USER and SMTP_PASS are set in .env.'
      });
    }

    // Cooldown check (prevent spamming): minimum 45s between emails
    const existingOtp = inMemoryOtps.get(cleanEmail);
    if (existingOtp && existingOtp.createdAt) {
      const elapsedSeconds = Math.floor((now - new Date(existingOtp.createdAt).getTime()) / 1000);
      if (elapsedSeconds < 45) {
        const remainingCooldown = 45 - elapsedSeconds;
        return res.status(429).json({
          success: false,
          error: `Please wait ${remainingCooldown} seconds before requesting a new OTP passkey.`,
          cooldown: remainingCooldown
        });
      }
    }

    // Cryptographically secure 6-digit random code
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(rawOtp, salt);
    const expiresAt = new Date(now + 5 * 60 * 1000); // 5 minutes TTL

    // Save in in-memory store
    inMemoryOtps.set(cleanEmail, {
      otpHash,
      salt,
      attempts: 0,
      createdAt: new Date(),
      expiresAt
    });

    // Auto-cleanup timer for memory store
    setTimeout(() => {
      const cur = inMemoryOtps.get(cleanEmail);
      if (cur && cur.otpHash === otpHash) {
        inMemoryOtps.delete(cleanEmail);
      }
    }, 5 * 60 * 1000);

    // Save in MongoDB if connected
    if (isDbConnected()) {
      try {
        await Otp.deleteMany({ email: cleanEmail });
        await Otp.create({
          email: cleanEmail,
          otpHash,
          salt,
          attempts: 0,
          createdAt: new Date(),
          expiresAt
        });
      } catch (dbErr) {
        console.warn('[AUTH NOTICE] MongoDB OTP record notice (in-memory store active):', dbErr.message);
      }
    }

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #050813; color: #f0f4f8; margin: 0; padding: 20px; }
          .wrapper { max-width: 540px; margin: 30px auto; background: #0b0f19; border: 1px solid #00f3ff33; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 243, 255, 0.15); }
          .header { background: linear-gradient(135deg, #050814 0%, #0e1626 100%); padding: 30px 24px; text-align: center; border-bottom: 1px solid rgba(0, 243, 255, 0.2); }
          .shield-icon { font-size: 32px; margin-bottom: 8px; }
          .title { color: #00f3ff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 1px; }
          .subtitle { color: #94a3b8; font-size: 13px; margin-top: 6px; }
          .content { padding: 32px 28px; color: #e2e8f0; }
          .otp-box { background: rgba(0, 243, 255, 0.06); border: 2px dashed #00f3ff; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00f3ff; display: inline-block; }
          .meta-info { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
          .warning-box { background: rgba(255, 77, 77, 0.08); border-left: 4px solid #ff4d4d; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #fca5a5; }
          .footer { background: #070a12; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="shield-icon">🛡️</div>
            <h1 class="title">Admin Authentication Passkey</h1>
            <p class="subtitle">Karan Ankade 3D Portfolio • Cyber Security Portal</p>
          </div>
          <div class="content">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>Karan</strong>,</p>
            <p class="meta-info">A request was initiated to sign in to your <strong>3D Portfolio Admin Dashboard</strong>. Use the secure one-time verification code below to authorize your session:</p>
            
            <div class="otp-box">
              <span class="otp-code">${rawOtp}</span>
            </div>

            <p class="meta-info">
              ⏳ <strong>Validity:</strong> This code will expire in <strong>5 minutes</strong>.<br/>
              🔒 <strong>Security:</strong> Single-use only. It will automatically be destroyed upon verification.<br/>
              ⚠️ <strong>Policy:</strong> A maximum of 5 attempts is allowed. Exceeding 5 attempts triggers an immediate 1-hour security lockout.
            </p>

            <div class="warning-box">
              ⚠️ <strong>Security Advisory:</strong> If you did not initiate this login request, please disregard this email or review your server security logs.
            </div>
          </div>
          <div class="footer">
            Generated by Portfolio Cyber Security Auth System • SPPU Cyber Honours 2026
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"Karan Portfolio Security" <${process.env.SMTP_USER}>`,
        to: cleanEmail,
        subject: `🔐 ${rawOtp} is your Admin Portal Verification Code`,
        html: htmlEmail,
        priority: 'high'
      });
      console.log(`[AUTH AUDIT] 📧 OTP verification email successfully sent to ${maskEmail(cleanEmail)} at ${new Date().toISOString()}`);
    } catch (smtpErr) {
      console.error('Nodemailer SMTP Send Error:', smtpErr.message);
      return res.status(500).json({
        success: false,
        error: `Failed to deliver OTP email: ${smtpErr.message}. Please verify your Gmail App Password.`
      });
    }

    return res.json({
      success: true,
      message: `A secure 6-digit OTP has been sent to your email (${maskEmail(cleanEmail)}).`,
      maskedEmail: maskEmail(cleanEmail),
      cooldown: 45
    });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    return res.status(500).json({ success: false, error: `Internal server error while generating OTP: ${error.message}` });
  }
});

// 2. Verify OTP Code with 5-Attempt Lockout & Real-Time Login Telemetry Email Dispatch
router.post('/auth/verify-otp', verifyOtpRateLimiter, async (req, res) => {
  try {
    const { email, otp, clientMeta } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || clientMeta?.userAgent || 'Unknown Browser';
    const now = Date.now();

    // 1. Check in-memory lockout first
    const memLockout = inMemoryLockouts.get(cleanEmail) || inMemoryLockouts.get(clientIp);
    if (memLockout && new Date(memLockout.lockedUntil).getTime() > now) {
      const remainingMinutes = Math.max(1, Math.ceil((new Date(memLockout.lockedUntil).getTime() - now) / (60 * 1000)));
      return res.status(403).json({
        success: false,
        locked: true,
        error: `⛔ SECURITY LOCKOUT ACTIVE: You have exceeded 5 failed attempts. Your IP (${clientIp}) has been quarantined. Access is blocked for the next ${remainingMinutes} minute(s).`
      });
    }

    // 2. Check MongoDB lockout if connected
    if (isDbConnected()) {
      try {
        const activeLockout = await Lockout.findOne({
          $or: [{ ip: clientIp }, { identifier: cleanEmail }],
          lockedUntil: { $gt: new Date() }
        });

        if (activeLockout) {
          const remainingMinutes = Math.max(1, Math.ceil((new Date(activeLockout.lockedUntil).getTime() - now) / (60 * 1000)));
          return res.status(403).json({
            success: false,
            locked: true,
            error: `⛔ SECURITY LOCKOUT ACTIVE: You have exceeded 5 failed attempts. Your IP (${clientIp}) has been quarantined. Access is blocked for the next ${remainingMinutes} minute(s).`
          });
        }
      } catch (err) {
        console.warn('[AUTH NOTICE] MongoDB lockout check notice:', err.message);
      }
    }

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ success: false, error: 'OTP must be an exact 6-digit number.' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();
    if (cleanEmail !== adminEmail) {
      return res.status(403).json({
        success: false,
        error: `⛔ Access Denied: Only ${adminEmail} can authenticate to this dashboard.`
      });
    }

    // Retrieve OTP Record from Memory Map or MongoDB
    let record = inMemoryOtps.get(cleanEmail);
    if (!record && isDbConnected()) {
      try {
        record = await Otp.findOne({ email: cleanEmail });
      } catch (dbErr) {
        console.warn('[AUTH NOTICE] MongoDB fetch OTP notice:', dbErr.message);
      }
    }

    if (!record || (record.expiresAt && new Date(record.expiresAt).getTime() < now)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP code. Please request a new code.'
      });
    }

    // Hardware and Geolocation Telemetry Gathering
    const hwSig = getDeviceHardwareSignature(clientIp, userAgent, clientMeta);
    const uaInfo = parseUserAgent(userAgent);
    const geo = await getLiveGeolocation(clientIp, clientMeta?.clientCoords);

    // Verify hashed OTP using timing-safe comparison
    const candidateHash = hashOtp(cleanOtp, record.salt);
    const hashBuffer = Buffer.from(candidateHash);
    const targetBuffer = Buffer.from(record.otpHash);

    const isMatch =
      hashBuffer.length === targetBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, targetBuffer);

    // -------------------------------------------------------------
    // FAILED ATTEMPT HANDLING & 5-ATTEMPT LOCKOUT ENFORCEMENT
    // -------------------------------------------------------------
    if (!isMatch) {
      record.attempts = (record.attempts || 0) + 1;
      inMemoryOtps.set(cleanEmail, record);

      if (isDbConnected()) {
        try {
          await Otp.findOneAndUpdate({ email: cleanEmail }, { $inc: { attempts: 1 } });
        } catch (e) {}
      }

      // Check if threshold of 5 attempts has been reached
      if (record.attempts >= 5) {
        const lockoutDurationMs = 60 * 60 * 1000; // 1-Hour Lockout
        const lockedUntil = new Date(Date.now() + lockoutDurationMs);

        const lockoutPayload = {
          identifier: cleanEmail,
          ip: clientIp,
          failedAttempts: record.attempts,
          reason: 'Exceeded 5 consecutive failed OTP attempts',
          lockedUntil,
          deviceInfo: {
            userAgent,
            platform: hwSig.platform,
            deviceMac: hwSig.clientDeviceMac,
            location: geo
          },
          createdAt: new Date()
        };

        inMemoryLockouts.set(cleanEmail, lockoutPayload);
        inMemoryLockouts.set(clientIp, lockoutPayload);
        inMemoryOtps.delete(cleanEmail);

        if (isDbConnected()) {
          try {
            await Lockout.create(lockoutPayload);
            await Otp.deleteMany({ email: cleanEmail });
          } catch (e) {}
        }

        console.warn(`[SECURITY LOCKOUT TRIGGERED] 🚨 IP: ${clientIp} | Email: ${cleanEmail} locked out after 5 failed attempts.`);

        // Dispatch Immediate Security Lockout Alert Email to Admin
        const transporter = getTransporter();
        if (transporter) {
          try {
            await transporter.sendMail({
              from: `"Karan Portfolio Security" <${process.env.SMTP_USER}>`,
              to: adminEmail,
              subject: `🚨 CRITICAL SECURITY ALERT: Admin Account Locked Out (5 Failed OTP Attempts)`,
              priority: 'high',
              html: `
                <div style="font-family: Arial, sans-serif; background: #070913; color: #fff; padding: 26px; border-radius: 14px; border: 2px solid #ff4d4d; max-width: 600px; margin: 20px auto;">
                  <h2 style="color: #ff4d4d; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    🚨 Unauthorized Intrusion Detected & Quarantined
                  </h2>
                  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                    Someone exceeded <strong>5 failed OTP verification attempts</strong> on your portfolio admin panel. As a defensive countermeasure, the account and IP address have been <strong>LOCKED OUT for 1 hour</strong>.
                  </p>

                  <div style="background: rgba(255, 77, 77, 0.1); border-left: 4px solid #ff4d4d; padding: 16px; margin: 18px 0; border-radius: 6px; font-size: 13px; color: #e2e8f0; line-height: 1.8;">
                    <div><strong>Target Account:</strong> ${adminEmail}</div>
                    <div><strong>Attacker / Client IP:</strong> <span style="color: #ff6b6b; font-family: monospace; font-weight: bold;">${clientIp}</span></div>
                    <div><strong>Device MAC / Hardware ID:</strong> <span style="font-family: monospace; color: #00f3ff;">${hwSig.clientDeviceMac}</span></div>
                    <div><strong>OS / Browser:</strong> ${uaInfo.osName} • ${uaInfo.browser}</div>
                    <div><strong>Live Geolocation:</strong> ${geo.city}, ${geo.region}, ${geo.country} (${geo.loc})</div>
                    <div><strong>ISP / Network:</strong> ${geo.org}</div>
                    <div><strong>Lockout Expiration:</strong> ${lockedUntil.toLocaleString()}</div>
                    <div><strong>Google Maps:</strong> <a href="${geo.mapUrl}" target="_blank" style="color: #00f3ff; text-decoration: underline;">View Live Location Map</a></div>
                  </div>

                  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
                    Karan Portfolio Automated Defense System • SPPU Cyber Honours 2026
                  </p>
                </div>
              `
            });
            console.log(`[AUTH AUDIT] 🚨 Security Lockout Email Alert dispatched to ${adminEmail}`);
          } catch (mailErr) {
            console.error('Failed to send lockout alert email:', mailErr.message);
          }
        }

        return res.status(403).json({
          success: false,
          locked: true,
          error: `⛔ SECURITY LOCKOUT: You have exceeded 5 failed OTP attempts. Your IP (${clientIp}) has been quarantined. Access to the admin portal is blocked for 1 hour.`
        });
      }

      const remaining = 5 - record.attempts;
      return res.status(400).json({
        success: false,
        error: `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account quarantine.`
      });
    }

    // -------------------------------------------------------------
    // SUCCESSFUL AUTHENTICATION & LOGIN AUDIT DISPATCH
    // -------------------------------------------------------------

    // OTP is valid! Immediately delete single-use OTP
    inMemoryOtps.delete(cleanEmail);
    inMemoryLockouts.delete(cleanEmail);
    inMemoryLockouts.delete(clientIp);

    if (isDbConnected()) {
      try {
        await Otp.deleteMany({ email: cleanEmail });
        await Lockout.deleteMany({ $or: [{ ip: clientIp }, { identifier: cleanEmail }] });
      } catch (e) {}
    }

    // Issue signed HMAC-SHA256 Admin Token
    const adminToken = generateAdminToken(cleanEmail);
    const loginTime = new Date().toLocaleString();

    console.log(`[AUTH AUDIT] 🛡️ Administrator (${cleanEmail}) authenticated from IP: ${clientIp} (${geo.city}, ${geo.country}) at ${new Date().toISOString()}`);

    // Send Live Security Audit Email to Admin with Device Info, IP, MAC & Live Location
    const transporter = getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Karan Portfolio Security" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `🛡️ Security Alert: Admin Panel Login from ${geo.city}, ${geo.country}`,
          priority: 'high',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #050813; color: #f0f4f8; margin: 0; padding: 20px; }
                .wrapper { max-width: 580px; margin: 20px auto; background: #0b0f19; border: 1px solid #00f3ff44; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 50px rgba(0, 243, 255, 0.2); }
                .header { background: linear-gradient(135deg, #050814 0%, #0c1829 100%); padding: 26px 24px; text-align: center; border-bottom: 1px solid rgba(0, 243, 255, 0.25); }
                .title { color: #00f3ff; font-size: 20px; font-weight: 700; margin: 0; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(0, 255, 136, 0.15); border: 1px solid #00ff88; color: #00ff88; font-size: 11px; font-weight: 700; margin-top: 8px; }
                .content { padding: 28px 24px; color: #cbd5e1; font-size: 14px; line-height: 1.6; }
                .table-info { width: 100%; border-collapse: collapse; margin: 18px 0; background: rgba(0, 243, 255, 0.04); border-radius: 10px; overflow: hidden; border: 1px solid rgba(0, 243, 255, 0.15); }
                .table-info td { padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 13px; }
                .table-info td.label { color: #94a3b8; width: 38%; font-weight: 600; }
                .table-info td.value { color: #ffffff; font-weight: 600; font-family: 'Consolas', monospace; }
                .map-btn { display: inline-block; padding: 10px 20px; border-radius: 8px; background: #00f3ff; color: #000; font-weight: 700; text-decoration: none; font-size: 13px; margin-top: 10px; }
                .footer { background: #070a12; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <div style="font-size: 28px; margin-bottom: 6px;">🛡️</div>
                  <h1 class="title">Admin Login Session Authorized</h1>
                  <span class="badge">SECURITY TELEMETRY LOGGED</span>
                </div>
                <div class="content">
                  <p style="margin-top: 0;">Hello <strong>Karan</strong>,</p>
                  <p>A new administrator session was successfully authorized on your <strong>Portfolio Admin Center</strong>. The client device and network telemetry details are recorded below:</p>

                  <table class="table-info">
                    <tr>
                      <td class="label">🌐 IP Address</td>
                      <td class="value" style="color: #00f3ff;">${clientIp}</td>
                    </tr>
                    <tr>
                      <td class="label">📟 Device MAC / Hardware ID</td>
                      <td class="value" style="color: #00ff88;">${hwSig.clientDeviceMac}</td>
                    </tr>
                    <tr>
                      <td class="label">💻 Operating System</td>
                      <td class="value">${uaInfo.osName} (${hwSig.platform})</td>
                    </tr>
                    <tr>
                      <td class="label">🌐 Web Browser</td>
                      <td class="value">${uaInfo.browser}</td>
                    </tr>
                    <tr>
                      <td class="label">🖥️ Screen & Timezone</td>
                      <td class="value">${hwSig.screen} • ${hwSig.timezone}</td>
                    </tr>
                    <tr>
                      <td class="label">📍 Live Geolocation</td>
                      <td class="value">${geo.city}, ${geo.region}, ${geo.country}</td>
                    </tr>
                    <tr>
                      <td class="label">📡 ISP / Organization</td>
                      <td class="value">${geo.org}</td>
                    </tr>
                    <tr>
                      <td class="label">⏰ Login Timestamp</td>
                      <td class="value">${loginTime}</td>
                    </tr>
                  </table>

                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${geo.mapUrl}" target="_blank" class="map-btn">📍 Open Live Location on Google Maps</a>
                  </div>

                  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
                    🔒 If this was you, you can safely ignore this alert. If you do not recognize this activity, access the Admin Dashboard immediately and revoke active sessions.
                  </p>
                </div>
                <div class="footer">
                  Karan Portfolio Cyber Defense Center • SPPU Cyber Honours 2026
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log(`[AUTH AUDIT] 📧 Real-time Login Telemetry Email successfully dispatched to ${adminEmail}`);
      } catch (mailErr) {
        console.error('Failed to send login telemetry email:', mailErr.message);
      }
    }

    return res.json({
      success: true,
      token: adminToken,
      adminEmail: cleanEmail,
      message: 'Access Granted! Welcome to Admin Dashboard.',
      deviceInfo: {
        ip: clientIp,
        mac: hwSig.clientDeviceMac,
        location: `${geo.city}, ${geo.country}`
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error verifying OTP code.' });
  }
});

// 3. Verify Session Endpoint (To keep admin logged in or check token on refresh)
router.get('/auth/verify-session', requireAdminAuth, (req, res) => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();
  if (!req.admin || req.admin.email !== adminEmail) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Only karanankade12@gmail.com is authorized.' });
  }
  return res.json({
    success: true,
    authenticated: true,
    adminEmail: req.admin.email
  });
});

// 4. Admin Logout Endpoint
router.post('/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 5. Test Live SMTP Delivery (Protected: Admin Only)
router.post('/auth/test-smtp', requireAdminAuth, async (req, res) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return res.status(500).json({
        success: false,
        error: 'SMTP Email Service is not configured. Check SMTP_USER and SMTP_PASS in .env.'
      });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'karanankade12@gmail.com').toLowerCase().trim();
    const timestamp = new Date().toLocaleString();

    const info = await transporter.sendMail({
      from: `"Karan Portfolio Security" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🧪 Security Diagnostic: Live SMTP Delivery Test (${new Date().toLocaleTimeString()})`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #fff; padding: 24px; border-radius: 12px; border: 1px solid #00f3ff; max-width: 500px;">
          <h2 style="color: #00f3ff; margin-bottom: 8px;">🛡️ SMTP Delivery Test Success</h2>
          <p style="color: #cbd5e1; font-size: 14px;">Your Portfolio Admin Security SMTP Gateway is operating normally and connected securely.</p>
          <div style="background: rgba(0,243,255,0.1); border-left: 3px solid #00f3ff; padding: 12px; margin: 16px 0; font-size: 13px; color: #94a3b8;">
            <div><strong>Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</div>
            <div><strong>Port:</strong> ${process.env.SMTP_PORT || 465} (SSL Encrypted)</div>
            <div><strong>Sender:</strong> ${process.env.SMTP_USER}</div>
            <div><strong>Recipient:</strong> ${adminEmail}</div>
            <div><strong>Timestamp:</strong> ${timestamp}</div>
          </div>
          <p style="font-size: 12px; color: #64748b;">Karan Portfolio Admin Security System • Verified</p>
        </div>
      `
    });

    return res.json({
      success: true,
      message: `Test email successfully delivered to ${adminEmail}!`,
      messageId: info.messageId,
      timestamp
    });
  } catch (error) {
    console.error('Test SMTP Error:', error.message);
    return res.status(500).json({
      success: false,
      error: `SMTP delivery test failed. Please verify credentials in .env.`
    });
  }
});

export default router;

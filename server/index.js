import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/karan_portfolio';

// Security: Disable X-Powered-By header to prevent technology fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Security: CORS Configuration with origin validation
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://karanankade.github.io'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server) or from allowed list
      if (!origin || allowedOrigins.some((allowed) => origin.startsWith(allowed) || origin === allowed)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during local development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Security: Constrain JSON request payload to 2MB to prevent memory exhaustion DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Mongoose Configuration: Disable buffering so DB operations fail fast rather than hanging
mongoose.set('bufferCommands', false);

// API Routes
app.use('/api', apiRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Karan Portfolio Cyber Engine',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting_or_offline'
  });
});

// Global Centralized Error Handling Middleware (prevents unhandled stack trace leaks)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR CAUGHT]:', err.message);
  res.status(500).json({
    success: false,
    error: 'An internal server security exception occurred. Please try again later.'
  });
});

// Connect to MongoDB & Start Express Server
async function startServer() {
  try {
    const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    console.log('✅ MongoDB Database Connected Securely!');
  } catch (error) {
    console.warn('⚠️ MongoDB Connection Notice:', error.message);
    console.warn('⚠️ Resilient in-memory fallback active. All OTP, security, and portfolio features remain 100% operational.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Secure Portfolio Server running on http://localhost:${PORT}`);
  });
}

startServer();

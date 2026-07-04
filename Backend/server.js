const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later' }
});

app.use(globalLimiter);

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// CORS — open in development (Expo Go / physical devices use LAN IPs that change)
//         restrict in production via CORS_ORIGIN env var
const corsOptions = process.env.NODE_ENV === 'production'
  ? {
      origin: (origin, callback) => {
        const allowed = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS: origin not allowed'));
        }
      },
      credentials: true,
    }
  : {
      origin: true,   // reflect any origin — safe for local dev only
      credentials: true,
    };

app.use(cors(corsOptions));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ─── FCM Token Registration ──────────────────────────────────────────────────
// Lightweight endpoint to save/update the user's FCM device token
const { protect } = require('./middleware/authMiddleware');
const User = require('./models/userModel');

app.post('/api/users/fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken is required' });
    }
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.status(200).json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RePlate API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  // Handle multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }

  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
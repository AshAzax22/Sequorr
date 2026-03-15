require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const waitlistRoutes = require('./routes/waitlist');
const blogRoutes = require('./routes/blog');
const tagsRoutes = require('./routes/tags');
const racesRoutes = require('./routes/races');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const findrRateLimiter = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');


// ── App setup ────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing ──────────────────────
app.use(helmet());

// CORS — restrict to allowed origins if configured
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];
app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin(origin, cb) {
            // Allow requests with no origin (mobile, curl, etc.)
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            cb(new Error('Not allowed by CORS'));
          },
        }
      : {}
  )
);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));

// ── Rate limiters ───────────────────────────
// app.use('/api/waitlist', signupLimiter);

// app.use('/api/contact', contactLimiter);

// Findr race endpoints (100 req / 15 min per IP)
app.use('/api/races', findrRateLimiter);
app.use('/api/race', findrRateLimiter);

// ── Routes ──────────────────────────────────
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/races', racesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/race', racesRoutes);  // single-race route mounts on /api/race/:raceId

// Health-check (single consistent shape)
const healthResponse = { success: true, message: 'Sequorr API is running 🚀' };
app.get('/api/health', (_req, res) => res.json(healthResponse));
app.get('/health', (_req, res) => res.json(healthResponse));

// 404 catch-all
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Error handler (must be last) ────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────
let server;
const start = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`🚀 Sequorr API running on http://localhost:${PORT}`);
  });
};

// ── Graceful shutdown ───────────────────────
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully…`);
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
    // Force close after 10s
    setTimeout(() => process.exit(1), 10000);
  } else {
    process.exit(0);
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

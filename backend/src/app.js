require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./db/connect');
const seed       = require('./db/seed');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const journalRoutes = require('./routes/journals');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/journals', journalRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'mongodb' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Эндпоинт не найден' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// ── Start ────────────────────────────────────────────────────────
(async () => {
  await connectDB();
  await seed();
  app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
})();

module.exports = app;

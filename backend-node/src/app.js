require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { errorHandler } = require('./utils/errors');

const irrigationRoutes = require('./routes/irrigation.routes');
const cropsRoutes = require('./routes/crops.routes');
const yieldRoutes = require('./routes/yield.routes');
const pestRoutes = require('./routes/pest.routes');
const chatRoutes = require('./routes/chat.routes');
const weatherRoutes = require('./routes/weather.routes');
const marketRoutes = require('./routes/market.routes');
const assistantRoutes = require('./routes/assistant.routes');
const schemesRoutes = require('./routes/schemes.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CORS_ORIGIN,
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, allowedOrigins[0]);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'agritech-api' });
});

app.use(`${config.apiPrefix}/irrigation`, irrigationRoutes);
app.use(`${config.apiPrefix}/crops`, cropsRoutes);
app.use(`${config.apiPrefix}/yield`, yieldRoutes);
app.use(`${config.apiPrefix}/pests`, pestRoutes);
app.use(`${config.apiPrefix}/chat`, chatRoutes);
app.use(`${config.apiPrefix}/weather`, weatherRoutes);
app.use(`${config.apiPrefix}/market`, marketRoutes);
app.use(`${config.apiPrefix}/assistant`, assistantRoutes);
app.use(`${config.apiPrefix}/schemes`, schemesRoutes);

app.use((_req, _res, next) => {
  next({ statusCode: 404, message: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err.statusCode === 404) {
    return res.status(404).json({ error: err.message || 'Not found' });
  }
  errorHandler(err, req, res, next);
});

module.exports = app;

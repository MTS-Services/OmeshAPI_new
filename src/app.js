/**
 * Main Express application setup
 * Configures middleware, routes, and error handling
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('./config');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { responseFormatter } = require('./middlewares/responseFormatter');

// Routes
const routes = require('./routes');
const updateExpiredEvents = require('./utils/cronJobs');
const app = express();
const API_PREFIX = '/api/v1';

const captureRawBody = (req, res, buffer) => {
  if (buffer?.length) {
    req.rawBody = Buffer.from(buffer);
  }
};

// const uploadsPath = path.join(__dirname, '..', 'uploads');
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));
// Trust proxy for production deployment
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// CORS configuration
app.use(
  cors({
    origin:
      config.nodeEnv === 'production'
        ? config.allowedOrigins
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'https://omesh.maktechgroup.tech',
            'https://enduraevents.com',
            'http://localhost:3001',
          ],
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb', verify: captureRawBody }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
    verify: captureRawBody,
  }),
);

// Logging middleware
// Custom Morgan tokens for colorized logging
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  let color;
  if (status >= 500)
    color = 31; // Red
  else if (status >= 400)
    color = 33; // Yellow
  else if (status >= 300)
    color = 36; // Cyan
  else if (status >= 200)
    color = 32; // Green
  else color = 0; // Default
  return `\x1b[${color}m${status}\x1b[0m`;
});

morgan.token('method-colored', (req, res) => {
  const method = req.method;
  const methodColors = {
    GET: 32, // Green
    POST: 34, // Blue
    PUT: 33, // Yellow
    DELETE: 31, // Red
    PATCH: 35, // Magenta
  };
  const color = methodColors[method] || 37; // White default

  return `\x1b[${color}m${method}\x1b[0m`;
});

// Custom date token: DD/MM/YYYY HH:mm:ss
morgan.token('local-date', () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const HH = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${HH}:${min}:${ss}`;
});

// Optimized logging format
app.use(
  morgan(
    '[:local-date] :method-colored :status-colored :url | :response-time ms',
  ),
);

// Global response formatter
app.use(responseFormatter);

// base endpoint
app.get('/', (req, res) => {
  res.formatResponse(
    {
      version: '1.0.0',
      name: ' Omesh API',
      description: 'RESTful API for Omesh event management platform',
      author: 'Nayem Islam',
      contact: {
        email: 'inaeem707@gmail.com',
        portfolio: 'https://nayem-490.vercel.app',
      },
    },
    'API is running',
    200,
  );
});

// API routes

app.use(API_PREFIX, routes);

updateExpiredEvents();

// Catch 404 and forward to error handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;

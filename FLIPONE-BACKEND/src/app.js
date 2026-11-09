// src/app.js — the Express app, without the DB connection or listen() so tests can import it.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import centralizedRoute from './routes/CentralizedRoute.js';
import logger from './services/logger.js';
import { errorHandler, notFound } from './middlewares/ErrorMiddleware.js';
import { uploadsDir } from './utils/FileUploads.js';

// CORS_ORIGIN is a comma-separated allow-list. Without it, development allows any localhost port
// (Vite moves to 5174+ when 5173 is taken) and production allows no cross-origin browser calls.
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production'
    ? false
    : LOCALHOST_ORIGIN;

const app = express();

app.disable('x-powered-by');
// Behind a proxy (Render, Nginx, …) the rate limiter needs the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

// The frontend runs on another origin and loads /uploads images, so allow cross-origin reads of resources.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: () => process.env.NODE_ENV === 'test',
  }),
);

// Uploaded images. nosniff (from helmet) stops a browser treating them as anything but their type.
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', index: false }));

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api', centralizedRoute);

app.use(notFound);
app.use(errorHandler);

export default app;

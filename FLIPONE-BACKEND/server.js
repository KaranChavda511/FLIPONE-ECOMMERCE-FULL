// server.js — entry point. Env vars come from `node --env-file-if-exists=.env` (see package.json), no dotenv.
import mongoose from 'mongoose';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/services/logger.js';
import { assertMailConfig } from './src/services/mailer.js';

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(`Missing required env vars: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

try {
  assertMailConfig();
} catch (error) {
  logger.error(`${error.message}. See "Email" in .env.example.`);
  process.exit(1);
}

const port = Number(process.env.PORT) || 5000;

try {
  await connectDB();
} catch {
  process.exit(1);
}

const server = app.listen(port, () => {
  logger.info(`Server is running at port: ${port}`);
});

// Finish in-flight requests and close the DB pool on Ctrl+C / container stop.
const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

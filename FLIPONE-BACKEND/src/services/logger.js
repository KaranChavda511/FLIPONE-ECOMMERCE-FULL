// src/services/logger.js
import path from 'node:path';
import fs from 'node:fs';
import winston from 'winston';
import 'winston-daily-rotate-file';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// logs/ at the project root (import.meta.dirname is native since Node 20.11).
const logDirectory = path.resolve(import.meta.dirname, '../../logs');

const { combine, timestamp, errors, printf, json, colorize } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, label, service: _service, ...meta }) => {
    const tag = label ? ` [${label}]` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}${tag}: ${stack || message}${extra}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [];

if (!isTest) {
  fs.mkdirSync(logDirectory, { recursive: true });
  // Daily rotated files only (the old fixed error.log/combined.log grew forever and duplicated these).
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, '%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, '%DATE%-error.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    }),
  );
}

transports.push(
  new winston.transports.Console({
    format: isProduction ? prodFormat : devFormat,
    silent: isTest,
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'http' : 'debug'),
  defaultMeta: { service: 'flipone-backend' },
  transports,
});

export default logger;

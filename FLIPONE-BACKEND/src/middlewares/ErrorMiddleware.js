import mongoose from 'mongoose';
import multer from 'multer';
import logger from '../services/logger.js';
import { discardUploads } from '../utils/FileUploads.js';

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'File size too large. Please upload a file less than 5MB',
  LIMIT_FILE_COUNT: 'Too many files. Maximum 5 images allowed',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field or too many files',
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `The page or resource is Not Found - ${req.originalUrl}`,
  });
};

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars -- Express needs the 4-argument signature
export const errorHandler = async (err, req, res, next) => {
  // Don't keep files from a request that failed.
  if (req.file || req.files?.length) await discardUploads(req.files ?? [req.file]);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: MULTER_MESSAGES[err.code] ?? 'Error while uploading files' });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}` });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }

  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed: ${err.message}`, { stack: err.stack });
  }
  // Never echo internal error text to the client for 5xx, unless the error was written for the client (expose).
  res.status(status).json({
    success: false,
    message: status >= 500 && !err.expose ? 'Internal Server Error' : err.message,
    ...(err.details && typeof err.details === 'object' ? err.details : {}),
  });
};

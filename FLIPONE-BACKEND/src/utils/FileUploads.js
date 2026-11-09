import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { MAX_PRODUCT_IMAGES } from '../models/Product.js';
import { HttpError } from './helpers.js';

export const uploadsDir = path.resolve('public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// The extension comes from the validated MIME type, never from the client's filename:
// "evil.html" sent as image/png used to be saved and served as .html (stored XSS).
const EXTENSION_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'profileImage' ? 'profile' : 'product';
    const role = req.account?.role ?? 'unknown';
    cb(null, `${prefix}-${role}-${Date.now()}-${randomUUID()}${EXTENSION_BY_MIME[file.mimetype]}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!EXTENSION_BY_MIME[file.mimetype]) {
    return cb(new HttpError(400, 'Invalid file type. Only JPEG/PNG/WEBP allowed'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_PRODUCT_IMAGES, fields: 20 },
});

export const profileImageUpload = upload.single('profileImage');
export const productImageUpload = upload.array('images', MAX_PRODUCT_IMAGES);

export const toPublicPath = (file) => `/uploads/${file.filename}`;

/** Best-effort delete of an uploaded file from its public path or URL. Ignores anything outside uploads/. */
export const removeUpload = async (publicPathOrUrl) => {
  if (!publicPathOrUrl) return;
  const filename = path.basename(publicPathOrUrl);
  try {
    await fs.promises.unlink(path.join(uploadsDir, filename));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

/** Deletes files multer already wrote, when the request then fails. */
export const discardUploads = (files = []) => Promise.allSettled(files.map((file) => removeUpload(file.filename)));

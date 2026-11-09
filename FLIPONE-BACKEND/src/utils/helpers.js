import mongoose from 'mongoose';

/** User input → a safe case-insensitive regex (RegExp.escape is native since Node 24). Stops ReDoS / regex injection. */
export const searchRegex = (text) => new RegExp(RegExp.escape(String(text).trim().slice(0, 100)), 'i');

export const isValidId = (id) => mongoose.isValidObjectId(id);

/** ?page=&limit= → { page, limit, skip }, clamped. */
export const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

/** Error with an HTTP status, picked up by the global error handler. */
export class HttpError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message  shown to the client (for 5xx only when `expose` is true)
   * @param {{ details?: object, expose?: boolean }} [options]  `details` are added to the JSON body (e.g. retryAfter)
   */
  constructor(statusCode, message, { details, expose = false } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.expose = expose;
  }
}

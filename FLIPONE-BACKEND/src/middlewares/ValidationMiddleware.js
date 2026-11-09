import logger from '../services/logger.js';
import * as validation from '../services/Validation.js';

const validationLogger = logger.child({ label: 'middlewares/ValidationMiddleware.js' });

/**
 * validator('userSchemas.login') validates req.body with that Joi schema.
 * The cleaned value (unknown keys stripped, types converted) replaces req.body and is also
 * kept as req.validatedData, so controllers can never read unvalidated fields.
 * The schema is resolved once at startup, so a typo'd name fails fast instead of on first request.
 */
export const validator = (schemaName) => {
  const [group, key] = schemaName.split('.');
  const schema = validation[group]?.[key];
  if (!schema) throw new Error(`Validation schema "${schemaName}" not found`);

  return async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req.body ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      req.body = value;
      req.validatedData = value;
      next();
    } catch (err) {
      if (!err.isJoi) return next(err);

      const errors = err.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]+/g, ''),
      }));
      // Field names only. The old code logged the raw body, which put plaintext passwords in the logs.
      validationLogger.warn(`Validation failed for ${schemaName}`, { fields: errors.map((e) => e.field) });
      res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
  };
};

// src/services/Validation.js — Joi schemas, looked up by name via validator('group.key').
import Joi from 'joi';

const baseMessages = {
  'any.required': '{#label} is required',
  'string.base': '{#label} must be text',
  'number.base': '{#label} must be a number',
  'array.base': '{#label} must be an array',
};

const objectId = Joi.string().hex().length(24).messages({ 'string.length': 'Invalid id', 'string.hex': 'Invalid id' });

/** Accepts ["a","b"], '["a","b"]' (multipart forms send JSON strings) or "a, b". Lower-cases, trims, de-duplicates. */
const stringList = ({ max = 50 } = {}) =>
  Joi.any()
    .custom((value, helpers) => {
      let list = value;
      if (typeof value === 'string') {
        const text = value.trim();
        if (text.startsWith('[')) {
          try {
            list = JSON.parse(text);
          } catch {
            return helpers.error('list.invalid');
          }
        } else {
          list = text ? text.split(',') : [];
        }
      }
      if (!Array.isArray(list) || list.some((item) => typeof item !== 'string')) return helpers.error('list.invalid');
      const cleaned = [...new Set(list.map((item) => item.trim().toLowerCase()).filter(Boolean))];
      if (cleaned.length > max) return helpers.error('list.max', { limit: max });
      return cleaned;
    })
    .messages({
      'list.invalid': '{#label} must be an array or comma-separated text',
      'list.max': '{#label} can have at most {#limit} entries',
    });

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const rules = {
  name: Joi.string().trim().min(3).max(100).required().messages({
    ...baseMessages,
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least {#limit} characters',
  }),
  // Normalised to lower case (it used to reject "John@x.com" outright).
  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  // New passwords: strength rules.
  newPassword: Joi.string().max(128).pattern(PASSWORD_RULE).required().messages({
    ...baseMessages,
    'string.empty': 'Password cannot be empty',
    'string.pattern.base':
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
  }),
  // Existing passwords (login / old password): no strength rules, or an old weak password could never log in.
  currentPassword: Joi.string().max(128).required().messages({
    ...baseMessages,
    'string.empty': 'Password cannot be empty',
  }),
  mobile: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
    ...baseMessages,
    'string.pattern.base': 'Invalid mobile format (10 digits required)',
  }),
  address: Joi.string().trim().max(500).allow('').messages(baseMessages),
};

const changePassword = Joi.object({
  oldPassword: rules.currentPassword,
  newPassword: rules.newPassword.invalid(Joi.ref('oldPassword')).messages({
    'any.invalid': 'New password must be different from the old password',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required',
  }),
});

const login = Joi.object({ email: rules.email, password: rules.currentPassword });

export const userSchemas = {
  // No address at sign-up: checkout asks for the delivery address of each order.
  signup: Joi.object({
    name: rules.name,
    email: rules.email,
    password: rules.newPassword,
    mobile: rules.mobile,
  }),
  login,
  verifyEmail: Joi.object({
    email: rules.email,
    code: Joi.string().trim().pattern(/^[0-9]{6}$/).required().messages({
      ...baseMessages,
      'string.pattern.base': 'Enter the 6-digit code',
    }),
  }),
  resendCode: Joi.object({ email: rules.email }),
  updateProfile: Joi.object({
    name: rules.name.optional(),
    mobile: rules.mobile.optional(),
    address: rules.address.optional(),
  }).min(1),
  changePasswordSchema: changePassword,
};

export const adminSchemas = {
  signup: Joi.object({ name: rules.name, email: rules.email, password: rules.newPassword }),
  login,
  changePassword,
};

export const sellerSchemas = {
  signup: Joi.object({ name: rules.name, email: rules.email, password: rules.newPassword }),
  login,
};

const product = {
  name: Joi.string().trim().min(3).max(150).messages({
    ...baseMessages,
    'string.min': 'Product name must be at least {#limit} characters',
  }),
  description: Joi.string().trim().max(2000).allow('').messages({
    ...baseMessages,
    'string.max': 'Description cannot exceed {#limit} characters',
  }),
  price: Joi.number().min(0).precision(2).messages({
    ...baseMessages,
    'number.min': 'Price cannot be negative',
  }),
  stock: Joi.number().integer().min(0).messages({
    ...baseMessages,
    'number.min': 'Stock cannot be negative',
    'number.integer': 'Stock must be a whole number',
  }),
  category: Joi.string().trim().messages({ ...baseMessages, 'string.empty': 'Product category is required' }),
  subcategories: stringList({ max: 5 }),
};

export const productSchemas = {
  create: Joi.object({
    name: product.name.required(),
    description: product.description,
    price: product.price.required(),
    stock: product.stock.required(),
    category: product.category.required(),
    subcategories: product.subcategories.default([]),
  }),
  // Images are multipart files, not body fields; isActive/seller can't be set from here.
  update: Joi.object({
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    subcategories: product.subcategories,
  }),
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    subcategories: stringList({ max: 50 }).default([]),
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(60),
    subcategories: stringList({ max: 50 }),
  }).min(1),
};

export const cartSchemas = {
  addItem: Joi.object({
    productId: objectId.required(),
    quantity: Joi.number().integer().min(1).max(100).default(1).messages({
      ...baseMessages,
      'number.min': 'Quantity must be at least 1',
      'number.integer': 'Quantity must be whole number',
    }),
  }),
  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).max(100).required().messages({
      ...baseMessages,
      'number.min': 'Quantity must be at least 1',
      'number.integer': 'Quantity must be whole number',
    }),
  }),
};

export const orderSchemas = {
  create: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().trim().max(200).required(),
      city: Joi.string().trim().max(100).required(),
      state: Joi.string().trim().max(100).required(),
      postalCode: Joi.string().trim().pattern(/^\d{6}$/).required().messages({
        'string.pattern.base': 'Postal code must be 6 digits',
      }),
    }).required(),
    // Only the method is accepted; the fee itself is decided by the server (SHIPPING_FEES in Order.js).
    shippingMethod: Joi.string().valid('flat', 'pickup').default('flat'),
  }),
};

export const sellerOrderSchemas = {
  updateStatus: Joi.object({
    status: Joi.string().valid('shipped', 'delivered').required(),
  }),
};

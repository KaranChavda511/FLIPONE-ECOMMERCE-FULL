import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';
import generateToken from './utils/generateToken.js';
import { searchRegex, parsePagination } from './utils/helpers.js';
import { userSchemas, productSchemas } from './services/Validation.js';

describe('app (no database)', () => {
  it('serves /health with security headers and no x-powered-by', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects admin signup without a token (was public)', async () => {
    const res = await request(app)
      .post('/api/admin/signup')
      .send({ name: 'Mallory', email: 'm@x.com', password: 'Str0ng@Pass' });
    expect(res.status).toBe(401);
  });

  it('rejects a forged token and an alg:none token', async () => {
    const forged = await request(app).get('/api/cart/view').set('Authorization', 'Bearer abc.def.ghi');
    expect(forged.status).toBe(401);

    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(
      '{"id":"507f1f77bcf86cd799439011","role":"admin"}',
    ).toString('base64url')}.`;
    const res = await request(app).get('/api/admin/allUsers').set('Authorization', `Bearer ${none}`);
    expect(res.status).toBe(401);
  });

  it('validates login bodies before touching the DB', async () => {
    const res = await request(app).post('/api/user/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/api/user/login').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });

  it('issues tokens that expire', () => {
    const [, payload] = generateToken('507f1f77bcf86cd799439011', 'user').split('.');
    const { exp, iat } = JSON.parse(Buffer.from(payload, 'base64url'));
    expect(exp - iat).toBe(24 * 60 * 60);
  });
});

describe('helpers', () => {
  it('escapes regex input', () => {
    expect(searchRegex('(a+)+$').test('(a+)+$')).toBe(true);
    expect(searchRegex('.*').test('anything')).toBe(false);
  });

  it('clamps pagination', () => {
    expect(parsePagination({ page: '-3', limit: '9999' }, { maxLimit: 100 })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10, skip: 20 });
  });
});

describe('validation schemas', () => {
  it('normalises email case instead of rejecting it', () => {
    const { value, error } = userSchemas.login.validate({ email: ' John@X.com ', password: 'whatever' });
    expect(error).toBeUndefined();
    expect(value.email).toBe('john@x.com');
  });

  it('accepts a single subcategory, JSON strings and arrays', () => {
    const base = { name: 'Shirt', price: 10, stock: 1, category: 'Men' };
    expect(productSchemas.create.validate({ ...base, subcategories: 'Shirts' }).value.subcategories).toEqual(['shirts']);
    expect(productSchemas.create.validate({ ...base, subcategories: '["A","b"]' }).value.subcategories).toEqual(['a', 'b']);
    expect(productSchemas.create.validate({ ...base, subcategories: ['x', 'x'] }).value.subcategories).toEqual(['x']);
  });

  it('strips fields a seller must not set', () => {
    const { value } = productSchemas.update.validate({ price: 5, seller: 'someone', isActive: true }, { stripUnknown: true });
    expect(value).toEqual({ price: 5 });
  });
});

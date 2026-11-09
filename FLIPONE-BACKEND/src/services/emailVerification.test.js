import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { generateCode, hashCode, sendAllowance, MAX_SENDS_PER_HOUR, RESEND_SECONDS } from './emailVerification.js';
import { verificationEmail } from './emailTemplates.js';
import { missingMailEnv } from './mailer.js';
import { userSchemas } from './Validation.js';

describe('verification codes', () => {
  it('are always 6 digits', () => {
    for (let i = 0; i < 200; i += 1) expect(generateCode()).toMatch(/^\d{6}$/);
  });

  it('are stored as an HMAC bound to the user', () => {
    expect(hashCode('a', '123456')).toBe(hashCode('a', '123456'));
    expect(hashCode('a', '123456')).not.toBe(hashCode('b', '123456'));
    expect(hashCode('a', '123456')).not.toContain('123456');
  });

  it('allow a resend only after the cooldown, and cap sends per hour', () => {
    const now = Date.parse('2026-11-09T12:00:00Z');
    const at = (msAgo) => new Date(now - msAgo);
    expect(sendAllowance(null, now)).toEqual({ ok: true });
    expect(sendAllowance({ sentAt: at(10_000), windowStart: at(10_000), sendsInWindow: 1 }, now)).toMatchObject({
      ok: false,
      reason: 'cooldown',
      retryAfter: RESEND_SECONDS - 10,
    });
    expect(sendAllowance({ sentAt: at(61_000), windowStart: at(61_000), sendsInWindow: 1 }, now)).toEqual({ ok: true });
    expect(
      sendAllowance({ sentAt: at(120_000), windowStart: at(30 * 60_000), sendsInWindow: MAX_SENDS_PER_HOUR }, now)
    ).toMatchObject({ ok: false, reason: 'hourly' });
    // a new hour window starts fresh
    expect(sendAllowance({ sentAt: at(120_000), windowStart: at(61 * 60_000), sendsInWindow: 9 }, now)).toEqual({ ok: true });
  });
});

describe('verification email', () => {
  it('puts the code in the subject, the HTML and the text, and escapes the name', () => {
    const mail = verificationEmail({ name: '<b>Riya</b> Shah', code: '042913', minutes: 10 });
    expect(mail.subject).toBe('042913 is your FlipOne code');
    expect(mail.html).toContain('>042913</div>');
    expect(mail.html).toContain('&lt;b&gt;Riya&lt;/b&gt;');
    expect(mail.html).not.toContain('<b>Riya</b>');
    expect(mail.text).toContain('042913');
    expect(mail.text).toContain('10 minutes');
  });
});

describe('mail configuration', () => {
  it('lists what the chosen transport is missing', () => {
    expect(missingMailEnv({})).toEqual([]);
    expect(missingMailEnv({ MAIL_TRANSPORT: 'gmail', GMAIL_USER: 'me@gmail.com' })).toEqual(['GMAIL_APP_PASSWORD']);
    expect(missingMailEnv({ MAIL_TRANSPORT: 'gmail-oauth2', GMAIL_USER: 'x' })).toEqual([
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
    ]);
  });
});

describe('sign-up and verification validation', () => {
  it('does not take an address at sign-up', () => {
    const { value, error } = userSchemas.signup.validate(
      { name: 'Riya Shah', email: 'riya@x.com', password: 'Str0ng@Pass', mobile: '9876543210', address: 'x' },
      { stripUnknown: true }
    );
    expect(error).toBeUndefined();
    expect(value).not.toHaveProperty('address');
  });

  it('rejects a code that is not 6 digits before touching the DB', async () => {
    const res = await request(app).post('/api/user/verify-email').send({ email: 'riya@x.com', code: '12ab' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toContain('code');
  });
});

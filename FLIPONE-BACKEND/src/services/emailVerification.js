// Email confirmation codes for new shopper accounts.
//
// A 6-digit code from a CSPRNG, valid for CODE_MINUTES, stored only as an HMAC bound to the user (so a leaked
// database row cannot be replayed for another account). Five wrong tries burn the code. A new code can be
// requested after RESEND_SECONDS, at most MAX_SENDS_PER_HOUR times an hour.
import crypto from 'node:crypto';
import EmailVerification from '../models/EmailVerification.js';
import { HttpError } from '../utils/helpers.js';
import { sendMail } from './mailer.js';
import { verificationEmail } from './emailTemplates.js';
import logger from './logger.js';

const verifyLogger = logger.child({ label: 'services/emailVerification.js' });

export const CODE_MINUTES = 10;
export const RESEND_SECONDS = 60;
export const MAX_ATTEMPTS = 5;
export const MAX_SENDS_PER_HOUR = 5;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const generateCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const hashCode = (userId, code) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(`email-verify:${userId}:${code}`).digest('hex');

const sameHash = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * Whether a new code may be sent now, given the pending record (or null). Pure, for tests.
 * @returns {{ ok: true } | { ok: false, retryAfter: number, reason: 'cooldown' | 'hourly' }}
 */
export const sendAllowance = (record, now = Date.now()) => {
  if (!record) return { ok: true };
  const sinceSend = now - new Date(record.sentAt).getTime();
  if (sinceSend < RESEND_SECONDS * 1000) {
    return { ok: false, reason: 'cooldown', retryAfter: Math.ceil((RESEND_SECONDS * 1000 - sinceSend) / 1000) };
  }
  const windowAge = now - new Date(record.windowStart).getTime();
  if (windowAge < HOUR && record.sendsInWindow >= MAX_SENDS_PER_HOUR) {
    return { ok: false, reason: 'hourly', retryAfter: Math.ceil((HOUR - windowAge) / 1000) };
  }
  return { ok: true };
};

/**
 * Creates a fresh code for `user` and emails it. Throws 429 (with retryAfter) when asked too soon, and 503 when
 * the email could not be sent (the cooldown is lifted again so the shopper can retry at once).
 * @returns {Promise<{ resendIn: number }>}
 */
export const issueCode = async (user) => {
  const now = Date.now();
  const record = await EmailVerification.findOne({ user: user._id });
  const allowance = sendAllowance(record, now);
  if (!allowance.ok) {
    const message =
      allowance.reason === 'cooldown'
        ? `Please wait ${allowance.retryAfter} seconds before asking for another code.`
        : 'Too many codes requested for this email. Try again later.';
    throw new HttpError(429, message, { details: { retryAfter: allowance.retryAfter } });
  }

  const code = generateCode();
  const freshWindow = !record || now - new Date(record.windowStart).getTime() >= HOUR;
  const previousSentAt = record?.sentAt ?? null;

  await EmailVerification.updateOne(
    { user: user._id },
    {
      $set: {
        codeHash: hashCode(user._id, code),
        expiresAt: new Date(now + CODE_MINUTES * 60 * 1000),
        attempts: 0,
        sentAt: new Date(now),
        purgeAt: new Date(now + DAY),
        ...(freshWindow ? { windowStart: new Date(now), sendsInWindow: 1 } : {}),
      },
      ...(freshWindow ? {} : { $inc: { sendsInWindow: 1 } }),
    },
    { upsert: true }
  );

  const email = verificationEmail({ name: user.name, code, minutes: CODE_MINUTES });
  try {
    await sendMail({ to: user.email, ...email, devNote: `code ${code}` });
  } catch (error) {
    verifyLogger.error(`Verification email to ${user.email} failed: ${error.message}`);
    // Undo the cooldown (and the count) so a retry is not blocked by a send that never happened.
    await EmailVerification.updateOne(
      { user: user._id },
      { $set: { sentAt: previousSentAt ?? new Date(0) }, $inc: { sendsInWindow: -1 } }
    ).catch(() => {});
    throw new HttpError(503, 'We could not send the email just now. Please try again in a minute.', { expose: true });
  }
  return { resendIn: RESEND_SECONDS };
};

/**
 * Checks `code` for `user`. On success the record is deleted and the user is marked verified (saved).
 * Wrong codes count towards MAX_ATTEMPTS; an expired or burnt code asks for a new one.
 */
export const confirmCode = async (user, code) => {
  const record = await EmailVerification.findOne({ user: user._id });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new HttpError(400, 'This code has expired. Ask for a new one.', { details: { reason: 'expired' } });
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    throw new HttpError(429, 'Too many wrong codes. Ask for a new one.', { details: { reason: 'locked' } });
  }

  if (!sameHash(hashCode(user._id, String(code)), record.codeHash)) {
    const { attempts } = await EmailVerification.findOneAndUpdate(
      { _id: record._id },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' }
    );
    const left = Math.max(0, MAX_ATTEMPTS - attempts);
    throw new HttpError(400, left ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong codes. Ask for a new one.', {
      details: { reason: left ? 'wrong' : 'locked', attemptsLeft: left },
    });
  }

  await EmailVerification.deleteOne({ _id: record._id });
  user.emailVerified = true;
  await user.save();
};

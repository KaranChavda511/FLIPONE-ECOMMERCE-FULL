// Outgoing email. One transport, chosen from the environment (see .env.example, "Email"):
//
//   MAIL_TRANSPORT=gmail   GMAIL_USER + GMAIL_APP_PASSWORD           (Gmail SMTP with an App Password)
//   MAIL_TRANSPORT=gmail-oauth2  GMAIL_USER + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN
//                                                                     (Gmail with OAuth2, no password stored)
//   MAIL_TRANSPORT=smtp    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (any other provider)
//   unset                  development only: nothing is sent; the message is logged and saved as HTML under
//                          logs/mail/ so the template can be checked in a browser. Production refuses to start
//                          without a real transport (see assertMailConfig).
//
// The sender shows as "<MAIL_FROM_NAME> <MAIL_FROM_ADDRESS>" (default: "FlipOne <GMAIL_USER>"). Gmail only sends
// from the authenticated account or a "Send mail as" alias verified in that account's settings.
import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import logger from './logger.js';

const mailLogger = logger.child({ label: 'services/mailer.js' });
const previewDir = path.resolve(import.meta.dirname, '../../logs/mail');

const mode = () => (process.env.MAIL_TRANSPORT || '').trim().toLowerCase();

const REQUIRED = {
  gmail: ['GMAIL_USER', 'GMAIL_APP_PASSWORD'],
  'gmail-oauth2': ['GMAIL_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
  smtp: ['SMTP_HOST', 'SMTP_PORT'],
};

/** Missing variables for the chosen transport ([] when complete or when no transport is chosen). */
export const missingMailEnv = (env = process.env) => {
  const required = REQUIRED[(env.MAIL_TRANSPORT || '').trim().toLowerCase()];
  return required ? required.filter((key) => !String(env[key] ?? '').trim()) : [];
};

/** Called at startup: a bad or (in production) missing mail setup stops the server with a clear message. */
export const assertMailConfig = () => {
  const chosen = mode();
  if (chosen && !REQUIRED[chosen]) {
    throw new Error(`MAIL_TRANSPORT must be gmail, gmail-oauth2 or smtp (got "${chosen}")`);
  }
  const missing = missingMailEnv();
  if (missing.length) throw new Error(`Email: missing ${missing.join(', ')} for MAIL_TRANSPORT=${chosen}`);
  if (!chosen && process.env.NODE_ENV === 'production') {
    throw new Error('Email: set MAIL_TRANSPORT in production (verification codes cannot be delivered otherwise)');
  }
  if (!chosen && process.env.NODE_ENV !== 'test') {
    mailLogger.warn('MAIL_TRANSPORT is not set: emails are not sent, they are logged and saved to logs/mail/');
  }
};

let transport = null;

const createTransport = () => {
  const env = process.env;
  switch (mode()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') },
      });
    case 'gmail-oauth2':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: env.GMAIL_USER,
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          refreshToken: env.GOOGLE_REFRESH_TOKEN,
        },
      });
    case 'smtp':
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
    default:
      return null;
  }
};

const fromHeader = () => {
  const name = (process.env.MAIL_FROM_NAME || 'FlipOne').replace(/["<>]/g, '');
  const address = process.env.MAIL_FROM_ADDRESS || process.env.GMAIL_USER || process.env.SMTP_USER || 'no-reply@flipone.local';
  return { name, address };
};

// Test runs keep the last messages in memory instead of sending them.
export const testOutbox = [];

const savePreview = async (message) => {
  await fs.mkdir(previewDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTo = String(message.to).replace(/[^a-z0-9@._-]/gi, '_');
  const file = path.join(previewDir, `${stamp}-${safeTo}.html`);
  await fs.writeFile(file, message.html, 'utf8');
  await fs.writeFile(path.join(previewDir, 'latest.html'), message.html, 'utf8');
  return file;
};

/**
 * Sends one email: { to, subject, html, text, devNote? }. `devNote` (e.g. the code) is only logged when nothing
 * is really sent, so codes never reach the logs in production. Resolves when the provider accepted it.
 */
export const sendMail = async ({ to, subject, html, text, devNote }) => {
  const message = { from: fromHeader(), to, subject, html, text, replyTo: process.env.MAIL_REPLY_TO || undefined };

  if (process.env.NODE_ENV === 'test') {
    testOutbox.push(message);
    return { preview: true };
  }

  if (!mode()) {
    const file = await savePreview(message);
    mailLogger.info(`[dev mail] to ${to}: "${subject}"${devNote ? ` (${devNote})` : ''}. Preview: ${file}`);
    return { preview: true, file };
  }

  transport ??= createTransport();
  const info = await transport.sendMail(message);
  mailLogger.info(`Email sent to ${to}: "${subject}" (${info.messageId})`);
  return { messageId: info.messageId };
};

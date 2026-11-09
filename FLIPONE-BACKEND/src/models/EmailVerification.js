import mongoose from 'mongoose';

// One pending email-confirmation code per user. Only an HMAC of the code is stored.
const emailVerificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, required: true },
  // Sends in the current hour window (resend ceiling).
  windowStart: { type: Date, required: true },
  sendsInWindow: { type: Number, default: 0 },
  // MongoDB deletes the document a day after the last send (TTL index), verified or not.
  purgeAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);
export default EmailVerification;

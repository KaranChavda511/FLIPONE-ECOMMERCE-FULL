// Shared by User, Seller and Admin (it was copy-pasted three times).
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * - `password` is `select: false`, so it never leaves the DB unless a query asks for `+password`.
 * - Hashes on save. Mongoose 9 pre hooks are async and get no `next()`.
 * - toJSON/toObject drop `password` and `__v` as a second guard.
 */
export default function passwordPlugin(schema) {
  schema.path('password').select(false);

  schema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  });

  schema.methods.comparePassword = function comparePassword(candidate) {
    if (!this.password) throw new Error('Password not loaded; query with .select("+password")');
    return bcrypt.compare(candidate, this.password);
  };

  const hide = { transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; } };
  schema.set('toJSON', hide);
  schema.set('toObject', hide);
}

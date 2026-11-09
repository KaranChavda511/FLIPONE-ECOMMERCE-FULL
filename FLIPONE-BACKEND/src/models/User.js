import mongoose from 'mongoose';
import passwordPlugin from './plugins/passwordPlugin.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, immutable: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String },
    mobile: { type: String },
    profilePic: { type: String },
    isActive: { type: Boolean, default: true },
    // false until the sign-up code is confirmed. No default on purpose: accounts created before email
    // confirmation existed have no value and count as confirmed (only an explicit false blocks login).
    emailVerified: { type: Boolean },
    role: { type: String, enum: ['user'], default: 'user' },
    likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

userSchema.plugin(passwordPlugin);

const User = mongoose.model('User', userSchema);
export default User;

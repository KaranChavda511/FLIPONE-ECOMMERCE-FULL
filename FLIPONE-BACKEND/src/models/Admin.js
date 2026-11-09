import mongoose from 'mongoose';
import passwordPlugin from './plugins/passwordPlugin.js';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

adminSchema.plugin(passwordPlugin);

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;

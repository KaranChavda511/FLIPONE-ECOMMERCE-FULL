import mongoose from 'mongoose';
import passwordPlugin from './plugins/passwordPlugin.js';

const sellerSchema = new mongoose.Schema(
  {
    licenseID: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['seller'], default: 'seller' },
  },
  { timestamps: true },
);

sellerSchema.plugin(passwordPlugin);

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;

// Creates an admin account (POST /api/admin/signup is admin-only, so the first admin is made here).
// Usage: ADMIN_NAME="Jane" ADMIN_EMAIL=jane@x.com ADMIN_PASSWORD='Str0ng@Pass' npm run create-admin
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import { adminSchemas } from '../src/services/Validation.js';

const { value, error } = adminSchemas.signup.validate({
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});

if (error) {
  console.error(`Invalid input: ${error.message}\nSet ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD.`);
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set (put it in .env)');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
try {
  if (await Admin.exists({ email: value.email })) {
    console.error(`An admin with ${value.email} already exists`);
    process.exitCode = 1;
  } else {
    const admin = await Admin.create(value);
    console.log(`Admin created: ${admin.email} (${admin._id})`);
  }
} finally {
  await mongoose.disconnect();
}

import mongoose from 'mongoose';
import logger from '../services/logger.js';

const dbLogger = logger.child({ label: 'config/db.js' });

// Throws on failure so the server never starts without a database.
const connectDB = async () => {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    dbLogger.info(`MongoDB connected, host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    dbLogger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;

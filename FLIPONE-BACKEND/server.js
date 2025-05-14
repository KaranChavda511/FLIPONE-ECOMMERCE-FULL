  import express from 'express';
  import path from 'path';
  import dotenv from "dotenv";
  import morgan from 'morgan';
  import cors from 'cors'; 
  import connectDB from './src/config/db.js';
  import centralizedRoute from './src/routes/CentralizedRoute.js';
  import logger from './src/services/logger.js';
  import { errorHandler, notFound } from "./src/middlewares/ErrorMiddleware.js";

  dotenv.config();

  const app = express();

  // Set static folder
  const __dirname = path.resolve();

  // Serve static files from public directory
  app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

  //  Enable CORS for frontend (Vite)
  app.use(cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,               // Allow cookies/auth headers if needed
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Special middleware for multipart/form-data routes
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/seller')) {
      next(); // skip body parser for file uploads
    } else {
      express.json()(req, res, next);
    }
  });

  // Logging middleware using Winston
  app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`, {
      user: req.user?._id || 'Guest'
    });
    next();
  });

  // Morgan logging in dev
  if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));
  }

  // Routes
  app.use('/api', centralizedRoute);

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  // Connect to DB and start server
  connectDB()
    .then(() => {
      app.on("error", (error) => {
        console.log("ERROR", error);
        throw error;
      });

      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port: ${process.env.PORT || 5000}`);
      });
    })
    .catch((err) => {
      console.log("Mongodb connection failed", err);
    });

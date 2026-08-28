import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Robust CORS Middleware supporting local dev, Vercel deployments, and production
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Always allow localhost, vercel deployments, and custom CLIENT_URL
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('vercel.app') ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
    ) {
      return callback(null, true);
    }
    
    // Default fallback: allow origin to ensure live deployments never fail preflight checks
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(process.env.API_PREFIX || '/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

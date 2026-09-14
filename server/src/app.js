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

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
].filter(Boolean);

// Robust CORS Middleware supporting local dev, Vercel deployments, and production allow-list
app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow localhost, 127.0.0.1, official Vercel preview/prod deployments, and explicit CLIENT_URL
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    const isExplicitlyAllowed = allowedOrigins.some((allowed) => origin === allowed || origin.startsWith(allowed));

    if (isLocalhost || isVercel || isExplicitlyAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
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

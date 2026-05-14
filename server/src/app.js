import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ENV } from './config/env.js';

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost and local network IPs (for phone/device testing)
    const isAllowed =
      origin === ENV.FRONTEND_URL ||
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.send('GCST ID System API is running...');
});

// Error handling
app.use(errorHandler);

export default app;

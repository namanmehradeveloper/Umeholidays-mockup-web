import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import env from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import apiRoutes from './routes/index.js';
import ApiError from './utils/ApiError.js';

const app = express();

const LOCALHOST_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedOrigin = (origin) =>
  env.clientUrls.includes(origin) ||
  (!env.isProduction && LOCALHOST_ORIGIN.test(origin));

if (env.isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin header:
      // curl, server-to-server requests, Next.js rewrites, etc.
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(
        ApiError.forbidden(`Origin ${origin} is not allowed`),
      );
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'UME Holidays API',
      health: '/api/health',
    },
  });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
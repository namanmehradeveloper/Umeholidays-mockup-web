import env from '../config/env.js';
import { isDbConnected } from '../config/db.js';

export function getHealth(_req, res) {
  const dbUp = isDbConnected();
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    data: {
      status: dbUp ? 'ok' : 'degraded',
      database: dbUp ? 'connected' : 'disconnected',
      environment: env.nodeEnv,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}

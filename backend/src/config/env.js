import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true });

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optional = (name) => process.env[name]?.trim() || undefined;

const toBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

const nodeEnv = process.env.NODE_ENV || 'development';
const smtpPort = Number(optional('SMTP_PORT')) || 465;

const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appUrl: (process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, ''),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  admin: {
    name: process.env.ADMIN_NAME || 'UME Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  email: {
    from: optional('MAIL_FROM') || optional('EMAIL_FROM'),
    /** Inbox that receives new-enquiry notifications. */
    to: optional('MAIL_TO') || optional('ADMIN_EMAIL'),
    smtp: {
      host: optional('SMTP_HOST'),
      port: smtpPort,
      // Port 465 uses implicit TLS; 587 upgrades with STARTTLS, so secure must be false there.
      secure: toBoolean(optional('SMTP_SECURE'), smtpPort === 465),
      user: optional('SMTP_USER'),
      password: process.env.SMTP_PASSWORD,
    },
    resendApiKey: optional('RESEND_API_KEY'),
  },
});

if (env.isProduction && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

export default env;

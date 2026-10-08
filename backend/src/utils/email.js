import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

const baseUrl = env.appUrl;
const { smtp } = env.email;

export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value) => typeof value === 'string' && EMAIL_RE.test(value.trim());

export const smtpConfigured = Boolean(smtp.host && smtp.user && smtp.password && env.email.from);
export const emailConfigured = smtpConfigured || Boolean(env.email.resendApiKey && env.email.from);

if (!smtpConfigured && (smtp.host || smtp.user || smtp.password)) {
  console.warn('[email] SMTP is partially configured; set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and MAIL_FROM');
}

let transporter;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.password },
    // Bound each send so a slow SMTP server cannot hold the HTTP request open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/** Header values must stay on one line. */
const singleLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendWithResend({ to, subject, text, html, replyTo }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.email.from, to: [to], subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 500)}`);
  }
}

/**
 * Sends a transactional email. Never throws: failures are logged and reported as
 * `false` so callers (enquiries, bookings, password reset) are not broken by mail outages.
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!isValidEmail(to)) {
    console.warn('[email] invalid or missing recipient; email skipped');
    return false;
  }

  const message = {
    to: to.trim(),
    subject: singleLine(subject),
    text,
    html,
    replyTo: isValidEmail(replyTo) ? replyTo.trim() : undefined,
  };

  try {
    if (smtpConfigured) {
      await getTransporter().sendMail({ from: env.email.from, ...message });
      return true;
    }

    if (emailConfigured) {
      await sendWithResend(message);
      return true;
    }

    if (!env.isProduction) console.warn('[email] SMTP/email provider is not configured; email skipped');
    return false;
  } catch (error) {
    console.error(`[email] failed to send "${message.subject}":`, error?.message || error);
    return false;
  }
}

export const resetUrl = (token) => `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

export async function sendPasswordResetEmail(to, token) {
  const url = resetUrl(token);
  return sendEmail({
    to,
    subject: 'Reset your UME Holidays password',
    text: `Use this link to reset your UME Holidays password. It expires in 30 minutes: ${url}`,
    html: `<p>Use the link below to reset your UME Holidays password.</p><p><a href="${url}">Reset password</a></p><p>This link expires in 30 minutes and can only be used once.</p>`,
  });
}

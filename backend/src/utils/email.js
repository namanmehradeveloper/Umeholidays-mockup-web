import crypto from 'node:crypto';
import env from '../config/env.js';

const baseUrl = env.appUrl;

export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export async function sendEmail({ to, subject, text, html }) {
  if (!env.email.resendApiKey || !env.email.from) {
    if (!env.isProduction) console.warn('[email] SMTP/email provider is not configured; email skipped');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.email.from, to: [to], subject, text, html }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[email] provider error', response.status, detail.slice(0, 500));
      return false;
    }
    return true;
  } catch (error) {
    console.error('[email] provider request failed', error);
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

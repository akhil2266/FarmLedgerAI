const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.host || !env.smtp.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }
  return transporter;
};

/**
 * Sends an email if SMTP is configured; otherwise logs to console (dev fallback)
 * so the app remains fully functional without requiring email credentials.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    // eslint-disable-next-line no-console
    console.log(`[email:dev-fallback] To: ${to} | Subject: ${subject}\n${text || html}`);
    return { delivered: false, reason: 'SMTP not configured' };
  }
  await t.sendMail({ from: env.smtp.from, to, subject, html, text });
  return { delivered: true };
};

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
  return sendEmail({
    to,
    subject: 'FarmLedger AI - Password Reset Request',
    html: `<p>You requested a password reset. Click the link below (valid for 1 hour):</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>If you did not request this, please ignore this email.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });
};

const sendWelcomeEmail = async (to, fullName) => {
  return sendEmail({
    to,
    subject: 'Welcome to FarmLedger AI',
    html: `<p>Hi ${fullName},</p><p>Welcome to FarmLedger AI — your complete AI-powered farm management platform. Start by adding your first farm and crop cycle from the dashboard.</p>`,
    text: `Hi ${fullName}, welcome to FarmLedger AI.`,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendWelcomeEmail };

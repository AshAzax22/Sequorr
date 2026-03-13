/**
 * Email service — sends transactional emails via Nodemailer.
 *
 * Uses SMTP credentials from environment variables.
 * Falls back gracefully if email config is missing (logs warning, doesn't crash).
 */

const nodemailer = require('nodemailer');

// ── Config ───────────────────────────────────────────

const EMAIL_FROM = process.env.EMAIL_FROM || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

if (!isConfigured) {
  console.warn('⚠️  Email not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable emails.');
}

// ── Transporter ──────────────────────────────────────

let transporter = null;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// ── Email Templates ──────────────────────────────────

/**
 * Send a waitlist welcome email.
 * @param {string} toEmail — recipient's email address
 */
async function sendWaitlistWelcome(toEmail) {
  if (!transporter) {
    console.log(`📧 [SKIP] Waitlist welcome email to ${toEmail} — email not configured`);
    return { sent: false, reason: 'Email not configured' };
  }

  const mailOptions = {
    from: `"Sequorr" <${EMAIL_FROM || SMTP_USER}>`,
    to: toEmail,
    subject: "You're on the Sequorr waitlist! 🎉",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111; font-size: 24px; margin: 0;">Welcome to Sequorr</h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Hey there! 👋
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          You've been added to the <strong>Sequorr waitlist</strong>. We're building something exciting and you'll be one of the first to know when we launch.
        </p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #4f46e5;">
          <p style="color: #555; font-size: 14px; line-height: 1.5; margin: 0;">
            <strong>What happens next?</strong><br/>
            We'll send you an email as soon as early access opens. Stay tuned — it won't be long!
          </p>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
          Thanks for joining us on this journey. 🚀
        </p>

        <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0; border-top: 1px solid #eee; padding-top: 16px;">
          — The Sequorr Team
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Waitlist welcome sent to ${toEmail} (messageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`📧 [ERROR] Failed to send waitlist email to ${toEmail}:`, error.message);
    return { sent: false, reason: error.message };
  }
}

module.exports = { sendWaitlistWelcome };

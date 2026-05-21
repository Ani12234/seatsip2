import crypto from 'crypto';
import nodemailer from 'nodemailer';

interface OtpData {
  otp: string;
  expiresAt: number;
}

// In-memory OTP storage mapped by lowercased email
const otpMap = new Map<string, OtpData>();

// Transporter configuration supporting SMTP env parameters
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Generates a random 6-digit numeric OTP, saves it in memory with 10-minute TTL,
 * and prints it beautifully in the server console (with SMTP email delivery if configured).
 */
export async function generateAndSendOtp(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Generate cryptographically secure 6-digit numeric OTP
  const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
  
  // Set 10-minute expiration limit
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  otpMap.set(cleanEmail, { otp, expiresAt });

  // Beautiful developer console logging for effortless local testing
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log(`│  📩  [EMAIL OTP DISPATCHED TO: ${cleanEmail.padEnd(26)}]  │`);
  console.log(`│  🔑  VERIFICATION CODE: ${otp.padEnd(30)} │`);
  console.log('└────────────────────────────────────────────────────────┘\n');

  // Attempt real email dispatch if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: '"SeatSip" <no-reply@seatsip.in>',
        to: cleanEmail,
        subject: 'SeatSip Password Reset OTP',
        text: `Your password reset verification code is: ${otp}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1a1a1a; text-align: center;">SeatSip Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the following 6-digit verification code (OTP) to complete the process:</p>
            <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #8B9D5E; margin: 20px 0; border-radius: 5px;">
              ${otp}
            </div>
            <p>This code is valid for <strong>10 minutes</strong>. If you did not request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">© ${new Date().getFullYear()} SeatSip. All rights reserved.</p>
          </div>
        `,
      });
      console.log(`[OTP Service] Successfully dispatched email to ${cleanEmail}`);
    } catch (err) {
      console.error('[OTP Service] Failed to send email via SMTP (using console fallback):', err);
    }
  }
}

/**
 * Validates the provided OTP for the given email address.
 * Returns true if valid and unexpired, and removes the OTP from memory on success.
 */
export function verifyOtp(email: string, enteredOtp: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpMap.get(cleanEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanEmail);
    return false;
  }

  if (record.otp === enteredOtp.trim()) {
    otpMap.delete(cleanEmail); // Consume OTP once validated
    return true;
  }

  return false;
}

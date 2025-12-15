// server/src/auth/mail.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Check if SMTP is properly configured
const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_HOST !== "smtp.example.com" &&
  process.env.SMTP_USER &&
  process.env.SMTP_USER !== "your_smtp_login";

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  : null;

export async function sendVerificationEmail(to: string, code: string) {
  // Development mode - log code to console
  if (!isSmtpConfigured || !transporter) {
    console.log("\n" + "=".repeat(50));
    console.log("📧 DEVELOPMENT MODE - Email not sent");
    console.log(`📬 To: ${to}`);
    console.log(`🔐 Verification Code: ${code}`);
    console.log("=".repeat(50) + "\n");
    return;
  }

  const from = process.env.SMTP_FROM;
  if (!from) {
    throw new Error("SMTP_FROM is not set in .env");
  }

  await transporter.sendMail({
    from,
    to,
    subject: "Verify your email for Car Auction",
    text: `Your verification code: ${code}\n\nEnter this code in the app to verify your email.`,
    html: `
      <p>Your verification code:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
        ${code}
      </p>
      <p>Enter this code in the app to verify your email.</p>
    `,
  });
}

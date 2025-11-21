import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  if (!process.env.SMTP_FROM) {
    throw new Error("SMTP_FROM is not set in .env");
  }

  const url = "#"; // можно потом сделать ссылку вида https://.../verify?code=...

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Verify your email for Car Auction",
    text: `Your verification code: ${code}\n\nEnter this code in the app to verify your email.\n${url}`,
    html: `
      <p>Your verification code:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Enter this code in the app to verify your email.</p>
    `,
  });
}

import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
} else {
  console.warn("Gmail credentials not found. Email sending will be disabled.");
}

export interface OTPEmailData {
  email: string;
  otp: string;
  name?: string;
  isSignIn?: boolean;
}

export class GmailEmailService {
  static async sendOTP(data: OTPEmailData): Promise<boolean> {
    if (!transporter) {
      console.log(
        "📧 Email sending disabled. OTP would be sent to:",
        data.email,
        "Code:",
        data.otp
      );
      return true;
    }

    try {
      const greeting = data.name ? `Hi ${data.name}` : "Hello";
      const purpose = data.isSignIn
        ? "sign in to your account"
        : "complete your registration";

      const mailOptions = {
        from: GMAIL_USER,
        to: data.email,
        subject: data.isSignIn
          ? "Sign In to Your Account"
          : "Welcome! Verify Your Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="text-align: center;">${
              data.isSignIn ? "🔐 Sign In Code" : "🎉 Welcome!"
            }</h1>
            
            <p>${greeting},</p>
            
            <p>Use the following One-Time Password (OTP) to ${purpose}:</p>
            
            <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div>Your OTP Code:</div>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 10px 0;">
                ${data.otp}
              </div>
              <div style="font-size: 14px; color: #666; margin-top: 10px;">
                This code expires in 5 minutes
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <strong>🔒 Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        `,
        text: `
${greeting},

Use the following One-Time Password (OTP) to ${purpose}:

Your OTP Code: ${data.otp}

This code expires in 5 minutes.

SECURITY NOTICE:
- Never share this code with anyone
- Our team will never ask for this code
- If you didn't request this code, please ignore this email

This is an automated message, please do not reply to this email.
        `.trim(),
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ OTP email sent successfully to:", data.email);
      return true;
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error);
      return false;
    }
  }
}

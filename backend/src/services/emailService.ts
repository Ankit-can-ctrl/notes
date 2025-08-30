import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourapp.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not found. Email sending will be disabled.");
}

export interface OTPEmailData {
  email: string;
  otp: string;
  name?: string;
  isSignIn?: boolean;
}

export class EmailService {
  static async sendOTP(data: OTPEmailData): Promise<boolean> {
    if (!SENDGRID_API_KEY) {
      console.log(
        "📧 Email sending disabled. OTP would be sent to:",
        data.email,
        "Code:",
        data.otp
      );
      return true;
    }

    try {
      const msg = {
        to: data.email,
        from: FROM_EMAIL,
        subject: data.isSignIn
          ? "Sign In to Your Account"
          : "Welcome! Verify Your Email",
        html: this.generateOTPEmailHTML(data),
        text: this.generateOTPEmailText(data),
      };

      await sgMail.send(msg);
      console.log("✅ OTP email sent successfully to:", data.email);
      return true;
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error);
      return false;
    }
  }

  private static generateOTPEmailHTML(data: OTPEmailData): string {
    const greeting = data.name ? `Hi ${data.name}` : "Hello";
    const purpose = data.isSignIn
      ? "sign in to your account"
      : "complete your registration";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .otp-box { 
              background: #f8f9fa; 
              border: 2px solid #e9ecef; 
              border-radius: 8px; 
              padding: 20px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .otp-code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #007bff; 
              letter-spacing: 8px; 
              margin: 10px 0; 
            }
            .warning { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              border-radius: 4px; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              font-size: 14px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.isSignIn ? "🔐 Sign In Code" : "🎉 Welcome!"}</h1>
            </div>
            
            <p>${greeting},</p>
            
            <p>Use the following One-Time Password (OTP) to ${purpose}:</p>
            
            <div class="otp-box">
              <div>Your OTP Code:</div>
              <div class="otp-code">${data.otp}</div>
              <div style="font-size: 14px; color: #666; margin-top: 10px;">
                This code expires in 5 minutes
              </div>
            </div>
            
            <div class="warning">
              <strong>🔒 Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Your Notes App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateOTPEmailText(data: OTPEmailData): string {
    const greeting = data.name ? `Hi ${data.name}` : "Hello";
    const purpose = data.isSignIn
      ? "sign in to your account"
      : "complete your registration";

    return `
${greeting},

Use the following One-Time Password (OTP) to ${purpose}:

Your OTP Code: ${data.otp}

This code expires in 5 minutes.

SECURITY NOTICE:
- Never share this code with anyone
- Our team will never ask for this code
- If you didn't request this code, please ignore this email

If you have any questions, please contact our support team.

This is an automated message, please do not reply to this email.

© ${new Date().getFullYear()} Your Notes App. All rights reserved.
    `.trim();
  }
}

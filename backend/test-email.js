// Test script to verify SendGrid email functionality
// Run this after setting up your .env file with SENDGRID_API_KEY

require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourapp.com";
const TEST_EMAIL = process.env.TEST_EMAIL || "your-email@example.com";

if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not found in environment variables");
  process.exit(1);
}

if (TEST_EMAIL === "your-email@example.com") {
  console.error(
    "❌ Please set TEST_EMAIL environment variable to your actual email"
  );
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

const testOTP = "123456";

const msg = {
  to: TEST_EMAIL,
  from: FROM_EMAIL,
  subject: "Test OTP Email - Notes App",
  html: `
    <h2>🧪 Test Email</h2>
    <p>This is a test email to verify SendGrid integration.</p>
    <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center;">
      <h3>Your Test OTP: <span style="color: #007bff; font-size: 24px;">${testOTP}</span></h3>
    </div>
    <p>If you received this email, SendGrid is working correctly!</p>
  `,
  text: `
Test Email - Notes App

This is a test email to verify SendGrid integration.

Your Test OTP: ${testOTP}

If you received this email, SendGrid is working correctly!
  `,
};

console.log("📧 Sending test email...");
console.log("From:", FROM_EMAIL);
console.log("To:", TEST_EMAIL);

sgMail
  .send(msg)
  .then(() => {
    console.log("✅ Test email sent successfully!");
    console.log("📬 Check your inbox (and spam folder) for the test email");
  })
  .catch((error) => {
    console.error("❌ Failed to send test email:");
    console.error(error.response ? error.response.body : error);
  });

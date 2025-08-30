# Gmail Setup Instructions (FREE Alternative)

Use Gmail to send OTP emails for free! Perfect for development and testing.

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process

### Step 2: Generate App Password

1. Go to **Security** → **App passwords**
2. Select app: **Mail**
3. Select device: **Other (custom name)**
4. Enter name: "Notes App OTP"
5. **Copy the 16-character password** (save it!)

### Step 3: Configure Environment

Add these to your `.env` file:

```env
# Gmail Configuration (FREE)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Comment out SendGrid if switching
# SENDGRID_API_KEY=...
# FROM_EMAIL=...
```

### Step 4: Update Your Auth Controller

Replace the SendGrid import with Gmail:

```typescript
// Replace this line in authController.ts:
import { EmailService } from "../services/emailService";

// With this:
import { GmailEmailService as EmailService } from "../services/gmailEmailService";
```

### Step 5: Test It!

```bash
npm run dev
```

## 📝 Complete Example .env File

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Gmail Email (FREE - Choose this OR SendGrid)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# SendGrid (Alternative - Choose this OR Gmail)
# SENDGRID_API_KEY=SG.your-api-key
# FROM_EMAIL=noreply@yourdomain.com

# Development
RETURN_OTP_IN_RESPONSE=true
```

## 🆚 **Comparison: Gmail vs SendGrid**

| Feature            | Gmail (Free)    | SendGrid (Free)            |
| ------------------ | --------------- | -------------------------- |
| **Emails/day**     | ~500-2000\*     | 100                        |
| **Setup time**     | 5 minutes       | 10-15 minutes              |
| **Verification**   | None needed     | Domain/sender verification |
| **Deliverability** | Good            | Excellent                  |
| **Professional**   | Personal sender | Custom sender              |

\*Gmail limits vary but are generally higher for personal use

## 🔧 **Switching Between Services**

You can easily switch between Gmail and SendGrid by changing one import:

**For Gmail:**

```typescript
import { GmailEmailService as EmailService } from "../services/gmailEmailService";
```

**For SendGrid:**

```typescript
import { EmailService } from "../services/emailService";
```

## ⚠️ **Important Notes**

1. **Use App Passwords, NOT your regular Gmail password**
2. **Don't commit your app password to Git**
3. **Gmail may have daily sending limits**
4. **For production, consider SendGrid or other professional services**

## 🎯 **Recommendation**

- **Development/Testing**: Use Gmail (fastest setup)
- **Production**: Use SendGrid (better deliverability)

Both are implemented and ready to use! 🚀

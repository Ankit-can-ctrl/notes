# SendGrid Email Setup Instructions

This guide will help you set up SendGrid to send real OTP emails in your Notes application.

## 1. Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

## 2. Create an API Key

1. Log into your SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give it a name like "Notes App OTP"
6. Under **Mail Send**, select **Full Access**
7. Click **Create & View**
8. **Copy the API key immediately** (you won't see it again)

## 3. Configure Your Environment

1. Copy `env.example` to `.env` in the backend folder:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your SendGrid credentials:
   ```env
   SENDGRID_API_KEY=SG.your-actual-api-key-here
   FROM_EMAIL=noreply@yourdomain.com
   ```

## 4. Verify Sender Email (Important!)

For production use, you need to verify your sender email:

### Option A: Single Sender Verification (Quick)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your sender email (must match `FROM_EMAIL` in .env)
4. Complete the verification process

### Option B: Domain Authentication (Recommended for production)

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. This allows you to send from any email address on your domain

## 5. Test Your Setup

1. Start your backend server:

   ```bash
   npm run dev
   ```

2. Try requesting an OTP through your application
3. Check the console for success/error messages
4. Check your email inbox for the OTP

## 6. Troubleshooting

### Email not received?

- Check your spam folder
- Verify your sender email is authenticated
- Check SendGrid activity dashboard for delivery status

### API errors?

- Verify your API key is correct
- Check that your API key has Mail Send permissions
- Ensure FROM_EMAIL matches your verified sender

### Console shows "Email sending disabled"?

- Make sure `SENDGRID_API_KEY` is set in your `.env` file
- Restart your server after adding the environment variable

## 7. Development vs Production

### Development

- Set `RETURN_OTP_IN_RESPONSE=true` in `.env` to see OTP codes in API responses
- Use a development email for testing

### Production

- Set `RETURN_OTP_IN_RESPONSE=false` (or remove the line)
- Use your domain's email address
- Consider implementing rate limiting for OTP requests

## Environment Variables Reference

```env
# Required for email sending
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourdomain.com

# Optional for development
RETURN_OTP_IN_RESPONSE=false
```

## Security Notes

- Never commit your actual API key to version control
- Use environment variables for all sensitive credentials
- Regularly rotate your API keys
- Monitor your SendGrid usage to detect abuse
- Consider implementing rate limiting for OTP requests

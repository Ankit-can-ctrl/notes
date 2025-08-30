# Development Setup - OTP Display

## 🎯 Quick Start (No Email Service Required)

Your application is now configured to display OTP codes directly on the signup/signin pages when email service is not working.

### 1. Backend Setup

```bash
cd backend
cp env.example .env
```

Edit `.env` and set:

```env
RETURN_OTP_IN_RESPONSE=true
```

**Leave email service variables empty** to simulate email service being down:

```env
# Comment out or leave empty for development
# SENDGRID_API_KEY=
# GMAIL_USER=
# GMAIL_APP_PASSWORD=
```

### 2. Start Development Servers

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

### 3. Test the OTP Display

1. Go to `http://localhost:5173`
2. Enter your email and click "Send OTP"
3. **You'll see a yellow warning box** with the OTP code displayed directly on the page
4. Copy the code from the yellow box and paste it in the OTP field
5. Complete signup/signin

## 🎨 What You'll See

### When Email Service is NOT Working:

- ⚠️ Yellow warning box appears
- 📧 "Email Service Not Working" message
- 🔢 Large, easy-to-copy OTP code displayed
- 📝 Instructions to copy the code

### When Email Service IS Working:

- ✅ Normal flow with emails sent
- 🔒 No OTP displayed on screen (for security)
- 📬 User receives email with OTP

## 🔧 Email Service Options

### Option 1: Keep OTP Display (Development)

- Leave email variables empty in `.env`
- OTP codes will always be displayed on screen
- Perfect for development and testing

### Option 2: Setup Gmail (5 minutes)

- Follow `backend/GMAIL_SETUP.md`
- Add Gmail credentials to `.env`
- OTP will be sent via email AND displayed on screen if email fails

### Option 3: Setup SendGrid (10 minutes)

- Follow `backend/SENDGRID_SETUP.md`
- Add SendGrid API key to `.env`
- Professional email service with high deliverability

## 🚀 Production Deployment

For production, set:

```env
RETURN_OTP_IN_RESPONSE=false
```

This will:

- ❌ Hide OTP codes from API responses
- ✅ Only send emails (no screen display)
- 🔒 Better security

## 🎯 Environment Variables Reference

```env
# Development Mode (shows OTP on screen)
RETURN_OTP_IN_RESPONSE=true

# Email Service (choose one or leave empty)
# Option 1: No email (OTP displayed on screen)
# Leave empty

# Option 2: Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Option 3: SendGrid
SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## 📱 User Experience

### Signup Flow:

1. Enter name, email, date of birth
2. Click "Send OTP"
3. See OTP in yellow box (if email service down)
4. Copy OTP and paste in field
5. Click "Verify & Continue"

### Signin Flow:

1. Enter email
2. Click "Send OTP"
3. See OTP in yellow box (if email service down)
4. Copy OTP and paste in field
5. Click "Sign In"

The interface automatically detects if email service is working and shows/hides the OTP display accordingly! 🎉

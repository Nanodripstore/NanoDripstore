# Email Setup for Password Reset

The password reset feature is now fully implemented with **4 different email options**! Choose the one that works best for you:

## Option 1: Gmail (Easiest Setup)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Generate password for "Mail"
4. Add to your `.env.local` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
```

## Option 2: SMTP (Any Email Provider)

Works with any SMTP service (Outlook, Yahoo, custom email servers):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
EMAIL_FROM=your-email@domain.com
```

Common SMTP settings:
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587

## Option 3: Resend (Recommended for Production)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to your `.env.local` file:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## Option 4: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key in your dashboard
3. Add to your `.env.local` file:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## Priority Order

The system tries email services in this order:
1. **Nodemailer (SMTP/Gmail)** - Most reliable, works with any email
2. **Resend** - Modern API service
3. **SendGrid** - Enterprise email service
4. **Development Mode** - Console logging (fallback)

## Development Mode

If no email service is configured, the system will automatically fall back to **development mode** where reset URLs are logged to the console instead of being emailed.

## Quick Start

**For testing (Gmail):**
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

**For production (Resend):**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

## How It Works

1. User enters email on `/forgot-password` page
2. System generates a secure reset token
3. Email is sent with reset link (or logged in dev mode)
4. User clicks link and is taken to `/reset-password` page
5. User enters new password and token is validated

## Testing

1. Go to `/forgot-password`
2. Enter a valid user email
3. Check your email (or console logs in dev mode)
4. Click the reset link
5. Enter a new password

## Features

- ✅ 4 different email service options
- ✅ Automatic fallback between services
- ✅ Secure token generation with 1-hour expiry
- ✅ Beautiful HTML email templates
- ✅ Gmail App Password support
- ✅ SMTP support for any email provider
- ✅ Development mode fallback
- ✅ Complete TypeScript support
- ✅ Production-ready build

The password reset feature is now **fully functional** with multiple email options!

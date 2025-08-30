# Gmail Email Configuration Issue

## Problem
The email verification system is failing with "Invalid login: 535-5.7.8 Username and Password not accepted" error.

## Root Cause
The Gmail App Password authentication is failing. This happens when:
1. 2-Factor Authentication (2FA) is not enabled on the Gmail account
2. The App Password is incorrect, expired, or not properly generated
3. The Gmail account has security restrictions

## Solution Steps

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Sign in with `nanodripstore@gmail.com`
3. Click on "2-Step Verification" 
4. Follow the setup process to enable 2FA

### Step 2: Generate a New App Password
1. After 2FA is enabled, go to https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Click "Generate app password"
4. Select "Mail" as the app
5. Copy the 16-character password (no spaces)

### Step 3: Update Environment Variable
1. Replace the current `GMAIL_APP_PASSWORD` in `.env.local` with the new password
2. Restart the development server

### Step 4: Test
1. Try signing up with a new account
2. Check if verification emails are being sent

## Current Configuration
- Email: nanodripstore@gmail.com
- Current App Password: zqabdmymcjxpwivg (appears to be invalid/expired)

## Alternative Solutions
If Gmail continues to have issues, consider:
1. Using a different email service (SendGrid, Mailgun, etc.)
2. Using a different Gmail account with proper 2FA setup
3. Checking Gmail account security settings for any blocks

## Testing
Use this endpoint to test email sending:
POST http://localhost:3000/api/debug/test-email
Body: {"email": "your-test-email@example.com"}

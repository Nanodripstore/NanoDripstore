# Forgot Password Functionality

## Overview
Complete forgot password implementation with secure token-based password reset.

## Files Created/Modified

### Database Schema
- `prisma/schema.prisma`: Added `resetToken` and `resetTokenExpiry` fields to User model

### API Routes
- `app/api/auth/forgot-password/route.ts`: Handles password reset requests
- `app/api/auth/reset-password/route.ts`: Handles password reset with token

### Components
- `components/form/forgot-password-form.tsx`: Form to request password reset
- `components/form/reset-password-form.tsx`: Form to reset password with token
- `components/form/sign-in-form.tsx`: Added "Forgot Password?" link

### Pages
- `app/forgot-password/page.tsx`: Forgot password page
- `app/reset-password/page.tsx`: Reset password page with token validation

## How It Works

### 1. Request Password Reset
1. User clicks "Forgot password?" on sign-in page
2. User enters their email address
3. System generates a unique reset token (valid for 1 hour)
4. Token is saved to database with expiry time
5. In production, email would be sent with reset link

### 2. Reset Password
1. User clicks reset link (or manually enters token)
2. System validates token exists and hasn't expired
3. User enters new password (with same validation as sign-up)
4. Password is hashed and saved
5. Reset token is cleared from database

## Security Features

### Token Security
- Unique UUID tokens that are cryptographically secure
- Tokens expire after 1 hour
- Tokens are cleared after successful password reset
- Tokens are unique per user (database constraint)

### Password Validation
- Same strong password requirements as sign-up:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter  
  - At least one number
  - At least one special character

### Privacy Protection
- API doesn't reveal if email exists in system
- Consistent response messages for security

## Development Mode Features

### Token Display
- In development, reset token is shown in:
  - Console logs
  - Toast notifications
  - API response (removed in production)
- Reset URL is logged to console for easy testing

### Testing the Flow
1. Start the application: `npm run dev`
2. Go to `/sign-in`
3. Click "Forgot password?"
4. Enter a valid user email
5. Check console for reset token and URL
6. Navigate to the reset URL
7. Enter new password
8. Verify you can sign in with new password

## Production Setup

### Email Service Integration
To enable email sending in production, implement in `forgot-password/route.ts`:

```typescript
// Remove development token exposure
// Add email service (SendGrid, AWS SES, etc.)
const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
await sendPasswordResetEmail(email, resetUrl);
```

### Environment Variables
```env
NEXTAUTH_URL=https://your-domain.com
# Add email service credentials
SENDGRID_API_KEY=your_key
# or
AWS_SES_ACCESS_KEY=your_key
```

## User Experience

### Forgot Password Flow
1. **Clear Call-to-Action**: "Forgot password?" link prominently displayed
2. **Simple Form**: Just email address required
3. **Immediate Feedback**: Success message shown immediately
4. **Clear Instructions**: User knows to check email

### Reset Password Flow
1. **Token Validation**: Invalid/expired tokens redirect to forgot password
2. **Password Requirements**: Real-time validation with visual feedback
3. **Success Redirect**: Automatically redirects to sign-in after success
4. **Clear Navigation**: Back to sign-in links available

## URLs

- **Forgot Password**: `/forgot-password`
- **Reset Password**: `/reset-password?token=<reset_token>`
- **API Endpoints**:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

## Error Handling

### Client-Side
- Form validation with Zod schemas
- Toast notifications for success/error states
- Loading states during API calls
- Graceful error recovery

### Server-Side
- Comprehensive input validation
- Database transaction safety
- Detailed error logging
- Secure error responses (no sensitive data leakage)

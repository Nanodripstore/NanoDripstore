# Environment Variables Setup

## For Netlify Production Deployment

Add these environment variables in your Netlify dashboard:

### Required Variables:

```bash
NEXTAUTH_URL=https://www.nanodripstore.netlify.app
NEXTAUTH_SECRET=[secure-32-character-secret]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
TURSO_DATABASE_URL=libsql://[your-database].turso.io
TURSO_AUTH_TOKEN=[your-turso-auth-token]
NODE_ENV=production
```

### Setup Instructions:

1. **Turso Database:**
   - Sign up at https://turso.tech
   - Create database named "nanodripstore"
   - Copy the libsql:// URL for TURSO_DATABASE_URL
   - Copy the auth token for TURSO_AUTH_TOKEN

2. **Google OAuth:**
   - Go to Google Cloud Console
   - Use existing OAuth credentials
   - Add redirect URI: https://www.nanodripstore.netlify.app/api/auth/callback/google

3. **NextAuth Secret:**
   - Generate: `openssl rand -base64 32`
   - Use for NEXTAUTH_SECRET

4. **Netlify URL:**
   - Use: https://www.nanodripstore.netlify.app
   - Must match Google OAuth redirect URI exactly

The deployment should work once these are set correctly!

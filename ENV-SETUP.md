# Environment Variables Setup

## For Netlify Production Deployment

Add these environment variables in your Netlify dashboard:

### Required Variables:

```bash
DATABASE_URL=https://nanodrip-store-nanodrip-store.aws-ap-south-1.turso.io?authToken=[your-token]
NEXTAUTH_URL=https://nanodripstore.in
NEXTAUTH_SECRET=[secure-32-character-secret]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
TURSO_AUTH_TOKEN=[your-turso-auth-token]
NODE_ENV=production
```

### Setup Instructions:

1. **Turso Database:**
   - Use HTTPS URL: https://nanodrip-store-nanodrip-store.aws-ap-south-1.turso.io
   - Get your auth token from Turso dashboard
   - Combine them: `https://nanodrip-store-nanodrip-store.aws-ap-south-1.turso.io?authToken=[token]`

2. **Google OAuth:**
   - Go to Google Cloud Console
   - Use existing OAuth credentials
   - Add redirect URI: https://nanodripstore.in/api/auth/callback/google

3. **NextAuth Secret:**
   - Generate: `openssl rand -base64 32`
   - Use for NEXTAUTH_SECRET

4. **Netlify URL:**
   - Use: https://nanodripstore.in
   - Must match Google OAuth redirect URI exactly

## For Local Development (.env.local)

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

The deployment should work once these are set correctly!

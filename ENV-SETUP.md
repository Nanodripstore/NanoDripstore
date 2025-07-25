# Environment Variables Setup

## For Netlify Production Deployment

Add these environment variables in your Netlify dashboard:

### Required Variables:

```bash
DATABASE_URL=libsql://[your-database].turso.io?authToken=[your-token]
NEXTAUTH_URL=https://www.nanodripstore.netlify.app
NEXTAUTH_SECRET=[secure-32-character-secret]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
NODE_ENV=production
```

### Setup Instructions:

1. **Turso Database:**
   - Sign up at https://turso.tech
   - Create database named "nanodripstore"
   - Get your database URL: `libsql://[name].turso.io`
   - Get your auth token from Turso dashboard
   - Combine them: `libsql://[name].turso.io?authToken=[token]`

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

## For Local Development (.env.local)

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

The deployment should work once these are set correctly!

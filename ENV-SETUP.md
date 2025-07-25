# Environment Variables Setup

## For Netlify Production Deployment

Add these environment variables in your Netlify dashboard:

### Required Variables:

```bash
DATABASE_URL=libsql://[your-database].turso.io
AUTH_SECRET=[32-character-secret]
NEXTAUTH_URL=https://[your-app].netlify.app
AUTH_GOOGLE_ID=[your-client-id]
AUTH_GOOGLE_SECRET=[your-client-secret]  
NODE_ENV=production
```

### Setup Instructions:

1. **Turso Database:**
   - Sign up at turso.tech
   - Create database named "nanodripstore"
   - Copy the libsql:// URL

2. **Google OAuth:**
   - Use existing credentials
   - Add Netlify URL to redirect URIs

3. **Auth Secret:**
   - Generate a secure 32+ character string
   - Use for AUTH_SECRET

4. **Netlify URL:**
   - Use your deployed Netlify app URL
   - Format: https://your-app-name.netlify.app

The deployment should work once these are set!

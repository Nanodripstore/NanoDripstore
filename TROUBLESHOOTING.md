# NanoDrip Store - Troubleshooting Guide

## Current Issue: Server Error on Sign-In

### Problem
When clicking "Sign in" on the deployed Netlify site, users encounter a "Server error" message.

### Diagnosis Steps

1. **Test Health Check Endpoint**
   - Visit: `https://www.nanodripstore.netlify.app/api/health`
   - This will show database connectivity and environment info

2. **Check Netlify Environment Variables**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Verify these are set correctly:
     ```
     NEXTAUTH_URL=https://www.nanodripstore.netlify.app
     NEXTAUTH_SECRET=your_secret_here
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     TURSO_DATABASE_URL=your_turso_url
     TURSO_AUTH_TOKEN=your_turso_token
     ```

3. **Google OAuth Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add to Authorized redirect URIs:
     ```
     https://www.nanodripstore.netlify.app/api/auth/callback/google
     ```

4. **Check Netlify Function Logs**
   - Go to Netlify Dashboard → Functions
   - Look for error messages in the logs

### Common Solutions

#### Fix 1: Update NEXTAUTH_URL
```bash
# In Netlify Dashboard → Environment Variables
NEXTAUTH_URL=https://www.nanodripstore.netlify.app
```

#### Fix 2: Google OAuth Redirect URI
- Must match exactly: `https://www.nanodripstore.netlify.app/api/auth/callback/google`
- No trailing slash
- Use www subdomain

#### Fix 3: Database Connection
- Verify Turso credentials are correct
- Test connection using the health endpoint

#### Fix 4: NextAuth Secret
- Generate a new secret: `openssl rand -base64 32`
- Update in Netlify environment variables

### Testing Process

1. **Local Testing**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/health
   # Test sign-in locally
   ```

2. **Production Testing**
   ```bash
   # After deploying changes
   # Visit https://www.nanodripstore.netlify.app/api/health
   # Test sign-in on production
   ```

3. **Debug Information**
   - Health endpoint will show database status
   - Check browser console for client-side errors
   - Check Netlify function logs for server-side errors

### Environment Variables Checklist

- [ ] NEXTAUTH_URL (production URL, no trailing slash)
- [ ] NEXTAUTH_SECRET (secure random string)
- [ ] GOOGLE_CLIENT_ID (from Google Cloud Console)
- [ ] GOOGLE_CLIENT_SECRET (from Google Cloud Console)
- [ ] TURSO_DATABASE_URL (from Turso dashboard)
- [ ] TURSO_AUTH_TOKEN (from Turso dashboard)

### Quick Fixes to Try

1. **Redeploy Site**
   - Sometimes environment variable changes need a fresh deploy
   - Push any small change to trigger rebuild

2. **Clear Netlify Cache**
   - In Netlify Dashboard: Site Settings → Build & Deploy → Clear cache

3. **Test Different Browsers**
   - Try incognito/private mode
   - Different browsers to rule out cache issues

### Next Steps

If the server error persists after checking all the above:

1. Check the enhanced health endpoint for specific error messages
2. Review Netlify function logs for detailed error information
3. Verify all environment variables match exactly
4. Ensure Google OAuth is configured with correct redirect URI

### Contact Information

If you need further assistance, provide:
- Health endpoint response
- Netlify function logs
- Google OAuth configuration screenshot
- Environment variables list (without sensitive values)

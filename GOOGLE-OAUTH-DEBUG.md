# Google OAuth Troubleshooting Guide

## Current Issue: Error 401: invalid_client

### What We've Confirmed ✅
- Environment variables are correct in Netlify
- NEXTAUTH_URL is set properly: https://nanodripstore.in
- Client ID matches: 809911311077-lceia74fg17im0vi8gki6jhjfb7k7p45.apps.googleusercontent.com
- Test user added to OAuth consent screen
- Redirect URIs configured correctly

### Remaining Issues to Check ❌

#### 1. Google Cloud Project Status
- Is the Google Cloud project active?
- Are there any billing issues?
- Is the project suspended?

#### 2. OAuth Application Type
- Must be "Web application" (not "Desktop" or "Mobile")
- Check in Google Cloud Console → Credentials

#### 3. Required APIs Enabled
Check if these APIs are enabled in Google Cloud Console → APIs & Services → Library:
- Google+ API
- Google OAuth2 API
- Identity and Access Management (IAM) API

#### 4. OAuth Client Configuration
Double-check these exact settings in Google Cloud Console:

**Application type:** Web application

**Authorized JavaScript origins:**
```
https://nanodripstore.in
```

**Authorized redirect URIs:**
```
https://nanodripstore.in/api/auth/callback/google
```

#### 5. OAuth Consent Screen Details
- App name: Should be set
- User support email: Should be your email
- Developer contact information: Should be filled
- Scopes: Should include basic profile scopes

### Alternative Solutions

#### Solution A: Create New OAuth Application
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → OAuth 2.0 Client ID
3. Application type: Web application
4. Name: "NanoDrip Store New"
5. Add exact URLs:
   - JavaScript origins: https://nanodripstore.in
   - Redirect URIs: https://nanodripstore.in/api/auth/callback/google
6. Update Netlify environment variables with new Client ID and Secret

#### Solution B: Use Different OAuth Provider
If Google OAuth continues to fail, consider:
- GitHub OAuth (simpler setup)
- Auth0 (managed service)
- Firebase Authentication

### Debug Steps

1. **Check Google Cloud Console Logs:**
   - Go to Logging → Logs Explorer
   - Look for OAuth-related errors

2. **Test with Postman/curl:**
   ```bash
   curl -X GET "https://nanodripstore.in/api/auth/signin/google"
   ```

3. **Check Network Tab:**
   - Open browser dev tools
   - Network tab during sign-in attempt
   - Look for specific error responses

### Most Likely Issues
1. **Application type is not "Web application"**
2. **Required APIs not enabled**
3. **OAuth client created in wrong Google Cloud project**
4. **Client secret mismatch or corruption**

### Quick Fix Checklist
- [ ] OAuth application type is "Web application"
- [ ] JavaScript origins include https://nanodripstore.in
- [ ] Redirect URI is exactly https://nanodripstore.in/api/auth/callback/google
- [ ] Test user email added and saved
- [ ] Google+ API enabled
- [ ] OAuth consent screen completely filled out
- [ ] Wait 10-15 minutes after any Google changes

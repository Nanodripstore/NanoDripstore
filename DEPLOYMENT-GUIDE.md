# 🚀 Deploy NanoDrip Store to Netlify

## Quick Setup Instructions:

### 1. Create Turso Database
- Go to: https://turso.tech/
- Create database named: nanodripstore
- Copy the database URL

### 2. Deploy to Netlify
- Go to: https://netlify.com
- Connect GitHub repository
- Build command: npm run build
- Publish directory: .next

### 3. Set Environment Variables in Netlify
Add these in Netlify Dashboard > Environment Variables:

```
DATABASE_URL=your-turso-database-url
AUTH_SECRET=your-secure-32-character-secret
NEXTAUTH_URL=https://your-app.netlify.app
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
NODE_ENV=production
```

### 4. Update Google OAuth
- Add your Netlify URL to Google OAuth redirect URIs
- Format: https://your-app.netlify.app/api/auth/callback/google

### 5. Custom Domain (Optional)
- Add www.nanodripstore.in in Netlify domain settings
- Update DNS records as instructed by Netlify

That's it! Your store will be live! 🎉

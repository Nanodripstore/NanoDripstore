# Deploy to Netlify

## Setup Steps:

1. **Database**: Create at turso.tech
2. **Deploy**: Connect GitHub repo to Netlify  
3. **Config**: Set environment variables in Netlify dashboard
4. **OAuth**: Update Google OAuth redirect URIs
5. **Domain**: Optional custom domain setup

## Environment Variables:

Set these in Netlify Dashboard:

- DATABASE_URL (from Turso)
- AUTH_SECRET (32+ character string)
- NEXTAUTH_URL (your Netlify app URL)
- AUTH_GOOGLE_ID (from Google Console)
- AUTH_GOOGLE_SECRET (from Google Console)
- NODE_ENV=production

## Build Settings:

- Build command: `npm run build`
- Publish directory: `` (leave empty)

## Troubleshooting:

If you get "Page Not Found":
1. Check build logs for errors
2. Verify environment variables are set
3. Test API health: `https://your-app.netlify.app/api/health`

Your app will be live after deployment!

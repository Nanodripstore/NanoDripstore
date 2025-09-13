# 🚀 Production Deployment Checklist

## Pre-Deployment Security Check ✅

### 1. Environment Variables Security
- ✅ All secrets moved to .env.local (not committed to git)
- ✅ Live Razorpay keys configured
- ✅ Database connection strings secure
- ⚠️  NEXTAUTH_URL needs update for production domain
- ⚠️  EMAIL_FROM domain should match your production domain

### 2. Database & Migrations
- ✅ Supabase database configured
- ✅ Schema up to date
- ⚠️  Need to run production migrations

### 3. Code Quality
- ✅ Build passes successfully
- ✅ No test/demo files in production
- ✅ Rate limiting implemented
- ✅ Authentication secured

## Deployment Steps 📋

### Step 1: Prepare Environment Variables
1. Copy all .env.local variables to your deployment platform
2. Update these for production:
   - `NEXTAUTH_URL="https://yourdomain.com"`
   - Consider updating `EMAIL_FROM` to match your domain

### Step 2: Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
3. Add all environment variables in Netlify dashboard
4. Deploy!

### Step 3: Update External Services
1. **Razorpay Webhook URL**: Update to `https://yourdomain.com/api/razorpay/webhook`
2. **Google OAuth**: Add production domain to authorized origins
3. **Email Domain**: Consider setting up custom domain for emails

### Step 4: Post-Deployment Testing
1. Test user registration/login
2. Test product browsing and cart
3. Test ₹1 payment to confirm Razorpay integration
4. Test order placement and Qikink integration
5. Verify webhook is receiving payments
6. Test email notifications

### Step 5: Monitoring Setup
1. Set up error tracking (Sentry recommended)
2. Monitor Razorpay dashboard for payments
3. Set up uptime monitoring
4. Monitor database performance

## Security Checklist 🔒

- ✅ All API routes have authentication where needed
- ✅ Rate limiting implemented
- ✅ Input validation on forms
- ✅ CORS properly configured
- ✅ Webhook signature verification
- ✅ No sensitive data in client-side code

## Performance Checklist ⚡

- ✅ Image optimization configured
- ✅ Static generation where possible
- ✅ Database queries optimized
- ✅ Caching implemented

## Domain & SSL 🌐

- Set up custom domain in Netlify
- SSL certificate (automatic with Netlify)
- Configure DNS records

## Backup & Recovery 💾

- Database backups (Supabase handles this)
- Environment variables backed up securely
- Git repository is your code backup

---

## Ready to Deploy? 🎯

Your codebase is production-ready! The main things you need to do:

1. **Set up Netlify deployment**
2. **Update NEXTAUTH_URL for your domain**
3. **Update Razorpay webhook URL**
4. **Test with ₹1 payment**
5. **Monitor first few orders**

Would you like me to help you with any of these steps?
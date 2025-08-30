# Production Image Issue Debugging Guide

## 🔍 Issue Summary
- **Problem**: Color-specific images not loading correctly in production
- **Scope**: Only affects production environment (works fine locally)
- **Symptoms**: When selecting different colors, proxy URLs are generated but images fail to load

## 📊 Current Status
✅ **Local Environment**: All tests pass
- All 58 images use proxy URLs correctly
- Proxy route responds with 200 status
- Sample images load successfully
- Color switching works properly

❌ **Production Environment**: Issues reported
- Color-specific images not loading
- Proxy URLs generated but not displaying images

## 🛠️ Debugging Tools Created

### 1. Production Diagnostics API
**URL**: `https://your-domain.com/api/debug/production-images`

**Purpose**: Tests proxy functionality and environment configuration
- Checks environment variables
- Tests sample Google Drive URLs
- Validates proxy route functionality

### 2. Interactive Debug Page
**URL**: `https://your-domain.com/production-debug`

**Features**:
- Live color switching test
- Real-time image loading status
- URL validation tests
- Environment diagnostics

### 3. Enhanced Proxy Logging
The proxy route now includes:
- Production-specific debugging logs
- In-memory caching to reduce Google Drive requests
- Enhanced error handling with retry logic
- Better headers for debugging

## 🚀 Deployment Steps

### Step 1: Deploy Changes
1. Commit and push all changes
2. Deploy to production (Netlify)
3. Wait for deployment to complete

### Step 2: Run Production Diagnostics
1. Visit: `https://your-domain.com/api/debug/production-images`
2. Check the response:
   ```json
   {
     "environment": "production",
     "hasSheetId": true,
     "hasGoogleCreds": true,
     "sampleUrlTests": [...]
   }
   ```

### Step 3: Test Color Switching
1. Visit: `https://your-domain.com/production-debug`
2. Select different products and colors
3. Monitor image loading status
4. Check browser console for errors

### Step 4: Check Server Logs
Look for these log entries in Netlify Functions:
```
Production proxy request: { url: "...", userAgent: "...", timestamp: "..." }
Proxying image: https://drive.google.com/uc?export=download&id=...
Successfully proxied image, size: XXXXX bytes
```

## 🔧 Potential Production Issues & Solutions

### Issue 1: Rate Limiting
**Symptoms**: 403 or 429 status codes
**Solution**: Enhanced retry logic with different URL formats
**Detection**: Check proxy logs for HTTP status codes

### Issue 2: Netlify Function Timeout
**Symptoms**: 504 errors or function timeouts
**Solution**: Reduced timeout to 15 seconds with faster fallbacks
**Detection**: Check Netlify function logs

### Issue 3: Caching Issues
**Symptoms**: Old images served for new color selections
**Solution**: Added cache-busting headers and in-memory cache management
**Detection**: Check X-Proxy-Cache headers

### Issue 4: CORS in Serverless Environment
**Symptoms**: Different CORS behavior than localhost
**Solution**: Enhanced CORS headers and user agent rotation
**Detection**: Check browser network tab for CORS errors

### Issue 5: Google Drive API Limits
**Symptoms**: Quota exceeded errors
**Solution**: In-memory caching reduces repeated requests
**Detection**: Check Google Drive API usage in Google Console

## 📋 Production Testing Checklist

- [ ] Visit `/api/debug/production-images` - should return 200 OK
- [ ] Check `hasSheetId` and `hasGoogleCreds` are `true`
- [ ] Verify `sampleUrlTests` all return `success: true`
- [ ] Visit `/production-debug` page
- [ ] Test color switching on each product
- [ ] Check browser console for errors
- [ ] Verify images load within 5-10 seconds
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

## 🚨 If Issues Persist

### Check 1: Environment Variables
Ensure these are set in Netlify:
- `LIVE_SHEET_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEETS_PROJECT_ID`

### Check 2: Function Size Limits
- Netlify Functions have a 50MB limit
- Large images might cause issues
- Check function logs for size-related errors

### Check 3: Google Drive Permissions
- Ensure all images are publicly accessible
- Test direct Google Drive URLs in browser
- Check if Google Drive links have changed

### Check 4: CDN/Caching Issues
- Clear Netlify edge cache
- Try accessing images directly: `https://your-domain.com/api/drive-proxy?url=...`
- Check if different regions have different behavior

## 📊 Monitoring Commands

### Test Specific Image URL
```bash
curl -I "https://your-domain.com/api/drive-proxy?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3DFILE_ID"
```

### Check Proxy Response Time
```bash
curl -w "%{time_total}\n" -o /dev/null -s "https://your-domain.com/api/drive-proxy?url=..."
```

## 🎯 Expected Production Results

After deployment, you should see:
1. ✅ All proxy URLs generate correctly
2. ✅ Images load within 5-10 seconds
3. ✅ Color switching works smoothly
4. ✅ No CORS errors in browser console
5. ✅ Consistent behavior across all colors and products

The enhanced proxy with caching, retry logic, and production optimizations should resolve the color-specific image loading issues in production.

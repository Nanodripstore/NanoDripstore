# Production Image Fix - Google Drive Images Not Displaying

## Problem Identified
In production, products are being fetched correctly from Google Sheets, but the images are not displaying properly. The issue was that the cart API route was using raw Google Drive sharing URLs instead of converting them to direct access URLs.

## Root Cause
The cart route (`app/api/user/cart/route.ts`) was manually constructing image arrays using raw `image_url_1`, `image_url_2`, etc. from Google Sheets without processing them through the `convertGoogleDriveUrl` utility function.

## Solution Implemented

### 1. Added Image Processing Helper Function
```typescript
// Helper function to process image URLs
function processImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .filter((url): url is string => Boolean(url) && url.trim().length > 0)
    .map(url => convertGoogleDriveUrl(url.trim()))
    .filter(Boolean);
}
```

### 2. Updated Cart Route Image Handling
Fixed two locations in the cart route where raw image URLs were being used:

**Location 1: Cart Item Enrichment**
```typescript
// Before
images: productData.images || [
  productData.image_url_1,
  productData.image_url_2,
  productData.image_url_3,
  productData.image_url_4
].filter(Boolean)

// After
images: productData.images || processImageUrls([
  productData.image_url_1,
  productData.image_url_2,
  productData.image_url_3,
  productData.image_url_4
])
```

**Location 2: New Cart Item Addition**
```typescript
// Before
const images = [
  productFromSheet.image_url_1,
  productFromSheet.image_url_2,
  productFromSheet.image_url_3,
  productFromSheet.image_url_4
].filter(Boolean)

// After
const images = processImageUrls([
  productFromSheet.image_url_1,
  productFromSheet.image_url_2,
  productFromSheet.image_url_3,
  productFromSheet.image_url_4
])
```

### 3. Added Import Statement
```typescript
import { convertGoogleDriveUrl } from '@/lib/utils'
```

## Verification Steps

### Local Testing
1. ✅ Google Sheets API connection verified
2. ✅ Debug endpoint confirms all environment variables present
3. ✅ Image URL conversion working properly

### Production Deployment
After deploying these changes to production, the images should display correctly because:

1. **Google Sheets Connection**: Already working in production (products are fetched correctly)
2. **Environment Variables**: Already configured in Netlify
3. **Image Conversion**: Now properly converts Google Drive sharing URLs to direct access URLs

## Files Modified
- `app/api/user/cart/route.ts` - Fixed image URL processing

## Why This Fixes the Issue

**Before the fix:**
- Raw Google Drive URLs like: `https://drive.google.com/file/d/1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo/view?usp=sharing`
- These don't work as direct image sources

**After the fix:**
- Converted URLs like: `https://drive.google.com/uc?export=view&id=1D-tPw9jpFnh0HixTt7GUXTh0ew-YNBuo`
- These work as direct image sources for `<img>` tags

## Expected Result
After deploying this fix to production:
- Products will continue to load correctly from Google Sheets
- Images will now display properly (like in localhost)
- Cart images will show the correct product images instead of placeholders

## Additional Notes
- Other API routes (`/api/products/live`, `/api/products/live/[slug]`) were already using the `LiveSheetSyncService` which properly processes images
- The cart route was the only place manually handling raw image URLs
- This fix maintains backward compatibility and doesn't affect any other functionality

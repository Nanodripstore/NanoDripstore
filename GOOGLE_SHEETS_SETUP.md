# Google Sheets Production Setup Guide

## 🚀 Quick Diagnosis

1. **Go to Admin Dashboard** → **Sheet Diagnostic** (`/admin/debug`)
2. **Click "Run Diagnostic"** to identify the issue
3. **Follow the recommendations** provided

## 🔧 Common Production Issues & Solutions

### **Issue 1: Environment Variables Not Set**

**Symptoms:**
- Missing or placeholder environment variables
- "Google Sheets not configured" errors

**Solution:**
Add these environment variables to your production environment (Netlify/Vercel/etc.):

```bash
# Google Sheets API Configuration
GOOGLE_SHEETS_PROJECT_ID="your-project-id"
GOOGLE_SHEETS_PRIVATE_KEY_ID="your-private-key-id"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-content\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SHEETS_CLIENT_ID="your-client-id"
LIVE_SHEET_ID="your-google-sheet-id"
```

> **Note:** Replace the placeholder values with your actual Google Sheets API credentials. You can find these values in your local `.env.local` file.

### **Issue 2: Private Key Format Error**

**Symptoms:**
- "Unable to parse private key" errors
- Authentication failures

**Solution:**
Ensure `GOOGLE_SHEETS_PRIVATE_KEY` includes `\n` characters:
```bash
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd8mx...\n-----END PRIVATE KEY-----\n"
```

### **Issue 3: Sheet Access Denied (403 Error)**

**Symptoms:**
- HTTP 403 errors
- "Permission denied" errors
- "Service account does not have access"

**Solution:**
1. **Open your Google Sheet**
2. **Click "Share" button**
3. **Add the service account email:** `your-service-account@your-project.iam.gserviceaccount.com`
4. **Set permission to "Viewer"**
5. **Click "Send"**

### **Issue 4: Sheet Not Found (404 Error)**

**Symptoms:**
- HTTP 404 errors
- "Sheet not found" errors

**Solution:**
1. **Verify Sheet ID** in URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
2. **Copy the Sheet ID** (between `/d/` and `/edit`)
3. **Update `LIVE_SHEET_ID`** environment variable

### **Issue 5: Project ID Mismatch**

**Symptoms:**
- "Project not found" errors
- Authentication issues

**Solution:**
1. **Go to Google Cloud Console**
2. **Check your project ID** (top dropdown)
3. **Update `GOOGLE_SHEETS_PROJECT_ID`** environment variable

## 🎯 Step-by-Step Production Setup

### **For Netlify:**

1. **Go to Netlify Dashboard**
2. **Site Settings → Environment Variables**
3. **Add each variable individually**
4. **Deploy the site**

### **For Vercel:**

1. **Go to Vercel Dashboard**
2. **Project Settings → Environment Variables**
3. **Add each variable individually**
4. **Redeploy the project**

### **For Other Platforms:**

1. **Add environment variables to your platform's config**
2. **Ensure variables are available at build time and runtime**
3. **Redeploy the application**

## 🔍 Testing the Connection

1. **Visit `/admin/debug` on your live site**
2. **Click "Run Diagnostic"**
3. **Check all status indicators are green**
4. **Verify sample data is visible**

## 🆘 Still Having Issues?

If the diagnostic shows errors:

1. **Check the specific error message**
2. **Follow the recommendations provided**
3. **Verify all environment variables are correctly set**
4. **Ensure the service account has access to the sheet**
5. **Try clearing the cache** via `/admin` → "Clear Sheet Cache"

## 📞 Support Endpoints

- **Diagnostic Tool:** `/admin/debug`
- **Cache Control:** `/admin` (Cache Control Panel)
- **Manual API Test:** `/api/debug/sheet`
- **Clear Cache:** `/api/admin/clear-sheet-cache`

The diagnostic tool will tell you exactly what's wrong and how to fix it! 🚀

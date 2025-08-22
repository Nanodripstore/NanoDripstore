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
GOOGLE_SHEETS_PROJECT_ID="nanodrip-store"
GOOGLE_SHEETS_PRIVATE_KEY_ID="266b1592eb3e1fc7e29c587c6c0ab43bc02dbc1d"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDXd8mxuCFBAvH5\n7nrXX3VgzK0bHhJdEfHqkpxN/hyFK9OGqEZ5gtAxQ+pO5kHYmcHqM1z/q+cXAYGI\nb90n6VmYjVg9fiHUI4YOTh5F9dk+c59YHI5sIJ6ggdaI7aHjWiGzNoyXsbyy3+8c\n0zEuqGTyq8MroIPcFoZuM5Ths3saftPNyZX0J21oOaRegYinthPps0uMydRsVQmp\nYCzU7KaMdDpzHM1hV4l07A3tBonsBN10A7xyvRl3KLgXDGIqViMmKqQLv7YzI8gF\nwnWP9Hw9ir+KKfP+wCKAQY2wXCHAVMHyVgDdnBfJ93/Qnxpk2MDTl27EexM9T/G3\nquUnw4GXAgMBAAECggEAFjkNR759SjPq5SOK7pUH3tioBKNQsuIGQ3Kk8F5ZxAUb\nJ0j1ISneyICqtUHbtLgBtLgLdXXeEGoKrsRq2OehDVzhUaZQCDiJu7FO6gRLSGer\nHZlZuck7fcPRGVpOV3aVAeOJvfOKSiCn4XSJdA3Q1j6Pk1EA3ehCK9ziFCKWJcs9\nINsnZG2TpmdFB//VHsbc02GkHWxK2wWnQv4iEv9BLfYfQaDA+P1KA4P6+ytTV1K8\nAZ06LLhO7HEtqHu93caduaIMjWsAxaqVwOPo59hJy32aX9MkyhoS5G/XQcZm1jTT\ngq6u5A8DkMMJZszRTq/Ll9yW/RP6sQJaM4LmLzhsQQKBgQDtJXyQS7hwNJIg2dVA\nM8AbVObmEWHsl4af+OpVbXy2cCVWttnh5hFlXU9BVTn0/zc/vGmDy0lOdP5Vy/gu\nn0ogBqDNSEpL5oKP6WlwOKDzxrrdBewQ71q68NsifxEZf0wASYKEpIu0EFasxor9\nGER3k/qwnRREPLjzc1Ezy+3IMQKBgQDomRcbIq2NoITEaSThafAG/Txrk8fxP/gd\nDyrJPz2vhynNmfkLLcZXxZQetbUoE7v+DehMoMsklsCWMV90mlrVVlZf1eHNWejs\nVT8fgidpUK79jgGRqRrU624oEeVupB/LWTVkVZ/Rfb1s41Agmaxc9KqMDBIbV9yI\nowsHQF28RwKBgBnolotNOoFHvQ9JvTqebMaPqApKq+AlTdf8Yd2jcJSd+/ZVU8iS\nUiQ45YfFv+c8WtTjyMNVWlTwAzlsZ1jwnjCRiM/krflM3cbLQXG5PhxkAdZT506S\nV99EoSxLpZqbhboiTdggAgNSJaYKqvSryg8mY6UYBDbQS4SNfLmj9f6BAoGBAODz\nHguaUCsGsSCbZ5WxtPetdf+8nsRNT5IbFxAm32ug1ucHIHqVPJuqdAP3TEqEO24K\n2T0yzQSH353iBiVpGqv0ofhxi73kVIYsM64vXBpYc8S4z/+lglOllZWfKTsF89Hg\nZuiwfq5GYyqp9NZyiOYlocNr8R8MrDZhKMtMjtsFAoGAK5OpWRq4E776id5+FJDk\nutI8g+nZyAif3kK+JRMQ3r2Mkcy1fR7nryxXUTveXsyTpVUv4cR/pvQ/4Ax4Ov1J\n3qBo4kDIlfQoOx6lzACHYFG0NpP3h8TjDQQaski/LD85HmOguoR4Jg93M9nzSvaa\nGUvVxxVLjWwLvCUBGEE/A+4=\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="sheet-reader-2025@nanodrip-store.iam.gserviceaccount.com"
GOOGLE_SHEETS_CLIENT_ID="111104283473602447170"
LIVE_SHEET_ID="1e3edGQvk3rvrMs8HtofRWlsDrE2XHISyyFykF7jMz8g"
```

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
3. **Add the service account email:** `sheet-reader-2025@nanodrip-store.iam.gserviceaccount.com`
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

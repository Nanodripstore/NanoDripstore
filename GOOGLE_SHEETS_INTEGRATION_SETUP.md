# Google Sheets Integration Setup Guide

This guide will help you configure Google Sheets integration for your e-commerce site, allowing products to be managed directly from a Google Sheet.

## 🎯 What This Does

Your website will:
- Fetch product data directly from a Google Sheet
- Display products in real-time from the sheet
- Allow you to manage products by simply editing the sheet
- No need to manually update the database - the sheet becomes your product database

## 📋 Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Your project running on localhost:3000

## 🚀 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

## 🔧 Step 2: Enable Google Sheets API

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**

## 🔑 Step 3: Create Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Fill in the details:
   - **Service account name**: `sheet-reader`
   - **Description**: `Service account for reading product data from Google Sheets`
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

## 📝 Step 4: Generate Service Account Key

1. In the **Credentials** page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key > Create New Key**
5. Choose **JSON** format
6. Click **Create** - this will download a JSON file

## 📊 Step 5: Create Your Product Sheet

1. Create a new Google Sheet
2. Set up columns exactly as shown below:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| product_id | name | description | category | type | base_price | color_name | color_hex | size | variant_sku | variant_price | stock_quantity | image_url_1 | image_url_2 | image_url_3 | tags | is_new | is_bestseller | is_active | created_date |

### Sample Data Row:
```
1 | Classic T-Shirt | Comfortable cotton t-shirt | T-Shirts | Apparel | 29.99 | Red | #FF0000 | M | TSHIRT-RED-M | 29.99 | 50 | https://example.com/img1.jpg | https://example.com/img2.jpg | https://example.com/img3.jpg | cotton,casual,summer | TRUE | FALSE | TRUE | 2024-01-01
```

### Important Rules:
- **product_id**: Must be numbers only (1, 2, 3, ...)
- **Each row = one variant** (same product_id with different colors/sizes)
- **All fields required** - no auto-generation
- **Boolean fields**: Use TRUE/FALSE
- **Dates**: Use YYYY-MM-DD format

## 🔧 Step 6: Share Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from the JSON file, field: `client_email`)
4. Give **Viewer** permissions
5. Click **Send**

## 📋 Step 7: Get Sheet ID

From your sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
Copy the **SHEET_ID_HERE** part.

## ⚙️ Step 8: Configure Environment Variables

Open your `.env.local` file and update:

```bash
# Google Sheets API Configuration
GOOGLE_SHEETS_PROJECT_ID="your-actual-project-id"
GOOGLE_SHEETS_PRIVATE_KEY_ID="key_id_from_json"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@your-project-id.iam.gserviceaccount.com"
GOOGLE_SHEETS_CLIENT_ID="client_id_from_json"

# Live Sheet Configuration
LIVE_SHEET_ID="your_actual_sheet_id"
```

### 🔍 Where to Find Each Value (from your downloaded JSON):

- `GOOGLE_SHEETS_PROJECT_ID`: `"project_id"` field
- `GOOGLE_SHEETS_PRIVATE_KEY_ID`: `"private_key_id"` field  
- `GOOGLE_SHEETS_PRIVATE_KEY`: `"private_key"` field (keep the \\n characters)
- `GOOGLE_SHEETS_CLIENT_EMAIL`: `"client_email"` field
- `GOOGLE_SHEETS_CLIENT_ID`: `"client_id"` field

## 🧪 Step 9: Test the Integration

1. Restart your development server: `npm run dev`
2. Visit: `http://localhost:3000/api/products/live`
3. You should see your products from the sheet!

## 🎨 Step 10: Verify Frontend

1. Visit your homepage: `http://localhost:3000`
2. Check the shop page: `http://localhost:3000/shop`
3. Products should now load from your Google Sheet!

## 🔧 Troubleshooting

### Error: "Google Sheets not configured"
- Check that all environment variables are set correctly
- Make sure there are no placeholder values left

### Error: "DECODER routines::unsupported"
- Your private key format might be incorrect
- Ensure the private key includes `\\n` characters, not actual line breaks

### Error: "The caller does not have permission"
- Make sure you shared the sheet with the service account email
- Check that the service account has Viewer access

### Empty Products Response
- Verify your sheet has the correct column headers in row 1
- Check that you have data starting from row 2
- Ensure product_id values are numeric

## 📚 API Endpoints

After setup, these endpoints will be available:

- `GET /api/products/live` - Fetch products from sheet
- `GET /api/products/live?query=shirt` - Search products
- `GET /api/products/live?category=T-Shirts` - Filter by category
- `GET /api/products/live?limit=10&page=2` - Pagination
- `POST /api/products/sync` - Manual sync sheet to database

## 🎯 Next Steps

1. Add your actual products to the sheet
2. Test different product variations (colors, sizes)
3. Use the admin panel for additional management: `http://localhost:3000/admin`
4. Set up automated syncing if needed

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are correctly set
3. Test the API endpoint directly: `/api/products/live`
4. Ensure your Google Sheet format exactly matches the template

Your product management is now completely driven by Google Sheets! 🎉

# Qikink Order Debugging Guide

## Issue: Orders not appearing in Qikink dashboard

### 🧪 **Debugging Steps**

#### Step 1: Check if webhook is being called
1. **Check server console** after making a payment
2. Look for logs starting with `🚀 WEBHOOK STARTED`
3. If no logs appear, webhooks aren't reaching your server

#### Step 2: Manual webhook test
Visit in browser: `http://localhost:3000/api/test/webhook`
Should show: `{ "message": "Test webhook endpoint is active" }`

#### Step 3: Manual Qikink order creation
1. Make a Razorpay payment first
2. Call: `POST http://localhost:3000/api/test/manual-qikink`
3. Check response for detailed error information

#### Step 4: Check webhook URL configuration
- **Development**: Webhooks need public URL (use ngrok, tunnel, or deploy)
- **Production**: Configure webhook URL in Razorpay Dashboard

---

### 🔧 **Most Likely Issues & Solutions**

#### Issue 1: Webhook URL not reachable (MOST COMMON)
**Problem**: Razorpay can't reach `localhost:3000` in development
**Solution**: 
- Deploy to production (Vercel/Netlify)
- OR use ngrok: `ngrok http 3000`
- Configure webhook URL in Razorpay Dashboard

#### Issue 2: Webhook secret mismatch
**Problem**: Wrong webhook secret in .env.local
**Solution**: 
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Copy the exact webhook secret
3. Update `RAZORPAY_WEBHOOK_SECRET` in .env.local

#### Issue 3: Order data format issues
**Problem**: Missing or malformed order data
**Solution**: Use manual test endpoint to debug

---

### 📋 **Razorpay Dashboard Webhook Setup**

1. **Login to Razorpay Dashboard**
2. **Go to Settings → Webhooks**
3. **Add webhook URL**:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/razorpay`
   - Production: `https://your-domain.com/api/webhooks/razorpay`
4. **Select events**: `payment.captured`, `payment.failed`
5. **Copy webhook secret** and update in .env.local

---

### 🚨 **Quick Fix for Development**

If you need immediate testing:
1. **Use manual trigger**: Call `/api/test/manual-qikink` after payment
2. **Check logs** for detailed error information
3. **Deploy to test webhooks** properly

---

### 📊 **Expected Log Flow**

Successful webhook should show:
```
🚀 WEBHOOK STARTED - Razorpay webhook received
✅ Webhook signature verified successfully
📨 Razorpay webhook event: payment.captured
🔍 Looking for Razorpay order with ID: order_xyz123
📋 Found order: 1694612345 (Razorpay: order_xyz123)
🚀 Sending to Qikink: { "order_number": "1694612345", ... }
✅ Qikink order created successfully
✅ WEBHOOK COMPLETED SUCCESSFULLY
```
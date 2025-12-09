# WhatsApp Business Cloud API Setup Guide

## 📋 Prerequisites
1. Facebook Developer Account
2. Meta Business Account
3. WhatsApp Business Phone Number

## 🚀 Quick Setup Steps

### 1. Create Meta App
1. Go to: https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Choose **"Business"** type
4. Enter App Name: `WhatsApp Business Bot`
5. Add your email

### 2. Add WhatsApp Product
1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set up"**
3. You'll see:
   - **Phone Number ID** (copy this)
   - **WhatsApp Business Account ID**
   - **Temporary Access Token** (24 hours only)

### 3. Get Permanent Access Token
1. Go to **"Settings" → "Business Settings"**
2. Click **"System Users"**
3. Create a new System User (e.g., "WhatsApp Bot Admin")
4. Assign permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
5. Generate Token → **Never expires**
6. Copy this token ✅

### 4. Setup Webhook
1. In WhatsApp settings, go to **"Configuration"**
2. Click **"Edit"** next to Webhook
3. Enter:
   - **Callback URL**: `https://your-railway-url.up.railway.app/webhook`
   - **Verify Token**: `akram_whatsapp_2025` (or any secret)
4. Subscribe to: `messages`, `message_status`

### 5. Add Test Phone Number
1. In **"API Setup"**, add your phone number for testing
2. You'll receive a verification code via WhatsApp
3. Enter the code

### 6. Configure Railway
Add these environment variables in Railway:
```bash
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WEBHOOK_VERIFY_TOKEN=akram_whatsapp_2025
```

### 7. Test
Send a message to your WhatsApp Business number:
```
مرحبا
```

Bot should reply with the main menu! 🎉

## 🔗 Useful Links
- Developer Console: https://developers.facebook.com/
- API Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api/
- Business Manager: https://business.facebook.com/

## 📞 Test Numbers
During development, you can add up to 5 phone numbers for testing.
After app review, you can message anyone!

## 💰 Pricing
- First 1,000 conversations/month: **FREE**
- After that: ~$0.005 - $0.09 per conversation
- Very affordable for small to medium businesses

## ⚠️ Important Notes
1. **Temporary Token** expires in 24 hours - get permanent one!
2. **Webhook URL** must be HTTPS (Railway provides this)
3. **Phone Number** must be verified and not used on another WhatsApp account
4. For production use, submit app for **Business Verification**

## 🎯 Next Steps
1. Get your credentials from Meta
2. Update Railway environment variables
3. Deploy the new `whatsapp-server-cloud-api.js`
4. Configure webhook in Meta console
5. Test with your phone!

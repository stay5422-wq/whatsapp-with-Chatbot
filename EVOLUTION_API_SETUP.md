# Evolution API Setup Guide

## نشر Evolution API على Railway

### الخطوات:

#### 1. إنشاء مشروع جديد على Railway:

1. اذهب إلى [Railway.app](https://railway.app)
2. اضغط **"New Project"**
3. اختر **"Deploy from GitHub repo"**
4. اضغط **"Deploy from Template"** بدلاً من ذلك
5. في خانة البحث، ابحث عن: `evolution-api`
6. أو استخدم هذا الرابط المباشر:
   ```
   https://github.com/EvolutionAPI/evolution-api
   ```

#### 2. أو النشر المباشر (الطريقة الأسرع):

اضغط على هذا الزر في Railway:
- اذهب لـ **"New Project"**
- اختر **"Empty Project"**
- اضغط **"+ New"** → **"GitHub Repo"**
- ابحث عن `evolution-api` أو استخدم Docker image

#### 3. استخدام Docker على Railway (الأسهل):

1. **New Project** على Railway
2. اضغ **"+ New"** → **"Empty Service"**
3. اذهب لـ **Settings** → **"Source"**
4. اختر **"Docker Image"**
5. استخدم Image: `atendai/evolution-api:latest`

#### 4. إعداد المتغيرات (Variables):

بعد إنشاء المشروع، أضف هذه المتغيرات:

```bash
# Server Configuration
SERVER_URL=https://your-evolution-app.railway.app
SERVER_PORT=8080

# API Configuration
AUTHENTICATION_API_KEY=your-secret-api-key-here

# Database (اختياري - للإنتاج)
DATABASE_ENABLED=false

# Webhook
WEBHOOK_GLOBAL_URL=https://your-vercel-app.vercel.app/api/whatsapp/webhook
WEBHOOK_GLOBAL_ENABLED=true

# Storage
STORE_MESSAGES=true
STORE_CONTACTS=true

# Other Settings
LOG_LEVEL=ERROR
LOG_COLOR=true
DEL_INSTANCE=false
```

#### 5. الحصول على رابط Evolution API:

بعد النشر:
- اذهب لـ **Settings** → **Networking**
- انسخ الرابط (Domain): مثل `https://evolution-api-production.up.railway.app`

#### 6. اختبار Evolution API:

افتح في المتصفح:
```
https://your-evolution-url.railway.app/
```

يجب أن تظهر صفحة Evolution API Dashboard.

---

## الخطوة التالية:

بعد نشر Evolution API، سنقوم بـ:
1. تحديث الواجهة الأمامية لاستخدام Evolution API
2. إضافة endpoints جديدة للتواصل مع Evolution API
3. إضافة Twilio للمكالمات

---

## ملاحظات مهمة:

⚠️ **API Key مهم جداً!** احفظه في مكان آمن
⚠️ **SERVER_URL** لازم يكون رابط Railway الخاص بـ Evolution API
⚠️ **WEBHOOK_GLOBAL_URL** لازم يكون رابط Vercel الخاص بموقعك

---

## Troubleshooting:

### مشكلة: لا يعمل Evolution API
**الحل:** تحقق من Logs في Railway → View Logs

### مشكلة: QR Code لا يظهر
**الحل:** تأكد من SERVER_PORT=8080 و SERVER_URL صحيح

### مشكلة: الاتصال ينقطع
**الحل:** تأكد من DATABASE_ENABLED=true أو استخدم MongoDB

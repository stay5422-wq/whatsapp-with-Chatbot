# 📋 خطوات التجهيز والنشر - بالترتيب

## ✅ الحالة الحالية
- التطبيق يعمل محلياً على: http://localhost:3002
- جميع الميزات الأساسية جاهزة
- لا توجد أخطاء في الكود

---

## 🎯 الخطوة 1: إنشاء ملف البيئة

```bash
# انسخ ملف البيئة النموذجي
copy .env.example .env.local
```

ثم افتح `.env.local` وأضف المتغيرات (اتركها فارغة الآن):

```env
# WhatsApp Business API (سنملأها في الخطوة 3)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=my_secret_token_123

# Application URL
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## 🎯 الخطوة 2: تجهيز Git وGitHub

### أ) تهيئة Git
```bash
cd "d:\whatsapp p"
git init
git add .
git commit -m "🚀 WhatsApp Inbox - Initial commit"
```

### ب) إنشاء Repository على GitHub
1. اذهب إلى: https://github.com/new
2. اسم المشروع: `whatsapp-inbox`
3. اجعله Private
4. اضغط "Create repository"

### ج) رفع الكود
```bash
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-inbox.git
git branch -M main
git push -u origin main
```

✅ **تحقق**: تأكد أن الكود ظهر على GitHub

---

## 🎯 الخطوة 3: إعداد WhatsApp Business API

### أ) إنشاء حساب Meta Business
1. اذهب إلى: https://business.facebook.com
2. أنشئ Business Account أو استخدم موجود
3. أكمل البيانات المطلوبة

### ب) إنشاء تطبيق على Meta Developers
1. اذهب إلى: https://developers.facebook.com/apps
2. اضغط "Create App"
3. اختر "Business" → Continue
4. اسم التطبيق: "WhatsApp Inbox"
5. اختر Business Account
6. اضغط "Create App"

### ج) إضافة WhatsApp للتطبيق
1. في لوحة التطبيق → "Add Product"
2. ابحث عن "WhatsApp" → Setup
3. في WhatsApp → Getting Started

### د) احصل على البيانات المطلوبة

#### 1. Phone Number ID:
- في WhatsApp → API Setup
- انسخ "Phone Number ID"

#### 2. Access Token (الأهم):
- في WhatsApp → API Setup
- اضغط "Generate" أو "Create"
- **مهم جداً**: اجعله دائم:
  - اذهب إلى: https://developers.facebook.com/tools/accesstoken
  - اختر تطبيقك
  - اضغط "Debug"
  - اضغط "Extend Access Token"
  - احفظ Token الجديد

#### 3. Business Account ID:
- في Settings → Basic
- ابحث عن "WhatsApp Business Account ID"

### هـ) اختبار API
```bash
# في PowerShell، جرب إرسال رسالة تجريبية
$headers = @{
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    messaging_product = "whatsapp"
    to = "966512345678"
    type = "text"
    text = @{
        body = "مرحباً من المسار الساخن! 🔥"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" -Method Post -Headers $headers -Body $body
```

✅ **تحقق**: يجب أن تصلك رسالة WhatsApp

---

## 🎯 الخطوة 4: النشر على Vercel

### أ) تسجيل الدخول
1. اذهب إلى: https://vercel.com
2. سجل الدخول بـ GitHub
3. امنح Vercel الصلاحيات

### ب) استيراد المشروع
1. اضغط "New Project"
2. اختر `whatsapp-inbox` من GitHub
3. اضغط "Import"

### ج) إضافة Environment Variables
قبل Deploy، أضف المتغيرات:

```
WHATSAPP_API_URL = https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID = (من الخطوة 3)
WHATSAPP_ACCESS_TOKEN = (من الخطوة 3)
WHATSAPP_BUSINESS_ACCOUNT_ID = (من الخطوة 3)
WHATSAPP_VERIFY_TOKEN = my_secret_token_123
NEXT_PUBLIC_API_URL = https://YOUR-APP.vercel.app
```

### د) Deploy
1. اضغط "Deploy"
2. انتظر 2-3 دقائق
3. احصل على رابط التطبيق: `https://YOUR-APP.vercel.app`

✅ **تحقق**: افتح الرابط وسجل دخول (admin/admin123)

---

## 🎯 الخطوة 5: ربط Webhook

### أ) إعداد Webhook في Meta
1. في WhatsApp → Configuration
2. في Webhooks:
   - Callback URL: `https://YOUR-APP.vercel.app/api/whatsapp/webhook`
   - Verify Token: `my_secret_token_123` (نفس اللي في .env)
3. اضغط "Verify and Save"

### ب) الاشتراك في الأحداث
1. Subscribe to: `messages`
2. Subscribe to: `message_status`
3. اضغط "Save"

✅ **تحقق**: يجب أن يظهر ✅ أخضر بجانب Webhook

---

## 🎯 الخطوة 6: اختبار النظام الكامل

### أ) اختبار استقبال الرسائل
1. افتح WhatsApp على هاتفك
2. أرسل رسالة لرقم WhatsApp Business
3. يجب أن تظهر الرسالة في التطبيق

### ب) اختبار البوت
1. أرسل أي رسالة
2. يجب أن يرد البوت برسالة الترحيب
3. اختر خيار من القائمة
4. تأكد من تدفق المحادثة

### ج) اختبار إرسال الرسائل
1. في التطبيق، افتح محادثة
2. اكتب رسالة وأرسلها
3. تأكد وصولها على WhatsApp

---

## 🎯 الخطوة 7: إضافة قاعدة بيانات (اختياري)

### خيار 1: MongoDB Atlas (مجاني)

1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. سجل حساب جديد
3. Create Free Cluster
4. Database Access → Add User
5. Network Access → Add IP (0.0.0.0/0 للسماح للجميع)
6. Connect → Connect your application
7. انسخ Connection String

في Vercel → Settings → Environment Variables:
```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/whatsapp_inbox
```

### خيار 2: Supabase (مجاني)

1. اذهب إلى: https://supabase.com
2. New Project
3. Settings → Database → Connection String
4. انسخ URI

في Vercel:
```
DATABASE_URL = postgresql://...
```

---

## 🎯 الخطوة 8: تفعيل HTTPS و Domain مخصص (اختياري)

### إذا كان لديك Domain:

1. في Vercel → Settings → Domains
2. أضف Domain الخاص بك
3. اتبع تعليمات DNS
4. انتظر التفعيل (دقائق)

Vercel يعطيك SSL مجاني تلقائياً ✅

---

## 🎯 الخطوة 9: المراقبة والصيانة

### أ) Vercel Logs
- في Vercel → Project → Logs
- راقب الأخطاء والطلبات

### ب) Meta Webhooks Logs
- في Meta Developers → WhatsApp → Webhooks
- راقب Webhook Events

### ج) تحديثات الكود
```bash
# عند إجراء تعديلات
git add .
git commit -m "وصف التعديلات"
git push

# Vercel سيعمل Deploy تلقائي
```

---

## 📊 Checklist النهائي

### قبل الإطلاق:
- [ ] التطبيق يعمل محلياً بدون أخطاء
- [ ] Git repository جاهز على GitHub
- [ ] WhatsApp Business API مُعد بالكامل
- [ ] Access Token دائم (Never Expire)
- [ ] Vercel deployment ناجح
- [ ] Environment Variables محدثة
- [ ] Webhook مفعّل ويعمل
- [ ] اختبار استقبال الرسائل ✅
- [ ] اختبار إرسال الرسائل ✅
- [ ] البوت يرد تلقائياً ✅

### بعد الإطلاق:
- [ ] مراقبة Logs يومياً
- [ ] اختبار الرسائل بانتظام
- [ ] التحقق من Quotas في Meta
- [ ] نسخ احتياطي للمحادثات
- [ ] تحديث Access Token قبل انتهائه

---

## 🆘 حل المشاكل الشائعة

### مشكلة 1: Webhook Verification فشل
**الحل**:
- تأكد أن Verify Token متطابق بين Meta و .env
- تأكد أن URL صحيح وينتهي بـ `/api/whatsapp/webhook`
- تأكد أن التطبيق deployed على Vercel

### مشكلة 2: لا يمكن إرسال رسائل
**الحل**:
- تحقق من Access Token (ليس منتهي)
- تحقق من Phone Number ID صحيح
- تحقق من رقم المستلم بصيغة دولية: 966512345678

### مشكلة 3: البوت لا يرد
**الحل**:
- تحقق من Webhook مفعّل
- تحقق من Logs في Vercel
- تحقق من أن رقم WhatsApp مفعّل

### مشكلة 4: خطأ 429 - Too Many Requests
**الحل**:
- وصلت للـ Rate Limit
- انتظر قليلاً
- راجع Quotas في Meta Dashboard

---

## 📞 مصادر المساعدة

- **Meta Docs**: https://developers.facebook.com/docs/whatsapp
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Copilot**: أنا هنا دائماً! 🤖

---

## 🎉 تهانينا!

إذا أكملت جميع الخطوات، تطبيق WhatsApp Inbox الخاص بك:
- ✅ يعمل على الإنترنت 24/7
- ✅ مربوط بـ WhatsApp Business API
- ✅ البوت يرد تلقائياً
- ✅ يدعم جميع أنواع الرسائل
- ✅ لوحة تحكم كاملة للموظفين
- ✅ مجاني بالكامل!

---

**آخر تحديث**: ديسمبر 2025  
**الحالة**: ✅ جاهز للإنتاج

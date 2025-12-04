# 🚀 خطوات سريعة للنشر

## الطريقة الأسهل: Vercel (مجاني)

### 1. إعداد GitHub
```bash
git init
git add .
git commit -m "WhatsApp Inbox App"
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-inbox.git
git push -u origin main
```

### 2. النشر على Vercel
1. اذهب إلى: https://vercel.com
2. اضغط "New Project"
3. استورد Repository من GitHub
4. أضف Environment Variables:
   - `WHATSAPP_API_URL`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_VERIFY_TOKEN`
5. اضغط "Deploy"

✅ خلال 3 دقائق سيكون تطبيقك جاهز!

---

## ربط WhatsApp API - خطوات سريعة

### 1. إنشاء تطبيق Meta
- اذهب إلى: https://developers.facebook.com
- Create App → Business → WhatsApp
- احفظ:
  - Phone Number ID
  - Access Token
  - Business Account ID

### 2. إعداد Webhook
- في Meta Dashboard → WhatsApp → Configuration
- Webhook URL: `https://your-app.vercel.app/api/whatsapp/webhook`
- Verify Token: اختر أي كلمة سر (مثل: `secret123`)
- Subscribe: messages + message_status

### 3. اختبار
```javascript
// في Browser Console على تطبيقك
fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    to: '966512345678',
    message: 'مرحباً! 🔥',
    type: 'text'
  })
}).then(r => r.json()).then(console.log);
```

---

## الملفات المهمة

✅ تم إنشاء:
- `app/api/whatsapp/webhook/route.ts` - استقبال رسائل WhatsApp
- `app/api/whatsapp/send/route.ts` - إرسال رسائل
- `lib/whatsappService.ts` - وظائف مساعدة
- `.env.example` - مثال للمتغيرات
- `DEPLOYMENT_GUIDE.md` - دليل كامل

---

## التكاليف

| الخدمة | السعر | الملاحظات |
|--------|-------|-----------|
| Vercel | مجاني | حتى 100GB bandwidth |
| WhatsApp API | مجاني | 1000 محادثة/شهر |
| MongoDB Atlas | مجاني | 512MB storage |

---

## الدعم السريع

**مشكلة**: لا أعرف كيف أحصل على WhatsApp API
**الحل**: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

**مشكلة**: Webhook لا يعمل
**الحل**: تأكد أن URL صحيح وVerify Token متطابق

**مشكلة**: لا يمكن إرسال رسائل
**الحل**: تحقق من Access Token وأنه دائم (Never expire)

---

للمزيد من التفاصيل، راجع: `DEPLOYMENT_GUIDE.md`

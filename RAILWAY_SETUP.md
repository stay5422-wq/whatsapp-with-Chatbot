# 🚀 خطوات رفع WhatsApp Server على Railway

## الخطوة 1️⃣: إنشاء مشروع على Railway

1. افتح [Railway.app](https://railway.app)
2. اضغط **"New Project"**
3. اختر **"Deploy from GitHub repo"**
4. اختر repository: `whatsapp-with-Chatbot`

## الخطوة 2️⃣: ضبط الإعدادات

### في Railway Dashboard:

1. **Settings → Environment**
2. أضف المتغيرات التالية:
   ```
   PORT=8080
   NODE_ENV=production
   ```

3. **Settings → Deploy**
   - Start Command: `node whatsapp-server.js`
   - Root Directory: `/`

## الخطوة 3️⃣: الحصول على URL

بعد النشر:
1. اذهب إلى **Settings → Domains**
2. اضغط **"Generate Domain"**
3. انسخ الـ URL (مثال: `https://whatsapp-server-production.up.railway.app`)

## الخطوة 4️⃣: إضافة URL على Vercel

1. افتح [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. **Settings → Environment Variables**
4. أضف:
   ```
   WHATSAPP_SERVER_URL=https://your-railway-url.up.railway.app
   ```
5. اضغط **Save**
6. **Deployments → Redeploy**

## الخطوة 5️⃣: التحقق

1. افتح: `https://your-railway-url.up.railway.app/health`
2. يجب أن ترى: `{"status":"ok","isReady":false}`

## ⚠️ ملاحظات مهمة:

### 1. الملفات المطلوبة على Railway:
- ✅ `whatsapp-server.js` - السيرفر الرئيسي
- ✅ `Dockerfile` - لبناء الصورة
- ✅ `package.json` - التبعيات
- ✅ `railway.json` - إعدادات Railway

### 2. التبعيات المطلوبة:
```json
{
  "whatsapp-web.js": "^1.34.2",
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "qrcode-terminal": "^0.12.0"
}
```

### 3. Dockerfile يجب أن يحتوي على:
- Chromium installation
- Node.js 22
- All dependencies

## 🔧 استكشاف الأخطاء:

### إذا ظهر خطأ 404:
```bash
# تحقق من logs في Railway
# اذهب إلى: Deployments → View Logs
```

### إذا ظهر "WhatsApp server not available":
```bash
# تحقق من:
1. Railway service شغال
2. PORT = 8080
3. Start command صحيح
4. Chromium مثبت
```

### إذا لم يظهر QR Code:
```bash
# في Railway logs، ابحث عن:
"🔥 Scan this QR code with your WhatsApp"
```

## 📱 بعد الربط الناجح:

1. افتح: `https://your-vercel-url.vercel.app`
2. سجل دخول بحساب المدير
3. افتح الإعدادات ⚙️
4. اختر تبويب "ربط واتساب"
5. اضغط "فتح صفحة الربط"
6. امسح QR Code من هاتفك

## ✅ تأكد من:

- [x] Railway service شغال
- [x] Vercel service شغال  
- [x] WHATSAPP_SERVER_URL مضافة على Vercel
- [x] PORT=8080 على Railway
- [x] Chromium مثبت في Dockerfile
- [x] whatsapp-server.js يشتغل بدون أخطاء

---

## 🆘 محتاج مساعدة؟

تحقق من Railway logs:
```
Railway Dashboard → Your Project → Deployments → View Logs
```

البحث عن:
- ✅ "WhatsApp Server running on port"
- ✅ "Waiting for QR Code scan"
- ❌ أي رسائل خطأ

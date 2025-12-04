# دليل رفع التطبيق والربط مع WhatsApp Business API

> **⚠️ IMPORTANT:** If you're getting Chrome/Puppeteer errors, see **[CHROME_FIX.md](./CHROME_FIX.md)** first!

## 📋 المحتويات
1. [إعداد WhatsApp Business API](#whatsapp-api)
2. [رفع التطبيق على Vercel](#vercel)
3. [رفع التطبيق على Netlify](#netlify)
4. [رفع التطبيق على VPS](#vps)
5. [ربط قاعدة البيانات](#database)
6. [Fix Chrome Errors](#chrome-fix)

---

## 🔗 إعداد WhatsApp Business API {#whatsapp-api}

### الخطوة 1: إنشاء حساب Meta Business

1. اذهب إلى [Meta Business Suite](https://business.facebook.com)
2. أنشئ حساب Business جديد أو استخدم حساب موجود
3. أضف رقم هاتف للواتساب

### الخطوة 2: إعداد WhatsApp Business API

1. اذهب إلى [Meta Developers](https://developers.facebook.com)
2. أنشئ تطبيق جديد → اختر "Business"
3. أضف منتج "WhatsApp" للتطبيق
4. في إعدادات WhatsApp:
   - انسخ **Phone Number ID**
   - انسخ **Access Token** (اجعله دائم)
   - انسخ **Business Account ID**

### الخطوة 3: إعداد Webhook

1. في لوحة Meta Developers → WhatsApp → Configuration
2. أضف Webhook URL:
   ```
   https://your-domain.com/api/whatsapp/webhook
   ```
3. Verify Token: اختر أي كلمة سرية (مثل: `my_secret_token_123`)
4. Subscribe to fields:
   - ✅ messages
   - ✅ message_status

### الخطوة 4: إعداد ملف البيئة

أنشئ ملف `.env.local`:

```bash
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=my_secret_token_123

# Application
NEXT_PUBLIC_API_URL=https://your-domain.com
```

---

## ☁️ رفع التطبيق على Vercel {#vercel}

### الطريقة الأولى: عبر GitHub

1. **رفع الكود على GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/whatsapp-inbox.git
git push -u origin main
```

2. **ربط مع Vercel**:
   - اذهب إلى [Vercel](https://vercel.com)
   - اضغط "New Project"
   - استورد Repository من GitHub
   - Vercel سيكتشف Next.js تلقائياً

3. **إضافة Environment Variables**:
   - في لوحة Vercel → Settings → Environment Variables
   - أضف جميع المتغيرات من `.env.local`

4. **Deploy**:
   - اضغط "Deploy"
   - انتظر حتى ينتهي البناء (2-3 دقائق)
   - احصل على رابط التطبيق: `https://your-app.vercel.app`

### الطريقة الثانية: Vercel CLI

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# رفع التطبيق
vercel

# للرفع على Production
vercel --prod
```

---

## 🌐 رفع التطبيق على Netlify {#netlify}

### إعداد Build Settings

أنشئ ملف `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### الرفع

1. **عبر Netlify CLI**:
```bash
# تثبيت
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# ربط المشروع
netlify init

# رفع
netlify deploy --prod
```

2. **عبر واجهة Netlify**:
   - اذهب إلى [Netlify](https://netlify.com)
   - New site from Git
   - اختر GitHub repository
   - أضف Environment Variables
   - Deploy

---

## 🖥️ رفع التطبيق على VPS {#vps}

### متطلبات VPS

- Ubuntu 20.04+ أو CentOS 8+
- Node.js 18+
- Nginx
- PM2

### الخطوة 1: تثبيت المتطلبات

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx
```

### الخطوة 2: رفع الكود

```bash
# على جهازك المحلي
cd "d:\whatsapp p"
npm run build

# رفع على VPS (استخدم FileZilla أو SCP)
scp -r .next package.json package-lock.json root@your-server-ip:/var/www/whatsapp-inbox/
```

أو استخدم Git:

```bash
# على VPS
cd /var/www
git clone https://github.com/your-username/whatsapp-inbox.git
cd whatsapp-inbox
npm install
npm run build
```

### الخطوة 3: إعداد PM2

أنشئ ملف `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-inbox',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3002',
    cwd: '/var/www/whatsapp-inbox',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
};
```

```bash
# تشغيل التطبيق
pm2 start ecosystem.config.js

# حفظ التطبيق للتشغيل التلقائي
pm2 save
pm2 startup
```

### الخطوة 4: إعداد Nginx

أنشئ ملف `/etc/nginx/sites-available/whatsapp-inbox`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/whatsapp-inbox /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### الخطوة 5: إعداد SSL (اختياري)

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🗄️ ربط قاعدة البيانات {#database}

### خيار 1: MongoDB Atlas (مجاني)

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ Cluster مجاني
3. احصل على Connection String
4. أضف في `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp_inbox
```

### خيار 2: PostgreSQL (Supabase)

1. اذهب إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. احصل على Database URL
4. أضف في `.env.local`:
```
DATABASE_URL=postgresql://username:password@host:5432/database
```

---

## 🧪 اختبار WhatsApp API

### اختبار Webhook

```bash
# Test webhook verification
curl "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secret_token_123&hub.challenge=test"
```

### إرسال رسالة تجريبية

```javascript
// في المتصفح Console
fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '966512345678',
    message: 'مرحباً من المسار الساخن! 🔥',
    type: 'text'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📊 مراقبة التطبيق

### PM2 Commands

```bash
# عرض حالة التطبيق
pm2 status

# عرض اللوجات
pm2 logs whatsapp-inbox

# إعادة تشغيل
pm2 restart whatsapp-inbox

# إيقاف
pm2 stop whatsapp-inbox
```

### Logs

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs --lines 100
```

---

## ✅ Checklist النشر

- [ ] إعداد WhatsApp Business API
- [ ] إنشاء Access Token دائم
- [ ] إعداد Webhook URL
- [ ] اختبار Webhook verification
- [ ] رفع التطبيق على الاستضافة
- [ ] إضافة Environment Variables
- [ ] إعداد Domain name
- [ ] إعداد SSL Certificate
- [ ] اختبار إرسال واستقبال الرسائل
- [ ] ربط قاعدة البيانات
- [ ] إعداد النسخ الاحتياطي

---

## 🆘 استكشاف الأخطاء

### مشكلة: Webhook لا يعمل

```bash
# تحقق من Logs
pm2 logs

# تحقق من Firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### مشكلة: Access Token منتهي

- اذهب إلى Meta Developers
- اجعل Token دائم (Never Expire)
- حدّث في Environment Variables

### مشكلة: لا يمكن إرسال رسائل

- تحقق من أن رقم الهاتف مفعّل
- تحقق من أن Access Token صحيح
- تحقق من Quota limits في Meta

---

## 🔐 الأمان

1. **لا تشارك Tokens أبداً**
2. **استخدم HTTPS دائماً**
3. **احفظ `.env` في `.gitignore`**
4. **استخدم Webhook Secret للتحقق**

---

## 🔧 Fix Chrome Errors {#chrome-fix}

If you're getting errors like:
```
Error: Failed to launch the browser process!
libgobject-2.0.so.0: cannot open shared object file: No such file or directory
```

**See detailed fix guide: [CHROME_FIX.md](./CHROME_FIX.md)**

Quick solutions:
- ✅ Use **Render** with Blueprint (automatic Chrome installation)
- ✅ Use **Railway** or **Fly.io** with Docker
- ✅ Use provided `Dockerfile` for any Docker platform
- ✅ Add Chrome buildpack if using Heroku

---

## 📞 الدعم

للحصول على مساعدة:
- [Meta WhatsApp Docs](https://developers.facebook.com/docs/whatsapp)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
- [Chrome/Puppeteer Fix](./CHROME_FIX.md)

---

**تم الإعداد بواسطة**: GitHub Copilot  
**التاريخ**: ديسمبر 2025

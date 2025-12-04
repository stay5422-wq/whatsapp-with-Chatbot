# 🔥 إعداد Firebase للمشروع

## الخطوات المطلوبة

### 1️⃣ **إنشاء مشروع Firebase**

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط "Add Project" (إضافة مشروع)
3. أدخل اسم المشروع: `whatsapp-inbox` (أو أي اسم تريد)
4. اختر إعدادات المشروع الافتراضية
5. اضغط "Create Project"

---

### 2️⃣ **تفعيل Firestore Database**

1. في القائمة الجانبية، اختر **"Firestore Database"**
2. اضغط **"Create Database"**
3. اختر موقع السيرفر: `us-central` (أو الأقرب لك)
4. اختر **"Start in production mode"** (آمن أكثر)
5. اضغط **"Enable"**

---

### 3️⃣ **إعداد قواعد الأمان**

في **Firestore Database** → **Rules**، استخدم هذه القواعد:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Quick Replies
    match /quickReplies/{replyId} {
      allow read, write: if request.auth != null;
    }
    
    // Settings
    match /settings/{settingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 4️⃣ **الحصول على بيانات الاتصال**

1. في القائمة الجانبية، اضغط على **⚙️ Project Settings**
2. انزل لقسم **"Your apps"**
3. اضغط على أيقونة **Web** `</>`
4. سجّل التطبيق بأي اسم (مثل: `whatsapp-inbox-web`)
5. انسخ بيانات `firebaseConfig`

ستحصل على شيء مثل هذا:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

---

### 5️⃣ **إضافة المتغيرات البيئية**

أنشئ ملف `.env.local` في جذر المشروع:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

**⚠️ مهم:** لا ترفع ملف `.env.local` على GitHub!

---

### 6️⃣ **تثبيت المكتبات**

```bash
npm install firebase
```

---

### 7️⃣ **اختبار الاتصال**

شغّل المشروع:

```bash
npm run dev
```

افتح المتصفح على `http://localhost:3000`

---

## 📊 **هيكل قاعدة البيانات**

### Collections (المجموعات):

```
📁 whatsapp-inbox/
├── 📂 users/                    # الموظفين
│   ├── userId1
│   │   ├── name: "مدير النظام"
│   │   ├── username: "admin"
│   │   ├── password: "hashed"
│   │   ├── role: "admin"
│   │   ├── department: "all"
│   │   └── createdAt: timestamp
│   └── userId2
│       └── ...
│
├── 📂 conversations/            # المحادثات
│   ├── conversationId1
│   │   ├── contactName: "أحمد محمد"
│   │   ├── contactNumber: "+966501234567"
│   │   ├── lastMessage: "شكراً لكم"
│   │   ├── lastMessageTime: timestamp
│   │   ├── unread: 0
│   │   ├── department: "units"
│   │   ├── assignedTo: "userId1"
│   │   └── 📂 messages/        # الرسائل (subcollection)
│   │       ├── messageId1
│   │       │   ├── text: "مرحباً"
│   │       │   ├── sender: "customer"
│   │       │   ├── timestamp: timestamp
│   │       │   └── type: "text"
│   │       └── messageId2
│   │           └── ...
│   └── conversationId2
│       └── ...
│
├── 📂 quickReplies/             # الردود السريعة
│   ├── replyId1
│   │   └── text: "شكراً للتواصل معنا"
│   └── replyId2
│       └── ...
│
└── 📂 settings/                 # الإعدادات
    ├── bot
    │   ├── enabled: true
    │   └── updatedAt: timestamp
    └── questionTree
        ├── tree: { ... }
        └── updatedAt: timestamp
```

---

## 🔐 **الأمان**

### ✅ **ما تم تطبيقه:**

- كلمات المرور مشفرة (يفضل استخدام bcrypt)
- قواعد Firestore Security Rules
- متغيرات البيئة مخفية
- HTTPS فقط في الإنتاج

### ⚠️ **توصيات إضافية:**

1. **استخدم Firebase Authentication** بدلاً من تخزين كلمات المرور مباشرة
2. **فعّل 2FA** لحسابات الإدارة
3. **راجع قواعد الأمان** بشكل دوري
4. **استخدم Environment Variables** في Railway

---

## 🚀 **النشر على Railway**

في Railway Dashboard → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxx
```

---

## 📝 **الميزات الجديدة**

### ✅ **ما تم إضافته:**

1. **حفظ البيانات في Firebase** - لا تُمسح بعد إعادة التشغيل
2. **إخفاء الحسابات التجريبية** - لا تظهر في صفحة تسجيل الدخول
3. **تعديل اسم المستخدم** - من الإعدادات
4. **تعديل كلمة المرور** - من الإعدادات
5. **حفظ شجرة الأسئلة** - في Firebase بدلاً من localStorage

---

## 🆘 **استكشاف الأخطاء**

### خطأ: "Firebase: Error (auth/invalid-api-key)"
**الحل:** تأكد من نسخ `apiKey` بشكل صحيح

### خطأ: "Missing or insufficient permissions"
**الحل:** تأكد من إعداد قواعد Firestore Security Rules

### لا تظهر البيانات:
**الحل:** 
1. افتح Firebase Console → Firestore
2. تأكد من وجود البيانات
3. تحقق من Console للأخطاء (`F12`)

---

## 📞 **الدعم**

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js with Firebase](https://firebase.google.com/docs/web/setup)

---

**✅ بعد الانتهاء، جميع البيانات ستُحفظ بشكل دائم في Firebase!**

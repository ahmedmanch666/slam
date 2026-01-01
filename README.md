# نظام مدير المناقصات (SLAM - Tender Manager System)

## 📌 نظرة عامة

**SLAM** هو تطبيق ويب متكامل لإدارة المناقصات والعقود والشركات والمهام. مصمم بالكامل لدعم اللغة العربية (RTL) ويوفر لوحة تحكم مركزية لتتبع دورة حياة المناقصة من البداية للنهاية.

**Live Demo:** [https://slam-lake.vercel.app](https://slam-lake.vercel.app)

---

## 🚀 التقنيات المستخدمة

| الجزء | التقنية |
|-------|---------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js (Vercel Serverless Functions) |
| Database | SQLite via Turso (libSQL) |
| Auth | JWT (Access + Refresh Tokens) |

---

## ✨ المميزات الرئيسية

### 1. 📊 لوحة التحكم (Dashboard)

- إحصائيات فورية للشركات والمناقصات والعقود والمهام
- أزرار سريعة لإضافة عناصر جديدة
- عرض آخر المناقصات مع حالتها

### 2. 📋 إدارة المناقصات

- **دورة حياة كاملة:** مفتوحة → قيد الانتظار → مغلقة → فائز/خاسر
- **تفاصيل شاملة:**
  - البيانات العامة (التواريخ، القيم، التعليمات)
  - الأصناف (المواصفات الفنية، الكميات، جدول التوريد)
  - المنافسين (الأسعار، الفائز)
  - المرفقات (صور وملفات PDF)
  - الفواتير (التتبع المالي)
  - التقارير (طباعة وتصدير Word)

### 3. 💰 الحسابات المالية (جديد!)

- **ضريبة القيمة المضافة:** 14%
- **ضريبة الخصم:** 1%
- **التأمين الابتدائي:** 5%
- **حساب تلقائي للإجمالي** مع إمكانية تفعيل/إلغاء كل ضريبة

### 4. 🏢 الشركات والعقود

- قاعدة بيانات مركزية للموردين والعملاء
- ربط المناقصات بالعقود

### 5. ✅ إدارة المهام

- قائمة مهام مرتبطة بالمناقصات والعقود

### 6. 🔔 نظام الإشعارات

- Toast Notifications للنجاح والخطأ
- Loading States أثناء الحفظ

---

## 🛠️ التثبيت والتشغيل

### المتطلبات

- Node.js v18+
- NPM

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/ahmedmanch666/slam.git
cd slam

# 2. تثبيت الـ Dependencies
npm install
cd frontend && npm install && cd ..

# 3. إعداد ملف البيئة (.env)
# أنشئ ملف .env في المجلد الرئيسي:
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your-secret-key

# 4. تشغيل التطبيق
# Frontend فقط:
cd frontend && npm run dev

# Full Stack مع Vercel CLI:
vercel dev
```

---

## 📁 هيكل المشروع

```
slam/
├── api/                    # Serverless API Functions
│   ├── _lib/              # Shared utilities (db, jwt, handlers)
│   ├── auth/              # Login, Register, Refresh, Logout
│   └── data/              # CRUD endpoints
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth, Data, Toast contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── pages/         # Route pages
│   └── public/
└── vercel.json            # Vercel configuration
```

---

## 📊 حالة التطبيق (Status Report)

| الميزة | الحالة |
|--------|--------|
| تسجيل الدخول/الخروج | ✅ يعمل |
| لوحة التحكم | ✅ يعمل |
| إدارة الشركات | ✅ يعمل |
| إدارة المناقصات | ✅ يعمل |
| إدارة العقود | ✅ يعمل |
| إدارة المهام | ✅ يعمل |
| الأصناف | ✅ يعمل |
| المنافسين | ✅ يعمل |
| المرفقات (إضافة) | ✅ يعمل |
| المرفقات (حذف) | ⚠️ قيد المراجعة |
| الفواتير | ✅ يعمل |
| التقارير | ✅ يعمل |
| حسابات الضرائب | ✅ يعمل (14% VAT, 1% Withholding, 5% Insurance) |
| Responsive Design | ✅ يعمل |
| Toast Notifications | ✅ يعمل |

---

## 🐛 المشاكل المعروفة

1. **حذف المرفقات:** في بعض الحالات قد لا يعمل الحذف بشكل صحيح - قيد التحقيق

---

## 📄 الترخيص

Private / Proprietary.

---

## 👨‍💻 المطور

Built with ❤️ using AI-assisted development (Claude/Gemini)

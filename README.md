# نظام مدير المناقصات (SLAM)

## 📌 نظرة عامة

**SLAM** هو تطبيق ويب متكامل لإدارة المناقصات والعقود والشركات والمهام. مصمم بالكامل لدعم اللغة العربية (RTL).

**Live Demo:** [https://slam-lake.vercel.app](https://slam-lake.vercel.app)

---

## 🚀 التقنيات المستخدمة

| الجزء | التقنية |
| --- | --- |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js (Vercel Serverless) |
| Database | MySQL (HostGator) |
| Auth | JWT (Access + Refresh Tokens) |

---

## ✨ المميزات الرئيسية

### 📊 لوحة التحكم

- إحصائيات فورية للشركات والمناقصات والعقود والمهام
- أزرار سريعة لإضافة عناصر جديدة

### 📋 إدارة المناقصات

- دورة حياة كاملة: مفتوحة → قيد الانتظار → مغلقة → فائز/خاسر
- تفاصيل شاملة: البيانات العامة، الأصناف، المنافسين، المرفقات، الفواتير

### 💰 الحسابات المالية

- ضريبة القيمة المضافة: **14%**
- ضريبة الخصم: **1%**
- التأمين الابتدائي: **5%**
- حساب تلقائي للإجمالي

### 🏢 الشركات والعقود

- قاعدة بيانات مركزية للموردين والعملاء
- ربط المناقصات بالعقود

---

## 🛠️ التثبيت والتشغيل

### المتطلبات

- Node.js v18+
- MySQL Database

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/ahmedmanch666/slam.git
cd slam

# 2. تثبيت الـ Dependencies
npm install
cd frontend && npm install && cd ..

# 3. إعداد ملف البيئة (.env)
MYSQL_HOST=your-host.hostgator.com
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
MYSQL_PORT=3306
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret

# 4. تشغيل التطبيق
vercel dev
```

---

## 📁 هيكل المشروع

```text
slam/
├── api/                    # Serverless API Functions
│   ├── _lib/              # Shared utilities (db, jwt, handlers)
│   ├── auth/              # Login, Register, Refresh
│   └── data/              # CRUD endpoints
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth, Data, Toast contexts
│   │   └── pages/         # Route pages
├── database/
│   └── schema.sql         # MySQL schema
└── vercel.json            # Vercel configuration
```

---

## 🗄️ إعداد قاعدة البيانات

1. أنشئ Database في HostGator cPanel
2. أضف `%` في Remote MySQL للسماح بالاتصال الخارجي
3. شغل ملف `database/schema.sql` في phpMyAdmin
4. أضف المستخدم المشرف:

```sql
INSERT INTO users (id, email, password_hash, role, created_at) 
VALUES ('seed_admin', 'admin@domain.com', 'not_used', 'admin', 1704067200000);
```

---

## 🔐 بيانات الدخول الافتراضية

- **Email:** `admin@domain.com`
- **Password:** `12345678`

---

## 📄 الترخيص

Private / Proprietary.

---

## 👨‍💻 المطور

Built with ❤️ using AI-assisted development

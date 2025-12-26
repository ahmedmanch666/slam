const crypto = require('crypto');
const { json, readJson } = require('../_lib/http');
const { hashPassword } = require('../_lib/password');
const { initDb, findUserByEmail, createUser, countUsers } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    // Initialize database on first request
    await initDb();

    const body = await readJson(req);
    if (!body) return json(res, 400, { error: 'Invalid JSON' });

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !email.includes('@')) return json(res, 400, { error: 'البريد غير صالح' });
    if (password.length < 8) return json(res, 400, { error: 'كلمة المرور قصيرة' });

    // Check if email already exists
    const exists = await findUserByEmail(email);
    if (exists) return json(res, 409, { error: 'البريد مستخدم بالفعل' });

    // First user becomes admin
    const userCount = await countUsers();
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? 'admin' : 'user';

    const id = crypto.randomUUID();

    // Create user in database
    await createUser({
      id,
      email,
      password_hash: hashPassword(password),
      role
    });

    return json(res, 200, { ok: true, message: isFirstUser ? 'تم إنشاء حساب المدير بنجاح' : 'تم إنشاء الحساب بنجاح' });
  } catch (err) {
    console.error('Register error:', err);
    return json(res, 500, { error: 'خطأ في الخادم' });
  }
};

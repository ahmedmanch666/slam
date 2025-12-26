const crypto = require('crypto');
const { json, readJson } = require('../_lib/http');
const { withStore } = require('../_lib/store');
const { hashPassword } = require('../_lib/password');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const body = await readJson(req);
  if (!body) return json(res, 400, { error: 'Invalid JSON' });

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !email.includes('@')) return json(res, 400, { error: 'البريد غير صالح' });
  if (password.length < 8) return json(res, 400, { error: 'كلمة المرور قصيرة' });

  const result = withStore((store) => {
    const exists = store.users.find(u => u.email === email);
    if (exists) return { ok: false, code: 409, error: 'البريد مستخدم بالفعل' };

    const isFirstUser = store.users.length === 0;
    const id = crypto.randomUUID();
    const role = isFirstUser ? 'admin' : 'user';

    store.users.push({
      id,
      email,
      password_hash: hashPassword(password),
      role,
      created_at: Date.now()
    });

    return { ok: true, code: 200 };
  });

  if (!result.ok) return json(res, result.code, { error: result.error });
  return json(res, 200, { ok: true });
};
